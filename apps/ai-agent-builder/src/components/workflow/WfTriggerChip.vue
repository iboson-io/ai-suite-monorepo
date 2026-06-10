<script setup>
import { Handle, Position } from '@vue-flow/core'

defineProps({
  data: {
    type: Object,
    default: () => ({})
  },
  selected: {
    type: Boolean,
    default: false
  }
})
</script>

<template>
  <div
    class="group/chip relative flex h-full w-full flex-col justify-center rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-left shadow-sm ring-1 ring-slate-900/5 transition hover:border-blue-300 hover:shadow-md"
    :class="[selected && '!ring-2 !ring-blue-500 !ring-offset-2 !ring-offset-[#f1f4f9] z-[2]']"
  >
    <Handle
      type="target"
      :position="Position.Left"
      class="!h-2 !w-2 !border !border-slate-300 !bg-white"
    />
    <Handle
      type="source"
      :position="Position.Right"
      class="!h-2 !w-2 !border !border-slate-300 !bg-white"
    />
    <span class="text-[9px] font-bold uppercase tracking-wide text-slate-400">Trigger</span>
    <span class="truncate text-[11px] font-semibold capitalize leading-tight text-slate-900">
      {{ data.triggerType || 'event' }}
    </span>
    <span class="truncate text-[9px] leading-tight text-slate-500">{{ data.subtitle || '—' }}</span>
    <div class="group/del absolute -right-1.5 -top-1.5 z-10">
      <button
        type="button"
        data-action="delete-trigger"
        :data-trigger-id="data.triggerId"
        class="flex h-5 w-5 items-center justify-center rounded-full border border-slate-300 bg-white text-[11px] font-bold leading-none text-slate-700 shadow-md opacity-0 transition hover:bg-red-50 hover:text-red-700 group-hover/chip:opacity-100"
        aria-label="Remove trigger"
      >
        ×
      </button>
      <span
        role="tooltip"
        class="pointer-events-none absolute bottom-full left-1/2 z-[10060] mb-1.5 w-max -translate-x-1/2 rounded-md bg-black px-2 py-1.5 text-center text-[11px] font-medium leading-tight text-white opacity-0 shadow-lg transition-opacity duration-150 group-hover/del:opacity-100 group-focus-within/del:opacity-100"
      >
        Remove trigger
      </span>
    </div>
  </div>
</template>
