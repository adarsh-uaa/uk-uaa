<script setup lang="ts">
import { ChevronDown, Search, X } from "lucide-vue-next";
import {
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
const searchInputRef = ref<HTMLInputElement | null>(null);

function cleanServiceName(title: string): string {
    if (!title) return "";
    return title.replace(/^[A-Z]{2,4}\s*[-–—:]?\s*/i, "").trim();
}

function toggleDropdown() {
    dropdownOpen.value = !dropdownOpen.value;
    if (dropdownOpen.value) {
        search.value = "";
        nextTick(() => {
            searchInputRef.value?.focus();
        });
    }
}

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
    // Always show all journey types in the booking form regardless of configured packages
    return [...journeyTypes];
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

const triggerLabel = computed(() => {
    if (!packages.value.length) {
        return "No packages configured";
    }
    if (selectedPackages.value.length === 0) {
        return "Select service packages *";
    }
    if (selectedPackages.value.length === 1) {
        return cleanServiceName(selectedPackages.value[0].title);
    }
    return `${selectedPackages.value.length} selected`;
});

const filteredPackages = computed(() => {
    const q = search.value.trim().toLowerCase();

    return packages.value.filter(
        item =>
            item.title.toLowerCase().includes(q) ||
            cleanServiceName(item.title).toLowerCase().includes(q) ||
            item.slug.toLowerCase().includes(q)
    );
});

const availableExtras = computed(() =>
    extrasCatalog.filter(
        item =>
            ((current.value.extras || []) as readonly string[])
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

function changeAirport(eventOrValue: Event | string) {
    const value = typeof eventOrValue === 'string'
        ? eventOrValue
        : (eventOrValue.target as HTMLSelectElement).value;

    emit("update:airport", value);
    emit("update:terminal", "normal");
    const pkgs = getServicePackages(value, "normal", activeService.value);
    const valid = props.packageSlugs.filter(slug => pkgs.some(p => p.slug === slug));
    emit("update:packageSlugs", valid);
    emit("update:extras", []);
}

function changeTerminal(event: Event) {
    const newTerm = (event.target as HTMLSelectElement).value as TerminalSlug;
    emit("update:terminal", newTerm);
    const pkgs = getServicePackages(props.airport, newTerm, activeService.value);
    const valid = props.packageSlugs.filter(slug => pkgs.some(p => p.slug === slug));
    emit("update:packageSlugs", valid);
    emit("update:extras", []);
}

function changeService(event: Event) {
    const newServ = (event.target as HTMLSelectElement).value;
    emit("update:service", newServ);
    const pkgs = getServicePackages(props.airport, activeTerminal.value, newServ);
    const valid = props.packageSlugs.filter(slug => pkgs.some(p => p.slug === slug));
    emit("update:packageSlugs", valid);
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
        <!-- LINE 1: Airport as one long full-width field -->
        <div class="airport-field-full">
            <span class="field-label">Airport *</span>
            <AirportSearchSelect
                :model-value="airport"
                placeholder="Search airport or code..."
                @change="changeAirport"
            />
        </div>

        <!-- LINE 2: The rest all on the next line in a 3-column row -->
        <div class="sub-fields-grid">
            <label class="field-item">
                <span class="field-label">Terminal Type *</span>
                <select :value="activeTerminal" class="custom-select" required @change="changeTerminal">
                    <option v-for="item in terminalOptions" :key="item.slug" :value="item.slug">
                        {{ item.label }}
                    </option>
                </select>
            </label>

            <label class="field-item">
                <span class="field-label">Journey Type *</span>
                <select :value="activeService" class="custom-select" required :disabled="!availableTypes.length" @change="changeService">
                    <option v-for="item in availableTypes" :key="item.slug" :value="item.slug">
                        {{ item.name }}
                    </option>
                </select>
            </label>

            <div class="field-item terminal-multi-field">
                <span class="field-label">Service Packages *</span>

                <div ref="dropdownRef" class="terminal-multi" :class="{ 'is-open': dropdownOpen }" @keydown.esc="dropdownOpen = false">
                    <button
                        type="button"
                        class="terminal-multi-trigger"
                        :class="{ 'is-empty': selectedPackages.length === 0 }"
                        :aria-expanded="dropdownOpen"
                        aria-controls="terminal-package-options"
                        :disabled="!packages.length"
                        @click="toggleDropdown"
                    >
                        <span class="trigger-label" :class="{ 'is-placeholder': selectedPackages.length === 0 }">{{ triggerLabel }}</span>
                        <ChevronDown :size="15" class="trigger-chevron" :class="{ 'rotate-180': dropdownOpen }" />
                    </button>

                    <div v-if="dropdownOpen" id="terminal-package-options" class="terminal-multi-menu" role="listbox">
                        <div class="terminal-search-bar">
                            <Search :size="14" class="search-icon" />
                            <input
                                ref="searchInputRef"
                                v-model="search"
                                type="search"
                                class="terminal-search-input"
                                placeholder="Search services..."
                                aria-label="Search service packages"
                                autocomplete="off"
                            />
                            <button
                                v-if="search"
                                type="button"
                                class="clear-search-btn"
                                aria-label="Clear search"
                                @click="search = ''"
                            >
                                <X :size="12" />
                            </button>
                        </div>

                        <div class="terminal-multi-options">
                            <label
                                v-for="item in filteredPackages"
                                :key="item.slug"
                                class="terminal-multi-option"
                                :class="{ 'is-checked': packageSlugs.includes(item.slug) }"
                            >
                                <input
                                    type="checkbox"
                                    :checked="packageSlugs.includes(item.slug)"
                                    @change="togglePackage(item.slug)"
                                />

                                <span class="option-title">{{ cleanServiceName(item.title) }}</span>
                            </label>

                            <p v-if="!filteredPackages.length" class="subtle-note terminal-multi-empty">
                                No matching services
                            </p>
                        </div>
                    </div>
                </div>

                <div v-if="selectedPackages.length" class="terminal-selected-tags">
                    <span v-for="item in selectedPackages" :key="item.slug" class="terminal-selected-tag">
                        <span class="tag-title">{{ cleanServiceName(item.title) }}</span>

                        <button type="button" :aria-label="`Remove ${item.title}`" @click="togglePackage(item.slug)">
                            <X :size="11" />
                        </button>
                    </span>
                </div>
            </div>
        </div>

        <div v-if="!hideDetails && selectedPackages.length" class="terminal-selected-details">
            <article v-for="item in selectedPackages" :key="item.slug" class="terminal-service-details">
                <span class="micro-label">
                    {{ current.code }} / {{ activeTerminal }}
                </span>

                <h3>{{ cleanServiceName(item.title) }}</h3>

                <ul>
                    <li v-for="(inclusion, index) in item.inclusions" :key="index">
                        {{ inclusion }}
                    </li>
                </ul>

                <p v-if="item.additionalService">
                    <strong>Additional Service:</strong>
                    {{ item.additionalService }}
                </p>
            </article>

            <p class="terminal-quote-note">
                Final pricing and service availability are subject to supplier confirmation.
            </p>
        </div>
    </div>
</template>

<style scoped>
.airport-service-selector {
  width: 100%;
}

/* Full Width Airport Field on Line 1 */
.airport-field-full {
  width: 100%;
  margin-bottom: 16px;
}

/* Rest of the fields on the next line (Line 2) in a 3-column row */
.sub-fields-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
  align-items: start;
}

.field-item {
  display: flex;
  flex-direction: column;
  min-width: 0;
  position: relative;
}

.field-label {
  display: block;
  font-size: 12px;
  font-weight: 600;
  color: #182a40;
  margin-bottom: 8px;
}

.custom-select {
  width: 100%;
  height: 48px;
  min-height: 48px;
  padding: 0 14px;
  background: #ffffff;
  color: #182a40;
  border: 1px solid #d8d2c7;
  border-radius: 5px;
  font-size: 13px;
  font-family: inherit;
  outline: none;
  cursor: pointer;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
  box-sizing: border-box;
}

.custom-select:hover:not(:disabled) {
  border-color: #b18b65;
}

.custom-select:focus {
  border-color: #b18b65;
  box-shadow: 0 0 0 3px rgba(177, 139, 101, 0.16);
}

.custom-select:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  background: #f7f5f0;
}

/* Service Packages Field */
.terminal-multi-field {
  position: relative;
  width: 100%;
  min-width: 0;
}

.terminal-multi {
  position: relative;
  width: 100%;
}

/* Proper Trigger Button matching 48px height */
.terminal-multi-trigger {
  width: 100%;
  height: 48px;
  min-height: 48px;
  padding: 0 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  background: #ffffff;
  color: #182a40;
  border: 1px solid #d8d2c7;
  border-radius: 5px;
  font-size: 13px;
  font-family: inherit;
  cursor: pointer;
  text-align: left;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
  box-sizing: border-box;
}

.terminal-multi-trigger:hover:not(:disabled) {
  border-color: #b18b65;
}

.terminal-multi.is-open .terminal-multi-trigger {
  border-color: #b18b65;
  box-shadow: 0 0 0 3px rgba(177, 139, 101, 0.16);
}

.terminal-multi-trigger:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  background: #f7f5f0;
}

.trigger-label {
  font-weight: 500;
  color: #182a40;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
}

.trigger-label.is-placeholder {
  color: #77746d;
  font-weight: 400;
}

.trigger-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

.selected-count-badge {
  background: #182a40;
  color: #ffffff;
  font-size: 11px;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 999px;
  line-height: 1.2;
}

.trigger-chevron {
  color: #77746d;
  flex-shrink: 0;
  transition: transform 0.22s ease;
}

.trigger-chevron.rotate-180 {
  transform: rotate(180deg);
}

/* Floating Popover Dropdown Menu - opens aligned right so it never overflows */
.terminal-multi-menu {
  position: absolute;
  top: calc(100% + 5px);
  right: 0;
  width: 100%;
  min-width: 280px;
  max-width: 420px;
  background: #ffffff;
  border: 1px solid #dedad2;
  border-radius: 6px;
  box-shadow: 0 14px 34px -6px rgba(24, 42, 64, 0.18), 0 2px 8px rgba(0, 0, 0, 0.06);
  z-index: 1000;
  overflow: hidden;
  animation: dropdownIn 0.18s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes dropdownIn {
  from {
    opacity: 0;
    transform: translateY(-6px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Search Bar */
.terminal-search-bar {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  background: #faf8f5;
  border-bottom: 1px solid #e8e2d8;
  gap: 8px;
}

.search-icon {
  color: #8c857b;
  flex-shrink: 0;
}

.terminal-search-input {
  flex: 1;
  border: none !important;
  background: transparent !important;
  font-size: 12.5px !important;
  color: #182a40 !important;
  outline: none !important;
  padding: 0 !important;
  height: 28px !important;
  min-height: 28px !important;
  box-shadow: none !important;
  font-family: inherit;
}

.terminal-search-input::placeholder {
  color: #9c958b;
  font-size: 12px;
}

.clear-search-btn {
  background: rgba(0, 0, 0, 0.06);
  border: none;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6f6d66;
  cursor: pointer;
  padding: 0;
  transition: background 0.15s, color 0.15s;
}

.clear-search-btn:hover {
  background: rgba(0, 0, 0, 0.12);
  color: #182a40;
}

/* Options List */
.terminal-multi-options {
  max-height: 180px;
  overflow-y: auto;
  overscroll-behavior: contain;
  scroll-behavior: smooth;
  padding: 4px 0;
}

.terminal-multi-options::-webkit-scrollbar {
  width: 6px;
}

.terminal-multi-options::-webkit-scrollbar-track {
  background: #f7f3ed;
}

.terminal-multi-options::-webkit-scrollbar-thumb {
  background: #d4c8b8;
  border-radius: 3px;
}

.terminal-multi-options::-webkit-scrollbar-thumb:hover {
  background: #b18b65;
}

/* Single Option Row - Small & Clean */
.terminal-multi-option {
  display: flex !important;
  align-items: center !important;
  justify-content: flex-start !important;
  gap: 10px !important;
  padding: 9px 14px !important;
  cursor: pointer !important;
  transition: background 0.12s ease;
  user-select: none;
  border-bottom: 1px solid #f9f7f4;
}

.terminal-multi-option:last-child {
  border-bottom: none;
}

.terminal-multi-option:hover {
  background: #f5efe6 !important;
}

.terminal-multi-option.is-checked {
  background: #faf6f0;
}

/* Small, Proper Checkbox (strictly prevents giant box bug) */
.terminal-multi-option input[type="checkbox"],
.terminal-multi-field input[type="checkbox"] {
  appearance: auto !important;
  -webkit-appearance: checkbox !important;
  width: 16px !important;
  min-width: 16px !important;
  max-width: 16px !important;
  height: 16px !important;
  min-height: 16px !important;
  max-height: 16px !important;
  padding: 0 !important;
  margin: 0 !important;
  border: 1px solid #c7bfb2 !important;
  border-radius: 3px !important;
  accent-color: #182a40 !important;
  flex: 0 0 16px !important;
  cursor: pointer !important;
  box-shadow: none !important;
  background: #fff !important;
}

.option-title {
  font-size: 13px;
  color: #182a40;
  line-height: 1.35;
  flex: 1;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.terminal-multi-empty {
  padding: 18px 14px;
  text-align: center;
  font-size: 12px;
  color: #8c857b;
  margin: 0;
}

/* Selected Tags Underneath */
.terminal-selected-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: 6px;
}

.terminal-selected-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: #f2ece1;
  color: #182a40;
  padding: 2px 7px;
  border-radius: 999px;
  font-size: 10.5px;
  font-weight: 500;
  border: 1px solid #ded5c7;
  max-width: 100%;
}

.tag-title {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 130px;
}

.terminal-selected-tag button {
  background: none;
  border: none;
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #77746d;
  cursor: pointer;
  transition: color 0.15s;
}

.terminal-selected-tag button:hover {
  color: #902e3a;
}

@media (max-width: 900px) {
  .sub-fields-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 600px) {
  .sub-fields-grid {
    grid-template-columns: 1fr;
    gap: 14px;
  }
}

.terminal-quote-note {
  font-size: 11px;
  color: #77746d;
  margin: 10px 0 0;
  padding: 8px 12px;
  background: #faf7f2;
  border: 1px solid #e7ded2;
  border-radius: 5px;
  line-height: 1.5;
}
</style>
