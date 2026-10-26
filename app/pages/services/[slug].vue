<script setup lang="ts">
import { services } from '~/data/site'

const route = useRoute()
const config = useRuntimeConfig()

const service = services.find(
    item => item.slug === route.params.slug
)

if (!service) {
    throw createError({
        statusCode: 404,
        statusMessage: 'Service not found'
    })
}

const canonicalUrl =
    String(config.public.siteUrl).replace(/\/+$/, '') +
    '/services/' +
    service.slug

const pageTitle =
    `${service.name} at UK Airports | UK Airport Assistance`

const pageDescription =
    `${service.detail} Explore available options at selected UK airports and request personalised assistance.`

useSeoMeta({
    title: pageTitle,
    description: pageDescription,
    ogTitle: pageTitle,
    ogDescription: pageDescription,
    ogType: 'website',
    ogUrl: canonicalUrl,
    ogImage: service.image.startsWith('http')
        ? service.image
        : new URL(service.image, config.public.siteUrl).href,
    twitterCard: 'summary_large_image'
})

useHead({
    link: [
        {
            rel: 'canonical',
            href: canonicalUrl
        }
    ]
})
</script>

<template>
    <div>
        <SiteHeader />

        <main class="inner-page container">
            <p class="eyebrow">
                UK AIRPORT ASSISTANCE / OUR SERVICES
            </p>

            <h1>
                {{ service.name }},
                <em>reconsidered.</em>
            </h1>

            <p class="body-copy">
                {{ service.detail }}
            </p>

            <div class="detail-hero">
                <img :src="service.image" :alt="`${service.name} airport assistance`" loading="lazy" decoding="async" />

                <div>
                    <h2>
                        A more considered airport experience.
                    </h2>

                    <p>
                        Our team can help explore options to suit your
                        date, airport and travel requirements.
                        Service inclusions depend on the airport
                        and supplier.
                    </p>

                    <NuxtLink to="/book" class="button button-dark">
                        Request assistance ↗
                    </NuxtLink>
                </div>
            </div>
        </main>

        <SiteFooter />
    </div>
</template>
