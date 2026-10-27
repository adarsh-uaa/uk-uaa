export function useHomeNavigation() {
  const route = useRoute()
  const router = useRouter()

  function scrollToTop(behavior: ScrollBehavior = 'smooth') {
    if (!import.meta.client) return
    const isReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: isReducedMotion ? 'auto' : behavior,
    })
  }

  function handleHomeClick(event?: MouseEvent, onNavigate?: () => void) {
    // Allow default browser behavior for modifier keys / middle click (open in new tab)
    if (event && (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0)) {
      return
    }

    if (onNavigate) {
      onNavigate()
    }

    if (route.path === '/') {
      if (event) {
        event.preventDefault()
      }
      scrollToTop('smooth')
      if (route.hash) {
        router.replace({ path: '/', hash: '' })
      }
    } else {
      // If navigating from another page to home, ensure scroll reset
      scrollToTop('auto')
    }
  }

  return {
    handleHomeClick,
    scrollToTop,
  }
}
