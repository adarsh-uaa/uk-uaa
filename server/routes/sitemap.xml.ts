import { airports } from "../../app/data/site";

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

  const siteUrl = String(config.public.siteUrl).replace(/\/+$/, "");

  if (config.public.isStaging === true) {
    setResponseStatus(event, 404);
    return "Sitemap unavailable on staging";
  }

  const paths = [
    "/",
    "/airports",
    "/vip-experience",
    "/about",
    "/contact",
    "/faq",
    ...airports.map((airport) => `/airports/${airport.slug}`),
  ];

  const urls = [...new Set(paths)]
    .map((path) => {
      const absoluteUrl = `${siteUrl}${path}`;

      return [
        "  <url>",
        `    <loc>${escapeXml(absoluteUrl)}</loc>`,
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
