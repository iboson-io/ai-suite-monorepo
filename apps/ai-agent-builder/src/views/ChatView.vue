<template>
  <div class="flex h-full min-h-0 flex-1 flex-col relative">
    <div class="absolute top-4 right-6 z-30">
      <VoiceToggle :model-value="voiceEnabled" @update:model-value="handleVoiceToggle" />
    </div>
    <main
      v-if="!hasMessages"
      class="flex min-h-0 flex-1 items-start bg_primary_color px-6xl pt-13xl pb-10xl lg:py-10xl lg:items-center"
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

        <div class="max-w-3xl mx-auto">
          <PromptBox
            :is-ai-generating="isLoading"
            :initial-product-id="selectedAgentId"
            :show-all-products-option="false"
            placeholder="Ask a question, select an agent, or create a new one"
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
      <div class="min-h-0 flex-1 overflow-y-auto custom_scrollbar px-6xl pt-13xl pb-8xl">
        <div class="mx-auto flex w-full max-w-3xl flex-col gap-7">
          <ChatMessageItem
            v-for="(message, index) in messages"
            :key="index"
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
          <div ref="scrollAnchor" class="h-64 md:h-56" />
        </div>
      </div>

      <div
        class="fixed bottom-0 left-0 right-0 z-40 bg_primary_color px-4 transition-all duration-300 ease-in-out md:px-6"
        :class="[
          isSidebarCollapsed ? 'lg:left-16' : 'lg:left-64'
        ]"
      >
        <div class="mx-auto w-full max-w-3xl">
          <PromptBox
            :is-ai-generating="isLoading"
            :initial-product-id="selectedAgentId"
            :show-all-products-option="false"
            :disable-product-select="true"
            placeholder="What's on your mind?"
            @send-message="handleFollowUpMessage"
          />
          <div class="text-center p-xl">
            <p class="body_4_regular tertiary_text_color">
              AI Agent can make mistakes. Please check for accuracy.
            </p>
          </div>
        </div>
      </div>
    </section>

    <SuccessToastNotification
      :open="toastOpen"
      :main-message="toastMessage"
      :secondary-message="toastSecondaryMessage"
      :type="toastType"
      @close="toastOpen = false"
    />
  </div>
</template>

<script setup>
import { ref, watch, computed, nextTick, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { PromptBox, SuccessToastNotification } from '@ai-suite/shared-ui'
import ManageAgentsBanner from '../components/home/ManageAgentsBanner.vue'
import VoiceToggle from '../components/agents/dashboard/VoiceToggle.vue'
import { apiService } from '../services/agentApi.js'
import { useDashboardChatWebSocket } from '../composables/useDashboardChatWebSocket.js'
import ChatMessageItem from '../components/agents/dashboard/ChatMessageItem.vue'

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

const router = useRouter()
const hasMessages = ref(false)
const messages = ref([])
const chatId = ref(null)
const selectedAgentId = ref(null)
const isMulti = ref(false)
const isLoading = ref(false)
const scrollAnchor = ref(null)

const voiceEnabled = ref(true)
const currentAudio = ref(null)
const playingMessageIndex = ref(-1)

async function loadVoiceSetting(targetId, isGroup) {
  if (!targetId) return
  try {
    if (isGroup) {
      const response = await apiService.fetchGroupAgents(targetId)
      const groupData = response?.data?.group ?? response?.group
      if (groupData && groupData.voice !== undefined) {
        voiceEnabled.value = Boolean(groupData.voice)
      }
    } else {
      const response = await apiService.getAgentById(targetId)
      const agentData = response?.data?.agent ?? response?.agent ?? response
      if (agentData && agentData.voice !== undefined) {
        voiceEnabled.value = Boolean(agentData.voice)
      }
    }
  } catch (err) {
    console.error('[ChatView] Failed to load voice setting:', err)
  }
}

watch(
  () => selectedAgentId.value,
  (newId) => {
    if (newId) {
      loadVoiceSetting(newId, isMulti.value)
    }
  }
)

async function getGroupAgentIds(groupId) {
  try {
    const response = await apiService.fetchGroupAgents(groupId)
    const groupData = response?.data?.group ?? response?.group
    if (groupData && Array.isArray(groupData.agents)) {
      return groupData.agents.map((a) => a.id ?? a.agent_id).filter(Boolean)
    }
  } catch (err) {
    console.error('[ChatView] Failed to fetch group agents for voice update:', err)
  }
  return []
}

async function handleVoiceToggle(nextVal) {
  voiceEnabled.value = nextVal
  if (!nextVal) {
    stopAllAudio()
  }

  const targetId = selectedAgentId.value
  if (!targetId) return

  try {
    if (isMulti.value) {
      const agentIds = await getGroupAgentIds(targetId)
      const response = await apiService.fetchGroupAgents(targetId)
      const groupData = response?.data?.group ?? response?.group
      await apiService.updateAgentGroup(
        targetId,
        agentIds,
        groupData?.group_name ?? groupData?.name ?? null,
        groupData?.description ?? null,
        nextVal,
        groupData?.redirection_rules
      )
    } else {
      await apiService.updateAgent(targetId, { voice: nextVal })
    }

    if (targetId && chatId.value) {
      try {
        await currentWs.value.reconnect(targetId, chatId.value)
      } catch (err) {
        currentWs.value.connect(targetId, chatId.value)
      }
    }
  } catch (err) {
    console.error('[ChatView] Failed to sync voice setting with backend:', err)
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
    console.error('[ChatView] Failed to play audio:', err)
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
  return (
    payload?.id ??
    payload?.chat_id ??
    payload?.data?.id ??
    payload?.data?.chat_id ??
    payload?.data?.chat?.id ??
    payload?.data?.chat?.chat_id ??
    null
  )
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
  isMulti.value = messageData.productKind === 'multi'

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
      const created = isMulti.value
        ? await apiService.createChat(null, messageData.text.slice(0, 80) || 'New Chat', agentId)
        : await apiService.createChat(agentId, messageData.text.slice(0, 80) || 'New Chat')
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
  stopAllAudio()
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
