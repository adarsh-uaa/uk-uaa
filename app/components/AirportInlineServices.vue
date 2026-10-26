
<script setup lang="ts">
import { ArrowUpRight, Check } from 'lucide-vue-next'
import {
  journeyTypes,
  extrasCatalog,
  selectAirport
} from '~/data/booking'

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

    <div class="uaa-inline-label">SELECT YOUR JOURNEY</div>

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
