<script setup>
import dagre from 'dagre'
import { ref, watch, markRaw, nextTick, computed, onMounted, onBeforeUnmount, provide } from 'vue'
import { VueFlow, ConnectionLineType } from '@vue-flow/core'
import { Background } from '@vue-flow/background'
import { MiniMap } from '@vue-flow/minimap'
import '@vue-flow/core/dist/style.css'
import '@vue-flow/minimap/dist/style.css'

import { useWorkflow } from '@app/composables/useWorkflow'
import { buildWorkflowFlowGraph, baseEdge, workflowEdgeMarkerEnd } from '@app/composables/buildWorkflowFlowGraph'
import {
  mergeLocalDiagram,
  saveWorkflowDiagramLocal,
  buildLocalPayload,
  clearWorkflowDiagramLocal
} from '@app/composables/useWorkflowDiagramLocal'
import { isWorkflowFlowConnectionAllowed } from '@app/composables/workflowFlowConnectionRules'

import WfPatternNode from './WfPatternNode.vue'
import WfRouterNode from './WfRouterNode.vue'
import WfCardNode from './WfCardNode.vue'
import WfWorkflowHub from './WfWorkflowHub.vue'
import WfTriggerChip from './WfTriggerChip.vue'
import WorkflowFlowToolbar from './WorkflowFlowToolbar.vue'
import WorkflowFlowFitHelper from './WorkflowFlowFitHelper.vue'

/** Injected by workflow hub node to open the toolbar’s pattern reorder modal */
const WF_OPEN_PATTERN_REORDER = 'wfOpenPatternReorder'
/** Injected by workflow hub ⋮ menu to open HITL config (menu uses @click.stop so node-click never fires). */
const WF_OPEN_HITL_CONFIG = 'wfOpenHitlConfig'

const props = defineProps({
  workflowId: {
    type: String,
    required: true
  },
  /** When false, properties panel is hidden (preview / wide canvas). Passed to toolbar for toggle styling. */
  propertiesPanelVisible: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits([
  'title-meta',
  'load-error',
  'loaded',
  'add-agent-to-pattern',
  'manage-pattern-agents',
  'configure-pattern-router',
  'add-trigger',
  'add-pattern',
  'canvas-node-select',
  'delete-trigger',
  'patterns-reordered',
  'open-hitl-config',
  'preview'
])

const { fetchWorkflowSchema, fetchAgentNameByIdMap, reorderPatterns, reorderPatternAgents } = useWorkflow()

const flowToolbarRef = ref(null)
provide(WF_OPEN_PATTERN_REORDER, () => {
  flowToolbarRef.value?.openPatternReorderModal?.()
})
provide(WF_OPEN_HITL_CONFIG, () => emit('open-hitl-config'))

const defaultEdgeOptions = {
  type: 'step',
  markerEnd: workflowEdgeMarkerEnd
}

const connectionLineOptions = {
  type: ConnectionLineType.Step,
  style: { stroke: '#64748b', strokeWidth: 2 }
}

/** @type {{ id: string, x: number, y: number } | null} */
let patternDragStart = null
/** @type {{ id: string, x: number, y: number } | null} */
let agentDragStart = null
let patternOrderSaving = false
let agentOrderSaving = false

const nodes = ref([])
const edges = ref([])
const fitTick = ref(0)
const hydrating = ref(true)

const nodeTypes = {
  wfPattern: markRaw(WfPatternNode),
  wfRouter: markRaw(WfRouterNode),
  wfCard: markRaw(WfCardNode),
  wfWorkflowHub: markRaw(WfWorkflowHub),
  wfTriggerChip: markRaw(WfTriggerChip)
}

const MAX_HISTORY = 80
const historyStack = ref([])
const historyIndex = ref(-1)
const applyingHistory = ref(false)

const canUndo = computed(() => historyIndex.value > 0)
const canRedo = computed(() => historyIndex.value >= 0 && historyIndex.value < historyStack.value.length - 1)
const canAutoLayout = computed(() => nodes.value.filter((n) => !n.parentNode).length > 0)

function serializeDiagramState() {
  return JSON.stringify({ nodes: nodes.value, edges: edges.value })
}

function seedHistory() {
  const snap = serializeDiagramState()
  historyStack.value = [snap]
  historyIndex.value = 0
}

function pushHistorySnapshot() {
  if (hydrating.value || applyingHistory.value) return
  const snap = serializeDiagramState()
  if (historyIndex.value >= 0 && historyStack.value[historyIndex.value] === snap) return
  historyStack.value = historyStack.value.slice(0, historyIndex.value + 1)
  historyStack.value.push(snap)
  if (historyStack.value.length > MAX_HISTORY) {
    historyStack.value.shift()
  }
  historyIndex.value = historyStack.value.length - 1
}

function applyHistorySnapshot(nextIndex) {
  const snap = historyStack.value[nextIndex]
  if (!snap) return
  applyingHistory.value = true
  try {
    const parsed = JSON.parse(snap)
    nodes.value = Array.isArray(parsed.nodes) ? parsed.nodes : []
    edges.value = Array.isArray(parsed.edges) ? parsed.edges : []
    historyIndex.value = nextIndex
  } catch (e) {
    console.error('Failed to restore history snapshot', e)
  } finally {
    nextTick(() => {
      applyingHistory.value = false
    })
  }
}

function undo() {
  if (!canUndo.value) return
  applyHistorySnapshot(historyIndex.value - 1)
}

function redo() {
  if (!canRedo.value) return
  applyHistorySnapshot(historyIndex.value + 1)
}

let persistTimer = null
let historyTimer = null
function schedulePersistAndHistory() {
  if (!props.workflowId || hydrating.value || applyingHistory.value) return
  clearTimeout(persistTimer)
  clearTimeout(historyTimer)
  persistTimer = setTimeout(() => {
    saveWorkflowDiagramLocal(props.workflowId, buildLocalPayload(nodes.value, edges.value))
  }, 360)
  historyTimer = setTimeout(() => {
    pushHistorySnapshot()
  }, 240)
}

watch([nodes, edges], schedulePersistAndHistory, { deep: true })

function connectionValid(c) {
  return isWorkflowFlowConnectionAllowed(c, nodes.value)
}

function onConnect(connection) {
  if (!connectionValid(connection)) return
  const dup = edges.value.some(
    (e) =>
      e.source === connection.source &&
      e.target === connection.target &&
      (e.sourceHandle || '') === (connection.sourceHandle || '') &&
      (e.targetHandle || '') === (connection.targetHandle || '')
  )
  if (dup) return
  const id = `local-${Date.now()}`
  edges.value = [
    ...edges.value,
    {
      ...baseEdge({
        id,
        source: connection.source,
        target: connection.target,
        sourceHandle: connection.sourceHandle,
        targetHandle: connection.targetHandle,
        deletable: true,
        style: { stroke: '#64748b', strokeWidth: 1.75, strokeDasharray: '6 4' },
        data: { local: true }
      })
    }
  ]
}

function parsePatternId(node) {
  const byData = node?.data?.patternId
  if (byData) return String(byData)
  const nid = String(node?.id || '')
  if (nid.startsWith('pattern:')) return nid.slice('pattern:'.length)
  return ''
}

function onNodeDragStart(evt) {
  const n = evt?.node
  patternDragStart = null
  agentDragStart = null
  if (n?.type === 'wfPattern' && !n.parentNode) {
    patternDragStart = {
      id: String(n.id),
      x: Number(n.position?.x ?? 0),
      y: Number(n.position?.y ?? 0)
    }
  } else if (
    n?.type === 'wfCard' &&
    n.data?.role === 'agent' &&
    n.parentNode &&
    n.data?.patternAgentId != null
  ) {
    agentDragStart = {
      id: String(n.id),
      x: Number(n.position?.x ?? 0),
      y: Number(n.position?.y ?? 0)
    }
  }
}

async function persistAgentOrderFromCanvas(draggedNode) {
  if (agentOrderSaving || patternOrderSaving || hydrating.value || applyingHistory.value) return
  const parentId = draggedNode?.parentNode
  const patternId = draggedNode?.data?.patternId != null ? String(draggedNode.data.patternId) : ''
  if (!parentId || !patternId) return

  const agents = nodes.value.filter(
    (n) =>
      n.type === 'wfCard' &&
      n.data?.role === 'agent' &&
      n.parentNode === parentId &&
      n.data?.patternAgentId != null
  )
  if (agents.length < 2) return

  const arrangement = draggedNode.data?.agentArrangement === 'row' ? 'row' : 'column'
  const sorted = [...agents].sort((a, b) => {
    if (arrangement === 'row') {
      return (Number(a.position?.x) || 0) - (Number(b.position?.x) || 0)
    }
    return (Number(a.position?.y) || 0) - (Number(b.position?.y) || 0)
  })
  const sortedPaIds = sorted.map((n) => String(n.data.patternAgentId))

  const byEo = [...agents].sort(
    (a, b) => (Number(a.data?.executionOrder) || 0) - (Number(b.data?.executionOrder) || 0)
  )
  const prevIds = byEo.map((n) => String(n.data.patternAgentId))
  if (sortedPaIds.length !== prevIds.length) return

  let changed = false
  for (let i = 0; i < sortedPaIds.length; i++) {
    if (sortedPaIds[i] !== prevIds[i]) {
      changed = true
      break
    }
  }
  if (!changed) return

  agentOrderSaving = true
  try {
    const order = sortedPaIds.map((pattern_agent_id, i) => ({
      pattern_agent_id,
      execution_order: i + 1
    }))
    await reorderPatternAgents(props.workflowId, patternId, order)
    clearWorkflowDiagramLocal(props.workflowId)
    await load()
    emit('patterns-reordered')
  } catch (e) {
    console.error('Agent reorder failed', e)
    await load()
  } finally {
    agentOrderSaving = false
  }
}

async function persistPatternOrderFromCanvasLayout() {
  if (patternOrderSaving || agentOrderSaving || hydrating.value || applyingHistory.value) return
  const roots = nodes.value.filter((n) => n.type === 'wfPattern' && !n.parentNode)
  if (roots.length < 2) return

  const byX = [...roots].sort((a, b) => (Number(a.position?.x) || 0) - (Number(b.position?.x) || 0))
  const sortedIds = byX.map((node) => parsePatternId(node)).filter(Boolean)
  if (sortedIds.length < 2) return

  const byEo = [...roots].sort(
    (a, b) => (Number(a.data?.executionOrder) || 0) - (Number(b.data?.executionOrder) || 0)
  )
  const prevIds = byEo.map((node) => parsePatternId(node)).filter(Boolean)
  if (sortedIds.length !== prevIds.length) return

  let changed = false
  for (let i = 0; i < sortedIds.length; i++) {
    if (sortedIds[i] !== prevIds[i]) {
      changed = true
      break
    }
  }
  if (!changed) return

  patternOrderSaving = true
  try {
    const order = sortedIds.map((pattern_id, i) => ({
      pattern_id,
      execution_order: i + 1
    }))
    await reorderPatterns(props.workflowId, order)
    clearWorkflowDiagramLocal(props.workflowId)
    await load()
    emit('patterns-reordered')
  } catch (e) {
    console.error('Pattern reorder failed', e)
    await load()
  } finally {
    patternOrderSaving = false
  }
}

function onNodeDragStop(evt) {
  const n = evt?.node
  if (hydrating.value || applyingHistory.value) return

  if (
    n?.type === 'wfCard' &&
    n.data?.role === 'agent' &&
    n.parentNode &&
    n.data?.patternAgentId != null
  ) {
    const start = agentDragStart
    agentDragStart = null
    patternDragStart = null
    if (start && String(n.id) === start.id) {
      const x = Number(n.position?.x ?? 0)
      const y = Number(n.position?.y ?? 0)
      if (Math.abs(x - start.x) < 4 && Math.abs(y - start.y) < 4) return
    }
    void persistAgentOrderFromCanvas(n)
    return
  }

  const start = patternDragStart
  patternDragStart = null
  agentDragStart = null
  if (n?.type !== 'wfPattern' || n.parentNode) return
  if (start && String(n.id) === start.id) {
    const x = Number(n.position?.x ?? 0)
    const y = Number(n.position?.y ?? 0)
    if (Math.abs(x - start.x) < 4 && Math.abs(y - start.y) < 4) return
  }
  void persistPatternOrderFromCanvasLayout()
}

function onPaneClick() {
  emit('canvas-node-select', null)
}

/**
 * Vue Flow passes the native DOM event; `target` can be a Text node (e.g. clicking
 * the label text inside a menu button). Text nodes have no `.closest()`, so
 * `[data-action]` on the button is never found unless we resolve to an Element first.
 */
function clickTargetElement(ev) {
  const t = ev?.target
  if (!t) return null
  if (t.nodeType === 3) return t.parentElement
  return t instanceof Element ? t : null
}

function onNodeClick(payload) {
  const rawEvent = payload?.event
  const node = payload?.node
  if (!rawEvent?.target || !node) return

  if (node.type === 'wfWorkflowHub') {
    const actionEl = clickTargetElement(rawEvent)?.closest?.('[data-action]')
    const hubAction = actionEl?.getAttribute('data-action')
    if (hubAction === 'add-trigger') {
      rawEvent.preventDefault?.()
      rawEvent.stopPropagation?.()
      emit('add-trigger')
      return
    }
    if (hubAction === 'add-pattern') {
      rawEvent.preventDefault?.()
      rawEvent.stopPropagation?.()
      emit('add-pattern')
      return
    }
    if (hubAction === 'configure-hitl') {
      rawEvent.preventDefault?.()
      rawEvent.stopPropagation?.()
      emit('open-hitl-config')
      return
    }
    emit('canvas-node-select', { kind: 'workflow-hub', nodeId: node.id })
    return
  }

  if (node.type === 'wfTriggerChip') {
    const delEl = clickTargetElement(rawEvent)?.closest?.('[data-action="delete-trigger"]')
    if (delEl) {
      rawEvent.preventDefault?.()
      rawEvent.stopPropagation?.()
      const tid = delEl.getAttribute?.('data-trigger-id') || String(node.data?.triggerId || '')
      if (tid) emit('delete-trigger', tid)
      return
    }
    const tid = String(node.data?.triggerId || '')
    const nid = String(node.id)
    if (tid) emit('canvas-node-select', { kind: 'trigger', triggerId: tid, nodeId: nid })
    return
  }

  if (node.type === 'wfPattern') {
    const actionEl = clickTargetElement(rawEvent)?.closest?.('[data-action]')
    if (actionEl) {
      const patternId = parsePatternId(node)
      if (!patternId) return
      rawEvent.preventDefault?.()
      rawEvent.stopPropagation?.()
      const action = String(actionEl.getAttribute('data-action') || '')
      if (action === 'add-agent-to-pattern') {
        emit('add-agent-to-pattern', patternId)
      } else if (action === 'manage-pattern-agents') {
        emit('manage-pattern-agents', patternId)
      } else if (action === 'configure-pattern-router') {
        emit('configure-pattern-router', patternId)
      }
      return
    }
    const pid = parsePatternId(node)
    if (pid) emit('canvas-node-select', { kind: 'pattern', patternId: pid, nodeId: node.id })
    return
  }

  if (node.type === 'wfRouter') {
    emit('canvas-node-select', {
      kind: 'router',
      patternId: node.data?.patternId ?? null,
      nodeId: node.id
    })
    return
  }

  if (node.type === 'wfCard') {
    const role = node.data?.role
    const nid = String(node.id)
    if (role === 'trigger') {
      const tid = nid.startsWith('trigger:') ? nid.slice('trigger:'.length) : nid
      emit('canvas-node-select', { kind: 'trigger', triggerId: tid, nodeId: nid })
      return
    }
    if (role === 'output') {
      const cid = nid.startsWith('output_channel:') ? nid.slice('output_channel:'.length) : nid
      emit('canvas-node-select', { kind: 'output', channelId: cid, nodeId: nid })
      return
    }
    if (role === 'hitl') {
      emit('canvas-node-select', { kind: 'hitl', nodeId: nid })
      return
    }
    if (role === 'agent') {
      emit('canvas-node-select', {
        kind: 'agent',
        patternId: node.data?.patternId ?? null,
        patternAgentId: node.data?.patternAgentId ?? null,
        agentId: node.data?.agentId ?? null,
        nodeId: nid
      })
    }
  }
}

function getRootNodeId(nodeId, lookup) {
  let curr = lookup.get(nodeId)
  if (!curr) return nodeId
  while (curr?.parentNode) {
    curr = lookup.get(curr.parentNode)
  }
  return curr?.id || nodeId
}

function nodeSize(n) {
  const width = Number(n.dimensions?.width || n.width || 180)
  const height = Number(n.dimensions?.height || n.height || 64)
  return { width, height }
}

function autoLayout() {
  const topNodes = nodes.value.filter((n) => !n.parentNode)
  if (!topNodes.length) return

  const lookup = new Map(nodes.value.map((n) => [n.id, n]))
  const g = new dagre.graphlib.Graph()
  g.setGraph({
    rankdir: 'LR',
    align: 'UL',
    ranksep: 84,
    nodesep: 38,
    marginx: 24,
    marginy: 24
  })
  g.setDefaultEdgeLabel(() => ({}))

  for (const n of topNodes) {
    const size = nodeSize(n)
    g.setNode(n.id, size)
  }

  const seen = new Set()
  for (const e of edges.value) {
    const sRoot = getRootNodeId(e.source, lookup)
    const tRoot = getRootNodeId(e.target, lookup)
    if (!sRoot || !tRoot || sRoot === tRoot) continue
    if (!g.hasNode(sRoot) || !g.hasNode(tRoot)) continue
    const k = `${sRoot}->${tRoot}`
    if (seen.has(k)) continue
    seen.add(k)
    g.setEdge(sRoot, tRoot)
  }

  dagre.layout(g)

  let minX = Infinity
  let minY = Infinity
  for (const n of topNodes) {
    const p = g.node(n.id)
    if (!p) continue
    const size = nodeSize(n)
    minX = Math.min(minX, p.x - size.width / 2)
    minY = Math.min(minY, p.y - size.height / 2)
  }
  if (!Number.isFinite(minX)) return
  const pad = 34

  const nextTopPos = {}
  for (const n of topNodes) {
    const p = g.node(n.id)
    if (!p) continue
    const size = nodeSize(n)
    nextTopPos[n.id] = {
      x: Math.round(p.x - size.width / 2 - minX + pad),
      y: Math.round(p.y - size.height / 2 - minY + pad)
    }
  }

  nodes.value = nodes.value.map((n) => (n.parentNode ? n : { ...n, position: nextTopPos[n.id] || n.position }))
  fitTick.value += 1
}

function resetLocalLayout() {
  clearWorkflowDiagramLocal(props.workflowId)
  load()
}

async function load() {
  try {
    hydrating.value = true
    const [schema, agentNameById] = await Promise.all([
      fetchWorkflowSchema(props.workflowId),
      fetchAgentNameByIdMap()
    ])
    if (!schema?.workflow) {
      throw new Error('Invalid response')
    }
    const built = buildWorkflowFlowGraph(schema, { agentNameById })
    const merged = mergeLocalDiagram(props.workflowId, built)
    nodes.value = merged.nodes.map((n) => ({
      ...n,
      deletable: false
    }))
    edges.value = merged.edges
    emit('title-meta', {
      title: built.meta.workflowTitle,
      metaLine: built.meta.metaLine
    })
    seedHistory()
    fitTick.value += 1
    emit('loaded')
    await nextTick()
    hydrating.value = false
  } catch (e) {
    console.error(e)
    const msg = e?.message || 'Request failed'
    emit('load-error', msg)
    hydrating.value = false
  }
}

/** Toolbar modal saved pattern order; reload graph then sync build panel. */
async function onToolbarPatternsReordered() {
  await load()
  emit('patterns-reordered')
}

/** After the flow’s parent changes width/height (e.g. sidebar toggle), refresh dimensions and refit. */
function reflowAfterResize() {
  fitTick.value += 1
}

defineExpose({ load, reflowAfterResize })

function onKeyDown(e) {
  const key = String(e.key || '').toLowerCase()
  const modifier = e.ctrlKey || e.metaKey
  if (!modifier) return
  if (key === 'z' && !e.shiftKey) {
    e.preventDefault()
    undo()
    return
  }
  if (key === 'z' && e.shiftKey) {
    e.preventDefault()
    redo()
  }
}

onMounted(() => {
  window.addEventListener('keydown', onKeyDown)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeyDown)
  clearTimeout(persistTimer)
  clearTimeout(historyTimer)
})

watch(
  () => props.workflowId,
  () => {
    load()
  },
  { immediate: true }
)
</script>

<template>
  <div class="workflow-vue-flow workflow-vue-flow--joint-like relative h-full min-h-[280px] w-full min-w-0 flex-1 bg-[#f1f4f9]">
    <VueFlow
      v-model:nodes="nodes"
      v-model:edges="edges"
      class="h-full w-full"
      :node-types="nodeTypes"
      :nodes-draggable="true"
      :nodes-connectable="true"
      :edges-updatable="true"
      :elements-selectable="true"
      :snap-to-grid="true"
      :snap-grid="[16, 16]"
      :is-valid-connection="connectionValid"
      :connection-line-options="connectionLineOptions"
      :zoom-on-scroll="true"
      :pan-on-scroll="false"
      :min-zoom="0.2"
      :max-zoom="2"
      :default-edge-options="defaultEdgeOptions"
      :fit-view-on-init="false"
      delete-key-code="Delete"
      @connect="onConnect"
      @node-click="onNodeClick"
      @node-drag-start="onNodeDragStart"
      @node-drag-stop="onNodeDragStop"
      @pane-click="onPaneClick"
    >
      <WorkflowFlowFitHelper :tick="fitTick" />
      <WorkflowFlowToolbar
        ref="flowToolbarRef"
        :workflow-id="workflowId"
        :properties-panel-visible="props.propertiesPanelVisible"
        :can-undo="canUndo"
        :can-redo="canRedo"
        :can-auto-layout="canAutoLayout"
        @reset-layout="resetLocalLayout"
        @undo="undo"
        @redo="redo"
        @auto-layout="autoLayout"
        @patterns-reordered="onToolbarPatternsReordered"
        @preview="emit('preview')"
      />
      <Background gap="16" pattern-color="#d1d9e6" variant="lines" />
      <MiniMap
        class="workflow-minimap !rounded-lg !border !border-slate-200/90 !shadow-md"
        :pannable="true"
        :zoomable="true"
        :mask-color="'rgba(241, 245, 249, 0.72)'"
        position="bottom-right"
      />
    </VueFlow>
  </div>
</template>

<style scoped>
/* Closer to JointJS+ diagram paper: crisp edges, light chrome */
.workflow-vue-flow--joint-like :deep(.vue-flow__viewport) {
  font-family: 'Space Grotesk', 'Manrope', ui-sans-serif, system-ui, sans-serif;
}
/* Step paths + arrow markers: strong contrast on light paper */
.workflow-vue-flow--joint-like :deep(.vue-flow__edge-path) {
  stroke: #64748b;
  stroke-width: 2;
}
.workflow-vue-flow--joint-like :deep(.vue-flow__connection-path) {
  stroke: #64748b;
  stroke-width: 2;
}
.workflow-vue-flow--joint-like :deep(.vue-flow__edge.selected .vue-flow__edge-path),
.workflow-vue-flow--joint-like :deep(.vue-flow__edge:focus .vue-flow__edge-path) {
  stroke: #0f172a;
  stroke-width: 2.75;
}
.workflow-minimap :deep(.vue-flow__minimap-mask) {
  opacity: 0.45;
}
</style>
