const siteUrl = (
  process.env.NUXT_PUBLIC_SITE_URL || "https://ukairportvip.com"
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

const whatsappNumber =
  process.env.CONTACT_WHATSAPP_NUMBER ||
  "1234568";

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

  css: ["~/assets/css/main.css", "~/assets/css/luxe.css", "~/assets/css/site.css"],

  nitro: {
    compressPublicAssets: true,
  },

  vite: {
    build: {
      cssCodeSplit: true,
      chunkSizeWarningLimit: 1000,
    },
  },

  app: {
    head: {
      htmlAttrs: {
        lang: "en-GB",
        dir: "ltr",
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
          property: "og:type",
          content: "website",
        },
        {
          property: "og:image",
          content: `${siteUrl}/images/hero-light-lounge.webp`,
        },
        {
          property: "og:image:width",
          content: "1200",
        },
        {
          property: "og:image:height",
          content: "630",
        },
        {
          property: "og:image:alt",
          content: `${siteName} - VIP Airport Concierge & Meet & Greet`,
        },
        {
          name: "twitter:card",
          content: "summary_large_image",
        },
        {
          name: "twitter:title",
          content: `${siteName} | VIP Meet & Greet`,
        },
        {
          name: "twitter:description",
          content:
            `Premium ${siteName} VIP meet and greet assistance for arrivals, departures and connections.`,
        },
        {
          name: "twitter:image",
          content: `${siteUrl}/images/hero-light-lounge.webp`,
        },
        {
          name: "twitter:image:alt",
          content: `${siteName} - VIP Airport Concierge & Meet & Greet`,
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
        // Canonical Fallback
        {
          rel: "canonical",
          href: siteUrl,
        },

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

        // Google Fonts preconnect & dns-prefetch
        {
          rel: "dns-prefetch",
          href: "https://fonts.googleapis.com",
        },
        {
          rel: "dns-prefetch",
          href: "https://fonts.gstatic.com",
        },
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
          href: "https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap",
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

    "/uaaukadmin": {
      headers: {
        "X-Robots-Tag": "noindex, nofollow",
        "Cache-Control": "no-store, no-cache, must-revalidate, private",
      },
    },

    "/uaaukadmin/**": {
      headers: {
        "X-Robots-Tag": "noindex, nofollow",
        "Cache-Control": "no-store, no-cache, must-revalidate, private",
      },
    },

    // Immutable caching for hashed JS/CSS chunks
    "/_nuxt/**": {
      headers: {
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    },

    // Cache static assets with stale-while-revalidate
    "/images/**": {
      headers: {
        "Cache-Control": "public, max-age=2592000, stale-while-revalidate=86400",
      },
    },

    "/video/**": {
      headers: {
        "Cache-Control": "public, max-age=2592000, stale-while-revalidate=86400",
      },
    },

    "/animations/**": {
      headers: {
        "Cache-Control": "public, max-age=2592000, stale-while-revalidate=86400",
      },
    },

    "/favicon*": {
      headers: {
        "Cache-Control": "public, max-age=2592000, stale-while-revalidate=86400",
      },
    },
  },

  runtimeConfig: {
    bookingApiUrl:
      process.env.BOOKING_API_URL || "https://abc.api.com/abc-test",

    bookingApiEnabled: process.env.BOOKING_API_ENABLED === "true",

    bookingApiToken: process.env.BOOKING_API_TOKEN || "",

    admin: {
      username: process.env.ADMIN_USERNAME || "",
      passwordHash: process.env.ADMIN_PASSWORD_HASH || "",
      password: process.env.ADMIN_PASSWORD || "",
      sessionSecret: process.env.ADMIN_SESSION_SECRET || "",
    },

    smtp: {
      enabled:
        process.env.SMTP_ENABLED !== undefined
          ? process.env.SMTP_ENABLED === "true" || process.env.SMTP_ENABLED === "1"
          : Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS),
      host: process.env.SMTP_HOST || "",
      port: Number(process.env.SMTP_PORT) || 587,
      user: process.env.SMTP_USER || "",
      pass: process.env.SMTP_PASS || "",
      secure: process.env.SMTP_SECURE === "true" || process.env.SMTP_PORT === "465",
      from: process.env.SMTP_FROM || "",
      to: process.env.CONTACT_TO_EMAIL || "",
    },

    public: {
      siteUrl,
      siteName,
      isStaging,
      whatsappNumber,
    },
  },
});
