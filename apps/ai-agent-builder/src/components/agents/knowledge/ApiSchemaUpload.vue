<template>
  <div class="flex flex-col gap-4xl">
    <div class="flex flex-col gap-md sm:flex-row">
      <button
        type="button"
        class="flex-1 rounded-xl border p-4xl text-left transition-colors"
        :class="activeSection === 'upload'
          ? 'border-info-500 bg-info-50'
          : schemaFiles.length > 0
            ? 'border-success-200 bg-success-50'
            : 'primary_border_color bg-white hover:border-info-300'"
        @click="activeSection = 'upload'"
      >
        <p class="label_2_semibold primary_text_color">Upload API Schemas</p>
        <p class="caption_1_regular secondary_text_color mt-xs">
          Upload OpenAPI schemas to connect your agent to backend services.
        </p>
      </button>
      <button
        type="button"
        class="flex-1 rounded-xl border p-4xl text-left transition-colors"
        :class="activeSection === 'credentials'
          ? 'border-info-500 bg-info-50'
          : baseUrl && !baseUrlValidationError
            ? 'border-success-200 bg-success-50'
            : 'primary_border_color bg-white hover:border-info-300'"
        @click="activeSection = 'credentials'"
      >
        <p class="label_2_semibold primary_text_color">API Credentials</p>
        <p class="caption_1_regular secondary_text_color mt-xs">
          Configure base URL and access token for your API.
        </p>
      </button>
    </div>

    <div v-if="activeSection === 'upload'">
      <div
        class="flex min-h-[180px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-6xl text-center transition-colors"
        :class="validationError
          ? 'border-error-200 bg-error-50'
          : 'primary_border_color bg-gray-25 hover:border-info-400 hover:bg-info-50'"
        @click="fileInput?.click()"
        @dragover.prevent
        @drop.prevent="handleDrop"
      >
        <p class="label_2_regular primary_text_color">
          Drag and drop API schema files or click to browse
        </p>
        <p class="caption_1_regular tertiary_text_color mt-sm">
          Supported: .json, .yaml, .yml, .txt — max 5 MB each
        </p>
        <button
          type="button"
          class="primary_add_button mt-4xl rounded-lg px-4xl py-md caption_1_semibold primary_2_text_color"
          @click.stop="fileInput?.click()"
        >
          Browse Files
        </button>
      </div>

      <p v-if="validationError" class="caption_1_regular text-error-600 mt-md whitespace-pre-line">
        {{ validationError }}
      </p>

      <ul v-if="schemaFiles.length && !validationError" class="mt-4xl flex max-h-32 flex-col gap-sm overflow-y-auto">
        <li
          v-for="(file, index) in schemaFiles"
          :key="`${file.name}-${index}`"
          class="flex items-center justify-between rounded-lg border primary_border_color bg-white px-4xl py-md"
        >
          <div class="min-w-0">
            <p class="label_2_medium primary_text_color truncate">{{ file.name }}</p>
            <p class="caption_1_regular tertiary_text_color">{{ formatFileSize(file.size) }}</p>
          </div>
          <button
            type="button"
            class="shrink-0 label_2_medium text-error-600 hover:underline"
            @click="$emit('remove-file', index)"
          >
            Remove
          </button>
        </li>
      </ul>
    </div>

    <div v-else class="flex flex-col gap-4xl">
      <div>
        <label class="label_2_semibold primary_text_color">
          API Base URL <span class="text-error-600">*</span>
        </label>
        <input
          :value="baseUrl"
          type="url"
          placeholder="https://api.yourservice.com"
          autocomplete="off"
          class="label_2_regular primary_text_color mt-md w-full rounded-xl border bg-white px-4xl py-3xl outline-none transition-colors focus:border-info-500"
          :class="baseUrlValidationError ? 'border-error-200' : 'primary_border_color'"
          @input="$emit('update:base-url', $event.target.value)"
          @blur="$emit('validate-base-url')"
        />
        <p v-if="baseUrlValidationError" class="caption_1_regular text-error-600 mt-sm">
          {{ baseUrlValidationError }}
        </p>
      </div>

      <div>
        <label class="label_2_semibold primary_text_color">
          Access Token
          <span class="caption_1_regular tertiary_text_color font-normal">(optional)</span>
        </label>
        <div class="relative mt-md">
          <input
            :value="accessToken"
            :type="showAccessToken ? 'text' : 'password'"
            placeholder="Enter your API access token"
            autocomplete="new-password"
            class="label_2_regular primary_text_color w-full rounded-xl border primary_border_color bg-white px-4xl py-3xl pr-12xl outline-none transition-colors focus:border-info-500"
            @input="$emit('update:access-token', $event.target.value)"
          />
          <button
            type="button"
            class="absolute inset-y-0 right-0 px-4xl caption_1_medium secondary_text_color hover:primary_text_color"
            @click="$emit('toggle-access-token')"
          >
            {{ showAccessToken ? 'Hide' : 'Show' }}
          </button>
        </div>
      </div>
    </div>

    <input
      ref="fileInput"
      type="file"
      accept=".json,.yaml,.yml,.txt"
      multiple
      class="hidden"
      @change="handleSelect"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'

defineProps({
  schemaFiles: { type: Array, default: () => [] },
  validationError: { type: String, default: '' },
  baseUrl: { type: String, default: '' },
  accessToken: { type: String, default: '' },
  showAccessToken: { type: Boolean, default: false },
  baseUrlValidationError: { type: String, default: '' },
})

const emit = defineEmits([
  'upload-files',
  'remove-file',
  'update:base-url',
  'update:access-token',
  'toggle-access-token',
  'validate-base-url',
])

const activeSection = ref('upload')
const fileInput = ref(null)

function handleSelect(event) {
  const files = Array.from(event.target.files ?? [])
  if (files.length) emit('upload-files', files)
  event.target.value = ''
}

function handleDrop(event) {
  const files = Array.from(event.dataTransfer?.files ?? [])
  if (files.length) emit('upload-files', files)
}

function formatFileSize(bytes) {
  if (!bytes) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`
}
</script>
