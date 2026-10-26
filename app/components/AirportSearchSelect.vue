<script setup lang="ts">
import { Search, ChevronDown, Check, X, Plane } from 'lucide-vue-next'
import { airportsCatalog, selectAirport, type AirportOption } from '~/data/booking'

const props = withDefaults(
  defineProps<{
    modelValue?: string
    label?: string
    placeholder?: string
    size?: 'default' | 'large'
    id?: string
  }>(),
  {
    modelValue: 'heathrow',
    label: '',
    placeholder: 'Search airport or code (e.g. LHR, EDI)...',
    size: 'default',
    id: undefined
  }
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'change', value: string): void
}>()

const isOpen = ref(false)
const searchQuery = ref('')
const highlightedIndex = ref(0)
const searchInputRef = ref<HTMLInputElement | null>(null)
const dropdownRef = ref<HTMLElement | null>(null)
const optionsListRef = ref<HTMLElement | null>(null)

const selectedAirport = computed<AirportOption>(() =>
  selectAirport(props.modelValue || 'heathrow')
)

const filteredAirports = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return airportsCatalog

  return airportsCatalog.filter(airport =>
    airport.name.toLowerCase().includes(q) ||
    airport.code.toLowerCase().includes(q) ||
    airport.slug.toLowerCase().includes(q)
  )
})

watch(filteredAirports, () => {
  highlightedIndex.value = 0
})

function toggleDropdown() {
  isOpen.value = !isOpen.value
  if (isOpen.value) {
    searchQuery.value = ''
    // Set initial highlighted index to currently selected item if in list
    const currentIndex = filteredAirports.value.findIndex(a => a.slug === props.modelValue)
    highlightedIndex.value = currentIndex >= 0 ? currentIndex : 0
    nextTick(() => {
      searchInputRef.value?.focus()
      scrollToHighlighted()
    })
  }
}

function selectItem(airport: AirportOption) {
  emit('update:modelValue', airport.slug)
  emit('change', airport.slug)
  isOpen.value = false
  searchQuery.value = ''
}

function clearSearch() {
  searchQuery.value = ''
  highlightedIndex.value = 0
  searchInputRef.value?.focus()
}

function scrollToHighlighted() {
  nextTick(() => {
    if (!optionsListRef.value) return
    const items = optionsListRef.value.querySelectorAll('.airport-option-item')
    const item = items[highlightedIndex.value] as HTMLElement | undefined
    if (item) {
      item.scrollIntoView({ block: 'nearest' })
    }
  })
}

function handleInputKeydown(event: KeyboardEvent) {
  if (event.key === 'ArrowDown') {
    event.preventDefault()
    if (highlightedIndex.value < filteredAirports.value.length - 1) {
      highlightedIndex.value++
      scrollToHighlighted()
    }
  } else if (event.key === 'ArrowUp') {
    event.preventDefault()
    if (highlightedIndex.value > 0) {
      highlightedIndex.value--
      scrollToHighlighted()
    }
  } else if (event.key === 'Enter') {
    event.preventDefault()
    const item = filteredAirports.value[highlightedIndex.value]
    if (item) {
      selectItem(item)
    }
  } else if (event.key === 'Escape') {
    isOpen.value = false
  }
}

function handleClickOutside(event: PointerEvent) {
  const target = event.target as Node
  if (dropdownRef.value && !dropdownRef.value.contains(target)) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('pointerdown', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', handleClickOutside)
})
</script>

<template>
  <div
    ref="dropdownRef"
    class="airport-search-select"
    :class="[
      `size-${size}`,
      { 'is-open': isOpen }
    ]"
  >
    <label v-if="label" :for="id" class="airport-select-label">{{ label }}</label>

    <!-- Trigger Button -->
    <button
      :id="id"
      type="button"
      class="airport-select-trigger"
      :aria-expanded="isOpen"
      aria-haspopup="listbox"
      @click="toggleDropdown"
      @keydown.down.prevent="toggleDropdown"
      @keydown.enter.prevent="toggleDropdown"
    >
      <div class="trigger-content">
        <Plane :size="size === 'large' ? 17 : 15" class="trigger-plane-icon" />
        <span class="trigger-name">{{ selectedAirport.name }}</span>
        <span class="trigger-code">({{ selectedAirport.code }})</span>
      </div>

      <ChevronDown :size="16" class="trigger-chevron" :class="{ 'rotate-180': isOpen }" />
    </button>

    <!-- Dropdown Menu -->
    <div v-if="isOpen" class="airport-dropdown-menu" role="listbox">
      <!-- Search Input Container -->
      <div class="airport-search-header">
        <Search :size="15" class="search-icon" />
        <input
          ref="searchInputRef"
          v-model="searchQuery"
          type="search"
          class="airport-search-input"
          :placeholder="placeholder"
          autocomplete="off"
          @keydown="handleInputKeydown"
        />
        <button
          v-if="searchQuery"
          type="button"
          class="clear-search-btn"
          aria-label="Clear search"
          @click="clearSearch"
        >
          <X :size="13" />
        </button>
      </div>

      <!-- Shortened Scrollable Options List -->
      <div ref="optionsListRef" class="airport-options-list">
        <button
          v-for="(airport, idx) in filteredAirports"
          :key="airport.slug"
          type="button"
          class="airport-option-item"
          :class="{
            'is-selected': airport.slug === modelValue,
            'is-highlighted': idx === highlightedIndex
          }"
          role="option"
          :aria-selected="airport.slug === modelValue"
          @mouseenter="highlightedIndex = idx"
          @click="selectItem(airport)"
        >
          <div class="option-info">
            <span class="option-name">{{ airport.name }}</span>
            <span class="option-badge">{{ airport.code }}</span>
          </div>

          <Check v-if="airport.slug === modelValue" :size="15" class="selected-check" />
        </button>

        <!-- Empty State -->
        <div v-if="!filteredAirports.length" class="empty-airports-state">
          <span>No airports found matching "{{ searchQuery }}"</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.airport-search-select {
  position: relative;
  width: 100%;
  font-family: inherit;
}

.airport-select-label {
  display: block;
  font-size: 12px;
  font-weight: 600;
  color: #182a40;
  margin-bottom: 8px;
}

/* Trigger Button */
.airport-select-trigger {
  width: 100%;
  min-height: 48px;
  height: 48px;
  padding: 0 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  background: #ffffff;
  color: #182a40;
  border: 1px solid #d8d2c7;
  border-radius: 5px;
  font-size: 13px;
  cursor: pointer;
  text-align: left;
  transition: border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
  box-sizing: border-box;
}

.size-large .airport-select-trigger {
  min-height: 58px;
  height: 58px;
  padding: 0 16px;
  font-size: 14px;
  border-color: #d8d0c5;
}

.airport-select-trigger:hover {
  border-color: #b18b65;
}

.airport-search-select.is-open .airport-select-trigger {
  border-color: #b18b65;
  box-shadow: 0 0 0 3px rgba(177, 139, 101, 0.16);
}

.trigger-content {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
  flex: 1;
}

.trigger-plane-icon {
  color: #b18b65;
  flex-shrink: 0;
}

.trigger-name {
  font-weight: 500;
  color: #182a40;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.trigger-code {
  color: #77746d;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.04em;
  flex-shrink: 0;
}

.trigger-chevron {
  color: #77746d;
  flex-shrink: 0;
  transition: transform 0.25s ease;
}

.trigger-chevron.rotate-180 {
  transform: rotate(180deg);
}

/* Floating Dropdown Menu */
.airport-dropdown-menu {
  position: absolute;
  top: calc(100% + 5px);
  left: 0;
  right: 0;
  background: #ffffff;
  border: 1px solid #dedad2;
  border-radius: 6px;
  box-shadow: 0 14px 34px -6px rgba(24, 42, 64, 0.18), 0 2px 8px rgba(0, 0, 0, 0.06);
  z-index: 1000;
  overflow: hidden;
  animation: dropdownFadeIn 0.18s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes dropdownFadeIn {
  from {
    opacity: 0;
    transform: translateY(-6px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Search Header */
.airport-search-header {
  position: relative;
  display: flex;
  align-items: center;
  padding: 10px 12px;
  background: #faf8f5;
  border-bottom: 1px solid #e8e2d8;
}

.search-icon {
  color: #8c857b;
  flex-shrink: 0;
  margin-right: 8px;
}

.airport-search-input {
  flex: 1;
  border: none;
  background: transparent;
  font-size: 13px;
  color: #182a40;
  outline: none;
  padding: 0;
  font-family: inherit;
}

.airport-search-input::placeholder {
  color: #9c958b;
  font-size: 12px;
}

.clear-search-btn {
  background: rgba(0, 0, 0, 0.06);
  border: none;
  border-radius: 50%;
  width: 20px;
  height: 20px;
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

/* Shortened Height Scrollable Options List */
.airport-options-list {
  max-height: 200px;
  overflow-y: auto;
  overscroll-behavior: contain;
  scroll-behavior: smooth;
  padding: 4px 0;
}

/* Custom Slim Luxury Scrollbar */
.airport-options-list::-webkit-scrollbar {
  width: 6px;
}

.airport-options-list::-webkit-scrollbar-track {
  background: #f7f3ed;
}

.airport-options-list::-webkit-scrollbar-thumb {
  background: #d4c8b8;
  border-radius: 3px;
}

.airport-options-list::-webkit-scrollbar-thumb:hover {
  background: #b18b65;
}

/* Option Item */
.airport-option-item {
  width: 100%;
  padding: 9px 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  border: none;
  background: transparent;
  color: #182a40;
  font-size: 13px;
  cursor: pointer;
  text-align: left;
  transition: background 0.12s ease;
  font-family: inherit;
  box-sizing: border-box;
}

.airport-option-item:hover,
.airport-option-item.is-highlighted {
  background: #f5efe6;
}

.airport-option-item.is-selected {
  background: #eee5d7;
  font-weight: 600;
}

.airport-option-item.is-selected.is-highlighted {
  background: #e8dccb;
}

.option-info {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  flex: 1;
}

.option-name {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.option-badge {
  font-size: 10.5px;
  font-weight: 700;
  letter-spacing: 0.05em;
  color: #622a31;
  background: rgba(98, 42, 49, 0.08);
  padding: 2px 6px;
  border-radius: 4px;
  border: 1px solid rgba(98, 42, 49, 0.15);
  flex-shrink: 0;
}

.selected-check {
  color: #b18b65;
  flex-shrink: 0;
}

.empty-airports-state {
  padding: 22px 14px;
  text-align: center;
  font-size: 12px;
  color: #8c857b;
}

@media (max-width: 768px) {
  .airport-options-list {
    max-height: 180px;
  }

  .airport-option-item {
    padding: 10px 12px;
    font-size: 12.5px;
  }
}
</style>
