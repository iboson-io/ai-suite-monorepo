<template>
  <div
    v-if="open"
    class="fixed top-4 right-4 z-[70] min-w-[min(100vw-2rem,400px)] max-w-[400px] rounded-2xl p-5xl shadow-[0_10px_24px_-4px_rgba(15,23,42,0.12)] md:top-6 md:right-6 overflow-hidden border transition-all"
    :class="{
      'bg_secondary_color border-transparent': type !== 'error' && type !== 'warning',
      'bg-[#FFF1F2] border-[#DA1E28]/25': type === 'error',
      'bg-[#FEF9C3] border-[#E6A01F]/25': type === 'warning'
    }"
    role="status"
    aria-live="polite"
  >
    <button
      type="button"
      class="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full transition-opacity hover:opacity-70"
      aria-label="Dismiss notification"
      @click="handleClose"
    >
      <img :src="CloseIcon" alt="" class="h-4 w-4 opacity-60" />
    </button>

    <div class="flex items-center gap-xl pr-6">
      <img v-if="type === 'error'" :src="WarningIcon" alt="" class="h-10 w-10 shrink-0" />
      <img v-else-if="type === 'warning'" :src="WarningIconOrange" alt="" class="h-10 w-10 shrink-0" />
      <img v-else :src="ToastIcons" alt="" class="h-10 w-10 shrink-0" />
      <div class="min-w-0 flex-1">
        <p
          class="label_1_medium"
          :class="{
            'primary_text_color': type !== 'error' && type !== 'warning',
            'text-[#991B1B]': type === 'error',
            'text-[#78350F]': type === 'warning'
          }"
        >
          {{ mainMessage }}
        </p>
        <p
          v-if="secondaryMessage"
          class="body_3_medium mt-xs"
          :class="{
            'secondary_text_color': type !== 'error' && type !== 'warning',
            'text-[#9C3A3C]': type === 'error',
            'text-[#92400E]': type === 'warning'
          }"
        >
          {{ secondaryMessage }}
        </p>
      </div>
    </div>

    <div
      v-if="duration > 0"
      class="absolute bottom-0 left-0 h-[3px] toast-progress-bar"
      :class="{
        'bg-[#DA1E28]': type === 'error',
        'bg-[#E6A01F]': type === 'warning',
        'bg-[#15BE53]': type !== 'error' && type !== 'warning'
      }"
      :style="{ animationDuration: duration + 'ms' }"
    />
  </div>
</template>

<script setup>
import { onUnmounted, watch } from "vue";
import CloseIcon from "../../assets/images/CloseIcon.svg"
import ToastIcons from "../../assets/images/ToastIcons.svg"
import WarningIcon from "../../assets/images/WarningIcon.svg"
import WarningIconOrange from "../../assets/images/WarningIconOrange.svg"

const props = defineProps({
  open: {
    type: Boolean,
    default: false,
  },
  mainMessage: {
    type: String,
    required: true,
  },
  secondaryMessage: {
    type: String,
    default: "",
  },
  duration: {
    type: Number,
    default: 1800,
  },
  type: {
    type: String,
    default: "success", // success, error, warning
  },
});


const emit = defineEmits(["close"]);

let timer = null;

const handleClose = () => {
  if (timer) {
    clearTimeout(timer);
    timer = null;
  }
  emit("close");
};

watch(
  () => props.open,
  (isOpen) => {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
    if (isOpen && props.duration > 0) {
      timer = setTimeout(() => {
        handleClose();
      }, props.duration);
    }
  },
  { immediate: true }
);

onUnmounted(() => {
  if (timer) {
    clearTimeout(timer);
  }
});
</script>

<style scoped>
.toast-progress-bar {
  animation-name: grow;
  animation-timing-function: linear;
  animation-fill-mode: forwards;
}

@keyframes grow {
  from {
    width: 0%;
  }
  to {
    width: 100%;
  }
}
</style>


