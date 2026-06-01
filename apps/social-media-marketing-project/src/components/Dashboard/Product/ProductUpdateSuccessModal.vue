<template>
  <!-- Backdrop -->
  <div
    v-if="open"
    class="fixed inset-0 z-[60] flex items-center justify-center bg_overlay"
    @click="$emit('close')"
  >
    <!-- Modal -->
    <div
      class="relative w-full max-w-md bg_secondary_color rounded-2xl shadow-2xl overflow-hidden p-6xl"
      @click.stop
    >
      <img :src="SucessImage" alt="">

      <!-- Text Content -->
      <div class="mt-6xl">
        <h2 class="heading_h6_semibold primary_text_color">{{ title }}</h2>
        <p class="label_2_medium secondary_text_color mt-sm">
          {{ subtitle }}
        </p>
      </div>

      <!-- Action Buttons -->
      <div class="mt-6xl flex justify-between gap-md">
        <button
          @click="handleGoToChat"
          class="flex-1 py-xl px-xxl rounded-lg border label_1_semibold primary_text_color bg_primary_color primary_border_color"
        >
          {{ buttonLeftText }}
        </button>
        <button
          @click="handleViewProduct"
          class="flex-1 modal_primary_button py-xl px-5xl rounded-lg label_1_semibold"
        >
          {{ buttonRightText }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import SucessImage from "../../../assets/images/SucessImage.png"

const props = defineProps({
  open: Boolean,
  title: {
    type: String,
    default: 'Product details updated successfully',
  },
  subtitle: {
    type: String,
    default: 'Your latest changes have been saved and applied.',
  },
  buttonLeftText: {
    type: String,
    default: 'Go to Chat',
  },
  buttonRightText: {
    type: String,
    default: 'View Product',
  },
});

const emit = defineEmits(['close', 'goToChat', 'viewProduct']);

const handleGoToChat = () => {
  emit('goToChat');
  emit('close');
};

const handleViewProduct = () => {
  emit('viewProduct');
  emit('close');
};
</script>
