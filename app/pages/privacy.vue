<script setup lang="ts">
const { siteName, siteUrl } = useSiteMeta()
const canonicalUrl = computed(() => `${siteUrl.value}/privacy`)
const siteUrlDisplay = computed(() => {
  if (!siteUrl.value) return 'ukairportassistance.com'
  return siteUrl.value.replace(/^https?:\/\//, '')
})

useSeoMeta({
  title: computed(() => `Privacy Policy | ${siteName.value}`),
  description: 'This Privacy Policy explains how Universal Travel Assistance LLC collects, uses, shares, and protects your personal information when you use our website to book the services.',
  keywords: computed(() => `privacy policy, ${siteName.value} privacy, data protection, booking confidentiality`),
  ogTitle: computed(() => `Privacy Policy | ${siteName.value}`),
  ogDescription: 'This Privacy Policy explains how Universal Travel Assistance LLC collects, uses, shares, and protects your personal information when you use our website to book the services.',
  ogType: 'website',
  ogUrl: canonicalUrl,
  twitterCard: 'summary'
})

useHead(() => ({
  link: [{ rel: 'canonical', href: canonicalUrl.value }]
}))
</script>

<template>
  <div class="luxe-page privacy-page">
    <SiteHeader />

    <main>
      <section class="interior-hero">
        <div class="container">
          <span class="luxe-kicker">SITE INFORMATION</span>
          <h1 style="color: #F4EADF;">
            Privacy <em>Policy.</em>
          </h1>
          <p>
            How Universal Travel Assistance LLC collects, manages, and safeguards your personal and travel information.
          </p>
        </div>
      </section>

      <section class="luxe-pad privacy-pad">
        <div class="container privacy-content-wrap">
          <div class="editorial-body privacy-body">
        <p class="privacy-company">
          UK Airports — Universal Travel Assistance LLC
        </p>

        <p class="body-copy">
          This Privacy Policy explains how Universal Travel Assistance LLC (“we”, “us”, “our”) collects, uses, shares, and protects your personal
          information when you use our website to book the services. By using our website or booking a service, you agree to the practices described in
          this Policy.
        </p>

        <section class="privacy-section">
          <h2>1. INFORMATION WE COLLECT</h2>
          <p>We may collect the following categories of information when you use our website or book a service:</p>
          <ul class="privacy-list">
            <li>Contact details — name, email address, phone number, and WhatsApp number</li>
            <li>Travel details — flight number, arrival/departure date and time, airport, and terminal</li>
            <li>Passenger details — names of all passengers included in the booking, and any special assistance requirements (e.g., wheelchair)</li>
            <li>Payment information — processed securely through our third-party payment providers (see Section 4); we do not store full card details on our servers</li>
            <li>Communication records — emails, WhatsApp messages, and call records related to your booking</li>
            <li>Website usage data — IP address, browser type, and pages visited, collected via cookies (see Section 6)</li>
          </ul>
        </section>

        <section class="privacy-section">
          <h2>2. HOW WE USE YOUR INFORMATION</h2>
          <p>We use the information we collect to:</p>
          <ul class="privacy-list">
            <li>Process and confirm your booking</li>
            <li>Coordinate service delivery with our airport team</li>
            <li>Communicate booking confirmations, updates, and support via email and WhatsApp</li>
            <li>Process payments and issue confirmation vouchers</li>
            <li>Respond to inquiries, complaints, or feedback</li>
            <li>Improve our website and services</li>
            <li>Comply with legal and regulatory obligations</li>
          </ul>
        </section>

        <section class="privacy-section">
          <h2>3. SHARING YOUR INFORMATION</h2>
          <p>We share your information only where necessary to deliver the service you have booked, including with:</p>
          <ul class="privacy-list">
            <li>Service partners: — to book and coordinate the service, including passenger name, flight details, and contact number</li>
            <li>Payment Processors — to process your payment securely</li>
            <li>Regulatory or government authorities — where required by law</li>
          </ul>
          <p>We do not sell your personal information to third parties for marketing purposes.</p>
        </section>

        <section class="privacy-section">
          <h2>4. PAYMENT INFORMATION</h2>
          <p>
            Payments made through our website are processed by third-party payment providers (such as Stripe, PayPal or Razorpay). These providers
            handle your payment details directly under their own privacy and security policies; we do not have access to or store your full card or bank
            account details.
          </p>
        </section>

        <section class="privacy-section">
          <h2>5. DATA RETENTION</h2>
          <p>
            We retain personal information for as long as necessary to fulfill the purposes described in this Policy, including to meet legal, accounting, or
            reporting obligations. Booking and communication records may be retained for a reasonable period after service completion to handle any
            follow-up queries or disputes.
          </p>
        </section>

        <section class="privacy-section">
          <h2>6. COOKIES &amp; WEBSITE USAGE DATA</h2>
          <p>
            Our website may use cookies and similar technologies to improve your browsing experience, remember your preferences, and understand how
            visitors use our website. You can control or disable cookies through your browser settings; however, this may affect certain website
            functionality.
          </p>
        </section>

        <section class="privacy-section">
          <h2>7. DATA SECURITY</h2>
          <p>
            We take reasonable technical and organizational measures to protect your personal information against unauthorized access, loss, misuse, or
            alteration. However, no method of transmission over the internet is completely secure, and we cannot guarantee absolute security.
          </p>
        </section>

        <section class="privacy-section">
          <h2>8. YOUR RIGHTS</h2>
          <p>Depending on your location and applicable law, you may have the right to:</p>
          <ul class="privacy-list">
            <li>Access the personal information we hold about you</li>
            <li>Request correction of inaccurate information</li>
            <li>Request deletion of your personal information, subject to legal or contractual retention requirements</li>
            <li>Withdraw consent to marketing communications at any time</li>
          </ul>
          <p>To exercise any of these rights, please contact us using the details in Section 11.</p>
        </section>

        <section class="privacy-section">
          <h2>09. CHANGES TO THIS POLICY</h2>
          <p>
            We may update this Privacy Policy from time to time. The updated version will be posted on our website. Continued use of our website after
            changes are posted constitutes acceptance of the updated Policy.
          </p>
        </section>

        <section class="privacy-section">
          <h2>10. CONTACT US</h2>
          <p>If you have any questions about this Privacy Policy or how we handle your personal information, please contact us at:</p>
          <ul class="privacy-list">
            <li>
              Email:
              <a href="mailto:booking@mailuaa.com" class="privacy-link">booking@mailuaa.com</a>
            </li>
            <li>
              Website:
              <NuxtLink to="/" class="privacy-link">{{ siteUrlDisplay }}</NuxtLink>
            </li>
          </ul>
        </section>
          </div>
        </div>
      </section>
    </main>

    <SiteFooter />
  </div>
</template>
