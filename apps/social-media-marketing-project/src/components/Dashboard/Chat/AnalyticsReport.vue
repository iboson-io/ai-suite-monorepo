<template>
  <div class="lg:px-3xl pt-3xl pb-md">
    <div
      class="Body_2_regular primary_text_color pb-4 [&_a]:text-[#2563EB] [&_a]:underline [&_strong]:font-semibold"
      v-html="formatAnalyticsReportNarrative(message.aiResponse)"
    />
    <div
      v-if="message.typeData?.analyticsHtml"
      class="analytics-report-panel mb-4 max-w-full overflow-x-auto rounded-xl border border-slate-700/40 bg-[#0f172a] p-3 shadow-inner"
    >
      <div
        class="analytics-report-html text-left [&_table]:max-w-none"
        v-html="message.typeData.analyticsHtml"
      />
    </div>

    <div
      v-if="message.suggestedResponses && message.suggestedResponses.length > 0"
      class="mt-1"
      :class="suggestedResponseRowClass"
    >
      <template
        v-for="(suggestion, sIndex) in message.suggestedResponses"
        :key="sIndex"
      >
        <a
          v-if="suggestion.url"
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
})

defineEmits(['suggested-response', 'copy', 'like', 'dislike'])

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

const escapeHtmlForNarrative = (str) =>
  String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

/** Analytics report API `message` text: **bold**, `* ` bullets, paragraphs — safe HTML for v-html. */
const formatAnalyticsReportNarrative = (raw) => {
  if (raw == null || raw === '') return ''
  let text = escapeHtmlForNarrative(String(raw))
  text = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
  const blocks = text.split(/\n\n+/)
  return blocks
    .map((block) => {
      const lines = block.split(/\n/)
      const trimmed = lines.map((l) => l.trim())
      const nonEmpty = trimmed.filter((l) => l.length > 0)
      if (nonEmpty.length > 0 && nonEmpty.every((l) => l.startsWith('* '))) {
        const items = nonEmpty.map((l) => `<li>${l.slice(2)}</li>`).join('')
        return `<ul class="list-disc pl-5 my-2 space-y-1">${items}</ul>`
      }
      const inner = lines.map((l) => (l.trim() === '' ? '<br />' : l)).join('<br />')
      return `<p class="my-2">${inner}</p>`
    })
    .join('')
}
</script>
