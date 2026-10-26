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
const JSONL_PATH = path.join(LOGS_DIR, 'bookings.jsonl')
const CSV_PATH = path.join(LOGS_DIR, 'bookings.csv')
const TXT_LOG_PATH = path.join(LOGS_DIR, 'bookings.log')

const CSV_HEADERS = [
  'Booking ID',
  'Enquiry Reference',
  'Timestamp (UTC)',
  'Timestamp (Local)',
  'Status',
  'Status Code',
  'Category',
  'Traveler Name',
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
let hasCsvHeader = false

async function appendToJsonl(line: string): Promise<void> {
  writeQueue = writeQueue.then(async () => {
    try {
      await fs.mkdir(LOGS_DIR, { recursive: true })
      await fs.appendFile(JSONL_PATH, line, 'utf-8')
    } catch (err) {
      console.error(`[BookingLogger] Failed to write to JSONL:`, err)
    }
  })
  return writeQueue
}

async function appendToCsv(row: string): Promise<void> {
  writeQueue = writeQueue.then(async () => {
    try {
      await fs.mkdir(LOGS_DIR, { recursive: true })
      let writeHeader = false
      if (!hasCsvHeader) {
        try {
          const stat = await fs.stat(CSV_PATH)
          hasCsvHeader = stat.size > 0
        } catch {
          hasCsvHeader = false
        }
        if (!hasCsvHeader) {
          writeHeader = true
          hasCsvHeader = true
        }
      }
      const headerLine = writeHeader ? CSV_HEADERS.map(escapeCsvValue).join(',') + '\n' : ''
      await fs.appendFile(CSV_PATH, headerLine + row, 'utf-8')
    } catch (err) {
      console.error(`[BookingLogger] Failed to write to CSV:`, err)
    }
  })
  return writeQueue
}

async function appendToLog(block: string): Promise<void> {
  writeQueue = writeQueue.then(async () => {
    try {
      await fs.mkdir(LOGS_DIR, { recursive: true })
      await fs.appendFile(TXT_LOG_PATH, block, 'utf-8')
    } catch (err) {
      console.error(`[BookingLogger] Failed to write to log:`, err)
    }
  })
  return writeQueue
}


export async function logBooking(input: BookingLogInput): Promise<BookingLogEntry> {
  const now = new Date()
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
      sourceUrl: String(p.uaa_url || 'UK Airport Assistance')
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
    `Traveler   : ${entry.traveler.name || 'N/A'} | Email: ${entry.traveler.email || 'N/A'} | Mobile: ${entry.traveler.mobile || 'N/A'}`,
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

  // Append in background without blocking response
  appendToJsonl(jsonLine)
  appendToCsv(csvRow)
  appendToLog(txtBlock)

  // Console output for standard runtime monitoring
  const consolePrefix = `[BookingLog] [${entry.status} ${entry.statusCode}] ID: ${entry.id} - ${entry.traveler.name || 'Anonymous'}`
  if (entry.status === 'SUCCESS') {
    console.log(`${consolePrefix} (${entry.traveler.email || 'no email'})`)
  } else {
    console.warn(`${consolePrefix} (${entry.traveler.email || 'no email'}) - Error: ${entry.error}`)
  }

  return entry
}
