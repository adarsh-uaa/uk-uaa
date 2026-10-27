<script setup lang="ts">
const name = ref('')
const email = ref('')
const message = ref('')
const sent = ref(false)

const { siteName, siteUrl } = useSiteMeta()
const canonicalUrl = computed(() => `${siteUrl.value}/contact`)

useSeoMeta({
  title: computed(() => `Contact Us | ${siteName.value} VIP Concierge`),
  description: computed(() => `Get in touch with ${siteName.value} for VIP meet and greet enquiries, private terminal arrangements, family travel assistance and bespoke airport concierge across the UK.`),
  keywords: computed(() => `contact ${siteName.value}, VIP airport concierge contact, airport assistance enquiry, meet and greet helpdesk UK, London airport concierge`),
  ogTitle: computed(() => `Contact Us | ${siteName.value} VIP Concierge`),
  ogDescription: computed(() => `Get in touch with ${siteName.value} for VIP meet and greet enquiries, private terminal arrangements and bespoke airport concierge services.`),
  ogType: 'website',
  ogUrl: canonicalUrl,
  twitterCard: 'summary_large_image'
})

useHead(() => ({
  link: [{ rel: 'canonical', href: canonicalUrl.value }]
}))

function prepare() {
  sent.value = true
}
</script>

<template>
  <div class="luxe-page">
    <SiteHeader />

    <main>
      <SeoPage
        :title="`Contact Us | ${siteName} VIP Concierge`"
        :description="`Contact ${siteName} for questions about VIP meet and greet, airport service availability and booking enquiries.`"
        path="/contact"
        heading="Let's connect."
        intro="Every extraordinary journey begins with a conversation."
      />

      <section class="luxe-pad">
        <div class="container contact-grid">
          <div>
            <span class="luxe-kicker">TELL US ABOUT YOUR JOURNEY</span>
            <h2>We're here to <em>help.</em></h2>
            <p>
              For a complete flight itinerary and booking request, use our comprehensive booking page.
              For bespoke itineraries, corporate accounts, or general questions, submit an enquiry below.
            </p>
            <NuxtLink to="/book" class="luxe-link">
              Go to the booking form →
            </NuxtLink>
          </div>

          <form class="full-booking" @submit.prevent="prepare">
            <label class="premium-field" for="contact-name">
              <span>Your name *</span>
              <input id="contact-name" v-model="name" autocomplete="name" required />
            </label>

            <label class="premium-field" for="contact-email">
              <span>Email address *</span>
              <input id="contact-email" v-model="email" type="email" autocomplete="email" required />
            </label>

            <label class="premium-field" for="contact-message">
              <span>Message *</span>
              <textarea id="contact-message" v-model="message" rows="6" required></textarea>
            </label>

            <button class="premium-submit" type="submit">
              Send enquiry →
            </button>

            <p v-if="sent" role="status" class="subtle-note" style="color: #622a31; font-weight: 600;">
              Thank you for contacting us. Our VIP concierge desk will review your enquiry and get back to you promptly.
            </p>
          </form>
        </div>
      </section>
    </main>

    <SiteFooter />
  </div>
</template>
