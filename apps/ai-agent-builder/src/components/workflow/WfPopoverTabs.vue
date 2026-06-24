<template>
  <div class="wf-popover-tabs">
    <button
      v-for="tab in tabs"
      :key="tab.id"
      type="button"
      class="wf-popover-tabs__button"
      :class="{ 'wf-popover-tabs__button--active': modelValue === tab.id }"
      @click="$emit('update:modelValue', tab.id)"
    >
      {{ tab.label }}
    </button>
  </div>
</template>

<script setup>
defineProps({
  modelValue: {
    type: String,
    required: true
  },
  tabs: {
    type: Array,
    required: true
  }
})

defineEmits(['update:modelValue'])
</script>

<style scoped>
.wf-popover-tabs {
  display: flex;
  margin-bottom: 0.25rem;
  border-bottom: 1px solid #f3f4f5;
  padding-bottom: 0.375rem;
}

.wf-popover-tabs__button {
  flex: 1;
  border-bottom: 2px solid transparent;
  padding-bottom: 0.25rem;
  text-align: center;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: -0.12px;
  line-height: 1rem;
  color: #6f707d;
  transition: color 0.15s ease, border-color 0.15s ease;
}

.wf-popover-tabs__button:hover {
  color: #28293d;
}

.wf-popover-tabs__button--active {
  border-bottom-color: #28293d;
  color: #28293d;
}
</style>
