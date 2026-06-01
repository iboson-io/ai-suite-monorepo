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
        aria-labelledby="list-delete-modal-title"
        class="relative z-[1] flex w-full max-w-[min(96vw,550px)] flex-col overflow-hidden rounded-[1.5rem] bg_secondary_color shadow-2xl primary_border_color"
        @click.stop
      >
        <div class="flex shrink-0 items-start justify-between gap-md p-6xl">
          <h2 id="list-delete-modal-title" class="heading_h6_semibold primary_text_color">
            {{ modalTitle }}
          </h2>
          <button
            type="button"
            class="shrink-0 rounded-lg bg-gray-25 p-sm transition-colors hover:bg-gray-50"
            aria-label="Close"
            :disabled="loading"
            @click="onCancel"
          >
            <svg class="h-4 w-4" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path
                d="M11.4697 3.46973C11.7626 3.17685 12.2374 3.17684 12.5303 3.46973C12.8231 3.76262 12.8231 4.23741 12.5303 4.53027L9.06055 8L12.5303 11.4697C12.8231 11.7626 12.8231 12.2374 12.5303 12.5303C12.2374 12.8231 11.7626 12.8231 11.4697 12.5303L8 9.06055L4.53027 12.5303C4.23741 12.8231 3.76263 12.8231 3.46973 12.5303C3.17683 12.2374 3.17683 11.7626 3.46973 11.4697L6.93945 8L3.46973 4.53027C3.17683 4.23738 3.17683 3.76262 3.46973 3.46973C3.76262 3.17685 4.23739 3.17684 4.53027 3.46973L8 6.93945L11.4697 3.46973Z"
                fill="#1D2125"
              />
            </svg>
          </button>
        </div>

        <div class="h-px w-full shrink-0 bg-info-50" />

        <div class="px-6xl py-5xl">
          <p class="paragraph_p3_regular secondary_text_color">
            These contacts will be permanently removed from your audience.
          </p>

          <div class="mt-5xl flex items-start gap-md rounded-lg bg-error-100 p-xl">
           <svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
           <path d="M12.5 1.11658C13.7569 1.84229 14.8025 2.88368 15.5332 4.13766C16.2639 5.39164 16.6545 6.81472 16.6662 8.26603C16.6779 9.71733 16.3104 11.1465 15.6 12.4122C14.8896 13.6778 13.861 14.7359 12.616 15.4818C11.371 16.2278 9.95281 16.6356 8.50175 16.665C7.05069 16.6943 5.61713 16.3442 4.34296 15.6493C3.0688 14.9543 1.99823 13.9387 1.23722 12.7028C0.476219 11.467 0.0511744 10.0538 0.00416676 8.60324L0 8.33324L0.00416676 8.06324C0.050836 6.62407 0.469623 5.22155 1.2197 3.9924C1.96978 2.76326 3.02554 1.74945 4.28408 1.04981C5.54261 0.350171 6.96096 -0.0114257 8.40084 0.000275205C9.84072 0.0119761 11.253 0.396575 12.5 1.11658ZM7.0925 5.94991C6.9179 5.84598 6.71134 5.80941 6.51167 5.8471C6.31201 5.88479 6.13299 5.99413 6.00829 6.15456C5.88359 6.31499 5.82181 6.51545 5.83455 6.71825C5.8473 6.92104 5.9337 7.11219 6.0775 7.25574L7.15417 8.33324L6.0775 9.41074L6.00833 9.48908C5.87882 9.65657 5.81792 9.86708 5.838 10.0778C5.85808 10.2886 5.95763 10.4838 6.11644 10.6239C6.27524 10.7639 6.48139 10.8382 6.69301 10.8318C6.90464 10.8253 7.10587 10.7385 7.25583 10.5891L8.33333 9.51241L9.41083 10.5891L9.48917 10.6582C9.65666 10.7878 9.86717 10.8487 10.0779 10.8286C10.2887 10.8085 10.4839 10.7089 10.624 10.5501C10.764 10.3913 10.8383 10.1852 10.8319 9.97356C10.8254 9.76194 10.7386 9.56071 10.5892 9.41074L9.5125 8.33324L10.5892 7.25574L10.6583 7.17741C10.7878 7.00992 10.8487 6.79941 10.8287 6.58864C10.8086 6.37787 10.709 6.18265 10.5502 6.04262C10.3914 5.90259 10.1853 5.82826 9.97365 5.83472C9.76203 5.84118 9.5608 5.92795 9.41083 6.07741L8.33333 7.15408L7.25583 6.07741L7.1775 6.00824L7.0925 5.94991Z" fill="#F97066"/>
             </svg>
            <p class="body_3_medium text-error-600">
              Note: This action cannot be undone.
            </p>
          </div>

          <p v-if="error" class="mt-5xl label_2_regular text-error-600">
            {{ error }}
          </p>
        </div>

        <div class="h-px w-full shrink-0 bg-info-50" />

        <div class="flex shrink-0 justify-end gap-md p-6xl">
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
            {{ loading ? 'Deleting…' : 'Delete' }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  count: {
    type: Number,
    default: 0
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

const modalTitle = computed(() => {
  const n = props.count
  const label = n === 1 ? 'Contact' : 'Contacts'
  return `Delete ${n} ${label}?`
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
}
</script>
