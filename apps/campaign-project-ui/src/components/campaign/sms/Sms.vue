<template>
  <div class="sms-campaign flex min-h-screen min-h-[100dvh] flex-col bg_primary_color">
    <header
      class="flex flex-wrap items-center justify-between gap-4 border-b primary_border_color bg_secondary_color px-3xl py-xl rounded-lg mt-5xl w-[96%] m-auto"
    >
      <div class="flex min-w-0 flex-1 flex-wrap items-center gap-3xl">
        <button
          type="button"
          class="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border regular_border_color bg_secondary_color transition-colors hover:bg-info-50"
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
          class="min-w-0 max-w-[min(100%,28rem)] flex-1 truncate rounded-lg border regular_border_color bg_secondary_color px-3xl py-xl label_1_medium primary_text_color"
        >
          {{ headerTitle }}
        </p>
        <span
          class="shrink-0 rounded-lg border border-warning-200 bg-warning-50 px-3 py-1 label_2_medium text-warning-500"
        >
          Draft
        </span>
      </div>
      <div class="flex shrink-0 flex-wrap items-center gap-2 md:gap-3">
        <button
          type="button"
          class="inline-flex items-center gap-2 rounded-lg border regular_border_color bg-gray-25 px-xxl py-xl label_1_semibold primary_text_color transition-colors hover:bg-info-50"
        >
          Send test
        </button>
        <button
          type="button"
          class="inline-flex items-center gap-2 rounded-lg px-xxl py-xl primary_add_button label_1_semibold"
          @click="sendSmsModalOpen = true"
        >
          Schedule or send
          <img :src="LeftWhiteArrow" alt="" class="h-4 w-4" />
        </button>
      </div>
    </header>

    <div
      class="grid min-h-0 flex-1 grid-cols-1 gap-4 p-3xl md:grid-cols-[minmax(0,40fr)_minmax(0,60fr)] md:gap-6xl md:p-6xl lg:px-8xl"
    >
      <!-- Phone preview (40% share of row) -->
      <div
        class="flex min-h-0 w-full justify-center md:sticky md:top-4 md:self-start md:max-h-[calc(100dvh-6rem)]"
      >
      <div
        class="relative mx-auto w-full max-w-[min(100%,300px)] shrink-0"
        aria-hidden="true"
      >
        <img
          :src="PhoneFrame"
          alt=""
          class="pointer-events-none block h-auto w-full max-h-[min(92dvh,640px)] select-none object-contain"
          draggable="false"
        />
        <div
          class="sms-phone-screen absolute overflow-hidden rounded-[1.85rem] bg-white"
        >
          <div class="border-b border-black-25 bg-gray-25 px-3 py-3">
            <div class="flex items-center gap-2">
              <div
                class="h-9 w-9 shrink-0 rounded-full bg-gray-50 ring-1 ring-black-25"
              />
              <span
                class="rounded-full bg-gray-25 px-3 py-1.5 label_2_medium text-gray-600 ring-1 ring-black-25"
              >
                +18339363186
              </span>
            </div>
          </div>
          <div class="min-h-[200px] px-3 py-3">
            <div
              class="rounded-2xl rounded-tl-md bg-gray-25 px-3.5 py-3 label_2_regular leading-relaxed text-[#1F1F1F]"
            >
              <img
                v-if="smsPreviewImageUrl"
                :src="smsPreviewImageUrl"
                :alt="smsPreviewImageAlt"
                class="mb-2 w-full max-h-[12rem] rounded-md object-contain"
              />
              <template v-for="(chunk, i) in previewChunks" :key="i">
                <a
                  v-if="chunk.isLink"
                  :href="chunk.t"
                  class="text-blue-600 underline decoration-blue-600/80 underline-offset-2"
                  target="_blank"
                  rel="noopener noreferrer"
                  @click.stop
                >{{ chunk.t }}</a>
                <span v-else class="whitespace-pre-wrap">{{ chunk.t }}</span>
              </template>
            </div>
          </div>
        </div>
      </div>
      </div>

      <!-- Config column (60% share of row) -->
      <div class="flex min-h-0 w-full min-w-0 flex-col gap-4">
        <div
          class="rounded-2xl border primary_border_color bg_secondary_color p-6xl shadow-sm"
        >
          <h2 class="heading_h6_bold primary_text_color">Create your SMS message</h2>
          <p class="mt-md label_1_regular leading-relaxed secondary_text_color">
            Craft your text message and see a live preview on the left.
          </p> 
            <div class="block h-[1px] w-full bg-gray-25 mt-6xl"></div>

          <div class="mt-6xl mb-1.5 flex flex-wrap items-baseline justify-between gap-2">
            <label
              class="flex flex-wrap items-baseline gap-0.5 label_2_semibold primary_text_color"
            >
              <span>Message content</span>
              <span class="text-error-600" aria-hidden="true">*</span>
              <span class="m-auto ml-xs"><svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M6.75 10.0833V10.09M6.75 7.75001C6.73773 7.53359 6.7961 7.31904 6.91635 7.13868C7.03659 6.95832 7.21218 6.82192 7.41667 6.75001C7.66725 6.65418 7.89217 6.5015 8.07371 6.30398C8.25526 6.10646 8.38848 5.86949 8.46288 5.61173C8.53729 5.35398 8.55084 5.08247 8.50249 4.81859C8.45413 4.5547 8.34518 4.30564 8.18421 4.09102C8.02324 3.87639 7.81465 3.70206 7.57486 3.58175C7.33507 3.46144 7.07063 3.39844 6.80235 3.39769C6.53407 3.39695 6.26928 3.45849 6.02883 3.57747C5.78838 3.69644 5.57882 3.86961 5.41667 4.08334M0.75 6.75C0.75 7.53793 0.905195 8.31815 1.20672 9.0461C1.50825 9.77405 1.95021 10.4355 2.50736 10.9926C3.06451 11.5498 3.72595 11.9917 4.4539 12.2933C5.18185 12.5948 5.96207 12.75 6.75 12.75C7.53793 12.75 8.31815 12.5948 9.0461 12.2933C9.77405 11.9917 10.4355 11.5498 10.9926 10.9926C11.5498 10.4355 11.9917 9.77405 12.2933 9.0461C12.5948 8.31815 12.75 7.53793 12.75 6.75C12.75 5.96207 12.5948 5.18185 12.2933 4.4539C11.9917 3.72595 11.5498 3.06451 10.9926 2.50736C10.4355 1.95021 9.77405 1.50825 9.0461 1.20672C8.31815 0.905195 7.53793 0.75 6.75 0.75C5.96207 0.75 5.18185 0.905195 4.4539 1.20672C3.72595 1.50825 3.06451 1.95021 2.50736 2.50736C1.95021 3.06451 1.50825 3.72595 1.20672 4.4539C0.905195 5.18185 0.75 5.96207 0.75 6.75Z" stroke="#9C9DA6" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
</span>
            </label>
            <span
              v-if="hasMessageContent"
              class="label_3_regular tertiary_text_color"
            >
              {{ messageCharCount }} / {{ SMS_CHAR_LIMIT }}
            </span>
          </div>
          <div class="relative">
            <textarea
              ref="messageTextareaRef"
              v-model="messageText"
              rows="10"
              class="input_box min-h-[8rem] h-[8em] w-full resize-y rounded-lg regular_border_color bg_secondary_color px-3 py-3 label_2_regular primary_text_color outline-none ring-0 transition-shadow focus:border-gray-50 focus:ring-2 focus:ring-blue-25"
              placeholder="Write your SMS..."
            />
            <span
              v-if="!hasMessageContent"
              class="pointer-events-none absolute bottom-3 right-3 label_3_regular tertiary_text_color"
            >
              {{ messageCharCount }} / {{ SMS_CHAR_LIMIT }}
            </span>
            <span
              v-if="hasMessageContent"
              class="pointer-events-none absolute bottom-3 right-3 flex items-center justify-center"
              aria-hidden="true"
            >
              <img :src="AiIcon" alt="" class="h-5 w-5 opacity-80" />
            </span>
          </div>

          <div
            class="mt-6xl flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
          >
            <div class="relative min-w-0 sm:max-w-[14rem]">
              <select
                v-model="smsCreditTier"
                class="input_box flex h-11 w-full appearance-none items-center rounded-lg regular_border_color bg_secondary_color py-xl pl-10 pr-10 label_1_medium primary_text_color"
              >
                <option value="3">1 SMS = 3 cred</option>
                <option value="2">1 SMS = 2 cred</option>
                <option value="1">1 SMS = 1 cred</option>
              </select>
              <span
                class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-lg"
                aria-hidden="true"
              >🇺🇸</span>
              <div
                class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2"
                aria-hidden="true"
              >
                <img :src="DownArrow" alt="" class="h-5xl w-5xl" />
              </div>
            </div>
            <div class="relative flex items-center justify-end gap-1.5">
              <button
                ref="imageMenuTriggerRef"
                type="button"
                :class="[
                  'icon-pill bg_secondary_color border border-gray-25',
                  imageAttachmentMenuOpen ? 'icon-pill--active' : '',
                ]"
                aria-label="Add image"
                aria-haspopup="menu"
                :aria-expanded="imageAttachmentMenuOpen"
                @click.stop="toggleImageAttachmentMenu"
              >
                <img :src="ImageDefultIcon" alt="" class="h-5xl w-5xl" />
              </button>
              <button
                ref="emojiMenuTriggerRef"
                type="button"
                :class="[
                  'icon-pill bg_secondary_color border border-gray-25',
                  emojiOpen ? 'icon-pill--active' : '',
                ]"
                aria-label="Emoji"
                aria-haspopup="dialog"
                :aria-expanded="emojiOpen"
                @click.stop="openSmsEmojiPicker"
              >
                <img :src="EmojiIcon" alt="" class="h-5 w-5" />
              </button>
              <button
                ref="quickInsertTriggerRef"
                type="button"
                :class="[
                  'icon-pill bg_secondary_color border border-gray-25',
                  quickInsertPopoverOpen ? 'icon-pill--active' : '',
                ]"
                aria-label="Quick insert"
                aria-haspopup="dialog"
                :aria-expanded="quickInsertPopoverOpen"
                @click.stop="toggleQuickInsertPopover"
              >
                <img :src="PersonalizedIcon" alt="" class="h-5 w-5" />
              </button>
            </div>
          </div>

          <label class="mt-5xl flex cursor-pointer select-none items-start gap-2.5">
            <input
              v-model="shortenLinks"
              type="checkbox"
              class="custom-checkbox mt-0.5 h-4 w-4 cursor-pointer rounded border"
            />
            <span class="label_2_medium primary_text_color leading-snug"
              >Automatically shorten links</span
            >
          </label>
        </div>

        <div
          class="rounded-2xl border primary_border_color bg_secondary_color p-6 shadow-sm"
        >
          <h2 class="heading_h6_bold primary_text_color">Select your recipients</h2>
          <p class="mt-md label_1_regular leading-relaxed secondary_text_color">
            Choose the list or segment where this campaign should be delivered.
          </p>

           <div class="block h-[1px] w-full bg-gray-25 mt-6xl"></div>
          <label class="mt-6xl block label_2_regular primary_text_color">Send to</label>
          <div class="relative mt-1.5">
            <select
              v-model="sendTo"
              class="input_box h-12 w-full appearance-none rounded-md px-3 pr-10 text-base regular_border_color label_2_regular tertiary_text_color mt-md"
            >
              <option value="" disabled class="tertiary_text_color">
                Choose the lists or segments you want to include.
              </option>
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
            class="mt-xl w-auto flex gap-2 rounded-lg border regular_border_color bg_secondary_color px-4 py-2.5 text-left label_2_regular primary_text_color transition-colors hover:bg-info-50"
          >
            <img :src="PlusIcon" alt="" class="h-4 w-4 shrink-0" />
            Don't send to
          </button>
        </div>
      </div>
    </div>
  </div>

  <Teleport to="body">
    <div
      v-if="imageAttachmentMenuOpen"
      ref="imageAttachmentMenuRef"
      data-sms-image-attachment-menu
      class="fixed z-[210] min-w-[280px] max-w-[min(calc(100vw-16px),340px)] overflow-hidden rounded-xl border border-black-25 bg_secondary_color shadow-lg"
      :style="imageAttachmentMenuStyle"
      role="menu"
      aria-label="Image options"
      @click.stop
    >
      <div class="flex items-stretch">
        <button
          type="button"
          class="flex flex-1 items-center gap-2.5 px-4 py-3.5 text-left transition-colors hover:bg-info-50"
          role="menuitem"
          @click="onGenerateImage"
        >
          <img :src="AiIcon" alt="" class="h-5 w-5 shrink-0" />
          <span class="label_2_medium primary_text_color">Generate image</span>
        </button>
        <div
          class="my-2.5 w-px shrink-0 self-stretch bg-black-25"
          aria-hidden="true"
        />
        <div class="flex flex-1 items-center p-1.5">
          <button
            type="button"
            class="flex w-full items-center justify-center gap-2 rounded-lg bg-gray-25 px-3 py-2.5 transition-colors hover:bg-gray-50"
            role="menuitem"
            @click="onUploadImageClick"
          >
            <img :src="IconforUpload" alt="" class="h-5 w-5 shrink-0" />
            <span class="label_2_medium primary_text_color">Upload Image</span>
          </button>
        </div>
      </div>
    </div>
  </Teleport>

  <Teleport to="body">
    <div
      v-if="aiImagePromptOpen"
      ref="aiImagePromptPanelRef"
      data-sms-ai-image-prompt
      class="fixed z-[212] w-[min(calc(100vw-24px),420px)] rounded-2xl border border-black-25 bg_secondary_color p-5 shadow-xl sm:p-6"
      :style="aiImagePromptPanelStyle"
      role="dialog"
      aria-modal="true"
      aria-labelledby="sms-ai-image-prompt-heading"
      @click.stop
    >
      <h2
        id="sms-ai-image-prompt-heading"
        class="sr-only"
      >
        AI image generation
      </h2>
      <div class="relative">
        <textarea
          ref="aiImagePromptTextareaRef"
          v-model="aiImagePrompt"
          rows="5"
          class="input_box min-h-[7.5rem] h-[8em] w-full resize-y rounded-lg border border-black-25 bg_secondary_color px-3 py-3 pb-11 pr-12 label_2_regular primary_text_color shadow-none outline-none ring-0 transition-shadow placeholder:text-[#A7ABB3] focus:border-blue-200 focus:ring-2 focus:ring-blue-100"
          placeholder="Enter a prompt"
        />
        <span
          class="pointer-events-none absolute bottom-3 right-3 flex items-center justify-center"
          aria-hidden="true"
        >
          <img :src="AiIcon" alt="" class="h-6 w-6 select-none opacity-95" />
        </span>
      </div>
      <div class="mt-5 flex items-center justify-between gap-3">
        <button
          type="button"
          class="rounded-lg border primary_border_color bg-gray-25 px-5 py-2.5 label_1_semibold primary_text_color transition-colors hover:bg-gray-50"
          @click="onAiImagePromptCancel"
        >
          Cancel
        </button>
        <button
          type="button"
          :disabled="!aiImagePromptTrimmed"
          :class="[
            'inline-flex min-h-[2.75rem] items-center justify-center gap-2 rounded-lg px-5 py-2.5 label_1_semibold transition-colors',
            aiImagePromptTrimmed
              ? 'cursor-pointer bg-black-600 text-white shadow-sm hover:bg-black-700'
              : 'cursor-not-allowed bg-gray-50 text-gray-400',
          ]"
          @click="onAiImagePromptSubmit"
        >
          <img
            :src="AiIcon"
            alt=""
            :class="[
              'h-4 w-4 shrink-0',
              aiImagePromptTrimmed ? 'brightness-0 invert' : 'opacity-40 grayscale',
            ]"
            aria-hidden="true"
          />
          Generate
        </button>
      </div>
    </div>
  </Teleport>

  <EmojiPickerPopover
    :open="emojiOpen"
    :top="emojiPopoverTop"
    :left="emojiPopoverLeft"
    @close="closeEmojiPicker"
    @pick="onSmsEmojiPicked"
  />

  <Teleport to="body">
    <div
      v-if="quickInsertPopoverOpen"
      ref="quickInsertPanelRef"
      data-sms-quick-insert-popover
      class="fixed z-[211] w-[min(calc(100vw-24px),360px)] rounded-xl border border-black-25 bg_secondary_color p-4 shadow-lg sm:p-5"
      :style="quickInsertPopoverStyle"
      role="dialog"
      aria-modal="true"
      aria-labelledby="sms-quick-insert-heading"
      @click.stop
    >
      <h2
        id="sms-quick-insert-heading"
        class="label_2_semibold primary_text_color"
      >
        Select field
      </h2>
      <div class="relative mt-3">
        <select
          v-model="quickInsertSelectedField"
          class="input_box flex h-11 w-full appearance-none items-center rounded-lg border border-black-25 bg_secondary_color py-2 pl-3 pr-10 label_2_medium primary_text_color"
        >
          <option
            v-for="opt in smsMergeFieldOptions"
            :key="opt.value"
            :value="opt.value"
          >
            {{ opt.label }}
          </option>
        </select>
        <div
          class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2"
          aria-hidden="true"
        >
          <img :src="DownArrow" alt="" class="h-2.5 w-2.5" />
        </div>
      </div>
      <div class="mt-5 flex items-center justify-between gap-3">
        <button
          type="button"
          class="rounded-lg border primary_border_color bg-gray-25 px-5 py-2.5 label_1_semibold primary_text_color transition-colors hover:bg-gray-50"
          @click="onQuickInsertCancel"
        >
          Cancel
        </button>
        <button
          type="button"
          class="inline-flex min-h-[2.75rem] items-center justify-center rounded-lg px-5 py-2.5 !h-auto label_1_semibold primary_button"
          @click="onQuickInsertSave"
        >
          Save
        </button>
      </div>
    </div>
  </Teleport>

  <UploadFileModal
    :open="uploadFileModalOpen"
    @close="uploadFileModalOpen = false"
    @save="onUploadFileModalSave"
  />

  <SendSmsModal
    :open="sendSmsModalOpen"
    date-confirm-title="Schedule your SMS campaign?"
    date-confirm-intro="Your SMS campaign is ready to be scheduled for "
    date-confirm-closing="Once scheduled, messages will be sent automatically at the selected time."
    date-confirm-cancel-text="Close"
    date-confirm-confirm-text="Schedule campaign"
    send-now-confirm-title="Send your SMS campaign now?"
    send-now-confirm-cancel-text="Close"
    send-now-confirm-confirm-text="Send now"
    send-now-confirm-body-before="Your SMS campaign is ready to be sent immediately to "
    send-now-confirm-body-after=" recipients. Click Send now to deliver your message right away."
    :send-now-audience-count="smsSendNowAudienceCount"
    @close="sendSmsModalOpen = false"
    @send="onSendSmsModalSend"
    @schedule="onSendSmsModalSchedule"
    @send-now="onSendSmsModalSendNow"
  />
</template>

<script setup>
import { ref, computed, watch, onUnmounted, nextTick } from 'vue'
import ArrowLeftIcon from '../../../assets/images/ArrowLeftIcon.svg'
import LeftWhiteArrow from '../../../assets/images/LeftWhiteArrow.svg'
import DownArrow from '../../../assets/images/DownArrow.svg'
import PlusIcon from '../../../assets/images/PlusIcon.svg'
import EmojiIcon from '../../../assets/images/EmojiIcon.svg'
import AiIcon from '../../../assets/images/AiIcon.svg'
import ImageDefultIcon from '../../../assets/images/ImageDefultIcon.svg'
import UploadImageIcon from '../../../assets/images/UploadImageIcon.svg'
import PhoneFrame from '../../../assets/images/PhoneFrame.png'
import PersonalizedIcon from '../../../assets/images/PersonalizedIcon.svg'
import UploadFileModal from '../UploadFileModal.vue'
import SendSmsModal from './SendSmsModal.vue'
import EmojiPickerPopover from '../EmojiPickerPopover.vue'
import IconforUpload from '../../../assets/images/IconforUpload.svg'

defineEmits(['close'])

const SMS_CHAR_LIMIT = 1600

const messageText = ref('')
const shortenLinks = ref(false)
const smsCreditTier = ref('3')
const sendToOptions = ['All subscribers', 'Engaged in last 30 days']
const sendTo = ref('')

/** Placeholder recipient count for send-now confirmation; replace when audience API exists. */
const smsSendNowAudienceCount = ref(12450)

const IMAGE_MENU_W = 300

const imageAttachmentMenuOpen = ref(false)
const imageMenuTriggerRef = ref(/** @type {HTMLElement | null} */ (null))
const imageAttachmentMenuStyle = ref(
  /** @type {Record<string, string>} */ ({ top: '0px', left: '0px' })
)
const imageAttachmentMenuRef = ref(/** @type {HTMLElement | null} */ (null))

const AI_IMAGE_PROMPT_PANEL_W = 400

const aiImagePromptOpen = ref(false)
const aiImagePrompt = ref('')
const aiImagePromptPanelRef = ref(/** @type {HTMLElement | null} */ (null))
const aiImagePromptPanelStyle = ref(
  /** @type {Record<string, string>} */ ({ top: '0px', left: '0px' })
)
const aiImagePromptTextareaRef = ref(/** @type {HTMLTextAreaElement | null} */ (null))

const aiImagePromptTrimmed = computed(() => (aiImagePrompt.value ?? '').trim())

const uploadFileModalOpen = ref(false)
const sendSmsModalOpen = ref(false)
const smsPreviewImageUrl = ref(/** @type {string | null} */ (null))
const smsPreviewImageAlt = ref('')

const EMOJI_PICKER_W = 320
/** ~matches EmojiPickerPopover (search + tabs + title + 12rem grid + padding) for below/above choice */
const EMOJI_PICKER_EST_H = 336
/** Gap between emoji pill bottom and picker top — minimal so it sits tight under the icon */
const EMOJI_PICKER_GAP = 2

const emojiOpen = ref(false)
const emojiPopoverTop = ref(0)
const emojiPopoverLeft = ref(0)
const emojiMenuTriggerRef = ref(/** @type {HTMLElement | null} */ (null))
const messageTextareaRef = ref(/** @type {HTMLTextAreaElement | null} */ (null))

const smsMergeFieldOptions = [
  { value: 'firstName', label: 'First name', token: '{{first_name}}' },
  { value: 'lastName', label: 'Last name', token: '{{last_name}}' },
  { value: 'email', label: 'Email', token: '{{email}}' },
  { value: 'phone', label: 'Phone number', token: '{{phone}}' },
  { value: 'company', label: 'Company', token: '{{company}}' },
]

const QUICK_INSERT_PANEL_W = 360
const QUICK_INSERT_PANEL_EST_H = 200
const QUICK_INSERT_GAP = 4

const quickInsertPopoverOpen = ref(false)
const quickInsertSelectedField = ref('firstName')
const quickInsertTriggerRef = ref(/** @type {HTMLElement | null} */ (null))
const quickInsertPanelRef = ref(/** @type {HTMLElement | null} */ (null))
const quickInsertPopoverStyle = ref(
  /** @type {Record<string, string>} */ ({ top: '0px', left: '0px' })
)

function closeEmojiPicker() {
  emojiOpen.value = false
}

/**
 * @param {DOMRect} r
 */
function positionEmojiPickerFromTriggerRect(r) {
  const pad = 8
  const topUnder = r.bottom + EMOJI_PICKER_GAP
  const fitsBelow = topUnder + EMOJI_PICKER_EST_H <= window.innerHeight - pad

  let top
  if (fitsBelow) {
    top = topUnder
  } else {
    const topAbove = r.top - EMOJI_PICKER_EST_H - EMOJI_PICKER_GAP
    const fitsAbove = topAbove >= pad
    if (fitsAbove) {
      top = topAbove
    } else {
      // Very short viewport: keep flush under the icon, clamp so the panel stays on-screen
      top = Math.max(
        pad,
        Math.min(topUnder, window.innerHeight - pad - EMOJI_PICKER_EST_H)
      )
    }
  }

  // Align panel to emoji pill left edge so it sits under the icon; clamp into viewport
  let left = r.left
  if (left + EMOJI_PICKER_W > window.innerWidth - pad) {
    left = window.innerWidth - pad - EMOJI_PICKER_W
  }
  if (left < pad) left = pad

  emojiPopoverTop.value = top
  emojiPopoverLeft.value = left
}

function positionEmojiPickerPanel() {
  const el = emojiMenuTriggerRef.value
  if (!el || typeof el.getBoundingClientRect !== 'function') return
  positionEmojiPickerFromTriggerRect(el.getBoundingClientRect())
}

/**
 * @param {MouseEvent} e
 */
function openSmsEmojiPicker(e) {
  e.stopPropagation()
  if (emojiOpen.value) {
    closeEmojiPicker()
    return
  }
  closeImageAttachmentMenu()
  closeAiImagePromptPanel()
  closeQuickInsertPopover()
  const el = e.currentTarget
  if (!el || !(el instanceof HTMLElement)) return
  positionEmojiPickerFromTriggerRect(el.getBoundingClientRect())
  emojiOpen.value = true
}

watch(emojiOpen, (open) => {
  if (open) {
    void nextTick(() => {
      positionEmojiPickerPanel()
    })
    window.addEventListener('resize', positionEmojiPickerPanel)
    window.addEventListener('scroll', positionEmojiPickerPanel, true)
  } else {
    window.removeEventListener('resize', positionEmojiPickerPanel)
    window.removeEventListener('scroll', positionEmojiPickerPanel, true)
  }
})

function detachQuickInsertOutsideListener() {
  window.removeEventListener('click', onQuickInsertOutsideClick, true)
}

function closeQuickInsertPopover() {
  quickInsertPopoverOpen.value = false
  detachQuickInsertOutsideListener()
}

function attachQuickInsertOutsideListener() {
  detachQuickInsertOutsideListener()
  requestAnimationFrame(() => {
    window.addEventListener('click', onQuickInsertOutsideClick, true)
  })
}

/**
 * @param {DOMRect} r
 */
function positionQuickInsertFromTriggerRect(r) {
  const pad = 8
  const topUnder = r.bottom + QUICK_INSERT_GAP
  const fitsBelow =
    topUnder + QUICK_INSERT_PANEL_EST_H <= window.innerHeight - pad

  let top
  if (fitsBelow) {
    top = topUnder
  } else {
    const topAbove = r.top - QUICK_INSERT_PANEL_EST_H - QUICK_INSERT_GAP
    const fitsAbove = topAbove >= pad
    if (fitsAbove) {
      top = topAbove
    } else {
      top = Math.max(
        pad,
        Math.min(topUnder, window.innerHeight - pad - QUICK_INSERT_PANEL_EST_H)
      )
    }
  }

  let left = r.right - QUICK_INSERT_PANEL_W
  if (left < pad) left = pad
  if (left + QUICK_INSERT_PANEL_W > window.innerWidth - pad) {
    left = window.innerWidth - pad - QUICK_INSERT_PANEL_W
  }

  quickInsertPopoverStyle.value = {
    top: `${top}px`,
    left: `${left}px`,
  }
}

function positionQuickInsertPanel() {
  const el = quickInsertTriggerRef.value
  if (!el || typeof el.getBoundingClientRect !== 'function') return
  positionQuickInsertFromTriggerRect(el.getBoundingClientRect())
}

function toggleQuickInsertPopover(/** @type {MouseEvent} */ e) {
  e.stopPropagation()
  if (quickInsertPopoverOpen.value) {
    closeQuickInsertPopover()
    return
  }
  closeImageAttachmentMenu()
  closeEmojiPicker()
  closeAiImagePromptPanel()
  const el = e.currentTarget
  if (!el || !(el instanceof HTMLElement)) return
  quickInsertSelectedField.value = 'firstName'
  positionQuickInsertFromTriggerRect(el.getBoundingClientRect())
  quickInsertPopoverOpen.value = true
  void nextTick(() => {
    attachQuickInsertOutsideListener()
  })
}

/**
 * @param {MouseEvent} e
 */
function onQuickInsertOutsideClick(e) {
  const t = /** @type {Node | null} */ (e.target)
  if (!t) return
  if (quickInsertTriggerRef.value?.contains(t)) return
  if (quickInsertPanelRef.value?.contains(t)) return
  closeQuickInsertPopover()
}

watch(quickInsertPopoverOpen, (open) => {
  if (open) {
    void nextTick(() => {
      positionQuickInsertPanel()
    })
    window.addEventListener('resize', positionQuickInsertPanel)
    window.addEventListener('scroll', positionQuickInsertPanel, true)
  } else {
    window.removeEventListener('resize', positionQuickInsertPanel)
    window.removeEventListener('scroll', positionQuickInsertPanel, true)
  }
})

function onQuickInsertCancel() {
  quickInsertSelectedField.value = 'firstName'
  closeQuickInsertPopover()
}

function onQuickInsertSave() {
  const field = quickInsertSelectedField.value
  const opt = smsMergeFieldOptions.find((o) => o.value === field)
  const token = opt?.token ?? ''
  if (token) insertAtMessageCursor(token)
  quickInsertSelectedField.value = 'firstName'
  closeQuickInsertPopover()
}

/**
 * @param {string} text
 */
function insertAtMessageCursor(text) {
  const el = messageTextareaRef.value
  const current = messageText.value ?? ''
  if (!el) {
    messageText.value = current + text
    return
  }
  const start = el.selectionStart ?? current.length
  const end = el.selectionEnd ?? current.length
  messageText.value = current.slice(0, start) + text + current.slice(end)
  const pos = start + text.length
  void nextTick(() => {
    el.focus()
    el.setSelectionRange(pos, pos)
  })
}

/**
 * @param {string} ch
 */
function onSmsEmojiPicked(ch) {
  insertAtMessageCursor(ch)
}

function detachImageMenuOutsideListener() {
  window.removeEventListener('click', onImageMenuOutsideClick, true)
}

function closeImageAttachmentMenu() {
  imageAttachmentMenuOpen.value = false
  detachImageMenuOutsideListener()
}

function attachImageMenuOutsideListener() {
  detachImageMenuOutsideListener()
  requestAnimationFrame(() => {
    window.addEventListener('click', onImageMenuOutsideClick, true)
  })
}

function positionImageAttachmentMenu() {
  const el = imageMenuTriggerRef.value
  if (!el || typeof el.getBoundingClientRect !== 'function') return
  const r = el.getBoundingClientRect()
  const menuEl = imageAttachmentMenuRef.value
  let menuW = IMAGE_MENU_W
  if (menuEl && typeof menuEl.getBoundingClientRect === 'function') {
    const w = menuEl.getBoundingClientRect().width
    if (w > 0) menuW = w
  }
  const triggerCenterX = r.left + r.width / 2
  let left = triggerCenterX - menuW / 2
  const top = r.bottom + 8
  if (left < 8) left = 8
  if (left + menuW > window.innerWidth - 8) {
    left = Math.max(8, window.innerWidth - 8 - menuW)
  }
  imageAttachmentMenuStyle.value = {
    top: `${top}px`,
    left: `${left}px`,
  }
}

function toggleImageAttachmentMenu() {
  if (imageAttachmentMenuOpen.value) {
    closeImageAttachmentMenu()
    return
  }
  closeEmojiPicker()
  closeAiImagePromptPanel()
  closeQuickInsertPopover()
  imageAttachmentMenuOpen.value = true
  void nextTick(() => {
    positionImageAttachmentMenu()
    attachImageMenuOutsideListener()
  })
}

/**
 * @param {MouseEvent} e
 */
function onImageMenuOutsideClick(e) {
  const t = /** @type {Node | null} */ (e.target)
  if (!t) return
  if (imageMenuTriggerRef.value?.contains(t)) return
  if (imageAttachmentMenuRef.value?.contains(t)) return
  closeImageAttachmentMenu()
}

watch(imageAttachmentMenuOpen, (open) => {
  if (open) {
    void nextTick(() => {
      positionImageAttachmentMenu()
    })
    window.addEventListener('resize', positionImageAttachmentMenu)
    window.addEventListener('scroll', positionImageAttachmentMenu, true)
  } else {
    window.removeEventListener('resize', positionImageAttachmentMenu)
    window.removeEventListener('scroll', positionImageAttachmentMenu, true)
  }
})

function detachAiPromptOutsideListener() {
  window.removeEventListener('click', onAiPromptOutsideClick, true)
}

function closeAiImagePromptPanel() {
  aiImagePromptOpen.value = false
  detachAiPromptOutsideListener()
}

function attachAiPromptOutsideListener() {
  detachAiPromptOutsideListener()
  requestAnimationFrame(() => {
    window.addEventListener('click', onAiPromptOutsideClick, true)
  })
}

function positionAiImagePromptPanel() {
  const el = imageMenuTriggerRef.value
  if (!el || typeof el.getBoundingClientRect !== 'function') return
  const r = el.getBoundingClientRect()
  const panelEl = aiImagePromptPanelRef.value
  let panelW = AI_IMAGE_PROMPT_PANEL_W
  if (panelEl && typeof panelEl.getBoundingClientRect === 'function') {
    const w = panelEl.getBoundingClientRect().width
    if (w > 0) panelW = w
  }
  const triggerCenterX = r.left + r.width / 2
  let left = triggerCenterX - panelW / 2
  const top = r.bottom + 8
  if (left < 12) left = 12
  if (left + panelW > window.innerWidth - 12) {
    left = Math.max(12, window.innerWidth - 12 - panelW)
  }
  aiImagePromptPanelStyle.value = {
    top: `${top}px`,
    left: `${left}px`,
  }
}

/**
 * @param {MouseEvent} e
 */
function onAiPromptOutsideClick(e) {
  const t = /** @type {Node | null} */ (e.target)
  if (!t) return
  if (imageMenuTriggerRef.value?.contains(t)) return
  if (emojiMenuTriggerRef.value?.contains(t)) return
  if (quickInsertTriggerRef.value?.contains(t)) return
  if (quickInsertPanelRef.value?.contains(t)) return
  if (aiImagePromptPanelRef.value?.contains(t)) return
  aiImagePrompt.value = ''
  closeAiImagePromptPanel()
}

watch(aiImagePromptOpen, (open) => {
  if (open) {
    void nextTick(() => {
      positionAiImagePromptPanel()
      aiImagePromptTextareaRef.value?.focus?.()
    })
    window.addEventListener('resize', positionAiImagePromptPanel)
    window.addEventListener('scroll', positionAiImagePromptPanel, true)
  } else {
    window.removeEventListener('resize', positionAiImagePromptPanel)
    window.removeEventListener('scroll', positionAiImagePromptPanel, true)
  }
})

function revokeSmsPreviewImage() {
  const u = smsPreviewImageUrl.value
  if (u && u.startsWith('blob:')) {
    URL.revokeObjectURL(u)
  }
  smsPreviewImageUrl.value = null
  smsPreviewImageAlt.value = ''
}

function onUploadFileModalSave(/** @type {File} */ file) {
  revokeSmsPreviewImage()
  smsPreviewImageUrl.value = URL.createObjectURL(file)
  smsPreviewImageAlt.value = file.name || 'Attached image'
}

/**
 * @param {{ phones: string[]; saveAsDefault: boolean }} payload
 */
function onSendSmsModalSend(payload) {
  void payload
  // Hook: send test SMS API with payload.phones, payload.saveAsDefault
}

/**
 * @param {{ sendTimeType: string; scheduledDate: Date; scheduledTime: string }} payload
 */
function onSendSmsModalSchedule(payload) {
  void payload
  // Hook: schedule SMS campaign API
}

function onSendSmsModalSendNow() {
  // Hook: send SMS campaign immediately API
}

function onGenerateImage() {
  closeImageAttachmentMenu()
  closeEmojiPicker()
  closeQuickInsertPopover()
  aiImagePrompt.value = ''
  aiImagePromptOpen.value = true
  void nextTick(() => {
    attachAiPromptOutsideListener()
  })
}

function onAiImagePromptCancel() {
  aiImagePrompt.value = ''
  closeAiImagePromptPanel()
}

function onAiImagePromptSubmit() {
  const prompt = aiImagePromptTrimmed.value
  if (!prompt) return
  closeAiImagePromptPanel()
  aiImagePrompt.value = ''
  // Hook: call AI image generation API with `prompt`
}

function onUploadImageClick() {
  closeImageAttachmentMenu()
  closeAiImagePromptPanel()
  closeEmojiPicker()
  closeQuickInsertPopover()
  uploadFileModalOpen.value = true
}

onUnmounted(() => {
  closeImageAttachmentMenu()
  closeAiImagePromptPanel()
  closeEmojiPicker()
  closeQuickInsertPopover()
  revokeSmsPreviewImage()
  window.removeEventListener('resize', positionImageAttachmentMenu)
  window.removeEventListener('scroll', positionImageAttachmentMenu, true)
  window.removeEventListener('resize', positionAiImagePromptPanel)
  window.removeEventListener('scroll', positionAiImagePromptPanel, true)
  window.removeEventListener('resize', positionEmojiPickerPanel)
  window.removeEventListener('scroll', positionEmojiPickerPanel, true)
  window.removeEventListener('resize', positionQuickInsertPanel)
  window.removeEventListener('scroll', positionQuickInsertPanel, true)
})

const URL_SPLIT = /(https?:\/\/[^\s]+)/gi

const previewChunks = computed(() => {
  const text = messageText.value ?? ''
  if (!text) return []
  const parts = text.split(URL_SPLIT).filter((p) => p !== '')
  return parts.map((t) => ({
    t,
    isLink: /^https?:\/\//i.test(t),
  }))
})

const messageCharCount = computed(() => (messageText.value ?? '').length)

const hasMessageContent = computed(
  () => (messageText.value ?? '').trim().length > 0
)

const headerTitle = computed(() => {
  const d = new Date()
  const formatted = d.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
  return `Text message - ${formatted}`
})
</script>

<style scoped>
.sms-phone-screen {
  top: 11.5%;
  right: 5.75%;
  bottom: 2.75%;
  left: 5.75%;
}

.icon-pill {
  @apply inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-black-25 text-gray-500 transition-colors hover:bg-info-50;
}

.icon-pill--active {
  @apply border-blue-200 ring-1 ring-blue-200 bg-info-50 text-gray-600;
}
</style>
