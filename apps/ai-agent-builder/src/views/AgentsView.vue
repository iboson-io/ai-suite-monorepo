<template>
  <main class="flex min-h-0 flex-1 flex-col overflow-hidden bg_primary_color px-6xl pt-13xl pb-6xl lg:py-6xl">
    <div class="mx-auto flex w-full max-w-6xl min-h-0 flex-1 flex-col overflow-hidden">
      <div class="flex shrink-0 flex-col gap-xl rounded-[18px] bg-white p-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 class="heading_h6_bold primary_text_color leading-6">Agents</h1>
          <p class="body_3_regular secondary_text_color mt-md">
            Manage and monitor your AI agents.
          </p>
        </div>

        <CreateAgentDropdown @create-agent="handleCreateAgent" />
      </div>

      <div
        class="mt-6xl flex shrink-0 flex-col gap-4xl rounded-2xl border primary_border_color bg_secondary_color p-md lg:flex-row lg:items-center lg:justify-between"
      >
        <div class="flex flex-wrap gap-md rounded-lg p-xs">
          <button
            v-for="tab in categoryTabs"
            :key="tab.key"
            type="button"
            class="inline-flex items-center gap-md rounded-xl px-3xl py-3xl label_2_semibold transition-colors hover:bg-info-50"
            :class="activeCategory === tab.key ? 'bg-info-50 primary_text_color' : 'bg-transparent secondary_text_color'"
            @click="activeCategory = tab.key"
          >
            <img
              :src="categoryTabIcons[tab.key]"
              alt=""
              class="h-[18px] w-[18px] shrink-0 transition-[filter,opacity]"
              :class="
                activeCategory === tab.key
                  ? 'brightness-0 opacity-100'
                  : 'opacity-60'
              "
            />
            {{ tab.label }}
          </button>
        </div>

        <div class="flex flex-col gap-xl sm:flex-row sm:items-center">
          <div ref="statusFilterRef" class="relative min-w-[200px]">
            <button
              type="button"
              class="flex w-full items-center justify-between gap-md rounded-[8px] border primary_border_color bg-white px-4xl py-md label_2_medium primary_text_color transition-colors"
              :class="isStatusDropdownOpen ? 'border-[3px] border-[#D9E2FC]' : ''"
              @click.stop="toggleStatusDropdown"
            >
              <span class="truncate">{{ statusFilterLabel }}</span>
              <img
                :src="DownArrow"
                alt=""
                class="h-4 w-4 shrink-0 transition-transform duration-200"
                :class="{ 'rotate-180': isStatusDropdownOpen }"
              />
            </button>

            <div
              v-if="isStatusDropdownOpen"
              class="absolute left-0 top-full z-50 mt-sm min-w-full overflow-hidden rounded-[18px] border primary_border_color bg-white shadow-lg"
              @click.stop
            >
              <label
                class="flex cursor-pointer items-center gap-md border-b primary_border_color px-4xl py-3xl transition-colors hover:bg-info-50"
                :class="{ 'bg-info-50': pendingStatuses.length === 0 }"
              >
                <input
                  type="checkbox"
                  class="custom-checkbox h-5xl w-5xl shrink-0"
                  :checked="pendingStatuses.length === 0"
                  @change="selectAllStatuses"
                />
                <span class="label_2_medium primary_text_color">All statuses</span>
              </label>

              <label
                v-for="status in statusOptions"
                :key="status.id"
                class="flex cursor-pointer items-center gap-md px-4xl py-3xl border-b primary_border_color transition-colors hover:bg-info-50"
                :class="{ 'bg-info-50': pendingStatuses.includes(status.id) }"
              >
                <input
                  v-model="pendingStatuses"
                  type="checkbox"
                  class="custom-checkbox h-5xl w-5xl shrink-0"
                  :value="status.id"
                />
                <span class="label_2_medium primary_text_color">{{ status.label }}</span>
              </label>

              <div class="p-4xl pt-md">
                <button
                  type="button"
                  class="primary_add_button w-full rounded-lg py-md label_2_semibold primary_2_text_color"
                  @click="applyStatusFilter"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>

          <SearchInput
            v-model="searchQuery"
            placeholder="Search"
            wrapper-class="w-80 shrink-0"
          />
        </div>
      </div>

      <div v-if="loading" class="flex min-h-0 flex-1 items-center justify-center">
        <div class="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
      </div>

      <div
        v-else-if="errorMessage"
        class="mt-6xl flex min-h-0 flex-1 flex-col"
      >
        <div
          class="flex min-h-0 flex-1 w-full items-center justify-center rounded-2xl border primary_border_color bg_secondary_color p-6xl text-center label_2_regular secondary_text_color"
        >
          {{ errorMessage }}
        </div>
      </div>

      <div
        v-else-if="agents.length === 0"
        class="mt-6xl flex min-h-[min(68vh,calc(100dvh-17rem))] flex-1 flex-col"
      >
        <div
          class="flex min-h-0 flex-1 w-full items-center justify-center rounded-2xl border primary_border_color bg-white px-6xl py-10xl"
        >
          <div class="flex max-w-md flex-col items-center text-center">
            <img
              :src="categoryTabIcons.agents"
              alt=""
              class="mb-5xl h-16 w-16 opacity-40"
              aria-hidden="true"
            />
            <h2 class="label_1_semibold primary_text_color">
              {{ emptyStateTitle }}
            </h2>
            <p class="body_3_regular secondary_text_color mt-md">
              {{ emptyStateDescription }}
            </p>
          </div>
        </div>
      </div>

      <div
        v-else
        class="agents-grid-scroll mt-6xl max-h-[calc(100dvh-17rem)] overflow-y-auto overflow-x-hidden rounded-[18px] bg-white p-6 pr-3"
        @scroll="handleGridScroll"
      >
        <div class="grid grid-cols-1 gap-5xl md:grid-cols-2 xl:grid-cols-3">
          <AgentCard
            v-for="agent in agents"
            :key="`${agent.kind}-${agent.id}`"
            :agent="agent"
            :show-type="activeCategory !== 'multi'"
            @toggle-active="handleToggleAgentActive"
            @delete="handleDeleteAgent"
            @select="handleSelectAgent"
          />
        </div>

        <div
          v-if="loadingMore"
          class="flex justify-center py-6xl"
        >
          <div class="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
        </div>
      </div>
    </div>

    <AgentDetailsModal
      :open="isAgentModalOpen"
      :mode="agentModalMode"
      :loading="agentDetailsLoading"
      :submitting="agentCreateSubmitting"
      :error-message="agentModalError"
      :agent="agentDetails"
      :fallback-agent="selectedAgent"
      :agent-id="agentDetails?.id ?? selectedAgent?.id ?? null"
      @close="closeAgentModal"
      @create="handleCreateAgentSubmit"
      @clear-error="agentModalError = ''"
    />

    <MultiAgentCreationModal
      :open="isMultiAgentModalOpen"
      :submitting="multiAgentCreateSubmitting"
      :error-message="multiAgentModalError"
      @close="closeMultiAgentModal"
      @create="handleCreateMultiAgentSubmit"
    />
  </main>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { SearchInput } from '@ai-suite/shared-ui'
import DownArrow from '../assets/images/DownArrow.svg'
import ListIcon from '../assets/images/list.svg'
import UserIcon from '../assets/images/user.svg'
import UsersGroupIcon from '../assets/images/users-group.svg'
import AgentCard from '../components/agents/AgentCard.vue'
import AgentDetailsModal from '../components/agents/AgentDetailsModal.vue'
import CreateAgentDropdown from '../components/agents/CreateAgentDropdown.vue'
import MultiAgentCreationModal from '../components/agents/multi/MultiAgentCreationModal.vue'
import {
  AGENT_CATEGORY_TABS,
  AGENT_STATUS_OPTIONS,
  AGENTS_PAGE_LIMIT,
  createSingleAgent,
  fetchAgentsList,
  setAgentActiveStatus,
  statusFromActive,
} from '../services/agents/agents.js'
import { createMultiAgentGroup } from '../services/agents/multi/create.js'
import {
  setCreatedAgentContext,
  setSelectedAgentId,
} from '../services/agents/selectedAgent.js'

const route = useRoute()
const router = useRouter()

const categoryTabs = AGENT_CATEGORY_TABS
const categoryTabIcons = {
  all: ListIcon,
  agents: UserIcon,
  multi: UsersGroupIcon,
}
const statusOptions = AGENT_STATUS_OPTIONS

const activeCategory = ref('all')
const appliedStatuses = ref([])
const pendingStatuses = ref([])
const searchQuery = ref('')
const agents = ref([])
const loading = ref(false)
const loadingMore = ref(false)
const hasMore = ref(false)
const currentPage = ref(1)
const errorMessage = ref('')
const isStatusDropdownOpen = ref(false)
const statusFilterRef = ref(null)
const isAgentModalOpen = ref(false)
const agentModalMode = ref('view')
const selectedAgent = ref(null)
const agentDetails = ref(null)
const agentDetailsLoading = ref(false)
const agentModalError = ref('')
const agentCreateSubmitting = ref(false)
const isMultiAgentModalOpen = ref(false)
const multiAgentCreateSubmitting = ref(false)
const multiAgentModalError = ref('')

function openCreateMultiAgentModal() {
  multiAgentModalError.value = ''
  multiAgentCreateSubmitting.value = false
  isMultiAgentModalOpen.value = true
}

function closeMultiAgentModal() {
  if (multiAgentCreateSubmitting.value) return
  isMultiAgentModalOpen.value = false
  multiAgentModalError.value = ''
}

async function handleCreateMultiAgentSubmit({ groupName, description, agentIds }) {
  if (multiAgentCreateSubmitting.value) return

  multiAgentCreateSubmitting.value = true
  multiAgentModalError.value = ''

  try {
    const created = await createMultiAgentGroup({
      groupName,
      description,
      agentIds,
    })

    if (!created?.id) {
      throw new Error('Multi-agent system was created but no group id was returned.')
    }

    closeMultiAgentModal()
    loadAgents()

    await router.push({
      path: '/multi-agent-dashboard',
      query: { group_id: String(created.id), created: '1' },
    })
  } catch (err) {
    multiAgentModalError.value =
      err?.message || 'Failed to create multi-agent system. Please try again.'
  } finally {
    multiAgentCreateSubmitting.value = false
  }
}

const SCROLL_LOAD_THRESHOLD_PX = 120
let agentModalGeneration = 0

let fetchGeneration = 0
let searchDebounceTimer = null

function agentKey(agent) {
  return `${agent.kind}-${agent.id}`
}

function mergeAgentPages(existing, incoming) {
  const seen = new Set(existing.map(agentKey))
  const merged = [...existing]

  for (const item of incoming) {
    const key = agentKey(item)
    if (!seen.has(key)) {
      seen.add(key)
      merged.push(item)
    }
  }

  return merged.sort((a, b) => {
    const aTime = new Date(a.updatedAt).getTime()
    const bTime = new Date(b.updatedAt).getTime()
    return (Number.isNaN(bTime) ? 0 : bTime) - (Number.isNaN(aTime) ? 0 : aTime)
  })
}

const statusFilterLabel = computed(() => {
  if (appliedStatuses.value.length === 0) return 'All statuses'
  if (appliedStatuses.value.length === 1) {
    const match = statusOptions.find((item) => item.id === appliedStatuses.value[0])
    return match?.label ?? 'All statuses'
  }
  return `${appliedStatuses.value.length} statuses`
})

const hasActiveFilters = computed(
  () => Boolean(searchQuery.value.trim()) || appliedStatuses.value.length > 0
)

const emptyStateTitle = computed(() =>
  hasActiveFilters.value ? 'No agents found' : 'No agents yet'
)

const emptyStateDescription = computed(() => {
  if (searchQuery.value.trim()) {
    return 'Try a different search term or clear the search box.'
  }
  if (appliedStatuses.value.length > 0) {
    return 'Try adjusting your status filters or select all statuses.'
  }
  return 'Create your first agent to get started.'
})

function mapRouteTypeToCategory(type) {
  if (type === 'single') return 'agents'
  if (type === 'multi') return 'multi'
  return 'all'
}

async function loadAgents({ append = false } = {}) {
  const generation = ++fetchGeneration
  const page = append ? currentPage.value + 1 : 1

  if (append) {
    if (!hasMore.value || loading.value || loadingMore.value) return
    loadingMore.value = true
  } else {
    loading.value = true
    currentPage.value = 1
    hasMore.value = false
  }

  errorMessage.value = ''

  try {
    const { items, hasMore: nextHasMore } = await fetchAgentsList({
      category: activeCategory.value,
      statuses: appliedStatuses.value,
      search: searchQuery.value,
      page,
      limit: AGENTS_PAGE_LIMIT,
      multiLimit: AGENTS_PAGE_LIMIT,
    })

    if (generation !== fetchGeneration) return

    agents.value = append ? mergeAgentPages(agents.value, items) : items
    currentPage.value = page
    hasMore.value = nextHasMore
  } catch (error) {
    if (generation !== fetchGeneration) return
    if (!append) {
      agents.value = []
    }
    errorMessage.value = error?.message || 'Failed to load agents. Please try again.'
  } finally {
    if (generation === fetchGeneration) {
      loading.value = false
      loadingMore.value = false
    }
  }
}

function handleGridScroll(event) {
  const el = event.target
  if (!hasMore.value || loading.value || loadingMore.value) return

  const distanceFromBottom =
    el.scrollHeight - el.scrollTop - el.clientHeight

  if (distanceFromBottom <= SCROLL_LOAD_THRESHOLD_PX) {
    loadAgents({ append: true })
  }
}

function toggleStatusDropdown() {
  pendingStatuses.value = [...appliedStatuses.value]
  isStatusDropdownOpen.value = !isStatusDropdownOpen.value
}

function selectAllStatuses() {
  pendingStatuses.value = []
}

function applyStatusFilter() {
  appliedStatuses.value = [...pendingStatuses.value]
  isStatusDropdownOpen.value = false
  loadAgents()
}

function openCreateAgentModal() {
  agentModalGeneration += 1
  agentModalMode.value = 'create'
  selectedAgent.value = null
  agentDetails.value = null
  agentModalError.value = ''
  agentDetailsLoading.value = false
  agentCreateSubmitting.value = false
  isAgentModalOpen.value = true
}

function handleCreateAgent(type) {
  if (type === 'single') {
    openCreateAgentModal()
    return
  }

  if (type === 'multi') {
    openCreateMultiAgentModal()
  }
}

async function handleCreateAgentSubmit({
  name,
  prompt,
  role,
  rules,
  knowledgeTab,
  schemaFiles,
  documentFiles,
  baseUrl,
  accessToken,
  dbConfig,
  selectedComposioApps,
}) {
  if (agentCreateSubmitting.value) return

  agentCreateSubmitting.value = true
  agentModalError.value = ''

  try {
    const created = await createSingleAgent({
      name,
      prompt,
      role,
      rules,
      knowledgeTab,
      schemaFiles,
      documentFiles,
      baseUrl,
      accessToken,
      dbConfig,
      selectedComposioApps,
    })

    if (!created?.id) {
      throw new Error('Agent was created but no agent id was returned.')
    }

    setSelectedAgentId(created.id)
    setCreatedAgentContext({
      id: created.id,
      name: created.name ?? name,
      prompt,
      knowledgeTab,
      selectedComposioApps,
    })

    closeAgentModal()
    loadAgents()

    await router.push({
      path: '/agent-dashboard',
      query: { agent_id: String(created.id), created: '1' },
    })
  } catch (error) {
    agentModalError.value =
      error?.message || 'Failed to create agent. Please try again.'
  } finally {
    agentCreateSubmitting.value = false
  }
}

async function handleSelectAgent(agent) {
  if (agent.kind === 'single') {
    setSelectedAgentId(agent.id)
    await router.push({
      path: '/agent-dashboard',
      query: { agent_id: String(agent.id) },
    })
    return
  }

  if (agent.kind === 'multi') {
    await router.push({
      path: '/multi-agent-dashboard',
      query: { group_id: String(agent.id) },
    })
  }
}

function closeAgentModal() {
  if (agentCreateSubmitting.value) return
  agentModalGeneration += 1
  isAgentModalOpen.value = false
  agentModalMode.value = 'view'
  selectedAgent.value = null
  agentDetails.value = null
  agentModalError.value = ''
  agentDetailsLoading.value = false
  agentCreateSubmitting.value = false
}

async function handleToggleAgentActive({ agent, active }) {
  const index = agents.value.findIndex(
    (item) => item.id === agent.id && item.kind === agent.kind
  )
  if (index === -1) return

  const previousStatus = agents.value[index].status
  const nextStatus =
    agent.kind === 'multi'
      ? active
        ? 'published'
        : 'archived'
      : statusFromActive(active)

  agents.value[index] = { ...agents.value[index], status: nextStatus }

  try {
    await setAgentActiveStatus(agent, active)
  } catch (error) {
    agents.value[index] = { ...agents.value[index], status: previousStatus }
    errorMessage.value = error?.message || 'Failed to update agent status. Please try again.'
  }
}

function handleDeleteAgent(agent) {
  agents.value = agents.value.filter(
    (item) => !(item.id === agent.id && item.kind === agent.kind)
  )
}

function handleClickOutside(event) {
  if (statusFilterRef.value && !statusFilterRef.value.contains(event.target)) {
    isStatusDropdownOpen.value = false
  }
}

watch(activeCategory, () => {
  loadAgents()
})

watch(searchQuery, () => {
  clearTimeout(searchDebounceTimer)
  searchDebounceTimer = setTimeout(() => {
    loadAgents()
  }, 300)
})

onMounted(() => {
  activeCategory.value = mapRouteTypeToCategory(route.query.type)
  loadAgents()
  document.addEventListener('click', handleClickOutside, true)

  const returningFromComposio =
    typeof sessionStorage !== 'undefined' &&
    (sessionStorage.getItem('agent_creation_form_data') ||
      sessionStorage.getItem('composio_pending_app'))

  if (returningFromComposio) {
    openCreateAgentModal()
  } else if (route.query.type === 'single') {
    openCreateAgentModal()
    router.replace({ path: route.path })
  } else if (route.query.type === 'multi') {
    openCreateMultiAgentModal()
    router.replace({ path: route.path })
  }
})

onUnmounted(() => {
  fetchGeneration += 1
  agentModalGeneration += 1
  clearTimeout(searchDebounceTimer)
  document.removeEventListener('click', handleClickOutside, true)
})
</script>
