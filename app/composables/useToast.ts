export interface ToastOptions {
  type?: 'success' | 'error' | 'info'
  title?: string
  message: string
  enquiryRef?: string | null
  duration?: number
}

export interface ToastItem {
  id: string
  type: 'success' | 'error' | 'info'
  title: string
  message: string
  enquiryRef?: string | null
  duration: number
  createdAt: number
}

// Global reactive state shared across the application
const toasts = ref<ToastItem[]>([])

export function useToast() {
  function show(options: ToastOptions) {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`
    const duration = options.duration ?? (options.type === 'error' ? 8000 : 7000)

    const item: ToastItem = {
      id,
      type: options.type || 'info',
      title: options.title || (options.type === 'success' ? 'Success' : options.type === 'error' ? 'Error' : 'Notification'),
      message: options.message,
      enquiryRef: options.enquiryRef || null,
      duration,
      createdAt: Date.now()
    }

    toasts.value.push(item)

    if (duration > 0) {
      setTimeout(() => {
        remove(id)
      }, duration)
    }

    return id
  }

  function success(options: Omit<ToastOptions, 'type'> | string, enquiryRef?: string | null) {
    if (typeof options === 'string') {
      return show({
        type: 'success',
        title: 'Booking Confirmed',
        message: options,
        enquiryRef
      })
    }
    return show({ ...options, type: 'success' })
  }

  function error(options: Omit<ToastOptions, 'type'> | string) {
    if (typeof options === 'string') {
      return show({
        type: 'error',
        title: 'Booking Failed',
        message: options
      })
    }
    return show({ ...options, type: 'error' })
  }

  function info(options: Omit<ToastOptions, 'type'> | string) {
    if (typeof options === 'string') {
      return show({
        type: 'info',
        title: 'Information',
        message: options
      })
    }
    return show({ ...options, type: 'info' })
  }

  function remove(id: string) {
    const idx = toasts.value.findIndex(t => t.id === id)
    if (idx !== -1) {
      toasts.value.splice(idx, 1)
    }
  }

  function clear() {
    toasts.value = []
  }

  return {
    toasts: readonly(toasts),
    show,
    success,
    error,
    info,
    remove,
    clear
  }
}
