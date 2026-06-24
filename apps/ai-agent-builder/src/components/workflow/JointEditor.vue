<template>
  <div class="workflow-editor flex h-full min-h-0 flex-col bg_primary_color">
    <header class="shrink-0 px-6xl pt-6xl pb-4">
      <div class="flex flex-wrap items-center justify-between gap-4 rounded-2xl border primary_border_color bg_secondary_color px-5xl py-4">
        <div class="flex min-w-0 flex-1 items-center gap-3">
          <div :class="backTipWrap">
            <button
              type="button"
              class="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border primary_border_color bg_primary_color secondary_text_color transition-colors hover:bg-gray-25 hover:primary_text_color"
              aria-label="Back to workflows"
              @click="$emit('back')"
            >
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <span role="tooltip" :class="backTip">Back to workflows</span>
          </div>

          <h2 class="min-w-0 truncate label_1_semibold primary_text_color">
            {{ workflowTitle }}
          </h2>

          <button
            type="button"
            class="shrink-0 rounded-lg p-1 action_icon_color hover:bg-gray-25"
            title="Edit workflow"
            @click="onEditWorkflow"
          >
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </button>

          <span
            v-if="statusLabel"
            class="caption_1_medium shrink-0 rounded-md px-md py-xs"
            :class="statusBadgeClass"
          >
            {{ statusLabel }}
          </span>
        </div>

        <div class="flex shrink-0 flex-wrap items-center justify-end gap-md">
          <button
            v-if="canShowStatusActions && !isWorkflowActive"
            type="button"
            class="inline-flex shrink-0 items-center rounded-lg px-3 py-1.5 label_2_semibold primary_2_text_color primary_add_button transition-opacity disabled:opacity-50"
            :disabled="statusToggling"
            @click="doActivateWorkflow"
          >
            Activate
          </button>
          <button
            v-if="canShowStatusActions && isWorkflowActive"
            type="button"
            class="inline-flex shrink-0 items-center rounded-lg border primary_border_color bg_secondary_color px-3 py-1.5 label_2_semibold primary_text_color transition-colors hover:bg-gray-25 disabled:opacity-50"
            :disabled="statusToggling"
            @click="doDeactivateWorkflow"
          >
            Deactivate
          </button>

          <template v-if="workflowChatRef">
            <div class="flex items-center gap-1.5 rounded-full border primary_border_color bg_primary_color px-xl py-xs select-none">
              <span class="relative flex h-2 w-2 shrink-0">
                <span
                  class="absolute inline-flex h-full w-full rounded-full opacity-75"
                  :class="workflowChatRef.connected ? 'animate-ping bg-info-500' : ''"
                />
                <span class="relative inline-flex h-2 w-2 rounded-full" :class="workflowChatRef.statusDotClass" />
              </span>
              <span class="caption_1_medium secondary_text_color">{{ workflowChatRef.statusLabel }}</span>
            </div>

            <button
              type="button"
              class="inline-flex items-center gap-md rounded-lg border primary_border_color bg_secondary_color px-3.5 py-2 label_2_semibold primary_text_color transition-colors hover:bg-gray-25"
              @click="workflowChatRef.newChat"
            >
              <svg class="h-4 w-4 secondary_text_color" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              New chat
            </button>
          </template>
        </div>
      </div>
    </header>

    <div class="flex min-h-0 flex-1 flex-col gap-6xl overflow-y-auto px-6xl pb-6xl lg:flex-row lg:overflow-hidden">
      <div
        v-show="shouldShowEditor"
        class="workflow-editor-canvas relative flex h-[50vh] min-h-[400px] min-w-0 flex-1 flex-col overflow-hidden rounded-2xl border primary_border_color bg_secondary_color lg:h-auto lg:min-h-0"
      >
        <div v-if="loadError" class="absolute inset-0 z-20 flex items-center justify-center bg_secondary_color/90 p-6">
          <div class="max-w-md rounded-2xl border primary_border_color bg_secondary_color p-6xl text-center">
            <p class="mb-2 label_1_semibold primary_text_color">Could not load workflow</p>
            <p class="mb-4 label_2_regular secondary_text_color">{{ loadError }}</p>
            <button type="button" class="label_2_semibold primary_text_color hover:underline" @click="$emit('back')">
              Back to list
            </button>
          </div>
        </div>
        <div v-else-if="loading" class="absolute inset-0 z-10 flex items-center justify-center bg_secondary_color">
          <div class="flex flex-col items-center gap-3">
            <div class="h-10 w-10 animate-spin rounded-full border-2 border-gray-300 border-t-info-500" />
            <span class="label_2_regular secondary_text_color">Loading canvas…</span>
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

      <WorkflowEditorAiChat
        ref="workflowChatRef"
        :class="[
          'workflow-editor-chat overflow-visible rounded-2xl border primary_border_color bg_secondary_color',
          shouldShowEditor
            ? 'h-[70vh] shrink-0 lg:h-auto lg:w-[min(100vw,550px)]'
            : 'w-full flex-1',
        ]"
        :workflow-id="workflowId"
        @submit-prompt="$emit('workflow-ai-prompt', $event)"
        @ai-response="$emit('workflow-ai-response', $event)"
        @schema-changed="onWorkflowAgentSchemaChanged"
        @back="$emit('back')"
        @messages-changed="hasMessages = $event.length > 0"
      />

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
import { useWorkflow } from '@app/composables/useWorkflow'
import { useToast } from '@app/composables/useToast'

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
const statusToggling = ref(false)

const { activateWorkflow, deactivateWorkflow } = useWorkflow()
const { showToast } = useToast()

const backTipWrap = 'group/je-back relative inline-flex shrink-0'
const backTip =
  'pointer-events-none absolute top-full left-1/2 z-[200] mt-1.5 w-max max-w-[16rem] -translate-x-1/2 rounded-md bg-slate-900 px-2 py-1.5 text-center text-[11px] font-medium leading-tight text-white opacity-0 shadow-lg transition-opacity duration-150 group-hover/je-back:opacity-100 whitespace-normal'

const workflowStatus = computed(() => {
  const match = metaLine.value.match(/status:\s*([\w-]+)/i)
  return match?.[1]?.toLowerCase() || ''
})

const statusLabel = computed(() => {
  if (!workflowStatus.value) return ''
  return workflowStatus.value.charAt(0).toUpperCase() + workflowStatus.value.slice(1)
})

const statusBadgeClass = computed(() => {
  const status = workflowStatus.value
  if (status === 'active') {
    return 'bg-success-50 text-success-600 border border-success-200'
  }
  if (status === 'inactive' || status === 'archived') {
    return 'bg-gray-25 secondary_text_color border primary_border_color'
  }
  if (status) {
    return 'bg-orange-25 text-orange-200 border border-orange-100'
  }
  return ''
})

const isWorkflowActive = computed(() => workflowStatus.value === 'active')

const canShowStatusActions = computed(() => !!workflowStatus.value && !loading.value)

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

async function doActivateWorkflow() {
  if (isWorkflowActive.value || statusToggling.value) return
  statusToggling.value = true
  try {
    await activateWorkflow(props.workflowId)
    showToast('Workflow Activated', `"${workflowTitle.value}" is now active.`, 'success')
    await flowRef.value?.load?.()
    buildPanelRef.value?.refreshPatterns?.()
  } catch (e) {
    showToast('Error', e?.message || 'Activate failed', 'error')
  } finally {
    statusToggling.value = false
  }
}

async function doDeactivateWorkflow() {
  if (!isWorkflowActive.value || statusToggling.value) return
  statusToggling.value = true
  try {
    await deactivateWorkflow(props.workflowId)
    showToast('Workflow Deactivated', `"${workflowTitle.value}" has been deactivated.`, 'success')
    await flowRef.value?.load?.()
    buildPanelRef.value?.refreshPatterns?.()
  } catch (e) {
    showToast('Error', e?.message || 'Deactivate failed', 'error')
  } finally {
    statusToggling.value = false
  }
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
