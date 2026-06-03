<template>
  <div class="flex min-h-screen flex-col bg-white p-4 sm:p-8 overflow-y-auto">
    <div class="w-full max-w-sm mx-auto my-auto">
      <div class="block lg:hidden mb-6">
        <Logo />
      </div>

      <div class="text-left mb-6 sm:mb-8">
        <h2 class="heading_h5_semibold primary_text_color">
          {{ showOtpField ? 'Enter OTP' : 'Sign In' }}
        </h2>
        <p class="label_1_regular secondary_text_color mt-md">
          {{
            showOtpField
              ? 'Enter the OTP sent to your email.'
              : 'Access your account to continue building your AI agents.'
          }}
        </p>
      </div>

      <div v-if="!showOtpField">
        <GoogleSignin class="mb-6" />

        <div class="my-3xl flex items-center gap-3xl">
          <div class="h-px flex-1 bg-gray-25"></div>
          <span class="or_text">OR</span>
          <div class="h-px flex-1 bg-gray-25"></div>
        </div>
      </div>

      <div
        v-if="error"
        class="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg"
      >
        <p class="text-red-600 text-sm">{{ error }}</p>
      </div>

      <form
        v-if="!showOtpField"
        class="space-y-3 sm:space-y-4"
        novalidate
        @submit.prevent="handleLoginSubmit"
      >
        <div>
          <input
            v-model="formData.email"
            type="email"
            placeholder="Email"
            class="input_box w-full px-xl py-md"
            :class="emailError ? 'error_border_color' : 'regular_border_color'"
            :disabled="isLoading"
            @blur="validateEmail"
            @input="clearEmailError"
          />
          <p v-if="emailError" class="label_2_semibold text-error-600 mt-md text-right">
            {{ emailError }}
          </p>
        </div>

        <div class="relative">
          <input
            v-model="formData.password"
            :type="showPassword ? 'text' : 'password'"
            placeholder="Password"
            class="input_box w-full px-xl py-md pr-10xl"
            :class="passwordError ? 'error_border_color' : 'regular_border_color'"
            :disabled="isLoading"
            @blur="validatePassword"
            @input="clearPasswordError"
          />
          <button
            type="button"
            class="absolute right-xl top-1/2 -translate-y-1/2 text-gray-500"
            @click="showPassword = !showPassword"
          >
            {{ showPassword ? 'Hide' : 'Show' }}
          </button>
          <p
            v-if="passwordError"
            class="label_2_semibold text-error-600 mt-md text-right"
          >
            {{ passwordError }}
          </p>
        </div>

        <div class="text-right">
          <RouterLink
            to="/forgot-password"
            class="label_2_semibold primary_text_color underline"
          >
            Forgot Password?
          </RouterLink>
        </div>

        <button
          type="submit"
          class="primary_button w-full"
          :disabled="isLoading || !isLoginButtonEnabled"
        >
          {{ isLoading ? 'Signing In...' : 'Sign In' }}
        </button>
      </form>

      <form
        v-else
        class="space-y-3 sm:space-y-4"
        novalidate
        @submit.prevent="handleOtpSubmit"
      >
        <div>
          <input
            v-model="formData.otp"
            type="text"
            placeholder="Enter OTP"
            class="input_box w-full px-xl py-md"
            :class="otpError ? 'error_border_color' : 'regular_border_color'"
            :disabled="isLoading"
            @blur="validateOtp"
            @input="clearOtpError"
          />
          <p v-if="otpError" class="label_2_semibold text-error-600 mt-md text-right">
            {{ otpError }}
          </p>
        </div>

        <button
          type="submit"
          class="primary_button w-full"
          :disabled="isLoading || !isOtpButtonEnabled"
        >
          {{ isLoading ? 'Verifying OTP...' : 'Verify OTP' }}
        </button>

        <div class="text-center">
          <button
            type="button"
            class="label_2_semibold primary_text_color underline"
            @click="resetOtpView"
          >
            Back to Sign In
          </button>
        </div>
      </form>

      <p
        v-if="!showOtpField"
        class="body_2_regular secondary_text_color mt-6xl flex justify-center"
      >
        Don't have an account?
        <RouterLink to="/signup" class="ml-1 font-medium underline primary_text_color">
          Sign Up
        </RouterLink>
      </p>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import GoogleSignin from '../../../../../packages/shared-ui/src/components/auth/GoogleSignin.vue'
import Logo from '../../../../../packages/shared-ui/src/components/common/Logo.vue'
import { useAuth } from '../../composables/useAuth.js'

const router = useRouter()
const { login, loginWithCode, checkAuth, isAuthenticated, clearError } = useAuth()

const formData = ref({
  email: '',
  password: '',
  otp: '',
})

const showOtpField = ref(false)
const showPassword = ref(false)
const isLoading = ref(false)
const error = ref('')
const emailError = ref('')
const passwordError = ref('')
const otpError = ref('')

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const isLoginButtonEnabled = computed(
  () =>
    !emailError.value &&
    !passwordError.value &&
    formData.value.email.trim() !== '' &&
    formData.value.password.trim() !== ''
)

const isOtpButtonEnabled = computed(
  () => !otpError.value && formData.value.otp.trim() !== ''
)

function validateEmail() {
  const email = formData.value.email.trim()
  if (!email) {
    emailError.value = 'Email is required'
    return false
  }
  if (!emailRegex.test(email)) {
    emailError.value = 'Please enter a valid email address'
    return false
  }
  emailError.value = ''
  return true
}

function validatePassword() {
  if (!formData.value.password) {
    passwordError.value = 'Password is required'
    return false
  }
  passwordError.value = ''
  return true
}

function validateOtp() {
  const otp = formData.value.otp.trim()
  if (!otp) {
    otpError.value = 'OTP is required'
    return false
  }
  if (otp.length < 4) {
    otpError.value = 'OTP must be at least 4 characters'
    return false
  }
  otpError.value = ''
  return true
}

function clearEmailError() {
  if (emailError.value) emailError.value = ''
}

function clearPasswordError() {
  if (passwordError.value) passwordError.value = ''
}

function clearOtpError() {
  if (otpError.value) otpError.value = ''
}

function resetOtpView() {
  showOtpField.value = false
  formData.value.otp = ''
  otpError.value = ''
}

async function handleLoginSubmit() {
  if (!validateEmail() || !validatePassword()) return

  isLoading.value = true
  error.value = ''
  clearError()

  try {
    const result = await login({
      email: formData.value.email.trim(),
      password: formData.value.password,
    })

    if (result.success) {
      await router.push('/home')
      return
    }

    if (result.error && result.error.includes('OTP')) {
      showOtpField.value = true
    } else {
      error.value = result.error || 'Invalid credentials'
    }
  } catch {
    error.value = 'Login failed. Please try again.'
  } finally {
    isLoading.value = false
  }
}

async function handleOtpSubmit() {
  if (!validateEmail() || !validateOtp()) return

  isLoading.value = true
  error.value = ''
  clearError()

  try {
    const result = await loginWithCode(
      formData.value.email.trim(),
      formData.value.otp.trim()
    )

    if (result.success) {
      await router.push('/home')
    } else {
      otpError.value = result.error || 'Invalid OTP'
    }
  } catch {
    otpError.value = 'OTP verification failed. Please try again.'
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  if (checkAuth() && isAuthenticated.value) {
    router.replace('/home')
  }
})
</script>
