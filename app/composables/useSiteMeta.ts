export function useSiteMeta() {
  const config = useRuntimeConfig()
  
  const siteName = computed(() =>
    String(config.public.siteName || 'UK Airport Assistance')
  )

  const siteUrl = computed(() =>
    String(config.public.siteUrl || '').replace(/\/+$/, '')
  )

  return {
    siteName,
    siteUrl,
  }
}
