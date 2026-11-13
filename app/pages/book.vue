<script setup lang="ts">
const route = useRoute()
const { siteName, siteUrl } = useSiteMeta()
const canonicalUrl = computed(() => `${siteUrl.value}/book`)

useSeoMeta({
  title: computed(() => `Book Heathrow Meet and Greet & Fast Track Assistance | ${siteName.value}`),
  description: computed(() => `Book premium Heathrow meet and greet, priority fast track and VIP concierge across all 98 UK airports with ${siteName.value}. Reserve arrival, departure or transit assistance in minutes.`),
  keywords: computed(() => `book Heathrow meet and greet, Heathrow meet and greet reservation, book airport assistance UK, ${siteName.value}, reserve VIP meet and greet, airport fast track booking, fastrack Heathrow, Gatwick meet and assist reservation, airport luggage assistance`),
  ogTitle: computed(() => `Book Heathrow Meet and Greet & VIP Assistance | ${siteName.value}`),
  ogDescription: computed(() => `Reserve bespoke VIP airport assistance across the UK with ${siteName.value}. Tailored arrival, departure and connection concierge services.`),
  ogType: 'website',
  ogUrl: canonicalUrl,
  twitterCard: 'summary_large_image'
})

useHead(() => ({
  link: [{ rel: 'canonical', href: canonicalUrl.value }]
}))

function scrollToBookingForm(behavior: ScrollBehavior = 'smooth') {
  if (!import.meta.client) return
  const el = document.getElementById('booking-form') || document.querySelector('.booking-layout') || document.querySelector('.full-booking')
  if (el) {
    const isReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches
    el.scrollIntoView({
      behavior: isReducedMotion ? 'auto' : behavior,
      block: 'start'
    })
  }
}

function handleAutoScroll() {
  const hasBookingIntent =
    route.hash === '#booking-form' ||
    Boolean(route.query.airport || route.query.service || route.query.packages || route.query.date)

  if (hasBookingIntent) {
    nextTick(() => {
      setTimeout(() => {
        scrollToBookingForm('smooth')
      }, 100)
      setTimeout(() => {
        scrollToBookingForm('smooth')
      }, 350)
    })
  }
}

onMounted(() => {
  handleAutoScroll()
})

watch(
  () => route.fullPath,
  () => {
    handleAutoScroll()
  }
)
</script>

<template>
  <div class="luxe-page">
    <SiteHeader />

    <main>
      <section class="interior-hero">
        <div class="container">
          <span class="luxe-kicker">EXCLUSIVE UK AIRPORT ASSISTANCE</span>
          <h1 class="hero-title-light">
            <span class="sr-only">Book Heathrow Meet and Greet, Fast Track &amp; UK Airport Concierge — </span>
            Arrange your journey. 
          </h1>
          <p>Tell us a little about your travel plans. We’ll help coordinate the finer details.</p>
        </div>
      </section>

      <section class="luxe-pad">
        <div id="booking-form" class="container booking-layout">
          <FullBookingForm />

          <aside class="booking-aside">
            <span class="luxe-kicker">A SEAMLESS EXPERIENCE AWAITS</span>
            <h2>The luxury of effortless travel.</h2>
            <p>
              Enjoy a more comfortable journey with personalised Meet & Greet, Fast Track and 
              VIP airport assistance, tailored to your every need.
            </p>
            <img
              src="/images/airport.webp"
              alt="Luxury airport passenger assistance illustration"
              loading="lazy"
              decoding="async"
              width="600"
              height="400"
            />
          </aside>
        </div>
      </section>
    </main>

    <SiteFooter />
  </div>
</template>

<style scoped>
#booking-form {
  scroll-margin-top: 110px;
}

@media (max-width: 767px) {
  #booking-form {
    scroll-margin-top: 85px;
  }
}
</style>
