<template>
  <div
    data-sub-sidebar
    class="h-full shrink-0 overflow-hidden transition-[width] duration-500 ease-out"
    :class="panelWidthClass"
    @click.stop
    @mousedown.stop
  >
    <aside
      class="flex h-full w-full flex-col border-r primary_border_color bg_secondary_color shadow-sm transition-transform duration-500 ease-out"
      :class="isOpen ? 'translate-x-0 opacity-100' : 'pointer-events-none -translate-x-full opacity-0'"
      :style="{ width: panelWidth }"
    >
      <div class="flex min-h-0 min-w-0 flex-1 flex-col">
        <div class="flex shrink-0 items-center justify-between gap-md border-b primary_border_color px-4xl py-3xl">
          <div class="flex min-w-0 items-center gap-md">
            <h3 class="label_1_semibold primary_text_color truncate">{{ title }}</h3>
            <img v-if="infoIcon" :src="infoIcon" alt="" class="h-4 w-4 shrink-0 opacity-50" />
          </div>
          <button
            type="button"
            class="rounded-lg p-sm transition-colors hover:bg-gray-25"
            aria-label="Close panel"
            @click="$emit('close')"
          >
            <svg class="h-5 w-5 secondary_text_color" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div class="custom_scrollbar min-h-0 flex-1 overflow-y-auto p-4xl">
          <slot />
        </div>

        <div v-if="$slots.footer" class="shrink-0 border-t primary_border_color p-4xl">
          <slot name="footer" />
        </div>
      </div>
    </aside>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import InfoIcon from '../../../assets/images/agents/dashboard/info.svg'

const props = defineProps({
  title: {
    type: String,
    required: true,
  },
  isOpen: {
    type: Boolean,
    default: false,
  },
  wide: {
    type: Boolean,
    default: false,
  },
  infoIcon: {
    type: String,
    default: InfoIcon,
  },
})

defineEmits(['close'])

const panelWidth = computed(() => {
  if (props.wide) return 'min(900px, 55vw)'
  return 'var(--sub-sidebar-width, 24rem)'
})

const panelWidthClass = computed(() => {
  if (!props.isOpen) return 'w-0'
  return props.wide ? 'w-[min(900px,55vw)]' : 'w-[calc(100vw-5rem)] lg:w-96'
})
</script>

<style scoped>
[data-sub-sidebar] {
  --sub-sidebar-width: calc(100vw - 5rem);
}
@media (min-width: 1024px) {
  [data-sub-sidebar] {
    --sub-sidebar-width: 24rem;
  }
}
</style>
