<script setup lang="ts">
import { Menu, X, ArrowUpRight } from 'lucide-vue-next'

const menuOpen = ref(false)
const scrolled = ref(false)
const route = useRoute()
const { siteName, whatsappUrl } = useSiteMeta()
const { handleHomeClick, handleNavClick } = useHomeNavigation()

function onHeaderNavClick(path: string, e: MouseEvent) {
  handleNavClick(path, e, () => {
    menuOpen.value = false
  })
}

function syncScroll() {
  scrolled.value = window.scrollY > 36
}

watch(() => route.fullPath, () => {
  menuOpen.value = false
})

onMounted(() => {
  syncScroll()
  window.addEventListener('scroll', syncScroll, { passive: true })
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', syncScroll)
})
</script>

<template>
  <ScrollProgress />
  <header
    class="site-header"
    :class="{ 'header-scrolled': scrolled, 'menu-is-open': menuOpen }"
  >
    <div class="container nav-wrap">
      <NuxtLink
        to="/"
        class="wordmark brand-logo"
        :aria-label="`${siteName} home`"
        @click="onHeaderNavClick('/', $event)"
      >
        <img
          src="/images/uk-airport-assistance-logo.webp"
          :alt="siteName"
          width="2020"
          height="770"
          fetchpriority="high"
          decoding="async"
        />
      </NuxtLink>

      <nav class="desktop-nav" aria-label="Primary navigation">
        <NuxtLink to="/" @click="onHeaderNavClick('/', $event)">Home</NuxtLink>
        <NuxtLink to="/airports" @click="onHeaderNavClick('/airports', $event)">Airports &amp; Services</NuxtLink>
        <NuxtLink to="/vip-experience" @click="onHeaderNavClick('/vip-experience', $event)">VIP Experience</NuxtLink>
        <NuxtLink to="/about" @click="onHeaderNavClick('/about', $event)">About</NuxtLink>
        <NuxtLink to="/faq" @click="onHeaderNavClick('/faq', $event)">FAQ</NuxtLink>
        <NuxtLink to="/contact" @click="onHeaderNavClick('/contact', $event)">Contact</NuxtLink>
      </nav>

      <div class="nav-actions">
        <a
          :href="whatsappUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="nav-whatsapp-link"
          aria-label="WhatsApp"
        >
          <WhatsAppIcon :size="18" />
          <span>WhatsApp</span>
        </a>

        <NuxtLink class="nav-cta" to="/book#booking-form">
          Book now
          <ArrowUpRight :size="15" aria-hidden="true" />
        </NuxtLink>
      </div>

      <button
        class="menu-toggle"
        type="button"
        :aria-expanded="menuOpen"
        aria-controls="mobile-site-navigation"
        :aria-label="menuOpen ? 'Close navigation' : 'Open navigation'"
        @click="menuOpen = !menuOpen"
      >
        <X v-if="menuOpen" aria-hidden="true" />
        <Menu v-else aria-hidden="true" />
      </button>
    </div>

    <nav
      v-if="menuOpen"
      id="mobile-site-navigation"
      class="mobile-nav"
      aria-label="Mobile navigation"
    >
      <NuxtLink to="/" @click="onHeaderNavClick('/', $event)">Home</NuxtLink>
      <NuxtLink to="/airports" @click="onHeaderNavClick('/airports', $event)">Airports &amp; Services</NuxtLink>
      <NuxtLink to="/vip-experience" @click="onHeaderNavClick('/vip-experience', $event)">VIP Experience</NuxtLink>
      <NuxtLink to="/about" @click="onHeaderNavClick('/about', $event)">About</NuxtLink>
      <NuxtLink to="/faq" @click="onHeaderNavClick('/faq', $event)">FAQ</NuxtLink>
      <NuxtLink to="/contact" @click="onHeaderNavClick('/contact', $event)">Contact</NuxtLink>
      <a
        :href="whatsappUrl"
        target="_blank"
        rel="noopener noreferrer"
        class="mobile-nav-whatsapp"
        @click="menuOpen = false"
      >
        <WhatsAppIcon :size="22" />
        <span>WhatsApp</span>
      </a>
      <NuxtLink to="/book#booking-form" @click="menuOpen = false">Book now</NuxtLink>
    </nav>
  </header>
</template>

<style scoped>
.nav-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.nav-whatsapp-link {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 10px 14px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  color: #25d366;
  background: rgba(37, 211, 102, 0.12);
  border: 1px solid rgba(37, 211, 102, 0.35);
  text-decoration: none;
  line-height: 1;
  transition: all 0.2s ease;
}

.nav-whatsapp-link:hover {
  background: #25d366;
  color: #0b1e13;
  border-color: #25d366;
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(37, 211, 102, 0.25);
}

.nav-whatsapp-link:hover :deep(path) {
  fill: #0b1e13;
}

.mobile-nav-whatsapp {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 10px 16px;
  border-radius: 4px;
  font-size: 13.5px;
  font-weight: 600;
  color: #25d366;
  background: rgba(37, 211, 102, 0.14);
  border: 1px solid rgba(37, 211, 102, 0.35);
  text-decoration: none;
  width: fit-content;
}

@media (max-width: 800px) {
  .nav-actions {
    display: none;
  }
}
</style>
