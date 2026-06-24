<script setup>
import { computed, onMounted, onUnmounted, ref, watch, inject } from 'vue'
import { Handle, Position } from '@vue-flow/core'
import { useWorkflow } from '@app/composables/useWorkflow'
import { apiService } from '@app/services/agentApi.js'

const props = defineProps({
  data: {
    type: Object,
    default: () => ({})
  },
  selected: {
    type: Boolean,
    default: false
  }
})

const menuOpen = ref(false)
const patternMenuRef = ref(null)

function onDocPointerDown(e) {
  const el = patternMenuRef.value
  if (!menuOpen.value || !el) return
  if (!el.contains(e.target)) {
    menuOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('pointerdown', onDocPointerDown, true)
})

onUnmounted(() => {
  document.removeEventListener('pointerdown', onDocPointerDown, true)
})

const typeLabel = computed(() => {
  const raw = props.data?.patternType
  if (!raw) return ''
  return String(raw).replace(/_/g, ' ')
})

const stepOrder = computed(() => {
  const n = Number(props.data?.executionOrder)
  return Number.isFinite(n) && n > 0 ? n : 0
})

/** Hover-only tooltip for pattern + menu (no focus-within). */
const patternMenuTip =
  'pointer-events-none absolute left-1/2 top-full z-[55] mt-1.5 w-max max-w-[14rem] -translate-x-1/2 rounded-md bg-slate-900 px-2 py-1.5 text-center text-[11px] font-medium leading-tight text-white opacity-0 shadow-lg transition-opacity duration-150 group-hover/wf-pmenu:opacity-100 whitespace-normal'

const workflowId = inject('workflowId', null)
const reloadDiagram = inject('reloadDiagram', null)

const {
  updatePattern,
  removePattern,
  listPatternAgents,
  addPatternAgent,
  nextAgentExecutionOrder,
  reorderPatternAgents,
  removePatternAgent,
  fetchAgentNameByIdMap
} = useWorkflow()

const localType = ref('sequential')
const localName = ref('')
const localDesc = ref('')
const saving = ref(false)

const localTab = ref('edit') // 'edit', 'add', 'manage'
const agentsList = ref([])
const agentsLoading = ref(false)
const patternAgents = ref([])
const patternAgentsLoading = ref(false)
const agentNameMap = ref({})
const newAgentId = ref('')
const newTimeoutSec = ref('30')

function syncLocalFromData() {
  localType.value = props.data?.patternType || 'sequential'
  localName.value = props.data?.title || ''
  localDesc.value = props.data?.subtitle || ''
}

async function fetchAgents() {
  if (agentsList.value.length > 0) return
  agentsLoading.value = true
  try {
    const collected = []
    let page = 1
    const limit = 100
    let hasMore = true
    while (hasMore && page <= 10) {
      const res = await apiService.getAgentData(page, limit, null, null)
      const data = res?.data ?? res
      const batch = Array.isArray(data?.agents) ? data.agents : Array.isArray(data) ? data : []
      collected.push(...batch)
      const pag = data?.pagination
      hasMore = pag?.has_next === true && batch.length > 0
      page += 1
      if (!batch.length) hasMore = false
    }
    agentsList.value = collected
  } catch (e) {
    console.error('Failed to fetch catalog agents:', e)
  } finally {
    agentsLoading.value = false
  }
}

async function fetchPatternAgents() {
  const wId = workflowId?.value || workflowId
  if (!wId || !props.data.patternId) return
  patternAgentsLoading.value = true
  try {
    const list = await listPatternAgents(wId, props.data.patternId)
    patternAgents.value = list || []
  } catch (e) {
    console.error('Failed to fetch pattern agents:', e)
  } finally {
    patternAgentsLoading.value = false
  }
}

async function loadAgentNames() {
  if (Object.keys(agentNameMap.value).length > 0) return
  try {
    const map = await fetchAgentNameByIdMap()
    agentNameMap.value = map || {}
  } catch (e) {
    console.error('Failed to load agent name map:', e)
  }
}

watch(
  () => props.data?.tab,
  (val) => {
    if (val) {
      localTab.value = val
      if (val === 'add') fetchAgents()
      if (val === 'manage') clickManageTab()
    }
  },
  { immediate: true }
)

watch(
  () => props.selected,
  (sel) => {
    if (!sel) {
      localTab.value = 'edit'
    } else {
      syncLocalFromData()
      if (localTab.value === 'add') fetchAgents()
      if (localTab.value === 'manage') clickManageTab()
    }
  }
)

async function clickAddTab() {
  localTab.value = 'add'
  await fetchAgents()
}

async function clickManageTab() {
  localTab.value = 'manage'
  await Promise.all([fetchPatternAgents(), loadAgentNames()])
}

const sortedPatternAgents = computed(() => {
  return [...patternAgents.value].sort((a, b) => {
    return (Number(a.execution_order) || 0) - (Number(b.execution_order) || 0)
  })
})

async function savePatternDetails() {
  const wId = workflowId?.value || workflowId
  if (!wId || !props.data.patternId) return
  const name = localName.value.trim()
  const description = localDesc.value.trim()
  if (!name || !description) return
  saving.value = true
  try {
    await updatePattern(wId, props.data.patternId, {
      pattern_type: localType.value,
      name,
      description
    })
    if (reloadDiagram) await reloadDiagram()
  } catch (e) {
    console.error('Failed to save pattern details:', e)
  } finally {
    saving.value = false
  }
}

async function deletePattern() {
  const wId = workflowId?.value || workflowId
  if (!wId || !props.data.patternId) return
  if (!confirm('Remove this pattern? This will delete all agents inside it. This cannot be undone.')) return
  saving.value = true
  try {
    await removePattern(wId, props.data.patternId)
    if (reloadDiagram) await reloadDiagram()
  } catch (e) {
    console.error('Failed to delete pattern:', e)
  } finally {
    saving.value = false
  }
}

async function submitAddAgent() {
  const wId = workflowId?.value || workflowId
  if (!wId || !props.data.patternId || !newAgentId.value) return
  saving.value = true
  try {
    const sec = Number(newTimeoutSec.value)
    const config = { timeout_seconds: Number.isNaN(sec) ? 30 : sec }
    const order = await nextAgentExecutionOrder(wId, props.data.patternId)
    await addPatternAgent(wId, props.data.patternId, {
      agent_id: newAgentId.value,
      execution_order: order,
      config
    })
    newAgentId.value = ''
    newTimeoutSec.value = '30'
    localTab.value = 'manage'
    await fetchPatternAgents()
    if (reloadDiagram) await reloadDiagram()
  } catch (e) {
    console.error('Failed to add pattern agent:', e)
  } finally {
    saving.value = false
  }
}

async function moveAgent(row, dir) {
  const wId = workflowId?.value || workflowId
  if (!wId || !props.data.patternId) return
  const sorted = [...sortedPatternAgents.value]
  const idx = sorted.findIndex((x) => x.id === row.id)
  const j = idx + dir
  if (idx < 0 || j < 0 || j >= sorted.length) return
  const swapped = [...sorted]
  const tmp = swapped[idx]
  swapped[idx] = swapped[j]
  swapped[j] = tmp
  const order = swapped.map((r, i) => ({
    pattern_agent_id: r.id,
    execution_order: i + 1
  }))
  saving.value = true
  try {
    await reorderPatternAgents(wId, props.data.patternId, order)
    await fetchPatternAgents()
    if (reloadDiagram) await reloadDiagram()
  } catch (e) {
    console.error('Reorder failed:', e)
  } finally {
    saving.value = false
  }
}

async function removeAgent(row) {
  const wId = workflowId?.value || workflowId
  if (!wId || !props.data.patternId) return
  if (!confirm('Remove this agent step from pattern? This cannot be undone.')) return
  saving.value = true
  try {
    await removePatternAgent(wId, props.data.patternId, row.id)
    await fetchPatternAgents()
    if (reloadDiagram) await reloadDiagram()
  } catch (e) {
    console.error('Remove failed:', e)
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div
    class="wf-pattern relative flex h-full w-full flex-col overflow-visible rounded-xl border-2 border-dashed shadow-md"
    :class="[
      selected
        ? '!z-50 !ring-2 !ring-blue-500 !ring-offset-2 !ring-offset-[#f1f4f9]'
        : ''
    ]"
    :style="{
      borderColor: data.ps?.stroke || '#ca8a04'
    }"
    @pointerdown.stop
    @mousedown.stop
  >
    <Handle
      id="in"
      type="target"
      :position="Position.Left"
      :style="{
        top: `${Number(data?.handleInTopPct ?? 50)}%`,
        transform: 'translateY(-50%)'
      }"
      class="!h-2.5 !w-2.5 !border regular_border_color !bg_secondary_color"
    />
    <Handle
      id="out"
      type="source"
      :position="Position.Right"
      :style="{
        top: `${Number(data?.handleOutTopPct ?? 50)}%`,
        transform: 'translateY(-50%)'
      }"
      class="!h-2.5 !w-2.5 !border regular_border_color !bg_secondary_color"
    />

    <!-- Header: always visible (name, type badge, + menu for agents) -->
    <div
      class="isolate z-30 flex h-10 min-h-10 shrink-0 items-center gap-2 rounded-t-[10px] border-b px-3"
      :style="{
        backgroundColor: data.ps?.header || '#fef3c7',
        borderColor: (data.ps?.stroke || '#ca8a04') + '55'
      }"
    >
      <span
        v-if="stepOrder"
        class="shrink-0 rounded bg-slate-800 px-1.5 py-0.5 text-[9px] font-bold tabular-nums text-white shadow-sm"
        title="Step order in this workflow (left → right on canvas)"
      >
        #{{ stepOrder }}
      </span>
      <span
        v-if="typeLabel"
        class="max-w-[40%] shrink-0 truncate rounded bg_secondary_color/70 px-1.5 py-0.5 caption_1_semibold uppercase tracking-wide secondary_text_color"
      >
        {{ typeLabel }}
      </span>
      <div class="min-w-0 flex-1">
        <div class="truncate text-xs font-bold leading-tight primary_text_color">
          {{ data.title }}
        </div>
        <div v-if="data.subtitle" class="truncate text-[10px] leading-tight secondary_text_color">
          {{ data.subtitle }}
        </div>
      </div>
      <div ref="patternMenuRef" class="relative z-40 shrink-0">
        <button
          type="button"
          class="group/wf-pmenu relative inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded-md border regular_border_color bg_secondary_color secondary_text_color shadow-sm hover:bg-gray-25"
          aria-label="Pattern actions"
          :aria-expanded="menuOpen"
          aria-haspopup="menu"
          @click.stop="menuOpen = !menuOpen"
        >
          <svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.25" d="M12 5v14m7-7H5" />
          </svg>
          <span role="tooltip" :class="patternMenuTip">Pattern actions</span>
        </button>
        <div
          v-show="menuOpen"
          class="absolute right-0 bottom-full z-50 mb-1 w-44 rounded-lg border regular_border_color bg_secondary_color p-1 py-1 shadow-xl"
          role="menu"
        >
          <button
            type="button"
            data-action="add-agent-to-pattern"
            class="w-full rounded-md px-2 py-1.5 text-left text-[11px] font-medium primary_text_color hover:bg-gray-25"
            role="menuitem"
            @click="menuOpen = false"
          >
            Add agent to pattern
          </button>
          <button
            type="button"
            data-action="manage-pattern-agents"
            class="w-full rounded-md px-2 py-1.5 text-left text-[11px] font-medium primary_text_color hover:bg-gray-25"
            role="menuitem"
            @click="menuOpen = false"
          >
            Manage pattern agents
          </button>
        </div>
      </div>
    </div>

    <!-- Edit Popover Overlay when selected -->
    <div
      v-if="selected"
      class="absolute left-1/2 top-full mt-2 z-[1000] flex w-[320px] -translate-x-1/2 flex-col gap-3 rounded-lg border regular_border_color bg_secondary_color p-3 shadow-xl text-xs primary_text_color"
      @pointerdown.stop
      @mousedown.stop
    >
      <!-- Tabs header -->
      <div class="flex border-b regular_border_color pb-1.5 mb-0.5">
        <button
          type="button"
          class="flex-1 pb-1 text-center font-semibold border-b-2 transition-colors duration-150"
          :class="[localTab === 'edit' ? 'border-black-400 primary_text_color' : 'border-transparent secondary_text_color hover:primary_text_color']"
          @click="localTab = 'edit'"
        >
          Details
        </button>
        <button
          type="button"
          class="flex-1 pb-1 text-center font-semibold border-b-2 transition-colors duration-150"
          :class="[localTab === 'add' ? 'border-black-400 primary_text_color' : 'border-transparent secondary_text_color hover:primary_text_color']"
          @click="clickAddTab"
        >
          Add Agent
        </button>
        <button
          type="button"
          class="flex-1 pb-1 text-center font-semibold border-b-2 transition-colors duration-150"
          :class="[localTab === 'manage' ? 'border-black-400 primary_text_color' : 'border-transparent secondary_text_color hover:primary_text_color']"
          @click="clickManageTab"
        >
          Manage
        </button>
      </div>

      <!-- Tab 1: Edit Pattern Details -->
      <div v-if="localTab === 'edit'" class="flex flex-col gap-2">
        <div class="flex flex-col gap-0.5">
          <label class="text-[10px] font-medium secondary_text_color">Name</label>
          <input
            v-model="localName"
            type="text"
            class="border regular_border_color rounded px-1.5 py-1 text-xs outline-none focus:border-blue-400 bg_secondary_color"
            placeholder="Pattern name"
            @keydown.enter="savePatternDetails"
          >
        </div>
        <div class="flex flex-col gap-0.5">
          <label class="text-[10px] font-medium secondary_text_color">Pattern type</label>
          <select v-model="localType" class="border regular_border_color rounded px-1.5 py-1 text-xs bg_secondary_color outline-none">
            <option value="sequential">Sequential</option>
            <option value="parallel">Parallel</option>
            <option value="supervisor">Supervisor</option>
            <option value="agent_to_agent">Agent-to-agent</option>
          </select>
        </div>
        <div class="flex flex-col gap-0.5">
          <label class="text-[10px] font-medium secondary_text_color">Description</label>
          <textarea
            v-model="localDesc"
            rows="2"
            class="border regular_border_color rounded px-1.5 py-1 text-xs outline-none focus:border-blue-400 bg_secondary_color"
            placeholder="What does this pattern do?"
          />
        </div>
        <div class="flex gap-2 mt-1">
          <button
            type="button"
            class="primary_add_button flex-1 py-1 rounded text-white font-medium text-[11px]"
            :disabled="saving || !localName.trim() || !localDesc.trim()"
            @click="savePatternDetails"
          >
            {{ saving ? 'Saving…' : 'Save' }}
          </button>
          <button
            type="button"
            class="flex-1 py-1 rounded border regular_border_color hover:bg-red-50 delete_text_color font-medium text-[11px]"
            :disabled="saving"
            @click="deletePattern"
          >
            Delete
          </button>
        </div>
      </div>

      <!-- Tab 2: Add Agent to Pattern -->
      <div v-else-if="localTab === 'add'" class="flex flex-col gap-2">
        <div class="flex flex-col gap-0.5">
          <label class="text-[10px] font-medium secondary_text_color">Agent</label>
          <p v-if="agentsLoading" class="text-xs secondary_text_color py-1">Loading agents…</p>
          <p v-else-if="!agentsList.length" class="text-xs text-amber-700 py-1">No agents found.</p>
          <select v-else v-model="newAgentId" class="border regular_border_color rounded px-1.5 py-1 text-xs outline-none bg_secondary_color">
            <option value="" disabled>Select agent</option>
            <option v-for="a in agentsList" :key="a.id" :value="String(a.id)">
              {{ a.name || a.agent_name || a.id }}
            </option>
          </select>
        </div>
        <div class="flex flex-col gap-0.5">
          <label class="text-[10px] font-medium secondary_text_color">Timeout (seconds)</label>
          <input
            v-model="newTimeoutSec"
            type="number"
            min="1"
            class="border regular_border_color rounded px-1.5 py-1 text-xs outline-none focus:border-blue-400 bg_secondary_color"
          />
        </div>
        <div class="flex gap-2 mt-2">
          <button
            type="button"
            class="primary_add_button flex-1 py-1.5 rounded text-white font-medium text-[11px] disabled:opacity-50"
            :disabled="saving || !newAgentId"
            @click="submitAddAgent"
          >
            {{ saving ? 'Adding…' : 'Add Agent' }}
          </button>
        </div>
      </div>

      <!-- Tab 3: Manage Pattern Agents -->
      <div v-else-if="localTab === 'manage'" class="flex flex-col gap-2">
        <div class="flex flex-col gap-2 max-h-[200px] overflow-y-auto pr-1">
          <p v-if="patternAgentsLoading" class="text-xs secondary_text_color text-center py-2">Loading...</p>
          <p v-else-if="!patternAgents.length" class="text-xs secondary_text_color text-center py-2">No agents inside this pattern.</p>
          <template v-else>
            <div
              v-for="(row, idx) in sortedPatternAgents"
              :key="row.id"
              class="flex items-center justify-between gap-1.5 rounded border primary_border_color bg_primary_color p-1.5 text-[11px]"
            >
              <div class="min-w-0 flex-1">
                <div class="font-bold primary_text_color truncate">
                  {{ row.agent_name || agentNameMap[String(row.agent_id)] || row.agent_id }}
                </div>
                <div class="text-[9px] secondary_text_color">Order: {{ row.execution_order }}</div>
              </div>
              
              <!-- Reordering / deletion controls -->
              <div class="flex items-center gap-0.5 shrink-0">
                <button
                  type="button"
                  class="p-0.5 rounded tertiary_text_color hover:bg-gray-50-hover hover:primary_text_color disabled:opacity-30"
                  :disabled="idx === 0 || saving"
                  @click="moveAgent(row, -1)"
                  title="Move Up"
                >
                  <svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 15l7-7 7 7" />
                  </svg>
                </button>
                <button
                  type="button"
                  class="p-0.5 rounded tertiary_text_color hover:bg-gray-50-hover hover:primary_text_color disabled:opacity-30"
                  :disabled="idx === sortedPatternAgents.length - 1 || saving"
                  @click="moveAgent(row, 1)"
                  title="Move Down"
                >
                  <svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <button
                  type="button"
                  class="p-0.5 rounded tertiary_text_color hover:bg-red-50 hover:text-red-600 delete_text_color disabled:opacity-30 ml-1"
                  :disabled="saving"
                  @click="removeAgent(row)"
                  title="Remove agent from pattern"
                >
                  <svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          </template>
        </div>
      </div>
    </div>

    <!-- Agent drop zone (child agent cards render here via Vue Flow parentNode) -->
    <div
      class="relative min-h-0 flex-1 overflow-visible rounded-b-[10px]"
      :style="{
        backgroundColor: data.ps?.fill || 'rgba(254, 243, 199, 0.45)'
      }"
    />
  </div>
</template>
