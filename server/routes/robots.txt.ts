export default defineEventHandler((event) => {
  const config = useRuntimeConfig(event);
  const siteUrl = String(
    config.public.siteUrl || process.env.NUXT_PUBLIC_SITE_URL || ""
  ).replace(/\/+$/, "");

  setHeader(event, "Content-Type", "text/plain; charset=utf-8");

  return [
    "User-agent: *",
    "Allow: /",
    "Disallow: /api/",
    "",
    `Sitemap: ${siteUrl}/sitemap.xml`,
    "",
  ].join("\n");
});
