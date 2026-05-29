<template>
  <div class="flex min-h-screen items-center justify-center px-6xl">
    <div class="w-full max-w-md">
     
      <!-- Logo -->
      <div class="block lg:hidden">
        <Logo />
      </div>

      <!-- Heading -->
      <h2 class="heading_h5_semibold primary_text_color">
        Please Verify Your Email

      </h2>

      <p class="body_2_regular secondary_text_color mt-md ">
        We've sent a message to
        <span class="primary_text_color body_2_medium">{{ email || "your email" }}</span>
        with a link to activate your account. If you can't find our email, check your spam or junk folder, or click below to resend the email.
      </p>
        <button class="primary_button w-full mt-6xl">Open Email</button>
        <div class="flex justify-between mt-6xl">
            <span class="underline label_2_semibold primary_text_color">Resend Verification Email</span> <span class="underline label_2_semibold"> <RouterLink to="/signup">Back to Sign Up</RouterLink></span>
        </div>
    </div>
  </div>
</template>
<script setup>
import { computed } from "vue"
import { useRoute } from "vue-router"
import Logo from "../common/Logo.vue"

const route = useRoute()
const email = computed(() => {
  const value = route.query?.email
  return typeof value === "string" ? value : ""
})
</script>
