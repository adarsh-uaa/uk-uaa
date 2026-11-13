import crypto from 'node:crypto'
import fs from 'node:fs/promises'
import path from 'node:path'
import type { H3Event } from 'h3'
import { createError, deleteCookie, getCookie, getRequestHeader, setCookie } from 'h3'
import type { BookingLogEntry } from './bookingLogger'
import type { ReviewLogEntry } from './reviewLogger'
import { airportsCatalog, classes, extrasCatalog, journeyTypes } from '../../app/data/booking'
import bookingServices from '../../app/data/bookingServices.json'
import {
  ensureLogsDir,
  getBlockedIps,
  LOGS_DIR,
  normalizeIp,
  type AccessLogRecord,
  type SecurityLogRecord
} from './security'

// ===========================================================================
// ADMIN AUTHENTICATION & SIGNED HTTP-ONLY SESSION MANAGEMENT
// ===========================================================================

export const ADMIN_COOKIE_NAME = 'uaa_admin_sess'
const SESSION_TTL_MS = 12 * 60 * 60 * 1000 // 12 hours
const EPHEMERAL_ADMIN_SECRET = crypto.randomBytes(32).toString('hex')

export interface AdminSession {
  username: string
  issuedAt: number
  expiresAt: number
}

function getAdminConfig() {
  const cfg = useRuntimeConfig()
  const adminCfg = (cfg.admin || {}) as {
    username?: string
    passwordHash?: string
    password?: string
    sessionSecret?: string
  }

  return {
    username: String(process.env.ADMIN_USERNAME || adminCfg.username || 'admin').trim(),
    passwordHash: String(process.env.ADMIN_PASSWORD_HASH || adminCfg.passwordHash || '').trim(),
    passwordPlain: String(process.env.ADMIN_PASSWORD || adminCfg.password || '').trim(),
    sessionSecret: String(
      process.env.ADMIN_SESSION_SECRET || adminCfg.sessionSecret || EPHEMERAL_ADMIN_SECRET
    ).trim()
  }
}

export function isAdminConfigured(): boolean {
  const cfg = getAdminConfig()
  return Boolean(cfg.username && (cfg.passwordHash || cfg.passwordPlain))
}

/**
 * Generates a salted scrypt password hash in the format: scrypt$<saltHex>$<hashHex>
 */
export function hashAdminPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex')
  const derived = crypto.scryptSync(password, salt, 64).toString('hex')
  return `scrypt$${salt}$${derived}`
}

function timingSafeStringEqual(a: string, b: string): boolean {
  const digestA = crypto.createHash('sha256').update(a).digest()
  const digestB = crypto.createHash('sha256').update(b).digest()
  return crypto.timingSafeEqual(digestA, digestB)
}

function verifyScryptHash(password: string, storedHash: string): boolean {
  const parts = storedHash.split('$')
  if (parts.length !== 3 || parts[0] !== 'scrypt') return false
  const [, salt, expectedHex] = parts
  if (!salt || !expectedHex) return false

  try {
    const derived = crypto.scryptSync(password, salt, 64)
    const expected = Buffer.from(expectedHex, 'hex')
    return derived.length === expected.length && crypto.timingSafeEqual(derived, expected)
  } catch {
    return false
  }
}

/**
 * Verifies submitted admin username and password in constant time.
 */
export function verifyAdminCredentials(username: string, password: string): boolean {
  const cfg = getAdminConfig()
  if (!cfg.username || (!cfg.passwordHash && !cfg.passwordPlain)) return false

  const userMatches = timingSafeStringEqual(String(username || '').trim(), cfg.username)
  const submittedPass = String(password || '')

  // Always run scrypt when a hash is present regardless of username match to resist timing attacks
  const passMatches = cfg.passwordHash
    ? verifyScryptHash(submittedPass, cfg.passwordHash)
    : timingSafeStringEqual(submittedPass, cfg.passwordPlain)

  return userMatches && passMatches
}

function isSecureRequest(event: H3Event): boolean {
  if (getRequestHeader(event, 'x-forwarded-proto') === 'https') return true
  const socket = event.node?.req?.socket as { encrypted?: boolean } | undefined
  return Boolean(socket?.encrypted)
}

function signSession(session: AdminSession, secret: string): string {
  const payload = Buffer.from(JSON.stringify(session), 'utf-8').toString('base64url')
  const signature = crypto.createHmac('sha256', secret).update(payload).digest('base64url')
  return `${payload}.${signature}`
}

function verifySignedSession(token: string, secret: string): AdminSession | null {
  try {
    const [payload, signature] = token.split('.')
    if (!payload || !signature) return null

    const expectedSig = crypto.createHmac('sha256', secret).update(payload).digest('base64url')
    const sigBuf = Buffer.from(signature, 'utf-8')
    const expBuf = Buffer.from(expectedSig, 'utf-8')
    if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
      return null
    }

    const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf-8')) as AdminSession
    if (!decoded || !decoded.username || !decoded.expiresAt || Date.now() > decoded.expiresAt) {
      return null
    }
    return decoded
  } catch {
    return null
  }
}

export function setAdminSessionCookie(event: H3Event, username: string): AdminSession {
  const cfg = getAdminConfig()
  const now = Date.now()
  const session: AdminSession = {
    username,
    issuedAt: now,
    expiresAt: now + SESSION_TTL_MS
  }

  setCookie(event, ADMIN_COOKIE_NAME, signSession(session, cfg.sessionSecret), {
    httpOnly: true,
    sameSite: 'strict',
    secure: isSecureRequest(event),
    path: '/',
    maxAge: Math.floor(SESSION_TTL_MS / 1000)
  })

  return session
}

export function clearAdminSessionCookie(event: H3Event): void {
  deleteCookie(event, ADMIN_COOKIE_NAME, {
    httpOnly: true,
    sameSite: 'strict',
    secure: isSecureRequest(event),
    path: '/'
  })
}

export function getAdminSession(event: H3Event): AdminSession | null {
  if (!isAdminConfigured()) return null
  const token = getCookie(event, ADMIN_COOKIE_NAME)
  if (!token) return null

  const cfg = getAdminConfig()
  const session = verifySignedSession(token, cfg.sessionSecret)
  if (!session || !timingSafeStringEqual(session.username, cfg.username)) {
    return null
  }
  return session
}

export function requireAdminSession(event: H3Event): AdminSession {
  const session = getAdminSession(event)
  if (!session) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Admin authentication required.'
    })
  }
  return session
}

// ===========================================================================
// ADMIN LOG AGGREGATOR & ANALYTICS BUILDER (O(1) Catalog Lookups)
// ===========================================================================

type ServiceConfigItem = { slug: string; name: string; id: string }

const serviceIdMap = new Map<string, string>()
const serviceSlugMap = new Map<string, string>()
const airportById = new Map<string, { name: string; code: string }>()
const airportByNameLower = new Map<string, { name: string; code: string }>()
const journeyTypeLabelById = new Map<string, string>()
const travelClassNameById = new Map<string, string>()

for (const a of airportsCatalog) {
  const info = { name: a.name, code: a.code }
  airportById.set(a.id, info)
  airportByNameLower.set(a.name.toLowerCase(), info)
}

for (const j of journeyTypes) {
  const label = j.slug === 'arrival' ? 'Arrival' : j.slug === 'departure' ? 'Departure' : 'Transit'
  journeyTypeLabelById.set(j.id, label)
}

for (const c of classes) {
  travelClassNameById.set(c.id, c.name)
}

for (const airportMap of Object.values(
  bookingServices as Record<string, Record<string, ServiceConfigItem[]>>
)) {
  if (!airportMap || typeof airportMap !== 'object') continue
  for (const list of Object.values(airportMap)) {
    if (!Array.isArray(list)) continue
    for (const item of list) {
      if (item.id && !serviceIdMap.has(String(item.id))) {
        serviceIdMap.set(String(item.id), item.name)
      }
      if (item.slug && !serviceSlugMap.has(item.slug.toLowerCase())) {
        serviceSlugMap.set(item.slug.toLowerCase(), item.name)
      }
    }
  }
}

for (const extra of extrasCatalog) {
  if (!serviceSlugMap.has(extra.slug.toLowerCase())) {
    serviceSlugMap.set(extra.slug.toLowerCase(), extra.name)
  }
}

const MAX_FILE_CACHE = 40
const parsedFileCache = new Map<string, { mtimeMs: number; size: number; data: unknown[] }>()

async function readLogCached<T>(filePath: string, parser: (content: string) => T[]): Promise<T[]> {
  try {
    const stat = await fs.stat(filePath)
    const cached = parsedFileCache.get(filePath)
    if (cached && cached.mtimeMs === stat.mtimeMs && cached.size === stat.size) {
      return cached.data as T[]
    }

    const content = await fs.readFile(filePath, 'utf-8')
    const parsed = parser(content)
    if (parsedFileCache.size >= MAX_FILE_CACHE) {
      const oldestKey = parsedFileCache.keys().next().value
      if (oldestKey) parsedFileCache.delete(oldestKey)
    }
    parsedFileCache.set(filePath, { mtimeMs: stat.mtimeMs, size: stat.size, data: parsed })
    return parsed
  } catch {
    parsedFileCache.delete(filePath)
    return []
  }
}

function parseJsonl<T>(content: string): T[] {
  const items: T[] = []
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim()
    if (!line) continue
    try {
      items.push(JSON.parse(line) as T)
    } catch {
      // Skip malformed lines
    }
  }
  return items
}

function parseLegacySecurityLog(content: string): SecurityLogRecord[] {
  const items: SecurityLogRecord[] = []
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim()
    if (!line) continue
    const m = line.match(
      /^\[([^\]]+)\]\s+\[([^\]]+)\]\s+IP=(\S+)\s+(\S+)\s+(\S+)\s+\|\s+Details=([^|]*)\|\s+UA=(.*)$/
    )
    if (m) {
      items.push({
        timestamp: m[1]?.trim() || '',
        category: m[2]?.trim() || 'SECURITY_EVENT',
        ip: normalizeIp(m[3]),
        method: m[4]?.trim() || 'GET',
        path: m[5]?.trim() || '/',
        details: m[6]?.trim() || '',
        userAgent: m[7]?.trim() || 'unknown',
        blocked: true
      })
    }
  }
  return items
}

const readJsonlFile = <T>(filePath: string) => readLogCached(filePath, parseJsonl<T>)
const readLegacySecurityLog = (filePath: string) => readLogCached(filePath, parseLegacySecurityLog)

function resolveAirportLabel(entry: BookingLogEntry): { name: string; code: string } {
  const id = String(entry.journey?.airportId || '').trim()
  const rawName = String(entry.journey?.airportName || '').trim()
  const matched = airportById.get(id) || airportByNameLower.get(rawName.toLowerCase())
  return {
    name: matched?.name || rawName || 'Unknown Airport',
    code: matched?.code || ''
  }
}

function resolveServiceNames(entry: BookingLogEntry): string[] {
  const raw = String(entry.journey?.servicesInputId || '')
  if (!raw) return []
  const out = new Set<string>()
  for (const part of raw.split(',')) {
    const tok = part.trim()
    if (tok) {
      out.add(serviceIdMap.get(tok) || serviceSlugMap.get(tok.toLowerCase()) || tok)
    }
  }
  return Array.from(out)
}

const SHORT_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function formatYearMonthLabel(ym: string): string {
  const m = ym.match(/^(\d{4})-(\d{2})$/)
  if (!m || !m[1] || !m[2]) return ym
  return `${SHORT_MONTHS[Number(m[2]) - 1] || m[2]} ${m[1]}`
}

function addBookingToBuckets(
  entry: Pick<BookingLogEntry, 'timestamp' | 'status'>,
  dailyMap: Map<string, { success: number; failed: number }>,
  monthlyMap?: Map<string, { success: number; failed: number }>
) {
  const day = String(entry.timestamp || '').slice(0, 10)
  if (!day) return
  const ym = day.slice(0, 7)
  const isSuccess = entry.status === 'SUCCESS'

  let dayBucket = dailyMap.get(day)
  if (!dayBucket) {
    dayBucket = { success: 0, failed: 0 }
    dailyMap.set(day, dayBucket)
  }
  if (isSuccess) dayBucket.success++
  else dayBucket.failed++

  if (monthlyMap && /^\d{4}-\d{2}$/.test(ym)) {
    let monthBucket = monthlyMap.get(ym)
    if (!monthBucket) {
      monthBucket = { success: 0, failed: 0 }
      monthlyMap.set(ym, monthBucket)
    }
    if (isSuccess) monthBucket.success++
    else monthBucket.failed++
  }
}

function buildBreakdown(counts: Map<string, number>, total: number, limit = 8) {
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([label, count]) => ({
      label,
      count,
      percent: total > 0 ? Math.round((count / total) * 100) : 0
    }))
}

export async function getAdminDashboardData(monthFilter = 'all') {
  await ensureLogsDir()
  const dirEntries = await fs.readdir(LOGS_DIR, { withFileTypes: true })

  const monthsSet = new Set<string>()
  const bookingFiles: { ym: string; name: string }[] = []
  const reviewFiles: { ym: string; name: string }[] = []
  const accessFiles: { ym: string; name: string }[] = []
  const securityJsonlFiles: { ym: string; name: string }[] = []
  const securityTextFiles: { ym: string; name: string }[] = []

  const fileMatchers: ReadonlyArray<[RegExp, { ym: string; name: string }[]]> = [
    [/^bookings-(\d{4}-\d{2})\.jsonl$/i, bookingFiles],
    [/^reviews-(\d{4}-\d{2})\.jsonl$/i, reviewFiles],
    [/^access-(\d{4}-\d{2})\.jsonl$/i, accessFiles],
    [/^security-(\d{4}-\d{2})\.jsonl$/i, securityJsonlFiles],
    [/^security-(\d{4}-\d{2})\.log$/i, securityTextFiles]
  ]

  for (const e of dirEntries) {
    if (!e.isFile()) continue
    for (const [pattern, bucket] of fileMatchers) {
      const m = e.name.match(pattern)
      if (m?.[1]) {
        monthsSet.add(m[1])
        bucket.push({ ym: m[1], name: e.name })
        break
      }
    }
  }

  const availableMonths = Array.from(monthsSet).sort((a, b) => b.localeCompare(a))
  const filterByMonth = (item: { ym: string }) =>
    !monthFilter || monthFilter === 'all' || item.ym === monthFilter

  const filteredBookingFiles = bookingFiles.filter(filterByMonth)
  const extraBookingFiles = bookingFiles.filter(f => !filterByMonth(f))

  const [
    bookingsNested,
    extraBookingsNested,
    reviewsNested,
    accessNested,
    secJsonlNested,
    secTextNested,
    blockedIps
  ] = await Promise.all([
    Promise.all(filteredBookingFiles.map(f => readJsonlFile<BookingLogEntry>(path.join(LOGS_DIR, f.name)))),
    Promise.all(extraBookingFiles.map(f => readJsonlFile<BookingLogEntry>(path.join(LOGS_DIR, f.name)))),
    Promise.all(reviewFiles.filter(filterByMonth).map(f => readJsonlFile<ReviewLogEntry>(path.join(LOGS_DIR, f.name)))),
    Promise.all(accessFiles.filter(filterByMonth).map(f => readJsonlFile<AccessLogRecord>(path.join(LOGS_DIR, f.name)))),
    Promise.all(securityJsonlFiles.filter(filterByMonth).map(f => readJsonlFile<SecurityLogRecord>(path.join(LOGS_DIR, f.name)))),
    Promise.all(securityTextFiles.filter(filterByMonth).map(f => readLegacySecurityLog(path.join(LOGS_DIR, f.name)))),
    getBlockedIps()
  ])

  const rawBookings = bookingsNested.flat()
  const extraBookings = extraBookingsNested.flat()
  const rawReviews = reviewsNested.flat()
  const rawAccess = accessNested.flat()

  const secDedupMap = new Map<string, SecurityLogRecord>()
  const ingestSecBatch = (batches: SecurityLogRecord[][]) => {
    for (const batch of batches) {
      for (const s of batch) {
        const ip = normalizeIp(s.ip)
        secDedupMap.set(`${s.timestamp}|${s.category}|${ip}|${s.path}`, { ...s, ip })
      }
    }
  }
  ingestSecBatch(secTextNested)
  ingestSecBatch(secJsonlNested)
  const securityEvents = Array.from(secDedupMap.values()).sort((a, b) =>
    b.timestamp.localeCompare(a.timestamp)
  )

  const airportCounts = new Map<string, number>()
  const serviceTypeCounts = new Map<string, number>()
  const terminalCounts = new Map<string, number>()
  const classCounts = new Map<string, number>()
  const dailyMap = new Map<string, { success: number; failed: number }>()
  const allDailyMap = new Map<string, { success: number; failed: number }>()
  const monthlyMapAll = new Map<string, { success: number; failed: number }>()

  for (const extra of extraBookings) {
    addBookingToBuckets(extra, allDailyMap, monthlyMapAll)
  }

  let successfulBookings = 0
  let failedBookings = 0

  const normalizedBookings = rawBookings
    .map((entry) => {
      const airport = resolveAirportLabel(entry)
      const serviceTypeId = String(entry.journey?.serviceTypeId || '').trim()
      const serviceType = journeyTypeLabelById.get(serviceTypeId) || 'Other'
      const rawTerminal = String(entry.journey?.terminal || entry.rawPayload?.terminal || '').trim().toLowerCase()
      const terminal = rawTerminal === 'vip' ? 'VIP Terminal' : rawTerminal === 'normal' ? 'Normal Terminal' : 'Unspecified'
      const classId = String(entry.journey?.classOfTravelId || '').trim()
      const travelClass = travelClassNameById.get(classId) || classId || 'Unspecified'
      const services = resolveServiceNames(entry)
      const ip = normalizeIp(entry.meta?.clientIp)

      if (entry.status === 'SUCCESS') successfulBookings++
      else failedBookings++

      airportCounts.set(airport.name, (airportCounts.get(airport.name) || 0) + 1)
      serviceTypeCounts.set(serviceType, (serviceTypeCounts.get(serviceType) || 0) + 1)
      terminalCounts.set(terminal, (terminalCounts.get(terminal) || 0) + 1)
      classCounts.set(travelClass, (classCounts.get(travelClass) || 0) + 1)

      addBookingToBuckets(entry, dailyMap)
      addBookingToBuckets(entry, allDailyMap, monthlyMapAll)

      return {
        id: entry.id,
        enquiryReference: entry.enquiryReference,
        timestamp: entry.timestamp,
        timestampLocal: entry.timestampLocal,
        status: entry.status,
        statusCode: entry.statusCode,
        category: entry.category,
        error: entry.error,
        traveler: entry.traveler,
        party: entry.party,
        journey: {
          airportName: airport.name,
          airportCode: airport.code,
          terminal,
          serviceType,
          services,
          travelClass,
          arrivalFlight: entry.journey?.arrivalFlight || '',
          arrivalDate: entry.journey?.arrivalDate || '',
          arrivalTime: entry.journey?.arrivalTime || '',
          departureFlight: entry.journey?.departureFlight || '',
          departureDate: entry.journey?.departureDate || '',
          departureTime: entry.journey?.departureTime || ''
        },
        ip,
        userAgent: entry.meta?.userAgent || 'unknown'
      }
    })
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp))

  const reviews = [...rawReviews]
    .map(r => ({ ...r, clientIp: normalizeIp(r.clientIp) }))
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp))

  const ratingCounts = new Map<number, number>([[5, 0], [4, 0], [3, 0], [2, 0], [1, 0]])
  let ratingSum = 0
  for (const r of reviews) {
    const score = Math.max(1, Math.min(5, Math.round(Number(r.rating) || 0)))
    ratingCounts.set(score, (ratingCounts.get(score) || 0) + 1)
    ratingSum += score
  }
  const averageRating = reviews.length > 0 ? Number((ratingSum / reviews.length).toFixed(2)) : 0
  const ratingDistribution = [5, 4, 3, 2, 1].map((stars) => {
    const count = ratingCounts.get(stars) || 0
    return {
      stars,
      count,
      percent: reviews.length > 0 ? Math.round((count / reviews.length) * 100) : 0
    }
  })

  const pathCounts = new Map<string, number>()
  const secCategoryCounts = new Map<string, number>()

  interface IpAggregate {
    ip: string
    accessHits: number
    bookingsCount: number
    reviewsCount: number
    blockedHits: number
    lastSeen: string
    lastPath: string
    userAgent: string
  }

  const ipMap = new Map<string, IpAggregate>()
  const blockedLookup = new Map(blockedIps.map(b => [b.ip, b]))

  function touchIp(ipRaw: string, timestamp: string, reqPath = '', ua = ''): IpAggregate {
    const ip = normalizeIp(ipRaw)
    let agg = ipMap.get(ip)
    if (!agg) {
      agg = {
        ip,
        accessHits: 0,
        bookingsCount: 0,
        reviewsCount: 0,
        blockedHits: 0,
        lastSeen: timestamp,
        lastPath: reqPath,
        userAgent: ua
      }
      ipMap.set(ip, agg)
    }
    if (timestamp && (!agg.lastSeen || timestamp > agg.lastSeen)) {
      agg.lastSeen = timestamp
      if (reqPath) agg.lastPath = reqPath
      if (ua) agg.userAgent = ua
    }
    return agg
  }

  for (const acc of rawAccess) {
    const cleanPath = String(acc.path || '/').split('?')[0] || '/'
    pathCounts.set(cleanPath, (pathCounts.get(cleanPath) || 0) + 1)
    const agg = touchIp(acc.ip, acc.timestamp, cleanPath, acc.userAgent)
    agg.accessHits++
    if (acc.blocked) agg.blockedHits++
  }

  for (const b of normalizedBookings) {
    touchIp(b.ip, b.timestamp, '/api/booking', b.userAgent).bookingsCount++
  }

  for (const r of reviews) {
    touchIp(r.clientIp, r.timestamp, '/api/review', r.userAgent).reviewsCount++
  }

  for (const s of securityEvents) {
    secCategoryCounts.set(s.category, (secCategoryCounts.get(s.category) || 0) + 1)
    const agg = touchIp(s.ip, s.timestamp, s.path, s.userAgent)
    if (s.blocked) agg.blockedHits++
  }

  for (const b of blockedIps) {
    touchIp(b.ip, b.blockedAt, '-', '')
  }

  const ipSummary = Array.from(ipMap.values())
    .filter(item => item.ip && item.ip !== 'unknown')
    .map((item) => {
      const blockInfo = blockedLookup.get(item.ip)
      return {
        ...item,
        isBlocked: Boolean(blockInfo),
        blockReason: blockInfo?.reason || null,
        blockedAt: blockInfo?.blockedAt || null
      }
    })
    .sort((a, b) => b.lastSeen.localeCompare(a.lastSeen))

  const accessLogs = [...rawAccess]
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
    .slice(0, 250)

  const mapDailyPoints = (sourceMap: Map<string, { success: number; failed: number }>, maxPoints?: number) => {
    const sorted = Array.from(sourceMap.entries()).sort((a, b) => a[0].localeCompare(b[0]))
    const slice = typeof maxPoints === 'number' ? sorted.slice(-maxPoints) : sorted
    return slice.map(([date, counts]) => ({
      date,
      success: counts.success,
      failed: counts.failed,
      total: counts.success + counts.failed
    }))
  }

  const dailyBookings = mapDailyPoints(dailyMap, monthFilter && monthFilter !== 'all' ? undefined : 31)
  const allDailyBookings = mapDailyPoints(allDailyMap)
  const monthlyBookings = Array.from(monthlyMapAll.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([month, counts]) => ({
      month,
      label: formatYearMonthLabel(month),
      success: counts.success,
      failed: counts.failed,
      total: counts.success + counts.failed
    }))

  const totalBookings = normalizedBookings.length
  const blockedEventsCount = securityEvents.filter(e => e.blocked).length

  return {
    availableMonths,
    selectedMonth: monthFilter || 'all',
    generatedAt: new Date().toISOString(),
    kpis: {
      totalBookings,
      successfulBookings,
      failedBookings,
      successRate: totalBookings > 0 ? Math.round((successfulBookings / totalBookings) * 100) : 0,
      totalReviews: reviews.length,
      averageRating,
      uniqueIps: ipSummary.length,
      totalAccessHits: rawAccess.length,
      blockedEventsCount,
      activeBlockedIpsCount: blockedIps.length
    },
    analytics: {
      dailyBookings,
      allDailyBookings,
      monthlyBookings,
      topAirports: buildBreakdown(airportCounts, totalBookings, 8),
      serviceTypes: buildBreakdown(serviceTypeCounts, totalBookings, 6),
      terminalSplit: buildBreakdown(terminalCounts, totalBookings, 4),
      travelClasses: buildBreakdown(classCounts, totalBookings, 6),
      ratingDistribution,
      topPaths: buildBreakdown(pathCounts, rawAccess.length, 10),
      securityBreakdown: buildBreakdown(secCategoryCounts, securityEvents.length, 8)
    },
    bookings: normalizedBookings,
    reviews,
    ipSummary,
    blockedIps,
    securityEvents: securityEvents.slice(0, 250),
    accessLogs
  }
}

