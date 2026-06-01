<template>
  <div
    v-if="modelValue"
    class="column-modal-popup fixed right-3 top-1/2 z-[60] flex max-h-[calc(100vh-2rem)] w-[min(calc(100vw-2rem),450px)] max-w-[600px] -translate-y-1/2 flex-col rounded-xl bg_secondary_color p-6xl shadow-lg primary_border_color md:right-6 lg:right-10"
    role="dialog"
    aria-labelledby="column-modal-title"
    aria-modal="true"
    @click.stop
  >
    <div class="shrink-0">
      <h2 id="column-modal-title" class="heading_h6_bold primary_text_color">
        Columns
      </h2>
      <p class="label_1_regular secondary_text_color mt-md">
        Customize the visible columns or
        <a href="#" class="underline decoration-1 underline-offset-2 primary_text_color hover:opacity-80" @click.prevent>
          add new contact fields.
        </a>
      </p>
    </div>

    <div class="mb-5xl mt-5xl block h-[2px] w-full bg-info-50"></div>

    <ul class="min-h-0 flex-1 overflow-y-auto py-xs" role="list">
      <li
        v-for="(col, index) in orderedColumns"
        :key="col.id"
        class="flex items-center gap-md border-b border-[#F3F4F5] px-xl py-3xl hover:bg-info-50"
        @dragover.prevent="onRowDragOver"
        @drop.prevent="onRowDrop($event, index)"
      >
        <label class="flex min-w-0 flex-1 cursor-pointer items-center gap-md">
          <input
            v-model="draftChecked"
            type="checkbox"
            class="custom-checkbox h-5xl w-5xl cursor-pointer rounded"
            :value="col.id"
          />
          <span class="label_2_medium primary_text_color truncate">{{ col.label }}</span>
        </label>
        <div
          class="secondary_text_color flex shrink-0 cursor-grab touch-none select-none active:cursor-grabbing"
          draggable="true"
          title="Drag to reorder"
          aria-hidden="true"
          @dragstart="onHandleDragStart($event, index)"
          @dragend="onDragEnd"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M14.0833 7.41667V5.75C14.0833 5.30797 13.9077 4.88405 13.5952 4.57149C13.2826 4.25893 12.8587 4.08333 12.4167 4.08333H5.75C5.30797 4.08333 4.88405 4.25893 4.57149 4.57149C4.25893 4.88405 4.08333 5.30797 4.08333 5.75V12.4167C4.08333 12.8587 4.25893 13.2826 4.57149 13.5952C4.88405 13.9077 5.30797 14.0833 5.75 14.0833H7.41667M0.75 0.75V0.758333M4.08333 0.75V0.758333M7.41667 0.75V0.758333M10.75 0.75V0.758333M0.75 4.08333V4.09167M0.75 7.41667V7.425M0.75 10.75V10.7583M9.08333 9.08333L16.5833 11.5833L13.25 13.25L11.5833 16.5833L9.08333 9.08333Z"
              stroke="#9C9DA6"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </div>
      </li>
    </ul>

    <div class="mt-4xl flex shrink-0 justify-end gap-md pt-xl">
      <button
        type="button"
        class="rounded-md bg-[#F2F4F7] px-4 py-2.5 label_2_semibold primary_text_color transition-colors hover:bg-[#E8EAED]"
        @click="onCancel"
      >
        Cancel
      </button>
      <button type="button" class="primary_add_button rounded-md px-4 py-2.5 label_2_semibold" @click="onApply">
        Apply
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'

const DRAG_MIME = 'application/x-column-modal-index'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  /** `{ id, label }[]` display order */
  columns: {
    type: Array,
    default: () => []
  },
  /** Column ids currently shown in the table (order preserved) */
  visibleIds: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:modelValue', 'apply'])

/** Ids that are checked (visible in table) */
const draftChecked = ref([])
/** Full list order while the modal is open (drag reorder) */
const orderedColumnIds = ref([])
const dragSourceIndex = ref(null)

const columnById = computed(() => {
  const m = new Map()
  for (const c of props.columns) {
    m.set(c.id, c)
  }
  return m
})

const orderedColumns = computed(() => {
  const map = columnById.value
  return orderedColumnIds.value.map((id) => map.get(id)).filter(Boolean)
})

watch(
  () => props.modelValue,
  (open) => {
    if (!open) return
    const allowed = new Set(props.columns.map((c) => c.id))
    const fromParent = (props.visibleIds || []).filter((id) => allowed.has(id))
    draftChecked.value =
      fromParent.length > 0 ? [...fromParent] : props.columns.map((c) => c.id)

    const baseOrder = props.columns.map((c) => c.id)
    const seen = new Set()
    const next = []
    for (const id of props.visibleIds || []) {
      if (allowed.has(id) && !seen.has(id)) {
        next.push(id)
        seen.add(id)
      }
    }
    for (const id of baseOrder) {
      if (!seen.has(id)) {
        next.push(id)
        seen.add(id)
      }
    }
    orderedColumnIds.value = next
  },
  { flush: 'sync' }
)

function onHandleDragStart(event, index) {
  dragSourceIndex.value = index
  event.dataTransfer.effectAllowed = 'move'
  event.dataTransfer.setData(DRAG_MIME, String(index))
  try {
    event.dataTransfer.setData('text/plain', orderedColumnIds.value[index] || '')
  } catch {
    /* ignore */
  }
}

function onRowDragOver(event) {
  event.dataTransfer.dropEffect = 'move'
}

function onRowDrop(event, targetIndex) {
  const raw = event.dataTransfer.getData(DRAG_MIME)
  const from = raw === '' ? dragSourceIndex.value : Number.parseInt(raw, 10)
  if (from == null || Number.isNaN(from)) return
  if (from === targetIndex) return

  const next = [...orderedColumnIds.value]
  const [removed] = next.splice(from, 1)
  next.splice(targetIndex, 0, removed)
  orderedColumnIds.value = next
  dragSourceIndex.value = null
}

function onDragEnd() {
  dragSourceIndex.value = null
}

function onCancel() {
  emit('update:modelValue', false)
}

function onApply() {
  const checked = new Set(draftChecked.value)
  const orderedVisible = orderedColumnIds.value.filter((id) => checked.has(id))
  emit('apply', orderedVisible)
  emit('update:modelValue', false)
}
</script>
