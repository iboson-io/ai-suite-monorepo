<template>
  <!-- Backdrop -->
  <div
    v-if="open"
    class="fixed inset-0 z-[60] flex items-center justify-center bg_overlay"
    @click="onBackdropClick"
  >
    <!-- Modal -->
    <div
      class="relative w-full max-w-lg mx-4 bg_secondary_color rounded-2xl shadow-2xl overflow-hidden p-4"
      @click.stop
    >
      <div class="flex justify-center">
        <img :src="TrashIcon" alt="" class="h-16 w-16 opacity-90" />
      </div>

      <div class="mt-6xl">
        <h2 class="heading_h6_semibold primary_text_color">
          Delete this product?
        </h2>
        <p class="label_2_regular primary_text_color mt-md">
          <template v-if="productName">
            “{{ productName }}” will be removed permanently. This cannot be undone.
          </template>
          <template v-else>
            This product will be removed permanently. This cannot be undone.
          </template>
        </p>
        <p v-if="error" class="mt-xl label_2_regular text-error-600">
          {{ error }}
        </p>
      </div>

      <div class="flex justify-between mt-6xl gap-3">
        <button
          type="button"
          :disabled="loading"
          class="px-3xl py-xl rounded-lg bg-gray-25 label_1_semibold primary_text_color disabled:opacity-50 disabled:cursor-not-allowed"
          @click="$emit('close')"
        >
          Cancel
        </button>
        <button
          type="button"
          :disabled="loading"
          class="flex items-center justify-center px-3xl py-xl rounded-lg label_1_semibold primary_2_text_color bg-error-600 disabled:opacity-50 disabled:cursor-not-allowed"
          @click="$emit('confirm')"
        >
          {{ loading ? "Deleting…" : "Delete product" }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import TrashIcon from "../../../assets/images/TrashIcon.svg";

const props = defineProps({
  open: Boolean,
  loading: Boolean,
  error: {
    type: String,
    default: "",
  },
  productName: {
    type: String,
    default: "",
  },
});

const emit = defineEmits(["close", "confirm"]);

function onBackdropClick() {
  if (props.loading) return;
  emit("close");
}
</script>

<style scoped>
/* Additional styling if needed */
</style>
