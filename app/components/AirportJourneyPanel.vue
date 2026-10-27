<script setup lang="ts">
import { selectAirport, journeyTypes } from '~/data/booking'

import {
    getServicePackages,
    getSelectedServicePackages,
    getTerminalDetails,
    type TerminalSlug
} from '~/data/terminalServices'

const props = withDefaults(
    defineProps<{
        initialAirport?: string
    }>(),
    {
        initialAirport: 'heathrow'
    }
)

// Selections
const airport = ref(props.initialAirport)
const terminal = ref<TerminalSlug>('normal')
const service = ref('arrival')
const packageSlugs = ref<string[]>([])
const extras = ref<string[]>([])

// Selected airport
const selected = computed(() =>
    selectAirport(airport.value)
)

// Active journey type
const activeJourneyType = computed(() =>
    journeyTypes.find(t => t.slug === service.value) || { name: 'VIP Arrival', slug: 'arrival' }
)

// Selected terminal
const selectedTerminal = computed(() =>
    getTerminalDetails(
        airport.value,
        terminal.value
    )
)

// Keep only valid packages if airport, terminal, or service changes
watch(
    [() => airport.value, () => terminal.value, () => service.value],
    () => {
        const available = getServicePackages(
            airport.value,
            terminal.value,
            service.value
        )
        packageSlugs.value = packageSlugs.value.filter(slug =>
            available.some(p => p.slug === slug)
        )
    }
)

// Multiple selected packages
const selectedPackages = computed(() =>
    getSelectedServicePackages(
        airport.value,
        terminal.value,
        service.value,
        packageSlugs.value
    )
)

function cleanServiceName(title: string): string {
    if (!title) return ''
    return title.replace(/^[A-Z]{2,4}\s*[-–—:]?\s*/i, '').trim()
}

// Carry selections to booking form
function proceed() {
    if (!selectedPackages.value.length) return

    return navigateTo({
        path: '/book',
        query: {
            airport: airport.value,
            terminal: terminal.value,
            service: service.value,
            packages: packageSlugs.value.join(','),
            extras: extras.value.join(',')
        }
    })
}
</script>

<template>
    <div class="journey-panel airport-journey-compact">

        <!-- LEFT: Airport, terminal, journey and packages -->
        <div class="journey-panel-selection">
            <AirportServices v-model:airport="airport" v-model:terminal="terminal" v-model:service="service"
                v-model:packageSlugs="packageSlugs" v-model:extras="extras" :show-extras="true" :hide-details="true" />
        </div>

        <!-- RIGHT: Selected services -->
        <aside class="journey-panel-summary">
            <div class="journey-services-provided-heading">
                <span class="luxe-kicker">SERVICES PROVIDED</span>
                <h3>{{ activeJourneyType.name }}</h3>
                <p class="journey-hub-sub">
                    {{ selected.name }} ({{ selected.code }}) · {{ selectedTerminal?.label }}
                </p>
            </div>

            <template v-if="selectedPackages.length">

                <p class="subtle-note">
                    {{ selectedTerminal?.label }} ·
                    {{ selectedPackages.length }}
                    {{ selectedPackages.length === 1
                        ? 'service selected'
                        : 'services selected' }}
                </p>

                <!-- Every selected service appears separately -->
                <div v-for="item in selectedPackages" :key="item.slug" class="journey-selected-service">
                    <h4>{{ cleanServiceName(item.title) }}</h4>

                    <ul>
                        <li v-for="(inclusion, index) in item.inclusions" :key="index">
                            {{ inclusion }}
                        </li>
                    </ul>

                    <p v-if="item.additionalService" class="journey-additional-service">
                        <strong>Additional Service:</strong>
                        {{ item.additionalService }}
                    </p>

                    <div class="journey-quote-badge">
                        Will be confirmed on quote
                    </div>
                </div>

                <p class="subtle-note journey-supplier-note">
                    Final pricing and service availability are subject
                    to supplier confirmation.
                </p>

            </template>

            <div v-else class="journey-no-packages-box">
                <p class="journey-no-packages-title">No service package selected</p>
                <p class="subtle-note">
                    Please select at least 1 service package from the dropdown to view its inclusions and continue to booking.
                </p>
            </div>

            <div class="journey-submit-wrapper">
                <button
                    type="button"
                    class="premium-submit"
                    :disabled="!selectedPackages.length"
                    :class="{ 'is-disabled': !selectedPackages.length }"
                    @click="proceed"
                >
                    Continue to booking →
                </button>
                <p v-if="!selectedPackages.length" class="mandatory-package-notice">
                    * Minimum 1 service package is mandatory to proceed
                </p>
            </div>
        </aside>

    </div>
</template>

<style scoped>
.journey-panel-summary {
  padding: 0 0 0 24px;
}

.journey-services-provided-heading {
  margin-bottom: 14px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e7ded2;
}

.journey-services-provided-heading > h3 {
  margin: 4px 0 4px;
  font-family: "Playfair Display", Georgia, serif;
  font-size: clamp(22px, 2.4vw, 26px);
  font-weight: 500;
  color: #182a40;
  line-height: 1.2;
}

.journey-hub-sub {
  font-size: 12px;
  color: #77746d;
  margin: 0;
  font-weight: 500;
}

.subtle-note {
  font-size: 11px;
  color: #77746d;
  margin: 0 0 10px;
  line-height: 1.4;
}

/* Compact details card per selected package */
.journey-selected-service {
  margin: 0 0 10px;
  padding: 10px 12px;
  background: #faf7f2;
  border: 1px solid #e7ded2;
  border-radius: 6px;
  box-sizing: border-box;
}

.journey-selected-service h4 {
  margin: 0 0 6px;
  font-family: inherit;
  font-size: 13.5px;
  font-weight: 600;
  line-height: 1.3;
  color: #182a40;
}

.journey-selected-service ul {
  padding-left: 15px;
  margin: 0 0 6px;
}

.journey-selected-service li {
  padding-left: 2px;
  margin-bottom: 3px;
  color: #5c5952;
  font-size: 11px;
  line-height: 1.4;
}

.journey-selected-service li::marker {
  color: #b18b65;
  font-size: 9px;
}

.journey-additional-service {
  padding: 5px 0 0;
  margin-top: 5px;
  border-top: 1px dashed #dcd5ca;
  color: #6f6b64;
  font-size: 10.5px;
  line-height: 1.35;
}

/* Quote badge replacing price */
.journey-quote-badge {
  display: inline-block;
  margin-top: 8px;
  padding: 3px 10px;
  background: #f0ebe2;
  border: 1px solid #d8cfc3;
  border-radius: 999px;
  font-size: 10.5px;
  font-weight: 600;
  color: #7a5c3a;
  letter-spacing: 0.01em;
}

/* Supplier note */
.journey-supplier-note {
  margin-top: 6px;
  margin-bottom: 6px;
  padding: 7px 10px;
  background: #faf7f2;
  border: 1px solid #e7ded2;
  border-radius: 5px;
}

/* Submit button */
.premium-submit {
  width: 100%;
  height: 44px;
  min-height: 44px;
  margin-top: 6px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.04em;
  padding: 0 18px;
  transition: opacity 0.2s ease, filter 0.2s ease;
}

.premium-submit:disabled,
.premium-submit.is-disabled {
  opacity: 0.45;
  cursor: not-allowed;
  filter: grayscale(0.4);
  box-shadow: none;
}

.journey-submit-wrapper {
  margin-top: 4px;
}

.journey-no-packages-box {
  padding: 18px 14px;
  background: #faf7f2;
  border: 1px dashed #dcd5ca;
  border-radius: 6px;
  margin: 0 0 14px;
  text-align: center;
}

.journey-no-packages-title {
  margin: 0 0 6px;
  font-size: 13px;
  font-weight: 600;
  color: #182a40;
}

.mandatory-package-notice {
  margin: 8px 0 0;
  font-size: 11.5px;
  font-weight: 600;
  color: #a34848;
  text-align: center;
  letter-spacing: 0.01em;
}
</style>
