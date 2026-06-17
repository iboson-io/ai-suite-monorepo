<template>
  <div class="w-full">
    <!-- User message bubble aligned to right -->
    <div v-if="message.text" class="flex justify-end w-full">
      <div class="max-w-[85%] rounded-2xl border primary_border_color bg_secondary_color px-5xl py-xl">
        <p class="Body_2_regular primary_text_color text-left">{{ message.text }}</p>
      </div>
    </div>

    <!-- AI response alignment aligned to left with Agent icon -->
    <div v-if="message.isLoading || message.aiResponse" class="mt-xl flex items-start gap-3 w-full">
      <img
        :src="AgentChatIcon"
        alt=""
        class="h-8 w-8 shrink-0 rounded-full"
        aria-hidden="true"
      />

      <div class="min-w-0 flex-1">
        <!-- Loading state -->
        <div v-if="message.isLoading" class="rounded-2xl lg:px-3xl py-xs">
          <p class="primary_text_color body_3_regular text-left">
            Got it, give me a moment<span class="loading-dots" />
          </p>
        </div>

        <!-- AI Response display with copy/like/dislike -->
        <div v-else-if="message.aiResponse">
          <div class="flex items-start gap-3 relative">
            <div
              ref="markdownContainerRef"
              class="chat-markdown Body_2_regular primary_text_color lg:px-3xl pt-sm pb-md text-left flex-1 min-w-0"
              v-html="formatMarkdownToHtml(message.aiResponse)"
            />

            <!-- Excel Download option -->
            <div v-if="messageHasTable(message.aiResponse)" class="group/excel relative mt-sm mr-4xl shrink-0">
              <button
                type="button"
                class="flex items-center justify-center w-8 h-8 rounded-lg cursor-pointer bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                @click="downloadTableAsExcel"
               
              >
                <svg
                  class="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  aria-hidden="true"
                >
                  <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
              </button>
              <span
                role="tooltip"
                class="pointer-events-none absolute top-full right-0 z-10 mt-sm hidden whitespace-nowrap rounded-lg bg-black-400 px-md py-xs caption_1_medium primary_2_text_color shadow-md group-hover/excel:block"
              >
                Download Excel
              </span>
            </div>
          </div>

          <div class="flex items-center gap-sm mt-4xl lg:px-3xl">
            <ChatActionBar
              :is-liked="message.isLiked"
              :is-disliked="message.isDisliked"
              :padded="false"
              compact-icons
              show-regenerate
              class="!mt-0"
              @copy="handleCopy"
              @like="$emit('like', index)"
              @dislike="$emit('dislike', index)"
              @regenerate="$emit('regenerate', index)"
            />

            <div v-if="message.audio" class="group/audio relative">
              <button
                type="button"
                class="flex items-center justify-center w-4xl h-4xl cursor-pointer action_icon_color"
                @click="$emit('toggle-audio', message.audio, index)"
                title="Play/Pause Voice"
              >
                <svg
                  v-if="playingMessageIndex !== index"
                  class="w-4xl h-4xl"
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="1.5"
                  aria-hidden="true"
                >
                  <path d="M5 3.5l7 4.5-7 4.5v-9z" />
                </svg>
                <svg
                  v-else
                  class="w-4xl h-4xl"
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="1.5"
                  aria-hidden="true"
                >
                  <path d="M5 3.5h2v9H5v-9zM9 3.5h2v9H9v-9z" />
                </svg>
              </button>
              <span
                role="tooltip"
                class="pointer-events-none absolute bottom-full left-1/2 z-10 mb-sm hidden -translate-x-1/2 whitespace-nowrap rounded-lg bg-black-400 px-md py-xs caption_1_medium primary_2_text_color shadow-md group-hover/audio:block"
              >
                {{ playingMessageIndex !== index ? 'Play Voice' : 'Pause Voice' }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ChatActionBar } from '@ai-suite/shared-ui'
import { formatMarkdownToHtml } from '../../../utils/formatMarkdownToHtml.js'
import AgentChatIcon from '../../../assets/images/agents/dashboard/chatIcon.svg'

const props = defineProps({
  message: {
    type: Object,
    required: true,
  },
  index: {
    type: Number,
    required: true,
  },
  playingMessageIndex: {
    type: Number,
    default: -1,
  },
  chatId: {
    type: [String, Number],
    default: null,
  },
})

const emit = defineEmits(['like', 'dislike', 'regenerate', 'toggle-audio', 'toast'])

const markdownContainerRef = ref(null)

const messageHasTable = (content) => {
  if (!content) return false
  const markdownTablePattern = /(?:\|[^\n]*\|)(?:\r?\n\|[^\n]*\|)+/
  return markdownTablePattern.test(content) || content.includes('<table')
}

const downloadTableAsExcel = () => {
  const container = markdownContainerRef.value
  if (!container) {
    emit('toast', 'Error', 'Unable to locate table content to download', 'error')
    return
  }

  const tables = container.querySelectorAll('table')
  if (!tables.length) {
    emit('toast', 'Error', 'No table data available for download', 'error')
    return
  }

  const tableHtml = Array.from(tables).map((table, idx) => {
    const clonedTable = table.cloneNode(true)
    return `<div style="margin-bottom:16px;"><h3>Table ${idx + 1}</h3>${clonedTable.outerHTML}</div>`
  }).join('')

  const excelHtml = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office"
          xmlns:x="urn:schemas-microsoft-com:office:excel"
          xmlns="http://www.w3.org/TR/REC-html40">
    <head>
        <!--[if gte mso 9]>
        <xml>
            <x:ExcelWorkbook>
                <x:ExcelWorksheets>
                    <x:ExcelWorksheet>
                        <x:Name>Agent Table</x:Name>
                        <x:WorksheetOptions>
                            <x:DisplayGridlines/>
                        </x:WorksheetOptions>
                    </x:ExcelWorksheet>
                </x:ExcelWorksheets>
            </x:ExcelWorkbook>
        </xml>
        <![endif]-->
        <meta charset="UTF-8">
    </head>
    <body>
        ${tableHtml}
    </body>
    </html>
  `

  const blob = new Blob([excelHtml], { type: 'application/vnd.ms-excel' })
  const downloadUrl = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = downloadUrl
  link.download = `agent-response-${props.chatId || Date.now()}.xls`

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(downloadUrl)

  emit('toast', 'Success', 'Table downloaded as Excel', 'success')
}

async function handleCopy() {
  const text = props.message.aiResponse
  if (!text) return

  try {
    await navigator.clipboard.writeText(text)
  } catch {
    const textArea = document.createElement('textarea')
    textArea.value = text
    textArea.style.position = 'fixed'
    textArea.style.left = '-9999px'
    document.body.appendChild(textArea)
    textArea.select()
    document.execCommand('copy')
    document.body.removeChild(textArea)
  }
}
</script>

<style scoped>
.chat-markdown :deep(p) {
  margin: 0 0 0.75em;
}

.chat-markdown :deep(p:last-child) {
  margin-bottom: 0;
}

.chat-markdown :deep(h1),
.chat-markdown :deep(h2),
.chat-markdown :deep(h3),
.chat-markdown :deep(h4),
.chat-markdown :deep(h5),
.chat-markdown :deep(h6) {
  font-weight: 600;
  margin: 1em 0 0.5em;
}

.chat-markdown :deep(h1) {
  font-size: 1.375em;
}

.chat-markdown :deep(h2) {
  font-size: 1.25em;
}

.chat-markdown :deep(h3) {
  font-size: 1.125em;
}

.chat-markdown :deep(ul),
.chat-markdown :deep(ol) {
  margin: 0.5em 0 0.75em;
  padding-left: 1.5em;
}

.chat-markdown :deep(li + li) {
  margin-top: 0.25em;
}

.chat-markdown :deep(blockquote) {
  margin: 0.75em 0;
  padding-left: 1em;
  border-left: 3px solid rgb(209 213 219);
}

.chat-markdown :deep(code) {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 0.875em;
  padding: 0.125em 0.375em;
  border-radius: 0.25rem;
  background: rgb(243 244 246);
}

.chat-markdown :deep(pre) {
  margin: 0.75em 0;
  padding: 0.75em 1em;
  overflow-x: auto;
  border-radius: 0.5rem;
  background: rgb(243 244 246);
}

.chat-markdown :deep(pre code) {
  padding: 0;
  background: transparent;
}

.chat-markdown :deep(.table-container) {
  width: 100%;
  overflow-x: auto;
  border: 1px solid rgb(229 231 235);
  border-radius: 12px;
  margin: 1.5rem 0;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.05);
}

.chat-markdown :deep(table) {
  display: table;
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
  background-color: #ffffff;
}

.chat-markdown :deep(th),
.chat-markdown :deep(td) {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid rgb(229 231 235);
  text-align: left;
  vertical-align: middle;
}

.chat-markdown :deep(th) {
  font-weight: 600;
  background-color: rgb(248 250 252);
  color: rgb(71 85 105);
  border-bottom: 2px solid rgb(229 231 235);
  white-space: nowrap;
}

.chat-markdown :deep(tr:last-child td) {
  border-bottom: none;
}

.chat-markdown :deep(tr:nth-child(even)) {
  background-color: rgb(250 250 250);
}

.chat-markdown :deep(tr:hover) {
  background-color: rgb(241 245 249);
}

.chat-markdown :deep(hr) {
  margin: 1em 0;
  border: 0;
  border-top: 1px solid rgb(229 231 235);
}

.chat-markdown :deep(a) {
  color: rgb(37 99 235);
  text-decoration: underline;
}

.chat-markdown :deep(a:hover) {
  color: rgb(29 78 216);
}

.chat-markdown :deep(img) {
  max-width: 100%;
  height: auto;
  margin: 0.5em 0;
  border-radius: 0.5rem;
}

.loading-dots::after {
  content: '';
  animation: dots 1.5s steps(4, end) infinite;
}

@keyframes dots {
  0%,
  20% {
    content: '';
  }
  40% {
    content: '.';
  }
  60% {
    content: '..';
  }
  80%,
  100% {
    content: '...';
  }
}
</style>
