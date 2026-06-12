<template>
  <div class="flex h-full min-h-0 flex-1 flex-col">
    <main
      v-if="!hasMessages"
      class="flex min-h-0 flex-1 items-start bg_primary_color px-6xl py-10xl lg:items-center"
    >
      <div class="mx-auto w-full max-w-5xl text-center">
        <div class="glass-sphere mx-auto mb-6">
          <div class="fluid-container">
            <div class="base"></div>
            <div class="blob c1"></div>
            <div class="blob c2"></div>
            <div class="blob c3"></div>
            <div class="blob c4"></div>
          </div>
        </div>

        <svg style="position: absolute; width: 0; height: 0;">
          <defs>
            <filter id="liquid-filter">
              <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="3" seed="1">
                <animate attributeName="baseFrequency" dur="6s" values="0.01;0.03;0.01" repeatCount="indefinite" />
              </feTurbulence>
              <feDisplacementMap in="SourceGraphic" scale="80" />
            </filter>
          </defs>
        </svg>

        <h1 class="primary_text_color heading_h5_semibold md:heading_h4_semibold">
          Chat with your AI agent
        </h1>
        <p class="mt-md heading_h3_semibold md:heading_h3_semibold gradient_text_color">
          Automate support and resolve issues
        </p>

        <div class="">
          <PromptBox
            :is-ai-generating="isLoading"
            :show-all-products-option="false"
            @send-message="handleFirstMessage"
          />
        </div>

        <ManageAgentsBanner @create-agent="goToAgents" />
      </div>
    </main>

    <section
      v-else
      class="flex min-h-0 flex-1 flex-col bg_primary_color"
    >
      <div class="min-h-0 flex-1 overflow-y-auto custom_scrollbar px-6xl py-8xl">
        <div class="mx-auto flex w-full max-w-3xl flex-col gap-7">
          <article
            v-for="(message, index) in messages"
            :key="index"
            class="w-full"
          >
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
                  <div
                    class="chat-markdown Body_2_regular primary_text_color lg:px-3xl pt-sm pb-md text-left"
                    v-html="formatMarkdownToHtml(message.aiResponse)"
                  />

                  <ChatActionBar
                    :is-liked="message.isLiked"
                    :is-disliked="message.isDisliked"
                    :padded="false"
                    compact-icons
                    show-regenerate
                    class="lg:px-3xl"
                    @copy="handleCopy(message.aiResponse)"
                    @like="toggleChatReaction(index, 'like')"
                    @dislike="toggleChatReaction(index, 'dislike')"
                    @regenerate="handleRegenerate(index)"
                  />
                </div>
              </div>
            </div>
          </article>
          <div ref="scrollAnchor" class="h-px" />
        </div>
      </div>

      <div class="px-6xl pb-8xl pt-4 shrink-0">
        <div class="mx-auto w-full max-w-3xl">
          <PromptBox
            :is-ai-generating="isLoading"
            :show-all-products-option="false"
            @send-message="handleFollowUpMessage"
          />
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, watch, computed, nextTick, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { PromptBox, ChatActionBar } from '@ai-suite/shared-ui'
import ManageAgentsBanner from '../components/home/ManageAgentsBanner.vue'
import { apiService } from '../services/agentApi.js'
import { useDashboardChatWebSocket } from '../composables/useDashboardChatWebSocket.js'
import { formatMarkdownToHtml } from '../utils/formatMarkdownToHtml.js'
import AgentChatIcon from '../assets/images/agents/dashboard/chatIcon.svg'

const props = defineProps({
  resetChat: {
    type: Boolean,
    default: false,
  },
  isSidebarCollapsed: {
    type: Boolean,
    default: false,
  },
  sessionToLoad: {
    type: String,
    default: null,
  },
  sessionRemovedFromList: {
    type: [String, Number],
    default: null,
  },
})

const emit = defineEmits(['reset-complete', 'sessionLoaded', 'newSessionCreated'])

const router = useRouter()
const hasMessages = ref(false)
const messages = ref([])
const chatId = ref(null)
const selectedAgentId = ref(null)
const isMulti = ref(false)
const isLoading = ref(false)
const scrollAnchor = ref(null)

const singleWs = useDashboardChatWebSocket('single')
const multiWs = useDashboardChatWebSocket('multi')
const currentWs = computed(() => isMulti.value ? multiWs : singleWs)

singleWs.setOnMessage(handleWsMessage)
multiWs.setOnMessage(handleWsMessage)

function goToAgents(type) {
  router.push({
    path: '/agents',
    query: type ? { type } : {},
  })
}

function readChatId(payload) {
  return payload?.id ?? payload?.chat_id ?? payload?.data?.id ?? payload?.data?.chat_id ?? null
}

function readAiResponse(payload) {
  if (!payload) return 'No response received'
  if (typeof payload === 'string') return payload
  return (
    payload.message ??
    payload.response ??
    payload.content?.value ??
    payload.data?.message ??
    payload.data?.response ??
    'No response received'
  )
}

async function scrollToBottom() {
  await nextTick()
  scrollAnchor.value?.scrollIntoView({ behavior: 'smooth', block: 'end' })
}

function handleWsMessage(data) {
  console.log('[ChatView WS] Message received:', data)
  
  if (data.type === 'streaming_chunk' && data.content) {
    let pendingIndex = -1
    for (let i = messages.value.length - 1; i >= 0; i--) {
      if (messages.value[i].isLoading || messages.value[i].isStreaming) {
        pendingIndex = i
        break
      }
    }

    if (pendingIndex === -1) return
    const pendingMessage = messages.value[pendingIndex]

    messages.value[pendingIndex] = {
      ...pendingMessage,
      isLoading: false,
      isStreaming: true,
      aiResponse: (pendingMessage.aiResponse || '') + data.content
    }
    scrollToBottom()
    return
  }

  if (data.type === 'streaming_complete') {
    let pendingIndex = -1
    for (let i = messages.value.length - 1; i >= 0; i--) {
      if (messages.value[i].isLoading || messages.value[i].isStreaming) {
        pendingIndex = i
        break
      }
    }

    if (pendingIndex !== -1) {
      const pendingMessage = messages.value[pendingIndex]
      messages.value[pendingIndex] = {
        ...pendingMessage,
        isLoading: false,
        isStreaming: false,
        aiResponse: data.content || pendingMessage.aiResponse
      }
    }
    isLoading.value = false
    scrollToBottom()
    return
  }

  if (data.type === 'agent_response') {
    let pendingIndex = -1
    for (let i = messages.value.length - 1; i >= 0; i--) {
      if (messages.value[i].isLoading || messages.value[i].isStreaming) {
        pendingIndex = i
        break
      }
    }

    if (pendingIndex !== -1) {
      const pendingMessage = messages.value[pendingIndex]
      messages.value[pendingIndex] = {
        ...pendingMessage,
        isLoading: false,
        isStreaming: false,
        aiResponse: data.success
          ? (data.response || 'No response received')
          : (data.response || 'Sorry, I encountered an error while processing your message.')
      }
    }
    isLoading.value = false
    scrollToBottom()
    return
  }

  if (data.type === 'error') {
    let pendingIndex = -1
    for (let i = messages.value.length - 1; i >= 0; i--) {
      if (messages.value[i].isLoading || messages.value[i].isStreaming) {
        pendingIndex = i
        break
      }
    }

    if (pendingIndex !== -1) {
      const pendingMessage = messages.value[pendingIndex]
      messages.value[pendingIndex] = {
        ...pendingMessage,
        isLoading: false,
        isStreaming: false,
        aiResponse: data.message || 'Sorry, I encountered an error while processing your message.'
      }
    }
    isLoading.value = false
    scrollToBottom()
    return
  }
}

async function handleFirstMessage(messageData) {
  if (isLoading.value) return

  isLoading.value = true
  selectedAgentId.value = messageData.product ?? null
  isMulti.value = false

  messages.value = [
    {
      text: messageData.text,
      isLoading: true,
      aiResponse: null,
      isLiked: false,
      isDisliked: false,
    },
  ]
  hasMessages.value = true
  scrollToBottom()

  try {
    const agentId = selectedAgentId.value
    if (!agentId) {
      throw new Error('Select an agent before sending a message.')
    }

    let activeChatId = chatId.value
    if (!activeChatId) {
      const created = await apiService.createChat(agentId, messageData.text.slice(0, 80) || 'New Chat')
      activeChatId = readChatId(created)
      if (!activeChatId) {
        throw new Error('Could not create chat.')
      }
      chatId.value = activeChatId
      emit('newSessionCreated', activeChatId)
    }

    await currentWs.value.ensureConnected(agentId, activeChatId)
    currentWs.value.send(messageData.text)
  } catch (error) {
    messages.value[0].isLoading = false
    messages.value[0].aiResponse = error?.message || 'Sorry, something went wrong. Please try again.'
    isLoading.value = false
  }
}

async function handleFollowUpMessage(messageData) {
  if (isLoading.value || !chatId.value || !selectedAgentId.value) return

  isLoading.value = true
  const nextIndex = messages.value.length
  messages.value.push({
    text: messageData.text,
    isLoading: true,
    aiResponse: null,
    isLiked: false,
    isDisliked: false,
  })
  scrollToBottom()

  try {
    await currentWs.value.ensureConnected(selectedAgentId.value, chatId.value)
    currentWs.value.send(messageData.text)
  } catch (error) {
    messages.value[nextIndex].isLoading = false
    messages.value[nextIndex].aiResponse = error?.message || 'Sorry, something went wrong.'
    isLoading.value = false
  }
}

function handleNewChat() {
  hasMessages.value = false
  messages.value = []
  chatId.value = null
  selectedAgentId.value = null
  isMulti.value = false
  isLoading.value = false

  singleWs.disconnect()
  multiWs.disconnect()
}

function extractHistory(response) {
  if (response?.data?.conversations) return response.data.conversations
  if (response?.conversations) return response.conversations
  if (Array.isArray(response?.data)) return response.data
  if (Array.isArray(response)) return response
  return []
}

function mapHistoryToMessages(history) {
  const mapped = []
  history.forEach((item) => {
    const userText =
      item.user_message ??
      item.userMessage ??
      (item.role === 'user' ? item.content?.value ?? item.content : null)

    const aiText =
      item.agent_response ??
      item.agentResponse ??
      item.ai_response ??
      (item.role === 'assistant' ? item.content?.value ?? item.content : null)

    if (userText || aiText) {
      mapped.push({
        text: String(userText || ''),
        isLoading: false,
        aiResponse: aiText ? String(aiText) : null,
        isLiked: false,
        isDisliked: false,
      })
    }
  })
  return mapped
}

async function loadExistingSession(sessionId) {
  if (!sessionId) return

  isLoading.value = true
  chatId.value = sessionId

  try {
    const history = await apiService.getChatHistory(sessionId)
    
    const chatDetails = history?.data?.chat || history?.chat || null
    if (chatDetails) {
      selectedAgentId.value = chatDetails.agent_id ?? chatDetails.group_id ?? null
      isMulti.value = Boolean(chatDetails.group_id)
    }

    const historyData = extractHistory(history)
    messages.value = mapHistoryToMessages(historyData)

    if (messages.value.length === 0) {
      hasMessages.value = false
    } else {
      hasMessages.value = true
      scrollToBottom()
    }

    emit('sessionLoaded', sessionId)

    if (selectedAgentId.value && chatId.value) {
      try {
        await currentWs.value.reconnect(selectedAgentId.value, chatId.value)
      } catch {
        currentWs.value.connect(selectedAgentId.value, chatId.value)
      }
    }
  } catch (error) {
    console.error('Failed to load chat history:', error)
    messages.value = []
    hasMessages.value = false
  } finally {
    isLoading.value = false
  }
}

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

async function handleRegenerate(index) {
  const message = messages.value[index]
  if (!message?.text || isLoading.value || !chatId.value || !selectedAgentId.value) return

  isLoading.value = true
  messages.value.push({
    text: message.text,
    isLoading: true,
    isStreaming: false,
    aiResponse: null,
    isLiked: false,
    isDisliked: false,
  })

  await scrollToBottom()

  try {
    await currentWs.value.ensureConnected(selectedAgentId.value, chatId.value)
    currentWs.value.send(message.text)
  } catch (err) {
    const lastIndex = messages.value.length - 1
    messages.value[lastIndex] = {
      ...messages.value[lastIndex],
      isLoading: false,
      aiResponse: err?.message || 'Sorry, something went wrong. Please try again.',
    }
    isLoading.value = false
    await scrollToBottom()
  }
}

onUnmounted(() => {
  singleWs.disconnect()
  multiWs.disconnect()
})

watch(
  () => props.resetChat,
  (value) => {
    if (value) {
      handleNewChat()
      emit('reset-complete')
    }
  }
)

watch(
  () => props.sessionToLoad,
  (sessionId) => {
    if (sessionId) {
      loadExistingSession(sessionId)
    }
  },
  { immediate: true }
)

watch(
  () => props.sessionRemovedFromList,
  (removedId) => {
    if (removedId == null || removedId === '') return
    if (chatId.value != null && String(chatId.value) === String(removedId)) {
      handleNewChat()
    }
  }
)
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

.connecting-status {
  display: flex;
  align-items: center;
  justify-content: center;
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

/* Glass Sphere styles */
.glass-sphere {
  position: relative;
  width: 150px;
  height: 150px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(8px);
 
  box-shadow: 
    0 20px 40px rgba(0, 0, 0, 0.1),
    inset 0 0 15px rgba(255, 255, 255, 0.4);
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
}

/* Container for the fluid layers */
.fluid-container {
  position: absolute;
  width: 140%;
  height: 140%;
  filter: url(#liquid-filter) blur(10px);
  animation: rotateFull 8s infinite linear;
}

/* Base layer (usually white/transparent to keep the "glass" look) */
.base {
  position: absolute;
  width: 100%;
  height: 100%;
  background: white;
  opacity: 0.3;
}

/* Individual Color Layers with varying Opacity cycles */
.blob {
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  mix-blend-mode: color-burn;
}

.c1 { 
  background: radial-gradient(circle at 30% 30%, #FAB000, transparent 40%); 
  animation: pulseOpacity 7s infinite ease-in-out; 
}
.c2 { 
  background: radial-gradient(circle at 70% 30%, #9966FF, transparent 50%); 
  animation: pulseOpacity 11s infinite ease-in-out; 
}
.c3 { 
  background: radial-gradient(circle at 40% 70%, #0073E6, transparent 40%); 
  animation: pulseOpacity 5s infinite ease-in-out; 
}
.c4 { 
  background: radial-gradient(circle at 75% 70%, #15BE53, transparent 50%); 
  animation: pulseOpacity 13s infinite ease-in-out; 
}

/* ANIMATIONS */
@keyframes rotateFull {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes pulseOpacity {
  0%, 100% { opacity: 0; transform: scale(0.8); }
  50% { opacity: 1; transform: scale(1.2); }
}
</style>
