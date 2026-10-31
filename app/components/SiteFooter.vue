
<script setup lang="ts">
import {
  ArrowUpRight,
  Mail,
  Plane,
  MapPin
} from 'lucide-vue-next'

const year = new Date().getFullYear()
const { siteName, whatsappUrl } = useSiteMeta()
const { handleHomeClick, handleNavClick } = useHomeNavigation()
</script>

<template>
  <footer class="uaa-footer">
    <div class="container">
      <div class="uaa-footer-top">
        <div class="uaa-footer-brand">
          <NuxtLink
            to="/"
            class="uaa-footer-logo footer-brand-logo"
            @click="handleHomeClick"
          >
            <img
              src="/images/uk-airport-assistance-logo.webp"
              :alt="`${siteName} – Powered By`"
              width="2020"
              height="779"
              loading="lazy"
            />
          </NuxtLink>

          <p>
            An exceptional airport experience,
            thoughtfully arranged for those who
            value time, comfort and discretion.
          </p>

          <div class="uaa-footer-signature">
            <Plane :size="16" />
            <span>TRAVEL, BEAUTIFULLY CONSIDERED.</span>
          </div>
        </div>

        <div class="uaa-footer-column">
          <h3>Explore</h3>
          <NuxtLink to="/" @click="handleNavClick('/', $event)">Home</NuxtLink>
          <NuxtLink to="/airports" @click="handleNavClick('/airports', $event)">UK Airports</NuxtLink>
          <NuxtLink to="/vip-experience" @click="handleNavClick('/vip-experience', $event)">VIP Experience</NuxtLink>
          <NuxtLink to="/about" @click="handleNavClick('/about', $event)">About Us</NuxtLink>
        </div>

        <div class="uaa-footer-column">
          <h3>Your Journey</h3>
          <NuxtLink to="/book#booking-form">Book Assistance</NuxtLink>
          <NuxtLink to="/airports" @click="handleNavClick('/airports', $event)">Meet &amp; Greet</NuxtLink>
          <NuxtLink to="/airports" @click="handleNavClick('/airports', $event)">Airport Services</NuxtLink>
          <NuxtLink to="/faq" @click="handleNavClick('/faq', $event)">FAQs</NuxtLink>
        </div>

        <div class="uaa-footer-column">
          <h3>Get in Touch</h3>
          <a
            :href="whatsappUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="uaa-footer-contact uaa-footer-whatsapp-link"
            aria-label="WhatsApp"
          >
            <WhatsAppIcon :size="20" />
            <span>WhatsApp</span>
          </a>

          <NuxtLink to="/contact" class="uaa-footer-contact">
            <Mail :size="17" />
            <span>Contact our team</span>
          </NuxtLink>

          <div class="uaa-footer-contact">
            <MapPin :size="17" />
            <span>United Kingdom</span>
          </div>

          <NuxtLink to="/contact" class="uaa-footer-enquire">
            Make an enquiry
            <ArrowUpRight :size="16" />
          </NuxtLink>
        </div>
      </div>

      <div class="uaa-footer-bottom">
        <span>© 2018 – 2026 Universal Travel Assistance LLC. All Rights Reserved</span>

        <div class="uaa-footer-legal">
          <NuxtLink to="/privacy">Privacy Policy</NuxtLink>
          <NuxtLink to="/faq">FAQs</NuxtLink>
          <NuxtLink to="/contact">Contact</NuxtLink>
        </div>

        <span class="uaa-footer-note">
          Independent airport concierge services
        </span>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.uaa-footer-whatsapp-link {
  color: #25d366;
  font-weight: 500;
  transition: all 0.2s ease;
}

.uaa-footer-whatsapp-link:hover {
  color: #25d366;
  transform: translateX(3px);
}

.uaa-footer-whatsapp-link svg {
  color: #25d366;
}
</style>
