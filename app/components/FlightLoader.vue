<script setup lang="ts">
import { Plane } from 'lucide-vue-next'

const visible = ref(true)
const exiting = ref(false)
const { siteName } = useSiteMeta()

let timer: ReturnType<typeof setTimeout> | undefined
let finish: ReturnType<typeof setTimeout> | undefined

onMounted(() => {
  // Match the 1.5s CSS flight and progress animations.
  timer = setTimeout(() => {
    exiting.value = true
    finish = setTimeout(() => {
      visible.value = false
    }, 300)
  }, 1500)
})

onBeforeUnmount(() => {
  if (timer !== undefined) clearTimeout(timer)
  if (finish !== undefined) clearTimeout(finish)
})
</script>

<template>
  <div v-if="visible" class="flight-loader" :class="{ 'loader-exit': exiting }" role="status"
    :aria-label="`Opening ${siteName}`">
    <div class="flight-loader-inner">
      <div class="loader-brand">{{ siteName.toUpperCase() }}</div>
      <div class="flight-map" aria-hidden="true">
        <span class="flight-origin"></span>
        <span class="flight-route"></span>
        <Plane class="flight-plane" :size="33" :stroke-width="1.15" />
        <span class="flight-destination"></span>
      </div>
      <p class="loader-overline">YOUR JOURNEY IS ABOUT TO BEGIN</p>
      <p class="loader-phrase">Every arrival<br><em>deserves an entrance.</em></p>
      <div class="loader-progress" aria-hidden="true"><span></span></div>
      <span class="loader-bottom">
        A considered way to travel
        <span>01 — 03</span>
      </span>
    </div>
  </div>
</template>
