
export default defineNuxtPlugin((nuxtApp) => {
  let observer: IntersectionObserver | null = null

  if (import.meta.client) {
    const reducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches

    if (!reducedMotion && 'IntersectionObserver' in window) {
      observer = new IntersectionObserver((entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible')
            obs.unobserve(entry.target)
          }
        })
      }, { threshold: 0.12 })
    }
  }

  nuxtApp.vueApp.directive('reveal', {
    getSSRProps() {
      return {}
    },

    mounted(el: HTMLElement) {
      if (!observer) return

      el.classList.add('luxe-reveal')
      observer.observe(el)
    },

    unmounted(el: HTMLElement) {
      observer?.unobserve(el)
    }
  })
})
