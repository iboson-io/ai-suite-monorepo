<template>
  <div class="rounded-2xl bg_secondary_color p-6xl shadow-sm h-[100%] data-privacy-full-height overflow-y-auto">
    <!-- Password Success Modal -->
    <PasswordSuccessModal
      :open="showSuccessModal"
      title="Password updated!"
      message="You have successfully updated your password."
      button-text="Login Now"
      @close="showSuccessModal = false"
      @action="handleLoginNow"
    />

    <!-- Back to Security Header -->
    <button
      @click="$emit('back')"
      class="flex items-center gap-xl heading_h6_bold primary_text_color"
    >
      <img :src="BackButtonArrow" alt="">
      <span>Back to Security</span>
    </button>

    <!-- Form -->
    <div class="mt-10xl lg:w-1/2">
      <!-- New Password Field -->
      <div>
        <label class="label_2_semibold block primary_text_color">New Password:</label>
        <div class="relative mt-sm">
          <input
            :value="showNewPassword ? newPassword : '*'.repeat(newPassword.length)"
            @input="handleNewPasswordInput"
            @keydown="handleNewPasswordKeydown"
            @paste="handleNewPasswordPaste"
            type="text"
            placeholder="Enter new password"
            class="regular_border_color rounded-lg py-xl px-3xl w-full pr-10xl label_1_medium focus-visible:outline-none focus-visible:ring-0"
            :class="errors.newPassword ? '!border-[#E2483D]' : ''"
          />
          <button
            type="button"
            @click="toggleNewPassword"
            class="absolute right-3 top-1/2 -translate-y-1/2"
          >
            <img
              v-if="!showNewPassword"
              :src="EyeOpenIcon"
              alt="Show password"
              class="w-5 h-5"
            />
           <img  v-else :src="EyeCloseIcon" alt="">
          </button>
        </div>
        <p v-if="errors.newPassword" class="label_2_semibold text-error-600 mt-1 flex items-center gap-sm">
           <img :src="WarningIcon" alt="">
          <span>{{ errors.newPassword }}</span>
        </p>
      </div>

      <!-- Confirm New Password Field -->
      <div class="mt-10xl">
        <label class="label_2_semibold block primary_text_color">Confirm New Password:</label>
        <div class="relative mt-sm">
          <input
            :value="showConfirmPassword ? confirmPassword : '*'.repeat(confirmPassword.length)"
            @input="handleConfirmPasswordInput"
            @keydown="handleConfirmPasswordKeydown"
            @paste="handleConfirmPasswordPaste"
            type="text"
            placeholder="Confirm new password"
            class="regular_border_color rounded-lg py-xl px-3xl w-full pr-10xl label_1_medium focus-visible:outline-none focus-visible:ring-0"
            :class="errors.confirmPassword ? '!border-[#E2483D]' : ''"
          />
          <button
            type="button"
            @click="toggleConfirmPassword"
            class="absolute right-3 top-1/2 -translate-y-1/2"
          >
            <img
              v-if="!showConfirmPassword"
              :src="EyeOpenIcon"
              alt="Show password"
              class="w-5 h-5"
            />
            <img  v-else :src="EyeCloseIcon" alt="">
          </button>
        </div>
        <p v-if="errors.confirmPassword" class="label_2_semibold text-error-600 mt-1 flex items-center gap-sm">
          <img :src="WarningIcon" alt="">
          <span>{{ errors.confirmPassword }}</span> 
        </p>
      </div>

      <!-- Reset Password Button -->
      <button
        type="button"
        @click="handleResetPassword"
        class="primary_button label_1_semibold lg:w-[40%] px-xxl py-xl mt-10xl"
      >
        Create Password
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from "vue";
import EyeOpenIcon from "../../assets/images/EyeOpen.svg";
import BackButtonArrow from "../../assets/images/BackButtonArrow.svg";
import EyeCloseIcon from "../../assets/images/EyeCloseIcon.svg";
import PasswordSuccessModal from "./PasswordSuccessModal.vue";
import WarningIcon from "../../assets/images/WarningIcon.svg";
import { changePassword } from "@app/services/settings/password.js";
import { parseSettingsError } from "@app/services/settings/errors.js";

const emit = defineEmits(["back", "passwordCreated"]);

// State
const showNewPassword = ref(false);
const showConfirmPassword = ref(false);
const newPassword = ref("");
const confirmPassword = ref("");
const showSuccessModal = ref(false);
const errors = reactive({
  newPassword: "",
  confirmPassword: "",
});

// Toggle password visibility
const toggleNewPassword = () => {
  showNewPassword.value = !showNewPassword.value;
};

const toggleConfirmPassword = () => {
  showConfirmPassword.value = !showConfirmPassword.value;
};

// Handle new password input
const handleNewPasswordInput = (event) => {
  const inputValue = event.target.value;
  const cursorPosition = event.target.selectionStart;
  
  if (showNewPassword.value) {
    // When password is visible, update directly
    newPassword.value = inputValue;
  } else {
    // When password is hidden, update display to show asterisks
    setTimeout(() => {
      if (event.target && !showNewPassword.value) {
        event.target.value = '*'.repeat(newPassword.value.length);
        const newCursorPos = Math.min(cursorPosition, newPassword.value.length);
        event.target.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 0);
  }
  validateNewPassword();
};

const handleNewPasswordKeydown = (event) => {
  if (!showNewPassword.value) {
    const cursorPos = event.target.selectionStart || 0;
    
    if (event.key === 'Backspace') {
      if (cursorPos > 0) {
        newPassword.value = newPassword.value.substring(0, cursorPos - 1) + newPassword.value.substring(cursorPos);
      }
      event.preventDefault();
      setTimeout(() => {
        if (event.target) {
          event.target.value = '*'.repeat(newPassword.value.length);
          event.target.setSelectionRange(Math.max(0, cursorPos - 1), Math.max(0, cursorPos - 1));
        }
      }, 0);
      validateNewPassword();
    } else if (event.key === 'Delete') {
      if (cursorPos < newPassword.value.length) {
        newPassword.value = newPassword.value.substring(0, cursorPos) + newPassword.value.substring(cursorPos + 1);
      }
      event.preventDefault();
      setTimeout(() => {
        if (event.target) {
          event.target.value = '*'.repeat(newPassword.value.length);
          event.target.setSelectionRange(cursorPos, cursorPos);
        }
      }, 0);
      validateNewPassword();
    } else if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
      newPassword.value = newPassword.value.substring(0, cursorPos) + event.key + newPassword.value.substring(cursorPos);
      event.preventDefault();
      setTimeout(() => {
        if (event.target) {
          event.target.value = '*'.repeat(newPassword.value.length);
          event.target.setSelectionRange(cursorPos + 1, cursorPos + 1);
        }
      }, 0);
      validateNewPassword();
    }
  }
};

const handleNewPasswordPaste = (event) => {
  if (!showNewPassword.value) {
    event.preventDefault();
    const pastedText = (event.clipboardData || window.clipboardData).getData('text');
    const cursorPos = event.target.selectionStart || 0;
    
    newPassword.value = newPassword.value.substring(0, cursorPos) + pastedText + newPassword.value.substring(cursorPos);
    
    setTimeout(() => {
      if (event.target) {
        event.target.value = '*'.repeat(newPassword.value.length);
        const newCursorPos = cursorPos + pastedText.length;
        event.target.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 0);
    validateNewPassword();
  }
};

// Handle confirm password input
const handleConfirmPasswordInput = (event) => {
  const inputValue = event.target.value;
  const cursorPosition = event.target.selectionStart;
  
  if (showConfirmPassword.value) {
    // When password is visible, update directly
    confirmPassword.value = inputValue;
  } else {
    // When password is hidden, update display to show asterisks
    setTimeout(() => {
      if (event.target && !showConfirmPassword.value) {
        event.target.value = '*'.repeat(confirmPassword.value.length);
        const newCursorPos = Math.min(cursorPosition, confirmPassword.value.length);
        event.target.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 0);
  }
  validateConfirmPassword();
};

const handleConfirmPasswordKeydown = (event) => {
  if (!showConfirmPassword.value) {
    const cursorPos = event.target.selectionStart || 0;
    
    if (event.key === 'Backspace') {
      if (cursorPos > 0) {
        confirmPassword.value = confirmPassword.value.substring(0, cursorPos - 1) + confirmPassword.value.substring(cursorPos);
      }
      event.preventDefault();
      setTimeout(() => {
        if (event.target) {
          event.target.value = '*'.repeat(confirmPassword.value.length);
          event.target.setSelectionRange(Math.max(0, cursorPos - 1), Math.max(0, cursorPos - 1));
        }
      }, 0);
      validateConfirmPassword();
    } else if (event.key === 'Delete') {
      if (cursorPos < confirmPassword.value.length) {
        confirmPassword.value = confirmPassword.value.substring(0, cursorPos) + confirmPassword.value.substring(cursorPos + 1);
      }
      event.preventDefault();
      setTimeout(() => {
        if (event.target) {
          event.target.value = '*'.repeat(confirmPassword.value.length);
          event.target.setSelectionRange(cursorPos, cursorPos);
        }
      }, 0);
      validateConfirmPassword();
    } else if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
      confirmPassword.value = confirmPassword.value.substring(0, cursorPos) + event.key + confirmPassword.value.substring(cursorPos);
      event.preventDefault();
      setTimeout(() => {
        if (event.target) {
          event.target.value = '*'.repeat(confirmPassword.value.length);
          event.target.setSelectionRange(cursorPos + 1, cursorPos + 1);
        }
      }, 0);
      validateConfirmPassword();
    }
  }
};

const handleConfirmPasswordPaste = (event) => {
  if (!showConfirmPassword.value) {
    event.preventDefault();
    const pastedText = (event.clipboardData || window.clipboardData).getData('text');
    const cursorPos = event.target.selectionStart || 0;
    
    confirmPassword.value = confirmPassword.value.substring(0, cursorPos) + pastedText + confirmPassword.value.substring(cursorPos);
    
    setTimeout(() => {
      if (event.target) {
        event.target.value = '*'.repeat(confirmPassword.value.length);
        const newCursorPos = cursorPos + pastedText.length;
        event.target.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 0);
    validateConfirmPassword();
  }
};

// Validation
const validateNewPassword = () => {
  errors.newPassword = "";
  if (!newPassword.value) {
    errors.newPassword = "Password is required";
    return false;
  }
  if (newPassword.value.length < 8) {
    errors.newPassword = "Password must be at least 8 characters";
    return false;
  }
  // Check for at least one capital letter
  if (!/[A-Z]/.test(newPassword.value)) {
    errors.newPassword = "Password must contain at least one capital letter";
    return false;
  }
  // Check for at least one small letter
  if (!/[a-z]/.test(newPassword.value)) {
    errors.newPassword = "Password must contain at least one small letter";
    return false;
  }
  // Check for at least one number
  if (!/[0-9]/.test(newPassword.value)) {
    errors.newPassword = "Password must contain at least one number";
    return false;
  }
  // Check for at least one special character
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPassword.value)) {
    errors.newPassword = "Password must contain at least one special character";
    return false;
  }
  // Re-validate confirm password if it has a value
  if (confirmPassword.value) {
    validateConfirmPassword();
  }
  return true;
};

const validateConfirmPassword = () => {
  errors.confirmPassword = "";
  if (!confirmPassword.value) {
    errors.confirmPassword = "Please confirm your password";
    return false;
  }
  if (newPassword.value !== confirmPassword.value) {
    errors.confirmPassword = "Please make sure your password match.";
    return false;
  }
  return true;
};

const handleResetPassword = async () => {
  const isNewPasswordValid = validateNewPassword();
  const isConfirmPasswordValid = validateConfirmPassword();

  if (isNewPasswordValid && isConfirmPasswordValid) {
    try {
      // Call API to create password
      await changePassword({
        currentPassword: '',
        newPassword: newPassword.value,
      });
      
      // Show success modal
      showSuccessModal.value = true;
      console.log("Password created successfully");
    } catch (error) {
      console.error('Failed to create password:', error);
      // Show error message if API call fails
      errors.newPassword = parseSettingsError(error);
    }
  }
};

const handleLoginNow = () => {
  // Handle login navigation logic here
  console.log("Login Now clicked");
  // Close modal
  showSuccessModal.value = false;
  // Emit event to notify parent that password was created (after modal is shown)
  emit("passwordCreated");
  // Go back to security
  emit("back");
  // You can navigate to login page or emit an event
  // For example: router.push('/login') or emit('login')
};
</script>

