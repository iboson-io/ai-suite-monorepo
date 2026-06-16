<template>
  <AgentDashboardSubSidebarShell title="Agent Group" :is-open="isOpen" @close="$emit('close')">
    <div class="mb-5xl">
      <p class="body_3_regular secondary_text_color">Agent Groups allow multiple AI agents to collaborate</p>
      <div class="mt-4xl border-b primary_border_color" />
    </div>

    <div v-if="loading" class="flex items-center justify-center py-10xl">
      <div class="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-info-500" />
    </div>

    <form v-else class="space-y-5xl" @submit.prevent="handleSave">
      <div>
        <label class="label_2_medium primary_text_color mb-md block">System Name</label>
        <input
          v-model="groupName"
          type="text"
          required
          placeholder="e.g., Customer Support System"
          class="w-full rounded-lg border bg-white px-4xl py-md label_2_regular primary_text_color outline-none placeholder:text-gray-400 focus:border-info-300 transition-colors"
          :class="groupNameError ? 'border-error-200 focus:border-error-400' : 'primary_border_color'"
        />
        <p v-if="groupNameError" class="label_3_regular text-error-600 mt-sm">{{ groupNameError }}</p>
      </div>

      <div>
        <label class="label_2_medium primary_text_color mb-md block">Select Agents</label>
        
        <div class="relative w-full mb-5xl">
          <span class="absolute inset-y-0 left-0 flex items-center pl-4xl pointer-events-none">
            <svg class="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search agents."
            class="w-full rounded-lg border primary_border_color bg-white pl-10xl pr-4xl py-md label_2_regular primary_text_color outline-none placeholder:text-gray-400 focus:border-info-300 transition-colors"
            @input="handleSearch"
          />
        </div>

        <div 
          v-if="displayedAgents.length > 0" 
          class="space-y-4xl max-h-[calc(100vh-408px)] overflow-y-auto pr-2 custom_scrollbar" 
          @scroll="handlePickerScroll"
        >
          <button
            v-for="agent in displayedAgents"
            :key="agent.id"
            type="button"
            class="multi-agent-card flex w-full flex-col rounded-xl px-4xl py-3xl text-left transition-colors"
            :class="
              isPickerSelected(agent.id)
                ? 'selected_platform_border bg-white'
                : 'border border-gray-100 bg-white hover:border-info-200 hover:bg-gray-25'
            "
            @click="togglePickerAgent(agent)"
          >
            <p class="label_2_semibold primary_text_color">{{ agent.name }}</p>
            <p class="body_4_regular secondary_text_color mt-sm line-clamp-2 leading-relaxed w-full">
              {{ agent.description || 'No description available' }}
            </p>
            <span
              v-if="getAgentTypeLabel(agent)"
              class="mt-md inline-flex w-fit rounded-md border border-blue-100 bg-blue-50 px-md py-xs label_3_medium text-blue-200"
            >
              {{ getAgentTypeLabel(agent) }}
            </span>
          </button>
        </div>
        
        <p v-else class="body_3_regular secondary_text_color mt-md">No agents found.</p>
      </div>

      <p v-if="errorMessage" class="label_3_regular text-error-600">{{ errorMessage }}</p>
    </form>

    <template #footer>
      <button
        type="button"
        class="primary_add_button w-full rounded-lg py-md label_2_semibold primary_2_text_color disabled:opacity-50"
        :disabled="saving"
        @click="handleSave"
      >
        {{ saving ? 'Saving...' : 'Save Changes' }}
      </button>
    </template>
  </AgentDashboardSubSidebarShell>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import AgentDashboardSubSidebarShell from '../dashboard/AgentDashboardSubSidebarShell.vue'
import { fetchPublishedAgentsForPicker } from '../../../services/agents/multi/picker.js'
import { validateGroupName } from '../../../services/agents/agents.js'

const props = defineProps({
  isOpen: { type: Boolean, default: false },
  group: { type: Object, default: null },
  loading: { type: Boolean, default: false },
  saving: { type: Boolean, default: false },
  errorMessage: { type: String, default: '' },
})

const emit = defineEmits(['close', 'save'])

const AGENT_TYPE_LABELS = {
  api: 'API Schema',
  documents: 'Documents',
  db: 'Database',
  database: 'Database',
  composio: 'Composio',
}

const groupName = ref('')
const groupDescription = ref('')
const selectedAgents = ref([])
const searchQuery = ref('')
const pickerAgents = ref([])
const pickerLoading = ref(false)
const pickerHasMore = ref(true)
const pickerPage = ref(1)
const showErrors = ref(false)

const groupNameError = computed(() => {
  if (!showErrors.value) return ''
  return validateGroupName(groupName.value).message
})

const displayedAgents = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()
  
  // Filter selected agents by search query
  const filteredSelected = selectedAgents.value.filter(agent => {
    if (!query) return true
    return agent.name.toLowerCase().includes(query) ||
           (agent.description && agent.description.toLowerCase().includes(query))
  })

  // Filter picker agents (already filtered by API, but prevent duplicate reference IDs)
  const list = [...pickerAgents.value]

  // Merge: start with matching selected agents, then append remaining picker agents
  const result = [...filteredSelected]
  for (const agent of list) {
    if (!result.some(a => a.id === agent.id)) {
      result.push(agent)
    }
  }
  return result
})

function getAgentTypeLabel(agent) {
  const raw = String(agent?.agentType ?? '').trim().toLowerCase()
  if (!raw) return ''

  if (AGENT_TYPE_LABELS[raw]) return AGENT_TYPE_LABELS[raw]

  return raw
    .split(/[_\s-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

let searchTimer = null

function syncFromGroup(group) {
  groupName.value = group?.name ?? ''
  groupDescription.value = group?.description ?? ''
  selectedAgents.value = Array.isArray(group?.agents) ? [...group.agents] : []
  showErrors.value = false
}

function isPickerSelected(agentId) {
  return selectedAgents.value.some((agent) => agent.id === agentId)
}

function togglePickerAgent(agent) {
  if (isPickerSelected(agent.id)) {
    removeAgent(agent.id)
    return
  }
  selectedAgents.value = [...selectedAgents.value, agent]
}

function removeAgent(agentId) {
  selectedAgents.value = selectedAgents.value.filter((agent) => agent.id !== agentId)
}

async function loadPickerAgents({ append = false } = {}) {
  if (pickerLoading.value) return
  if (append && !pickerHasMore.value) return

  const page = append ? pickerPage.value + 1 : 1
  pickerLoading.value = true

  try {
    const { items, hasMore } = await fetchPublishedAgentsForPicker({
      page,
      limit: 12,
      search: searchQuery.value,
    })

    pickerAgents.value = append
      ? [...pickerAgents.value, ...items.filter((item) => !pickerAgents.value.some((a) => a.id === item.id))]
      : items

    pickerPage.value = page
    pickerHasMore.value = hasMore
  } finally {
    pickerLoading.value = false
  }
}

function handleSearch() {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => loadPickerAgents(), 300)
}

function handlePickerScroll(event) {
  const el = event.target
  const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight
  if (distanceFromBottom <= 80) {
    loadPickerAgents({ append: true })
  }
}

function handleSave() {
  showErrors.value = true
  if (!validateGroupName(groupName.value).valid || selectedAgents.value.length < 1) return

  emit('save', {
    groupName: groupName.value.trim(),
    description: groupDescription.value.trim(),
    agentIds: selectedAgents.value.map((agent) => agent.id),
  })
}

watch(
  () => props.group,
  (group) => {
    syncFromGroup(group)
  },
  { immediate: true, deep: true }
)

watch(
  () => props.isOpen,
  (isOpen) => {
    if (isOpen) {
      syncFromGroup(props.group)
      loadPickerAgents()
    }
  }
)
</script>

<style scoped>
.multi-agent-card.selected_platform_border::before {
  border-radius: 0.75rem;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;  
  overflow: hidden;
}

.custom_scrollbar {
  scrollbar-width: thin;
  scrollbar-color: #dadde1 transparent;
}

.custom_scrollbar::-webkit-scrollbar {
  width: 4px;
}

.custom_scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom_scrollbar::-webkit-scrollbar-thumb {
  background-color: #dadde1;
  border-radius: 999px;
}
</style>


