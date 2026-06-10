<script setup>
import { ref, watch, computed, nextTick, onMounted, onBeforeUnmount } from 'vue'
import { marked } from 'marked'
import { useAuth } from '@app/composables/useAuth'
import { WORKFLOW_AGENT_WS_URL, WORKFLOW_AGENT_WS_PATH } from '@app/services/constants'

marked.setOptions({ breaks: true, gfm: true })

const props = defineProps({
  workflowId: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['submit-prompt', 'ai-response', 'schema-changed'])

const { getToken } = useAuth()

const messages = ref(
  /** @type {{ kind: 'user' | 'assistant' | 'system' | 'error', text: string, raw?: boolean }[]} */ ([])
)
const prompt = ref('')
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
/** @type {import('vue').Ref<HTMLTextAreaElement | null>} */
const promptInputRef = ref(null)

function focusPromptInput() {
  nextTick(() => {
    promptInputRef.value?.focus()
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
  } catch {
    /* ignore */
  }
}

function clearStoredChatId() {
  if (typeof sessionStorage === 'undefined') return
  try {
    sessionStorage.removeItem(chatStorageKey())
  } catch {
    /* ignore */
  }
}

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

function scrollToBottom() {
  nextTick(() => {
    const el = messagesBodyRef.value
    if (el) el.scrollTop = el.scrollHeight
  })
}

function append(kind, text, raw = false) {
  messages.value = [...messages.value, { kind, text, raw }]
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
      sending.value = false
      append('system', 'Workflow updated.')
      return
    }

    sending.value = false

    if (data.type === 'response') {
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
      const reason = data.error_reason ? ` ${data.error_reason}` : ''
      append('error', `${data.message || 'Error'}${reason}`)
      return
    }

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

function send() {
  const text = String(prompt.value || '').trim()
  if (!text || sending.value || !connected.value) return

  append('user', text)
  prompt.value = ''

  if (!sendPromptText(text)) {
    sending.value = false
    append('error', 'Not connected — wait for connection or click Reconnect.')
  }
  focusPromptInput()
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

function onKeydown(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    send()
  }
}

watch(
  () => props.workflowId,
  () => {
    messages.value = []
    reconnectAttempts = 0
    cleanupSocket()
    connect()
  }
)

onMounted(() => {
  connect()
})

onBeforeUnmount(() => {
  if (syncDebounce) clearTimeout(syncDebounce)
  disconnect()
})

defineExpose({
  notifyWorkflowSaved,
  reconnect: reconnectManual,
  newChat
})

const statusLabel = computed(() => {
  if (connecting.value) return 'Connecting…'
  if (connected.value) return 'Connected'
  return 'Disconnected'
})

const statusDotClass = computed(() => {
  if (connected.value) return 'bg-sky-500 shadow-[0_0_0_3px_rgba(14,165,233,0.35)]'
  if (connecting.value) return 'bg-amber-400 animate-pulse'
  return 'bg-red-500 shadow-[0_0_0_3px_rgba(239,68,68,0.2)]'
})
</script>

<template>
  <aside
    class="workflow-agent-chat flex min-h-[220px] flex-col border-t border-blue-100/90 bg-gradient-to-b from-sky-50/95 via-blue-50/40 to-white lg:h-full lg:min-h-0 lg:w-[min(100vw,360px)] lg:shrink-0 lg:border-r lg:border-t-0 lg:border-blue-100/90"
    aria-label="Workflow assistant chat"
  >
    <div
      class="flex shrink-0 flex-wrap items-center gap-2 border-b border-blue-100/80 bg-gradient-to-r from-sky-100/70 via-blue-50/80 to-sky-50/50 px-3 py-2"
    >
      <div class="flex min-w-0 flex-1 items-center gap-2">
        <span class="relative flex h-2 w-2 shrink-0">
          <span
            class="absolute inline-flex h-full w-full rounded-full opacity-75"
            :class="connected ? 'animate-ping bg-sky-400' : ''"
          />
          <span class="relative inline-flex h-2 w-2 rounded-full" :class="statusDotClass" />
        </span>
        <div class="min-w-0">
          <p class="truncate text-sm font-semibold text-slate-900">Workflow assistant</p>
          <p class="truncate text-xs text-slate-500">{{ statusLabel }}</p>
        </div>
      </div>
      <div class="flex shrink-0 gap-1">
        <button
          type="button"
          class="rounded-lg px-2 py-1 text-[11px] font-medium text-slate-600 hover:bg-sky-100/80"
          @click="reconnectManual"
        >
          Reconnect
        </button>
        <button
          type="button"
          class="rounded-lg px-2 py-1 text-[11px] font-medium text-blue-700 hover:bg-blue-100/70"
          @click="newChat"
        >
          New chat
        </button>
      </div>
    </div>

    <div ref="messagesBodyRef" class="min-h-0 flex-1 space-y-2 overflow-y-auto p-3">
      <p v-if="!messages.length" class="text-xs leading-relaxed text-slate-700/90">
        Ask about triggers, output channels, patterns, and agents for this workflow.
      </p>
      <template v-for="(m, i) in messages" :key="i">
        <div v-if="m.kind === 'user'" class="flex justify-end">
          <div class="max-w-[92%] rounded-2xl bg-gradient-to-br from-blue-600 to-sky-600 px-3 py-2 text-sm leading-snug text-white shadow-sm">
            {{ m.text }}
          </div>
        </div>
        <div v-else-if="m.kind === 'assistant'" class="flex justify-start">
          <div
            class="assistant-md max-w-[92%] rounded-2xl border border-sky-100/90 bg-white/90 px-3 py-2 text-sm leading-snug text-slate-800 shadow-sm"
            v-html="renderMarkdown(m.text)"
          />
        </div>
        <div v-else class="flex justify-center">
          <div
            class="max-w-[95%] rounded-lg px-2.5 py-1.5 text-center text-[11px] leading-snug"
            :class="
              m.kind === 'error'
                ? 'bg-red-50 text-red-800 ring-1 ring-red-100'
                : 'border border-blue-100/70 bg-sky-50/80 text-slate-700'
            "
          >
            {{ m.text }}
          </div>
        </div>
      </template>
      <div v-if="sending" class="flex items-center gap-2 text-sm text-slate-600">
        <span
          class="inline-block h-4 w-4 animate-spin rounded-full border-2 border-sky-200 border-t-blue-600"
          aria-hidden="true"
        />
        <span>Waiting for reply…</span>
      </div>
    </div>

    <div class="shrink-0 border-t border-blue-100/80 bg-white/60 p-2 backdrop-blur-[2px]">
      <div class="flex gap-2">
        <textarea
          ref="promptInputRef"
          v-model="prompt"
          rows="2"
          class="min-h-[2.75rem] max-h-36 flex-1 resize-y overflow-y-auto rounded-xl border border-sky-200/90 bg-white/95 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none  disabled:opacity-50"
          placeholder="Ask the workflow assistant…"
          :disabled="!connected"
          @keydown="onKeydown"
        />
        <button
          type="button"
          class="self-end shrink-0 rounded-xl bg-gradient-to-br from-blue-600 to-sky-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:from-blue-700 hover:to-sky-700 disabled:cursor-not-allowed disabled:opacity-50"
          :disabled="!connected || sending || !String(prompt).trim()"
          @click="send"
        >
          Send
        </button>
      </div>
    </div>
  </aside>
</template>

<style scoped>
.workflow-agent-chat :deep(.assistant-md p) {
  margin: 0.35em 0;
}
.workflow-agent-chat :deep(.assistant-md p:first-child) {
  margin-top: 0;
}
.workflow-agent-chat :deep(.assistant-md p:last-child) {
  margin-bottom: 0;
}
.workflow-agent-chat :deep(.assistant-md a) {
  color: rgb(2 132 199);
  text-decoration: underline;
}
.workflow-agent-chat :deep(.assistant-md pre) {
  overflow-x: auto;
  margin: 0.35em 0;
  padding: 0.5rem;
  border-radius: 0.375rem;
  background: rgb(240 249 255);
  font-size: 0.75rem;
}
.workflow-agent-chat :deep(.assistant-md code) {
  font-size: 0.85em;
}
.workflow-agent-chat :deep(.assistant-md ul),
.workflow-agent-chat :deep(.assistant-md ol) {
  margin: 0.35em 0;
  padding-left: 1.25rem;
}
</style>
