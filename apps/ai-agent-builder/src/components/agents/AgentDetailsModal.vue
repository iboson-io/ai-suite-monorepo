<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="fixed inset-0 z-[60] flex items-center justify-center bg_overlay p-6xl"
      @mousedown="handleOverlayMousedown"
      @click="handleOverlayClick"
    >
      <div
        role="dialog"
        aria-modal="true"
        :aria-labelledby="titleId"
        class="flex w-auto flex-col overflow-hidden rounded-2xl border primary_border_color bg_secondary_color shadow-2xl"
        :class="
          isCreateMode && createStep === 2
            ? 'h-[650px] max-h-[650px]'
            : 'max-h-[min(90vh,720px)] '
        "
        @click.stop
      >
        <div class="flex shrink-0 items-start justify-between gap-xl border-b primary_border_color px-6xl py-5xl">
          <div class="min-w-0 flex-1">
            <h2 :id="titleId" class="heading_h6_bold primary_text_color break-words">
              {{ modalTitle }}
            </h2>
            <p v-if="modalSubtitle" class="body_3_regular secondary_text_color mt-xs">
              {{ modalSubtitle }}
            </p>
          </div>
          <button
            type="button"
            class="shrink-0 rounded-lg bg-gray-25 p-xl transition-colors hover:bg-gray-50-hover disabled:cursor-not-allowed disabled:opacity-60"
            aria-label="Close"
            :disabled="isSubmitting"
            @click="$emit('close')"
          >
            <svg class="h-5 w-5" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path
                d="M11.4697 3.46973C11.7626 3.17685 12.2374 3.17684 12.5303 3.46973C12.8231 3.76262 12.8231 4.23741 12.5303 4.53027L9.06055 8L12.5303 11.4697C12.8231 11.7626 12.8231 12.2374 12.5303 12.5303C12.2374 12.8231 11.7626 12.8231 11.4697 12.5303L8 9.06055L4.53027 12.5303C4.23741 12.8231 3.76263 12.8231 3.46973 12.5303C3.17683 12.2374 3.17683 11.7626 3.46973 11.4697L6.93945 8L3.46973 4.53027C3.17683 4.23738 3.17683 3.76262 3.46973 3.46973C3.76262 3.17685 4.23739 3.17684 4.53027 3.46973L8 6.93945L11.4697 3.46973Z"
                fill="#1D2125"
              />
            </svg>
          </button>
        </div>

        <div
          class="min-h-0 flex-1 overflow-hidden"
          :class="isCreateMode && createStep === 2 ? 'flex flex-col px-6xl py-5xl' : 'overflow-y-auto px-6xl py-5xl'"
        >
          <div v-if="isViewMode && loading" class="flex justify-center py-10xl">
            <div class="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
          </div>

          <p
            v-else-if="errorMessage && !isCreateMode"
            class="label_2_regular text-red-600 text-center py-6xl"
          >
            {{ errorMessage }}
          </p>

          <p
            v-else-if="errorMessage && isCreateMode && createStep === 1"
            class="label_2_regular text-red-600 text-center py-6xl"
          >
            {{ errorMessage }}
          </p>

          <!-- Create step 2: Knowledge -->
          <AgentKnowledgeConfiguration
            v-else-if="isCreateMode && createStep === 2"
            class="min-h-0 flex-1"
            :active-tab="knowledgeTab"
            :schema-files="schemaFiles"
            :document-files="documentFiles"
            :validation-field="knowledgeValidationField"
            :base-url="baseUrl"
            :access-token="accessToken"
            :show-access-token="showAccessToken"
            :db-config="dbConfig"
            :show-db-password="showDbPassword"
            :db-validation-errors="dbValidationErrors"
            :selected-composio-apps="selectedComposioApps"
            :selected-merge-apps="selectedMergeApps"
            @update:active-tab="switchKnowledgeTab"
            @add-documents="addDocumentFiles"
            @add-schemas="addSchemaFiles"
            @remove-document="removeDocumentFile"
            @remove-schema="removeSchemaFile"
            @update:base-url="baseUrl = $event"
            @update:access-token="accessToken = $event"
            @toggle-access-token="showAccessToken = !showAccessToken"
            @knowledge-validation-error="setKnowledgeValidationError"
            @update:db-config="dbConfig = $event"
            @toggle-db-password="showDbPassword = !showDbPassword"
            @validate-db-field="validateDbField"
            @update:selected-composio-apps="selectedComposioApps = $event"
            @update:selected-merge-apps="selectedMergeApps = $event"
            @store-form-data-before-redirect="storeFormDataBeforeRedirect"
          />

          <p
            v-if="isCreateMode && createStep === 2 && (knowledgeValidationError || errorMessage)"
            class="label_2_regular text-error-600 mt-4xl shrink-0 text-center"
          >
            {{ knowledgeValidationError || errorMessage }}
          </p>

          <!-- Create step 1: Agent info -->
          <form
            v-else-if="isCreateMode && createStep === 1"
            class="flex flex-col"
            @submit.prevent="handleNextStep"
          >
            <div>
              <label :for="nameFieldId" class="label_2_semibold primary_text_color">
                Agent name
              </label>
              <input
                :id="nameFieldId"
                v-model="formName"
                type="text"
                placeholder="e.g., Email Classifier"
                class="label_2_regular primary_text_color mt-md w-full rounded-xl border bg-white px-4xl py-3xl outline-none transition-colors placeholder:text-gray-400 focus:border-info-500"
                :class="nameValidationError ? 'border-error-200 focus:border-error-400' : 'primary_border_color'"
                @blur="nameTouched = true"
              />
              <p v-if="nameValidationError" class="label_3_regular text-error-600 mt-sm">
                {{ nameValidationError }}
              </p>
            </div>

            <div class="mt-5xl">
              <label :for="promptFieldId" class="inline-flex items-center gap-sm label_2_semibold primary_text_color">
                Description (optional)
                <span
                  class="inline-flex h-[18px] w-[18px] items-center justify-center rounded-full border primary_border_color caption_1_medium secondary_text_color"
                  title="Describe the tasks, tone, and goals for this agent."
                  aria-label="Help"
                >?</span>
              </label>
              <div class="relative mt-md">
                <textarea
                  :id="promptFieldId"
                  v-model="formPrompt"
                  rows="5"
                  placeholder="Describe what your agent should do"
                  class="label_2_regular primary_text_color w-full resize-none rounded-xl border bg-white px-4xl py-3xl pr-12xl outline-none transition-colors placeholder:text-gray-400 focus:border-info-500"
                  :class="promptValidationError ? 'border-error-200 focus:border-error-400' : 'primary_border_color'"
                  @blur="promptTouched = true"
                />
                <div class="group/enhance absolute bottom-3xl right-3xl">
                  <button
                    type="button"
                    class="flex h-[28px] w-[28px] items-center justify-center rounded-lg transition-colors hover:bg-info-50 disabled:cursor-not-allowed disabled:opacity-50"
                    :disabled="!canEnhancePrompt || isEnhancing"
                    aria-label="Improve prompt with AI"
                    @click="handleEnhancePrompt"
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
                    stroke="url(#enhance-ai-sparkle-gradient)"
                    stroke-width="1.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <defs>
                    <linearGradient
                      id="enhance-ai-sparkle-gradient"
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
                <p v-if="enhanceError" class="label_3_regular text-error-600 mt-sm">
                  {{ enhanceError }}
                </p>
              </div>
              <p v-if="promptValidationError" class="label_3_regular text-error-600 mt-sm">
                {{ promptValidationError }}
              </p>
            </div>

            <div class="mt-5xl">
              <label :for="roleFieldId" class="label_2_semibold primary_text_color">
                Role (optional)
              </label>
              <input
                :id="roleFieldId"
                v-model="formRole"
                type="text"
                placeholder="e.g., Customer Support – friendly, accurate, escalation-aware"
                class="label_2_regular primary_text_color mt-md w-full rounded-xl border bg-white px-4xl py-3xl outline-none transition-colors placeholder:text-gray-400 focus:border-info-500"
                :class="roleValidationError ? 'border-error-200 focus:border-error-400' : 'primary_border_color'"
                @blur="roleTouched = true"
              />
              <p v-if="roleValidationError" class="label_3_regular text-error-600 mt-sm">
                {{ roleValidationError }}
              </p>
              <p class="caption_1_regular tertiary_text_color mt-md">
                Summarize who the agent should act as; helps when users do not write detailed prompts.
              </p>
            </div>

            <div class="mt-5xl">
              <p class="label_2_semibold primary_text_color">Operational rules (optional)</p>

              <div
                v-for="(rule, index) in formRules"
                :key="`rule-${index}`"
                class="mt-md"
              >
                <div class="flex items-center gap-md">
                  <input
                    v-model="formRules[index]"
                    type="text"
                    :maxlength="RULE_MAX_LENGTH"
                    placeholder="e.g., Never share full credit card numbers"
                    class="label_2_regular primary_text_color min-w-0 flex-1 rounded-xl border bg-white px-4xl py-3xl outline-none transition-colors placeholder:text-gray-400 focus:border-info-500"
                    :class="getRuleError(index) ? 'border-error-200 focus:border-error-400' : 'primary_border_color'"
                    @blur="rulesTouched = true"
                  />
                  <button
                    v-if="formRules.length > 1"
                    type="button"
                    class="shrink-0 label_2_medium text-error-600 hover:underline"
                    @click="removeRule(index)"
                  >
                    Remove
                  </button>
                </div>
                <p v-if="getRuleError(index)" class="label_3_regular text-error-600 mt-sm">
                  {{ getRuleError(index) }}
                </p>
              </div>

              <button
                type="button"
                class="mt-md label_2_bold primary_text_color transition-opacity hover:opacity-80"
                @click="addRule"
              >
                + Add rule
              </button>

              <p v-if="rulesArrayValidationError" class="label_3_regular text-error-600 mt-sm">
                {{ rulesArrayValidationError }}
              </p>

              <p class="caption_1_regular tertiary_text_color mt-md">
                Short do's and don'ts; each line is one rule (max 1000 characters each).
              </p>
            </div>
          </form>

          <!-- View agent details -->
          <template v-else-if="isViewMode">
            <div>
              <p class="label_2_semibold primary_text_color">Agent name</p>
              <p
                class="body_3_regular primary_text_color mt-md break-words rounded-xl border primary_border_color bg-white px-4xl py-3xl"
              >
                {{ displayName }}
              </p>
            </div>

            <div class="mt-5xl">
              <p class="label_2_semibold primary_text_color">Description</p>
              <p
                class="body_3_regular secondary_text_color mt-md whitespace-pre-wrap break-words rounded-xl border primary_border_color bg-white px-4xl py-3xl"
              >
                {{ displayDescription }}
              </p>
            </div>

            <div class="mt-5xl">
              <p class="label_2_semibold primary_text_color">Role (optional)</p>
              <p
                class="body_3_regular mt-md break-words rounded-xl border primary_border_color bg-white px-4xl py-3xl"
                :class="displayRole ? 'primary_text_color' : 'secondary_text_color'"
              >
                {{ displayRole || 'Not set' }}
              </p>
              <p class="caption_1_regular tertiary_text_color mt-md">
                Summarize who the agent should act as; helps when users do not write detailed prompts.
              </p>
            </div>

            <div class="mt-5xl">
              <p class="label_2_semibold primary_text_color">Operational rules (optional)</p>

              <ul v-if="displayRules.length > 0" class="mt-md flex flex-col gap-md">
                <li
                  v-for="(rule, index) in displayRules"
                  :key="`${index}-${rule}`"
                  class="body_3_regular primary_text_color break-words rounded-xl border primary_border_color bg-white px-4xl py-3xl"
                >
                  {{ rule }}
                </li>
              </ul>
              <p
                v-else
                class="body_3_regular secondary_text_color mt-md rounded-xl border primary_border_color bg-white px-4xl py-3xl"
              >
                Not set
              </p>

              <p class="caption_1_regular tertiary_text_color mt-md">
                Short do's and don'ts; each line is one rule (max 1000 characters each).
              </p>
            </div>
          </template>
        </div>

        <div
          v-if="isCreateMode && !loading"
          class="shrink-0 border-t primary_border_color px-6xl py-5xl"
        >
          <div v-if="createStep === 1" class="flex justify-end">
            <button
              type="button"
              class="primary_add_button inline-flex items-center justify-center gap-md rounded-lg px-5xl py-md label_2_semibold primary_2_text_color disabled:cursor-not-allowed disabled:opacity-60"
              :disabled="isSubmitting"
              @click="handleNextStep"
            >
              Next Step
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          <div v-else class="flex w-full items-center">
            <button
              type="button"
              class="shrink-0 rounded-lg bg-gray-25 px-5xl py-md label_2_semibold primary_text_color transition-colors hover:bg-gray-50-hover disabled:cursor-not-allowed disabled:opacity-60"
              :disabled="isSubmitting"
              @click="handleBackStep"
            >
              Back
            </button>
            <button
              type="button"
              class="primary_add_button ml-auto inline-flex shrink-0 items-center gap-md rounded-lg px-5xl py-md label_2_semibold primary_2_text_color disabled:cursor-not-allowed disabled:opacity-60"
              :disabled="isSubmitting"
              @click="handleCreateSubmit"
            >
              {{ isSubmitting ? 'Creating...' : 'Create agent' }}
              <svg
                v-if="!isSubmitting"
                class="h-4 w-4 shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import AgentKnowledgeConfiguration from './knowledge/AgentKnowledgeConfiguration.vue'
import {
  enhanceAgentPrompt,
  formatLastUpdated,
  getStatusLabel,
  validateAgentName,
  validateAgentPromptOptional,
  validateAgentPromptForEnhance,
  validateAgentRoleOptional,
  validateAgentRulesOptional,
  validateSingleRule,
  validateCreateKnowledgeStep,
  validateDbConfig,
  validateApiSchemaFiles,
  validateDocumentFiles,
} from '../../services/agents/agents.js'

const CREATE_FORM_STORAGE_KEY = 'agent_creation_form_data'

const emptyDbConfig = () => ({
  type: '',
  host: '',
  port: '',
  database: '',
  username: '',
  password: '',
})

const RULE_MAX_LENGTH = 1000

const props = defineProps({
  open: {
    type: Boolean,
    default: false,
  },
  mode: {
    type: String,
    default: 'view',
    validator: (value) => ['view', 'create'].includes(value),
  },
  loading: {
    type: Boolean,
    default: false,
  },
  submitting: {
    type: Boolean,
    default: false,
  },
  errorMessage: {
    type: String,
    default: '',
  },
  agent: {
    type: Object,
    default: null,
  },
  fallbackAgent: {
    type: Object,
    default: null,
  },
  agentId: {
    type: [String, Number],
    default: null,
  },
})

const emit = defineEmits(['close', 'create', 'clear-error'])

const titleId = 'agent-details-modal-title'
const nameFieldId = 'agent-create-name'
const promptFieldId = 'agent-create-prompt'
const roleFieldId = 'agent-create-role'

const formName = ref('')
const formPrompt = ref('')
const formRole = ref('')
const formRules = ref([''])
const isEnhancing = ref(false)
const enhanceError = ref('')
const nameTouched = ref(false)
const promptTouched = ref(false)
const roleTouched = ref(false)
const rulesTouched = ref(false)
const createStep = ref(1)
const knowledgeTab = ref('documents')
const documentFiles = ref([])
const schemaFiles = ref([])
const knowledgeValidationError = ref('')
const knowledgeValidationField = ref('')
const baseUrl = ref('')
const accessToken = ref('')
const showAccessToken = ref(false)
const dbConfig = ref(emptyDbConfig())
const showDbPassword = ref(false)
const dbValidationErrors = ref({})
const selectedComposioApps = ref([])
const selectedMergeApps = ref([])

const isViewMode = computed(() => props.mode === 'view')
const isCreateMode = computed(() => props.mode === 'create')
const isSubmitting = computed(() => props.submitting)

const modalTitle = computed(() => {
  if (isCreateMode.value && createStep.value === 2) return 'Add Knowledge to Your Agent'
  if (isCreateMode.value) return 'Create agent'
  return props.agent?.name ?? props.fallbackAgent?.name ?? 'Agent details'
})

const modalSubtitle = computed(() => {
  if (isCreateMode.value && createStep.value === 2) {
    return 'Provide documents, websites, or data sources so the agent can learn and respond correctly.'
  }
  if (isCreateMode.value) return 'Describe what your agent should do'

  const status = props.agent?.status ?? props.fallbackAgent?.status
  const updatedAt = props.agent?.updatedAt ?? props.fallbackAgent?.updatedAt
  const parts = []

  if (status) {
    parts.push(getStatusLabel(status))
  }

  const updatedLabel = formatLastUpdated(updatedAt)
  if (updatedLabel) {
    parts.push(updatedLabel.replace(/^Last updated: /, ''))
  }

  return parts.length > 0 ? parts.join(' · ') : ''
})

const displayName = computed(
  () => props.agent?.name ?? props.fallbackAgent?.name ?? 'Untitled Agent'
)

const displayDescription = computed(() => {
  const value = props.agent?.description ?? props.fallbackAgent?.description
  return value?.trim() ? value : 'Description not available'
})

const displayRole = computed(() => props.agent?.role?.trim() ?? '')

const displayRules = computed(() => {
  const rules = props.agent?.rules
  return Array.isArray(rules) ? rules : []
})

const nameValidationError = computed(() => {
  if (!nameTouched.value) return ''
  return validateAgentName(formName.value).message
})

const promptValidationError = computed(() => {
  if (!promptTouched.value) return ''
  return validateAgentPromptOptional(formPrompt.value).message
})

const roleValidationError = computed(() => {
  if (!roleTouched.value) return ''
  return validateAgentRoleOptional(formRole.value).message
})

const rulesArrayValidationError = computed(() => {
  if (!rulesTouched.value) return ''
  const result = validateAgentRulesOptional(formRules.value)
  if (!result.valid && result.index === undefined) {
    return result.message
  }
  return ''
})

function getRuleError(index) {
  if (!rulesTouched.value) return ''
  const rule = formRules.value[index]
  return validateSingleRule(rule).message
}

const canEnhancePrompt = computed(
  () =>
    validateAgentPromptForEnhance(formPrompt.value).valid &&
    !isSubmitting.value &&
    !isEnhancing.value
)

const canProceedToNextStep = computed(
  () =>
    validateAgentName(formName.value).valid &&
    validateAgentPromptOptional(formPrompt.value).valid &&
    validateAgentRoleOptional(formRole.value).valid &&
    validateAgentRulesOptional(formRules.value).valid &&
    !isSubmitting.value
)

function clearKnowledgeValidation() {
  knowledgeValidationError.value = ''
  knowledgeValidationField.value = ''
}

function setKnowledgeValidationError({ message, field }) {
  knowledgeValidationError.value = message
  knowledgeValidationField.value = field || ''
}

async function addDocumentFiles(files) {
  const { validFiles, errors } = validateDocumentFiles(files)
  if (errors.length) {
    setKnowledgeValidationError({ message: errors.join('\n'), field: 'documents' })
    return
  }
  documentFiles.value = [...documentFiles.value, ...validFiles]
  if (knowledgeValidationField.value === 'documents') {
    clearKnowledgeValidation()
  }
}

async function addSchemaFiles(files) {
  const { validFiles, errors } = await validateApiSchemaFiles(files)
  if (errors.length) {
    setKnowledgeValidationError({ message: errors.join('\n'), field: 'schema' })
    return
  }
  schemaFiles.value = [...schemaFiles.value, ...validFiles]
  if (knowledgeValidationField.value === 'schema') {
    clearKnowledgeValidation()
  }
}

function switchKnowledgeTab(tabId) {
  knowledgeTab.value = tabId
  clearKnowledgeValidation()
  dbValidationErrors.value = {}
  emit('clear-error')
}

function validateDbField(fieldName) {
  const result = validateDbConfig(dbConfig.value)
  dbValidationErrors.value = result.errors
  if (fieldName && result.errors[fieldName]) {
    dbValidationErrors.value = { [fieldName]: result.errors[fieldName] }
  }
}

function storeFormDataBeforeRedirect() {
  const formData = {
    formName: formName.value,
    formPrompt: formPrompt.value,
    formRole: formRole.value,
    formRules: [...formRules.value],
    createStep: createStep.value,
    knowledgeTab: knowledgeTab.value,
    baseUrl: baseUrl.value,
    accessToken: accessToken.value,
    dbConfig: { ...dbConfig.value },
    selectedComposioApps: [...selectedComposioApps.value],
    selectedMergeApps: [...selectedMergeApps.value],
    timestamp: Date.now(),
  }
  sessionStorage.setItem(CREATE_FORM_STORAGE_KEY, JSON.stringify(formData))
}

function restoreFormDataFromStorage() {
  try {
    const stored = sessionStorage.getItem(CREATE_FORM_STORAGE_KEY)
    if (!stored) return false

    const formData = JSON.parse(stored)
    const maxAge = 60 * 60 * 1000
    if (Date.now() - formData.timestamp >= maxAge) {
      sessionStorage.removeItem(CREATE_FORM_STORAGE_KEY)
      return false
    }

    formName.value = formData.formName ?? ''
    formPrompt.value = formData.formPrompt ?? ''
    formRole.value = formData.formRole ?? ''
    formRules.value = Array.isArray(formData.formRules) ? [...formData.formRules] : ['']
    createStep.value = formData.createStep ?? 2
    knowledgeTab.value = formData.knowledgeTab ?? 'composio'
    baseUrl.value = formData.baseUrl ?? ''
    accessToken.value = formData.accessToken ?? ''
    dbConfig.value = formData.dbConfig ?? emptyDbConfig()
    selectedComposioApps.value = formData.selectedComposioApps ?? []
    selectedMergeApps.value = formData.selectedMergeApps ?? []
    schemaFiles.value = []
    documentFiles.value = []
    sessionStorage.removeItem(CREATE_FORM_STORAGE_KEY)
    return true
  } catch {
    sessionStorage.removeItem(CREATE_FORM_STORAGE_KEY)
    return false
  }
}

function removeDocumentFile(index) {
  documentFiles.value = documentFiles.value.filter((_, i) => i !== index)
}

function removeSchemaFile(index) {
  schemaFiles.value = schemaFiles.value.filter((_, i) => i !== index)
}

function handleNextStep() {
  nameTouched.value = true
  promptTouched.value = true
  roleTouched.value = true
  rulesTouched.value = true

  const nameVal = validateAgentName(formName.value)
  const promptVal = validateAgentPromptOptional(formPrompt.value)
  const roleVal = validateAgentRoleOptional(formRole.value)
  const rulesVal = validateAgentRulesOptional(formRules.value)

  if (!nameVal.valid || !promptVal.valid || !roleVal.valid || !rulesVal.valid || isSubmitting.value) {
    return
  }

  createStep.value = 2
  clearKnowledgeValidation()
}

function handleBackStep() {
  if (isSubmitting.value) return
  createStep.value = 1
  clearKnowledgeValidation()
}

async function handleEnhancePrompt() {
  const prompt = formPrompt.value.trim()
  const validation = validateAgentPromptForEnhance(prompt)

  if (!validation.valid || isEnhancing.value || isSubmitting.value) {
    if (!validation.valid) {
      enhanceError.value = validation.message
    }
    return
  }

  isEnhancing.value = true
  enhanceError.value = ''

  try {
    const enhanced = await enhanceAgentPrompt(props.agentId, prompt)
    formPrompt.value = enhanced
  } catch (error) {
    enhanceError.value =
      error?.message || 'Failed to improve prompt. Please try again.'
  } finally {
    isEnhancing.value = false
  }
}

function resetCreateForm() {
  formName.value = ''
  formPrompt.value = ''
  formRole.value = ''
  formRules.value = ['']
  enhanceError.value = ''
  isEnhancing.value = false
  nameTouched.value = false
  promptTouched.value = false
  roleTouched.value = false
  rulesTouched.value = false
  createStep.value = 1
  knowledgeTab.value = 'documents'
  documentFiles.value = []
  schemaFiles.value = []
  clearKnowledgeValidation()
  baseUrl.value = ''
  accessToken.value = ''
  showAccessToken.value = false
  dbConfig.value = emptyDbConfig()
  showDbPassword.value = false
  dbValidationErrors.value = {}
  selectedComposioApps.value = []
  selectedMergeApps.value = []
  sessionStorage.removeItem(CREATE_FORM_STORAGE_KEY)
}

function addRule() {
  formRules.value.push('')
}

function removeRule(index) {
  if (formRules.value.length <= 1) {
    formRules.value[0] = ''
    return
  }
  formRules.value.splice(index, 1)
}

const mousedownOnOverlay = ref(false)

function handleOverlayMousedown(e) {
  mousedownOnOverlay.value = e.target === e.currentTarget
}

function handleOverlayClick(e) {
  if (e.target !== e.currentTarget) return
  if (!mousedownOnOverlay.value) return
  if (isSubmitting.value) return
  emit('close')
}

function handleCreateSubmit() {
  if (isSubmitting.value) return

  emit('clear-error')
  clearKnowledgeValidation()

  const knowledgeResult = validateCreateKnowledgeStep({
    knowledgeTab: knowledgeTab.value,
    schemaFiles: schemaFiles.value,
    documentFiles: documentFiles.value,
    baseUrl: baseUrl.value,
    dbConfig: dbConfig.value,
    selectedComposioApps: selectedComposioApps.value,
    selectedMergeApps: selectedMergeApps.value,
  })

  if (!knowledgeResult.valid) {
    setKnowledgeValidationError({
      message: knowledgeResult.message,
      field: knowledgeResult.field || '',
    })
    if (knowledgeResult.field === 'db' && knowledgeResult.errors) {
      dbValidationErrors.value = knowledgeResult.errors
    }
    return
  }

  emit('create', {
    name: formName.value.trim(),
    prompt: formPrompt.value.trim(),
    role: formRole.value.trim(),
    rules: formRules.value.map((rule) => rule.trim()).filter(Boolean),
    knowledgeTab: knowledgeTab.value,
    schemaFiles: [...schemaFiles.value],
    documentFiles: [...documentFiles.value],
    baseUrl: baseUrl.value.trim(),
    accessToken: accessToken.value.trim(),
    dbConfig: { ...dbConfig.value },
    selectedComposioApps: [...selectedComposioApps.value],
    selectedMergeApps: [...selectedMergeApps.value],
  })
}

watch(baseUrl, () => {
  if (knowledgeValidationField.value === 'baseUrl') {
    clearKnowledgeValidation()
  }
})

watch(documentFiles, () => {
  if (knowledgeValidationField.value === 'documents') {
    clearKnowledgeValidation()
  }
})

watch(schemaFiles, () => {
  if (knowledgeValidationField.value === 'schema') {
    clearKnowledgeValidation()
  }
})

watch(dbConfig, () => {
  if (knowledgeValidationField.value === 'db') {
    clearKnowledgeValidation()
    dbValidationErrors.value = {}
  }
}, { deep: true })

watch(selectedComposioApps, () => {
  if (knowledgeValidationField.value === 'composio') {
    clearKnowledgeValidation()
  }
}, { deep: true })

watch(selectedMergeApps, () => {
  if (knowledgeValidationField.value === 'mcp') {
    clearKnowledgeValidation()
  }
}, { deep: true })

watch(formPrompt, () => {
  if (enhanceError.value) {
    enhanceError.value = ''
  }
})

watch(
  () => [props.open, props.mode],
  ([isOpen, mode]) => {
    if (!isOpen || mode !== 'create') return

    const restored = restoreFormDataFromStorage()
    if (!restored) {
      resetCreateForm()
    }
  }
)

onMounted(() => {
  if (props.open && props.mode === 'create') {
    restoreFormDataFromStorage()
  }
})
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
