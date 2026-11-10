  <script setup lang="ts">
  import {
    Mail,
    Receipt,
    CheckCircle2,
    FileCheck,
    Plane,
    Copy,
    Check,
    ArrowUpRight,
    ChevronDown,
    Users,
    AlertCircle
  } from 'lucide-vue-next'

  interface BookingDetails {
    reference: string
    bookingId: string
    submittedAt: string
    traveler: {
      name: string
      email: string
      mobile: string
      contactMethod: string
    }
    journey: {
      airportName: string
      airportCode: string
      terminal: string
      serviceType: string
      services: string[]
      travelClass: string
      arrivalFlight: string
      arrivalDate: string
      arrivalTime: string
      departureFlight: string
      departureDate: string
      departureTime: string
    }
    party: {
      adults: number
      children: number
      infants: number
      luggage: number
    }
  }

  interface LookupResponse {
    found: boolean
    booking: BookingDetails | null
  }

  const route = useRoute()
  const { siteName, siteUrl, whatsappUrl } = useSiteMeta()

  const referenceId = computed(() => {
    const raw = route.params.id
    if (Array.isArray(raw)) return raw[0] || 'ENQ-PENDING'
    return String(raw || 'ENQ-PENDING')
  })

  const { data: bookingLookup, pending } = await useFetch<LookupResponse>(
    () => `/api/booking/${encodeURIComponent(referenceId.value)}`,
    {
      key: `booking-lookup-${referenceId.value}`
    }
  )

  const booking = computed(() => bookingLookup.value?.booking || null)
  const isUnknown = computed(() => !pending.value && !booking.value)

  const partySummaryText = computed(() => {
    if (!booking.value) return ''
    const parts: string[] = []
    const { adults, children, infants } = booking.value.party
    if (adults > 0) parts.push(`${adults} ${adults === 1 ? 'Adult' : 'Adults'}`)
    if (children > 0) parts.push(`${children} ${children === 1 ? 'Child' : 'Children'}`)
    if (infants > 0) parts.push(`${infants} ${infants === 1 ? 'Infant' : 'Infants'}`)
    return parts.length ? parts.join(', ') : '1 Adult'
  })

  const canonicalUrl = computed(
    () => `${siteUrl.value}/booking-confirmation/${encodeURIComponent(referenceId.value)}`
  )

  useSeoMeta({
    title: computed(() =>
      isUnknown.value
        ? `Unknown Booking Reference #${referenceId.value} | ${siteName.value}`
        : `Booking Confirmation #${referenceId.value} | ${siteName.value}`
    ),
    description: computed(() =>
      isUnknown.value
        ? `Booking reference #${referenceId.value} could not be located. Please contact ${siteName.value} concierge support.`
        : `Booking request received. Enquiry reference #${referenceId.value}. Our VIP concierge desk will review your details and send confirmation promptly.`
    ),
    robots: 'noindex, nofollow',
    ogTitle: computed(() => `Booking Confirmation #${referenceId.value} | ${siteName.value}`),
    ogDescription: 'Your VIP airport assistance booking request has been received.',
    ogType: 'website',
    ogUrl: canonicalUrl,
    twitterCard: 'summary'
  })

  useHead(() => ({
    link: [{ rel: 'canonical', href: canonicalUrl.value }]
  }))

  const copied = ref(false)

  async function copyReference() {
    if (!referenceId.value) return
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(referenceId.value)
      } else {
        const textarea = document.createElement('textarea')
        textarea.value = referenceId.value
        textarea.style.position = 'fixed'
        textarea.style.opacity = '0'
        document.body.appendChild(textarea)
        textarea.select()
        document.execCommand('copy')
        document.body.removeChild(textarea)
      }
      copied.value = true
      setTimeout(() => {
        copied.value = false
      }, 2500)
    } catch (err) {
      console.warn('Copy reference failed:', err)
    }
  }

  function scrollToDetails() {
    const el = document.getElementById('confirmation-details')
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const steps = [
    {
      number: '01',
      title: 'Check Your Email',
      description:
        'You’ll receive a quick thank-you email confirming that we’ve successfully received your booking enquiry.',
      icon: Mail
    },
    {
      number: '02',
      title: 'Quote & Payment Link',
      description:
        'Our team will carefully check your booking request and send you the best available quote along with a secure payment link via email.',
      icon: Receipt
    },
    {
      number: '03',
      title: 'Review & Confirm',
      description:
        'You’ll have the flexibility to review your options, choose the service that best suits your needs, and proceed with payment.',
      icon: CheckCircle2
    },
    {
      number: '04',
      title: 'Confirmation Email',
      description:
        'Once your payment is received, our team will check the service availability. Once confirmed, you will receive a confirmation email along with your service voucher, containing all the details you need in one place.',
      icon: FileCheck
    },
    {
      number: '05',
      title: 'Meet & Assist at the Airport',
      description:
        'On the day of travel, our friendly airport representative will meet you at the designated point and ensure a smooth, stress-free airport experience.',
      icon: Plane
    }
  ]
  </script>

  <template>
    <div class="luxe-page confirmation-page">
      <SiteHeader />

      <main>
        <!-- Hero / Status Section -->
        <section class="interior-hero confirmation-hero">
          <div class="container confirmation-hero-content">
            <!-- Status Icon / Lottie Animation -->
            <div class="confirmation-lottie-box">
              <div v-if="isUnknown" class="confirmation-unknown-icon" aria-hidden="true">
                <AlertCircle :size="48" />
              </div>
              <ClientOnly v-else>
                <LottieAnimation
                  animation-link="https://lottie.host/a1a9dde2-d1f6-488a-9950-c609c6d8b8ef/pCwjgN0cho.json"
                  :width="120"
                  :height="120"
                  :loop="false"
                  :auto-play="true"
                />
                <template #fallback>
                  <div class="confirmation-fallback-tick" aria-hidden="true">✓</div>
                </template>
              </ClientOnly>
            </div>

            <span class="luxe-kicker">
              {{ isUnknown ? 'BOOKING REFERENCE LOOKUP' : 'ENQUIRY CONFIRMATION' }}
            </span>
            <h1>
              {{ isUnknown ? 'Unknown Booking Reference.' : 'Booking Request Received.' }}
            </h1>
            <p class="confirmation-lead">
              <template v-if="isUnknown">
                We could not locate a confirmed booking matching reference #{{ referenceId }} in our logs. Please verify your reference or contact our concierge desk for details.
              </template>
              <template v-else>
                Your booking request has been received by our concierge service. Our VIP concierge desk will review your details and send confirmation promptly.
              </template>
            </p>

            <!-- Enquiry Reference Pill -->
            <div class="reference-badge-wrap">
              <div class="reference-badge" :class="{ 'is-unknown-badge-pill': isUnknown }">
                <span class="ref-label">Enquiry Reference:</span>
                <span class="ref-value">{{ referenceId }}</span>
                <!-- <button
                  type="button"
                  class="copy-ref-btn"
                  :title="copied ? 'Copied to clipboard' : 'Copy reference'"
                  :aria-label="copied ? 'Copied' : 'Copy enquiry reference'"
                  @click="copyReference"
                >
                  <Check v-if="copied" :size="15" class="copied-check" />
                  <Copy v-else :size="15" />
                  <span>{{ copied ? 'Copied' : 'Copy' }}</span>
                </button> -->
              </div>
            </div>

            <!-- Minimalist Scroll Down Cue with Contextual Text -->
            <a
              href="#confirmation-details"
              class="scroll-down-minimal"
              aria-label="Scroll down to view booking details"
              @click.prevent="scrollToDetails"
            >
              <span class="scroll-text">
                {{ isUnknown ? 'View Support & Contact Options' : 'Explore Your Booking Details' }}
              </span>
              <div class="minimal-chevrons-grid" aria-hidden="true">
                <div class="chevron-row row-1">
                  <ChevronDown :size="16" class="grid-chevron" />
                  <ChevronDown :size="16" class="grid-chevron" />
                  <ChevronDown :size="16" class="grid-chevron" />
                </div>
                <div class="chevron-row row-2">
                  <ChevronDown :size="16" class="grid-chevron" />
                  <ChevronDown :size="16" class="grid-chevron" />
                  <ChevronDown :size="16" class="grid-chevron" />
                </div>
                <div class="chevron-row row-3">
                  <ChevronDown :size="16" class="grid-chevron" />
                  <ChevronDown :size="16" class="grid-chevron" />
                  <ChevronDown :size="16" class="grid-chevron" />
                </div>
              </div>
            </a>
          </div>
        </section>

        <!-- Booking Details / Unknown Section -->
        <section id="confirmation-details" class="luxe-pad confirmation-pad">
          <div class="container confirmation-wrap">
            <!-- Loading State -->
            <article v-if="pending" class="confirmation-thankyou-card">
              <div class="thankyou-badge">CONFIRMATION DETAILS</div>
              <h2>Loading Booking Details...</h2>
              <p>Retrieving your confirmed booking itinerary from our records.</p>
            </article>

            <!-- Unknown Booking ID State -->
            <article v-else-if="isUnknown" class="confirmation-thankyou-card is-unknown">
              <div class="thankyou-badge is-unknown-badge">UNKNOWN BOOKING ID</div>
              <h2>Booking Details Not Found</h2>
              <p class="unknown-desc">
                No confirmed booking record was found for reference <strong>#{{ referenceId }}</strong>.
                If you recently submitted a request, have an enquiry older than our active log window, or need immediate assistance, please contact our VIP concierge team with your reference or flight information.
              </p>

              <div class="unknown-contact-actions">
                <NuxtLink to="/contact#contact-form" class="luxe-button luxe-button-gold">
                  <Mail :size="16" />
                  <span>Contact for Details</span>
                </NuxtLink>

                <a
                  :href="whatsappUrl"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="hero-ghost-btn whatsapp-outline-btn"
                >
                  <WhatsAppIcon :size="17" />
                  <span>WhatsApp Concierge</span>
                </a>
              </div>
            </article>

            <!-- Booking Details Summary Card (From Logs) -->
            <article v-else-if="booking" class="confirmation-thankyou-card">
              <div class="thankyou-badge">CONFIRMATION DETAILS</div>
              <h2>
                Thank You{{ booking.traveler.name ? `, ${booking.traveler.name}` : ' for Your Booking' }}!
              </h2>
              <p class="summary-intro-meta">
                Submitted on <strong>{{ booking.submittedAt }}</strong> · Reference <strong>#{{ booking.reference }}</strong>
              </p>

              <div class="booking-details-grid">
                <!-- Journey & Service Summary -->
                <div class="detail-group-card">
                  <div class="detail-group-title">
                    <Plane :size="15" />
                    <span>Journey &amp; Service</span>
                  </div>
                  <dl class="detail-list">
                    <div class="detail-row">
                      <dt>Airport</dt>
                      <dd>
                        {{ booking.journey.airportName }}
                        <span v-if="booking.journey.airportCode" class="code-tag">({{ booking.journey.airportCode }})</span>
                      </dd>
                    </div>
                    <div v-if="booking.journey.terminal" class="detail-row">
                      <dt>Terminal</dt>
                      <dd>{{ booking.journey.terminal }}</dd>
                    </div>
                    <div class="detail-row">
                      <dt>Service Type</dt>
                      <dd>{{ booking.journey.serviceType }}</dd>
                    </div>
                    <div class="detail-row">
                      <dt>Class of Travel</dt>
                      <dd>{{ booking.journey.travelClass }}</dd>
                    </div>
                  </dl>

                  <div v-if="booking.journey.services.length" class="services-tags-section">
                    <span class="detail-sub-label">Selected Services</span>
                    <div class="service-pills-row">
                      <span v-for="srv in booking.journey.services" :key="srv" class="service-pill">
                        {{ srv }}
                      </span>
                    </div>
                  </div>
                </div>

                <!-- Flight & Passenger Summary -->
                <div class="detail-group-card">
                  <div class="detail-group-title">
                    <Users :size="15" />
                    <span>Flight &amp; Passenger Details</span>
                  </div>
                  <dl class="detail-list">
                    <div v-if="booking.journey.arrivalFlight || booking.journey.arrivalDate" class="detail-row">
                      <dt>Arrival Flight</dt>
                      <dd>
                        <strong>{{ booking.journey.arrivalFlight || 'TBD' }}</strong>
                        <span v-if="booking.journey.arrivalDate" class="flight-datetime">
                          · {{ booking.journey.arrivalDate }}<template v-if="booking.journey.arrivalTime"> at {{ booking.journey.arrivalTime }}</template>
                        </span>
                      </dd>
                    </div>
                    <div v-if="booking.journey.departureFlight || booking.journey.departureDate" class="detail-row">
                      <dt>Departure Flight</dt>
                      <dd>
                        <strong>{{ booking.journey.departureFlight || 'TBD' }}</strong>
                        <span v-if="booking.journey.departureDate" class="flight-datetime">
                          · {{ booking.journey.departureDate }}<template v-if="booking.journey.departureTime"> at {{ booking.journey.departureTime }}</template>
                        </span>
                      </dd>
                    </div>
                    <div class="detail-row">
                      <dt>Passengers</dt>
                      <dd>{{ partySummaryText }}</dd>
                    </div>
                    <div class="detail-row">
                      <dt>Luggage</dt>
                      <dd>{{ booking.party.luggage }} {{ booking.party.luggage === 1 ? 'Bag' : 'Bags' }}</dd>
                    </div>
                    <div v-if="booking.traveler.name" class="detail-row">
                      <dt>Lead Passenger</dt>
                      <dd>{{ booking.traveler.name }}</dd>
                    </div>
                    <div v-if="booking.traveler.email" class="detail-row">
                      <dt>Email</dt>
                      <dd>{{ booking.traveler.email }}</dd>
                    </div>
                    <div v-if="booking.traveler.mobile" class="detail-row">
                      <dt>Mobile</dt>
                      <dd>{{ booking.traveler.mobile }}</dd>
                    </div>
                    <div v-if="booking.traveler.contactMethod" class="detail-row">
                      <dt>Preferred Contact</dt>
                      <dd>{{ booking.traveler.contactMethod }}</dd>
                    </div>
                  </dl>
                </div>
              </div>
            </article>

            <!-- Next Steps List (only when booking is found) -->
            <div v-if="booking" class="next-steps-container">
              <div class="next-steps-header">
                <span class="luxe-kicker">WHAT HAPPENS NEXT</span>
                <h2>Your journey, from here to the runway.</h2>
                <p>Here is what you can expect as our team coordinates your VIP airport assistance:</p>
              </div>

              <ol class="next-steps-list">
                <li
                  v-for="step in steps"
                  :key="step.number"
                  class="next-step-card"
                >
                  <div class="step-badge">
                    <component :is="step.icon" :size="20" class="step-icon" />
                    <span class="step-num">{{ step.number }}</span>
                  </div>

                  <div class="step-content">
                    <h3>{{ step.title }}</h3>
                    <p>{{ step.description }}</p>
                  </div>
                </li>
              </ol>
            </div>

            <!-- In-Page Booking Experience Review Card (only when booking is found) -->
            <ClientOnly v-if="booking">
              <BookingReviewCard :booking-reference="referenceId" />
            </ClientOnly>

            <!-- Action Buttons -->
            <div class="confirmation-actions">
              <NuxtLink to="/book" class="luxe-button luxe-button-gold">
                Arrange Another Journey
                <ArrowUpRight :size="16" />
              </NuxtLink>

              <NuxtLink to="/" class="hero-ghost-btn">
                Return to Home
              </NuxtLink>

              <!-- <a
                :href="whatsappUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="hero-ghost-btn whatsapp-action"
              >
                <WhatsAppIcon :size="18" color="#ffffff" />
                <span>WhatsApp Concierge</span>
              </a> -->
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  </template>

  <style scoped>
  .confirmation-hero {
    text-align: center;
    min-height: 100vh;
    min-height: 100svh;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    padding: 105px 0 28px;
    box-sizing: border-box;
  }

  .confirmation-hero-content {
    max-width: 820px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    align-items: center;
    flex: 1;
    width: 100%;
  }

  .confirmation-lottie-box {
    margin-bottom: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .confirmation-fallback-tick {
    width: 90px;
    height: 90px;
    line-height: 90px;
    text-align: center;
    font-size: 46px;
    font-weight: bold;
    color: #c9a86a;
    background: rgba(201, 168, 106, 0.15);
    border: 1px solid rgba(201, 168, 106, 0.4);
    border-radius: 50%;
    margin: 0 auto;
  }

  .confirmation-hero h1 {
    font-family: 'Playfair Display', Georgia, serif;
    font-size: clamp(36px, 5.5vw, 64px);
    color: #f4eadf;
    margin: 16px 0 18px;
    font-weight: 400;
    line-height: 1.15;
  }

  .confirmation-hero h1 em {
    color: #c9a86a;
    font-style: italic;
  }

  .confirmation-lead {
    font-size: clamp(16px, 1.8vw, 18.5px);
    color: #f4ede3;
    line-height: 1.65;
    max-width: 660px;
    margin: 0 auto 28px;
    text-shadow: 0 1px 6px rgba(0, 0, 0, 0.45);
  }

  .reference-badge-wrap {
    display: flex;
    justify-content: center;
    width: 100%;
  }

  .reference-badge {
    display: inline-flex;
    align-items: center;
    gap: 12px;
    background: rgba(16, 29, 45, 0.85);
    backdrop-filter: blur(8px);
    border: 1px solid rgba(201, 168, 106, 0.45);
    padding: 10px 18px;
    border-radius: 6px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35);
  }

  .ref-label {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: #dcc5a5;
  }

  .ref-value {
    font-family: monospace;
    font-size: 17px;
    font-weight: 700;
    color: #ffffff;
    letter-spacing: 0.05em;
    padding: 2px 8px;
    background: rgba(201, 168, 106, 0.2);
    border-radius: 4px;
  }

  .copy-ref-btn {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 5px 10px;
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(201, 168, 106, 0.3);
    color: #f4eadf;
    border-radius: 4px;
    font-size: 11.5px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .copy-ref-btn:hover {
    background: #c9a86a;
    color: #182a40;
  }

  .copied-check {
    color: #48bb78;
  }

  /* ------------------------------------------------------------- */
  /* Minimalist Scroll Down Chevrons Grid (3x3 Horizontal/Vertical) */
  /* ------------------------------------------------------------- */

  .scroll-down-minimal {
    margin-top: auto;
    margin-bottom: 12px;
    display: inline-flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 6px;
    text-decoration: none;
    cursor: pointer;
    padding: 8px 14px;
    background: transparent;
    border: none;
    user-select: none;
    transition: transform 0.25s ease;
  }

  .scroll-down-minimal:hover {
    transform: translateY(3px);
  }

  .scroll-down-minimal:focus-visible {
    outline: 2px solid #c9a86a;
    outline-offset: 4px;
    border-radius: 4px;
  }

  .scroll-text {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: #dcc5a5;
    text-shadow: 0 1px 4px rgba(0, 0, 0, 0.7);
    transition: color 0.25s ease;
  }

  .scroll-down-minimal:hover .scroll-text {
    color: #ffffff;
  }

  .minimal-chevrons-grid {
    display: flex;
    flex-direction: column;
    align-items: center;
    color: #c9a86a;
    transition: color 0.25s ease;
  }

  .scroll-down-minimal:hover .minimal-chevrons-grid {
    color: #ffffff;
  }

  .chevron-row {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }

  .row-1 {
    animation: rowCascade 1.6s cubic-bezier(0.4, 0, 0.2, 1) infinite;
    animation-delay: 0s;
  }

  .row-2 {
    margin-top: -6px;
    animation: rowCascade 1.6s cubic-bezier(0.4, 0, 0.2, 1) infinite;
    animation-delay: 0.18s;
  }

  .row-3 {
    margin-top: -6px;
    animation: rowCascade 1.6s cubic-bezier(0.4, 0, 0.2, 1) infinite;
    animation-delay: 0.36s;
  }

  .grid-chevron {
    stroke-width: 2.25;
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.75));
    transition: filter 0.25s ease;
  }

  .scroll-down-minimal:hover .grid-chevron {
    filter: drop-shadow(0 0 8px rgba(201, 168, 106, 0.95));
  }

  @keyframes rowCascade {
    0%, 100% {
      opacity: 0.35;
      transform: translateY(0);
    }
    50% {
      opacity: 1;
      transform: translateY(3.5px);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .row-1,
    .row-2,
    .row-3 {
      animation: none;
      opacity: 0.85;
      transform: none;
    }
  }

  /* ------------------------------------------ */
  /* Confirmation Content Body                  */
  /* ------------------------------------------ */

  .confirmation-pad {
    padding-top: 48px;
    padding-bottom: 96px;
    scroll-margin-top: 90px;
  }

  .confirmation-wrap {
    max-width: 860px;
    margin: 0 auto;
  }

  .confirmation-thankyou-card {
    background: #ffffff;
    border: 1px solid rgba(201, 168, 106, 0.35);
    border-radius: 10px;
    padding: 36px 32px;
    margin-bottom: 48px;
    box-shadow: 0 12px 36px rgba(24, 42, 64, 0.06);
    position: relative;
  }

  .thankyou-badge {
    display: inline-block;
    font-size: 9.5px;
    font-weight: 800;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: #182a40;
    background: #c9a86a;
    padding: 4px 10px;
    border-radius: 3px;
    margin-bottom: 14px;
  }

  .confirmation-thankyou-card h2 {
    font-family: 'Playfair Display', Georgia, serif;
    font-size: clamp(24px, 3.2vw, 32px);
    color: #182a40;
    margin: 0 0 10px;
    font-weight: 500;
  }

  .confirmation-thankyou-card p {
    font-size: 15.5px;
    color: #5c554c;
    line-height: 1.65;
    margin: 0;
  }

  .confirmation-unknown-icon {
    width: 84px;
    height: 84px;
    border-radius: 50%;
    background: rgba(201, 168, 106, 0.16);
    border: 1.5px solid rgba(201, 168, 106, 0.45);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #e3c191;
    margin: 12px auto;
  }

  .is-unknown-badge-pill {
    border-color: rgba(227, 193, 145, 0.45);
  }

  .is-unknown-badge {
    background: #9b1c31;
    color: #ffffff;
  }

  .summary-intro-meta {
    font-size: 14px !important;
    color: #7a736a !important;
    margin-bottom: 24px !important;
  }

  .summary-intro-meta strong {
    color: #182a40;
  }

  .booking-details-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 20px;
    margin-top: 8px;
  }

  .detail-group-card {
    background: #faf8f4;
    border: 1px solid #ebe4d8;
    border-radius: 8px;
    padding: 20px 22px;
  }

  .detail-group-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 11.5px;
    font-weight: 800;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: #8c6a2e;
    margin-bottom: 14px;
    padding-bottom: 10px;
    border-bottom: 1px solid #e6dfd3;
  }

  .detail-list {
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .detail-row {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    gap: 12px;
    font-size: 13.5px;
    line-height: 1.45;
  }

  .detail-row dt {
    color: #777067;
    font-weight: 500;
    flex-shrink: 0;
  }

  .detail-row dd {
    margin: 0;
    color: #182a40;
    font-weight: 600;
    text-align: right;
    word-break: break-word;
  }

  .code-tag {
    color: #8c6a2e;
    font-weight: 700;
    font-size: 12px;
  }

  .flight-datetime {
    font-weight: 400;
    color: #5c554c;
  }

  .services-tags-section {
    margin-top: 16px;
    padding-top: 14px;
    border-top: 1px dashed #dcd4c7;
  }

  .detail-sub-label {
    display: block;
    font-size: 11.5px;
    font-weight: 700;
    color: #777067;
    margin-bottom: 8px;
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }

  .service-pills-row {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }

  .service-pill {
    display: inline-block;
    padding: 5px 10px;
    background: #ffffff;
    border: 1px solid rgba(201, 168, 106, 0.45);
    border-radius: 4px;
    font-size: 12px;
    font-weight: 600;
    color: #182a40;
  }

  .unknown-desc {
    margin-bottom: 24px !important;
  }

  .unknown-contact-actions {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 14px;
  }

  .whatsapp-outline-btn {
    border-color: #0f7a4d !important;
    color: #0f7a4d !important;
  }

  .whatsapp-outline-btn:hover {
    background: #0f7a4d !important;
    color: #ffffff !important;
  }

  /* ------------------------------------------ */
  /* Next Steps Section                         */
  /* ------------------------------------------ */

  .next-steps-container {
    margin-bottom: 52px;
  }

  .next-steps-header {
    margin-bottom: 28px;
  }

  .next-steps-header h2 {
    font-family: 'Playfair Display', Georgia, serif;
    font-size: clamp(24px, 3.5vw, 34px);
    color: #182a40;
    margin: 8px 0 10px;
    font-weight: 500;
  }

  .next-steps-header p {
    font-size: 15px;
    color: #7a736a;
    margin: 0;
  }

  .next-steps-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .next-step-card {
    display: flex;
    align-items: flex-start;
    gap: 20px;
    background: #ffffff;
    border: 1px solid #ebe5dc;
    border-radius: 8px;
    padding: 24px 26px;
    transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
  }

  .next-step-card:hover {
    transform: translateY(-2px);
    border-color: #c9a86a;
    box-shadow: 0 8px 24px rgba(24, 42, 64, 0.06);
  }

  .step-badge {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 52px;
    min-width: 52px;
    height: 52px;
    background: #182a40;
    color: #c9a86a;
    border-radius: 8px;
    gap: 3px;
    padding: 6px;
  }

  .step-icon {
    stroke-width: 1.75;
  }

  .step-num {
    font-size: 10px;
    font-weight: 800;
    letter-spacing: 0.1em;
    color: #f4eadf;
  }

  .step-content {
    flex: 1;
  }

  .step-content h3 {
    font-size: 17px;
    font-weight: 700;
    color: #182a40;
    margin: 0 0 6px;
    letter-spacing: -0.01em;
  }

  .step-content p {
    font-size: 14.5px;
    color: #5c554c;
    line-height: 1.6;
    margin: 0;
  }

  /* ------------------------------------------ */
  /* Actions                                    */
  /* ------------------------------------------ */

  .confirmation-actions {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    gap: 16px;
    padding-top: 16px;
  }

  .luxe-button-gold {
    background: #c9a86a;
    color: #182a40;
    font-weight: 700;
    border: 1px solid #c9a86a;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 13px 28px;
    border-radius: 4px;
    text-decoration: none;
    font-size: 13.5px;
    letter-spacing: 0.06em;
    transition: all 0.2s ease;
  }

  .luxe-button-gold:hover {
    background: #b18b65;
    color: #ffffff;
    border-color: #b18b65;
  }

  .hero-ghost-btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 13px 24px;
    border-radius: 4px;
    font-size: 13.5px;
    font-weight: 600;
    letter-spacing: 0.04em;
    text-decoration: none;
    background: transparent;
    color: #182a40;
    border: 1px solid rgba(24, 42, 64, 0.25);
    transition: all 0.2s ease;
    cursor: pointer;
  }

  .hero-ghost-btn:hover {
    background: #182a40;
    color: #ffffff;
    border-color: #182a40;
  }

  .whatsapp-action {
    background: #0f7a4d !important;
    color: #ffffff !important;
    border-color: #0f7a4d !important;
    display: inline-flex;
    align-items: center;
    gap: 8px;
  }

  .whatsapp-action:hover {
    background: #0d633f !important;
    border-color: #0d633f !important;
  }

  /* ------------------------------------------ */
  /* Responsive                                 */
  /* ------------------------------------------ */

  @media (max-width: 767px) {
    .confirmation-hero {
      min-height: 100vh;
      min-height: 100svh;
      padding: 92px 0 20px;
    }

    .scroll-down-minimal {
      margin-top: auto;
      margin-bottom: 8px;
      padding: 6px 10px;
    }

    .confirmation-pad {
      padding-top: 32px;
      padding-bottom: 64px;
      scroll-margin-top: 80px;
    }

    .confirmation-thankyou-card {
      padding: 24px 20px;
    }

    .booking-details-grid {
      grid-template-columns: 1fr;
      gap: 14px;
    }

    .detail-group-card {
      padding: 16px;
    }

    .detail-row {
      flex-direction: column;
      align-items: flex-start;
      gap: 2px;
    }

    .detail-row dd {
      text-align: left;
    }

    .unknown-contact-actions {
      flex-direction: column;
      width: 100%;
    }

    .unknown-contact-actions > * {
      width: 100%;
      justify-content: center;
      text-align: center;
    }

    .next-step-card {
      padding: 18px 16px;
      gap: 14px;
    }

    .step-badge {
      width: 44px;
      min-width: 44px;
      height: 44px;
    }

    .reference-badge {
      flex-direction: column;
      gap: 8px;
      width: 100%;
      text-align: center;
    }

    .confirmation-actions {
      flex-direction: column;
      width: 100%;
    }

    .confirmation-actions > * {
      width: 100%;
      justify-content: center;
      text-align: center;
    }
  }
  </style>

