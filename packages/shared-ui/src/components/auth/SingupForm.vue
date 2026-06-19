<template>
  <div class="flex items-center justify-center px-6xl min-h-screen">
    <div class="w-full max-w-md">

      <!-- Logo -->
      <div class="block lg:hidden">
        <Logo />
      </div>

      <!-- Heading -->
      <h2 class="heading_h5_semibold primary_text_color">
        Create your account
      </h2>

      <p class="body_2_regular secondary_text_color mt-md">
        Start creating AI-powered social posts for your brand.
      </p>

      <!-- Google Sign In -->
      <GoogleSignin />

      <!-- Divider -->
      <div class="my-3xl flex items-center gap-3xl">
        <div class="h-px flex-1 bg-gray-25"></div>
        <span class="or_text">OR</span>
        <div class="h-px flex-1 bg-gray-25"></div>
      </div>

      <!-- Form -->
      <form novalidate @submit.prevent="handleSubmit">

        <!-- Full Name -->
        <div class="relative">
          <label
            :class="[
              'absolute left-md transition-all duration-200 pointer-events-none z-10',
              form.name || focusedFields.name
                ? 'top-0 label_2_medium secondary_text_color -translate-y-1/2 bg-white px-xs'
                : 'top-1/2 -translate-y-1/2 secondary_text_color',
              errors.name && (showPassword ? password : actualPassword) || focusedFields.password ? 'top-0' : errors.name  ? 'top-1/3' : ''
            ]"
          >
            Fullname
          </label>
          <input
            v-model="form.name"
            @focus="focusedFields.name = true"
            @blur="focusedFields.name = false"
            type="text"
            class="input_box w-full pt-4xl pb-md px-xl"
            :class="[
             inputClass(errors.name),
             focusedFields.name ? 'border border-info-50' : ''
            ]"
          />
          <p v-if="errors.name" class="label_2_semibold text-error-600 mt-md">{{ errors.name }}</p>
        </div>

        <!-- Email -->
        <div class="relative mt-4xl">
          <label
            :class="[
              'absolute left-md transition-all duration-200 pointer-events-none z-10',
              form.email || focusedFields.email
                ? 'top-0 label_2_medium secondary_text_color -translate-y-1/2 bg_secondary_color px-xs'
                : 'top-1/2 -translate-y-1/2 secondary_text_color',
              errors.email && form.email || focusedFields.email ? 'top-0' : errors.email  ? 'top-1/3' : ''
            ]"
          >
            Email
          </label>
          <input
            v-model="form.email"
            @focus="focusedFields.email = true"
            @blur="focusedFields.email = false"
            type="text"
            class="input_box w-full pt-4xl pb-md px-xl"
            :class="[
             inputClass(errors.email),
             focusedFields.email ? 'border border-info-50' : ''
            ]"
          />
          <p v-if="errors.email" class="label_2_semibold text-error-600 mt-md flex gap-sm"><img :src="WarningIcon" alt=""> {{ errors.email }}</p>
        </div>

        <!-- Password -->
        <div class="relative mt-4xl">
          <label
            :class="[
              'absolute left-md transition-all duration-200 pointer-events-none z-10',
              (showPassword ? form.password : actualPassword) || focusedFields.password
                ? 'top-0 label_2_medium secondary_text_color -translate-y-1/2 bg-white px-xs'
                : 'top-1/2 -translate-y-1/2 secondary_text_color',
              errors.password && (showPassword ? password : actualPassword) || focusedFields.password ? 'top-0' : errors.password  ? 'top-1/3' : ''
            ]"
          >
            Password
          </label>
          <div class="relative">
            <input
              :value="showPassword ? form.password : '*'.repeat(actualPassword.length)"
              @input="handlePasswordInput"
              @keydown="handlePasswordKeydown"
              @paste="handlePasswordPaste"
              @focus="focusedFields.password = true"
              @blur="focusedFields.password = false"
              type="text"
              class="input_box w-full pt-4xl pb-md pr-10xl password-input px-xl"
              :class="[
             inputClass(errors.password),
             focusedFields.password ? 'border border-info-50' : ''
            ]"
            />

            <button
              type="button"
              @click="togglePassword"
              class="absolute right-xl top-1/2 -translate-y-1/2 z-20"
            >
              <img v-if="!showPassword" :src="EyeOpenIcon" />
              <span v-else><img :src="EyeCloseIcon" alt=""></span>
            </button>
          </div>

          <p v-if="errors.password" class="label_2_semibold text-error-600 mt-md flex gap-sm"><img :src="WarningIcon" alt=""> {{ errors.password }}</p>
        </div>

        <!-- Terms -->
        <div>
          <label class="label_3_regular flex items-start gap-md mt-6xl">
            <input
              type="checkbox"
              v-model="form.terms"
              class="accent-gray-25 mt-xxs primary_border_color scale-125 checked:bg-gray-25 checked:primary_border_color"
            />
            <span class="secondary_text_color">
              I agree to the
              <a :href="termsLink" :target="termsLink ? '_blank' : undefined" :rel="termsLink ? 'noopener noreferrer' : undefined" class="underline primary_text_color">Terms of Service</a>
              and
              <a :href="privacyLink" :target="privacyLink ? '_blank' : undefined" :rel="privacyLink ? 'noopener noreferrer' : undefined" class="underline primary_text_color">Privacy Policy</a>
            </span>
          </label>

          <p v-if="errors.terms" class="label_2_semibold text-error-600">{{ errors.terms }}</p>
        </div>

        <!-- Submit -->
        <button
          type="submit"
          :disabled="!isFormFilled || isSubmitting"
          class="w-full rounded-md py-md font-medium transition mt-6xl"
          :class="isFormFilled && !isSubmitting
            ? 'primary_button'
            : 'disabled_primary_button'"
        >
          {{ isSubmitting ? "Creating Account..." : "Create Account" }}
        </button>
        <p v-if="submitError" class="label_2_semibold text-error-600 mt-md">
          {{ submitError }}
        </p>
      </form>

      <!-- Footer -->
      <p class="body_2_regular secondary_text_color flex justify-center mt-6xl">
        Already have an account?
        <RouterLink
          to="/signin"
          class="ml-xs underline Body_2_Medium primary_text_color"
        >
          Log in
        </RouterLink>
      </p>

    </div>
  </div>
</template>

<script setup>
import { reactive, ref, computed, watch, onMounted } from "vue"
import { useRouter } from "vue-router"
import GoogleSignin from "./GoogleSignin.vue"
import EyeOpenIcon from "../../assets/images/EyeOpen.svg"
import Logo from "../common/Logo.vue"
import EyeCloseIcon from "../../assets/images/EyeCloseIcon.svg"
import WarningIcon from "../../assets/images/WarningIcon.svg"
import { register, parseRegisterError } from "@app/services/auth/signUp.js"
import { getBrandingSectionConfig } from "@app/services/auth/branding.js"

const router = useRouter()
const brandingConfig = getBrandingSectionConfig()
const termsLink = brandingConfig.termsLink
const privacyLink = brandingConfig.privacyLink

/* Form State */
const form = reactive({
  name: "",
  email: "",
  password: "",
  terms: false,
})

/* Error State */
const errors = reactive({
  name: "",
  email: "",
  password: "",
  terms: "",
})

/* Focus State for Floating Labels */
const focusedFields = reactive({
  name: false,
  email: false,
  password: false,
})

/* Regex */
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&^#()_\-+=]).{8,}$/;

/* Password Toggle */
const showPassword = ref(false)
const isSubmitting = ref(false)
const submitError = ref("")
const togglePassword = () => {
  // Sync before toggling
  if (showPassword.value) {
    // Currently visible, going to hidden - sync actualPassword with form.password
    actualPassword.value = form.password
  } else {
    // Currently hidden, going to visible - sync form.password with actualPassword
    form.password = actualPassword.value
  }
  showPassword.value = !showPassword.value
}

/* Password Input Handler - Track actual password separately */
const actualPassword = ref('')

// Initialize actualPassword from form.password
onMounted(() => {
  actualPassword.value = form.password
})

// Sync actualPassword with form.password when it changes externally
watch(() => form.password, (newVal) => {
  if (showPassword.value) {
    actualPassword.value = newVal
  }
})

const handlePasswordInput = (event) => {
  const inputValue = event.target.value
  const cursorPosition = event.target.selectionStart
  
  if (showPassword.value) {
    // When password is visible, update directly
    form.password = inputValue
    actualPassword.value = inputValue
  } else {
    // When password is hidden, update display to show asterisks
    setTimeout(() => {
      if (event.target && !showPassword.value) {
        event.target.value = '*'.repeat(actualPassword.value.length)
        const newCursorPos = Math.min(cursorPosition, actualPassword.value.length)
        event.target.setSelectionRange(newCursorPos, newCursorPos)
      }
    }, 0)
  }
}

/* Handle paste when password is hidden */
const handlePasswordPaste = (event) => {
  if (!showPassword.value) {
    event.preventDefault()
    const pastedText = (event.clipboardData || window.clipboardData).getData('text')
    const cursorPos = event.target.selectionStart || 0
    
    // Insert pasted text at cursor position
    actualPassword.value = actualPassword.value.substring(0, cursorPos) + pastedText + actualPassword.value.substring(cursorPos)
    form.password = actualPassword.value
    
    setTimeout(() => {
      if (event.target) {
        event.target.value = '*'.repeat(actualPassword.value.length)
        const newCursorPos = cursorPos + pastedText.length
        event.target.setSelectionRange(newCursorPos, newCursorPos)
      }
    }, 0)
  }
}

/* Handle keydown to capture actual characters when password is hidden */
const handlePasswordKeydown = (event) => {
  if (!showPassword.value) {
    const cursorPos = event.target.selectionStart || 0
    
    if (event.key === 'Backspace') {
      // Handle backspace
      if (cursorPos > 0) {
        actualPassword.value = actualPassword.value.substring(0, cursorPos - 1) + actualPassword.value.substring(cursorPos)
        form.password = actualPassword.value
      }
      event.preventDefault()
      setTimeout(() => {
        if (event.target) {
          event.target.value = '*'.repeat(actualPassword.value.length)
          event.target.setSelectionRange(Math.max(0, cursorPos - 1), Math.max(0, cursorPos - 1))
        }
      }, 0)
    } else if (event.key === 'Delete') {
      // Handle delete
      if (cursorPos < actualPassword.value.length) {
        actualPassword.value = actualPassword.value.substring(0, cursorPos) + actualPassword.value.substring(cursorPos + 1)
        form.password = actualPassword.value
      }
      event.preventDefault()
      setTimeout(() => {
        if (event.target) {
          event.target.value = '*'.repeat(actualPassword.value.length)
          event.target.setSelectionRange(cursorPos, cursorPos)
        }
      }, 0)
    } else if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
      // Regular character input
      actualPassword.value = actualPassword.value.substring(0, cursorPos) + event.key + actualPassword.value.substring(cursorPos)
      form.password = actualPassword.value
      event.preventDefault()
      setTimeout(() => {
        if (event.target) {
          event.target.value = '*'.repeat(actualPassword.value.length)
          event.target.setSelectionRange(cursorPos + 1, cursorPos + 1)
        }
      }, 0)
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowRight' || event.key === 'Home' || event.key === 'End') {
      // Allow navigation keys
      return
    } else if ((event.ctrlKey || event.metaKey) && (event.key === 'v' || event.key === 'V')) {
      // Handle paste - will be handled by input event, but we need to prevent default
      // The paste will trigger input event, but we can't get the pasted text easily
      // So we'll allow it and handle in a different way
      return
    }
  }
}

/* Button Enable Logic (ONLY filled check) */
const isFormFilled = computed(() => {
  return (
    form.name.trim() !== "" &&
    form.email.trim() !== "" &&
    form.password.trim() !== "" &&
    form.terms
  )
})

/* Input Border */
const inputClass = (error) =>
  error
    ? "error_border_color"
    : "regular_border_color"

/* Submit → FULL validation happens here */
const handleSubmit = async () => {
  errors.name = ""
  errors.email = ""
  errors.password = ""
  errors.terms = ""
  submitError.value = ""

  let isValid = true

  if (!form.name) {
    errors.name = "Full name is required"
    isValid = false
  }

  if (!form.email) {
    errors.email = "Email is required"
    isValid = false
  } else if (!emailRegex.test(form.email)) {
    errors.email = "Enter a valid email address"
    isValid = false
  }

  if (!form.password) {
    errors.password = "Password is required"
    isValid = false
  } else if (!passwordRegex.test(form.password)) {
    errors.password =
      "Oops! The password you entered is incorrect."
    isValid = false
  }

  if (!form.terms) {
    errors.terms = "You must accept the terms"
    isValid = false
  }

  if (isValid) {
  try {
    isSubmitting.value = true

 const response = await register({
      email: form.email.trim(),
      password: form.password,
      name: form.name.trim(),
    })

      router.push({
        path: "/email-validation",
        query: { email: form.email },
      })
  } catch (error) {
    submitError.value = parseRegisterError(error)
  } finally {
    isSubmitting.value = false
  }
}
}
</script>

