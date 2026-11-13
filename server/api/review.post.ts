import { createError, getRequestIP, getRequestHeader } from 'h3'
import { logReview } from '../utils/reviewLogger'
import { assertSafeJsonBody, logSecurityEvent, sanitizeText } from '../utils/security'

export default defineEventHandler(async (event) => {
  const clientIp = getRequestIP(event, { xForwardedFor: true }) || 'unknown'
  const userAgent = getRequestHeader(event, 'user-agent') || 'unknown'
  const referer = getRequestHeader(event, 'referer') || ''

  const body = await assertSafeJsonBody<Record<string, any>>(event)

  // Honeypot check for bots
  if (body.website_check || body.honeypot) {
    await logSecurityEvent(event, 'BOT_HONEYPOT_REVIEW', 'Spam bot trapped in review honeypot', true)
    return { success: true, message: 'Review received.' }
  }

  const rawRating = Number(body.rating)
  if (!body.rating || Number.isNaN(rawRating) || rawRating < 1 || rawRating > 5) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Please provide a valid rating between 1 and 5 stars.'
    })
  }

  const rating = Math.round(rawRating)
  const bookingReference = sanitizeText(body.bookingReference, 64) || 'ENQ-PENDING'
  const comment = sanitizeText(body.comment, 1000)

  const entry = await logReview({
    bookingReference,
    rating,
    comment,
    clientIp,
    userAgent,
    sourceUrl: referer
  })

  return {
    success: true,
    message: 'Thank you for sharing your feedback!',
    reviewId: entry.id
  }
})

