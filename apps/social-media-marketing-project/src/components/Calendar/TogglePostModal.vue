<template>
  <div
    v-if="open"
    ref="dropdownRef"
    class="absolute left-0 bottom-full  py-md bg_secondary_color rounded-lg shadow-2xl primary_border_color z-50 min-w-[200px]  post-dropdown-menu"
    @click.stop
    @touchstart.stop
  >
    <!-- Share Now -->
    <button
      @click="handleShare"
      class="w-full px-4 py-2.5 flex items-center gap-md"
    >
    <img :src="ShareIcon" alt="Share" class="w-4 h-4">
      <span class="label_2_medium primary_text_color">Share Now</span>  
    </button>
    <div class="block h-[1px] w-full bg-gray-25 mt-xs"></div>
    <!-- Regenerate Post -->
    <button
      @click="handleRegenerate"
      class="w-full px-4 py-2.5 flex items-center mt-xs gap-md"
    >
      <img :src="ImageEditIcon" alt="Edit" class="w-4 h-4">
      <span class="label_2_medium primary_text_color">Regenerate Post</span>
    </button>
    <div class="block h-[1px] w-full bg-gray-25 mt-xs gap-md"></div>
    <!-- Delete -->
    <button
      @click="handleDelete"
      class="w-full px-4 py-2.5 flex items-center mt-xs gap-md"
    >
      <img :src="TrashIcon" alt="Delete" class="w-4 h-4">
      <span class="label_2_medium delete_text_color">Delete</span>
    </button>
  </div>
</template>

<script setup>
import { ref } from "vue";
import ShareIcon from "../../assets/images/ShareIcon.svg";
import ImageEditIcon from "../../assets/images/ImageEditIcon.svg";
import TrashIcon from "../../assets/images/TrashIcon.svg";

const props = defineProps({
  open: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['close', 'share', 'regenerate', 'delete']);

const dropdownRef = ref(null);

// Expose ref for parent component
defineExpose({
  dropdownRef
});

const handleShare = () => {
  emit('share');
  emit('close');
};

const handleRegenerate = () => {
  emit('regenerate');
  emit('close');
};

const handleDelete = () => {
  emit('delete');
  emit('close');
};
</script>

<style scoped>
/* Component-specific styles if needed */
</style>

