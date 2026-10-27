import { airports, services } from "../../app/data/site";

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export default defineEventHandler((event) => {
  const config = useRuntimeConfig(event);
  const siteUrl = String(
    config.public.siteUrl || process.env.NUXT_PUBLIC_SITE_URL || ""
  ).replace(/\/+$/, "");

  const today = new Date().toISOString().split("T")[0];

  const staticEntries: { path: string; changefreq: string; priority: string }[] = [
    { path: "/", changefreq: "daily", priority: "1.0" },
    { path: "/book", changefreq: "weekly", priority: "0.9" },
    { path: "/airports", changefreq: "weekly", priority: "0.9" },
    { path: "/vip-experience", changefreq: "monthly", priority: "0.8" },
    { path: "/about", changefreq: "monthly", priority: "0.7" },
    { path: "/faq", changefreq: "monthly", priority: "0.7" },
    { path: "/contact", changefreq: "monthly", priority: "0.7" },
    { path: "/privacy", changefreq: "yearly", priority: "0.3" },
  ];

  const airportEntries = airports.map((a) => ({
    path: `/airports/${a.slug}`,
    changefreq: "weekly",
    priority: "0.8",
  }));

  const serviceEntries = services.map((s) => ({
    path: `/services/${s.slug}`,
    changefreq: "weekly",
    priority: "0.8",
  }));

  const allEntries = [...staticEntries, ...airportEntries, ...serviceEntries];

  const urls = allEntries
    .map((item) => {
      const absoluteUrl = `${siteUrl}${item.path}`;

      return [
        "  <url>",
        `    <loc>${escapeXml(absoluteUrl)}</loc>`,
        `    <lastmod>${today}</lastmod>`,
        `    <changefreq>${item.changefreq}</changefreq>`,
        `    <priority>${item.priority}</priority>`,
        "  </url>",
      ].join("\n");
    })
    .join("\n");

  setHeader(event, "Content-Type", "application/xml; charset=utf-8");

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    urls,
    "</urlset>",
  ].join("\n");
});

