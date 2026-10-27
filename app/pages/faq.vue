<script setup lang="ts">
const faq = [
  {
    q: 'Is Fast Track security and immigration available at every airport?',
    a: 'Fast Track access depends on the specific airport, terminal, and officially permitted services authorized by airport and border authorities. We verify and confirm exact inclusions for your selected airport upon booking.'
  },
  {
    q: 'Does submitting the booking form confirm my reservation?',
    a: 'Submitting the booking form initiates an official enquiry and booking request with our concierge team. Confirmation is issued once supplier availability is verified and confirmation details are processed.'
  },
  {
    q: 'Can I book assistance for children, infants or large family groups?',
    a: 'Yes. You can specify exact adult, child (2–12 years) and infant (0–2 years) counts, as well as luggage volumes. Our team coordinates dedicated greeters and buggy assistance where available to keep families together.'
  },
  {
    q: 'Can I request multiple services together?',
    a: 'Yes. You can select multiple service packages together (e.g. VIP Meet & Greet, Fast Track assistance, Lounge access, and Baggage handling) based on what is available at your departure or arrival airport.'
  },
  {
    q: 'Which journey types do you support?',
    a: 'We support Arrival, Departure, and Transit / Connection services across all 98 UK airports, with tailored meet and assist coordination for domestic and international flights.'
  },
  {
    q: 'What happens if my flight is delayed or rescheduled?',
    a: 'Our operational teams monitor live flight tracking systems. Greeters adjust their arrival times according to real-time flight updates. If you change your flight details prior to travel, notify our concierge team immediately.'
  }
]

const open = ref<number | null>(0)
const { siteName, siteUrl } = useSiteMeta()
const canonicalUrl = computed(() => `${siteUrl.value}/faq`)

useSeoMeta({
  title: computed(() => `Frequently Asked Questions | ${siteName.value} VIP Concierge`),
  description: computed(() => `Answers to common questions about VIP airport meet and greet, Fast Track security, booking confirmations, family assistance and flight changes with ${siteName.value}.`),
  keywords: computed(() => `airport assistance FAQ, ${siteName.value}, VIP meet and greet questions, airport fast track FAQ, UK airport concierge questions, Heathrow VIP FAQ, flight delay meet and greet`),
  ogTitle: computed(() => `Frequently Asked Questions | ${siteName.value}`),
  ogDescription: computed(() => `Find clear answers to frequently asked questions about VIP meet and greet, fast track, family bookings and airport concierge services across the UK with ${siteName.value}.`),
  ogType: 'website',
  ogUrl: canonicalUrl,
  twitterCard: 'summary_large_image'
})

useHead(() => ({
  link: [{ rel: 'canonical', href: canonicalUrl.value }],
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faq.map(x => ({
          '@type': 'Question',
          name: x.q,
          acceptedAnswer: {
            '@type': 'Answer',
            text: x.a
          }
        }))
      })
    }
  ]
}))
</script>

<template>
  <div class="luxe-page">
    <SiteHeader />

    <main>
      <section class="interior-hero">
        <div class="container">
          <span class="luxe-kicker">BEFORE YOU TRAVEL</span>
          <h1 style="color: #F4EADF;">
            Questions, <em>answered.</em>
          </h1>
          <p>Everything you need to know about your luxury airport concierge experience.</p>
        </div>
      </section>

      <section class="luxe-pad">
        <div class="container faq-content">
          <div
            v-for="(item, i) in faq"
            :key="item.q"
            class="luxe-faq-item"
          >
            <button
              type="button"
              :aria-expanded="open === i"
              @click="open = open === i ? null : i"
            >
              <span>0{{ i + 1 }}</span>
              <strong>{{ item.q }}</strong>
              <span aria-hidden="true">{{ open === i ? '−' : '+' }}</span>
            </button>
            <p v-if="open === i" class="luxe-faq-answer">
              {{ item.a }}
            </p>
          </div>

          <p style="margin-top: 36px;">
            Still have questions about your upcoming trip?
            <NuxtLink to="/contact">Contact our concierge team</NuxtLink>
            or
            <NuxtLink to="/book">request airport assistance online</NuxtLink>.
          </p>
        </div>
      </section>
    </main>

    <SiteFooter />
  </div>
</template>
