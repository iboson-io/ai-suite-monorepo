<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
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

const menuOpen = ref(false)
const patternMenuRef = ref(null)

function onDocPointerDown(e) {
  const el = patternMenuRef.value
  if (!menuOpen.value || !el) return
  if (!el.contains(e.target)) {
    menuOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('pointerdown', onDocPointerDown, true)
})

onUnmounted(() => {
  document.removeEventListener('pointerdown', onDocPointerDown, true)
})

const typeLabel = computed(() => {
  const raw = props.data?.patternType
  if (!raw) return ''
  return String(raw).replace(/_/g, ' ')
})

const stepOrder = computed(() => {
  const n = Number(props.data?.executionOrder)
  return Number.isFinite(n) && n > 0 ? n : 0
})

/** Hover-only tooltip for pattern + menu (no focus-within). */
const patternMenuTip =
  'pointer-events-none absolute left-1/2 top-full z-[55] mt-1.5 w-max max-w-[14rem] -translate-x-1/2 rounded-md bg-slate-900 px-2 py-1.5 text-center text-[11px] font-medium leading-tight text-white opacity-0 shadow-lg transition-opacity duration-150 group-hover/wf-pmenu:opacity-100 whitespace-normal'
</script>

<template>
  <div
    class="wf-pattern relative flex h-full w-full flex-col overflow-visible rounded-xl border-2 border-dashed shadow-md"
    :class="[selected && 'z-[2] ring-2 ring-blue-500 ring-offset-2 ring-offset-[#f1f4f9]']"
    :style="{
      borderColor: data.ps?.stroke || '#ca8a04'
    }"
  >
    <Handle
      id="in"
      type="target"
      :position="Position.Left"
      :style="{
        top: `${Number(data?.handleInTopPct ?? 50)}%`,
        transform: 'translateY(-50%)'
      }"
      class="!h-2.5 !w-2.5 !border !border-slate-400 !bg-white"
    />
    <Handle
      id="out"
      type="source"
      :position="Position.Right"
      :style="{
        top: `${Number(data?.handleOutTopPct ?? 50)}%`,
        transform: 'translateY(-50%)'
      }"
      class="!h-2.5 !w-2.5 !border !border-slate-400 !bg-white"
    />

    <!-- Swimlane header (JointJS-style group frame) -->
    <div
      class="isolate z-30 flex h-10 min-h-10 shrink-0 items-center gap-2 rounded-t-[10px] border-b px-3"
      :style="{
        backgroundColor: data.ps?.header || '#fef3c7',
        borderColor: (data.ps?.stroke || '#ca8a04') + '55'
      }"
    >
      <span
        v-if="stepOrder"
        class="shrink-0 rounded bg-slate-800 px-1.5 py-0.5 text-[9px] font-bold tabular-nums text-white shadow-sm"
        title="Step order in this workflow (left → right on canvas)"
      >
        #{{ stepOrder }}
      </span>
      <span
        v-if="typeLabel"
        class="max-w-[40%] shrink-0 truncate rounded bg-white/70 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-slate-600"
      >
        {{ typeLabel }}
      </span>
      <div class="min-w-0 flex-1">
        <div class="truncate text-xs font-bold leading-tight text-slate-900">
          {{ data.title }}
        </div>
        <div v-if="data.subtitle" class="truncate text-[10px] leading-tight text-slate-600">
          {{ data.subtitle }}
        </div>
      </div>
      <div ref="patternMenuRef" class="relative z-40 shrink-0">
        <button
          type="button"
          class="group/wf-pmenu relative inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded-md border border-slate-300/80 bg-white text-slate-700 shadow-sm hover:bg-slate-50"
          aria-label="Pattern actions"
          :aria-expanded="menuOpen"
          aria-haspopup="menu"
          @click.stop="menuOpen = !menuOpen"
        >
          <svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.25" d="M12 5v14m7-7H5" />
          </svg>
          <span role="tooltip" :class="patternMenuTip">Pattern actions</span>
        </button>
        <!-- Open upward so the menu stays above agent cards (siblings paint on top of the pattern body). -->
        <div
          v-show="menuOpen"
          class="absolute right-0 bottom-full z-50 mb-1 w-44 rounded-lg border border-slate-200 bg-white p-1 py-1 shadow-xl shadow-slate-900/10"
          role="menu"
        >
          <button
            type="button"
            data-action="add-agent-to-pattern"
            class="w-full rounded-md px-2 py-1.5 text-left text-[11px] font-medium text-slate-700 hover:bg-slate-100"
            role="menuitem"
            @click="menuOpen = false"
          >
            Add agent to pattern
          </button>
          <button
            type="button"
            data-action="manage-pattern-agents"
            class="w-full rounded-md px-2 py-1.5 text-left text-[11px] font-medium text-slate-700 hover:bg-slate-100"
            role="menuitem"
            @click="menuOpen = false"
          >
            Manage pattern agents
          </button>
        </div>
      </div>
    </div>

    <div
      class="relative min-h-0 flex-1 overflow-hidden rounded-b-[10px]"
      :style="{
        backgroundColor: data.ps?.fill || 'rgba(254, 243, 199, 0.45)'
      }"
    />
  </div>
</template>
