<template>
  <div class="bg_secondary_color rounded-[12px] p-6xl primary_border_color">
    <!-- Table View when contact data exists -->
    <div v-if="contacts && contacts.length > 0">
      <!-- Header with filters and search -->
      <div class="flex justify-between items-center mb-6xl">
        <div class="flex flex-wrap gap-md items-center">
          <button
            v-if="hasSelectedContacts"
            type="button"
            class="inline-flex items-center gap-2 rounded-lg bg_secondary_color px-4xl py-md label_2_medium primary_text_color regular_border_color outline-none transition-colors hover:bg-info-50 focus:border-[3px] focus:border-[#D9E2FC]"
            @click="openAddToListModal"
          >
            <img :src="ListIcon" alt="" class="h-5 w-5 shrink-0" aria-hidden="true" />
            Add to list
          </button>

          <button
            v-if="hasSelectedContacts"
            type="button"
            class="inline-flex items-center gap-2 rounded-lg bg_secondary_color px-4xl py-md label_2_medium primary_text_color regular_border_color outline-none transition-colors hover:bg-info-50 focus:border-[3px] focus:border-[#D9E2FC]"
            @click="openUpdateSubscriptionModal"
          >
            <img :src="PersonIcon" alt="" class="h-5 w-5 shrink-0" aria-hidden="true" />
            Change status
          </button>

          <button
            v-if="hasSelectedContacts"
            type="button"
            class="inline-flex items-center gap-2 rounded-lg bg_secondary_color px-4xl py-md label_2_medium primary_text_color regular_border_color outline-none transition-colors hover:bg-info-50 focus:border-[3px] focus:border-[#D9E2FC]"
            @click="onExportSelected"
          >
            <img :src="ExportIcon" alt="" class="h-5 w-5 shrink-0" aria-hidden="true" />
            Export contacts
          </button>

          <button
            v-if="hasSelectedContacts"
            type="button"
            class="inline-flex items-center gap-2 rounded-lg bg_secondary_color px-4xl py-md label_2_medium primary_text_color regular_border_color outline-none transition-colors hover:bg-info-50 focus:border-[3px] focus:border-[#D9E2FC]"
            @click="openDeleteModal"
          >
            <img :src="DeleteIconBlack" alt="" class="h-5 w-5 shrink-0" aria-hidden="true" />
            Delete
          </button>

          <div class="relative min-w-[200px]">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search by email, name, address, phone, or user ID"
              class="w-full min-w-[220px] rounded-lg bg_secondary_color py-2 pl-10 pr-3 label_2_medium regular_border_color outline-none transition-colors focus:border-[3px] focus:border-[#D9E2FC]"
            />
            <svg
              class="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </div>
          <!-- Subscription status -->
          <div
            v-if="!hasSelectedContacts"
            ref="subscriptionDropdownRoot"
            class="relative min-w-[155px] lg:min-w-[200px]"
          >
            <button
              type="button"
              class="flex w-full items-center gap-md rounded-lg regular_border_color bg_secondary_color py-md pl-3xl pr-10xl label_2_medium primary_text_color product-select relative"
              :class="isSubscriptionDropdownOpen ? 'border-[3px] border-[#D9E2FC]' : ''"
              @click="toggleSubscriptionDropdown"
            >
              <span class="product-text truncate whitespace-nowrap">{{ getSubscriptionDisplayText() }}</span>
              <img :src="DownArrow" alt="" class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 md:right-4" />
            </button>
            <div
              v-if="isSubscriptionDropdownOpen"
              class="absolute left-0 top-full z-50 mt-sm min-w-[155px] rounded-md bg_secondary_color shadow-lg primary_border_color lg:min-w-[200px]"
              @click.stop
            >
              <div class="">
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
                  v-for="item in subscriptionOptions"
                  :key="item.id"
                  :class="[
                    'flex items-center gap-md border-b px-xl py-3xl primary_border_color hover:bg-info-50',
                    { 'bg-info-50': selectedSubscriptions.includes(item.id) }
                  ]"
                >
                  <input
                    v-model="selectedSubscriptions"
                    type="checkbox"
                    class="custom-checkbox h-5xl w-5xl cursor-pointer rounded"
                    :value="item.id"
                  />
                  <span class="label_2_medium primary_text_color">{{ item.name }}</span>
                </label>
              </div>
            </div>
          </div>

          
        </div>
        <div v-if="!hasSelectedContacts" ref="columnsToolbarRoot" class="relative flex gap-md">
          <button
            type="button"
            class="flex items-center gap-2 rounded-lg bg_secondary_color px-4 py-2 label_2_medium primary_text_color regular_border_color outline-none transition-colors focus:border-[3px] focus:border-[#D9E2FC]"
            :class="isColumnModalOpen ? 'border-[3px] border-[#D9E2FC]' : ''"
            :aria-expanded="isColumnModalOpen"
            aria-haspopup="dialog"
            @click="toggleColumnModal"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
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
          <button
            type="button"
            class="inline-flex items-center gap-2 rounded-lg bg_secondary_color px-4 py-2 label_2_medium primary_text_color regular_border_color outline-none transition-colors hover:bg-info-50 focus:border-[3px] focus:border-[#D9E2FC]"
            @click="onExportAllContacts"
          >
            <img :src="ExportIcon" alt="" class="h-5 w-5 shrink-0" aria-hidden="true" />
            Export contacts
          </button>
          <ColumnModalPopup
            v-model="isColumnModalOpen"
            :columns="tableColumnOptions"
            :visible-ids="appliedVisibleColumnIds"
            @apply="onColumnsApply"
          />
        </div>
      </div>

      <!-- Selection summary -->
      <div v-if="hasSelectedContacts" class="mb-4xl">
        <p class="label_2_medium primary_text_color">
          <span class="label_2_semibold">{{ selectedContactIds.length }} selected.</span>
          <template v-if="!allFilteredSelected && filteredContacts.length > selectedContactIds.length">
            <button
              type="button"
              class="ml-sm underline label_2_medium primary_text_color transition-colors hover:text-info-600"
              @click="selectAllFilteredContacts"
            >
              Select all {{ filteredContacts.length }} contacts
            </button>
          </template>
        </p>
      </div>

      <!-- Contact count -->
      <div v-else class="mb-4xl">
        <p v-if="searchQuery.trim()" class="body_2_regular secondary_text_color">
          {{ filteredContacts.length }} of {{ contacts.length }} contacts match your search.
        </p>
        <p v-else class="heading_h6_bold primary_text_color">{{ contacts.length }} total contacts.</p>
      </div>

      <!-- Table -->
      <div class="overflow-x-auto">
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
              <th
                v-for="col in visibleTableColumns"
                :key="col.id"
                class="p-xl text-left label_3_semibold secondary_text_color"
              >
                {{ col.label }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(contact, rowIdx) in paginatedContacts"
              :key="contact.userId"
              class="border-b primary_border_color hover:bg-info-50"
            >
              <td class="p-xl" @click.stop>
                <input
                  v-model="selectedContactIds"
                  :value="getContactId(contact)"
                  type="checkbox"
                  class="custom-checkbox h-5xl w-5xl cursor-pointer rounded"
                />
              </td>
              <td
                v-for="col in visibleTableColumns"
                :key="col.id"
                class="p-xl label_2_medium secondary_text_color"
              >
                {{ cellValue(contact, col, rowIdx) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="flex flex-wrap items-center justify-between gap-4 mt-6xl">
        <div class="flex items-center gap-4 shrink-0">
          <span class="label_2_semibold secondary_text_color">Rows per page:</span>
          <select class="border primary_border_color rounded-lg px-3 py-1g" v-model="rowsPerPage" @change="currentPage = 1">
            <option value="7">7</option>
            <option value="25">25</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
        </div>
        <nav
          class="flex flex-1 justify-center min-w-0"
          aria-label="Pagination"
        >
          <div
            class="inline-flex max-w-full items-stretch overflow-x-auto rounded-lg border primary_border_color bg_secondary_color label_2_regular secondary_text_color shadow-sm divide-x divide-gray-200 [scrollbar-width:thin]"
          >
            <button
              type="button"
              class="flex items-center gap-2 px-4 py-2.5 hover:bg-gray-50 disabled:pointer-events-none disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
              :disabled="currentPage === 1"
              @click="currentPage = Math.max(1, currentPage - 1)"
            >
              <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
              <span class="label_2_semibold">Previous</span>
            </button>

            <template v-for="(item, idx) in paginationItems" :key="`p-${idx}-${String(item)}`">
              <button
                v-if="typeof item === 'number'"
                type="button"
                class="min-w-[2.5rem] px-md py-md transition-colors hover:bg-info-100 primary_border_color label_2_semibold"
                :class="item === currentPage ? 'bg-info-50 font-medium primary_text_color' : ''"
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
              class="flex items-center gap-2 px-4 py-2.5 hover:bg-gray-50 disabled:pointer-events-none disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
              :disabled="currentPage === totalPages"
              @click="currentPage = Math.min(totalPages, currentPage + 1)"
            >
              <span>Next</span>
              <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </nav>
      </div>
    </div>

    <!-- Empty State when no contact data -->
    <div v-else class="flex flex-col items-center justify-center text-center h-full py-16">
      <!-- Illustration -->
      <img
        :src="ContactAdience"
        alt="audience"
        class="w-[160px] mb-6xl"
      />
      <div class="lg:w-1/2">
        <!-- Title -->
        <h3 class="heading_h6_semibold primary_text_color mb-md">
          Add your audience
        </h3>

        <!-- Description -->
        <p class="label_1_regular secondary_text_color mb-6xl">
          Contacts are the people who make up your audience.
          Import them from a CSV file or other apps.
        </p>
      </div>
      <!-- Buttons -->
      <div class="flex items-center gap-4xl">
        <!-- Primary -->
        <button class="primary_add_button label_1_semibold px-6xl p-md">
          Upload CSV
        </button>

        <!-- Secondary -->
        <button class="secondary_button label_1_semibold px-6xl py-md rounded-md">
          Connect Platform
        </button>
      </div>
    </div>

    <ListDeleteModal
      v-model="isDeleteModalOpen"
      :count="selectedContactIds.length"
      :loading="isDeleteLoading"
      @confirm="onDeleteConfirm"
      @cancel="isDeleteModalOpen = false"
    />

    <ListAddToListModal
      v-model="isAddToListModalOpen"
      :loading="isAddToListLoading"
      @confirm="onAddToListConfirm"
      @cancel="isAddToListModalOpen = false"
    />

    <ContactUpdateSubscriptionModal
      v-model="isUpdateSubscriptionModalOpen"
      :selected-count="selectedContactIds.length"
      :subscribed-count="subscribedCountAmongSelected"
      :loading="isUpdateSubscriptionLoading"
      @confirm="onUpdateSubscriptionConfirm"
      @cancel="isUpdateSubscriptionModalOpen = false"
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
import ContactAdience from '../../assets/images/ContactAdience.svg'
import DownArrow from '../../assets/images/DownArrow.svg'
import ListIcon from '../../assets/images/ListIcon.svg'
import PersonIcon from '../../assets/images/PersonIcon.svg'
import ExportIcon from '../../assets/images/ExportIcon.svg'
import DeleteIconBlack from '../../assets/images/DeleteIconBlack.svg'
import ColumnModalPopup from './ColumnModalPopup.vue'
import ListDeleteModal from './list/ListDeleteModal.vue'
import ListAddToListModal from './list/ListAddToListModal.vue'
import ContactUpdateSubscriptionModal from './ContactUpdateSubscriptionModal.vue'
import { SuccessToastNotification } from '@ai-suite/shared-ui'

const props = defineProps({
  contacts: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['add-to-list', 'delete-contacts', 'export-contacts', 'change-status'])

const subscriptionOptions = [
  { id: 'sub_subscribed', name: 'Subscribed' },
  { id: 'sub_unsubscribed', name: 'Unsubscribed' },
  { id: 'sub_pending', name: 'Pending confirmation' }
]

const subscriptionDropdownRoot = ref(null)
const columnsToolbarRoot = ref(null)

const selectedContactIds = ref([])
const hasSelectedContacts = computed(() => selectedContactIds.value.length > 0)
const headerCheckboxRef = ref(null)

const isDeleteModalOpen = ref(false)
const isDeleteLoading = ref(false)
const isAddToListModalOpen = ref(false)
const isAddToListLoading = ref(false)
const isUpdateSubscriptionModalOpen = ref(false)
const isUpdateSubscriptionLoading = ref(false)
const showAddToListSuccessToast = ref(false)
const addToListSuccessMessage = ref('')

/** Column picker + table: `key` is property on contact row, or null for computed Index */
const TABLE_COLUMN_OPTIONS = [
  { id: 'email', label: 'Email Address', key: 'email' },
  { id: 'firstName', label: 'First Name', key: 'firstName' },
  { id: 'lastName', label: 'Last Name', key: 'lastName' },
  { id: 'address', label: 'Address', key: 'address' },
  { id: 'phoneNumber', label: 'Phone Number', key: 'phoneNumber' },
  { id: 'birthday', label: 'Birthday', key: 'birthday' },
  { id: 'company', label: 'Company', key: 'company' },
  { id: 'index', label: 'Index', key: null },
  { id: 'userId', label: 'User ID', key: 'userId' },
  { id: 'customerId', label: 'Customer Id', key: 'customerId' }
]

const tableColumnOptions = TABLE_COLUMN_OPTIONS
const appliedVisibleColumnIds = ref(TABLE_COLUMN_OPTIONS.map((c) => c.id))
const visibleTableColumns = computed(() =>
  appliedVisibleColumnIds.value
    .map((id) => TABLE_COLUMN_OPTIONS.find((c) => c.id === id))
    .filter(Boolean)
)

const isColumnModalOpen = ref(false)

function toggleColumnModal() {
  closeAudienceFilterDropdowns()
  isColumnModalOpen.value = !isColumnModalOpen.value
}

function onColumnsApply(ids) {
  appliedVisibleColumnIds.value = ids.length ? [...ids] : [...TABLE_COLUMN_OPTIONS.map((c) => c.id)]
}

function cellValue(contact, col, rowIdx) {
  if (col.id === 'index') {
    return (currentPage.value - 1) * rowsPerPage.value + rowIdx + 1
  }
  if (!col.key) return '—'
  const v = contact[col.key]
  return v != null && String(v) !== '' ? v : '—'
}

const isSubscriptionDropdownOpen = ref(false)
const selectedSubscriptions = ref([])

function getContactId(contact) {
  return contact.userId ?? contact.email
}

const subscribedCountAmongSelected = computed(() => {
  const idSet = new Set(selectedContactIds.value)
  return props.contacts.filter((c) => {
    if (!idSet.has(getContactId(c))) return false
    const status = c.status ?? 'Subscribed'
    return status === 'Subscribed'
  }).length
})

function toggleSubscriptionDropdown() {
  isSubscriptionDropdownOpen.value = !isSubscriptionDropdownOpen.value
}

function closeAudienceFilterDropdowns() {
  isSubscriptionDropdownOpen.value = false
}

function openUpdateSubscriptionModal() {
  if (!selectedContactIds.value.length) return
  isUpdateSubscriptionModalOpen.value = true
}

function onUpdateSubscriptionConfirm(payload) {
  isUpdateSubscriptionLoading.value = true
  emit('change-status', {
    contactIds: [...selectedContactIds.value],
    statusId: payload.statusId,
    status: payload.status
  })
  isUpdateSubscriptionLoading.value = false
  isUpdateSubscriptionModalOpen.value = false
}

function onExportSelected() {
  if (!selectedContactIds.value.length) return
  emit('export-contacts', [...selectedContactIds.value])
}

function onExportAllContacts() {
  const ids = filteredContacts.value.map((c) => getContactId(c))
  emit('export-contacts', ids)
}

function openAddToListModal() {
  if (!selectedContactIds.value.length) return
  isAddToListModalOpen.value = true
}

function onAddToListConfirm(listIds) {
  const contactIds = [...selectedContactIds.value]
  if (!contactIds.length || !listIds.length) return

  const listCount = listIds.length
  isAddToListLoading.value = true
  emit('add-to-list', { contactIds, listIds })
  isAddToListLoading.value = false
  isAddToListModalOpen.value = false
  selectedContactIds.value = []

  addToListSuccessMessage.value = `Contacts added to ${listCount} lists successfully`
  nextTick(() => {
    showAddToListSuccessToast.value = true
    setTimeout(() => {
      showAddToListSuccessToast.value = false
    }, 3000)
  })
}

function openDeleteModal() {
  if (!selectedContactIds.value.length) return
  isDeleteModalOpen.value = true
}

function onDeleteConfirm() {
  const ids = [...selectedContactIds.value]
  if (!ids.length) return

  isDeleteLoading.value = true
  emit('delete-contacts', ids)
  selectedContactIds.value = []
  isDeleteLoading.value = false
  isDeleteModalOpen.value = false
}

function onHeaderSelectAllChange(e) {
  const checked = e.target.checked
  const ids = paginatedContacts.value.map((c) => getContactId(c))
  if (checked) {
    selectedContactIds.value = [...new Set([...selectedContactIds.value, ...ids])]
  } else {
    const idSet = new Set(ids)
    selectedContactIds.value = selectedContactIds.value.filter((id) => !idSet.has(id))
  }
}

function selectAllFilteredContacts() {
  const ids = filteredContacts.value.map((c) => getContactId(c))
  selectedContactIds.value = [...new Set(ids)]
}

const allVisibleSelected = computed(() => {
  const ids = paginatedContacts.value.map((c) => getContactId(c))
  if (!ids.length) return false
  return ids.every((id) => selectedContactIds.value.includes(id))
})

const someVisibleSelected = computed(() => {
  const ids = paginatedContacts.value.map((c) => getContactId(c))
  return ids.some((id) => selectedContactIds.value.includes(id)) && !allVisibleSelected.value
})

const allFilteredSelected = computed(() => {
  const ids = filteredContacts.value.map((c) => getContactId(c))
  if (!ids.length) return false
  return ids.every((id) => selectedContactIds.value.includes(id))
})

function handleAudienceFiltersClickOutside(event) {
  const target = event.target

  if (
    isColumnModalOpen.value &&
    columnsToolbarRoot.value &&
    !columnsToolbarRoot.value.contains(target)
  ) {
    isColumnModalOpen.value = false
  }

  if (!isSubscriptionDropdownOpen.value) return
  const roots = [subscriptionDropdownRoot.value].filter(Boolean)
  const inside = roots.some((el) => el.contains(target))
  if (!inside) closeAudienceFilterDropdowns()
}

onMounted(() => {
  document.addEventListener('click', handleAudienceFiltersClickOutside, true)
  document.addEventListener('touchend', handleAudienceFiltersClickOutside, true)
})

onUnmounted(() => {
  document.removeEventListener('click', handleAudienceFiltersClickOutside, true)
  document.removeEventListener('touchend', handleAudienceFiltersClickOutside, true)
})

function toggleAllSubscriptions() {
  if (selectedSubscriptions.value.length === 0) {
    selectedSubscriptions.value = subscriptionOptions.map((s) => s.id)
  } else {
    selectedSubscriptions.value = []
  }
}

function getSubscriptionDisplayText() {
  if (selectedSubscriptions.value.length === 0) return 'Subscription status'
  if (selectedSubscriptions.value.length === 1) {
    const row = subscriptionOptions.find((s) => s.id === selectedSubscriptions.value[0])
    return row ? row.name : '1 status'
  }
  return `${selectedSubscriptions.value.length} statuses`
}

const searchQuery = ref('')
const currentPage = ref(1)
const rowsPerPage = ref(7)

function contactMatchesQuery(contact, rawQuery) {
  const q = rawQuery.trim().toLowerCase()
  if (!q) return true
  const fields = [
    contact.email,
    contact.firstName,
    contact.lastName,
    contact.address,
    contact.phoneNumber,
    contact.userId
  ]
  return fields.some((value) =>
    String(value ?? '')
      .toLowerCase()
      .includes(q)
  )
}

const filteredContacts = computed(() =>
  props.contacts.filter((c) => contactMatchesQuery(c, searchQuery.value))
)

watch(hasSelectedContacts, (selected) => {
  if (selected) {
    closeAudienceFilterDropdowns()
    isColumnModalOpen.value = false
  }
})

watch(searchQuery, () => {
  currentPage.value = 1
  selectedContactIds.value = []
})

watch(
  () => props.contacts,
  () => {
    selectedContactIds.value = []
  },
  { deep: true }
)

const totalPages = computed(() =>
  Math.max(1, Math.ceil(filteredContacts.value.length / rowsPerPage.value))
)

watch([filteredContacts, rowsPerPage], () => {
  if (currentPage.value > totalPages.value) {
    currentPage.value = totalPages.value
  }
})

const paginatedContacts = computed(() => {
  const start = (currentPage.value - 1) * rowsPerPage.value
  const end = start + rowsPerPage.value
  return filteredContacts.value.slice(start, end)
})

watch(
  [someVisibleSelected, paginatedContacts],
  () => {
    nextTick(() => {
      if (headerCheckboxRef.value) {
        headerCheckboxRef.value.indeterminate = someVisibleSelected.value
      }
    })
  },
  { flush: 'post' }
)

/** Page numbers and ellipsis segments for the segmented pagination bar */
const paginationItems = computed(() => {
  const total = totalPages.value
  const cur = currentPage.value
  if (total <= 1) return [1]

  const candidates = [
    1,
    2,
    3,
    total - 2,
    total - 1,
    total,
    cur - 1,
    cur,
    cur + 1
  ]
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
