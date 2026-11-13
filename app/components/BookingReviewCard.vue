<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Star, Check, Loader2, Sparkles } from 'lucide-vue-next'

const props = defineProps<{
  bookingReference: string
}>()

const emit = defineEmits<{
  (e: 'submitted', reviewId: string): void
}>()

const rating = ref(0)
const hoverRating = ref(0)
const comment = ref('')
const isSubmitting = ref(false)
const errorMessage = ref('')
const isSubmitted = ref(false)
const previousRating = ref(0)

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

onMounted(() => {
  if (import.meta.client && props.bookingReference) {
    try {
      const stored = localStorage.getItem(`review_submitted_${props.bookingReference}`)
      if (stored) {
        isSubmitted.value = true
        const savedRating = Number(localStorage.getItem(`review_rating_${props.bookingReference}`))
        if (savedRating >= 1 && savedRating <= 5) {
          previousRating.value = savedRating
        }
      }
    } catch {
      // Ignore storage access errors
    }
  }
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
    previousRating.value = rating.value
    emit('submitted', res.reviewId)

    // Store in localStorage
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(`review_submitted_${props.bookingReference}`, 'true')
        localStorage.setItem(`review_rating_${props.bookingReference}`, String(rating.value))
      }
    } catch {
      // Ignore storage access errors
    }
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
  <section class="booking-review-card" aria-labelledby="review-card-title">
    <!-- Submitted State -->
    <div v-if="isSubmitted" class="review-submitted-state">
      <div class="submitted-badge-wrap">
        <div class="success-icon-bubble">
          <Check :size="24" class="success-icon" />
        </div>
        <div class="submitted-text-group">
          <span class="submitted-kicker">FEEDBACK RECORDED</span>
          <h3 class="submitted-title">Thank You for Your Feedback!</h3>
          <p class="submitted-desc">
            Your review has been saved. We truly appreciate you taking the time to share your experience with our VIP concierge desk.
          </p>
        </div>
      </div>

      <div v-if="previousRating > 0" class="submitted-stars-row" aria-label="Your submitted rating">
        <Star
          v-for="star in 5"
          :key="star"
          :size="20"
          class="submitted-star"
          :class="{ 'is-filled': star <= previousRating }"
          :fill="star <= previousRating ? 'currentColor' : 'none'"
        />
        <span class="submitted-rating-text">({{ previousRating }}/5 - {{ ratingLabels[previousRating] }})</span>
      </div>
    </div>

    <!-- Active Review Form -->
    <div v-else class="review-form-wrap">
      <div class="review-card-header">
        <div class="kicker-group">
          <span class="kicker-pill">
            <Sparkles :size="12" class="sparkle-icon" />
            YOUR OPINION MATTERS
          </span>
        </div>
        <h3 id="review-card-title" class="review-card-title">Rate Your Booking Experience</h3>
        <p class="review-card-subtitle">
          How effortless was your reservation process today? Your feedback helps us continuously perfect our VIP airport assistance.
        </p>
      </div>

      <!-- Star Rating Interactive Selector -->
      <div class="review-stars-box">
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
              :size="30"
              class="star-icon"
              :fill="star <= activeRating ? 'currentColor' : 'none'"
            />
          </button>
        </div>

        <div class="rating-label-display" :class="{ 'has-rating': activeRating > 0 }">
          <span>{{ activeLabel }}</span>
        </div>
      </div>

      <!-- Optional Comment Box -->
      <div class="comment-field-group">
        <div class="comment-label-row">
          <label for="page-review-comment" class="comment-label">
            Comments or Suggestions <span class="optional-tag">(Optional)</span>
          </label>
          <span class="char-count">{{ comment.length }}/500</span>
        </div>
        <textarea
          id="page-review-comment"
          v-model="comment"
          maxlength="500"
          rows="3"
          class="comment-textarea"
          placeholder="Share any thoughts on what went well or how we can improve..."
        ></textarea>
      </div>

      <!-- Error banner if validation failed -->
      <div v-if="errorMessage" class="review-error-banner" role="alert">
        {{ errorMessage }}
      </div>

      <!-- Submit Action Button -->
      <div class="review-submit-row">
        <button
          type="button"
          class="review-submit-button"
          :disabled="isSubmitting || rating === 0"
          @click="submitReview"
        >
          <Loader2 v-if="isSubmitting" :size="16" class="spin-icon" />
          <span>{{ isSubmitting ? 'Submitting...' : 'Submit Feedback' }}</span>
        </button>
      </div>
    </div>
  </section>
</template>

<style scoped>
.booking-review-card {
  background: #ffffff;
  border: 1px solid rgba(201, 168, 106, 0.35);
  border-radius: 10px;
  padding: 36px 32px;
  margin-top: 36px;
  margin-bottom: 36px;
  box-shadow: 0 12px 36px rgba(24, 42, 64, 0.06);
  position: relative;
  box-sizing: border-box;
}

/* ------------------------------------------ */
/* Header Elements                            */
/* ------------------------------------------ */
.review-card-header {
  margin-bottom: 22px;
}

.kicker-group {
  margin-bottom: 10px;
}

.kicker-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 9.5px;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #182a40;
  background: #c9a86a;
  padding: 4px 10px;
  border-radius: 3px;
}

.sparkle-icon {
  color: #182a40;
}

.review-card-title {
  font-family: 'Playfair Display', serif;
  font-size: clamp(22px, 2.8vw, 28px);
  color: #182a40;
  margin: 0 0 8px;
  font-weight: 500;
  letter-spacing: -0.01em;
}

.review-card-subtitle {
  font-size: 14.5px;
  color: #5c554c;
  line-height: 1.55;
  margin: 0;
  max-width: 680px;
}

/* ------------------------------------------ */
/* Star Rating Box                            */
/* ------------------------------------------ */
.review-stars-box {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin-bottom: 22px;
  padding: 18px 20px;
  background: #faf7f2;
  border: 1px solid rgba(201, 168, 106, 0.25);
  border-radius: 8px;
}

.stars-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.star-button {
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 5px;
  color: #cbd5e1;
  border-radius: 6px;
  transition: transform 0.15s ease, color 0.18s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

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
  filter: drop-shadow(0 2px 6px rgba(212, 163, 66, 0.45));
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
.comment-field-group {
  margin-bottom: 20px;
}

.comment-label-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.comment-label {
  font-size: 13px;
  font-weight: 600;
  color: #182a40;
}

.optional-tag {
  color: #7d8a98;
  font-weight: 400;
  font-size: 12px;
}

.char-count {
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
  border-radius: 6px;
  padding: 12px 14px;
  font-family: inherit;
  font-size: 14px;
  color: #182a40;
  resize: vertical;
  min-height: 80px;
  outline: none;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.comment-textarea::placeholder {
  color: #9aa7b5;
}

.comment-textarea:focus {
  border-color: #c9a86a;
  box-shadow: 0 0 0 3px rgba(201, 168, 106, 0.2);
}

/* ------------------------------------------ */
/* Error Banner                               */
/* ------------------------------------------ */
.review-error-banner {
  background: rgba(220, 53, 69, 0.08);
  border: 1px solid rgba(220, 53, 69, 0.3);
  color: #c93b2b;
  font-size: 12.5px;
  padding: 8px 12px;
  border-radius: 6px;
  margin-bottom: 16px;
  font-weight: 600;
}

/* ------------------------------------------ */
/* Submit Row                                 */
/* ------------------------------------------ */
.review-submit-row {
  display: flex;
  justify-content: flex-end;
}

.review-submit-button {
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
  padding: 12px 26px;
  border-radius: 5px;
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(201, 168, 106, 0.25);
  transition: transform 0.18s ease, filter 0.18s ease, opacity 0.18s ease, box-shadow 0.18s ease;
}

.review-submit-button:hover:not(:disabled) {
  filter: brightness(1.06);
  transform: translateY(-1px);
  box-shadow: 0 6px 18px rgba(201, 168, 106, 0.35);
}

.review-submit-button:disabled {
  opacity: 0.45;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.spin-icon {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* ------------------------------------------ */
/* Submitted Success State                    */
/* ------------------------------------------ */
.review-submitted-state {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.submitted-badge-wrap {
  display: flex;
  align-items: flex-start;
  gap: 16px;
}

.success-icon-bubble {
  width: 46px;
  height: 46px;
  background: rgba(16, 185, 129, 0.12);
  border: 1.5px solid rgba(16, 185, 129, 0.35);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #10b981;
  flex-shrink: 0;
}

.submitted-text-group {
  flex: 1;
}

.submitted-kicker {
  display: block;
  font-size: 9.5px;
  font-weight: 800;
  letter-spacing: 0.14em;
  color: #059669;
  margin-bottom: 4px;
}

.submitted-title {
  font-family: 'Playfair Display', serif;
  font-size: 22px;
  font-weight: 500;
  color: #182a40;
  margin: 0 0 6px;
}

.submitted-desc {
  font-size: 14.5px;
  color: #5c554c;
  line-height: 1.55;
  margin: 0;
}

.submitted-stars-row {
  display: flex;
  align-items: center;
  gap: 6px;
  padding-left: 62px;
  color: #cbd5e1;
}

.submitted-star.is-filled {
  color: #d4a342;
}

.submitted-rating-text {
  font-size: 13px;
  font-weight: 600;
  color: #8c7f72;
  margin-left: 6px;
}

@media (max-width: 767px) {
  .booking-review-card {
    padding: 24px 20px;
    margin-top: 24px;
    margin-bottom: 24px;
  }

  .review-card-title {
    font-size: 20px;
  }

  .stars-row {
    gap: 6px;
  }

  .star-button {
    padding: 4px;
  }

  .review-submit-button {
    width: 100%;
  }

  .submitted-badge-wrap {
    flex-direction: column;
    gap: 12px;
  }

  .submitted-stars-row {
    padding-left: 0;
  }
}
</style>

