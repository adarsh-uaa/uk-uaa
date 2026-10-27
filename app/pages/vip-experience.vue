<script setup lang="ts">
import { vipAirportsCatalog } from '~/data/booking'
import { airports } from '~/data/site'

const { siteName, siteUrl } = useSiteMeta()
const canonicalUrl = computed(() => `${siteUrl.value}/vip-experience`)

const activeVipAirport = ref('heathrow')

const vipAirports = computed(() => {
  return vipAirportsCatalog.map(hub => {
    const siteData = airports.find(a => a.slug === hub.slug)
    return {
      slug: hub.slug,
      name: hub.name,
      code: hub.code,
      id: hub.id,
      types: hub.types,
      image: siteData?.image || 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=850&q=82',
      note: siteData?.note || 'Designated VIP Airport Gateway'
    }
  })
})

function selectVipAirport(slug: string) {
  activeVipAirport.value = slug
  if (process.client) {
    const el = document.getElementById('select-journey')
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
    }
  }
}

useSeoMeta({
  title: computed(() => `VIP Airport Experience UK | ${siteName.value}`),
  description: computed(() => `Experience the epitome of luxury travel across the UK with ${siteName.value}. Dedicated VIP greeters, priority fast track, luxury airport lounges and seamless arrivals, departures and connections.`),
  keywords: computed(() => `VIP airport experience, luxury airport concierge, ${siteName.value}, private terminal London, executive airport meet and greet, fast track security UK, luxury airport lounge UK`),
  ogTitle: computed(() => `VIP Airport Experience UK | ${siteName.value}`),
  ogDescription: 'More than a service. A considered way to travel, shaped around your comfort, privacy and time.',
  ogType: 'website',
  ogUrl: canonicalUrl,
  twitterCard: 'summary_large_image'
})

useHead(() => ({
  link: [{ rel: 'canonical', href: canonicalUrl.value }]
}))
</script>

<template>
  <div class="luxe-page">
    <SiteHeader />

    <main>
      <SeoPage
        title="VIP Airport Experience UK | Luxury Meet & Greet Concierge"
        description="Explore a personalised VIP airport experience with assistance, private lounge arrangements and seamless airport journeys where available."
        path="/vip-experience"
        heading="The VIP experience."
        intro="More than a service. A considered way to travel, shaped around your comfort, privacy and time."
      />

      <section class="luxe-pad">
        <div class="container editorial-two">
          <div>
            <span class="luxe-kicker">EVERY MOMENT MATTERS</span>
            <h2>Quiet luxury.<br><em>Extraordinary care.</em></h2>
            <p>
              From an attentive airport welcome to coordinated lounge options and onward transfers, our
              role is to simplify your journey without unnecessary complication.
            </p>
            <p>
              Priority access, airside escorting and private facilities are only available where explicitly
              authorized. Each itinerary receives a tailored service confirmation.
            </p>
            <NuxtLink to="/airports" class="luxe-link">
              See airport-specific services →
            </NuxtLink>
          </div>

          <img
            src="/images/comfort-lounge.webp"
            loading="lazy"
            decoding="async"
            alt="Refined premium lounge setting with bespoke seating"
            width="1200"
            height="800"
          />
        </div>
      </section>

      <!-- Designated VIP Airports Section -->
      <section class="luxe-pad vip-airports-section" id="vip-airports">
        <div class="container">
          <div class="vip-airports-header">
            <span class="luxe-kicker">DESIGNATED VIP GATEWAYS</span>
            <h2>Featured <em>VIP Airports</em></h2>
            <p>
              Comprehensive VIP Meet & Greet, fast-track clearance, private suites and apron chauffeur transfers are featured across our premier UK gateways.
            </p>
          </div>

          <div class="vip-airports-grid">
            <div
              v-for="hub in vipAirports"
              :key="hub.slug"
              class="vip-airport-card"
              :class="{ 'is-selected': activeVipAirport === hub.slug }"
            >
              <div class="vip-card-image-wrap">
                <img
                  :src="hub.image"
                  :alt="`${hub.name} (${hub.code}) VIP Airport Gateway`"
                  loading="lazy"
                  decoding="async"
                  width="600"
                  height="400"
                />
                <div class="vip-badge-tag">VIP HUB</div>
                <div class="vip-code-tag">{{ hub.code }}</div>
              </div>

              <div class="vip-card-content">
                <div class="vip-card-title-row">
                  <h3>{{ hub.name }}</h3>
                  <span class="vip-id-tag">ID: {{ hub.id }}</span>
                </div>
                <p class="vip-card-note">{{ hub.note }}</p>

                <div class="vip-service-badges">
                  <span class="vip-service-pill">VIP Arrival</span>
                  <span class="vip-service-pill">VIP Dispatch</span>
                  <span class="vip-service-pill">VIP Transit</span>
                </div>

                <div class="vip-card-actions">
                  <button
                    type="button"
                    class="vip-select-btn"
                    :class="{ 'active': activeVipAirport === hub.slug }"
                    @click="selectVipAirport(hub.slug)"
                  >
                    {{ activeVipAirport === hub.slug ? 'Selected Hub ✓' : 'Select Airport' }}
                  </button>
                  <NuxtLink
                    :to="'/airports/' + hub.slug"
                    class="vip-explore-link"
                  >
                    Services & Cost →
                  </NuxtLink>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="luxe-pad subdued-section" id="select-journey">
        <div class="container">
          <span class="luxe-kicker">PERSONALISED FOR YOU</span>
          <h2>Arrival. Departure. Connection.</h2>
          <p>
            Choose an airport, then discover the services available for that location. Your needs define the
            experience.
          </p>
          <AirportJourneyPanel :initial-airport="activeVipAirport" :key="activeVipAirport" />
        </div>
      </section>

      <section class="container inline-cta">
        <h2>Make time for what matters.</h2>
        <NuxtLink to="/book" class="luxe-button luxe-button-cream">
          Arrange your experience →
        </NuxtLink>
      </section>
    </main>

    <SiteFooter />
  </div>
</template>

<style scoped>
.vip-airports-section {
  background: #fbf9f5;
  border-top: 1px solid #ede5da;
  border-bottom: 1px solid #ede5da;
}

.vip-airports-header {
  max-width: 680px;
  margin-bottom: 36px;
}

.vip-airports-header h2 {
  margin: 8px 0 12px;
  font-family: "Playfair Display", Georgia, serif;
  font-size: clamp(28px, 3.5vw, 42px);
  font-weight: 400;
  color: #182a40;
}

.vip-airports-header p {
  font-size: 14px;
  color: #635d55;
  line-height: 1.6;
}

.vip-airports-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 24px;
}

.vip-airport-card {
  background: #ffffff;
  border: 1px solid #e5ded3;
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
}

.vip-airport-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 28px rgba(24, 42, 64, 0.08);
  border-color: #c9a86a;
}

.vip-airport-card.is-selected {
  border-color: #c9a86a;
  box-shadow: 0 0 0 2px #c9a86a;
}

.vip-card-image-wrap {
  position: relative;
  height: 190px;
  overflow: hidden;
  background: #182a40;
}

.vip-card-image-wrap img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s ease;
}

.vip-airport-card:hover .vip-card-image-wrap img {
  transform: scale(1.05);
}

.vip-badge-tag {
  position: absolute;
  top: 12px;
  left: 12px;
  background: #c9a86a;
  color: #182a40;
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 0.12em;
  padding: 4px 8px;
  border-radius: 3px;
  text-transform: uppercase;
}

.vip-code-tag {
  position: absolute;
  bottom: 12px;
  right: 12px;
  background: rgba(24, 42, 64, 0.85);
  backdrop-filter: blur(4px);
  color: #f7f3ec;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.06em;
  padding: 4px 10px;
  border-radius: 4px;
  border: 1px solid rgba(201, 168, 106, 0.4);
}

.vip-card-content {
  padding: 20px;
  display: flex;
  flex-direction: column;
  flex: 1;
}

.vip-card-title-row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 6px;
}

.vip-card-title-row h3 {
  font-family: "Playfair Display", Georgia, serif;
  font-size: 19px;
  font-weight: 600;
  color: #182a40;
  margin: 0;
}

.vip-id-tag {
  font-size: 10px;
  color: #8c857b;
  font-weight: 600;
  background: #f4efe7;
  padding: 2px 6px;
  border-radius: 3px;
}

.vip-card-note {
  font-size: 12px;
  color: #726b62;
  margin: 0 0 14px;
}

.vip-service-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 18px;
}

.vip-service-pill {
  font-size: 10px;
  font-weight: 600;
  background: #f5f1ea;
  color: #4b453e;
  padding: 4px 8px;
  border-radius: 4px;
  border: 1px solid #e3dbce;
}

.vip-card-actions {
  margin-top: auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding-top: 14px;
  border-top: 1px solid #f0e9df;
}

.vip-select-btn {
  background: #182a40;
  color: #ffffff;
  border: none;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.04em;
  padding: 8px 14px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.vip-select-btn:hover {
  background: #c9a86a;
  color: #182a40;
}

.vip-select-btn.active {
  background: #c9a86a;
  color: #182a40;
}

.vip-explore-link {
  font-size: 11px;
  font-weight: 600;
  color: #182a40;
  text-decoration: none;
  transition: color 0.2s ease;
}

.vip-explore-link:hover {
  color: #c9a86a;
}

@media (max-width: 991px) {
  .vip-airports-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 640px) {
  .vip-airports-grid {
    grid-template-columns: 1fr;
  }
}
</style>
