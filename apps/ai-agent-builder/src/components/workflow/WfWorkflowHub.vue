<script setup>
import { ref, inject, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import { Handle, Position, useVueFlow } from '@vue-flow/core'

const WF_OPEN_PATTERN_REORDER = 'wfOpenPatternReorder'
const WF_OPEN_HITL_CONFIG = 'wfOpenHitlConfig'

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

/** Vue Flow passes this listener on custom nodes; required when template has multiple roots (fragment + Teleport). */
const emit = defineEmits(['updateNodeInternals'])

const { viewport } = useVueFlow()

const addStepDetails = ref(null)
const hubMenuOpen = ref(false)
const hubMenuWrap = ref(null)
const hubMenuPortalRef = ref(null)
const hubMenuPortalStyle = ref({})

const openPatternReorderModal = inject(WF_OPEN_PATTERN_REORDER, null)
const openHitlConfig = inject(WF_OPEN_HITL_CONFIG, null)

/** Hover-only tooltip for the + add-step control (no focus-within — avoids stuck tooltip after click). */
const addStepTip =
  'pointer-events-none absolute left-1/2 top-full z-[60] mt-1.5 w-max max-w-[14rem] -translate-x-1/2 rounded-md bg-slate-900 px-2 py-1.5 text-center text-[11px] font-medium leading-tight text-white opacity-0 shadow-lg transition-opacity duration-150 group-hover/wf-hub-add:opacity-100 whitespace-normal'

function closeAddStepMenu() {
  const el = addStepDetails.value
  if (el && 'open' in el) el.open = false
}

/** Child nodes (e.g. trigger chips) stack above parent content in Vue Flow; portal keeps the menu on top. */
function updateHubMenuPosition() {
  const el = hubMenuWrap.value
  if (!el) return
  const r = el.getBoundingClientRect()
  const w = 176
  hubMenuPortalStyle.value = {
    top: `${Math.round(r.bottom + 4)}px`,
    left: `${Math.round(r.right - w)}px`
  }
}

function toggleHubMenu(e) {
  e?.stopPropagation?.()
  e?.preventDefault?.()
  hubMenuOpen.value = !hubMenuOpen.value
}

function onHubReorderPatterns() {
  hubMenuOpen.value = false
  openPatternReorderModal?.()
}

function onHubConfigureHitl() {
  hubMenuOpen.value = false
  openHitlConfig?.()
}

function onHubDocumentClick(e) {
  if (!hubMenuOpen.value) return
  const t = e.target
  if (!(t instanceof Node)) return
  const wrap = hubMenuWrap.value
  const portal = hubMenuPortalRef.value
  if (wrap?.contains(t) || portal?.contains(t)) return
  hubMenuOpen.value = false
}

/** Native details element for the + menu has no outside-click close; mirror hub menu behavior. */
function closeAddStepIfOutside(e) {
  const el = addStepDetails.value
  if (!el || !el.open) return
  const t = e.target
  if (!(t instanceof Node)) return
  if (el.contains(t)) return
  el.open = false
}

function onResizeOrScroll() {
  if (hubMenuOpen.value) updateHubMenuPosition()
}

watch(hubMenuOpen, async (open) => {
  if (open) {
    await nextTick()
    updateHubMenuPosition()
  }
  emit('updateNodeInternals')
})

watch(
  () => [viewport.value.x, viewport.value.y, viewport.value.zoom, hubMenuOpen.value],
  () => {
    if (hubMenuOpen.value) nextTick(updateHubMenuPosition)
  }
)

onMounted(() => {
  document.addEventListener('click', onHubDocumentClick)
  document.addEventListener('click', closeAddStepIfOutside)
  /** Capture: Vue Flow pane often handles pointer before click bubbles to document. */
  document.addEventListener('pointerdown', closeAddStepIfOutside, true)
  window.addEventListener('resize', onResizeOrScroll)
  window.addEventListener('scroll', onResizeOrScroll, true)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', onHubDocumentClick)
  document.removeEventListener('click', closeAddStepIfOutside)
  document.removeEventListener('pointerdown', closeAddStepIfOutside, true)
  window.removeEventListener('resize', onResizeOrScroll)
  window.removeEventListener('scroll', onResizeOrScroll, true)
})
</script>

<template>
  <!-- Single root so Vue Flow node attrs (id, position, …) inherit; Teleport inside avoids a fragment. -->
  <div class="wf-workflow-hub-root relative h-full w-full min-h-0">
    <div
      class="wf-workflow-hub relative flex h-full w-full flex-col overflow-visible rounded-xl bg-white p-0 text-left shadow-lg"
      :class="[selected && 'z-[2] ring-2 ring-blue-500 ring-offset-2 ring-offset-[#f1f4f9]']"
    style="
      border: 2px solid transparent;
      background-image: linear-gradient(white, white), linear-gradient(125deg, #fbbf24, #fb7185, #a78bfa);
      background-origin: border-box;
      background-clip: padding-box, border-box;
    "
  >
    <Handle
      type="source"
      :position="Position.Right"
      id="out"
      class="!h-2.5 !w-2.5 !-translate-y-1/2 !border !border-slate-400 !bg-white"
      style="top: 50%"
    />
    <div class="flex items-start gap-1 border-b border-slate-100 px-4 pb-2 pt-3">
      <p class="mt-0.5 min-w-0 flex-1 truncate text-sm font-bold leading-snug text-slate-900">
        {{ data.workflowName || 'Workflow' }}
      </p>
      <div ref="hubMenuWrap" class="relative shrink-0 -mr-1 -mt-0.5">
        <button
          type="button"
          class="rounded-md p-1.5 text-slate-600 hover:bg-slate-100 hover:text-slate-900 disabled:opacity-40"
          title="Workflow options"
          aria-label="Workflow options"
          aria-haspopup="menu"
          :aria-expanded="hubMenuOpen"
          :disabled="!data.workflowId"
          @pointerdown.stop
          @click.stop="toggleHubMenu"
        >
          <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M12 8a2 2 0 110-4 2 2 0 010 4zm0 6a2 2 0 110-4 2 2 0 010 4zm0 6a2 2 0 110-4 2 2 0 010 4z"
            />
          </svg>
        </button>
      </div>
    </div>

    <div class="flex min-h-0 flex-1 flex-col overflow-y-auto px-4 pb-2 pt-2">
      <p class="text-[11px] font-semibold text-slate-500">Triggers</p>
      <div
        v-if="!data.triggerCount"
        class="mt-2 flex min-h-[4.5rem] flex-1 flex-col items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50/80 px-2 py-3"
      >
        <p class="mb-2 text-center text-[10px] text-slate-500">No triggers yet</p>
        <button
          type="button"
          data-action="add-trigger"
          class="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-slate-800"
        >
          <svg class="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Add trigger
        </button>
      </div>
    </div>

    <!-- Zapier-style: dashed stem + add step (+) with action menu -->
    <div class="flex flex-shrink-0 flex-col items-center px-4 pb-1 pt-0">
      <div class="h-7 shrink-0 border-l-2 border-dashed border-slate-300" aria-hidden="true" />
    </div>

    <div class="relative flex flex-shrink-0 flex-col items-center px-3 pb-3 pt-0">
      <details ref="addStepDetails" class="relative z-20">
        <summary
          class="group/wf-hub-add relative flex h-9 w-9 cursor-pointer list-none items-center justify-center rounded-full border-2 border-transparent bg-white text-lg font-light text-slate-600 shadow-sm outline-none ring-offset-2 transition hover:text-blue-700 focus-visible:ring-2 focus-visible:ring-blue-400 [&::-webkit-details-marker]:hidden"
          style="
            background-image: linear-gradient(white, white), linear-gradient(125deg, #fbbf24, #fb7185, #a78bfa);
            background-origin: border-box;
            background-clip: padding-box, border-box;
          "
          aria-label="Add step"
        >
          <span aria-hidden="true">+</span>
          <span role="tooltip" :class="addStepTip">Add step</span>
        </summary>
        <div
          class="absolute left-1/2 top-[calc(100%+6px)] z-50 w-[min(16rem,calc(100vw-2rem))] -translate-x-1/2 rounded-xl border border-slate-200/90 bg-white py-1 shadow-lg shadow-slate-900/10"
          role="menu"
          aria-label="Add step options"
        >
          <button
            type="button"
            role="menuitem"
            data-action="add-trigger"
            class="flex w-full px-4 py-2.5 text-left text-sm font-medium text-slate-800 hover:bg-slate-50"
            @click="closeAddStepMenu"
          >
            Triggers
          </button>
          <button
            type="button"
            role="menuitem"
            data-action="add-pattern"
            class="flex w-full px-4 py-2.5 text-left text-sm font-medium text-slate-800 hover:bg-slate-50"
            @click="closeAddStepMenu"
          >
            Add pattern
          </button>
        </div>
      </details>
    </div>
    </div>

    <Teleport to="body">
      <div
        v-if="hubMenuOpen"
        ref="hubMenuPortalRef"
        class="fixed z-[20000] w-44 overflow-hidden rounded-lg border border-slate-200 bg-white py-1 shadow-xl shadow-slate-900/15"
        role="menu"
        aria-label="Workflow hub options"
        :style="hubMenuPortalStyle"
        @pointerdown.stop
        @click.stop
      >
        <button
          type="button"
          role="menuitem"
          class="w-full px-3 py-2 text-left text-sm font-medium text-slate-800 hover:bg-slate-50"
          @click="onHubReorderPatterns"
        >
          Reorder patterns
        </button>
        <button
          type="button"
          role="menuitem"
          class="w-full px-3 py-2 text-left text-sm font-medium text-slate-800 hover:bg-slate-50"
          @click="onHubConfigureHitl"
        >
          Human-in-the-loop (HITL)
        </button>
      </div>
    </Teleport>
  </div>
</template>
