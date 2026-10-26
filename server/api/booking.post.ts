import { createError, readBody, getRequestIP, getRequestHeader } from 'h3'
import { logBooking } from '../utils/bookingLogger'

// POST remains disabled until you explicitly enable it. Never expose upstream API keys to the browser.
export default defineEventHandler(async (event) => {
  const cfg = useRuntimeConfig()
  const clientIp = getRequestIP(event, { xForwardedFor: true }) || 'unknown'
  const userAgent = getRequestHeader(event, 'user-agent') || 'unknown'

  let payload: any = null

  try {
    payload = await readBody(event)
  } catch (err: any) {
    await logBooking({
      status: 'FAILED',
      statusCode: 400,
      category: 'VALIDATION_ERROR',
      errorMessage: 'Invalid request body - unable to parse JSON',
      errorDetails: err?.message,
      clientIp,
      userAgent
    })
    throw createError({ statusCode: 400, statusMessage: 'Invalid booking payload' })
  }

  const keys = [
    'airport_name',
    'airport_name_id',
    'email',
    'mobile',
    'service_types_id',
    'arrival_flight_number',
    'arrival_date',
    'departure_flight_number',
    'departure_date',
    'class_of_travel_id',
    'servicesinput_id',
    'no_luggages',
    'traveler_name',
    'arrival_time',
    'departure_time',
    'uaa_url',
    'uaa_p_c_method',
    'childrens_count',
    'infants_count',
    'adults_count'
  ]

  if (!payload || typeof payload !== 'object' || keys.some(k => typeof payload[k] !== 'string')) {
    await logBooking({
      status: 'FAILED',
      statusCode: 400,
      category: 'VALIDATION_ERROR',
      payload: typeof payload === 'object' ? payload : null,
      errorMessage: 'Invalid booking payload: expected object with string values for all required keys',
      clientIp,
      userAgent
    })
    throw createError({ statusCode: 400, statusMessage: 'Invalid booking payload' })
  }

  if (!payload.email || !payload.mobile || !payload.airport_name_id || !payload.traveler_name) {
    const missing = [
      !payload.traveler_name && 'traveler_name',
      !payload.email && 'email',
      !payload.mobile && 'mobile',
      !payload.airport_name_id && 'airport_name_id'
    ].filter(Boolean).join(', ')

    await logBooking({
      status: 'FAILED',
      statusCode: 400,
      category: 'VALIDATION_ERROR',
      payload,
      errorMessage: `Missing required booking fields: ${missing}`,
      clientIp,
      userAgent
    })
    throw createError({ statusCode: 400, statusMessage: 'Missing required booking fields' })
  }

  if (!cfg.bookingApiEnabled) {
    const errorMsg = 'Demo mode: outbound booking API disabled. Configure supplier IDs and BOOKING_API_ENABLED=true to activate.'
    const logEntry = await logBooking({
      status: 'FAILED',
      statusCode: 503,
      category: 'DEMO_MODE_DISABLED',
      payload,
      errorMessage: errorMsg,
      clientIp,
      userAgent
    })
    throw createError({
      statusCode: 503,
      statusMessage: errorMsg,
      data: { bookingId: logEntry.id }
    })
  }

  // Provider must support a unique idempotency key to safely retry submissions.
  // This route deliberately never retries failed requests automatically.
  try {
    const data: any = await $fetch(cfg.bookingApiUrl as string, {
      method: 'POST',
      body: payload,
      headers: cfg.bookingApiToken ? { Authorization: `Bearer ${cfg.bookingApiToken}` } : {},
      timeout: 15000,
      retry: 0
    })

    // Inspect upstream JSON-RPC / REST response structure
    // e.g. { jsonrpc: "2.0", result: { status: true, message: "Success", airport_enquiry: "BU24444" } }
    const isSupplierSuccess = data?.result
      ? Boolean(data.result.status)
      : data?.error
        ? false
        : true

    const enquiryRef = data?.result?.airport_enquiry || data?.airport_enquiry || null
    const responseMsg = data?.result?.message || data?.message || (isSupplierSuccess ? 'Booking enquiry submitted successfully' : 'Supplier rejected booking request')

    if (!isSupplierSuccess) {
      const errorMsg = data?.result?.message || data?.error?.message || 'Supplier rejected booking request'
      const logEntry = await logBooking({
        status: 'FAILED',
        statusCode: 422,
        category: 'UPSTREAM_SUPPLIER_ERROR',
        payload,
        errorMessage: errorMsg,
        errorDetails: data,
        clientIp,
        userAgent
      })

      throw createError({
        statusCode: 422,
        statusMessage: errorMsg,
        data: {
          bookingId: logEntry.id,
          enquiryReference: enquiryRef,
          error: data?.error || data?.result
        }
      })
    }

    const logEntry = await logBooking({
      status: 'SUCCESS',
      statusCode: 200,
      category: 'SUCCESS',
      payload,
      upstreamResponse: data,
      clientIp,
      userAgent
    })

    return {
      success: true,
      message: responseMsg,
      enquiryReference: enquiryRef,
      bookingId: logEntry.id,
      data
    }
  } catch (err: any) {
    if (err?.statusCode === 422) {
      throw err
    }

    const upstreamStatus = err?.statusCode || err?.status || 502
    const upstreamMessage = err?.data?.statusMessage || err?.data?.message || err?.message || 'Supplier request failed'
    console.error('Booking upstream failed:', upstreamStatus, upstreamMessage)

    const logEntry = await logBooking({
      status: 'FAILED',
      statusCode: 502,
      category: 'UPSTREAM_SUPPLIER_ERROR',
      payload,
      errorMessage: 'Supplier request failed. Please contact support before retrying to avoid a duplicate booking.',
      errorDetails: {
        upstreamStatus,
        upstreamMessage,
        upstreamData: err?.data || null
      },
      clientIp,
      userAgent
    })

    throw createError({
      statusCode: 502,
      statusMessage: 'Supplier request failed. Please contact support before retrying to avoid a duplicate booking.',
      data: { bookingId: logEntry.id }
    })
  }
})

