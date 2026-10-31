<script setup lang="ts">
const faq = [
  {
    q: 'What is UK Airport Assistance?',
    a: 'We provide airport meet and greet services, including VIP assistance, for travellers at airports across the UK. A dedicated representative meets you and guides you through the airport so your journey is smoother and less stressful.'
  },
  {
    q: 'Which UK airports do you cover?',
    a: 'We operate at major UK airports, including London Heathrow, London Gatwick, London Stansted, London City, Manchester, Birmingham, Bristol, East Midlands, Edinburgh, Glasgow, Leeds Bradford and Newcastle. Please check the airport list on our website for the latest coverage and the services available at each airport.'
  },
  {
    q: 'Do you provide immigration Fast Track services at London airports?',
    a: 'Yes. We offer immigration Fast Track services at selected UK airports, including London Heathrow, London Gatwick, London Stansted, and Birmingham, along with several other airports. Please contact our team or check the available services on our website for airport-specific details and availability.'
  },
  {
    q: 'How do I book a service?',
    a: 'Choose your airport and required service on our website, enter the passenger and flight details, and complete the booking process. Once submitted, you will receive a quotation via email along with a payment link to proceed with the payment.'
  },
  {
    q: 'How far in advance should I book?',
    a: 'We recommend making your booking at least 48 hours before your flight to allow sufficient time for us to arrange your representative. During peak travel periods, we strongly advise booking well in advance to ensure availability. Please note that an additional charge may apply to bookings made at short notice.'
  },
  {
    q: 'Can I make changes to my booking?',
    a: 'Yes. You can request changes to your booking by contacting our team and providing your booking reference. We recommend informing us as early as possible to allow sufficient time for coordination. Please note that all amendments are subject to availability, and additional charges may apply for changes requested at short notice.'
  },
  {
    q: 'What is your cancellation and refund policy?',
    a: 'Our standard cancellation policy is 48 hours before the scheduled service. However, cancellation terms and refund eligibility may vary depending on the airport and service booked, and certain bookings may be non-refundable. Please review the applicable cancellation policy before confirming your booking or contact our team for clarification.'
  },
  {
    q: 'What is VIP terminal access?',
    a: 'VIP terminal access gives you a private, premium airport experience. You are met on arrival and escorted through a dedicated VIP terminal or suite, usually with fast-track processing, private lounge facilities and a quieter environment than the main terminal.'
  },
  {
    q: 'Is VIP terminal access available at all UK airports?',
    a: 'No. VIP Terminal access is not available at all UK airports. Currently, this facility is available only at London Heathrow and London Gatwick airports. Availability depends on the airport and the facilities offered. Please check the service details for your chosen airport when booking, or contact our team to confirm availability before your travel.'
  },
  {
    q: 'What is included in a VIP terminal service?',
    a: 'The VIP Terminal service includes a dedicated personal host, private airside transfer in a premium vehicle, exclusive VIP Suite access, assistance with passport and immigration formalities, and baggage collection coordination.'
  },
  {
    q: 'Can you arrange wheelchair assistance?',
    a: 'We can help coordinate wheelchair assistance for your journey. However, wheelchair assistance is provided and managed exclusively by the airline. Please arrange wheelchair assistance directly with your airline in advance. Our greeter will coordinate with the airline\'s wheelchair team to ensure a smooth handover and assistance throughout the airport journey.'
  },
  {
    q: 'How will I receive my booking confirmation?',
    a: 'Once your booking is submitted, you will receive a quotation via email along with a payment link. After successful payment, our team will verify service availability and confirm your booking. Once confirmed, you will receive a booking confirmation via email.'
  },
  {
    q: 'Can I book a standalone baggage handling service?',
    a: 'Yes. Standalone baggage handling is currently available only at Birmingham Airport (BHX). At all other airports, baggage assistance is included as part of the Meet & Greet service and cannot be booked separately.'
  }
]

const open = ref<number | null>(0)
const { siteName, siteUrl } = useSiteMeta()
const canonicalUrl = computed(() => `${siteUrl.value}/faq`)

useSeoMeta({
  title: computed(() => `Frequently Asked Questions | ${siteName.value} VIP Concierge`),
  description: computed(() => `Answers to the most common questions about meet and greet, VIP terminal and accessibility services at UK airports.`),
  keywords: computed(() => `airport assistance FAQ, ${siteName.value}, VIP meet and greet questions, airport fast track FAQ, UK airport concierge questions, Heathrow VIP FAQ, flight delay meet and greet`),
  ogTitle: computed(() => `Frequently Asked Questions | ${siteName.value}`),
  ogDescription: computed(() => `Answers to the most common questions about meet and greet, VIP terminal and accessibility services at UK airports.`),
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
          <p>Answers to the most common questions about meet and greet, VIP terminal and accessibility services at UK airports.</p>
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
              <span>{{ String(i + 1).padStart(2, '0') }}</span>
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
            <NuxtLink to="/book#booking-form">request airport assistance online</NuxtLink>.
          </p>
        </div>
      </section>
    </main>

    <SiteFooter />
  </div>
</template>
