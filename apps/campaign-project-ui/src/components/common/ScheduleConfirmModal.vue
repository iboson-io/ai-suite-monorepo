<template>
  <Teleport to="body">
    <Transition name="schedule-confirm-fade">
      <div
        v-if="open"
        class="fixed inset-0 z-[220] flex items-center justify-center bg_overlay backdrop-blur-sm p-4"
        role="presentation"
        @click.self="emit('close')"
      >
        <div
          class="w-full max-w-lg rounded-xl bg_secondary_color p-6 shadow-2xl md:p-6xl"
          role="dialog"
          aria-modal="true"
          aria-labelledby="schedule-confirm-title"
          @click.stop
        >
          <h2
            id="schedule-confirm-title"
            class="heading_h5_semibold primary_text_color"
          >
            Schedule your campaign?
          </h2>
          <p
            class="mt-5xl paragraph_p3_regular leading-relaxed secondary_text_color md:mt-4"
          >
            Your campaign is ready to be scheduled for
            <span class="label_2_semibold primary_text_color">{{ scheduleDate }}</span>
            at
            <span class="label_2_semibold primary_text_color">{{ scheduleTime }}</span>.
            Click Schedule to confirm and we'll send it automatically at that time.
          </p>

          <div class="block h-[2px] w-full bg-info-50 mt-5xl"></div>

          <div class="mt-6xl flex flex-col gap-3 sm:mt-6xl sm:flex-row sm:gap-4">
            <button
              type="button"
              class="flex h-12 flex-1 items-center justify-center rounded-lg bg-gray-25 px-4xl py-xl label_1_semibold primary_text_color transition-colors hover:bg-gray-50"
              @click="emit('close')"
            >
              Close
            </button>
            <button
              type="button"
              class="flex h-12 flex-1 items-center justify-center gap-md rounded-lg bg-black-400 px-4xl py-xl label_1_semibold primary_2_text_color transition-colors hover:bg-black-700"
              @click="emit('confirm')"
            >
              <img
                :src="CalendarIconWhite"
                alt=""
                class="h-5 w-5 shrink-0"
                aria-hidden="true"
              />
              Schedule campaign
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
/** White calendar icon for dark button (matches schedule drawer). */
const CalendarIconWhite =
  'data:image/svg+xml,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M13.3333 2.5V5.83333M6.66666 2.5V5.83333M3.33333 9.16667H16.6667M9.16666 12.5H9.99999V15M3.33333 5.83333C3.33333 5.39131 3.50892 4.96738 3.82148 4.65482C4.13404 4.34226 4.55797 4.16667 4.99999 4.16667H15C15.442 4.16667 15.8659 4.34226 16.1785 4.65482C16.4911 4.96738 16.6667 5.39131 16.6667 5.83333V15.8333C16.6667 16.2754 16.4911 16.6993 16.1785 17.0118C15.8659 17.3244 15.442 17.5 15 17.5H4.99999C4.55797 17.5 4.13404 17.3244 3.82148 17.0118C3.50892 16.6993 3.33333 16.2754 3.33333 15.8333V5.83333Z" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`
  )

defineProps({
  open: { type: Boolean, default: false },
  scheduleDate: { type: String, default: '' },
  scheduleTime: { type: String, default: '' },
})

const emit = defineEmits(['close', 'confirm'])
</script>

<style scoped>
.schedule-confirm-fade-enter-active,
.schedule-confirm-fade-leave-active {
  transition: opacity 0.2s ease;
}

.schedule-confirm-fade-enter-active > div:last-child,
.schedule-confirm-fade-leave-active > div:last-child {
  transition: transform 0.2s ease, opacity 0.2s ease;
}

.schedule-confirm-fade-enter-from,
.schedule-confirm-fade-leave-to {
  opacity: 0;
}

.schedule-confirm-fade-enter-from > div:last-child,
.schedule-confirm-fade-leave-to > div:last-child {
  opacity: 0;
  transform: scale(0.96) translateY(6px);
}
</style>
