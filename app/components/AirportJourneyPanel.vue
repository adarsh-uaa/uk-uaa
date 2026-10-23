<script setup lang="ts">
import { selectAirport } from '~/data/booking'

import {
    getServiceDetails,
    getTerminalDetails,
    type TerminalSlug
} from '~/data/terminalServices'

const props = withDefaults(
    defineProps<{ initialAirport?: string }>(),
    { initialAirport: 'heathrow' }
)

const airport = ref(props.initialAirport)
const terminal = ref<TerminalSlug>('normal')
const service = ref('arrival')
const packageSlug = ref('')
const extras = ref<string[]>([])

const selected = computed(() =>
    selectAirport(airport.value)
)

const selectedPackage = computed(() =>
    getServiceDetails(
        airport.value,
        terminal.value,
        service.value,
        packageSlug.value
    )
)

const selectedTerminal = computed(() =>
    getTerminalDetails(airport.value, terminal.value)
)

function formatPrice(amount: number, currency: string) {
    return new Intl.NumberFormat('en-GB', {
        style: 'currency',
        currency,
        maximumFractionDigits: 0
    }).format(amount)
}

function proceed() {
    return navigateTo({
        path: '/book',
        query: {
            airport: airport.value,
            terminal: terminal.value,
            service: service.value,
            package: packageSlug.value,
            extras: extras.value.join(',')
        }
    })
}
</script>

<template>
    <div class="journey-panel airport-journey-compact">

        <!-- LEFT: Airport, terminal, journey and service cards -->
        <div class="journey-panel-selection">
            <AirportServices v-model:airport="airport" v-model:terminal="terminal" v-model:service="service"
                v-model:packageSlug="packageSlug" v-model:extras="extras" :show-extras="true" :hide-details="true" />
        </div>

        <!-- RIGHT: Selected service details -->
        <aside class="journey-panel-summary">
            <span class="luxe-kicker">
                YOUR AIRPORT EXPERIENCE
            </span>

            <h3>{{ selected.name }}</h3>

            <template v-if="selectedPackage">
                <div class="journey-selected-service">
                    <span class="micro-label">
                        {{ selectedTerminal?.label }}
                    </span>

                    <h4>{{ selectedPackage.title }}</h4>

                    <ul>
                        <li v-for="(item, index) in selectedPackage.inclusions" :key="index">
                            {{ item }}
                        </li>
                    </ul>

                    <p v-if="selectedPackage.additionalService" class="journey-additional-service">
                        <strong>Additional Service:</strong>
                        {{ selectedPackage.additionalService }}
                    </p>

                    <div v-if="selectedPackage.price" class="journey-selected-price">
                        <span>
                            {{ selectedPackage.price.data }}
                        </span>

                        <strong>
                            {{ formatPrice(
                                selectedPackage.price.amount,
                                selectedPackage.price.currency
                            ) }}
                        </strong>
                    </div>

                    <p v-else class="subtle-note">
                        Pricing available on request.
                    </p>
                </div>
            </template>

            <p v-else class="subtle-note">
                Select a service package to view its
                details and available pricing.
            </p>

            <button type="button" class="premium-submit" :disabled="!selectedPackage" @click="proceed">
                Continue to booking →
            </button>
        </aside>

    </div>
</template>
