<template>
  <div class="flex flex-col items-center justify-center min-h-screen p-4 sm:p-8 bg-white">
    <div class="w-full max-w-sm mx-auto text-center">
      <div class="mb-6">
        <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-50">
          <svg class="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
      </div>
      <h2 class="heading_h5_semibold primary_text_color mb-2">
        Email verification failed
      </h2>
      <p class="body_3_regular secondary_text_color mb-6">
        {{ errorMessage || 'There was an error verifying your email. Please try again.' }}
      </p>
      <div class="space-y-3">
        <div>
          <RouterLink
            to="/signup"
            class="label_2_semibold primary_text_color underline"
          >
            Back to Sign Up
          </RouterLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  errorMessage: {
    type: String,
    default: ''
  }
})
</script>
