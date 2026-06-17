<template>
  <div class="flex min-h-0 flex-1 flex-col relative">
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
            <ChatMessageItem
              v-for="(message, index) in chatMessages"
              :key="`chat-${message.id ?? index}`"
              :message="message"
              :index="index"
              :playing-message-index="playingMessageIndex"
              :chat-id="chatId"
              @like="toggleChatReaction(index, 'like')"
              @dislike="toggleChatReaction(index, 'dislike')"
              @regenerate="handleRegenerate"
              @toggle-audio="handleToggleAudio"
              @toast="showToast"
            />
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
              AI Agent can make mistakes. Please check for accuracy.
            </p>
          </div>
        </div>
      </div>
    </template>
  </div>

  <SuccessToastNotification
    :open="toastOpen"
    :main-message="toastMessage"
    :secondary-message="toastSecondaryMessage"
    :type="toastType"
    @close="toastOpen = false"
  />
</template>

<script setup>
import { computed, nextTick, onUnmounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { PromptBox, SuccessToastNotification } from '@ai-suite/shared-ui'
import { useDashboardChatWebSocket } from '../../../composables/useDashboardChatWebSocket.js'
import { apiService } from '../../../services/agentApi.js'
import { extractChatFromCreateResponse } from '../../../services/agents/chats.js'
import { createGroupChat } from '../../../services/agents/multi/chats.js'
import { clearCreatedAgentContext } from '../../../services/agents/selectedAgent.js'
import VoiceToggle from './VoiceToggle.vue'
import ChatMessageItem from './ChatMessageItem.vue'

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

const toastType = ref('success')
const toastOpen = ref(false)
const toastMessage = ref('')
const toastSecondaryMessage = ref('')

function showToast(mainMessage, secondaryMessage = '', type = 'success') {
  toastMessage.value = mainMessage
  toastSecondaryMessage.value = secondaryMessage
  toastType.value = type
  toastOpen.value = true
}

const route = useRoute()

const chatMessages = ref([])
const chatId = ref(null)
const isLoading = ref(false)
const loadingHistory = ref(false)
const promptSectionRef = ref(null)
const scrollAnchor = ref(null)

const voiceEnabled = ref(true)
const currentAudio = ref(null)
const playingMessageIndex = ref(-1)

watch(
  [() => props.agent, () => props.group],
  () => {
    if (props.mode === 'multi') {
      if (props.group && props.group.voice !== undefined) {
        voiceEnabled.value = Boolean(props.group.voice)
      }
    } else {
      if (props.agent && props.agent.voice !== undefined) {
        voiceEnabled.value = Boolean(props.agent.voice)
      }
    }
  },
  { immediate: true }
)

async function handleVoiceToggle(nextVal) {
  voiceEnabled.value = nextVal
  if (!nextVal) {
    stopAllAudio()
  }

  try {
    if (props.mode === 'multi') {
      if (props.group?.id) {
        const agentIds = props.group.agents.map((a) => a.id)
        await apiService.updateAgentGroup(
          props.group.id,
          agentIds,
          props.group.name,
          props.group.description,
          nextVal,
          props.group.redirectionRules
        )
        props.group.voice = nextVal
      }
    } else {
      if (props.agent?.id) {
        await apiService.updateAgent(props.agent.id, { voice: nextVal })
        props.agent.voice = nextVal
      }
    }

    if (scopeId.value && chatId.value) {
      try {
        await reconnect(scopeId.value, chatId.value)
      } catch (err) {
        connect(scopeId.value, chatId.value)
      }
    }
  } catch (err) {
    console.error('[AgentDashboardChat] Failed to sync voice setting with backend:', err)
  }
}

function stopAllAudio() {
  if (currentAudio.value) {
    currentAudio.value.pause()
    currentAudio.value = null
  }
  playingMessageIndex.value = -1
}

function playAudio(base64Audio, index) {
  stopAllAudio()

  let audioUrl = base64Audio
  if (!audioUrl.startsWith('data:')) {
    audioUrl = `data:audio/mp3;base64,${audioUrl}`
  }

  const audio = new Audio(audioUrl)
  currentAudio.value = audio
  playingMessageIndex.value = index

  audio.play().catch((err) => {
    console.error('[AgentDashboardChat] Failed to play audio:', err)
  })

  audio.onended = () => {
    if (playingMessageIndex.value === index) {
      playingMessageIndex.value = -1
      currentAudio.value = null
    }
  }
}

function handleToggleAudio(base64Audio, index) {
  if (playingMessageIndex.value === index) {
    stopAllAudio()
  } else {
    playAudio(base64Audio, index)
  }
}

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
          : (data.response || 'Sorry, I encountered an error while processing your message.'),
        audio: data.audio || null
      }

      if (voiceEnabled.value && data.audio && data.success) {
        playAudio(data.audio, pendingIndex)
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

    if (nextChatId === chatId.value) {
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
  stopAllAudio()
})

defineExpose({ focusPrompt, hasMessages, voiceEnabled, handleVoiceToggle })
</script>

<style scoped>
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
