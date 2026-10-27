<script setup lang="ts">
import {
  Check,
  ArrowRight,
  ArrowUpRight,
  ShieldCheck,
  Clock,
  Plane,
  Luggage,
  Sparkles,
  ChevronDown,
  ChevronUp
} from 'lucide-vue-next'
import { airports as primaryAirports } from '~/data/site'
import { airportsCatalog, selectAirport, journeyTypes, type AirportOption } from '~/data/booking'
import {
  getAirportTerminals,
  getServicePackages,
  formatServicePrice,
  type TerminalSlug,
  type ServiceDetails
} from '~/data/terminalServices'

const route = useRoute()
const primaryAirport = primaryAirports.find(a => a.slug === route.params.slug)
const catalogAirport = airportsCatalog.find(a => a.slug === route.params.slug)

if (!primaryAirport && !catalogAirport) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Airport not found'
  })
}

const airport = {
  slug: primaryAirport?.slug || catalogAirport!.slug,
  name: primaryAirport?.name || catalogAirport!.name,
  code: primaryAirport?.code || catalogAirport!.code,
  city: primaryAirport?.city || 'United Kingdom',
  image: primaryAirport?.image || 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=850&q=82',
  note: primaryAirport?.note || 'UK Airport Gateway',
  is_vip: !!(primaryAirport?.is_vip || catalogAirport?.is_vip)
}

const offer = selectAirport(airport.slug)
const { siteName, siteUrl } = useSiteMeta()
const canonicalUrl = computed(() => `${siteUrl.value}/airports/${airport.slug}`)

const pageTitle = computed(() => `${airport.name} (${airport.code}) VIP Airport Assistance & Pricing | ${siteName.value}`)
const pageDescription = computed(() => `Explore confirmed VIP meet and greet, priority fast track and luggage assistance services at ${airport.name} (${airport.code}) with transparent pricing. Compare arrival, dispatch and transit packages.`)

useSeoMeta({
  title: pageTitle,
  description: pageDescription,
  keywords: computed(() => `${airport.name} airport assistance, ${airport.code} VIP meet and greet, ${airport.name} fast track cost, ${airport.name} arrival concierge pricing, ${airport.code} departure assistance, ${siteName.value}`),
  ogTitle: pageTitle,
  ogDescription: pageDescription,
  ogType: 'website',
  ogUrl: canonicalUrl,
  ogImage: airport.image.startsWith('http')
    ? airport.image
    : computed(() => `${siteUrl.value}${airport.image}`),
  twitterCard: 'summary_large_image'
})

useHead(() => ({
  link: [{ rel: 'canonical', href: canonicalUrl.value }],
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: siteUrl.value
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Airports',
            item: `${siteUrl.value}/airports`
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: airport.name,
            item: canonicalUrl.value
          }
        ]
      })
    }
  ]
}))

// Tabs: arrival, departure, transit
const activeJourney = ref<'arrival' | 'departure' | 'transit'>('arrival')
const activeTerminal = ref<TerminalSlug>('normal')
const openedFaq = ref<number | null>(0)

const terminals = computed(() => getAirportTerminals(airport.slug))

const hasVipTerminal = computed(() => {
  const vip = terminals.value.vip
  return !!vip && Object.values(vip.services).some(pkgs => pkgs && pkgs.length > 0)
})

const availableJourneys = computed(() => {
  const allowed = (offer.types || ['arrival', 'departure', 'transit']) as readonly string[]
  return journeyTypes.filter(t => allowed.includes(t.slug))
})

const currentPackages = computed<ServiceDetails[]>(() => {
  return getServicePackages(airport.slug, activeTerminal.value, activeJourney.value)
})

function cleanServiceName(title: string): string {
  if (!title) return ''
  return title.replace(/^[A-Z]{3,4}\s*[-–—:]?\s*/i, '').trim()
}

function scrollToSection(id: string) {
  if (process.client) {
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
    }
  }
}

const airportFaqs = computed(() => [
  {
    q: `Where will my greeter meet me at ${airport.name}?`,
    a: `For arrivals, your dedicated greeter meets you at the aerobridge or aircraft arrival gate holding a personalized nameboard. For departures, meeting takes place curbside at the terminal drop-off or designated greeting desk.`
  },
  {
    q: `What happens if my flight into ${airport.name} is delayed?`,
    a: `Our concierge team monitors all flights in real time. Your personal greeter will be waiting for your actual touchdown time with zero penalty or rescheduling friction.`
  },
  {
    q: `Can I book for multiple passengers or families at ${airport.name}?`,
    a: `Yes. Standard packages include up to 3 passengers. Larger parties, family groups and corporate delegations can easily be accommodated with coordinated greeters and porter support.`
  },
  {
    q: `Are airport lounge and electric buggy services available at ${airport.name}?`,
    a: `VIP lounges, private suites, and electric buggy escorts are available depending on the terminal layout and official authority approval. Buggy and lounge arrangements can be added during the request process.`
  }
])
</script>

<template>
  <div class="luxe-page">
    <SiteHeader />

    <main>
      <!-- Hero Section -->
      <section class="interior-hero airport-detail-hero">
        <div class="container">
          <div class="hero-top-meta">
            <span class="luxe-kicker">{{ airport.code }} / UK AIRPORT GATEWAY</span>
            <span v-if="airport.is_vip" class="airport-vip-badge">
              <Sparkles :size="13" /> DESIGNATED VIP HUB
            </span>
          </div>

          <h1>
            <span style="color: #F4EADF;">{{ airport.name }} </span>
            <em>assistance.</em>
          </h1>

          <p>
            Experience bespoke airport assistance, expedited security clearance, luggage porterage and private tarmac transfers at {{ airport.name }} ({{ airport.code }}).
          </p>

          <div class="hero-quick-actions">
            <button
              type="button"
              class="luxe-button luxe-button-cream"
              @click="scrollToSection('services-catalogue')"
            >
              View Services & Pricing ↓
            </button>
            <button
              type="button"
              class="hero-ghost-btn"
              @click="scrollToSection('journey-planner')"
            >
              Configure Journey →
            </button>
          </div>
        </div>
      </section>

      <!-- 4-Feature Highlights Bar -->
      <section class="airport-highlights-strip">
        <div class="container">
          <div class="highlights-grid">
            <div class="highlight-item">
              <div class="highlight-icon"><Plane :size="20" /></div>
              <div>
                <strong>Gate & Curbside Meet</strong>
                <p>Personal greeter waiting with customized nameboard</p>
              </div>
            </div>
            <div class="highlight-item">
              <div class="highlight-icon"><ShieldCheck :size="20" /></div>
              <div>
                <strong>Fast-Track Guidance</strong>
                <p>Expedited immigration & security where authorized</p>
              </div>
            </div>
            <div class="highlight-item">
              <div class="highlight-icon"><Luggage :size="20" /></div>
              <div>
                <strong>Luggage & Porterage</strong>
                <p>Full baggage collection & customs escort</p>
              </div>
            </div>
            <div class="highlight-item">
              <div class="highlight-icon"><Clock :size="20" /></div>
              <div>
                <strong>24/7 Live Monitoring</strong>
                <p>Automated delay tracking & seamless coordination</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Editorial Overview Section -->
      <section class="luxe-pad airport-editorial-section">
        <div class="container editorial-two">
          <div>
            <span class="luxe-kicker">TAILORED TO {{ airport.code }}</span>
            <h2>Travel with <em>effortless calm.</em></h2>
            <p>
              {{ airport.name }} is one of the United Kingdom's essential travel gateways. Navigating its terminals can be demanding without dedicated guidance.
            </p>
            <p>
              Whether arriving after a long-haul flight, departing on a high-stakes business engagement, or connecting between flights, our professional greeters provide seamless support at every stage.
            </p>
            <div class="editorial-links">
              <NuxtLink to="/vip-experience" class="luxe-link">
                Explore the VIP experience →
              </NuxtLink>
              <NuxtLink to="/airports" class="luxe-link">
                All UK airports →
              </NuxtLink>
            </div>
          </div>

          <div class="editorial-image-box">
            <img
              :src="airport.image"
              :alt="`${airport.name} (${airport.code}) terminal overview`"
              loading="lazy"
              decoding="async"
              width="850"
              height="550"
            />
            <div class="editorial-image-badge">
              <span>{{ airport.city || 'United Kingdom' }}</span>
              <strong>{{ airport.code }}</strong>
            </div>
          </div>
        </div>
      </section>

      <!-- Comprehensive Services, Inclusions & Cost Showcase -->
      <section class="luxe-pad services-catalogue-section" id="services-catalogue">
        <div class="container">
          <div class="section-title-wrap">
            <span class="luxe-kicker">SERVICES PROVIDED & PRICING</span>
            <h2>Services Available at <em>{{ airport.name }}</em></h2>
            <p>
              Browse all confirmed concierge assistance packages with detailed inclusions and upfront pricing for {{ airport.name }}.
            </p>
          </div>

          <!-- Journey Filter Tabs -->
          <div class="journey-filter-tabs">
            <button
              v-for="item in availableJourneys"
              :key="item.slug"
              type="button"
              class="journey-tab-btn"
              :class="{ 'is-active': activeJourney === item.slug }"
              @click="activeJourney = item.slug as 'arrival' | 'departure' | 'transit'"
            >
              <span>{{ item.name }}</span>
            </button>
          </div>

          <!-- Terminal Switcher if VIP terminal is available -->
          <div v-if="hasVipTerminal" class="terminal-switcher-box">
            <span class="terminal-switch-label">Select Terminal Experience:</span>
            <div class="terminal-switch-buttons">
              <button
                type="button"
                :class="{ 'is-active': activeTerminal === 'normal' }"
                @click="activeTerminal = 'normal'"
              >
                Standard Terminal Concierge
              </button>
              <button
                type="button"
                :class="{ 'is-active': activeTerminal === 'vip' }"
                @click="activeTerminal = 'vip'"
              >
                VIP Private Suite & Apron Transfer
              </button>
            </div>
          </div>

          <!-- Services Grid -->
          <div v-if="currentPackages.length" class="packages-showcase-grid">
            <div
              v-for="pkg in currentPackages"
              :key="pkg.slug"
              class="package-showcase-card"
            >
              <!-- Card Top -->
              <div class="pkg-card-top">
                <div class="pkg-badge-row">
                  <span class="pkg-type-badge">
                    {{ journeyTypes.find(j => j.slug === activeJourney)?.name || 'VIP Service' }}
                  </span>
                  <span class="pkg-terminal-badge">
                    {{ activeTerminal === 'vip' ? 'VIP Private Suite' : 'Main Terminal' }}
                  </span>
                </div>
                <h3 class="pkg-card-title">{{ cleanServiceName(pkg.title) }}</h3>
              </div>

              <!-- Price Box -->
              <div class="pkg-price-box">
                <div class="pkg-price-main">
                  <span v-if="pkg.price && pkg.price.amount > 0" class="pkg-price-amount">
                    {{ formatServicePrice(pkg.price) }}
                  </span>
                  <span v-else class="pkg-price-amount">
                    Upon Request
                  </span>
                  <span v-if="pkg.price?.data" class="pkg-price-pax">
                    {{ pkg.price.data }}
                  </span>
                  <span v-else-if="pkg.price?.upToPassengers" class="pkg-price-pax">
                    Up to {{ pkg.price.upToPassengers }} passengers
                  </span>
                </div>
                <span class="pkg-price-note">Transparent fixed pricing · No hidden airport surcharges</span>
              </div>

              <!-- Inclusions Checklist -->
              <div class="pkg-inclusions-wrap">
                <span class="pkg-inclusions-label">Included in this service:</span>
                <ul class="pkg-inclusions-list">
                  <li v-for="(inc, index) in pkg.inclusions" :key="index">
                    <Check :size="15" class="inc-check-icon" />
                    <span>{{ inc }}</span>
                  </li>
                </ul>

                <!-- Additional Service Note -->
                <div v-if="pkg.additionalService" class="pkg-extra-note">
                  <strong>Optional Enhancement:</strong> {{ pkg.additionalService }}
                </div>
              </div>

              <!-- CTA Button -->
              <div class="pkg-card-footer">
                <NuxtLink
                  :to="{
                    path: '/book',
                    query: {
                      airport: airport.slug,
                      terminal: activeTerminal,
                      service: activeJourney,
                      packages: pkg.slug
                    }
                  }"
                  class="pkg-book-btn"
                >
                  Book This Service
                  <ArrowRight :size="15" />
                </NuxtLink>
              </div>
            </div>
          </div>

          <div v-else class="no-packages-notice">
            <p>Services for this combination are arranged on bespoke enquiry.</p>
            <NuxtLink
              :to="{ path: '/book', query: { airport: airport.slug, service: activeJourney } }"
              class="luxe-button luxe-button-cream"
            >
              Request Custom Quote →
            </NuxtLink>
          </div>
        </div>
      </section>

      <!-- Interactive Booking / Journey Panel Section -->
      <section class="luxe-pad subdued-section" id="journey-planner">
        <div class="container">
          <div class="section-title-wrap">
            <span class="luxe-kicker">INTERACTIVE PLANNER</span>
            <h2>Customise Your <em>{{ airport.name }}</em> Experience</h2>
            <p>
              Select your options, review exact inclusions, and proceed to confirmed booking in seconds.
            </p>
          </div>

          <AirportJourneyPanel :initial-airport="airport.slug" :key="airport.slug" />
        </div>
      </section>

      <!-- Airport FAQs Section -->
      <section class="luxe-pad airport-faq-section">
        <div class="container">
          <div class="section-title-wrap">
            <span class="luxe-kicker">FREQUENTLY ASKED QUESTIONS</span>
            <h2>{{ airport.name }} <em>Travel Guide</em></h2>
            <p>
              Common questions about meeting points, fast-track access and procedures at {{ airport.name }}.
            </p>
          </div>

          <div class="airport-faqs-grid">
            <div
              v-for="(faq, i) in airportFaqs"
              :key="i"
              class="airport-faq-card"
              :class="{ 'is-open': openedFaq === i }"
            >
              <button
                type="button"
                class="airport-faq-trigger"
                :aria-expanded="openedFaq === i"
                @click="openedFaq = openedFaq === i ? null : i"
              >
                <span>{{ faq.q }}</span>
                <ChevronDown :size="18" class="faq-chevron" :class="{ 'rotate-180': openedFaq === i }" />
              </button>
              <div v-show="openedFaq === i" class="airport-faq-answer">
                <p>{{ faq.a }}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Bottom Inline CTA -->
      <section class="container inline-cta">
        <h2>Reserve your {{ airport.name }} journey.</h2>
        <NuxtLink
          :to="{ path: '/book', query: { airport: airport.slug } }"
          class="luxe-button luxe-button-cream"
        >
          Request Assistance Now →
        </NuxtLink>
      </section>
    </main>

    <SiteFooter />
  </div>
</template>

<style scoped>
.airport-detail-hero {
  padding-bottom: 50px;
}

.hero-top-meta {
  display: flex;
  align-items: center;
  gap: 14px;
  flex-wrap: wrap;
  margin-bottom: 8px;
}

.airport-vip-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #c9a86a;
  color: #182a40;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.12em;
  padding: 4px 10px;
  border-radius: 4px;
  text-transform: uppercase;
}

.hero-quick-actions {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-top: 28px;
  flex-wrap: wrap;
}

.hero-ghost-btn {
  background: transparent;
  color: #f4eadf;
  border: 1px solid rgba(244, 234, 223, 0.4);
  padding: 13px 24px;
  font-size: 13px;
  font-weight: 600;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.25s ease;
}

.hero-ghost-btn:hover {
  background: rgba(244, 234, 223, 0.1);
  border-color: #c9a86a;
  color: #c9a86a;
}

/* Highlights Bar */
.airport-highlights-strip {
  background: #182a40;
  color: #ffffff;
  padding: 26px 0;
  border-bottom: 1px solid rgba(201, 168, 106, 0.3);
}

.highlights-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 20px;
}

.highlight-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.highlight-icon {
  color: #c9a86a;
  flex-shrink: 0;
  margin-top: 2px;
}

.highlight-item strong {
  display: block;
  font-size: 13px;
  font-weight: 700;
  color: #f7f3ec;
  margin-bottom: 2px;
}

.highlight-item p {
  font-size: 11px;
  color: #b1bdcb;
  margin: 0;
  line-height: 1.4;
}

/* Editorial */
.airport-editorial-section {
  padding: 44px 0 28px !important;
}

.editorial-links {
  display: flex;
  gap: 20px;
  margin-top: 24px;
  flex-wrap: wrap;
}

.editorial-image-box {
  position: relative;
  border-radius: 6px;
  overflow: hidden;
  box-shadow: 0 16px 36px rgba(24, 42, 64, 0.12);
  aspect-ratio: 16 / 10;
  max-height: 380px;
}

.editorial-image-box img {
  width: 100%;
  height: 100%;
  max-height: 380px;
  aspect-ratio: 16 / 10 !important;
  object-fit: cover;
  display: block;
}

.editorial-image-badge {
  position: absolute;
  bottom: 16px;
  left: 16px;
  background: rgba(24, 42, 64, 0.9);
  backdrop-filter: blur(6px);
  padding: 8px 14px;
  border-radius: 4px;
  border: 1px solid rgba(201, 168, 106, 0.5);
  display: flex;
  flex-direction: column;
}

.editorial-image-badge span {
  font-size: 10px;
  color: #c9a86a;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.editorial-image-badge strong {
  font-size: 16px;
  color: #ffffff;
}

/* Services Catalogue Section */
.services-catalogue-section {
  background: #fbf9f5;
  border-top: 1px solid #ede5da;
  padding: 38px 0 54px !important;
}

.subdued-section {
  padding: 44px 0 54px !important;
}

.airport-faq-section {
  padding: 44px 0 54px !important;
}

.inline-cta {
  padding: 50px 0 70px !important;
}

.section-title-wrap {
  max-width: 680px;
  margin-bottom: 32px;
}

.section-title-wrap h2 {
  font-family: "Playfair Display", Georgia, serif;
  font-size: clamp(26px, 3.2vw, 38px);
  font-weight: 400;
  color: #182a40;
  margin: 6px 0 10px;
}

.section-title-wrap p {
  font-size: 14px;
  color: #635d55;
  line-height: 1.6;
}

/* Tabs */
.journey-filter-tabs {
  display: flex;
  gap: 10px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.journey-tab-btn {
  background: #ffffff;
  border: 1px solid #dcd4c7;
  color: #403b34;
  padding: 12px 22px;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.04em;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.journey-tab-btn:hover {
  border-color: #c9a86a;
  color: #182a40;
}

.journey-tab-btn.is-active {
  background: #182a40;
  border-color: #182a40;
  color: #ffffff;
  box-shadow: 0 4px 12px rgba(24, 42, 64, 0.15);
}

/* Terminal switcher */
.terminal-switcher-box {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 28px;
  padding: 12px 16px;
  background: #f1ebdF;
  border-radius: 6px;
  flex-wrap: wrap;
}

.terminal-switch-label {
  font-size: 12px;
  font-weight: 700;
  color: #403b34;
}

.terminal-switch-buttons {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.terminal-switch-buttons button {
  background: #ffffff;
  border: 1px solid #d4cab9;
  font-size: 12px;
  font-weight: 600;
  padding: 7px 14px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.terminal-switch-buttons button.is-active {
  background: #c9a86a;
  border-color: #c9a86a;
  color: #182a40;
  font-weight: 700;
}

/* Packages Grid */
.packages-showcase-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 24px;
}

.package-showcase-card {
  background: #ffffff;
  border: 1px solid #e5ded3;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
}

.package-showcase-card:hover {
  transform: translateY(-4px);
  border-color: #c9a86a;
  box-shadow: 0 14px 32px rgba(24, 42, 64, 0.08);
}

.pkg-card-top {
  padding: 22px 22px 16px;
  border-bottom: 1px solid #f2ece2;
}

.pkg-badge-row {
  display: flex;
  gap: 8px;
  margin-bottom: 10px;
  flex-wrap: wrap;
}

.pkg-type-badge {
  font-size: 10px;
  font-weight: 700;
  background: #182a40;
  color: #ffffff;
  padding: 3px 8px;
  border-radius: 3px;
  letter-spacing: 0.04em;
}

.pkg-terminal-badge {
  font-size: 10px;
  font-weight: 600;
  background: #f3efe8;
  color: #5c5449;
  padding: 3px 8px;
  border-radius: 3px;
  border: 1px solid #e0d7c9;
}

.pkg-card-title {
  font-family: "Playfair Display", Georgia, serif;
  font-size: 19px;
  font-weight: 600;
  color: #182a40;
  line-height: 1.3;
  margin: 0;
}

.pkg-price-box {
  padding: 16px 22px;
  background: #fbf9f5;
  border-bottom: 1px solid #f0e9df;
}

.pkg-price-main {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 4px;
}

.pkg-price-amount {
  font-size: 26px;
  font-weight: 800;
  color: #182a40;
  letter-spacing: -0.02em;
}

.pkg-price-pax {
  font-size: 11px;
  font-weight: 600;
  color: #797268;
}

.pkg-price-note {
  font-size: 10px;
  color: #8c857b;
  display: block;
}

.pkg-inclusions-wrap {
  padding: 18px 22px;
  display: flex;
  flex-direction: column;
  flex: 1;
}

.pkg-inclusions-label {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: #182a40;
  text-transform: uppercase;
  margin-bottom: 12px;
  display: block;
}

.pkg-inclusions-list {
  list-style: none;
  padding: 0;
  margin: 0 0 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.pkg-inclusions-list li {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  font-size: 12px;
  color: #4b453e;
  line-height: 1.5;
}

.inc-check-icon {
  color: #c9a86a;
  flex-shrink: 0;
  margin-top: 2px;
}

.pkg-extra-note {
  background: #f7f3ec;
  border-left: 3px solid #c9a86a;
  padding: 8px 12px;
  font-size: 11px;
  color: #5a544b;
  border-radius: 0 4px 4px 0;
  margin-top: auto;
  line-height: 1.4;
}

.pkg-card-footer {
  padding: 16px 22px 22px;
}

.pkg-book-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  background: #182a40;
  color: #ffffff;
  padding: 12px 18px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-decoration: none;
  transition: all 0.2s ease;
}

.pkg-book-btn:hover {
  background: #c9a86a;
  color: #182a40;
}

.no-packages-notice {
  text-align: center;
  padding: 40px;
  background: #ffffff;
  border: 1px solid #e7ded2;
  border-radius: 8px;
}

.no-packages-notice p {
  color: #635d55;
  font-size: 14px;
  margin-bottom: 16px;
}

/* FAQs */
.airport-faqs-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-width: 820px;
}

.airport-faq-card {
  background: #ffffff;
  border: 1px solid #e5ded3;
  border-radius: 6px;
  overflow: hidden;
  transition: border-color 0.2s ease;
}

.airport-faq-card.is-open {
  border-color: #c9a86a;
}

.airport-faq-trigger {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 18px 22px;
  background: none;
  border: none;
  text-align: left;
  font-size: 14px;
  font-weight: 700;
  color: #182a40;
  cursor: pointer;
}

.faq-chevron {
  color: #c9a86a;
  flex-shrink: 0;
  transition: transform 0.25s ease;
}

.rotate-180 {
  transform: rotate(180deg);
}

.airport-faq-answer {
  padding: 0 22px 18px;
}

.airport-faq-answer p {
  font-size: 13px;
  color: #5c554c;
  line-height: 1.6;
  margin: 0;
}

/* Responsive */
@media (max-width: 991px) {
  .highlights-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 640px) {
  .highlights-grid {
    grid-template-columns: 1fr;
  }
  .packages-showcase-grid {
    grid-template-columns: 1fr;
  }
}
</style>
