<script setup lang="ts">
import { airports } from '~/data/site'

const { siteName, siteUrl } = useSiteMeta()
const canonicalUrl = computed(() => `${siteUrl.value}/airports`)

useSeoMeta({
  title: computed(() => `Heathrow Meet and Greet, Fast Track & UK Airports Directory | ${siteName.value}`),
  description: computed(() => `Explore and book VIP meet and greet services across all 98 UK airports with ${siteName.value}, including London Heathrow (LHR), Gatwick (LGW), Manchester (MAN), Edinburgh (EDI) and Birmingham (BHX).`),
  keywords: computed(() => `Heathrow meet and greet, London Heathrow VIP, fast track, fastrack, Gatwick meet and greet, Manchester airport assistance, Edinburgh airport concierge, Birmingham airport fast track, Stansted fast track, UK airports directory, meet and greet all UK airports, ${siteName.value}`),
  ogTitle: computed(() => `Heathrow Meet and Greet & UK Airports Directory | ${siteName.value}`),
  ogDescription: 'Personalised arrival, departure and transit assistance options across major UK gateways and regional airfields.',
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
      <section class="interior-hero">
        <div class="container">
          <span class="luxe-kicker">OUR AIRPORTS</span>
          <h1>
            <span class="sr-only">Heathrow Meet and Greet, Fast Track &amp; All 98 UK Airports Assistance Directory — </span>
            <span class="hero-title-light">Choose your gateway.</span>
          </h1>
          <p>
            Each airport offers a distinct selection of services. Explore your destination and select the concierge assistance that suits you.
          </p>
        </div>
      </section>

      <section class="luxe-pad">
        <div class="container">
          <AirportJourneyPanel />

          <div class="airport-cards">
            <NuxtLink
              v-for="a in airports"
              :key="a.slug"
              :to="'/airports/' + a.slug"
              class="airport-card"
            >
              <div class="airport-card-img-wrap">
                <img
                  :src="a.image"
                  :alt="`${a.name} (${a.code}) airport gateway`"
                  loading="lazy"
                  decoding="async"
                  width="600"
                  height="400"
                />
                <span v-if="a.is_vip" class="airport-card-vip-badge">VIP HUB</span>
              </div>
              <div class="airport-card-content">
                <span class="airport-card-code">{{ a.code }}</span>
                <h2 class="airport-card-title">{{ a.name }}</h2>
                <span class="airport-card-cta">Explore services & pricing →</span>
              </div>
            </NuxtLink>
          </div>
        </div>
      </section>
    </main>

    <SiteFooter />
  </div>
</template>
