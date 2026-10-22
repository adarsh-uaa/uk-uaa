
<script setup lang="ts">
import {
  ArrowUpRight,
  Mail,
  Plane,
  MapPin
} from 'lucide-vue-next'

const year = new Date().getFullYear()
</script>

<template>
  <footer class="uaa-footer">
    <div class="container">
      <div class="uaa-footer-top">
        <div class="uaa-footer-brand">
          <NuxtLink to="/" class="uaa-footer-logo">
            <span>UK</span>
            <small>AIRPORT ASSISTANCE</small>
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
          <NuxtLink to="/">Home</NuxtLink>
          <NuxtLink to="/airports">UK Airports</NuxtLink>
          <NuxtLink to="/vip-experience">VIP Experience</NuxtLink>
          <NuxtLink to="/about">About Us</NuxtLink>
        </div>

        <div class="uaa-footer-column">
          <h3>Your Journey</h3>
          <NuxtLink to="/book">Book Assistance</NuxtLink>
          <NuxtLink to="/airports">Meet &amp; Greet</NuxtLink>
          <NuxtLink to="/airports">Airport Services</NuxtLink>
          <NuxtLink to="/faq">FAQs</NuxtLink>
        </div>

        <div class="uaa-footer-column">
          <h3>Get in Touch</h3>
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
        <span>© {{ year }} UK Airport Assistance. All rights reserved.</span>

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
