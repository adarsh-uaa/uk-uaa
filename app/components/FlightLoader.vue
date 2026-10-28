<script setup lang="ts">
import { Plane } from 'lucide-vue-next'

const visible = ref(true)
const exiting = ref(false)
const progress = ref(0)
const { siteName } = useSiteMeta()

let frame = 0
let finish: ReturnType<typeof setTimeout> | undefined
let disposed = false
let imageReady = false
let downloaded = 0
const controller = new AbortController()

onMounted(() => {
  const started = performance.now()
  const advance = (now: number) => {
    if (disposed) return
    // Actual received bytes determine progress; the minimum display time only
    // limits how quickly a cached or fast download can finish its flight.
    const minimumProgress = Math.min(1, (now - started) / 1500)
    const target = Math.min(imageReady ? 1 : Math.min(downloaded, .99), minimumProgress)
    progress.value += (target - progress.value) * .15
    if (imageReady && minimumProgress === 1 && progress.value > .999) {
      progress.value = 1
      exiting.value = true
      finish = setTimeout(() => { visible.value = false }, 300)
      return
    }
    frame = requestAnimationFrame(advance)
  }
  frame = requestAnimationFrame(advance)

  const loadHero = async () => {
    const image = document.querySelector<HTMLImageElement>('.luxe-hero-image')
    if (!image) {
      downloaded = 1
      imageReady = true
      return
    }
    let objectUrl: string | undefined
    try {
      const response = await fetch(image.currentSrc || image.src, { signal: controller.signal })
      if (!response.ok) throw new Error('Hero image download failed')
      const total = Number(response.headers.get('content-length'))
      const reader = response.body?.getReader()
      const chunks: Uint8Array[] = []
      let received = 0
      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          chunks.push(value)
          received += value.byteLength
          // Without a known size, wait for completion instead of inventing a percentage.
          if (total > 0) downloaded = Math.min(received / total, 1)
        }
        const bytes = new Uint8Array(received)
        let offset = 0
        for (const chunk of chunks) {
          bytes.set(chunk, offset)
          offset += chunk.byteLength
        }
        objectUrl = URL.createObjectURL(new Blob([bytes], {
          type: response.headers.get('content-type') || 'image/webp'
        }))
      } else {
        objectUrl = URL.createObjectURL(await response.blob())
      }
      const decoded = new Image()
      decoded.src = objectUrl
      await decoded.decode()
      await image.decode()
    } catch {
      if (disposed) return
      // Keep the original image request as a fallback if streaming is unavailable.
      if (!image.complete) {
        await new Promise<void>(resolve => {
          const settle = () => {
            image.removeEventListener('load', settle)
            image.removeEventListener('error', settle)
            controller.signal.removeEventListener('abort', settle)
            resolve()
          }
          image.addEventListener('load', settle, { once: true })
          image.addEventListener('error', settle, { once: true })
          controller.signal.addEventListener('abort', settle, { once: true })
        })
      }
    } finally {
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
    if (!disposed) {
      downloaded = 1
      imageReady = true
    }
  }
  void loadHero()
})

onBeforeUnmount(() => {
  disposed = true
  controller.abort()
  cancelAnimationFrame(frame)
  if (finish !== undefined) clearTimeout(finish)
})
</script>

<template>
  <div v-if="visible" class="flight-loader" :class="{ 'loader-exit': exiting }" role="status"
    :style="{ '--flight-progress': progress }"
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
