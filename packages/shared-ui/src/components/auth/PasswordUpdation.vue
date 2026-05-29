<template>
  <div class="flex min-h-screen items-center justify-center px-6xl">
    <div class="w-full max-w-md">

      <!-- Logo -->
      <div class="block lg:hidden">
        <Logo />
      </div>

      <img :src="TickIcon" alt="Tick Icon">
      <!-- Heading -->
      <h2 class="heading_h5_semibold primary_text_color mt-6xl">
        Password Updated
      </h2>

      <p class="body_2_regular secondary_text_color mt-md">
        Your password has been successfully updated. You can now log in with your new credentials.</p>
      <button class="primary_button w-full mt-6xl"> <router-link to="/signin">Go to Sign In </router-link> </button>
    </div>
  </div>

</template>
<script setup>
  import TickIcon from '../../assets/images/TickIcon.svg';
  import Logo from "../common/Logo.vue";
</script>