<template>
  <div class="flex h-full min-h-0 flex-1 flex-col">
    <main
      v-if="!hasMessages"
      class="flex min-h-0 flex-1 items-start bg_primary_color px-6xl py-10xl lg:items-center"
    >
      <div class="mx-auto w-full max-w-5xl text-center">
        <div
          class="mx-auto mb-6 h-20 w-20 rounded-full bg-gradient-to-tr from-pink-400 via-purple-400 to-teal-300 shadow-[0_0_60px_rgba(168,85,247,0.25)]"
        />

        <h1 class="primary_text_color heading_h5_semibold md:heading_h4_semibold">
          Chat with your AI agent
        </h1>
        <p class="mt-md heading_h3_semibold md:heading_h3_semibold gradient_text_color">
          Automate support and resolve issues
        </p>

        <div class="">
          <PromptBox
            :is-ai-generating="isLoading"
            @send-message="handleFirstMessage"
          />
        </div>

        <ManageAgentsBanner @create-agent="goToAgents" />
      </div>
    </main>

    <section
      v-else
      class="flex min-h-0 flex-1 flex-col bg_primary_color px-6xl py-8xl"
    >
      <div class="mx-auto flex w-full max-w-3xl min-h-0 flex-1 flex-col">
        <div class="min-h-0 flex-1 space-y-6xl overflow-y-auto custom_scrollbar pr-1">
          <div
            v-for="(message, index) in messages"
            :key="index"
            class="space-y-xl"
          >
            <div class="rounded-xl bg-info-25 px-5xl py-xl text-left">
              <p class="label_2_regular primary_text_color">{{ message.text }}</p>
            </div>
            <div
              v-if="message.isLoading"
              class="rounded-xl border primary_border_color bg_secondary_color px-5xl py-xl text-left"
            >
              <p class="label_2_regular secondary_text_color">Thinking...</p>
            </div>
            <div
              v-else-if="message.aiResponse"
              class="rounded-xl border primary_border_color bg_secondary_color px-5xl py-xl text-left"
            >
              <p class="label_2_regular primary_text_color whitespace-pre-wrap">
                {{ message.aiResponse }}
              </p>
            </div>
          </div>
        </div>

        <div class="mt-6xl shrink-0">
          <PromptBox
            :is-ai-generating="isLoading"
            @send-message="handleFollowUpMessage"
          />
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { PromptBox } from '@ai-suite/shared-ui'
import ManageAgentsBanner from '../components/home/ManageAgentsBanner.vue'
import { apiService } from '../services/agentApi.js'

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
const isLoading = ref(false)

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

async function handleFirstMessage(messageData) {
  if (isLoading.value) return

  isLoading.value = true
  selectedAgentId.value = messageData.product ?? null

  messages.value = [
    {
      text: messageData.text,
      isLoading: true,
      aiResponse: null,
    },
  ]
  hasMessages.value = true

  try {
    const agentId = selectedAgentId.value
    if (!agentId) {
      throw new Error('Select an agent before sending a message.')
    }

    const created = await apiService.createChat(agentId, messageData.text.slice(0, 80) || 'New Chat')
    const newChatId = readChatId(created)
    if (!newChatId) {
      throw new Error('Could not create chat.')
    }

    chatId.value = newChatId
    emit('newSessionCreated', newChatId)

    const response = await apiService.sendMessage(newChatId, {
      role: 'user',
      content: {
        type: 'text',
        value: messageData.text,
      },
    })

    messages.value[0].isLoading = false
    messages.value[0].aiResponse = readAiResponse(response)
  } catch (error) {
    messages.value[0].isLoading = false
    messages.value[0].aiResponse = error?.message || 'Sorry, something went wrong. Please try again.'
  } finally {
    isLoading.value = false
  }
}

async function handleFollowUpMessage(messageData) {
  if (isLoading.value || !chatId.value) return

  isLoading.value = true
  const nextIndex = messages.value.length
  messages.value.push({
    text: messageData.text,
    isLoading: true,
    aiResponse: null,
  })

  try {
    const response = await apiService.sendMessage(chatId.value, {
      role: 'user',
      content: {
        type: 'text',
        value: messageData.text,
      },
    })
    messages.value[nextIndex].isLoading = false
    messages.value[nextIndex].aiResponse = readAiResponse(response)
  } catch (error) {
    messages.value[nextIndex].isLoading = false
    messages.value[nextIndex].aiResponse = error?.message || 'Sorry, something went wrong.'
  } finally {
    isLoading.value = false
  }
}

function handleNewChat() {
  hasMessages.value = false
  messages.value = []
  chatId.value = null
  selectedAgentId.value = null
  isLoading.value = false
}

async function loadExistingSession(sessionId) {
  if (!sessionId) return

  isLoading.value = true
  hasMessages.value = true
  chatId.value = sessionId

  try {
    const history = await apiService.getChatHistory(sessionId)
    const items = Array.isArray(history?.messages)
      ? history.messages
      : Array.isArray(history?.data?.messages)
        ? history.data.messages
        : Array.isArray(history)
          ? history
          : []

    messages.value = items
      .filter((item) => item?.role === 'user' || item?.role === 'assistant')
      .map((item) => ({
        text: item.role === 'user' ? readAiResponse(item.content ?? item) : '',
        isLoading: false,
        aiResponse: item.role === 'assistant' ? readAiResponse(item.content ?? item) : item.role === 'user' ? null : readAiResponse(item),
      }))
      .filter((item) => item.text || item.aiResponse)

    if (messages.value.length === 0) {
      messages.value = [{ text: 'Loaded chat', isLoading: false, aiResponse: 'Continue the conversation below.' }]
    }

    emit('sessionLoaded', sessionId)
  } catch {
    messages.value = [{
      text: 'Could not load chat history.',
      isLoading: false,
      aiResponse: 'Start a new message below.',
    }]
  } finally {
    isLoading.value = false
  }
}

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
