<template>
  <!-- Backdrop -->
  <div
    v-if="open"
    class="fixed inset-0 z-[60] flex items-center justify-center bg_overlay"
    @click="$emit('close')"
  >
    <!-- Modal -->
    <div
      class="relative w-full max-w-md  bg_secondary_color rounded-2xl shadow-2xl overflow-hidden p-6xl"
      @click.stop
    >

     <img :src="SucessImage" alt="">

      <!-- Text Content -->
      <div class="mt-6xl">
        <h2 class="heading_h6_semibold primary_text_color">{{ title }}</h2>
        <p class="label_2_medium secondary_text_color mt-sm">
          <template v-if="subtitle">{{ subtitle }}</template>
          <template v-else>Your post is set for {{ scheduledDate }}.</template>
        </p>
      </div>

      <!-- Action Buttons -->
      <div class="mt-6xl flex justify-between">
        <button
          @click="handleViewCalendar"
          class=" py-xl px-xxl rounded-lg border label_1_semibold primary_text_color bg_primary_color primary_border_color"
        >
          View in calendar
        </button>
        <button
          @click="handleDone"
          class="modal_primary_button py-xl px-5xl rounded-lg label_1_semibold"
        >
          Done
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
  import SucessImage from "../../../assets/images/SucessImage.png"
const props = defineProps({
  open: Boolean,
  /** When set, replaces the default “Your post is set for …” line (e.g. after an update). */
  subtitle: {
    type: String,
    default: '',
  },
  title: {
    type: String,
    default: 'Post scheduled',
  },
  scheduledDate: {
    type: String,
    default: 'Oct 30 at 10:00 AM',
  },
});

const emit = defineEmits(['close', 'viewCalendar']);

const handleViewCalendar = () => {
  emit('viewCalendar');
  emit('close');
};

const handleDone = () => {
  emit('close');
};
</script>

