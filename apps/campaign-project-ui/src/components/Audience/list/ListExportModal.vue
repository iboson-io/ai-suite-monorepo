<template>
  <Teleport to="body">
    <div
      v-if="modelValue"
      class="fixed inset-0 z-[110] flex items-center justify-center p-4"
      role="presentation"
    >
      <div
        class="absolute inset-0 bg-black-800/45 backdrop-blur-[2px]"
        aria-hidden="true"
        @click="onBackdropClick"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="list-export-modal-title"
        class="relative z-[1] flex w-full max-w-[min(96vw,550px)] flex-col overflow-hidden rounded-[1.5rem] bg_secondary_color shadow-2xl primary_border_color"
        @click.stop
      >
        <div class="flex shrink-0 items-start justify-between gap-md p-6xl">
          <h2 id="list-export-modal-title" class="heading_h6_semibold primary_text_color">
            Export contacts
          </h2>
        </div>

        <div class="h-px w-full shrink-0 bg-info-50" />

        <div class="p-6xl">
          <p class="label_1_medium primary_text_color">
            {{ exportDescription }}
          </p>

          <div class="mt-5xl flex items-start gap-md rounded-lg bg-blue-25 p-md">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
<circle cx="9.99935" cy="9.99935" r="8.33333" fill="#0068CF"/>
<path d="M7.91602 6.87435C7.91602 5.72376 8.84876 4.79102 9.99935 4.79102C11.1499 4.79102 12.0827 5.72376 12.0827 6.87435C12.0827 7.28909 11.9615 7.67552 11.7526 8.00017C11.13 8.96776 9.99935 9.89042 9.99935 11.041V11.5618" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
<path d="M9.99003 15.207H9.99939" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>

            <p class="body_3_medium text-blue-300">
              Note: Preparing your CSV export may take a few moments.
            </p>
          </div>

          <p v-if="error" class="mt-5xl label_2_regular text-error-600">
            {{ error }}
          </p>
        </div>

        <div class="h-px w-full shrink-0 bg-info-50" />

        <div class="flex shrink-0 justify-end gap-md p-5xl">
          <button
            type="button"
            class="inline-flex min-h-[2.75rem] items-center justify-center rounded-lg bg-gray-25 px-xxl py-xl label_1_semibold primary_text_color transition-colors hover:bg-info-100 disabled:cursor-not-allowed disabled:opacity-50"
            :disabled="loading"
            @click="onCancel"
          >
            Cancel
          </button>
          <button
            type="button"
            class="inline-flex min-h-[2.75rem] min-w-[7rem] items-center justify-center rounded-lg px-xxl py-xl label_1_semibold modal_primary_button transition-colors disabled:cursor-not-allowed disabled:opacity-60"
            :disabled="loading"
            @click="onConfirm"
          >
            {{ loading ? 'Exporting…' : 'Export CSV' }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>

  <SuccessToastNotification
    :open="showExportSuccessToast"
    main-message="Your contacts have been exported successfully"
    @close="showExportSuccessToast = false"
  />
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { SuccessToastNotification } from '@ai-suite/shared-ui'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  contactCount: {
    type: Number,
    default: 0
  },
  listName: {
    type: String,
    default: ''
  },
  loading: {
    type: Boolean,
    default: false
  },
  error: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:modelValue', 'confirm', 'cancel'])

const showExportSuccessToast = ref(false)

const exportDescription = computed(() => {
  const count = props.contactCount.toLocaleString('en-US')
  const label = props.contactCount === 1 ? 'contact' : 'contacts'
  const name = props.listName?.trim() || 'this list'
  return `${count} ${label} from '${name}' will be exported as a CSV file.`
})

function close() {
  emit('update:modelValue', false)
}

function onBackdropClick() {
  if (props.loading) return
  close()
  emit('cancel')
}

function onCancel() {
  if (props.loading) return
  close()
  emit('cancel')
}

function onConfirm() {
  if (props.loading) return
  emit('confirm')
  close()
  nextTick(() => {
    showExportSuccessToast.value = true
    setTimeout(() => {
      showExportSuccessToast.value = false
    }, 3000)
  })
}

watch(
  () => props.modelValue,
  (open) => {
    if (open) showExportSuccessToast.value = false
  }
)
</script>
