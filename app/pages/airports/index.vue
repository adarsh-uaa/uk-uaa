<script setup lang="ts">
import { airports } from '~/data/site'

const { siteName, siteUrl } = useSiteMeta()
const canonicalUrl = computed(() => `${siteUrl.value}/airports`)

useSeoMeta({
  title: computed(() => `UK Airports Directory | ${siteName.value}`),
  description: computed(() => `Explore and book VIP meet and greet services across all 98 UK airports with ${siteName.value}, including London Heathrow (LHR), Gatwick (LGW), Manchester (MAN), Edinburgh (EDI) and Birmingham (BHX).`),
  keywords: computed(() => `UK airports list, ${siteName.value}, London Heathrow VIP, Gatwick meet and greet, Manchester airport assistance, Edinburgh airport concierge, Birmingham airport fast track, UK airport services`),
  ogTitle: computed(() => `UK Airports Directory | ${siteName.value}`),
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
            <span style="color: #F4EADF;">Choose your </span>
            <em>gateway.</em>
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
              <div class="airport-card-img-wrap" style="position: relative;">
                <img
                  :src="a.image"
                  :alt="`${a.name} (${a.code}) airport gateway`"
                  loading="lazy"
                  decoding="async"
                  width="600"
                  height="400"
                />
                <span v-if="a.is_vip" style="position: absolute; top: 12px; left: 12px; background: #c9a86a; color: #182a40; font-size: 9px; font-weight: 800; letter-spacing: 0.12em; padding: 4px 8px; border-radius: 3px; text-transform: uppercase;">VIP HUB</span>
              </div>
              <div style="padding: 20px;">
                <span style="font-size: 11px; font-weight: 700; color: #c9a86a; letter-spacing: 0.1em;">{{ a.code }}</span>
                <h2 style="margin: 6px 0 10px; font-family: 'Playfair Display', Georgia, serif; font-size: 20px; font-weight: 500; color: #182a40;">{{ a.name }}</h2>
                <span style="font-size: 12px; font-weight: 600; color: #182a40;">Explore services & pricing →</span>
              </div>
            </NuxtLink>
          </div>
        </div>
      </section>
    </main>

    <SiteFooter />
  </div>
</template>
