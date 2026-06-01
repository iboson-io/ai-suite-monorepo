<template>
  <Teleport to="body">
    <Transition name="date-confirm-fade">
      <div
        v-if="open"
        class="fixed inset-0 z-[225] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
        role="presentation"
        @click.self="emit('close')"
      >
        <div
          class="w-full max-w-2xl rounded-xl bg-white p-6 shadow-[0_25px_50px_-12px_rgba(22,23,34,0.25)] sm:p-8"
          role="dialog"
          aria-modal="true"
          :aria-labelledby="titleId"
          @click.stop
        >
          <h2
            :id="titleId"
            class="text-left text-xl font-bold leading-snug text-gray-900"
          >
            {{ title }}
          </h2>

          <div v-if="$slots.default" class="mt-4 text-left text-base leading-relaxed text-gray-600">
            <slot />
          </div>
          <p
            v-else-if="variant === 'sendNow'"
            class="mt-4 text-left text-base leading-relaxed text-gray-600"
          >
            {{ sendNowBodyBefore
            }}<span class="font-semibold text-gray-900">{{ formattedAudience }}</span
            >{{ sendNowBodyAfter }}
          </p>
          <p v-else class="mt-4 text-left text-base leading-relaxed text-gray-600">
            {{ introText
            }}<span class="font-semibold text-gray-900">{{ dateLabel }}</span> at
            <span class="font-semibold text-gray-900">{{ timeLabel }}</span
            >. {{ closingText }}
          </p>

          <div class="mt-8 flex w-full gap-3">
            <button
              type="button"
              class="flex h-12 flex-1 items-center justify-center rounded-lg bg-gray-100 px-4 text-base font-semibold text-gray-900 transition-colors hover:bg-gray-200"
              @click="emit('close')"
            >
              {{ cancelText }}
            </button>
            <button
              type="button"
              class="flex h-12 flex-1 items-center justify-center gap-2 rounded-lg bg-[#242938] px-4 text-base font-semibold text-white transition-colors hover:bg-[#1a1d2a]"
              @click="emit('confirm')"
            >
              <template v-if="variant === 'sendNow'">
                <svg
                  class="h-5 w-5 shrink-0"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <path
                    d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </template>
              <span v-else class="relative inline-flex h-5 w-5 shrink-0" aria-hidden="true">
                <svg
                  class="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M13.3333 2.5V5.83333M6.66666 2.5V5.83333M3.33333 9.16667H16.6667M3.33333 5.83333C3.33333 5.39131 3.50892 4.96738 3.82148 4.65482C4.13404 4.34226 4.55797 4.16667 4.99999 4.16667H15C15.5304 4.16667 16.0391 4.34226 16.4142 4.65482C16.7893 4.96738 17 5.39131 17 5.83333V15.8333C17 16.2754 16.7893 16.6993 16.4142 17.0118C16.0391 17.3244 15.5304 17.5 15 17.5H4.99999C4.55797 17.5 4.13404 17.3244 3.82148 17.0118C3.50892 16.6993 3.33333 16.2754 3.33333 15.8333V5.83333Z"
                    stroke="currentColor"
                    stroke-width="1.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
                <svg
                  class="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-white p-0.5 text-[#242938]"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle cx="8" cy="8" r="6.5" stroke="currentColor" stroke-width="1.2" />
                  <path
                    d="M8 4.75V8l2.25 1.5"
                    stroke="currentColor"
                    stroke-width="1.2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </span>
              {{ confirmText }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { computed, useId } from 'vue'

const props = defineProps({
  open: { type: Boolean, default: false },
  /** `schedule` = date/time copy; `sendNow` = immediate send copy + audience count. */
  variant: {
    type: String,
    default: 'schedule',
    validator: (v) => v === 'schedule' || v === 'sendNow',
  },
  title: { type: String, default: '' },
  dateLabel: { type: String, default: '' },
  timeLabel: { type: String, default: '' },
  introText: {
    type: String,
    default: 'Your campaign is ready to be scheduled for ',
  },
  closingText: {
    type: String,
    default:
      'Once scheduled, messages will be sent automatically at the selected time.',
  },
  cancelText: { type: String, default: 'Close' },
  confirmText: { type: String, default: 'Schedule campaign' },
  audienceCount: { type: Number, default: 0 },
  sendNowBodyBefore: {
    type: String,
    default: 'Your SMS campaign is ready to be sent immediately to ',
  },
  sendNowBodyAfter: {
    type: String,
    default:
      ' recipients. Click Send now to deliver your message right away.',
  },
})

const emit = defineEmits(['close', 'confirm'])

const titleId = useId()

const formattedAudience = computed(() =>
  Number(props.audienceCount || 0).toLocaleString(undefined, {
    maximumFractionDigits: 0,
  })
)
</script>

<style scoped>
.date-confirm-fade-enter-active,
.date-confirm-fade-leave-active {
  transition: opacity 0.2s ease;
}

.date-confirm-fade-enter-active > div:last-child,
.date-confirm-fade-leave-active > div:last-child {
  transition: transform 0.2s ease, opacity 0.2s ease;
}

.date-confirm-fade-enter-from,
.date-confirm-fade-leave-to {
  opacity: 0;
}

.date-confirm-fade-enter-from > div:last-child,
.date-confirm-fade-leave-to > div:last-child {
  opacity: 0;
  transform: scale(0.96) translateY(6px);
}
</style>
