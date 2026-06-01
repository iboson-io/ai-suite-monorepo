<template>
  <div class="modal" v-if="open">
    <div class="modal-content">
      <h2>Brand Created Successfully!</h2>
      <p>Your brand has been created successfully.</p>
      <button @click="$emit('close')">Close</button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  open: {
    type: Boolean,
    default: false
  }
});

defineEmits(['close']);
</script>