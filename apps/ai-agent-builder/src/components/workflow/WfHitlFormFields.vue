<template>
  <div v-if="loading" class="py-4 text-center body_3_regular secondary_text_color">
    Loading HITL config…
  </div>
  <template v-else>
    <label class="flex cursor-pointer items-center gap-md label_3_regular secondary_text_color">
      <input
        v-model="form.is_enabled"
        type="checkbox"
        :class="WF_CHECKBOX"
      />
      Enabled
    </label>

    <WfFormField label="Pause On">
      <SelectBox
        :model-value="form.pause_on"
        :options="pauseOnOptions"
        wrapper-class="w-full"
        :custom-class="WF_FIELD_SELECT"
        dropdown-class="w-full"
        @change="form.pause_on = $event.id"
      />
    </WfFormField>

    <WfFormField label="Contact Channel">
      <input
        v-model="form.contact_channel"
        type="text"
        placeholder="email"
        :class="WF_FIELD_INPUT"
      />
    </WfFormField>

    <WfFormField label="Message Template">
      <textarea
        v-model="form.message_template"
        rows="2"
        :class="WF_FIELD_INPUT"
      />
    </WfFormField>

    <WfFormField label="Timeout (Hours)">
      <input
        v-model.number="form.timeout_hours"
        type="number"
        min="1"
        :class="WF_FIELD_INPUT"
      />
    </WfFormField>

    <WfFormField label="On Timeout">
      <SelectBox
        :model-value="form.on_timeout"
        :options="onTimeoutOptions"
        wrapper-class="w-full"
        :custom-class="WF_FIELD_SELECT"
        dropdown-class="w-full"
        @change="form.on_timeout = $event.id"
      />
    </WfFormField>

    <WfFormField label="Owner Message">
      <input
        v-model="form.owner_message"
        type="text"
        :class="WF_FIELD_INPUT"
      />
    </WfFormField>

    <div :class="WF_BTN_ROW">
      <button
        type="button"
        :class="WF_BTN_PRIMARY"
        :disabled="saving"
        @click="$emit('save')"
      >
        {{ saving ? 'Saving…' : hitlExists ? 'Update' : 'Create' }}
      </button>
      <button
        v-if="hitlExists"
        type="button"
        :class="WF_BTN_DANGER"
        :disabled="saving"
        @click="$emit('delete')"
      >
        Delete
      </button>
    </div>
  </template>
</template>

<script setup>
import { SelectBox } from '@ai-suite/shared-ui'
import WfFormField from './WfFormField.vue'
import {
  WF_FIELD_INPUT,
  WF_FIELD_SELECT,
  WF_BTN_ROW,
  WF_BTN_PRIMARY,
  WF_BTN_DANGER,
  WF_CHECKBOX
} from './workflowFormStyles.js'

defineProps({
  loading: {
    type: Boolean,
    default: false
  },
  saving: {
    type: Boolean,
    default: false
  },
  hitlExists: {
    type: Boolean,
    default: false
  }
})

defineEmits(['save', 'delete'])

const form = defineModel({
  type: Object,
  required: true
})

const pauseOnOptions = [
  { id: 'failure', name: 'Failure' },
  { id: 'before_confidential', name: 'Before Confidential' },
  { id: 'both', name: 'Both' },
  { id: 'custom', name: 'Custom' }
]

const onTimeoutOptions = [
  { id: 'reject', name: 'Reject' },
  { id: 'approve', name: 'Approve' },
  { id: 'escalate', name: 'Escalate' }
]
</script>
