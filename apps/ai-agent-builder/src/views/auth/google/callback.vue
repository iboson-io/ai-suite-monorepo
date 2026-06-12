<template>
  <div class="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
    <div class="w-full max-w-md">
      <div v-if="loading" class="text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <h2 class="text-xl font-semibold text-gray-900 mb-2">Processing Google Authentication</h2>
        <p class="text-gray-600">Please wait while we complete your sign-in...</p>
      </div>

      <div v-else-if="success" class="text-center">
        <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
          </svg>
        </div>
        <h2 class="text-xl font-semibold text-gray-900 mb-2">Authentication Successful!</h2>
        <p class="text-gray-600 mb-6">Redirecting to your dashboard...</p>
      </div>

      <div v-else-if="error" class="text-center">
        <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </div>
        <h2 class="text-xl font-semibold text-gray-900 mb-2">Authentication Failed</h2>
        <p class="text-gray-600 mb-6">{{ error }}</p>
        <div class="space-y-3">
          <button
            type="button"
            class="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            @click="retryAuth"
          >
            Try Again
          </button>
          <button
            type="button"
            class="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
            @click="goToSignup"
          >
            Go to Sign Up
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { TOKEN_KEY, USER_KEY } from '../../../services/api.js'
import { USER_API_URL } from '../../../services/constants.js'

const router = useRouter()
const route = useRoute()

const loading = ref(true)
const success = ref(false)
const error = ref('')

const storeAuthData = (token, userData) => {
  localStorage.setItem(TOKEN_KEY, token)
  if (userData) {
    localStorage.setItem(USER_KEY, JSON.stringify(userData))
  }
}

const retryAuth = () => {
  loading.value = true
  error.value = ''
  handleGoogleCallback()
}

const goToSignup = () => {
  router.push('/signup')
}

const handleGoogleCallback = async () => {
  try {
    const code = route.query.code
    const state = route.query.state
    const errorParam = route.query.error

    if (errorParam) {
      throw new Error('Google authentication was cancelled or failed')
    }

    if (!code) {
      throw new Error('No authorization code received from Google')
    }

    const authType = sessionStorage.getItem('googleAuthType') || 'login'
    const backendCallbackUrl = `${USER_API_URL}/api/auth/google/callback?code=${code}&state=${state}&auth_type=${authType}`

    const response = await fetch(backendCallbackUrl, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `Authentication failed (${response.status})`)
    }

    const data = await response.json()

    if (data.status && data.data?.token) {
      storeAuthData(data.data.token, data.data.user)
      sessionStorage.removeItem('googleAuthType')
      success.value = true

      setTimeout(() => {
        router.push('/home')
      }, 1500)
    } else {
      throw new Error('Invalid response from authentication server')
    }
  } catch (err) {
    error.value = err.message || 'Authentication failed'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  handleGoogleCallback()
})
</script>
