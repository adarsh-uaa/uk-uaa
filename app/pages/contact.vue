<script setup lang="ts">
const name = ref('')
const email = ref('')
const phone = ref('')
const message = ref('')
const honeypot = ref('')
const sent = ref(false)
const loading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const toast = useToast()
const { siteName, siteUrl, whatsappUrl } = useSiteMeta()
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

async function handleSubmit() {
  if (loading.value) return
  errorMessage.value = ''
  successMessage.value = ''
  sent.value = false

  loading.value = true

  try {
    const res = await $fetch<{ success: boolean; message: string }>('/api/contact', {
      method: 'POST',
      body: {
        name: name.value,
        email: email.value,
        phone: phone.value,
        message: message.value,
        website_check: honeypot.value
      }
    })

    sent.value = true
    successMessage.value = res.message || 'Thank you for contacting us. Our VIP concierge desk will review your enquiry and get back to you promptly.'

    toast.success({
      title: 'Enquiry Received',
      message: successMessage.value
    })

    // Reset form fields
    name.value = ''
    email.value = ''
    phone.value = ''
    message.value = ''
  } catch (err: any) {
    const msg = err?.data?.statusMessage || err?.statusMessage || err?.message || 'Failed to submit enquiry. Please try again later.'
    errorMessage.value = msg
    toast.error({
      title: 'Submission Failed',
      message: msg
    })
  } finally {
    loading.value = false
  }
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
            <div class="contact-direct-options">
              <a
                :href="whatsappUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="contact-whatsapp-btn"
                aria-label="Chat on WhatsApp"
              >
                <WhatsAppIcon :size="22" color="#ffffff" />
                <span>WhatsApp</span>
              </a>

              <NuxtLink to="/book#booking-form" class="luxe-link">
                Go to the booking form →
              </NuxtLink>
            </div>
          </div>

          <form class="full-booking" @submit.prevent="handleSubmit">
            <!-- Honeypot field for bot spam deterrence -->
            <div style="display: none;" aria-hidden="true">
              <input v-model="honeypot" tabindex="-1" autocomplete="off" name="website_check" />
            </div>

            <label class="premium-field" for="contact-name">
              <span>Your name *</span>
              <input id="contact-name" v-model="name" autocomplete="name" required placeholder="e.g. Lord Harrington" />
            </label>

            <label class="premium-field" for="contact-email">
              <span>Email address *</span>
              <input id="contact-email" v-model="email" type="email" autocomplete="email" required placeholder="e.g. client@example.com" />
            </label>

            <label class="premium-field" for="contact-phone">
              <span>Phone number (optional)</span>
              <input id="contact-phone" v-model="phone" type="tel" autocomplete="tel" placeholder="e.g. +44 20 7946 0991" />
            </label>

            <label class="premium-field" for="contact-message">
              <span>Message *</span>
              <textarea id="contact-message" v-model="message" rows="6" required placeholder="Please detail your travel dates, preferred airport, service requirements, or any specific concierge requests..."></textarea>
            </label>

            <button class="premium-submit" type="submit" :disabled="loading">
              <span v-if="loading">Sending enquiry...</span>
              <span v-else>Send enquiry →</span>
            </button>

            <p v-if="errorMessage" role="alert" class="subtle-note" style="color: #c93b2b; font-weight: 600; margin-top: 15px;">
              {{ errorMessage }}
            </p>

            <p v-if="sent" role="status" class="subtle-note" style="color: #2e6930; font-weight: 600; margin-top: 15px;">
              {{ successMessage }}
            </p>
          </form>
        </div>
      </section>
    </main>

    <SiteFooter />
  </div>
</template>

<style scoped>
.contact-direct-options {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
  margin-top: 25px;
}

.contact-whatsapp-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 11px 18px;
  border-radius: 4px;
  font-size: 13px;
  font-weight: 600;
  color: #ffffff;
  background: #25d366;
  text-decoration: none;
  line-height: 1;
  box-shadow: 0 4px 14px rgba(37, 211, 102, 0.28);
  transition: all 0.25s ease;
}

.contact-whatsapp-btn:hover {
  background: #1ebd5a;
  transform: translateY(-2px);
  box-shadow: 0 8px 22px rgba(37, 211, 102, 0.38);
}
</style>
