<script setup lang="ts">
const { siteName } = useSiteMeta()

useSeoMeta({
  title: computed(() => `404 – Flight Path Uncharted | ${siteName.value}`),
  description: 'The requested coordinates could not be chartered. Re-route your journey with our dedicated VIP airport concierge.',
  robots: 'noindex, follow'
})
</script>

<template>
  <LuxuryNotFound
    :status-code="404"
    status-message="Coordinates Uncharted"
    :is-error-page="false"
  />
</template>

