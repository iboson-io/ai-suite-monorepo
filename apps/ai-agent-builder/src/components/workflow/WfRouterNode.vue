<script setup>
import { computed, ref, watch, inject } from 'vue'
import { Handle, Position } from '@vue-flow/core'
import { useWorkflow } from '@app/composables/useWorkflow'
import WorkflowRouterRulesFields from './WorkflowRouterRulesFields.vue'

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

const workflowId = inject('workflowId', null)
const reloadDiagram = inject('reloadDiagram', null)

const { getRouter, saveRouter, removeRouter, listPatternAgents, fetchAgentNameByIdMap } = useWorkflow()

const loading = ref(false)
const saving = ref(false)
const routerExists = ref(false)
const patternAgents = ref([])
const agentNameMap = ref({})

const routerForm = ref({
  rules: [{ condition: '', agent_id: '' }],
  fallback_agent_id: '',
  status: 'active'
})

function agentLabel(id) {
  return agentNameMap.value[String(id)] || String(id)
}

async function loadRouterDetails() {
  const wId = workflowId?.value || workflowId
  const pId = props.data?.patternId
  if (!wId || !pId) return
  loading.value = true
  try {
    const [agents, names, router] = await Promise.all([
      listPatternAgents(wId, pId),
      fetchAgentNameByIdMap(),
      getRouter(wId, pId)
    ])
    patternAgents.value = agents || []
    agentNameMap.value = names || {}
    if (router) {
      routerExists.value = true
      routerForm.value = {
        rules: Array.isArray(router.rules) ? router.rules.map(r => ({ condition: r.condition || '', agent_id: r.agent_id != null ? String(r.agent_id) : '' })) : [{ condition: '', agent_id: '' }],
        fallback_agent_id: router.fallback_agent_id != null ? String(router.fallback_agent_id) : '',
        status: router.status || 'active'
      }
    } else {
      routerExists.value = false
      routerForm.value = {
        rules: [{ condition: '', agent_id: '' }],
        fallback_agent_id: '',
        status: 'active'
      }
    }
  } catch (e) {
    console.error('Failed to load router details:', e)
  } finally {
    loading.value = false
  }
}

async function submitRouter() {
  const wId = workflowId?.value || workflowId
  const pId = props.data?.patternId
  if (!wId || !pId) return
  saving.value = true
  try {
    const payload = {
      rules: routerForm.value.rules.map(r => ({ condition: r.condition.trim(), agent_id: r.agent_id })),
      fallback_agent_id: routerForm.value.fallback_agent_id || null,
      status: routerForm.value.status || 'active'
    }
    await saveRouter(wId, pId, payload, routerExists.value)
    if (reloadDiagram) await reloadDiagram()
  } catch (e) {
    console.error('Failed to save router:', e)
  } finally {
    saving.value = false
  }
}

async function deleteRouter() {
  const wId = workflowId?.value || workflowId
  const pId = props.data?.patternId
  if (!wId || !pId) return
  if (!confirm('Remove this supervisor router config?')) return
  saving.value = true
  try {
    await removeRouter(wId, pId)
    if (reloadDiagram) await reloadDiagram()
  } catch (e) {
    console.error('Failed to delete router:', e)
  } finally {
    saving.value = false
  }
}

watch(
  () => [props.selected, workflowId?.value || workflowId],
  ([sel]) => {
    if (sel) {
      loadRouterDetails()
    }
  },
  { immediate: true }
)

const routeLine = computed(() => {
  const n = props.data?.rules?.length || 0
  const fb = props.data?.hasFallback
  if (n === 0 && !fb) return 'Configure routing'
  return `${n} rule(s)${fb ? ' · else' : ''}`
})
</script>

<template>
  <div
    class="wf-router relative flex h-full w-full flex-col justify-center rounded-full border-2 border-emerald-700 bg-gradient-to-br from-emerald-50 to-emerald-100/90 px-4 text-emerald-950 shadow-md ring-1 ring-emerald-600/25"
    :class="[selected && '!ring-2 !ring-blue-500 !ring-offset-2 !ring-offset-[#f1f4f9] z-50']"
  >
    <Handle
      id="in"
      type="target"
      :position="Position.Left"
      class="!h-2.5 !w-2.5 !border-2 !border-white !bg-emerald-700"
    />
    <Handle
      id="out"
      type="source"
      :position="Position.Right"
      class="!h-2.5 !w-2.5 !border-2 !border-white !bg-emerald-700"
    />
    <div class="text-center text-[11px] font-semibold leading-tight">
      <div>Supervisor router</div>
      <div class="mt-0.5 text-[10px] font-normal opacity-90">
        {{ routeLine }}
      </div>
    </div>

    <!-- Edit Popover Overlay -->
    <div
      v-if="selected"
      class="absolute left-1/2 top-full z-[1000] mt-2 w-[300px] -translate-x-1/2 rounded-lg border border-slate-200 bg-white p-3 shadow-xl text-xs text-slate-800"
      @pointerdown.stop
      @mousedown.stop
    >
      <div class="flex items-center justify-between border-b pb-1 mb-2 font-bold text-slate-700">
        <span>Edit Router Rules</span>
      </div>

      <div v-if="loading" class="py-4 text-center text-slate-500">
        Loading details…
      </div>

      <div v-else class="flex flex-col gap-2 max-h-[300px] overflow-y-auto pr-1">
        <div v-if="!patternAgents.length" class="py-2 text-center text-slate-500">
          Add agents inside this supervisor pattern first.
        </div>
        <template v-else>
          <WorkflowRouterRulesFields
            v-model="routerForm"
            :pattern-agents="patternAgents"
            rule-key-prefix="node-router"
            :agent-label="agentLabel"
          />
          <div class="flex gap-2 mt-2">
            <button type="button" class="flex-1 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white font-medium text-[11px]" :disabled="saving" @click="submitRouter">
              {{ saving ? 'Saving…' : routerExists ? 'Update' : 'Create' }}
            </button>
            <button v-if="routerExists" type="button" class="flex-1 py-1 rounded border border-red-300 hover:bg-red-50 text-red-700 font-medium text-[11px]" :disabled="saving" @click="deleteRouter">
              Delete
            </button>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

