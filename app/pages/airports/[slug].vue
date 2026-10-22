<script setup
    lang="ts">    import { airports } from '~/data/site'; import { selectAirport, journeyTypes } from '~/data/booking'; const route = useRoute(); const airport = airports.find(a => a.slug === route.params.slug); if (!airport) throw createError({ statusCode: 404, statusMessage: 'Airport not found' }); const offer = selectAirport(airport.slug); const url = useRuntimeConfig().public.siteUrl + '/airports/' + airport.slug; useSeoMeta({ title: `${airport.name} VIP Airport Assistance | UK Airport Assistance`, description: `Explore available premium meet and assist enquiries at ${airport.name} (${airport.code}). Learn about arrival, departure and personalised airport assistance.` }); useHead({ link: [{ rel: 'canonical', href: url }] });</script>
<template>
    <div class="luxe-page">
        <SiteHeader />
        <main>
            <section class="interior-hero">
                <div class="container"><span class="luxe-kicker">{{ airport?.code }} / UK AIRPORTS</span>
                    <h1>
                        <span style="color: #F4EADF;">{{ airport?.name }} </span>
                        <em> assistance.</em>
                    </h1>
                    <p>Tailored airport assistance enquiries for travellers who value discretion, comfort and a seamless
                        journey.</p>
                </div>
            </section>
            <section class="luxe-pad">
                <div class="container editorial-two">
                    <div><span class="luxe-kicker">TAILORED TO YOUR AIRPORT</span>
                        <h2>Arrive with <em>ease.</em></h2>
                        <p>Explore the journey types configured for {{ airport?.name }}. Premium facilities and priority
                            access are subject to provider and airport approval.</p>
                        <div v-for="type in journeyTypes.filter(t => (offer.types as readonly string[]).includes(t.slug))"
                            :key="type.slug" class="service-line"><span>{{ type.name }}</span>
                            <NuxtLink :to="{ path: '/book', query: { airport: airport?.slug, service: type.slug } }">
                                Request →
                            </NuxtLink>
                        </div>
                        <NuxtLink to="/vip-experience" class="luxe-link">Explore the VIP experience →</NuxtLink>
                    </div><img :src="airport?.image" :alt="airport?.name + ' destination image'" />
                </div>
            </section>
            <section class="container inline-cta">
                <h2>Choose your airport services.</h2>
                <NuxtLink :to="{ path: '/book', query: { airport: airport?.slug } }"
                    class="luxe-button luxe-button-cream">
                    Request assistance →</NuxtLink>
            </section>
        </main>
        <SiteFooter />
    </div>
</template>
