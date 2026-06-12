<template>
  <div
    v-if="open"
    class="fixed inset-0 z-[60] flex items-center justify-center bg_overlay"
    @click="$emit('close')"
  >
    <div
      class="relative max-w-xl w-[90%] md:w-full bg_secondary_color rounded-lg shadow-2xl overflow-hidden"
      @click.stop
    >
      <div class="flex items-start justify-between gap-md p-6xl">
        <div class="flex min-w-0 items-center gap-md">
          <div
            v-if="showHeaderIcon"
            class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-error-50"
            aria-hidden="true"
          >
            <img :src="WarningIcon" alt="" class="h-5 w-5" />
          </div>
          <h2 class="heading_h5_semibold primary_text_color">{{ title }}</h2>
        </div>
        <button
          @click="$emit('close')"
          aria-label="Close"
          class="bg-gray-25 p-xl rounded-lg hover:bg-gray-50"
        >
          <svg class="w-5 h-5" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M11.4697 3.46973C11.7626 3.17685 12.2374 3.17684 12.5303 3.46973C12.8231 3.76262 12.8231 4.23741 12.5303 4.53027L9.06055 8L12.5303 11.4697C12.8231 11.7626 12.8231 12.2374 12.5303 12.5303C12.2374 12.8231 11.7626 12.8231 11.4697 12.5303L8 9.06055L4.53027 12.5303C4.23741 12.8231 3.76263 12.8231 3.46973 12.5303C3.17683 12.2374 3.17683 11.7626 3.46973 11.4697L6.93945 8L3.46973 4.53027C3.17683 4.23738 3.17683 3.76262 3.46973 3.46973C3.76262 3.17685 4.23739 3.17684 4.53027 3.46973L8 6.93945L11.4697 3.46973Z" fill="#1D2125"/>
          </svg>
        </button>
      </div>

      <div class="block h-[1px] w-full bg-gray-25"></div>

      <div class="px-6xl">
        <div v-if="message" class="mt-5xl">
          <p class="label_1_regular secondary_text_color">{{ message }}</p>
        </div>

        <div v-if="warningMessage" class="mt-5xl">
          <div class="flex items-center gap-md bg-warning-50 rounded-lg p-xl">
            <img :src="WarningIconOrange" alt="Warning" class="w-5 h-5 flex-shrink-0 mt-0.5">
            <p class="body_3_medium text-warning-700">{{ warningMessage }}</p>
          </div>
        </div>

        <p v-if="errorMessage" class="mt-5xl label_2_regular text-red-600">
          {{ errorMessage }}
        </p>
      </div>

      <div class="block h-[1px] w-full bg-gray-25 mt-6xl"></div>

      <div class="flex items-center justify-end gap-4xl mt-6xl px-6xl pb-6xl">
        <button
          type="button"
          @click="$emit('close')"
          class="p-xl rounded-lg bg_primary_color label_1_semibold primary_text_color"
        >
          {{ cancelLabel }}
        </button>
        <button
          type="button"
          :disabled="loading"
          @click="handleDelete"
          class="p-xl rounded-lg label_1_semibold disabled:cursor-not-allowed disabled:opacity-60"
          :class="confirmButtonClass"
        >
          {{ loading ? loadingLabel : confirmLabel }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import WarningIcon from '../../assets/images/WarningIcon.svg'
import WarningIconOrange from '../../assets/images/WarningIconOrange.svg'

defineProps({
  showHeaderIcon: {
    type: Boolean,
    default: false,
  },
  confirmButtonClass: {
    type: String,
    default: 'modal_primary_button',
  },
  open: {
    type: Boolean,
    default: false,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  errorMessage: {
    type: String,
    default: '',
  },
  title: {
    type: String,
    default: 'Delete post?',
  },
  message: {
    type: String,
    default: 'Are you sure you want to delete this post?',
  },
  warningMessage: {
    type: String,
    default: 'Note: This action cannot be undone, and the post will be permanently removed from your calendar.',
  },
  cancelLabel: {
    type: String,
    default: 'Cancel',
  },
  confirmLabel: {
    type: String,
    default: 'Delete',
  },
  loadingLabel: {
    type: String,
    default: 'Deleting…',
  },
})

const emit = defineEmits(['close', 'confirm'])

const handleDelete = () => {
  emit('confirm')
}
</script>
