<template>
  <!-- Backdrop -->
  <div
    v-if="open"
    class="fixed inset-0 z-[60] flex items-center justify-center bg_overlay backdrop-blur-sm"
    @click="onBackdropClick"
  >
    <!-- Modal -->
    <div
      class="relative w-full   max-w-[23em] md:max-w-xl  bg_secondary_color rounded-2xl shadow-2xl overflow-hidden"
      @click.stop
    >
      <!-- Header -->
      <div class="p-6xl">
        <div class="flex items-start justify-between">
          <h2 class="heading_h5_semibold">{{ title }}</h2>
          <button
            type="button"
            :disabled="isDisconnecting"
            @click="$emit('close')" class="p-md bg-gray-25 hover:bg-black-25 rounded-md disabled:opacity-50"
          >
            <img :src="BlackCloseIcon" alt="">
          </button>
        </div>
      

      <!-- Content -->
      <div class="mt-6xl mb-6xl">
        <p class="label_1_regular secondary_text_color">
          {{ description }}
        </p>
      </div>

      <p
        v-if="errorMessage"
        class="label_2_semibold text-error-600 mt-4"
        role="alert"
      >
        {{ errorMessage }}
      </p>

      <!-- Footer -->
      <div class="pt-6xl border-t border-gray-25 flex justify-center gap-xl ">
        <button
          type="button"
          :disabled="isDisconnecting"
          @click="$emit('close')"
          class="px-4xl py-xl rounded-lg label_1_semibold primary_text_color bg-gray-25 w-[100%] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cancel
        </button>
        <button
          type="button"
          :disabled="isDisconnecting"
          @click="handleDisconnect"
          class="px-4xl py-xl rounded-lg  primary_button w-[100%] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ isDisconnecting ? "Disconnecting…" : "Disconnect" }}
        </button>
      </div>
      </div>
    </div>
  </div>
</template>

<script setup>
  import BlackCloseIcon from "../../assets/images/BlackCloseIcon.svg";
const props = defineProps({
  open: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: "Disconnect Google Account?",
  },
  description: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    default: "",
  },
  isDisconnecting: {
    type: Boolean,
    default: false,
  },
  errorMessage: {
    type: String,
    default: "",
  },
});

const emit = defineEmits(["close", "disconnect"]);

const onBackdropClick = () => {
  if (props.isDisconnecting) return;
  emit("close");
};

const handleDisconnect = () => {
  if (props.isDisconnecting) return;
  emit("disconnect");
};
</script>

<style scoped>
/* Additional styling if needed */
</style>

