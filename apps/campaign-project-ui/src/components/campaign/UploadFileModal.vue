<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="fixed inset-0 z-[200] flex items-center justify-center bg_overlay backdrop-blur-sm p-3xl"
      @click.self="onBackdropClose"
    >
      <div
        class="relative w-full max-w-md overflow-hidden rounded-2xl bg_secondary_color p-6 shadow-2xl"
        @click.stop
        role="dialog"
        aria-modal="true"
        aria-labelledby="upload-file-title"
      >
        <h2 id="upload-file-title" class="heading_h6_bold primary_text_color">
          Upload file
        </h2>
        <p class="p-xs label_2_medium primary_text_color">
          Drag &amp; drop an image here, or browse to set your email preview image.
        </p>

        <input
          ref="fileInputRef"
          type="file"
          class="hidden"
          accept="image/png,image/jpeg"
          @change="onFileInputChange"
        />

        <div
          ref="dropZoneRef"
          :class="[
            'mt-4xl cursor-pointer rounded-lg pt-20 text-center transition-colors',
            isDragOver
              ? 'border-2 border-dashed border-gray-500 bg_secondary_color'
              : 'border-2 border-dashed border-gray-500',
          ]"
          @click="fileInputRef?.click()"
          @drop="handleDrop"
          @dragover.prevent
          @dragenter.prevent
          @dragenter="isDragOver = true"
          @dragleave="onDragLeave"
        >
          <div class="flex justify-center">
            <img :src="UploadImageIcon" alt="" />
          </div>
          <p class="body_3_medium text_color mt-7xl">
            Drag &amp; drop your files here or
            <span class="font-semibold primary_text_color">browse</span> to upload.
          </p>
          <p class="label_3_regular mt-14xl mb-md text-[#A7ABB3]">
            Accepted formats - .png, .jpg, .jpeg | Max file size - 5MB
          </p>
        </div>

        <div v-if="pendingFile" class="mt-4 space-y-3">
          <div class="primary_border_color rounded-lg border p-xl">
            <div class="mb-md flex items-start justify-between">
              <div class="flex min-w-0 flex-1 gap-1">
                <img :src="UploadaImageIcon" alt="" class="h-6 w-6 shrink-0" />
                <div>
                  <p class="label_3_bold primary_text_color truncate">
                    {{ pendingFile.name }}
                  </p>
                  <div class="mt-xs flex items-center gap-md">
                    <p class="label_3_regular secondary_text_color">
                      {{ formatFileSize(pendingFile.size) }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div class="flex justify-between">
              <span class="label_3_regular flex items-center gap-1 text-success-600">
                <img :src="GreenTickIcon" alt="" class="h-4 w-4" />
                Ready
              </span>
              <button
                type="button"
                class="ml-md text-[#6B7280] transition-colors hover:text-[#4B5563]"
                aria-label="Remove file"
                @click.stop="clearPending"
              >
                <img :src="ClearIcon" alt="" class="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        <div
          v-if="fileError"
          class="mt-4 flex items-center justify-between rounded-lg border bg-gray-25 bg_secondary_color px-3xl py-xl"
        >
          <div class="flex items-center gap-xl">
            <img :src="WarningIcon" alt="" class="h-4 w-4 shrink-0" />
            <span class="label_2_semibold text-error-600">{{ fileError }}</span>
          </div>
          <button
            type="button"
            class="label_2_semibold text-error-600"
            @click="fileError = null"
            aria-label="Dismiss error"
          >
            <img :src="CloseIcon" alt="" class="h-4 w-4" />
          </button>
        </div>

        <div class="mt-6xl flex justify-between">
          <button
            type="button"
            class="rounded-lg bg-gray-25 px-xxl py-xl label_1_semibold primary_text_color primary_border_color hover:bg-gray-50"
            @click="onCancel"
          >
            Cancel
          </button>
          <button
            type="button"
            :disabled="!pendingFile || !!fileError"
            :class="[
              'inline-flex items-center justify-center gap-2 rounded-lg px-xxl py-xl label_2_medium',
              !pendingFile || fileError
                ? 'disabled_primary_button cursor-not-allowed'
                : 'primary_button cursor-pointer',
            ]"
            @click="onSave"
          >
            <img
              v-if="pendingFile"
              :src="SaveIcon"
              alt=""
              class="h-4 w-4"
            />
            Save
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, watch } from 'vue'
import UploadImageIcon from '../../assets/images/UploadImageIcon.svg'
import UploadaImageIcon from '../../assets/images/UploadaImageIcon.svg'
import GreenTickIcon from '../../assets/images/GreenTickIcon.svg'
import ClearIcon from '../../assets/images/ClearIcon.svg'
import CloseIcon from '../../assets/images/CloseIcon.svg'
import WarningIcon from '../../assets/images/WarningIcon.svg'
import SaveIcon from '../../assets/images/SaveIcon.svg'

const MAX_BYTES = 5 * 1024 * 1024

const props = defineProps({
  open: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'save'])

const fileInputRef = ref(null)
const dropZoneRef = ref(null)
const pendingFile = ref(null)
const fileError = ref(null)
const isDragOver = ref(false)

function resetState() {
  pendingFile.value = null
  fileError.value = null
  isDragOver.value = false
  if (fileInputRef.value) {
    fileInputRef.value.value = ''
  }
}

watch(
  () => props.open,
  (v) => {
    if (v) {
      resetState()
    } else {
      resetState()
    }
  }
)

function formatFileSize(bytes) {
  if (bytes === 0) return '0 KB'
  const kb = bytes / 1024
  if (kb < 1024) {
    return `${Math.round(kb)} KB`
  }
  const mb = kb / 1024
  return `${mb.toFixed(2)} MB`
}

function onFileInputChange(e) {
  const file = e.target?.files && e.target.files[0]
  if (file) {
    validateAndSet(file)
  }
}

function onDragLeave(e) {
  if (dropZoneRef.value && !dropZoneRef.value.contains(e.relatedTarget)) {
    isDragOver.value = false
  }
}

function handleDrop(event) {
  isDragOver.value = false
  const file = event.dataTransfer?.files?.[0]
  if (file) {
    validateAndSet(file)
  }
}

function validateAndSet(file) {
  fileError.value = null
  const okType = /^image\/(png|jpeg)$/.test(file.type)
  const extOk = /\.(png|jpe?g)$/i.test(file.name)
  if (!okType && !extOk) {
    fileError.value = 'Please use PNG, JPG, or JPEG.'
    pendingFile.value = null
    return
  }
  if (file.size > MAX_BYTES) {
    fileError.value = 'File is larger than 5MB.'
    pendingFile.value = null
    return
  }
  pendingFile.value = file
}

function clearPending() {
  pendingFile.value = null
  fileError.value = null
  if (fileInputRef.value) {
    fileInputRef.value.value = ''
  }
}

function onCancel() {
  resetState()
  emit('close')
}

function onBackdropClose() {
  onCancel()
}

function onSave() {
  if (!pendingFile.value || fileError.value) return
  emit('save', pendingFile.value)
  emit('close')
}
</script>
