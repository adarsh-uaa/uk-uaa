<script setup lang="ts">
import {
  airportsCatalog,
  journeyTypes,
  classes,
  communicationMethods,
  selectAirport,
  formatApiDate
} from '~/data/booking'

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

const input = reactive({
  firstName: '',
  lastName: '',
  email: '',
  mobile: '',
  airport: String(route.query.airport || 'heathrow'),
  journey: String(route.query.service || 'arrival'),
  services: [] as string[],
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

const sending = ref(false)
const submitted = ref(false)
const error = ref('')
const payloadPreview = ref(false)

// ------------------------------------------
// AIRPORT-SPECIFIC SERVICES
// ------------------------------------------

const availableJourneys = computed(() =>
  journeyTypes.filter(type =>
    (servicesConfig[input.airport]?.[
      type.slug as BookingJourney
    ] || []).length > 0
  )
)

const availableServices = computed<BookingService[]>(() =>
  servicesConfig[input.airport]?.[
  input.journey as BookingJourney
  ] || []
)

const selectedServices = computed(() =>
  availableServices.value.filter(item =>
    input.services.includes(item.slug)
  )
)

watch(
  () => input.airport,
  () => {
    if (
      !availableJourneys.value.some(
        item => item.slug === input.journey
      )
    ) {
      input.journey =
        availableJourneys.value[0]?.slug || ''
    }
    input.services = []
  },
  { immediate: true }
)

watch(
  () => input.journey,
  () => {
    input.services = []
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
// URL PRE-FILL
// ------------------------------------------

const dateQ = String(route.query.date || '')

if (/^\d{4}-\d{2}-\d{2}$/.test(dateQ)) {
  if (input.journey === 'departure') {
    input.departureDate = dateQ
  } else {
    input.arrivalDate = dateQ
  }
}

// ------------------------------------------
// EXISTING SUPPLIER API PAYLOAD
// ------------------------------------------

const payload = computed(() => ({
  airport_name: travelName.value,
  airport_name_id: selectAirport(input.airport).id,

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

  uaa_url: 'UK Airport Assistance',

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
  if (sending.value || submitted.value) return

  if (
    !input.firstName.trim() ||
    !input.lastName.trim() ||
    !input.email.trim()
  ) {
    error.value = 'Please complete passenger details.'
    return
  }

  if (!selectAirport(input.airport).id) {
    error.value =
      'The selected airport needs a configured supplier ID.'
    return
  }

  if (
    !availableJourneys.value.some(
      item => item.slug === input.journey
    )
  ) {
    error.value =
      'Please select an available service type.'
    return
  }

  if (!input.services.length) {
    error.value =
      'Please select at least one service.'
    return
  }

  if (
    selectedServices.value.length !==
    new Set(input.services).size
  ) {
    error.value =
      'One or more selected services are invalid.'
    return
  }

  if (
    selectedServices.value.some(item => !item.id)
  ) {
    error.value =
      'A selected service is missing its supplier ID. Configure it in bookingServices.json.'
    return
  }

  if (!input.travelClass) {
    error.value =
      'Please select your class of travel.'
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
    error.value =
      'Please enter valid passenger and luggage counts.'
    return
  }

  if (!input.communication.length) {
    error.value =
      'Please select at least one contact method.'
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
    error.value =
      'Complete all required arrival flight fields.'
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
    error.value =
      'Complete all required departure flight fields.'
    return
  }

  const phoneDigits = fullMobile.value.replace(/\D/g, '')

  if (!/^\d{8,15}$/.test(phoneDigits)) {
    error.value =
      'Please enter a valid phone number with country code.'
    return
  }

  sending.value = true

  try {
    const result = await $fetch<{
      success: boolean
      message?: string
    }>('/api/booking', {
      method: 'POST',
      body: payload.value
    })

    if (result.success) {
      submitted.value = true
    } else {
      error.value =
        result.message ||
        'Booking request could not be submitted.'
    }
  } catch (err: any) {
    error.value =
      err?.data?.statusMessage ||
      err?.data?.message ||
      'Unable to submit your request. Please try again.'
  } finally {
    sending.value = false
  }
}
</script>

<template>
  <form class="full-booking reference-booking" @submit.prevent="submit">
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

      <label class="premium-field">
        <span>Airport *</span>
        <select v-model="input.airport" required>
          <option v-for="airport in airportsCatalog" :key="airport.slug" :value="airport.slug">
            {{ airport.name }} ({{ airport.code }})
          </option>
        </select>
      </label>

      <div class="premium-field">
        <label for="booking-phone">Phone / Mobile *</label>

        <div class="phone-input-group">
          <div ref="countryDropdownRef" class="country-dropdown" @keydown.esc="countryOpen = false">
            <button type="button" class="country-trigger" aria-label="Choose calling code" :aria-expanded="countryOpen"
              @click="countryOpen = !countryOpen">
              <span>{{ selectedDialCode }}</span>
              <span class="country-chevron">⌄</span>
            </button>

            <div v-if="countryOpen" class="country-dropdown-menu">
              <input v-model="countrySearch" type="search" class="country-search"
                placeholder="Search country or code" />

              <div class="country-options">
                <button v-for="country in filteredCountries" :key="country.code" type="button" class="country-option"
                  @click="chooseCountry(country.code)">
                  <span>{{ country.name }}</span>
                  <span>{{ country.dial_code }}</span>
                </button>
              </div>
            </div>
          </div>

          <input id="booking-phone" v-model="input.mobile" type="tel" inputmode="tel" autocomplete="tel-national"
            placeholder="Mobile Number" required />
        </div>
      </div>

      <label class="premium-field">
        <span>Service Type *</span>
        <select v-model="input.journey" :disabled="!availableJourneys.length" required>
          <option value="" disabled>- Select -</option>

          <option v-for="type in availableJourneys" :key="type.slug" :value="type.slug">
            {{ type.name }}
          </option>
        </select>
      </label>
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
        <input v-model="input.arrivalDate" type="date" required />
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
        <input v-model="input.departureDate" type="date" required />
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
          <button type="button" class="reference-services-trigger" :disabled="!availableServices.length"
            :aria-expanded="servicesOpen" aria-labelledby="booking-services-label"
            @click="servicesOpen = !servicesOpen">
            <span>
              {{
                selectedServices.length
                  ? `${selectedServices.length} services selected`
                  : availableServices.length
                    ? 'Select services'
                    : 'No services configured'
              }}
            </span>

            <span aria-hidden="true">⌄</span>
          </button>

          <div v-if="servicesOpen" class="reference-services-menu">
            <input v-model="serviceSearch" type="search" placeholder="Search services..."
              aria-label="Search services" />

            <div class="reference-services-options">
              <label v-for="item in filteredServices" :key="item.slug" class="reference-services-option">
                <input type="checkbox" :checked="input.services.includes(item.slug)"
                  @change="toggleService(item.slug)" />

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

      <label class="premium-field">
        <span>Class of Travel *</span>
        <select v-model="input.travelClass" required>
          <option value="" disabled>- Select -</option>

          <option v-for="travelClass in [...classes].reverse()" :key="travelClass.id" :value="travelClass.id">
            {{ travelClass.name }}
          </option>
        </select>
      </label>

      <label class="premium-field">
        <span>No of Adults (Above 12 years) *</span>
        <input v-model.number="input.adults" type="number" min="1" max="100" required />
      </label>

      <label class="premium-field">
        <span>No of Children (2–12 years)</span>
        <input v-model.number="input.children" type="number" min="0" max="100" />
      </label>

      <label class="premium-field">
        <span>No of Infants (0–2 years)</span>
        <input v-model.number="input.infants" type="number" min="0" max="100" />
      </label>

      <label class="premium-field">
        <span>No of Luggages *</span>
        <input v-model.number="input.luggages" type="number" min="0" max="100" required />
      </label>
    </div>

    <div class="reference-communication">
      <p>
        Please select mode of communication methods *
      </p>

      <div class="reference-communication-options">
        <label v-for="method in communicationMethods" :key="method" class="checkbox-choice">
          <input type="checkbox" :checked="input.communication.includes(method)"
            @change="toggleCommunication(method)" />

          <span>{{ method }}</span>
        </label>
      </div>
    </div>

    <p class="subtle-note">
      Availability and services are subject to supplier
      confirmation. Submitting this form does not
      constitute a confirmed booking.
    </p>

    <label class="checkbox-choice consent">
      <input type="checkbox" required />

      <span>
        I agree to be contacted and have read the
        <NuxtLink to="/privacy">privacy policy</NuxtLink>.
      </span>
    </label>

    <p v-if="error" class="form-error" role="alert">
      {{ error }}
    </p>

    <p v-if="submitted" class="form-success" role="status">
      Your request has been received by the configured API.
      Please await confirmation.
    </p>

    <button type="submit" class="premium-submit reference-book-button" :disabled="sending || submitted">
      {{
        sending
          ? 'SUBMITTING...'
          : submitted
            ? 'REQUEST SUBMITTED'
            : 'BOOK NOW'
      }}
    </button>

    <button type="button" class="payload-toggle" @click="payloadPreview = !payloadPreview">
      {{ payloadPreview ? 'Hide' : 'View' }}
      API payload preview
    </button>

    <pre v-if="payloadPreview" class="payload-preview">{{ JSON.stringify(payload, null, 2) }}</pre>
  </form>
</template>
