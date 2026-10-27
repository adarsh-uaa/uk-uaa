
<script setup lang="ts">
import { ArrowUpRight, Check } from 'lucide-vue-next'
import {
  journeyTypes,
  extrasCatalog,
  selectAirport
} from '~/data/booking'
import { getServicePackages } from '~/data/terminalServices'

const props = defineProps<{
  airport: string
}>()

const selectedService = ref('')
const selectedExtras = ref<string[]>([])

const currentAirport = computed(() => selectAirport(props.airport))

const availableServices = computed(() =>
  journeyTypes.filter(service =>
    (currentAirport.value.types as readonly string[])
      .includes(service.slug)
  )
)

const activeServiceObj = computed(() =>
  availableServices.value.find(s => s.slug === selectedService.value) || availableServices.value[0]
)

const activePackages = computed(() =>
  getServicePackages(props.airport, 'normal', selectedService.value)
)

function cleanServiceName(title: string): string {
  if (!title) return ''
  return title.replace(/^[A-Z]{2,4}\s*[-–—:]?\s*/i, '').trim()
}

const availableExtras = computed(() =>
  extrasCatalog.filter(extra =>
    ((currentAirport.value.extras || []) as readonly string[])
      .includes(extra.slug)
  )
)

watch(
  () => props.airport,
  () => {
    selectedService.value = availableServices.value[0]?.slug ?? ''
    selectedExtras.value = []
  },
  { immediate: true }
)

function toggleExtra(slug: string) {
  selectedExtras.value = selectedExtras.value.includes(slug)
    ? selectedExtras.value.filter(x => x !== slug)
    : [...selectedExtras.value, slug]
}

function continueBooking() {
  return navigateTo({
    path: '/book',
    query: {
      airport: props.airport,
      service: selectedService.value,
      extras: selectedExtras.value.join(',')
    }
  })
}
</script>

<template>
  <div class="uaa-inline-services">
    <div class="uaa-inline-top">
      <span class="micro-label">AVAILABLE AT {{ currentAirport.code }}</span>
      <p>
        Personalise your experience at
        {{ currentAirport.name }}.
      </p>
    </div>

    <div class="uaa-inline-label">SERVICES PROVIDED: SELECT JOURNEY</div>

    <div class="uaa-inline-types">
      <button
        v-for="item in availableServices"
        :key="item.slug"
        type="button"
        :class="{ active: selectedService === item.slug }"
        @click="selectedService = item.slug"
      >
        <span>{{ item.name }}</span>
        <Check v-if="selectedService === item.slug" :size="15" />
      </button>
    </div>

    <!-- Dynamic heading showing the services provided e.g. VIP Arrival / Departure -->
    <div v-if="activeServiceObj" class="uaa-service-heading-box">
      <div class="uaa-service-heading-kicker">SERVICES PROVIDED</div>
      <h4 class="uaa-service-heading-title">{{ activeServiceObj.name }}</h4>
      <span class="uaa-service-heading-sub">{{ currentAirport.name }} ({{ currentAirport.code }})</span>
    </div>

    <!-- Package list with details & cost -->
    <div v-if="activePackages.length" class="uaa-inline-pkg-list">
      <div v-for="pkg in activePackages" :key="pkg.slug" class="uaa-inline-pkg-item">
        <div class="uaa-inline-pkg-top">
          <div class="uaa-inline-pkg-title">
            <Check :size="14" class="uaa-pkg-check-icon" />
            <strong>{{ cleanServiceName(pkg.title) }}</strong>
          </div>
          <span v-if="pkg.price && pkg.price.amount > 0" class="uaa-inline-pkg-cost">
            {{ pkg.price.currency === 'USD' ? '$' : '£' }}{{ pkg.price.amount }}
          </span>
          <span v-else-if="pkg.price" class="uaa-inline-pkg-cost">
            On request
          </span>
        </div>
        <p v-if="pkg.inclusions && pkg.inclusions[0]" class="uaa-inline-pkg-desc">
          {{ pkg.inclusions[0] }}
        </p>
      </div>
    </div>

    <div v-if="availableExtras.length">
      <div class="uaa-inline-label">ENHANCE YOUR EXPERIENCE</div>

      <div class="uaa-inline-extras">
        <label
          v-for="extra in availableExtras"
          :key="extra.slug"
          class="uaa-inline-extra"
        >
          <input
            type="checkbox"
            :checked="selectedExtras.includes(extra.slug)"
            @change="toggleExtra(extra.slug)"
          />

          <span>{{ extra.name }}</span>
        </label>
      </div>
    </div>

    <p class="uaa-inline-note">
      Available arrangements depend on airport, terminal,
      and supplier confirmation.
    </p>

    <button
      type="button"
      class="uaa-inline-continue"
      :disabled="!selectedService"
      @click="continueBooking"
    >
      Continue to Booking
      <ArrowUpRight :size="17" />
    </button>
  </div>
</template>

<style scoped>
.uaa-service-heading-box {
  margin: 16px 0 10px;
  padding: 10px 14px;
  background: #182a40;
  border-radius: 4px;
  color: #fff;
  border-left: 3px solid #c9a86a;
}

.uaa-service-heading-kicker {
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.16em;
  color: #c9a86a;
  text-transform: uppercase;
}

.uaa-service-heading-title {
  font-family: "Playfair Display", Georgia, serif;
  font-size: 16px;
  font-weight: 600;
  margin: 3px 0 2px;
  color: #f7f3ec;
  letter-spacing: 0.02em;
}

.uaa-service-heading-sub {
  font-size: 11px;
  color: #b5c2d3;
}

.uaa-inline-pkg-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin: 10px 0 16px;
}

.uaa-inline-pkg-item {
  background: #fff;
  border: 1px solid #e5ded3;
  border-radius: 4px;
  padding: 10px 12px;
  transition: border-color 0.2s ease;
}

.uaa-inline-pkg-item:hover {
  border-color: #c9a86a;
}

.uaa-inline-pkg-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.uaa-inline-pkg-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #182a40;
}

.uaa-pkg-check-icon {
  color: #c9a86a;
  flex-shrink: 0;
}

.uaa-inline-pkg-cost {
  font-size: 13px;
  font-weight: 700;
  color: #182a40;
  background: #fbf8f3;
  padding: 2px 7px;
  border-radius: 3px;
  border: 1px solid #ebe4d8;
  white-space: nowrap;
}

.uaa-inline-pkg-desc {
  font-size: 11px;
  color: #6d6961;
  margin: 5px 0 0 22px;
  line-height: 1.4;
}
</style>
