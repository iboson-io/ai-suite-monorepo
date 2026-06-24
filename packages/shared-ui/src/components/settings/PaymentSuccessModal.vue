<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
    @click.self="closeModal"
  >
    <div class="bg_secondary_color rounded-2xl max-w-md w-full p-6xl shadow-2xl border primary_border_color">
      <div class="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
        <svg class="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
      </div>

      <h3 class="heading_h6_semibold primary_text_color text-center mb-2">Payment Successful!</h3>
      <p class="label_2_regular secondary_text_color text-center mb-6">
        Your subscription has been activated successfully. Welcome to your new plan!
      </p>

      <div v-if="subscriptionId || planName" class="bg-gray-25 rounded-xl p-4xl mb-6 border primary_border_color">
        <div class="space-y-2 label_2_regular">
          <div v-if="subscriptionId" class="flex justify-between gap-md">
            <span class="secondary_text_color">Subscription ID:</span>
            <span class="primary_text_color font-medium text-right break-all">{{ subscriptionId }}</span>
          </div>
          <div v-if="planName" class="flex justify-between gap-md">
            <span class="secondary_text_color">Plan:</span>
            <span class="primary_text_color font-medium">{{ planName }}</span>
          </div>
          <div class="flex justify-between gap-md">
            <span class="secondary_text_color">Status:</span>
            <span class="text-green-600 font-medium">Active</span>
          </div>
        </div>
      </div>

      <button
        @click="closeModal"
        class="w-full primary_add_button py-3"
      >
        Continue
      </button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  isOpen: { type: Boolean, default: false },
  subscriptionId: { type: String, default: '' },
  planName: { type: String, default: '' },
})

const emit = defineEmits(['close'])

const closeModal = () => {
  emit('close')
}
</script>
