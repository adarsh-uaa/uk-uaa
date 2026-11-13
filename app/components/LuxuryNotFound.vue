<script setup lang="ts">
import { Plane, Compass, ArrowRight, ArrowUpRight } from 'lucide-vue-next'

const props = withDefaults(
  defineProps<{
    statusCode?: number | string
    statusMessage?: string
    isErrorPage?: boolean
  }>(),
  {
    statusCode: 404,
    statusMessage: 'Page Not Found',
    isErrorPage: false
  }
)

const emit = defineEmits<{
  (e: 'navigate', path: string): void
}>()

const router = useRouter()
const { siteName, whatsappUrl } = useSiteMeta()
const year = new Date().getFullYear()

// Mouse position for subtle interactive parallax
const mouseX = ref(0)
const mouseY = ref(0)

function handleMouseMove(e: MouseEvent) {
  if (typeof window === 'undefined') return
  const x = (e.clientX / window.innerWidth - 0.5) * 14
  const y = (e.clientY / window.innerHeight - 0.5) * 14
  mouseX.value = Number(x.toFixed(2))
  mouseY.value = Number(y.toFixed(2))
}

function handleNavigation(path: string, e?: MouseEvent) {
  if (e) {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return
    e.preventDefault()
  }

  if (props.isErrorPage) {
    emit('navigate', path)
    clearError({ redirect: path })
  } else {
    router.push(path)
  }
}

function handleRootClick(e: MouseEvent) {
  if (!props.isErrorPage) return
  const target = (e.target as HTMLElement)?.closest('a')
  if (!target) return
  const href = target.getAttribute('href')
  if (!href) return

  if (
    href.startsWith('http') ||
    href.startsWith('//') ||
    href.startsWith('mailto:') ||
    href.startsWith('tel:') ||
    href.startsWith('#')
  ) {
    return
  }

  e.preventDefault()
  handleNavigation(href, e)
}

const popularGateways = [
  { name: 'London Heathrow', path: '/airports/heathrow' },
  { name: 'London Gatwick', path: '/airports/gatwick' },
  { name: 'VIP Experience', path: '/vip-experience' },
  { name: 'Book Assistance', path: '/book' }
]
</script>

<template>
  <div
    class="luxe-page viewport-404-root"
    @click="handleRootClick"
    @mousemove="handleMouseMove"
  >
    <!-- Site Header -->
    <SiteHeader />

    <!-- Centered Viewport-Fit Hero (Buttons & Content Fully Visible Above The Fold) -->
    <main class="viewport-404-main">
      <div class="container content-wrapper">
        <!-- Eyebrow -->
        <div class="mini-kicker">
          <span class="kicker-line" />
          <span>404 · AIRSPACE UNCHARTED</span>
          <span class="kicker-line" />
        </div>

        <!-- Compact Animated 404 Numerals -->
        <div class="numeral-stage">
          <div
            class="numeral-404"
            :style="{
              transform: `translate(${mouseX * 0.35}px, ${mouseY * 0.35}px)`
            }"
          >
            <span>4</span>
            <span class="center-zero">
              0
              <!-- Floating Airplane Micro-Animation -->
              <span
                class="jet-carrier"
                :style="{
                  transform: `translate(${mouseX * -0.7}px, ${mouseY * -0.7}px)`
                }"
                aria-hidden="true"
              >
                <Plane class="gliding-plane" :size="24" />
              </span>
            </span>
            <span>4</span>
          </div>

          <!-- Delicate Hairline Arc -->
          <svg
            class="flight-arc"
            viewBox="0 0 300 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              d="M10 18 C 90 2, 210 22, 290 8"
              class="arc-track"
            />
            <circle cx="10" cy="18" r="2" class="arc-dot start" />
            <circle cx="290" cy="8" r="2.5" class="arc-dot end" />
          </svg>
        </div>

        <!-- Headline -->
        <h1 class="main-heading">
          This destination is <em>uncharted.</em>
        </h1>

        <p class="main-description">
          The route you requested cannot be located. Allow our concierge to escort you safely back to your itinerary.
        </p>

        <!-- Primary Action Buttons (Fully In View) -->
        <div class="actions-group">
          <button
            type="button"
            class="btn-primary"
            @click="handleNavigation('/')"
          >
            <Compass :size="15" />
            <span>Return to Home</span>
            <ArrowRight :size="14" class="btn-arrow" />
          </button>

          <button
            type="button"
            class="btn-secondary"
            @click="handleNavigation('/airports')"
          >
            <span>Explore UK Airports</span>
          </button>
        </div>

        <!-- Popular Gateways Row -->
        <div class="gateways-bar">
          <span class="gateways-title">Direct routes:</span>
          <div class="gateways-pills">
            <template v-for="(gw, idx) in popularGateways" :key="gw.path">
              <button
                type="button"
                class="gw-pill"
                @click="handleNavigation(gw.path)"
              >
                {{ gw.name }}
              </button>
              <span v-if="idx < popularGateways.length - 1" class="gw-sep" aria-hidden="true">·</span>
            </template>
          </div>
        </div>

        <!-- Concierge Touchpoint -->
        <div class="concierge-line">
          <span>Need immediate assistance?</span>
          <a
            :href="whatsappUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="whatsapp-link"
          >
            <span>Speak with 24/7 VIP Concierge</span>
            <ArrowUpRight :size="13" />
          </a>
        </div>
      </div>
    </main>

    <!-- Compact Viewport-Friendly Minimalist Footer Bar -->
    <footer class="viewport-footer">
      <div class="container footer-inner">
        <span class="footer-copy">© 2018 – {{ year }} Universal Travel Assistance LLC</span>
        <div class="footer-links">
          <NuxtLink to="/privacy" @click="handleNavigation('/privacy', $event)">Privacy Policy</NuxtLink>
          <span class="foot-sep">/</span>
          <NuxtLink to="/faq" @click="handleNavigation('/faq', $event)">FAQs</NuxtLink>
          <span class="foot-sep">/</span>
          <NuxtLink to="/contact" @click="handleNavigation('/contact', $event)">Contact</NuxtLink>
        </div>
      </div>
    </footer>
  </div>
</template>

<style scoped>
/* ==========================================================================
   VIEWPORT-FOCUSED MINIMALIST LIGHT LUXURY 404
   Designed to fit 100% within the visible screen area without scrolling
   ========================================================================== */

.viewport-404-root {
  min-height: 100vh;
  min-height: 100dvh;
  height: 100vh;
  height: 100dvh;
  background-color: #f8f6f1;
  color: #182a40;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  overflow-x: hidden;
  overflow-y: auto;
}

/* Ensure SiteHeader is crisp and light */
:deep(.site-header) {
  position: fixed !important;
  top: 0;
  left: 0;
  right: 0;
  z-index: 40;
  background: rgba(248, 246, 241, 0.92) !important;
  backdrop-filter: blur(16px) saturate(140%) !important;
  -webkit-backdrop-filter: blur(16px) saturate(140%) !important;
  border-bottom: 1px solid rgba(222, 218, 210, 0.7) !important;
  box-shadow: 0 2px 12px rgba(24, 42, 64, 0.02);
}

:deep(.site-header .nav-wrap) {
  border-bottom: 0 !important;
  min-height: 78px;
}

:deep(.site-header .desktop-nav a),
:deep(.site-header .menu-toggle),
:deep(.site-header .nav-cta) {
  color: #182a40 !important;
  text-shadow: none !important;
}

:deep(.site-header .desktop-nav a:hover) {
  color: #9b1c31 !important;
}

:deep(.site-header .nav-cta) {
  border: 1px solid #c7bca9 !important;
  background: rgba(255, 255, 255, 0.7) !important;
  padding: 10px 16px;
}

:deep(.site-header .nav-cta:hover) {
  background: #ffffff !important;
  transform: translateY(-2px);
}

/* Main Viewport Content */
.viewport-404-main {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: clamp(85px, 11vh, 105px) 20px 20px;
}

.content-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  max-width: 620px;
  margin: 0 auto;
}

/* Eyebrow */
.mini-kicker {
  display: inline-flex;
  align-items: center;
  gap: 14px;
  font-size: 10px;
  letter-spacing: 0.22em;
  font-weight: 700;
  color: #a28a65;
  text-transform: uppercase;
  margin-bottom: 14px;
}

.kicker-line {
  width: 24px;
  height: 1px;
  background: #a28a65;
  opacity: 0.6;
}

/* 404 Stage */
.numeral-stage {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 6px;
}

.numeral-404 {
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Playfair Display', serif;
  font-size: clamp(4.5rem, 9.5vw, 7.2rem);
  font-weight: 400;
  line-height: 0.9;
  letter-spacing: -0.04em;
  color: #182a40;
  user-select: none;
  transition: transform 0.2s ease-out;
}

.center-zero {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.jet-carrier {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
  transition: transform 0.2s ease-out;
}

.gliding-plane {
  color: #a28a65;
  filter: drop-shadow(0 2px 6px rgba(162, 138, 101, 0.4));
  animation: planeHover 3.8s ease-in-out infinite;
}

@keyframes planeHover {
  0%, 100% {
    transform: translate(-4px, -5px) rotate(-14deg);
  }
  50% {
    transform: translate(5px, -11px) rotate(-8deg);
  }
}

.flight-arc {
  width: 100%;
  max-width: 270px;
  height: 18px;
  margin-top: -6px;
  overflow: visible;
}

.arc-track {
  stroke: rgba(162, 138, 101, 0.4);
  stroke-width: 1.5;
  stroke-dasharray: 4 4;
  animation: arcTravel 16s linear infinite;
}

@keyframes arcTravel {
  to {
    stroke-dashoffset: -80;
  }
}

.arc-dot {
  fill: #182a40;
}

.arc-dot.end {
  fill: #a28a65;
}

/* Heading & Lead */
.main-heading {
  font-family: 'Playfair Display', serif;
  font-size: clamp(1.8rem, 3.2vw, 2.5rem);
  font-weight: 400;
  line-height: 1.15;
  letter-spacing: -0.03em;
  color: #182a40;
  margin: 10px 0 8px;
}

.main-heading em {
  font-style: italic;
  color: #a28a65;
  font-weight: 400;
}

.main-description {
  font-size: clamp(13px, 1.25vw, 15px);
  line-height: 1.65;
  color: #646c76;
  max-width: 470px;
  margin: 0 0 20px;
}

/* Action Buttons (Immediately in View Area) */
.actions-group {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 14px;
  flex-wrap: wrap;
  margin-bottom: 20px;
}

.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  background: #182a40;
  color: #ffffff;
  border: 0;
  border-radius: 3px;
  padding: 13px 22px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  cursor: pointer;
  box-shadow: 0 6px 18px rgba(24, 42, 64, 0.12);
  transition: background-color 0.25s, transform 0.25s, box-shadow 0.25s;
}

.btn-primary:hover {
  background: #253f5d;
  transform: translateY(-2px);
  box-shadow: 0 10px 22px rgba(24, 42, 64, 0.2);
}

.btn-arrow {
  color: #dfc299;
  transition: transform 0.2s;
}

.btn-primary:hover .btn-arrow {
  transform: translateX(3px);
}

.btn-secondary {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: #ffffff;
  color: #182a40;
  border: 1px solid #dedad2;
  border-radius: 3px;
  padding: 12px 20px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  cursor: pointer;
  transition: background-color 0.25s, border-color 0.25s, transform 0.25s;
}

.btn-secondary:hover {
  background: #fbf9f5;
  border-color: #a28a65;
  transform: translateY(-2px);
}

/* Gateways Direct Links */
.gateways-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  font-size: 12px;
  color: #77746d;
  flex-wrap: wrap;
  margin-bottom: 14px;
}

.gateways-title {
  color: #8c887f;
  font-weight: 500;
}

.gateways-pills {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.gw-pill {
  background: transparent;
  border: 0;
  padding: 0;
  color: #182a40;
  font-weight: 600;
  cursor: pointer;
  border-bottom: 1px solid transparent;
  transition: color 0.2s, border-color 0.2s;
}

.gw-pill:hover {
  color: #a28a65;
  border-bottom-color: #a28a65;
}

.gw-sep {
  color: #c7bca9;
}

/* Concierge Line */
.concierge-line {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
  color: #77746d;
  flex-wrap: wrap;
  justify-content: center;
}

.whatsapp-link {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: #182a40;
  font-weight: 700;
  border-bottom: 1px solid #a28a65;
  padding-bottom: 1px;
  transition: color 0.2s;
}

.whatsapp-link:hover {
  color: #9b1c31;
}

/* Viewport Compact Footer */
.viewport-footer {
  padding: 14px 0 16px;
  border-top: 1px solid rgba(222, 218, 210, 0.7);
  background: rgba(248, 246, 241, 0.95);
  font-size: 11px;
  color: #77746d;
}

.footer-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.footer-links {
  display: flex;
  align-items: center;
  gap: 12px;
}

.footer-links a {
  color: #182a40;
  text-decoration: none;
  transition: color 0.2s;
}

.footer-links a:hover {
  color: #a28a65;
}

.foot-sep {
  color: #c7bca9;
  font-size: 10px;
}

/* Responsive */
@media (max-width: 600px) {
  .viewport-404-main {
    padding-top: 95px;
    padding-bottom: 16px;
  }

  .main-heading {
    font-size: 1.7rem;
  }

  .main-description {
    font-size: 13px;
  }

  .actions-group {
    flex-direction: column;
    width: 100%;
    gap: 10px;
  }

  .btn-primary,
  .btn-secondary {
    width: 100%;
    justify-content: center;
  }

  .gateways-bar {
    flex-direction: column;
    gap: 6px;
  }

  .footer-inner {
    flex-direction: column;
    gap: 8px;
    text-align: center;
  }
}

/* Reduced Motion Compliance */
@media (prefers-reduced-motion: reduce) {
  .gliding-plane,
  .arc-track {
    animation: none !important;
  }

  .numeral-404,
  .jet-carrier {
    transform: none !important;
  }
}
</style>
