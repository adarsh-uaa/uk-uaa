<script setup lang="ts">
import { Plus, Minus } from 'lucide-vue-next'
const faqs=[
 {q:'Can I book airport assistance at any UK airport?',a:'You can request assistance at the airports listed on this site. Availability and the exact services differ by airport, terminal and travel date. We confirm options before a reservation is finalized.'},
 {q:'Does VIP assistance include Fast Track security and immigration?',a:'Not automatically. Priority security or immigration is offered only where the airport authorizes it and the selected service specifically includes it. Your quote should clearly state what is and is not included.'},
 {q:'Can you assist families and elderly passengers?',a:'You can request assistance for families or elderly travelers. Tell us your requirements when enquiring so we can check suitable support. Airline-managed special assistance may need to be arranged separately.'},
 {q:'How far in advance should I enquire?',a:'We recommend making your request as early as possible. Short-notice enquiries may be possible but are always subject to supplier availability.'},
 {q:'Is this an official airport website?',a:'No. Universal Airport Assistance is presented as an independent concierge booking concept, not an official airport website or airport authority.'}
]
const opened=ref<number|null>(0)
</script>
<template><section class="faq-section section" id="faq"><div class="container faq-layout"><div class="faq-intro reveal"><p class="eyebrow">THE FINER DETAILS</p><h2>A few things<br><em>worth knowing.</em></h2><p>Good service begins with clarity. Here are answers to common questions about your airport experience.</p><NuxtLink to="/book" class="text-link">Ask about your journey ↗</NuxtLink></div><div class="faq-items"><div v-for="(f,i) in faqs" :key="f.q" class="faq-item"><button type="button" :aria-expanded="opened===i" :aria-controls="'faq-answer-'+i" @click="opened=opened===i?null:i"><span class="faq-number">0{{i+1}}</span><span>{{f.q}}</span><Minus v-if="opened===i" :size="19"/><Plus v-else :size="19"/></button><div v-if="opened===i" :id="'faq-answer-'+i" class="faq-answer"><p>{{f.a}}</p></div></div></div></div></section></template>
