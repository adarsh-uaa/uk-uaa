<script setup lang="ts">
import { Menu, X, ArrowUpRight } from 'lucide-vue-next'

const menuOpen = ref(false)
const scrolled = ref(false)
const route = useRoute()

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
      <NuxtLink to="/" class="wordmark brand-logo" aria-label="UK Airport Assistance home">
        <img
          src="/images/uk-airport-assistance-logo.png"
          alt="UK Airport Assistance"
          width="2020"
          height="770"
          fetchpriority="high"
          decoding="async"
        />
      </NuxtLink>

      <nav class="desktop-nav" aria-label="Primary navigation">
        <NuxtLink to="/">Home</NuxtLink>
        <NuxtLink to="/airports">Airports &amp; Services</NuxtLink>
        <NuxtLink to="/vip-experience">VIP Experience</NuxtLink>
        <NuxtLink to="/about">About</NuxtLink>
        <NuxtLink to="/faq">FAQ</NuxtLink>
        <NuxtLink to="/contact">Contact</NuxtLink>
      </nav>

      <NuxtLink class="nav-cta" to="/book">
        Book now
        <ArrowUpRight :size="15" aria-hidden="true" />
      </NuxtLink>

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
      <NuxtLink to="/">Home</NuxtLink>
      <NuxtLink to="/airports">Airports &amp; Services</NuxtLink>
      <NuxtLink to="/vip-experience">VIP Experience</NuxtLink>
      <NuxtLink to="/about">About</NuxtLink>
      <NuxtLink to="/faq">FAQ</NuxtLink>
      <NuxtLink to="/contact">Contact</NuxtLink>
      <NuxtLink to="/book">Book now</NuxtLink>
    </nav>
  </header>
</template>
