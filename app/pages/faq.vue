<script setup lang="ts">
const faq = [{ q: 'Is Fast Track available at every airport?', a: 'No. Priority facilities vary by airport, terminal and journey type. We only confirm access after checking the provider’s permitted service.' }, { q: 'Does submitting the booking form confirm my reservation?', a: 'No. It creates a booking request. Confirmation is issued only when the supplier has accepted the booking and any required payment steps are complete.' }, { q: 'Can I book for children or infants?', a: 'Yes. Include adult, child and infant counts in your request so the correct service can be assessed.' }, { q: 'Can I request multiple services?', a: 'Yes. Available add-ons can be selected together, depending on the airport and service type.' }, { q: 'Can I book arrivals, departures and transit?', a: 'Each airport has its own configured journey types. Choose the airport first, then see the available options.' }, { q: 'What if my flight changes?', a: 'Contact support as early as possible. Adjustments depend on your provider’s booking terms and availability.' }]
const open = ref<number | null>(0), siteUrl = useRuntimeConfig().public.siteUrl
useSeoMeta({ title: 'FAQ | UK Airport VIP Meet & Greet Assistance', description: 'Answers about UK VIP airport assistance, Fast Track availability, meet and greet booking requests, families, changes and service inclusions.' })
useHead({ link: [{ rel: 'canonical', href: siteUrl + '/faq' }], script: [{ type: 'application/ld+json', innerHTML: JSON.stringify({ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faq.map(x => ({ '@type': 'Question', name: x.q, acceptedAnswer: { '@type': 'Answer', text: x.a } })) }) }] })
</script>
<template>
    <div class="luxe-page">
        <SiteHeader />
        <main>
            <section class="interior-hero">
                <div class="container"><span class="luxe-kicker">BEFORE YOU TRAVEL</span>
                    <h1 style="color: #F4EADF;"> Questions, <em>answered.</em></h1>
                    <p>Everything you need to know about your experience.</p>
                </div>
            </section>
            <section class="luxe-pad">
                <div class="container faq-content">
                    <div v-for="(item, i) in faq" :key="item.q" class="luxe-faq-item"><button
                            :aria-expanded="open === i" @click="open = open === i ? null : i"><span>0{{ i + 1
                                }}</span><strong>{{ item.q }}</strong><span>{{ open === i ? '−' : '+' }}</span></button>
                        <p v-if="open === i" class="luxe-faq-answer">{{ item.a }}</p>
                    </div>
                    <p>Still have a question? <NuxtLink to="/contact">Contact our team</NuxtLink> or <NuxtLink
                            to="/book">request airport assistance</NuxtLink>.</p>
                </div>
            </section>
        </main>
        <SiteFooter />
    </div>
</template>
