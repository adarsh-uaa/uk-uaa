<script setup lang="ts">
const props = defineProps<{
    title: string
    description: string
    path: string
    eyebrow?: string
    heading: string
    intro: string
    image?: string
}>()

const config = useRuntimeConfig()

const siteUrl = computed(() =>
    String(config.public.siteUrl || '').replace(/\/+$/, '')
)

const canonicalPath = computed(() => {
    const path = '/' + props.path.replace(/^\/+/, '')
    return path === '/' ? '/' : path.replace(/\/+$/, '')
})

const absoluteUrl = computed(() =>
    `${siteUrl.value}${canonicalPath.value}`
)

const socialImage = computed(() => {
    if (!props.image) {
        return `${siteUrl.value}/images/hero-cover.webp`
    }

    if (/^https?:\/\//i.test(props.image)) {
        return props.image
    }

    return `${siteUrl.value}/${props.image.replace(/^\/+/, '')}`
})

useSeoMeta({
    title: () => props.title,
    description: () => props.description,

    ogTitle: () => props.title,
    ogDescription: () => props.description,
    ogType: 'website',
    ogUrl: () => absoluteUrl.value,
    ogImage: () => socialImage.value,
    ogSiteName: 'UK Airport Assistance',
    ogLocale: 'en_GB',

    twitterCard: 'summary_large_image',
    twitterTitle: () => props.title,
    twitterDescription: () => props.description,
    twitterImage: () => socialImage.value
})

useHead(() => ({
    link: [
        {
            rel: 'canonical',
            href: absoluteUrl.value
        }
    ]
}))
</script>

<template>
    <section class="interior-hero">
        <div class="container">
            <span class="luxe-kicker">
                {{ eyebrow || 'UK AIRPORT ASSISTANCE' }}
            </span>

            <h1 style="color: #F4EADF;">
                {{ heading }}
            </h1>

            <p>{{ intro }}</p>
        </div>
    </section>
</template>
