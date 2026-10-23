<script setup lang="ts">
import {
    airportsCatalog,
    journeyTypes,
    extrasCatalog,
    selectAirport
} from "~/data/booking";

import {
    getAirportTerminals,
    getServicePackages,
    getSelectedServicePackages,
    type TerminalSlug
} from "~/data/terminalServices";

const props = withDefaults(
    defineProps<{
        airport: string;
        terminal?: TerminalSlug;
        service: string;
        packageSlugs?: string[];
        extras: string[];
        showExtras?: boolean;
        hideDetails?: boolean;
    }>(),
    {
        terminal: "normal",
        packageSlugs: () => [],
        showExtras: false,
        hideDetails: false
    }
);

const emit = defineEmits<{
    "update:airport": [value: string];
    "update:terminal": [value: TerminalSlug];
    "update:service": [value: string];
    "update:packageSlugs": [value: string[]];
    "update:extras": [value: string[]];
}>();

const dropdownOpen = ref(false);
const search = ref("");
const dropdownRef = ref<HTMLElement | null>(null);

const current = computed(() => selectAirport(props.airport));

const terminals = computed(() =>
    getAirportTerminals(props.airport)
);

const terminalOptions = computed(() => {
    const options: { slug: TerminalSlug; label: string }[] = [
        {
            slug: "normal",
            label: terminals.value.normal.label
        }
    ];

    const vip = terminals.value.vip;

    if (
        vip &&
        Object.values(vip.services).some(
            packages => packages && packages.length > 0
        )
    ) {
        options.push({
            slug: "vip",
            label: vip.label
        });
    }

    return options;
});

const activeTerminal = computed<TerminalSlug>(() =>
    terminalOptions.value.some(
        x => x.slug === props.terminal
    )
        ? props.terminal
        : "normal"
);

const availableTypes = computed(() => {
    if (activeTerminal.value === "vip") {
        return journeyTypes.filter(
            type =>
                getServicePackages(
                    props.airport,
                    "vip",
                    type.slug
                ).length > 0
        );
    }

    const allowed = current.value.types as readonly string[];

    return journeyTypes.filter(
        type => allowed.includes(type.slug)
    );
});

const activeService = computed(() =>
    availableTypes.value.some(
        x => x.slug === props.service
    )
        ? props.service
        : availableTypes.value[0]?.slug ?? ""
);

const packages = computed(() =>
    getServicePackages(
        props.airport,
        activeTerminal.value,
        activeService.value
    )
);

const selectedPackages = computed(() =>
    getSelectedServicePackages(
        props.airport,
        activeTerminal.value,
        activeService.value,
        props.packageSlugs
    )
);

const filteredPackages = computed(() => {
    const q = search.value.trim().toLowerCase();

    return packages.value.filter(
        item =>
            item.title.toLowerCase().includes(q) ||
            item.slug.toLowerCase().includes(q)
    );
});

const availableExtras = computed(() =>
    extrasCatalog.filter(
        item =>
            (current.value.extras as readonly string[])
                .includes(item.slug)
    )
);

watch(
    [
        () => props.airport,
        () => props.terminal,
        () => props.service,
        () => props.packageSlugs,
        () => props.extras
    ],
    () => {
        if (props.terminal !== activeTerminal.value) {
            emit("update:terminal", activeTerminal.value);
        }

        if (props.service !== activeService.value) {
            emit("update:service", activeService.value);
        }

        const allowedPackages = new Set(
            packages.value.map(item => item.slug)
        );

        const validPackages = [
            ...new Set(
                props.packageSlugs.filter(
                    slug => allowedPackages.has(slug)
                )
            )
        ];

        if (
            JSON.stringify(validPackages) !==
            JSON.stringify(props.packageSlugs)
        ) {
            emit("update:packageSlugs", validPackages);
        }

        const allowedExtras = new Set(
            availableExtras.value.map(x => x.slug)
        );

        const validExtras = props.extras.filter(
            slug => allowedExtras.has(slug)
        );

        if (validExtras.length !== props.extras.length) {
            emit("update:extras", validExtras);
        }
    },
    { immediate: true }
);

function changeAirport(event: Event) {
    const value = (event.target as HTMLSelectElement).value;

    emit("update:airport", value);
    emit("update:terminal", "normal");
    emit("update:packageSlugs", []);
    emit("update:extras", []);
}

function changeTerminal(event: Event) {
    emit(
        "update:terminal",
        (event.target as HTMLSelectElement).value as TerminalSlug
    );

    emit("update:packageSlugs", []);
    emit("update:extras", []);
}

function changeService(event: Event) {
    emit(
        "update:service",
        (event.target as HTMLSelectElement).value
    );

    emit("update:packageSlugs", []);
    emit("update:extras", []);
}

function togglePackage(slug: string) {
    const selected = props.packageSlugs.includes(slug);

    emit(
        "update:packageSlugs",
        selected
            ? props.packageSlugs.filter(x => x !== slug)
            : [...props.packageSlugs, slug]
    );
}

function toggleExtra(slug: string, checked: boolean) {
    emit(
        "update:extras",
        checked
            ? [...new Set([...props.extras, slug])]
            : props.extras.filter(x => x !== slug)
    );
}

function handleOutside(event: PointerEvent) {
    if (
        dropdownRef.value &&
        !dropdownRef.value.contains(event.target as Node)
    ) {
        dropdownOpen.value = false;
    }
}

function formatPrice(amount: number, currency: string) {
    return new Intl.NumberFormat("en-GB", {
        style: "currency",
        currency,
        maximumFractionDigits: 0
    }).format(amount);
}

onMounted(() => {
    document.addEventListener("pointerdown", handleOutside);
});

onBeforeUnmount(() => {
    document.removeEventListener("pointerdown", handleOutside);
});
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
                <select :value="activeService" required :disabled="!availableTypes.length" @change="changeService">
                    <option v-for="item in availableTypes" :key="item.slug" :value="item.slug">
                        {{ item.name }}
                    </option>
                </select>
            </label>
        </div>

        <div class="premium-field terminal-multi-field">
            <span>Service Packages</span>

            <div ref="dropdownRef" class="terminal-multi" @keydown.esc="dropdownOpen = false">
                <button type="button" class="terminal-multi-trigger" :aria-expanded="dropdownOpen"
                    aria-controls="terminal-package-options" :disabled="!packages.length"
                    @click="dropdownOpen = !dropdownOpen">
                    <span>
                        {{
                            selectedPackages.length
                                ? `${selectedPackages.length} services selected`
                                : packages.length
                                    ? "Select service packages"
                                    : "No packages configured"
                        }}
                    </span>

                    <span aria-hidden="true">⌄</span>
                </button>

                <div v-if="dropdownOpen" id="terminal-package-options" class="terminal-multi-menu">
                    <input v-model="search" type="search" placeholder="Search services..."
                        aria-label="Search service packages" autocomplete="off" />

                    <div class="terminal-multi-options">
                        <label v-for="item in filteredPackages" :key="item.slug" class="terminal-multi-option">
                            <input type="checkbox" :checked="packageSlugs.includes(item.slug)"
                                @change="togglePackage(item.slug)" />

                            <span>{{ item.title }}</span>
                        </label>

                        <p v-if="!filteredPackages.length" class="subtle-note terminal-multi-empty">
                            No matching services
                        </p>
                    </div>
                </div>
            </div>

            <div v-if="selectedPackages.length" class="terminal-selected-tags">
                <span v-for="item in selectedPackages" :key="item.slug" class="terminal-selected-tag">
                    {{ item.title }}

                    <button type="button" :aria-label="`Remove ${item.title}`" @click="togglePackage(item.slug)">
                        ×
                    </button>
                </span>
            </div>
        </div>

        <div v-if="!hideDetails && selectedPackages.length" class="terminal-selected-details">
            <article v-for="item in selectedPackages" :key="item.slug" class="terminal-service-details">
                <span class="micro-label">
                    {{ current.code }} / {{ activeTerminal }}
                </span>

                <h3>{{ item.title }}</h3>

                <ul>
                    <li v-for="(inclusion, index) in item.inclusions" :key="index">
                        {{ inclusion }}
                    </li>
                </ul>

                <p v-if="item.additionalService">
                    <strong>Additional Service:</strong>
                    {{ item.additionalService }}
                </p>

                <p v-if="item.price" class="terminal-service-price">
                    {{ item.price.data || "Package price:" }}

                    <strong>
                        {{ formatPrice(item.price.amount, item.price.currency) }}
                    </strong>
                </p>
            </article>
        </div>

        <!-- <div v-if="showExtras && availableExtras.length" class="optional-services">
            <p class="micro-label">ADDITIONAL SERVICES</p>

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
