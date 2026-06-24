<script setup>
import { computed, onMounted, onUnmounted, ref, watch, inject } from 'vue'
import { Handle, Position } from '@vue-flow/core'
import { SelectBox } from '@ai-suite/shared-ui'
import { useWorkflow } from '@app/composables/useWorkflow'
import { apiService } from '@app/services/agentApi.js'
import WfPopoverTabs from './WfPopoverTabs.vue'
import WfFormField from './WfFormField.vue'
import {
  WF_POPOVER_PANEL,
  WF_TAB_PANEL,
  WF_FIELD_INPUT,
  WF_FIELD_SELECT,
  WF_BTN_ROW,
  WF_BTN_PRIMARY,
  WF_BTN_DANGER,
  WF_LIST_ITEM,
  PATTERN_TYPE_OPTIONS
} from './workflowFormStyles.js'

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

const patternTabs = [
  { id: 'edit', label: 'Details' },
  { id: 'add', label: 'Add Agent' },
  { id: 'manage', label: 'Manage' }
]

const agentOptions = computed(() =>
  agentsList.value.map((a) => ({
    id: String(a.id),
    name: a.name || a.agent_name || String(a.id)
  }))
)

watch(localTab, async (tab) => {
  if (tab === 'add') await fetchAgents()
  if (tab === 'manage') {
    await Promise.all([fetchPatternAgents(), loadAgentNames()])
  }
})

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
    }
  }
)

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
      :class="[WF_POPOVER_PANEL, 'w-[320px]']"
      @pointerdown.stop
      @mousedown.stop
    >
      <WfPopoverTabs v-model="localTab" :tabs="patternTabs" />

      <!-- Tab 1: Edit Pattern Details -->
      <div v-if="localTab === 'edit'" :class="WF_TAB_PANEL">
        <WfFormField label="Name">
          <input
            v-model="localName"
            type="text"
            :class="WF_FIELD_INPUT"
            placeholder="Pattern name"
            @keydown.enter="savePatternDetails"
          >
        </WfFormField>
        <WfFormField label="Pattern type">
          <SelectBox
            :model-value="localType"
            :options="PATTERN_TYPE_OPTIONS"
            wrapper-class="w-full"
            :custom-class="WF_FIELD_SELECT"
            dropdown-class="w-full"
            @change="localType = $event.id"
          />
        </WfFormField>
        <WfFormField label="Description">
          <textarea
            v-model="localDesc"
            rows="2"
            :class="WF_FIELD_INPUT"
            placeholder="What does this pattern do?"
          />
        </WfFormField>
        <div :class="WF_BTN_ROW">
          <button
            type="button"
            :class="WF_BTN_PRIMARY"
            :disabled="saving || !localName.trim() || !localDesc.trim()"
            @click="savePatternDetails"
          >
            {{ saving ? 'Saving…' : 'Save' }}
          </button>
          <button
            type="button"
            :class="WF_BTN_DANGER"
            :disabled="saving"
            @click="deletePattern"
          >
            Delete
          </button>
        </div>
      </div>

      <!-- Tab 2: Add Agent to Pattern -->
      <div v-else-if="localTab === 'add'" :class="WF_TAB_PANEL">
        <WfFormField label="Agent">
          <p v-if="agentsLoading" class="body_3_regular secondary_text_color py-1">Loading agents…</p>
          <p v-else-if="!agentsList.length" class="body_3_regular text-amber-700 py-1">No agents found.</p>
          <SelectBox
            v-else
            :model-value="newAgentId"
            :options="agentOptions"
            placeholder="Select agent"
            wrapper-class="w-full"
            :custom-class="WF_FIELD_SELECT"
            dropdown-class="w-full"
            @change="newAgentId = $event.id"
          />
        </WfFormField>
        <WfFormField label="Timeout (seconds)">
          <input v-model="newTimeoutSec" type="number" min="1" :class="WF_FIELD_INPUT" />
        </WfFormField>
        <div :class="WF_BTN_ROW">
          <button
            type="button"
            :class="WF_BTN_PRIMARY"
            :disabled="saving || !newAgentId"
            @click="submitAddAgent"
          >
            {{ saving ? 'Adding…' : 'Add Agent' }}
          </button>
        </div>
      </div>

      <!-- Tab 3: Manage Pattern Agents -->
      <div v-else-if="localTab === 'manage'" :class="WF_TAB_PANEL">
        <p v-if="patternAgentsLoading" class="body_3_regular secondary_text_color py-2 text-center">Loading...</p>
        <p v-else-if="!patternAgents.length" class="body_3_regular secondary_text_color py-2 text-center">No agents inside this pattern.</p>
        <template v-else>
          <div
            v-for="(row, idx) in sortedPatternAgents"
            :key="row.id"
            :class="WF_LIST_ITEM"
          >
            <div class="min-w-0 flex-1">
              <div class="label_3_semibold primary_text_color truncate">
                {{ row.agent_name || agentNameMap[String(row.agent_id)] || row.agent_id }}
              </div>
              <div class="caption_1_medium secondary_text_color">Order: {{ row.execution_order }}</div>
            </div>
            <div class="flex shrink-0 items-center gap-0.5">
              <button
                type="button"
                class="rounded p-0.5 tertiary_text_color hover:bg-gray-50-hover hover:primary_text_color disabled:opacity-30"
                :disabled="idx === 0 || saving"
                title="Move Up"
                @click="moveAgent(row, -1)"
              >
                <svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 15l7-7 7 7" />
                </svg>
              </button>
              <button
                type="button"
                class="rounded p-0.5 tertiary_text_color hover:bg-gray-50-hover hover:primary_text_color disabled:opacity-30"
                :disabled="idx === sortedPatternAgents.length - 1 || saving"
                title="Move Down"
                @click="moveAgent(row, 1)"
              >
                <svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <button
                type="button"
                class="ml-1 rounded p-0.5 tertiary_text_color delete_text_color hover:bg-error-50 disabled:opacity-30"
                :disabled="saving"
                title="Remove agent from pattern"
                @click="removeAgent(row)"
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

    <!-- Agent drop zone (child agent cards render here via Vue Flow parentNode) -->
    <div
      class="relative min-h-0 flex-1 overflow-visible rounded-b-[10px]"
      :style="{
        backgroundColor: data.ps?.fill || 'rgba(254, 243, 199, 0.45)'
      }"
    />
  </div>
</template>
