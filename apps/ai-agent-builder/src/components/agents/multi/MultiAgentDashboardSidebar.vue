<template>
  <div
    ref="sidebarContainer"
    class="h-full shrink-0 overflow-visible lg:relative lg:flex lg:w-auto lg:max-w-none"
    :class="[
      showSubSidebar
        ? 'fixed left-0 top-0 z-[9999] flex w-full max-w-full'
        : 'relative flex w-20'
    ]"
    data-sidebar-container
  >
    <nav
      class="relative z-30 flex h-full w-20 shrink-0 flex-col items-center gap-md border-r primary_border_color bg_secondary_color py-4xl shadow-sm"
    >
      <button
        type="button"
        class="mb-md flex h-10 w-10 items-center justify-center rounded-xl transition-colors hover:bg-gray-25"
        aria-label="Back to agents"
        @click="goToAgents"
      >
        <img :src="AiAgentIcon" alt="" class="h-7 w-auto" />
      </button>

      <Tooltip
        v-for="tab in tabs"
        :key="tab.id"
        :text="tab.label"
        position="right"
        class="w-full flex justify-center"
      >
        <button
          type="button"
          class="group relative flex w-full flex-col items-center rounded-xl px-md py-xl transition-colors"
          :class="
            activeTab === tab.id
              ? 'bg-info-50 text-info-600'
              : 'secondary_text_color hover:bg-gray-25 hover:text-info-600'
          "
          :aria-label="tab.label"
          :aria-pressed="activeTab === tab.id"
          @click="setActiveTab(tab.id)"
        >
          <img
            :src="tab.icon"
            alt=""
            class="h-6 w-6 transition-opacity"
            :class="activeTab === tab.id ? 'opacity-100' : 'opacity-70 group-hover:opacity-100'"
          />
        </button>
      </Tooltip>
    </nav>

    <div
      v-if="isMobile && showSubSidebar"
      class="fixed inset-0 z-10 bg_overlay lg:hidden"
      @click="closeSubSidebar"
    />

    <div v-show="activeTab === 'chat'" class="h-full shrink-0 z-20 relative">
      <AgentChatSidebar
        :is-open="showSubSidebar && activeTab === 'chat'"
        :chats="chats"
        :loading="loadingChats"
        :loading-more="loadingMoreChats"
        :creating="creatingChat"
        :selected-chat-id="selectedChatId"
        :pagination="pagination"
        @close="closeSubSidebar"
        @select-chat="$emit('select-chat', $event)"
        @create-chat="$emit('create-chat')"
        @delete-chat="$emit('delete-chat', $event)"
        @rename-chat="$emit('rename-chat', $event)"
        @page-change="$emit('page-change', $event)"
      />
    </div>

    <div v-show="activeTab === 'group'" class="h-full shrink-0 z-20 relative">
      <MultiAgentGroupSidebar
        :is-open="showSubSidebar && activeTab === 'group'"
        :group="group"
        :loading="loadingGroup"
        :saving="savingGroup"
        :error-message="groupError"
        @close="closeSubSidebar"
        @save="$emit('save-group', $event)"
      />
    </div>


  </div>
</template>

<script setup>
import { nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { Tooltip } from '@ai-suite/shared-ui'
import ChatIcon from '../../../assets/images/agents/dashboard/chat.svg'
import AgentInfoIcon from '../../../assets/images/agents/dashboard/agentinfo.svg'
import AiAgentIcon from '../../../assets/images/agents/dashboard/aiagenticon.svg'
import AgentChatSidebar from '../dashboard/sidebars/AgentChatSidebar.vue'
import MultiAgentGroupSidebar from './MultiAgentGroupSidebar.vue'


const props = defineProps({
  group: { type: Object, default: null },
  chats: { type: Array, default: () => [] },
  loadingChats: { type: Boolean, default: false },
  loadingMoreChats: { type: Boolean, default: false },
  creatingChat: { type: Boolean, default: false },
  selectedChatId: { type: [String, Number], default: null },
  loadingGroup: { type: Boolean, default: false },
  savingGroup: { type: Boolean, default: false },
  groupError: { type: String, default: '' },
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
  initialTab: { type: String, default: null },
})

const emit = defineEmits([
  'select-chat',
  'create-chat',
  'delete-chat',
  'rename-chat',
  'page-change',
  'save-group',
  'sub-sidebar-changed',
])

const router = useRouter()
const tabs = [
  { id: 'chat', label: 'Chat', icon: ChatIcon },
  { id: 'group', label: 'Agent Info', icon: AgentInfoIcon },
]

const activeTab = ref(null)
const showSubSidebar = ref(false)
const sidebarContainer = ref(null)
const isMobile = ref(false)

function checkMobile() {
  isMobile.value = window.innerWidth < 1024
}

function emitSubSidebarState() {
  emit('sub-sidebar-changed', showSubSidebar.value)
}

function setActiveTab(tab) {
  nextTick(() => {
    if (activeTab.value === tab && showSubSidebar.value) {
      closeSubSidebar()
      return
    }

    activeTab.value = tab
    showSubSidebar.value = true
    emitSubSidebarState()
  })
}

function closeSubSidebar() {
  nextTick(() => {
    showSubSidebar.value = false
    activeTab.value = null
    emitSubSidebarState()
  })
}

function goToAgents() {
  router.push('/agents')
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

function setActiveTabFromParent(tab) {
  if (!tab) return
  activeTab.value = tab
  showSubSidebar.value = true
  emitSubSidebarState()
}

watch(
  () => props.initialTab,
  (tab) => {
    setActiveTabFromParent(tab || 'chat')
  },
  { immediate: true }
)

watch(showSubSidebar, () => {
  emitSubSidebarState()
})

onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
  document.addEventListener('mousedown', handleClickOutside, true)
  emitSubSidebarState()
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
  document.removeEventListener('mousedown', handleClickOutside, true)
})

defineExpose({
  setActiveTab: setActiveTabFromParent,
  closeSubSidebar,
  async openTab(tab) {
    setActiveTabFromParent(tab)
    await nextTick()
  },
})
</script>
