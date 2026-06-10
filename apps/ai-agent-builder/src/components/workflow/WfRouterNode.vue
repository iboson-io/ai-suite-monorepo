<script setup>
import { computed } from 'vue'
import { Handle, Position } from '@vue-flow/core'

const props = defineProps({
  data: {
    type: Object,
    default: () => ({})
  },
  selected: {
    type: Boolean,
    default: false
  }
})

const routeLine = computed(() => {
  const n = props.data?.rules?.length || 0
  const fb = props.data?.hasFallback
  if (n === 0 && !fb) return 'Configure routing in the panel'
  return `${n} rule(s)${fb ? ' · else' : ''}`
})
</script>

<template>
  <div
    class="wf-router flex h-full w-full flex-col justify-center rounded-full border-2 border-emerald-700 bg-gradient-to-br from-emerald-50 to-emerald-100/90 px-4 text-emerald-950 shadow-md ring-1 ring-emerald-600/25"
    :class="[selected && '!ring-2 !ring-blue-500 !ring-offset-2 !ring-offset-[#f1f4f9] z-[2]']"
  >
    <Handle
      id="in"
      type="target"
      :position="Position.Left"
      class="!h-2.5 !w-2.5 !border-2 !border-white !bg-emerald-700"
    />
    <Handle
      id="out"
      type="source"
      :position="Position.Right"
      class="!h-2.5 !w-2.5 !border-2 !border-white !bg-emerald-700"
    />
    <div class="text-center text-[11px] font-semibold leading-tight">
      <div>Supervisor router</div>
      <div class="mt-0.5 text-[10px] font-normal opacity-90">
        {{ routeLine }}
      </div>
    </div>
  </div>
</template>
