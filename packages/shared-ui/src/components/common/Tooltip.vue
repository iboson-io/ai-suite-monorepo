<template>
  <div
    ref="triggerRef"
    class="inline-block"
    @mouseenter="showTooltip"
    @mouseleave="hideTooltip"
    @focusin="showTooltip"
    @focusout="hideTooltip"
  >
    <slot />

    <Teleport to="body">
      <div
        v-if="isVisible && !disabled && text"
        ref="tooltipRef"
        :style="tooltipStyle"
        class="pointer-events-none fixed z-[99999] whitespace-normal w-max max-w-[200px] text-center rounded-lg bg-black-400 px-md py-xs caption_1_medium primary_2_text_color shadow-md transition-opacity duration-200"
      >
        {{ text }}
        <!-- Speech Bubble Tail -->
        <div
          v-if="showTail"
          class="absolute w-0 h-0 border-transparent border-solid"
          :class="tailClasses"
        />
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { computed, nextTick, onUnmounted, ref, watch } from 'vue'

const props = defineProps({
  text: {
    type: String,
    default: '',
  },
  position: {
    type: String,
    default: 'right', // 'top', 'bottom', 'left', 'right'
  },
  delay: {
    type: Number,
    default: 100, // milliseconds delay
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  showTail: {
    type: Boolean,
    default: true,
  },
})

const triggerRef = ref(null)
const tooltipRef = ref(null)
const isVisible = ref(false)
const tooltipStyle = ref({})
const timer = ref(null)

const tailClasses = computed(() => {
  switch (props.position) {
    case 'top':
      return 'top-full left-1/2 -translate-x-1/2 border-t-black-400 border-l-[6px] border-r-[6px] border-t-[6px] border-b-0 -mt-[1px]'
    case 'bottom':
      return 'bottom-full left-1/2 -translate-x-1/2 border-b-black-400 border-l-[6px] border-r-[6px] border-b-[6px] border-t-0 -mb-[1px]'
    case 'left':
      return 'left-full top-1/2 -translate-y-1/2 border-l-black-400 border-t-[6px] border-b-[6px] border-l-[6px] border-r-0 -ml-[1px]'
    case 'right':
    default:
      return 'right-full top-1/2 -translate-y-1/2 border-r-black-400 border-t-[6px] border-b-[6px] border-r-[6px] border-l-0 -mr-[1px]'
  }
})

function showTooltip() {
  if (props.disabled || !props.text) return
  if (timer.value) clearTimeout(timer.value)
  timer.value = setTimeout(() => {
    isVisible.value = true
    nextTick(() => {
      updatePosition()
    })
  }, props.delay)
}

function hideTooltip() {
  if (timer.value) clearTimeout(timer.value)
  isVisible.value = false
}

function updatePosition() {
  const trigger = triggerRef.value
  const tooltip = tooltipRef.value
  if (!trigger || !tooltip) return

  const triggerRect = trigger.getBoundingClientRect()
  const tooltipRect = tooltip.getBoundingClientRect()

  let top = 0
  let left = 0

  if (props.position === 'right') {
    left = triggerRect.right + 8
    top = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2
  } else if (props.position === 'left') {
    left = triggerRect.left - tooltipRect.width - 8
    top = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2
  } else if (props.position === 'top') {
    left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2
    top = triggerRect.top - tooltipRect.height - 8
  } else if (props.position === 'bottom') {
    left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2
    top = triggerRect.bottom + 8
  }

  tooltipStyle.value = {
    left: `${left}px`,
    top: `${top}px`,
  }
}

// Clean up timer when component is destroyed
onUnmounted(() => {
  if (timer.value) clearTimeout(timer.value)
})

// Hide tooltip if it gets disabled dynamically
watch(() => props.disabled, (newVal) => {
  if (newVal) hideTooltip()
})
</script>
