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
                    <h4>{{ item.title }}</h4>

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
