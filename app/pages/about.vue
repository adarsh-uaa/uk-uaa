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
  <div class="luxe-page about-page">
    <SiteHeader />

    <main>
      <SeoPage
        :title="`About Us | ${siteName} VIP Concierge Services`"
        :description="`Discover the approach behind ${siteName}: thoughtful, discreet airport concierge enquiries across the United Kingdom.`"
        path="/about"
        heading="A personal approach."
        intro="Travel should feel calm, considered and comfortably your own."
      />

      <section class="luxe-pad about-pad">
        <div class="container about-content-wrap">
          <article class="about-card about-intro-card">
            <h2>UK Airports | Universal Airport Assistance</h2>
            <p>
              Arriving from leaving to or connecting through a UK airport can feel stressful at busy hubs
              such, as Heathrow and Gatwick. We want to make that part of your journey simple. Our
              meetandgreet and VIP airport services provide a professional face from the moment you
              step into the terminal.
            </p>
            <p style="margin-top: 16px;">
              Whether you are flying in from another country leaving from the UK or switching flights, our
              dedicated concierge staff meets you at the designated meeting point, shows you the way in
              the airport and assist you with the necessary procedures, ensuring a smooth and hassle-free
              journey. Our team is available 24/7, so help is always at hand, whatever time your flight
              lands or departs.
            </p>
          </article>

          <article class="about-card">
            <h2>Where we operate</h2>
            <p>
              We provide services at UK airports, including London Heathrow, London Gatwick, London
              Stansted, London City, Manchester, Birmingham, Bristol, East Midlands, Edinburgh,
              Glasgow, Leeds Bradford and Newcastle.
            </p>
          </article>

          <article class="about-card">
            <h2>What we offer</h2>
            <ul class="about-list">
              <li>Arrival, departure and transit meet and greet</li>
              <li>VIP terminal access</li>
              <li>Assistance for families and groups</li>
              <li>Support for business travelers and frequent flyers</li>
            </ul>
          </article>

          <article class="about-card">
            <h2>Why travelers choose us</h2>
            <ul class="about-features-list">
              <li>
                <strong>Local knowledge:</strong> our teams know how each UK airport works, including terminals,
                meeting points and procedures.
              </li>
              <li>
                <strong>Personal service:</strong> a dedicated representative looks after you throughout your airport
                journey.
              </li>
              <li>
                <strong>Clear pricing:</strong> you see what is included and what it costs before you pay.
              </li>
              <li>
                <strong>Responsive updates:</strong> we track your flight and stay in touch before and during your
                service, including when flights are delayed.
              </li>
              <li>
                <strong>24/7 support:</strong> our team is available around the clock, including early mornings, late
                nights and last-minute changes.
              </li>
            </ul>
          </article>

          <article class="about-card">
            <h2>Our promise</h2>
            <p>
              We treat every passenger as our guest. Our aim is to make each journey calm and comfortable,
              from your first booking enquiry to the moment you leave the airport.
            </p>
            <p class="about-contact-note">
              Need help planning your trip? Contact us at
              <a href="mailto:booking@mailuaa.com" class="about-email-link">booking@mailuaa.com</a>.
            </p>
          </article>
        </div>
      </section>
    </main>

    <SiteFooter />
  </div>
</template>
