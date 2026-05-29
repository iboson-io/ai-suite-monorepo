<template>
  <!-- Backdrop -->
  <div
    v-if="open"
    class="fixed inset-0 z-[60] flex items-center justify-center bg_overlay"
    @click="$emit('close')"
  >
    <!-- Modal -->
    <div
      class="relative w-full max-w-[23em] md:max-w-md bg_secondary_color rounded-2xl shadow-2xl overflow-hidden p-6xl"
      @click.stop
    >
      <!-- Text Content Section -->
      <div>
        <h2 class="heading_h6_semibold primary_text_color">
          {{ title }}
        </h2>
        <p class="label_1_medium secondary_text_color mt-6xl">
          {{ message }}
        </p>
      </div>
       <div class="block h-[1px] w-full bg-gray-25  mt-6xl"></div>
      <!-- Action Button -->
      <div class="flex justify-center mt-6xl">
        <button
          @click="handleAction"
          class="primary_button_semibold rounded-lg w-full"
        >
          {{ buttonText }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  open: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: 'Success!',
  },
  message: {
    type: String,
    default: 'Operation completed successfully.',
  },
  buttonText: {
    type: String,
    default: 'OK',
  },
});

const emit = defineEmits(['close', 'action']);

const handleAction = () => {
  emit('action');
  emit('close');
};
</script>

