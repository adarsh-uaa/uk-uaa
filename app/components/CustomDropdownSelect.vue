<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { ChevronDown, Check } from 'lucide-vue-next'

export interface SelectOption {
  value: string
  label: string
}

const props = withDefaults(
  defineProps<{
    modelValue: string
    options: SelectOption[]
    placeholder?: string
    disabled?: boolean
    id?: string
    ariaLabel?: string
    required?: boolean
  }>(),
  {
    placeholder: '- Select -',
    disabled: false,
    required: false,
    id: undefined,
    ariaLabel: undefined
  }
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'change', value: string): void
}>()

const isOpen = ref(false)
const dropdownRef = ref<HTMLElement | null>(null)

const selectedOption = computed(() =>
  props.options.find(opt => String(opt.value) === String(props.modelValue))
)

const displayLabel = computed(() => {
  if (selectedOption.value) {
    return selectedOption.value.label
  }
  return props.placeholder
})

function toggle() {
  if (props.disabled) return
  isOpen.value = !isOpen.value
}

function selectOptionItem(val: string) {
  emit('update:modelValue', val)
  emit('change', val)
  isOpen.value = false
}

function close() {
  isOpen.value = false
}

function handlePointerDown(e: PointerEvent) {
  if (dropdownRef.value && !dropdownRef.value.contains(e.target as Node)) {
    close()
  }
}

onMounted(() => {
  document.addEventListener('pointerdown', handlePointerDown)
})

onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', handlePointerDown)
})
</script>

<template>
  <div
    ref="dropdownRef"
    class="custom-dropdown-select"
    :class="{ 'is-open': isOpen, 'is-disabled': disabled }"
    @keydown.esc="close"
  >
    <!-- Hidden input for standard HTML form validation if required -->
    <input
      type="text"
      tabindex="-1"
      aria-hidden="true"
      class="hidden-validation-input"
      :value="modelValue"
      :required="required"
    />

    <button
      :id="id"
      type="button"
      class="custom-dropdown-trigger"
      :disabled="disabled"
      :aria-expanded="isOpen"
      :aria-label="ariaLabel"
      aria-haspopup="listbox"
      @click="toggle"
    >
      <span class="custom-dropdown-label" :class="{ 'is-placeholder': !selectedOption }">
        {{ displayLabel }}
      </span>

      <span class="custom-dropdown-arrow" aria-hidden="true">
        <ChevronDown :size="15" class="custom-chevron-icon" :class="{ 'rotate-180': isOpen }" />
      </span>
    </button>

    <div v-if="isOpen" class="custom-dropdown-menu" role="listbox">
      <button
        v-for="opt in options"
        :key="opt.value"
        type="button"
        class="custom-dropdown-option"
        :class="{ 'is-selected': opt.value === modelValue }"
        role="option"
        :aria-selected="opt.value === modelValue"
        @click="selectOptionItem(opt.value)"
      >
        <span>{{ opt.label }}</span>
        <Check v-if="opt.value === modelValue" :size="14" class="option-check" />
      </button>

      <div v-if="!options.length" class="custom-dropdown-empty">
        No options available
      </div>
    </div>
  </div>
</template>

<style scoped>
.custom-dropdown-select {
  position: relative;
  width: 100%;
  min-width: 0;
}

.hidden-validation-input {
  position: absolute;
  opacity: 0;
  pointer-events: none;
  width: 0;
  height: 0;
  border: 0;
  padding: 0;
  margin: 0;
}

.custom-dropdown-trigger {
  width: 100%;
  min-height: 48px;
  height: 48px;
  padding: 0 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  text-align: left;
  gap: 10px;
  border: 1px solid #d8d2c7;
  border-radius: 5px;
  background: #ffffff;
  color: #182a40;
  font-size: 13px;
  cursor: pointer;
  box-sizing: border-box;
  outline: none;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.custom-dropdown-trigger:focus-visible,
.custom-dropdown-select.is-open .custom-dropdown-trigger {
  border-color: #9b8164;
  box-shadow: 0 0 0 3px rgba(155, 129, 100, 0.16);
}

.custom-dropdown-trigger:disabled {
  opacity: 0.65;
  cursor: not-allowed;
  background: #fbfaf8;
}

.custom-dropdown-label {
  font-weight: 400;
  color: #302c27;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.custom-dropdown-label.is-placeholder {
  color: #77746d;
}

.custom-dropdown-arrow {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #182a40;
  flex-shrink: 0;
  line-height: 1;
}

.custom-chevron-icon {
  display: block;
  transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.custom-chevron-icon.rotate-180 {
  transform: rotate(180deg);
}

.custom-dropdown-menu {
  position: absolute;
  top: calc(100% + 5px);
  left: 0;
  right: 0;
  z-index: 100;
  background: #ffffff;
  border: 1px solid #dedad2;
  border-radius: 6px;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.12);
  overflow-y: auto;
  max-height: 230px;
  padding: 4px 0;
}

.custom-dropdown-option {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  background: transparent;
  border: none;
  font-size: 13px;
  color: #182a40;
  text-align: left;
  cursor: pointer;
  transition: background 0.15s ease, color 0.15s ease;
}

.custom-dropdown-option:hover {
  background: #f7f3ed;
  color: #182a40;
}

.custom-dropdown-option.is-selected {
  background: #faf6f0;
  color: #9b1c31;
  font-weight: 600;
}

.option-check {
  color: #9b1c31;
  flex-shrink: 0;
}

.custom-dropdown-empty {
  padding: 12px 14px;
  font-size: 12.5px;
  color: #8c857b;
  text-align: center;
}
</style>

