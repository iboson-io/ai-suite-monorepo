<template>
  <div class="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-white">
    <BrandingSection />
    <component
      :is="currentComponent"
      :error-message="errorMessage"
    />
  </div>
</template>

<script setup>
import { shallowRef, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth.js'
import { useToast } from '../composables/useToast.js'
import BrandingSection from '../../../../packages/shared-ui/src/components/auth/BrandingSection.vue'
import VerifyEmailLoading from '../components/VerifyEmail/VerifyEmailLoading.vue'
import VerifyEmailSuccess from '../components/VerifyEmail/VerifyEmailSuccess.vue'
import VerifyEmailError from '../components/VerifyEmail/VerifyEmailError.vue'

const route = useRoute()
const router = useRouter()
const { verifyEmail, isAuthenticated } = useAuth()
const { showToast } = useToast()

const currentComponent = shallowRef(VerifyEmailLoading)
const errorMessage = ref('')

onMounted(async () => {
  try {
    const token = route.query.token

    if (!token) {
      errorMessage.value = 'No verification token provided. Please check your email for the verification link.'
      currentComponent.value = VerifyEmailError
      return
    }

    const result = await verifyEmail(token)

    if (result.success) {
      showToast('Email verified successfully!', '', 'success')

      if (isAuthenticated.value) {
        setTimeout(() => {
          router.push('/home')
        }, 1000)
      }

      currentComponent.value = VerifyEmailSuccess
    } else {
      throw new Error(result.error ? result.error : 'Email verification failed. Please try again or contact support.')
    }

  } catch (error) {
    const errorMsg = error.message || ''
    if (errorMsg.includes('expired') || errorMsg.includes('invalid')) {
      errorMessage.value = 'The verification link has expired or is invalid. Please request a new verification email.'
    } else if (errorMsg.includes('already verified')) {
      errorMessage.value = 'This email has already been verified. You can proceed to login.'
    } else {
      errorMessage.value = errorMsg || 'Email verification failed. Please try again or contact support.'
    }

    currentComponent.value = VerifyEmailError
    showToast('Email verification failed', '', 'error')
  }
})
</script>
