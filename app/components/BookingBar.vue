
<script setup lang="ts">
import { ArrowUpRight } from 'lucide-vue-next'
import { airportsCatalog, journeyTypes, selectAirport } from '~/data/booking'

const airport = ref('heathrow')
const service = ref('arrival')
const date = ref('')
const adults = ref(1)

const availableServices = computed(() => {
  const selected = selectAirport(airport.value)
  return journeyTypes.filter(item =>
    (selected.types as readonly string[]).includes(item.slug)
  )
})

watch(airport, () => {
  if (!availableServices.value.some(x => x.slug === service.value)) {
    service.value = availableServices.value[0]?.slug ?? 'arrival'
  }
})

function continueBooking() {
  return navigateTo({
    path: '/book',
    query: {
      airport: airport.value,
      service: service.value,
      date: date.value,
      adults: String(adults.value)
    }
  })
}
</script>

<template>
  <form
    id="book"
    class="uaa-quick-booking"
    @submit.prevent="continueBooking"
  >
    <div class="uaa-quick-header">
      <div>
        <span class="micro-label">YOUR JOURNEY BEGINS HERE</span>
        <h3>Reserve Your <em>Experience.</em></h3>
      </div>

      <p>
        Tell us where you're travelling.
        We'll take care of the finer details.
      </p>
    </div>

    <div class="uaa-quick-grid">
      <div class="premium-field">
        <span>Choose Airport *</span>
        <AirportSearchSelect
          v-model="airport"
          size="large"
          placeholder="Search airport or code..."
        />
      </div>

      <label class="premium-field">
        <span>Service Type *</span>
        <select v-model="service" required>
          <option
            v-for="item in availableServices"
            :key="item.slug"
            :value="item.slug"
          >
            {{ item.name }}
          </option>
        </select>
      </label>

      <label class="premium-field">
        <span>Travel Date *</span>
        <input
          v-model="date"
          type="date"
          required
        />
      </label>

      <label class="premium-field">
        <span>Number of Adults *</span>
        <input
          v-model.number="adults"
          type="number"
          min="1"
          max="30"
          required
        />
      </label>
    </div>

    <div class="uaa-quick-bottom">
      <span>
        Private assistance. Exceptional attention.
        A journey tailored to you.
      </span>

      <button type="submit" class="uaa-quick-button">
        Continue to Booking
        <ArrowUpRight :size="19" />
      </button>
    </div>
  </form>
</template>
