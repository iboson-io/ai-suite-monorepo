<script setup>
import { ref, watch, computed, nextTick, onMounted, onBeforeUnmount } from 'vue'
import { marked } from 'marked'
import { useAuth } from '@app/composables/useAuth'
import { WORKFLOW_AGENT_WS_URL, WORKFLOW_AGENT_WS_PATH } from '@app/services/constants'
import AgentChatIcon from '../../assets/images/agents/dashboard/chatIcon.svg'
import { ChatActionBar } from '@ai-suite/shared-ui'
import MikeIcon from '../../../../../packages/shared-ui/src/assets/images/MikeIcon.svg'
import ActiveMikeIcon from '../../../../../packages/shared-ui/src/assets/images/ActiveMikeIcon.svg'

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

const suggestions = [
  {
    text: 'Build me an automation from scratch',
    icon: `<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>`
  },
  {
    text: 'Help me brainstorm ideas for an automation',
    icon: `<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>`
  },
  {
    text: 'What can you do?',
    icon: `<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>`
  },
  {
    text: 'What are custom nodes and how do I use them?',
    icon: `<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>`
  }
]

function selectSuggestion(text) {
  prompt.value = text
  nextTick(() => {
    send()
  })
}

const messages = ref(
  /** @type {{ kind: 'user' | 'assistant' | 'system' | 'error', text: string, raw?: boolean, isLiked?: boolean, isDisliked?: boolean }[]} */ ([])
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

const isListening = ref(false)
const speechUnsupportedMessage = ref('')
const speechRecognition = ref(null)
const voiceFinal = ref('')

const canUseSpeechApi = () =>
  typeof window !== 'undefined' &&
  !!(window.SpeechRecognition || window.webkitSpeechRecognition)

function stopVoiceRecognition() {
  const r = speechRecognition.value
  if (!r) {
    isListening.value = false
    return
  }
  speechRecognition.value = null
  r.onresult = null
  r.onerror = null
  r.onend = null
  try {
    r.stop()
  } catch {
    /* ignore */
  }
  isListening.value = false
}

function abortVoiceRecognition() {
  const r = speechRecognition.value
  if (!r) {
    isListening.value = false
    return
  }
  speechRecognition.value = null
  r.onresult = null
  r.onerror = null
  r.onend = null
  try {
    r.abort()
  } catch {
    /* ignore */
  }
  isListening.value = false
}

function startVoiceRecognition() {
  speechUnsupportedMessage.value = ''
  if (!canUseSpeechApi()) {
    speechUnsupportedMessage.value =
      'Voice input is not supported in this browser. Try Chrome, Edge, or Safari.'
    return
  }
  if (sending.value || isListening.value) return

  const Ctor = window.SpeechRecognition || window.webkitSpeechRecognition
  const recognition = new Ctor()
  voiceFinal.value = ''
  prompt.value = ''

  recognition.lang = navigator.language || 'en-US'
  recognition.continuous = true
  recognition.interimResults = true

  recognition.onresult = (event) => {
    let interim = ''
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const piece = event.results[i][0].transcript
      if (event.results[i].isFinal) {
        voiceFinal.value += piece
      } else {
        interim += piece
      }
    }
    prompt.value = (voiceFinal.value + interim).trim()
  }

  recognition.onerror = (e) => {
    if (e.error === 'aborted') {
      if (speechRecognition.value === recognition) {
        speechRecognition.value = null
      }
      isListening.value = false
      return
    }
    if (e.error === 'not-allowed' || e.error === 'service-not-allowed') {
      speechUnsupportedMessage.value =
        'Microphone access was denied. Allow the microphone to use voice input.'
    } else if (e.error !== 'no-speech') {
      speechUnsupportedMessage.value = 'Voice input error. Try again.'
    }
    stopVoiceRecognition()
  }

  recognition.onend = () => {
    if (speechRecognition.value === recognition) {
      speechRecognition.value = null
    }
    isListening.value = false
  }

  speechRecognition.value = recognition

  try {
    recognition.start()
    isListening.value = true
  } catch {
    speechUnsupportedMessage.value = 'Could not start voice input.'
    speechRecognition.value = null
    isListening.value = false
  }
}

function toggleVoice() {
  if (isListening.value) {
    stopVoiceRecognition()
  } else {
    startVoiceRecognition()
  }
}

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

function scrollToBottom() {
  nextTick(() => {
    const el = messagesBodyRef.value
    if (el) el.scrollTop = el.scrollHeight
  })
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

  if (isListening.value) {
    stopVoiceRecognition()
  }

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
  abortVoiceRecognition()
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
    class="workflow-agent-chat flex min-h-[220px] flex-col bg_primary_color lg:h-full lg:min-h-0"
    aria-label="Workflow assistant chat"
  >
    <!-- Header with Logo and Exit Button -->
    <div
      class="flex shrink-0 flex-wrap items-center gap-4 border-b primary_border_color bg_secondary_color px-6xl py-4xl justify-between"
    >
      <div class="flex min-w-0 items-center gap-3">
        <!-- Logo -->
        <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-black text-white font-bold text-lg select-none">
          G
        </div>
        <!-- Status Indicator -->
        <div class="flex items-center gap-2">
          <span class="relative flex h-2.5 w-2.5 shrink-0">
            <span
              class="absolute inline-flex h-full w-full rounded-full opacity-75"
              :class="connected ? 'animate-ping bg-sky-400' : ''"
            />
            <span class="relative inline-flex h-2.5 w-2.5 rounded-full" :class="statusDotClass" />
          </span>
          <div class="min-w-0">
            <p class="truncate label_2_bold primary_text_color select-none">Workflow co-pilot</p>
            <p class="truncate caption_1_medium secondary_text_color select-none">{{ statusLabel }}</p>
          </div>
        </div>
      </div>
      <div class="flex shrink-0 gap-2">
        <button
          v-if="hasChatSession"
          type="button"
          @click="newChat"
          class="flex items-center gap-2 rounded-lg border primary_border_color bg_secondary_color px-3.5 py-2 label_2_semibold primary_text_color hover:bg-gray-25 shadow-sm transition-all"
        >
          <svg class="h-4 w-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          New chat
        </button>
        <button
          type="button"
          @click="$emit('back')"
          class="flex items-center gap-2 rounded-lg border primary_border_color bg_secondary_color px-3.5 py-2 label_2_semibold primary_text_color hover:bg-gray-25 shadow-sm transition-all"
        >
          <svg class="h-4 w-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Exit
        </button>
      </div>
    </div>

    <!-- Welcoming view when messages list is empty -->
    <div 
      v-if="!messages.length" 
      class="custom_scrollbar min-h-0 flex-1 overflow-y-auto px-6xl py-6xl flex flex-col justify-center items-center"
    >
      <div class="w-full max-w-md flex flex-col items-center justify-center text-center my-auto py-8">
        <!-- Welcoming title -->
        <h1 class="text-3xl font-bold primary_text_color tracking-tight mb-2">
          Hey {{ userName }}, how can I help?
        </h1>
        <p class="text-sm secondary_text_color max-w-sm mb-8 leading-relaxed">
          I'm your AI co-pilot. I can build flows, help you answer questions, and make you a workflow expert.
        </p>

        <!-- Centered Prompt Box -->
        <div class="w-full button-gradient mb-8">
          <div class="prompt-box-inner rounded-xl bg_secondary_color p-5xl flex flex-col text-left">
            <textarea
              ref="promptInputRef"
              v-model="prompt"
              rows="3"
              :placeholder="isListening ? 'Listening… speak now' : 'Describe what you want to automate today'"
              class="w-full border-none outline-none label_1_regular resize-none bg-transparent"
              :class="[
                prompt ? 'primary_text_color' : 'secondary_text_color',
                !connected || sending ? 'opacity-50 cursor-not-allowed' : ''
              ]"
              @keydown="onKeydown"
              :disabled="!connected || sending"
            />

            <div class="mt-4 flex items-center justify-end">
              <div class="flex items-center gap-3">
                <!-- Microphone Button -->
                <div class="group/voice relative">
                  <button
                    type="button"
                    class="transition-transform duration-100 hover:scale-105 active:scale-95 flex items-center justify-center shrink-0"
                    :disabled="sending"
                    @click="toggleVoice"
                  >
                    <img v-if="isListening" class="h-[34px] w-[34px] animate-pulse" :src="ActiveMikeIcon" alt="Listening" />
                    <img v-else class="h-[34px] w-[34px]" :src="MikeIcon" alt="Start Voice" />
                  </button>
                  <span
                    role="tooltip"
                    class="pointer-events-none absolute bottom-full left-1/2 z-[100] mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded-lg bg-slate-900 px-2 py-1 text-[11px] font-medium leading-tight text-white shadow-md group-hover/voice:block"
                  >
                    {{ isListening ? 'Stop listening' : 'Voice input' }}
                  </span>
                </div>

                <!-- Send Button with Gradient -->
                <button
                  type="button"
                  class="rounded-full p-0.5 transition-transform"
                  :class="[!connected || sending || !prompt.trim() ? 'opacity-50 cursor-not-allowed' : '']"
                  :disabled="!connected || sending || !prompt.trim()"
                  @click="send"
                >
                  <svg width="34" height="34" viewBox="0 0 34 34" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect width="34" height="34" rx="17" fill="url(#purpleGradient)"/>
                    <path d="M17 10V24M17 10L23 16M17 10L11 16" stroke="#F3F0FF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <defs>
                      <linearGradient id="purpleGradient" x1="0" y1="0" x2="34" y2="34" gradientUnits="userSpaceOnUse">
                        <stop stop-color="#FAB000"/>
                        <stop offset="0.30" stop-color="#9966FF"/>
                        <stop offset="0.85" stop-color="#0073E6"/>
                        <stop offset="1.00" stop-color="#15BE53"/>
                      </linearGradient>
                    </defs>
                  </svg>
                </button>
              </div>
            </div>
            <p
              v-if="speechUnsupportedMessage"
              class="mt-2 text-[10px] text-amber-700 font-medium select-none text-left"
              role="status"
            >
              {{ speechUnsupportedMessage }}
            </p>
          </div>
        </div>

        <!-- Suggestion List -->
        <div class="w-full flex flex-col gap-2">
          <button
            v-for="(suggestion, idx) in suggestions"
            :key="idx"
            type="button"
            @click="selectSuggestion(suggestion.text)"
            class="flex items-center justify-between w-full px-4 py-3.5 rounded-xl border border-slate-200/60 bg-white hover:bg-slate-50 hover:border-slate-300 transition-all text-left text-sm primary_text_color shadow-sm"
          >
            <div class="flex items-center gap-3">
              <span class="text-slate-400" v-html="suggestion.icon" />
              <span>{{ suggestion.text }}</span>
            </div>
            <svg class="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Active Messages view when messages list is not empty -->
    <template v-else>
      <div ref="messagesBodyRef" class="custom_scrollbar min-h-0 flex-1 overflow-y-auto px-6xl py-6xl space-y-6">
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

        <div v-if="sending" class="flex items-start gap-3">
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
      </div>

      <!-- Docked Prompt Box at the bottom -->
      <div class="shrink-0 px-6xl pb-6xl pt-2">
        <div
          class="w-full"
          :class="sending ? 'prompt-box-animated' : 'button-gradient'"
        >
          <div class="prompt-box-inner rounded-xl bg_secondary_color p-5xl flex flex-col">
            <textarea
              ref="promptInputRef"
              v-model="prompt"
              rows="2"
              :placeholder="isListening ? 'Listening… speak now' : 'Ask the workflow assistant…'"
              class="w-full border-none outline-none label_1_regular bg-transparent resize-none"
              :class="[
                prompt ? 'primary_text_color' : 'secondary_text_color',
                !connected || sending ? 'opacity-50 cursor-not-allowed' : ''
              ]"
              @keydown="onKeydown"
              :disabled="!connected || sending"
            />

            <div class="mt-4 flex items-center justify-end">
              <div class="flex items-center gap-3">
                <!-- Microphone Button -->
                <div class="group/voice relative">
                  <button
                    type="button"
                    class="transition-transform duration-100 hover:scale-105 active:scale-95 flex items-center justify-center shrink-0"
                    :disabled="sending"
                    @click="toggleVoice"
                  >
                    <img v-if="isListening" class="h-[34px] w-[34px] animate-pulse" :src="ActiveMikeIcon" alt="Listening" />
                    <img v-else class="h-[34px] w-[34px]" :src="MikeIcon" alt="Start Voice" />
                  </button>
                  <span
                    role="tooltip"
                    class="pointer-events-none absolute bottom-full left-1/2 z-[100] mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded-lg bg-slate-900 px-2 py-1 text-[11px] font-medium leading-tight text-white shadow-md group-hover/voice:block"
                  >
                    {{ isListening ? 'Stop listening' : 'Voice input' }}
                  </span>
                </div>

                <!-- Send Button with Gradient -->
                <button
                  type="button"
                  class="rounded-full p-0.5 transition-transform"
                  :class="[!connected || sending || !prompt.trim() ? 'opacity-50 cursor-not-allowed' : '']"
                  :disabled="!connected || sending || !prompt.trim()"
                  @click="send"
                >
                  <svg width="34" height="34" viewBox="0 0 34 34" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect width="34" height="34" rx="17" fill="url(#purpleGradient)"/>
                    <path d="M17 10V24M17 10L23 16M17 10L11 16" stroke="#F3F0FF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <defs>
                      <linearGradient id="purpleGradient" x1="0" y1="0" x2="34" y2="34" gradientUnits="userSpaceOnUse">
                        <stop stop-color="#FAB000"/>
                        <stop offset="0.30" stop-color="#9966FF"/>
                        <stop offset="0.85" stop-color="#0073E6"/>
                        <stop offset="1.00" stop-color="#15BE53"/>
                      </linearGradient>
                    </defs>
                  </svg>
                </button>
              </div>
            </div>
            <p
              v-if="speechUnsupportedMessage"
              class="mt-2 text-[10px] text-amber-700 font-medium select-none text-left"
              role="status"
            >
              {{ speechUnsupportedMessage }}
            </p>
          </div>
        </div>
      </div>
    </template>
  </aside>
</template>

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

.custom_scrollbar {
  scrollbar-width: thin;
  scrollbar-color: #cbd5e1 transparent;
}

.custom_scrollbar::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.custom_scrollbar::-webkit-scrollbar-track {
  margin: 0;
  background: transparent;
}

.custom_scrollbar::-webkit-scrollbar-thumb {
  background-color: #cbd5e1;
  border-radius: 9999px;
}

.custom_scrollbar::-webkit-scrollbar-thumb:hover {
  background-color: #94a3b8;
}
</style>
