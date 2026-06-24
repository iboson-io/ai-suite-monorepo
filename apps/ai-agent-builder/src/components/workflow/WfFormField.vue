<template>
  <div class="wf-form-field">
    <label v-if="label" class="wf-form-field__label">{{ label }}</label>
    <slot />
  </div>
</template>

<script setup>
defineProps({
  label: {
    type: String,
    default: ''
  }
})
</script>

<style scoped>
.wf-form-field {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.wf-form-field__label {
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: -0.12px;
  line-height: 1rem;
  color: #6f707d;
}
</style>
