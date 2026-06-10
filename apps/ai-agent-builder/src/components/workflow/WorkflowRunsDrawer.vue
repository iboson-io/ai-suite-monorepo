<template>
  <div
    class="workflow-runs-drawer fixed inset-0 z-[100] flex justify-end"
    role="dialog"
    aria-modal="true"
    aria-labelledby="workflow-runs-drawer-title"
  >
    <div class="absolute inset-0 bg-slate-900/40" aria-hidden="true" @click="$emit('close')" />
    <aside
      class="relative flex h-full w-full max-w-xl flex-col bg-white shadow-2xl border-l border-slate-200"
      @click.stop
    >
      <header class="flex-shrink-0 flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 px-4 py-3">
        <h3 id="workflow-runs-drawer-title" class="text-sm font-semibold text-slate-900">
          Execution history
        </h3>
        <div class="flex items-center gap-2">
          <button
            type="button"
            class="text-xs font-medium text-blue-700 hover:underline disabled:opacity-50"
            :disabled="listLoading"
            @click="loadExecutions"
          >
            Refresh
          </button>
          <button
            type="button"
            class="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100"
            aria-label="Close"
            @click="$emit('close')"
          >
            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </header>

      <div class="flex-shrink-0 flex flex-wrap items-center gap-2 border-b border-slate-100 px-4 py-2 bg-slate-50/80">
        <label class="text-xs text-slate-600">Status</label>
        <select
          v-model="statusFilter"
          class="text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-white"
          @change="onFilterChange"
        >
          <option value="">All</option>
          <option value="running">Running</option>
          <option value="completed">Completed</option>
          <option value="failed">Failed</option>
          <option value="paused">Paused</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <div class="flex-1 min-h-0 overflow-y-auto px-4 py-3 space-y-4">
        <p v-if="listError" class="text-sm text-red-600">{{ listError }}</p>

        <div v-if="listLoading && !executions.length" class="flex justify-center py-8">
          <div class="h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>

        <template v-else>
          <p v-if="!executions.length" class="text-sm text-slate-600">
            No executions yet. Runs appear here once your workflow engine records them for this workflow.
          </p>

          <ul v-else class="space-y-1">
            <li v-for="ex in executions" :key="ex.id">
              <button
                type="button"
                class="w-full text-left rounded-lg border px-3 py-2 text-xs transition-colors"
                :class="
                  selectedId === ex.id
                    ? 'border-blue-400 bg-blue-50 text-slate-900'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-800'
                "
                @click="selectExecution(ex.id)"
              >
                <div class="flex justify-between gap-2">
                  <span class="font-mono truncate">{{ shortId(ex.id) }}</span>
                  <span class="shrink-0 capitalize">{{ ex.status || '—' }}</span>
                </div>
                <div class="mt-1 text-[11px] text-slate-500 flex flex-wrap gap-x-2">
                  <span v-if="ex.trigger_type">Trigger: {{ ex.trigger_type }}</span>
                  <span v-if="ex.started_at">{{ formatTime(ex.started_at) }}</span>
                </div>
              </button>
            </li>
          </ul>

          <div v-if="pagination && pagination.total_pages > 1" class="flex justify-between items-center text-xs pt-1">
            <button
              type="button"
              class="text-blue-700 font-medium disabled:opacity-40"
              :disabled="!pagination.has_prev || listLoading"
              @click="goPage(pagination.current_page - 1)"
            >
              Previous
            </button>
            <span class="text-slate-600">
              Page {{ pagination.current_page }} / {{ pagination.total_pages }}
            </span>
            <button
              type="button"
              class="text-blue-700 font-medium disabled:opacity-40"
              :disabled="!pagination.has_next || listLoading"
              @click="goPage(pagination.current_page + 1)"
            >
              Next
            </button>
          </div>
        </template>

        <template v-if="selectedId">
          <div class="border-t border-slate-200 pt-4">
            <h4 class="text-xs font-semibold text-slate-800 uppercase tracking-wide mb-2">Run detail</h4>
            <p v-if="detailError" class="text-sm text-red-600 mb-2">{{ detailError }}</p>
            <div v-if="detailLoading" class="py-4 flex justify-center">
              <div class="h-6 w-6 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
            </div>
            <dl v-else-if="executionDetail" class="grid gap-1 text-xs text-slate-700">
              <div class="flex gap-2">
                <dt class="text-slate-500 w-28 shrink-0">ID</dt>
                <dd class="font-mono break-all">{{ executionDetail.id }}</dd>
              </div>
              <div class="flex gap-2">
                <dt class="text-slate-500 w-28 shrink-0">Status</dt>
                <dd class="capitalize">{{ executionDetail.status }}</dd>
              </div>
              <div v-if="executionDetail.trigger_type" class="flex gap-2">
                <dt class="text-slate-500 w-28 shrink-0">Trigger</dt>
                <dd>{{ executionDetail.trigger_type }}</dd>
              </div>
              <div v-if="executionDetail.error_message" class="flex gap-2">
                <dt class="text-slate-500 w-28 shrink-0">Error</dt>
                <dd class="text-red-700">{{ executionDetail.error_message }}</dd>
              </div>
              <div v-if="executionDetail.started_at" class="flex gap-2">
                <dt class="text-slate-500 w-28 shrink-0">Started</dt>
                <dd>{{ formatTime(executionDetail.started_at) }}</dd>
              </div>
              <div v-if="executionDetail.completed_at" class="flex gap-2">
                <dt class="text-slate-500 w-28 shrink-0">Completed</dt>
                <dd>{{ formatTime(executionDetail.completed_at) }}</dd>
              </div>
            </dl>
          </div>

          <div class="border-t border-slate-200 pt-4">
            <h4 class="text-xs font-semibold text-slate-800 uppercase tracking-wide mb-2">Steps</h4>
            <p v-if="stepsError" class="text-sm text-red-600 mb-2">{{ stepsError }}</p>
            <div v-if="stepsLoading" class="py-3 flex justify-center">
              <div class="h-5 w-5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
            </div>
            <div v-else-if="!steps.length" class="text-xs text-slate-500">No steps recorded.</div>
            <div v-else class="overflow-x-auto max-h-56 overflow-y-auto rounded-lg border border-slate-200">
              <table class="min-w-full text-xs">
                <thead class="bg-slate-50 text-slate-600 sticky top-0">
                  <tr>
                    <th class="text-left px-2 py-1.5 font-medium">#</th>
                    <th class="text-left px-2 py-1.5 font-medium">Status</th>
                    <th class="text-left px-2 py-1.5 font-medium">Agent</th>
                    <th class="text-left px-2 py-1.5 font-medium">Pattern</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="s in steps" :key="s.id" class="border-t border-slate-100">
                    <td class="px-2 py-1.5 font-mono">{{ s.step_order }}</td>
                    <td class="px-2 py-1.5 capitalize">{{ s.status }}</td>
                    <td class="px-2 py-1.5 font-mono truncate max-w-[100px]" :title="s.agent_id">{{ shortId(s.agent_id) }}</td>
                    <td class="px-2 py-1.5 font-mono truncate max-w-[100px]" :title="s.pattern_id">{{ shortId(s.pattern_id) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div class="border-t border-slate-200 pt-4 pb-6">
            <h4 class="text-xs font-semibold text-slate-800 uppercase tracking-wide mb-2">Human review (HITL)</h4>
            <p v-if="hitlError" class="text-sm text-red-600 mb-2">{{ hitlError }}</p>
            <div v-if="hitlLoading" class="py-3 flex justify-center">
              <div class="h-5 w-5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
            </div>
            <div v-else-if="!hitlEvents.length" class="text-xs text-slate-500">No HITL events for this run.</div>
            <ul v-else class="space-y-3">
              <li
                v-for="ev in hitlEvents"
                :key="ev.id"
                class="rounded-lg border border-slate-200 bg-slate-50/50 p-3 text-xs"
              >
                <div class="flex justify-between gap-2">
                  <span class="font-mono text-slate-600">{{ shortId(ev.id) }}</span>
                  <span class="capitalize font-medium" :class="hitlStatusClass(ev.status)">{{ ev.status }}</span>
                </div>
                <p v-if="ev.pause_reason" class="mt-1 text-slate-700">{{ ev.pause_reason }}</p>
                <p v-if="ev.owner_input" class="mt-1 text-slate-600">
                  Owner note: {{ ev.owner_input }}
                </p>
                <template v-if="ev.status === 'waiting'">
                  <label class="block mt-2 text-[11px] text-slate-500">Note (optional)</label>
                  <textarea
                    v-model="hitlNotes[ev.id]"
                    rows="2"
                    class="mt-0.5 w-full border border-slate-200 rounded-lg px-2 py-1.5 text-xs"
                    placeholder="Context for approve / reject"
                  />
                  <div class="mt-2 flex flex-wrap gap-2">
                    <button
                      type="button"
                      class="rounded-lg bg-emerald-600 text-white px-3 py-1.5 text-xs font-medium disabled:opacity-50"
                      :disabled="respondingId === ev.id"
                      @click="submitHitl(ev, 'approved')"
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      class="rounded-lg bg-red-600 text-white px-3 py-1.5 text-xs font-medium disabled:opacity-50"
                      :disabled="respondingId === ev.id"
                      @click="submitHitl(ev, 'rejected')"
                    >
                      Reject
                    </button>
                  </div>
                </template>
              </li>
            </ul>
          </div>
        </template>
      </div>
    </aside>
  </div>
</template>

<script setup>
import { ref, reactive, watch, onMounted } from 'vue'
import { useWorkflow } from '@app/composables/useWorkflow'

const props = defineProps({
  workflowId: {
    type: String,
    required: true
  }
})

defineEmits(['close'])

const {
  listExecutions,
  getExecution,
  listExecutionSteps,
  listHitlEvents,
  respondToHitlEvent
} = useWorkflow()

const listLoading = ref(false)
const listError = ref('')
const executions = ref([])
const pagination = ref(null)
const page = ref(1)
const statusFilter = ref('')

const selectedId = ref(null)
const detailLoading = ref(false)
const detailError = ref('')
const executionDetail = ref(null)

const stepsLoading = ref(false)
const stepsError = ref('')
const steps = ref([])

const hitlLoading = ref(false)
const hitlError = ref('')
const hitlEvents = ref([])
const hitlNotes = reactive({})
const respondingId = ref(null)

function shortId(id) {
  if (id == null || id === '') return '—'
  const s = String(id)
  return s.length > 10 ? `${s.slice(0, 8)}…` : s
}

function formatTime(iso) {
  if (!iso) return ''
  try {
    return new Date(iso).toLocaleString()
  } catch {
    return String(iso)
  }
}

function hitlStatusClass(status) {
  if (status === 'waiting') return 'text-amber-700'
  if (status === 'approved') return 'text-emerald-700'
  if (status === 'rejected') return 'text-red-700'
  if (status === 'timed_out') return 'text-slate-600'
  return 'text-slate-700'
}

async function loadExecutions() {
  listLoading.value = true
  listError.value = ''
  try {
    const q = { page: page.value, limit: 20 }
    if (statusFilter.value) q.status = statusFilter.value
    const { executions: rows, pagination: pag } = await listExecutions(props.workflowId, q)
    executions.value = rows
    pagination.value = pag
  } catch (e) {
    listError.value = e?.message || 'Failed to load executions'
    executions.value = []
    pagination.value = null
  } finally {
    listLoading.value = false
  }
}

function onFilterChange() {
  page.value = 1
  loadExecutions()
}

function goPage(p) {
  page.value = p
  loadExecutions()
}

async function selectExecution(id) {
  selectedId.value = id
  executionDetail.value = null
  steps.value = []
  hitlEvents.value = []
  detailError.value = ''
  stepsError.value = ''
  hitlError.value = ''

  detailLoading.value = true
  try {
    executionDetail.value = await getExecution(props.workflowId, id)
  } catch (e) {
    detailError.value = e?.message || 'Failed to load run detail'
  } finally {
    detailLoading.value = false
  }

  stepsLoading.value = true
  try {
    const stepResult = await listExecutionSteps(props.workflowId, id, { limit: 100 })
    steps.value = stepResult.steps
  } catch (e) {
    stepsError.value = e?.message || 'Failed to load steps'
  } finally {
    stepsLoading.value = false
  }

  hitlLoading.value = true
  try {
    const hitlResult = await listHitlEvents(id, { limit: 50 })
    hitlEvents.value = hitlResult.events
  } catch (e) {
    hitlError.value = e?.message || 'Failed to load HITL events'
  } finally {
    hitlLoading.value = false
  }
}

async function submitHitl(ev, status) {
  hitlError.value = ''
  respondingId.value = ev.id
  try {
    const owner_input = hitlNotes[ev.id]?.trim() || null
    await respondToHitlEvent(ev.id, { status, owner_input: owner_input || undefined })
    await selectExecution(selectedId.value)
    await loadExecutions()
  } catch (e) {
    hitlError.value = e?.message || 'Could not record response'
  } finally {
    respondingId.value = null
  }
}

watch(
  () => props.workflowId,
  () => {
    selectedId.value = null
    executionDetail.value = null
    steps.value = []
    hitlEvents.value = []
    page.value = 1
    loadExecutions()
  }
)

onMounted(() => {
  loadExecutions()
})
</script>
