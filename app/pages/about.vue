<template>
    <div class="luxe-page">
        <SiteHeader />
        <main>
            <SeoPage title="About Us | UK Airport Assistance"
                description="Discover the approach behind UK Airport Assistance: thoughtful, discreet airport concierge enquiries across the United Kingdom."
                path="/about" heading="A personal approach."
                intro="Travel should feel calm, considered and comfortably your own." />
            <section class="luxe-pad">
                <div class="container editorial-two">
                    <div v-reveal><span class="luxe-kicker">OUR PHILOSOPHY</span>
                        <h2>Your time is <em>precious.</em></h2>
                        <p>UK Airport Assistance helps travellers explore personalised airport meet and assist options
                            across major UK gateways.</p>
                        <p>We believe in clear service descriptions, a considered booking experience and realistic
                            expectations. Availability and any priority access are verified with service partners before
                            confirmation.</p>
                        <NuxtLink to="/vip-experience" class="luxe-link">Explore the VIP experience →</NuxtLink>
                    </div><img
                        src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1200&q=85"
                        loading="lazy" alt="Aircraft above clouds" />
                </div>
            </section>
            <section class="container inline-cta">
                <h2>Discover the airports we serve.</h2>
                <NuxtLink to="/airports" class="luxe-button luxe-button-cream">Explore airports →</NuxtLink>
            </section>
        </main>
        <SiteFooter />
    </div>
</template>
