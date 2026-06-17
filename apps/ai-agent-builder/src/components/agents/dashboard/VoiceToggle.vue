<template>
  <div class="voice-toggle-container">
    <span class="voice-toggle-label">Voice Output</span>
    <button
      type="button"
      @click="$emit('update:modelValue', !modelValue)"
      class="voice-toggle-button"
      :class="{ 'is-active': modelValue }"
      role="switch"
      :aria-checked="modelValue"
    >
      <span
        class="voice-toggle-slider"
        :class="{ 'is-active': modelValue }"
      />
    </button>
  </div>
</template>

<script setup>
defineProps({
  modelValue: {
    type: Boolean,
    required: true,
  },
})

defineEmits(['update:modelValue'])
</script>

<style scoped>
.voice-toggle-container {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(8px);
  padding: 6px 12px;
  border-radius: 9999px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  user-select: none;
}

.voice-toggle-label {
  font-family: inherit;
  font-size: 12px;
  font-weight: 500;
  color: #111827;
}

.voice-toggle-button {
  position: relative;
  display: inline-flex;
  height: 20px;
  width: 36px;
  shrink-0: 0;
  cursor: pointer;
  border-radius: 9999px;
  border: 2px solid transparent;
  background-color: #E5E7EB;
  transition: background-color 0.2s ease-in-out;
  outline: none;
  padding: 0;
}

.voice-toggle-button.is-active {
  background-color: #000000;
}

.voice-toggle-slider {
  pointer-events: none;
  display: inline-block;
  height: 16px;
  width: 16px;
  transform: translateX(0);
  border-radius: 9999px;
  background-color: #ffffff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
  transition: transform 0.2s ease-in-out;
}

.voice-toggle-slider.is-active {
  transform: translateX(16px);
}
</style>
