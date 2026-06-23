<template>
  <AgentDashboardSubSidebarShell
    title="Agent Info"
    tooltip-text="Configure basic information, core instructions, and language for this agent."
    :is-open="isOpen"
    @close="$emit('close')"
  >
    <div class="space-y-5xl">
      <div>
        <label class="label_2_semibold primary_text_color">Agent name</label>
        <input
          v-model="form.name"
          type="text"
          placeholder="e.g., Refund Approval Agent"
          class="label_2_regular primary_text_color mt-md w-full rounded-xl border bg-white px-4xl py-3xl outline-none focus:border-info-500"
          :class="nameError ? 'border-error-200 focus:border-error-400' : 'primary_border_color'"
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
            class="label_2_regular primary_text_color w-full resize-none rounded-xl border bg-white px-4xl py-3xl pr-12xl outline-none focus:border-info-500"
            :class="promptError ? 'border-error-200 focus:border-error-400' : 'primary_border_color'"
            @input="markDirty"
          />
          <div class="group/enhance absolute bottom-3xl right-3xl">
            <button
              type="button"
              class="flex h-[28px] w-[28px] items-center justify-center rounded-lg transition-colors hover:bg-info-50 disabled:cursor-not-allowed disabled:opacity-50"
              :disabled="isEnhancing || !form.prompt.trim()"
              aria-label="Improve prompt with AI"
              @click="handleEnhance"
            >
              <div
                v-if="isEnhancing"
                class="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-info-600"
              />
              <svg
                v-else
                class="enhance-ai-icon h-[22px] w-[22px]"
                :class="{ 'enhance-ai-icon--busy': isEnhancing }"
                width="22"
                height="22"
                viewBox="0 0 22 22"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  d="M15.732 17.8929C16.3433 17.8929 16.9296 18.1509 17.3618 18.6101C17.7941 19.0694 18.0369 19.6923 18.0369 20.3418C18.0369 19.6923 18.2798 19.0694 18.712 18.6101C19.1443 18.1509 19.7305 17.8929 20.3418 17.8929C19.7305 17.8929 19.1443 17.6348 18.712 17.1756C18.2798 16.7163 18.0369 16.0934 18.0369 15.4439C18.0369 16.0934 17.7941 16.7163 17.3618 17.1756C16.9296 17.6348 16.3433 17.8929 15.732 17.8929ZM15.732 3.19898C16.3433 3.19898 16.9296 3.457 17.3618 3.91627C17.7941 4.37554 18.0369 4.99845 18.0369 5.64796C18.0369 4.99845 18.2798 4.37554 18.712 3.91627C19.1443 3.457 19.7305 3.19898 20.3418 3.19898C19.7305 3.19898 19.1443 2.94096 18.712 2.48169C18.2798 2.02242 18.0369 1.39951 18.0369 0.75C18.0369 1.39951 17.7941 2.02242 17.3618 2.48169C16.9296 2.94096 16.3433 3.19898 15.732 3.19898ZM7.66477 17.8929C7.66477 15.9443 8.39328 14.0756 9.69005 12.6978C10.9868 11.32 12.7456 10.5459 14.5795 10.5459C12.7456 10.5459 10.9868 9.77187 9.69005 8.39405C8.39328 7.01623 7.66477 5.14751 7.66477 3.19898C7.66477 5.14751 6.93625 7.01623 5.63948 8.39405C4.34271 9.77187 2.58391 10.5459 0.75 10.5459C2.58391 10.5459 4.34271 11.32 5.63948 12.6978C6.93625 14.0756 7.66477 15.9443 7.66477 17.8929Z"
                  stroke="url(#enhance-ai-sparkle-gradient-sidebar)"
                  stroke-width="1.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <defs>
                  <linearGradient
                    id="enhance-ai-sparkle-gradient-sidebar"
                    x1="1.7175"
                    y1="4.20738"
                    x2="18.0862"
                    y2="15.6158"
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop offset="0%" stop-color="#9966FF">
                      <animate
                        attributeName="stop-color"
                        values="#9966FF;#0073E6;#FAB000;#15BE53;#9966FF"
                        dur="3s"
                        repeatCount="indefinite"
                      />
                    </stop>
                    <stop offset="35%" stop-color="#0073E6">
                      <animate
                        attributeName="stop-color"
                        values="#0073E6;#FAB000;#15BE53;#9966FF;#0073E6"
                        dur="3s"
                        repeatCount="indefinite"
                      />
                    </stop>
                    <stop offset="65%" stop-color="#FAB000">
                      <animate
                        attributeName="stop-color"
                        values="#FAB000;#15BE53;#9966FF;#0073E6;#FAB000"
                        dur="3s"
                        repeatCount="indefinite"
                      />
                    </stop>
                    <stop offset="100%" stop-color="#15BE53">
                      <animate
                        attributeName="stop-color"
                        values="#15BE53;#9966FF;#0073E6;#FAB000;#15BE53"
                        dur="3s"
                        repeatCount="indefinite"
                      />
                    </stop>
                    <animateTransform
                      attributeName="gradientTransform"
                      type="rotate"
                      from="0 10.5 10.5"
                      to="360 10.5 10.5"
                      dur="6s"
                      repeatCount="indefinite"
                    />
                  </linearGradient>
                </defs>
              </svg>
            </button>
            <span
              role="tooltip"
              class="pointer-events-none absolute bottom-full right-0 z-10 mb-sm hidden whitespace-nowrap rounded-lg bg-black-400 px-md py-xs caption_1_medium primary_2_text_color shadow-md group-hover/enhance:block group-focus-within/enhance:block"
            >
              Improve prompt with AI
            </span>
          </div>
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
          class="label_2_regular primary_text_color mt-md w-full rounded-xl border bg-white px-4xl py-3xl outline-none focus:border-info-500"
          :class="roleError ? 'border-error-200 focus:border-error-400' : 'primary_border_color'"
          @input="markDirty"
        />
        <p v-if="roleError" class="label_3_regular text-error-600 mt-sm">{{ roleError }}</p>
      </div>

      <div>
        <p class="label_2_semibold primary_text_color">Operational rules (optional)</p>
        <div class="mt-md space-y-md">
          <div v-for="(_, index) in form.rules" :key="index">
            <div class="flex gap-md">
              <input
                v-model="form.rules[index]"
                type="text"
                placeholder="One rule per line"
                class="label_2_regular primary_text_color flex-1 rounded-xl border bg-white px-4xl py-3xl outline-none focus:border-info-500"
                :class="getRuleError(index) ? 'border-error-200 focus:border-error-400' : 'primary_border_color'"
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
            <p v-if="getRuleError(index)" class="label_3_regular text-error-600 mt-sm">{{ getRuleError(index) }}</p>
          </div>
        </div>
        <button type="button" class="label_3_semibold text-info-600 mt-md" @click="addRule">
          + Add rule
        </button>
        <p v-if="rulesArrayError" class="label_3_regular text-error-600 mt-sm">{{ rulesArrayError }}</p>
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
        :disabled="!isDirty || isSaving || !!nameError || !!promptError || !!roleError || hasRulesError"
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
  validateAgentRoleOptional,
  validateAgentRulesOptional,
  validateSingleRule,
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

const roleError = computed(() => {
  const validation = validateAgentRoleOptional(form.role)
  return validation.valid ? '' : validation.message
})

const rulesArrayError = computed(() => {
  const validation = validateAgentRulesOptional(form.rules)
  if (!validation.valid && validation.index === undefined) {
    return validation.message
  }
  return ''
})

const hasRulesError = computed(() => {
  if (rulesArrayError.value) return true
  return form.rules.some((rule) => !validateSingleRule(rule).valid)
})

function getRuleError(index) {
  const rule = form.rules[index]
  const validation = validateSingleRule(rule)
  return validation.valid ? '' : validation.message
}

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
  if (!props.agent?.id || nameError.value || promptError.value || roleError.value || hasRulesError.value) return

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

<style scoped>
.enhance-ai-icon {
  animation: enhance-ai-glitter 2.4s ease-in-out infinite;
  transform-origin: center;
}

.enhance-ai-icon--busy {
  animation: enhance-ai-glitter 0.8s ease-in-out infinite;
  opacity: 0.7;
}

@keyframes enhance-ai-glitter {
  0%,
  100% {
    filter: drop-shadow(0 0 2px rgba(153, 102, 255, 0.55));
    opacity: 0.92;
    transform: scale(1);
  }
  25% {
    filter: drop-shadow(0 0 4px rgba(0, 115, 230, 0.75));
    opacity: 1;
    transform: scale(1.06);
  }
  50% {
    filter: drop-shadow(0 0 5px rgba(250, 176, 0, 0.85));
    opacity: 1;
    transform: scale(1);
  }
  75% {
    filter: drop-shadow(0 0 4px rgba(21, 190, 83, 0.75));
    opacity: 1;
    transform: scale(1.06);
  }
}
</style>
