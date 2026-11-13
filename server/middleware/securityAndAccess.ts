import {
  createError,
  getQuery,
  getRequestHeader,
  getRequestIP,
  removeResponseHeader,
  setResponseHeader
} from 'h3'
import {
  checkRateLimit,
  detectThreatInString,
  isIpBlocked,
  logAccessEvent,
  logSecurityEvent,
  normalizeIp,
  scanPayloadForThreats
} from '../utils/security'

const MAX_API_BODY_BYTES = 32 * 1024 // 32 KB
const MUTATING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE'])

const STANDARD_SECURITY_HEADERS: ReadonlyArray<[string, string]> = [
  ['X-Content-Type-Options', 'nosniff'],
  ['X-Frame-Options', 'DENY'],
  ['X-XSS-Protection', '1; mode=block'],
  ['Referrer-Policy', 'strict-origin-when-cross-origin'],
  ['Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=(), usb=()'],
  ['Cross-Origin-Opener-Policy', 'same-origin']
]

const STATIC_ASSET_REGEX =
  /^\/(_nuxt|_ipx|images|video|animations|__nuxt_error)|^\/(favicon|apple-touch-icon|robots\.txt|sitemap\.xml)|\.(webp|png|jpe?g|gif|svg|ico|css|js|mjs|woff2?|ttf|mp4|json)$/i

function decodeSafe(input: string): string {
  try {
    return decodeURIComponent(input)
  } catch {
    return input
  }
}

export default defineEventHandler(async (event) => {
  // 1. Standard OWASP security headers on all responses
  removeResponseHeader(event, 'x-powered-by')
  for (const [header, value] of STANDARD_SECURITY_HEADERS) {
    setResponseHeader(event, header, value)
  }

  if (getRequestHeader(event, 'x-forwarded-proto') === 'https') {
    setResponseHeader(event, 'Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
  }

  const reqPath = event.path || '/'
  const cleanUrlPath = reqPath.split('?')[0] || '/'
  const method = (event.method || 'GET').toUpperCase()
  const clientIp = normalizeIp(getRequestIP(event, { xForwardedFor: true }))
  const userAgent = (getRequestHeader(event, 'user-agent') || 'unknown').slice(0, 200)
  const isStaticAsset = STATIC_ASSET_REGEX.test(cleanUrlPath)

  // 2. Enforce persistent IP Blocklist
  if (!isStaticAsset) {
    const blockedRecord = await isIpBlocked(clientIp)
    if (blockedRecord) {
      await logSecurityEvent(
        event,
        'IP_BLOCKED',
        `Access denied for blocked IP (${blockedRecord.reason})`,
        true
      )
      logAccessEvent({
        timestamp: new Date().toISOString(),
        ip: clientIp,
        method,
        path: cleanUrlPath,
        statusCode: 403,
        blocked: true,
        userAgent
      })
      throw createError({
        statusCode: 403,
        statusMessage: 'Access denied.'
      })
    }
  }

  // 3. Block directory traversal & null-byte probes globally
  if (
    /\.\.[\\/]/.test(reqPath) ||
    /%2e%2e/i.test(reqPath) ||
    reqPath.includes('\0') ||
    /%00/i.test(reqPath)
  ) {
    await logSecurityEvent(event, 'BLOCKED_PATH_TRAVERSAL', `Path probe: ${reqPath}`, true)
    logAccessEvent({
      timestamp: new Date().toISOString(),
      ip: clientIp,
      method,
      path: reqPath.slice(0, 120),
      statusCode: 400,
      blocked: true,
      userAgent
    })
    throw createError({ statusCode: 400, statusMessage: 'Invalid request path' })
  }

  // 4. API-specific firewall, caching, rate limits & CSRF Origin protection
  if (reqPath.startsWith('/api/')) {
    setResponseHeader(event, 'Cache-Control', 'no-store, no-cache, must-revalidate, private')
    setResponseHeader(event, 'Pragma', 'no-cache')
    setResponseHeader(event, 'Expires', '0')
    setResponseHeader(event, 'X-Robots-Tag', 'noindex, nofollow')

    const burstLimit = checkRateLimit(`api_global:${clientIp}`, 90, 60_000)
    if (!burstLimit.allowed) {
      setResponseHeader(event, 'Retry-After', burstLimit.retryAfterSeconds)
      await logSecurityEvent(event, 'RATE_LIMIT_GLOBAL', 'Exceeded 90 req/min burst limit', true)
      throw createError({
        statusCode: 429,
        statusMessage: 'Too many requests. Please wait a moment.'
      })
    }

    const contentLengthHeader = getRequestHeader(event, 'content-length')
    if (contentLengthHeader) {
      const len = Number(contentLengthHeader)
      if (!Number.isNaN(len) && len > MAX_API_BODY_BYTES) {
        await logSecurityEvent(event, 'PAYLOAD_TOO_LARGE', `Content-Length=${len}`, true)
        throw createError({ statusCode: 413, statusMessage: 'Payload too large.' })
      }
    }

    const pathThreat = detectThreatInString(decodeSafe(reqPath), 'url.path')
    if (pathThreat.detected) {
      await logSecurityEvent(event, `BLOCKED_${pathThreat.type}`, `URL path threat`, true)
      throw createError({ statusCode: 400, statusMessage: 'Invalid request parameters.' })
    }

    const queryThreat = scanPayloadForThreats(getQuery(event), 'query')
    if (queryThreat.detected) {
      await logSecurityEvent(
        event,
        `BLOCKED_${queryThreat.type}`,
        `Query threat in ${queryThreat.field}`,
        true
      )
      throw createError({ statusCode: 400, statusMessage: 'Invalid query parameters.' })
    }

    // Same-origin / CSRF protection for mutating API requests
    if (MUTATING_METHODS.has(method)) {
      const secFetchSite = getRequestHeader(event, 'sec-fetch-site')
      if (secFetchSite === 'cross-site') {
        await logSecurityEvent(event, 'CSRF_CROSS_SITE', `Sec-Fetch-Site=${secFetchSite}`, true)
        throw createError({ statusCode: 403, statusMessage: 'Forbidden cross-origin request.' })
      }

      const origin = getRequestHeader(event, 'origin')
      const host = getRequestHeader(event, 'host')
      if (origin && host) {
        try {
          if (new URL(origin).host.toLowerCase() !== host.toLowerCase()) {
            await logSecurityEvent(
              event,
              'CSRF_ORIGIN_MISMATCH',
              `Origin=${origin} Host=${host}`,
              true
            )
            throw createError({ statusCode: 403, statusMessage: 'Forbidden request origin.' })
          }
        } catch (err: any) {
          if (err?.statusCode === 403) throw err
          await logSecurityEvent(event, 'CSRF_INVALID_ORIGIN', `Invalid Origin=${origin}`, true)
          throw createError({ statusCode: 403, statusMessage: 'Forbidden request origin.' })
        }
      }
    }
  }

  // 5. Log clean page & public API access after response finishes (skip static files & admin API polling)
  if (!isStaticAsset && !cleanUrlPath.startsWith('/api/admin/')) {
    const res = event.node?.res
    if (res && typeof res.once === 'function') {
      res.once('finish', () => {
        const statusCode = res.statusCode || 200
        logAccessEvent({
          timestamp: new Date().toISOString(),
          ip: clientIp,
          method,
          path: cleanUrlPath,
          statusCode,
          blocked: statusCode === 403 || statusCode === 429,
          userAgent
        })
      })
    }
  }
})

