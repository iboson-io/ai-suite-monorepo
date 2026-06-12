<template>
  <div class="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-white">
    <BrandingSection />
    <AgentLabSigninForm />
  </div>
</template>

<script setup>
import BrandingSection from '../../../../../packages/shared-ui/src/components/auth/BrandingSection.vue'
import AgentLabSigninForm from '../../components/auth/AgentLabSigninForm.vue'
</script>
