<script setup lang="ts">
import { Plane } from 'lucide-vue-next'

const visible = ref(true)
const exiting = ref(false)
const progress = ref(0)
const { siteName } = useSiteMeta()

const ukHubs = [
  'LONDON HEATHROW · LHR',
  'LONDON GATWICK · LGW',
  'MANCHESTER · MAN',
  'EDINBURGH · EDI',
  'BIRMINGHAM · BHX'
]

const currentHub = computed(() => {
  const idx = Math.min(
    Math.floor(progress.value * ukHubs.length),
    ukHubs.length - 1
  )
  return ukHubs[idx]!
})

let frame = 0
let finish: ReturnType<typeof setTimeout> | undefined
let disposed = false
let imageReady = false
let downloaded = 0
const controller = new AbortController()

function skipLoader() {
  if (exiting.value || !visible.value) return
  progress.value = 1
  exiting.value = true
  finish = setTimeout(() => {
    visible.value = false
  }, 320)
}

function onKeyDown(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    skipLoader()
  }
}

onMounted(() => {
  window.addEventListener('keydown', onKeyDown)
  const started = performance.now()

  const advance = (now: number) => {
    if (disposed) return

    // Smooth, calibrated 1.4s minimum duration for an understated, responsive feel
    const timeProgress = Math.min(1, (now - started) / 1400)
    const target = Math.min(imageReady ? 1 : Math.min(downloaded, 0.99), timeProgress)
    progress.value += (target - progress.value) * 0.16

    if (imageReady && timeProgress === 1 && progress.value > 0.995) {
      progress.value = 1
      exiting.value = true
      finish = setTimeout(() => {
        visible.value = false
      }, 450)
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
  window.removeEventListener('keydown', onKeyDown)
  controller.abort()
  cancelAnimationFrame(frame)
  if (finish !== undefined) clearTimeout(finish)
})
</script>

<template>
  <div
    v-if="visible"
    class="minimal-loader"
    :class="{ 'loader-exit': exiting }"
    role="status"
    :aria-label="`Opening ${siteName}`"
  >
    <!-- Ambient luxury background layer with watermark compass & starlight -->
    <div class="loader-bg-accent" aria-hidden="true">
      <div class="ambient-glow"></div>
      <svg class="bg-compass" viewBox="0 0 500 500">
        <circle cx="250" cy="250" r="235" fill="none" stroke="#c9a86a" stroke-width="1" stroke-dasharray="2 12" />
        <circle cx="250" cy="250" r="175" fill="none" stroke="#c9a86a" stroke-width="0.75" />
        <circle cx="250" cy="250" r="115" fill="none" stroke="#c9a86a" stroke-width="0.5" stroke-dasharray="1 8" />
      </svg>
      <span class="luxe-star ls1"></span>
      <span class="luxe-star ls2"></span>
      <span class="luxe-star ls3"></span>
    </div>

    <div class="loader-content">
      <!-- 1. Authentic Brand Logo on Natural Theme Cream -->
      <div class="brand-wrap">
        <img
          src="/images/uk-airport-assistance-logo.webp"
          :alt="siteName"
          class="loader-logo"
          width="260"
          height="88"
          fetchpriority="high"
          decoding="async"
        />
      </div>

      <!-- 2. Subtle Luxury Editorial Kicker & Phrasing -->
      <div class="phrase-wrap">
        <p class="loader-kicker">✦ EXCLUSIVE UK AIRPORT ASSISTANCE ✦</p>
        <p class="loader-phrase">
          Every arrival<br />
          <em>deserves an entrance.</em>
        </p>
      </div>

      <!-- 3. Minimalist Hairline Flight Progress Track with Gliding Aircraft & Inline Numbers -->
      <div class="progress-wrap" aria-hidden="true">
        <!-- Dynamic Airport Touchpoint Micro-Ticker -->
        <div class="hub-ticker">
          <Transition name="hub-fade" mode="out-in">
            <span :key="currentHub" class="hub-pill">✦ {{ currentHub }} ✦</span>
          </Transition>
        </div>

        <div class="progress-row">
          <div class="progress-track">
            <div
              class="progress-fill"
              :style="{ width: `${progress * 100}%` }"
            >
              <div class="fill-sheen"></div>
            </div>
            <div
              class="progress-plane"
              :style="{ left: `${progress * 100}%` }"
            >
              <!-- Ethereal golden vapor trail -->
              <div class="vapor-trail"></div>
              <Plane class="plane-icon" :size="14" :stroke-width="1.35" />
            </div>
          </div>
          <span class="progress-value">{{ Math.round(progress * 100) }}%</span>
        </div>

        <p class="progress-tagline">PERSONAL · DISCREET · EFFORTLESS</p>
      </div>
    </div>

    <!-- 4. Subtle, Respectful Skip Control for Frequent Visitors -->
    <button
      type="button"
      class="loader-skip-btn"
      aria-label="Skip introduction"
      @click="skipLoader"
    >
      Skip [Esc]
    </button>
  </div>
</template>

<style scoped>
.minimal-loader {
  position: fixed;
  inset: 0;
  z-index: 999999;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5eedf;
  background-image:
    radial-gradient(circle at 50% 45%, rgba(255, 255, 255, 0.8) 0%, rgba(246, 240, 227, 0.5) 45%, transparent 75%),
    radial-gradient(circle at 10% 12%, rgba(201, 168, 106, 0.22) 0%, transparent 45%),
    radial-gradient(circle at 90% 88%, rgba(155, 28, 49, 0.08) 0%, transparent 45%),
    linear-gradient(145deg, #fdfbf7 0%, #f6f0e2 32%, #ebdcc2 70%, #dfcbab 100%);
  box-shadow: inset 0 0 120px rgba(201, 168, 106, 0.2), inset 0 0 35px rgba(6, 28, 65, 0.05);
  color: #061c41;
  font-family: 'Montserrat', sans-serif;
  user-select: none;
  -webkit-user-select: none;
  transition:
    opacity 0.45s cubic-bezier(0.4, 0, 0.2, 1),
    transform 0.45s cubic-bezier(0.4, 0, 0.2, 1),
    visibility 0.45s ease;
  overflow: hidden;
}

.minimal-loader.loader-exit {
  opacity: 0;
  transform: scale(1.015);
  visibility: hidden;
  pointer-events: none;
}

/* Ambient luxury background layer with watermark compass & starlight */
.loader-bg-accent {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  overflow: hidden;
}

.ambient-glow {
  position: absolute;
  width: min(580px, 120vw);
  height: min(580px, 120vw);
  border-radius: 50%;
  background: radial-gradient(circle, rgba(201, 168, 106, 0.22) 0%, transparent 65%);
  filter: blur(40px);
  animation: glow-pulse 4.5s ease-in-out infinite alternate;
}

@keyframes glow-pulse {
  0% { transform: scale(0.94); opacity: 0.7; }
  100% { transform: scale(1.06); opacity: 1; }
}

.bg-compass {
  position: absolute;
  width: min(520px, 110vw);
  height: min(520px, 110vw);
  opacity: 0.18;
  animation: compass-spin 50s linear infinite;
}

@keyframes compass-spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Micro Starlight Specks */
.luxe-star {
  position: absolute;
  border-radius: 50%;
  background: #c9a86a;
  box-shadow: 0 0 6px rgba(201, 168, 106, 0.8);
  opacity: 0.35;
  animation: star-shimmer 4s ease-in-out infinite alternate;
}

.luxe-star.ls1 { width: 2.5px; height: 2.5px; left: 18%; top: 22%; animation-delay: 0.2s; }
.luxe-star.ls2 { width: 2px; height: 2px; left: 82%; top: 32%; animation-delay: 1.4s; }
.luxe-star.ls3 { width: 3px; height: 3px; left: 74%; top: 78%; animation-delay: 2.1s; }

@keyframes star-shimmer {
  0% { opacity: 0.15; transform: scale(0.8); }
  100% { opacity: 0.65; transform: scale(1.2); }
}

.loader-content {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 32px 24px;
  width: min(440px, calc(100vw - 32px));
  animation: content-reveal 0.6s cubic-bezier(0.16, 1, 0.3, 1) both;
}

@keyframes content-reveal {
  0% {
    opacity: 0;
    transform: translateY(10px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 1. Authentic Logo */
.brand-wrap {
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.loader-logo {
  display: block;
  width: clamp(200px, 46vw, 255px);
  height: auto;
  object-fit: contain;
  filter: drop-shadow(0 4px 16px rgba(6, 28, 65, 0.08));
}

/* 2. Editorial Phrase & Kicker */
.phrase-wrap {
  margin-bottom: 24px;
}

.loader-kicker {
  font-family: 'Montserrat', sans-serif;
  font-size: 8.5px;
  font-weight: 600;
  letter-spacing: 0.26em;
  color: #c9a86a;
  text-transform: uppercase;
  margin: 0 0 10px;
}

.loader-phrase {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: clamp(20px, 4.8vw, 24px);
  font-weight: 400;
  line-height: 1.32;
  letter-spacing: -0.015em;
  color: #061c41;
  margin: 0;
}

.loader-phrase em {
  font-family: 'Playfair Display', Georgia, serif;
  font-style: italic;
  color: #9b1c31;
}

/* 3. Hairline Progress Track with Gliding Plane, Vapor Trail and Inline Numbers */
.progress-wrap {
  width: min(280px, 82vw);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

/* Micro-Hub Ticker */
.hub-ticker {
  min-height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.hub-pill {
  display: inline-block;
  font-family: 'Montserrat', sans-serif;
  font-size: 7.5px;
  font-weight: 700;
  letter-spacing: 0.22em;
  color: #9b1c31;
  text-transform: uppercase;
}

.hub-fade-enter-active,
.hub-fade-leave-active {
  transition: opacity 0.22s ease, transform 0.22s ease;
}

.hub-fade-enter-from {
  opacity: 0;
  transform: translateY(3px);
}

.hub-fade-leave-to {
  opacity: 0;
  transform: translateY(-3px);
}

.progress-row {
  display: flex;
  align-items: center;
  gap: 14px;
  width: 100%;
}

.progress-track {
  position: relative;
  flex: 1;
  height: 2px;
  background: rgba(201, 168, 106, 0.25);
  border-radius: 999px;
  overflow: visible;
}

.progress-fill {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background: linear-gradient(
    90deg,
    #9b1c31 0%,
    #c9a86a 50%,
    #b39355 100%
  );
  border-radius: 999px;
  transition: width 0.12s linear;
  overflow: hidden;
}

/* Metallic Gold Light Sheen */
.fill-sheen {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(255, 255, 255, 0.75) 50%,
    transparent 100%
  );
  animation: sheen-sweep 2.2s ease-in-out infinite;
}

@keyframes sheen-sweep {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(200%); }
}

.progress-plane {
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: #ffffff;
  border: 1px solid rgba(201, 168, 106, 0.45);
  box-shadow:
    0 2px 8px rgba(6, 28, 65, 0.12),
    0 0 10px rgba(201, 168, 106, 0.25);
  transition: left 0.12s linear;
}

/* Ethereal golden vapor trail */
.vapor-trail {
  position: absolute;
  right: 18px;
  top: 50%;
  width: 26px;
  height: 2px;
  transform: translateY(-50%);
  background: linear-gradient(to left, rgba(201, 168, 106, 0.75), transparent);
  border-radius: 999px;
  filter: blur(0.75px);
  pointer-events: none;
}

.plane-icon {
  color: #c9a86a;
  transform: rotate(45deg);
}

.progress-value {
  font-family: 'Montserrat', sans-serif;
  font-variant-numeric: tabular-nums;
  font-weight: 700;
  font-size: 11px;
  letter-spacing: 0.04em;
  color: #061c41;
  min-width: 36px;
  text-align: right;
  flex-shrink: 0;
}

.progress-tagline {
  font-family: 'Montserrat', sans-serif;
  font-size: 8px;
  font-weight: 600;
  letter-spacing: 0.22em;
  color: rgba(6, 28, 65, 0.65);
  text-transform: uppercase;
  margin: 0;
  white-space: nowrap;
}

/* 4. Respectful Skip Control */
.loader-skip-btn {
  position: absolute;
  bottom: 18px;
  right: 22px;
  z-index: 10;
  background: transparent;
  border: 1px solid transparent;
  padding: 5px 12px;
  font-family: 'Montserrat', sans-serif;
  font-size: 8px;
  font-weight: 600;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: rgba(6, 28, 65, 0.4);
  cursor: pointer;
  border-radius: 999px;
  transition: all 0.2s ease;
}

.loader-skip-btn:hover {
  color: #061c41;
  background: rgba(201, 168, 106, 0.15);
  border-color: rgba(201, 168, 106, 0.3);
}

/* Reduced Motion */
@media (prefers-reduced-motion: reduce) {
  .loader-content,
  .ambient-glow,
  .bg-compass,
  .luxe-star,
  .fill-sheen {
    animation: none !important;
  }

  .minimal-loader {
    transition: opacity 0.25s ease !important;
  }

  .minimal-loader.loader-exit {
    transform: none !important;
  }
}
</style>
