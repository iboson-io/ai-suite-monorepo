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
        aria-labelledby="create-tag-title"
        class="relative z-[1] flex w-full max-w-[min(96vw,520px)] flex-col overflow-hidden rounded-[1.5rem] bg_secondary_color shadow-2xl primary_border_color"
        @click.stop
      >
        <!-- Header -->
        <div class="shrink-0 px-6xl pb-4xl pt-6xl">
          <h2 id="create-tag-title" class="heading_h6_semibold primary_text_color">
            What should we name this tag?
          </h2>
        </div>
        <div class="h-px w-full shrink-0 bg-[#D7DBDF]" />

        <!-- Body -->
        <div class="px-6xl py-5xl">
          <label class="block">
            <span class="label_2_semibold primary_text_color">Tag name</span>
            <input
              v-model="tagName"
              type="text"
              class="mt-md block w-full rounded-lg regular_border_color bg_secondary_color py-3xl pl-3xl pr-3xl label_2_medium primary_text_color outline-none transition-colors placeholder:text-gray-400 focus:border-[3px] focus:border-[#D9E2FC]"
              autocomplete="off"
              @keydown.enter.prevent="onSubmit"
            />
          </label>
          <p class="mt-md label_2_medium primary_text_color">
            Examples: Conference Lead, Influencer, or Donor
          </p>
        </div>

        <div class="h-px w-full shrink-0 bg-[#D7DBDF]" />

        <!-- Footer -->
        <div class="flex shrink-0 justify-end gap-md px-6xl py-4xl">
          <button
            type="button"
            class="inline-flex min-h-[2.75rem] items-center justify-center rounded-lg bg-info-50 px-5xl py-lg label_1_semibold primary_text_color transition-colors"
            @click="onCancel"
          >
            Cancel
          </button>
          <button
            type="button"
            :disabled="!canCreate"
            class="inline-flex min-w-[5.5rem] items-center justify-center rounded-lg px-5xl label_1_semibold transition-colors"
            :class="canCreate ? 'min-h-[2.75rem] primary_add_button py-lg' : 'modal_disabled_primary_button'"
            @click="onSubmit"
          >
            Create
          </button>
        </div>
      </div>
    </div>
  </Teleport>

  <SuccessToastNotification
    :open="showSuccessToast"
    main-message="Successfully created your new tag"
    @close="showSuccessToast = false"
  />
</template>

<script setup>
import { ref, computed, watch, onUnmounted, nextTick } from 'vue'
import { SuccessToastNotification } from '@ai-suite/shared-ui'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'create', 'cancel'])

const tagName = ref('')
const showSuccessToast = ref(false)

const canCreate = computed(() => tagName.value.trim().length > 0)

function reset() {
  tagName.value = ''
}

function close() {
  emit('update:modelValue', false)
}

function onBackdropClick() {
  close()
}

function onCancel() {
  emit('cancel')
  close()
}

function onSubmit() {
  if (!canCreate.value) return
  const name = tagName.value.trim()
  emit('create', { name })
  close()
  nextTick(() => {
    showSuccessToast.value = true
    setTimeout(() => {
      showSuccessToast.value = false
    }, 3000)
  })
}

function onEscapeKey(e) {
  if (e.key === 'Escape' && props.modelValue) {
    close()
  }
}

watch(
  () => props.modelValue,
  (open) => {
    if (open) {
      reset()
      showSuccessToast.value = false
      window.addEventListener('keydown', onEscapeKey)
    } else {
      window.removeEventListener('keydown', onEscapeKey)
    }
  }
)

onUnmounted(() => {
  window.removeEventListener('keydown', onEscapeKey)
})
</script>
