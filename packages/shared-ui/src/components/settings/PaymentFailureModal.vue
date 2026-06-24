<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
    @click.self="closeModal"
  >
    <div class="bg_secondary_color rounded-2xl max-w-md w-full p-6xl shadow-2xl border primary_border_color">
      <div class="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-6">
        <svg class="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      </div>

      <h3 class="heading_h6_semibold primary_text_color text-center mb-2">Payment Failed</h3>
      <p class="label_2_regular secondary_text_color text-center mb-6">
        We couldn't process your payment. Please try again or contact support if the problem persists.
      </p>

      <div class="space-y-3">
        <button
          @click="retryPayment"
          class="w-full primary_add_button py-3"
        >
          Try Again
        </button>
        <button
          @click="closeModal"
          class="w-full px-5xl py-3 rounded-lg label_1_semibold bg-gray-25 text-gray-900 border primary_border_color hover:bg-gray-100 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  isOpen: { type: Boolean, default: false },
})

const emit = defineEmits(['close', 'retry'])

const closeModal = () => {
  emit('close')
}

const retryPayment = () => {
  emit('retry')
}
</script>
