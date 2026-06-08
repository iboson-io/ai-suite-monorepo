<template>
  <AgentDashboardSubSidebarShell title="Agent Group" :is-open="isOpen" @close="$emit('close')">
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
          class="w-full rounded-lg border primary_border_color bg-white px-4xl py-md label_2_regular primary_text_color outline-none"
        />
      </div>

      <div>
        <label class="label_2_medium primary_text_color mb-md block">Description</label>
        <textarea
          v-model="groupDescription"
          rows="2"
          class="w-full resize-none rounded-lg border primary_border_color bg-white px-4xl py-md label_2_regular primary_text_color outline-none"
        />
      </div>

      <div>
        <div class="mb-md flex items-center justify-between gap-md">
          <label class="label_2_medium primary_text_color">Group Agents</label>
          <button
            type="button"
            class="label_3_medium text-info-600 hover:underline"
            @click="showPicker = !showPicker"
          >
            {{ showPicker ? 'Hide picker' : 'Add agents' }}
          </button>
        </div>

        <ul v-if="selectedAgents.length > 0" class="space-y-sm">
          <li
            v-for="agent in selectedAgents"
            :key="agent.id"
            class="flex items-center justify-between rounded-xl border primary_border_color px-4xl py-md"
          >
            <div class="min-w-0">
              <p class="label_2_medium primary_text_color truncate">{{ agent.name }}</p>
              <p class="body_4_regular secondary_text_color truncate">{{ agent.description || 'No description' }}</p>
            </div>
            <button
              type="button"
              class="shrink-0 rounded-lg p-sm text-error-600 hover:bg-error-50"
              @click="removeAgent(agent.id)"
            >
              Remove
            </button>
          </li>
        </ul>
        <p v-else class="body_3_regular secondary_text_color">No agents in this group yet.</p>
      </div>

      <div v-if="showPicker" class="rounded-xl border primary_border_color bg-white p-4xl">
        <input
          v-model="searchQuery"
          type="search"
          placeholder="Search published agents..."
          class="mb-md w-full rounded-lg border primary_border_color px-4xl py-md label_2_regular primary_text_color outline-none"
          @input="handleSearch"
        />

        <div class="max-h-56 space-y-sm overflow-y-auto" @scroll="handlePickerScroll">
          <button
            v-for="agent in pickerAgents"
            :key="agent.id"
            type="button"
            class="flex w-full items-center justify-between rounded-lg border px-3xl py-md text-left transition-colors"
            :class="isPickerSelected(agent.id) ? 'border-info-300 bg-info-50' : 'primary_border_color hover:bg-gray-25'"
            @click="togglePickerAgent(agent)"
          >
            <span class="label_3_medium primary_text_color">{{ agent.name }}</span>
            <span class="caption_1_regular secondary_text_color">{{ isPickerSelected(agent.id) ? 'Selected' : 'Add' }}</span>
          </button>
        </div>
      </div>

      <p v-if="errorMessage" class="label_3_regular text-error-600">{{ errorMessage }}</p>
    </form>

    <template #footer>
      <button
        type="button"
        class="primary_add_button w-full rounded-lg py-md label_2_semibold primary_2_text_color disabled:opacity-50"
        :disabled="saving || selectedAgents.length < 1 || !groupName.trim()"
        @click="handleSave"
      >
        {{ saving ? 'Saving...' : 'Save Group' }}
      </button>
    </template>
  </AgentDashboardSubSidebarShell>
</template>

<script setup>
import { ref, watch } from 'vue'
import AgentDashboardSubSidebarShell from '../dashboard/AgentDashboardSubSidebarShell.vue'
import { fetchPublishedAgentsForPicker } from '../../../services/agents/multi/picker.js'

const props = defineProps({
  isOpen: { type: Boolean, default: false },
  group: { type: Object, default: null },
  loading: { type: Boolean, default: false },
  saving: { type: Boolean, default: false },
  errorMessage: { type: String, default: '' },
})

const emit = defineEmits(['close', 'save'])

const groupName = ref('')
const groupDescription = ref('')
const selectedAgents = ref([])
const showPicker = ref(false)
const searchQuery = ref('')
const pickerAgents = ref([])
const pickerLoading = ref(false)
const pickerHasMore = ref(true)
const pickerPage = ref(1)

let searchTimer = null

function syncFromGroup(group) {
  groupName.value = group?.name ?? ''
  groupDescription.value = group?.description ?? ''
  selectedAgents.value = Array.isArray(group?.agents) ? [...group.agents] : []
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
      showPicker.value = false
      loadPickerAgents()
    }
  }
)
</script>
