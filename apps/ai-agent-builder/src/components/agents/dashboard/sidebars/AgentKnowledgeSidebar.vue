<template>
  <AgentDashboardSubSidebarShell
    :title="panelTitle"
    :is-open="isOpen"
    @close="$emit('close')"
  >
    <div class="min-h-0">
      <AgentKnowledgeConfiguration
        edit-mode
        :locked-tab="lockedKnowledgeTab"
        :active-tab="lockedKnowledgeTab"
        :existing-schema-files="existingSchemaFiles"
        :existing-document-files="existingDocumentFiles"
        :schema-files="schemaFiles"
        :document-files="documentFiles"
        :validation-field="validationField"
        :base-url="baseUrl"
        :access-token="accessToken"
        :show-access-token="showAccessToken"
        :db-config="dbConfig"
        :show-db-password="showDbPassword"
        :db-validation-errors="dbValidationErrors"
        :selected-composio-apps="selectedComposioApps"
        @add-documents="addDocumentFiles"
        @add-schemas="addSchemaFiles"
        @remove-document="removeDocumentFile"
        @remove-schema="removeSchemaFile"
        @update:base-url="baseUrl = $event"
        @update:access-token="accessToken = $event"
        @toggle-access-token="showAccessToken = !showAccessToken"
        @knowledge-validation-error="onKnowledgeValidationError"
        @update:db-config="dbConfig = $event"
        @toggle-db-password="showDbPassword = !showDbPassword"
        @validate-db-field="validateDbField"
        @update:selected-composio-apps="selectedComposioApps = $event"
        @delete-existing-file="handleDeleteFile"
      />
    </div>

    <template #footer>
      <p v-if="validationError || saveError" class="label_3_regular text-error-600 mb-md">
        {{ validationError || saveError }}
      </p>
      <p v-if="saveSuccess" class="label_3_regular text-success-600 mb-md">Knowledge saved.</p>
      <button
        type="button"
        class="primary_add_button w-full rounded-lg px-4xl py-md label_2_semibold primary_2_text_color disabled:opacity-50"
        :disabled="isSaving"
        @click="handleSave"
      >
        {{ isSaving ? 'Saving...' : 'Save Changes' }}
      </button>
    </template>
  </AgentDashboardSubSidebarShell>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import AgentDashboardSubSidebarShell from '../AgentDashboardSubSidebarShell.vue'
import AgentKnowledgeConfiguration from '../../knowledge/AgentKnowledgeConfiguration.vue'
import { KNOWLEDGE_TYPE_LABELS } from '../../../../services/agents/constants.js'
import { validateCreateKnowledgeStep } from '../../../../services/agents/knowledgeValidation.js'
import { validateDbConfig } from '../../../../services/agents/validation.js'
import { deleteAgentKnowledgeFile, updateAgentKnowledge } from '../../../../services/agents/update.js'

const props = defineProps({
  isOpen: { type: Boolean, default: false },
  agent: { type: Object, default: null },
})

const emit = defineEmits(['close', 'updated'])

const schemaFiles = ref([])
const documentFiles = ref([])
const baseUrl = ref('')
const accessToken = ref('')
const showAccessToken = ref(false)
const dbConfig = ref({
  type: '',
  host: '',
  port: '',
  database: '',
  username: '',
  password: '',
})
const showDbPassword = ref(false)
const dbValidationErrors = ref({})
const selectedComposioApps = ref([])
const validationField = ref('')
const validationError = ref('')
const saveError = ref('')
const saveSuccess = ref(false)
const isSaving = ref(false)
const deletingFileId = ref(null)

const lockedKnowledgeTab = computed(() => props.agent?.knowledgeTab ?? 'api')

const panelTitle = computed(() => {
  const type = props.agent?.agentType ?? lockedKnowledgeTab.value
  return KNOWLEDGE_TYPE_LABELS[type] ?? 'Agent Knowledge'
})

const existingSchemaFiles = computed(() =>
  lockedKnowledgeTab.value === 'api' ? (props.agent?.schemaFiles ?? []) : []
)

const existingDocumentFiles = computed(() =>
  lockedKnowledgeTab.value === 'documents' ? (props.agent?.documentFiles ?? []) : []
)

function resetFromAgent(agent) {
  schemaFiles.value = []
  documentFiles.value = []
  baseUrl.value = agent?.baseUrl ?? ''
  accessToken.value = agent?.accessToken ?? ''
  showAccessToken.value = false
  dbConfig.value = {
    type: agent?.dbConfig?.type ?? agent?.dbConfig?.db_type ?? '',
    host: agent?.dbConfig?.host ?? '',
    port: agent?.dbConfig?.port != null ? String(agent.dbConfig.port) : '',
    database: agent?.dbConfig?.database ?? '',
    username: agent?.dbConfig?.username ?? '',
    password: agent?.dbConfig?.password ?? '',
  }
  selectedComposioApps.value = [...(agent?.selectedComposioApps ?? [])]
  validationField.value = ''
  validationError.value = ''
  saveError.value = ''
  saveSuccess.value = false
}

watch(
  () => props.agent,
  (agent) => resetFromAgent(agent),
  { immediate: true, deep: true }
)

function addDocumentFiles(files) {
  documentFiles.value = [...documentFiles.value, ...files]
}

function addSchemaFiles(files) {
  schemaFiles.value = [...schemaFiles.value, ...files]
}

function removeDocumentFile(index) {
  documentFiles.value = documentFiles.value.filter((_, i) => i !== index)
}

function removeSchemaFile(index) {
  schemaFiles.value = schemaFiles.value.filter((_, i) => i !== index)
}

function onKnowledgeValidationError(payload) {
  if (typeof payload === 'string') {
    validationError.value = payload
    return
  }
  validationField.value = payload?.field ?? ''
  validationError.value = payload?.message ?? ''
}

function validateDbField(field) {
  const errors = validateDbConfig(dbConfig.value)
  dbValidationErrors.value = errors
  if (errors[field]) validationField.value = 'db'
}

async function handleDeleteFile(file) {
  const fileId = file.id || file.file_id
  if (!props.agent?.id || !fileId || deletingFileId.value) return

  deletingFileId.value = fileId
  saveError.value = ''

  const fileType = lockedKnowledgeTab.value === 'documents' ? 'document' : 'schema'

  try {
    await deleteAgentKnowledgeFile(props.agent.id, fileId, fileType)
    emit('updated')
  } catch (error) {
    saveError.value = error?.message || 'Failed to remove file.'
  } finally {
    deletingFileId.value = null
  }
}

async function handleSave() {
  if (!props.agent?.id) return

  const validation = validateCreateKnowledgeStep({
    knowledgeTab: lockedKnowledgeTab.value,
    schemaFiles: schemaFiles.value,
    documentFiles: documentFiles.value,
    baseUrl: baseUrl.value,
    accessToken: accessToken.value,
    dbConfig: dbConfig.value,
    selectedComposioApps: selectedComposioApps.value,
    existingSchemaCount: existingSchemaFiles.value.length,
    existingDocumentCount: existingDocumentFiles.value.length,
  })

  if (!validation.valid) {
    validationField.value = validation.field ?? ''
    validationError.value = validation.message ?? 'Please fix knowledge configuration.'
    return
  }

  isSaving.value = true
  saveError.value = ''
  saveSuccess.value = false
  validationError.value = ''
  validationField.value = ''

  try {
    const updated = await updateAgentKnowledge(props.agent.id, {
      knowledgeTab: lockedKnowledgeTab.value,
      schemaFiles: schemaFiles.value,
      documentFiles: documentFiles.value,
      baseUrl: baseUrl.value,
      accessToken: accessToken.value,
      dbConfig: dbConfig.value,
      selectedComposioApps: selectedComposioApps.value,
    })

    schemaFiles.value = []
    documentFiles.value = []
    saveSuccess.value = true
    emit('updated', updated)
  } catch (error) {
    saveError.value = error?.message || 'Failed to save knowledge.'
  } finally {
    isSaving.value = false
  }
}
</script>
