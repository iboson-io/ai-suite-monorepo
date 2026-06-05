<template>
  <div class="flex flex-col gap-4xl">
    <div>
      <p class="label_2_semibold primary_text_color">Upload Documents</p>
      <p class="caption_1_regular secondary_text_color mt-xs">
        Upload documents to give your agent domain-specific knowledge.
      </p>
    </div>

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
        Drop documents here or click to browse
      </p>
      <p class="caption_1_regular tertiary_text_color mt-sm">
        PDF, DOC, DOCX — max 20 MB per file
      </p>
      <button
        type="button"
        class="primary_add_button mt-4xl rounded-lg px-4xl py-md caption_1_semibold primary_2_text_color"
        @click.stop="fileInput?.click()"
      >
        Browse Files
      </button>
    </div>

    <p v-if="validationError" class="caption_1_regular text-error-600 whitespace-pre-line">
      {{ validationError }}
    </p>

    <ul v-if="documentFiles.length && !validationError" class="flex max-h-40 flex-col gap-sm overflow-y-auto">
      <li
        v-for="(file, index) in documentFiles"
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
          @click="$emit('remove-document', index)"
        >
          Remove
        </button>
      </li>
    </ul>
  </div>

  <input
    ref="fileInput"
    type="file"
    accept=".pdf,.doc,.docx"
    multiple
    class="hidden"
    @change="handleSelect"
  />
</template>

<script setup>
import { ref } from 'vue'

defineProps({
  documentFiles: { type: Array, default: () => [] },
  validationError: { type: String, default: '' },
})

const emit = defineEmits(['upload-documents', 'remove-document'])

const fileInput = ref(null)

function handleSelect(event) {
  const files = Array.from(event.target.files ?? [])
  if (files.length) emit('upload-documents', files)
  event.target.value = ''
}

function handleDrop(event) {
  const files = Array.from(event.dataTransfer?.files ?? [])
  if (files.length) emit('upload-documents', files)
}

function formatFileSize(bytes) {
  if (!bytes) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`
}
</script>
