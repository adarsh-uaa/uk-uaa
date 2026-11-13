<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { Star, X, Check, Loader2, Sparkles } from 'lucide-vue-next'

const props = defineProps<{
  modelValue: boolean
  bookingReference: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'submitted', reviewId: string): void
  (e: 'close'): void
}>()

const rating = ref(0)
const hoverRating = ref(0)
const comment = ref('')
const isSubmitting = ref(false)
const errorMessage = ref('')
const isSubmitted = ref(false)

// Once clicked, lock activeRating to rating.value. Hovering only applies before a star has been clicked!
const activeRating = computed(() => {
  if (rating.value > 0) return rating.value
  return hoverRating.value
})

const ratingLabels: Record<number, string> = {
  1: 'Poor',
  2: 'Fair',
  3: 'Good',
  4: 'Very Good',
  5: 'Exceptional'
}

const activeLabel = computed(() => {
  if (activeRating.value > 0) {
    return ratingLabels[activeRating.value] || ''
  }
  return 'Select your rating'
})

function setRating(val: number) {
  rating.value = val
  hoverRating.value = 0
  errorMessage.value = ''
}

function setHover(val: number) {
  // If user already clicked a star rating, ignore hover changes
  if (rating.value > 0) return
  hoverRating.value = val
}

function clearHover() {
  hoverRating.value = 0
}

function closeModal() {
  emit('update:modelValue', false)
  emit('close')
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape' && props.modelValue) {
    closeModal()
  }
}

watch(
  () => props.modelValue,
  (open) => {
    if (open) {
      document.addEventListener('keydown', handleKeydown)
    } else {
      document.removeEventListener('keydown', handleKeydown)
    }
  }
)

onMounted(() => {
  if (props.modelValue) {
    document.addEventListener('keydown', handleKeydown)
  }
})

onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleKeydown)
})

async function submitReview() {
  if (rating.value < 1) {
    errorMessage.value = 'Please select a star rating between 1 and 5.'
    return
  }

  isSubmitting.value = true
  errorMessage.value = ''

  try {
    const res = await $fetch<{ success: boolean; message: string; reviewId: string }>('/api/review', {
      method: 'POST',
      body: {
        bookingReference: props.bookingReference,
        rating: rating.value,
        comment: comment.value.trim()
      }
    })

    isSubmitted.value = true
    emit('submitted', res.reviewId)

    // Store in localStorage & sessionStorage so user is not prompted again
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(`review_submitted_${props.bookingReference}`, 'true')
        sessionStorage.setItem(`review_prompted_${props.bookingReference}`, 'true')
      }
    } catch {
      // Ignore storage access errors
    }

    setTimeout(() => {
      closeModal()
    }, 2400)
  } catch (err: any) {
    errorMessage.value =
      err?.data?.statusMessage ||
      err?.data?.message ||
      err?.message ||
      'Unable to submit review. Please try again.'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <Teleport to="body">
    <Transition name="review-fade">
      <div
        v-if="modelValue"
        class="review-backdrop"
        role="dialog"
        aria-modal="true"
        aria-labelledby="review-modal-title"
        @click.self="closeModal"
      >
        <div class="review-modal-card">
          <!-- Close Button -->
          <button
            type="button"
            class="modal-close-btn"
            aria-label="Close review popup"
            @click="closeModal"
          >
            <X :size="18" />
          </button>

          <!-- Submitted Success State -->
          <div v-if="isSubmitted" class="review-success-state">
            <div class="success-icon-wrap">
              <Check :size="30" class="success-check-icon" />
            </div>
            <span class="success-kicker">FEEDBACK RECORDED</span>
            <h3 class="success-title">Thank You for Your Review</h3>
            <p class="success-desc">
              Your feedback helps us continuously perfect our VIP airport meet &amp; greet experience.
            </p>
            <div class="success-stars" aria-hidden="true">
              <Star
                v-for="star in 5"
                :key="star"
                :size="20"
                class="star-static"
                :class="{ 'star-filled': star <= rating }"
              />
            </div>
          </div>

          <!-- Main Form State -->
          <div v-else class="review-form-content">
            <div class="modal-header">
              <div class="kicker-wrap">
                <Sparkles :size="13" class="kicker-sparkle" />
                <span class="modal-kicker">YOUR OPINION MATTERS</span>
              </div>
              <h3 id="review-modal-title" class="modal-title">Rate Your Booking Experience</h3>
              <p class="modal-subtitle">
                How effortless was your reservation process today?
              </p>
              <div v-if="bookingReference && bookingReference !== 'ENQ-PENDING'" class="ref-pill">
                <span>Ref:</span>
                <strong>#{{ bookingReference }}</strong>
              </div>
            </div>

            <!-- Star Rating Interactive Selector -->
            <div class="stars-container">
              <div
                class="stars-row"
                role="radiogroup"
                aria-label="Star rating from 1 to 5"
                @mouseleave="clearHover"
              >
                <button
                  v-for="star in 5"
                  :key="star"
                  type="button"
                  class="star-button"
                  :class="{
                    'is-active': star <= activeRating,
                    'is-selected': star <= rating,
                    'has-locked': rating > 0
                  }"
                  :aria-label="`Rate ${star} star${star > 1 ? 's' : ''}`"
                  :aria-checked="rating === star"
                  role="radio"
                  @mouseenter="setHover(star)"
                  @focus="setHover(star)"
                  @click="setRating(star)"
                >
                  <Star
                    :size="32"
                    class="star-icon"
                    :fill="star <= activeRating ? 'currentColor' : 'none'"
                  />
                </button>
              </div>

              <!-- Rating feedback descriptor -->
              <div class="rating-label-display" :class="{ 'has-rating': activeRating > 0 }">
                <span>{{ activeLabel }}</span>
              </div>
            </div>

            <!-- Optional Comment Box -->
            <div class="comment-field-wrap">
              <div class="comment-header">
                <label for="review-comment" class="comment-label">
                  Comments or Suggestions <span class="optional-tag">(Optional)</span>
                </label>
                <span class="char-counter">{{ comment.length }}/500</span>
              </div>
              <textarea
                id="review-comment"
                v-model="comment"
                maxlength="500"
                rows="3"
                class="comment-textarea"
                placeholder="Share any thoughts on what went well or how we can improve..."
              ></textarea>
            </div>

            <!-- Error message if validation failed -->
            <div v-if="errorMessage" class="error-banner" role="alert">
              {{ errorMessage }}
            </div>

            <!-- Action Buttons -->
            <div class="modal-actions">
              <button
                type="button"
                class="btn-skip"
                @click="closeModal"
              >
                Maybe Later
              </button>
              <button
                type="button"
                class="btn-submit"
                :disabled="isSubmitting || rating === 0"
                @click="submitReview"
              >
                <Loader2 v-if="isSubmitting" :size="16" class="spin-loader" />
                <span>{{ isSubmitting ? 'Submitting...' : 'Submit Review' }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
/* ------------------------------------------ */
/* Modal Backdrop & Light Luxury Card Theme   */
/* ------------------------------------------ */
.review-backdrop {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 18px;
  background-color: rgba(15, 23, 34, 0.65);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  overflow-y: auto;
}

.review-modal-card {
  position: relative;
  width: 100%;
  max-width: 480px;
  background: linear-gradient(155deg, #ffffff 0%, #faf8f5 100%);
  border: 1px solid rgba(201, 168, 106, 0.45);
  border-radius: 14px;
  padding: 34px 30px 28px;
  box-shadow:
    0 24px 60px -10px rgba(15, 25, 38, 0.28),
    0 10px 25px -5px rgba(201, 168, 106, 0.18),
    0 0 0 1px rgba(255, 255, 255, 0.8) inset;
  color: #182a40;
  box-sizing: border-box;
}

.modal-close-btn {
  position: absolute;
  top: 14px;
  right: 14px;
  background: transparent;
  border: none;
  color: #8c9ba9;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.modal-close-btn:hover {
  color: #182a40;
  background: rgba(24, 42, 64, 0.08);
}

/* ------------------------------------------ */
/* Header Elements                            */
/* ------------------------------------------ */
.modal-header {
  text-align: center;
  margin-bottom: 22px;
}

.kicker-wrap {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 8px;
}

.kicker-sparkle {
  color: #a37c35;
}

.modal-kicker {
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: #a37c35;
}

.modal-title {
  margin: 0 0 8px;
  font-family: 'Playfair Display', serif;
  font-size: 23px;
  font-weight: 600;
  color: #182a40;
  letter-spacing: -0.01em;
  line-height: 1.25;
}

.modal-subtitle {
  margin: 0;
  font-size: 13.5px;
  color: #5c6875;
  line-height: 1.45;
}

.ref-pill {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  margin-top: 10px;
  padding: 4px 12px;
  background: #fdfaf4;
  border: 1px solid rgba(201, 168, 106, 0.4);
  border-radius: 20px;
  font-size: 12px;
  color: #8c6a2e;
}

.ref-pill strong {
  color: #182a40;
  font-family: 'Montserrat', sans-serif;
  font-variant-numeric: tabular-nums;
}

/* ------------------------------------------ */
/* Star Rating Row                            */
/* ------------------------------------------ */
.stars-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 22px;
  padding: 16px 12px;
  background: #f8f5ee;
  border: 1px solid rgba(201, 168, 106, 0.28);
  border-radius: 10px;
}

.stars-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.star-button {
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 6px;
  color: #cbd5e1;
  border-radius: 6px;
  transition: transform 0.15s ease, color 0.18s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Hover enlargement only before a rating has been locked */
.star-button:hover:not(.has-locked),
.star-button:focus-visible:not(.has-locked) {
  transform: scale(1.18);
  outline: none;
}

.star-button.has-locked {
  cursor: pointer;
}

.star-button.is-active {
  color: #d4a342;
  filter: drop-shadow(0 2px 8px rgba(212, 163, 66, 0.45));
}

.star-icon {
  stroke-width: 1.75;
}

.rating-label-display {
  margin-top: 10px;
  font-size: 12.5px;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: #8c7f72;
  text-transform: uppercase;
  min-height: 18px;
  transition: color 0.2s ease;
}

.rating-label-display.has-rating {
  color: #a37c35;
}

/* ------------------------------------------ */
/* Comment Box                                */
/* ------------------------------------------ */
.comment-field-wrap {
  margin-bottom: 20px;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.comment-label {
  font-size: 12.5px;
  font-weight: 700;
  color: #182a40;
}

.optional-tag {
  color: #7d8a98;
  font-weight: 400;
  font-size: 11.5px;
}

.char-counter {
  font-size: 11px;
  color: #8c9aa8;
  font-family: 'Montserrat', sans-serif;
  font-variant-numeric: tabular-nums;
}

.comment-textarea {
  width: 100%;
  box-sizing: border-box;
  background: #ffffff;
  border: 1px solid #dcd4c7;
  border-radius: 8px;
  padding: 11px 14px;
  font-family: inherit;
  font-size: 13.5px;
  color: #182a40;
  resize: vertical;
  min-height: 76px;
  outline: none;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.comment-textarea::placeholder {
  color: #9aa7b5;
}

.comment-textarea:focus {
  border-color: #c9a86a;
  box-shadow: 0 0 0 3px rgba(201, 168, 106, 0.22);
}

/* ------------------------------------------ */
/* Error Banner                               */
/* ------------------------------------------ */
.error-banner {
  background: rgba(220, 53, 69, 0.1);
  border: 1px solid rgba(220, 53, 69, 0.35);
  color: #c93b2b;
  font-size: 12.5px;
  padding: 8px 12px;
  border-radius: 6px;
  margin-bottom: 16px;
  text-align: center;
  font-weight: 600;
}

/* ------------------------------------------ */
/* Action Buttons                             */
/* ------------------------------------------ */
.modal-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
}

.btn-skip {
  background: transparent;
  border: none;
  color: #6d7d8e;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  padding: 10px 14px;
  border-radius: 6px;
  transition: color 0.2s ease, background 0.2s ease;
}

.btn-skip:hover {
  color: #182a40;
  background: rgba(24, 42, 64, 0.05);
}

.btn-submit {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: linear-gradient(135deg, #c9a86a 0%, #b89352 100%);
  color: #182a40;
  border: 1px solid #c9a86a;
  font-size: 13.5px;
  font-weight: 700;
  letter-spacing: 0.04em;
  padding: 11px 24px;
  border-radius: 6px;
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(201, 168, 106, 0.3);
  transition: transform 0.18s ease, filter 0.18s ease, opacity 0.18s ease, box-shadow 0.18s ease;
}

.btn-submit:hover:not(:disabled) {
  filter: brightness(1.06);
  transform: translateY(-1px);
  box-shadow: 0 6px 18px rgba(201, 168, 106, 0.42);
}

.btn-submit:disabled {
  opacity: 0.45;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.spin-loader {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* ------------------------------------------ */
/* Success State View                         */
/* ------------------------------------------ */
.review-success-state {
  text-align: center;
  padding: 24px 10px 16px;
}

.success-icon-wrap {
  width: 58px;
  height: 58px;
  margin: 0 auto 16px;
  background: rgba(16, 185, 129, 0.12);
  border: 1.5px solid rgba(16, 185, 129, 0.35);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #10b981;
  animation: popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.success-kicker {
  display: block;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.18em;
  color: #059669;
  margin-bottom: 6px;
}

.success-title {
  margin: 0 0 10px;
  font-family: 'Playfair Display', serif;
  font-size: 22px;
  font-weight: 600;
  color: #182a40;
}

.success-desc {
  margin: 0 auto 18px;
  font-size: 13.5px;
  color: #5c6875;
  line-height: 1.5;
  max-width: 360px;
}

.success-stars {
  display: flex;
  justify-content: center;
  gap: 6px;
  color: #cbd5e1;
}

.star-static.star-filled {
  color: #d4a342;
  fill: currentColor;
}

@keyframes popIn {
  from {
    transform: scale(0.6);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

/* ------------------------------------------ */
/* Modal Transitions                          */
/* ------------------------------------------ */
.review-fade-enter-active,
.review-fade-leave-active {
  transition: opacity 0.28s ease;
}

.review-fade-enter-from,
.review-fade-leave-to {
  opacity: 0;
}

.review-fade-enter-active .review-modal-card {
  transition: transform 0.28s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.28s ease;
}

.review-fade-leave-active .review-modal-card {
  transition: transform 0.2s ease, opacity 0.2s ease;
}

.review-fade-enter-from .review-modal-card {
  opacity: 0;
  transform: translateY(20px) scale(0.96);
}

.review-fade-leave-to .review-modal-card {
  opacity: 0;
  transform: translateY(12px) scale(0.97);
}

@media (max-width: 500px) {
  .review-modal-card {
    padding: 28px 20px 22px;
  }

  .modal-title {
    font-size: 20px;
  }

  .stars-row {
    gap: 6px;
  }

  .star-button {
    padding: 4px;
  }

  .btn-submit {
    padding: 10px 18px;
    font-size: 13px;
  }
}
</style>
