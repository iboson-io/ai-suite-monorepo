<template>
  <div class="flex h-full min-h-0 flex-col gap-4xl overflow-hidden sm:gap-8xl">

    <div class="shrink-0 rounded-lg bg_secondary_color p-6xl">
    <h2 class="heading_h6_bold primary_text_color">Upload a file</h2>
    <p class="mt-sm max-w-3xl label_1_regular secondary_text_color">
      Choose how to import your contacts. Each contact must include an Email Address, Phone
      Number, or External ID along with any additional fields you would like to import.
    </p>

    <!-- Stepper -->
    <div class="mt-6xl flex flex-wrap gap-md">
      <button
        v-for="step in wizardSteps"
        :key="step.id"
        type="button"
        class="flex items-center justify-center rounded-2xl border border-blue-50 px-3xl py-xl whitespace-nowrap profile_tab_border transition-colors"
        :class="currentStep === step.id ? 'bg-blue-25' : 'bg_secondary_color'"
        :disabled="!isStepAccessible(step.id)"
        @click="goToStep(step.id)"
      >
        <span class="body_3_medium text-blue-300">{{ step.label }}</span>
      </button>
    </div>
    </div>

    <!-- Upload step -->
    <div
      v-if="currentStep === 'upload'"
      class="flex min-h-0 flex-1 flex-col overflow-hidden"
    >
      <input
        ref="fileInputRef"
        type="file"
        class="hidden"
        accept=".csv,.txt,.xlsx,text/csv,text/plain,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        @change="onFileInputChange"
      />

      <!-- Idle: drag & drop -->
      <div
        v-if="uploadPhase === 'idle'"
        class="flex min-h-0 flex-1 flex-col rounded-lg bg_secondary_color p-4xl sm:p-6xl"
      >
        <div
          ref="dropZoneRef"
          class="flex min-h-0 flex-1 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 px-4xl py-6xl text-center transition-colors sm:px-6xl"
          :class="isDragOver ? 'border-[#D9E2FC] bg-info-50' : 'bg_secondary_color'"
          @click="fileInputRef?.click()"
          @drop.prevent="handleDrop"
          @dragover.prevent
          @dragenter.prevent="isDragOver = true"
          @dragleave="onDragLeave"
        >
          <div class="flex flex-col items-center justify-center gap-5xl sm:gap-7xl">
            <img :src="UploadImageIcon" alt="" class="h-12 w-12 sm:h-16 sm:w-16" />
            <p class="label_2_medium secondary_text_color max-w-md px-md">
              Drag &amp; drop your files here or
              <span class="font-semibold primary_text_color">browse</span>
              to upload
            </p>
            <p class="label_3_regular text-[#A7ABB3]">
              Max file size: 200 MB (CSV, TXT), 50 MB (XLSX)
            </p>
          </div>
        </div>
      </div>
      <!-- File selected: uploading or completed -->
      <div
        v-else
        class="shrink-0 rounded-lg border primary_border_color p-5xl bg_secondary_color h-full"
      >
        <div class="flex items-start justify-between gap-md border border-info-50 py-xl px-3xl rounded-lg">
          <div class="flex min-w-0 flex-1 gap-md">
            <img :src="UploadaImageIcon" alt="" class="h-12xl w-12xl shrink-0" />
            <div class="min-w-0">
              <p class="label_3_bold primary_text_color truncate">
                {{ fileMeta.name }}
              </p>
              <p
                v-if="uploadPhase === 'uploading'"
                class="mt-xs label_3_regular secondary_text_color"
              >
                {{ formatFileSize(fileMeta.uploaded) }} of
                {{ formatFileSize(fileMeta.size) }}
              </p>
              <p v-else class="mt-xs label_3_regular secondary_text_color">
                {{ formatFileSize(fileMeta.size) }}
              </p>
              <p
                v-if="uploadPhase === 'completed'"
                class="mt-sm flex items-center gap-1 label_3_regular text-success-600"
              >
                <img :src="GreenTickIcon" alt="" class="h-4 w-4" />
                Completed
              </p>
            </div>
          </div>
          <button
            v-if="uploadPhase === 'completed'"
            type="button"
            class="shrink-0 text-[#6B7280] transition-colors hover:text-[#4B5563]"
            aria-label="Remove file"
            @click="clearFile"
          >
            <img :src="DeleteIcon" alt="" class="h-4 w-4" />
          </button>
        </div>

        <!-- Progress -->
        <div v-if="uploadPhase === 'uploading'" class="mt-4xl flex items-center gap-md">
          <svg
            class="h-4 w-4 shrink-0 animate-spin"
            viewBox="0 0 16 16"
            fill="none"
            aria-hidden="true"
          >
            <circle cx="8" cy="8" r="7" stroke="#E5E7EB" stroke-width="2" />
            <path
              d="M8 1C10.7614 1 13 3.23858 13 6"
              stroke="#22C55E"
              stroke-width="2"
              stroke-linecap="round"
            />
          </svg>
          <div class="h-2 min-w-0 flex-1 overflow-hidden rounded-full bg-success-100">
            <div
              class="h-full rounded-full bg-success-600 transition-all duration-300 ease-out"
              :style="{ width: `${fileMeta.progress}%` }"
            />
          </div>
          <button
            type="button"
            class="shrink-0 text-[#6B7280] transition-colors hover:text-[#4B5563]"
            aria-label="Cancel upload"
            @click="clearFile"
          >
            <img :src="CloseIcon" alt="" class="h-4 w-4" />
          </button>
        </div>

        <!-- Success banner -->
        <div
          v-if="uploadPhase === 'completed'"
          class="mt-4xl flex items-center gap-sm rounded-lg bg-success-50 px-xl py-lg"
        >
          <img :src="GreenTickIcon" alt="" class="h-4 w-4 shrink-0" />
          <span class="label_2_medium text-success-700">
            All columns mapped — {{ readyContactCount.toLocaleString('en-US') }} contacts ready
            to import
          </span>
        </div>

        <!-- Subscription status -->
        <div class="relative mt-6xl">
          <label class="inline-flex items-center gap-xs label_1_bold primary_text_color">
            Subscription status
            <button
              type="button"
              class="inline-flex h-4 w-4 items-center justify-center rounded-full regular_border_color text-[10px] font-semibold leading-none text-gray-500"
              aria-label="Subscription status help"
            >
              ?
            </button>
          </label>
          <div ref="subscriptionDropdownRoot" class="relative mt-md">
            <button
              type="button"
              class="product-select relative flex w-1/2 items-center rounded-lg regular_border_color bg_secondary_color py-xxl pl-xxl pr-10xl label_2_medium primary_text_color"
              :class="isSubscriptionOpen ? 'border-[3px] border-[#D9E2FC]' : ''"
              @click="toggleSubscriptionDropdown"
            >
              <span class="truncate">{{ subscriptionStatus }}</span>
              <img
                :src="DownArrow"
                alt=""
                class="pointer-events-none absolute right-3 top-1/2 h-3 w-3 -translate-y-1/2 md:right-4"
              />
            </button>
            <div
              v-if="isSubscriptionOpen"
              class="absolute left-0 right-0 top-full z-20 mt-sm overflow-hidden rounded-md bg_secondary_color shadow-lg primary_border_color"
              @click.stop
            >
              <button
                v-for="opt in subscriptionOptions"
                :key="opt"
                type="button"
                class="flex w-full px-xl py-3xl text-left label_2_medium transition-colors hover:bg-info-50"
                :class="
                  subscriptionStatus === opt ? 'bg-info-50 primary_text_color' : 'primary_text_color'
                "
                @click="selectSubscription(opt)"
              >
                {{ opt }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <p v-if="fileError" class="mt-md label_2_medium text-error-600">{{ fileError }}</p>
    </div>

    <DataMatch v-else-if="currentStep === 'match'" class="min-h-0 flex-1 overflow-hidden" />

    <ReviewImport
      v-else-if="currentStep === 'review'"
      class="min-h-0 flex-1 overflow-auto"
      :total-contacts="readyContactCount"
      :fields-mapped="4"
      :tags-assigned="1"
      :rows-imported="readyContactCount"
      :rows-total="readyContactCount"
    />

    <!-- Footer -->
     <div class="shrink-0 rounded-lg bg_secondary_color p-md">
    <div class=" flex flex-wrap items-center justify-between gap-md">
      <button
        type="button"
        class="inline-flex min-h-[2.75rem] items-center justify-center rounded-lg bg-gray-25 px-8xl py-xl label_1_semibold primary_text_color transition-colors hover:bg-info-100"
        @click="onBack"
      >
        Back
      </button>
      <button
        type="button"
        class="inline-flex min-h-[2.75rem] items-center justify-center gap-2 rounded-lg px-8xl py-xl label_1_semibold transition-colors"
        :class="[
          currentStep === 'review' ? 'min-w-[10.5rem]' : 'min-w-[8rem]',
          canContinue ? 'primary_add_button' : 'modal_disabled_primary_button cursor-not-allowed'
        ]"
        :disabled="!canContinue"
        @click="onContinue"
      >
        {{ primaryActionLabel }}
        <img
          v-if="canContinue"
          :src="DoneArrowRight"
          alt=""
          class="h-4 w-4 brightness-0 invert"
        />
      </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import UploadImageIcon from '../../../assets/images/UploadImageIcon.svg'
import UploadaImageIcon from '../../../assets/images/UploadaImageIcon.svg'
import GreenTickIcon from '../../../assets/images/GreenTickIcon.svg'
import CloseIcon from '../../../assets/images/CloseIcon.svg'
import DeleteIcon from '../../../assets/images/DeleteIcon.svg'
import DownArrow from '../../../assets/images/DownArrow.svg'
import DoneArrowRight from '../../../assets/images/DoneArrowRight.svg'
import DataMatch from './DataMatch.vue'
import ReviewImport from './ReviewImport.vue'

const emit = defineEmits(['back', 'continue'])

const wizardSteps = [
  { id: 'upload', label: '1. Upload' },
  { id: 'match', label: '2. Match' },
  { id: 'review', label: '5. Review & Import' }
]

const subscriptionOptions = [
  'Email Subscribed',
  'Email Unsubscribed',
  'SMS Subscribed',
  'SMS Unsubscribed'
]

const currentStep = ref('upload')
const uploadPhase = ref('idle')
const isDragOver = ref(false)
const fileError = ref(null)
const fileInputRef = ref(null)
const dropZoneRef = ref(null)
const uploadTimerRef = ref(null)

const fileMeta = ref({
  name: '',
  size: 0,
  uploaded: 0,
  progress: 0
})

const readyContactCount = ref(2450)
const subscriptionStatus = ref('Email Subscribed')
const isSubscriptionOpen = ref(false)
const subscriptionDropdownRoot = ref(null)

const primaryActionLabel = computed(() =>
  currentStep.value === 'review' ? 'Complete import' : 'Continue'
)

const canContinue = computed(() => {
  if (currentStep.value === 'upload') return uploadPhase.value === 'completed'
  if (currentStep.value === 'match') return true
  if (currentStep.value === 'review') return true
  return false
})

function isStepAccessible(stepId) {
  if (stepId === 'upload') return true
  if (stepId === 'match') return uploadPhase.value === 'completed'
  if (stepId === 'review') return currentStep.value === 'review'
  return false
}

function goToStep(stepId) {
  if (!isStepAccessible(stepId)) return
  currentStep.value = stepId
}

function formatFileSize(bytes) {
  if (!bytes || bytes === 0) return '0 KB'
  const kb = bytes / 1024
  if (kb < 1024) return `${Math.round(kb)} KB`
  return `${(kb / 1024).toFixed(kb >= 100 ? 0 : 1)} MB`
}

function toggleSubscriptionDropdown() {
  isSubscriptionOpen.value = !isSubscriptionOpen.value
}

function selectSubscription(opt) {
  subscriptionStatus.value = opt
  isSubscriptionOpen.value = false
}

function onDragLeave(e) {
  if (dropZoneRef.value && !dropZoneRef.value.contains(e.relatedTarget)) {
    isDragOver.value = false
  }
}

function handleDrop(event) {
  isDragOver.value = false
  const file = event.dataTransfer?.files?.[0]
  if (file) validateAndStartUpload(file)
}

function onFileInputChange(e) {
  const file = e.target?.files?.[0]
  if (file) validateAndStartUpload(file)
}

function validateAndStartUpload(file) {
  fileError.value = null
  const name = file.name.toLowerCase()
  const isCsv = name.endsWith('.csv') || file.type === 'text/csv'
  const isTxt = name.endsWith('.txt') || file.type === 'text/plain'
  const isXlsx =
    name.endsWith('.xlsx') ||
    file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'

  if (!isCsv && !isTxt && !isXlsx) {
    fileError.value = 'Please upload a CSV, TXT, or XLSX file.'
    return
  }

  const maxBytes = isXlsx ? 50 * 1024 * 1024 : 200 * 1024 * 1024
  if (file.size > maxBytes) {
    fileError.value = isXlsx ? 'XLSX files must be 50 MB or smaller.' : 'File must be 200 MB or smaller.'
    return
  }

  startUpload(file)
}

function startUpload(file) {
  if (uploadTimerRef.value) {
    clearInterval(uploadTimerRef.value)
    uploadTimerRef.value = null
  }

  fileMeta.value = {
    name: file.name,
    size: file.size,
    uploaded: 0,
    progress: 0
  }
  uploadPhase.value = 'uploading'

  const step = Math.max(8, Math.floor(file.size / 120000))
  uploadTimerRef.value = setInterval(() => {
    const nextUploaded = Math.min(fileMeta.value.size, fileMeta.value.uploaded + step)
    const progress = file.size ? Math.round((nextUploaded / file.size) * 100) : 100
    fileMeta.value = {
      ...fileMeta.value,
      uploaded: nextUploaded,
      progress
    }
    if (nextUploaded >= file.size) {
      clearInterval(uploadTimerRef.value)
      uploadTimerRef.value = null
      uploadPhase.value = 'completed'
    }
  }, 80)
}

function clearFile() {
  if (uploadTimerRef.value) {
    clearInterval(uploadTimerRef.value)
    uploadTimerRef.value = null
  }
  uploadPhase.value = 'idle'
  fileMeta.value = { name: '', size: 0, uploaded: 0, progress: 0 }
  fileError.value = null
  if (fileInputRef.value) fileInputRef.value.value = ''
}

function onBack() {
  if (currentStep.value === 'review') {
    currentStep.value = 'match'
    return
  }
  if (currentStep.value === 'match') {
    currentStep.value = 'upload'
    return
  }
  emit('back')
}

function onContinue() {
  if (!canContinue.value) return
  if (currentStep.value === 'upload') {
    if (uploadPhase.value === 'completed') currentStep.value = 'match'
    return
  }
  if (currentStep.value === 'match') {
    currentStep.value = 'review'
    return
  }
  emit('continue', {
    fileName: fileMeta.value.name,
    subscriptionStatus: subscriptionStatus.value,
    contactCount: readyContactCount.value
  })
}

function handleDocumentClick(event) {
  if (!isSubscriptionOpen.value) return
  const el = subscriptionDropdownRoot.value
  if (el && el.contains(event.target)) return
  isSubscriptionOpen.value = false
}

onMounted(() => {
  document.addEventListener('click', handleDocumentClick, true)
})

onUnmounted(() => {
  document.removeEventListener('click', handleDocumentClick, true)
  if (uploadTimerRef.value) clearInterval(uploadTimerRef.value)
})
</script>
