<script setup>
import { ref, watch, inject } from 'vue'
import { Handle, Position } from '@vue-flow/core'
import { useWorkflow } from '@app/composables/useWorkflow'

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

const { updateTrigger } = useWorkflow()

const localType = ref('email')
const localValue = ref('')
const localActive = ref(true)
const saving = ref(false)

// Sync local state when props change
watch(
  () => [props.data.triggerType, props.data.subtitle, props.data.isActive],
  ([t, s, a]) => {
    localType.value = t || 'email'
    localValue.value = s || ''
    localActive.value = a !== false
  },
  { immediate: true }
)

const TRIGGER_TYPE_OPTIONS = [
  { value: 'email', label: 'Email' },
  { value: 'webhook', label: 'Webhook' },
  { value: 'schedule', label: 'Schedule' },
  { value: 'sms', label: 'SMS' },
  { value: 'voice', label: 'Voice' }
]

function getPlaceholder(type) {
  if (type === 'email') return 'support@company.com'
  if (type === 'webhook') return 'https://...'
  if (type === 'schedule') return '0 9 * * *'
  if (type === 'sms' || type === 'voice') return '+14155552671'
  return ''
}

function getLabel(type) {
  if (type === 'email') return 'Inbound email'
  if (type === 'webhook') return 'Endpoint URL'
  if (type === 'schedule') return 'Cron expression'
  if (type === 'sms' || type === 'voice') return 'Phone number'
  return 'Config'
}

async function handleSave() {
  const wId = workflowId?.value || workflowId
  if (!wId || !props.data.triggerId) return
  saving.value = true
  try {
    let config = {}
    const t = localType.value
    const val = localValue.value.trim()
    if (t === 'email') {
      config = { inbound_email: val }
    } else if (t === 'webhook') {
      config = { endpoint: val }
    } else if (t === 'schedule') {
      config = { cron: val }
    } else if (t === 'sms' || t === 'voice') {
      config = { phone_number: val }
    }

    await updateTrigger(wId, props.data.triggerId, {
      trigger_type: t,
      config,
      is_active: localActive.value
    })
    
    if (reloadDiagram) {
      await reloadDiagram()
    }
  } catch (e) {
    console.error('Failed to update trigger:', e)
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div
    class="group/chip relative flex flex-col justify-center rounded-lg border border-slate-200 bg-white p-2 text-left shadow-sm ring-1 ring-slate-900/5 transition hover:border-blue-300 hover:shadow-md h-full w-full overflow-visible"
    :class="[
      selected ? '!ring-2 !ring-blue-500 !ring-offset-2 !ring-offset-[#f1f4f9] z-50' : ''
    ]"
    @pointerdown.stop
    @mousedown.stop
  >
    <Handle
      type="target"
      :position="Position.Left"
      class="!h-2 !w-2 !border !border-slate-300 !bg-white"
    />
    <Handle
      type="source"
      :position="Position.Right"
      class="!h-2 !w-2 !border !border-slate-300 !bg-white"
    />

    <!-- Read Mode (Always visible inside the chip node) -->
    <span class="text-[9px] font-bold uppercase tracking-wide text-slate-400">Trigger</span>
    <span class="truncate text-[11px] font-semibold capitalize leading-tight text-slate-900">
      {{ data.triggerType || 'event' }}
    </span>
    <span class="truncate text-[9px] leading-tight text-slate-500">{{ data.subtitle || '—' }}</span>
    <div class="group/del absolute -right-1.5 -top-1.5 z-10">
      <button
        type="button"
        data-action="delete-trigger"
        :data-trigger-id="data.triggerId"
        class="flex h-5 w-5 items-center justify-center rounded-full border border-slate-300 bg-white text-[11px] font-bold leading-none text-slate-700 shadow-md opacity-0 transition hover:bg-red-50 hover:text-red-700 group-hover/chip:opacity-100"
        aria-label="Remove trigger"
      >
        ×
      </button>
      <span
        role="tooltip"
        class="pointer-events-none absolute bottom-full left-1/2 z-[10060] mb-1.5 w-max -translate-x-1/2 rounded-md bg-black px-2 py-1.5 text-center text-[11px] font-medium leading-tight text-white opacity-0 shadow-lg transition-opacity duration-150 group-hover/del:opacity-100 group-focus-within/del:opacity-100"
      >
        Remove trigger
      </span>
    </div>

    <!-- Edit Popover Overlay (floats under the chip node when selected) -->
    <div
      v-if="selected"
      class="absolute left-1/2 top-full mt-2 z-[1000] flex w-[240px] -translate-x-1/2 flex-col gap-2 rounded-lg border border-slate-200 bg-white p-3 shadow-xl text-xs text-slate-800"
      @pointerdown.stop
      @mousedown.stop
    >
      <div class="flex items-center justify-between border-b pb-1 mb-1">
        <span class="font-bold text-slate-700">Edit Trigger</span>
        <label class="flex items-center gap-1 text-[10px] text-slate-600 cursor-pointer">
          <input type="checkbox" v-model="localActive" class="rounded border-slate-300" />
          Active
        </label>
      </div>

      <div class="flex flex-col gap-0.5">
        <label class="text-[10px] font-medium text-slate-500">Type</label>
        <select
          v-model="localType"
          class="border rounded px-1.5 py-1 text-xs bg-slate-50 outline-none"
        >
          <option v-for="opt in TRIGGER_TYPE_OPTIONS" :key="opt.value" :value="opt.value">
            {{ opt.label }}
          </option>
        </select>
      </div>

      <div class="flex flex-col gap-0.5">
        <label class="text-[10px] font-medium text-slate-500">{{ getLabel(localType) }}</label>
        <input
          v-model="localValue"
          type="text"
          :placeholder="getPlaceholder(localType)"
          class="border rounded px-1.5 py-1 text-xs outline-none focus:border-blue-400 bg-white"
          @keydown.enter="handleSave"
        />
      </div>

      <div class="flex gap-2 mt-1.5">
        <button
          type="button"
          class="flex-1 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white font-medium text-[11px]"
          :disabled="saving"
          @click="handleSave"
        >
          {{ saving ? 'Saving…' : 'Save' }}
        </button>
      </div>
    </div>
  </div>
</template>
