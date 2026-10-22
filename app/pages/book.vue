<script setup lang="ts">
const config = useRuntimeConfig(); const url = config.public.siteUrl + '/book'
useSeoMeta({ title: 'Book VIP Airport Assistance | UK Airport Assistance', description: 'Request personalised airport assistance at selected UK airports. Choose arrival, departure or transit, flight details and available extras.', robots: 'noindex,follow', ogTitle: 'Book VIP Assistance | UK Airport Assistance' })
useHead({ link: [{ rel: 'canonical', href: url }] })
</script>
<template>
    <div class="luxe-page">
        <SiteHeader />
        <main>
            <section class="interior-hero">
                <div class="container"><span class="luxe-kicker">THE ART OF EFFORTLESS TRAVEL</span>
                    <h1>Arrange your <em>journey.</em></h1>
                    <p>Tell us a little about your plans. We’ll help coordinate the finer details.</p>
                </div>
            </section>
            <section class="luxe-pad">
                <div class="container booking-layout">
                    <FullBookingForm />
                    <aside class="booking-aside"><span class="luxe-kicker">A MORE CONSIDERED JOURNEY</span>
                        <h2>Exclusively yours.</h2>
                        <p>Premium meet and assist services across the United Kingdom, tailored to your airport and
                            journey.</p><img src="/images/hero-poster.svg" alt="Air travel-inspired illustration" />
                        <p class="subtle-note">This is a request form. Supplier confirmation is required before any
                            booking is final.</p>
                    </aside>
                </div>
            </section>
        </main>
        <SiteFooter />
    </div>
</template>
