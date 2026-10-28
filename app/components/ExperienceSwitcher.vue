<script setup lang="ts">
import { ArrowUpRight } from 'lucide-vue-next'
const options=[
 {name:'Arrivals',kicker:'01 / A WARM WELCOME',heading:'A beautiful beginning.',description:'Meet your personal assistant at the agreed meeting point. From wayfinding to luggage coordination, experience an arrival designed around you.',image:'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1400&q=85'},
 {name:'Departures',kicker:'02 / A CALMER DEPARTURE',heading:'Leave the details to us.',description:'Arrive with confidence. We coordinate your requested departure assistance, including premium facilities and priority options wherever authorized.',image:'https://images.unsplash.com/photo-1474302770737-173ee21bab63?auto=format&fit=crop&w=1400&q=85'},
 {name:'Connections',kicker:'03 / IN PERFECT TRANSIT',heading:'The journey flows on.',description:'From one flight to the next, your assistant helps make the connection feel seamless, subject to terminal access and airline procedures.',image:'https://images.unsplash.com/photo-1488085061387-422e29b40080?auto=format&fit=crop&w=1400&q=85'}
]
const active=ref(0)
</script>
<template>
<section class="experience-tabs section" id="experience" aria-labelledby="experience-title"><div class="container"><div class="experience-top"><div><p class="eyebrow">THOUGHTFULLY ARRANGED</p><h2 id="experience-title">Travel beautifully.<br><em>At every stage.</em></h2></div><p>Private, personal and carefully considered airport assistance for the moments that matter.</p></div>
<div class="experience-tabs-list" role="tablist" aria-label="Choose a journey type"><button v-for="(item,i) in options" :key="item.name" :id="'journey-tab-'+i" type="button" role="tab" :aria-selected="active===i" :aria-controls="'journey-panel-'+i" :class="{'is-active':active===i}" @click="active=i"><span>0{{i+1}}</span>{{item.name}} <ArrowUpRight :size="17"/></button></div>
<Transition name="journey" mode="out-in"><div :key="active" :id="'journey-panel-'+active" class="experience-panel" role="tabpanel" :aria-labelledby="'journey-tab-'+active"><div class="experience-picture"><img :src="options[active].image" :alt="options[active].name+' airport assistance experience'" loading="lazy"/></div><div class="experience-copy"><p class="eyebrow">{{options[active].kicker}}</p><h3>{{options[active].heading}}</h3><p>{{options[active].description}}</p><NuxtLink :to="'/book?service='+(['arrival','departure','transit'][active])+'#booking-form'" class="button button-dark">Arrange this experience <ArrowUpRight :size="17"/></NuxtLink></div></div></Transition></div></section>
</template>
