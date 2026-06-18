<template>
  <div class="relative" :class="wrapperClass">
    <span class="absolute inset-y-0 left-0 flex items-center pl-4xl pointer-events-none">
      <svg class="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    </span>
    <input
      ref="inputRef"
      :value="modelValue"
      type="text"
      :placeholder="placeholder"
      class="w-full rounded-lg border primary_border_color bg-white pl-10xl pr-10xl py-md label_2_regular primary_text_color outline-none placeholder:text-gray-400 focus:border-info-300 transition-colors"
      :class="customClass"
      v-bind="$attrs"
      @input="onInput"
    />
    <button
      v-if="modelValue"
      type="button"
      class="absolute inset-y-0 right-0 flex items-center px-4xl text-gray-400 hover:text-gray-600 transition-colors"
      @click="clear"
      aria-label="Clear search"
    >
      <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  </div>
</template>

<script setup>
import { ref } from 'vue'

defineOptions({
  inheritAttrs: false,
})

const props = defineProps({
  modelValue: {
    type: String,
    default: '',
  },
  placeholder: {
    type: String,
    default: 'Search...',
  },
  customClass: {
    type: String,
    default: '',
  },
  wrapperClass: {
    type: String,
    default: 'w-full',
  },
})

const emit = defineEmits(['update:modelValue', 'input', 'clear'])
const inputRef = ref(null)

const onInput = (event) => {
  emit('update:modelValue', event.target.value)
  emit('input', event)
}

const clear = () => {
  emit('update:modelValue', '')
  emit('clear')
  emit('input', { target: { value: '' } })
  if (inputRef.value) {
    inputRef.value.focus()
  }
}
</script>
