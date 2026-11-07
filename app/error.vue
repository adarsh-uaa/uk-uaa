<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{
  error?: NuxtError
}>()

const is404 = computed(() => {
  if (!props.error) return true
  const code = Number(props.error.statusCode)
  return code === 404 || !code
})

const handleClear = (path = '/') => {
  clearError({ redirect: path })
}

const { siteName } = useSiteMeta()

useSeoMeta({
  title: computed(() =>
    is404.value
      ? `404 – Flight Path Uncharted | ${siteName.value}`
      : `Flight Interruption | ${siteName.value}`
  ),
  description: 'The requested coordinates could not be chartered. Re-route your journey with our dedicated VIP airport concierge.',
  robots: 'noindex, follow'
})
</script>

<template>
  <div class="luxe-error-viewport">
    <LuxuryNotFound
      :status-code="props.error?.statusCode || 404"
      :status-message="props.error?.statusMessage || (is404 ? 'Coordinates Uncharted' : 'Airspace Turbulence')"
      :is-error-page="true"
      @navigate="handleClear"
    />
  </div>
</template>

<style scoped>
.luxe-error-viewport {
  min-height: 100vh;
  background-color: #f8f6f1;
}
</style>
