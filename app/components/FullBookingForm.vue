<script setup lang="ts">
import {
  airportsCatalog,
  journeyTypes,
  extrasCatalog,
  classes,
  communicationMethods,
  selectAirport,
  formatApiDate,
} from "~/data/booking";
import {
  getTerminalDetails,
  getServiceDetails,
  type TerminalSlug
} from '~/data/terminalServices'

import countryCodes from "~/data/countryCodes.json";

const route = useRoute();
const config = useRuntimeConfig();
const input = reactive({
  firstName: "",
  lastName: "",
  email: "",
  mobile: "",
  airport: String(route.query.airport || "heathrow"),
  terminal: (
    route.query.terminal === 'vip' ? 'vip' : 'normal'
  ) as TerminalSlug,
  service: String(route.query.service || "arrival"),
  packageSlug: String(route.query.package || ''),
  arrivalFlight: "",
  arrivalDate: "",
  arrivalTime: "",
  departureFlight: "",
  departureDate: "",
  departureTime: "",
  travelClass: "3",
  extras: [] as string[],
  luggages: 0,
  adults: Number(route.query.adults || 1),
  children: 0,
  infants: 0,
  communication: "Email (Default)",
});
const extrasQ = String(route.query.extras || "");

if (extrasQ) {
  const allowedExtras = selectAirport(input.airport)
    .extras as readonly string[];

  input.extras = extrasQ
    .split(",")
    .filter((slug) => allowedExtras.includes(slug));
}

const dateQ = String(route.query.date || "");
if (/^\d{4}-\d{2}-\d{2}$/.test(dateQ)) {
  if (input.service === "departure") input.departureDate = dateQ;
  else input.arrivalDate = dateQ;
}
const sending = ref(false),
  submitted = ref(false),
  error = ref(""),
  payloadPreview = ref(false);
const travelName = computed(() =>
  [input.firstName.trim(), input.lastName.trim()].filter(Boolean).join(" "),
);
const validExtras = computed(() =>
  extrasCatalog.filter(
    (x) =>
      input.extras.includes(x.slug) &&
      (selectAirport(input.airport).extras as readonly string[]).includes(
        x.slug,
      ),
  ),
);
const payload = computed(() => ({
  airport_name: travelName.value,
  airport_name_id: selectAirport(input.airport).id,
  email: input.email.trim(),
  mobile: fullMobile.value,
  service_types_id:
    currentServiceDetails.value?.apiServiceId ||
    (
      input.terminal === 'normal' &&
        !input.packageSlug
        ? journeyTypes.find(
          x => x.slug === input.service
        )?.id || ''
        : ''
    ),
  arrival_flight_number:
    input.service !== "departure" ? input.arrivalFlight.trim() : "",
  arrival_date:
    input.service !== "departure" ? formatApiDate(input.arrivalDate) : "",
  departure_flight_number:
    input.service !== "arrival" ? input.departureFlight.trim() : "",
  departure_date:
    input.service !== "arrival" ? formatApiDate(input.departureDate) : "",
  class_of_travel_id: input.travelClass,
  servicesinput_id: validExtras.value
    .map((x) => x.id)
    .filter(Boolean)
    .join(", "),
  no_luggages: String(input.luggages),
  traveler_name: travelName.value,
  arrival_time: input.service !== "departure" ? input.arrivalTime : "",
  departure_time: input.service !== "arrival" ? input.departureTime : "",
  uaa_url: "UK Airport Assistance",
  uaa_p_c_method: input.communication,
  childrens_count: String(input.children),
  infants_count: String(input.infants),
  adults_count: String(input.adults),
  ...(input.terminal === 'vip'
    ? {
      terminal_type: input.terminal,
      terminal_id: currentTerminal.value?.apiTerminalId || ''
    }
    : {}),
}));
const selectedCountry = ref("GB");

const selectedDialCode = computed(() => {
  return (
    countryCodes.find(
      (country) => country.code.toUpperCase() === selectedCountry.value,
    )?.dial_code || "+44"
  );
});

const fullMobile = computed(() => {
  let digits = input.mobile.replace(/\D/g, "");

  if (digits.startsWith("0")) {
    digits = digits.replace(/^0+/, "");
  }

  return `${selectedDialCode.value}${digits}`;
});

const currentTerminal = computed(() =>
  getTerminalDetails(
    input.airport,
    input.terminal
  )
)

const currentServiceDetails = computed(() =>
  getServiceDetails(
    input.airport,
    input.terminal,
    input.service
  )
)

watch(
  () => input.airport,
  () => {
    input.terminal = 'normal'
  }
)

const countryDropdownOpen = ref(false);
const countrySearch = ref("");
const countryDropdownRef = ref<HTMLElement | null>(null);

const filteredCountries = computed(() => {
  const search = countrySearch.value.toLowerCase().trim();

  return countryCodes.filter(
    (country) =>
      country.name.toLowerCase().includes(search) ||
      country.dial_code.includes(search) ||
      country.code.toLowerCase().includes(search),
  );
});

function chooseCountry(code: string) {
  selectedCountry.value = code.toUpperCase();
  countryDropdownOpen.value = false;
  countrySearch.value = "";
}

function closeCountryDropdown(event: PointerEvent) {
  if (
    countryDropdownRef.value &&
    !countryDropdownRef.value.contains(event.target as Node)
  ) {
    countryDropdownOpen.value = false;
  }
}

onMounted(() => {
  document.addEventListener("pointerdown", closeCountryDropdown);
});

onBeforeUnmount(() => {
  document.removeEventListener("pointerdown", closeCountryDropdown);
});

const requiresArrival = computed(() => input.service !== "departure"),
  requiresDeparture = computed(() => input.service !== "arrival");
async function submit() {
  error.value = "";
  submitted.value = false;
  if (!input.firstName.trim() || !input.lastName.trim()) {
    error.value = "Please enter the traveller’s first and last name.";
    return;
  }
  if (!selectAirport(input.airport).id) {
    error.value =
      "This airport has not been connected to its supplier ID. Configure app/data/booking.ts before submitting.";
    return;
  }

  if (!currentTerminal.value) {
    error.value =
      'The selected terminal is not configured for this airport.'
    return
  }

  if (input.terminal === 'vip') {
    if (
      !currentServiceDetails.value ||
      !currentTerminal.value.apiEnabled ||
      !currentTerminal.value.apiTerminalId ||
      !currentServiceDetails.value.apiServiceId
    ) {
      error.value =
        'VIP Terminal bookings are not connected to the supplier API yet. Please contact our team to enquire.'
      return
    }
  }

  const mobileDigits = input.mobile.replace(/\D/g, "");

  if (!/^\d{4,15}$/.test(mobileDigits)) {
    error.value = "Please enter a valid mobile number.";
    return;
  }
  if (validExtras.value.some((x) => !x.id)) {
    error.value =
      "A selected add-on is missing its supplier service ID. Configure app/data/booking.ts.";
    return;
  }
  if (
    requiresArrival.value &&
    (!input.arrivalFlight || !input.arrivalDate || !input.arrivalTime)
  ) {
    error.value = "Arrival flight, date, and time are required.";
    return;
  }
  if (
    requiresDeparture.value &&
    (!input.departureFlight || !input.departureDate || !input.departureTime)
  ) {
    error.value = "Departure flight, date, and time are required.";
    return;
  }

  if (
    input.packageSlug &&
    !currentServiceDetails.value
  ) {
    error.value = 'Please select a valid service package.'
    return
  }

  if (
    input.packageSlug &&
    !currentServiceDetails.value?.apiServiceId
  ) {
    error.value =
      'This service package is not yet connected to the booking supplier. Please contact our team.'
    return
  }

  if (
    currentServiceDetails.value?.price &&
    input.adults + input.children + input.infants >
    currentServiceDetails.value.price.upToPassengers
  ) {
    error.value =
      'This package price covers fewer passengers than selected. Please request a custom quotation.'
    return
  }

  sending.value = true;
  try {
    const res = await $fetch<{ success: boolean; message: string }>(
      "/api/booking",
      { method: "POST", body: payload.value },
    );
    if (res.success) submitted.value = true;
    else error.value = res.message || "Booking request could not be submitted.";
  } catch (e: any) {
    error.value =
      e?.data?.statusMessage ||
      e?.data?.message ||
      "The request could not be submitted. Please try again.";
  } finally {
    sending.value = false;
  }
}
</script>
<template>
  <form class="full-booking" @submit.prevent="submit">
    <div class="form-section-title">
      <span class="micro-label">01 / PASSENGER DETAILS</span>
      <h2>Your details</h2>
    </div>
    <div class="form-grid">
      <label class="premium-field"><span>First Name *</span><input v-model="input.firstName" autocomplete="given-name"
          placeholder="First name" required /></label><label class="premium-field"><span>Last Name *</span><input
          v-model="input.lastName" autocomplete="family-name" placeholder="Last name" required /></label><label
        class="premium-field"><span>Email *</span><input v-model="input.email" type="email" autocomplete="email"
          placeholder="you@example.com" required /></label>

      <div class="premium-field">
        <label for="mobile-number">Phone / Mobile *</label>

        <div class="phone-input-group">
          <div ref="countryDropdownRef" class="country-dropdown">
            <button type="button" class="country-trigger" :aria-expanded="countryDropdownOpen"
              aria-label="Select country calling code" aria-controls="country-options"
              @click="countryDropdownOpen = !countryDropdownOpen">
              <span>{{ selectedDialCode }}</span>
              <span class="country-chevron">⌄</span>
            </button>

            <div v-if="countryDropdownOpen" id="country-options" class="country-dropdown-menu">
              <input v-model="countrySearch" class="country-search" type="search"
                placeholder="Search country or code..." aria-label="Search countries" autocomplete="off" />

              <div class="country-options">
                <button v-for="country in filteredCountries" :key="country.code" type="button" class="country-option"
                  :class="{
                    active: selectedCountry === country.code.toUpperCase(),
                  }" @click="chooseCountry(country.code)">
                  <span>{{ country.name }}</span>
                  <span>{{ country.dial_code }}</span>
                </button>

                <p v-if="!filteredCountries.length" class="country-empty">
                  No countries found
                </p>
              </div>
            </div>
          </div>

          <input id="mobile-number" v-model="input.mobile" type="tel" inputmode="tel" autocomplete="tel-national"
            placeholder="7700 900123" required />
        </div>
      </div>
    </div>
    <div class="form-section-title">
      <span class="micro-label">02 / AIRPORT & SERVICES</span>
      <h2>Make it yours</h2>
    </div>


    <AirportServices v-model:airport="input.airport" v-model:terminal="input.terminal" v-model:service="input.service"
      v-model:packageSlug="input.packageSlug" v-model:extras="input.extras" :show-extras="true" />

    <div class="form-grid" style="margin-top: 18px">
      <label class="premium-field"><span>Class of travel *</span><select v-model="input.travelClass" required>
          <option v-for="x in classes" :key="x.id" :value="x.id">
            {{ x.name }}
          </option>
        </select></label><label class="premium-field"><span>Number of luggage pieces</span><input
          v-model.number="input.luggages" type="number" min="0" max="100" /></label>
    </div>
    <div class="form-section-title">
      <span class="micro-label">03 / FLIGHT ITINERARY</span>
      <h2>Your flight</h2>
    </div>
    <div v-if="requiresArrival" class="form-grid">
      <label class="premium-field"><span>Arrival Flight Number *</span><input v-model="input.arrivalFlight"
          placeholder="BA123" required /></label><label class="premium-field"><span>Arrival Date *</span><input
          v-model="input.arrivalDate" type="date" required /></label><label class="premium-field"><span>Arrival Time
          *</span><input v-model="input.arrivalTime" type="time" required /></label>
    </div>
    <div v-if="requiresDeparture" class="form-grid">
      <label class="premium-field"><span>Departure Flight Number *</span><input v-model="input.departureFlight"
          placeholder="BA456" required /></label><label class="premium-field"><span>Departure Date *</span><input
          v-model="input.departureDate" type="date" required /></label><label class="premium-field"><span>Departure Time
          *</span><input v-model="input.departureTime" type="time" required /></label>
    </div>
    <div class="form-section-title">
      <span class="micro-label">04 / TRAVELLERS & CONTACT</span>
      <h2>Your preferences</h2>
    </div>
    <div class="form-grid">
      <label class="premium-field"><span>Adults (above 12) *</span><input v-model.number="input.adults" type="number"
          min="1" max="100" required /></label><label class="premium-field"><span>Children (2–12 years)</span><input
          v-model.number="input.children" type="number" min="0" max="100" /></label><label
        class="premium-field"><span>Infants (0–2 years)</span><input v-model.number="input.infants" type="number"
          min="0" max="100" /></label><label class="premium-field"><span>Preferred communication *</span><select
          v-model="input.communication" required>
          <option v-for="m in communicationMethods" :key="m" :value="m">
            {{ m }}
          </option>
        </select></label>
    </div>
    <p class="subtle-note">
      Services, priority access and lounge availability are subject to airport
      and supplier confirmation. Submitting this form is a request, not a
      confirmed booking.
    </p>
    <label class="checkbox-choice consent"><input type="checkbox" required />I agree to be contacted about this
      enquiry and have read the
      <NuxtLink to="/privacy">privacy policy</NuxtLink>.
    </label>
    <p v-if="error" class="form-error" role="alert">{{ error }}</p>
    <p v-if="submitted" class="form-success" role="status">
      Your request was accepted by the configured API. Please await a separate
      booking confirmation.
    </p>
    <button type="submit" class="premium-submit" :disabled="sending">
      {{ sending ? "Submitting request…" : "Request VIP assistance →" }}</button><button type="button"
      class="payload-toggle" @click="payloadPreview = !payloadPreview">
      {{ payloadPreview ? "Hide" : "View" }} API payload preview
    </button>
    <pre v-if="payloadPreview" class="payload-preview">{{
      JSON.stringify(payload, null, 2)
    }}</pre>
  </form>
</template>
