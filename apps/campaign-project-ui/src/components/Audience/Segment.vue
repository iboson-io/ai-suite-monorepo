<template>
  <div class="bg_secondary_color rounded-[12px] p-6xl primary_border_color">
    <!-- Table when segments exist -->
    <div v-if="segmentRows.length > 0">
      <div class="mb-6xl flex flex-wrap items-center justify-between gap-4xl">
        <div ref="sortDropdownRoot" class="relative">
          <button
            type="button"
            class="product-select relative flex w-full min-w-[200px] items-center gap-md rounded-lg bg_secondary_color py-md pl-3xl pr-10xl label_2_medium primary_text_color regular_border_color"
            :class="isSortDropdownOpen ? 'border-[3px] border-[#D9E2FC]' : ''"
            @click="toggleSortDropdown"
          >
            <span class="product-text truncate whitespace-nowrap">{{ sortButtonLabel }}</span>
            <img
              :src="DownArrow"
              alt=""
              class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 md:right-4"
            />
          </button>
          <div
            v-if="isSortDropdownOpen"
            class="absolute left-0 top-full z-50 mt-sm min-w-[200px] rounded-md bg_secondary_color shadow-lg primary_border_color"
            @click.stop
          >
            <button
              v-for="opt in sortOptions"
              :key="opt.id"
              type="button"
              class="flex w-full px-xl py-3xl text-left label_2_medium hover:bg-info-50"
              :class="selectedSortId === opt.id ? 'bg-info-50 primary_text_color' : 'primary_text_color'"
              @click="selectSort(opt.id)"
            >
              {{ opt.label }}
            </button>
          </div>
        </div>

        <button type="button" class="inline-flex items-center gap-2 rounded-lg px-4xl py-lg primary_add_button label_1_semibold" @click="openCreateSegmentModal">
          <img :src="PlusIconWhite" alt="" />
          Create segment
        </button>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b primary_border_color bg-info-50">
              <th class="p-xl text-left">
                <input type="checkbox" class="custom-checkbox h-5xl w-5xl cursor-pointer rounded" />
              </th>
              <th class="p-xl text-left label_3_semibold secondary_text_color">Name</th>
              <th class="p-xl text-left label_3_semibold secondary_text_color">Created</th>
              <th class="p-xl text-left label_3_semibold secondary_text_color">Last run</th>
              <th class="p-xl text-left label_3_semibold secondary_text_color">Revenue</th>
              <th class="p-xl text-right label_3_semibold secondary_text_color" aria-label="Actions"></th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="row in paginatedSegments"
              :key="row.id"
              class="border-b primary_border_color hover:bg-info-50"
            >
              <td class="p-xl">
                <input type="checkbox" class="custom-checkbox h-5xl w-5xl cursor-pointer rounded" />
              </td>
              <td class="p-xl label_2_medium secondary_text_color">
                {{ row.name }}
              </td>
              <td class="p-xl label_2_medium secondary_text_color">
                {{ row.created }}
              </td>
              <td class="p-xl label_2_medium secondary_text_color">
                {{ row.lastRun }}
              </td>
              <td class="p-xl label_2_medium secondary_text_color">
                {{ row.revenue }}
              </td>
              <td class="p-xl text-right">
                <div class="relative inline-block text-left">
                  <button
                    type="button"
                    data-segment-actions-trigger
                    class="inline-flex rounded-md p-1 hover:bg-info-100"
                    :class="rowMenuOpenForId === row.id ? 'bg-info-100' : ''"
                    aria-label="Row actions"
                    aria-haspopup="menu"
                    :aria-expanded="rowMenuOpenForId === row.id"
                    @click.stop="toggleRowMenu(row.id, $event)"
                  >
                    <img :src="ThreeDotsIcon" alt="" class="h-5 w-5" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="mt-6xl flex flex-wrap items-center justify-between gap-4">
        <div class="flex shrink-0 items-center gap-4">
          <span class="label_2_regular secondary_text_color">Rows per page:</span>
          <select
            v-model.number="rowsPerPage"
            class="rounded-md border px-3 py-1 primary_border_color"
            @change="currentPage = 1"
          >
            <option :value="7">7</option>
            <option :value="25">25</option>
            <option :value="50">50</option>
            <option :value="100">100</option>
          </select>
        </div>
        <nav class="flex min-w-0 flex-1 justify-center" aria-label="Pagination">
          <div
            class="inline-flex max-w-full items-stretch divide-x divide-gray-200 overflow-x-auto rounded-lg border bg_secondary_color label_2_regular primary_border_color shadow-sm secondary_text_color [scrollbar-width:thin]"
          >
            <button
              type="button"
              class="flex items-center gap-2 px-4 py-2.5 transition-colors hover:bg-gray-50 disabled:pointer-events-none disabled:opacity-40 disabled:hover:bg-transparent"
              :disabled="currentPage === 1"
              @click="currentPage = Math.max(1, currentPage - 1)"
            >
              <svg class="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
              <span>Previous</span>
            </button>

            <template v-for="(item, idx) in paginationItems" :key="`p-${idx}-${String(item)}`">
              <button
                v-if="typeof item === 'number'"
                type="button"
                class="min-w-[2.5rem] px-3 py-2.5 transition-colors hover:bg-info-50 primary_border_color"
                :class="item === currentPage ? 'bg-info-100 font-medium primary_text_color' : ''"
                @click="currentPage = item"
              >
                {{ item }}
              </button>
              <span
                v-else
                class="flex min-w-[2.25rem] items-center justify-center px-2 py-2.5 select-none tracking-widest text-gray-500"
                aria-hidden="true"
              >
                ...
              </span>
            </template>

            <button
              type="button"
              class="flex items-center gap-2 px-4 py-2.5 transition-colors hover:bg-gray-50 disabled:pointer-events-none disabled:opacity-40 disabled:hover:bg-transparent"
              :disabled="currentPage === totalPages"
              @click="currentPage = Math.min(totalPages, currentPage + 1)"
            >
              <span>Next</span>
              <svg class="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </nav>
      </div>
    </div>

    <!-- Empty state -->
    <div v-else class="flex h-full min-h-[420px] flex-col items-center justify-center py-16 text-center">
      <img :src="ContactAdience" alt="" class="mb-6xl w-[170px]" />

      <div class="w-full max-w-lg px-md">
        <h3 class="heading_h6_semibold primary_text_color mb-md">Create your first segment</h3>
        <p class="label_1_regular secondary_text_color mb-6xl">
          A segment is a dynamic set of contacts that you create. Use segments to target contacts by location,
          engagement, behavior, and more.
        </p>
      </div>

      <button type="button" class="primary_add_button label_1_semibold px-6xl p-md" @click="openCreateSegmentModal">Create segment</button>
    </div>

    <!-- Row actions menu (teleported to avoid table overflow clipping) -->
    <Teleport to="body">
      <div
        v-if="rowMenuOpenForId !== null"
        data-segment-actions-panel
        class="fixed z-[100] overflow-hidden rounded-lg bg_secondary_color py-xs shadow-lg"
        :style="rowMenuStyle"
        role="menu"
        @click.stop
      >
        <button
          type="button"
          role="menuitem"
          class="flex w-full items-center gap-md px-xl py-3xl text-left label_2_medium primary_text_color transition-colors hover:bg-info-50"
          @click="onRowMenuSelect('edit')"
        >
          <img :src="EditIcon" alt="" class="h-4xl w-4xl shrink-0 text-black-400" />
          Edit
        </button>
        <button
          type="button"
          role="menuitem"
          class="flex w-full items-center gap-md px-xl py-3xl text-left label_2_medium primary_text_color transition-colors hover:bg-info-50"
          @click="onRowMenuSelect('email')"
        >
          <img :src="SendEmail" alt="" class="h-4xl w-4xl shrink-0 text-black-400" />
          Send email
        </button>
        <button
          type="button"
          role="menuitem"
          class="flex w-full items-center gap-md px-xl py-3xl text-left label_2_medium primary_text_color transition-colors hover:bg-info-50"
          @click="onRowMenuSelect('export')"
        >
          <img :src="ExportIcon" alt="" class="h-4xl w-4xl shrink-0 text-black-400" />
          Export as CSV
        </button>
        <div class="my-xs border-t primary_border_color" role="separator" />
        <button
          type="button"
          role="menuitem"
          class="flex w-full items-center gap-md px-xl py-3xl text-left label_2_medium primary_text_color transition-colors hover:bg-info-50"
          @click="onRowMenuSelect('delete')"
        >
          <img :src="DeleteIcon" alt="" class="h-4xl w-4xl shrink-0 text-black-400" />
          Delete
        </button>
      </div>
    </Teleport>

    <CreateSegmentModal v-model="isCreateSegmentModalOpen" :contacts="contactsList" />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import ContactAdience from '../../assets/images/ContactAdience.svg'
import DownArrow from '../../assets/images/DownArrow.svg'
import ThreeDotsIcon from '../../assets/images/ThreeDotsIcon.svg'
import EditIcon from '../../assets/images/EditIcon.svg'
import SendEmail from '../../assets/images/SendEmail.svg'
import ExportIcon from '../../assets/images/ExportIcon.svg'
import DeleteIcon from '../../assets/images/DeleteIcon.svg'
import PlusIconWhite from '../../assets/images/PlusIconWhite.svg'
import CreateSegmentModal from './CreateSegmentModal.vue'

const SEED_SEGMENTS = [
  { id: 1, name: 'New Marigold Fans', created: 'Dec 10, 2025', lastRun: 'Dec 10, 2025', revenue: '--' },
  { id: 2, name: 'Summer Campaign Leads', created: 'Dec 09, 2025', lastRun: 'Dec 10, 2025', revenue: '$120' },
  { id: 3, name: 'Winter Sale Audience', created: 'Dec 08, 2025', lastRun: 'Dec 09, 2025', revenue: '$340' },
  { id: 4, name: 'New Marigold Fans', created: 'Dec 10, 2025', lastRun: 'Dec 10, 2025', revenue: '--' },
  { id: 5, name: 'Festival Buyers', created: 'Dec 07, 2025', lastRun: 'Dec 08, 2025', revenue: '$560' },
  { id: 6, name: 'Email Subscribers', created: 'Dec 06, 2025', lastRun: 'Dec 07, 2025', revenue: '$220' },
  { id: 7, name: 'New Marigold Fans', created: 'Dec 10, 2025', lastRun: 'Dec 10, 2025', revenue: '--' },
  { id: 8, name: 'Returning Customers', created: 'Dec 05, 2025', lastRun: 'Dec 06, 2025', revenue: '$780' },
  { id: 9, name: 'Ad Campaign Leads', created: 'Dec 04, 2025', lastRun: 'Dec 05, 2025', revenue: '$150' },
  { id: 10, name: 'Website Visitors', created: 'Dec 03, 2025', lastRun: 'Dec 04, 2025', revenue: '--' },
  { id: 11, name: 'New Marigold Fans', created: 'Dec 10, 2025', lastRun: 'Dec 10, 2025', revenue: '--' },
  { id: 12, name: 'Social Media Leads', created: 'Dec 02, 2025', lastRun: 'Dec 03, 2025', revenue: '$410' },
  { id: 13, name: 'Black Friday Buyers', created: 'Dec 01, 2025', lastRun: 'Dec 02, 2025', revenue: '$950' },
  { id: 14, name: 'New Users Signup', created: 'Nov 30, 2025', lastRun: 'Dec 01, 2025', revenue: '$300' },
  { id: 15, name: 'New Marigold Fans', created: 'Dec 10, 2025', lastRun: 'Dec 10, 2025', revenue: '--' }
]

const props = defineProps({
  segments: {
    type: Array,
    default: undefined
  },
  /** Passed from Audience.vue for segment preview / filter matching */
  contacts: {
    type: Array,
    default: () => []
  }
})

const contactsList = computed(() => (Array.isArray(props.contacts) ? props.contacts : []))

/** Omit prop for demo seed data; pass `:segments="[]"` (or from API) for empty state */
const segmentRows = computed(() => {
  if (props.segments === undefined) return SEED_SEGMENTS
  return props.segments ?? []
})

const sortOptions = [
  { id: 'date', label: 'Date added' },
  { id: 'name', label: 'Name' },
  { id: 'created', label: 'Created' },
  { id: 'lastRun', label: 'Last run' }
]

const selectedSortId = ref('date')
const isSortDropdownOpen = ref(false)
const sortDropdownRoot = ref(null)

const sortButtonLabel = computed(() => {
  const opt = sortOptions.find((o) => o.id === selectedSortId.value)
  return opt ? `Sort by ${opt.label}` : 'Sort by'
})

function toggleSortDropdown() {
  isSortDropdownOpen.value = !isSortDropdownOpen.value
}

function selectSort(id) {
  selectedSortId.value = id
  isSortDropdownOpen.value = false
  currentPage.value = 1
}

const ROW_MENU_WIDTH = 220

const rowMenuOpenForId = ref(null)
const rowMenuTriggerEl = ref(null)
const rowMenuStyle = ref({})

function updateRowMenuPosition(triggerEl) {
  if (!triggerEl || typeof triggerEl.getBoundingClientRect !== 'function') return
  const r = triggerEl.getBoundingClientRect()
  const left = Math.max(8, r.right - ROW_MENU_WIDTH)
  const top = r.bottom + 6
  rowMenuStyle.value = {
    top: `${top}px`,
    left: `${left}px`,
    width: `${ROW_MENU_WIDTH}px`
  }
}

function toggleRowMenu(rowId, event) {
  if (rowMenuOpenForId.value === rowId) {
    rowMenuOpenForId.value = null
    rowMenuTriggerEl.value = null
    return
  }
  rowMenuOpenForId.value = rowId
  rowMenuTriggerEl.value = event.currentTarget
  updateRowMenuPosition(event.currentTarget)
}

function closeRowMenu() {
  rowMenuOpenForId.value = null
  rowMenuTriggerEl.value = null
}

const isCreateSegmentModalOpen = ref(false)

function openCreateSegmentModal() {
  closeRowMenu()
  isSortDropdownOpen.value = false
  isCreateSegmentModalOpen.value = true
}

function onRowMenuSelect(_action) {
  closeRowMenu()
}

function handleDocumentClick(event) {
  const t = event.target

  if (isSortDropdownOpen.value) {
    const sortEl = sortDropdownRoot.value
    if (sortEl && !sortEl.contains(t)) {
      isSortDropdownOpen.value = false
    }
  }

  if (rowMenuOpenForId.value !== null) {
    const panel = typeof document !== 'undefined' ? document.querySelector('[data-segment-actions-panel]') : null
    if (panel?.contains(t)) return
    if (t.closest?.('[data-segment-actions-trigger]')) return
    rowMenuOpenForId.value = null
  }
}

function handleRowMenuReposition() {
  const el = rowMenuTriggerEl.value
  if (rowMenuOpenForId.value !== null && el) updateRowMenuPosition(el)
}

onMounted(() => {
  document.addEventListener('click', handleDocumentClick, true)
  document.addEventListener('touchend', handleDocumentClick, true)
  window.addEventListener('resize', handleRowMenuReposition)
  window.addEventListener('scroll', handleRowMenuReposition, true)
})

onUnmounted(() => {
  document.removeEventListener('click', handleDocumentClick, true)
  document.removeEventListener('touchend', handleDocumentClick, true)
  window.removeEventListener('resize', handleRowMenuReposition)
  window.removeEventListener('scroll', handleRowMenuReposition, true)
})

const sortedSegments = computed(() => {
  const list = [...segmentRows.value]
  const id = selectedSortId.value
  if (id === 'name') {
    list.sort((a, b) => String(a.name).localeCompare(String(b.name)))
  } else if (id === 'created' || id === 'date') {
    list.sort((a, b) => String(b.created).localeCompare(String(a.created)))
  } else if (id === 'lastRun') {
    list.sort((a, b) => String(b.lastRun).localeCompare(String(a.lastRun)))
  }
  return list
})

const currentPage = ref(1)
const rowsPerPage = ref(7)

const totalPages = computed(() =>
  Math.max(1, Math.ceil(sortedSegments.value.length / rowsPerPage.value))
)

watch([sortedSegments, rowsPerPage], () => {
  if (currentPage.value > totalPages.value) {
    currentPage.value = totalPages.value
  }
})

watch(currentPage, () => {
  closeRowMenu()
})

const paginatedSegments = computed(() => {
  const start = (currentPage.value - 1) * rowsPerPage.value
  return sortedSegments.value.slice(start, start + rowsPerPage.value)
})

const paginationItems = computed(() => {
  const total = totalPages.value
  const cur = currentPage.value
  if (total <= 1) return [1]

  const candidates = [1, 2, 3, total - 2, total - 1, total, cur - 1, cur, cur + 1]
  const set = new Set(candidates.filter((n) => n >= 1 && n <= total))
  const sorted = [...set].sort((a, b) => a - b)
  const out = []
  let prev = 0
  for (const p of sorted) {
    if (prev && p - prev > 1) out.push('ellipsis')
    out.push(p)
    prev = p
  }
  return out
})
</script>
