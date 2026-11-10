import fs from 'node:fs/promises'
import fsSync from 'node:fs'
import path from 'node:path'

export interface BookingLogInput {
  status: 'SUCCESS' | 'FAILED'
  statusCode: number
  category:
    | 'SUCCESS'
    | 'VALIDATION_ERROR'
    | 'DEMO_MODE_DISABLED'
    | 'UPSTREAM_SUPPLIER_ERROR'
    | 'INTERNAL_SERVER_ERROR'
  payload?: Record<string, any> | null
  errorMessage?: string | null
  errorDetails?: any
  upstreamResponse?: any
  clientIp?: string | null
  userAgent?: string | null
  bookingId?: string
}

export interface BookingLogEntry {
  id: string
  enquiryReference: string | null
  timestamp: string
  timestampLocal: string
  status: 'SUCCESS' | 'FAILED'
  statusCode: number
  category: string
  traveler: {
    name: string
    email: string
    mobile: string
    contactMethod: string
  }
  journey: {
    airportName: string
    airportId: string
    serviceTypeId: string
    terminal?: string
    servicesInputId: string
    classOfTravelId: string
    arrivalFlight: string
    arrivalDate: string
    arrivalTime: string
    departureFlight: string
    departureDate: string
    departureTime: string
  }
  party: {
    adults: string
    children: string
    infants: string
    luggage: string
  }
  error: string | null
  errorDetails: any
  upstreamResponse: any
  meta: {
    clientIp: string
    userAgent: string
    sourceUrl: string
  }
  rawPayload: Record<string, any> | null
}

const LOGS_DIR = path.resolve(process.cwd(), 'logs')
export const RETENTION_MONTHS = 3

/**
 * Returns year-month string like "2026-11"
 */
export function getYearMonth(date: Date = new Date()): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  return `${y}-${m}`
}

/**
 * Returns the set of year-month keys that must be retained (default: last 3 months).
 * e.g., in November 2026: {'2026-11', '2026-10', '2026-09'}
 */
export function getRetainedMonths(count: number = RETENTION_MONTHS, refDate: Date = new Date()): Set<string> {
  const retained = new Set<string>()
  for (let i = 0; i < count; i++) {
    const d = new Date(refDate.getFullYear(), refDate.getMonth() - i, 1)
    const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    retained.add(ym)
  }
  return retained
}

/**
 * Resolves paths for monthwise log files.
 */
function getLogPathsForMonth(yearMonth: string) {
  return {
    jsonl: path.join(LOGS_DIR, `bookings-${yearMonth}.jsonl`),
    csv: path.join(LOGS_DIR, `bookings-${yearMonth}.csv`),
    log: path.join(LOGS_DIR, `bookings-${yearMonth}.log`)
  }
}

/**
 * Automatically cleans up log files older than the retention period (max last 3 months).
 * Runs once per day in the background.
 */
let lastCleanupDay = ''

export async function cleanOldLogs(retentionCount: number = RETENTION_MONTHS, force: boolean = false): Promise<string[]> {
  const today = new Date().toISOString().slice(0, 10)
  if (!force && lastCleanupDay === today) {
    return []
  }
  lastCleanupDay = today

  const deleted: string[] = []
  try {
    await fs.mkdir(LOGS_DIR, { recursive: true })
    const entries = await fs.readdir(LOGS_DIR, { withFileTypes: true })
    const retained = getRetainedMonths(retentionCount)

    for (const entry of entries) {
      // 1. Monthwise files: bookings-YYYY-MM.(jsonl|csv|log)
      const fileMatch = entry.name.match(/^bookings-(\d{4}-\d{2})\.(jsonl|csv|log)$/i)
      if (fileMatch) {
        const ym = fileMatch[1]
        if (ym && !retained.has(ym)) {
          const filePath = path.join(LOGS_DIR, entry.name)
          await fs.unlink(filePath)
          deleted.push(entry.name)
          console.info(`[BookingLogger] Automatically removed expired log file (> ${retentionCount} months): ${entry.name}`)
        }
      }

      // 2. Monthwise directories if any (e.g. logs/YYYY-MM/)
      if (entry.isDirectory()) {
        const dirMatch = entry.name.match(/^(\d{4}-\d{2})$/)
        if (dirMatch) {
          const ym = dirMatch[1]
          if (ym && !retained.has(ym)) {
            const dirPath = path.join(LOGS_DIR, entry.name)
            await fs.rm(dirPath, { recursive: true, force: true })
            deleted.push(entry.name)
            console.info(`[BookingLogger] Automatically removed expired log directory (> ${retentionCount} months): ${entry.name}`)
          }
        }
      }
    }
  } catch (err) {
    console.error('[BookingLogger] Error during old log cleanup:', err)
  }
  return deleted
}

const CSV_HEADERS = [
  'Booking ID',
  'Enquiry Reference',
  'Timestamp (UTC)',
  'Timestamp (Local)',
  'Status',
  'Status Code',
  'Category',
  'Traveller Name',
  'Email',
  'Mobile',
  'Airport Name / Value',
  'Airport ID',
  'Service Type ID',
  'Services Selected IDs',
  'Class of Travel ID',
  'Arrival Flight',
  'Arrival Date',
  'Arrival Time',
  'Departure Flight',
  'Departure Date',
  'Departure Time',
  'Adults',
  'Children',
  'Infants',
  'Luggage',
  'Contact Method',
  'Error / Failure Reason',
  'Upstream Response Summary',
  'Client IP',
  'User Agent'
]

function generateBookingId(): string {
  const now = new Date()
  const datePart = now.toISOString().replace(/[-:T.Z]/g, '').slice(0, 14)
  const randomPart = Math.random().toString(36).substring(2, 7)
  return `bkg_${datePart}_${randomPart}`
}

function escapeCsvValue(val: any): string {
  if (val === undefined || val === null) return ''
  const str = typeof val === 'object' ? JSON.stringify(val) : String(val)
  if (/[",\r\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

// Mutex / sequential queue for atomic file appends
let writeQueue: Promise<void> = Promise.resolve()
const initializedCsvFiles = new Set<string>()

async function appendToJsonl(yearMonth: string, line: string): Promise<void> {
  writeQueue = writeQueue.then(async () => {
    try {
      await fs.mkdir(LOGS_DIR, { recursive: true })
      const paths = getLogPathsForMonth(yearMonth)
      await fs.appendFile(paths.jsonl, line, 'utf-8')
    } catch (err) {
      console.error(`[BookingLogger] Failed to write to JSONL (${yearMonth}):`, err)
    }
  })
  return writeQueue
}

async function appendToCsv(yearMonth: string, row: string): Promise<void> {
  writeQueue = writeQueue.then(async () => {
    try {
      await fs.mkdir(LOGS_DIR, { recursive: true })
      const paths = getLogPathsForMonth(yearMonth)
      let needsHeader = false

      if (!initializedCsvFiles.has(paths.csv)) {
        try {
          const stat = await fs.stat(paths.csv)
          needsHeader = stat.size === 0
        } catch {
          needsHeader = true
        }
        initializedCsvFiles.add(paths.csv)
      }

      const headerLine = needsHeader ? CSV_HEADERS.map(escapeCsvValue).join(',') + '\n' : ''
      await fs.appendFile(paths.csv, headerLine + row, 'utf-8')
    } catch (err) {
      console.error(`[BookingLogger] Failed to write to CSV (${yearMonth}):`, err)
    }
  })
  return writeQueue
}

async function appendToLog(yearMonth: string, block: string): Promise<void> {
  writeQueue = writeQueue.then(async () => {
    try {
      await fs.mkdir(LOGS_DIR, { recursive: true })
      const paths = getLogPathsForMonth(yearMonth)
      await fs.appendFile(paths.log, block, 'utf-8')
    } catch (err) {
      console.error(`[BookingLogger] Failed to write to log (${yearMonth}):`, err)
    }
  })
  return writeQueue
}


export async function logBooking(input: BookingLogInput): Promise<BookingLogEntry> {
  const now = new Date()
  const yearMonth = getYearMonth(now)
  const bookingId = input.bookingId || generateBookingId()
  const enquiryRef =
    input.upstreamResponse?.result?.airport_enquiry ||
    input.upstreamResponse?.airport_enquiry ||
    null
  const p = input.payload || {}

  const entry: BookingLogEntry = {
    id: bookingId,
    enquiryReference: enquiryRef,
    timestamp: now.toISOString(),
    timestampLocal: now.toLocaleString('en-GB', {
      timeZone: 'Europe/London',
      dateStyle: 'short',
      timeStyle: 'medium',
      hour12: false
    }) + ' UK',
    status: input.status,
    statusCode: input.statusCode,
    category: input.category,
    traveler: {
      name: String(p.traveler_name || p.airport_name || '').trim(),
      email: String(p.email || '').trim(),
      mobile: String(p.mobile || '').trim(),
      contactMethod: String(p.uaa_p_c_method || '').trim()
    },
    journey: {
      airportName: String(p.airport_name || '').trim(),
      airportId: String(p.airport_name_id || '').trim(),
      serviceTypeId: String(p.service_types_id || '').trim(),
      terminal: String(p.terminal || '').trim() || undefined,
      servicesInputId: String(p.servicesinput_id || '').trim(),
      classOfTravelId: String(p.class_of_travel_id || '').trim(),
      arrivalFlight: String(p.arrival_flight_number || '').trim(),
      arrivalDate: String(p.arrival_date || '').trim(),
      arrivalTime: String(p.arrival_time || '').trim(),
      departureFlight: String(p.departure_flight_number || '').trim(),
      departureDate: String(p.departure_date || '').trim(),
      departureTime: String(p.departure_time || '').trim()
    },
    party: {
      adults: String(p.adults_count ?? ''),
      children: String(p.childrens_count ?? ''),
      infants: String(p.infants_count ?? ''),
      luggage: String(p.no_luggages ?? '')
    },
    error: input.errorMessage || null,
    errorDetails: input.errorDetails || null,
    upstreamResponse: input.upstreamResponse || null,
    meta: {
      clientIp: input.clientIp || 'unknown',
      userAgent: input.userAgent || 'unknown',
      sourceUrl: String(p.uaa_url || process.env.NUXT_PUBLIC_SITE_NAME || 'UK Airport Assistance')
    },
    rawPayload: input.payload || null
  }

  // 1. JSON Lines entry
  const jsonLine = JSON.stringify(entry) + '\n'

  // 2. CSV entry row
  const csvRow = [
    entry.id,
    entry.enquiryReference || '',
    entry.timestamp,
    entry.timestampLocal,
    entry.status,
    entry.statusCode,
    entry.category,
    entry.traveler.name,
    entry.traveler.email,
    entry.traveler.mobile,
    entry.journey.airportName,
    entry.journey.airportId,
    entry.journey.serviceTypeId,
    entry.journey.servicesInputId,
    entry.journey.classOfTravelId,
    entry.journey.arrivalFlight,
    entry.journey.arrivalDate,
    entry.journey.arrivalTime,
    entry.journey.departureFlight,
    entry.journey.departureDate,
    entry.journey.departureTime,
    entry.party.adults,
    entry.party.children,
    entry.party.infants,
    entry.party.luggage,
    entry.traveler.contactMethod,
    entry.error || '',
    entry.upstreamResponse ? JSON.stringify(entry.upstreamResponse) : '',
    entry.meta.clientIp,
    entry.meta.userAgent
  ].map(escapeCsvValue).join(',') + '\n'

  // 3. Human-readable text log block
  const txtBlock = [
    '================================================================================',
    `[${entry.timestamp}] [STATUS: ${entry.status} (${entry.statusCode} - ${entry.category})]`,
    `Booking ID : ${entry.id}${entry.enquiryReference ? ' | Enquiry Ref: ' + entry.enquiryReference : ''}`,
    `Traveller  : ${entry.traveler.name || 'N/A'} | Email: ${entry.traveler.email || 'N/A'} | Mobile: ${entry.traveler.mobile || 'N/A'}`,
    `Journey    : Airport ID: ${entry.journey.airportId || 'N/A'} | Service Type: ${entry.journey.serviceTypeId || 'N/A'} | Class: ${entry.journey.classOfTravelId || 'N/A'} | Extras: ${entry.journey.servicesInputId || 'None'}`,
    `Arrival    : Flight: ${entry.journey.arrivalFlight || '-'} | Date: ${entry.journey.arrivalDate || '-'} | Time: ${entry.journey.arrivalTime || '-'}`,
    `Departure  : Flight: ${entry.journey.departureFlight || '-'} | Date: ${entry.journey.departureDate || '-'} | Time: ${entry.journey.departureTime || '-'}`,
    `Party      : Adults: ${entry.party.adults || '0'}, Children: ${entry.party.children || '0'}, Infants: ${entry.party.infants || '0'}, Luggage: ${entry.party.luggage || '0'}`,
    `Contact Via: ${entry.traveler.contactMethod || 'N/A'}`,
    `Client IP  : ${entry.meta.clientIp} | User-Agent: ${entry.meta.userAgent}`,
    entry.status === 'FAILED'
      ? `Failure    : ${entry.error || 'Unknown error'}${entry.errorDetails ? ' | Details: ' + JSON.stringify(entry.errorDetails) : ''}`
      : `Success    : Supplier response received: ${entry.upstreamResponse ? JSON.stringify(entry.upstreamResponse) : 'OK'}${entry.enquiryReference ? ' (Enquiry Ref: ' + entry.enquiryReference + ')' : ''}`,
    '================================================================================\n'
  ].join('\n')

  // Trigger background cleanup for logs older than 3 months
  cleanOldLogs().catch((err) => {
    console.error('[BookingLogger] Background retention cleanup error:', err)
  })

  // Append in background without blocking response
  appendToJsonl(yearMonth, jsonLine)
  appendToCsv(yearMonth, csvRow)
  appendToLog(yearMonth, txtBlock)

  // Console output for standard runtime monitoring
  const consolePrefix = `[BookingLog] [${entry.status} ${entry.statusCode}] ID: ${entry.id} - ${entry.traveler.name || 'Anonymous'}`
  if (entry.status === 'SUCCESS') {
    console.log(`${consolePrefix} (${entry.traveler.email || 'no email'})`)
  } else {
    console.warn(`${consolePrefix} (${entry.traveler.email || 'no email'}) - Error: ${entry.error}`)
  }

  return entry
}

/**
 * Looks up a confirmed booking entry in the monthly .jsonl log files by
 * enquiryReference (e.g. "BU24700") or internal booking ID (e.g. "bkg_...").
 * Waits for any queued writes before reading.
 */
export async function findBookingInLogs(referenceId: string): Promise<BookingLogEntry | null> {
  const needle = String(referenceId || '').trim().toLowerCase()
  if (!needle || needle === 'enq-pending') {
    return null
  }

  // Wait for any active background write operations to flush to disk
  await writeQueue

  try {
    await fs.mkdir(LOGS_DIR, { recursive: true })
    const dirEntries = await fs.readdir(LOGS_DIR, { withFileTypes: true })

    // Sort monthwise JSONL files newest-first
    const jsonlFiles = dirEntries
      .filter(e => e.isFile() && /^bookings-\d{4}-\d{2}\.jsonl$/i.test(e.name))
      .map(e => e.name)
      .sort((a, b) => b.localeCompare(a))

    for (const filename of jsonlFiles) {
      const filePath = path.join(LOGS_DIR, filename)
      const content = await fs.readFile(filePath, 'utf-8')
      const lines = content.split(/\r?\n/).filter(Boolean)

      // Search newest log lines first
      for (let i = lines.length - 1; i >= 0; i--) {
        const line = lines[i]
        if (!line) continue

        try {
          const parsed = JSON.parse(line) as BookingLogEntry
          if (parsed.status !== 'SUCCESS') continue

          const refMatch =
            parsed.enquiryReference &&
            String(parsed.enquiryReference).trim().toLowerCase() === needle

          const idMatch =
            parsed.id &&
            String(parsed.id).trim().toLowerCase() === needle

          if (refMatch || idMatch) {
            return parsed
          }
        } catch {
          // Ignore malformed log lines
        }
      }
    }

    return null
  } catch (err) {
    console.error('[BookingLogger] Failed to search booking logs:', err)
    return null
  }
}
