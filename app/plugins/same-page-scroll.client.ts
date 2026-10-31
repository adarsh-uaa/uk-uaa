export default defineNuxtPlugin(() => {
  if (!import.meta.client) return

  window.addEventListener('click', (event: MouseEvent) => {
    // Allow default browser behavior for modifier keys or middle/right clicks (e.g. open in new tab)
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) {
      return
    }

    const anchor = (event.target as HTMLElement)?.closest('a')
    if (!anchor) return

    // Ignore external targets or downloads
    if (anchor.target === '_blank' || anchor.hasAttribute('download')) return

    const href = anchor.getAttribute('href')
    if (!href || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('javascript:')) {
      return
    }

    try {
      const targetUrl = new URL(anchor.href, window.location.href)

      // Only handle same-origin links
      if (targetUrl.origin !== window.location.origin) return

      const currentPath = window.location.pathname.replace(/\/+$/, '') || '/'
      const targetPath = targetUrl.pathname.replace(/\/+$/, '') || '/'

      // If clicking a link to the current page without an in-page section hash
      if (currentPath === targetPath && !targetUrl.hash) {
        if (window.scrollY > 0) {
          event.preventDefault()
          const isReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches
          window.scrollTo({
            top: 0,
            left: 0,
            behavior: isReducedMotion ? 'auto' : 'smooth',
          })
          if (window.location.hash) {
            history.replaceState(null, '', currentPath)
          }
        }
      }
    } catch {
      // Ignore URL parsing errors
    }
  }, { capture: true })
})
