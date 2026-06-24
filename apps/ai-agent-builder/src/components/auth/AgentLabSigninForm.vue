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
        autocomplete="off"
        @submit.prevent="handleLoginSubmit"
      >
        <input
          type="text"
          name="username"
          tabindex="-1"
          aria-hidden="true"
          class="absolute h-0 w-0 opacity-0 pointer-events-none"
          autocomplete="username"
        />
        <input
          type="password"
          name="password"
          tabindex="-1"
          aria-hidden="true"
          class="absolute h-0 w-0 opacity-0 pointer-events-none"
          autocomplete="current-password"
        />

        <div class="relative">
          <label
            :class="[
              'absolute left-xxl transition-all duration-200 pointer-events-none z-10',
              formData.email || focusedFields.email
                ? 'top-0 label_2_medium secondary_text_color -translate-y-1/2 bg_secondary_color px-xs'
                : 'top-1/2 -translate-y-1/2 secondary_text_color',
              emailError && formData.email || focusedFields.email ? 'top-0' : emailError ? 'top-1/3' : ''
            ]"
          >
            Email
          </label>
          <input
            v-model="formData.email"
            type="text"
            name="agent_lab_signin_email"
            inputmode="email"
            autocomplete="off"
            readonly
            class="input_box w-full pt-4xl px-xl pb-md"
            :class="[
              emailError ? 'error_border_color' : 'regular_border_color',
              focusedFields.email ? 'border border-info-50' : ''
            ]"
            :disabled="isLoading"
            @focus="(event) => { enableFieldEdit(event); focusedFields.email = true }"
            @blur="() => { focusedFields.email = false; validateEmail(); }"
            @input="clearEmailError"
          />
          <p v-if="emailError" class="label_2_semibold text-error-600 mt-md flex gap-sm">
            <img :src="WarningIcon" alt="" /> {{ emailError }}
          </p>
        </div>

        <div class="relative">
          <label
            :class="[
              'absolute left-xxl transition-all duration-200 pointer-events-none z-10',
              formData.password || focusedFields.password
                ? 'top-0 label_2_medium secondary_text_color -translate-y-1/2 bg_secondary_color px-xs'
                : 'top-1/2 -translate-y-1/2 secondary_text_color',
              passwordError && formData.password || focusedFields.password ? 'top-0' : passwordError ? 'top-1/3' : ''
            ]"
          >
            Password
          </label>
          <div class="relative">
            <input
              v-model="formData.password"
              :type="showPassword ? 'text' : 'password'"
              name="agent_lab_signin_password"
              autocomplete="new-password"
              readonly
              class="input_box w-full pt-4xl px-xl pb-md pr-10xl password-input"
              :class="[
                passwordError ? 'error_border_color' : 'regular_border_color',
                focusedFields.password ? 'border border-info-50' : ''
              ]"
              :disabled="isLoading"
              @focus="(event) => { enableFieldEdit(event); focusedFields.password = true }"
              @blur="() => { focusedFields.password = false; validatePassword(); }"
              @input="clearPasswordError"
            />
            <button
              type="button"
              class="absolute right-xl top-1/2 -translate-y-1/2 z-20"
              @click="showPassword = !showPassword"
            >
              <img
                v-if="!showPassword"
                :src="EyeOpenIcon"
                alt="Show password"
              />
              <span v-else><img :src="EyeCloseIcon" alt="Hide password"></span>
            </button>
          </div>
          <p
            v-if="passwordError"
            class="label_2_semibold text-error-600 mt-md flex gap-sm"
          >
            <img :src="WarningIcon" alt="" /> {{ passwordError }}
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
        autocomplete="off"
        @submit.prevent="handleOtpSubmit"
      >
        <div class="relative">
          <label
            :class="[
              'absolute left-xxl transition-all duration-200 pointer-events-none z-10',
              formData.otp || focusedFields.otp
                ? 'top-0 label_2_medium secondary_text_color -translate-y-1/2 bg_secondary_color px-xs'
                : 'top-1/2 -translate-y-1/2 secondary_text_color',
              otpError && formData.otp || focusedFields.otp ? 'top-0' : otpError ? 'top-1/3' : ''
            ]"
          >
            Enter OTP
          </label>
          <input
            v-model="formData.otp"
            type="text"
            name="agent_lab_signin_otp"
            autocomplete="off"
            readonly
            class="input_box w-full pt-4xl px-xl pb-md"
            :class="[
              otpError ? 'error_border_color' : 'regular_border_color',
              focusedFields.otp ? 'border border-info-50' : ''
            ]"
            :disabled="isLoading"
            @focus="(event) => { enableFieldEdit(event); focusedFields.otp = true }"
            @blur="() => { focusedFields.otp = false; validateOtp(); }"
            @input="clearOtpError"
          />
          <p v-if="otpError" class="label_2_semibold text-error-600 mt-md flex gap-sm">
            <img :src="WarningIcon" alt="" /> {{ otpError }}
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
import { computed, onMounted, ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import GoogleSignin from '../../../../../packages/shared-ui/src/components/auth/GoogleSignin.vue'
import Logo from '../../../../../packages/shared-ui/src/components/common/Logo.vue'
import WarningIcon from '../../../../../packages/shared-ui/src/assets/images/WarningIcon.svg'
import EyeOpenIcon from '../../../../../packages/shared-ui/src/assets/images/EyeOpen.svg'
import EyeCloseIcon from '../../../../../packages/shared-ui/src/assets/images/EyeCloseIcon.svg'
import { useAuth } from '../../composables/useAuth.js'

const router = useRouter()
const { login, loginWithCode, checkAuth, isAuthenticated, clearError } = useAuth()

const formData = ref({
  email: '',
  password: '',
  otp: '',
})

const focusedFields = reactive({
  email: false,
  password: false,
  otp: false,
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

function enableFieldEdit(event) {
  event.target.removeAttribute('readonly')
}

function clearAutofillValues() {
  if (!focusedFields.email) {
    formData.value.email = ''
  }
  if (!focusedFields.password) {
    formData.value.password = ''
  }
  if (!focusedFields.otp) {
    formData.value.otp = ''
  }
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
    return
  }

  clearAutofillValues()
  window.setTimeout(clearAutofillValues, 100)
})
</script>
