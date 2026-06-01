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
        aria-labelledby="list-remove-suppressed-title"
        class="relative z-[1] flex w-full max-w-[min(96vw,550px)] flex-col overflow-hidden rounded-[1.5rem] bg_secondary_color shadow-2xl primary_border_color"
        @click.stop
      >
        <div class="shrink-0 p-6xl">
          <h2 id="list-remove-suppressed-title" class="heading_h5_semibold primary_text_color">
            Remove suppressed contacts from this list
          </h2>
        </div>

        <div class="px-6xl pb-6xl">
          <p class="paragraph_p3_regular secondary_text_color">
            Suppressed contacts will be removed from this list, but they will remain suppressed
            in your audience.
          </p>
          <p class="mt-md paragraph_p3_regular secondary_text_color">
            This may take a few moments depending on list size.
          </p>

          <p v-if="error" class="mt-5xl label_2_regular text-error-600">
            {{ error }}
          </p>
        </div>

        <div class="h-px w-[90%] m-auto shrink-0 bg-info-50" />

        <div class="flex shrink-0 justify-center gap-md p-6xl">
          <button
            type="button"
            class="w-full inline-flex min-h-[2.75rem] items-center justify-center rounded-lg bg-gray-25 px-5xl py-xl label_1_semibold primary_text_color transition-colors hover:bg-info-100 disabled:cursor-not-allowed disabled:opacity-50"
            :disabled="loading"
            @click="onCancel"
          >
            Cancel
          </button>
          <button
            type="button"
            class="w-full inline-flex min-h-[2.75rem] min-w-[7rem] items-center justify-center rounded-lg px-5xl py-xl label_1_semibold modal_primary_button transition-colors disabled:cursor-not-allowed disabled:opacity-60"
            :disabled="loading"
            @click="onConfirm"
          >
            {{ loading ? 'Cleaning up…' : 'Clean up list' }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
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
