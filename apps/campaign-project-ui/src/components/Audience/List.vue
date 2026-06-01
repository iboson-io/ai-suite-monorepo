<template>
  <div class="bg_secondary_color rounded-[12px] p-6xl primary_border_color">
    <!-- Table when lists exist -->
    <div v-if="listRows.length > 0">
      <div class="mb-6xl flex flex-wrap items-center gap-4xl">
        <h3 class="heading_h6_semibold primary_text_color">
          {{ filteredLists.length }} total {{ filteredLists.length === 1 ? 'List' : 'Lists' }}
        </h3>

        <div class="flex flex-wrap items-center gap-md">
          <div class="relative min-w-[200px]">
            <span class="pointer-events-none absolute left-3xl top-1/2 -translate-y-1/2 text-gray-400">
              <svg
                class="h-4 w-4"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M21 21l-5.2-5.2M10 18a8 8 0 100-16 8 8 0 000 16z"
                />
              </svg>
            </span>
            <input
              v-model="searchQuery"
              type="search"
              class="w-full min-w-[200px] rounded-lg bg_secondary_color py-md pl-10 pr-3xl label_2_medium primary_text_color regular_border_color outline-none transition-colors placeholder:text-gray-400 focus:border-[3px] focus:border-[#D9E2FC]"
              placeholder="Search list"
              autocomplete="off"
            />
          </div>

          <div ref="tagsDropdownRoot" class="relative min-w-[120px]">
            <button
              type="button"
              class="product-select relative flex w-full min-w-[120px] items-center gap-md rounded-lg bg_secondary_color py-md pl-3xl pr-10xl label_2_medium primary_text_color regular_border_color"
              :class="isTagsDropdownOpen ? 'border-[3px] border-[#D9E2FC]' : ''"
              @click="toggleTagsDropdown"
            >
              <span class="product-text truncate whitespace-nowrap">{{ tagsFilterLabel }}</span>
              <img
                :src="DownArrow"
                alt=""
                class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 md:right-4"
              />
            </button>
            <div
              v-if="isTagsDropdownOpen"
              class="absolute right-0 top-full z-50 mt-sm min-w-[190px] rounded-md bg_secondary_color shadow-lg primary_border_color"
              @click.stop
            >
              <label
                :class="[
                  'flex items-center gap-md px-xl py-3xl hover:bg-info-50',
                  { 'bg-info-50': selectedTagIds.length === 0 }
                ]"
              >
                <input
                  type="checkbox"
                  class="custom-checkbox h-5xl w-5xl cursor-pointer rounded"
                  :checked="selectedTagIds.length === 0"
                  @change="toggleAllTags"
                />
                <span class="label_2_medium primary_text_color">All tags</span>
              </label>
              <label
                v-for="tag in tagFilterOptions"
                :key="tag.id"
                :class="[
                  'flex items-center gap-md border-t px-xl py-3xl primary_border_color hover:bg-info-50',
                  { 'bg-info-50': selectedTagIds.includes(tag.id) }
                ]"
              >
                <input
                  v-model="selectedTagIds"
                  type="checkbox"
                  class="custom-checkbox h-5xl w-5xl cursor-pointer rounded"
                  :value="tag.id"
                />
                <span class="label_2_medium primary_text_color">{{ tag.name }}</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      <div class="overflow-x-auto rounded-lg border primary_border_color">
        <table class="w-full">
          <thead>
            <tr class="border-b primary_border_color bg-info-50">
              <th class="p-xl text-left">
                <input
                  ref="headerCheckboxRef"
                  type="checkbox"
                  :checked="allVisibleSelected"
                  class="custom-checkbox h-5xl w-5xl cursor-pointer rounded"
                  @change="onHeaderSelectAllChange"
                />
              </th>
              <th class="p-xl text-left label_3_semibold secondary_text_color">Name</th>
              <th class="p-xl text-left label_3_semibold secondary_text_color">Members</th>
              <th class="p-xl text-left label_3_semibold secondary_text_color">Created</th>
              <th class="p-xl text-right label_3_semibold secondary_text_color" aria-label="Actions"></th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="row in paginatedLists"
              :key="row.id"
              class="cursor-pointer border-b primary_border_color last:border-b-0 hover:bg-info-50"
              @click="onOpenList(row)"
            >
              <td class="p-xl" @click.stop>
                <input
                  v-model="selectedListIds"
                  :value="row.id"
                  type="checkbox"
                  class="custom-checkbox h-5xl w-5xl cursor-pointer rounded"
                />
              </td>
              <td class="p-xl label_2_medium primary_text_color">
                {{ row.name }}
              </td>
              <td class="p-xl label_2_medium secondary_text_color">
                {{ formatMemberCount(row.memberCount) }}
              </td>
              <td class="p-xl label_2_medium secondary_text_color">
                {{ formatCreatedAt(row.createdAt) }}
              </td>
              <td class="p-xl text-right" @click.stop>
                <div class="relative inline-block text-left">
                  <button
                    type="button"
                    data-list-actions-trigger
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

      <div
        v-if="filteredLists.length > rowsPerPage"
        class="mt-6xl flex flex-wrap items-center justify-between gap-4"
      >
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
              <svg
                class="h-4 w-4 shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M15 19l-7-7 7-7"
                />
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
                class="flex min-w-[2.25rem] select-none items-center justify-center px-2 py-2.5 tracking-widest text-gray-500"
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
              <svg
                class="h-4 w-4 shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
        </nav>
      </div>
    </div>

    <!-- Empty state -->
    <div
      v-else
      class="flex min-h-[min(520px,60vh)] flex-col items-center justify-center px-md py-16 text-center"
    >
      <img
        :src="ListEmptyIllustration"
        alt=""
        class="mb-6xl w-[min(100%,280px)] max-w-[280px]"
      />
      <h3 class="heading_h6_semibold primary_text_color mb-md">Create your first list</h3>
      <p class="max-w-md label_1_regular secondary_text_color">
        Lists help organize contacts for campaigns, automations, and segmentation.
      </p>
    </div>

    <CreateListModal
      v-model="isCreateListModalOpen"
      :available-tags="tagFilterOptions"
      @create="onCreateListFromModal"
    />

    <ListDeleteModal
      v-model="isDeleteModalOpen"
      :count="deleteModalContactCount"
      :loading="isDeleteLoading"
      @confirm="onDeleteConfirm"
      @cancel="onDeleteModalCancel"
    />

    <Teleport to="body">
      <div
        v-if="rowMenuOpenForId !== null"
        data-list-actions-panel
        class="fixed z-[100] overflow-hidden rounded-lg border bg_secondary_color py-xs shadow-lg primary_border_color"
        :style="rowMenuStyle"
        role="menu"
        @click.stop
      >
        <template v-for="item in rowMenuItems" :key="item.id">
          <div
            v-if="item.dividerBefore"
            class="mx-xl my-xs h-px bg-info-50"
            role="separator"
          />
          <button
            type="button"
            role="menuitem"
            class="flex w-full whitespace-nowrap px-3xl py-xl text-left body_2_medium primary_text_color transition-colors hover:bg_primary_color"
            @click="onRowMenuSelect(item.id)"
          >
            {{ item.label }}
          </button>
        </template>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import ListEmptyIllustration from '../../assets/images/ContactAdience.svg'
import DownArrow from '../../assets/images/DownArrow.svg'
import ThreeDotsIcon from '../../assets/images/ThreeDotsIcon.svg'
import CreateListModal from './list/CreateListModal.vue'
import ListDeleteModal from './list/ListDeleteModal.vue'

const rowMenuItems = [
  { id: 'import-contacts', label: 'Import Contacts' },
  { id: 'edit-list-name', label: 'Edit List Name' },
  { id: 'list-settings', label: 'List settings' },
  { id: 'merge-list', label: 'Merge list' },
  { id: 'view-campaigns', label: 'View campaigns' },
  { id: 'suppress-members', label: 'Suppress current members' },
  { id: 'unsuppress-members', label: 'Unsuppress current members' },
  { id: 'delete-list', label: 'Delete List', dividerBefore: true }
]

const SEED_LISTS = [
  {
    id: 1,
    name: 'Email List',
    memberCount: 208,
    createdAt: '2026-04-23T18:12:00',
    tagIds: [1, 2]
  },
  {
    id: 2,
    name: 'Text Messaging',
    memberCount: 647,
    createdAt: '2026-04-23T18:12:00',
    tagIds: [2]
  }
]

const tagFilterOptions = [
  { id: 1, name: 'Member' },
  { id: 2, name: 'Newsletter' },
  { id: 3, name: 'VIP' }
]

const props = defineProps({
  /** Omit for demo seed data; pass `:lists="[]"` to show the empty state */
  lists: {
    type: Array,
    default: undefined
  }
})

const emit = defineEmits(['createList', 'rowAction', 'openList', 'deleteList'])

function onOpenList(row) {
  emit('openList', {
    id: row.id,
    name: row.name,
    memberCount: row.memberCount ?? 0,
    tagIds: row.tagIds ?? []
  })
}

const isCreateListModalOpen = ref(false)
const isDeleteModalOpen = ref(false)
const isDeleteLoading = ref(false)
const listPendingDelete = ref(null)
const searchQuery = ref('')
const selectedTagIds = ref([])
const isTagsDropdownOpen = ref(false)
const tagsDropdownRoot = ref(null)

const seedLists = ref(SEED_LISTS.map((row) => ({ ...row })))

const listRows = computed(() => {
  if (props.lists !== undefined) return props.lists ?? []
  return seedLists.value
})

const deleteModalContactCount = computed(() => {
  const count = Number(listPendingDelete.value?.memberCount)
  return Number.isFinite(count) ? count : 0
})

const tagsFilterLabel = computed(() => {
  if (selectedTagIds.value.length === 0) return 'Tags'
  if (selectedTagIds.value.length === 1) {
    const tag = tagFilterOptions.find((t) => t.id === selectedTagIds.value[0])
    return tag?.name ?? 'Tags'
  }
  return `${selectedTagIds.value.length} tags`
})

function toggleTagsDropdown() {
  isTagsDropdownOpen.value = !isTagsDropdownOpen.value
}

function toggleAllTags() {
  selectedTagIds.value = []
  currentPage.value = 1
}

const filteredLists = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  let rows = listRows.value.map((row) => ({ ...row }))

  if (q) {
    rows = rows.filter((row) => String(row.name).toLowerCase().includes(q))
  }

  if (selectedTagIds.value.length > 0) {
    const tagSet = new Set(selectedTagIds.value)
    rows = rows.filter((row) => {
      const ids = row.tagIds ?? []
      return ids.some((id) => tagSet.has(id))
    })
  }

  return rows
})

function formatMemberCount(count) {
  const n = Number(count)
  if (!Number.isFinite(n)) return '0'
  return n.toLocaleString('en-US')
}

function formatCreatedAt(value) {
  if (!value) return '—'
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })
}

const currentPage = ref(1)
const rowsPerPage = ref(25)
const selectedListIds = ref([])

const ROW_MENU_WIDTH = 248
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

function onRowMenuSelect(action) {
  const id = rowMenuOpenForId.value
  closeRowMenu()
  if (id == null) return

  if (action === 'delete-list') {
    const row = listRows.value.find((r) => r.id === id)
    if (row) {
      listPendingDelete.value = row
      isDeleteModalOpen.value = true
    }
    return
  }

  emit('rowAction', { action, id })
}

function onDeleteModalCancel() {
  isDeleteModalOpen.value = false
  listPendingDelete.value = null
}

function onDeleteConfirm() {
  const row = listPendingDelete.value
  if (!row) return

  isDeleteLoading.value = true

  if (props.lists !== undefined) {
    emit('deleteList', {
      id: row.id,
      name: row.name,
      memberCount: row.memberCount ?? 0
    })
  } else {
    seedLists.value = seedLists.value.filter((r) => r.id !== row.id)
    selectedListIds.value = selectedListIds.value.filter((listId) => listId !== row.id)
  }

  emit('rowAction', { action: 'delete-list', id: row.id })

  isDeleteLoading.value = false
  isDeleteModalOpen.value = false
  listPendingDelete.value = null
}

function openCreateModal() {
  closeRowMenu()
  isTagsDropdownOpen.value = false
  isCreateListModalOpen.value = true
}

function onCreateList() {
  openCreateModal()
}

function onCreateListFromModal(payload) {
  emit('createList', payload)
}

defineExpose({ openCreateModal })

const totalPages = computed(() =>
  Math.max(1, Math.ceil(filteredLists.value.length / rowsPerPage.value))
)

watch([filteredLists, rowsPerPage], () => {
  if (currentPage.value > totalPages.value) {
    currentPage.value = totalPages.value
  }
})

watch(currentPage, () => {
  closeRowMenu()
})

watch([searchQuery, selectedTagIds], () => {
  currentPage.value = 1
})

const paginatedLists = computed(() => {
  const start = (currentPage.value - 1) * rowsPerPage.value
  return filteredLists.value.slice(start, start + rowsPerPage.value)
})

const allVisibleSelected = computed(() => {
  const ids = paginatedLists.value.map((r) => r.id)
  if (ids.length === 0) return false
  return ids.every((id) => selectedListIds.value.includes(id))
})

const someVisibleSelected = computed(() => {
  const ids = paginatedLists.value.map((r) => r.id)
  return ids.some((id) => selectedListIds.value.includes(id)) && !allVisibleSelected.value
})

const headerCheckboxRef = ref(null)

function onHeaderSelectAllChange(e) {
  const checked = e.target.checked
  const ids = paginatedLists.value.map((r) => r.id)
  if (checked) {
    selectedListIds.value = [...new Set([...selectedListIds.value, ...ids])]
  } else {
    const idSet = new Set(ids)
    selectedListIds.value = selectedListIds.value.filter((id) => !idSet.has(id))
  }
}

watch(
  [someVisibleSelected, paginatedLists],
  () => {
    nextTick(() => {
      if (headerCheckboxRef.value) {
        headerCheckboxRef.value.indeterminate = someVisibleSelected.value
      }
    })
  },
  { flush: 'post' }
)

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

function handleDocumentClick(event) {
  const t = event.target

  if (isTagsDropdownOpen.value) {
    const tagsEl = tagsDropdownRoot.value
    if (tagsEl && !tagsEl.contains(t)) {
      isTagsDropdownOpen.value = false
    }
  }

  if (rowMenuOpenForId.value !== null) {
    const panel =
      typeof document !== 'undefined' ? document.querySelector('[data-list-actions-panel]') : null
    if (panel?.contains(t)) return
    if (t.closest?.('[data-list-actions-trigger]')) return
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
</script>
