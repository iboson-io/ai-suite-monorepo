<template>
  <Teleport to="body">
    <Transition name="schedule-drawer-root">
      <div
        v-if="open"
        class="fixed inset-0 z-[200] flex justify-end"
        role="presentation"
      >
        <div
          class="absolute inset-0 bg_overlay backdrop-blur-sm"
          aria-hidden="true"
          @click="emit('close')"
        />
        <aside
          class="schedule-drawer-panel relative z-10 flex h-full w-full max-w-[min(100%,26rem)] flex-col overflow-hidden rounded-l-2xl border-l border-black-25 bg_secondary_color shadow-[0_25px_50px_-12px_rgba(22,23,34,0.25)]"
          role="dialog"
          aria-modal="true"
          aria-labelledby="schedule-drawer-title"
          @click.stop
        >
          <header
            class="flex shrink-0 items-start justify-between gap-3 bg_primary_color px-5xl py-4xl md:px-6xl md:py-6xl"
          >
            <h2
              id="schedule-drawer-title"
              class="heading_h6_semibold primary_text_color pr-md"
            >
              Schedule or send campaign
            </h2>
            <button
              type="button"
              class="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors bg-info-50"
              aria-label="Close"
              @click="emit('close')"
            >
              <img :src="BlackCloseIcon" alt="" class="h-3 w-3" />
            </button>
          </header>

          <div class="min-h-0 flex-1 overflow-y-auto bg_primary_color px-5xl py-5xl md:px-6xl md:py-5xl">
            <div class="rounded-xl bg_secondary_color p-3xl md:p-4xl">
              <div class="flex flex-col gap-5xl">
                <button
                  type="button"
                  class="w-full rounded-xl text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-200 focus-visible:ring-offset-2"
                  :class="
                    mode === 'schedule'
                      ? 'p-[3px] shadow-sm'
                      : 'border border-black-25 bg_secondary_color p-4'
                  "
                  :style="
                    mode === 'schedule'
                      ? { background: scheduleCardGradient }
                      : undefined
                  "
                  :aria-pressed="mode === 'schedule'"
                  @click="mode = 'schedule'"
                >
                  <div
                    class="gap-3xl"
                    :class="
                      mode === 'schedule'
                        ? 'rounded-[11px] p-4xl bg_primary_color'
                        : 'rounded-xl'
                    "
                  >
                    <span
                      class="flex h-8 w-6 shrink-0 items-center justify-center rounded-lg"
                      aria-hidden="true"
                    >
                      <svg width="21" height="21" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M9.795 19H3C2.46957 19 1.96086 18.7893 1.58579 18.4142C1.21071 18.0391 1 17.5304 1 17V5C1 4.46957 1.21071 3.96086 1.58579 3.58579C1.96086 3.21071 2.46957 3 3 3H15C15.5304 3 16.0391 3.21071 16.4142 3.58579C16.7893 3.96086 17 4.46957 17 5V9H1M13 1V5M5 1V5M16 14.496V16L17 17M12 16C12 17.0609 12.4214 18.0783 13.1716 18.8284C13.9217 19.5786 14.9391 20 16 20C17.0609 20 18.0783 19.5786 18.8284 18.8284C19.5786 18.0783 20 17.0609 20 16C20 14.9391 19.5786 13.9217 18.8284 13.1716C18.0783 12.4214 17.0609 12 16 12C14.9391 12 13.9217 12.4214 13.1716 13.1716C12.4214 13.9217 12 14.9391 12 16Z" stroke="#28293D" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>


                    </span>
                    <span class="min-w-0 mt-md">
                      <span class="label_1_semibold primary_text_color block"
                        >Schedule</span
                      >
                      <span
                        class="mt-md block body_3_regular leading-snug secondary_text_color"
                      >
                        Schedule your campaign for a future date and time.
                      </span>
                    </span>
                  </div>
                </button>

                <button
                  type="button"
                  class="w-full rounded-xl text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-200 focus-visible:ring-offset-2"
                  :class="
                    mode === 'sendNow'
                      ? 'p-[3px] shadow-sm bg_primary_color'
                      : 'border border-black-25 bg_secondary_color p-4'
                  "
                  :style="
                    mode === 'sendNow'
                      ? { background: scheduleCardGradient }
                      : undefined
                  "
                  :aria-pressed="mode === 'sendNow'"
                  @click="mode = 'sendNow'"
                >
                  <div
                    class="gap-3"
                    :class="
                      mode === 'sendNow'
                        ? 'rounded-[11px] bg_primary_color p-4xl'
                        : ''
                    "
                  >
                    <span
                      class="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg"
                      aria-hidden="true"
                    >
                      <svg width="21" height="21" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M8.32087 12L19.3209 1M8.32087 12L11.8209 19C11.8647 19.0957 11.9352 19.1769 12.0238 19.2338C12.1125 19.2906 12.2156 19.3209 12.3209 19.3209C12.4262 19.3209 12.5293 19.2906 12.6179 19.2338C12.7066 19.1769 12.777 19.0957 12.8209 19L19.3209 1M8.32087 12L1.32087 8.5C1.22513 8.45613 1.144 8.38569 1.08712 8.29705C1.03024 8.20842 1 8.10532 1 8C1 7.89468 1.03024 7.79158 1.08712 7.70295C1.144 7.61431 1.22513 7.54387 1.32087 7.5L19.3209 1" stroke="#28293D" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>

                    </span>
                    <span class="min-w-0 ">
                      <span class="label_1_semibold primary_text_color block mt-md"
                        >Send Now</span
                      >
                      <span
                        class="mt-md block body_3_regular leading-snug secondary_text_color"
                      >
                        Start sending your campaign immediately
                      </span>
                    </span>
                  </div>
                </button>
              </div>
            </div>

            <div v-if="mode === 'schedule'" class="mt-5 space-y-3">
              <div class="relative">
                <label class="sr-only label_2_medium primary_text_color" for="schedule-send-type">Send time</label>
                <select
                  id="schedule-send-type"
                  v-model="sendTimeType"
                  class="input_box h-12 w-full appearance-none rounded-lg border border-black-25 bg_secondary_color px-3 pr-10 label_2_medium primary_text_color"
                >
                  <option
                    v-for="opt in sendTimeOptions"
                    :key="opt.value"
                    :value="opt.value"
                  >
                    {{ opt.label }}
                  </option>
                </select>
                <div
                  class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 px-xl py-lg"
                  aria-hidden="true"
                >
                  <img :src="DownArrow" alt="" class="h-5 w-5" />
                </div>
              </div>

              <button
                type="button"
                class="flex h-14 w-full cursor-pointer items-center justify-between gap-3 rounded-lg border border-black-25 bg_secondary_color px-3 text-left transition-colors hover:bg-info-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-200 focus-visible:ring-offset-2"
                aria-label="Choose schedule date and time"
                @click="showCalendarModal = true"
              >
                <span class="label_2_medium secondary_text_color py-3xl"
                  >Scheduled for</span
                >
                <span class="body_3_medium primary_text_color text-right">{{
                  scheduledSummary
                }}</span>
              </button>
            </div>
              <button
              type="button"
              class="modal_primary_button flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-black-400 px-4 py-3 label_1_semibold primary_2_text_color transition-colors hover:bg-black-700 mt-5xl"
              @click="onPrimaryAction"
            >
              <img
                :src="mode === 'schedule' ? CalendarIconWhite : SendEmailWhiteIcon"
                alt=""
                class="h-5 w-5 shrink-0"
                aria-hidden="true"
              />
              {{
                mode === 'schedule' ? 'Schedule campaign' : 'Send campaign'
              }}
            </button>
          </div>
        </aside>
      </div>
    </Transition>
  </Teleport>

  <Teleport to="body">
    <SchedulerCalendarModal
      :open="showCalendarModal"
      :initial-date="scheduledDate"
      :initial-time="scheduledTime"
      @close="showCalendarModal = false"
      @schedule="onCalendarScheduled"
    />
  </Teleport>

  <Teleport to="body">
    <ScheduleConfirmModal
      :open="showScheduleConfirmModal"
      :schedule-date="confirmScheduleDate"
      :schedule-time="confirmScheduleTime"
      @close="showScheduleConfirmModal = false"
      @confirm="onConfirmSchedule"
    />
  </Teleport>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import BlackCloseIcon from '../../assets/images/BlackCloseIcon.svg'
import CalendarIcon from '../../assets/images/CalendarIcon.svg'
import SendEmailIcon from '../../assets/images/SendEmail.svg'
import DownArrow from '../../assets/images/DownArrow.svg'
import { SchedulerCalendarModal } from '@ai-suite/shared-ui'
import ScheduleConfirmModal from '../common/ScheduleConfirmModal.vue'

/** Inline white calendar for dark button */
const CalendarIconWhite =
  'data:image/svg+xml,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M13.3333 2.5V5.83333M6.66666 2.5V5.83333M3.33333 9.16667H16.6667M9.16666 12.5H9.99999V15M3.33333 5.83333C3.33333 5.39131 3.50892 4.96738 3.82148 4.65482C4.13404 4.34226 4.55797 4.16667 4.99999 4.16667H15C15.442 4.16667 15.8659 4.34226 16.1785 4.65482C16.4911 4.96738 16.6667 5.39131 16.6667 5.83333V15.8333C16.6667 16.2754 16.4911 16.6993 16.1785 17.0118C15.8659 17.3244 15.442 17.5 15 17.5H4.99999C4.55797 17.5 4.13404 17.3244 3.82148 17.0118C3.50892 16.6993 3.33333 16.2754 3.33333 15.8333V5.83333Z" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`
  )

const SendEmailWhiteIcon =
  'data:image/svg+xml,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M13 19H5C4.46957 19 3.96086 18.7893 3.58579 18.4142C3.21071 18.0391 3 17.5304 3 17V7M3 7C3 6.46957 3.21071 5.96086 3.58579 5.58579C3.96086 5.21071 4.46957 5 5 5H19C19.5304 5 20.0391 5.21071 20.4142 5.58579C20.7893 5.96086 21 6.46957 21 7M3 7L12 13L21 7M21 7V13M16 22L21 17M21 17V21.5M21 17H16.5" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`
  )

const props = defineProps({
  open: { type: Boolean, default: false },
})

const emit = defineEmits(['close', 'schedule', 'send-now'])

const scheduleCardGradient =
  'linear-gradient(145.88deg, #FAB000 5.37%, #9966FF 30.18%, #0073E6 85.54%, #15BE53 95.31%)'

/** @type {import('vue').Ref<'schedule' | 'sendNow'>} */
const mode = ref('schedule')

const sendTimeOptions = [
  { value: 'fixed', label: 'Fixed send time' },
  { value: 'smart', label: 'Smart send time' },
]

const sendTimeType = ref('fixed')

const showCalendarModal = ref(false)
const showScheduleConfirmModal = ref(false)

/** Calendar selection (date at local midnight for day; time as HH:mm). */
const scheduledDate = ref(/** @type {Date} */ (startOfToday()))
const scheduledTime = ref('00:00')

function startOfToday() {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
}

const scheduledSummary = computed(() => {
  const date = scheduledDate.value
  const timeVal = scheduledTime.value
  if (!date || !timeVal) return 'Today | 12:00 AM'

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const day = new Date(date)
  day.setHours(0, 0, 0, 0)

  let datePart = 'Today'
  if (day.getTime() !== today.getTime()) {
    datePart = date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const [h, m] = timeVal.split(':').map(Number)
  const t = new Date()
  t.setHours(h, m, 0, 0)
  const timePart = t.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })

  return `${datePart} | ${timePart}`
})

const confirmScheduleDate = computed(() => {
  const s = scheduledSummary.value
  const i = s.indexOf(' | ')
  return i === -1 ? s : s.slice(0, i)
})

const confirmScheduleTime = computed(() => {
  const s = scheduledSummary.value
  const i = s.indexOf(' | ')
  return i === -1 ? '' : s.slice(i + 3)
})

/**
 * @param {{ date?: Date; time?: string }} payload
 */
function onCalendarScheduled(payload) {
  if (payload?.date) {
    scheduledDate.value = new Date(payload.date)
    scheduledDate.value.setHours(0, 0, 0, 0)
  }
  if (payload?.time) {
    scheduledTime.value = payload.time
  }
  showCalendarModal.value = false
}

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      mode.value = 'schedule'
      sendTimeType.value = 'fixed'
      scheduledDate.value = startOfToday()
      scheduledTime.value = '00:00'
      showCalendarModal.value = false
      showScheduleConfirmModal.value = false
    }
  }
)

function onConfirmSchedule() {
  showScheduleConfirmModal.value = false
  emit('schedule', {
    sendTimeType: sendTimeType.value,
    scheduledDate: scheduledDate.value,
    scheduledTime: scheduledTime.value,
  })
  emit('close')
}

function onPrimaryAction() {
  if (mode.value === 'schedule') {
    showScheduleConfirmModal.value = true
    return
  }
  emit('send-now')
  emit('close')
}
</script>

<style scoped>
.schedule-drawer-root-enter-active,
.schedule-drawer-root-leave-active {
  transition: opacity 0.22s ease;
}

.schedule-drawer-root-enter-active .schedule-drawer-panel,
.schedule-drawer-root-leave-active .schedule-drawer-panel {
  transition: transform 0.3s cubic-bezier(0.32, 0.72, 0, 1);
}

.schedule-drawer-root-enter-from,
.schedule-drawer-root-leave-to {
  opacity: 0;
}

.schedule-drawer-root-enter-from .schedule-drawer-panel,
.schedule-drawer-root-leave-to .schedule-drawer-panel {
  transform: translateX(100%);
}
</style>