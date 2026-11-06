import Clarity from '@microsoft/clarity'

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()
  const projectId = String(config.public.clarityId || '').trim()

  if (!projectId) {
    if (import.meta.dev) {
      console.info('[Clarity] Project ID is not configured in .env; Clarity is disabled.')
    }
    return
  }

  try {
    Clarity.init(projectId)
    if (import.meta.dev) {
      console.info(`[Clarity] Initialized successfully with project ID: ${projectId}`)
    }
  } catch (err) {
    console.error('[Clarity] Failed to initialize:', err)
  }

  return {
    provide: {
      clarity: Clarity
    }
  }
})

