<script setup lang="ts">
import {
    ArrowDownRight,
    ArrowUpRight,
    Volume2,
    VolumeX,
    Play,
    Pause
} from 'lucide-vue-next'

const videoEl = ref<HTMLVideoElement | null>(null)

const muted = ref(true)
const playing = ref(false)
const failed = ref(false)

const videoSrc = '/video/hero.mp4'
const posterSrc = '/images/hero-cover.webp'

function toggleAudio() {
    muted.value = !muted.value

    if (videoEl.value) {
        videoEl.value.muted = muted.value
    }
}

async function togglePlay() {
    const video = videoEl.value

    if (!video || failed.value) return

    if (video.paused) {
        try {
            await video.play()
            playing.value = true
        } catch {
            playing.value = false
        }
    } else {
        video.pause()
        playing.value = false
    }
}
</script>

<template>
    <section class="hero" aria-labelledby="hero-title">
        <div class="hero-background">
            <img :src="posterSrc" alt="" aria-hidden="true" class="hero-poster" width="1920" height="1080"
                fetchpriority="high" decoding="async" />

            <video v-show="!failed" ref="videoEl" class="hero-video" autoplay loop playsinline muted preload="metadata"
                :poster="posterSrc" @error="failed = true; playing = false" @pause="playing = false"
                @play="playing = true">
                <source :src="videoSrc" type="video/mp4" />
            </video>

            <div class="hero-shade"></div>
        </div>

        <div class="container hero-content">
            <div class="hero-kicker">
                <span class="thin-line"></span>
                PRIVATE AIRPORT CONCIERGE · UNITED KINGDOM
            </div>

            <h1 id="hero-title">
                Your time<br />
                <em>is everything.</em>
            </h1>

            <p class="hero-description">
                An extraordinary welcome. Considered assistance.
                A quieter way to move through the world’s busiest moments.
            </p>

            <div class="hero-actions">
                <NuxtLink to="/book#booking-form" class="button button-light">
                    Arrange your journey
                    <ArrowUpRight :size="17" aria-hidden="true" />
                </NuxtLink>

                <NuxtLink to="/#experience" class="text-link light">
                    Explore the experience
                    <ArrowDownRight :size="17" aria-hidden="true" />
                </NuxtLink>
            </div>

            <div class="hero-bottom">
                <span>DISCREET / PERSONAL / EFFORTLESS</span>

                <div v-if="!failed" class="hero-video-controls">
                    <button type="button" class="sound-toggle" :aria-label="muted ? 'Unmute video' : 'Mute video'"
                        @click="toggleAudio">
                        <VolumeX v-if="muted" :size="17" />
                        <Volume2 v-else :size="17" />
                    </button>

                    <button type="button" class="sound-toggle" :aria-label="playing ? 'Pause video' : 'Play video'"
                        @click="togglePlay">
                        <Pause v-if="playing" :size="17" />
                        <Play v-else :size="17" />
                    </button>
                </div>
            </div>
        </div>
    </section>
</template>

<style scoped>
.hero-background {
    position: absolute;
    inset: 0;
    overflow: hidden;
}

.hero-poster {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
}
</style>
