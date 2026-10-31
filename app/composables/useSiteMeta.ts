export function useSiteMeta() {
  const config = useRuntimeConfig()

  const siteName = computed(() =>
    String(config.public.siteName || 'UK Airport Assistance')
  )

  const siteUrl = computed(() =>
    String(config.public.siteUrl || '').replace(/\/+$/, '')
  )

  const whatsappNumber = computed(() =>
    String(config.public.whatsappNumber || '1234568').replace(/[^0-9]/g, '')
  )

  const whatsappUrl = computed(() => {
    const text = encodeURIComponent('Hi, I would like to know more about UK Airport Assistance Services')
    return `https://wa.me/${whatsappNumber.value}?text=${text}`
  })

  return {
    siteName,
    siteUrl,
    whatsappNumber,
    whatsappUrl,
  }
}
