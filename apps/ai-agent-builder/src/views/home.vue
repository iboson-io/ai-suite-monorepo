<template>
  <div class="flex min-h-screen flex-col items-center justify-center gap-4 px-6">
    <p class="text-gray-600">Home — agent builder dashboard loads here after sign-in.</p>
    <button
      type="button"
      class="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
      @click="signOut"
    >
      Sign out
    </button>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { TOKEN_KEY, USER_KEY } from '../services/auth/signIn.js'

const router = useRouter()

function signOut() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
  router.replace('/signin')
}
</script>
