<script setup lang="ts">
import { Menu, X, ArrowUpRight } from 'lucide-vue-next'

const menuOpen = ref(false)
const scrolled = ref(false)
const route = useRoute()
const { siteName, whatsappUrl } = useSiteMeta()
const { handleHomeClick, handleNavClick } = useHomeNavigation()

const navLinks = [
  { label: 'Home', path: '/' },
  { label: 'Airports & Services', path: '/airports' },
  { label: 'VIP Experience', path: '/vip-experience' },
  { label: 'About', path: '/about' },
  { label: 'FAQ', path: '/faq' },
  { label: 'Contact', path: '/contact' }
]

function isLinkActive(path: string): boolean {
  const currentPath = route.path.replace(/\/+$/, '') || '/'
  const targetPath = path.replace(/\/+$/, '') || '/'

  if (targetPath === '/') {
    return currentPath === '/'
  }

  return currentPath === targetPath || currentPath.startsWith(`${targetPath}/`)
}

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
        <NuxtLink
          v-for="link in navLinks"
          :key="link.path"
          :to="link.path"
          class="desktop-nav-link"
          :class="{ 'is-active': isLinkActive(link.path) }"
          :aria-current="isLinkActive(link.path) ? 'page' : undefined"
          @click="onHeaderNavClick(link.path, $event)"
        >
          <span>{{ link.label }}</span>
        </NuxtLink>
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
          Book Now
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
      <NuxtLink
        v-for="link in navLinks"
        :key="link.path"
        :to="link.path"
        class="mobile-nav-link"
        :class="{ 'is-active': isLinkActive(link.path) }"
        :aria-current="isLinkActive(link.path) ? 'page' : undefined"
        @click="onHeaderNavClick(link.path, $event)"
      >
        <span>{{ link.label }}</span>
      </NuxtLink>
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
      <NuxtLink to="/book#booking-form" @click="menuOpen = false">Book Now</NuxtLink>
    </nav>
  </header>
</template>

<style scoped>
/* Desktop Nav Link */
.desktop-nav-link {
  position: relative;
  display: inline-flex;
  align-items: center;
  transition: color 0.2s ease, opacity 0.2s ease;
}

/* Active Link - Transparent / Hero Header */
:deep(.desktop-nav .desktop-nav-link.is-active) {
  color: #c9a86a !important;
  text-shadow: 0 1px 6px rgba(0, 0, 0, 0.55);
}

/* Active Link - Scrolled Light Header */
:deep(.header-scrolled .desktop-nav .desktop-nav-link.is-active) {
  color: var(--brand-red, #9b1c31) !important;
}

/* Mobile Nav Active Link */
.mobile-nav-link {
  display: flex;
  align-items: center;
  padding: 10px 14px;
  border-radius: 4px;
  transition: color 0.2s ease;
}

.mobile-nav-link.is-active {
  color: #c9a86a !important;
}

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
  font-size: 13px;
  font-weight: 700;
  color: #0f7a4d;
  background: transparent;
  border: 1px solid #0f7a4d;
  text-decoration: none;
  line-height: 1;
  transition: all 0.2s ease;
}

.nav-whatsapp-link :deep(path) {
  fill: currentColor;
}

.nav-whatsapp-link:hover {
  background: transparent;
  color: #0a5836;
  border-color: #0a5836;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(15, 122, 77, 0.18);
  text-shadow: none;
}

.mobile-nav-whatsapp {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 10px 16px;
  border-radius: 4px;
  font-size: 13.5px;
  font-weight: 700;
  color: #0f7a4d;
  background: transparent;
  border: 1px solid #0f7a4d;
  text-decoration: none;
  width: fit-content;
}

.mobile-nav-whatsapp :deep(path) {
  fill: currentColor;
}

@media (max-width: 800px) {
  .nav-actions {
    display: none;
  }
}
</style>
