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
          Supported: .json, .yaml, .yml — max 50 MB each
        </p>
        <button
          type="button"
          class="primary_add_button mt-4xl rounded-lg px-4xl py-md caption_1_semibold primary_2_text_color"
          @click.stop="fileInput?.click()"
        >
          Browse Files
        </button>
      </div>

      <p v-if="validationError" class=" label_3_regular caption_1_regular text-error-600 mt-md whitespace-pre-line">
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

    <div v-else class="flex w-full flex-col gap-5xl">
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
        <div class="relative mt-md w-1/2">
          <img
            :src="ApiBaseUrlIcon"
            alt=""
            class="pointer-events-none absolute left-4xl top-1/2 h-[15px] w-[15px] -translate-y-1/2"
            aria-hidden="true"
          />
          <input
            :value="baseUrl"
            type="url"
            placeholder="https://multi-agent.aiagents."
            autocomplete="off"
            class="label_2_regular primary_text_color w-full rounded-xl border bg-white py-3xl pl-12xl pr-4xl outline-none transition-colors focus:border-info-500"
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

      <div>
        <label class="label_2_semibold primary_text_color">
          Access Token (Optional)
        </label>
        <div class="relative mt-md w-1/2">
          <img
            :src="AccessTokenIcon"
            alt=""
            class="pointer-events-none absolute left-4xl top-1/2 h-[17px] w-[17px] -translate-y-1/2"
            aria-hidden="true"
          />
          <input
            :value="accessToken"
            :type="showAccessToken ? 'text' : 'password'"
            placeholder="Enter your API access token"
            autocomplete="new-password"
            class="label_2_regular primary_text_color w-full rounded-xl border primary_border_color bg-white py-3xl pl-12xl pr-12xl outline-none transition-colors focus:border-info-500"
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

    <input
      ref="fileInput"
      type="file"
      accept=".json,.yaml,.yml"
      multiple
      class="hidden"
      @change="handleSelect"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import AccessTokenIcon from '../../../assets/images/agents/Accesstoken.svg'
import ApiBaseUrlIcon from '../../../assets/images/agents/APIbaseurl.svg'

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
