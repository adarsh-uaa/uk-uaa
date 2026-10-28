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

const { siteName, siteUrl } = useSiteMeta()

const canonicalUrl = computed(() =>
    `${siteUrl.value}/services/${service.slug}`
)

const pageTitle = computed(() =>
    `${service.name} at UK Airports | ${siteName.value}`
)

const pageDescription = computed(() =>
    `${service.detail} Explore available options at selected UK airports and request personalised assistance with ${siteName.value}.`
)

const keywords = computed(() =>
    `${service.name}, ${service.name} UK, ${service.name} airport assistance, VIP airport service UK, meet and greet, ${siteName.value}`
)

useSeoMeta({
    title: pageTitle,
    description: pageDescription,
    keywords,
    ogTitle: pageTitle,
    ogDescription: pageDescription,
    ogType: 'website',
    ogUrl: canonicalUrl,
    ogImage: service.image.startsWith('http')
        ? service.image
        : computed(() => new URL(service.image, siteUrl.value).href),
    twitterCard: 'summary_large_image'
})

useHead(() => ({
    link: [
        {
            rel: 'canonical',
            href: canonicalUrl.value
        }
    ],
    script: [
        {
            type: 'application/ld+json',
            innerHTML: JSON.stringify({
                '@context': 'https://schema.org',
                '@graph': [
                    {
                        '@type': 'Service',
                        '@id': `${canonicalUrl.value}#service`,
                        name: service.name,
                        description: service.detail,
                        provider: {
                            '@type': 'Organization',
                            name: siteName.value,
                            url: siteUrl.value
                        },
                        areaServed: 'GB',
                        serviceType: 'Airport Assistance'
                    },
                    {
                        '@type': 'BreadcrumbList',
                        itemListElement: [
                            {
                                '@type': 'ListItem',
                                position: 1,
                                name: 'Home',
                                item: siteUrl.value
                            },
                            {
                                '@type': 'ListItem',
                                position: 2,
                                name: service.name,
                                item: canonicalUrl.value
                            }
                        ]
                    }
                ]
            })
        }
    ]
}))
</script>

<template>
    <div>
        <SiteHeader />

        <main class="inner-page container">
            <p class="eyebrow">
                {{ siteName.toUpperCase() }} / OUR SERVICES
            </p>

            <h1>
                {{ service.name }},
                <em>reconsidered.</em>
            </h1>

            <p class="body-copy">
                {{ service.detail }}
            </p>
            <div class="detail-hero">
                <img
                    :src="service.image"
                    :alt="`${service.name} airport assistance UK`"
                    loading="lazy"
                    decoding="async"
                    width="850"
                    height="567"
                />

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

                    <NuxtLink to="/book#booking-form" class="button button-dark">
                        Request assistance ↗
                    </NuxtLink>
                </div>
            </div>
        </main>

        <SiteFooter />
    </div>
</template>
