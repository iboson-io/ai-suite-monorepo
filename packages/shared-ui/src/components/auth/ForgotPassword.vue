<template>
  <div class="flex min-h-screen items-center justify-center px-6">
    <div class="w-full max-w-md">
     <!-- Logo -->
      <div class="block lg:hidden">
        <Logo />
      </div>

     <img :src="LockIcon" alt="Lock Icon">

      <!-- Heading -->
      <h2 class="heading_h5_semibold primary_text_color mt-6xl">
        Forgot Password
      </h2>

      <p class="body_1_regular secondary_text_color mt-md">
        Enter your email address and we'll send you instructions to reset your password.
      </p>


      <!-- Form -->
      <form class="" @submit.prevent="handleSubmit">

        <!-- Email -->
        <div class="relative mt-6xl">
          <label
            :class="[
              'absolute left-3xl transition-all duration-200 pointer-events-none z-10',
              form.email || focusedFields.email
                ? 'top-0 label_2_medium secondary_text_color -translate-y-1/2 bg_secondary_color px-xs'
                : 'top-1/2 -translate-y-1/2 secondary_text_color',
              errors.email && form.email || focusedFields.email ? 'top-0' : errors.email  ? 'top-1/3' : ''
            ]"
          >
            Email
          </label>
          <input
            v-model="form.email"
            @focus="focusedFields.email = true"
            @blur="focusedFields.email = false"
            type="text"
            class="input_box w-full pt-4xl px-xl pb-md"
            :class="[
              inputClass(errors.email),
              focusedFields.email ? 'border border-info-50' : ''
            ]"
          />
          <p v-if="errors.email" class="label_2_semibold text-error-600 mt-md flex gap-sm"><img :src="WarningIcon" alt=""> {{ errors.email }}</p>
        </div>


        <!-- Submit -->
        <button
          type="submit"
          class="primary_button w-full mt-6xl"
        >
          Send Reset Link
        </button>
      </form>

      <!-- Footer -->
      <p class="label_1_medium mt-6xl flex justify-center">
        <RouterLink
          to="/signin"
          class="ml-1 cursor-pointer underline primary_text_color"
        >
          Back to Sign In
        </RouterLink>
      </p>

    </div>
  </div>
</template>

<script setup>
import { reactive } from "vue";
import GoogleSignin from "./GoogleSignin.vue";
import Logo from "../common/Logo.vue";
import { useRouter } from "vue-router";
import LockIcon from "../../assets/images/LockIcon.svg";
import WarningIcon from "../../assets/images/WarningIcon.svg";
import {
  checkAccountForReset,
  requestForgotPassword,
} from "@app/services/auth/forgotPassword.js";
import { parseAuthError } from "@app/services/auth/errors.js";

const router = useRouter();

/* Form State */
const form = reactive({
  email: "",
});

/* Error State */
const errors = reactive({
  email: "",
});

/* Focus State for Floating Labels */
const focusedFields = reactive({
  email: false,
});

/* Email Regex */
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/* Input Border */
const inputClass = (error) =>
  error
    ? "error_border_color"
    : "regular_border_color";

/* Submit Handler */
const handleSubmit = async () => {
  errors.email = "";

  if (!form.email) {
    errors.email = "Email is required";
    return;
  }

  if (!emailRegex.test(form.email)) {
    errors.email = "Enter a valid email address";
    return;
  }

  try {
    const accountCheck = await checkAccountForReset(form.email);

    if (!accountCheck.success) {
      errors.email = accountCheck.message || "No account found with this email.";
      return;
    }

    const result = await requestForgotPassword(form.email);

    if (result.success) {
      router.push("/reset-link");
      return;
    }

    errors.email = result.message;
  } catch (error) {
    errors.email = parseAuthError(error);
  }
  
};
</script>
