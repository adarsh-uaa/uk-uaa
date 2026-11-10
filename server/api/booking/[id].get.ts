import { getRouterParam } from 'h3'
import { findBookingInLogs } from '../../utils/bookingLogger'
import { airportsCatalog, journeyTypes, classes, extrasCatalog } from '../../../app/data/booking'
import bookingServices from '../../../app/data/bookingServices.json'

type ServiceConfigItem = { slug: string; name: string; id: string }

const serviceIdMap = new Map<string, string>()
const serviceSlugMap = new Map<string, string>()

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

export default defineEventHandler(async (event) => {
  const rawId = getRouterParam(event, 'id') || ''
  const referenceId = decodeURIComponent(rawId).trim()

  if (!referenceId || referenceId === 'ENQ-PENDING') {
    return { found: false, booking: null }
  }

  const entry = await findBookingInLogs(referenceId)
  if (!entry) {
    return { found: false, booking: null }
  }

  // Resolve airport info
  const matchedAirport = airportsCatalog.find(
    a =>
      a.id === String(entry.journey.airportId || '').trim() ||
      a.name.toLowerCase() === String(entry.journey.airportName || '').trim().toLowerCase()
  )
  const airportName = matchedAirport?.name || entry.journey.airportName || 'UK Airport'
  const airportCode = matchedAirport?.code || ''

  // Resolve terminal & service type
  const terminalRaw = String(entry.journey.terminal || entry.rawPayload?.terminal || '').toLowerCase()
  const terminalLabel =
    terminalRaw === 'vip'
      ? 'VIP Terminal'
      : terminalRaw === 'normal'
        ? 'Normal Terminal'
        : ''

  const journeyObj = journeyTypes.find(j => j.id === String(entry.journey.serviceTypeId || '').trim())
  let serviceTypeLabel = journeyObj?.name || 'Airport Assistance'
  if (terminalRaw === 'normal' && journeyObj) {
    serviceTypeLabel = journeyObj.name.replace(/^VIP\s+/i, 'Normal ')
  }

  // Resolve selected services
  const rawTokens = String(entry.journey.servicesInputId || '')
    .split(',')
    .map(t => t.trim())
    .filter(Boolean)

  const resolvedServices = Array.from(
    new Set(
      rawTokens.map(token => {
        return serviceIdMap.get(token) || serviceSlugMap.get(token.toLowerCase()) || token
      })
    )
  )

  // Resolve travel class
  const classObj = classes.find(c => c.id === String(entry.journey.classOfTravelId || '').trim())
  const travelClassLabel = classObj?.name || entry.journey.classOfTravelId || 'Standard'

  return {
    found: true,
    booking: {
      reference: entry.enquiryReference || entry.id,
      bookingId: entry.id,
      submittedAt: entry.timestampLocal,
      traveler: {
        name: entry.traveler.name || '',
        email: entry.traveler.email || '',
        mobile: entry.traveler.mobile || '',
        contactMethod: entry.traveler.contactMethod || 'Email (Default)'
      },
      journey: {
        airportName,
        airportCode,
        terminal: terminalLabel,
        serviceType: serviceTypeLabel,
        services: resolvedServices,
        travelClass: travelClassLabel,
        arrivalFlight: entry.journey.arrivalFlight || '',
        arrivalDate: entry.journey.arrivalDate || '',
        arrivalTime: entry.journey.arrivalTime || '',
        departureFlight: entry.journey.departureFlight || '',
        departureDate: entry.journey.departureDate || '',
        departureTime: entry.journey.departureTime || ''
      },
      party: {
        adults: Number(entry.party.adults) || 0,
        children: Number(entry.party.children) || 0,
        infants: Number(entry.party.infants) || 0,
        luggage: Number(entry.party.luggage) || 0
      }
    }
  }
})

