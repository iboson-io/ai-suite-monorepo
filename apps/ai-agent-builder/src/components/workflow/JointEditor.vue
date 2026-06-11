<template>
  <div class="workflow-editor flex flex-col h-full min-h-0 bg-[#e8edf3]">
    <header v-if="shouldShowEditor" class="flex-shrink-0 flex flex-wrap items-center gap-3 px-4 py-3 border-b border-slate-200/80 bg-white/95 backdrop-blur shadow-sm z-10">
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
          <div class="flex items-center gap-2">
            <h2 class="text-base font-semibold text-slate-900 truncate">
              {{ workflowTitle }}
            </h2>
            <button
              type="button"
              class="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors shrink-0"
              title="Edit workflow"
              @click="onEditWorkflow"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </button>
          </div>
          <p v-if="metaLine" class="text-xs text-slate-500 truncate">{{ metaLine }}</p>
        </div>
      </div>
    </header>

    <div class="flex flex-1 flex-col lg:flex-row min-h-0 overflow-hidden">
      <WorkflowEditorAiChat
        ref="workflowChatRef"
        :class="[
          'lg:self-stretch',
          shouldShowEditor ? 'shrink-0 lg:w-[min(100vw,550px)] border-r border-slate-200/80' : 'flex-1 w-full'
        ]"
        :workflow-id="workflowId"
        @submit-prompt="$emit('workflow-ai-prompt', $event)"
        @ai-response="$emit('workflow-ai-response', $event)"
        @schema-changed="onWorkflowAgentSchemaChanged"
        @back="$emit('back')"
        @messages-changed="hasMessages = $event.length > 0"
      />

      <div v-show="shouldShowEditor" class="relative flex min-h-0 min-w-0 flex-1 flex-col">
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
            :properties-panel-visible="false"
            @title-meta="onTitleMeta"
            @load-error="onLoadError"
            @loaded="onFlowLoaded"
            @schema-loaded="hasNodes = $event.hasNodes"
            @configure-pattern-router="onConfigurePatternRouter"
            @canvas-node-select="onCanvasNodeSelect"
            @delete-trigger="onDeleteTriggerFromCanvas"
            @patterns-reordered="onPatternsReorderedFromCanvas"
            @preview="buildPanelVisible = !buildPanelVisible"
          />
        </div>
      </div>

      <WorkflowBuildPanel
        ref="buildPanelRef"
        :workflow-id="workflowId"
        :canvas-selection="canvasSelection"
        @diagram-updated="onDiagramUpdated"
        @workflow-deleted="$emit('workflow-deleted')"
        @clear-canvas-selection="clearCanvasSelection"
      />
    </div>


  </div>
</template>

<script setup>
import { ref, watch, nextTick, computed } from 'vue'
import WorkflowEditorAiChat from './WorkflowEditorAiChat.vue'
import WorkflowVueFlowCanvas from './WorkflowVueFlowCanvas.vue'
import WorkflowBuildPanel from './WorkflowBuildPanel.vue'


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
const canvasSelection = ref(null)
const loading = ref(true)
const loadError = ref('')
const workflowTitle = ref('Workflow')
const metaLine = ref('')
const hasMessages = ref(false)
const hasNodes = ref(false)

const shouldShowEditor = computed(() => {
  return hasMessages.value || hasNodes.value
})

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

async function onDiagramUpdated(payload = null) {
  loadError.value = ''
  await flowRef.value?.load?.()
  const patternId = payload?.selectPatternId
  if (patternId) {
    flowRef.value?.selectPatternNode?.(patternId)
  }
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


function onConfigurePatternRouter(patternId) {
  buildPanelRef.value?.openRouterModalForPatternId?.(patternId)
}



function onEditWorkflow() {
  buildPanelRef.value?.openWorkflowEditModal?.()
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
    hasMessages.value = false
    hasNodes.value = false
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

watch(
  shouldShowEditor,
  async (newVal) => {
    if (newVal) {
      await nextTick()
      await new Promise((r) => requestAnimationFrame(r))
      window.dispatchEvent(new Event('resize'))
      await new Promise((r) => requestAnimationFrame(r))
      flowRef.value?.reflowAfterResize?.()
    }
  },
  { flush: 'post' }
)
</script>
