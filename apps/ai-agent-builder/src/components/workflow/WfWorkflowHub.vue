<script setup>
import { ref, inject, onMounted, onBeforeUnmount, watch, nextTick, computed } from 'vue'
import { Handle, Position, useVueFlow } from '@vue-flow/core'
import { useWorkflow } from '@app/composables/useWorkflow'
import { clearWorkflowDiagramLocal } from '@app/composables/useWorkflowDiagramLocal'
import { useToast } from '@app/composables/useToast'

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

const emit = defineEmits(['updateNodeInternals'])

const { viewport, nodes } = useVueFlow()
const { showToast } = useToast()

const {
  reorderPatterns,
  loadHitl,
  upsertHitl,
  deleteHitl
} = useWorkflow()

const reloadDiagram = inject('reloadDiagram', null)

const addStepDetails = ref(null)
const hubMenuOpen = ref(false)
const hubMenuWrap = ref(null)
const hubMenuPortalRef = ref(null)
const hubMenuPortalStyle = ref({})

const localTab = ref('patterns')
const patternReorderSaving = ref(false)
const loadingHitl = ref(false)
const savingHitl = ref(false)

const hitlExists = ref(false)
const hitlForm = ref({
  is_enabled: true,
  pause_on: 'failure',
  contact_channel: 'email',
  message_template: '',
  timeout_hours: 24,
  on_timeout: 'reject',
  owner_message: ''
})

const addStepTip =
  'pointer-events-none absolute left-1/2 top-full z-[60] mt-1.5 w-max max-w-[14rem] -translate-x-1/2 rounded-md bg-slate-900 px-2 py-1.5 text-center text-[11px] font-medium leading-tight text-white opacity-0 shadow-lg transition-opacity duration-150 group-hover/wf-hub-add:opacity-100 whitespace-normal'

function closeAddStepMenu() {
  const el = addStepDetails.value
  if (el && 'open' in el) el.open = false
}

const addStepOpen = ref(false)
function onAddStepToggle(e) {
  addStepOpen.value = !!e.target?.open
}

function updateHubMenuPosition() {
  const el = hubMenuWrap.value
  if (!el) return
  const r = el.getBoundingClientRect()
  const w = 176
  hubMenuPortalStyle.value = {
    top: `${Math.round(r.bottom + 4)}px`,
    left: `${Math.round(r.right - w)}px`
  }
}

function toggleHubMenu(e) {
  e?.stopPropagation?.()
  e?.preventDefault?.()
  hubMenuOpen.value = !hubMenuOpen.value
}

function onHubReorderPatterns() {
  hubMenuOpen.value = false
  localTab.value = 'patterns'
  const hubNode = nodes.value.find((n) => n.type === 'wfWorkflowHub')
  if (hubNode) {
    nodes.value.forEach((n) => { n.selected = false })
    hubNode.selected = true
  }
}

function onHubConfigureHitl() {
  hubMenuOpen.value = false
  const hitlNode = nodes.value.find((n) => n.id === 'hitl:config')
  if (hitlNode) {
    nodes.value.forEach((n) => { n.selected = false })
    hitlNode.selected = true
  } else {
    localTab.value = 'hitl'
    const hubNode = nodes.value.find((n) => n.type === 'wfWorkflowHub')
    if (hubNode) {
      nodes.value.forEach((n) => { n.selected = false })
      hubNode.selected = true
    }
    loadHitlDetails()
  }
}

function onHubDocumentClick(e) {
  if (!hubMenuOpen.value) return
  const t = e.target
  if (!(t instanceof Node)) return
  const wrap = hubMenuWrap.value
  const portal = hubMenuPortalRef.value
  if (wrap?.contains(t) || portal?.contains(t)) return
  hubMenuOpen.value = false
}

function closeAddStepIfOutside(e) {
  const el = addStepDetails.value
  if (!el || !el.open) return
  const t = e.target
  if (!(t instanceof Node)) return
  if (el.contains(t)) return
  el.open = false
}

function onResizeOrScroll() {
  if (hubMenuOpen.value) updateHubMenuPosition()
}

watch(hubMenuOpen, async (open) => {
  if (open) {
    await nextTick()
    updateHubMenuPosition()
  }
  emit('updateNodeInternals')
})

watch(
  () => [viewport.value.x, viewport.value.y, viewport.value.zoom, hubMenuOpen.value],
  () => {
    if (hubMenuOpen.value) nextTick(updateHubMenuPosition)
  }
)

onMounted(() => {
  document.addEventListener('click', onHubDocumentClick)
  document.addEventListener('click', closeAddStepIfOutside)
  document.addEventListener('pointerdown', closeAddStepIfOutside, true)
  window.addEventListener('resize', onResizeOrScroll)
  window.addEventListener('scroll', onResizeOrScroll, true)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', onHubDocumentClick)
  document.removeEventListener('click', closeAddStepIfOutside)
  document.removeEventListener('pointerdown', closeAddStepIfOutside, true)
  window.removeEventListener('resize', onResizeOrScroll)
  window.removeEventListener('scroll', onResizeOrScroll, true)
})

const patternRows = computed(() => {
  const list = (nodes.value || []).filter(
    (n) => n.type === 'wfPattern' && !n.parentNode && n.data?.patternId
  )
  return [...list].sort(
    (a, b) => (Number(a.data?.executionOrder) || 0) - (Number(b.data?.executionOrder) || 0)
  )
})

async function movePatternInMenu(index, dir) {
  const wId = props.data?.workflowId
  if (!wId || patternReorderSaving.value) return
  const sorted = patternRows.value
  const j = index + dir
  if (index < 0 || j < 0 || j >= sorted.length) return

  const swapped = [...sorted]
  const tmp = swapped[index]
  swapped[index] = swapped[j]
  swapped[j] = tmp

  const order = swapped.map((node, i) => ({
    pattern_id: String(node.data.patternId),
    execution_order: i + 1
  }))

  patternReorderSaving.value = true
  try {
    await reorderPatterns(wId, order)
    clearWorkflowDiagramLocal(wId)
    showToast('Success', 'Pattern order updated', 'success')
    if (reloadDiagram) await reloadDiagram()
  } catch (e) {
    console.error(e)
    showToast('Error', e?.message || 'Could not reorder patterns', 'error')
  } finally {
    patternReorderSaving.value = false
  }
}

async function loadHitlDetails() {
  const wId = props.data?.workflowId
  if (!wId) return
  loadingHitl.value = true
  try {
    const res = await loadHitl(wId)
    if (res) {
      hitlExists.value = true
      hitlForm.value = {
        is_enabled: res.is_enabled !== false,
        pause_on: res.pause_on || 'failure',
        contact_channel: res.contact_channel || 'email',
        message_template: res.message_template || '',
        timeout_hours: res.timeout_hours != null ? Number(res.timeout_hours) : 24,
        on_timeout: res.on_timeout || 'reject',
        owner_message: res.owner_message || ''
      }
    } else {
      hitlExists.value = false
    }
  } catch (e) {
    console.error('Failed to load HITL:', e)
  } finally {
    loadingHitl.value = false
  }
}

async function saveHitlDetails() {
  const wId = props.data?.workflowId
  if (!wId) return
  savingHitl.value = true
  try {
    await upsertHitl(wId, hitlForm.value, hitlExists.value)
    hitlExists.value = true
    showToast('Success', 'HITL configuration updated', 'success')
    if (reloadDiagram) await reloadDiagram()
  } catch (e) {
    console.error('Failed to save HITL:', e)
    showToast('Error', e.message || 'Save failed', 'error')
  } finally {
    savingHitl.value = false
  }
}

async function removeHitlStep() {
  const wId = props.data?.workflowId
  if (!wId) return
  if (!confirm('Remove HITL configuration?')) return
  savingHitl.value = true
  try {
    await deleteHitl(wId)
    hitlExists.value = false
    hitlForm.value = {
      is_enabled: true,
      pause_on: 'failure',
      contact_channel: 'email',
      message_template: '',
      timeout_hours: 24,
      on_timeout: 'reject',
      owner_message: ''
    }
    showToast('Success', 'HITL configuration removed', 'success')
    if (reloadDiagram) await reloadDiagram()
  } catch (e) {
    console.error('Failed to delete HITL:', e)
    showToast('Error', e.message || 'Delete failed', 'error')
  } finally {
    savingHitl.value = false
  }
}

watch(
  () => [props.selected, localTab.value],
  ([sel, tab]) => {
    if (sel && tab === 'hitl') {
      loadHitlDetails()
    }
  }
)
</script>

<template>
  <!-- Single root so Vue Flow node attrs (id, position, …) inherit; Teleport inside avoids a fragment. -->
  <div class="wf-workflow-hub-root relative h-full w-full min-h-0 overflow-visible">
    <div
      class="wf-workflow-hub relative flex h-full w-full flex-col overflow-visible rounded-xl bg-white p-0 text-left shadow-lg"
      :class="[selected && 'z-[2] ring-2 ring-blue-500 ring-offset-2 ring-offset-[#f1f4f9]']"
      style="
        border: 2px solid transparent;
        background-image: linear-gradient(white, white), linear-gradient(125deg, #fbbf24, #fb7185, #a78bfa);
        background-origin: border-box;
        background-clip: padding-box, border-box;
      "
    >
      <Handle
        type="source"
        :position="Position.Right"
        id="out"
        class="!h-2.5 !w-2.5 !-translate-y-1/2 !border !border-slate-400 !bg-white"
        style="top: 50%"
      />
      <div class="flex items-start gap-1 border-b border-slate-100 px-4 pb-2 pt-3">
        <p class="mt-0.5 min-w-0 flex-1 truncate text-sm font-bold leading-snug text-slate-900">
          {{ data.workflowName || 'Workflow' }}
        </p>
        <div ref="hubMenuWrap" class="relative shrink-0 -mr-1 -mt-0.5">
          <button
            type="button"
            class="rounded-md p-1.5 text-slate-600 hover:bg-slate-100 hover:text-slate-900 disabled:opacity-40"
            title="Workflow options"
            aria-label="Workflow options"
            aria-haspopup="menu"
            :aria-expanded="hubMenuOpen"
            :disabled="!data.workflowId"
            @pointerdown.stop
            @click.stop="toggleHubMenu"
          >
            <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M12 8a2 2 0 110-4 2 2 0 010 4zm0 6a2 2 0 110-4 2 2 0 010 4zm0
  6a2 2 0 110-4 2 2 0 010 4z"
              />
            </svg>
          </button>
        </div>
      </div>

      <div class="flex min-h-0 flex-1 flex-col overflow-y-auto px-4 pb-2 pt-2">
        <p class="text-[11px] font-semibold text-slate-500">Triggers</p>
        <div
          v-if="!data.triggerCount"
          class="mt-2 flex min-h-[4.5rem] flex-1 flex-col items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50/80 px-2 py-3"
        >
          <p class="mb-2 text-center text-[10px] text-slate-500">No triggers yet</p>
          <button
            type="button"
            data-action="add-trigger"
            class="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-slate-800"
          >
            <svg class="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            Add trigger
          </button>
        </div>
      </div>

      <!-- Zapier-style: dashed stem + add step (+) with action menu -->
      <div class="flex flex-shrink-0 flex-col items-center px-4 pb-1 pt-0">
        <div class="h-7 shrink-0 border-l-2 border-dashed border-slate-300" aria-hidden="true" />
      </div>

      <div class="relative flex flex-shrink-0 flex-col items-center px-3 pb-3 pt-0">
        <details ref="addStepDetails" class="relative z-20" @toggle="onAddStepToggle">
          <summary
            class="group/wf-hub-add relative flex h-9 w-9 cursor-pointer list-none items-center justify-center rounded-full border-2 border-transparent bg-white text-lg font-light text-slate-600 shadow-sm outline-none ring-offset-2 transition hover:text-blue-700 focus-visible:ring-2 focus-visible:ring-blue-400 [&::-webkit-details-marker]:hidden"
            style="
              background-image: linear-gradient(white, white), linear-gradient(125deg, #fbbf24, #fb7185, #a78bfa);
              background-origin: border-box;
              background-clip: padding-box, border-box;
            "
            aria-label="Add step"
          >
            <span aria-hidden="true">+</span>
            <span role="tooltip" :class="addStepTip">Add step</span>
          </summary>
          <div
            class="absolute left-1/2 top-[calc(100%+6px)] z-50 w-[min(16rem,calc(100vw-2rem))] -translate-x-1/2 rounded-xl border border-slate-200/90 bg-white py-1 shadow-lg shadow-slate-900/10"
            role="menu"
            aria-label="Add step options"
          >
            <button
              type="button"
              role="menuitem"
              data-action="add-trigger"
              class="flex w-full px-4 py-2.5 text-left text-sm font-medium text-slate-800 hover:bg-slate-50"
              @click="closeAddStepMenu"
            >
              Triggers
            </button>
            <button
              type="button"
              role="menuitem"
              data-action="add-pattern"
              class="flex w-full px-4 py-2.5 text-left text-sm font-medium text-slate-800 hover:bg-slate-50"
              @click="closeAddStepMenu"
            >
              Add pattern
            </button>
            <button
              type="button"
              role="menuitem"
              data-action="add-output-channel"
              class="flex w-full px-4 py-2.5 text-left text-sm font-medium text-slate-800 hover:bg-slate-50"
              @click="closeAddStepMenu"
            >
              Add output channel
            </button>
          </div>
        </details>
      </div>
    </div>

    <!-- Edit Popover Overlay when selected -->
    <div
      v-if="selected && !addStepOpen"
      class="absolute left-1/2 top-full mt-2 z-[1000] flex w-[320px] -translate-x-1/2 flex-col gap-3 rounded-lg border border-slate-200 bg-white p-3 shadow-xl text-xs text-slate-800"
      @pointerdown.stop
      @mousedown.stop
    >
      <!-- Tabs header -->
      <div class="flex border-b border-slate-200 pb-1.5 mb-0.5">
        <button
          type="button"
          class="flex-1 pb-1 text-center font-semibold border-b-2 transition-colors duration-150"
          :class="[localTab === 'patterns' ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700']"
          @click="localTab = 'patterns'"
        >
          Reorder
        </button>
        <button
          type="button"
          class="flex-1 pb-1 text-center font-semibold border-b-2 transition-colors duration-150"
          :class="[localTab === 'hitl' ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700']"
          @click="localTab = 'hitl'; loadHitlDetails()"
        >
          HITL settings
        </button>
      </div>

      <!-- Tab 1: Reorder Patterns -->
      <div v-if="localTab === 'patterns'" class="flex flex-col gap-2">
        <div class="flex flex-col gap-2 max-h-[200px] overflow-y-auto pr-1">
          <p v-if="!patternRows.length" class="text-xs text-slate-500 text-center py-2">No patterns inside this workflow.</p>
          <template v-else>
            <div
              v-for="(row, idx) in patternRows"
              :key="row.id"
              class="flex items-center justify-between gap-1.5 rounded border border-slate-100 bg-slate-50/70 p-1.5 text-[11px]"
            >
              <div class="min-w-0 flex-1">
                <div class="font-bold text-slate-700 truncate">
                  {{ row.data?.title || 'Pattern' }}
                </div>
                <div class="text-[9px] text-slate-500">Order: {{ row.data?.executionOrder ?? idx + 1 }}</div>
              </div>
              
              <!-- Reordering controls -->
              <div class="flex items-center gap-0.5 shrink-0">
                <button
                  type="button"
                  class="p-0.5 rounded text-slate-400 hover:bg-slate-200 hover:text-slate-700 disabled:opacity-30"
                  :disabled="idx === 0 || patternReorderSaving"
                  @click="movePatternInMenu(idx, -1)"
                  title="Move Up"
                >
                  <svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 15l7-7 7 7" />
                  </svg>
                </button>
                <button
                  type="button"
                  class="p-0.5 rounded text-slate-400 hover:bg-slate-200 hover:text-slate-700 disabled:opacity-30"
                  :disabled="idx === patternRows.length - 1 || patternReorderSaving"
                  @click="movePatternInMenu(idx, 1)"
                  title="Move Down"
                >
                  <svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
            </div>
          </template>
        </div>
      </div>

      <!-- Tab 2: HITL Configuration -->
      <div v-else-if="localTab === 'hitl'" class="flex flex-col gap-2 max-h-[250px] overflow-y-auto pr-1">
        <div v-if="loadingHitl" class="py-4 text-center text-slate-500">
          Loading HITL config…
        </div>
        <template v-else>
          <label class="flex items-center gap-1.5 text-[10px] text-slate-600 cursor-pointer">
            <input type="checkbox" v-model="hitlForm.is_enabled" class="rounded border-slate-300" />
            Enabled
          </label>
          <div class="flex flex-col gap-0.5">
            <label class="text-[10px] font-medium text-slate-500">Pause On</label>
            <select v-model="hitlForm.pause_on" class="border rounded px-1.5 py-1 text-xs bg-slate-50 outline-none">
              <option value="failure">Failure</option>
              <option value="before_confidential">Before Confidential</option>
              <option value="both">Both</option>
              <option value="custom">Custom</option>
            </select>
          </div>
          <div class="flex flex-col gap-0.5">
            <label class="text-[10px] font-medium text-slate-500">Contact Channel</label>
            <input v-model="hitlForm.contact_channel" type="text" placeholder="email" class="border rounded px-1.5 py-1 text-xs outline-none focus:border-blue-400 bg-white" />
          </div>
          <div class="flex flex-col gap-0.5">
            <label class="text-[10px] font-medium text-slate-500">Message Template</label>
            <textarea v-model="hitlForm.message_template" rows="2" class="border rounded px-1.5 py-1 text-xs outline-none focus:border-blue-400 bg-white" />
          </div>
          <div class="flex flex-col gap-0.5">
            <label class="text-[10px] font-medium text-slate-500">Timeout (Hours)</label>
            <input v-model.number="hitlForm.timeout_hours" type="number" min="1" class="border rounded px-1.5 py-1 text-xs outline-none focus:border-blue-400 bg-white" />
          </div>
          <div class="flex flex-col gap-0.5">
            <label class="text-[10px] font-medium text-slate-500">On Timeout</label>
            <select v-model="hitlForm.on_timeout" class="border rounded px-1.5 py-1 text-xs bg-slate-50 outline-none">
              <option value="reject">Reject</option>
              <option value="approve">Approve</option>
              <option value="escalate">Escalate</option>
            </select>
          </div>
          <div class="flex flex-col gap-0.5">
            <label class="text-[10px] font-medium text-slate-500">Owner Message</label>
            <input v-model="hitlForm.owner_message" type="text" class="border rounded px-1.5 py-1 text-xs outline-none focus:border-blue-400 bg-white" />
          </div>
          <div class="flex gap-2 mt-2">
            <button type="button" class="flex-1 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white font-medium text-[11px]" :disabled="savingHitl" @click="saveHitlDetails">
              {{ savingHitl ? 'Saving…' : hitlExists ? 'Update' : 'Create' }}
            </button>
            <button v-if="hitlExists" type="button" class="flex-1 py-1 rounded border border-red-300 hover:bg-red-50 text-red-700 font-medium text-[11px]" :disabled="savingHitl" @click="removeHitlStep">
              Delete
            </button>
          </div>
        </template>
      </div>
    </div>

    <Teleport to="body">
      <div
        v-if="hubMenuOpen"
        ref="hubMenuPortalRef"
        class="fixed z-[20000] w-44 overflow-hidden rounded-lg border border-slate-200 bg-white py-1 shadow-xl shadow-slate-900/15"
        role="menu"
        aria-label="Workflow hub options"
        :style="hubMenuPortalStyle"
        @pointerdown.stop
        @click.stop
      >
        <button
          type="button"
          role="menuitem"
          class="w-full px-3 py-2 text-left text-sm font-medium text-slate-800 hover:bg-slate-50"
          @click="onHubReorderPatterns"
        >
          Reorder patterns
        </button>
        <button
          type="button"
          role="menuitem"
          class="w-full px-3 py-2 text-left text-sm font-medium text-slate-800 hover:bg-slate-50"
          @click="onHubConfigureHitl"
        >
          Human-in-the-loop (HITL)
        </button>
      </div>
    </Teleport>
  </div>
</template>
