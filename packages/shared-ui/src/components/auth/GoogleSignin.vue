<template>
    <button
        type="button"
        class="secondary_google_button"
        @click="handleGoogleSignin"
      >
        <img
          src="https://www.svgrepo.com/show/475656/google-color.svg"
          class="h-4 w-4"
          alt="Google"
        />
        Sign up with Google
      </button>
</template>

<script setup>
import { getGoogleAuthUrl } from "@app/services/auth/googleAuth.js"

const handleGoogleSignin = () => {
  window.location.href = getGoogleAuthUrl()
}
</script>