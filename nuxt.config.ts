const siteUrl = (
  process.env.NUXT_PUBLIC_SITE_URL || "https://uk-uaa-test.onrender.com"
).replace(/\/+$/, "");

const siteName =
  process.env.NUXT_PUBLIC_SITE_NAME || "UK Airport Assistance";

const hostname = new URL(siteUrl).hostname;

const isStaging =
  process.env.NUXT_PUBLIC_ALLOW_INDEXING === "true"
    ? false
    : (hostname === "localhost" ||
       hostname === "127.0.0.1" ||
       hostname.endsWith(".onrender.com") ||
       process.env.NUXT_PUBLIC_ALLOW_INDEXING === "false");

export default defineNuxtConfig({
  compatibilityDate: "2026-10-01",

  ssr: true,

  devtools: {
    enabled: false,
  },

  typescript: {
    tsConfig: {
      compilerOptions: {
        plugins: [
          {
            name: "@vue/typescript-plugin",
            location: "@vue/typescript-plugin",
            languages: ["vue"],
          },
        ],
      },
    },
  },

  css: ["~/assets/css/main.css", "~/assets/css/luxe.css"],

  app: {
    head: {
      htmlAttrs: {
        lang: "en-GB",
      },

      title: `${siteName} | VIP Meet & Greet`,

      meta: [
        {
          name: "description",
          content:
            `Premium ${siteName} VIP meet and greet assistance for arrivals, departures and connections. Explore airport-specific services and book your journey.`,
        },
        {
          name: "keywords",
          content:
            "UK airport assistance, VIP meet and greet, airport fast track, Heathrow VIP, Gatwick assistance, Manchester airport concierge, Edinburgh airport VIP, airport lounge UK, private airport transfer",
        },
        {
          name: "theme-color",
          content: "#182a40",
        },
        {
          name: "color-scheme",
          content: "light",
        },
        {
          property: "og:site_name",
          content: siteName,
        },
        {
          property: "og:locale",
          content: "en_GB",
        },
        {
          name: "twitter:card",
          content: "summary_large_image",
        },
        ...(isStaging
          ? [
              {
                name: "robots",
                content: "noindex, follow",
              },
            ]
          : [
              {
                name: "robots",
                content: "index, follow",
              },
            ]),
      ],

      link: [
        // Favicon
        {
          rel: "icon",
          href: "/favicon.ico",
          sizes: "any",
        },
        {
          rel: "icon",
          type: "image/png",
          sizes: "32x32",
          href: "/favicon-32x32.png",
        },
        {
          rel: "apple-touch-icon",
          sizes: "180x180",
          href: "/apple-touch-icon.png",
        },

        // Google Fonts
        {
          rel: "preconnect",
          href: "https://fonts.googleapis.com",
        },
        {
          rel: "preconnect",
          href: "https://fonts.gstatic.com",
          crossorigin: "anonymous",
        },
        {
          rel: "stylesheet",
          href: "https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Manrope:wght@400;500;600;700;800&family=Playfair+Display:ital,wght@0,400;1,400&display=swap",
        },
      ],
    },
  },

  routeRules: {
    "/api/**": {
      headers: {
        "X-Robots-Tag": "noindex, nofollow",
      },
    },

    "/images/**": {
      headers: {
        "Cache-Control": "public, max-age=604800",
      },
    },

    "/video/**": {
      headers: {
        "Cache-Control": "public, max-age=604800",
      },
    },
  },

  runtimeConfig: {
    bookingApiUrl:
      process.env.BOOKING_API_URL || "https://abc.api.com/abc-test",

    bookingApiEnabled: process.env.BOOKING_API_ENABLED === "true",

    bookingApiToken: process.env.BOOKING_API_TOKEN || "",

    public: {
      siteUrl,
      siteName,
      isStaging,
    },
  },
});
