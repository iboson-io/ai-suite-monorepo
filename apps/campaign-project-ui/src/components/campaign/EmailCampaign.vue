<template>
  <div class="email-campaign flex min-h-screen min-h-[100dvh] flex-col bg_primary_color">
    <header
      class="flex flex-wrap items-center justify-between gap-4 border-b primary_border_color bg_secondary_color px-3xl py-4 md:px-6xl"
    >
      <div class="flex min-w-0 flex-1 flex-wrap items-center gap-3xl">
        <button
          type="button"
          class="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border primary_border_color bg_secondary_color transition-colors hover:bg-info-50"
          aria-label="Back to campaigns"
          @click="$emit('close')"
        >
          <img :src="ArrowLeftIcon" alt="" class="h-4 w-4" />
        </button>
        <div
          class="h-10 w-10 shrink-0 rounded-full bg-gradient-to-br from-pink-400 via-fuchsia-500 to-blue-500 shadow-sm"
          aria-hidden="true"
        />
        <p
          class="min-w-0 max-w-md flex-1 truncate rounded-lg border regular_border_color bg_secondary_color px-3xl py-md label_1_medium primary_text_color"
        >
          {{ campaignName }}
        </p>
        <span
          v-if="!showScheduledSuccess"
          class="shrink-0 rounded-lg border border-warning-200 bg-warning-50 px-3 py-1 label_2_medium text-warning-500"
        >
          Draft
        </span>
        <span
          v-else
          class="shrink-0 rounded-full border border-blue-200 bg-blue-25 px-3 py-1 label_2_medium text-blue-600"
        >
          Scheduled
        </span>
      </div>
      <button
        v-if="!showScheduledSuccess"
        type="button"
        class="inline-flex shrink-0 items-center gap-2 rounded-lg px-4xl py-xl primary_add_button label_1_semibold"
        :disabled="campaignStep === 'details' && !detailsFormValid"
        :class="
          campaignStep === 'details' && !detailsFormValid
            ? 'cursor-not-allowed opacity-50'
            : ''
        "
        @click="onHeaderNextClick"
      >
        Next
        <img :src="LeftWhiteArrow" alt="" class="h-4 w-4" />
      </button>
      <button
        v-else
        type="button"
        class="inline-flex shrink-0 items-center gap-2 rounded-lg px-4xl py-xl primary_add_button label_1_semibold"
        @click="$emit('close')"
      >
        Return to campaigns
        <img :src="LeftWhiteArrow" alt="" class="h-4 w-4" aria-hidden="true" />
      </button>
    </header>

    <div
      v-if="!showScheduledSuccess"
      class="flex min-h-0 flex-1 flex-col gap-4 p-3xl md:flex-row md:gap-6xl md:p-6xl lg:px-8xl"
    >
      <!-- Preview column -->
      <div class="flex min-h-0 min-w-0 flex-1 flex-col gap-4">
        <div
          v-show="isEditorStep"
          class="flex flex-wrap items-center justify-between gap-3 border-b border-transparent pb-2 md:pb-0"
        >
          <button type="button" class="button-gradient inline-flex">
            <span
              class="inline-flex items-center gap-2 bg_primary_color px-3xl py-xl label_1_semibold primary_text_color transition-colors "
            >
              <img :src="AiIcon" alt="" />
              Try different layout
            </span>
          </button>
          <div class="flex items-center gap-2">
            <div class="flex items-center gap-xs rounded-lg border regular_border_color bg_secondary_color px-3xl py-xl">
              <button
                type="button"
                class="rounded p-1 text-gray-500 transition-colors enabled:hover:bg-info-50 enabled:hover:text-black-400 disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Undo"
                :disabled="!canUndoPreview"
                @click="undoPreview"
                  >
                    <img :src="UndoLeftIcon" alt="">
                    
              </button>
              <button
                type="button"
                class="rounded p-1 text-gray-500 transition-colors enabled:hover:bg-info-50 enabled:hover:text-black-400 disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Redo"
                :disabled="!canRedoPreview"
                @click="redoPreview"
              >
              <img :src="UndoRightIcon" alt="">
              </button>
            </div>
            <div
              class="inline-flex rounded-lg border regular_border_color bg_secondary_color px-md py-sm"
              role="group"
              aria-label="Preview device"
            >
              <button
                type="button"
                class="flex h-8 w-8 items-center justify-center rounded-md transition-colors"
                :class="previewDevice === 'desktop' ? 'bg-gray-25 shadow-sm' : 'text-gray-500'"
                @click="previewDevice = 'desktop'"
                :aria-pressed="previewDevice === 'desktop'"
              >
                <img :src="DeskTopIcon" alt="">
              </button>
              <button
                type="button"
                class="flex h-8 w-8 items-center justify-center rounded-md transition-colors"
                :class="previewDevice === 'mobile' ? 'bg-gray-25 shadow-sm' : 'text-gray-500'"
                @click="previewDevice = 'mobile'"
                :aria-pressed="previewDevice === 'mobile'"
              >
                <img :src="MobileIcon" alt="">
              </button>
            </div>
          </div>
        </div>

        <div
          class="min-h-0 flex-1 overflow-y-auto rounded-2xl border primary_border_color bg_secondary_color p-4 shadow-sm md:p-6xl"
        >
          <div
            class="mx-auto overflow-hidden rounded-lg bg-white"
            :class="previewDevice === 'mobile' ? 'max-w-[320px]' : 'max-w-2xl'"
          >
            <div class="px-4 py-4">
              <div class="flex items-center gap-2">
                <img :src="NotableIcon" alt="Notable"> 
                <span class="text-2xl font-bold primary_text_color">Notable.</span>
              </div>
            </div>
            <div
              ref="previewBodyEl"
              class="min-h-[120px] rounded-md px-4 pb-6 pt-2 outline-none"
              :class="[
                isEditorStep
                  ? 'cursor-text ring-offset-2 focus-visible:ring-2 focus-visible:ring-blue-200'
                  : 'cursor-default select-text'
              ]"
              :contenteditable="isEditorStep"
              :spellcheck="isEditorStep"
              :tabindex="isEditorStep ? 0 : -1"
              role="textbox"
              :aria-label="
                isEditorStep ? 'Email preview content' : 'Email preview (read only)'
              "
              :aria-readonly="!isEditorStep"
              aria-multiline="true"
              @input="onPreviewInput"
              @blur="onPreviewContentBlur"
            >
              <div class="overflow-hidden rounded-md bg-gray-25" contenteditable="false" @click.stop>
                <button
                  type="button"
                  class="block w-full border-0 bg-transparent p-0 focus:outline-none"
                  :class="[
                    isEditorStep
                      ? 'cursor-pointer focus-visible:ring-2 focus-visible:ring-blue-200 focus-visible:ring-offset-2'
                      : 'pointer-events-none cursor-default'
                  ]"
                  :disabled="!isEditorStep"
                  @click="openUploadImageModal"
                >
                  <img :src="heroImageUrl" alt="" class="h-auto w-full object-contain max-h-96" />
                </button>
              </div>
              <h1 class="mt-5 text-lg font-bold leading-snug primary_text_color md:text-2xl">
                Meet Version 4.0: a clean, modern design for beautiful Notable app
              </h1>
              <p class="mt-6xl body_3_regular leading-relaxed secondary_text_color">
                We're glad to have you onboard! You're already on your way to creating beautiful visual
                products.
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Editor / AI column -->
      <div
        v-show="isEditorStep"
        class="flex w-full shrink-0 flex-col rounded-2xl border primary_border_color bg_secondary_color p-5xl shadow-sm md:max-w-[min(100%,32rem)] md:p-6xl lg:max-w-[min(100%,36rem)]"
      >
        <p class="label_2_medium primary_text_color">Layout</p>
        <div
          class="mt-3 flex max-w-full gap-3 overflow-x-auto pb-1 [scrollbar-width:thin]"
        >
          <div
            v-for="opt in layoutOptions"
            :key="opt.id"
            class="group flex w-[5.5rem] shrink-0 cursor-pointer flex-col items-center gap-1.5 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-blue-100 focus-visible:ring-offset-2"
            role="button"
            tabindex="0"
            :aria-pressed="selectedLayoutId === opt.id"
            :aria-label="`Select ${opt.label} layout`"
            @click="selectedLayoutId = opt.id"
            @keydown.enter.prevent="selectedLayoutId = opt.id"
            @keydown.space.prevent="selectedLayoutId = opt.id"
          >
            <!-- Bordered wireframe only (label sits outside) -->
            <div
              class="flex h-32 w-full items-stretch justify-center overflow-hidden rounded-lg border p-2 transition-colors"
              :class="
                selectedLayoutId === opt.id
                  ? 'border-blue-200 bg-blue-25'
                  : 'border-gray-200 bg-white group-hover:border-info-200'
              "
            >
              <LayoutPreviewThumb
                :variant="opt.id"
                :selected="selectedLayoutId === opt.id"
              />
            </div>
            <span
              class="w-full text-center text-[0.7rem] label_3_regular leading-tight primary_text_color transition-colors"
            >
              {{ opt.label }}
            </span>
          </div>
        </div>  

        <p class="mt-6 label_2_medium primary_text_color">Tell AI what you want to create</p>
        <div
          class="mt-xl rounded-3xl p-px shadow-sm"
          :style="{ background: aiBorderGradient }"
        >
          <div class="flex min-h-[2rem] h-36 flex-col rounded-[1.375rem] bg-white p-4xl">
            <textarea
              v-model="aiPrompt"
              rows="6"
              class="w-full min-h-[3.5rem] flex-1 resize-none border-0 bg-transparent p-0 text-base font-normal leading-7 text-[#1F1F1F] outline-none ring-0 placeholder:text-gray-400"
              placeholder="What's on your mind?"
            />
            <div
              v-if="aiPrompt.trim().length > 0"
              class="mt-1 flex w-full flex-shrink-0 justify-end"
            >
              <div
                class="rounded-xl p-px shadow-sm"
                :style="{ background: aiRegenerateBtnGradient }"
              >
                <button
                  type="button"
                  class="inline-flex items-center gap-2 rounded-[11px] bg-white px-3.5 py-2.5 text-[0.875rem] font-medium text-[#1F1F1F] leading-none transition-colors hover:bg-info-50"
                  @click="onAiRegenerate"
                >
                  <span class="inline-flex items-center gap-0.5" aria-hidden="true">
                   <img :src="AiIcon" alt="">
                  </span>
                  Regenerate
                </button>
              </div>
            </div>
            <div v-else class="flex h-full items-center justify-center relative">
              <img :src="SentButtonIcon" alt="Sent" class="absolute right-0 top-5xl">
            </div>
          </div>
        </div>
        <p class="mt-xl label_3_medium tertiary_text_color">
          More details help AI personalize your message. Avoid sensitive information.
        </p>

        <p class="mt-6xl label_1_medium primary_text_color">Refine quickly</p>
        <div class="mt-xl flex flex-wrap gap-xl">
          <button
            v-for="chip in refineChips"
            :key="chip"
            type="button"
            class="rounded-lg border border-black-25 bg-info-50 px-md py-xs label_2_medium secondary_text_color transition-colors hover:bg-info-100"
            @click="onRefineChip(chip)"
          >
            {{ chip }}
          </button>
        </div>
      </div>

      <div
        v-show="!isEditorStep"
        class="flex w-full min-w-0 max-w-full shrink-0 flex-col overflow-y-auto rounded-2xl border primary_border_color bg_primary_color p-3 shadow-sm sm:p-4 md:max-w-[min(100%,32rem)] md:p-5xl lg:max-w-[min(100%,36rem)]"
      >
        <EmailDetails @form-valid="detailsFormValid = $event" />
      </div>
    </div>

    <div
      v-else
      class="flex min-h-0 flex-1 flex-col p-3xl md:p-6xl lg:px-8xl"
    >
      <ScheduleSucessModal
        :datetime-line="successDateTimeLine"
        :send-type-label="successSendTypeLabel"
      />
    </div>

    <ScheduleCampaignDrawer
      :open="showScheduleDrawer"
      @close="showScheduleDrawer = false"
      @schedule="onScheduleConfirmed"
    />
    <UploadFileModal
      :open="showUploadFileModal"
      @close="showUploadFileModal = false"
      @save="onUploadFileSave"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, onUnmounted } from 'vue'
import PostImage from '../../assets/images/PostImage.png'
import ArrowLeftIcon from '../../assets/images/ArrowLeftIcon.svg'
import LeftWhiteArrow from '../../assets/images/LeftWhiteArrow.svg'
import UploadFileModal from './UploadFileModal.vue'
import LayoutPreviewThumb from './LayoutPreviewThumb.vue'
import AiIcon from '../../assets/images/AiIcon.svg'
import UndoRightIcon from '../../assets/images/UndoRightIcon.svg'
import UndoLeftIcon from '../../assets/images/UndoLeftIcon.svg'
import DeskTopIcon from '../../assets/images/DeskTopIcon.svg'
import MobileIcon from '../../assets/images/MobileIcon.svg'
import NotableIcon from '../../assets/images/NotableIcon.svg'
import SentButtonIcon from '../../assets/images/SentButtonIcon.svg'
import EmailDetails from './EmailDetails.vue'
import ScheduleCampaignDrawer from './ScheduleCampaignDrawer.vue'
import ScheduleSucessModal from './ScheduleSucessModal.vue'

defineEmits(['close'])

const campaignStep = ref('editor')
const detailsFormValid = ref(false)
const showScheduleDrawer = ref(false)
const showScheduledSuccess = ref(false)
/** @type {import('vue').Ref<null | { sendTimeType: string; scheduledDate: Date; scheduledTime: string }>} */
const lastSchedulePayload = ref(null)

const isEditorStep = computed(() => campaignStep.value === 'editor')

const successDateTimeLine = computed(() => {
  const p = lastSchedulePayload.value
  if (!p?.scheduledDate || !p?.scheduledTime) {
    return 'Dec 14, 2025, 12:00 AM recipient local time'
  }
  const d = new Date(p.scheduledDate)
  const [hh, mm] = String(p.scheduledTime)
    .split(':')
    .map((n) => Number(n))
  const dt = new Date(
    d.getFullYear(),
    d.getMonth(),
    d.getDate(),
    hh,
    mm,
    0,
    0
  )
  const dateStr = dt.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
  const timeStr = dt.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
  return `${dateStr}, ${timeStr} recipient local time`
})

const successSendTypeLabel = computed(() => {
  const t = lastSchedulePayload.value?.sendTimeType
  if (t === 'smart') return 'Smart send time'
  return 'Fixed send time'
})

/**
 * @param {{ sendTimeType: string; scheduledDate: Date; scheduledTime: string }} payload
 */
function onScheduleConfirmed(payload) {
  lastSchedulePayload.value = payload
  showScheduledSuccess.value = true
  showScheduleDrawer.value = false
}

function onHeaderNextClick() {
  if (isEditorStep.value) {
    goToDetailsStep()
    return
  }
  if (campaignStep.value === 'details' && detailsFormValid.value) {
    showScheduleDrawer.value = true
  }
}

function goToDetailsStep() {
  if (campaignStep.value === 'details') return
  campaignStep.value = 'details'
  void nextTick(() => {
    previewBodyEl.value?.blur()
  })
}

const campaignName = ref('Refund Approver Bot')
const previewDevice = ref('desktop')
const selectedLayoutId = ref('split')
const aiPrompt = ref('')

const heroImageUrl = ref(PostImage)
const showUploadFileModal = ref(false)

/** Snapshot of preview HTML on blur (contenteditable). */
const emailPreviewBodyHtml = ref('')

/** Custom undo/redo for the contenteditable body (HTML string snapshots). */
const previewBodyEl = ref(null)
const previewHistory = ref([])
const historyIndex = ref(0)
const PREVIEW_HISTORY_MAX = 50
let isApplyingPreviewHistory = false
let historyDebounceId = null

const canUndoPreview = computed(
  () => previewHistory.value.length > 0 && historyIndex.value > 0
)
const canRedoPreview = computed(
  () => historyIndex.value < previewHistory.value.length - 1
)

const aiBorderGradient =
  'linear-gradient(145.88deg, #FAB000 5.37%, #9966FF 30.18%, #0073E6 85.54%, #15BE53 95.31%)'

const aiRegenerateBtnGradient =
  'linear-gradient(135deg, #C084FC 0%, #3B82F6 50%, #22D3EE 100%)'

const layoutOptions = [
  { id: 'split', label: 'Split Layout' },
  { id: 'minimal', label: 'Minimal' },
  { id: 'narrative', label: 'Narrative' },
  { id: 'spotlight', label: 'Spotlight' },
  { id: 'gallery', label: 'Gallery Grid' }
]

const refineChips = [
  'Shorten text',
  'Expand the content',
  'Reduce sales tone',
  'Professional tone',
  'Relax the tone',
  'Create urgency',
  'Increase energy',
  'Improve clarity'
]

function onRefineChip(chip) {
  aiPrompt.value = aiPrompt.value ? `${aiPrompt.value}\n${chip}` : chip
}

function onAiRegenerate() {
  if (!aiPrompt.value?.trim()) return
  // Hook: call API to refresh AI copy from current prompt
}

function openUploadImageModal() {
  if (!isEditorStep.value) return
  showUploadFileModal.value = true
}

function onUploadFileSave(file) {
  if (!file) return
  const reader = new FileReader()
  reader.onload = () => {
    if (typeof reader.result === 'string') {
      const dataUrl = reader.result
      heroImageUrl.value = dataUrl
      void nextTick(() => {
        const img = previewBodyEl.value?.querySelector('img')
        if (img) {
          img.src = dataUrl
        }
        pushCurrentPreviewToHistory()
      })
    }
  }
  reader.readAsDataURL(file)
}

function pushCurrentPreviewToHistory() {
  const el = previewBodyEl.value
  if (!el) return
  const html = el.innerHTML
  const at = historyIndex.value
  if (html === previewHistory.value[at]) return
  let next = previewHistory.value.slice(0, at + 1)
  next.push(html)
  if (next.length > PREVIEW_HISTORY_MAX) {
    next = next.slice(-PREVIEW_HISTORY_MAX)
  }
  previewHistory.value = next
  historyIndex.value = next.length - 1
  emailPreviewBodyHtml.value = html
}

onMounted(() => {
  nextTick(() => {
    const el = previewBodyEl.value
    if (el) {
      previewHistory.value = [el.innerHTML]
      historyIndex.value = 0
    }
  })
})

onUnmounted(() => {
  if (historyDebounceId) {
    clearTimeout(historyDebounceId)
    historyDebounceId = null
  }
})

function onPreviewInput() {
  if (!isEditorStep.value) return
  if (isApplyingPreviewHistory) return
  if (historyDebounceId) clearTimeout(historyDebounceId)
  historyDebounceId = setTimeout(() => {
    historyDebounceId = null
    const el = previewBodyEl.value
    if (!el) return
    const html = el.innerHTML
    const at = historyIndex.value
    if (html === previewHistory.value[at]) return
    let next = previewHistory.value.slice(0, at + 1)
    next.push(html)
    if (next.length > PREVIEW_HISTORY_MAX) {
      next = next.slice(-PREVIEW_HISTORY_MAX)
    }
    previewHistory.value = next
    historyIndex.value = next.length - 1
    emailPreviewBodyHtml.value = html
  }, 400)
}

function applyPreviewHistoryAt(index) {
  const el = previewBodyEl.value
  if (!el || !previewHistory.value.length) return
  isApplyingPreviewHistory = true
  el.innerHTML = previewHistory.value[index]
  emailPreviewBodyHtml.value = el.innerHTML
  void nextTick(() => {
    syncHeroFromPreviewDom()
    isApplyingPreviewHistory = false
  })
}

function syncHeroFromPreviewDom() {
  const el = previewBodyEl.value
  if (!el) return
  const img = el.querySelector('img')
  if (img) {
    const s = img.getAttribute('src') || img.currentSrc
    if (s) {
      heroImageUrl.value = s
    }
  }
}

function undoPreview() {
  if (!canUndoPreview.value) return
  historyIndex.value--
  applyPreviewHistoryAt(historyIndex.value)
  void nextTick(() => {
    previewBodyEl.value?.focus()
  })
}

function redoPreview() {
  if (!canRedoPreview.value) return
  historyIndex.value++
  applyPreviewHistoryAt(historyIndex.value)
  void nextTick(() => {
    previewBodyEl.value?.focus()
  })
}

function onPreviewContentBlur(e) {
  const el = e.currentTarget
  if (el && 'innerHTML' in el) {
    emailPreviewBodyHtml.value = el.innerHTML
  }
}
</script>