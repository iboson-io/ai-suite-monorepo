<template>
  <div
    v-if="open"
    class="fixed top-4 right-4 z-[70] min-w-[min(100vw-2rem,400px)] max-w-[400px] rounded-2xl bg_secondary_color p-5xl shadow-[0_10px_24px_-4px_rgba(15,23,42,0.12)] md:top-6 md:right-6 overflow-hidden"
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
      <img :src="ToastIcons" alt="" class="h-10 w-10 shrink-0" />
      <div class="min-w-0 flex-1">
        <p class="label_1_medium primary_text_color">
          {{ mainMessage }}
        </p>
        <p v-if="secondaryMessage" class="body_3_medium secondary_text_color mt-xs">
          {{ secondaryMessage }}
        </p>
      </div>
    </div>

    <div
      v-if="duration > 0"
      class="absolute bottom-0 left-0 h-[3px] bg-[#15BE53] toast-progress-bar"
      :style="{ animationDuration: duration + 'ms' }"
    />
  </div>
</template>

<script setup>
import { onUnmounted, watch } from "vue";
import CloseIcon from "../../assets/images/CloseIcon.svg"
import ToastIcons from "../../assets/images/ToastIcons.svg"

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


