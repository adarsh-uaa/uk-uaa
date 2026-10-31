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

  function handleNavClick(targetPath: string, event?: MouseEvent, onNavigate?: () => void) {
    // Allow default browser behavior for modifier keys / middle click (open in new tab)
    if (event && (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0)) {
      return
    }

    if (onNavigate) {
      onNavigate()
    }

    const cleanTargetPath = targetPath.split('#')[0].split('?')[0].replace(/\/+$/, '') || '/'
    const currentPath = route.path.replace(/\/+$/, '') || '/'

    if (currentPath === cleanTargetPath) {
      if (event && !targetPath.includes('#')) {
        event.preventDefault()
      }
      scrollToTop('smooth')
      if (route.hash && !targetPath.includes('#')) {
        router.replace({ path: currentPath, hash: '' })
      }
    } else {
      // If navigating from another page, ensure scroll reset
      scrollToTop('auto')
    }
  }

  function handleHomeClick(event?: MouseEvent, onNavigate?: () => void) {
    handleNavClick('/', event, onNavigate)
  }

  return {
    handleHomeClick,
    handleNavClick,
    scrollToTop,
  }
}
