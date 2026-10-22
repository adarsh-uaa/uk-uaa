<script setup lang="ts">
import { Plane } from 'lucide-vue-next'
const visible = ref(true)
const exiting = ref(false)
let timer: ReturnType<typeof setTimeout> | undefined
let finish: ReturnType<typeof setTimeout> | undefined
onMounted(() => {
  // A single 3-second opening sequence; client-only so SSR content remains indexable.
  timer = setTimeout(() => { exiting.value = true; finish = setTimeout(() => visible.value = false, 450) }, 3000)
})
onBeforeUnmount(() => { if(timer) clearTimeout(timer); if(finish) clearTimeout(finish) })
</script>
<template>
  <div v-if="visible" class="flight-loader" :class="{'loader-exit':exiting}" aria-label="Opening Universal Airport Assistance" role="status">
    <div class="flight-loader-inner">
      <div class="loader-brand">UNIVERSAL <span>—</span> AIRPORT ASSISTANCE</div>
      <div class="flight-map" aria-hidden="true">
        <span class="flight-origin"></span><span class="flight-route"></span><Plane class="flight-plane" :size="33" :stroke-width="1.15"/><span class="flight-destination"></span>
      </div>
      <p class="loader-overline">YOUR JOURNEY IS ABOUT TO BEGIN</p>
      <p class="loader-phrase">Every arrival<br><em>deserves an entrance.</em></p>
      <div class="loader-progress"><span></span></div>
      <span class="loader-bottom">A considered way to travel <span>01 — 03</span></span>
    </div>
  </div>
</template>
