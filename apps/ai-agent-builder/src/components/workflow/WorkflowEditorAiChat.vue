<script setup>
import { ref, watch, computed, nextTick, onMounted, onBeforeUnmount } from 'vue'
import { marked } from 'marked'
import { useAuth } from '@app/composables/useAuth'
import { WORKFLOW_AGENT_WS_URL, WORKFLOW_AGENT_WS_PATH } from '@app/services/constants'
import AgentChatIcon from '../../assets/images/agents/dashboard/chatIcon.svg'
import { ChatActionBar, PromptBox } from '@ai-suite/shared-ui'

marked.setOptions({ breaks: true, gfm: true })

const props = defineProps({
  workflowId: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['submit-prompt', 'ai-response', 'schema-changed', 'back', 'messages-changed'])

const { getToken, user } = useAuth()

const userName = computed(() => {
  const name = user.value?.name || user.value?.username || 'user'
  return name.split(' ')[0]
})



const messages = ref(
  /** @type {{ kind: 'user' | 'assistant' | 'system' | 'error', text: string, raw?: boolean, isLiked?: boolean, isDisliked?: boolean }[]} */ ([])
)
const connected = ref(false)
const connecting = ref(false)
const sending = ref(false)

/** @type {WebSocket | null} */
let ws = null
let reconnectAttempts = 0
const maxReconnects = 5
/** @type {ReturnType<typeof setTimeout> | null} */
let reconnectTimer = null
/** @type {ReturnType<typeof setTimeout> | null} */
let syncDebounce = null

const messagesBodyRef = ref(null)
const scrollAnchor = ref(null)
/** @type {import('vue').Ref<any | null>} */
const promptInputRef = ref(null)

const hasMessages = computed(() => messages.value.length > 0)
const isLoading = computed(() => sending.value)
const isPromptDisabled = computed(() => sending.value || !connected.value)

function focusPromptInput() {
  nextTick(() => {
    if (promptInputRef.value?.focus) {
      promptInputRef.value.focus()
    }
  })
}

function chatStorageKey() {
  return `workflow_agent_chat_id:${props.workflowId}`
}

function getStoredChatId() {
  if (typeof sessionStorage === 'undefined') return null
  try {
    return sessionStorage.getItem(chatStorageKey())
  } catch {
    return null
  }
}

function storeChatId(id) {
  if (typeof sessionStorage === 'undefined' || !id) return
  try {
    sessionStorage.setItem(chatStorageKey(), id)
    currentChatId.value = id
  } catch {
    /* ignore */
  }
}

function clearStoredChatId() {
  if (typeof sessionStorage === 'undefined') return
  try {
    sessionStorage.removeItem(chatStorageKey())
    currentChatId.value = null
  } catch {
    /* ignore */
  }
}

const currentChatId = ref(getStoredChatId())
const hasChatSession = computed(() => {
  return messages.value.length > 0 || !!currentChatId.value
})

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function renderMarkdown(content) {
  const s = String(content || '')
  if (/[*`#\[\|<]/.test(s)) return marked.parse(s)
  return escapeHtml(s).replace(/\n/g, '<br>')
}

async function scrollToBottom() {
  await nextTick()
  scrollAnchor.value?.scrollIntoView({ behavior: 'smooth', block: 'end' })
}

function append(kind, text, raw = false) {
  messages.value = [...messages.value, { kind, text, raw, isLiked: false, isDisliked: false }]
  scrollToBottom()
}

function buildWsUrl(token, chatId) {
  const base = String(WORKFLOW_AGENT_WS_URL || '').replace(/\/$/, '')
  const wp = WORKFLOW_AGENT_WS_PATH.startsWith('/') ? WORKFLOW_AGENT_WS_PATH : `/${WORKFLOW_AGENT_WS_PATH}`
  let url = `${base}${wp}/${encodeURIComponent(props.workflowId)}?token=${encodeURIComponent(token)}`
  if (chatId) url += `&chat_id=${encodeURIComponent(chatId)}`
  return url
}

function cleanupSocket() {
  if (reconnectTimer) {
    clearTimeout(reconnectTimer)
    reconnectTimer = null
  }
  if (!ws) return
  try {
    ws.onopen = null
    ws.onmessage = null
    ws.onclose = null
    ws.onerror = null
    ws.close(1000, 'Client disconnect')
  } catch {
    /* ignore */
  }
  ws = null
}

function disconnect() {
  reconnectAttempts = maxReconnects
  cleanupSocket()
  connected.value = false
  connecting.value = false
}

function connect() {
  if (typeof WebSocket === 'undefined') return

  const token = getToken()
  if (!token) {
    append('error', 'Sign in is required to use the workflow assistant.')
    connected.value = false
    return
  }

  cleanupSocket()
  connecting.value = true
  connected.value = false

  const chatId = getStoredChatId()
  const url = buildWsUrl(token, chatId)

  try {
    ws = new WebSocket(url)
  } catch (e) {
    connecting.value = false
    append('error', `Could not open WebSocket: ${e?.message || e}`)
    return
  }

  ws.onopen = () => {
    connecting.value = false
  }

  ws.onmessage = (event) => {
    let data
    try {
      data = JSON.parse(event.data)
    } catch {
      append('system', String(event.data || ''))
      sending.value = false
      return
    }

    if (data.type === 'connected') {
      connected.value = true
      reconnectAttempts = 0
      if (data.chat_id) storeChatId(data.chat_id)
      sending.value = false
      return
    }

    if (data.type === 'workflow_sync') {
      append('system', 'Workflow updated.')
      return
    }

    if (data.type === 'response') {
      sending.value = false
      const msg = data.message ?? ''
      append('assistant', msg, true)
      emit('ai-response', {
        text: msg,
        workflowId: props.workflowId,
        action: data.action,
        schemaChanged: !!data.schema_changed,
        schema: data.schema
      })
      if (data.schema_changed && data.schema != null) {
        emit('schema-changed', { schema: data.schema })
      }
      return
    }

    if (data.type === 'error') {
      sending.value = false
      const reason = data.error_reason ? ` ${data.error_reason}` : ''
      append('error', `${data.message || 'Error'}${reason}`)
      return
    }

    sending.value = false
    append('system', data.message || JSON.stringify(data))
  }

  ws.onclose = (evt) => {
    connected.value = false
    connecting.value = false
    sending.value = false
    if (evt.code !== 1000) {
      append('system', 'Connection lost. Reconnecting if possible…')
    }

    if (evt.code !== 1000 && reconnectAttempts < maxReconnects) {
      reconnectAttempts += 1
      reconnectTimer = setTimeout(() => {
        reconnectTimer = null
        connect()
      }, 2800)
      append('system', `Still trying to connect… (${reconnectAttempts}/${maxReconnects})`)
    }
  }

  ws.onerror = () => {
    connecting.value = false
    sending.value = false
    append('error', 'Could not reach the assistant. Check that the service is running and you are signed in.')
  }
}

function sendPromptText(text) {
  if (!ws || ws.readyState !== WebSocket.OPEN || sending.value) return false
  const trimmed = String(text || '').trim()
  if (!trimmed) return false

  ws.send(JSON.stringify({ message: trimmed }))
  sending.value = true
  emit('submit-prompt', { text: trimmed, workflowId: props.workflowId })
  return true
}

function handlePromptBoxSend(messageData) {
  const text = String(messageData?.text || '').trim()
  if (!text || sending.value || !connected.value) return

  append('user', text)

  if (!sendPromptText(text)) {
    sending.value = false
    append('error', 'Not connected — wait for connection or click Reconnect.')
  }
}

function newChat() {
  clearStoredChatId()
  messages.value = []
  reconnectAttempts = 0
  cleanupSocket()
  connect()
}

function reconnectManual() {
  reconnectAttempts = 0
  cleanupSocket()
  connect()
}

/** Called after the workflow editor saves — refreshes assistant-side workflow snapshot on the server. */
function notifyWorkflowSaved() {
  if (!connected.value || !ws || ws.readyState !== WebSocket.OPEN) return
  if (syncDebounce) clearTimeout(syncDebounce)
  syncDebounce = setTimeout(() => {
    syncDebounce = null
    try {
      if (ws?.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ sync_workflow: true }))
      }
    } catch {
      /* ignore */
    }
  }, 650)
}



watch(
  () => props.workflowId,
  () => {
    messages.value = []
    reconnectAttempts = 0
    currentChatId.value = getStoredChatId()
    cleanupSocket()
    connect()
  }
)

watch(
  messages,
  (newVal) => {
    emit('messages-changed', newVal)
  },
  { deep: true, immediate: true }
)

async function handleCopy(text) {
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

function toggleChatReaction(index, type) {
  const message = messages.value[index]
  if (!message) return

  if (type === 'like') {
    message.isLiked = !message.isLiked
    if (message.isLiked) message.isDisliked = false
    return
  }

  message.isDisliked = !message.isDisliked
  if (message.isDisliked) message.isLiked = false
}

function handleRegenerate(index) {
  // Find the user message that preceded this assistant response
  let userText = null
  for (let i = index - 1; i >= 0; i--) {
    if (messages.value[i]?.kind === 'user') {
      userText = messages.value[i].text
      break
    }
  }
  if (!userText || sending.value || !connected.value) return

  // Append as a brand-new user message (keeps existing history)
  append('user', userText)

  if (!sendPromptText(userText)) {
    sending.value = false
    append('error', 'Not connected — wait for connection or click Reconnect.')
  }
}

onMounted(() => {
  connect()
})

onBeforeUnmount(() => {
  if (syncDebounce) clearTimeout(syncDebounce)
  disconnect()
})

const statusLabel = computed(() => {
  if (connecting.value) return 'Connecting…'
  if (connected.value) return 'Connected'
  return 'Disconnected'
})

const statusDotClass = computed(() => {
  if (connected.value) return 'bg-info-500'
  if (connecting.value) return 'bg-amber-400 animate-pulse'
  return 'bg-error-600'
})

defineExpose({
  notifyWorkflowSaved,
  reconnect: reconnectManual,
  newChat,
  connected,
  connecting,
  statusLabel,
  statusDotClass
})
</script>

<template>
  <aside
    class="workflow-agent-chat relative flex min-h-[220px] flex-col overflow-visible bg_secondary_color lg:h-full lg:min-h-0"
    aria-label="Workflow assistant chat"
  >
    <div
      ref="messagesBodyRef"
      class="custom_scrollbar min-h-0 flex-1 overflow-y-auto px-6xl py-6xl"
      :class="[
        { 'flex flex-col justify-center': !hasMessages },
        hasMessages ? 'pb-56' : '',
      ]"
    >
      <div
        class="mx-auto flex w-full max-w-md flex-col"
        :class="hasMessages ? 'gap-6' : 'items-center justify-center text-center py-8'"
      >
        <template v-if="!hasMessages">
          <h1 class="primary_text_color heading_h5_semibold md:heading_h4_semibold">
            Chat with your workflow
          </h1>
          <p class="mt-md heading_h3_semibold md:heading_h3_semibold gradient_text_color">
            Automate support and resolve issues
          </p>

          <div class="mt-5 w-full overflow-visible">
            <PromptBox
              ref="promptInputRef"
              :is-ai-generating="isPromptDisabled"
              :disable-product-select="true"
              :hide-product-select="true"
              :hide-files="true"
              placeholder="Describe what you want to automate today"
              class="mt-0 w-full max-w-none"
              @send-message="handlePromptBoxSend"
            />
          </div>
        </template>

        <template v-else>
          <template v-for="(m, i) in messages" :key="i">
            <div v-if="m.kind === 'user'" class="flex justify-end">
              <div class="max-w-[85%] rounded-2xl border primary_border_color bg_secondary_color px-5xl py-xl">
                <p class="Body_2_regular primary_text_color">{{ m.text }}</p>
              </div>
            </div>
            <div v-else-if="m.kind === 'assistant'" class="flex items-start gap-3">
              <img
                :src="AgentChatIcon"
                alt=""
                class="h-8 w-8 shrink-0 rounded-full"
                aria-hidden="true"
              />
              <div class="min-w-0 flex-1">
                <div
                  class="chat-markdown Body_2_regular primary_text_color lg:px-3xl pt-sm pb-md"
                  v-html="renderMarkdown(m.text)"
                />
                <ChatActionBar
                  :is-liked="m.isLiked"
                  :is-disliked="m.isDisliked"
                  :padded="false"
                  compact-icons
                  show-regenerate
                  class="lg:px-3xl"
                  @copy="handleCopy(m.text)"
                  @like="toggleChatReaction(i, 'like')"
                  @dislike="toggleChatReaction(i, 'dislike')"
                  @regenerate="handleRegenerate(i)"
                />
              </div>
            </div>
            <div v-else class="flex justify-center">
              <div
                class="max-w-[95%] rounded-lg px-2.5 py-1.5 text-center label_3_regular"
                :class="
                  m.kind === 'error'
                    ? 'border error_border_color bg-error-50 text-error-600'
                    : 'border primary_border_color bg-info-50 secondary_text_color'
                "
              >
                {{ m.text }}
              </div>
            </div>
          </template>

          <div v-if="isLoading" class="flex items-start gap-3">
            <img
              :src="AgentChatIcon"
              alt=""
              class="h-8 w-8 shrink-0 rounded-full"
              aria-hidden="true"
            />
            <div class="min-w-0 flex-1">
              <div class="rounded-2xl py-xs">
                <p class="primary_text_color body_3_regular">
                  Got it, give me a moment<span class="loading-dots" />
                </p>
              </div>
            </div>
          </div>

          <div ref="scrollAnchor" class="h-64 md:h-56" />
        </template>
      </div>
    </div>

    <div
      v-if="hasMessages"
      class="workflow-prompt-dock absolute inset-x-0 bottom-0 z-20 overflow-visible bg_secondary_color px-6xl pb-6xl pt-6 transition-all duration-300 ease-in-out"
    >
      <PromptBox
        ref="promptInputRef"
        :is-ai-generating="isPromptDisabled"
        :disable-product-select="true"
        :hide-product-select="true"
        :hide-files="true"
        placeholder="Ask the workflow assistant…"
        class="mt-0 w-full max-w-none"
        @send-message="handlePromptBoxSend"
      />
      <div class="text-center p-xl">
        <p class="body_4_regular tertiary_text_color">
          AI Agent can make mistakes. Please check for accuracy.
        </p>
      </div>
    </div>
  </aside>
</template>

<style scoped>
.workflow-prompt-dock {
  isolation: isolate;
}

.workflow-prompt-dock :deep(.prompt-box-animated),
.workflow-prompt-dock :deep(.button-gradient) {
  overflow: visible;
}

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

.chat-markdown :deep(table) {
  display: block;
  width: 100%;
  margin: 0.75em 0;
  overflow-x: auto;
  border-collapse: collapse;
}

.chat-markdown :deep(th),
.chat-markdown :deep(td) {
  padding: 0.5em 0.75em;
  border: 1px solid rgb(229 231 235);
  text-align: left;
  vertical-align: top;
}

.chat-markdown :deep(th) {
  font-weight: 600;
  background: rgb(249 250 251);
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
