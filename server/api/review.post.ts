import { createError, readBody, getRequestIP, getRequestHeader } from 'h3'
import { logReview } from '../utils/reviewLogger'

export default defineEventHandler(async (event) => {
  const clientIp = getRequestIP(event, { xForwardedFor: true }) || 'unknown'
  const userAgent = getRequestHeader(event, 'user-agent') || 'unknown'
  const referer = getRequestHeader(event, 'referer') || ''

  let body: Record<string, any> = {}

  try {
    body = await readBody(event)
  } catch (err: any) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid request body'
    })
  }

  // Honeypot check for bots
  if (body.website_check || body.honeypot) {
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
  const bookingReference = typeof body.bookingReference === 'string' ? body.bookingReference.trim() : 'ENQ-PENDING'
  const comment = typeof body.comment === 'string' ? body.comment.trim().slice(0, 1000) : ''

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

