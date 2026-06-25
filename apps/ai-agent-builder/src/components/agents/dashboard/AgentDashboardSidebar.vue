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
    <Sidebar
      :active-tab="activeTab"
      :active-session-id="selectedChatId"
      is-custom-chats
      :custom-chats="chats"
      :is-loading-sessions="loadingChats"
      :loading-more-sessions="loadingMoreChats"
      :creating-chat="creatingChat"
      :custom-menu-groups="menuGroups"
      disable-default-fetch
      hide-bottom-section
      :show-back-to-home="true"
      @changeTab="handleSidebarChangeTab"
      @collapseChange="handleCollapseChange"
      @newChat="handleNewChatClick"
      @loadSession="handleSessionRowClick"
      @renameChat="handleRenameChat"
      @deleteChat="handleDeleteChat"
      @loadMoreChats="handleLoadMore"
    />

    <!-- Placeholder block to occupy space in the flex layout because Sidebar is fixed -->
    <div class="hidden lg:block shrink-0 transition-all duration-300" :class="isCollapsed ? 'w-20' : 'w-64'"></div>

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
import { Sidebar } from '@ai-suite/shared-ui'

// Agent sidebar icons
import KnowledgeIcon from '../../../assets/images/agents/dashboard/agent.svg'
import AgentInfoIcon from '../../../assets/images/agents/dashboard/agentinfo.svg'
import SettingsIcon from '../../../assets/images/agents/dashboard/advanced.svg'

// Shared UI components (relative imports)
import SuccessToastNotification from '../../../../../../packages/shared-ui/src/components/common/SuccessToastNotification.vue'

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

const isCollapsed = ref(false)

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

const agentTabs = [
  { tab: 'ai', label: 'Agent Knowledge', icon: KnowledgeIcon },
  { tab: 'documents', label: 'Agent Info', icon: AgentInfoIcon },
  { tab: 'settings', label: 'Settings', icon: SettingsIcon },
]

const menuGroups = [
  { items: agentTabs }
]

function checkMobile() {
  isMobile.value = window.innerWidth < 1024
}

function handleCollapseChange(collapsed) {
  isCollapsed.value = collapsed
  emit('collapse-change', isCollapsed.value)
}

function handleSidebarContainerClick() {
  // Container click handler if needed
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

function handleSidebarChangeTab(tab) {
  handleTabClick(tab)
}

function handleNewChatClick() {
  closeSubSidebar()
  emit('create-chat')
}

function handleSessionRowClick(chatId) {
  closeSubSidebar()
  emit('select-chat', chatId)
}

async function handleRenameChat({ id, newTitle }) {
  try {
    await renameAgentChat(id, newTitle)
    emit('rename-chat', { chatId: id, name: newTitle })
    showToast('Success', 'Chat renamed successfully.', 'success')
  } catch (err) {
    showToast('Error', err?.message || 'Failed to rename chat.', 'error')
  }
}

async function handleDeleteChat(id) {
  try {
    await deleteAgentChat(id)
    emit('delete-chat', id)
    showToast('Success', 'Chat deleted successfully.', 'success')
  } catch (err) {
    showToast('Error', err?.message || 'Failed to delete chat.', 'error')
  }
}

function handleLoadMore() {
  if (props.pagination?.hasNext && !props.loadingMoreChats) {
    emit('page-change', props.pagination.currentPage + 1)
  }
}

function handleClickOutside(event) {
  if (!showSubSidebar.value) return
  if (!isMobile.value) return

  const container = sidebarContainer.value
  if (container?.contains(event.target)) return

  const inSubSidebar = event.target.closest('[data-sub-sidebar]')
  if (inSubSidebar) return

  closeSubSidebar()
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
</style>
