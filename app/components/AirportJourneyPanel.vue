<script setup lang="ts">
import { selectAirport } from '~/data/booking'

import {
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

// Selected terminal
const selectedTerminal = computed(() =>
    getTerminalDetails(
        airport.value,
        terminal.value
    )
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

// Combined package prices by currency
const priceTotals = computed(() => {
    const totals: Record<string, number> = {}

    for (const item of selectedPackages.value) {
        if (item.price) {
            const currency = item.price.currency
            totals[currency] =
                (totals[currency] || 0) + item.price.amount
        }
    }

    return Object.entries(totals).map(
        ([currency, amount]) => ({
            currency,
            amount
        })
    )
})

const hasUnpricedPackages = computed(() =>
    selectedPackages.value.some(item => !item.price)
)

function formatPrice(
    amount: number,
    currency: string
) {
    return new Intl.NumberFormat('en-GB', {
        style: 'currency',
        currency,
        maximumFractionDigits: 0
    }).format(amount)
}

function cleanServiceName(title: string): string {
    if (!title) return ''
    return title.replace(/^[A-Z]{3,4}\s*[-–—:]?\s*/i, '').trim()
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
            <span class="luxe-kicker">
                YOUR AIRPORT EXPERIENCE
            </span>

            <h3>{{ selected.name }}</h3>

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

                    <div v-if="item.price" class="journey-selected-price">
                        <span>
                            {{
                                item.price.data ||
                                (
                                    item.price.upToPassengers
                                        ? `Price up to ${item.price.upToPassengers} passengers:`
                                        : 'Package price:'
                            )
                            }}
                        </span>

                        <strong>
                            {{ formatPrice(
                                item.price.amount,
                                item.price.currency
                            ) }}
                        </strong>
                    </div>

                    <p v-else class="subtle-note">
                        Pricing available on request.
                    </p>
                </div>

                <!-- Total for selected packages -->
                <div v-if="selectedPackages.length > 1 && priceTotals.length"
                    class="journey-selected-price journey-total-price">
                    <span>
                        Listed package prices
                        <small v-if="hasUnpricedPackages">
                            (excludes packages priced on request)
                        </small>
                    </span>

                    <div>
                        <strong v-for="total in priceTotals" :key="total.currency"
                            style="display: block; text-align: right">
                            {{ formatPrice(
                                total.amount,
                                total.currency
                            ) }}
                        </strong>
                    </div>
                </div>

                <p class="subtle-note">
                    Final pricing and service availability are subject
                    to supplier confirmation.
                </p>

            </template>

            <p v-else class="subtle-note">
                Select one or more service packages to view
                their inclusions and available pricing.
            </p>

            <button type="button" class="premium-submit" :disabled="!selectedPackages.length" @click="proceed">
                Continue to booking →
            </button>
        </aside>

    </div>
</template>

<style scoped>
.journey-panel-summary {
  padding: 0 0 0 24px;
}

.journey-panel-summary > h3 {
  margin: 6px 0 8px;
  font-family: "Playfair Display", Georgia, serif;
  font-size: clamp(20px, 2.2vw, 24px);
  font-weight: 400;
  color: #182a40;
  line-height: 1.2;
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

.journey-selected-price {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 6px 0 0;
  margin-top: 6px;
  border-top: 1px solid #e2dbd1;
  border-bottom: none;
}

.journey-selected-price span {
  color: #77746d;
  font-size: 10.5px;
}

.journey-selected-price strong {
  font-size: 14.5px;
  font-weight: 700;
  color: #182a40;
}

/* Total price summary */
.journey-total-price {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  margin: 10px 0 8px;
  background: #ffffff;
  border: 1px solid #ded5c7;
  border-radius: 5px;
}

.journey-total-price span {
  font-size: 11px;
  font-weight: 600;
  color: #182a40;
}

.journey-total-price strong {
  font-size: 16px;
  font-weight: 700;
  color: #622a31;
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
}
</style>
