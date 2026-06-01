<template>
  <Teleport to="body">
    <Transition name="send-sms-drawer-root">
      <div
        v-if="open"
        class="fixed inset-0 z-[200] flex justify-end"
        role="presentation"
      >
        <div
          class="absolute inset-0 bg_overlay backdrop-blur-sm"
          aria-hidden="true"
          @click="onBackdropClose"
        />
        <aside
          class="send-sms-drawer-panel relative z-10 flex h-full w-full max-w-[min(100%,26rem)] flex-col overflow-hidden rounded-l-2xl border-l border-black-25 bg_secondary_color shadow-[0_25px_50px_-12px_rgba(22,23,34,0.25)]"
          role="dialog"
          aria-modal="true"
          :aria-labelledby="drawerTitleId"
          @click.stop
        >
          <header
            class="flex shrink-0 items-start justify-between gap-3 bg_primary_color px-5xl py-4xl md:px-6xl md:py-6xl"
          >
            <h2
              :id="drawerTitleId"
              class="heading_h6_semibold primary_text_color pr-md"
            >
              {{
                drawerStep === 'sendTest'
                  ? 'Send test'
                  : 'Schedule or send campaign'
              }}
            </h2>
            <button
              type="button"
              class="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-25 transition-colors hover:bg-gray-100"
              aria-label="Close"
              @click="onCloseClick"
            >
              <img :src="BlackCloseIcon" alt="" class="h-3 w-3" />
            </button>
          </header>

          <template v-if="drawerStep === 'sendTest'">
            <div
              class="min-h-0 flex-1 overflow-y-auto bg_primary_color px-5xl md:px-6xl"
            >
              <div
                class="rounded-xl border border-gray-25 bg_secondary_color p-4xl sm:p-5xl"
              >
                <h3 class="heading_h6_bold primary_text_color">
                  See how your message looks
                </h3>
                <p class="mt-md label_1_regular leading-relaxed secondary_text_color">
                  Send a test SMS to check how your message looks on a real device.
                  Standard message rates may apply.
                </p>

                <div class="mt-5xl flex flex-col gap-3">
                  <div
                    v-for="row in testPhoneRows"
                    :key="row.id"
                    class="flex items-start gap-2"
                  >
                    <div class="flex min-w-0 flex-1 flex-col gap-1.5">
                      <div
                        :class="[
                          'flex min-h-[2.75rem] min-w-0 flex-1 overflow-hidden rounded-lg border',
                          phoneFieldErrors[row.id]
                            ? 'border-error-600'
                            : 'border-black-25',
                        ]"
                      >
                        <div
                          class="flex shrink-0 items-center gap-2 regular_border_color px-md py-md label_2_medium primary_text_color"
                        >
                          <span class="text-lg leading-none" aria-hidden="true">🇺🇸</span>
                          <span>+1</span>
                        </div>
                        <input
                          v-model="row.value"
                          type="tel"
                          inputmode="tel"
                          autocomplete="tel"
                          :aria-invalid="Boolean(phoneFieldErrors[row.id])"
                          class="min-w-0 flex-1 border-0 bg-transparent px-3 py-2.5 label_2_regular primary_text_color outline-none ring-0 placeholder:text-[#A7ABB3]"
                          placeholder="201-555-0123"
                          @input="clearPhoneFieldError(row.id)"
                        />
                      </div>
                      <p
                        v-if="phoneFieldErrors[row.id]"
                        class="flex items-start gap-1.5 label_2_regular text-error-600"
                        role="alert"
                      >
                        <span
                          class="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-error-600 text-[10px] font-bold leading-none text-white"
                          aria-hidden="true"
                        >
                          !
                        </span>
                        <span>{{ phoneFieldErrors[row.id] }}</span>
                      </p>
                    </div>
                    <div
                      v-if="testPhoneRows.length > 1"
                      class="group/delete-tip relative inline-flex shrink-0 self-start"
                    >
                      <button
                        type="button"
                        class="inline-flex h-[2.75rem] w-11 shrink-0 items-center justify-center rounded-lg border border-black-25 text-gray-500 transition-colors hover:bg-gray-25 hover:text-gray-700"
                        aria-label="Delete"
                        @click="removePhoneRow(row.id)"
                      >
                        <img :src="DeleteIconBlack" alt="" class="h-4 w-4" />
                      </button>
                      <div
                        role="tooltip"
                        class="pointer-events-none absolute bottom-full left-1/2 z-[70] mb-2 w-max -translate-x-1/2 opacity-0 transition-opacity duration-150 group-hover/delete-tip:opacity-100 group-focus-within/delete-tip:opacity-100"
                      >
                        <div
                          class="relative rounded-md bg-[#1B1F2A] px-3 py-1.5 shadow-lg"
                        >
                          <span class="label_3_medium text-white">Delete</span>
                          <span
                            class="absolute left-1/2 top-full -translate-x-1/2"
                            aria-hidden="true"
                          >
                            <span
                              class="block h-0 w-0 border-x-[6px] border-x-transparent border-t-[6px] border-t-[#1B1F2A]"
                            />
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  v-if="testPhoneRows.length < MAX_TEST_PHONES"
                  type="button"
                  class="mt-3 text-left label_2_medium primary_text_color transition-colors underline"
                  @click="addPhoneRow"
                >
                  + Add phone number
                </button>

                <label
                  class="mt-5xl flex cursor-pointer select-none items-start gap-2.5"
                >
                  <input
                    v-model="saveAsDefault"
                    type="checkbox"
                    class="custom-checkbox mt-0.5 h-4 w-4 cursor-pointer rounded border"
                  />
                  <span class="label_2_medium primary_text_color leading-snug">
                    Save phone numbers as default test recipients
                  </span>
                </label>
              </div>

              <div
              class=" bg_primary_color py-4xl md:py-5xl"
            >
              <button
                type="button"
                :disabled="!canSendTest"
                :class="[
                  'flex w-full items-center justify-center gap-2 rounded-lg px-xl py-xl label_1_semibold transition-colors',
                  canSendTest
                    ? 'primary_add_button cursor-pointer'
                    : 'cursor-not-allowed bg-gray-50 text-white',
                ]"
                @click="onSendTestContinue"
              >
                <svg
                  class="h-5 w-5 shrink-0"
                  viewBox="0 0 24 24"
                  fill="none"
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
                Send test
              </button>
            </div>

            </div>

            
          </template>

          <template v-else>
            <div
              class="min-h-0 flex-1 overflow-y-auto bg_primary_color px-5xl md:px-6xl"
            >
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
                        <svg
                          width="21"
                          height="21"
                          viewBox="0 0 21 21"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M9.795 19H3C2.46957 19 1.96086 18.7893 1.58579 18.4142C1.21071 18.0391 1 17.5304 1 17V5C1 4.46957 1.21071 3.96086 1.58579 3.58579C1.96086 3.21071 2.46957 3 3 3H15C15.5304 3 16.0391 3.21071 16.4142 3.58579C16.7893 3.96086 17 4.46957 17 5V9H1M13 1V5M5 1V5M16 14.496V16L17 17M12 16C12 17.0609 12.4214 18.0783 13.1716 18.8284C13.9217 19.5786 14.9391 20 16 20C17.0609 20 18.0783 19.5786 18.8284 18.8284C19.5786 18.0783 20 17.0609 20 16C20 14.9391 19.5786 13.9217 18.8284 13.1716C18.0783 12.4214 17.0609 12 16 12C14.9391 12 13.9217 12.4214 13.1716 13.1716C12.4214 13.9217 12 14.9391 12 16Z"
                            stroke="#28293D"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                          />
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
                        <svg
                          width="21"
                          height="21"
                          viewBox="0 0 21 21"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M8.32087 12L19.3209 1M8.32087 12L11.8209 19C11.8647 19.0957 11.9352 19.1769 12.0238 19.2338C12.1125 19.2906 12.2156 19.3209 12.3209 19.3209C12.4262 19.3209 12.5293 19.2906 12.6179 19.2338C12.7066 19.1769 12.777 19.0957 12.8209 19L19.3209 1M8.32087 12L1.32087 8.5C1.22513 8.45613 1.144 8.38569 1.08712 8.29705C1.03024 8.20842 1 8.10532 1 8C1 7.89468 1.03024 7.79158 1.08712 7.70295C1.144 7.61431 1.22513 7.54387 1.32087 7.5L19.3209 1"
                            stroke="#28293D"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                          />
                        </svg>
                      </span>
                      <span class="min-w-0">
                        <span class="label_1_semibold primary_text_color mt-md block"
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

              <div v-if="mode === 'schedule'" class="mt-5xl space-y-3">
                <button
                  type="button"
                  class="flex h-14 w-full cursor-pointer items-center justify-between gap-3 rounded-lg border border-gray-25 bg_secondary_color px-3 text-left transition-colors hover:bg-gray-25"
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
                class="modal_primary_button mt-5xl flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-black-400 px-4 py-3 label_1_semibold primary_2_text_color transition-colors hover:bg-black-700"
                @click="onSchedulePrimaryAction"
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
          </template>
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
    <DateConformationModal
      :open="showDateConfirmModal"
      :variant="dateConfirmVariant"
      :title="dateConfirmModalTitle"
      :date-label="dateConfirmDateLabel"
      :time-label="dateConfirmTimeLabel"
      :intro-text="dateConfirmIntro"
      :closing-text="dateConfirmClosing"
      :cancel-text="dateConfirmModalCancelText"
      :confirm-text="dateConfirmModalConfirmText"
      :audience-count="sendNowAudienceCount"
      :send-now-body-before="sendNowConfirmBodyBefore"
      :send-now-body-after="sendNowConfirmBodyAfter"
      @close="onDateConfirmClose"
      @confirm="onDateConfirmConfirm"
    />
  </Teleport>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import BlackCloseIcon from '../../../assets/images/BlackCloseIcon.svg'
import DeleteIconBlack from '../../../assets/images/DeleteIconBlack.svg'
import DownArrow from '../../../assets/images/DownArrow.svg'
import { SchedulerCalendarModal } from '@ai-suite/shared-ui'
import DateConformationModal from './DateConformationModal.vue'

const MAX_TEST_PHONES = 5

const props = defineProps({
  open: { type: Boolean, default: false },
  /** Copy for the reusable date confirmation modal (driven from parent, e.g. Sms.vue). */
  dateConfirmTitle: {
    type: String,
    default: 'Schedule your SMS campaign?',
  },
  dateConfirmIntro: {
    type: String,
    default: 'Your SMS campaign is ready to be scheduled for ',
  },
  dateConfirmClosing: {
    type: String,
    default:
      'Once scheduled, messages will be sent automatically at the selected time.',
  },
  dateConfirmCancelText: { type: String, default: 'Close' },
  dateConfirmConfirmText: { type: String, default: 'Schedule campaign' },
  /** Send-now confirmation (same modal; copy from parent e.g. Sms.vue). */
  sendNowConfirmTitle: {
    type: String,
    default: 'Send your SMS campaign now?',
  },
  sendNowConfirmCancelText: { type: String, default: 'Close' },
  sendNowConfirmConfirmText: { type: String, default: 'Send now' },
  sendNowAudienceCount: { type: Number, default: 0 },
  sendNowConfirmBodyBefore: {
    type: String,
    default: 'Your SMS campaign is ready to be sent immediately to ',
  },
  sendNowConfirmBodyAfter: {
    type: String,
    default:
      ' recipients. Click Send now to deliver your message right away.',
  },
})

const emit = defineEmits(['close', 'send', 'schedule', 'send-now'])

/** @type {import('vue').Ref<'sendTest' | 'scheduleOrSend'>} */
const drawerStep = ref('sendTest')

const drawerTitleId = 'send-sms-drawer-title'

/** @type {import('vue').Ref<{ id: number; value: string }[]>} */
const testPhoneRows = ref([{ id: 0, value: '' }])
let nextPhoneRowId = 1

const saveAsDefault = ref(false)

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
const showDateConfirmModal = ref(false)

/** Why the confirmation modal is open: final schedule vs send-now (calendar applies immediately). */
const dateConfirmReason = ref(
  /** @type {null | 'scheduleFinal' | 'sendNow'} */ (null)
)

const scheduledDate = ref(/** @type {Date} */ (startOfToday()))
const scheduledTime = ref('00:00')

/** Inline white calendar for dark button (same as ScheduleCampaignDrawer) */
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

function startOfToday() {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
}

function resetSendTestForm() {
  nextPhoneRowId = 1
  testPhoneRows.value = [{ id: 0, value: '' }]
  saveAsDefault.value = false
  phoneFieldErrors.value = {}
}

function resetScheduleState() {
  mode.value = 'schedule'
  sendTimeType.value = 'fixed'
  scheduledDate.value = startOfToday()
  scheduledTime.value = '00:00'
  showCalendarModal.value = false
  showDateConfirmModal.value = false
  dateConfirmReason.value = null
}

watch(
  () => props.open,
  (v) => {
    if (v) {
      drawerStep.value = 'sendTest'
      resetSendTestForm()
      resetScheduleState()
    }
  }
)

function digitsOnly(s) {
  return (s ?? '').replace(/\D/g, '')
}

/** True when at least one test row has a full 10-digit US number (enables Send test). */
const canSendTest = computed(() =>
  testPhoneRows.value.some((r) => digitsOnly(r.value).length >= 10)
)

const PHONE_ERROR_MSG = 'Please enter a valid phone number'

/** @type {import('vue').Ref<Record<number, string>>} */
const phoneFieldErrors = ref({})

function clearPhoneFieldError(id) {
  if (!phoneFieldErrors.value[id]) return
  const next = { ...phoneFieldErrors.value }
  delete next[id]
  phoneFieldErrors.value = next
}

/**
 * Sets {@link phoneFieldErrors} and returns whether the form can proceed.
 * @returns {boolean}
 */
function validatePhonesForSendTest() {
  const next = /** @type {Record<number, string>} */ ({})
  let hasAtLeastOneValid = false
  for (const row of testPhoneRows.value) {
    const n = digitsOnly(row.value).length
    if (n >= 10) hasAtLeastOneValid = true
    if ((row.value ?? '').trim() !== '' && n < 10) {
      next[row.id] = PHONE_ERROR_MSG
    }
  }
  if (!hasAtLeastOneValid) {
    const first = testPhoneRows.value[0]
    if (first && next[first.id] === undefined) {
      next[first.id] = PHONE_ERROR_MSG
    }
  }
  phoneFieldErrors.value = next
  if (!hasAtLeastOneValid) return false
  return Object.keys(next).length === 0
}

function addPhoneRow() {
  if (testPhoneRows.value.length < MAX_TEST_PHONES) {
    testPhoneRows.value.push({ id: nextPhoneRowId++, value: '' })
  }
}

/**
 * @param {number} id
 */
function removePhoneRow(id) {
  if (testPhoneRows.value.length <= 1) return
  const i = testPhoneRows.value.findIndex((r) => r.id === id)
  if (i !== -1) testPhoneRows.value.splice(i, 1)
  clearPhoneFieldError(id)
}

function onSendTestContinue() {
  if (!canSendTest.value) return
  if (!validatePhonesForSendTest()) return
  const list = testPhoneRows.value
    .map((r) => digitsOnly(r.value))
    .filter((d) => d.length >= 10)
    .map((d) => `+1${d}`)
  emit('send', { phones: list, saveAsDefault: saveAsDefault.value })
  phoneFieldErrors.value = {}
  drawerStep.value = 'scheduleOrSend'
  resetScheduleState()
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

const dateConfirmDateLabel = computed(() => confirmScheduleDate.value)

const dateConfirmTimeLabel = computed(() => confirmScheduleTime.value)

const dateConfirmUsesSendNowLayout = computed(
  () => dateConfirmReason.value === 'sendNow'
)

const dateConfirmVariant = computed(() =>
  dateConfirmUsesSendNowLayout.value ? 'sendNow' : 'schedule'
)

const dateConfirmModalTitle = computed(() =>
  dateConfirmUsesSendNowLayout.value
    ? props.sendNowConfirmTitle
    : props.dateConfirmTitle
)

const dateConfirmModalCancelText = computed(() =>
  dateConfirmUsesSendNowLayout.value
    ? props.sendNowConfirmCancelText
    : props.dateConfirmCancelText
)

const dateConfirmModalConfirmText = computed(() =>
  dateConfirmUsesSendNowLayout.value
    ? props.sendNowConfirmConfirmText
    : props.dateConfirmConfirmText
)

/**
 * Apply calendar selection to the drawer immediately (no confirmation modal).
 * @param {{ date?: Date; time?: string; timeZone?: string }} payload
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

function onDateConfirmClose() {
  showDateConfirmModal.value = false
  dateConfirmReason.value = null
}

function onDateConfirmConfirm() {
  if (dateConfirmReason.value === 'sendNow') {
    showDateConfirmModal.value = false
    dateConfirmReason.value = null
    emit('send-now')
    emit('close')
    return
  }

  showDateConfirmModal.value = false
  dateConfirmReason.value = null
  emit('schedule', {
    sendTimeType: sendTimeType.value,
    scheduledDate: scheduledDate.value,
    scheduledTime: scheduledTime.value,
  })
  emit('close')
}

function onSchedulePrimaryAction() {
  if (mode.value === 'schedule') {
    dateConfirmReason.value = 'scheduleFinal'
    showDateConfirmModal.value = true
    return
  }
  dateConfirmReason.value = 'sendNow'
  showDateConfirmModal.value = true
}

function onBackdropClose() {
  if (showCalendarModal.value) {
    showCalendarModal.value = false
    return
  }
  if (showDateConfirmModal.value) {
    showDateConfirmModal.value = false
    dateConfirmReason.value = null
    return
  }
  emit('close')
}

function onCloseClick() {
  showCalendarModal.value = false
  showDateConfirmModal.value = false
  dateConfirmReason.value = null
  emit('close')
}
</script>

<style scoped>
.send-sms-drawer-root-enter-active,
.send-sms-drawer-root-leave-active {
  transition: opacity 0.22s ease;
}

.send-sms-drawer-root-enter-active .send-sms-drawer-panel,
.send-sms-drawer-root-leave-active .send-sms-drawer-panel {
  transition: transform 0.3s cubic-bezier(0.32, 0.72, 0, 1);
}

.send-sms-drawer-root-enter-from,
.send-sms-drawer-root-leave-to {
  opacity: 0;
}

.send-sms-drawer-root-enter-from .send-sms-drawer-panel,
.send-sms-drawer-root-leave-to .send-sms-drawer-panel {
  transform: translateX(100%);
}
</style>
