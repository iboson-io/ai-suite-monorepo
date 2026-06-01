<template>
  <!-- Backdrop -->
  <div
    v-if="open"
    class="fixed inset-0 z-[60] flex items-center justify-center bg_overlay"
    @click="$emit('close')"
  >
    <!-- Modal -->
    <div
      class="relative w-full max-w-lg mx-4 bg_secondary_color rounded-2xl shadow-2xl overflow-hidden p-4"
      @click.stop
    >
       <img :src="SucessImage" alt="">

      <!-- Text Content Section -->
      <div class="mt-6xl">
        <h2 class="heading_h6_semibold primary_text_color">
          Your brand has been created successfully!
        </h2>
        <p class="label_2_regular primary_text_color">
          You can now start planning posts or generating content.
        </p>
      </div>

      <!-- Action Buttons -->
      <div class="flex justify-between mt-6xl">
        <button
          @click="handleViewProduct"
          class=" px-3xl py-xl rounded-lg bg-gray-25  label_1_semibold primary_text_color"
        >
          View Product
        </button>
        <button
          @click="handleGoToChat"
          class=" flex items-center justify-center px-3xl py-xl rounded-lg primary_button label_1_semibold"
        >
          <span>Go to Chat</span>
          <img :src="DoneArrowRight" alt="" class="w-4 h-4">
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import DoneArrowRight from "../../../assets/images/DoneArrowRight.svg";
import SucessImage from "../../../assets/images/SucessImage.png";

const props = defineProps({
  open: Boolean,
});

const emit = defineEmits(['close', 'viewProduct', 'goToChat']);

const handleViewProduct = () => {
  emit('viewProduct');
  emit('close');
};

const handleGoToChat = () => {
  emit('goToChat');
  emit('close');
};
</script>

<style scoped>
/* Additional styling if needed */
</style>

