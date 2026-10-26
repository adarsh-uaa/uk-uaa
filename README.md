# UK Airport Assistance — Nuxt 4 Luxury Website

Based on your uploaded luxury Nuxt project. Includes a cinematic video hero, first-visit flight loader, scroll reveals, responsive editorial pages, dynamic airport-dependent service selections, a homepage short form that passes airport/service/date/adults to the full booking page, and an API proxy with the exact request keys supplied.

## Run

```bash
npm install
cp .env.example .env
npm run dev
```

Add your licensed video at `public/video/hero.mp4`. A poster image is shown if unavailable. Existing decorative images are illustrative and must be licensed/verified before launch.

## Booking integration — REQUIRED BEFORE LAUNCH

1. Open `app/data/booking.ts`. Replace **blank** airport `id` and optional add-on `id` values with VERIFIED upstream IDs. Map journey type IDs and class IDs to the real API. Do not guess IDs from the sample payload.
2. Set `BOOKING_API_URL=https://abc.api.com/abc-test` (replace when real), `BOOKING_API_ENABLED=true`, and server-side `BOOKING_API_TOKEN` if required.
3. The browser calls only `/api/booking`. The Nuxt server forwards once, without automatic retry, to avoid duplicate submissions after timeouts. Configure idempotency with your supplier for production.
4. `airport_name` currently uses **traveller name**, matching your supplied Fluent Forms mapping screenshot. `traveler_name` also uses traveller name. Confirm with API supplier whether `airport_name` is supposed to be the airport display name instead; if yes, change only that mapping in `FullBookingForm.vue`.
5. The supplied screenshots show fields and mapping, but they do not define authoritative IDs for every airport, extra, class, or service. The configured demo availability is illustrative, not a promise of airport permission.
6. Inspect `View API payload preview` on the booking page. Dates are serialized as `Oct/25/2026` and extras as comma-separated IDs.
7. Booking button will report demo mode until IDs and enabling are configured. No fake success confirmation.
8. Contact form is a **design placeholder** and explicitly does not transmit messages. Connect it before launch.

## Booking Audit Logs

Every booking submission attempt (whether successful or failed) is automatically recorded with complete details in the `logs/` directory:

- **`logs/bookings.csv`**: Tabular format with headers, ready to open in Microsoft Excel or Google Sheets.
- **`logs/bookings.jsonl`**: Machine-readable JSON Lines with the complete raw payload, nested journey info, and supplier response data.
- **`logs/bookings.log`**: Human-readable audit trail formatted block-by-block with timestamps and status tags.

### Details Captured
- **Status & Diagnostics**: `SUCCESS` vs `FAILED`, HTTP status code (200, 400, 502, 503, 500), error category (`DEMO_MODE_DISABLED`, `VALIDATION_ERROR`, `UPSTREAM_SUPPLIER_ERROR`, `INTERNAL_SERVER_ERROR`), and specific error message.
- **Traveler & Contact**: Traveler full name, email address, mobile number with country code, preferred communication channels.
- **Journey & Services**: Airport ID, service type (arrival/departure/transit), selected add-on service IDs, travel class.
- **Flight Details**: Arrival flight number, arrival date, arrival time, departure flight number, departure date, departure time.
- **Party & Luggage**: Adults count, children count, infants count, luggage count.
- **Metadata**: Unique booking ID (`bkg_...`), UTC & UK timestamps, client IP address, user-agent, source URL.

To test the logging system without making real API calls, run:
```bash
node --experimental-strip-types scripts/test-booking-logger.mjs
```

## SEO

Unique page titles, descriptions, canonical URLs, SSR, robots, sitemap, hierarchy, airport internal linking, FAQ content, UK localized language, and Organization JSON-LD are included. Submit the production sitemap to Search Console and measure real Core Web Vitals. **No code can guarantee rank #1 or an A grade on every external SEO audit.** Replace generic photos, develop original airport-specific information and include verified legal / company / contact details before publishing.

## Pages

`/`, `/airports`, `/airports/[slug]`, `/vip-experience`, `/about`, `/contact`, `/faq`, `/book`, `/privacy`.

## Test

`npm run build` and validate the endpoints with real test supplier IDs. Verify mobile styles, redirects, API payload, analytics, canonical hostname, and site URL on staging before deployment.
