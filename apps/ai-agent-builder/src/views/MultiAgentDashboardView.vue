<template>
  <div class="flex h-screen w-full overflow-hidden bg_primary_color">
    <div v-if="loading" class="flex flex-1 items-center justify-center py-10xl">
      <div class="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-info-500" />
    </div>

    <p
      v-else-if="error"
      class="label_2_regular text-error-600 flex flex-1 items-center justify-center px-6xl py-8xl text-center"
    >
      {{ error }}
    </p>

    <template v-else>
      <MultiAgentDashboardSidebar
        ref="sidebarRef"
        :group="group"
        :chats="chats"
        :loading-chats="loadingChats"
        :loading-more-chats="loadingMoreChats"
        :creating-chat="creatingChat"
        :selected-chat-id="selectedChatId"
        :pagination="chatPagination"
        :loading-group="false"
        :saving-group="savingGroup"
        :group-error="groupError"
        :initial-tab="initialSidebarTab"
        @select-chat="handleSelectChat"
        @create-chat="handleCreateChat"
        @delete-chat="handleDeleteChat"
        @rename-chat="handleRenameChat"
        @page-change="handleChatPageChange"
        @save-group="handleSaveGroup"
        @sub-sidebar-changed="isSubSidebarOpen = $event"
      />

      <div
        class="flex min-h-0 min-w-0 flex-1 flex-col transition-[margin] duration-500 ease-out"
        :class="isSubSidebarOpen ? 'lg:ml-0' : ''"
      >
        <template v-if="!showSetupView">
          <header
            class="flex shrink-0 items-center justify-between gap-4xl border-b primary_border_color px-6xl py-4xl"
          >
            <div class="flex min-w-0 items-center gap-4xl">
              <h1 class="label_1_semibold primary_text_color truncate rounded-xl border primary_border_color px-4xl py-md">
                {{ group?.name || 'Multi-Agent System' }}
              </h1>
              <span
                class="caption_1_medium shrink-0 rounded-lg border border-info-200 bg-info-50 px-md py-xs text-info-600"
              >
                {{ statusLabel }}
              </span>
            </div>

            <div class="flex shrink-0 items-center gap-md">
              <VoiceToggle
                v-if="chatRef"
                :model-value="chatRef.voiceEnabled"
                @update:model-value="chatRef.handleVoiceToggle"
              />

              <button
                v-if="hasChatMessages"
                type="button"
                class="inline-flex items-center gap-md rounded-lg border primary_border_color bg_secondary_color px-4xl py-md label_2_medium primary_text_color hover:bg-gray-25 disabled:opacity-50"
                :disabled="creatingChat"
                @click="handleCreateChat"
              >
                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span class="hidden sm:inline">New Chat</span>
              </button>

              <button
                type="button"
                class="primary_add_button inline-flex shrink-0 items-center gap-md rounded-lg px-5xl py-md label_2_semibold primary_2_text_color"
                @click="showSetupView = true"
              >
                <span class="hidden sm:inline">Run</span>
                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </header>

          <AgentDashboardChat
            ref="chatRef"
            mode="multi"
            :group="group"
            :selected-chat-id="selectedChatId"
            @chat-created="handleChatCreated"
            @chat-used="handleChatUsed"
          />
        </template>
        <template v-else>
          <AgentSetupView
            :group="group"
            mode="multi"
            @back="showSetupView = false"
          />
        </template>
      </div>
    </template>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import MultiAgentDashboardSidebar from '../components/agents/multi/MultiAgentDashboardSidebar.vue'
import AgentDashboardChat from '../components/agents/dashboard/AgentDashboardChat.vue'
import AgentSetupView from '../components/agents/dashboard/AgentSetupView.vue'
import VoiceToggle from '../components/agents/dashboard/VoiceToggle.vue'
import {
  createGroupChat,
  fetchGroupChats,
  renameGroupChat,
} from '../services/agents/multi/chats.js'
import {
  fetchGroupDetails,
  updateMultiAgentGroup,
} from '../services/agents/multi/details.js'
import { getStatusLabel } from '../services/agents/agents.js'

const route = useRoute()
const router = useRouter()

const loading = ref(true)
const error = ref('')
const group = ref(null)
const chatRef = ref(null)
const sidebarRef = ref(null)
const showSetupView = ref(false)

const chats = ref([])
const loadingChats = ref(false)
const loadingMoreChats = ref(false)
const creatingChat = ref(false)
const selectedChatId = ref(null)
const savingGroup = ref(false)
const groupError = ref('')
const isSubSidebarOpen = ref(false)
const chatPagination = ref({
  currentPage: 1,
  totalPages: 1,
  totalItems: 0,
  itemsPerPage: 50,
  hasNext: false,
  hasPrev: false,
})

const statusLabel = computed(() => getStatusLabel(group.value?.status ?? 'published'))

const hasChatMessages = computed(
  () => Boolean(selectedChatId.value) || chats.value.length > 0
)

const initialSidebarTab = computed(() => {
  if (route.query.created === '1') return 'group'
  if (route.query.tab) return String(route.query.tab)
  return 'chat'
})

function focusPrompt() {
  chatRef.value?.focusPrompt()
}

function prependChatToList(chat) {
  if (!chat?.id) return

  const exists = chats.value.some((item) => String(item.id) === String(chat.id))
  if (!exists) {
    chats.value.unshift(chat)
    chatPagination.value.totalItems += 1
  }
}

function updateRouteQuery(patch) {
  router.replace({
    path: route.path,
    query: {
      ...route.query,
      ...patch,
    },
  }).catch(() => {})
}

function clearChatIdFromUrl() {
  const nextQuery = { ...route.query }
  delete nextQuery.chat_id
  router.replace({ path: route.path, query: nextQuery }).catch(() => {})
}

async function loadGroup(groupId) {
  loading.value = true
  error.value = ''

  try {
    group.value = await fetchGroupDetails(groupId)
    await loadChats()
  } catch (err) {
    error.value = err?.message || 'Failed to load multi-agent system.'
    group.value = null
  } finally {
    loading.value = false
  }
}

async function loadChats(page = 1) {
  if (!group.value?.id) return

  const isPageChange = page !== chatPagination.value.currentPage
  if (isPageChange) loadingMoreChats.value = true
  else loadingChats.value = true

  try {
    const result = await fetchGroupChats(group.value.id, page)
    chats.value = result.chats
    chatPagination.value = result.pagination

    if (page === 1) {
      await handleUrlBasedChatSelection()
    }
  } catch {
    chats.value = []
  } finally {
    loadingChats.value = false
    loadingMoreChats.value = false
  }
}

async function handleUrlBasedChatSelection() {
  const chatIdFromUrl = route.query.chat_id

  if (chatIdFromUrl) {
    const matchingChat = chats.value.find(
      (chat) => String(chat.id) === String(chatIdFromUrl)
    )

    if (matchingChat) {
      selectedChatId.value = matchingChat.id
      return
    }
  }

  if (chats.value.length > 0) {
    const firstChat = chats.value[0]
    selectedChatId.value = firstChat.id
    updateRouteQuery({ chat_id: String(firstChat.id) })
    return
  }

  selectedChatId.value = null
  clearChatIdFromUrl()
}

function handleSelectChat(chatId) {
  if (String(selectedChatId.value) === String(chatId)) return
  selectedChatId.value = chatId
  updateRouteQuery({ chat_id: String(chatId) })
}

async function handleCreateChat() {
  if (!group.value?.id || creatingChat.value) return

  creatingChat.value = true

  try {
    const chat = await createGroupChat(group.value.id, 'New Chat')
    if (!chat?.id) throw new Error('Could not create chat.')

    prependChatToList(chat)
    handleSelectChat(chat.id)
    sidebarRef.value?.setActiveTab('chat')
  } catch (err) {
    error.value = err?.message || 'Failed to create chat.'
  } finally {
    creatingChat.value = false
  }
}

function handleChatCreated(chat) {
  if (!chat?.id) return

  prependChatToList({
    id: chat.id,
    name: chat.name ?? 'New Chat',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  })
  handleSelectChat(chat.id)
}

function handleChatUsed(chatId) {
  if (!selectedChatId.value) {
    handleSelectChat(chatId)
  }
}

function handleDeleteChat(chatId) {
  chats.value = chats.value.filter((chat) => String(chat.id) !== String(chatId))

  if (String(selectedChatId.value) === String(chatId)) {
    if (chats.value.length > 0) {
      handleSelectChat(chats.value[0].id)
    } else {
      selectedChatId.value = null
      clearChatIdFromUrl()
    }
  }

  chatPagination.value.totalItems = Math.max(0, chatPagination.value.totalItems - 1)
}

async function handleRenameChat({ chatId, name }) {
  try {
    await renameGroupChat(chatId, name)
  } catch {
    // optimistic rename still applies below
  }

  const chatIndex = chats.value.findIndex((chat) => String(chat.id) === String(chatId))
  if (chatIndex !== -1) {
    chats.value[chatIndex] = {
      ...chats.value[chatIndex],
      name,
      updated_at: new Date().toISOString(),
    }
  }
}

function handleChatPageChange(page) {
  loadChats(page)
}

async function handleSaveGroup({ groupName, description, agentIds }) {
  if (!group.value?.id || savingGroup.value) return

  savingGroup.value = true
  groupError.value = ''

  try {
    await updateMultiAgentGroup({
      groupId: group.value.id,
      groupName,
      description,
      agentIds,
    })

    group.value = await fetchGroupDetails(group.value.id)
  } catch (err) {
    groupError.value = err?.message || 'Failed to update group.'
  } finally {
    savingGroup.value = false
  }
}

onMounted(async () => {
  const groupId = route.query.group_id
  if (!groupId) {
    error.value = 'No multi-agent system selected.'
    loading.value = false
    return
  }

  if (route.query.chat_id) {
    selectedChatId.value = route.query.chat_id
  }

  await loadGroup(groupId)
})

watch(
  () => route.query.group_id,
  (groupId) => {
    if (groupId) loadGroup(groupId)
  }
)

watch(
  () => route.query.chat_id,
  (newChatId, oldChatId) => {
    if (!newChatId || newChatId === oldChatId) return
    if (String(selectedChatId.value) === String(newChatId)) return

    const matchingChat = chats.value.find(
      (chat) => String(chat.id) === String(newChatId)
    )

    if (matchingChat) {
      selectedChatId.value = matchingChat.id
    }
  }
)
</script>
