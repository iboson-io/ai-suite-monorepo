<template>
  <div class="workflow-editor flex flex-col h-full min-h-0 bg-[#e8edf3]">
    <header class="flex-shrink-0 flex flex-wrap items-center gap-3 px-4 py-3 border-b border-slate-200/80 bg-white/95 backdrop-blur shadow-sm z-10">
      <button
        type="button"
        class="inline-flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-blue-700 px-2 py-1.5 rounded-lg hover:bg-slate-100"
        @click="$emit('back')"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
        Workflows
      </button>
      <div class="h-6 w-px bg-slate-200 hidden sm:block" />
      <div class="min-w-0 flex-1 flex items-start justify-between gap-3">
        <div class="min-w-0">
          <h2 class="text-base font-semibold text-slate-900 truncate">
            {{ workflowTitle }}
          </h2>
          <p v-if="metaLine" class="text-xs text-slate-500 truncate">{{ metaLine }}</p>
        </div>
        <button
          type="button"
          class="shrink-0 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50"
          @click="runsDrawerOpen = true"
        >
          Execution history
        </button>
      </div>
    </header>

    <div class="flex flex-1 flex-col lg:flex-row min-h-0 overflow-hidden">
      <WorkflowEditorAiChat
        ref="workflowChatRef"
        class="shrink-0 lg:self-stretch"
        :workflow-id="workflowId"
        @submit-prompt="$emit('workflow-ai-prompt', $event)"
        @ai-response="$emit('workflow-ai-response', $event)"
        @schema-changed="onWorkflowAgentSchemaChanged"
        @back="$emit('back')"
      />

      <div class="relative flex min-h-0 min-w-0 flex-1 flex-col">
        <button
          v-if="!buildPanelVisible"
          type="button"
          class="absolute right-3 top-1/2 z-30 -translate-y-1/2 rounded-l-lg border border-slate-200 bg-white px-2 py-2.5 text-slate-600 shadow-md hover:bg-slate-50 lg:py-3"
          aria-label="Show properties panel"
          title="Show properties panel"
          @click="buildPanelVisible = true"
        >
          <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div v-if="loadError" class="absolute inset-0 flex items-center justify-center p-6 z-20 bg-[#e8edf3]/90">
          <div class="bg-white rounded-xl shadow-lg border border-slate-200 p-6 max-w-md text-center">
            <p class="text-slate-800 font-medium mb-2">Could not load workflow</p>
            <p class="text-sm text-slate-600 mb-4">{{ loadError }}</p>
            <button type="button" class="text-blue-600 font-medium hover:underline" @click="$emit('back')">Back to list</button>
          </div>
        </div>
        <div v-else-if="loading" class="absolute inset-0 flex items-center justify-center z-10 bg-[#e8edf3]">
          <div class="flex flex-col items-center gap-3">
            <div class="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <span class="text-sm text-slate-600">Loading canvas…</span>
          </div>
        </div>
        <div class="flex min-h-0 min-w-0 flex-1 flex-col">
          <WorkflowVueFlowCanvas
            ref="flowRef"
            class="h-full min-h-0 min-w-0 flex-1"
            :workflow-id="workflowId"
            :properties-panel-visible="buildPanelVisible"
            @title-meta="onTitleMeta"
            @load-error="onLoadError"
            @loaded="onFlowLoaded"
            @add-agent-to-pattern="onAddAgentToPattern"
            @manage-pattern-agents="onManagePatternAgents"
            @configure-pattern-router="onConfigurePatternRouter"
            @add-trigger="onAddTrigger"
            @add-pattern="onAddPattern"
            @canvas-node-select="onCanvasNodeSelect"
            @delete-trigger="onDeleteTriggerFromCanvas"
            @patterns-reordered="onPatternsReorderedFromCanvas"
            @open-hitl-config="onOpenHitlConfig"
            @preview="buildPanelVisible = !buildPanelVisible"
          />
        </div>
      </div>

      <WorkflowBuildPanel
        v-show="buildPanelVisible"
        ref="buildPanelRef"
        :workflow-id="workflowId"
        :canvas-selection="canvasSelection"
        @diagram-updated="onDiagramUpdated"
        @workflow-deleted="$emit('workflow-deleted')"
        @clear-canvas-selection="clearCanvasSelection"
      />
    </div>

    <WorkflowRunsDrawer
      v-if="runsDrawerOpen"
      :workflow-id="workflowId"
      @close="runsDrawerOpen = false"
    />
  </div>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue'
import WorkflowEditorAiChat from './WorkflowEditorAiChat.vue'
import WorkflowVueFlowCanvas from './WorkflowVueFlowCanvas.vue'
import WorkflowBuildPanel from './WorkflowBuildPanel.vue'
import WorkflowRunsDrawer from './WorkflowRunsDrawer.vue'


const props = defineProps({
  workflowId: {
    type: String,
    required: true
  }
})

defineEmits(['back', 'workflow-deleted', 'workflow-ai-prompt', 'workflow-ai-response'])

const flowRef = ref(null)
const buildPanelRef = ref(null)
const workflowChatRef = ref(null)
const buildPanelVisible = ref(true)
const runsDrawerOpen = ref(false)
const canvasSelection = ref(null)
const loading = ref(true)
const loadError = ref('')
const workflowTitle = ref('Workflow')
const metaLine = ref('')

function onTitleMeta({ title, metaLine: line }) {
  workflowTitle.value = title || 'Workflow'
  metaLine.value = line || ''
  loadError.value = ''
}

function onLoadError(msg) {
  loadError.value = msg || 'Request failed'
  loading.value = false
}

function onFlowLoaded() {
  loading.value = false
}

function onDiagramUpdated() {
  loadError.value = ''
  flowRef.value?.load?.()
  buildPanelRef.value?.refreshPatterns?.()
  workflowChatRef.value?.notifyWorkflowSaved?.()
}

function onWorkflowAgentSchemaChanged() {
  loadError.value = ''
  flowRef.value?.load?.()
  buildPanelRef.value?.refreshPatterns?.()
}

function onPatternsReorderedFromCanvas() {
  buildPanelRef.value?.refreshPatterns?.()
}

function onOpenHitlConfig() {
  buildPanelRef.value?.openHitlModal?.()
}

function onAddAgentToPattern(patternId) {
  buildPanelRef.value?.openAgentModalForPattern?.(patternId)
}

function onManagePatternAgents(patternId) {
  buildPanelRef.value?.openManageAgentsModalForPattern?.(patternId)
}

function onConfigurePatternRouter(patternId) {
  buildPanelRef.value?.openRouterModalForPatternId?.(patternId)
}

function onAddTrigger() {
  buildPanelRef.value?.openTriggerModal?.()
}

function onAddPattern() {
  buildPanelRef.value?.openPatternModal?.()
}

function onDeleteTriggerFromCanvas(triggerId) {
  buildPanelRef.value?.deleteTriggerFromCanvas?.(triggerId)
}

function onCanvasNodeSelect(sel) {
  canvasSelection.value = sel
  buildPanelVisible.value = true
}

function clearCanvasSelection() {
  canvasSelection.value = null
}

watch(
  () => props.workflowId,
  () => {
    loading.value = true
    loadError.value = ''
  }
)

watch(
  buildPanelVisible,
  async () => {
    await nextTick()
    await new Promise((r) => requestAnimationFrame(r))
    window.dispatchEvent(new Event('resize'))
    await new Promise((r) => requestAnimationFrame(r))
    flowRef.value?.reflowAfterResize?.()
  },
  { flush: 'post' }
)
</script>
