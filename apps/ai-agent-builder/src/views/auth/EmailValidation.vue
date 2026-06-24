<template>
  <div class="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-white">
    <BrandingSection />
    <CheckEmailForm />
  </div>
</template>

<script setup>
import BrandingSection from '../../../../../packages/shared-ui/src/components/auth/BrandingSection.vue'
import CheckEmailForm from '../../components/auth/CheckEmailForm.vue'
</script>
