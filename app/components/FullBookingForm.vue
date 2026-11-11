<script setup lang="ts">
import { ChevronDown } from 'lucide-vue-next'
import {
  airportsCatalog,
  journeyTypes,
  classes,
  communicationMethods,
  selectAirport,
  formatApiDate
} from '~/data/booking'

import {
  getServiceDetails,
  getAirportTerminals,
  type TerminalSlug
} from '~/data/terminalServices'
import bookingServices from '~/data/bookingServices.json'
import countryCodes from '~/data/countryCodes.json'

type BookingService = {
  slug: string
  name: string
  id: string
}

type BookingJourney = 'arrival' | 'departure' | 'transit'

type BookingConfig = Record<
  string,
  Partial<Record<BookingJourney, BookingService[]>>
>

const servicesConfig = bookingServices as BookingConfig
const route = useRoute()

function resolveInitialServices(
  airportSlug: string,
  journeySlug: string,
  queryPackages?: unknown,
  queryServices?: unknown,
  queryExtras?: unknown,
  queryTerminal?: unknown
): string[] {
  const airportServices =
    servicesConfig[airportSlug]?.[journeySlug as BookingJourney] ||
    servicesConfig['heathrow']?.[journeySlug as BookingJourney] ||
    []

  if (!airportServices.length) return []

  const availableSlugs = new Set(airportServices.map(s => s.slug))
  const matchedSlugs = new Set<string>()

  // 1. Direct query.services (e.g. ?services=meet-greet,fast-track)
  if (queryServices) {
    const rawServices = Array.isArray(queryServices)
      ? queryServices.join(',')
      : String(queryServices)
    for (const token of rawServices.split(',')) {
      const clean = token.trim().toLowerCase()
      if (availableSlugs.has(clean)) {
        matchedSlugs.add(clean)
      }
    }
  }

  // 2. Query.packages (e.g. ?packages=lhr-arrival-meet-greet,lhr-arrival-fast-track)
  if (queryPackages) {
    const rawPackages = Array.isArray(queryPackages)
      ? queryPackages.join(',')
      : String(queryPackages)
    const terminalSlug =
      String(queryTerminal || 'normal').toLowerCase() === 'vip' ? 'vip' : 'normal'

    for (const token of rawPackages.split(',')) {
      const clean = token.trim().toLowerCase()
      if (!clean) continue

      // Direct match
      if (availableSlugs.has(clean)) {
        matchedSlugs.add(clean)
        continue
      }

      // Match via terminalServices apiServiceId
      const pkg = getServiceDetails(airportSlug, terminalSlug, journeySlug, clean)
      if (pkg?.apiServiceId) {
        const found = airportServices.find(s => s.id === pkg.apiServiceId)
        if (found) {
          matchedSlugs.add(found.slug)
          continue
        }
      }

      // Semantic / keyword matching fallback
      if (clean.includes('vip-terminal') || clean.includes('windsor')) {
        if (availableSlugs.has('vip-terminal')) matchedSlugs.add('vip-terminal')
        else if (availableSlugs.has('vip-meet-greet')) matchedSlugs.add('vip-meet-greet')
      } else if (clean.includes('fast-track')) {
        if (availableSlugs.has('fast-track')) matchedSlugs.add('fast-track')
      } else if (clean.includes('baggage') || clean.includes('porter')) {
        if (availableSlugs.has('baggage')) matchedSlugs.add('baggage')
      } else if (clean.includes('lounge')) {
        if (availableSlugs.has('lounge')) matchedSlugs.add('lounge')
      } else if (clean.includes('checkin') || clean.includes('check-in')) {
        if (availableSlugs.has('checkin')) matchedSlugs.add('checkin')
      } else if (
        clean.includes('limousine') ||
        clean.includes('chauffeur') ||
        clean.includes('taxi')
      ) {
        if (availableSlugs.has('limousine')) matchedSlugs.add('limousine')
      } else if (clean.includes('vip-meet-greet')) {
        if (availableSlugs.has('vip-meet-greet')) matchedSlugs.add('vip-meet-greet')
      } else if (clean.includes('meet-greet')) {
        if (availableSlugs.has('meet-greet')) matchedSlugs.add('meet-greet')
      }
    }
  }

  // 3. Query.terminal === 'vip'
  if (queryTerminal && String(queryTerminal).toLowerCase() === 'vip') {
    if (availableSlugs.has('vip-terminal')) {
      matchedSlugs.add('vip-terminal')
    } else if (availableSlugs.has('vip-meet-greet')) {
      matchedSlugs.add('vip-meet-greet')
    }
  }

  // 4. Query.extras (e.g. ?extras=porter,lounge)
  if (queryExtras) {
    const rawExtras = Array.isArray(queryExtras)
      ? queryExtras.join(',')
      : String(queryExtras)
    for (const extra of rawExtras.split(',')) {
      const e = extra.trim().toLowerCase()
      if (e === 'porter' && availableSlugs.has('baggage')) matchedSlugs.add('baggage')
      if (e === 'lounge' && availableSlugs.has('lounge')) matchedSlugs.add('lounge')
      if (e === 'chauffeur' && availableSlugs.has('limousine')) matchedSlugs.add('limousine')
    }
  }

  // 5. If matched any, return them
  if (matchedSlugs.size > 0) {
    return Array.from(matchedSlugs)
  }

  // 6. If only one service is available, autoselect it
  if (availableSlugs.size === 1) {
    return Array.from(availableSlugs)
  }

  // 7. Do not select anything by default; let the user select
  return []
}

const initialAirport = selectAirport(String(route.query.airport || 'heathrow')).slug
const rawTerminal = String(route.query.terminal || '').trim().toLowerCase()
const initialTerminal = (rawTerminal === 'vip' || rawTerminal === 'normal' ? rawTerminal : '') as TerminalSlug | ''
const rawJourney = String(route.query.service || route.query.journey || 'arrival').toLowerCase()
const initialJourney = journeyTypes.some(j => j.slug === rawJourney) ? rawJourney : 'arrival'

const input = reactive({
  firstName: '',
  lastName: '',
  email: '',
  mobile: '',
  airport: initialAirport,
  terminal: initialTerminal,
  journey: initialJourney,
  services: resolveInitialServices(
    initialAirport,
    initialJourney,
    route.query.packages,
    route.query.services,
    route.query.extras,
    initialTerminal
  ),
  arrivalFlight: '',
  arrivalDate: '',
  arrivalTime: '',
  departureFlight: '',
  departureDate: '',
  departureTime: '',
  travelClass: '',
  adults: Number(route.query.adults || 1),
  children: 0,
  infants: 0,
  luggages: 0,
  communication: ['Email (Default)'] as string[]
})

const formRef = ref<HTMLFormElement | null>(null)
const consent = ref(false)
const sending = ref(false)
const error = ref('')
const payloadPreview = ref(false)
const toast = useToast()
const { siteName } = useSiteMeta()


// ------------------------------------------
// TERMINAL & AIRPORT-SPECIFIC SERVICES
// ------------------------------------------

const terminals = computed(() => getAirportTerminals(input.airport))

const terminalOptions = computed(() => {
  const options: { slug: TerminalSlug; label: string }[] = [
    {
      slug: 'normal',
      label: terminals.value.normal?.label || 'Normal Terminal'
    }
  ]

  const vip = terminals.value.vip
  if (
    vip &&
    Object.values(vip.services).some(
      pkgs => pkgs && pkgs.length > 0
    )
  ) {
    options.push({
      slug: 'vip',
      label: vip.label || 'VIP Terminal'
    })
  }

  return options
})

const availableJourneys = computed(() => {
  const airportServices = servicesConfig[input.airport]
  if (airportServices) {
    const list = journeyTypes.filter(type =>
      (airportServices[type.slug as BookingJourney] || []).length > 0
    )
    if (list.length > 0) return list
  }
  return journeyTypes
})

const journeyDisplayOptions = computed(() => {
  return availableJourneys.value.map(type => {
    let name: string = type.name
    if (input.terminal === 'normal') {
      if (type.slug === 'arrival') name = 'Normal Arrival'
      else if (type.slug === 'departure') name = 'Normal Departure'
      else if (type.slug === 'transit') name = 'Normal Transit'
    } else if (input.terminal === 'vip') {
      if (type.slug === 'arrival') name = 'VIP Arrival'
      else if (type.slug === 'departure') name = 'VIP Departure'
      else if (type.slug === 'transit') name = 'VIP Transit'
    } else {
      if (type.slug === 'arrival') name = 'Arrival'
      else if (type.slug === 'departure') name = 'Departure'
      else if (type.slug === 'transit') name = 'Transit'
    }
    return {
      slug: type.slug,
      name,
      id: type.id
    }
  })
})

const terminalSelectOptions = computed(() =>
  terminalOptions.value.map(t => ({ value: t.slug, label: t.label }))
)

const journeySelectOptions = computed(() =>
  journeyDisplayOptions.value.map(t => ({ value: t.slug, label: t.name }))
)

const classSelectOptions = computed(() =>
  [...classes].reverse().map(c => ({ value: c.id, label: c.name }))
)

const availableServices = computed<BookingService[]>(() => {
  const configured = servicesConfig[input.airport]?.[
    input.journey as BookingJourney
  ]
  const list = configured && configured.length > 0
    ? configured
    : servicesConfig['heathrow']?.[input.journey as BookingJourney] || []

  if (input.terminal === 'normal') {
    return list.filter(item => item.slug !== 'vip-terminal')
  }
  return list
})

const selectedServices = computed(() =>
  availableServices.value.filter(item =>
    input.services.includes(item.slug)
  )
)

watch(
  () => input.terminal,
  (newTerm, oldTerm) => {
    if (newTerm === oldTerm) return
    if (newTerm === 'vip') {
      const vipPkg = availableServices.value.find(s => s.slug === 'vip-terminal')
      if (vipPkg && input.services.includes('meet-greet')) {
        input.services = ['vip-terminal', ...input.services.filter(s => s !== 'meet-greet' && s !== 'vip-terminal')]
      }
    } else {
      if (input.services.includes('vip-terminal')) {
        input.services = ['meet-greet', ...input.services.filter(s => s !== 'vip-terminal')]
      }
    }
    if (input.services.length === 0 && availableServices.value.length === 1) {
      input.services = [availableServices.value[0].slug]
    }
  }
)

watch(
  () => input.airport,
  (newAirport, oldAirport) => {
    if (newAirport === oldAirport) return
    if (
      !availableJourneys.value.some(
        item => item.slug === input.journey
      )
    ) {
      input.journey =
        availableJourneys.value[0]?.slug || 'arrival'
    }

    const hasVip = terminalOptions.value.some(t => t.slug === 'vip')
    if (input.terminal === 'vip' && !hasVip) {
      input.terminal = 'normal'
    }

    input.services = input.services.filter(slug =>
      availableServices.value.some(item => item.slug === slug)
    )
    if (input.services.length === 0 && availableServices.value.length === 1) {
      input.services = [availableServices.value[0].slug]
    }
  }
)

watch(
  () => input.journey,
  (newJourney, oldJourney) => {
    if (newJourney === oldJourney) return
    input.services = input.services.filter(slug =>
      availableServices.value.some(item => item.slug === slug)
    )
    if (input.services.length === 0 && availableServices.value.length === 1) {
      input.services = [availableServices.value[0].slug]
    }
  }
)

function toggleService(slug: string) {
  if (input.services.includes(slug)) {
    input.services = input.services.filter(
      item => item !== slug
    )
  } else {
    input.services = [...input.services, slug]
  }
}

function removeService(slug: string) {
  input.services = input.services.filter(
    item => item !== slug
  )
}

// ------------------------------------------
// SERVICE MULTISELECT
// ------------------------------------------

const servicesOpen = ref(false)
const serviceSearch = ref('')
const serviceDropdownRef =
  ref<HTMLElement | null>(null)

const filteredServices = computed(() => {
  const query = serviceSearch.value
    .trim()
    .toLowerCase()

  return availableServices.value.filter(item =>
    item.name.toLowerCase().includes(query)
  )
})

// ------------------------------------------
// COUNTRY CODE DROPDOWN
// ------------------------------------------

const selectedCountry = ref('GB')
const countryOpen = ref(false)
const countrySearch = ref('')
const countryDropdownRef =
  ref<HTMLElement | null>(null)

const selectedDialCode = computed(() =>
  countryCodes.find(country =>
    country.code.toUpperCase() === selectedCountry.value
  )?.dial_code || '+44'
)

const filteredCountries = computed(() => {
  const query = countrySearch.value
    .trim()
    .toLowerCase()

  return countryCodes.filter(country =>
    country.name.toLowerCase().includes(query) ||
    country.code.toLowerCase().includes(query) ||
    country.dial_code.includes(query)
  )
})

const fullMobile = computed(() => {
  const digits = input.mobile.replace(/\D/g, '')
  return `${selectedDialCode.value}${digits}`
})

function chooseCountry(code: string) {
  selectedCountry.value = code.toUpperCase()
  countrySearch.value = ''
  countryOpen.value = false
}

function closeDropdowns(event: PointerEvent) {
  const target = event.target as Node

  if (
    countryDropdownRef.value &&
    !countryDropdownRef.value.contains(target)
  ) {
    countryOpen.value = false
  }

  if (
    serviceDropdownRef.value &&
    !serviceDropdownRef.value.contains(target)
  ) {
    servicesOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener(
    'pointerdown',
    closeDropdowns
  )
})

onBeforeUnmount(() => {
  document.removeEventListener(
    'pointerdown',
    closeDropdowns
  )
})

// ------------------------------------------
// COMMUNICATION METHODS
// ------------------------------------------

function toggleCommunication(method: string) {
  if (input.communication.includes(method)) {
    input.communication =
      input.communication.filter(item => item !== method)
  } else {
    input.communication = [
      ...input.communication,
      method
    ]
  }
}

// ------------------------------------------
// FLIGHT FIELDS
// ------------------------------------------

const requiresArrival = computed(() =>
  input.journey === 'arrival' ||
  input.journey === 'transit'
)

const requiresDeparture = computed(() =>
  input.journey === 'departure' ||
  input.journey === 'transit'
)

const travelName = computed(() =>
  [
    input.firstName.trim(),
    input.lastName.trim()
  ].filter(Boolean).join(' ')
)

// ------------------------------------------
// DATE CONSTRAINTS & URL PRE-FILL
// ------------------------------------------

const minDate = computed(() => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
})

const minDepartureDate = computed(() => {
  if (input.arrivalDate && input.arrivalDate >= minDate.value) {
    return input.arrivalDate
  }
  return minDate.value
})

watch(
  () => input.arrivalDate,
  (newArrival) => {
    if (newArrival && input.departureDate && input.departureDate < newArrival) {
      input.departureDate = newArrival
    }
  }
)

const dateQ = String(route.query.date || '')

if (/^\d{4}-\d{2}-\d{2}$/.test(dateQ)) {
  const targetDate = dateQ >= minDate.value ? dateQ : minDate.value
  if (input.journey === 'departure') {
    input.departureDate = targetDate
  } else {
    input.arrivalDate = targetDate
  }
}

// ------------------------------------------
// EXISTING SUPPLIER API PAYLOAD
// ------------------------------------------

const payload = computed(() => ({
  airport_name: selectAirport(input.airport).name,
  airport_name_id: selectAirport(input.airport).id,
  terminal: input.terminal,

  email: input.email.trim(),
  mobile: fullMobile.value,

  service_types_id:
    journeyTypes.find(item =>
      item.slug === input.journey
    )?.id || '',

  arrival_flight_number:
    requiresArrival.value
      ? input.arrivalFlight.trim()
      : '',

  arrival_date:
    requiresArrival.value
      ? formatApiDate(input.arrivalDate)
      : '',

  arrival_time:
    requiresArrival.value
      ? input.arrivalTime
      : '',

  departure_flight_number:
    requiresDeparture.value
      ? input.departureFlight.trim()
      : '',

  departure_date:
    requiresDeparture.value
      ? formatApiDate(input.departureDate)
      : '',

  departure_time:
    requiresDeparture.value
      ? input.departureTime
      : '',

  class_of_travel_id: input.travelClass,

  servicesinput_id: selectedServices.value
    .map(item => item.id)
    .filter(Boolean)
    .join(', '),

  no_luggages: String(input.luggages),
  traveler_name: travelName.value,

  uaa_url: siteName.value || 'UK Airport Assistance',

  uaa_p_c_method: input.communication.join(', '),

  childrens_count: String(input.children),
  infants_count: String(input.infants),
  adults_count: String(input.adults)
}))

// ------------------------------------------
// VALIDATION & SUBMISSION
// ------------------------------------------

async function submit() {
  error.value = ''
  if (sending.value) return

  if (
    !input.firstName.trim() ||
    !input.lastName.trim() ||
    !input.email.trim()
  ) {
    error.value = 'Please complete passenger details.'
    toast.error(error.value)
    return
  }

  if (!selectAirport(input.airport).id) {
    error.value = 'The selected airport needs a configured supplier ID.'
    toast.error(error.value)
    return
  }

  if (!input.terminal) {
    error.value = 'Please select a terminal type.'
    toast.error(error.value)
    return
  }

  if (
    !availableJourneys.value.some(
      item => item.slug === input.journey
    )
  ) {
    error.value = 'Please select an available service type.'
    toast.error(error.value)
    return
  }

  // Filter out any stale service selections that do not match available services
  input.services = input.services.filter(slug =>
    availableServices.value.some(item => item.slug === slug)
  )

  if (!input.services.length) {
    error.value = 'Please select at least one service.'
    toast.error(error.value)
    return
  }

  if (selectedServices.value.some(item => !item.id)) {
    error.value = 'A selected service is missing its supplier ID. Configure it in bookingServices.json.'
    toast.error(error.value)
    return
  }

  if (!input.travelClass) {
    error.value = 'Please select your class of travel.'
    toast.error(error.value)
    return
  }

  const passengerCounts = [
    input.adults,
    input.children,
    input.infants,
    input.luggages
  ].map(Number)

  if (
    passengerCounts.some(
      value => !Number.isInteger(value) || value < 0
    ) ||
    Number(input.adults) < 1
  ) {
    error.value = 'Please enter valid passenger and luggage counts.'
    toast.error(error.value)
    return
  }

  if (!input.communication.length) {
    error.value = 'Please select at least one contact method.'
    toast.error(error.value)
    return
  }

  if (
    requiresArrival.value &&
    (
      !input.arrivalFlight.trim() ||
      !input.arrivalDate ||
      !input.arrivalTime
    )
  ) {
    error.value = 'Complete all required arrival flight fields.'
    toast.error(error.value)
    return
  }

  if (
    requiresDeparture.value &&
    (
      !input.departureFlight.trim() ||
      !input.departureDate ||
      !input.departureTime
    )
  ) {
    error.value = 'Complete all required departure flight fields.'
    toast.error(error.value)
    return
  }

  if (
    requiresArrival.value &&
    input.arrivalDate &&
    input.arrivalDate < minDate.value
  ) {
    error.value = 'Arrival date cannot be in the past.'
    toast.error(error.value)
    return
  }

  if (
    requiresDeparture.value &&
    input.departureDate &&
    input.departureDate < minDate.value
  ) {
    error.value = 'Departure date cannot be in the past.'
    toast.error(error.value)
    return
  }

  if (
    requiresArrival.value &&
    requiresDeparture.value &&
    input.arrivalDate &&
    input.departureDate &&
    input.departureDate < input.arrivalDate
  ) {
    error.value = 'Departure date cannot be earlier than arrival date.'
    toast.error(error.value)
    return
  }

  if (
    requiresArrival.value &&
    requiresDeparture.value &&
    input.arrivalDate &&
    input.departureDate &&
    input.arrivalDate === input.departureDate &&
    input.arrivalTime &&
    input.departureTime &&
    input.departureTime <= input.arrivalTime
  ) {
    error.value = 'Departure time must be later than arrival time for same-day transit.'
    toast.error(error.value)
    return
  }

  const phoneDigits = fullMobile.value.replace(/\D/g, '')

  if (!/^\d{8,15}$/.test(phoneDigits)) {
    error.value = 'Please enter a valid phone number with country code.'
    toast.error(error.value)
    return
  }

  if (!consent.value) {
    error.value = 'Please agree to the privacy policy to continue.'
    toast.error(error.value)
    return
  }

  sending.value = true
  let redirected = false

  try {
    const result = await $fetch<{
      success: boolean
      message?: string
      enquiryReference?: string | null
      bookingId?: string
      data?: any
    }>('/api/booking', {
      method: 'POST',
      body: payload.value
    })

    if (result.success) {
      const refId =
        result.enquiryReference ||
        result.data?.result?.airport_enquiry ||
        result.bookingId ||
        'ENQ-' + Math.floor(100000 + Math.random() * 900000)

      redirected = true
      // Navigate directly to the dedicated booking confirmation page
      await navigateTo(`/booking-confirmation/${encodeURIComponent(refId)}`)
      return
    } else {
      const errMsg =
        result.message ||
        'Booking request could not be submitted.'
      error.value = errMsg
      toast.error({
        title: 'Booking Request Failed',
        message: errMsg,
        duration: 8000
      })
    }
  } catch (err: any) {
    const errMsg =
      err?.data?.statusMessage ||
      err?.data?.message ||
      err?.message ||
      'Unable to submit your request. Please try again.'
    error.value = errMsg
    toast.error({
      title: 'Booking Request Failed',
      message: errMsg,
      duration: 8000
    })
  } finally {
    if (!redirected) {
      sending.value = false
    }
  }
}
</script>

<template>
  <form ref="formRef" class="full-booking reference-booking" @submit.prevent="submit">
    <div class="form-section-title">
      <span class="micro-label">01 / PASSENGER DETAILS</span>
      <h2>Your details</h2>
    </div>

    <div class="form-grid">
      <label class="premium-field">
        <span>First Name *</span>
        <input v-model="input.firstName" placeholder="First Name" autocomplete="given-name" required />
      </label>

      <label class="premium-field">
        <span>Last Name *</span>
        <input v-model="input.lastName" placeholder="Last Name" autocomplete="family-name" required />
      </label>

      <label class="premium-field">
        <span>Email *</span>
        <input v-model="input.email" type="email" placeholder="Email Address" autocomplete="email" required />
      </label>

      <div class="premium-field">
        <label id="booking-airport-label">Airport *</label>
        <AirportSearchSelect
          v-model="input.airport"
          aria-labelledby="booking-airport-label"
          placeholder="Search airport or code (e.g. LHR, EDI)..."
        />
      </div>

      <div class="premium-field">
        <label for="booking-phone">Phone / Mobile *</label>

        <div class="phone-input-group">
          <div ref="countryDropdownRef" class="country-dropdown" @keydown.esc="countryOpen = false">
            <button
              type="button"
              class="country-trigger"
              aria-label="Choose calling code"
              :aria-expanded="countryOpen"
              @click="countryOpen = !countryOpen"
            >
              <span class="country-code-text">{{ selectedDialCode }}</span>
              <svg class="country-chevron" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M1 1L5 5L9 1" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>

            <div v-if="countryOpen" class="country-dropdown-menu">
              <input
                v-model="countrySearch"
                type="search"
                class="country-search"
                placeholder="Search country or code"
              />

              <div class="country-options">
                <button
                  v-for="country in filteredCountries"
                  :key="country.code"
                  type="button"
                  class="country-option"
                  @click="chooseCountry(country.code)"
                >
                  <span>{{ country.name }}</span>
                  <span>{{ country.dial_code }}</span>
                </button>
              </div>
            </div>
          </div>

          <input
            id="booking-phone"
            v-model="input.mobile"
            type="tel"
            inputmode="tel"
            autocomplete="tel-national"
            placeholder="Mobile Number"
            required
          />
        </div>
      </div>

      <div class="premium-field">
        <span>Terminal Type *</span>
        <CustomDropdownSelect
          v-model="input.terminal"
          :options="terminalSelectOptions"
          placeholder="- Select -"
          aria-label="Terminal Type"
          required
        />
      </div>

      <div class="premium-field">
        <span>Service Type *</span>
        <CustomDropdownSelect
          v-model="input.journey"
          :options="journeySelectOptions"
          :disabled="!availableJourneys.length"
          placeholder="- Select -"
          aria-label="Service Type"
          required
        />
      </div>
    </div>

    <div class="form-section-title">
      <span class="micro-label">02 / FLIGHT DETAILS</span>
      <h2>Your journey</h2>
    </div>

    <div v-if="requiresArrival" class="form-grid reference-flight-grid">
      <label class="premium-field">
        <span>Arrival Flight Number *</span>
        <input v-model="input.arrivalFlight" placeholder="BA123" required />
      </label>

      <label class="premium-field">
        <span>Arrival Date *</span>
        <input v-model="input.arrivalDate" type="date" :min="minDate" required />
      </label>

      <label class="premium-field">
        <span>Arrival Time *</span>
        <input v-model="input.arrivalTime" type="time" required />
      </label>
    </div>

    <div v-if="requiresDeparture" class="form-grid reference-flight-grid">
      <label class="premium-field">
        <span>Departure Flight Number *</span>
        <input v-model="input.departureFlight" placeholder="BA456" required />
      </label>

      <label class="premium-field">
        <span>Departure Date *</span>
        <input v-model="input.departureDate" type="date" :min="minDepartureDate" required />
      </label>

      <label class="premium-field">
        <span>Departure Time *</span>
        <input v-model="input.departureTime" type="time" required />
      </label>
    </div>

    <div class="form-section-title">
      <span class="micro-label">03 / SERVICES & TRAVELLERS</span>
      <h2>Your preferences</h2>
    </div>

    <div class="form-grid">
      <!-- MULTISELECT SERVICES -->
      <div class="premium-field">
        <label id="booking-services-label">Services *</label>

        <div ref="serviceDropdownRef" class="reference-services-select" @keydown.esc="servicesOpen = false">
          <button
            type="button"
            class="reference-services-trigger"
            :disabled="!availableServices.length"
            :aria-expanded="servicesOpen"
            aria-labelledby="booking-services-label"
            @click="servicesOpen = !servicesOpen"
          >
            <span>
              {{
                selectedServices.length === 1
                  ? selectedServices[0].name
                  : selectedServices.length
                    ? `${selectedServices.length} services selected`
                    : availableServices.length
                      ? 'Select services *'
                      : 'No services configured'
              }}
            </span>
            <span class="reference-services-arrow" aria-hidden="true">
              <ChevronDown :size="15" class="services-chevron" :class="{ 'rotate-180': servicesOpen }" />
            </span>
          </button>

          <div v-if="servicesOpen" class="reference-services-menu">
            <input
              v-model="serviceSearch"
              type="search"
              placeholder="Search services..."
              aria-label="Search services"
            />

            <div class="reference-services-options">
              <label v-for="item in filteredServices" :key="item.slug" class="reference-services-option">
                <input
                  type="checkbox"
                  :checked="input.services.includes(item.slug)"
                  @change="toggleService(item.slug)"
                />
                <span>{{ item.name }}</span>
              </label>

              <p v-if="!filteredServices.length" class="subtle-note">
                No matching services.
              </p>
            </div>
          </div>
        </div>

        <div v-if="selectedServices.length" class="reference-selected-tags">
          <span v-for="item in selectedServices" :key="item.slug" class="reference-selected-tag">
            {{ item.name }}
            <button type="button" :aria-label="`Remove ${item.name}`" @click="removeService(item.slug)">
              ×
            </button>
          </span>
        </div>
      </div>

      <div class="premium-field">
        <span>Class of Travel *</span>
        <CustomDropdownSelect
          v-model="input.travelClass"
          :options="classSelectOptions"
          placeholder="- Select -"
          aria-label="Class of Travel"
          required
        />
      </div>

      <label class="premium-field">
        <span>Adults (Aged 12+) *</span>
        <input v-model.number="input.adults" type="number" min="1" max="100" required />
      </label>

      <label class="premium-field">
        <span>Children (2–11 years)</span>
        <input v-model.number="input.children" type="number" min="0" max="100" />
      </label>

      <label class="premium-field">
        <span>Infants (Under 2 years)</span>
        <input v-model.number="input.infants" type="number" min="0" max="100" />
      </label>

      <label class="premium-field">
        <span>Number of Bags (Luggage) *</span>
        <input v-model.number="input.luggages" type="number" min="0" max="100" required />
      </label>
    </div>

    <div class="reference-communication">
      <p>Preferred contact method(s) *</p>

      <div class="reference-communication-options">
        <label v-for="method in communicationMethods" :key="method" class="checkbox-choice">
          <input
            type="checkbox"
            :checked="input.communication.includes(method)"
            @change="toggleCommunication(method)"
          />
          <span>{{ method }}</span>
        </label>
      </div>
    </div>

    <label class="checkbox-choice consent">
      <input v-model="consent" type="checkbox" required />
      <span>
        I agree to be contacted and have read the
        <NuxtLink to="/privacy" target="_blank" rel="noopener noreferrer">
          privacy policy
        </NuxtLink>.
      </span>
    </label>

    <p v-if="error" class="form-error" role="alert">
      {{ error }}
    </p>

    <!-- BOOK NOW BUTTON WITH ANIMATED LOADING STATE -->
    <button
      type="submit"
      class="premium-submit reference-book-button"
      :disabled="sending"
      :class="{ 'is-loading': sending }"
    >
      <span v-if="sending" class="submit-loading-state">
        <span class="submit-spinner" aria-hidden="true"></span>
        <span>SUBMITTING REQUEST...</span>
      </span>
      <span v-else>
        BOOK NOW
      </span>
    </button>
  </form>
</template>

<style scoped>
.reference-booking {
  scroll-margin-top: 110px;
}

@media (max-width: 767px) {
  .reference-booking {
    scroll-margin-top: 85px;
  }
}

.submit-loading-state {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.submit-spinner {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.35);
  border-top-color: #ffffff;
  border-radius: 50%;
  animation: lottie-submit-spin 0.8s linear infinite;
  display: inline-block;
  flex-shrink: 0;
}

@keyframes lottie-submit-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
