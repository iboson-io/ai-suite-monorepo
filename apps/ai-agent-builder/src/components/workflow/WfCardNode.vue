<script setup>
import { computed, ref, watch, inject } from 'vue'
import { Handle, Position } from '@vue-flow/core'
import { SelectBox } from '@ai-suite/shared-ui'
import { useWorkflow } from '@app/composables/useWorkflow'
import { apiService } from '@app/services/agentApi.js'
import WfHitlFormFields from './WfHitlFormFields.vue'
import WfFormField from './WfFormField.vue'
import {
  WF_FIELD_INPUT,
  WF_FIELD_SELECT,
  WF_POPOVER_PANEL,
  WF_TAB_PANEL,
  WF_BTN_ROW,
  WF_BTN_PRIMARY,
  WF_BTN_DANGER,
  WF_CHECKBOX
} from './workflowFormStyles.js'

const props = defineProps({
  id: {
    type: String,
    required: true
  },
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

const {
  updatePatternAgent,
  removePatternAgent,
  getPatternAgent,
  getOutputChannel,
  updateOutputChannel,
  removeOutputChannel,
  loadHitl,
  upsertHitl,
  deleteHitl
} = useWorkflow()

const loading = ref(false)
const saving = ref(false)

// Context mapping for node ID parts
const channelId = computed(() => {
  return props.id.startsWith('output_channel:') ? props.id.slice('output_channel:'.length) : props.id
})

// Catalog agents list
const agentsList = ref([])
const agentsLoading = ref(false)

const agentOptions = computed(() =>
  agentsList.value.map((a) => ({
    id: String(a.id),
    name: a.name || a.agent_name || String(a.id)
  }))
)

async function fetchAgents() {
  if (agentsList.value.length > 0) return
  agentsLoading.value = true
  try {
    const collected = []
    let page = 1
    const limit = 100
    let hasMore = true
    while (hasMore && page <= 10) {
      const res = await apiService.getAgentData(page, limit, null, null)
      const data = res?.data ?? res
      const batch = Array.isArray(data?.agents) ? data.agents : Array.isArray(data) ? data : []
      collected.push(...batch)
      const pag = data?.pagination
      hasMore = pag?.has_next === true && batch.length > 0
      page += 1
      if (!batch.length) hasMore = false
    }
    agentsList.value = collected
  } catch (e) {
    console.error(e)
  } finally {
    agentsLoading.value = false
  }
}

// 1. Agent Form Data
const localAgentId = ref('')
const localTimeoutSec = ref('30')
const localFallback = ref(false)

async function loadAgentDetails() {
  const wId = workflowId?.value || workflowId
  if (!wId || !props.data.patternId || props.data.patternAgentId == null) return
  loading.value = true
  try {
    await fetchAgents()
    const res = await getPatternAgent(wId, props.data.patternId, props.data.patternAgentId)
    if (res) {
      localAgentId.value = res.agent_id != null ? String(res.agent_id) : ''
      localFallback.value = !!res.is_fallback
      const cfg = res.config && typeof res.config === 'object' ? res.config : {}
      localTimeoutSec.value = String(cfg.timeout_seconds || cfg.timeout || '30')
    }
  } catch (e) {
    console.error('Failed to load agent details:', e)
  } finally {
    loading.value = false
  }
}

async function saveAgentDetails() {
  const wId = workflowId?.value || workflowId
  if (!wId || !props.data.patternId || props.data.patternAgentId == null) return
  saving.value = true
  try {
    const sec = Number(localTimeoutSec.value)
    const config = { timeout_seconds: Number.isNaN(sec) ? 30 : sec }
    await updatePatternAgent(wId, props.data.patternId, props.data.patternAgentId, {
      agent_id: localAgentId.value,
      is_fallback: localFallback.value,
      config
    })
    if (reloadDiagram) await reloadDiagram()
  } catch (e) {
    console.error('Failed to update agent:', e)
  } finally {
    saving.value = false
  }
}

async function deleteAgentStep() {
  const wId = workflowId?.value || workflowId
  if (!wId || !props.data.patternId || props.data.patternAgentId == null) return
  if (!confirm('Remove this agent step from pattern? This cannot be undone.')) return
  saving.value = true
  try {
    await removePatternAgent(wId, props.data.patternId, props.data.patternAgentId)
    if (reloadDiagram) await reloadDiagram()
  } catch (e) {
    console.error('Failed to remove agent:', e)
  } finally {
    saving.value = false
  }
}

// 2. Output Channel Form Data
const emailTo = ref('')
const emailSubject = ref('')
const smsFromNumber = ref('')
const outboundFromNumber = ref('')
const outboundTtsVoice = ref('')
const outboundLanguage = ref('')
const configJson = ref('{}')
const isPrimary = ref(false)
const channelType = ref('')

async function loadOutputDetails() {
  const wId = workflowId?.value || workflowId
  const cId = channelId.value
  if (!wId || !cId) return
  loading.value = true
  try {
    const res = await getOutputChannel(wId, cId)
    if (res) {
      channelType.value = res.channel_type || ''
      isPrimary.value = !!res.is_primary
      const cfg = res.config && typeof res.config === 'object' ? res.config : {}
      if (res.channel_type === 'email') {
        emailTo.value = cfg.to || ''
        emailSubject.value = cfg.subject || ''
      } else if (res.channel_type === 'sms') {
        smsFromNumber.value = cfg.from_number || ''
      } else if (res.channel_type === 'outbound_call') {
        outboundFromNumber.value = cfg.from_number || ''
        outboundTtsVoice.value = cfg.tts_voice || ''
        outboundLanguage.value = cfg.language || ''
      } else {
        configJson.value = JSON.stringify(cfg, null, 2)
      }
    }
  } catch (e) {
    console.error('Failed to load output details:', e)
  } finally {
    loading.value = false
  }
}

async function saveOutputDetails() {
  const wId = workflowId?.value || workflowId
  const cId = channelId.value
  if (!wId || !cId) return
  saving.value = true
  try {
    let config = {}
    const ct = channelType.value
    if (ct === 'email') {
      config = { to: emailTo.value.trim(), subject: emailSubject.value.trim() }
    } else if (ct === 'sms') {
      config = { from_number: smsFromNumber.value.trim() }
    } else if (ct === 'outbound_call') {
      config = {
        from_number: outboundFromNumber.value.trim(),
        tts_voice: outboundTtsVoice.value.trim(),
        language: outboundLanguage.value.trim()
      }
    } else {
      try {
        config = JSON.parse(configJson.value)
      } catch {
        alert('Invalid JSON configuration format.')
        saving.value = false
        return
      }
    }
    await updateOutputChannel(wId, cId, {
      channel_type: ct,
      is_primary: isPrimary.value,
      config
    })
    if (reloadDiagram) await reloadDiagram()
  } catch (e) {
    console.error('Failed to save output details:', e)
  } finally {
    saving.value = false
  }
}

async function deleteOutputChannelStep() {
  const wId = workflowId?.value || workflowId
  const cId = channelId.value
  if (!wId || !cId) return
  if (!confirm('Remove this output channel?')) return
  saving.value = true
  try {
    await removeOutputChannel(wId, cId)
    if (reloadDiagram) await reloadDiagram()
  } catch (e) {
    console.error('Failed to remove output:', e)
  } finally {
    saving.value = false
  }
}

// 3. HITL Form Data
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

async function loadHitlDetails() {
  const wId = workflowId?.value || workflowId
  if (!wId) return
  loading.value = true
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
    console.error('Failed to load HITL details:', e)
  } finally {
    loading.value = false
  }
}

async function saveHitlDetails() {
  const wId = workflowId?.value || workflowId
  if (!wId) return
  saving.value = true
  try {
    await upsertHitl(wId, hitlForm.value, hitlExists.value)
    if (reloadDiagram) await reloadDiagram()
  } catch (e) {
    console.error('Failed to save HITL details:', e)
  } finally {
    saving.value = false
  }
}

async function removeHitlStep() {
  const wId = workflowId?.value || workflowId
  if (!wId) return
  if (!confirm('Remove HITL configuration?')) return
  saving.value = true
  try {
    await deleteHitl(wId)
    if (reloadDiagram) await reloadDiagram()
  } catch (e) {
    console.error('Failed to delete HITL:', e)
  } finally {
    saving.value = false
  }
}

// Detail loading triggers
watch(
  () => [props.selected, workflowId?.value || workflowId],
  ([sel]) => {
    if (sel) {
      if (props.data?.role === 'agent') {
        loadAgentDetails()
      } else if (props.data?.role === 'output') {
        loadOutputDetails()
      } else if (props.data?.role === 'hitl') {
        loadHitlDetails()
      }
    }
  },
  { immediate: true }
)

const surfaceClass = computed(() => {
  const r = props.data?.role
  if (r === 'trigger') return 'bg_secondary_color primary_text_color'
  if (r === 'agent') return 'bg_secondary_color primary_text_color'
  if (r === 'output') return 'bg-violet-50/90 primary_text_color'
  if (r === 'hitl') return 'bg-orange-50/90 primary_text_color'
  return 'bg_secondary_color primary_text_color'
})

const accentClass = computed(() => {
  const r = props.data?.role
  if (r === 'trigger') return 'border-l-blue-600'
  if (r === 'agent') return 'border-l-emerald-600'
  if (r === 'output') return 'border-l-violet-600'
  if (r === 'hitl') return 'border-l-orange-500'
  return 'border-l-slate-400'
})

const showTarget = computed(() => props.data?.role !== 'trigger')
const showSource = computed(() => props.data?.role !== 'output' && props.data?.role !== 'hitl')

const heading = computed(() => {
  const h = props.data?.heading
  return h != null && String(h).trim() ? String(h).trim() : ''
})

const isSupervisorAgent = computed(
  () => props.data?.role === 'agent' && String(props.data?.patternType || '') === 'supervisor'
)
</script>

<template>
  <div
    class="wf-card rounded-lg border border-y border-r regular_border_color py-2.5 px-3 text-left shadow-md overflow-visible"
    :class="[
      surfaceClass,
      accentClass,
      'border-l-4',
      selected ? 'z-50 !ring-2 !ring-blue-500 !ring-offset-2 !ring-offset-[#f1f4f9]' : 'min-w-[160px] max-w-[220px]'
    ]"
    @pointerdown.stop
    @mousedown.stop
  >
    <!-- Vue Flow handles -->
    <template v-if="data?.role === 'agent'">
      <Handle
        v-if="!isSupervisorAgent"
        id="in"
        type="target"
        :position="Position.Left"
        :style="{ top: '50%', transform: 'translateY(-50%)' }"
        class="!h-2.5 !w-2.5 !border regular_border_color !bg_secondary_color"
      />
      <Handle
        v-if="isSupervisorAgent"
        id="in-router"
        type="target"
        :position="Position.Right"
        :style="{ top: '72%', transform: 'translateY(-50%)' }"
        class="!h-2.5 !w-2.5 !border !border-emerald-500 !bg_secondary_color"
      />
      <Handle
        v-if="showSource"
        id="out"
        type="source"
        :position="Position.Right"
        :style="
          isSupervisorAgent
            ? { top: '28%', transform: 'translateY(-50%)' }
            : { top: '50%', transform: 'translateY(-50%)' }
        "
        class="!h-2.5 !w-2.5 !border regular_border_color !bg_secondary_color"
      />
    </template>
    <template v-else>
      <Handle
        v-if="showTarget"
        type="target"
        :position="Position.Left"
        class="!h-2.5 !w-2.5 !border regular_border_color !bg_secondary_color"
      />
      <Handle
        v-if="showSource"
        type="source"
        :position="Position.Right"
        class="!h-2.5 !w-2.5 !border regular_border_color !bg_secondary_color"
      />
    </template>

    <!-- Read Mode: always visible inside the node -->
    <div class="flex min-w-0 items-start gap-1.5 w-full">
      <span
        v-if="heading"
        class="max-w-[42%] shrink-0 truncate rounded bg-emerald-50 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-emerald-800 ring-1 ring-emerald-700/15"
      >
        {{ heading }}
      </span>
      <div class="min-w-0 flex-1">
        <div class="truncate text-xs font-bold leading-tight">
          {{ data.title }}
        </div>
        <div
          v-if="data.subtitle"
          class="mt-0.5 break-all text-[11px] font-medium leading-snug opacity-90 truncate"
        >
          {{ data.subtitle }}
        </div>
      </div>
    </div>

    <!-- Edit Popover Overlay (floats under the card node when selected) -->
    <div
      v-if="selected"
      :class="[WF_POPOVER_PANEL, 'w-[300px]']"
      @pointerdown.stop
      @mousedown.stop
    >
      <div class="mb-1 flex items-center justify-between border-b primary_border_color pb-1 label_3_semibold primary_text_color">
        <span class="capitalize">Edit {{ data?.role }}</span>
      </div>

      <div v-if="loading" class="py-4 text-center body_3_regular secondary_text_color">
        Loading details…
      </div>

      <template v-else>
        <!-- A. AGENT CARD EDITOR -->
        <div v-if="data?.role === 'agent'" :class="WF_TAB_PANEL">
          <WfFormField label="Agent">
            <SelectBox
              :model-value="localAgentId"
              :options="agentOptions"
              :loading="agentsLoading"
              placeholder="Select agent"
              wrapper-class="w-full"
              :custom-class="WF_FIELD_SELECT"
              dropdown-class="w-full"
              @change="localAgentId = $event.id"
            />
          </WfFormField>
          <WfFormField label="Timeout (seconds)">
            <input v-model="localTimeoutSec" type="number" min="1" :class="WF_FIELD_INPUT" />
          </WfFormField>
          <label class="flex cursor-pointer items-center gap-md label_3_regular secondary_text_color">
            <input v-model="localFallback" type="checkbox" :class="WF_CHECKBOX" />
            Fallback agent
          </label>
          <div :class="WF_BTN_ROW">
            <button type="button" :class="WF_BTN_PRIMARY" :disabled="saving" @click="saveAgentDetails">
              {{ saving ? 'Saving…' : 'Save' }}
            </button>
            <button type="button" :class="WF_BTN_DANGER" :disabled="saving" @click="deleteAgentStep">
              Remove
            </button>
          </div>
        </div>

        <!-- B. OUTPUT CHANNEL CARD EDITOR -->
        <div v-else-if="data?.role === 'output'" :class="WF_TAB_PANEL">
          <div class="flex items-center justify-between rounded-lg border primary_border_color bg_primary_color p-2 label_3_regular">
            <span class="secondary_text_color">Type</span>
            <span class="label_3_semibold capitalize primary_text_color">{{ channelType }}</span>
          </div>

          <template v-if="channelType === 'email'">
            <WfFormField label="To Email">
              <input v-model="emailTo" type="email" placeholder="owner@company.com" :class="WF_FIELD_INPUT" />
            </WfFormField>
            <WfFormField label="Subject">
              <input v-model="emailSubject" type="text" placeholder="Workflow result" :class="WF_FIELD_INPUT" />
            </WfFormField>
          </template>

          <template v-else-if="channelType === 'sms' || channelType === 'outbound_call'">
            <WfFormField label="From Number">
              <input v-model="smsFromNumber" type="text" placeholder="+15551234567" :class="WF_FIELD_INPUT" />
            </WfFormField>
            <template v-if="channelType === 'outbound_call'">
              <WfFormField label="TTS Voice">
                <input v-model="outboundTtsVoice" type="text" placeholder="Polly.Joanna" :class="WF_FIELD_INPUT" />
              </WfFormField>
              <WfFormField label="Language">
                <input v-model="outboundLanguage" type="text" placeholder="en-US" :class="WF_FIELD_INPUT" />
              </WfFormField>
            </template>
          </template>

          <template v-else>
            <WfFormField label="Config (JSON)">
              <textarea v-model="configJson" rows="4" class="w-full rounded-lg border primary_border_color bg_secondary_color px-xl py-xs font-mono label_3_regular primary_text_color outline-none focus:border-info-500" />
            </WfFormField>
          </template>

          <label class="flex cursor-pointer items-center gap-md label_3_regular secondary_text_color">
            <input v-model="isPrimary" type="checkbox" :class="WF_CHECKBOX" />
            Primary Channel
          </label>

          <div :class="WF_BTN_ROW">
            <button type="button" :class="WF_BTN_PRIMARY" :disabled="saving" @click="saveOutputDetails">
              {{ saving ? 'Saving…' : 'Save' }}
            </button>
            <button type="button" :class="WF_BTN_DANGER" :disabled="saving" @click="deleteOutputChannelStep">
              Remove
            </button>
          </div>
        </div>

        <!-- C. HITL CARD EDITOR -->
        <div v-else-if="data?.role === 'hitl'" :class="WF_TAB_PANEL">
          <WfHitlFormFields
            v-model="hitlForm"
            :saving="saving"
            :hitl-exists="hitlExists"
            @save="saveHitlDetails"
            @delete="removeHitlStep"
          />
        </div>
      </template>
    </div>
  </div>
</template>
