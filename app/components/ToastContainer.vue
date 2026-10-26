<script setup lang="ts">
import { CheckCircle, AlertCircle, X, Copy, Check } from 'lucide-vue-next'
import { useToast } from '~/composables/useToast'

const { toasts, remove } = useToast()
const copiedId = ref<string | null>(null)

async function copyRef(refCode: string, toastId: string) {
  try {
    await navigator.clipboard.writeText(refCode)
    copiedId.value = toastId
    setTimeout(() => {
      if (copiedId.value === toastId) copiedId.value = null
    }, 2000)
  } catch (err) {
    console.error('Failed to copy to clipboard', err)
  }
}
</script>

<template>
  <Teleport to="body">
    <div class="toast-portal" aria-live="polite" aria-atomic="true">
      <TransitionGroup name="luxury-toast" tag="div" class="toast-stack">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          class="luxury-toast-card"
          :class="`toast-${toast.type}`"
          role="alert"
        >
          <!-- Icon indicator -->
          <div class="toast-icon-wrap">
            <CheckCircle v-if="toast.type === 'success'" class="toast-svg success-svg" :size="24" />
            <AlertCircle v-else class="toast-svg error-svg" :size="24" />
          </div>

          <!-- Body content -->
          <div class="toast-body">
            <div class="toast-header">
              <span class="toast-kicker">{{ toast.type === 'success' ? 'SUCCESS' : 'ATTENTION' }}</span>
              <h4 class="toast-title">{{ toast.title }}</h4>
            </div>

            <p class="toast-message">{{ toast.message }}</p>

            <!-- Airport enquiry reference pill if available -->
            <div v-if="toast.enquiryRef" class="toast-ref-box">
              <span class="ref-label">Enquiry Reference:</span>
              <span class="ref-value">{{ toast.enquiryRef }}</span>
              <button
                type="button"
                class="copy-ref-btn"
                title="Copy reference number"
                @click="copyRef(toast.enquiryRef, toast.id)"
              >
                <Check v-if="copiedId === toast.id" :size="14" class="copied-check" />
                <Copy v-else :size="14" />
                <span>{{ copiedId === toast.id ? 'Copied' : 'Copy' }}</span>
              </button>
            </div>
          </div>

          <!-- Dismiss button -->
          <button
            type="button"
            class="toast-close-btn"
            aria-label="Dismiss notification"
            @click="remove(toast.id)"
          >
            <X :size="16" />
          </button>

          <!-- Animated lifetime progress line -->
          <div
            v-if="toast.duration > 0"
            class="toast-progress-bar"
            :style="{ animationDuration: `${toast.duration}ms` }"
          />
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style scoped>
.toast-portal {
  position: fixed;
  top: 28px;
  right: 28px;
  z-index: 999999;
  pointer-events: none;
  max-width: 460px;
  width: calc(100vw - 40px);
}

.toast-stack {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.luxury-toast-card {
  pointer-events: auto;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 20px 22px 22px;
  border-radius: 12px;
  box-shadow: 0 20px 45px -10px rgba(12, 16, 20, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  color: #f7f3ed;
  font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif;
  transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}

/* Success theme: deep obsidian navy with emerald & gold accents */
.toast-success {
  background: linear-gradient(135deg, rgba(16, 26, 32, 0.96) 0%, rgba(22, 36, 44, 0.94) 100%);
  border: 1px solid rgba(46, 213, 115, 0.38);
  box-shadow: 0 20px 45px -10px rgba(7, 30, 22, 0.55), 0 0 24px -6px rgba(46, 213, 115, 0.22);
}

/* Error theme: deep dark burgundy with crimson accents */
.toast-error {
  background: linear-gradient(135deg, rgba(38, 18, 22, 0.97) 0%, rgba(48, 20, 26, 0.95) 100%);
  border: 1px solid rgba(235, 87, 87, 0.45);
  box-shadow: 0 20px 45px -10px rgba(40, 10, 14, 0.6), 0 0 24px -6px rgba(235, 87, 87, 0.22);
}

/* Info theme */
.toast-info {
  background: linear-gradient(135deg, rgba(22, 26, 32, 0.96) 0%, rgba(30, 36, 46, 0.94) 100%);
  border: 1px solid rgba(210, 180, 138, 0.35);
}

.toast-icon-wrap {
  flex-shrink: 0;
  margin-top: 2px;
}

.toast-svg {
  filter: drop-shadow(0 2px 6px rgba(0, 0, 0, 0.3));
}

.success-svg {
  color: #2ed573;
}

.error-svg {
  color: #ff5252;
}

.toast-body {
  flex: 1;
  min-width: 0;
}

.toast-header {
  margin-bottom: 6px;
}

.toast-kicker {
  display: block;
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  margin-bottom: 3px;
}

.toast-success .toast-kicker {
  color: #7bed9f;
}

.toast-error .toast-kicker {
  color: #ff7675;
}

.toast-title {
  margin: 0;
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 19px;
  font-weight: 600;
  letter-spacing: -0.02em;
  color: #ffffff;
  line-height: 1.25;
}

.toast-message {
  margin: 0;
  font-size: 13px;
  line-height: 1.55;
  color: #e2ded7;
  word-break: break-word;
}

/* Airport Enquiry Reference Box */
.toast-ref-box {
  margin-top: 12px;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  background: rgba(0, 0, 0, 0.35);
  border: 1px solid rgba(210, 180, 138, 0.45);
  border-radius: 6px;
  font-size: 12px;
}

.ref-label {
  color: #d2b48a;
  font-size: 11px;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.ref-value {
  color: #ffffff;
  font-weight: 800;
  letter-spacing: 0.08em;
  font-family: monospace;
  font-size: 13px;
  background: rgba(210, 180, 138, 0.18);
  padding: 2px 7px;
  border-radius: 4px;
}

.copy-ref-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #e5ded4;
  font-size: 11px;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.copy-ref-btn:hover {
  background: rgba(255, 255, 255, 0.15);
  color: #ffffff;
  border-color: rgba(255, 255, 255, 0.4);
}

.copied-check {
  color: #2ed573;
}

.toast-close-btn {
  flex-shrink: 0;
  background: transparent;
  border: none;
  color: #a8a096;
  padding: 4px;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  margin-top: -2px;
}

.toast-close-btn:hover {
  color: #ffffff;
  background: rgba(255, 255, 255, 0.1);
}

/* Progress bar animation */
.toast-progress-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 3px;
  width: 100%;
  animation: toastDrain linear forwards;
  transform-origin: left;
}

.toast-success .toast-progress-bar {
  background: linear-gradient(90deg, #2ed573, #d2b48a);
}

.toast-error .toast-progress-bar {
  background: linear-gradient(90deg, #ff5252, #e74c3c);
}

@keyframes toastDrain {
  from {
    transform: scaleX(1);
  }
  to {
    transform: scaleX(0);
  }
}

/* Animations */
.luxury-toast-enter-active {
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.luxury-toast-leave-active {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.luxury-toast-enter-from {
  opacity: 0;
  transform: translateY(-20px) scale(0.94);
}

.luxury-toast-leave-to {
  opacity: 0;
  transform: translateX(35px) scale(0.96);
}

@media (max-width: 600px) {
  .toast-portal {
    top: 16px;
    right: 16px;
    left: 16px;
    width: auto;
    max-width: 100%;
  }

  .luxury-toast-card {
    padding: 16px;
    gap: 12px;
  }

  .toast-title {
    font-size: 17px;
  }

  .toast-message {
    font-size: 12px;
  }
}
</style>
