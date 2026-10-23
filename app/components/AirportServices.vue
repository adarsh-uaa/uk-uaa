<script setup lang="ts">
import {
    airportsCatalog,
    journeyTypes,
    extrasCatalog,
    selectAirport
} from '~/data/booking'

import {
    getAirportTerminals,
    getTerminalDetails,
    getServicePackages,
    type TerminalSlug
} from '~/data/terminalServices'

const props = withDefaults(defineProps<{
    hideDetails?: boolean
    airport: string
    terminal?: TerminalSlug
    service: string
    packageSlug?: string
    extras: string[]
    showExtras?: boolean
}>(), {
    terminal: 'normal',
    packageSlug: '',
    showExtras: false
})

const emit = defineEmits<{
    'update:airport': [value: string]
    'update:terminal': [value: TerminalSlug]
    'update:service': [value: string]
    'update:packageSlug': [value: string]
    'update:extras': [value: string[]]
}>()

const current = computed(() =>
    selectAirport(props.airport)
)

const terminals = computed(() =>
    getAirportTerminals(props.airport)
)

const terminalOptions = computed(() => {
    const options: {
        slug: TerminalSlug
        label: string
    }[] = [
            {
                slug: 'normal',
                label: terminals.value.normal.label
            }
        ]

    const vip = terminals.value.vip

    if (
        vip &&
        Object.values(vip.services).some(
            items => items && items.length > 0
        )
    ) {
        options.push({
            slug: 'vip',
            label: vip.label
        })
    }

    return options
})

const activeTerminal = computed<TerminalSlug>(() =>
    terminalOptions.value.some(
        item => item.slug === props.terminal
    )
        ? props.terminal
        : 'normal'
)

const terminalConfig = computed(() =>
    getTerminalDetails(
        props.airport,
        activeTerminal.value
    )
)

const availableTypes = computed(() => {
    const types = current.value.types as readonly string[]

    if (activeTerminal.value === 'vip') {
        return journeyTypes.filter(type =>
            getServicePackages(
                props.airport,
                'vip',
                type.slug
            ).length > 0
        )
    }

    return journeyTypes.filter(type =>
        types.includes(type.slug)
    )
})

const activeService = computed(() =>
    availableTypes.value.some(
        item => item.slug === props.service
    )
        ? props.service
        : availableTypes.value[0]?.slug || ''
)

const packages = computed(() =>
    getServicePackages(
        props.airport,
        activeTerminal.value,
        activeService.value
    )
)

const selectedPackageSlug = computed(() =>
    packages.value.some(
        item => item.slug === props.packageSlug
    )
        ? props.packageSlug
        : packages.value[0]?.slug || ''
)

const selectedPackage = computed(() =>
    packages.value.find(
        item => item.slug === selectedPackageSlug.value
    )
)

const availableExtras = computed(() =>
    extrasCatalog.filter(extra =>
        (current.value.extras as readonly string[])
            .includes(extra.slug)
    )
)

watch(
    [
        () => props.airport,
        () => props.terminal,
        () => props.service,
        () => props.packageSlug
    ],
    () => {
        if (props.terminal !== activeTerminal.value) {
            emit('update:terminal', activeTerminal.value)
        }

        if (props.service !== activeService.value) {
            emit('update:service', activeService.value)
        }

        if (props.packageSlug !== selectedPackageSlug.value) {
            emit('update:packageSlug', selectedPackageSlug.value)
        }

        const allowed = props.extras.filter(slug =>
            availableExtras.value.some(item => item.slug === slug)
        )

        if (allowed.length !== props.extras.length) {
            emit('update:extras', allowed)
        }
    },
    { immediate: true }
)

function changeAirport(event: Event) {
    emit(
        'update:airport',
        (event.target as HTMLSelectElement).value
    )
    emit('update:terminal', 'normal')
    emit('update:packageSlug', '')
    emit('update:extras', [])
}

function changeTerminal(event: Event) {
    emit(
        'update:terminal',
        (event.target as HTMLSelectElement).value as TerminalSlug
    )
    emit('update:packageSlug', '')
    emit('update:extras', [])
}

function changeService(event: Event) {
    emit(
        'update:service',
        (event.target as HTMLSelectElement).value
    )
    emit('update:packageSlug', '')
    emit('update:extras', [])
}

function toggleExtra(slug: string, checked: boolean) {
    emit(
        'update:extras',
        checked
            ? [...new Set([...props.extras, slug])]
            : props.extras.filter(item => item !== slug)
    )
}

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
</script>

<template>
    <div class="airport-service-selector">

        <div class="linked-fields">

            <label class="premium-field">
                <span>Airport *</span>

                <select :value="airport" required @change="changeAirport">
                    <option v-for="item in airportsCatalog" :key="item.slug" :value="item.slug">
                        {{ item.name }} ({{ item.code }})
                    </option>
                </select>
            </label>

            <label class="premium-field">
                <span>Terminal Type *</span>

                <select :value="activeTerminal" required @change="changeTerminal">
                    <option v-for="item in terminalOptions" :key="item.slug" :value="item.slug">
                        {{ item.label }}
                    </option>
                </select>
            </label>

            <label class="premium-field">
                <span>Journey Type *</span>

                <select :value="activeService" :disabled="!availableTypes.length" required @change="changeService">
                    <option v-for="item in availableTypes" :key="item.slug" :value="item.slug">
                        {{ item.name }}
                    </option>
                </select>
            </label>

        </div>

        <section v-if="packages.length" class="terminal-packages" aria-label="Available service packages">
            <div class="terminal-packages-heading">
                <span class="micro-label">
                    AVAILABLE SERVICES
                </span>

                <h3>Choose your preferred service</h3>

                <p>
                    Select a package to view its inclusions
                    and available pricing.
                </p>
            </div>

            <div class="terminal-package-grid">
                <button v-for="item in packages" :key="item.slug" type="button" class="terminal-package-card" :class="{
                    'is-selected': selectedPackageSlug === item.slug
                }" :aria-pressed="selectedPackageSlug === item.slug" @click="emit('update:packageSlug', item.slug)">
                    <span class="terminal-package-status">
                        {{ selectedPackageSlug === item.slug
                            ? 'SELECTED'
                            : 'VIEW SERVICE' }}
                    </span>

                    <strong>{{ item.title }}</strong>

                    <span class="terminal-package-info">
                        {{ item.inclusions.length }}
                        service inclusions
                    </span>

                    <span class="terminal-package-price">
                        <template v-if="item.price">
                            {{ formatPrice(
                                item.price.amount,
                                item.price.currency
                            ) }}
                            <small>
                                Up to {{ item.price.upToPassengers }}
                                passengers
                            </small>
                        </template>

                        <template v-else>
                            Price on request
                        </template>
                    </span>

                    <span class="terminal-package-select">
                        {{ selectedPackageSlug === item.slug
                            ? '✓ Selected'
                            : 'Select package →' }}
                    </span>
                </button>
            </div>

            <div v-if="selectedPackage && !hideDetails" class="terminal-service-details">
                <span class="micro-label">
                    {{ terminalConfig?.label }}
                    / {{ current.code }}
                </span>

                <h3>{{ selectedPackage.title }}</h3>

                <ul>
                    <li v-for="(item, index) in selectedPackage.inclusions" :key="index">
                        {{ item }}
                    </li>
                </ul>

                <p v-if="selectedPackage.additionalService">
                    <strong>Additional Service:</strong>
                    {{ selectedPackage.additionalService }}
                </p>

                <p v-if="selectedPackage.price" class="terminal-service-price">
                    {{ selectedPackage.price.data }}
                    <strong>
                        {{ formatPrice(
                            selectedPackage.price.amount,
                            selectedPackage.price.currency
                        ) }}
                    </strong>
                </p>
            </div>
        </section>

        <p v-else class="subtle-note terminal-service-pending">
            Detailed packages and pricing for this
            journey are available on request,
            subject to supplier confirmation.
        </p>

        <!-- <div v-if="showExtras && availableExtras.length" class="optional-services">
            <p class="micro-label">
                AVAILABLE ADD-ONS FOR {{ current.code }}
            </p>

            <p class="subtle-note">
                Add-on availability depends on the selected
                airport, terminal and service.
            </p>

            <div class="choice-grid">
                <label v-for="extra in availableExtras" :key="extra.slug" class="checkbox-choice">
                    <input type="checkbox" :checked="extras.includes(extra.slug)" @change="toggleExtra(
                        extra.slug,
                        ($event.target as HTMLInputElement).checked
                    )" />

                    {{ extra.name }}
                </label>
            </div>
        </div> -->
    </div>
</template>