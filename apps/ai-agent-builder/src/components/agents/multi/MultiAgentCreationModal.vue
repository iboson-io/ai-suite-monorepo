<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="fixed inset-0 z-[60] flex items-center justify-center bg_overlay p-6xl"
      @click="handleClose"
    >
      <div
        class="relative flex max-h-[90vh] w-full max-w-[420px] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
        @click.stop
      >
        <div class="flex shrink-0 items-center justify-between px-5xl pb-4xl pt-5xl">
          <h2 class="label_1_semibold primary_text_color">Create multi-agent system</h2>
          <button
            type="button"
            class="flex h-9 w-9 items-center justify-center rounded-lg border primary_border_color text-secondary_text_color transition-colors hover:bg-gray-25"
            aria-label="Close"
            @click="handleClose"
          >
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div class="custom_scrollbar min-h-0 flex-1 overflow-y-auto px-5xl pb-4xl">
          <div class="space-y-5xl">
            <div>
              <label class="label_2_medium primary_text_color mb-md block">System Name</label>
              <input
                v-model="systemName"
                type="text"
                placeholder="e.g., Customer Support System"
                class="w-full rounded-lg border bg-white px-4xl py-md label_2_regular primary_text_color outline-none transition-colors placeholder:text-gray-400 focus:border-info-200"
                :class="groupNameError ? 'border-error-300 bg-error-50' : 'primary_border_color'"
              />
              <p v-if="groupNameError" class="label_3_regular text-error-600 mt-sm">
                {{ groupNameError }}
              </p>
            </div>

            <div>
              <label class="label_2_medium primary_text_color mb-md block">Select Agents</label>

              <div class="relative mb-md">
                <input
                  v-model="agentSearchQuery"
                  type="search"
                  placeholder="Search agents."
                  class="w-full rounded-lg border primary_border_color bg-white py-md pl-11 pr-4xl label_2_regular primary_text_color outline-none placeholder:text-gray-400"
                  @input="handleSearchInput"
                />
                <svg
                  class="pointer-events-none absolute left-3xl top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>

              <div
                class="max-h-[280px] overflow-y-auto rounded-lg"
                :class="{ 'rounded-lg border border-error-300 bg-error-50 p-xs': showErrors && selectedAgents.length < 2 }"
                @scroll="handleAgentListScroll"
              >
                <div v-if="loadingAgents && availableAgents.length === 0" class="flex items-center justify-center py-10xl">
                  <div class="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-info-500" />
                </div>

                <div
                  v-else-if="displayedAgents.length === 0"
                  class="py-10xl text-center body_3_regular secondary_text_color"
                >
                  No published agents found. Create and publish agents first.
                </div>

                <div v-else class="space-y-md pr-xs">
                  <button
                    v-for="agent in displayedAgents"
                    :key="agent.id"
                    type="button"
                    class="multi-agent-card flex w-full flex-col rounded-xl px-4xl py-3xl text-left transition-colors"
                    :class="
                      isSelected(agent.id)
                        ? 'selected_platform_border bg-white'
                        : 'border border-gray-100 bg-white hover:border-info-200 hover:bg-gray-25'
                    "
                    @click="toggleAgentSelection(agent)"
                  >
                    <p class="label_2_semibold primary_text_color">{{ agent.name }}</p>
                    <p class="body_4_regular secondary_text_color mt-sm line-clamp-2 leading-relaxed">
                      {{ agent.description || 'No description available' }}
                    </p>
                    <span
                      v-if="getAgentTypeLabel(agent)"
                      class="mt-md inline-flex w-fit rounded-md border border-blue-100 bg-blue-50 px-md py-xs label_3_medium text-blue-200"
                    >
                      {{ getAgentTypeLabel(agent) }}
                    </span>
                  </button>

                  <div v-if="loadingAgents" class="flex justify-center py-md">
                    <div class="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-info-500" />
                  </div>
                </div>
              </div>

              <p v-if="showErrors && selectedAgents.length < 2" class="caption_1_regular text-error-600 mt-sm">
                Please select at least two agents
              </p>
            </div>

            <p v-if="errorMessage" class="label_3_regular text-error-600">{{ errorMessage }}</p>
          </div>
        </div>

        <div class="flex shrink-0 items-center justify-end gap-md border-t border-gray-100 px-5xl py-4xl">
          <button
            type="button"
            class="rounded-lg bg-gray-25 px-5xl py-md label_2_medium primary_text_color transition-colors hover:bg-gray-50-hover disabled:opacity-50"
            :disabled="submitting"
            @click="handleClose"
          >
            Cancel
          </button>
          <button
            type="button"
            class="primary_add_button rounded-lg px-5xl py-md label_2_semibold primary_2_text_color disabled:opacity-50"
            :disabled="submitting"
            @click="handleCreate"
          >
            {{ submitting ? 'Creating...' : 'Create System' }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { fetchPublishedAgentsForPicker } from '../../../services/agents/multi/picker.js'
import { validateGroupName } from '../../../services/agents/agents.js'

const props = defineProps({
  open: { type: Boolean, default: false },
  submitting: { type: Boolean, default: false },
  errorMessage: { type: String, default: '' },
})

const emit = defineEmits(['close', 'create'])

const AGENT_TYPE_LABELS = {
  api: 'API Schema',
  documents: 'Documents',
  db: 'Database',
  database: 'Database',
  composio: 'Composio',
}

const systemName = ref('')
const selectedAgents = ref([])
const availableAgents = ref([])
const agentSearchQuery = ref('')
const loadingAgents = ref(false)
const hasMoreAgents = ref(true)
const currentPage = ref(1)
const showErrors = ref(false)

let searchDebounceTimer = null

const groupNameError = computed(() => {
  if (!showErrors.value) return ''
  return validateGroupName(systemName.value).message
})

const displayedAgents = computed(() => {
  const selectedIds = new Set(selectedAgents.value.map((agent) => String(agent.id)))
  const unselected = availableAgents.value.filter((agent) => !selectedIds.has(String(agent.id)))

  return [...selectedAgents.value, ...unselected]
})

function resetForm() {
  systemName.value = ''
  selectedAgents.value = []
  agentSearchQuery.value = ''
  availableAgents.value = []
  currentPage.value = 1
  hasMoreAgents.value = true
  showErrors.value = false
}

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

function sameAgentId(left, right) {
  return String(left) === String(right)
}

function isSelected(agentId) {
  return selectedAgents.value.some((agent) => sameAgentId(agent.id, agentId))
}

function toggleAgentSelection(agent) {
  if (isSelected(agent.id)) {
    selectedAgents.value = selectedAgents.value.filter(
      (item) => !sameAgentId(item.id, agent.id)
    )
    return
  }

  selectedAgents.value = [...selectedAgents.value, agent]
}

async function loadAgents({ append = false } = {}) {
  if (loadingAgents.value) return
  if (append && !hasMoreAgents.value) return

  const page = append ? currentPage.value + 1 : 1
  loadingAgents.value = true

  try {
    const { items, hasMore } = await fetchPublishedAgentsForPicker({
      page,
      limit: 12,
      search: agentSearchQuery.value,
    })

    availableAgents.value = append
      ? [...availableAgents.value, ...items.filter((item) => !availableAgents.value.some((a) => a.id === item.id))]
      : items

    currentPage.value = page
    hasMoreAgents.value = hasMore
  } catch {
    if (!append) availableAgents.value = []
  } finally {
    loadingAgents.value = false
  }
}

function handleSearchInput() {
  clearTimeout(searchDebounceTimer)
  searchDebounceTimer = setTimeout(() => {
    loadAgents()
  }, 300)
}

function handleAgentListScroll(event) {
  const el = event.target
  const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight
  if (distanceFromBottom <= 80) {
    loadAgents({ append: true })
  }
}

function handleClose() {
  if (props.submitting) return
  emit('close')
}

function handleCreate() {
  showErrors.value = true
  if (!validateGroupName(systemName.value).valid || selectedAgents.value.length < 2) return

  emit('create', {
    groupName: systemName.value.trim(),
    description: '',
    agentIds: selectedAgents.value.map((agent) => agent.id),
  })
}

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      resetForm()
      loadAgents()
    }
  }
)
</script>

<style scoped>
.multi-agent-card.selected_platform_border::before {
  border-radius: 0.75rem;
}
</style>
