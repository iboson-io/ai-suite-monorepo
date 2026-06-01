<template>
  <div>
    <!-- Toolbar -->
    <div class="mb-6xl flex flex-wrap items-center justify-between gap-md">
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
            placeholder="Search contacts"
            class="w-full min-w-[200px] rounded-lg bg_secondary_color py-md pl-10 pr-3xl label_2_medium primary_text_color regular_border_color outline-none transition-colors placeholder:text-gray-400 focus:border-[3px] focus:border-[#D9E2FC]"
            autocomplete="off"
          />
        </div>

        <button
          v-if="hasSelectedMembers"
          type="button"
          class="inline-flex items-center gap-2 rounded-lg bg_secondary_color px-4xl py-md label_2_medium primary_text_color regular_border_color outline-none transition-colors hover:bg-info-50 focus:border-[3px] focus:border-[#D9E2FC]"
          @click="openAddToListModal"
        >
          <img :src="ListIcon" alt="" class="h-5 w-5 shrink-0" aria-hidden="true" />
          Add to list
        </button>

        <div ref="subscriptionDropdownRoot" class="relative min-w-[180px]">
          <button
            type="button"
            class="product-select relative flex w-full min-w-[180px] items-center rounded-lg bg-info-50 py-xl pl-xl pr-11xl label_2_medium primary_text_color regular_border_color"
            :class="isSubscriptionOpen ? 'border-[3px] border-[#D9E2FC]' : ''"
            @click="toggleSubscriptionDropdown"
          >
            <span class="truncate">{{ getSubscriptionDisplayText() }}</span>
            <img
              :src="DownArrow"
              alt=""
              class="pointer-events-none absolute right-3 top-1/2 h-5xl w-5xl -translate-y-1/2 md:right-4"
            />
          </button>
          <div
            v-if="isSubscriptionOpen"
            class="absolute left-0 top-full z-20 mt-sm min-w-[200px] overflow-hidden rounded-md bg_secondary_color shadow-lg primary_border_color"
            @click.stop
          >
            <label
              :class="[
                'flex items-center gap-md px-xl py-3xl hover:bg-info-50',
                { 'bg-info-50': selectedSubscriptions.length === 0 }
              ]"
            >
              <input
                type="checkbox"
                class="custom-checkbox h-5xl w-5xl cursor-pointer rounded"
                :checked="selectedSubscriptions.length === 0"
                @change="toggleAllSubscriptions"
              />
              <span class="label_2_medium primary_text_color">All statuses</span>
            </label>
            <label
              v-for="status in SUBSCRIPTION_STATUSES"
              :key="status"
              :class="[
                'flex items-center gap-md border-t px-xl py-3xl primary_border_color hover:bg-info-50',
                { 'bg-info-50': selectedSubscriptions.includes(status) }
              ]"
            >
              <input
                v-model="selectedSubscriptions"
                type="checkbox"
                class="custom-checkbox h-5xl w-5xl cursor-pointer rounded"
                :value="status"
              />
              <span class="label_2_medium primary_text_color">{{ status }}</span>
            </label>
          </div>
        </div>

        <button
          v-if="hasSelectedMembers"
          type="button"
          class="inline-flex items-center gap-2 rounded-lg bg_secondary_color px-4xl py-md label_2_medium primary_text_color regular_border_color outline-none transition-colors hover:bg-info-50 focus:border-[3px] focus:border-[#D9E2FC]"
          @click="openDeleteModal"
        >
          <img :src="DeleteIconBlack" alt="" class="h-4xl w-4xl shrink-0" aria-hidden="true" />
          Delete
        </button>
      </div>

      <div ref="columnsToolbarRoot" class="relative">
        <button
          type="button"
          class="flex items-center gap-2 rounded-lg bg_secondary_color px-4 py-2 label_2_medium primary_text_color regular_border_color outline-none transition-colors hover:bg-info-50 focus:border-[3px] focus:border-[#D9E2FC]"
          :class="isColumnModalOpen ? 'border-[3px] border-[#D9E2FC]' : ''"
          :aria-expanded="isColumnModalOpen"
          aria-haspopup="dialog"
          @click="toggleColumnModal"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              d="M8.075 2.067C8.501 0.311 10.999 0.311 11.425 2.067C11.4889 2.3308 11.6142 2.57578 11.7907 2.782C11.9672 2.98822 12.1899 3.14985 12.4407 3.25375C12.6914 3.35764 12.9632 3.40085 13.2338 3.37987C13.5044 3.35889 13.7662 3.2743 13.998 3.133C15.541 2.193 17.308 3.959 16.368 5.503C16.2269 5.73466 16.1424 5.99634 16.1215 6.26677C16.1006 6.53721 16.1438 6.80877 16.2475 7.05938C16.3513 7.30999 16.5127 7.53258 16.7187 7.70905C16.9247 7.88553 17.1694 8.01091 17.433 8.075C19.189 8.501 19.189 10.999 17.433 11.425C17.1692 11.4889 16.9242 11.6142 16.718 11.7907C16.5118 11.9672 16.3501 12.1899 16.2463 12.4407C16.1424 12.6914 16.0991 12.9632 16.1201 13.2338C16.1411 13.5044 16.2257 13.7662 16.367 13.998C17.307 15.541 15.541 17.308 13.997 16.368C13.7653 16.2269 13.5037 16.1424 13.2332 16.1215C12.9628 16.1006 12.6912 16.1438 12.4406 16.2475C12.19 16.3513 11.9674 16.5127 11.7909 16.7187C11.6145 16.9247 11.4891 17.1694 11.425 17.433C10.999 19.189 8.501 19.189 8.075 17.433C8.01108 17.1692 7.88578 16.9242 7.70929 16.718C7.5328 16.5118 7.31011 16.3501 7.05935 16.2463C6.80859 16.1424 6.53683 16.0991 6.26621 16.1201C5.99559 16.1411 5.73375 16.2257 5.502 16.367C3.959 17.307 2.192 15.541 3.132 13.997C3.2731 13.7653 3.35755 13.5037 3.37848 13.2332C3.39942 12.9628 3.35624 12.6912 3.25247 12.4406C3.1487 12.19 2.98726 11.9674 2.78127 11.7909C2.57529 11.6145 2.33056 11.4891 2.067 11.425C0.311 10.999 0.311 8.501 2.067 8.075C2.3308 8.01108 2.57578 7.88578 2.782 7.70929C2.98822 7.5328 3.14985 7.31011 3.25375 7.05935C3.35764 6.80859 3.40085 6.53683 3.37987 6.26621C3.35889 5.99559 3.2743 5.73375 3.133 5.502C2.193 3.959 3.959 2.192 5.503 3.132C6.503 3.74 7.799 3.202 8.075 2.067Z"
              stroke="#28293D"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M6.75 9.75C6.75 10.5456 7.06607 11.3087 7.62868 11.8713C8.19129 12.4339 8.95435 12.75 9.75 12.75C10.5456 12.75 11.3087 12.4339 11.8713 11.8713C12.4339 11.3087 12.75 10.5456 12.75 9.75C12.75 8.95435 12.4339 8.19129 11.8713 7.62868C11.3087 7.06607 10.5456 6.75 9.75 6.75C8.95435 6.75 8.19129 7.06607 7.62868 7.62868C7.06607 8.19129 6.75 8.95435 6.75 9.75Z"
              stroke="#28293D"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          Columns
        </button>
        <ColumnModalPopup
          v-model="isColumnModalOpen"
          :columns="TABLE_COLUMN_OPTIONS"
          :visible-ids="appliedVisibleColumnIds"
          @apply="onColumnsApply"
        />
      </div>
    </div>

    <!-- Table -->
    <div class="overflow-x-auto rounded-lg border primary_border_color">
      <table class="w-full min-w-[900px]">
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
            <th
              v-for="col in visibleTableColumns"
              :key="col.id"
              class="p-xl text-left label_3_semibold secondary_text_color"
            >
              {{ col.label }}
            </th>
            <th class="p-xl text-right label_3_semibold secondary_text_color" aria-label="Actions"></th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="row in paginatedMembers"
            :key="row.id"
            class="border-b primary_border_color last:border-b-0 hover:bg-info-50"
          >
            <td class="p-xl" @click.stop>
              <input
                v-model="selectedMemberIds"
                :value="row.id"
                type="checkbox"
                class="custom-checkbox h-5xl w-5xl cursor-pointer rounded"
              />
            </td>
            <td
              v-for="col in visibleTableColumns"
              :key="col.id"
              class="p-xl"
              :class="col.id === 'email' ? 'label_2_medium primary_text_color' : 'label_2_medium secondary_text_color'"
            >
              <span
                v-if="col.id === 'status'"
                class="inline-flex rounded-md px-md py-xs label_3_medium"
                :class="statusBadgeClass(row.status)"
              >
                {{ row.status }}
              </span>
              <template v-else>{{ cellValue(row, col) }}</template>
            </td>
            <td class="p-xl text-right" @click.stop>
              <button
                type="button"
                class="inline-flex rounded-md p-1 hover:bg-info-100"
                aria-label="Row actions"
              >
                <img :src="ThreeDotsIcon" alt="" class="h-5 w-5" />
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div class="mt-6xl flex flex-wrap items-center justify-between gap-4">
      <div class="flex shrink-0 items-center gap-4">
        <span class="label_2_semibold secondary_text_color">Rows per page:</span>
        <select
          v-model.number="rowsPerPage"
          class="rounded-md border px-xl py-md primary_border_color"
          @change="currentPage = 1"
        >
          <option :value="7">7</option>
          <option :value="25">25</option>
          <option :value="50">50</option>
        </select>
      </div>
      <nav class="flex min-w-0 flex-1 justify-center" aria-label="Pagination">
        <div
          class="inline-flex max-w-full items-stretch divide-x divide-info-50 overflow-x-auto rounded-lg border bg_secondary_color label_1_semibold primary_border_color shadow-sm secondary_text_color [scrollbar-width:thin]"
        >
          <button
            type="button"
            class="flex items-center gap-2 px-4 py-2.5 transition-colors hover:bg-gray-50 disabled:pointer-events-none disabled:opacity-40"
            :disabled="currentPage === 1"
            @click="currentPage = Math.max(1, currentPage - 1)"
          >
            <svg class="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
            <span>Previous</span>
          </button>
          <template v-for="(item, idx) in paginationItems" :key="`p-${idx}-${String(item)}`">
            <button
              v-if="typeof item === 'number'"
              type="button"
              class="min-w-[2.5rem] px-3 py-2.5 transition-colors hover:bg-info-50"
              :class="item === currentPage ? 'bg-info-100 font-medium primary_text_color' : ''"
              @click="currentPage = item"
            >
              {{ item }}
            </button>
            <span
              v-else
              class="flex min-w-[2.25rem] select-none items-center justify-center px-2 py-2.5 tracking-widest text-gray-500"
            >
              ...
            </span>
          </template>
          <button
            type="button"
            class="flex items-center gap-2 px-4 py-2.5 transition-colors hover:bg-gray-50 disabled:pointer-events-none disabled:opacity-40"
            :disabled="currentPage === totalPages"
            @click="currentPage = Math.min(totalPages, currentPage + 1)"
          >
            <span>Next</span>
            <svg class="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </nav>
    </div>

    <ListDeleteModal
      v-model="isDeleteModalOpen"
      :count="selectedMemberIds.length"
      :loading="isDeleteLoading"
      @confirm="onDeleteConfirm"
      @cancel="isDeleteModalOpen = false"
    />

    <ListAddToListModal
      v-model="isAddToListModalOpen"
      :lists="availableListsForAdd"
      :exclude-list-name="currentListName"
      :loading="isAddToListLoading"
      @confirm="onAddToListConfirm"
      @cancel="isAddToListModalOpen = false"
    />

    <SuccessToastNotification
      :open="showAddToListSuccessToast"
      :main-message="addToListSuccessMessage"
      @close="showAddToListSuccessToast = false"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import DownArrow from '../../../assets/images/DownArrow.svg'
import ThreeDotsIcon from '../../../assets/images/ThreeDotsIcon.svg'
import DeleteIconBlack from '../../../assets/images/DeleteIconBlack.svg'
import ListIcon from '../../../assets/images/ListIcon.svg'
import ColumnModalPopup from '../ColumnModalPopup.vue'
import ListDeleteModal from './ListDeleteModal.vue'
import ListAddToListModal from './ListAddToListModal.vue'
import { SuccessToastNotification } from '@ai-suite/shared-ui'
import { SEED_LIST_MEMBERS } from './listMembersSeed.js'

const DEFAULT_LIST_OPTIONS_FOR_ADD = [
  { id: 1, name: 'Master List' },
  { id: 2, name: 'New Subscribers' },
  { id: 3, name: 'Email List' },
  { id: 4, name: 'Text Messaging' }
]

const TABLE_COLUMN_OPTIONS = [
  { id: 'email', label: 'Email Address', key: 'email' },
  { id: 'firstName', label: 'First Name', key: 'firstName' },
  { id: 'lastName', label: 'Last Name', key: 'lastName' },
  { id: 'status', label: 'Status', key: 'status' },
  { id: 'phoneNumber', label: 'Phone Number', key: 'phoneNumber' },
  { id: 'createdAt', label: 'Date', key: 'createdAt' }
]

const props = defineProps({
  /** List members from API. Omit to use demo seed data. */
  members: {
    type: Array,
    default: undefined
  },
  /** Name of the list being viewed (excluded from add-to-list picker). */
  currentListName: {
    type: String,
    default: ''
  },
  /** Lists for the add-to-list modal. Omit for demo options. */
  listsForAdd: {
    type: Array,
    default: undefined
  }
})

const emit = defineEmits(['delete-members', 'add-to-list'])

const SUBSCRIPTION_STATUSES = [
  'Subscribed',
  'Unsubscribed',
  'Non-subscribed',
  'Pending',
  'Cleaned'
]

const appliedVisibleColumnIds = ref(TABLE_COLUMN_OPTIONS.map((c) => c.id))
const visibleTableColumns = computed(() =>
  appliedVisibleColumnIds.value
    .map((id) => TABLE_COLUMN_OPTIONS.find((c) => c.id === id))
    .filter(Boolean)
)

const searchQuery = ref('')
const selectedSubscriptions = ref([])
const isSubscriptionOpen = ref(false)
const subscriptionDropdownRoot = ref(null)
const columnsToolbarRoot = ref(null)
const isColumnModalOpen = ref(false)
const isDeleteModalOpen = ref(false)
const isDeleteLoading = ref(false)
const isAddToListModalOpen = ref(false)
const isAddToListLoading = ref(false)
const showAddToListSuccessToast = ref(false)
const addToListSuccessMessage = ref('')

const availableListsForAdd = computed(() =>
  props.listsForAdd === undefined ? DEFAULT_LIST_OPTIONS_FOR_ADD : props.listsForAdd ?? []
)

const localMembers = ref([])

watch(
  () => props.members,
  (val) => {
    localMembers.value = [...(val === undefined ? SEED_LIST_MEMBERS : val ?? [])]
  },
  { immediate: true, deep: true }
)

const memberRows = computed(() => localMembers.value)
const selectedMemberIds = ref([])
const hasSelectedMembers = computed(() => selectedMemberIds.value.length > 0)
const currentPage = ref(1)
const rowsPerPage = ref(7)
const headerCheckboxRef = ref(null)

function getSubscriptionDisplayText() {
  if (selectedSubscriptions.value.length === 0) return 'Subscription status'
  if (selectedSubscriptions.value.length === 1) return selectedSubscriptions.value[0]
  return `${selectedSubscriptions.value.length} statuses`
}

function toggleAllSubscriptions() {
  if (selectedSubscriptions.value.length === 0) {
    selectedSubscriptions.value = [...SUBSCRIPTION_STATUSES]
  } else {
    selectedSubscriptions.value = []
  }
}

function formatCreatedAt(value) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

function toggleColumnModal() {
  isSubscriptionOpen.value = false
  isColumnModalOpen.value = !isColumnModalOpen.value
}

function onColumnsApply(ids) {
  appliedVisibleColumnIds.value = ids.length ? [...ids] : [...TABLE_COLUMN_OPTIONS.map((c) => c.id)]
}

function cellValue(row, col) {
  if (!col.key) return '—'
  if (col.key === 'createdAt') return formatCreatedAt(row.createdAt)
  const v = row[col.key]
  return v != null && String(v) !== '' ? v : '—'
}

const filteredMembers = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  let rows = memberRows.value
  if (q) {
    rows = rows.filter(
      (r) =>
        String(r.email ?? '').toLowerCase().includes(q) ||
        String(r.firstName ?? '').toLowerCase().includes(q) ||
        String(r.lastName ?? '').toLowerCase().includes(q) ||
        String(r.phoneNumber ?? '').includes(q)
    )
  }
  if (selectedSubscriptions.value.length > 0) {
    const statusSet = new Set(selectedSubscriptions.value)
    rows = rows.filter((r) => statusSet.has(r.status))
  }
  return rows
})

watch(memberRows, () => {
  currentPage.value = 1
  selectedMemberIds.value = []
})

const totalPages = computed(() =>
  Math.max(1, Math.ceil(filteredMembers.value.length / rowsPerPage.value))
)

const paginatedMembers = computed(() => {
  const start = (currentPage.value - 1) * rowsPerPage.value
  return filteredMembers.value.slice(start, start + rowsPerPage.value)
})

const allVisibleSelected = computed(() => {
  const ids = paginatedMembers.value.map((r) => r.id)
  if (!ids.length) return false
  return ids.every((id) => selectedMemberIds.value.includes(id))
})

const someVisibleSelected = computed(() => {
  const ids = paginatedMembers.value.map((r) => r.id)
  return ids.some((id) => selectedMemberIds.value.includes(id)) && !allVisibleSelected.value
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

function statusBadgeClass(status) {
  const map = {
    Subscribed: 'bg-success-50 text-success-700',
    Unsubscribed: 'bg-warning-50 text-warning-600',
    'Non-subscribed': 'bg-gray-50 text-gray-600',
    Pending: 'bg-blue-25 text-blue-600',
    Cleaned: 'bg-purple-50 text-purple-700'
  }
  return map[status] ?? 'bg-gray-50 text-gray-600'
}

function toggleSubscriptionDropdown() {
  const next = !isSubscriptionOpen.value
  isSubscriptionOpen.value = next
  if (next) isColumnModalOpen.value = false
}

function openAddToListModal() {
  if (!selectedMemberIds.value.length) return
  isAddToListModalOpen.value = true
}

function onAddToListConfirm(listIds) {
  const memberIds = [...selectedMemberIds.value]
  if (!memberIds.length || !listIds.length) return

  const listCount = listIds.length
  isAddToListLoading.value = true
  emit('add-to-list', { memberIds, listIds })
  isAddToListLoading.value = false
  isAddToListModalOpen.value = false
  selectedMemberIds.value = []

  addToListSuccessMessage.value = `Contacts added to ${listCount} lists successfully`
  nextTick(() => {
    showAddToListSuccessToast.value = true
    setTimeout(() => {
      showAddToListSuccessToast.value = false
    }, 3000)
  })
}

function openDeleteModal() {
  if (!selectedMemberIds.value.length) return
  isDeleteModalOpen.value = true
}

function onDeleteConfirm() {
  const ids = [...selectedMemberIds.value]
  if (!ids.length) return

  isDeleteLoading.value = true

  if (props.members !== undefined) {
    emit('delete-members', ids)
    isDeleteLoading.value = false
    isDeleteModalOpen.value = false
    selectedMemberIds.value = []
    return
  }

  const idSet = new Set(ids)
  localMembers.value = localMembers.value.filter((m) => !idSet.has(m.id))
  selectedMemberIds.value = []
  isDeleteLoading.value = false
  isDeleteModalOpen.value = false
}

function onHeaderSelectAllChange(e) {
  const checked = e.target.checked
  const ids = paginatedMembers.value.map((r) => r.id)
  if (checked) {
    selectedMemberIds.value = [...new Set([...selectedMemberIds.value, ...ids])]
  } else {
    const idSet = new Set(ids)
    selectedMemberIds.value = selectedMemberIds.value.filter((id) => !idSet.has(id))
  }
}

watch([searchQuery, selectedSubscriptions], () => {
  currentPage.value = 1
}, { deep: true })

watch(
  [someVisibleSelected, paginatedMembers],
  () => {
    nextTick(() => {
      if (headerCheckboxRef.value) {
        headerCheckboxRef.value.indeterminate = someVisibleSelected.value
      }
    })
  },
  { flush: 'post' }
)

function handleDocumentClick(event) {
  const target = event.target

  if (isColumnModalOpen.value && columnsToolbarRoot.value && !columnsToolbarRoot.value.contains(target)) {
    isColumnModalOpen.value = false
  }

  if (isSubscriptionOpen.value) {
    const el = subscriptionDropdownRoot.value
    if (el && !el.contains(target)) isSubscriptionOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleDocumentClick, true)
})

onUnmounted(() => {
  document.removeEventListener('click', handleDocumentClick, true)
})
</script>
