<template>
  <div class="flex min-h-0 flex-1 flex-col">
    <div
      v-if="loadingHistory"
      class="flex min-h-0 flex-1 items-center justify-center"
    >
      <div class="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-info-500" />
    </div>

    <template v-else>
      <div
        class="custom_scrollbar min-h-0 flex-1 overflow-y-auto px-6xl py-6xl"
        :class="{ 'flex flex-col justify-center': chatMessages.length === 0 }"
      >
        <div class="mx-auto flex w-full max-w-3xl flex-col gap-7">
          <template v-if="chatMessages.length === 0">
            <div class="flex flex-col items-center justify-center text-center py-12">
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
            </div>
          </template>

          <template v-else>
            <article
              v-for="(message, index) in chatMessages"
              :key="`chat-${message.id ?? index}`"
            >
              <div v-if="message.text" class="flex justify-end">
                <div class="max-w-[85%] rounded-2xl border primary_border_color bg_secondary_color px-5xl py-xl">
                  <p class="Body_2_regular primary_text_color">{{ message.text }}</p>
                </div>
              </div>

              <div class="mt-xl flex items-start gap-3">
                <img
                  :src="AgentChatIcon"
                  alt=""
                  class="h-8 w-8 shrink-0 rounded-full"
                  aria-hidden="true"
                />

                <div class="min-w-0 flex-1">
                  <div v-if="message.isLoading" class="rounded-2xl lg:px-3xl py-xs">
                    <p class="primary_text_color body_3_regular">
                      Got it, give me a moment<span class="loading-dots" />
                    </p>
                  </div>

                  <div v-else-if="message.aiResponse">
                    <div
                      class="chat-markdown Body_2_regular primary_text_color lg:px-3xl pt-sm pb-md"
                      v-html="formatMarkdownToHtml(message.aiResponse)"
                    />

                    <ChatActionBar
                      :is-liked="message.isLiked"
                      :is-disliked="message.isDisliked"
                      :padded="false"
                      compact-icons
                      show-regenerate
                      @copy="handleCopy(message.aiResponse)"
                      @like="toggleChatReaction(index, 'like')"
                      @dislike="toggleChatReaction(index, 'dislike')"
                      @regenerate="handleRegenerate(index)"
                    />
                  </div>
                </div>
              </div>
            </article>
          </template>

          <div ref="scrollAnchor" class="h-px" />
        </div>
      </div>

      <div ref="promptSectionRef" class="shrink-0 px-6xl pb-2xl pt-2">
        <div class="mx-auto max-w-3xl">
          <p
            v-if="isReconnecting && !isConnected"
            class="connecting-status mb-md text-center caption_1_regular secondary_text_color"
          >
            {{ connectingLabel }}<span class="loading-dots" />
          </p>

          <PromptBox
            :is-ai-generating="isLoading || isReconnecting"
            :initial-product-id="promptProductId"
            @send-message="handleSendMessage"
          />

          <div class="text-center p-xl">
            <p class="body_4_regular tertiary_text_color">
              Genius AI can make mistakes. Please check for accuracy.
            </p>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { computed, nextTick, onUnmounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { ChatActionBar, PromptBox } from '@ai-suite/shared-ui'
import AgentChatIcon from '../../../assets/images/agents/dashboard/chatIcon.svg'
import { useDashboardChatWebSocket } from '../../../composables/useDashboardChatWebSocket.js'
import { apiService } from '../../../services/agentApi.js'
import { extractChatFromCreateResponse } from '../../../services/agents/chats.js'
import { createGroupChat } from '../../../services/agents/multi/chats.js'
import { clearCreatedAgentContext } from '../../../services/agents/selectedAgent.js'
import { formatMarkdownToHtml } from '../../../utils/formatMarkdownToHtml.js'

const props = defineProps({
  mode: {
    type: String,
    default: 'single',
    validator: (value) => ['single', 'multi'].includes(value),
  },
  agent: {
    type: Object,
    default: null,
  },
  group: {
    type: Object,
    default: null,
  },
  createdContext: {
    type: Object,
    default: null,
  },
  selectedChatId: {
    type: [String, Number],
    default: null,
  },
})

const emit = defineEmits(['chat-created', 'chat-used'])

const route = useRoute()

const chatMessages = ref([])
const chatId = ref(null)
const isLoading = ref(false)
const loadingHistory = ref(false)
const promptSectionRef = ref(null)
const scrollAnchor = ref(null)

const scopeId = computed(() =>
  props.mode === 'multi' ? props.group?.id : props.agent?.id
)

const connectingLabel = computed(() =>
  props.mode === 'multi' ? 'Connecting to multi-agent system' : 'Connecting to agent'
)

const promptProductId = computed(() =>
  props.mode === 'single' ? props.agent?.id : undefined
)

const {
  isConnected,
  isReconnecting,
  connect,
  disconnect,
  reconnect,
  ensureConnected,
  send,
  setOnMessage,
} = useDashboardChatWebSocket(props.mode)

const hasMessages = computed(
  () => chatMessages.value.length > 0
)

setOnMessage((data) => {
  console.log('[AgentDashboardChat] WS message received:', data)
  if (data.type === 'streaming_chunk' && data.content) {
    let pendingIndex = -1
    for (let i = chatMessages.value.length - 1; i >= 0; i--) {
      if (chatMessages.value[i].isLoading || chatMessages.value[i].isStreaming) {
        pendingIndex = i
        break
      }
    }
    console.log('[AgentDashboardChat] streaming_chunk pendingIndex:', pendingIndex)

    if (pendingIndex === -1) return
    const pendingMessage = chatMessages.value[pendingIndex]

    chatMessages.value[pendingIndex] = {
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
    for (let i = chatMessages.value.length - 1; i >= 0; i--) {
      if (chatMessages.value[i].isLoading || chatMessages.value[i].isStreaming) {
        pendingIndex = i
        break
      }
    }
    console.log('[AgentDashboardChat] streaming_complete pendingIndex:', pendingIndex)

    if (pendingIndex !== -1) {
      const pendingMessage = chatMessages.value[pendingIndex]
      chatMessages.value[pendingIndex] = {
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
    for (let i = chatMessages.value.length - 1; i >= 0; i--) {
      if (chatMessages.value[i].isLoading || chatMessages.value[i].isStreaming) {
        pendingIndex = i
        break
      }
    }
    console.log('[AgentDashboardChat] agent_response pendingIndex:', pendingIndex)

    if (pendingIndex !== -1) {
      const pendingMessage = chatMessages.value[pendingIndex]
      chatMessages.value[pendingIndex] = {
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
    for (let i = chatMessages.value.length - 1; i >= 0; i--) {
      if (chatMessages.value[i].isLoading || chatMessages.value[i].isStreaming) {
        pendingIndex = i
        break
      }
    }
    console.log('[AgentDashboardChat] error pendingIndex:', pendingIndex)

    if (pendingIndex !== -1) {
      const pendingMessage = chatMessages.value[pendingIndex]
      chatMessages.value[pendingIndex] = {
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
})

watch(
  () => props.selectedChatId,
  async (nextChatId) => {
    if (!nextChatId) {
      chatId.value = null
      chatMessages.value = []
      disconnect()
      return
    }

    chatId.value = nextChatId
    await loadChatHistory(nextChatId)

    if (scopeId.value) {
      try {
        await reconnect(scopeId.value, nextChatId)
      } catch {
        connect(scopeId.value, nextChatId)
      }
    }
  },
  { immediate: true }
)

function extractHistory(response) {
  if (response?.data?.conversations) return response.data.conversations
  if (response?.conversations) return response.conversations
  if (Array.isArray(response?.data)) return response.data
  if (Array.isArray(response)) return response
  return []
}

function mapHistoryToMessages(history) {
  const messages = []

  history.forEach((item, index) => {
    const userText =
      item.user_message ??
      item.userMessage ??
      (item.role === 'user' ? item.content?.value ?? item.content : null)

    const aiText =
      item.agent_response ??
      item.agentResponse ??
      item.ai_response ??
      (item.role === 'assistant' ? item.content?.value ?? item.content : null)

    if (userText) {
      messages.push({
        id: `user_${item.id ?? index}`,
        text: String(userText),
        isLoading: false,
        aiResponse: null,
        isLiked: false,
        isDisliked: false,
        historyOnly: true,
      })
    }

    if (aiText) {
      const last = messages[messages.length - 1]
      if (last && !last.aiResponse && last.text) {
        last.aiResponse = String(aiText)
      } else {
        messages.push({
          id: `ai_${item.id ?? index}`,
          text: '',
          isLoading: false,
          aiResponse: String(aiText),
          isLiked: false,
          isDisliked: false,
          historyOnly: true,
        })
      }
    }
  })

  return messages
}

async function loadChatHistory(activeChatId) {
  loadingHistory.value = true
  chatMessages.value = []

  try {
    const response = await apiService.getChatHistory(activeChatId)
    chatMessages.value = mapHistoryToMessages(extractHistory(response))
  } catch {
    chatMessages.value = []
  } finally {
    loadingHistory.value = false
  }

  await scrollToBottom()
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
  const message = chatMessages.value[index]
  if (!message) return

  if (type === 'like') {
    message.isLiked = !message.isLiked
    if (message.isLiked) message.isDisliked = false
    return
  }

  message.isDisliked = !message.isDisliked
  if (message.isDisliked) message.isLiked = false
}

async function scrollToBottom() {
  await nextTick()
  scrollAnchor.value?.scrollIntoView({ behavior: 'smooth', block: 'end' })
}

async function ensureChatForMessage(messageData) {
  if (chatId.value) return chatId.value

  if (props.mode === 'multi') {
    const created = await createGroupChat(
      props.group.id,
      messageData.text.slice(0, 80) || 'New Chat'
    )

    const id = created?.id ?? created?.chat_id
    if (!id) throw new Error('Could not create chat.')

    chatId.value = id
    emit('chat-created', { id, name: created?.name ?? 'New Chat' })

    if (scopeId.value) {
      await reconnect(scopeId.value, id)
    }

    return id
  }

  const created = await apiService.createChat(
    props.agent.id,
    messageData.text.slice(0, 80) || 'New Chat'
  )

  const chat = extractChatFromCreateResponse(created)
  if (!chat?.id) throw new Error('Could not create chat.')

  chatId.value = chat.id
  emit('chat-created', created)

  if (scopeId.value) {
    await reconnect(scopeId.value, chat.id)
  }

  return chat.id
}

async function handleSendMessage(messageData) {
  if (isLoading.value || !scopeId.value) return

  isLoading.value = true
  const nextIndex = chatMessages.value.length
  chatMessages.value.push({
    id: `pending_${Date.now()}`,
    text: messageData.text,
    isLoading: true,
    isStreaming: false,
    aiResponse: null,
    isLiked: false,
    isDisliked: false,
  })

  if (props.mode === 'single' && route.query.created === '1') {
    clearCreatedAgentContext()
  }

  await scrollToBottom()

  try {
    const activeChatId = await ensureChatForMessage(messageData)
    emit('chat-used', activeChatId)

    await ensureConnected(scopeId.value, activeChatId)
    send(messageData.text)
  } catch (err) {
    chatMessages.value[nextIndex] = {
      ...chatMessages.value[nextIndex],
      isLoading: false,
      isStreaming: false,
      aiResponse: err?.message || 'Sorry, something went wrong. Please try again.'
    }
    isLoading.value = false
    await scrollToBottom()
  }
}

async function handleRegenerate(index) {
  const message = chatMessages.value[index]
  if (!message?.text || isLoading.value || !scopeId.value || !chatId.value) return

  isLoading.value = true
  chatMessages.value.push({
    id: `pending_${Date.now()}`,
    text: message.text,
    isLoading: true,
    isStreaming: false,
    aiResponse: null,
    isLiked: false,
    isDisliked: false,
  })

  await scrollToBottom()

  try {
    await ensureConnected(scopeId.value, chatId.value)
    send(message.text)
  } catch (err) {
    const lastIndex = chatMessages.value.length - 1
    chatMessages.value[lastIndex] = {
      ...chatMessages.value[lastIndex],
      isLoading: false,
      aiResponse: err?.message || 'Sorry, something went wrong. Please try again.',
    }
    isLoading.value = false
    await scrollToBottom()
  }
}

function focusPrompt() {
  promptSectionRef.value?.querySelector('textarea, input')?.focus()
}

onUnmounted(() => {
  disconnect()
})

defineExpose({ focusPrompt, hasMessages })
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
