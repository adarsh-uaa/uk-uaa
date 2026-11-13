import fs from 'node:fs/promises'
import path from 'node:path'
import type { H3Event } from 'h3'
import { createError, getRequestHeader, getRequestIP, readBody } from 'h3'

export const LOGS_DIR = path.resolve(process.cwd(), 'logs')
const BLOCKLIST_PATH = path.join(LOGS_DIR, 'blocked-ips.json')

export interface BlockedIpRecord {
  ip: string
  reason: string
  blockedAt: string
  blockedBy: string
}

export interface AccessLogRecord {
  timestamp: string
  ip: string
  method: string
  path: string
  statusCode: number
  blocked: boolean
  userAgent: string
}

export interface SecurityLogRecord {
  timestamp: string
  category: string
  ip: string
  method: string
  path: string
  details: string
  userAgent: string
  blocked: boolean
}

const DANGEROUS_KEYS = new Set(['__proto__', 'constructor', 'prototype'])

const SQLI_PATTERNS: RegExp[] = [
  /\b(union(\s+all)?\s+select|select\s+[\w*,.\s()]+\s+from\s+\w+|insert\s+into\s+\w+|update\s+\w+\s+set\s+|delete\s+from\s+\w+|drop\s+(table|database|schema|view|index)|alter\s+table\s+\w+|truncate\s+table\s+\w+|create\s+(table|database|procedure|function)|replace\s+into\s+\w+)\b/i,
  /(['"`]\s*(or|and)\s*['"`]?\w+['"`]?\s*=\s*['"`]?\w+['"`]?)|(\b(or|and)\s+\d+\s*=\s*\d+\b)|(\b(or|and)\s+['"]\w+['"]\s*=\s*['"]\w+['"])/i,
  /(['"`]\s*;\s*(select|drop|insert|update|delete|exec|execute|declare|shutdown|grant|revoke))|(['"`]\s*(--|\/\*|#))|(\/\*![0-9]*)/i,
  /\b(sleep\s*\(\s*\d+|benchmark\s*\(|pg_sleep\s*\(|waitfor\s+delay|xp_cmdshell|sp_executesql|load_file\s*\(|into\s+outfile|into\s+dumpfile|information_schema|pg_catalog|sqlite_master|sys\.tables|sys\.columns)\b/i,
  /\b(char|nchar|varchar|nvarchar)\s*\(\s*\d+(\s*,\s*\d+)*\s*\)|0x[0-9a-f]{10,}/i
]

const XSS_PATTERNS: RegExp[] = [
  /<\s*\/?\s*(script|iframe|object|embed|applet|meta|link|base|form)\b/i,
  /\b(javascript|vbscript|data\s*:\s*text\/html)\s*:/i,
  /<\s*svg\b[^>]*\bon\w+\s*=/i,
  /\bon(error|load|click|mouseover|focus|blur|submit|change|input|keydown|keyup)\s*=\s*['"`]?/i,
  /\b(expression\s*\(|eval\s*\(|document\.cookie|window\.location)\b/i
]

export interface ThreatDetection {
  detected: boolean
  type?: 'SQLI' | 'XSS' | 'PROTOTYPE_POLLUTION' | 'NULL_BYTE' | 'PATH_TRAVERSAL'
  field?: string
}

export function detectThreatInString(value: string, fieldName = 'input'): ThreatDetection {
  if (!value) return { detected: false }

  if (value.includes('\0') || /%00/i.test(value)) {
    return { detected: true, type: 'NULL_BYTE', field: fieldName }
  }

  for (const regex of SQLI_PATTERNS) {
    if (regex.test(value)) {
      return { detected: true, type: 'SQLI', field: fieldName }
    }
  }

  for (const regex of XSS_PATTERNS) {
    if (regex.test(value)) {
      return { detected: true, type: 'XSS', field: fieldName }
    }
  }

  return { detected: false }
}

export function scanPayloadForThreats(
  data: unknown,
  pathPrefix = 'body',
  depth = 0
): ThreatDetection {
  if (depth > 8 || data === null || data === undefined) {
    return { detected: false }
  }

  if (typeof data === 'string') {
    return detectThreatInString(data, pathPrefix)
  }

  if (Array.isArray(data)) {
    for (let i = 0; i < data.length; i++) {
      const check = scanPayloadForThreats(data[i], `${pathPrefix}[${i}]`, depth + 1)
      if (check.detected) return check
    }
    return { detected: false }
  }

  if (typeof data === 'object') {
    for (const [key, val] of Object.entries(data as Record<string, unknown>)) {
      if (DANGEROUS_KEYS.has(key)) {
        return { detected: true, type: 'PROTOTYPE_POLLUTION', field: `${pathPrefix}.${key}` }
      }
      const keyCheck = detectThreatInString(key, `${pathPrefix}.key`)
      if (keyCheck.detected) return keyCheck

      const valCheck = scanPayloadForThreats(val, `${pathPrefix}.${key}`, depth + 1)
      if (valCheck.detected) return valCheck
    }
  }

  return { detected: false }
}

export function sanitizeText(value: unknown, maxLength = 500): string {
  if (typeof value !== 'string') return ''
  return value
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    .trim()
    .slice(0, maxLength)
}

export function sanitizeCsvCell(val: unknown): string {
  if (val === null || val === undefined) return '""'
  let str = String(val).replace(/\r\n/g, ' ').replace(/[\r\n]/g, ' ')

  if (/^[=+\-@\t\r]/.test(str) && !/^\+\d{5,18}$/.test(str.trim())) {
    str = `'${str}`
  }

  if (/[",\n']/.test(str) || str.includes(' ')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return `"${str}"`
}

// ---------------------------------------------------------------------------
// Persistent IP Blocklist Cache
// ---------------------------------------------------------------------------
let blocklistCache: Map<string, BlockedIpRecord> | null = null
let blocklistLoadPromise: Promise<Map<string, BlockedIpRecord>> | null = null
let blocklistWriteQueue: Promise<void> = Promise.resolve()
let logsDirPromise: Promise<void> | null = null

export function ensureLogsDir(): Promise<void> {
  if (!logsDirPromise) {
    logsDirPromise = fs
      .mkdir(LOGS_DIR, { recursive: true })
      .then(() => undefined)
      .catch((err) => {
        logsDirPromise = null
        throw err
      })
  }
  return logsDirPromise
}

export function normalizeIp(ip: string | null | undefined): string {
  const raw = String(ip || '').trim()
  if (!raw) return 'unknown'
  // Normalize IPv6-mapped IPv4 (e.g. ::ffff:127.0.0.1 -> 127.0.0.1)
  if (raw.startsWith('::ffff:')) {
    return raw.slice(7)
  }
  return raw
}

export function isValidIpFormat(ip: string): boolean {
  const clean = normalizeIp(ip)
  if (clean === 'unknown') return false
  // Allow IPv4 and standard IPv6 characters
  return /^[0-9a-fA-F:.]{3,45}$/.test(clean)
}

async function ensureBlocklistLoaded(): Promise<Map<string, BlockedIpRecord>> {
  if (blocklistCache) return blocklistCache
  if (blocklistLoadPromise) return blocklistLoadPromise

  blocklistLoadPromise = (async () => {
    const map = new Map<string, BlockedIpRecord>()
    try {
      await ensureLogsDir()
      const raw = await fs.readFile(BLOCKLIST_PATH, 'utf-8')
      const arr = JSON.parse(raw) as BlockedIpRecord[]
      if (Array.isArray(arr)) {
        for (const item of arr) {
          if (item && item.ip) {
            const norm = normalizeIp(item.ip)
            map.set(norm, { ...item, ip: norm })
          }
        }
      }
    } catch {
      // File may not exist yet; start empty
    }
    blocklistCache = map
    return map
  })()

  return blocklistLoadPromise
}

async function persistBlocklist(map: Map<string, BlockedIpRecord>): Promise<void> {
  const list = Array.from(map.values())
  blocklistWriteQueue = blocklistWriteQueue.then(async () => {
    try {
      await ensureLogsDir()
      await fs.writeFile(BLOCKLIST_PATH, JSON.stringify(list, null, 2), 'utf-8')
    } catch (err) {
      console.error('[Security] Failed to persist blocked IPs:', err)
    }
  })
  return blocklistWriteQueue
}

export async function isIpBlocked(ip: string): Promise<BlockedIpRecord | null> {
  const map = await ensureBlocklistLoaded()
  return map.get(normalizeIp(ip)) || null
}

export async function getBlockedIps(): Promise<BlockedIpRecord[]> {
  const map = await ensureBlocklistLoaded()
  return Array.from(map.values()).sort((a, b) => b.blockedAt.localeCompare(a.blockedAt))
}

export async function blockIpAddress(
  ip: string,
  reason: string,
  blockedBy = 'admin'
): Promise<BlockedIpRecord> {
  const norm = normalizeIp(ip)
  if (!isValidIpFormat(norm)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid IP address format' })
  }
  const map = await ensureBlocklistLoaded()
  const record: BlockedIpRecord = {
    ip: norm,
    reason: sanitizeText(reason, 240) || 'Blocked by administrator',
    blockedAt: new Date().toISOString(),
    blockedBy: sanitizeText(blockedBy, 80) || 'admin'
  }
  map.set(norm, record)
  await persistBlocklist(map)
  return record
}

export async function unblockIpAddress(ip: string): Promise<boolean> {
  const norm = normalizeIp(ip)
  const map = await ensureBlocklistLoaded()
  const deleted = map.delete(norm)
  if (deleted) {
    await persistBlocklist(map)
  }
  return deleted
}

// ---------------------------------------------------------------------------
// Asynchronous Access & Security Log Writers
// ---------------------------------------------------------------------------
let accessWriteQueue: Promise<void> = Promise.resolve()
let secWriteQueue: Promise<void> = Promise.resolve()

function getYearMonth(date: Date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

export function logAccessEvent(record: AccessLogRecord): void {
  const ym = getYearMonth(new Date(record.timestamp))
  const line = JSON.stringify(record) + '\n'
  accessWriteQueue = accessWriteQueue.then(async () => {
    try {
      await ensureLogsDir()
      await fs.appendFile(path.join(LOGS_DIR, `access-${ym}.jsonl`), line, 'utf-8')
    } catch {
      // Non-fatal
    }
  })
}

export async function logSecurityEvent(
  event: H3Event,
  category: string,
  details: string,
  blocked = true
): Promise<void> {
  const now = new Date()
  const ym = getYearMonth(now)
  const clientIp = normalizeIp(getRequestIP(event, { xForwardedFor: true }))
  const ua = (getRequestHeader(event, 'user-agent') || 'unknown').slice(0, 200)
  const method = event.method || 'UNKNOWN'
  const url = (event.path || '/').slice(0, 200)
  const cleanDetails = sanitizeText(details, 300)

  const jsonRecord: SecurityLogRecord = {
    timestamp: now.toISOString(),
    category,
    ip: clientIp,
    method,
    path: url,
    details: cleanDetails,
    userAgent: ua,
    blocked
  }

  const textLine = `[${jsonRecord.timestamp}] [${category}] IP=${clientIp} ${method} ${url} | Details=${cleanDetails} | UA=${ua}\n`
  console.warn(`[SecurityGuard] ${textLine.trim()}`)

  secWriteQueue = secWriteQueue.then(async () => {
    try {
      await ensureLogsDir()
      await Promise.all([
        fs.appendFile(path.join(LOGS_DIR, `security-${ym}.jsonl`), JSON.stringify(jsonRecord) + '\n', 'utf-8'),
        fs.appendFile(path.join(LOGS_DIR, `security-${ym}.log`), textLine, 'utf-8')
      ])
    } catch {
      // Non-fatal
    }
  })
}

export async function assertSafeJsonBody<T = Record<string, any>>(
  event: H3Event
): Promise<T> {
  let body: any
  try {
    body = await readBody(event)
  } catch {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid request body'
    })
  }

  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid request format'
    })
  }

  const threat = scanPayloadForThreats(body)
  if (threat.detected) {
    await logSecurityEvent(
      event,
      `BLOCKED_${threat.type}`,
      `Suspicious input pattern in ${threat.field}`,
      true
    )
    throw createError({
      statusCode: 400,
      statusMessage: 'Request contains disallowed characters.'
    })
  }

  return body as T
}

// ---------------------------------------------------------------------------
// Memory-Bounded Sliding-Window Rate Limiter
// ---------------------------------------------------------------------------
const rateBuckets = new Map<string, number[]>()
const MAX_RATE_BUCKETS = 5000

export function checkRateLimit(
  key: string,
  maxRequests: number,
  windowMs: number
): { allowed: boolean; remaining: number; retryAfterSeconds: number } {
  const now = Date.now()
  const cutoff = now - windowMs

  if (rateBuckets.size >= MAX_RATE_BUCKETS && !rateBuckets.has(key)) {
    for (const [k, timestamps] of rateBuckets.entries()) {
      let validStart = 0
      while (validStart < timestamps.length && timestamps[validStart]! <= cutoff) {
        validStart++
      }
      if (validStart >= timestamps.length) {
        rateBuckets.delete(k)
      } else if (validStart > 0) {
        timestamps.splice(0, validStart)
      }
    }
    // Evict oldest 10% of buckets instead of clearing all active lockouts
    if (rateBuckets.size >= MAX_RATE_BUCKETS) {
      let evictCount = Math.ceil(MAX_RATE_BUCKETS * 0.1)
      for (const k of rateBuckets.keys()) {
        rateBuckets.delete(k)
        if (--evictCount <= 0) break
      }
    }
  }

  let timestamps = rateBuckets.get(key)
  if (!timestamps) {
    timestamps = []
    rateBuckets.set(key, timestamps)
  } else {
    let validStart = 0
    while (validStart < timestamps.length && timestamps[validStart]! <= cutoff) {
      validStart++
    }
    if (validStart > 0) {
      timestamps.splice(0, validStart)
    }
  }

  if (timestamps.length >= maxRequests) {
    const oldest = timestamps[0] ?? now
    const retryAfterMs = Math.max(1000, oldest + windowMs - now)
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: Math.ceil(retryAfterMs / 1000)
    }
  }

  timestamps.push(now)
  return {
    allowed: true,
    remaining: Math.max(0, maxRequests - timestamps.length),
    retryAfterSeconds: 0
  }
}

