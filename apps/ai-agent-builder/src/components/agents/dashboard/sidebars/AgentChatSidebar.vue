<template>
  <AgentDashboardSubSidebarShell
    title="Chats"
    tooltip-text="View and manage your recent conversations with this agent."
    :is-open="isOpen"
    @close="$emit('close')"
  >
    <div v-if="loading" class="flex items-center justify-center py-10xl">
      <div class="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-info-500" />
    </div>

    <div v-else-if="chats.length === 0" class="py-8xl text-center">
      <p class="label_2_medium primary_text_color">No chats yet</p>
      <p class="body_3_regular secondary_text_color mt-sm">Start a conversation to see it here.</p>
    </div>

    <ul v-else class="space-y-sm">
      <li
        v-for="chat in chats"
        :key="chat.id"
        class="group cursor-pointer relative rounded-xl border px-3xl py-xl transition-colors"
        :class="
          selectedChatId === chat.id
            ? 'border-info-200 bg-info-50'
            : 'primary_border_color hover:bg-gray-25'
        "
         @click="$emit('select-chat', chat.id)"
      >
        <div
          class="flex w-[90%] items-center justify-between gap-md text-left"
        >
          <input
            v-if="chatToRename === chat.id"
            ref="renameInputRef"
            v-model="newChatTitle"
            type="text"
            class="w-full bg-transparent border-none outline-none label_2_medium primary_text_color"
            placeholder="Enter chat title..."
            @blur="confirmRename"
            @keydown.enter="confirmRename"
            @keydown.escape="cancelRename"
            @click.stop
          />
          <template v-else>
            <span class="label_2_medium primary_text_color truncate">
              {{ getChatTitle(chat) }}
            </span>
            <span class="label_3_regular tertiary_text_color shrink-0">
              {{ formatDate(chat.updated_at || chat.created_at) }}
            </span>
          </template>
        </div>

        <div
          :ref="(el) => setChatOptionsRef(chat.id, el)"
          class="absolute right-2 top-2"
        >
          <button
            type="button"
            class="rounded-lg p-xs opacity-0 transition-all duration-200 group-hover:opacity-100 hover:bg-gray-50-hover"
            :class="{ 'opacity-100': openMenuId === chat.id }"
            aria-label="Chat options"
            @click.stop="toggleMenu(chat.id)"
          >
            <svg
              class="h-4 w-4 rotate-90 secondary_text_color"
              fill="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
            </svg>
          </button>

          <div
            v-if="openMenuId === chat.id"
            class="absolute right-0 top-8 z-50 min-w-[120px] overflow-hidden rounded-lg border primary_border_color bg_secondary_color py-xs shadow-lg"
          >
            <button
              type="button"
              class="block w-full px-md py-sm text-left label_3_medium primary_text_color transition-colors hover:bg-info-50"
              @click.stop="handleRenameChat(chat.id)"
            >
              Rename
            </button>
            <button
              type="button"
              class="block w-full px-md py-sm text-left label_3_medium text-error-600 transition-colors hover:bg-error-50 disabled:opacity-50"
              :disabled="deletingChatId === chat.id"
              @click.stop="handleDeleteChat(chat.id)"
            >
              Delete
            </button>
          </div>
        </div>
      </li>
    </ul>

    <div v-if="pagination.totalPages > 1" class="mt-4xl flex items-center justify-center gap-md">
      <button
        type="button"
        class="rounded-lg border primary_border_color px-md py-sm label_3_medium disabled:opacity-40"
        :disabled="!pagination.hasPrev || loadingMore"
        @click="$emit('page-change', pagination.currentPage - 1)"
      >
        Prev
      </button>
      <span class="caption_1_regular secondary_text_color">
        {{ pagination.currentPage }} / {{ pagination.totalPages }}
      </span>
      <button
        type="button"
        class="rounded-lg border primary_border_color px-md py-sm label_3_medium disabled:opacity-40"
        :disabled="!pagination.hasNext || loadingMore"
        @click="$emit('page-change', pagination.currentPage + 1)"
      >
        Next
      </button>
    </div>

    <template #footer>
      <button
        type="button"
        class="primary_add_button w-full rounded-lg px-4xl py-md label_2_semibold primary_2_text_color"
        :disabled="creating"
        @click="$emit('create-chat')"
      >
        {{ creating ? 'Creating...' : 'New Chat' }}
      </button>
    </template>
  </AgentDashboardSubSidebarShell>


  <SuccessToastNotification
    :open="toastOpen"
    :main-message="toastMessage"
    :secondary-message="toastSecondaryMessage"
    :type="toastType"
    @close="toastOpen = false"
  />
</template>

<script setup>
import { nextTick, onMounted, onUnmounted, ref } from 'vue'
import { SuccessToastNotification } from '@ai-suite/shared-ui'
import AgentDashboardSubSidebarShell from '../AgentDashboardSubSidebarShell.vue'
import { deleteAgentChat, renameAgentChat } from '../../../../services/agents/chats.js'

const props = defineProps({
  isOpen: { type: Boolean, default: false },
  chats: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  loadingMore: { type: Boolean, default: false },
  creating: { type: Boolean, default: false },
  selectedChatId: { type: [String, Number], default: null },
  pagination: {
    type: Object,
    default: () => ({
      currentPage: 1,
      totalPages: 1,
      totalItems: 0,
      itemsPerPage: 50,
      hasNext: false,
      hasPrev: false,
    }),
  },
})

const emit = defineEmits(['close', 'select-chat', 'create-chat', 'delete-chat', 'rename-chat', 'page-change'])

const openMenuId = ref(null)
const chatOptionsRefs = ref({})
const chatToRename = ref(null)
const newChatTitle = ref('')
const renameInputRef = ref(null)
const deletingChatId = ref(null)
const renamingChat = ref(false)
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

function getChatTitle(chat) {
  const name = chat?.name || chat?.title || 'New Chat'
  return name.charAt(0).toUpperCase() + name.slice(1)
}

function formatDate(value) {
  if (!value) return ''
  try {
    const date = new Date(value)
    const now = new Date()
    const diffMinutes = Math.floor((now - date) / (1000 * 60))
    if (diffMinutes < 1) return 'Just now'
    if (diffMinutes < 60) return `${diffMinutes}m ago`
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h ago`
    return date.toLocaleDateString()
  } catch {
    return ''
  }
}

function setChatOptionsRef(chatId, el) {
  if (el) {
    chatOptionsRefs.value[chatId] = el
  } else {
    delete chatOptionsRefs.value[chatId]
  }
}

function toggleMenu(chatId) {
  openMenuId.value = openMenuId.value === chatId ? null : chatId
}

function handleRenameChat(chatId) {
  const chat = props.chats.find((item) => String(item.id) === String(chatId))
  if (!chat) return

  chatToRename.value = chatId
  newChatTitle.value = getChatTitle(chat)
  openMenuId.value = null

  nextTick(() => {
    if (renameInputRef.value) {
      if (Array.isArray(renameInputRef.value)) {
        renameInputRef.value[0]?.focus?.()
        renameInputRef.value[0]?.select?.()
      } else {
        renameInputRef.value.focus?.()
        renameInputRef.value.select?.()
      }
    }
  })
}

async function confirmRename() {
  const trimmed = newChatTitle.value.trim()
  if (!chatToRename.value || !trimmed || renamingChat.value) return

  renamingChat.value = true

  try {
    await renameAgentChat(chatToRename.value, trimmed)
    showToast('Chat renamed successfully')
    emit('rename-chat', { chatId: chatToRename.value, name: trimmed })
    cancelRename()
  } catch (error) {
    console.error('Error renaming chat:', error)
    showToast('Failed to rename chat', error?.message || 'Please try again.', 'error')
    cancelRename()
  } finally {
    renamingChat.value = false
  }
}

function cancelRename() {
  newChatTitle.value = ''
  chatToRename.value = null
}

async function handleDeleteChat(chatId) {
  if (deletingChatId.value) return

  deletingChatId.value = chatId
  openMenuId.value = null

  try {
    await deleteAgentChat(chatId)
    showToast('Chat deleted successfully')
    emit('delete-chat', chatId)
  } catch (error) {
    console.error('Error deleting chat:', error)
    showToast('Failed to delete chat', error?.message || 'Please try again.', 'error')
  } finally {
    deletingChatId.value = null
  }
}

function handleClickOutside(event) {
  if (!openMenuId.value) return

  const menuElement = chatOptionsRefs.value[openMenuId.value]
  if (menuElement && !menuElement.contains(event.target)) {
    openMenuId.value = null
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>
