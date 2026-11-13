import fs from 'node:fs/promises'
import path from 'node:path'
import { sanitizeCsvCell } from './security'

export interface ReviewLogInput {
  bookingReference: string
  rating: number
  comment?: string | null
  clientIp?: string | null
  userAgent?: string | null
  sourceUrl?: string | null
}

export interface ReviewLogEntry {
  id: string
  bookingReference: string
  rating: number
  ratingLabel: string
  comment: string
  timestamp: string
  timestampLocal: string
  clientIp: string
  userAgent: string
  sourceUrl: string
}

const LOGS_DIR = path.resolve(process.cwd(), 'logs')

const RATING_LABELS: Record<number, string> = {
  5: 'Exceptional (5/5)',
  4: 'Very Good (4/5)',
  3: 'Good (3/5)',
  2: 'Fair (2/5)',
  1: 'Poor (1/5)'
}

const CSV_HEADERS = [
  'Review ID',
  'Timestamp (UTC)',
  'Timestamp (UK)',
  'Booking Reference',
  'Rating',
  'Rating Label',
  'Comment',
  'Client IP',
  'User Agent',
  'Source URL'
]

function getYearMonth(date: Date = new Date()): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  return `${y}-${m}`
}

function generateReviewId(): string {
  const now = new Date()
  const ymd = now.toISOString().slice(0, 10).replace(/-/g, '')
  const randomPart = Math.random().toString(36).slice(2, 6).toUpperCase()
  return `REV-${ymd}-${randomPart}`
}

function escapeCsvValue(val: unknown): string {
  return sanitizeCsvCell(val)
}

function getReviewPathsForMonth(yearMonth: string) {
  return {
    jsonl: path.join(LOGS_DIR, `reviews-${yearMonth}.jsonl`),
    csv: path.join(LOGS_DIR, `reviews-${yearMonth}.csv`),
    log: path.join(LOGS_DIR, `reviews-${yearMonth}.log`)
  }
}

// Memory write queue to prevent concurrent filesystem write collisions
let writeQueue: Promise<void> = Promise.resolve()
const initializedCsvFiles = new Set<string>()

async function appendToJsonl(yearMonth: string, entry: ReviewLogEntry): Promise<void> {
  writeQueue = writeQueue.then(async () => {
    try {
      await fs.mkdir(LOGS_DIR, { recursive: true })
      const paths = getReviewPathsForMonth(yearMonth)
      await fs.appendFile(paths.jsonl, JSON.stringify(entry) + '\n', 'utf-8')
    } catch (err) {
      console.error(`[ReviewLogger] Failed to write to JSONL (${yearMonth}):`, err)
    }
  })
  return writeQueue
}

async function appendToCsv(yearMonth: string, entry: ReviewLogEntry): Promise<void> {
  writeQueue = writeQueue.then(async () => {
    try {
      await fs.mkdir(LOGS_DIR, { recursive: true })
      const paths = getReviewPathsForMonth(yearMonth)

      const row =
        [
          entry.id,
          entry.timestamp,
          entry.timestampLocal,
          entry.bookingReference,
          entry.rating,
          entry.ratingLabel,
          entry.comment,
          entry.clientIp,
          entry.userAgent,
          entry.sourceUrl
        ]
          .map(escapeCsvValue)
          .join(',') + '\n'

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
      console.error(`[ReviewLogger] Failed to write to CSV (${yearMonth}):`, err)
    }
  })
  return writeQueue
}

async function appendToLog(yearMonth: string, block: string): Promise<void> {
  writeQueue = writeQueue.then(async () => {
    try {
      await fs.mkdir(LOGS_DIR, { recursive: true })
      const paths = getReviewPathsForMonth(yearMonth)
      await fs.appendFile(paths.log, block, 'utf-8')
    } catch (err) {
      console.error(`[ReviewLogger] Failed to write to log (${yearMonth}):`, err)
    }
  })
  return writeQueue
}

export async function logReview(input: ReviewLogInput): Promise<ReviewLogEntry> {
  const now = new Date()
  const yearMonth = getYearMonth(now)
  const reviewId = generateReviewId()
  const rating = Math.max(1, Math.min(5, Math.round(Number(input.rating) || 5)))
  const ratingLabel = RATING_LABELS[rating] || `${rating}/5`
  const bookingReference = String(input.bookingReference || 'ENQ-PENDING').trim()
  const comment = String(input.comment || '').trim()

  const entry: ReviewLogEntry = {
    id: reviewId,
    bookingReference,
    rating,
    ratingLabel,
    comment,
    timestamp: now.toISOString(),
    timestampLocal:
      now.toLocaleString('en-GB', {
        timeZone: 'Europe/London',
        dateStyle: 'short',
        timeStyle: 'medium',
        hour12: false
      }) + ' UK',
    clientIp: String(input.clientIp || 'unknown').trim(),
    userAgent: String(input.userAgent || 'unknown').trim(),
    sourceUrl: String(input.sourceUrl || '').trim()
  }

  // Format human-readable entry block
  const stars = '★'.repeat(rating) + '☆'.repeat(5 - rating)
  const logBlock =
    [
      `================================================================================`,
      `[REVIEW] ${entry.id} | Ref: ${entry.bookingReference} | ${entry.timestampLocal}`,
      `Rating:  ${stars} (${rating}/5 - ${ratingLabel})`,
      `Comment: ${entry.comment ? `"${entry.comment}"` : '(No comment provided)'}`,
      `Client:  IP: ${entry.clientIp} | URL: ${entry.sourceUrl || 'N/A'}`,
      `Agent:   ${entry.userAgent}`,
      `================================================================================\n\n`
    ].join('\n')

  // Concurrently dispatch writes to JSONL, CSV and human-readable log
  await Promise.all([
    appendToJsonl(yearMonth, entry),
    appendToCsv(yearMonth, entry),
    appendToLog(yearMonth, logBlock)
  ])

  console.info(`[ReviewLogger] Logged review ${reviewId} for booking ${bookingReference} (${rating}/5 stars)`)

  return entry
}

