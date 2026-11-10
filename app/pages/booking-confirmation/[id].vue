<script setup lang="ts">
import {
  Mail,
  Receipt,
  CheckCircle2,
  FileCheck,
  Plane,
  Copy,
  Check,
  ArrowUpRight,
  ChevronDown
} from 'lucide-vue-next'

const route = useRoute()
const { siteName, siteUrl, whatsappUrl } = useSiteMeta()

const referenceId = computed(() => {
  const raw = route.params.id
  if (Array.isArray(raw)) return raw[0] || 'ENQ-PENDING'
  return String(raw || 'ENQ-PENDING')
})

const canonicalUrl = computed(
  () => `${siteUrl.value}/booking-confirmation/${encodeURIComponent(referenceId.value)}`
)

useSeoMeta({
  title: computed(() => `Booking Confirmation #${referenceId.value} | ${siteName.value}`),
  description: computed(
    () => `Booking request received. Enquiry reference #${referenceId.value}. Our VIP concierge desk will review your details and send confirmation promptly.`
  ),
  robots: 'noindex, nofollow',
  ogTitle: computed(() => `Booking Confirmation #${referenceId.value} | ${siteName.value}`),
  ogDescription: 'Your VIP airport assistance booking request has been received.',
  ogType: 'website',
  ogUrl: canonicalUrl,
  twitterCard: 'summary'
})

useHead(() => ({
  link: [{ rel: 'canonical', href: canonicalUrl.value }]
}))

const copied = ref(false)

async function copyReference() {
  if (!referenceId.value) return
  try {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(referenceId.value)
    } else {
      const textarea = document.createElement('textarea')
      textarea.value = referenceId.value
      textarea.style.position = 'fixed'
      textarea.style.opacity = '0'
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
    }
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2500)
  } catch (err) {
    console.warn('Copy reference failed:', err)
  }
}

function scrollToDetails() {
  const el = document.getElementById('confirmation-details')
  if (el) {
    el.scrollIntoView({ behavior: 'smooth' })
  }
}

const steps = [
  {
    number: '01',
    title: 'Check Your Email',
    description:
      'You’ll receive a quick thank-you email confirming that we’ve successfully received your booking enquiry.',
    icon: Mail
  },
  {
    number: '02',
    title: 'Quote & Payment Link',
    description:
      'Our team will carefully check your booking request and send you the best available quote along with a secure payment link via email.',
    icon: Receipt
  },
  {
    number: '03',
    title: 'Review & Confirm',
    description:
      'You’ll have the flexibility to review your options, choose the service that best suits your needs, and proceed with payment.',
    icon: CheckCircle2
  },
  {
    number: '04',
    title: 'Confirmation Email',
    description:
      'Once your payment is received, our team will check the service availability. Once confirmed, you will receive a confirmation email along with your service voucher, containing all the details you need in one place.',
    icon: FileCheck
  },
  {
    number: '05',
    title: 'Meet & Assist at the Airport',
    description:
      'On the day of travel, our friendly airport representative will meet you at the designated point and ensure a smooth, stress-free airport experience.',
    icon: Plane
  }
]
</script>

<template>
  <div class="luxe-page confirmation-page">
    <SiteHeader />

    <main>
      <!-- Hero / Status Section -->
      <section class="interior-hero confirmation-hero">
        <div class="container confirmation-hero-content">
          <!-- Lottie Tick Animation -->
          <div class="confirmation-lottie-box">
            <ClientOnly>
              <LottieAnimation
                animation-link="https://lottie.host/a1a9dde2-d1f6-488a-9950-c609c6d8b8ef/pCwjgN0cho.json"
                :width="120"
                :height="120"
                :loop="false"
                :auto-play="true"
              />
              <template #fallback>
                <div class="confirmation-fallback-tick" aria-hidden="true">✓</div>
              </template>
            </ClientOnly>
          </div>

          <span class="luxe-kicker">ENQUIRY CONFIRMATION</span>
          <h1>
            Booking Request Received.
          </h1>
          <p class="confirmation-lead">
            Your booking request has been received by our concierge service. Our VIP concierge desk will review your details and send confirmation promptly.
          </p>

          <!-- Enquiry Reference Pill -->
          <div class="reference-badge-wrap">
            <div class="reference-badge">
              <span class="ref-label">Enquiry Reference:</span>
              <span class="ref-value">{{ referenceId }}</span>
              <button
                type="button"
                class="copy-ref-btn"
                :title="copied ? 'Copied to clipboard' : 'Copy reference'"
                :aria-label="copied ? 'Copied' : 'Copy enquiry reference'"
                @click="copyReference"
              >
                <Check v-if="copied" :size="15" class="copied-check" />
                <Copy v-else :size="15" />
                <span>{{ copied ? 'Copied' : 'Copy' }}</span>
              </button>
            </div>
          </div>

          <!-- Minimalist Scroll Down Cue with Contextual Text -->
          <a
            href="#confirmation-details"
            class="scroll-down-minimal"
            aria-label="Scroll down to explore what happens next and booking details"
            @click.prevent="scrollToDetails"
          >
            <span class="scroll-text">Explore What Happens Next</span>
            <div class="minimal-chevrons-grid" aria-hidden="true">
              <div class="chevron-row row-1">
                <ChevronDown :size="16" class="grid-chevron" />
                <ChevronDown :size="16" class="grid-chevron" />
                <ChevronDown :size="16" class="grid-chevron" />
              </div>
              <div class="chevron-row row-2">
                <ChevronDown :size="16" class="grid-chevron" />
                <ChevronDown :size="16" class="grid-chevron" />
                <ChevronDown :size="16" class="grid-chevron" />
              </div>
              <div class="chevron-row row-3">
                <ChevronDown :size="16" class="grid-chevron" />
                <ChevronDown :size="16" class="grid-chevron" />
                <ChevronDown :size="16" class="grid-chevron" />
              </div>
            </div>
          </a>
        </div>
      </section>

      <!-- Next Steps & Thank You Section -->
      <section id="confirmation-details" class="luxe-pad confirmation-pad">
        <div class="container confirmation-wrap">
          <!-- Thank You Card -->
          <article class="confirmation-thankyou-card">
            <div class="thankyou-badge">CONFIRMATION DETAILS</div>
            <h2>Thank You for Your Booking!</h2>
            <p>
              Your booking has been received successfully. A confirmation email with all the details has been sent to your inbox.
            </p>
          </article>

          <!-- Next Steps List -->
          <div class="next-steps-container">
            <div class="next-steps-header">
              <span class="luxe-kicker">WHAT HAPPENS NEXT</span>
              <h2>Your journey, from here to the runway.</h2>
              <p>Here is what you can expect as our team coordinates your VIP airport assistance:</p>
            </div>

            <ol class="next-steps-list">
              <li
                v-for="step in steps"
                :key="step.number"
                class="next-step-card"
              >
                <div class="step-badge">
                  <component :is="step.icon" :size="20" class="step-icon" />
                  <span class="step-num">{{ step.number }}</span>
                </div>

                <div class="step-content">
                  <h3>{{ step.title }}</h3>
                  <p>{{ step.description }}</p>
                </div>
              </li>
            </ol>
          </div>

          <!-- Action Buttons -->
          <div class="confirmation-actions">
            <NuxtLink to="/book" class="luxe-button luxe-button-gold">
              Arrange Another Journey
              <ArrowUpRight :size="16" />
            </NuxtLink>

            <NuxtLink to="/" class="hero-ghost-btn">
              Return to Home
            </NuxtLink>

            <!-- <a
              :href="whatsappUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="hero-ghost-btn whatsapp-action"
            >
              <WhatsAppIcon :size="18" color="#ffffff" />
              <span>WhatsApp Concierge</span>
            </a> -->
          </div>
        </div>
      </section>
    </main>

    <SiteFooter />
  </div>
</template>

<style scoped>
.confirmation-hero {
  text-align: center;
  min-height: 100vh;
  min-height: 100svh;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  padding: 105px 0 28px;
  box-sizing: border-box;
}

.confirmation-hero-content {
  max-width: 820px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  width: 100%;
}

.confirmation-lottie-box {
  margin-bottom: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.confirmation-fallback-tick {
  width: 90px;
  height: 90px;
  line-height: 90px;
  text-align: center;
  font-size: 46px;
  font-weight: bold;
  color: #c9a86a;
  background: rgba(201, 168, 106, 0.15);
  border: 1px solid rgba(201, 168, 106, 0.4);
  border-radius: 50%;
  margin: 0 auto;
}

.confirmation-hero h1 {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: clamp(36px, 5.5vw, 64px);
  color: #f4eadf;
  margin: 16px 0 18px;
  font-weight: 400;
  line-height: 1.15;
}

.confirmation-hero h1 em {
  color: #c9a86a;
  font-style: italic;
}

.confirmation-lead {
  font-size: clamp(16px, 1.8vw, 18.5px);
  color: #f4ede3;
  line-height: 1.65;
  max-width: 660px;
  margin: 0 auto 28px;
  text-shadow: 0 1px 6px rgba(0, 0, 0, 0.45);
}

.reference-badge-wrap {
  display: flex;
  justify-content: center;
  width: 100%;
}

.reference-badge {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  background: rgba(16, 29, 45, 0.85);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(201, 168, 106, 0.45);
  padding: 10px 18px;
  border-radius: 6px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35);
}

.ref-label {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #dcc5a5;
}

.ref-value {
  font-family: monospace;
  font-size: 17px;
  font-weight: 700;
  color: #ffffff;
  letter-spacing: 0.05em;
  padding: 2px 8px;
  background: rgba(201, 168, 106, 0.2);
  border-radius: 4px;
}

.copy-ref-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 10px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(201, 168, 106, 0.3);
  color: #f4eadf;
  border-radius: 4px;
  font-size: 11.5px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.copy-ref-btn:hover {
  background: #c9a86a;
  color: #182a40;
}

.copied-check {
  color: #48bb78;
}

/* ------------------------------------------------------------- */
/* Minimalist Scroll Down Chevrons Grid (3x3 Horizontal/Vertical) */
/* ------------------------------------------------------------- */

.scroll-down-minimal {
  margin-top: auto;
  margin-bottom: 12px;
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  text-decoration: none;
  cursor: pointer;
  padding: 8px 14px;
  background: transparent;
  border: none;
  user-select: none;
  transition: transform 0.25s ease;
}

.scroll-down-minimal:hover {
  transform: translateY(3px);
}

.scroll-down-minimal:focus-visible {
  outline: 2px solid #c9a86a;
  outline-offset: 4px;
  border-radius: 4px;
}

.scroll-text {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: #dcc5a5;
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.7);
  transition: color 0.25s ease;
}

.scroll-down-minimal:hover .scroll-text {
  color: #ffffff;
}

.minimal-chevrons-grid {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #c9a86a;
  transition: color 0.25s ease;
}

.scroll-down-minimal:hover .minimal-chevrons-grid {
  color: #ffffff;
}

.chevron-row {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.row-1 {
  animation: rowCascade 1.6s cubic-bezier(0.4, 0, 0.2, 1) infinite;
  animation-delay: 0s;
}

.row-2 {
  margin-top: -6px;
  animation: rowCascade 1.6s cubic-bezier(0.4, 0, 0.2, 1) infinite;
  animation-delay: 0.18s;
}

.row-3 {
  margin-top: -6px;
  animation: rowCascade 1.6s cubic-bezier(0.4, 0, 0.2, 1) infinite;
  animation-delay: 0.36s;
}

.grid-chevron {
  stroke-width: 2.25;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.75));
  transition: filter 0.25s ease;
}

.scroll-down-minimal:hover .grid-chevron {
  filter: drop-shadow(0 0 8px rgba(201, 168, 106, 0.95));
}

@keyframes rowCascade {
  0%, 100% {
    opacity: 0.35;
    transform: translateY(0);
  }
  50% {
    opacity: 1;
    transform: translateY(3.5px);
  }
}

@media (prefers-reduced-motion: reduce) {
  .row-1,
  .row-2,
  .row-3 {
    animation: none;
    opacity: 0.85;
    transform: none;
  }
}

/* ------------------------------------------ */
/* Confirmation Content Body                  */
/* ------------------------------------------ */

.confirmation-pad {
  padding-top: 48px;
  padding-bottom: 96px;
  scroll-margin-top: 90px;
}

.confirmation-wrap {
  max-width: 860px;
  margin: 0 auto;
}

.confirmation-thankyou-card {
  background: #ffffff;
  border: 1px solid rgba(201, 168, 106, 0.35);
  border-radius: 10px;
  padding: 36px 32px;
  margin-bottom: 48px;
  box-shadow: 0 12px 36px rgba(24, 42, 64, 0.06);
  position: relative;
}

.thankyou-badge {
  display: inline-block;
  font-size: 9.5px;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #182a40;
  background: #c9a86a;
  padding: 4px 10px;
  border-radius: 3px;
  margin-bottom: 14px;
}

.confirmation-thankyou-card h2 {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: clamp(24px, 3.2vw, 32px);
  color: #182a40;
  margin: 0 0 10px;
  font-weight: 500;
}

.confirmation-thankyou-card p {
  font-size: 15.5px;
  color: #5c554c;
  line-height: 1.65;
  margin: 0;
}

/* ------------------------------------------ */
/* Next Steps Section                         */
/* ------------------------------------------ */

.next-steps-container {
  margin-bottom: 52px;
}

.next-steps-header {
  margin-bottom: 28px;
}

.next-steps-header h2 {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: clamp(24px, 3.5vw, 34px);
  color: #182a40;
  margin: 8px 0 10px;
  font-weight: 500;
}

.next-steps-header p {
  font-size: 15px;
  color: #7a736a;
  margin: 0;
}

.next-steps-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.next-step-card {
  display: flex;
  align-items: flex-start;
  gap: 20px;
  background: #ffffff;
  border: 1px solid #ebe5dc;
  border-radius: 8px;
  padding: 24px 26px;
  transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
}

.next-step-card:hover {
  transform: translateY(-2px);
  border-color: #c9a86a;
  box-shadow: 0 8px 24px rgba(24, 42, 64, 0.06);
}

.step-badge {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 52px;
  min-width: 52px;
  height: 52px;
  background: #182a40;
  color: #c9a86a;
  border-radius: 8px;
  gap: 3px;
  padding: 6px;
}

.step-icon {
  stroke-width: 1.75;
}

.step-num {
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.1em;
  color: #f4eadf;
}

.step-content {
  flex: 1;
}

.step-content h3 {
  font-size: 17px;
  font-weight: 700;
  color: #182a40;
  margin: 0 0 6px;
  letter-spacing: -0.01em;
}

.step-content p {
  font-size: 14.5px;
  color: #5c554c;
  line-height: 1.6;
  margin: 0;
}

/* ------------------------------------------ */
/* Actions                                    */
/* ------------------------------------------ */

.confirmation-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding-top: 16px;
}

.luxe-button-gold {
  background: #c9a86a;
  color: #182a40;
  font-weight: 700;
  border: 1px solid #c9a86a;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 13px 28px;
  border-radius: 4px;
  text-decoration: none;
  font-size: 13.5px;
  letter-spacing: 0.06em;
  transition: all 0.2s ease;
}

.luxe-button-gold:hover {
  background: #b18b65;
  color: #ffffff;
  border-color: #b18b65;
}

.whatsapp-action {
  background: #0f7a4d !important;
  color: #ffffff !important;
  border-color: #0f7a4d !important;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.whatsapp-action:hover {
  background: #0d633f !important;
  border-color: #0d633f !important;
}

/* ------------------------------------------ */
/* Responsive                                 */
/* ------------------------------------------ */

@media (max-width: 767px) {
  .confirmation-hero {
    min-height: 100vh;
    min-height: 100svh;
    padding: 92px 0 20px;
  }

  .scroll-down-minimal {
    margin-top: auto;
    margin-bottom: 8px;
    padding: 6px 10px;
  }

  .confirmation-pad {
    padding-top: 32px;
    padding-bottom: 64px;
    scroll-margin-top: 80px;
  }

  .confirmation-thankyou-card {
    padding: 24px 20px;
  }

  .next-step-card {
    padding: 18px 16px;
    gap: 14px;
  }

  .step-badge {
    width: 44px;
    min-width: 44px;
    height: 44px;
  }

  .reference-badge {
    flex-direction: column;
    gap: 8px;
    width: 100%;
    text-align: center;
  }

  .confirmation-actions {
    flex-direction: column;
    width: 100%;
  }

  .confirmation-actions > * {
    width: 100%;
    justify-content: center;
    text-align: center;
  }
}
</style>

