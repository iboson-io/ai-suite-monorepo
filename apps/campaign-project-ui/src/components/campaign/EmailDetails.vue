<template>
  <div
    class="flex w-full min-w-0 max-w-full shrink-0 flex-col gap-4"
  >
    <div
      class="rounded-2xl border primary_border_color bg_secondary_color p-4 shadow-sm md:p-5xl"
    >
      <h2 class="heading_h6_bold primary_text_color">Select your recipients</h2>
      <p class="mt-md label_1_regular leading-relaxed secondary_text_color">
        Choose the list or segment where this campaign should be delivered.
      </p>
      <label class="mt-4 block label_2_medium primary_text_color">Send to</label>
      <div class="relative mt-1.5">
        <select
          v-model="sendTo"
          class="input_box h-12 w-full appearance-none rounded-md px-3 pr-10 text-base regular_border_color label_2_medium tertiary_text_color"
        >
          <option value="" disabled class="tertiary_text_color">Choose the lists or segments you want to include.</option>
          <option v-for="opt in sendToOptions" :key="opt" :value="opt">
            {{ opt }}
          </option>
        </select>
        <div
          class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2"
          aria-hidden="true"
        >
          <img :src="DownArrow" alt="" class="h-2.5 w-2.5" />
        </div>
      </div>
      <button
        type="button"
        class="mt-3 w-auto flex gap-2 rounded-lg border regular_border_color bg_secondary_color px-4 py-2.5 text-left body_3_medium primary_text_color transition-colors hover:bg-info-50"
      >
      <img :src="PlusIcon" alt="">
         Don't send to
      </button>
    </div>

    <div
      class="rounded-2xl border primary_border_color bg_secondary_color p-4 shadow-sm md:p-5xl"
    >
      <h2 class="heading_h6_bold primary_text_color">Set up your email details</h2>
      <p class="mt-md label_1_regular leading-relaxed secondary_text_color">
        Add essential details so your email looks polished and personal.
      </p>

      <div class="mt-6xl space-y-4">
        <div>
          <label
            class="mb-1.5 flex items-baseline gap-0.5 label_2_semibold primary_text_color"
          >
            <span>Subject line</span>
            <span class="text-error-600" aria-hidden="true">*</span>
          </label>
          <div class="flex min-w-0 items-stretch gap-2">
            <RichEmojiTextInput
              ref="subjectInputRef"
              v-model="subject"
              label="Subject line"
              placeholder="Enter subject line here..."
              class="input_box min-w-0 flex-1 rounded-md regular_border_color"
            />
            <div class="relative flex shrink-0 gap-1.5" aria-label="Insert helpers">
              <button
                type="button"
                :class="['icon-pill bg_secondary_color', { 'icon-pill--active': emojiOpen && emojiField === 'subject' }]"
                aria-label="Add emoji to subject"
                @click="openEmojiPicker($event, 'subject')"
              >
                <img :src="EmojiIcon" alt="">
              </button>
              <button
                type="button"
                class="icon-pill bg_secondary_color"
                aria-label="Dynamic content"
              >
                <img :src="PersonalizedIcon" alt="">
              </button>
            </div>
          </div>
        </div>

        <div>
          <label
            class="mb-1.5 flex items-baseline gap-0.5 label_2_semibold primary_text_color"
          >
            <span>Preheader</span>
            <span class="text-error-600" aria-hidden="true">*</span>
          </label>
          <div class="flex min-w-0 items-stretch gap-2">
            <RichEmojiTextInput
              ref="preheaderInputRef"
              v-model="preheader"
              label="Preheader"
              placeholder="Enter preheader here..."
              class="input_box min-w-0 flex-1 rounded-md regular_border_color"
            />
            <button
              type="button"
              :class="['icon-pill bg_secondary_color shrink-0', { 'icon-pill--active': emojiOpen && emojiField === 'preheader' }]"
              aria-label="Add emoji to preheader"
              @click="openEmojiPicker($event, 'preheader')"
            >
              <img :src="EmojiIcon" alt="">
            </button>
          </div>
        </div>

        <div>
          <label
            class="mb-1.5 flex items-baseline gap-0.5 label_2_semibold primary_text_color"
          >
            <span>Sender name</span>
            <span class="text-error-600" aria-hidden="true">*</span>
          </label>
          <div class="flex min-w-0 items-stretch gap-2">
            <RichEmojiTextInput
              ref="senderNameInputRef"
              v-model="senderName"
              label="Sender name"
              placeholder="Enter sender name here..."
              class="input_box min-w-0 flex-1 rounded-md regular_border_color"
            />
            <button
              type="button"
              :class="['icon-pill bg_secondary_color shrink-0', { 'icon-pill--active': emojiOpen && emojiField === 'senderName' }]"
              aria-label="Add emoji to sender name"
              @click="openEmojiPicker($event, 'senderName')"
            >
              <img :src="EmojiIcon" alt="">
            </button>
          </div>
        </div>

        <div>
          <label
            class="mb-1.5 flex items-baseline gap-0.5 label_2_semibold primary_text_color"
          >
            <span>Sender email</span>
            <span class="text-error-600" aria-hidden="true">*</span>
          </label>
          <div class="flex min-w-0 items-stretch gap-2">
            <div class="relative min-w-0 flex-1">
              <select
                v-model="senderEmail"
                class="input_box h-12 w-full appearance-none rounded-md px-3 pr-10 text-base regular_border_color"
              >
                <option
                  v-for="opt in senderEmailOptions"
                  :key="opt"
                  :value="opt"
                >
                  {{ opt }}
                </option>
              </select>
              <div
                class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2"
                aria-hidden="true"
              >
                <img :src="DownArrow" alt="" class="h-2.5 w-2.5" />
              </div>
            </div>
            <button
              type="button"
              class="icon-pill bg_secondary_color shrink-0"
              aria-label="Refresh sender list"
            >
              <img :src="RestartSvg" alt="" class="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <label
        class="mt-5 flex cursor-pointer select-none items-start gap-2.5"
      >
        <input
          v-model="replyToSame"
          type="checkbox"
          class="custom-checkbox mt-0.5 h-4 w-4 cursor-pointer rounded border"
        />
        <span class="label_2_regular primary_text_color leading-snug"
          >Use this email as my reply-to address.</span
        >
      </label>
    </div>
  </div>

  <EmojiPickerPopover
    :open="emojiOpen"
    :top="emojiPopoverTop"
    :left="emojiPopoverLeft"
    @close="closeEmojiPicker"
    @pick="onEmojiPicked"
  />
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import DownArrow from '../../assets/images/DownArrow.svg'
import RestartSvg from '../../assets/images/RestartSvg.svg'
import EmojiPickerPopover from './EmojiPickerPopover.vue'
import RichEmojiTextInput from './RichEmojiTextInput.vue'
import PlusIcon from '../../assets/images/PlusIcon.svg'
import EmojiIcon from '../../assets/images/EmojiIcon.svg'
import PersonalizedIcon from '../../assets/images/PersonalizedIcon.svg'

const emit = defineEmits(['form-valid'])

/**
 * @param {string} raw
 */
function hasRichContent(raw) {
  if (!raw || typeof raw !== 'string') return false
  const s = raw.trim()
  if (!s) return false
  if (!s.includes('<')) return true
  if (typeof document === 'undefined') {
    return s.replace(/<[^>]+>/g, '').trim().length > 0
  }
  const div = document.createElement('div')
  div.innerHTML = s
  for (const img of div.querySelectorAll('img[data-emoji]')) {
    if (img.getAttribute('data-emoji')) return true
  }
  return Boolean(div.textContent?.trim())
}

const subjectInputRef = ref(null)
const preheaderInputRef = ref(null)
const senderNameInputRef = ref(null)
const sendToOptions = ['All subscribers', 'Engaged in last 30 days']
const sendTo = ref('')

const subject = ref('')
const preheader = ref('')
const senderName = ref('')
const senderEmailOptions = ['manu@ibosoninnov.com', 'no-reply@ibosoninnov.com']
const senderEmail = ref('manu@ibosoninnov.com')
const replyToSame = ref(false)

const formValid = computed(
  () =>
    Boolean(sendTo.value?.trim()) &&
    hasRichContent(subject.value) &&
    hasRichContent(preheader.value) &&
    hasRichContent(senderName.value) &&
    Boolean(senderEmail.value?.trim())
)

watch(
  formValid,
  (ok) => {
    emit('form-valid', ok)
  },
  { immediate: true }
)

const PICKER_W = 320
const PICKER_H = 400

const emojiOpen = ref(false)
const emojiField = ref(/** @type {null | 'subject' | 'preheader' | 'senderName'} */ (null))
const emojiPopoverTop = ref(0)
const emojiPopoverLeft = ref(0)

function openEmojiPicker(/** @type {MouseEvent} */ e, /** @type {'subject' | 'preheader' | 'senderName'} */ field) {
  e.stopPropagation()
  if (emojiOpen.value && emojiField.value === field) {
    closeEmojiPicker()
    return
  }
  const el = e.currentTarget
  if (!el || !(el instanceof HTMLElement)) return
  const r = el.getBoundingClientRect()
  let left = r.right - PICKER_W
  let top = r.bottom + 6
  if (left < 8) left = 8
  if (left + PICKER_W > window.innerWidth - 8) {
    left = Math.max(8, window.innerWidth - 8 - PICKER_W)
  }
  if (top + PICKER_H > window.innerHeight - 8) {
    top = Math.max(8, r.top - PICKER_H - 6)
  }
  emojiPopoverTop.value = top
  emojiPopoverLeft.value = left
  emojiField.value = field
  emojiOpen.value = true
}

function closeEmojiPicker() {
  emojiOpen.value = false
  emojiField.value = null
}

function onEmojiPicked(/** @type {string} */ ch) {
  const field = emojiField.value
  if (field === 'subject') subject.value += ch
  else if (field === 'preheader') preheader.value += ch
  else if (field === 'senderName') senderName.value += ch
  void nextTick(() => {
    if (field === 'subject') subjectInputRef.value?.focus()
    else if (field === 'preheader') preheaderInputRef.value?.focus()
    else if (field === 'senderName') senderNameInputRef.value?.focus()
  })
}
</script>

<style scoped>
.icon-pill {
  @apply inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-black-25 text-gray-500 transition-colors hover:bg-info-50;
}
.icon-pill--active {
  @apply border-blue-200 ring-1 ring-blue-200 bg-info-50 text-gray-600;
}
</style>
