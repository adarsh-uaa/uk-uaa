import { createError, getQuery, getRequestIP, getRouterParam, setResponseHeader } from 'h3'
import {
  clearAdminSessionCookie,
  getAdminDashboardData,
  getAdminSession,
  isAdminConfigured,
  requireAdminSession,
  setAdminSessionCookie,
  verifyAdminCredentials
} from '../../utils/admin'
import {
  assertSafeJsonBody,
  blockIpAddress,
  checkRateLimit,
  isValidIpFormat,
  logSecurityEvent,
  normalizeIp,
  sanitizeText,
  unblockIpAddress
} from '../../utils/security'

function assertMethod(method: string, expected: 'GET' | 'POST') {
  if (method !== expected) {
    throw createError({ statusCode: 405, statusMessage: 'Method not allowed.' })
  }
}

export default defineEventHandler(async (event) => {
  const action = getRouterParam(event, 'action')
  const method = (event.method || 'GET').toUpperCase()

  switch (action) {
    case 'session': {
      assertMethod(method, 'GET')
      if (!isAdminConfigured()) {
        return { configured: false, authenticated: false, username: null }
      }
      const session = getAdminSession(event)
      return {
        configured: true,
        authenticated: Boolean(session),
        username: session?.username || null
      }
    }

    case 'login': {
      assertMethod(method, 'POST')
      const clientIp = normalizeIp(getRequestIP(event, { xForwardedFor: true }))
      const limit = checkRateLimit(`admin_login:${clientIp}`, 5, 15 * 60_000)

      if (!limit.allowed) {
        setResponseHeader(event, 'Retry-After', limit.retryAfterSeconds)
        await logSecurityEvent(
          event,
          'ADMIN_LOGIN_BRUTE_FORCE',
          'Blocked admin login brute-force (>5 attempts / 15m)',
          true
        )
        throw createError({
          statusCode: 429,
          statusMessage: 'Too many login attempts. Please wait 15 minutes before trying again.'
        })
      }

      if (!isAdminConfigured()) {
        throw createError({
          statusCode: 503,
          statusMessage: 'Admin credentials are not configured in server environment variables.'
        })
      }

      const body = await assertSafeJsonBody<Record<string, any>>(event)
      const username = sanitizeText(body.username, 80)
      const password = typeof body.password === 'string' ? body.password.slice(0, 200) : ''

      if (!username || !password) {
        throw createError({ statusCode: 400, statusMessage: 'Please enter both username and password.' })
      }

      if (!verifyAdminCredentials(username, password)) {
        await logSecurityEvent(
          event,
          'ADMIN_LOGIN_FAILED',
          `Failed login attempt for username="${username}"`,
          true
        )
        throw createError({ statusCode: 401, statusMessage: 'Invalid username or password.' })
      }

      const session = setAdminSessionCookie(event, username)
      await logSecurityEvent(
        event,
        'ADMIN_LOGIN_SUCCESS',
        `Authenticated admin session started for "${session.username}"`,
        false
      )

      return { success: true, authenticated: true, username: session.username }
    }

    case 'logout': {
      assertMethod(method, 'POST')
      clearAdminSessionCookie(event)
      return { success: true, authenticated: false }
    }

    case 'dashboard': {
      assertMethod(method, 'GET')
      requireAdminSession(event)

      const query = getQuery(event)
      const rawMonth = String(query.month || 'all').trim()
      if (rawMonth !== 'all' && !/^\d{4}-\d{2}$/.test(rawMonth)) {
        throw createError({ statusCode: 400, statusMessage: 'Invalid month filter.' })
      }

      return await getAdminDashboardData(rawMonth)
    }

    case 'ip-block': {
      assertMethod(method, 'POST')
      const session = requireAdminSession(event)
      const currentIp = normalizeIp(getRequestIP(event, { xForwardedFor: true }))
      const body = await assertSafeJsonBody<Record<string, any>>(event)

      const op = String(body.action || '').trim().toLowerCase()
      const targetIp = normalizeIp(String(body.ip || ''))
      const reason = sanitizeText(body.reason, 240)

      if (op !== 'block' && op !== 'unblock') {
        throw createError({ statusCode: 400, statusMessage: 'Invalid action.' })
      }

      if (!isValidIpFormat(targetIp)) {
        throw createError({ statusCode: 400, statusMessage: 'Please enter a valid IP address.' })
      }

      if (op === 'block') {
        if (targetIp === '127.0.0.1' || targetIp === '::1' || targetIp === currentIp) {
          throw createError({
            statusCode: 400,
            statusMessage: 'Cannot block loopback address or your active administrator IP.'
          })
        }

        const record = await blockIpAddress(targetIp, reason, session.username)
        await logSecurityEvent(
          event,
          'ADMIN_IP_BLOCKED',
          `Blocked IP ${targetIp} (${record.reason}) by ${session.username}`,
          false
        )
        return { success: true, action: 'blocked', record }
      }

      const removed = await unblockIpAddress(targetIp)
      await logSecurityEvent(
        event,
        'ADMIN_IP_UNBLOCKED',
        `Unblocked IP ${targetIp} by ${session.username}`,
        false
      )
      return { success: true, action: 'unblocked', removed, ip: targetIp }
    }

    default:
      throw createError({ statusCode: 404, statusMessage: 'Not found' })
  }
})

