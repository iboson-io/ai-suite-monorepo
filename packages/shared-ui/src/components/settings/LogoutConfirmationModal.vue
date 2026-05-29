<template>
  <!-- Backdrop -->
  <div
    v-if="open"
    class="fixed inset-0 z-[60] flex items-center justify-center bg_overlay backdrop-blur-sm"
    @click="$emit('close')"
  >
    <!-- Modal -->
    <div
      class="relative w-full max-w-xl mx-3xl bg_secondary_color rounded-2xl shadow-2xl overflow-hidden p-6xl"
      @click.stop
    >
      <!-- Header -->
      <div>
        <div class="flex items-start justify-between">
          <h2 class="heading_h5_semibold primary_text_color">{{ title }}</h2>
          <button
            @click="$emit('close')"
            class="bg-gray-25 p-xl rounded-md hover:bg-black-25"
          >
            <img :src="BlackCloseIcon" alt="Close">
          </button>
        </div>
        <div class="mt-6xl">
          <p class="label_1_regular secondary_text_color">{{ description }}</p>
          <p v-if="additionalInfo" class="mt-6xl label_1_regular secondary_text_color">
            {{ additionalInfo }}
          </p>
        </div>
      </div>
    <div class="block h-[1px] w-full bg-gray-25 mt-6xl"></div>
      <!-- Footer -->
      <div class="flex gap-md mt-6xl">
        <button
          @click="$emit('close')"
          class="md:flex-1 rounded-md p-xl bg-gray-25 label_1_semibold  primary_text_color"
        >
          Cancel
        </button>
        <button
          @click="handleConfirm"
          :disabled="isLoading"
          class="flex-1 p-xl rounded-md primary_2_text_color label_1_semibold  primary_text_color primary_button"
          :class="isLoading ? 'opacity-50 cursor-not-allowed' : ''"
        >
          <span v-if="isLoading" class="flex items-center justify-center gap-2">
            <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            Logging out...
          </span>
          <span v-else>{{ confirmButtonText }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import BlackCloseIcon from "../../assets/images/BlackCloseIcon.svg";
import api from "@app/services/api.js";

const props = defineProps({
  open: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: "Log Out From All Devices?",
  },
  description: {
    type: String,
    default: "This will immediately sign you out from all logged-in devices, including desktop, mobile, and web sessions.",
  },
  additionalInfo: {
    type: String,
    default: "You'll stay signed in on this current device.",
  },
  confirmButtonText: {
    type: String,
    default: "Log Out All Devices",
  },
});

const emit = defineEmits(["close", "confirm"]);

const isLoading = ref(false);

const handleConfirm = async () => {
  try {
    isLoading.value = true;
    
    // Call the logout-all-devices API
    await api.post('/auth/logout-all-devices');
    
    // Clear the current token from localStorage
    localStorage.removeItem('token');
    
    // Show success message (optional)
    console.log('Successfully logged out from all devices');
    
    // Close modal
    emit("close");
    
    // Redirect to login page
    window.location.href = "/signin";
    
  } catch (error) {
    console.error('Error logging out from all devices:', error);
    // Show error message to user (optional)
    // You could add an error state and show it in the UI
  } finally {
    isLoading.value = false;
  }
};
</script>

