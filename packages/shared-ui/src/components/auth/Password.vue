<template>
  <div class="flex min-h-screen items-center justify-center px-6xl">
    <div class="w-full max-w-md">
    
      <!-- Logo -->
      <div class="block lg:hidden">
        <Logo />
      </div>

       <img :src="LockIcon" alt="Lock Icon">
      <!-- Heading -->
      <h2 class="heading_h5_semibold primary_text_color mt-6xl">
        Enter Password
      </h2>

      <p class="body_2_regular secondary_text_color mt-md">
        Please enter your password to access your account securely.
      </p>

      <!-- Password Field -->
      <div class="relative mt-6xl">
        <label
          :class="[
            'absolute left-3xl transition-all duration-200 pointer-events-none z-10',
            (showPassword ? password : actualPassword) || focusedFields.password
              ? 'top-0 label_2_medium secondary_text_color -translate-y-1/2 bg_secondary_color px-xs'
              : 'top-1/2 -translate-y-1/2 secondary_text_color',
              errorMessage && (showPassword ? password : actualPassword) || focusedFields.password ? 'top-0' : errorMessage  ? 'top-1/3' : ''
          ]"
        >
          Password
        </label>
        <div class="relative">
          <input
            :value="showPassword ? password : '*'.repeat(actualPassword.length)"
            @input="handlePasswordInput"
            @keydown="handlePasswordKeydown"
            @paste="handlePasswordPaste"
            @focus="focusedFields.password = true"
            @blur="focusedFields.password = false"
            type="text"
            class="input_box w-full pt-4xl px-xl pb-md pr-10xl password-input"
            :class="[
              inputClass(errorMessage),
              focusedFields.password ? 'border border-info-50' : ''
            ]"
          />

          <!-- Eye Icon -->
          <button
            type="button"
            @click="togglePassword"
            class="absolute right-xl top-1/2 -translate-y-1/2 z-20"
          >
            <img
              v-if="!showPassword"
              :src="EyeOpenIcon"
              alt="Show password"
            />
            <span v-else><img :src="EyeCloseIcon" alt=""></span>
          </button>
        </div>

        <!-- Error Message -->
        <p v-if="errorMessage" class="label_2_semibold text-error-600 mt-md flex gap-sm"><img :src="WarningIcon" alt=""> {{ errorMessage }}</p>
      </div>

      <!-- Submit Button -->
      <button
        type="button"
        class="primary_button w-full mt-6xl"
        :disabled="isSubmitting"
        @click="handleSubmit"
      >
        {{ isSubmitting ? "Signing in..." : "Sign In" }}
      </button>

      <!-- Links -->
      <div class="flex justify-between mt-6xl">
        <span class="underline label_2_semibold cursor-pointer primary_text_color">
          <RouterLink to="/forgot-password">Forgot Password?</RouterLink>
        </span>
        <span class="underline label_2_semibold primary_text_color">
          <RouterLink to="/signin">Back to Sign In</RouterLink>
        </span>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, reactive, watch, onMounted } from "vue";
import EyeOpenIcon from "../../assets/images/EyeOpen.svg";
import LockIcon from "../../assets/images/LockIcon.svg";
import EyeCloseIcon from "../../assets/images/EyeCloseIcon.svg";
import WarningIcon from "../../assets/images/WarningIcon.svg";
import Logo from "../common/Logo.vue"
import { useRoute, useRouter } from "vue-router";
import { computed } from "vue";
import {
  login,
  saveAuthToken,
  parseLoginError,
} from "@app/services/auth/signIn.js";

const route = useRoute()
const router = useRouter()
const email = computed(() => {
  const value = route.query?.email
  return typeof value === "string" ? value : ""
})

/* State */
const showPassword = ref(false);
const password = ref("");
const errorMessage = ref("");
const isSubmitting = ref(false);

/* Focus State for Floating Labels */
const focusedFields = reactive({
  password: false,
});

/* Password Input Handler - Track actual password separately */
const actualPassword = ref('');

// Initialize actualPassword from password
onMounted(() => {
  actualPassword.value = password.value;
});

// Sync actualPassword with password when it changes externally
watch(() => password.value, (newVal) => {
  if (showPassword.value) {
    actualPassword.value = newVal;
  }
});

/* Toggle Password */
const togglePassword = () => {
  // Sync before toggling
  if (showPassword.value) {
    // Currently visible, going to hidden - sync actualPassword with password
    actualPassword.value = password.value;
  } else {
    // Currently hidden, going to visible - sync password with actualPassword
    password.value = actualPassword.value;
  }
  showPassword.value = !showPassword.value;
};

const handlePasswordInput = (event) => {
  const inputValue = event.target.value;
  const cursorPosition = event.target.selectionStart;
  
  if (showPassword.value) {
    // When password is visible, update directly
    password.value = inputValue;
    actualPassword.value = inputValue;
  } else {
    // When password is hidden, update display to show asterisks
    setTimeout(() => {
      if (event.target && !showPassword.value) {
        event.target.value = '*'.repeat(actualPassword.value.length);
        const newCursorPos = Math.min(cursorPosition, actualPassword.value.length);
        event.target.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 0);
  }
};

/* Handle paste when password is hidden */
const handlePasswordPaste = (event) => {
  if (!showPassword.value) {
    event.preventDefault();
    const pastedText = (event.clipboardData || window.clipboardData).getData('text');
    const cursorPos = event.target.selectionStart || 0;
    
    // Insert pasted text at cursor position
    actualPassword.value = actualPassword.value.substring(0, cursorPos) + pastedText + actualPassword.value.substring(cursorPos);
    password.value = actualPassword.value;
    
    setTimeout(() => {
      if (event.target) {
        event.target.value = '*'.repeat(actualPassword.value.length);
        const newCursorPos = cursorPos + pastedText.length;
        event.target.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 0);
  }
};

/* Handle keydown to capture actual characters when password is hidden */
const handlePasswordKeydown = (event) => {
  if (!showPassword.value) {
    const cursorPos = event.target.selectionStart || 0;
    
    if (event.key === 'Backspace') {
      // Handle backspace
      if (cursorPos > 0) {
        actualPassword.value = actualPassword.value.substring(0, cursorPos - 1) + actualPassword.value.substring(cursorPos);
        password.value = actualPassword.value;
      }
      event.preventDefault();
      setTimeout(() => {
        if (event.target) {
          event.target.value = '*'.repeat(actualPassword.value.length);
          event.target.setSelectionRange(Math.max(0, cursorPos - 1), Math.max(0, cursorPos - 1));
        }
      }, 0);
    } else if (event.key === 'Delete') {
      // Handle delete
      if (cursorPos < actualPassword.value.length) {
        actualPassword.value = actualPassword.value.substring(0, cursorPos) + actualPassword.value.substring(cursorPos + 1);
        password.value = actualPassword.value;
      }
      event.preventDefault();
      setTimeout(() => {
        if (event.target) {
          event.target.value = '*'.repeat(actualPassword.value.length);
          event.target.setSelectionRange(cursorPos, cursorPos);
        }
      }, 0);
    } else if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
      // Regular character input
      actualPassword.value = actualPassword.value.substring(0, cursorPos) + event.key + actualPassword.value.substring(cursorPos);
      password.value = actualPassword.value;
      event.preventDefault();
      setTimeout(() => {
        if (event.target) {
          event.target.value = '*'.repeat(actualPassword.value.length);
          event.target.setSelectionRange(cursorPos + 1, cursorPos + 1);
        }
      }, 0);
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowRight' || event.key === 'Home' || event.key === 'End') {
      // Allow navigation keys
      return;
    } else if ((event.ctrlKey || event.metaKey) && (event.key === 'v' || event.key === 'V')) {
      // Handle paste - will be handled by input event, but we need to prevent default
      // The paste will trigger input event, but we can't get the pasted text easily
      // So we'll allow it and handle in a different way
      return;
    }
  }
};

/* Input Border */
const inputClass = (error) =>
  error
    ? "error_border_color"
    : "regular_border_color";


/* Submit & login */
const handleSubmit = async () => {
  errorMessage.value = "";

  if (!email.value) {
    errorMessage.value = "Email is missing. Go back and enter your email.";
    return;
  }

  if (!showPassword.value) {
    password.value = actualPassword.value;
  }

  const pwd = password.value.trim();
  if (!pwd) {
    errorMessage.value = "Password is required";
    return;
  }

  if (isSubmitting.value) return;
  isSubmitting.value = true;

  try {
    const result = await login({
      email: email.value,
      password: pwd,
    });

    if (result.token) {
      saveAuthToken(result.token);
    }

    await router.push(result.redirectPath || "/dashboard");
  } catch (error) {
    errorMessage.value = parseLoginError(error);
  } finally {
    isSubmitting.value = false;
  }
};
</script>

