<template>
  <div class="flex min-h-0 flex-1 flex-col">
    <div class="flex min-h-0 flex-1 gap-5xl overflow-hidden">
      <nav class="flex w-[148px] shrink-0 flex-col gap-xs">
        <button
          v-for="tab in knowledgeTabs"
          :key="tab.id"
          type="button"
          class="flex items-center gap-md rounded-xl px-3xl py-2xl text-left label_2_medium transition-colors"
          :class="
            activeTab === tab.id
              ? 'bg-info-50 primary_text_color'
              : 'secondary_text_color hover:bg-gray-25'
          "
          @click="$emit('update:activeTab', tab.id)"
        >
          <component :is="tab.icon" class="h-[18px] w-[18px] shrink-0" />
          <span>{{ tab.label }}</span>
        </button>
      </nav>

      <div class="flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto">
        <!-- Documents -->
        <template v-if="activeTab === 'documents'">
          <input
            ref="documentInputRef"
            type="file"
            class="hidden"
            multiple
            accept=".pdf,.png,.jpg,.jpeg,application/pdf,image/png,image/jpeg"
            @change="onDocumentInputChange"
          />
          <div
            class="flex min-h-[220px] flex-1 cursor-pointer flex-col rounded-2xl border-2 border-dashed primary_border_color bg-white px-6xl py-5xl text-center transition-colors hover:border-info-200 hover:bg-info-50"
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
            <p class="caption_1_regular tertiary_text_color shrink-0">
              Accepted formats - .pdf, .png, .jpg, .jpeg | Max file size - 50MB
            </p>
          </div>
          <ul v-if="documentFiles.length > 0" class="mt-md flex flex-col gap-sm">
            <li
              v-for="(file, index) in documentFiles"
              :key="`${file.name}-${index}`"
              class="flex items-center justify-between gap-md rounded-xl border primary_border_color bg-white px-4xl py-md"
            >
              <span class="label_2_regular primary_text_color truncate">{{ file.name }}</span>
              <button
                type="button"
                class="shrink-0 label_2_medium text-error-600 hover:underline"
                @click="$emit('remove-document', index)"
              >
                Remove
              </button>
            </li>
          </ul>
        </template>

        <!-- API Schema -->
        <template v-else-if="activeTab === 'api'">
          <input
            ref="schemaInputRef"
            type="file"
            class="hidden"
            multiple
            accept=".json,.txt,.yaml,.yml"
            @change="onSchemaInputChange"
          />
          <div
            class="flex min-h-[220px] flex-1 cursor-pointer flex-col rounded-2xl border-2 border-dashed primary_border_color bg-white px-6xl py-5xl text-center transition-colors hover:border-info-200 hover:bg-info-50"
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
              Accepted formats - .json, .txt, .yaml, .yml
            </p>
          </div>
          <ul v-if="schemaFiles.length > 0" class="mt-md flex flex-col gap-sm">
            <li
              v-for="(file, index) in schemaFiles"
              :key="`${file.name}-${index}`"
              class="flex items-center justify-between gap-md rounded-xl border primary_border_color bg-white px-4xl py-md"
            >
              <span class="label_2_regular primary_text_color truncate">{{ file.name }}</span>
              <button
                type="button"
                class="shrink-0 label_2_medium text-error-600 hover:underline"
                @click="$emit('remove-schema', index)"
              >
                Remove
              </button>
            </li>
          </ul>
        </template>

        <!-- Placeholder tabs -->
        <template v-else>
          <div
            class="flex min-h-[220px] flex-1 flex-col items-center justify-center rounded-2xl border primary_border_color bg-white px-6xl py-8xl text-center"
          >
            <p class="label_2_semibold primary_text_color">{{ activeTabLabel }}</p>
            <p class="body_3_regular secondary_text_color mt-md">
              This knowledge source will be available soon.
            </p>
          </div>
        </template>

        <p v-if="validationError" class="caption_1_regular text-error-600 mt-md">
          {{ validationError }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, h, ref } from 'vue'
import UploadIcon from '../../assets/images/uplaod.svg'

const DOCUMENT_MAX_BYTES = 50 * 1024 * 1024
const DOCUMENT_EXTENSIONS = ['.pdf', '.png', '.jpg', '.jpeg']
const SCHEMA_EXTENSIONS = ['.json', '.txt', '.yaml', '.yml']

const props = defineProps({
  activeTab: {
    type: String,
    default: 'documents',
  },
  documentFiles: {
    type: Array,
    default: () => [],
  },
  schemaFiles: {
    type: Array,
    default: () => [],
  },
  validationError: {
    type: String,
    default: '',
  },
})

const emit = defineEmits([
  'update:activeTab',
  'add-documents',
  'add-schemas',
  'remove-document',
  'remove-schema',
  'validation-error',
])

const documentInputRef = ref(null)
const schemaInputRef = ref(null)

const DocumentIcon = {
  render() {
    return h('svg', { class: 'h-[18px] w-[18px]', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
      h('path', {
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round',
        'stroke-width': '2',
        d: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
      }),
    ])
  },
}

const ApiIcon = {
  render() {
    return h('svg', { class: 'h-[18px] w-[18px]', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
      h('path', {
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round',
        'stroke-width': '2',
        d: 'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4',
      }),
    ])
  },
}

const DatabaseIcon = {
  render() {
    return h('svg', { class: 'h-[18px] w-[18px]', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
      h('path', {
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round',
        'stroke-width': '2',
        d: 'M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4',
      }),
    ])
  },
}

const LinkIcon = {
  render() {
    return h('svg', { class: 'h-[18px] w-[18px]', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
      h('path', {
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round',
        'stroke-width': '2',
        d: 'M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1',
      }),
    ])
  },
}

const ToolsIcon = {
  render() {
    return h('svg', { class: 'h-[18px] w-[18px]', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
      h('path', {
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round',
        'stroke-width': '2',
        d: 'M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z',
      }),
    ])
  },
}

const knowledgeTabs = [
  { id: 'documents', label: 'Documents', icon: DocumentIcon },
  { id: 'api', label: 'API Schema', icon: ApiIcon },
  { id: 'db', label: 'Data Base', icon: DatabaseIcon },
  { id: 'tools', label: 'Tools', icon: ToolsIcon },
  { id: 'url', label: 'URL', icon: LinkIcon },
]

const activeTabLabel = computed(
  () => knowledgeTabs.find((tab) => tab.id === props.activeTab)?.label ?? ''
)

function hasAllowedExtension(fileName, extensions) {
  const lower = fileName.toLowerCase()
  return extensions.some((ext) => lower.endsWith(ext))
}

function validateDocumentFiles(files) {
  for (const file of files) {
    if (!hasAllowedExtension(file.name, DOCUMENT_EXTENSIONS)) {
      return 'Accepted formats: .pdf, .png, .jpg, .jpeg'
    }
    if (file.size > DOCUMENT_MAX_BYTES) {
      return 'Max file size is 50MB per file.'
    }
  }
  return ''
}

function validateSchemaFiles(files) {
  for (const file of files) {
    if (!hasAllowedExtension(file.name, SCHEMA_EXTENSIONS)) {
      return 'Accepted formats: .json, .txt, .yaml, .yml'
    }
  }
  return ''
}

function addFiles(fileList, type) {
  const files = Array.from(fileList ?? [])
  if (!files.length) return

  if (type === 'documents') {
    const error = validateDocumentFiles(files)
    if (error) {
      emit('validation-error', error)
      return
    }
    emit('validation-error', '')
    emit('add-documents', files)
    return
  }

  const error = validateSchemaFiles(files)
  if (error) {
    emit('validation-error', error)
    return
  }
  emit('validation-error', '')
  emit('add-schemas', files)
}

function triggerDocumentUpload() {
  documentInputRef.value?.click()
}

function triggerSchemaUpload() {
  schemaInputRef.value?.click()
}

function onDocumentInputChange(event) {
  addFiles(event.target.files, 'documents')
  event.target.value = ''
}

function onSchemaInputChange(event) {
  addFiles(event.target.files, 'api')
  event.target.value = ''
}

function onDocumentDrop(event) {
  addFiles(event.dataTransfer?.files, 'documents')
}

function onSchemaDrop(event) {
  addFiles(event.dataTransfer?.files, 'api')
}
</script>
