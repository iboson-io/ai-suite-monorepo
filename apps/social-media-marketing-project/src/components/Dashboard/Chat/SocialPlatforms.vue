<template>
  <div class="lg:px-3xl pt-3xl pb-md">
    <p
      class="Body_2_regular primary_text_color pb-4 [&_strong]:font-semibold"
      v-html="formatMarkdownToHtml(message.aiResponse)"
    />

    <div
      v-if="message.typeData?.platforms?.length"
      class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 pb-4"
    >
      <template
        v-for="(platform, pIdx) in message.typeData.platforms"
        :key="platform.name || pIdx"
      >
        <button
          v-if="!platform.connected"
          type="button"
          class="flex w-full min-w-0 cursor-pointer items-center gap-3 rounded-xl border border-[#E5E7EB] bg-white p-4xl text-left shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-colors hover:bg-[#F9FAFB]"
          :aria-label="`Connect ${platform.label}`"
          @click="$emit('connect-platform', platform)"
        >
          <img
            :src="platform.icon"
            :alt="platform.label || platform.name || 'Platform'"
            class="h-8 w-8 shrink-0 object-contain"
          />
          <span class="min-w-0 flex-1 truncate label_2_medium primary_text_color">
            {{ platform.label }}
          </span>
          <span
            class="flex h-8 w-8 shrink-0 items-center justify-center text-[#596773]"
            aria-hidden="true"
          >
            <svg
              class="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 5v14M5 12h14"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
              />
            </svg>
          </span>
        </button>
        <div
          v-else
          class="flex w-full min-w-0 items-center gap-3 rounded-xl border border-[#E5E7EB] bg-white p-3 shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
        >
          <img
            :src="platform.icon"
            :alt="platform.label || platform.name || 'Platform'"
            class="h-8 w-8 shrink-0 object-contain"
          />
          <span class="min-w-0 flex-1 truncate label_2_medium primary_text_color">
            {{ platform.label }}
          </span>
          <button
            type="button"
            class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[#1D2125] transition-opacity hover:opacity-80 disabled:pointer-events-none disabled:opacity-40"
            :aria-label="`Disconnect ${platform.label}`"
            :disabled="isPlatformDisconnecting(platform)"
            @click="$emit('disconnect-platform', platform)"
          >
            <svg
              class="disconnect-icon-chat h-6 w-6"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M17 22V20M9 15L15 9M11 6.00031L11.463 5.46431C12.4008 4.52663 13.6727 3.99991 14.9989 4C16.325 4.00009 17.5968 4.527 18.5345 5.46481C19.4722 6.40261 19.9989 7.6745 19.9988 9.00066C19.9987 10.3268 19.4718 11.5986 18.534 12.5363L18 13.0003M13.0001 18L12.6031 18.534C11.6544 19.4722 10.3739 19.9984 9.03964 19.9984C7.70535 19.9984 6.42489 19.4722 5.47614 18.534C5.0085 18.0716 4.63724 17.521 4.38385 16.9141C4.13047 16.3073 4 15.6561 4 14.9985C4 14.3408 4.13047 13.6897 4.38385 13.0829C4.63724 12.476 5.0085 11.9254 5.47614 11.463L6.00014 11M20 17H22M2 7H4M7 2V4"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </button>
        </div>
      </template>
    </div>

    <div
      v-if="message.suggestedResponses && message.suggestedResponses.length > 0"
      :class="suggestedResponseRowClass"
    >
      <template
        v-for="(suggestion, sIndex) in message.suggestedResponses"
        :key="sIndex"
      >
        <router-link
          v-if="suggestion.url && isInternalPath(suggestion.url)"
          :to="suggestion.url"
          :class="suggestedChipLinkClass"
        >
          {{ unescapeHtmlEntities(suggestion.text || suggestion) }}
        </router-link>
        <a
          v-else-if="suggestion.url"
          :href="suggestion.url"
          :class="suggestedChipLinkClass"
        >
          {{ unescapeHtmlEntities(suggestion.text || suggestion) }}
        </a>
        <button
          v-else
          type="button"
          :class="suggestedChipButtonClass"
          :disabled="isAiGenerating"
          @click="$emit('suggested-response', suggestion)"
        >
          {{ unescapeHtmlEntities(suggestion.text || suggestion) }}
        </button>
      </template>
    </div>

    <ChatActionBar
      :is-liked="message.isLiked"
      :is-disliked="message.isDisliked"
      :padded="false"
      compact-icons
      @copy="$emit('copy')"
      @like="$emit('like')"
      @dislike="$emit('dislike')"
    />
  </div>
</template>

<script setup>
import { ChatActionBar } from '@ai-suite/shared-ui'

defineProps({
  message: {
    type: Object,
    required: true,
  },
  isAiGenerating: {
    type: Boolean,
    default: false,
  },
  isPlatformDisconnecting: {
    type: Function,
    default: () => false,
  },
})

defineEmits([
  'connect-platform',
  'disconnect-platform',
  'suggested-response',
  'copy',
  'like',
  'dislike',
])

const suggestedResponseRowClass =
  'max-w-full min-w-0 overflow-x-auto overflow-y-hidden hide-scrollbar flex flex-nowrap gap-2 [-webkit-overflow-scrolling:touch] md:flex-wrap md:overflow-x-visible'
const suggestedChipLinkClass =
  'inline-flex shrink-0 cursor-pointer items-center justify-center whitespace-nowrap rounded-full bg-[#EBF5FF] px-3xl py-xl border border-blue-50 text-blue-300 body_3_medium no-underline transition-colors hover:bg-[#DBEAFE]'
const suggestedChipButtonClass =
  'inline-flex shrink-0 cursor-pointer items-center justify-center whitespace-nowrap rounded-full bg-[#EBF5FF] px-3xl py-xl border border-blue-50 text-blue-300 body_3_medium transition-colors hover:bg-[#DBEAFE] disabled:cursor-not-allowed disabled:opacity-60'

const unescapeHtmlEntities = (text) => {
  if (text == null || text === '') return ''
  const div = document.createElement('div')
  div.innerHTML = text
  return div.textContent || div.innerText || ''
}

const formatMarkdownToHtml = (text) => {
  if (text == null || text === '') return ''

  let html = String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
  html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>')
  html = html.replace(/\n/g, '<br>')

  return html
}

const isInternalPath = (url) =>
  typeof url === 'string' && url.startsWith('/') && !url.startsWith('//')
</script>

<style scoped>
button:hover .disconnect-icon-chat path {
  stroke: #e3665d;
  transition: stroke 0.2s ease-in-out;
}
</style>
