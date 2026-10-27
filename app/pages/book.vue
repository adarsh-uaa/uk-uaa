<script setup lang="ts">
const { siteName, siteUrl } = useSiteMeta()
const canonicalUrl = computed(() => `${siteUrl.value}/book`)

useSeoMeta({
  title: computed(() => `Book VIP Airport Assistance | ${siteName.value}`),
  description: computed(() => `Book premium VIP airport assistance across all 98 UK airports with ${siteName.value}. Reserve arrival, departure or transit concierge services, fast track and meet & greet in minutes.`),
  keywords: computed(() => `book airport assistance UK, ${siteName.value}, reserve VIP meet and greet, airport fast track booking, Heathrow concierge booking, Gatwick meet and assist reservation, airport luggage assistance`),
  ogTitle: computed(() => `Book VIP Airport Assistance | ${siteName.value}`),
  ogDescription: computed(() => `Reserve bespoke VIP airport assistance across the UK with ${siteName.value}. Tailored arrival, departure and connection concierge services.`),
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
          <span class="luxe-kicker">THE ART OF EFFORTLESS TRAVEL</span>
          <h1 style="color: #F4EADF;">Arrange your <em>journey.</em></h1>
          <p>Tell us a little about your travel plans. We’ll help coordinate the finer details.</p>
        </div>
      </section>

      <section class="luxe-pad">
        <div class="container booking-layout">
          <FullBookingForm />

          <aside class="booking-aside">
            <span class="luxe-kicker">A MORE CONSIDERED JOURNEY</span>
            <h2>Exclusively yours.</h2>
            <p>
              Premium meet and assist services across the United Kingdom, tailored to your airport and
              journey preferences.
            </p>
            <img
              src="/images/airport.webp"
              alt="Luxury airport passenger assistance illustration"
              loading="lazy"
              decoding="async"
              width="600"
              height="400"
            />
          </aside>
        </div>
      </section>
    </main>

    <SiteFooter />
  </div>
</template>
