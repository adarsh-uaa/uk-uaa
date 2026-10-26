export default defineEventHandler((event) => {
  const config = useRuntimeConfig(event);

  const siteUrl = String(config.public.siteUrl).replace(/\/+$/, "");

  const isStaging = config.public.isStaging === true;

  setHeader(event, "Content-Type", "text/plain; charset=utf-8");

  if (isStaging) {
    return ["User-agent: *", "Allow: /", "Disallow: /api/", ""].join("\n");
  }

  return [
    "User-agent: *",
    "Allow: /",
    "Disallow: /api/",
    `Sitemap: ${siteUrl}/sitemap.xml`,
    "",
  ].join("\n");
});
