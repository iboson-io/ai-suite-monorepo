<template>
  <div class="flex min-h-screen items-center justify-center px-6xl">
    <div class="w-full max-w-md">
      <!-- Logo -->
      <div class="block lg:hidden">
        <Logo />
      </div>

      <img :src="EmailOpen" alt="Email Open Icon">
      <!-- Heading -->
      <h2 class="heading_h5_semibold primary_text_color mt-6xl">
       Reset Link Sent!

      </h2>

      <p class="body_2_regular secondary_text_color mt-md ">
            We’ve sent a password reset link to your email address.
      </p>
        <button class="primary_button w-full mt-6xl" @click="openEmail">
          Open Email
        </button>
        <div class="flex justify-between mt-6xl">
            <span class="underline label_2_semibold primary_text_color"><RouterLink to="/forgot-password">Resend Link</RouterLink></span> <span class="underline label_2_semibold primary_text_color"> <RouterLink to="/signin">Back to Sign In</RouterLink></span>
        </div>
    </div>
  </div>
</template>
<script setup>
    import EmailOpen from '../../assets/images/EmailOpenIcon.svg';
    import Logo from "../common/Logo.vue"

    const openEmail = () => {
      window.open("https://mail.google.com", "_blank", "noopener,noreferrer")
    }
</script>
