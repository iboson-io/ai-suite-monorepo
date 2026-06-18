<template>
  <div class="relative" ref="dropdownRef">
    <button
      type="button"
      :disabled="disabled"
      @click="toggleDropdown"
      class="flex items-center gap-md rounded-lg border primary_border_color bg_secondary_color text-left outline-none primary_text_color disabled:opacity-75 disabled:cursor-not-allowed"
      :class="customClass || 'px-xl py-xs label_2_medium'"
    >
      <slot name="trigger" :selected-option="selectedOption" :is-open="isOpen">
        <img v-if="icon" :src="icon" alt="" class="shrink-0" />
        <span class="truncate">{{ selectedOptionLabel }}</span>
        <img
          v-if="showArrow"
          :src="DownArrow"
          alt=""
          class="h-4 w-4 shrink-0 transition-transform duration-200"
          :class="{ 'rotate-180': isOpen }"
        />
      </slot>
    </button>

    <div
      v-if="isOpen"
      ref="menuRef"
      :class="[
        'absolute left-0 z-50 rounded-md border primary_border_color bg_secondary_color max-h-48 overflow-y-auto shadow-md',
        dropdownClass || 'w-40',
        dropdownPosition === 'above' ? 'bottom-full mb-xs' : 'top-9'
      ]"
    >
      <div
        v-for="item in options"
        :key="item.id"
        @click="selectItem(item)"
        class="cursor-pointer px-xl py-md label_2_medium secondary_text_color hover:bg-gray-50"
      >
        <slot name="option" :option="item">
          {{ item.name }}
        </slot>
      </div>
      <div
        v-if="loading"
        class="px-xl py-md label_2_medium secondary_text_color"
      >
        Loading...
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import DownArrow from '../../assets/images/DownArrow.svg'

const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: null,
  },
  options: {
    type: Array,
    default: () => [],
  },
  placeholder: {
    type: String,
    default: 'Select Option',
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  icon: {
    type: String,
    default: '',
  },
  showArrow: {
    type: Boolean,
    default: true,
  },
  customClass: {
    type: String,
    default: '',
  },
  dropdownClass: {
    type: String,
    default: '',
  },
  loading: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue', 'change'])

const isOpen = ref(false)
const dropdownRef = ref(null)
const menuRef = ref(null)
const dropdownPosition = ref('below')

const selectedOption = computed(() => {
  return props.options.find(
    (opt) => (opt.id === props.modelValue) || (opt.id == null && props.modelValue == null)
  )
})

const selectedOptionLabel = computed(() => {
  return selectedOption.value?.name || props.placeholder
})

const calculatePosition = () => {
  if (!dropdownRef.value || !menuRef.value) return

  nextTick(() => {
    const rect = dropdownRef.value.getBoundingClientRect()
    const menuRect = menuRef.value.getBoundingClientRect()
    const viewportHeight = window.innerHeight
    const spaceBelow = viewportHeight - rect.bottom
    const spaceAbove = rect.top
    const menuHeight = menuRect.height || 200

    if (spaceBelow < menuHeight && spaceAbove > spaceBelow) {
      dropdownPosition.value = 'above'
    } else {
      dropdownPosition.value = 'below'
    }
  })
}

const toggleDropdown = () => {
  if (props.disabled) return
  isOpen.value = !isOpen.value
}

const selectItem = (item) => {
  emit('update:modelValue', item.id)
  emit('change', item)
  isOpen.value = false
}

const handleClickOutside = (event) => {
  if (isOpen.value && dropdownRef.value && !dropdownRef.value.contains(event.target)) {
    isOpen.value = false
  }
}

const handleResize = () => {
  if (isOpen.value) {
    calculatePosition()
  }
}

watch(isOpen, (newVal) => {
  if (newVal) {
    nextTick(() => {
      calculatePosition()
    })
  }
})

onMounted(() => {
  document.addEventListener('click', handleClickOutside, true)
  window.addEventListener('resize', handleResize)
  window.addEventListener('scroll', handleResize, true)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside, true)
  window.removeEventListener('resize', handleResize)
  window.removeEventListener('scroll', handleResize, true)
})
</script>
