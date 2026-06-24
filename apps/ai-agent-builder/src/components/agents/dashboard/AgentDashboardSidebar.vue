<template>
  <div
    ref="sidebarContainer"
    class="h-full shrink-0 overflow-visible lg:relative lg:flex lg:w-auto lg:max-w-none"
    :class="[
      showSubSidebar && isMobile
        ? 'fixed left-0 top-0 z-[9999] flex w-full max-w-full'
        : 'relative flex'
    ]"
    data-sidebar-container
    @click="handleSidebarContainerClick"
  >
    <!-- Collapsible main sidebar -->
    <aside
      class="h-full flex flex-col bg_secondary_color transition-all duration-300 z-10 border-r primary_border_color"
      :class="isCollapsed ? 'w-20 px-3xl' : 'w-64 pl-4xl pr-xs'"
    >
      <div
        class="flex min-h-0 flex-1 flex-col overflow-hidden"
        :class="isCollapsed ? '' : 'pr-3xl'"
      >
        <div class="shrink-0">
          <!-- Logo + Toggle -->
          <div
            class="relative group flex items-center pt-2xl lg:pt-6xl"
            :class="isCollapsed ? 'justify-center' : 'justify-between'"
            @mouseenter="hoveredItem = 'logo'"
            @mouseleave="hoveredItem = null"
            :ref="el => { if (el) menuItemRefs['logo'] = el }"
          >
            <div class="flex items-center gap-lg">
              <div
                @click="handleToggleCollapse"
                class="relative flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center"
              >
                <img :src="AiAgentIcon" alt="" class="h-7 w-auto" />
              </div>

              <span v-if="!isCollapsed" class="heading_h5_semibold gradient_text_color cursor-pointer" @click="goToAgents">
                AI Agent
              </span>
            </div>

            <button v-if="!isCollapsed" @click="handleToggleCollapse" class="hover:bg-gray-25 p-xs rounded-lg transition-colors">
              <img :src="SidebarIcon" alt="" />
            </button>

            <Teleport to="body">
              <div v-if="isCollapsed && hoveredItem === 'logo'" :style="getTooltipStyle('logo')"
                class="pointer-events-none fixed whitespace-nowrap z-[1000] transition-all duration-200 ">
                <div
                  class="relative bg-black-400 primary_2_text_color label_2_medium rounded-lg px-xl py-md outline-none ring-0 border_none mt-11xl">
                  Open sidebar
                  <!-- Speech Bubble Tail -->
                  <div class="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-full border_none ">
                    <div class="w-0 h-0 border-t-[6px] border-b-[6px] border-r-[6px] border-transparent border-r-black-400">
                    </div>
                  </div>
                </div>
              </div>
            </Teleport>
          </div>

          <div class="block h-[1px] w-full bg-gray-25 mt-6xl"></div>

          <!-- New Chat Button -->
          <div
            class="relative group mt-6xl"
            @mouseenter="hoveredItem = 'newChat'"
            @mouseleave="hoveredItem = null"
            :ref="el => { if (el) menuItemRefs['newChat'] = el }"
          >
            <button class="button-gradient w-full" :disabled="creatingChat" @click="handleNewChatClick">
              <span class="flex gap-md items-center w-full bg_primary_color primary_text_color label_2_semibold"
                :class="isCollapsed ? 'justify-center px-md py-xl' : 'p-xl'"
              >
                <img :src="PlusIcon" class="h-4 w-4" />
                <span v-if="!isCollapsed">{{ creatingChat ? 'Creating...' : 'New Chat' }}</span>
              </span>
            </button>

            <Teleport to="body">
              <div v-if="isCollapsed && hoveredItem === 'newChat'" :style="getTooltipStyle('newChat')"
                class="pointer-events-none fixed whitespace-nowrap z-[1000] transition-all duration-200 ">
                <div
                  class="relative bg-black-400 primary_2_text_color label_2_medium rounded-lg px-xl py-md outline-none ring-0 border_none">
                  New Chat
                  <!-- Speech Bubble Tail -->
                  <div class="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-full border_none ">
                    <div class="w-0 h-0 border-t-[6px] border-b-[6px] border-r-[6px] border-transparent border-r-black-400">
                    </div>
                  </div>
                </div>
              </div>
            </Teleport>
          </div>
        </div>

        <!-- Chat History (Only shown when expanded) -->
        <div v-if="!isCollapsed" class="mt-6xl flex-1 min-h-0 flex flex-col">
          <p class="label_3_semibold primary_text_color mb-xl">Chat history</p>
          <div
            class="flex-1 overflow-x-hidden overflow-y-auto custom_scrollbar pr-1"
            @scroll.passive="handleScroll"
          >
            <div v-if="loadingChats" class="p-xl label_2_regular secondary_text_color">
              Loading...
            </div>
            <div v-else-if="chats.length === 0" class="p-xl label_2_regular secondary_text_color">
              No chat history
            </div>
            <template v-else>
              <div
                v-for="chat in chats"
                :key="chat.id"
                :data-session-id="chat.id"
                @click="handleSessionRowClick(chat.id)"
                class="cursor-pointer mt-xl min-w-0 p-xl label_2_regular primary_text_color flex justify-between hover:bg-info-50-hover border border-transparent hover:border-gray-50 rounded-lg relative group"
                :class="String(selectedChatId) === String(chat.id) ? 'bg-info-50-hover border-gray-50' : ''"
              >
                <div class="flex-1 min-w-0">
                  <input
                    v-if="chatToRename === chat.id"
                    ref="renameInputRef"
                    v-model="newChatTitle"
                    @blur="confirmRename"
                    @keydown="handleRenameKeydown"
                    @click.stop
                    class="w-full bg-transparent border-none outline-none label_2_regular primary_text_color"
                    placeholder="Enter chat title..."
                  />
                  <span v-else class="block truncate">{{ getChatTitle(chat) }}</span>
                </div>
                <div class="relative shrink-0 flex items-center">
                  <button
                    type="button"
                    class="text-black-50 text-2xl mt-[-0.45em] leading-none rounded px-0.5 hover:bg-gray-25/80 focus:outline-none"
                    :class="{ 'opacity-100': openChatSessionMenuId === chat.id }"
                    :ref="(el) => setChatSessionMenuTriggerRef(chat.id, el)"
                    @click.stop="toggleChatSessionMenu(chat.id)"
                  >
                    ...
                  </button>
                </div>
              </div>
              <div v-if="loadingMoreChats" class="text-center py-xs label_3_regular secondary_text_color mt-md">
                Loading more...
              </div>
            </template>
          </div>
        </div>

        <!-- Spacer / Divider -->
        <div class="block h-[1px] w-full bg-gray-25 mt-6xl shrink-0"></div>

        <!-- Menu / Navigation Items (Agent Setup Drawers + Home Navigation) -->
        <nav class="sidebar-nav-scroll mt-xl min-h-0 flex-1 overflow-y-auto custom_scrollbar shrink-0 pb-6xl">
          <!-- Agent specific tabs -->
          <div
            v-for="item in agentTabs"
            :key="item.tab"
            @click="handleTabClick(item.tab)"
            @mouseenter="hoveredItem = item.tab"
            @mouseleave="hoveredItem = null"
            class="relative group flex cursor-pointer items-center gap-lg rounded-lg py-xl mt-md hover:bg-info-50-hover"
            :class="[
              activeTab === item.tab ? 'bg-info-50-hover' : '',
              isCollapsed ? 'justify-center' : 'px-2'
            ]"
            :ref="el => { if (el) menuItemRefs[item.tab] = el }"
          >
            <img :src="item.icon" class="h-5 w-5 tab-icon" />
            <span v-if="!isCollapsed" class="label_2_semibold primary_text_color">
              {{ item.label }}
            </span>

            <Teleport to="body">
              <div v-if="isCollapsed && hoveredItem === item.tab" :style="getTooltipStyle(item.tab)"
                class="pointer-events-none fixed whitespace-nowrap z-[1000] transition-all duration-200">
                <div
                  class="relative bg-black-400 primary_2_text_color label_2_medium rounded-lg px-xl py-md outline-none ring-0 border_none">
                  {{ item.label }}
                  <!-- Speech Bubble Tail -->
                  <div class="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-full border_none">
                    <div class="w-0 h-0 border-t-[6px] border-b-[6px] border-r-[6px] border-transparent border-r-black-400"></div>
                  </div>
                </div>
              </div>
            </Teleport>
          </div>

          <!-- Divider -->
          <div class="block h-[1px] w-full bg-gray-25 my-xl"></div>

          <!-- Global menu items -->
          <div
            v-for="item in globalMenuItems"
            :key="item.tab"
            @click="handleNavClick(item.route)"
            @mouseenter="hoveredItem = item.tab"
            @mouseleave="hoveredItem = null"
            class="relative group flex cursor-pointer items-center gap-lg rounded-lg py-xl mt-md hover:bg-info-50-hover"
            :class="[
              isCollapsed ? 'justify-center' : 'px-2'
            ]"
            :ref="el => { if (el) menuItemRefs[item.tab] = el }"
          >
            <img :src="item.icon" class="h-5 w-5 tab-icon" />
            <span v-if="!isCollapsed" class="label_2_semibold primary_text_color">
              {{ item.label }}
            </span>

            <Teleport to="body">
              <div v-if="isCollapsed && hoveredItem === item.tab" :style="getTooltipStyle(item.tab)"
                class="pointer-events-none fixed whitespace-nowrap z-[1000] transition-all duration-200">
                <div
                  class="relative bg-black-400 primary_2_text_color label_2_medium rounded-lg px-xl py-md outline-none ring-0 border_none">
                  {{ item.label }}
                  <!-- Speech Bubble Tail -->
                  <div class="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-full border_none">
                    <div class="w-0 h-0 border-t-[6px] border-b-[6px] border-r-[6px] border-transparent border-r-black-400"></div>
                  </div>
                </div>
              </div>
            </Teleport>
          </div>
        </nav>
      </div>
    </aside>

    <!-- Sub-sidebars Drawers (Rendered adjacent in flex row on desktop) -->
    <div
      v-if="isMobile && showSubSidebar"
      class="fixed inset-0 z-10 bg_overlay lg:hidden"
      @click="closeSubSidebar"
    />

    <div v-show="activeTab === 'ai'" class="h-full shrink-0 z-20 relative">
      <AgentKnowledgeSidebar
        :is-open="showSubSidebar && activeTab === 'ai'"
        :agent="agent"
        @close="closeSubSidebar"
        @updated="$emit('agent-updated', $event)"
      />
    </div>

    <div v-show="activeTab === 'documents'" class="h-full shrink-0 z-20 relative">
      <AgentInfoSidebar
        :is-open="showSubSidebar && activeTab === 'documents'"
        :agent="agent"
        @close="closeSubSidebar"
        @updated="$emit('agent-updated', $event)"
      />
    </div>

    <div v-show="activeTab === 'settings'" class="h-full shrink-0 z-20 relative">
      <AgentSettingsSidebar
        :is-open="showSubSidebar && activeTab === 'settings'"
        @close="closeSubSidebar"
      />
    </div>

    <!-- Rename/Delete Menu Panel fixed -->
    <div
      v-if="openChatSessionMenuId !== null && chatSessionForOpenMenu"
      ref="chatSessionMenuPanelRef"
      data-chat-session-menu
      class="fixed z-[9999] min-w-[10.5rem] overflow-hidden rounded-lg border primary_border_color bg_secondary_color shadow-lg"
      role="menu"
      :style="chatSessionMenuPanelStyle"
      @click.stop
    >
      <button
        type="button"
        role="menuitem"
        class="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left label_2_medium primary_text_color transition-colors hover:bg-gray-25"
        @click.stop="onChatSessionRename(chatSessionForOpenMenu)"
      >
        <span>Rename</span>
        <img :src="ImageEditIcon" alt="" class="h-4 w-4 shrink-0 opacity-80" />
      </button>
      <div class="h-px w-full bg-gray-25" aria-hidden="true" />
      <button
        type="button"
        role="menuitem"
        class="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left label_2_medium primary_text_color transition-colors hover:bg-gray-25 disabled:pointer-events-none disabled:opacity-50"
        :disabled="deletingChatId !== null"
        @click.stop="onChatSessionDelete(chatSessionForOpenMenu)"
      >
        <span>Delete</span>
        <img :src="TrashIcon" alt="" class="h-4 w-4 shrink-0 opacity-80" />
      </button>
    </div>

    <!-- Toast Notification -->
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
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useRouter } from 'vue-router'
import { Tooltip } from '@ai-suite/shared-ui'

// Main app page icons
import HomeIcon from '../../../assets/images/HomeIcon.svg'
import AgentsIcon from '../../../assets/images/AiIcon.svg'
import TasksIcon from '../../../assets/images/PostIcon.svg'

// Agent sidebar icons
import ChatIcon from '../../../assets/images/agents/dashboard/chat.svg'
import KnowledgeIcon from '../../../assets/images/agents/dashboard/agent.svg'
import AgentInfoIcon from '../../../assets/images/agents/dashboard/agentinfo.svg'
import SettingsIcon from '../../../assets/images/agents/dashboard/advanced.svg'
import AiAgentIcon from '../../../assets/images/agents/dashboard/aiagenticon.svg'

// Shared UI components (relative imports)
import SuccessToastNotification from '../../../../../../packages/shared-ui/src/components/common/SuccessToastNotification.vue'

// Icons from shared-ui assets
import SidebarIcon from '../../../../../../packages/shared-ui/src/assets/images/SidebarIcon.svg'
import PlusIcon from '../../../../../../packages/shared-ui/src/assets/images/PlusIcon.svg'
import ImageEditIcon from '../../../../../../packages/shared-ui/src/assets/images/ImageEditIcon.svg'
import TrashIcon from '../../../../../../packages/shared-ui/src/assets/images/TrashIcon.svg'

// Services
import { deleteAgentChat, renameAgentChat } from '../../../services/agents/chats.js'

// Sub sidebars
import AgentKnowledgeSidebar from './sidebars/AgentKnowledgeSidebar.vue'
import AgentInfoSidebar from './sidebars/AgentInfoSidebar.vue'
import AgentSettingsSidebar from './sidebars/AgentSettingsSidebar.vue'

const props = defineProps({
  agent: { type: Object, default: null },
  chats: { type: Array, default: () => [] },
  loadingChats: { type: Boolean, default: false },
  loadingMoreChats: { type: Boolean, default: false },
  creatingChat: { type: Boolean, default: false },
  selectedChatId: { type: [String, Number], default: null },
  pagination: {
    type: Object,
    default: () => ({
      currentPage: 1,
      totalPages: 1,
      totalItems: 0,
      hasNext: false,
      hasPrev: false,
    }),
  },
  initialTab: { type: String, default: null },
})

const emit = defineEmits([
  'tab-changed',
  'select-chat',
  'create-chat',
  'delete-chat',
  'rename-chat',
  'page-change',
  'agent-updated',
  'collapse-change',
])

const router = useRouter()

const isCollapsed = ref(false)
const hoveredItem = ref(null)
const menuItemRefs = ref({})
const hoverLogo = ref(false)

// Sub sidebar management
const activeTab = ref(null)
const showSubSidebar = ref(false)
const sidebarContainer = ref(null)
const isMobile = ref(false)

// Toast notifications
const toastOpen = ref(false)
const toastMessage = ref('')
const toastSecondaryMessage = ref('')
const toastType = ref('success')

function showToast(main, secondary = '', type = 'success') {
  toastMessage.value = main
  toastSecondaryMessage.value = secondary
  toastType.value = type
  toastOpen.value = true
}

// Rename/Delete options state
const openChatSessionMenuId = ref(null)
const chatSessionMenuTriggerRefs = ref({})
const deletingChatId = ref(null)
const chatSessionMenuPanelRef = ref(null)
const chatSessionMenuPanelStyle = ref({ top: '0px', left: '0px' })
const CHAT_SESSION_MENU_MIN_WIDTH_PX = 168

const chatToRename = ref(null)
const newChatTitle = ref('')
const renameInputRef = ref(null)
const renamingChat = ref(false)

const chatSessionForOpenMenu = computed(() => {
  const id = openChatSessionMenuId.value
  if (id == null) return null
  return props.chats.find((s) => s.id === id) ?? null
})

const agentTabs = [
  { tab: 'ai', label: 'Agent Knowledge', icon: KnowledgeIcon },
  { tab: 'documents', label: 'Agent Info', icon: AgentInfoIcon },
  { tab: 'settings', label: 'Settings', icon: SettingsIcon },
]

const globalMenuItems = [
  { tab: 'home', label: 'Home', icon: HomeIcon, route: '/home' },
  { tab: 'agents', label: 'Agents', icon: AgentsIcon, route: '/agents' },
  { tab: 'workflows', label: 'Workflows', icon: TasksIcon, route: '/workflows' },
]

function checkMobile() {
  isMobile.value = window.innerWidth < 1024
}

function handleToggleCollapse() {
  isCollapsed.value = !isCollapsed.value
  emit('collapse-change', isCollapsed.value)
}

function handleSidebarContainerClick() {
  openChatSessionMenuId.value = null
  if (chatToRename.value) {
    confirmRename()
  }
}

function goToAgents() {
  router.push('/agents')
}

// Tooltip positioning
const getTooltipStyle = (itemKey) => {
  const element = menuItemRefs.value[itemKey]
  if (!element) return { display: 'none' }
  const rect = element.getBoundingClientRect()
  return {
    left: `${rect.right + 8}px`,
    top: `${rect.top + rect.height / 2}px`,
    transform: 'translateY(-50%)',
  }
}

// Sub drawer activation
function handleTabClick(tabId) {
  if (activeTab.value === tabId && showSubSidebar.value) {
    closeSubSidebar()
    return
  }
  nextTick(() => {
    activeTab.value = tabId
    showSubSidebar.value = true
    emit('tab-changed', tabId)
  })
}

function closeSubSidebar() {
  nextTick(() => {
    showSubSidebar.value = false
    activeTab.value = null
    emit('tab-changed', null)
  })
}

function handleNavClick(routePath) {
  closeSubSidebar()
  router.push(routePath)
}

function handleNewChatClick() {
  closeSubSidebar()
  emit('create-chat')
}

function handleSessionRowClick(chatId) {
  closeSubSidebar()
  emit('select-chat', chatId)
}

// Rename/Delete options helpers
function getChatTitle(chat) {
  const name = chat?.name || chat?.title || 'New Chat'
  return name.charAt(0).toUpperCase() + name.slice(1)
}

function setChatSessionMenuTriggerRef(sessionId, el) {
  if (el) {
    chatSessionMenuTriggerRefs.value[sessionId] = el
  } else {
    delete chatSessionMenuTriggerRefs.value[sessionId]
  }
}

function updateChatSessionMenuPosition(sessionId) {
  const el = chatSessionMenuTriggerRefs.value[sessionId]
  if (!el || typeof el.getBoundingClientRect !== 'function') {
    chatSessionMenuPanelStyle.value = { top: '0px', left: '0px' }
    return
  }
  const r = el.getBoundingClientRect()
  let left = r.right - CHAT_SESSION_MENU_MIN_WIDTH_PX
  left = Math.max(8, Math.min(left, window.innerWidth - CHAT_SESSION_MENU_MIN_WIDTH_PX - 8))
  chatSessionMenuPanelStyle.value = {
    top: `${Math.round(r.bottom + 4)}px`,
    left: `${Math.round(left)}px`,
  }
}

function toggleChatSessionMenu(sessionId) {
  if (openChatSessionMenuId.value === sessionId) {
    openChatSessionMenuId.value = null
    return
  }
  nextTick(() => {
    updateChatSessionMenuPosition(sessionId)
    openChatSessionMenuId.value = sessionId
  })
}

function onChatSessionRename(chat) {
  openChatSessionMenuId.value = null
  if (!chat) return
  chatToRename.value = chat.id
  newChatTitle.value = chat.name || chat.title || ''
  nextTick(() => {
    const el = Array.isArray(renameInputRef.value) ? renameInputRef.value[0] : renameInputRef.value
    if (el) {
      el.focus()
      el.select()
    }
  })
}

async function confirmRename() {
  if (!chatToRename.value) return
  const chatId = chatToRename.value
  const newName = newChatTitle.value.trim()
  if (!newName) {
    chatToRename.value = null
    newChatTitle.value = ''
    return
  }

  const chatObj = props.chats.find(c => String(c.id) === String(chatId))
  if (chatObj && (chatObj.name || chatObj.title || '') === newName) {
    chatToRename.value = null
    newChatTitle.value = ''
    return
  }

  renamingChat.value = true
  try {
    await renameAgentChat(chatId, newName)
    emit('rename-chat', { chatId, name: newName })
    showToast('Success', 'Chat renamed successfully.', 'success')
  } catch (err) {
    showToast('Error', err?.message || 'Failed to rename chat.', 'error')
  } finally {
    chatToRename.value = null
    newChatTitle.value = ''
    renamingChat.value = false
  }
}

function handleRenameKeydown(event) {
  if (event.key === 'Enter') {
    event.preventDefault()
    confirmRename()
  } else if (event.key === 'Escape') {
    event.preventDefault()
    chatToRename.value = null
    newChatTitle.value = ''
  }
}

async function onChatSessionDelete(chat) {
  const chatId = chat?.id
  if (chatId == null || deletingChatId.value) return

  openChatSessionMenuId.value = null
  deletingChatId.value = chatId

  try {
    await deleteAgentChat(chatId)
    emit('delete-chat', chatId)
    showToast('Success', 'Chat deleted successfully.', 'success')
  } catch (err) {
    showToast('Error', err?.message || 'Failed to delete chat.', 'error')
  } finally {
    deletingChatId.value = null
  }
}

const onDocumentPointerDownCloseChatSessionMenu = (event) => {
  const id = openChatSessionMenuId.value
  if (id == null) return
  const target = event.target
  if (!(target instanceof Node)) return
  const menuEl = chatSessionMenuPanelRef.value
  const triggerEl = chatSessionMenuTriggerRefs.value[id]
  if (menuEl?.contains(target)) return
  if (triggerEl?.contains(target)) return
  openChatSessionMenuId.value = null
}

watch(openChatSessionMenuId, (id) => {
  document.removeEventListener('pointerdown', onDocumentPointerDownCloseChatSessionMenu, true)
  if (id == null) return
  queueMicrotask(() => {
    document.addEventListener('pointerdown', onDocumentPointerDownCloseChatSessionMenu, true)
  })
})

function handleClickOutside(event) {
  if (!showSubSidebar.value) return
  if (!isMobile.value) return

  const container = sidebarContainer.value
  if (container?.contains(event.target)) return

  const inSubSidebar = event.target.closest('[data-sub-sidebar]')
  if (inSubSidebar) return

  closeSubSidebar()
}

const handleScroll = (event) => {
  openChatSessionMenuId.value = null
  const el = event.target
  if (el.scrollHeight - el.scrollTop - el.clientHeight < 20) {
    if (props.pagination?.hasNext && !props.loadingMoreChats) {
      emit('page-change', props.pagination.currentPage + 1)
    }
  }
}

watch(
  () => props.initialTab,
  (tab) => {
    if (tab && tab !== 'chat') {
      nextTick(() => {
        activeTab.value = tab
        showSubSidebar.value = true
        emit('tab-changed', tab)
      })
    } else {
      closeSubSidebar()
    }
  },
  { immediate: true }
)

onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
  document.addEventListener('mousedown', handleClickOutside, true)
  emit('collapse-change', isCollapsed.value)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
  document.removeEventListener('mousedown', handleClickOutside, true)
  document.removeEventListener('pointerdown', onDocumentPointerDownCloseChatSessionMenu, true)
})

defineExpose({
  setActiveTab(tab) {
    if (tab && tab !== 'chat') {
      activeTab.value = tab
      showSubSidebar.value = true
      emit('tab-changed', tab)
    } else {
      closeSubSidebar()
    }
  },
  closeSubSidebar
})
</script>

<style scoped>
.sidebar-nav-scroll {
  scrollbar-width: none;
}
.sidebar-nav-scroll::-webkit-scrollbar {
  display: none;
}
.tab-icon {
  transition: filter 0.2s ease;
}
.group:hover .tab-icon,
.bg-info-50-hover .tab-icon {
  filter: brightness(0);
}
</style>
