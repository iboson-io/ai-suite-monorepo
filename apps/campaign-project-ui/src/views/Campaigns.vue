<template>
  <div
    class="flex min-h-0 flex-1 flex-col bg_primary_color"
    :class="activeCampaignBuilder ? 'p-0' : 'px-3xl py-12xl md:px-10xl lg:py-10xl'"
  >
    <template v-if="!activeCampaignBuilder">
    <div class="bg_secondary_color p-6xl rounded-lg primary_border_color">
      <h2 class="heading_h6_bold primary_text_color">Campaigns</h2>
      <p class="label_1_regular secondary_text_color mt-md">
        Choose a channel to create and send your next campaign.
      </p>
    </div>

    <!-- Table when campaigns exist -->
    <div v-if="campaignRows.length > 0" class="mb-6xl mt-8 w-full h-[86%]">
      <div class="bg_secondary_color rounded-lg p-6xl primary_border_color shadow-sm h-full">
        <!-- Toolbar: search, filters, clear, CTA -->
        <div
          class="mb-6xl flex flex-col gap-4xl xl:flex-row xl:flex-wrap xl:items-center xl:justify-between"
        >
          <div
            v-if="hasTableSelection"
            class="flex min-w-0 flex-1 flex-wrap items-center gap-4"
          >
            <span class="label_2_medium secondary_text_color">
              {{ selectedCampaignIds.length }} selected.
            </span>
            <button
              type="button"
              class="inline-flex items-center gap-lg rounded-lg border primary_border_color bg_secondary_color px-xl py-lg label_2_medium primary_text_color transition-colors hover:bg-info-50"
              @click="deselectAllCampaigns"
            >
              Deselect
              <img :src="CloseIcon" alt="" class="h-4 w-4 shrink-0" />
            </button>
            <button
              type="button"
              class="inline-flex items-center gap-lg rounded-lg border primary_border_color bg_secondary_color px-xl py-lg label_2_medium primary_text_color transition-colors hover:bg-info-50"
              @click="onBulkDeleteSelectedCampaigns"
            >
              Delete
              <img :src="DeleteIcon" alt="" class="h-4 w-4 shrink-0" />
            </button>
          </div>

          <div
            v-else
            class="flex min-w-0 flex-1 flex-col gap-4xl sm:flex-row sm:flex-wrap sm:items-center"
          >
            <div class="relative min-w-0 max-w-md flex-1">
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
                class="w-full rounded-lg border border-blue-100 bg_secondary_color py-md pl-10 pr-3xl label_2_medium primary_text_color outline-none transition-colors placeholder:text-gray-400 focus:border-[3px] focus:border-[#D9E2FC]"
                placeholder="Search Campaigns"
                autocomplete="off"
              />
            </div>

            <div ref="channelFilterRoot" class="relative min-w-[160px]">
              <button
                type="button"
                class="product-select relative flex w-full items-center gap-md rounded-lg bg_secondary_color py-md pl-3xl pr-10xl label_2_medium primary_text_color regular_border_color"
                :class="isChannelFilterOpen ? 'border-[3px] border-[#D9E2FC]' : ''"
                @click="toggleFilterDropdown('channel')"
              >
                <span class="product-text truncate whitespace-nowrap">{{ channelFilterLabel }}</span>
                <img
                  :src="DownArrow"
                  alt=""
                  class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 md:right-4"
                />
              </button>
              <div
                v-if="isChannelFilterOpen"
                class="absolute left-0 top-full z-50 mt-sm min-w-[200px] rounded-md bg_secondary_color shadow-lg primary_border_color"
                @click.stop
              >
                <button
                  v-for="opt in channelOptions"
                  :key="String(opt.id)"
                  type="button"
                  class="flex w-full px-xl py-3xl text-left label_2_medium hover:bg-info-50"
                  :class="selectedChannelId === opt.id ? 'bg-info-50 primary_text_color' : 'primary_text_color'"
                  @click="selectChannelFilter(opt.id)"
                >
                  {{ opt.label }}
                </button>
              </div>
            </div>

            <div ref="dateFilterRoot" class="relative min-w-[160px]">
              <button
                type="button"
                class="product-select relative flex w-full items-center gap-md rounded-lg bg_secondary_color py-md pl-3xl pr-10xl label_2_medium primary_text_color regular_border_color"
                :class="isDateFilterOpen ? 'border-[3px] border-[#D9E2FC]' : ''"
                @click="toggleFilterDropdown('date')"
              >
                <span class="product-text truncate whitespace-nowrap">{{ dateFilterLabel }}</span>
                <img
                  :src="DownArrow"
                  alt=""
                  class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 md:right-4"
                />
              </button>
              <div
                v-if="isDateFilterOpen"
                class="absolute left-0 top-full z-50 mt-sm min-w-[200px] rounded-md bg_secondary_color shadow-lg primary_border_color"
                @click.stop
              >
                <button
                  v-for="opt in monthFilterOptions"
                  :key="String(opt.id)"
                  type="button"
                  class="flex w-full px-xl py-3xl text-left label_2_medium hover:bg-info-50"
                  :class="selectedMonthId === opt.id ? 'bg-info-50 primary_text_color' : 'primary_text_color'"
                  @click="selectDateFilter(opt.id)"
                >
                  {{ opt.label }}
                </button>
              </div>
            </div>

            <div ref="statusFilterRoot" class="relative min-w-[160px]">
              <button
                type="button"
                class="product-select relative flex w-full items-center gap-md rounded-lg bg_secondary_color py-md pl-3xl pr-10xl label_2_medium primary_text_color regular_border_color"
                :class="isStatusFilterOpen ? 'border-[3px] border-[#D9E2FC]' : ''"
                @click="toggleFilterDropdown('status')"
              >
                <span class="product-text truncate whitespace-nowrap">{{ statusFilterLabel }}</span>
                <img
                  :src="DownArrow"
                  alt=""
                  class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 md:right-4"
                />
              </button>
              <div
                v-if="isStatusFilterOpen"
                class="absolute left-0 top-full z-50 mt-sm min-w-[200px] rounded-md bg_secondary_color shadow-lg primary_border_color"
                @click.stop
              >
                <button
                  v-for="opt in statusOptions"
                  :key="String(opt.id)"
                  type="button"
                  class="flex w-full px-xl py-3xl text-left label_2_medium hover:bg-info-50"
                  :class="selectedStatusId === opt.id ? 'bg-info-50 primary_text_color' : 'primary_text_color'"
                  @click="selectStatusFilter(opt.id)"
                >
                  {{ opt.label }}
                </button>
              </div>
            </div>

            <button
              type="button"
              class="shrink-0 label_2_semibold text-black-400 underline-offset-2 hover:underline"
              @click="clearAllFilters"
            >
              Clear
            </button>
          </div>

          <button
            type="button"
            class="inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-lg px-4xl py-lg primary_add_button label_1_semibold sm:w-auto"
            @click="onCreateCampaign"
          >
            <img :src="PlusIconWhite" alt="" class="h-4 w-4" />
            Create a Campaign
          </button>
        </div>

        <div v-if="filteredCampaigns.length > 0" class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="border-b primary_border_color bg-info-50">
                <th class="p-xl text-left">
                  <input
                    ref="headerCampaignCheckboxRef"
                    type="checkbox"
                    :checked="allVisibleCampaignsSelected"
                    class="custom-checkbox h-5xl w-5xl cursor-pointer rounded"
                    @change="onHeaderCampaignSelectAllChange"
                  />
                </th>
                <th class="p-xl text-left label_3_semibold secondary_text_color">Campaign</th>
                <th class="p-xl text-left label_3_semibold secondary_text_color">Channel</th>
                <th class="p-xl text-left label_3_semibold secondary_text_color">Send date</th>
                <th class="p-xl text-left label_3_semibold secondary_text_color">Performance</th>
                <th class="p-xl text-left label_3_semibold secondary_text_color">Status</th>
                <th class="p-xl text-right label_3_semibold secondary_text_color" aria-label="Actions"></th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="row in paginatedCampaigns"
                :key="row.id"
                class="border-b primary_border_color hover:bg-info-50"
              >
                <td class="p-xl">
                  <input
                    v-model="selectedCampaignIds"
                    :value="row.id"
                    type="checkbox"
                    class="custom-checkbox h-5xl w-5xl cursor-pointer rounded"
                  />
                </td>
                <td class="p-xl">
                  <div class="max-w-[14rem]">
                    <p class="label_2_semibold primary_text_color">{{ row.campaign }}</p>
                    <p class="mt-xxs body_3_regular secondary_text_color">Last edited {{ row.lastEdited }}</p>
                  </div>
                </td>
                <td class="p-xl">
                  <span
                    class="inline-flex max-w-full items-center gap-sm rounded-lg px-md py-sm label_2_medium bg-info-50"

                  >
                    <img :src="channelIconFor(row)" alt="" class="h-4 w-4 shrink-0 object-contain" />
                    {{ row.channel.name }}
                  </span>
                </td>
                <td class="p-xl label_2_medium secondary_text_color whitespace-nowrap">
                  {{ row.sendDate }}
                </td>
                <td class="p-xl label_2_medium secondary_text_color">
                  {{ row.performance }}
                </td>
                <td class="p-xl">
                  <span
                    class="inline-flex rounded-lg px-md py-sm label_3_semibold"
                    :class="statusPillClass(row.status)"
                  >
                    {{ row.status }}
                  </span>
                </td>
                <td class="p-xl text-right">
                  <button
                    type="button"
                    data-campaign-actions-trigger
                    class="inline-flex rounded-md p-1 hover:bg-info-100"
                    :class="rowMenuOpenForId === row.id ? 'bg-info-100' : ''"
                    aria-label="Row actions"
                    @click.stop="toggleRowMenu(row.id, $event)"
                  >
                    <img :src="ThreeDotsIcon" alt="" class="h-5 w-5" />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div
          v-else
          class="flex min-h-[420px] flex-col items-center justify-center px-md py-16 text-center"
        >
          <img
            :src="NoSearchResult"
            alt=""
            class="mb-6xl w-[200px] max-w-full"
          />
          <h3 class="heading_h6_semibold primary_text_color mb-md max-w-md">
            No results for your search
          </h3>
          <p class="label_1_regular secondary_text_color mb-6xl max-w-md">
            Please make sure your search term is more general or try another keyword
          </p>
          <button
            type="button"
            class="primary_add_button label_1_semibold px-6xl py-md"
            @click="onClearSearch"
          >
            Clear search
          </button>
        </div>

        <div v-if="filteredCampaigns.length > 0" class="mt-6xl flex flex-wrap items-center justify-between gap-4">
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
    </div>

    <!-- Empty state: channel cards -->
    <div v-else class="mb-6xl mt-8 w-full h-[86%]">
      <div
        class="mb-6xl w-full bg_secondary_color p-6xl h-full rounded-lg primary_border_color"
      >
        <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div
            v-for="card in campaignCards"
            :key="card.title"
            class="flex flex-col bg_secondary_color p-6xl primary_border_color rounded-xl shadow-sm transition-colors"
            :class="
              card.id === 'regular-email' || card.id === 'sms'
                ? 'cursor-pointer hover:border-info-100'
                : ''
            "
            @click="onCampaignCardClick(card)"
          >
            <img :src="card.icon" alt="" class="h-10xl w-10xl shrink-0 object-contain" />
            <h3 class="label_1_semibold primary_text_color mt-5xl">
              {{ card.title }}
            </h3>
            <p class="mt-md body_3_regular leading-relaxed secondary_text_color">
              {{ card.description }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <Teleport to="body">
      <div
        v-if="rowMenuOpenForId !== null"
        data-campaign-actions-panel
        class="fixed z-[100] overflow-hidden rounded-lg border bg_secondary_color py-xs shadow-lg primary_border_color"
        :style="rowMenuStyle"
        role="menu"
        @click.stop
      >
        <button
          type="button"
          role="menuitem"
          class="flex w-full items-center gap-md px-xl py-3xl text-left label_2_medium primary_text_color transition-colors hover:bg-info-50"
          @click="onRowMenuAction('view')"
        >
          <img :src="GrayEyeIcon" alt="" class="h-4xl w-4xl shrink-0" />
          View
        </button>
        <button
          v-if="showRowMenuReplicate"
          type="button"
          role="menuitem"
          class="flex w-full items-center gap-md px-xl py-3xl text-left label_2_medium primary_text_color transition-colors hover:bg-info-50"
          @click="onRowMenuAction('replicate')"
        >
          <img :src="ExportIcon" alt="" class="h-4xl w-4xl shrink-0" />
          Replicate
        </button>
        <button
          v-if="showRowMenuEdit"
          type="button"
          role="menuitem"
          class="flex w-full items-center gap-md px-xl py-3xl text-left label_2_medium primary_text_color transition-colors hover:bg-info-50"
          @click="onRowMenuAction('edit')"
        >
          <img :src="EditIcon" alt="" class="h-4xl w-4xl shrink-0" />
          Edit
        </button>
        <button
          v-if="isRowMenuCancelledStatus"
          type="button"
          role="menuitem"
          class="flex w-full items-center gap-md px-xl py-3xl text-left label_2_medium primary_text_color transition-colors hover:bg-info-50"
          @click="onRowMenuAction('rename')"
        >
          <img :src="RenameIcon" alt="" class="h-4xl w-4xl shrink-0" />
          Rename
        </button>
        <div class="my-xs border-t primary_border_color" role="separator" />
        <button
          type="button"
          role="menuitem"
          class="flex w-full items-center gap-md px-xl py-3xl text-left label_2_medium primary_text_color transition-colors hover:bg-info-50"
          @click="onRowMenuAction('delete')"
        >
          <img :src="DeleteIcon" alt="" class="h-4xl w-4xl shrink-0" />
          Delete
        </button>
      </div>
    </Teleport>

    </template>
    <EmailCampaign
      v-else-if="activeCampaignBuilder === 'email'"
      @close="activeCampaignBuilder = null"
    />
    <Sms v-else-if="activeCampaignBuilder === 'sms'" @close="activeCampaignBuilder = null" />

    <DeletePostModal
      :open="showDeleteCampaignModal"
      title="Delete campaign?"
      message="Are you sure you want to delete this campaign?"
      warning-message="Note: This action cannot be undone, and the campaign will be permanently removed."
      @close="onDeleteCampaignModalClose"
      @confirm="onConfirmDeleteCampaign"
    />

    <CreateCampaignModel v-model="isCreateCampaignModalOpen" @create="onCreateCampaignFromModal" />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import GoogleAdsIcon from '../assets/images/GoogleAdsIcon.svg'
import RegularEmailIcon from '../assets/images/RegularEmailIcon.svg'
import SmsIcon from '../assets/images/SmsIcon.svg'
import DownArrow from '../assets/images/DownArrow.svg'
import ThreeDotsIcon from '../assets/images/ThreeDotsIcon.svg'
import GrayEyeIcon from '../assets/images/GrayEyeIcon.svg'
import PlusIconWhite from '../assets/images/PlusIconWhite.svg'
import EmailIcon from '../assets/images/emailIcon.svg'
import SmsLogo from '../assets/images/SmsLogo.svg'
import MetaLeadAdsIcon from '../assets/images/MetaLeadAdsIcon.svg'
import GoogleLeadAdsIcon from '../assets/images/GoogleLeadAdsIcon.svg'
import ExportIcon from '../assets/images/ExportIcon.svg'
import DeleteIcon from '../assets/images/DeleteIcon.svg'
import RenameIcon from '../assets/images/RenameIcon.svg'
import { DeletePostModal } from '@ai-suite/shared-ui'
import CreateCampaignModel from '../components/campaign/CreateCampaignModel.vue'
import EmailCampaign from '../components/campaign/EmailCampaign.vue'
import Sms from '../components/campaign/sms/Sms.vue'
import EditIcon from '../assets/images/EditIcon.svg'
import NoSearchResult from '../assets/images/NoSearchResult.png'
import CloseIcon from '../assets/images/CloseIcon.svg'


const SEED_CAMPAIGNS = []

const props = defineProps({
  /** Pass `[]` to show the empty channel cards. Omit to use seed data. */
  campaigns: {
    type: Array,
    default: undefined
  }
})

const removedCampaignIds = ref(new Set())
/** @type {import('vue').Ref<null | 'email' | 'sms'>} */
const activeCampaignBuilder = ref(null)

const campaignRows = computed(() => {
  const base = props.campaigns === undefined ? SEED_CAMPAIGNS : (props.campaigns ?? [])
  if (removedCampaignIds.value.size === 0) return base
  return base.filter((r) => !removedCampaignIds.value.has(r.id))
})

const campaignCards = [
  {
    id: 'regular-email',
    title: 'Regular email',
    description: 'Create and send your campaign quickly using our email builder.',
    icon: RegularEmailIcon
  },
  {
    id: 'sms',
    title: 'SMS',
    description: 'AI suggests days, times, and post ideas for your brand.',
    icon: SmsIcon
  },
  {
    title: 'Meta Lead Ads',
    description: 'Connect and manage Facebook leads with Genius AI.',
    icon: SmsIcon
  },
  {
    title: 'Google Lead Ads',
    description: 'Connect Google leads to Genius AI.',
    icon: GoogleAdsIcon
  }
]

const searchQuery = ref('')

const channelOptions = [
  { id: 'all', label: 'All' },
  { id: 'Email', label: 'Email' },
  { id: 'SMS', label: 'SMS' },
  { id: 'Google Ad', label: 'Google Ad' },
  { id: 'Meta Ad', label: 'Meta Ad' }
]
const selectedChannelId = ref('all')

const statusOptions = [
  { id: 'all', label: 'All' },
  { id: 'Sent', label: 'Sent' },
  { id: 'Scheduled', label: 'Scheduled' },
  { id: 'Cancelled', label: 'Cancelled' }
]
const selectedStatusId = ref('all')

const selectedMonthId = ref('all')

const monthFilterOptions = computed(() => {
  const months = new Set()
  for (const row of campaignRows.value) {
    const m = String(row.sendDate).match(/^([A-Za-z]+)/)
    if (m) months.add(m[1])
  }
  const sorted = [...months].sort()
  return [{ id: 'all', label: 'All' }, ...sorted.map((m) => ({ id: m, label: m }))]
})

const channelFilterLabel = computed(() => {
  const o = channelOptions.find((x) => x.id === selectedChannelId.value)
  return `Channel: ${o ? o.label : 'All'}`
})
const dateFilterLabel = computed(() => {
  const o = monthFilterOptions.value.find((x) => x.id === selectedMonthId.value)
  return `Date: ${o ? o.label : 'All'}`
})
const statusFilterLabel = computed(() => {
  const o = statusOptions.find((x) => x.id === selectedStatusId.value)
  return `Status: ${o ? o.label : 'All'}`
})

const openFilter = ref(null)
const isChannelFilterOpen = computed(() => openFilter.value === 'channel')
const isDateFilterOpen = computed(() => openFilter.value === 'date')
const isStatusFilterOpen = computed(() => openFilter.value === 'status')

function toggleFilterDropdown(which) {
  openFilter.value = openFilter.value === which ? null : which
}

function selectChannelFilter(id) {
  selectedChannelId.value = id
  openFilter.value = null
  currentPage.value = 1
}
function selectDateFilter(id) {
  selectedMonthId.value = id
  openFilter.value = null
  currentPage.value = 1
}
function selectStatusFilter(id) {
  selectedStatusId.value = id
  openFilter.value = null
  currentPage.value = 1
}

const channelFilterRoot = ref(null)
const dateFilterRoot = ref(null)
const statusFilterRoot = ref(null)

function clearAllFilters() {
  searchQuery.value = ''
  selectedChannelId.value = 'all'
  selectedMonthId.value = 'all'
  selectedStatusId.value = 'all'
  currentPage.value = 1
}

function onClearSearch() {
  searchQuery.value = ''
  currentPage.value = 1
}

const CHANNEL_ICON_MAP = {
  Email: EmailIcon,
  SMS: SmsLogo,
  'Google Ad': GoogleLeadAdsIcon,
  'Meta Ad': MetaLeadAdsIcon
}

function channelIconFor(row) {
  return CHANNEL_ICON_MAP[row.channel.name] || RegularEmailIcon
}

function statusPillClass(status) {
  if (status === 'Sent') return 'bg-success-50 text-success-600 border border-success-200'
  if (status === 'Scheduled') return 'bg-blue-25 text-blue-600 border border-blue-100'
  if (status === 'Cancelled') return 'bg-error-50 text-error-600 border border-error-200'
  return 'bg-gray-25 secondary_text_color'
}

const filteredCampaigns = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  return campaignRows.value.filter((row) => {
    if (q) {
      const blob = `${row.campaign} ${row.lastEdited} ${row.performance}`.toLowerCase()
      if (!blob.includes(q)) return false
    }
    if (selectedChannelId.value !== 'all' && row.channel.name !== selectedChannelId.value) {
      return false
    }
    if (selectedStatusId.value !== 'all' && row.status !== selectedStatusId.value) {
      return false
    }
    if (selectedMonthId.value !== 'all') {
      if (!String(row.sendDate).startsWith(selectedMonthId.value)) return false
    }
    return true
  })
})

const selectedCampaignIds = ref([])

watch(filteredCampaigns, (list) => {
  const ids = new Set(list.map((r) => r.id))
  selectedCampaignIds.value = selectedCampaignIds.value.filter((id) => ids.has(id))
})

const currentPage = ref(1)
const rowsPerPage = ref(7)

const totalPages = computed(() =>
  Math.max(1, Math.ceil(filteredCampaigns.value.length / rowsPerPage.value))
)

watch([filteredCampaigns, rowsPerPage], () => {
  if (currentPage.value > totalPages.value) {
    currentPage.value = totalPages.value
  }
})

watch(
  [searchQuery, selectedChannelId, selectedMonthId, selectedStatusId],
  () => {
    currentPage.value = 1
  }
)

watch(currentPage, () => {
  closeRowMenu()
})

const paginatedCampaigns = computed(() => {
  const start = (currentPage.value - 1) * rowsPerPage.value
  return filteredCampaigns.value.slice(start, start + rowsPerPage.value)
})

const hasTableSelection = computed(() => selectedCampaignIds.value.length > 0)

const allVisibleCampaignsSelected = computed(() => {
  const ids = paginatedCampaigns.value.map((r) => r.id)
  if (ids.length === 0) return false
  return ids.every((id) => selectedCampaignIds.value.includes(id))
})

const someVisibleCampaignsSelected = computed(() => {
  const ids = paginatedCampaigns.value.map((r) => r.id)
  return (
    ids.some((id) => selectedCampaignIds.value.includes(id)) && !allVisibleCampaignsSelected.value
  )
})

const headerCampaignCheckboxRef = ref(null)

function onHeaderCampaignSelectAllChange(e) {
  const checked = e.target.checked
  const ids = paginatedCampaigns.value.map((r) => r.id)
  if (checked) {
    selectedCampaignIds.value = [...new Set([...selectedCampaignIds.value, ...ids])]
  } else {
    const idSet = new Set(ids)
    selectedCampaignIds.value = selectedCampaignIds.value.filter((id) => !idSet.has(id))
  }
}

function deselectAllCampaigns() {
  selectedCampaignIds.value = []
}

function onBulkDeleteSelectedCampaigns() {
  if (selectedCampaignIds.value.length === 0) return
  closeRowMenu()
  pendingDeleteIds.value = [...selectedCampaignIds.value]
  showDeleteCampaignModal.value = true
}

watch(
  [someVisibleCampaignsSelected, paginatedCampaigns],
  () => {
    nextTick(() => {
      if (headerCampaignCheckboxRef.value) {
        headerCampaignCheckboxRef.value.indeterminate = someVisibleCampaignsSelected.value
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

const ROW_MENU_WIDTH = 200
const rowMenuOpenForId = ref(null)
const rowMenuTriggerEl = ref(null)
const rowMenuStyle = ref({})

const isRowMenuCancelledStatus = computed(() => {
  const id = rowMenuOpenForId.value
  if (id == null) return false
  const row = filteredCampaigns.value.find((r) => r.id === id)
  return row?.status === 'Cancelled'
})

const rowMenuTargetRow = computed(() => {
  const id = rowMenuOpenForId.value
  if (id == null) return null
  return filteredCampaigns.value.find((r) => r.id === id) ?? null
})

const showRowMenuReplicate = computed(() => {
  const row = rowMenuTargetRow.value
  if (!row) return false
  return row.status !== 'Cancelled' && row.status !== 'Scheduled'
})

const showRowMenuEdit = computed(() => {
  const row = rowMenuTargetRow.value
  if (!row) return false
  return row.status === 'Cancelled' || row.status === 'Scheduled'
})

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

const showDeleteCampaignModal = ref(false)
const pendingDeleteIds = ref(null)
const isCreateCampaignModalOpen = ref(false)

function onRowMenuAction(action) {
  if (action === 'delete') {
    const id = rowMenuOpenForId.value
    closeRowMenu()
    if (id != null) {
      pendingDeleteIds.value = [id]
      showDeleteCampaignModal.value = true
    }
    return
  }
  closeRowMenu()
}

function onDeleteCampaignModalClose() {
  showDeleteCampaignModal.value = false
  pendingDeleteIds.value = null
}

function onConfirmDeleteCampaign() {
  const ids = pendingDeleteIds.value
  if (ids && ids.length > 0) {
    const next = new Set(removedCampaignIds.value)
    for (const id of ids) {
      next.add(id)
    }
    removedCampaignIds.value = next
    selectedCampaignIds.value = selectedCampaignIds.value.filter((id) => !ids.includes(id))
  }
  onDeleteCampaignModalClose()
}

function onCampaignCardClick(card) {
  if (card.id === 'regular-email') {
    activeCampaignBuilder.value = 'email'
  } else if (card.id === 'sms') {
    activeCampaignBuilder.value = 'sms'
  }
}

function onCreateCampaign() {
  closeRowMenu()
  openFilter.value = null
  isCreateCampaignModalOpen.value = true
}

function onCreateCampaignFromModal(_payload) {
  // Hook: navigate to builder or API with _payload.channel: 'email' | 'sms' | 'meta' | 'google'
}

function handleDocumentClick(event) {
  const t = event.target
  if (openFilter.value) {
    const rootMap = {
      channel: channelFilterRoot,
      date: dateFilterRoot,
      status: statusFilterRoot
    }
    const root = rootMap[openFilter.value]
    if (root?.value && !root.value.contains(t)) {
      openFilter.value = null
    }
  }
  if (rowMenuOpenForId.value !== null) {
    const panel = document.querySelector('[data-campaign-actions-panel]')
    if (panel?.contains(t)) return
    if (t.closest?.('[data-campaign-actions-trigger]')) return
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
