<script setup lang="ts">
import { Menu, X, ArrowUpRight } from 'lucide-vue-next'
const menuOpen = ref(false), scrolled = ref(false), route = useRoute()
function sync() { scrolled.value = window.scrollY > 36 }
watch(() => route.fullPath, () => menuOpen.value = false)
onMounted(() => { sync(); window.addEventListener('scroll', sync, { passive: true }) })
onUnmounted(() => { if (import.meta.client) window.removeEventListener('scroll', sync) })
</script>
<template>
    <ScrollProgress />
    <header class="site-header" :class="{ 'header-scrolled': scrolled, 'menu-is-open': menuOpen }">
        <div class="container nav-wrap">
            <NuxtLink to="/" class="wordmark brand-logo">
                <img
                    src="/images/uk-airport-assistance-logo.png"
                    alt="UK Airport Assistance"
                    width="2020"
                    height="770"
                    fetchpriority="high"
                />
            </NuxtLink>
            <nav class="desktop-nav" aria-label="Primary navigation">
                <NuxtLink to="/">Home</NuxtLink>
                <NuxtLink to="/airports">Airports & Services</NuxtLink>
                <NuxtLink to="/vip-experience">VIP Experience</NuxtLink>
                <NuxtLink to="/about">About</NuxtLink>
                <NuxtLink to="/faq">FAQ</NuxtLink>
                <NuxtLink to="/contact">Contact</NuxtLink>
            </nav>
            <NuxtLink class="nav-cta" to="/book">Book now
                <ArrowUpRight :size="15" />
            </NuxtLink><button class="menu-toggle" type="button" :aria-expanded="menuOpen"
                aria-label="Toggle navigation" @click="menuOpen = !menuOpen">
                <X v-if="menuOpen" />
                <Menu v-else />
            </button>
        </div>
        <nav v-if="menuOpen" class="mobile-nav" aria-label="Mobile navigation">
            <NuxtLink to="/">Home</NuxtLink>
            <NuxtLink to="/airports">Airports & Services</NuxtLink>
            <NuxtLink to="/vip-experience">VIP Experience</NuxtLink>
            <NuxtLink to="/about">About</NuxtLink>
            <NuxtLink to="/faq">FAQ</NuxtLink>
            <NuxtLink to="/contact">Contact</NuxtLink>
            <NuxtLink to="/book">Book now</NuxtLink>
        </nav>
    </header>
</template>
