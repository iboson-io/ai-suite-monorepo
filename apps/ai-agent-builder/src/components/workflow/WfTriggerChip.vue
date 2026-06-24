<script setup>
import { ref, watch, inject } from 'vue'
import { Handle, Position } from '@vue-flow/core'
import { SelectBox } from '@ai-suite/shared-ui'
import { useWorkflow } from '@app/composables/useWorkflow'
import WfFormField from './WfFormField.vue'
import {
  WF_POPOVER_PANEL,
  WF_TAB_PANEL,
  WF_FIELD_INPUT,
  WF_FIELD_SELECT,
  WF_BTN_ROW,
  WF_BTN_PRIMARY,
  WF_CHECKBOX,
  TRIGGER_TYPE_OPTIONS
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

const workflowId = inject('workflowId', null)
const reloadDiagram = inject('reloadDiagram', null)

const { updateTrigger } = useWorkflow()

const localType = ref('email')
const localValue = ref('')
const localActive = ref(true)
const saving = ref(false)

watch(
  () => [props.data.triggerType, props.data.subtitle, props.data.isActive],
  ([t, s, a]) => {
    localType.value = t || 'email'
    localValue.value = s || ''
    localActive.value = a !== false
  },
  { immediate: true }
)

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
    class="group/chip relative flex h-full w-full flex-col justify-center overflow-visible rounded-lg border regular_border_color bg_secondary_color p-2 text-left shadow-sm ring-1 ring-slate-900/5 transition hover:border-blue-300 hover:shadow-md"
    :class="[
      selected ? '!ring-2 !ring-blue-500 !ring-offset-2 !ring-offset-[#f1f4f9] z-50' : ''
    ]"
    @pointerdown.stop
    @mousedown.stop
  >
    <Handle
      type="target"
      :position="Position.Left"
      class="!h-2 !w-2 !border regular_border_color !bg_secondary_color"
    />
    <Handle
      type="source"
      :position="Position.Right"
      class="!h-2 !w-2 !border regular_border_color !bg_secondary_color"
    />

    <span class="text-[9px] font-bold uppercase tracking-wide tertiary_text_color">Trigger</span>
    <span class="truncate text-[11px] font-semibold capitalize leading-tight primary_text_color">
      {{ data.triggerType || 'event' }}
    </span>
    <span class="truncate text-[9px] leading-tight secondary_text_color">{{ data.subtitle || '—' }}</span>
    <div class="group/del absolute -right-1.5 -top-1.5 z-10">
      <button
        type="button"
        data-action="delete-trigger"
        :data-trigger-id="data.triggerId"
        class="flex h-5 w-5 items-center justify-center rounded-full border regular_border_color bg_secondary_color text-[11px] font-bold leading-none secondary_text_color shadow-md opacity-0 transition hover:bg-red-50 hover:text-red-700 group-hover/chip:opacity-100"
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

    <div
      v-if="selected"
      :class="[WF_POPOVER_PANEL, 'w-[260px]']"
      @pointerdown.stop
      @mousedown.stop
    >
      <div class="mb-1 flex items-center justify-between border-b primary_border_color pb-2">
        <span class="label_3_semibold primary_text_color">Edit Trigger</span>
        <label class="flex cursor-pointer items-center gap-xs label_3_regular secondary_text_color">
          <input v-model="localActive" type="checkbox" :class="WF_CHECKBOX" />
          Active
        </label>
      </div>

      <div :class="WF_TAB_PANEL">
        <WfFormField label="Type">
          <SelectBox
            :model-value="localType"
            :options="TRIGGER_TYPE_OPTIONS"
            wrapper-class="w-full"
            :custom-class="WF_FIELD_SELECT"
            dropdown-class="w-full"
            @change="localType = $event.id"
          />
        </WfFormField>

        <WfFormField :label="getLabel(localType)">
          <input
            v-model="localValue"
            type="text"
            :placeholder="getPlaceholder(localType)"
            :class="WF_FIELD_INPUT"
            @keydown.enter="handleSave"
          />
        </WfFormField>

        <div :class="WF_BTN_ROW">
          <button
            type="button"
            :class="WF_BTN_PRIMARY"
            :disabled="saving"
            @click="handleSave"
          >
            {{ saving ? 'Saving…' : 'Save' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
