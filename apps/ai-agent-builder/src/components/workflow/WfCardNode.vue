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

/** Joint-style swimlane cards: light surface + strong left accent */
const surfaceClass = computed(() => {
  const r = props.data?.role
  if (r === 'trigger') return 'bg-white text-blue-950'
  if (r === 'agent') return 'bg-white text-slate-900'
  if (r === 'output') return 'bg-violet-50/90 text-violet-950'
  if (r === 'hitl') return 'bg-orange-50/90 text-orange-950'
  return 'bg-white text-slate-900'
})

const accentClass = computed(() => {
  const r = props.data?.role
  if (r === 'trigger') return 'border-l-blue-600'
  if (r === 'agent') return 'border-l-emerald-600'
  if (r === 'output') return 'border-l-violet-600'
  if (r === 'hitl') return 'border-l-orange-500'
  return 'border-l-slate-400'
})

const showTarget = computed(() => props.data?.role !== 'trigger')
const showSource = computed(() => props.data?.role !== 'output' && props.data?.role !== 'hitl')

const heading = computed(() => {
  const h = props.data?.heading
  return h != null && String(h).trim() ? String(h).trim() : ''
})

const reorderHint = computed(() => {
  if (props.data?.role !== 'agent' || props.data?.patternAgentId == null) return undefined
  return props.data?.agentArrangement === 'row'
    ? 'Drag horizontally to reorder agents · release to save execution order'
    : 'Drag vertically to reorder agents · release to save execution order'
})

/** Supervisor agents: only the two right handles (out + router ingress); no left port. */
const isSupervisorAgent = computed(
  () => props.data?.role === 'agent' && String(props.data?.patternType || '') === 'supervisor'
)
</script>

<template>
  <div
    class="wf-card min-w-[160px] max-w-[220px] rounded-lg border border-y border-r border-slate-200/90 py-2 pl-2.5 pr-3 text-left shadow-md"
    :class="[
      surfaceClass,
      accentClass,
      'border-l-4',
      selected && 'z-[2] ring-2 ring-blue-500 ring-offset-2 ring-offset-[#f1f4f9]'
    ]"
    :title="reorderHint"
  >
    <!-- Agent: sequential/parallel — one in (left), one out (right). Supervisor — out + in-router on right only (no left). -->
    <template v-if="data?.role === 'agent'">
      <Handle
        v-if="!isSupervisorAgent"
        id="in"
        type="target"
        :position="Position.Left"
        :style="{ top: '50%', transform: 'translateY(-50%)' }"
        class="!h-2.5 !w-2.5 !border !border-slate-400 !bg-white"
      />
      <Handle
        v-if="isSupervisorAgent"
        id="in-router"
        type="target"
        :position="Position.Right"
        :style="{ top: '72%', transform: 'translateY(-50%)' }"
        class="!h-2.5 !w-2.5 !border !border-emerald-500 !bg-white"
      />
      <Handle
        v-if="showSource"
        id="out"
        type="source"
        :position="Position.Right"
        :style="
          isSupervisorAgent
            ? { top: '28%', transform: 'translateY(-50%)' }
            : { top: '50%', transform: 'translateY(-50%)' }
        "
        class="!h-2.5 !w-2.5 !border !border-slate-400 !bg-white"
      />
    </template>
    <template v-else>
      <Handle
        v-if="showTarget"
        type="target"
        :position="Position.Left"
        class="!h-2.5 !w-2.5 !border !border-slate-400 !bg-white"
      />
      <Handle
        v-if="showSource"
        type="source"
        :position="Position.Right"
        class="!h-2.5 !w-2.5 !border !border-slate-400 !bg-white"
      />
    </template>
    <div class="flex min-w-0 items-start gap-1.5">
      <span
        v-if="heading"
        class="max-w-[42%] shrink-0 truncate rounded bg-emerald-50 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-emerald-800 ring-1 ring-emerald-700/15"
      >
        {{ heading }}
      </span>
      <div class="min-w-0 flex-1">
        <div class="truncate text-xs font-bold leading-tight">
          {{ data.title }}
        </div>
        <div
          v-if="data.subtitle"
          class="mt-0.5 break-all text-[11px] font-medium leading-snug opacity-90"
        >
          {{ data.subtitle }}
        </div>
      </div>
    </div>
  </div>
</template>
