<template>
  <div class="flex flex-col items-center justify-center min-h-screen p-4 sm:p-8 bg-white">
    <div class="w-full max-w-sm mx-auto text-center">
      <div class="mb-6">
        <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-50">
          <svg class="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
      </div>
      <h2 class="heading_h5_semibold primary_text_color mb-2">
        Email verified successfully!
      </h2>
      <p class="body_3_regular secondary_text_color mb-6">
        Your email has been verified. You can now sign in to your account.
      </p>
      <div v-if="isAuthenticated" class="mb-4">
        <p class="body_4_regular secondary_text_color">
          Redirecting to home in {{ countdown }} seconds...
        </p>
      </div>
      <div class="flex flex-col gap-3">
        <button
          @click="goToLogin"
          class="primary_button w-full flex items-center justify-center"
        >
          Sign In
        </button>
        <button
          @click="goToHome"
          class="secondary_button w-full h-[3em] rounded-[8px] flex items-center justify-center text-center font-semibold"
        >
          Go to Home
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../../composables/useAuth.js'

const router = useRouter()
const { isAuthenticated } = useAuth()

const countdown = ref(1)

const goToLogin = () => {
  router.push('/login')
}

const goToHome = async () => {
  try {
    router.push('/home')
  } catch (error) {
    console.error('Error redirecting to home:', error)
    router.push('/')
  }
}

onMounted(() => {
  if (isAuthenticated.value) {
    const timer = setInterval(() => {
      countdown.value--
      if (countdown.value <= 0) {
        clearInterval(timer)
        goToHome()
      }
    }, 1000)
  }
})
</script>
