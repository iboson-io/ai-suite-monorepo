<template>
  <div class="flex min-h-screen items-center justify-center px-6xl">
    <div class="w-full max-w-md">
      <div class="block lg:hidden">
        <Logo />
      </div>

      <img :src="EmailOpen" alt="Email Open Icon">

      <h2 class="heading_h5_semibold primary_text_color mt-6xl">
        Please Verify Your Email
      </h2>

      <p class="body_2_regular secondary_text_color mt-md">
        We've sent a message to
        <span class="primary_text_color body_2_medium">{{ displayEmail }}</span>
        with a link to activate your account. If you can't find our email, check your spam or junk folder, or click below to resend the email.
      </p>

      <p
        v-if="feedback.message"
        class="label_2_semibold mt-md"
        :class="feedback.type === 'success' ? 'text-success-600' : 'text-error-600'"
      >
        {{ feedback.message }}
      </p>

      <button class="primary_button w-full mt-6xl" @click="openEmail">
        Open Email
      </button>

      <div class="flex justify-between mt-6xl">
        <button
          type="button"
          class="underline label_2_semibold primary_text_color disabled:opacity-50 disabled:cursor-not-allowed"
          :disabled="isResending"
          @click="handleResend"
        >
          {{ isResending ? 'Sending...' : 'Resend Verification Email' }}
        </button>
        <RouterLink to="/signup" class="underline label_2_semibold primary_text_color">
          Back to Sign Up
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import Logo from '../../../../../packages/shared-ui/src/components/common/Logo.vue'
import EmailOpen from '../../../../../packages/shared-ui/src/assets/images/EmailOpenIcon.svg'
import {
  resendVerificationEmail,
  getEmailProviderUrl,
} from '@app/services/auth/resendVerification.js'

const SIGNUP_EMAIL_KEY = 'signupEmail'

const route = useRoute()
const email = ref('')
const isResending = ref(false)
const feedback = ref({ type: '', message: '' })

const displayEmail = computed(() => email.value || 'your email')

onMounted(() => {
  email.value =
    (typeof route.query.email === 'string' ? route.query.email : '') ||
    (typeof window !== 'undefined' ? localStorage.getItem(SIGNUP_EMAIL_KEY) : '') ||
    ''

  if (typeof window !== 'undefined' && localStorage.getItem(SIGNUP_EMAIL_KEY)) {
    localStorage.removeItem(SIGNUP_EMAIL_KEY)
  }
})

const openEmail = () => {
  const url = getEmailProviderUrl(email.value)
  window.open(url, '_blank', 'noopener,noreferrer')
}

const handleResend = async () => {
  if (!email.value) {
    feedback.value = { type: 'error', message: 'No email address found' }
    return
  }

  isResending.value = true
  feedback.value = { type: '', message: '' }

  try {
    const result = await resendVerificationEmail(email.value)
    feedback.value = {
      type: result.success ? 'success' : 'error',
      message: result.message,
    }
  } finally {
    isResending.value = false
  }
}
</script>
