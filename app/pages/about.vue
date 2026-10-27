<script setup lang="ts">
const { siteName, siteUrl } = useSiteMeta()
const canonicalUrl = computed(() => `${siteUrl.value}/about`)

useSeoMeta({
  title: computed(() => `About Us | ${siteName.value} VIP Concierge Services`),
  description: computed(() => `Learn about ${siteName.value}: dedicated to delivering effortless, discreet VIP airport concierge, meet & greet and private travel services across UK airports.`),
  keywords: computed(() => `about ${siteName.value}, VIP travel concierge UK, luxury airport assistance team, Heathrow meet and greet company, bespoke travel concierge`),
  ogTitle: computed(() => `About Us | ${siteName.value} — Considered Travel`),
  ogDescription: computed(() => `Thoughtful, discreet airport concierge services across major UK gateways with ${siteName.value}.`),
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
        :title="`About Us | ${siteName} VIP Concierge Services`"
        :description="`Discover the approach behind ${siteName}: thoughtful, discreet airport concierge enquiries across the United Kingdom.`"
        path="/about"
        heading="A personal approach."
        intro="Travel should feel calm, considered and comfortably your own."
      />

      <section class="luxe-pad">
        <div class="container editorial-two">
          <div>
            <span class="luxe-kicker">OUR PHILOSOPHY</span>
            <h2>Your time is <em>precious.</em></h2>
            <p>
              {{ siteName }} helps travellers explore personalised airport meet and assist options
              across major UK gateways and regional airfields.
            </p>
            <p>
              We believe in clear service descriptions, a considered booking experience and realistic
              expectations. Availability and any priority access are verified with certified service partners before
              confirmation.
            </p>
            <NuxtLink to="/vip-experience" class="luxe-link">
              Explore the VIP experience →
            </NuxtLink>
          </div>

          <img
            src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1200&q=85"
            loading="lazy"
            decoding="async"
            alt="Aircraft soaring through tranquil skies – VIP air travel"
            width="1200"
            height="800"
          />
        </div>
      </section>

      <section class="container inline-cta">
        <h2>Discover the airports we serve.</h2>
        <NuxtLink to="/airports" class="luxe-button luxe-button-cream">
          Explore airports →
        </NuxtLink>
      </section>
    </main>

    <SiteFooter />
  </div>
</template>
