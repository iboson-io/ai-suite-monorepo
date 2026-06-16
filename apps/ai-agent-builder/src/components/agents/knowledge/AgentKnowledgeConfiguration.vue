<template>
  <div
    class="flex min-h-0 min-w-0 flex-1"
    :class="editMode ? 'flex-col' : 'gap-5xl overflow-hidden'"
  >
    <nav
      v-if="!editMode"
      class="flex w-[263px] shrink-0 flex-col gap-xs rounded-2xl border primary_border_color bg-white p-md"
    >
      <button
        v-for="tab in sidebarTabs"
        :key="tab.id"
        type="button"
        class="flex items-center gap-md rounded-xl border px-3xl py-xl text-left transition-colors"
        :class="getSidebarTabClass(tab.id)"
        @click="$emit('update:active-tab', tab.id)"
      >
        <span
          class="inline-flex h-[18px] w-[18px] shrink-0 transition-colors"
          :class="getSidebarTabIconClass(tab.id)"
          aria-hidden="true"
        >
          <component :is="tab.icon" class="h-full w-full" />
        </span>
        <span :class="activeTab === tab.id ? 'label_2_semibold' : 'label_2_medium'">
          {{ tab.label }}
        </span>
      </button>
    </nav>

    <div
      class="flex min-h-0 flex-col"
      :class="editMode ? 'w-full min-w-0 flex-1' : 'w-[820px] shrink-0 overflow-hidden'"
    >
      <!-- Documents -->
      <template v-if="effectiveActiveTab === 'documents'">
        <div
          v-if="editMode && existingDocumentFiles.length"
          class="custom_scrollbar mb-4xl max-h-48 space-y-sm overflow-y-auto"
        >
          <p class="label_2_semibold primary_text_color">Uploaded documents</p>
          <div
            v-for="file in existingDocumentFiles"
            :key="file.id || file.file_id || file.name"
            class="flex items-center justify-between rounded-lg border primary_border_color px-3xl py-md"
          >
            <span class="label_3_regular primary_text_color truncate">
              {{ file.original_filename || file.name || file.filename || 'Document' }}
            </span>
            <button
              type="button"
              class="label_3_medium text-error-600"
              @click="$emit('delete-existing-file', file)"
            >
              Remove
            </button>
          </div>
        </div>

        <div
          class="flex min-h-0 gap-2"
          :class="editMode ? 'w-full flex-col' : 'h-full w-[820px] flex-1 overflow-hidden'"
        >
          <div
            class="flex flex-col"
            :class="
              editMode
                ? 'w-full'
                : showFilePartition
                  ? 'h-full min-w-0 flex-1'
                  : 'h-full w-[820px] shrink-0'
            "
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
              class="flex w-full cursor-pointer flex-col rounded-2xl border-2 border-dashed primary_border_color bg-white text-center transition-colors hover:border-info-200 hover:bg-info-50"
              :class="editMode ? 'min-h-[152px] px-4xl py-4xl' : 'h-full min-h-0 flex-1 px-6xl py-5xl'"
              @click="triggerDocumentUpload"
              @dragover.prevent
              @drop.prevent="onDocumentDrop"
            >
              <div
                class="flex flex-col items-center justify-center"
                :class="editMode ? '' : 'flex-1'"
              >
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
                Accepted formats - .pdf, .png, .jpg, .jpeg | Max file size - 50MB
              </p>
            </div>
          </div>

          <aside
            v-if="documentUploadItems.length"
            class="custom_scrollbar flex shrink-0 flex-col gap-sm overflow-y-auto"
            :class="editMode ? 'w-full' : 'h-full w-[398px] pl-4xl'"
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
      <template v-else-if="effectiveActiveTab === 'api'">
        <div class="flex min-h-0 flex-col" :class="editMode ? '' : 'flex-1 overflow-hidden'">
          <div
            class="mb-4xl flex shrink-0 gap-md"
            :class="editMode ? 'flex-col' : ''"
          >
            <button
              v-for="section in apiSchemaSections"
              :key="section.id"
              type="button"
              class="flex flex-1 flex-col rounded-xl border bg-white p-4xl text-left transition-colors"
              :class="getApiSchemaSectionCardClass(section.id)"
              @click="selectApiSchemaSection(section.id)"
            >
              <div class="flex items-center gap-md">
                <img :src="section.icon" alt="" class="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
                <p class="label_2_semibold primary_text_color">{{ section.title }}</p>
              </div>
              <p class="label_2_regular secondary_text_color mt-xs">{{ section.description }}</p>
            </button>
          </div>

          <template v-if="apiSchemaSection === 'upload'">
            <div
              v-if="editMode && existingSchemaFiles.length"
              class="custom_scrollbar mb-4xl max-h-48 space-y-sm overflow-y-auto"
            >
              <p class="label_2_semibold primary_text_color">Uploaded schemas</p>
              <div
                v-for="file in existingSchemaFiles"
                :key="file.id || file.file_id || file.name"
                class="flex items-center justify-between rounded-lg border primary_border_color px-3xl py-md"
              >
                <span class="label_3_regular primary_text_color truncate">
                  {{ file.original_filename || file.name || file.filename || 'Schema' }}
                </span>
                <button
                  type="button"
                  class="label_3_medium text-error-600"
                  @click="$emit('delete-existing-file', file)"
                >
                  Remove
                </button>
              </div>
            </div>

            <div
              class="flex min-h-0 gap-2"
              :class="editMode ? 'w-full flex-col' : 'w-[820px] flex-1 overflow-hidden'"
            >
              <div
                class="flex flex-col"
                :class="
                  editMode
                    ? 'w-full'
                    : showFilePartition
                      ? 'min-w-0 flex-1 h-full'
                      : 'h-full w-[820px] shrink-0'
                "
              >
                <input
                  ref="schemaInputRef"
                  type="file"
                  class="hidden"
                  multiple
                  accept=".json,application/json"
                  @change="onSchemaInputChange"
                />
                <div
                  class="flex w-full cursor-pointer flex-col rounded-2xl border-2 border-dashed primary_border_color bg-white text-center transition-colors hover:border-info-200 hover:bg-info-50"
                  :class="editMode ? 'min-h-[152px] px-4xl py-4xl' : 'h-full min-h-0 flex-1 px-6xl py-5xl'"
                  @click="triggerSchemaUpload"
                  @dragover.prevent
                  @drop.prevent="onSchemaDrop"
                >
                  <div
                    class="flex flex-col items-center justify-center"
                    :class="editMode ? '' : 'flex-1'"
                  >
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
              </div>

              <aside
                v-if="schemaUploadItems.length"
                class="custom_scrollbar flex shrink-0 flex-col gap-sm overflow-y-auto"
                :class="editMode ? 'w-full' : 'h-full w-[398px] pl-4xl'"
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
            :class="editMode ? 'w-full' : 'w-[820px]'"
          >
            <div class="flex w-full flex-col gap-5xl">
              <div>
                <label class="inline-flex items-center gap-sm label_2_semibold primary_text_color">
                  API Base URL <span class="text-error-600">*</span>
                  <span
                    class="inline-flex h-[14px] w-[14px] items-center justify-center rounded-full border primary_border_color"
                    title="The root URL of your API service"
                    aria-label="API Base URL help"
                  >
                    <span class="caption_1_medium tertiary_text_color leading-none">?</span>
                  </span>
                </label>
                <div class="relative mt-md" :class="editMode ? 'w-full' : 'w-1/2'">
                  <img
                    :src="ApiBaseUrlIcon"
                    alt=""
                    class="pointer-events-none absolute left-4xl top-1/2 h-[15px] w-[15px] -translate-y-1/2"
                    aria-hidden="true"
                  />
                  <input
                    :value="baseUrl"
                    type="url"
                    autocomplete="off"
                    placeholder="https://multi-agent.aiagents."
                    class="label_2_regular primary_text_color w-full rounded-xl border bg-white py-3xl pl-12xl pr-4xl outline-none focus:border-info-500"
                    :class="validationField === 'baseUrl' ? 'border-error-200' : 'primary_border_color'"
                    @input="$emit('update:base-url', $event.target.value)"
                  />
                </div>
                <p class="label_2_regular tertiary_text_color mt-sm">
                  Enter the base URL for your API service
                </p>
              </div>

              <div>
                <label class="label_2_semibold primary_text_color">
                  Access Token (Optional)
                </label>
                <div class="relative mt-md" :class="editMode ? 'w-full' : 'w-1/2'">
                  <img
                    :src="AccessTokenIcon"
                    alt=""
                    class="pointer-events-none absolute left-4xl top-1/2 h-[17px] w-[17px] -translate-y-1/2"
                    aria-hidden="true"
                  />
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
        </div>
      </template>

      <!-- Database -->
      <template v-else-if="effectiveActiveTab === 'db'">
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
      <template v-else-if="effectiveActiveTab === 'composio'">
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
import { computed, h, ref, watch } from 'vue'
import UploadIcon from '../../../assets/images/uplaod.svg'
import AccessTokenIcon from '../../../assets/images/agents/Accesstoken.svg'
import ApiBaseUrlIcon from '../../../assets/images/agents/APIbaseurl.svg'
import ApiCredentialIcon from '../../../assets/images/agents/Apicredential.svg'
import UploadApiSchemaIcon from '../../../assets/images/agents/uploadAPISchema.svg'
import {
  validateApiSchemaFiles,
  validateDocumentFiles,
} from '../../../services/agents/knowledgeValidation.js'
import DbAgentsConfiguration from './DbAgentsConfiguration.vue'
import ComposioAppsList from './ComposioAppsList.vue'
import KnowledgeUploadedFileCard from './KnowledgeUploadedFileCard.vue'
import { useSimulatedFileUpload } from './useSimulatedFileUpload.js'

const props = defineProps({
  activeTab: { type: String, default: 'documents' },
  editMode: { type: Boolean, default: false },
  lockedTab: { type: String, default: '' },
  existingSchemaFiles: { type: Array, default: () => [] },
  existingDocumentFiles: { type: Array, default: () => [] },
  schemaFiles: { type: Array, default: () => [] },
  documentFiles: { type: Array, default: () => [] },
  validationField: { type: String, default: '' },
  baseUrl: { type: String, default: '' },
  accessToken: { type: String, default: '' },
  showAccessToken: { type: Boolean, default: false },
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
  'knowledge-validation-error',
  'update:db-config',
  'toggle-db-password',
  'validate-db-field',
  'update:selected-composio-apps',
  'store-form-data-before-redirect',
  'delete-existing-file',
])

const effectiveActiveTab = computed(() => {
  if (props.editMode && props.lockedTab) return props.lockedTab
  return props.activeTab
})

const documentInputRef = ref(null)
const schemaInputRef = ref(null)
const apiSchemaSection = ref('upload')

const VALIDATION_FIELD_TO_TAB = {
  schema: 'api',
  baseUrl: 'api',
  documents: 'documents',
  db: 'db',
  composio: 'composio',
}

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
  onValidate: validateApiSchemaFiles,
  onFileComplete: (item) => {
    item.parentIndex = props.schemaFiles.length
    emit('add-schemas', [item.file])
  },
})

const documentUploadItems = documentUpload.items
const schemaUploadItems = schemaUpload.items

const hasApiSchemaFiles = computed(
  () => props.schemaFiles.length > 0 || schemaUploadItems.value.length > 0
)

const hasValidApiBaseUrl = computed(
  () => Boolean(props.baseUrl.trim()) && props.validationField !== 'baseUrl'
)

function createSidebarIcon(viewBox, pathD) {
  return {
    render() {
      return h(
        'svg',
        {
          class: 'h-full w-full',
          fill: 'none',
          stroke: 'currentColor',
          viewBox,
          xmlns: 'http://www.w3.org/2000/svg',
        },
        [
          h('path', {
            d: pathD,
            'stroke-width': '1.5',
            'stroke-linecap': 'round',
            'stroke-linejoin': 'round',
          }),
        ]
      )
    },
  }
}

const DocumentsIcon = createSidebarIcon(
  '0 0 22 22',
  'M12.833 2.75V6.41667C12.833 6.65978 12.9296 6.89294 13.1015 7.06485C13.2734 7.23676 13.5066 7.33333 13.7497 7.33333H17.4163M17.4163 7.33333L12.833 2.75H6.41634C5.93011 2.75 5.4638 2.94315 5.11998 3.28697C4.77616 3.63079 4.58301 4.0971 4.58301 4.58333V17.4167C4.58301 17.9029 4.77616 18.3692 5.11998 18.713C5.4638 19.0568 5.93011 19.25 6.41634 19.25H15.583C16.0692 19.25 16.5356 19.0568 16.8794 18.713C17.2232 18.3692 17.4163 17.9029 17.4163 17.4167V7.33333ZM8.24967 8.25H9.16634M8.24967 11.9167H13.7497M8.24967 15.5833H13.7497'
)

const ApiSchemaIcon = createSidebarIcon(
  '0 0 22 22',
  'M3.66699 5.5C3.66699 6.22935 4.43961 6.92882 5.81488 7.44454C7.19014 7.96027 9.0554 8.25 11.0003 8.25C12.9452 8.25 14.8105 7.96027 16.1858 7.44454C17.561 6.92882 18.3337 6.22935 18.3337 5.5M3.66699 11V5.5C3.66699 4.77065 4.43961 4.07118 5.81488 3.55546C7.19014 3.03973 9.0554 2.75 11.0003 2.75C12.9452 2.75 14.8105 3.03973 16.1858 3.55546C17.561 4.07118 18.3337 4.77065 18.3337 5.5V11M3.66699 11C3.66699 11.7293 4.43961 12.4288 5.81488 12.9445C7.19014 13.4603 9.0554 13.75 11.0003 13.75C12.9452 13.75 14.8105 13.4603 16.1858 12.9445C17.561 12.4288 18.3337 11.7293 18.3337 11M3.66699 11V16.5C3.66699 17.2293 4.43961 17.9288 5.81488 18.4445C7.19014 18.9603 9.0554 19.25 11.0003 19.25C12.9452 19.25 14.8105 18.9603 16.1858 18.4445C17.561 17.9288 18.3337 17.2293 18.3337 16.5V11'
)

const DatabaseIcon = createSidebarIcon(
  '0 0 15 18',
  'M3.5 9.45833V12.8958C3.5 13.7813 5.14083 14.5 7.16667 14.5C9.1925 14.5 10.8333 13.7813 10.8333 12.8958V9.45833M9 0.75V4.41667C9 4.65978 9.09658 4.89294 9.26849 5.06485C9.44039 5.23676 9.67355 5.33333 9.91667 5.33333H13.5833M13.5833 5.33333L9 0.75H2.58333C2.0971 0.75 1.63079 0.943154 1.28697 1.28697C0.943154 1.63079 0.75 2.0971 0.75 2.58333V15.4167C0.75 15.9029 0.943154 16.3692 1.28697 16.713C1.63079 17.0568 2.0971 17.25 2.58333 17.25H11.75C12.2362 17.25 12.7025 17.0568 13.0464 16.713C13.3902 16.3692 13.5833 15.9029 13.5833 15.4167V5.33333ZM3.5 9.6875C3.5 10.113 3.88631 10.521 4.57394 10.8218C5.26157 11.1227 6.19421 11.2917 7.16667 11.2917C8.13913 11.2917 9.07176 11.1227 9.75939 10.8218C10.447 10.521 10.8333 10.113 10.8333 9.6875C10.8333 9.26205 10.447 8.85402 9.75939 8.55318C9.07176 8.25234 8.13913 8.08333 7.16667 8.08333C6.19421 8.08333 5.26157 8.25234 4.57394 8.55318C3.88631 8.85402 3.5 9.26205 3.5 9.6875Z'
)

function getSidebarTabIconClass(tabId) {
  return props.activeTab === tabId ? 'primary_text_color' : 'tertiary_text_color'
}

function getSidebarTabClass(tabId) {
  const hasError =
    props.validationField && VALIDATION_FIELD_TO_TAB[props.validationField] === tabId

  if (hasError) {
    return props.activeTab === tabId
      ? 'border-2 border-error-200 bg-gray-25 primary_text_color'
      : 'border-2 border-error-200 secondary_text_color hover:bg-gray-25 hover:primary_text_color'
  }

  if (props.activeTab === tabId) {
    return 'border-transparent bg-gray-25 primary_text_color'
  }

  return 'border-transparent secondary_text_color hover:bg-gray-25 hover:primary_text_color'
}

function getApiSchemaSectionCardClass(sectionId) {
  const hasError =
    (props.validationField === 'schema' && sectionId === 'upload') ||
    (props.validationField === 'baseUrl' && sectionId === 'credentials')

  if (hasError) {
    return 'border-2 border-error-200'
  }
  if (apiSchemaSection.value === sectionId) {
    return 'border-2 border-black-400'
  }
  if (sectionId === 'upload' && hasApiSchemaFiles.value && props.validationField !== 'schema') {
    return 'border-success-200 bg-success-50 primary_border_color'
  }
  if (sectionId === 'credentials' && hasValidApiBaseUrl.value) {
    return 'border-success-200 bg-success-50 primary_border_color'
  }
  return 'primary_border_color hover:border-info-300'
}

function selectApiSchemaSection(sectionId) {
  apiSchemaSection.value = sectionId
}

watch(
  () => props.validationField,
  (field) => {
    if (props.activeTab !== 'api') return
    if (field === 'schema') {
      apiSchemaSection.value = 'upload'
    }
    if (field === 'baseUrl') {
      apiSchemaSection.value = 'credentials'
    }
  }
)

watch(
  () => props.activeTab,
  (tab) => {
    if (tab === 'api') {
      apiSchemaSection.value = 'upload'
    }
  }
)

const showFilePartition = computed(() => {
  if (props.editMode) return false
  if (effectiveActiveTab.value === 'documents') return documentUploadItems.value.length > 0
  if (effectiveActiveTab.value === 'api') return schemaUploadItems.value.length > 0
  return false
})

const ComposioIcon = {
  render() {
    return h('svg', { class: 'h-full w-full', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
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
  const result = await documentUpload.addFiles(files)
  if (result.errors?.length) {
    emit('knowledge-validation-error', {
      message: result.errors.join('\n'),
      field: 'documents',
    })
  }
}

async function handleSchemaFiles(files) {
  const result = await schemaUpload.addFiles(files)
  if (result.errors?.length) {
    emit('knowledge-validation-error', {
      message: result.errors.join('\n'),
      field: 'schema',
    })
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
