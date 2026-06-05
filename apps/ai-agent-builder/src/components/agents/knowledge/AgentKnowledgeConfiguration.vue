<template>
  <div class="flex min-h-0 min-w-0 flex-1 gap-5xl overflow-hidden">
    <nav
      class="flex w-[263px] shrink-0 flex-col gap-xs rounded-2xl border primary_border_color bg-white p-md"
    >
      <button
        v-for="tab in sidebarTabs"
        :key="tab.id"
        type="button"
        class="flex items-center gap-md rounded-xl px-3xl py-xl text-left label_2_medium transition-colors"
        :class="
          activeTab === tab.id
            ? 'bg-gray-25 primary_text_color'
            : 'secondary_text_color hover:bg-gray-25 hover:primary_text_color'
        "
        @click="$emit('update:active-tab', tab.id)"
      >
        <img
          v-if="typeof tab.icon === 'string'"
          :src="tab.icon"
          alt=""
          class="h-[18px] w-[18px] shrink-0"
          aria-hidden="true"
        />
        <component v-else :is="tab.icon" class="h-[18px] w-[18px] shrink-0" />
        <span>{{ tab.label }}</span>
      </button>
    </nav>

    <div class="flex min-h-0 w-[820px] shrink-0 flex-col overflow-hidden">
      <!-- Documents -->
      <template v-if="activeTab === 'documents'">
        <div class="flex min-h-0 h-full w-[820px] flex-1 overflow-hidden gap-2">
          <div
            class="flex h-full flex-col"
            :class="showFilePartition ? 'min-w-0 flex-1' : 'w-[820px] shrink-0'"
          >
            <input
              ref="documentInputRef"
              type="file"
              class="hidden"
              multiple
              accept=".pdf,.png,.jpg,.jpeg,application/pdf,image/png,image/jpeg"
              @change="onDocumentInputChange"
            />
            <div
              class="flex h-full min-h-0 w-full flex-1 cursor-pointer flex-col rounded-2xl border-2 border-dashed primary_border_color bg-white px-6xl py-5xl text-center transition-colors hover:border-info-200 hover:bg-info-50"
              @click="triggerDocumentUpload"
              @dragover.prevent
              @drop.prevent="onDocumentDrop"
            >
              <div class="flex flex-1 flex-col items-center justify-center">
                <div
                  class="flex h-12 w-12 items-center justify-center rounded-full bg-gray-25"
                  aria-hidden="true"
                >
                  <img :src="UploadIcon" alt="" class="h-6 w-6" />
                </div>
                <p class="label_2_regular secondary_text_color mt-4xl">
                  Drag &amp; drop your files here or
                  <span class="label_2_semibold primary_text_color">browse</span>
                  to upload
                </p>
              </div>
              <p class="body_4_medium tertiary_text_color shrink-0">
                Accepted formats - .pdf, .png, .jpg, .jpeg | Max file size - 5MB
              </p>
            </div>
            <p
              v-if="localDocumentValidationError || documentValidationError"
              class="caption_1_regular text-error-600 mt-md whitespace-pre-line label_3_regular"
            >
              {{ localDocumentValidationError || documentValidationError }}
            </p>
          </div>

          <aside
            v-if="documentUploadItems.length"
            class="custom_scrollbar flex h-full w-[398px] shrink-0 flex-col gap-sm overflow-y-auto   pl-4xl"
          >
            <KnowledgeUploadedFileCard
              v-for="item in documentUploadItems"
              :key="item.id"
              compact
              :item="item"
              @cancel="documentUpload.cancelUpload(item)"
              @remove="removeDocumentUploadItem(item)"
            />
          </aside>
        </div>
      </template>

      <!-- API Schema -->
      <template v-else-if="activeTab === 'api'">
        <div class="flex min-h-0 flex-1 flex-col overflow-hidden">
          <div class="mb-4xl flex shrink-0 gap-md">
            <button
              v-for="section in apiSchemaSections"
              :key="section.id"
              type="button"
              class="flex flex-1 flex-col rounded-xl border bg-white p-4xl text-left transition-colors"
              :class="
                apiSchemaSection === section.id
                  ? 'border-1 border-black-400'
                  : 'primary_border_color hover:border-info-300'
              "
              @click="apiSchemaSection = section.id"
            >
              <div class="flex items-center gap-md">
                <img :src="section.icon" alt="" class="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
                <p class="label_2_semibold primary_text_color">{{ section.title }}</p>
              </div>
              <p class="label_2_regular secondary_text_color mt-xs">{{ section.description }}</p>
            </button>
          </div>

          <template v-if="apiSchemaSection === 'upload'">
            <div class="flex min-h-0 w-[820px] flex-1 overflow-hidden gap-2">
              <div
                class="flex h-full flex-col"
                :class="showFilePartition ? 'min-w-0 flex-1' : 'w-[820px] shrink-0'"
              >
                <input
                  ref="schemaInputRef"
                  type="file"
                  class="hidden"
                  multiple
                  accept=".json,.yaml,.yml,.txt"
                  @change="onSchemaInputChange"
                />
                <div
                  class="flex h-full min-h-0 w-full flex-1 cursor-pointer flex-col rounded-2xl border-2 border-dashed primary_border_color bg-white px-6xl py-5xl text-center transition-colors hover:border-info-200 hover:bg-info-50"
                  @click="triggerSchemaUpload"
                  @dragover.prevent
                  @drop.prevent="onSchemaDrop"
                >
                  <div class="flex flex-1 flex-col items-center justify-center">
                    <div
                      class="flex h-12 w-12 items-center justify-center rounded-full bg-gray-25"
                      aria-hidden="true"
                    >
                      <img :src="UploadIcon" alt="" class="h-6 w-6" />
                    </div>
                    <p class="label_2_regular secondary_text_color mt-4xl">
                      Drag &amp; drop your files here or
                      <span class="label_2_semibold primary_text_color">browse</span>
                      to upload
                    </p>
                  </div>
                  <p class="body_4_medium tertiary_text_color shrink-0">
                    Accepted formats - .json | Max file size - 5MB
                  </p>
                </div>
                <p
                  v-if="localSchemaValidationError || schemaValidationError"
                  class="caption_1_regular text-error-600 mt-md whitespace-pre-line label_3_regular"
                >
                  {{ localSchemaValidationError || schemaValidationError }}
                </p>
              </div>

              <aside
                v-if="schemaUploadItems.length"
                class="custom_scrollbar flex h-full w-[398px] shrink-0 flex-col gap-sm overflow-y-auto pl-4xl"
              >
                <KnowledgeUploadedFileCard
                  v-for="item in schemaUploadItems"
                  :key="item.id"
                  compact
                  :item="item"
                  @cancel="schemaUpload.cancelUpload(item)"
                  @remove="removeSchemaUploadItem(item)"
                />
              </aside>
            </div>
          </template>

          <div
            v-else-if="apiSchemaSection === 'credentials'"
            class="custom_scrollbar min-h-0 flex-1 overflow-y-auto"
          >
            <div>
              <label class="inline-flex items-center gap-sm label_2_semibold primary_text_color">
                API Base URL <span class="text-error-600">*</span>
              
              </label>
              <div class="relative mt-md">
                <span
                  class="pointer-events-none absolute left-4xl top-1/2 -translate-y-1/2 text-gray-400"
                  aria-hidden="true"
                >
                  <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="1.5"
                      d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                    />
                  </svg>
                </span>
                <input
                  :value="baseUrl"
                  type="url"
                  autocomplete="off"
                  placeholder="https://multi-agent.aiagents."
                  class="label_2_regular primary_text_color w-full rounded-xl border bg-white py-3xl pl-12xl pr-4xl outline-none focus:border-info-500"
                  :class="baseUrlValidationError ? 'border-error-200' : 'primary_border_color'"
                  @input="$emit('update:base-url', $event.target.value)"
                  @blur="$emit('validate-base-url')"
                />
              </div>
              <p v-if="baseUrlValidationError" class="label_3_regular text-error-600 mt-sm">
                {{ baseUrlValidationError }}
              </p>
              <p v-else class="label_2_regular tertiary_text_color mt-sm">
                Enter the base URL for your API service
              </p>
            </div>

            <div class="mt-5xl">
              <label class="label_2_semibold primary_text_color">
                Access Token (Optional)
              </label>
              <div class="relative mt-md">
                <span
                  class="pointer-events-none absolute left-4xl top-1/2 -translate-y-1/2 text-gray-400"
                  aria-hidden="true"
                >
                  <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="1.5"
                      d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499a1.125 1.125 0 00.43-1.563 6 6 0 015.912-7.03"
                    />
                  </svg>
                </span>
                <input
                  :value="accessToken"
                  :type="showAccessToken ? 'text' : 'password'"
                  autocomplete="new-password"
                  placeholder="Enter your API access token"
                  class="label_2_regular primary_text_color w-full rounded-xl border primary_border_color bg-white py-3xl pl-12xl pr-12xl outline-none focus:border-info-500"
                  @input="$emit('update:access-token', $event.target.value)"
                />
                <button
                  type="button"
                  class="absolute inset-y-0 right-0 flex items-center px-4xl text-gray-400 transition-colors hover:text-gray-600"
                  :aria-label="showAccessToken ? 'Hide access token' : 'Show access token'"
                  @click="$emit('toggle-access-token')"
                >
                  <svg
                    v-if="showAccessToken"
                    class="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="1.5"
                      d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                    />
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="1.5"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  <svg
                    v-else
                    class="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="1.5"
                      d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
                    />
                  </svg>
                </button>
              </div>
              <p class="label_2_regular tertiary_text_color mt-sm">
                Provide your API access token for authenticated requests
              </p>
            </div>
          </div>
        </div>
      </template>

      <!-- Database -->
      <template v-else-if="activeTab === 'db'">
        <DbAgentsConfiguration
          :db-config="dbConfig"
          :show-db-password="showDbPassword"
          :validation-errors="dbValidationErrors"
          @update:db-config="$emit('update:db-config', $event)"
          @toggle-db-password="$emit('toggle-db-password')"
          @validate-field="$emit('validate-db-field', $event)"
        />
      </template>

      <!-- Composio -->
      <template v-else-if="activeTab === 'composio'">
        <ComposioAppsList
          :selected-apps="selectedComposioApps"
          @update:selected-apps="$emit('update:selected-composio-apps', $event)"
          @store-form-data-before-redirect="$emit('store-form-data-before-redirect')"
        />
      </template>
    </div>
  </div>
</template>

<script setup>
import { computed, h, ref } from 'vue'
import UploadIcon from '../../../assets/images/uplaod.svg'
import DocumentsIcon from '../../../assets/images/agents/documents.svg'
import ApiSchemaIcon from '../../../assets/images/agents/apischema.svg'
import ApiCredentialIcon from '../../../assets/images/agents/Apicredential.svg'
import UploadApiSchemaIcon from '../../../assets/images/agents/uploadAPISchema.svg'
import DatabaseIcon from '../../../assets/images/agents/database.svg'
import {
  validateDocumentFiles,
  validateSchemaFiles,
} from '../../../services/agents/knowledgeValidation.js'
import DbAgentsConfiguration from './DbAgentsConfiguration.vue'
import ComposioAppsList from './ComposioAppsList.vue'
import KnowledgeUploadedFileCard from './KnowledgeUploadedFileCard.vue'
import { useSimulatedFileUpload } from './useSimulatedFileUpload.js'

const props = defineProps({
  activeTab: { type: String, default: 'documents' },
  schemaFiles: { type: Array, default: () => [] },
  documentFiles: { type: Array, default: () => [] },
  schemaValidationError: { type: String, default: '' },
  documentValidationError: { type: String, default: '' },
  baseUrl: { type: String, default: '' },
  accessToken: { type: String, default: '' },
  showAccessToken: { type: Boolean, default: false },
  baseUrlValidationError: { type: String, default: '' },
  dbConfig: {
    type: Object,
    default: () => ({
      type: '',
      host: '',
      port: '',
      database: '',
      username: '',
      password: '',
    }),
  },
  showDbPassword: { type: Boolean, default: false },
  dbValidationErrors: { type: Object, default: () => ({}) },
  selectedComposioApps: { type: Array, default: () => [] },
})

const emit = defineEmits([
  'update:active-tab',
  'add-documents',
  'add-schemas',
  'remove-document',
  'remove-schema',
  'update:base-url',
  'update:access-token',
  'toggle-access-token',
  'validate-base-url',
  'update:db-config',
  'toggle-db-password',
  'validate-db-field',
  'update:selected-composio-apps',
  'store-form-data-before-redirect',
])

const documentInputRef = ref(null)
const schemaInputRef = ref(null)
const localDocumentValidationError = ref('')
const localSchemaValidationError = ref('')
const apiSchemaSection = ref('upload')

const apiSchemaSections = [
  {
    id: 'upload',
    title: 'Upload API Schemas',
    description: 'Upload API schema to connect services.',
    icon: UploadApiSchemaIcon,
  },
  {
    id: 'credentials',
    title: 'API Credentials',
    description: 'Add API credentials to enable your agent.',
    icon: ApiCredentialIcon,
  },
]

const documentUpload = useSimulatedFileUpload({
  onValidate: (files) => Promise.resolve(validateDocumentFiles(files)),
  onFileComplete: (item) => {
    item.parentIndex = props.documentFiles.length
    emit('add-documents', [item.file])
  },
})

const schemaUpload = useSimulatedFileUpload({
  onValidate: validateSchemaFiles,
  onFileComplete: (item) => {
    item.parentIndex = props.schemaFiles.length
    emit('add-schemas', [item.file])
  },
})

const documentUploadItems = documentUpload.items
const schemaUploadItems = schemaUpload.items

const showFilePartition = computed(() => {
  if (props.activeTab === 'documents') return documentUploadItems.value.length > 0
  if (props.activeTab === 'api') return schemaUploadItems.value.length > 0
  return false
})

const ComposioIcon = {
  render() {
    return h('svg', { class: 'h-[18px] w-[18px]', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
      h('path', {
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round',
        'stroke-width': '2',
        d: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10',
      }),
    ])
  },
}

const sidebarTabs = [
  { id: 'documents', label: 'Documents', icon: DocumentsIcon },
  { id: 'api', label: 'API Schema', icon: ApiSchemaIcon },
  { id: 'db', label: 'Data Base', icon: DatabaseIcon },
  { id: 'composio', label: 'Composio', icon: ComposioIcon },
]

function triggerDocumentUpload() {
  documentInputRef.value?.click()
}

function triggerSchemaUpload() {
  schemaInputRef.value?.click()
}

async function handleDocumentFiles(files) {
  localDocumentValidationError.value = ''
  const result = await documentUpload.addFiles(files)
  if (result.errors?.length) {
    localDocumentValidationError.value = result.errors.join('\n')
  }
}

async function handleSchemaFiles(files) {
  localSchemaValidationError.value = ''
  const result = await schemaUpload.addFiles(files)
  if (result.errors?.length) {
    localSchemaValidationError.value = result.errors.join('\n')
  }
}

function removeDocumentUploadItem(item) {
  documentUpload.removeItem(item, (index) => emit('remove-document', index))
}

function removeSchemaUploadItem(item) {
  schemaUpload.removeItem(item, (index) => emit('remove-schema', index))
}

function onDocumentInputChange(event) {
  const files = Array.from(event.target.files ?? [])
  if (files.length) handleDocumentFiles(files)
  event.target.value = ''
}

function onSchemaInputChange(event) {
  const files = Array.from(event.target.files ?? [])
  if (files.length) handleSchemaFiles(files)
  event.target.value = ''
}

function onDocumentDrop(event) {
  const files = Array.from(event.dataTransfer?.files ?? [])
  if (files.length) handleDocumentFiles(files)
}

function onSchemaDrop(event) {
  const files = Array.from(event.dataTransfer?.files ?? [])
  if (files.length) handleSchemaFiles(files)
}
</script>
