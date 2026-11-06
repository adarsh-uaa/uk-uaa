<script setup lang="ts">
import { Vue3Lottie } from 'vue3-lottie'

withDefaults(
  defineProps<{
    animationLink?: string
    animationData?: any
    width?: number | string
    height?: number | string
    loop?: boolean | number
    autoPlay?: boolean
    speed?: number
  }>(),
  {
    animationLink: 'https://lottie.host/a1a9dde2-d1f6-488a-9950-c609c6d8b8ef/pCwjgN0cho.json',
    animationData: undefined,
    width: 120,
    height: 120,
    loop: false,
    autoPlay: true,
    speed: 1
  }
)
</script>

<template>
  <div class="lottie-animation-wrapper">
    <Vue3Lottie
      :animation-link="animationLink"
      :animation-data="animationData"
      :width="width"
      :height="height"
      :loop="loop"
      :auto-play="autoPlay"
      :speed="speed"
    />
  </div>
</template>

<style scoped>
.lottie-animation-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
}
</style>

