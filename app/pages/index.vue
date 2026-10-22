<script setup lang="ts">
import { ArrowUpRight, ArrowRight, ArrowDown, Plus, Minus, ChevronLeft, ChevronRight, Play, Pause, Volume2, VolumeX, Check } from 'lucide-vue-next'
import { airports, services } from '~/data/site'
const siteUrl = useRuntimeConfig().public.siteUrl
useSeoMeta({ title: 'UK Airport Assistance | VIP Meet & Greet Across the UK', description: 'Personalised VIP meet and greet, arrival, departure and transit airport assistance across UK airports. An effortless airport experience, thoughtfully arranged.', ogTitle: 'UK Airport Assistance — Travel, Considered.', ogDescription: 'Discreet VIP airport assistance throughout the United Kingdom.', ogType: 'website', ogUrl: siteUrl, twitterCard: 'summary_large_image' })
useHead({ link: [{ rel: 'canonical', href: siteUrl + '/' }], script: [{ type: 'application/ld+json', innerHTML: JSON.stringify({ '@context': 'https://schema.org', '@type': 'Organization', name: 'UK Airport Assistance', url: siteUrl }) }] })
const chosenAirport = ref(0)
const selectedService = ref(0)
const openedFaq = ref(0)
const vid = ref<HTMLVideoElement | null>(null)
const videoFailed = ref(false)
const playing = ref(true)
const muted = ref(true)
const currentAirport = computed(
    () => airports[chosenAirport.value >= 0 ? chosenAirport.value : 0]!
)
const currentService = computed(() => services[selectedService.value]!)
const faqs = [
    { q: 'Can I skip immigration and security queues?', a: 'Priority access depends on the airport, terminal and officially permitted services. Your quote will specify precisely what is and is not included. Border and security authorities always retain control.' },
    { q: 'Which UK airports do you cover?', a: 'Enquiries are available for London Heathrow, London Gatwick, Manchester, Edinburgh, Birmingham and London Stansted. We confirm the availability of each requested service individually.' },
    { q: 'Is the enquiry a confirmed reservation?', a: 'No. Submitting an enquiry starts the process. Your booking is confirmed only after availability, services and payment terms have been agreed and confirmed in writing.' },
    { q: 'Can you arrange assistance for families or groups?', a: 'Yes. Tell us your party size, flight details and assistance preferences, and we will help identify appropriate arrangements subject to supplier availability.' }
]
const steps = [{ num: '01', name: 'Choose your journey', desc: 'Select your airport, travel date and the assistance that suits you.' }, { num: '02', name: 'Leave the details to us', desc: 'We review your itinerary and confirm which premium services are available.' }, { num: '03', name: 'Travel beautifully', desc: 'Receive your confirmed arrangements and enjoy a more considered airport experience.' }]
function changeAirport(n: number) {
    const current = chosenAirport.value < 0 ? 0 : chosenAirport.value
    chosenAirport.value = (current + n + airports.length) % airports.length
}
async function toggleVideo() { if (!vid.value) return; if (vid.value.paused) { try { await vid.value.play(); playing.value = true } catch { videoFailed.value = true } } else { vid.value.pause(); playing.value = false } }
function toggleSound() { muted.value = !muted.value; if (vid.value) vid.value.muted = muted.value }
</script>
<template>
    <div class="luxe-page">
        <SiteHeader />
        <main>
            <section class="luxe-hero" id="top">
                <div class="luxe-hero-image"></div>
                <video v-show="!videoFailed" ref="vid" class="luxe-video" autoplay muted playsinline loop preload="none"
                    poster="/images/hero-poster.svg" @error="videoFailed = true" @pause="playing = false"
                    @play="playing = true">
                    <source :src="'/video/hero.mp4'" type="video/mp4">
                </video>
                <div class="luxe-hero-shade"></div>
                <div class="container luxe-hero-content">
                    <div class="luxe-mini fade-up"><span class="luxe-rule"></span> THE ART OF EFFORTLESS TRAVEL
                        <span>EST. FOR THE EXCEPTIONAL</span>
                    </div>
                    <h1 class="luxe-hero-heading">
                        <span class="line-reveal" style="color: #F4EADF;">The art of</span>
                        <span class="line-reveal" style="--line-delay: .15s;">
                            <em style="color: #DCC5A5;">arriving.</em>
                        </span>
                    </h1>
                    <p class="luxe-hero-lead fade-up">Discreet, personal airport assistance for those who value every
                        moment of their journey.</p>
                    <div class="luxe-hero-actions fade-up">
                        <NuxtLink to="/book" class="luxe-button luxe-button-cream">Arrange your journey
                            <ArrowUpRight :size="18" />
                        </NuxtLink><a href="#experience" class="luxe-hero-textlink">Discover our approach
                            <ArrowRight :size="17" />
                        </a>
                    </div>
                    <div class="luxe-hero-foot"><a href="#experience" class="luxe-scroll">
                            <!-- <ArrowDown :size="17" /> SCROLL TO EXPLORE -->
                        </a>
                        <div class="luxe-video-controls"><button v-if="!videoFailed" @click="toggleVideo"
                                :aria-label="playing ? 'Pause video' : 'Play video'">
                                <Pause v-if="playing" :size="17" />
                                <Play v-else :size="17" />
                            </button><button v-if="!videoFailed" @click="toggleSound"
                                :aria-label="muted ? 'Unmute' : 'Mute'">
                                <VolumeX v-if="muted" :size="17" />
                                <Volume2 v-else :size="17" />
                            </button><span>UNITED KINGDOM · VIP CONCIERGE</span></div>
                    </div>
                </div>
            </section>
            <section class="luxe-booking" id="reserve">
                <div class="container">
                    <div class="luxe-booking-title"><span class="luxe-kicker">YOUR NEXT JOURNEY</span>
                        <p>Thoughtfully planned. <em>Beautifully experienced.</em></p>
                    </div>
                    <BookingBar />
                </div>
            </section>
            <section class="luxe-intro luxe-pad" id="experience">
                <div class="container luxe-intro-grid">
                    <div class="luxe-intro-copy" v-reveal><span class="luxe-kicker">01 / A PERSONAL APPROACH</span>
                        <h2>Travel should feel<br><em>effortless.</em></h2>
                        <p>Whether arriving for an important engagement or departing for somewhere extraordinary, your
                            time deserves the utmost consideration.</p>
                        <p>From a personal welcome to thoughtful airport guidance, our concierge approach brings clarity
                            and calm to the moments between destinations.</p>
                        <NuxtLink to="/vip-experience" class="luxe-link">Explore your experience
                            <ArrowUpRight :size="17" />
                        </NuxtLink>
                    </div>
                    <div class="luxe-intro-art" v-reveal>
                        <div class="luxe-portrait"><img
                                src="https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1100&q=85"
                                alt="Understated luxury lounge setting" loading="lazy" /></div>
                        <div class="luxe-art-caption"><span>THE UNIVERSAL EXPERIENCE</span><span>✦</span></div>
                    </div>
                </div>
            </section>
            <section class="luxe-airports luxe-pad" id="airports">
                <div class="container">
                    <div class="luxe-airport-head" v-reveal>
                        <div><span class="luxe-kicker">02 / AIRPORTS & EXPERIENCES</span>
                            <h2>Every airport.<br><em>Considered.</em></h2>
                            <p>Choose a destination first. Available assistance options adjust to the airport you
                                select.</p>
                        </div>
                        <NuxtLink to="/airports" class="luxe-link">Explore all UK airports
                            <ArrowUpRight :size="18" />
                        </NuxtLink>
                    </div>
                    <div class="luxe-airport-explorer">
                        <div class="luxe-airport-photo">
                            <Transition name="luxe-fade" mode="out-in"><img :key="currentAirport.slug"
                                    :src="currentAirport.image" :alt="currentAirport.name + ' destination'"
                                    loading="lazy" /></Transition><span class="luxe-airport-code">{{ currentAirport.code
                                    }}</span>
                            <div class="luxe-airport-arrows"><button type="button" aria-label="Previous airport"
                                    @click="changeAirport(-1)">
                                    <ChevronLeft />
                                </button><button type="button" aria-label="Next airport" @click="changeAirport(1)">
                                    <ChevronRight />
                                </button></div>
                        </div>
                        <div class="luxe-airport-menu uaa-airport-menu">
                            <div v-for="(airport, i) in airports" :key="airport.slug" class="uaa-airport-item"
                                :class="{ 'is-active': chosenAirport === i }">
                                <button type="button" class="luxe-airport-row" :class="{ active: chosenAirport === i }"
                                    :aria-expanded="chosenAirport === i"
                                    @click="chosenAirport = chosenAirport === i ? -1 : i">
                                    <span>0{{ i + 1 }}</span>
                                    <strong>{{ airport.name }}</strong>
                                    <small>{{ airport.code }}</small>

                                    <ChevronRight :size="18" class="uaa-airport-chevron" />
                                </button>

                                <div class="uaa-airport-expand">
                                    <div v-if="chosenAirport === i">
                                        <AirportInlineServices :airport="airport.slug" />

                                        <NuxtLink :to="'/airports/' + airport.slug" class="uaa-airport-details">
                                            Explore {{ airport.name }}
                                            <ArrowUpRight :size="16" />
                                        </NuxtLink>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <!-- <div class="airport-combined-panel">
                        <div class="airport-panel-heading"><span class="luxe-kicker">CURRENTLY SELECTED ·
                                {{ currentAirport.code }}</span>
                            <h3>Tailor your airport experience</h3>
                            <p>The journey type and extras below are linked to this airport's service configuration.</p>
                        </div>
                        <AirportJourneyPanel :initial-airport="currentAirport.slug" :key="currentAirport.slug" />
                    </div> -->
                </div>
            </section>
            <section class="luxe-quote">
                <div class="container luxe-quote-content" v-reveal><span class="luxe-kicker">MORE THAN A SERVICE</span>
                    <p>“Luxury is the freedom to be <em>fully present</em> in every moment.”</p>
                    <div class="luxe-quote-rule"></div><span>THE UK AIRPORT ASSISTANCE PHILOSOPHY</span>
                </div>
            </section>
            <section class="luxe-how luxe-pad">
                <div class="container">
                    <div class="luxe-how-head" v-reveal><span class="luxe-kicker">04 / SIMPLICITY IN EVERY STEP</span>
                        <h2>Leave the details<br><em>to us.</em></h2>
                    </div>
                    <div class="luxe-steps">
                        <div v-for="s in steps" :key="s.num" class="luxe-step" v-reveal><span>{{ s.num }} / 03</span>
                            <h3>{{ s.name }}</h3>
                            <p>{{ s.desc }}</p>
                            <ArrowUpRight :size="20" />
                        </div>
                    </div>
                </div>
            </section>
            <section class="luxe-faq luxe-pad" id="faq">
                <div class="container luxe-faq-grid">
                    <div v-reveal><span class="luxe-kicker">05 / FREQUENTLY ASKED</span>
                        <h2>Before<br>you <em>fly.</em></h2>
                        <p>Every effortless experience begins with clarity. Here are answers to the questions we hear
                            most often.</p>
                    </div>
                    <div class="luxe-faq-items">
                        <div v-for="(item, i) in faqs" :key="item.q" class="luxe-faq-item"><button
                                :aria-expanded="openedFaq === i" @click="openedFaq = openedFaq === i ? -1 : i"><span>0{{
                                    i + 1 }}</span><strong>{{ item.q }}</strong>
                                <Minus v-if="openedFaq === i" :size="18" />
                                <Plus v-else :size="18" />
                            </button>
                            <div class="luxe-faq-answer" v-if="openedFaq === i">{{ item.a }}</div>
                        </div>
                    </div>
                </div>
            </section>
            <section class="luxe-final">
                <div class="luxe-final-photo"></div>
                <div class="container luxe-final-content" v-reveal>
                    <span class="luxe-kicker" style="color: #DCC5A5;">
                        A MORE BEAUTIFUL WAY TO TRAVEL
                    </span>
                    <h2>
                        <span style="color: #F4EADF;">Your journey,</span><br>
                        <em style="color: #DCC5A5;">reimagined.</em>
                    </h2>
                    <p>Allow us to take care of the details so you can focus on what matters most.</p>
                    <NuxtLink to="/book" class="luxe-button luxe-button-cream">Enquire about your journey
                        <ArrowUpRight :size="18" />
                    </NuxtLink>
                </div>
            </section>
        </main>
        <SiteFooter />
    </div>
</template>
