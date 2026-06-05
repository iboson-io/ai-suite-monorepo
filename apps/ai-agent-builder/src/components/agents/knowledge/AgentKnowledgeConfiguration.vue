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
              class="caption_1_regular text-error-600 mt-md whitespace-pre-line"
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
          <div class="flex min-h-0 w-[820px] flex-1 overflow-hidden">
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
                  Drag &amp; drop API schema files or
                  <span class="label_2_semibold primary_text_color">browse</span>
                  to upload
                </p>
              </div>
              <p class="caption_1_regular tertiary_text_color shrink-0">
                Accepted formats - .json, .yaml, .yml, .txt | Max file size - 5MB
              </p>
            </div>
            <p
              v-if="localSchemaValidationError || schemaValidationError"
              class="caption_1_regular text-error-600 mt-md whitespace-pre-line"
            >
              {{ localSchemaValidationError || schemaValidationError }}
            </p>
          </div>

          <aside
            v-if="schemaUploadItems.length"
            class="custom_scrollbar flex h-full w-[232px] shrink-0 flex-col gap-sm overflow-y-auto border-l primary_border_color pl-4xl"
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

        <div class="custom_scrollbar mt-5xl shrink-0 overflow-y-auto border-t primary_border_color pt-5xl">
          <p class="label_2_semibold primary_text_color">API Credentials</p>
          <p class="caption_1_regular secondary_text_color mt-xs">
            Configure base URL and access token for your API.
          </p>
          <div class="mt-4xl">
            <label class="label_2_semibold primary_text_color">
              API Base URL <span class="text-error-600">*</span>
            </label>
            <input
              :value="baseUrl"
              type="url"
              placeholder="https://api.yourservice.com"
              class="label_2_regular primary_text_color mt-md w-full rounded-xl border bg-white px-4xl py-3xl outline-none focus:border-info-500"
              :class="baseUrlValidationError ? 'border-error-200' : 'primary_border_color'"
              @input="$emit('update:base-url', $event.target.value)"
              @blur="$emit('validate-base-url')"
            />
            <p v-if="baseUrlValidationError" class="caption_1_regular text-error-600 mt-sm">
              {{ baseUrlValidationError }}
            </p>
          </div>
          <div class="mt-4xl">
            <label class="label_2_semibold primary_text_color">
              Access Token
              <span class="caption_1_regular tertiary_text_color font-normal">(optional)</span>
            </label>
            <div class="relative mt-md">
              <input
                :value="accessToken"
                :type="showAccessToken ? 'text' : 'password'"
                placeholder="Enter your API access token"
                class="label_2_regular primary_text_color w-full rounded-xl border primary_border_color bg-white px-4xl py-3xl pr-16xl outline-none focus:border-info-500"
                @input="$emit('update:access-token', $event.target.value)"
              />
              <button
                type="button"
                class="absolute inset-y-0 right-0 px-4xl caption_1_medium secondary_text_color"
                @click="$emit('toggle-access-token')"
              >
                {{ showAccessToken ? 'Hide' : 'Show' }}
              </button>
            </div>
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
