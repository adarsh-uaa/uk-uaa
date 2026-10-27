<script setup lang="ts">
const { siteName, siteUrl } = useSiteMeta()
const canonicalUrl = computed(() => `${siteUrl.value}/privacy`)

useSeoMeta({
  title: computed(() => `Privacy Policy | ${siteName.value}`),
  description: computed(() => `Learn how ${siteName.value} collects, uses and protects your personal data and booking information when requesting VIP meet and assist services.`),
  keywords: computed(() => `privacy policy, ${siteName.value} privacy, data protection, booking confidentiality`),
  ogTitle: computed(() => `Privacy Policy | ${siteName.value}`),
  ogDescription: computed(() => `Learn how ${siteName.value} protects your personal information and booking details.`),
  ogType: 'website',
  ogUrl: canonicalUrl,
  twitterCard: 'summary'
})

useHead(() => ({
  link: [{ rel: 'canonical', href: canonicalUrl.value }]
}))
</script>

<template>
  <div class="luxe-page">
    <SiteHeader />

    <main class="inner-page container">
      <p class="eyebrow">SITE INFORMATION</p>
      <h1>Privacy <em>notice.</em></h1>

      <div class="editorial-body" style="max-width: 760px; line-height: 1.8; color: #5c5952;">
        <p class="body-copy">
          {{ siteName }} is committed to safeguarding the privacy and confidentiality of our clients.
          This privacy policy outlines how we collect, process, and protect your information when you request
          VIP airport concierge and meet &amp; greet services across the United Kingdom.
        </p>

        <h2 style="font-size: 22px; margin: 32px 0 12px; color: #182a40; font-family: 'Playfair Display', Georgia, serif;">
          1. Information We Collect
        </h2>
        <p>
          When you request assistance through our platform, we collect relevant traveller information necessary to
          coordinate and confirm your services with airport suppliers, including names, contact details, flight numbers,
          travel dates, luggage counts, and special preferences.
        </p>

        <h2 style="font-size: 22px; margin: 32px 0 12px; color: #182a40; font-family: 'Playfair Display', Georgia, serif;">
          2. How We Use Your Information
        </h2>
        <p>
          Your information is used strictly to prepare your quote, verify supplier and terminal availability, confirm your
          booking, and communicate important updates regarding your journey. We never sell or distribute your personal
          data to third parties for marketing purposes.
        </p>

        <h2 style="font-size: 22px; margin: 32px 0 12px; color: #182a40; font-family: 'Playfair Display', Georgia, serif;">
          3. Data Security &amp; Confidentiality
        </h2>
        <p>
          We employ industry-standard encryption and security protocols to ensure that all personal and travel details
          remain completely confidential and secure at all times.
        </p>

        <p style="margin-top: 36px;">
          For any questions regarding our privacy practices or your data, please contact our team via our
          <NuxtLink to="/contact" style="color: #b18b65; text-decoration: underline;">contact page</NuxtLink>.
        </p>
      </div>
    </main>

    <SiteFooter />
  </div>
</template>
