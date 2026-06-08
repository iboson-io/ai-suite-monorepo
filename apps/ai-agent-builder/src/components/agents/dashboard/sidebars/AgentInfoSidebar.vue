<template>
  <AgentDashboardSubSidebarShell title="Agent Info" :is-open="isOpen" @close="$emit('close')">
    <div class="space-y-5xl">
      <div>
        <label class="label_2_semibold primary_text_color">Agent name</label>
        <input
          v-model="form.name"
          type="text"
          placeholder="e.g., Refund Approval Agent"
          class="label_2_regular primary_text_color mt-md w-full rounded-xl border primary_border_color bg-white px-4xl py-3xl outline-none focus:border-info-500"
          :class="nameError ? 'border-error-200' : ''"
          @input="markDirty"
        />
        <p v-if="nameError" class="label_3_regular text-error-600 mt-sm">{{ nameError }}</p>
      </div>

      <div>
        <label class="label_2_semibold primary_text_color">Agent instruction (optional)</label>
        <div class="relative mt-md">
          <textarea
            v-model="form.prompt"
            rows="6"
            placeholder="Describe what your agent should do"
            class="label_2_regular primary_text_color w-full resize-none rounded-xl border primary_border_color bg-white px-4xl py-3xl pr-12xl outline-none focus:border-info-500"
            :class="promptError ? 'border-error-200' : ''"
            @input="markDirty"
          />
          <button
            type="button"
            class="absolute bottom-3xl right-3xl rounded-lg p-sm hover:bg-info-50 disabled:opacity-50"
            :disabled="isEnhancing || !form.prompt.trim()"
            aria-label="Improve prompt with AI"
            @click="handleEnhance"
          >
            <span class="label_3_semibold text-info-600">{{ isEnhancing ? '...' : 'AI' }}</span>
          </button>
        </div>
        <p v-if="promptError" class="label_3_regular text-error-600 mt-sm">{{ promptError }}</p>
        <p v-else-if="enhanceError" class="label_3_regular text-error-600 mt-sm">{{ enhanceError }}</p>
      </div>

      <div>
        <label class="label_2_semibold primary_text_color">Role (optional)</label>
        <input
          v-model="form.role"
          type="text"
          placeholder="e.g., Customer Support"
          class="label_2_regular primary_text_color mt-md w-full rounded-xl border primary_border_color bg-white px-4xl py-3xl outline-none focus:border-info-500"
          @input="markDirty"
        />
      </div>

      <div>
        <p class="label_2_semibold primary_text_color">Operational rules (optional)</p>
        <div class="mt-md space-y-md">
          <div v-for="(_, index) in form.rules" :key="index" class="flex gap-md">
            <input
              v-model="form.rules[index]"
              type="text"
              placeholder="One rule per line"
              class="label_2_regular primary_text_color flex-1 rounded-xl border primary_border_color bg-white px-4xl py-3xl outline-none focus:border-info-500"
              @input="markDirty"
            />
            <button
              type="button"
              class="label_3_medium text-error-600"
              @click="removeRule(index)"
            >
              Remove
            </button>
          </div>
        </div>
        <button type="button" class="label_3_semibold text-info-600 mt-md" @click="addRule">
          + Add rule
        </button>
      </div>

      <div>
        <label class="label_2_semibold primary_text_color">Language</label>
        <select
          v-model="form.language"
          class="label_2_regular primary_text_color mt-md w-full rounded-xl border primary_border_color bg-white px-4xl py-3xl outline-none focus:border-info-500"
          @change="markDirty"
        >
          <option value="english">English</option>
        </select>
      </div>
    </div>

    <template #footer>
      <p v-if="saveError" class="label_3_regular text-error-600 mb-md">{{ saveError }}</p>
      <p v-if="saveSuccess" class="label_3_regular text-success-600 mb-md">Changes saved.</p>
      <button
        type="button"
        class="primary_add_button w-full rounded-lg px-4xl py-md label_2_semibold primary_2_text_color disabled:opacity-50"
        :disabled="!isDirty || isSaving || !!nameError || !!promptError"
        @click="handleSave"
      >
        {{ isSaving ? 'Saving...' : 'Save Changes' }}
      </button>
    </template>
  </AgentDashboardSubSidebarShell>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue'
import AgentDashboardSubSidebarShell from '../AgentDashboardSubSidebarShell.vue'
import { enhanceAgentPrompt } from '../../../../services/agents/create.js'
import { updateAgentInfo } from '../../../../services/agents/update.js'
import {
  validateAgentName,
  validateAgentPromptOptional,
} from '../../../../services/agents/validation.js'

const props = defineProps({
  isOpen: { type: Boolean, default: false },
  agent: { type: Object, default: null },
})

const emit = defineEmits(['close', 'updated'])

const form = reactive({
  name: '',
  prompt: '',
  role: '',
  rules: [''],
  language: 'english',
})

const isDirty = ref(false)
const isSaving = ref(false)
const isEnhancing = ref(false)
const saveError = ref('')
const saveSuccess = ref(false)
const enhanceError = ref('')

const nameError = computed(() => {
  const validation = validateAgentName(form.name)
  return validation.valid ? '' : validation.message
})

const promptError = computed(() => {
  const validation = validateAgentPromptOptional(form.prompt)
  return validation.valid ? '' : validation.message
})

function resetForm(agent) {
  form.name = agent?.name ?? ''
  form.prompt = agent?.prompt ?? agent?.description ?? ''
  form.role = agent?.role ?? ''
  form.rules = agent?.rules?.length ? [...agent.rules] : ['']
  form.language = agent?.language ?? 'english'
  isDirty.value = false
  saveError.value = ''
  saveSuccess.value = false
  enhanceError.value = ''
}

watch(
  () => props.agent,
  (agent) => resetForm(agent),
  { immediate: true, deep: true }
)

function markDirty() {
  isDirty.value = true
  saveSuccess.value = false
}

function addRule() {
  form.rules.push('')
  markDirty()
}

function removeRule(index) {
  form.rules.splice(index, 1)
  if (form.rules.length === 0) form.rules.push('')
  markDirty()
}

async function handleEnhance() {
  enhanceError.value = ''
  isEnhancing.value = true

  try {
    const enhanced = await enhanceAgentPrompt(props.agent?.id ?? null, form.prompt)
    form.prompt = enhanced
    markDirty()
  } catch (error) {
    enhanceError.value = error?.message || 'Could not improve prompt.'
  } finally {
    isEnhancing.value = false
  }
}

async function handleSave() {
  if (!props.agent?.id || nameError.value || promptError.value) return

  isSaving.value = true
  saveError.value = ''
  saveSuccess.value = false

  try {
    const updated = await updateAgentInfo(props.agent.id, {
      name: form.name,
      prompt: form.prompt,
      role: form.role,
      rules: form.rules.filter((rule) => String(rule).trim()),
      language: form.language,
    })
    isDirty.value = false
    saveSuccess.value = true
    emit('updated', updated)
  } catch (error) {
    saveError.value = error?.message || 'Failed to save changes.'
  } finally {
    isSaving.value = false
  }
}
</script>
