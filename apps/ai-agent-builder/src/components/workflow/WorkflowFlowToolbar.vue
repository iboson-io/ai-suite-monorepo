<script setup>
import { computed, ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { Panel } from '@vue-flow/core'
import { useVueFlow } from '@vue-flow/core'
import { useWorkflow } from '@app/composables/useWorkflow'
import { clearWorkflowDiagramLocal } from '@app/composables/useWorkflowDiagramLocal'
import { useToast } from '@app/composables/useToast'

const emit = defineEmits(['reset-layout', 'undo', 'redo', 'auto-layout', 'patterns-reordered', 'preview'])

const props = defineProps({
  workflowId: {
    type: String,
    default: ''
  },
  canUndo: {
    type: Boolean,
    default: false
  },
  canRedo: {
    type: Boolean,
    default: false
  },
  canAutoLayout: {
    type: Boolean,
    default: true
  },
  /** When false, properties panel is hidden — preview button shows pressed state. */
  propertiesPanelVisible: {
    type: Boolean,
    default: true
  }
})

const { reorderPatterns } = useWorkflow()
const { showToast } = useToast()
const { zoomIn, zoomOut, fitView, nodes, edges, viewport } = useVueFlow()

const patternMenuOpen = ref(false)
const patternReorderModalOpen = ref(false)
const patternMenuWrap = ref(null)
const patternReorderSaving = ref(false)

const nodeCount = computed(() => nodes.value?.length ?? 0)
const edgeCount = computed(() => edges.value?.length ?? 0)

const patternRows = computed(() => {
  const list = (nodes.value || []).filter(
    (n) => n.type === 'wfPattern' && !n.parentNode && n.data?.patternId
  )
  return [...list].sort(
    (a, b) => (Number(a.data?.executionOrder) || 0) - (Number(b.data?.executionOrder) || 0)
  )
})

function togglePatternMenu(e) {
  e?.stopPropagation?.()
  patternMenuOpen.value = !patternMenuOpen.value
}

function openPatternReorderModal() {
  patternMenuOpen.value = false
  patternReorderModalOpen.value = true
}

function closePatternReorderModal() {
  patternReorderModalOpen.value = false
}

function onDocumentClick(e) {
  if (!patternMenuOpen.value) return
  const el = patternMenuWrap.value
  if (el && e.target instanceof Node && !el.contains(e.target)) {
    patternMenuOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', onDocumentClick)
})

function onModalKeydown(e) {
  if (e.key === 'Escape') closePatternReorderModal()
}

watch(patternReorderModalOpen, (open) => {
  if (open) document.addEventListener('keydown', onModalKeydown)
  else document.removeEventListener('keydown', onModalKeydown)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', onDocumentClick)
  document.removeEventListener('keydown', onModalKeydown)
})

async function movePatternInMenu(index, dir) {
  if (!props.workflowId || patternReorderSaving.value) return
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
    await reorderPatterns(props.workflowId, order)
    clearWorkflowDiagramLocal(props.workflowId)
    showToast('Success', 'Pattern order updated', 'success')
    emit('patterns-reordered')
  } catch (e) {
    console.error(e)
    showToast('Error', e?.message || 'Could not reorder patterns', 'error')
  } finally {
    patternReorderSaving.value = false
  }
}

function onFit() {
  fitView({ padding: 0.18, duration: 220 })
}

function graphExportPayload() {
  return {
    exportedAt: new Date().toISOString(),
    nodes: nodes.value,
    edges: edges.value,
    viewport: viewport?.value ?? null
  }
}

function downloadGraphJson() {
  const payload = graphExportPayload()
  const safeId = (props.workflowId || 'workflow').replace(/[^a-zA-Z0-9-_]/g, '_')
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = `${safeId}-diagram.json`
  a.click()
  URL.revokeObjectURL(a.href)
}

async function copyGraphJson() {
  const text = JSON.stringify(graphExportPayload(), null, 2)
  try {
    await navigator.clipboard.writeText(text)
  } catch {
    const ta = document.createElement('textarea')
    ta.value = text
    document.body.appendChild(ta)
    ta.select()
    document.execCommand('copy')
    document.body.removeChild(ta)
  }
}

defineExpose({
  openPatternReorderModal
})

const tipBarWrap = 'group/wf-ft relative inline-flex shrink-0'
const tipBar =
  'pointer-events-none absolute top-full left-1/2 z-[10060] mt-1.5 w-max max-w-[min(18rem,calc(100vw-2rem))] -translate-x-1/2 rounded-md bg-slate-900 px-2 py-1.5 text-left text-[11px] font-medium leading-snug text-white opacity-0 shadow-lg transition-opacity duration-150 group-hover/wf-ft:opacity-100 whitespace-normal'
const tipModalWrap = 'group/wf-ftm relative inline-flex shrink-0'
const tipModal =
  'pointer-events-none absolute top-full left-1/2 z-[10060] mt-1.5 w-max max-w-[16rem] -translate-x-1/2 rounded-md bg-slate-900 px-2 py-1.5 text-center text-[11px] font-medium leading-tight text-white opacity-0 shadow-lg transition-opacity duration-150 group-hover/wf-ftm:opacity-100'
const tipReorderWrap = 'group/wf-ftr relative inline-flex shrink-0'
const tipReorder =
  'pointer-events-none absolute top-full left-1/2 z-[10060] mt-1.5 w-max -translate-x-1/2 rounded-md bg-slate-900 px-2 py-1.5 text-center text-[11px] font-medium leading-tight text-white opacity-0 shadow-lg transition-opacity duration-150 group-hover/wf-ftr:opacity-100'

const flowToolbarPanel =
  'm-2 flex  flex-wrap items-center gap-1 overflow-visible rounded-lg border border-slate-200 bg-white/95 p-1 shadow-sm backdrop-blur'
</script>

<template>
  <Panel position="top-right" :class="flowToolbarPanel">
    <div :class="tipBarWrap">
      <button type="button" class="rounded-md p-2 text-slate-700 hover:bg-slate-100" aria-label="Zoom out" @click="zoomOut()">
        <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
        </svg>
      </button>
      <span role="tooltip" :class="tipBar">Zoom out</span>
    </div>
    <div :class="tipBarWrap">
      <button type="button" class="rounded-md p-2 text-slate-700 hover:bg-slate-100" aria-label="Zoom in" @click="zoomIn()">
        <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
      </button>
      <span role="tooltip" :class="tipBar">Zoom in</span>
    </div>
    <div :class="tipBarWrap">
      <button type="button" class="rounded-md p-2 text-slate-700 hover:bg-slate-100" aria-label="Fit view" @click="onFit">
        <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
        </svg>
      </button>
      <span role="tooltip" :class="tipBar">Fit view</span>
    </div>
    <div :class="tipBarWrap">
      <button
        type="button"
        class="rounded-md p-2 text-slate-700 hover:bg-violet-50 hover:text-violet-900"
        :class="!propertiesPanelVisible && 'bg-violet-100 text-violet-900 ring-1 ring-violet-300/80'"
        aria-label="Toggle properties panel (preview)"
        :aria-pressed="!propertiesPanelVisible"
        @click="$emit('preview')"
      >
        <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
          />
        </svg>
      </button>
      <span role="tooltip" :class="tipBar">{{
        propertiesPanelVisible
          ? 'Preview — hide properties panel for more canvas space'
          : 'Show properties panel'
      }}</span>
    </div>

    <div :class="tipBarWrap">
      <button
        type="button"
        class="rounded-md p-2 text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:pointer-events-none"
        aria-label="Undo"
        :disabled="!canUndo"
        @click="$emit('undo')"
      >
        <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h11a7 7 0 017 7v1M3 10l4-4M3 10l4 4" />
        </svg>
      </button>
      <span role="tooltip" :class="tipBar">Undo (Ctrl/Cmd+Z)</span>
    </div>
    <div :class="tipBarWrap">
      <button
        type="button"
        class="rounded-md p-2 text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:pointer-events-none"
        aria-label="Redo"
        :disabled="!canRedo"
        @click="$emit('redo')"
      >
        <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 10H10a7 7 0 00-7 7v1m18-8l-4-4m4 4l-4 4" />
        </svg>
      </button>
      <span role="tooltip" :class="tipBar">Redo (Ctrl/Cmd+Shift+Z)</span>
    </div>
    <div :class="tipBarWrap">
      <button
        type="button"
        class="rounded-md p-2 text-slate-700 hover:bg-blue-50 hover:text-blue-900 disabled:opacity-40 disabled:pointer-events-none"
        aria-label="Auto layout"
        :disabled="!canAutoLayout"
        @click="$emit('auto-layout')"
      >
        <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z"
          />
        </svg>
      </button>
      <span role="tooltip" :class="tipBar">Auto layout — arrange graph automatically</span>
    </div>
    <div :class="tipBarWrap">
      <button
        type="button"
        class="rounded-md p-2 text-slate-700 hover:bg-amber-50 hover:text-amber-900"
        aria-label="Reset layout"
        @click="$emit('reset-layout')"
      >
        <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
      </button>
      <span role="tooltip" :class="tipBar">Reset layout — clear saved positions and diagram-only edges (this browser)</span>
    </div>

    <div class="hidden sm:block w-px self-stretch bg-slate-200 mx-0.5" aria-hidden="true" />
    <div :class="tipBarWrap">
      <button
        type="button"
        class="rounded-md p-2 text-slate-700 hover:bg-slate-100"
        aria-label="Export JSON"
        @click="downloadGraphJson"
      >
        <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
          />
        </svg>
      </button>
      <span role="tooltip" :class="tipBar">Export JSON — download nodes, edges & viewport as JSON</span>
    </div>
    <div :class="tipBarWrap">
      <button
        type="button"
        class="rounded-md p-2 text-slate-700 hover:bg-slate-100"
        aria-label="Copy JSON"
        @click="copyGraphJson"
      >
        <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
          />
        </svg>
      </button>
      <span role="tooltip" :class="tipBar">Copy JSON — copy diagram JSON to clipboard</span>
    </div>
    <div :class="[tipBarWrap, 'hidden sm:inline-flex items-center']">
      <span class="inline-flex items-center px-2 text-[10px] font-medium tabular-nums text-slate-500">
        {{ nodeCount }} nodes · {{ edgeCount }} edges
      </span>
      <span role="tooltip" :class="tipBar">Current graph size</span>
    </div>

    <div class="hidden sm:block w-px self-stretch bg-slate-200 mx-0.5" aria-hidden="true" />

    <div ref="patternMenuWrap" class="relative shrink-0">
      <div
        v-if="patternMenuOpen"
        class="absolute right-0 top-[calc(100%+4px)] z-[100] w-[min(calc(100vw-2rem),16rem)] overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-xl shadow-slate-900/15"
        role="menu"
        aria-label="Canvas options"
        @click.stop
      >
        <button
          type="button"
          role="menuitem"
          class="w-full px-3 py-2.5 text-left text-sm font-medium text-slate-800 hover:bg-slate-50"
          @click="openPatternReorderModal"
        >
          Reorder patterns
        </button>
      </div>
    </div>
  </Panel>

  <Teleport to="body">
    <div
      v-if="patternReorderModalOpen"
      class="fixed inset-0 z-[1000] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="pattern-reorder-modal-title"
    >
      <button
        type="button"
        class="absolute inset-0 bg-slate-900/45 backdrop-blur-[1px]"
        aria-label="Close"
        @click="closePatternReorderModal"
      />
      <div
        class="relative z-[1] flex max-h-[min(32rem,calc(100vh-2rem))] w-full max-w-md flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
        @click.stop
      >
        <div class="flex shrink-0 items-center justify-between border-b border-slate-100 px-4 py-3">
          <h2 id="pattern-reorder-modal-title" class="text-base font-semibold text-slate-900">Reorder patterns</h2>
          <div :class="tipModalWrap">
            <button
              type="button"
              class="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
              aria-label="Close"
              @click="closePatternReorderModal"
            >
              <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <span role="tooltip" :class="tipModal">Close</span>
          </div>
        </div>
        <p class="shrink-0 border-b border-slate-50 px-4 py-2 text-xs leading-snug text-slate-500">
          Use the arrows to change execution order. Each change saves to the server and refreshes the canvas.
        </p>
        <div class="min-h-0 flex-1 overflow-y-auto px-4 py-3">
          <ul v-if="patternRows.length" class="space-y-2">
            <li
              v-for="(node, idx) in patternRows"
              :key="node.id"
              class="flex items-center gap-2 rounded-xl border border-slate-100 bg-slate-50/90 px-3 py-2 text-sm text-slate-800"
            >
              <span
                class="shrink-0 rounded-md bg-slate-800 px-2 py-0.5 font-mono text-xs font-bold tabular-nums text-white"
              >
                #{{ node.data?.executionOrder ?? idx + 1 }}
              </span>
              <span class="min-w-0 flex-1 truncate font-medium" :title="node.data?.title || ''">
                {{ node.data?.title || 'Pattern' }}
              </span>
              <div class="flex shrink-0 gap-0.5">
                <div :class="tipReorderWrap">
                  <button
                    type="button"
                    class="rounded-lg p-1.5 text-slate-600 hover:bg-white hover:text-slate-900 disabled:pointer-events-none disabled:opacity-30"
                    aria-label="Move earlier"
                    :disabled="idx === 0 || patternReorderSaving"
                    @click="movePatternInMenu(idx, -1)"
                  >
                    <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
                    </svg>
                  </button>
                  <span role="tooltip" :class="tipReorder">Move earlier</span>
                </div>
                <div :class="tipReorderWrap">
                  <button
                    type="button"
                    class="rounded-lg p-1.5 text-slate-600 hover:bg-white hover:text-slate-900 disabled:pointer-events-none disabled:opacity-30"
                    aria-label="Move later"
                    :disabled="idx >= patternRows.length - 1 || patternReorderSaving"
                    @click="movePatternInMenu(idx, 1)"
                  >
                    <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <span role="tooltip" :class="tipReorder">Move later</span>
                </div>
              </div>
            </li>
          </ul>
          <p v-else class="py-8 text-center text-sm text-slate-500">No patterns on this workflow yet.</p>
        </div>
        <div class="shrink-0 border-t border-slate-100 px-4 py-3">
          <button
            type="button"
            class="w-full rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
            @click="closePatternReorderModal"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
