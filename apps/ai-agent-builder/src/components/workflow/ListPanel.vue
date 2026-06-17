<template>
  <main class="flex min-h-0 flex-1 flex-col overflow-hidden bg_primary_color px-6xl pt-13xl pb-6xl lg:py-6xl">
    <div class="mx-auto flex w-full max-w-6xl min-h-0 flex-1 flex-col overflow-hidden">
      <!-- Title area -->
      <div class="flex shrink-0 flex-col gap-xl rounded-[18px] bg-white p-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 class="heading_h6_bold primary_text_color leading-6">Workflows</h1>
          <p class="body_3_regular secondary_text_color mt-md">
            Design and manage automation workflows.
          </p>
        </div>
        <button
          type="button"
          class="primary_add_button flex items-center justify-center gap-md rounded-lg py-md px-6xl label_2_semibold primary_2_text_color"
          @click="openCreateModal"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Create New Workflow
        </button>
      </div>

      <!-- Filter/Search area -->
      <div
        class="mt-6xl flex shrink-0 flex-col gap-4xl rounded-2xl border primary_border_color bg_secondary_color p-md lg:flex-row lg:items-center lg:justify-between"
      >
        <div class="flex flex-wrap gap-md rounded-lg p-xs">
          <button
            v-for="tab in statusTabs"
            :key="tab.id"
            type="button"
            class="inline-flex items-center gap-md rounded-xl px-3xl py-3xl label_2_semibold transition-colors hover:bg-info-50"
            :class="statusFilter === tab.id ? 'bg-info-50 primary_text_color' : 'bg-transparent secondary_text_color'"
            @click="setStatusFilter(tab.id)"
          >
            {{ tab.label }}
          </button>
        </div>

        <div class="relative w-80 shrink-0">
          <img
            :src="SearchIcon"
            alt=""
            class="pointer-events-none absolute left-3xl top-1/2 h-6 w-6 -translate-y-1/2"
            aria-hidden="true"
          />
          <input
            v-model="searchQuery"
            type="search"
            placeholder="Search"
            class="w-full rounded-[1px] border primary_border_color bg-white py-md pl-11 pr-3xl label_2_medium primary_text_color outline-none transition-colors placeholder:text-gray-400"
            autocomplete="off"
          />
        </div>
      </div>

      <!-- Main list view -->
      <div v-if="loading && workflows.length === 0" class="flex min-h-0 flex-1 items-center justify-center">
        <div class="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
      </div>

      <div
        v-else-if="workflows.length === 0"
        class="mt-6xl flex min-h-[min(68vh,calc(100dvh-17rem))] flex-1 flex-col"
      >
        <div
          class="flex min-h-0 flex-1 w-full items-center justify-center rounded-2xl border primary_border_color bg-white px-6xl py-10xl"
        >
          <div class="flex max-w-md flex-col items-center text-center">
            <div class="w-16 h-16 mb-5xl rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
              <svg class="w-8 h-8 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v14a1 1 0 01-1 1H5a1 1 0 01-1-1V5z M9 9h6v6H9V9z" />
              </svg>
            </div>
            <h2 class="label_1_semibold primary_text_color">
              {{ emptyStateTitle }}
            </h2>
            <p class="body_3_regular secondary_text_color mt-md">
              {{ emptyStateHint }}
            </p>
            <button
              v-if="emptyStateShowCreate"
              type="button"
              class="primary_add_button mt-6xl rounded-lg px-6xl py-md label_2_semibold primary_2_text_color"
              @click="openCreateModal"
            >
              Create workflow
            </button>
          </div>
        </div>
      </div>

      <div
        v-else
        ref="workflowScrollRoot"
        class="agents-grid-scroll mt-6xl max-h-[calc(100dvh-17rem)] overflow-y-auto overflow-x-hidden rounded-[18px] bg-white p-6 pr-3"
      >
        <div class="grid grid-cols-1 gap-5xl md:grid-cols-2 xl:grid-cols-3">
          <WorkflowCard
            v-for="wf in workflows"
            :key="wf.id"
            :workflow="wf"
            @select="$emit('open-workflow', $event)"
            @toggle-active="handleToggleWorkflowActive"
            @delete="handleDeleteWorkflow"
          />
        </div>

        <div
          v-if="loadingMore"
          class="flex justify-center py-6xl"
        >
          <div class="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
        </div>

        <div ref="infiniteScrollSentinel" class="h-4 w-full flex-shrink-0" aria-hidden="true" />
      </div>
    </div>

    <!-- Create Workflow Modal -->
    <Teleport to="body">
      <div
        v-if="showCreateModal"
        class="fixed inset-0 z-[60] flex items-center justify-center bg_overlay p-6xl"
        @click="closeCreateModal"
      >
        <div
          class="relative flex max-h-[90vh] w-full max-w-[420px] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
          @click.stop
        >
          <div class="flex shrink-0 items-center justify-between px-5xl pb-4xl pt-5xl">
            <h2 class="label_1_semibold primary_text_color">Create workflow</h2>
            <button
              type="button"
              class="flex h-9 w-9 items-center justify-center rounded-lg border primary_border_color text-secondary_text_color transition-colors hover:bg-gray-25"
              aria-label="Close"
              @click="closeCreateModal"
            >
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div class="custom_scrollbar min-h-0 flex-1 overflow-y-auto px-5xl pb-4xl">
            <div class="space-y-5xl">
              <div>
                <label for="wf-name" class="label_2_medium primary_text_color mb-md block">Name</label>
                <input
                  id="wf-name"
                  v-model="createForm.name"
                  type="text"
                  placeholder="Teacher workflow"
                  class="w-full rounded-lg border primary_border_color bg-white px-4xl py-md label_2_regular primary_text_color outline-none transition-colors placeholder:text-gray-400 focus:border-info-200"
                  autocomplete="off"
                  @keydown.enter.prevent="submitCreateWorkflow"
                />
              </div>

              <div>
                <label for="wf-desc" class="label_2_medium primary_text_color mb-md block">Description</label>
                <textarea
                  id="wf-desc"
                  v-model="createForm.description"
                  rows="3"
                  placeholder="Optional description"
                  class="w-full rounded-lg border primary_border_color bg-white px-4xl py-md label_2_regular primary_text_color outline-none transition-colors placeholder:text-gray-400 focus:border-info-200 resize-y min-h-[80px]"
                />
              </div>
            </div>
          </div>

          <div class="flex shrink-0 items-center justify-end gap-md border-t border-gray-100 px-5xl py-4xl">
            <button
              type="button"
              class="rounded-lg bg-gray-25 px-5xl py-md label_2_medium primary_text_color transition-colors hover:bg-gray-50-hover disabled:opacity-50"
              :disabled="creating"
              @click="closeCreateModal"
            >
              Cancel
            </button>
            <button
              type="button"
              class="primary_add_button rounded-lg px-5xl py-md label_2_semibold primary_2_text_color disabled:opacity-50"
              :disabled="creating || !createForm.name.trim()"
              @click="submitCreateWorkflow"
            >
              {{ creating ? 'Creating...' : 'Create' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </main>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import SearchIcon from '@app/assets/images/search.svg'
import WorkflowCard from '@app/components/workflow/WorkflowCard.vue'
import { useWorkflow } from '@app/composables/useWorkflow'
import { useToast } from '@app/composables/useToast'

const emit = defineEmits(['open-workflow'])

const { fetchWorkflowList, createWorkflowRecord, activateWorkflow, deactivateWorkflow } = useWorkflow()
const { showToast } = useToast()

const loading = ref(true)
const creating = ref(false)
const workflows = ref([])
const searchQuery = ref('')

const PAGE_SIZE = 12
const currentPage = ref(1)
const hasMoreWorkflows = ref(true)
const loadingMore = ref(false)
const infiniteScrollSentinel = ref(null)
const workflowScrollRoot = ref(null)
const intersectionObserver = ref(null)
const infiniteScrollUnblockAt = ref(0)
const INFINITE_SCROLL_SETTLE_MS = 400
let searchDebounceTimer = null
const SEARCH_DEBOUNCE_MS = 400

/** 'all' | 'active' | 'draft' — passed to list API as status when not 'all' */
const statusFilter = ref('all')
const statusTabs = [
  { id: 'all', label: 'All workflow' },
  { id: 'active', label: 'Active' },
  { id: 'draft', label: 'Draft' }
]

const showCreateModal = ref(false)
const createForm = ref({
  name: '',
  description: ''
})

function listRequestParams() {
  const statusParam = statusFilter.value === 'all' ? null : statusFilter.value
  const t = searchQuery.value.trim()
  const searchParam = t.length ? t : null
  return { statusParam, searchParam }
}

const emptyStateTitle = computed(() => {
  if (searchQuery.value.trim()) return 'No matching workflows'
  if (statusFilter.value === 'active') return 'No active workflows'
  if (statusFilter.value === 'draft') return 'No draft workflows'
  return 'No workflows yet'
})

const emptyStateHint = computed(() => {
  if (searchQuery.value.trim()) {
    return 'Try a different search or clear the filter to see more results.'
  }
  if (statusFilter.value === 'all') {
    return 'Create a workflow to model triggers, agent patterns, and outputs on the canvas.'
  }
  if (statusFilter.value === 'active') {
    return 'Activate a workflow from the build view, or switch to Draft to keep editing.'
  }
  return 'Create a new workflow or open an active workflow and deactivate it to add drafts here.'
})

const emptyStateShowCreate = computed(() => {
  if (searchQuery.value.trim()) return false
  return statusFilter.value === 'all' || statusFilter.value === 'draft'
})

function setStatusFilter(id) {
  if (statusFilter.value === id) return
  statusFilter.value = id
  resetAndLoad()
}

function setupInfiniteScroll() {
  if (!infiniteScrollSentinel.value) return
  if (intersectionObserver.value) {
    intersectionObserver.value.disconnect()
  }
  intersectionObserver.value = new IntersectionObserver(
    (entries) => {
      const [entry] = entries
      if (Date.now() < infiniteScrollUnblockAt.value) return
      if (
        entry.isIntersecting
        && hasMoreWorkflows.value
        && !loadingMore.value
        && !loading.value
      ) {
        loadMoreWorkflowsData()
      }
    },
    {
      root: workflowScrollRoot.value,
      rootMargin: '0px',
      threshold: 0.1
    }
  )
  intersectionObserver.value.observe(infiniteScrollSentinel.value)
}

async function loadMoreWorkflowsData() {
  if (loadingMore.value || !hasMoreWorkflows.value || loading.value) return
  loadingMore.value = true
  try {
    const nextPage = currentPage.value + 1
    const { statusParam, searchParam } = listRequestParams()
    const { workflows: list, pagination } = await fetchWorkflowList(nextPage, PAGE_SIZE, statusParam, searchParam)
    const existingIds = new Set(workflows.value.map((w) => w.id))
    const merged = list.filter((w) => w.id != null && !existingIds.has(w.id))
    workflows.value = [...workflows.value, ...merged]
    currentPage.value = pagination?.current_page ?? nextPage
    hasMoreWorkflows.value = Boolean(pagination?.has_next)
  } catch (e) {
    console.error(e)
    showToast('Error', e.message || 'Failed to load more workflows', 'error')
  } finally {
    loadingMore.value = false
  }
}

async function loadPage1() {
  loading.value = true
  try {
    const { statusParam, searchParam } = listRequestParams()
    const { workflows: list, pagination } = await fetchWorkflowList(1, PAGE_SIZE, statusParam, searchParam)
    workflows.value = list
    currentPage.value = pagination?.current_page ?? 1
    hasMoreWorkflows.value = Boolean(pagination?.has_next)
  } catch (e) {
    console.error(e)
    showToast('Error', e.message || 'Failed to load workflows', 'error')
    workflows.value = []
    hasMoreWorkflows.value = false
  } finally {
    loading.value = false
    infiniteScrollUnblockAt.value = Date.now() + INFINITE_SCROLL_SETTLE_MS
  }
}

async function resetAndLoad() {
  if (intersectionObserver.value) {
    intersectionObserver.value.disconnect()
  }
  currentPage.value = 1
  hasMoreWorkflows.value = true
  workflows.value = []
  await loadPage1()
  await nextTick()
  setupInfiniteScroll()
}

function openCreateModal() {
  createForm.value = { name: '', description: '' }
  showCreateModal.value = true
}

function closeCreateModal() {
  if (creating.value) return
  showCreateModal.value = false
}

async function submitCreateWorkflow() {
  const name = createForm.value.name.trim()
  if (!name) {
    showToast('Validation', 'Name is required', 'error')
    return
  }
  const description = createForm.value.description != null ? String(createForm.value.description).trim() : ''

  creating.value = true
  try {
    const payload = { name, description }
    const wf = await createWorkflowRecord(payload)
    if (wf?.id) {
      workflows.value = [wf, ...workflows.value]
      showCreateModal.value = false
      createForm.value = { name: '', description: '' }
      emit('open-workflow', wf.id)
    }
  } catch (e) {
    showToast('Error', e.message || 'Could not create workflow', 'error')
  } finally {
    creating.value = false
  }
}

async function handleToggleWorkflowActive({ workflow, active }) {
  const index = workflows.value.findIndex((w) => w.id === workflow.id)
  if (index === -1) return

  const previousStatus = workflows.value[index].status
  const nextStatus = active ? 'active' : 'inactive'

  // Optimistic update
  workflows.value[index] = { ...workflows.value[index], status: nextStatus }

  try {
    if (active) {
      await activateWorkflow(workflow.id)
      showToast('Workflow Activated', `"${workflow.name || 'Untitled workflow'}" is now active.`, 'success')
    } else {
      await deactivateWorkflow(workflow.id)
      showToast('Workflow Deactivated', `"${workflow.name || 'Untitled workflow'}" has been deactivated.`, 'success')
    }
  } catch (error) {
    workflows.value[index] = { ...workflows.value[index], status: previousStatus }
    showToast('Error', error?.message || 'Failed to update workflow status.', 'error')
  }
}

function handleDeleteWorkflow(wf) {
  workflows.value = workflows.value.filter((w) => w.id !== wf.id)
  showToast('Deleted', 'Workflow removed', 'success')
}

onMounted(async () => {
  await loadPage1()
  await nextTick()
  setupInfiniteScroll()
})

watch(searchQuery, () => {
  if (searchDebounceTimer) clearTimeout(searchDebounceTimer)
  searchDebounceTimer = setTimeout(() => {
    searchDebounceTimer = null
    resetAndLoad()
  }, SEARCH_DEBOUNCE_MS)
})

onUnmounted(() => {
  if (searchDebounceTimer) clearTimeout(searchDebounceTimer)
  if (intersectionObserver.value) {
    intersectionObserver.value.disconnect()
  }
})
</script>
