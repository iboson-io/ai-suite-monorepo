<template>
  <div
    class="flex flex-col"
    :class="
      showListUpload || showConnectPlatforms
        ? 'h-full min-h-0 overflow-hidden'
        : 'min-h-0 flex-1 flex-col gap-8xl overflow-hidden'
    "
  >
    <ListUpload v-if="showListUpload" class="h-full min-h-0" @back="closeListUpload" />

    <ConnectPlatforms
      v-else-if="showConnectPlatforms"
      class="h-full min-h-0"
      @back="closeConnectPlatforms"
    />

    <template v-else>
    <!-- Header -->
    <div class="shrink-0 rounded-lg bg_secondary_color p-6xl primary_border_color">
      <button
        type="button"
        class="inline-flex items-center gap-sm label_2_medium secondary_text_color transition-colors hover:primary_text_color"
        @click="emit('back')"
      >
        <img :src="BackButtonArrow" alt="" class="h-4 w-4" aria-hidden="true" />
        Back to Lists
      </button>
      <h1 class="heading_h6_bold primary_text_color mt-md">
        {{ listName }}
      </h1>
    </div>

    <!-- Navigation (hidden for newly created lists until members are added) -->
    <div
      v-if="!isNewList"
      class="flex shrink-0 flex-wrap items-center justify-between gap-4 rounded-2xl bg_secondary_color p-md primary_border_color md:p-xl"
    >
      <div class="flex flex-wrap items-center gap-md">
        <button
          v-for="tab in navTabs"
          :key="tab.id"
          type="button"
          class="tab-button flex flex-shrink-0 cursor-pointer items-center justify-center gap-sm rounded-xl p-xl transition-colors label_2_semibold "
          :class="activeNavTab === tab.id ? 'bg-info-50 primary_text_color' : 'secondary_text_color'"
          @click="onNavTabClick(tab.id)"
        >
          {{ tab.label }}
        </button>
      </div>

      <div ref="manageListRoot" class="relative shrink-0">
        <button
          type="button"
          class="relative inline-flex min-w-[9.5rem] items-center justify-center gap-md rounded-lg py-lg pl-xl pr-10xl label_1_semibold primary_add_button"
          aria-haspopup="menu"
          :aria-expanded="isManageListOpen"
          @click="toggleManageList"
        >
          <span class="whitespace-nowrap">Manage list</span>
          <img
            :src="DownArrow"
            alt=""
            class="pointer-events-none absolute right-3 top-1/2 h-5xl w-5xl -translate-y-1/2 brightness-0 invert md:right-4"
            aria-hidden="true"
          />
        </button>
        <div
          v-if="isManageListOpen"
          class="absolute right-0 top-full z-50 mt-sm w-max min-w-[15.5rem] overflow-hidden rounded-lg border bg_secondary_color shadow-lg primary_border_color"
          role="menu"
          @click.stop
        >
          <button
            v-for="opt in manageListOptions"
            :key="opt.id"
            type="button"
            role="menuitem"
            class="flex w-full whitespace-nowrap px-3xl py-xl text-left body_2_medium primary_text_color transition-colors hover:bg_primary_color"
            @click.stop="onManageListOption(opt)"
          >
            {{ opt.label }}
          </button>
        </div>
      </div>
    </div>

    <!-- Main content -->
    <div
      class="flex min-h-0 flex-1 flex-col overflow-auto rounded-lg bg_secondary_color p-6xl primary_border_color"
    >
      <ListSuppressions v-if="showSuppressionsView" />

      <div
        v-else-if="activeNavTab === 'members' && memberCount === 0"
        class="flex flex-1 flex-col items-center justify-center py-12 text-center"
      >
        <img
          :src="ContactsEmptyIllustration"
          alt=""
          class="mb-6xl w-[min(100%,280px)] max-w-[280px]"
        />
        <h2 class="heading_h6_bold primary_text_color mb-md">Add your contacts</h2>
        <p class="label_1_regular secondary_text_color max-w-md">
          Import contacts from a CSV file or connect another platform.
        </p>
        <div class="flex flex-wrap items-center justify-center gap-md mt-6xl">
          <button
            type="button"
            class="inline-flex min-h-[2.75rem] items-center justify-center rounded-lg px-8xl py-lg label_1_semibold primary_add_button"
            @click="openListUpload"
          >
            Import CSV
          </button>
          <button
            type="button"
            class="inline-flex min-h-[2.75rem] items-center justify-center rounded-lg bg-info-50 px-8xl py-lg label_1_semibold primary_text_color transition-colors hover:bg-info-100"
            @click="openConnectPlatforms"
          >
            Connect integration
          </button>
        </div>
      </div>

      <ListMembers
        v-else-if="activeNavTab === 'members' && memberCount > 0"
        :current-list-name="listName"
      />

      <ListGrowth v-else-if="activeNavTab === 'growth'" />

      <ListImports
        v-else-if="activeNavTab === 'imports'"
        @import-contacts="openListUpload"
      />

      <ListSettings
        v-else-if="activeNavTab === 'settings'"
        :list-name="listName"
        :list-id="listId"
      />
    </div>
    </template>

    <ListExportModal
      v-model="isExportModalOpen"
      :contact-count="memberCount"
      :list-name="listName"
      :loading="isExportLoading"
      @confirm="onExportConfirm"
      @cancel="isExportModalOpen = false"
    />

    <ListMergeModal
      v-model="isMergeModalOpen"
      :loading="isMergeLoading"
      @confirm="onMergeConfirm"
      @cancel="isMergeModalOpen = false"
    />

    <ListRemoveSuppressedModal
      v-model="isRemoveSuppressedModalOpen"
      :loading="isRemoveSuppressedLoading"
      @confirm="onRemoveSuppressedConfirm"
      @cancel="isRemoveSuppressedModalOpen = false"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import BackButtonArrow from '../../../assets/images/BackButtonArrow.svg'
import DownArrow from '../../../assets/images/DownArrow.svg'
import ContactsEmptyIllustration from '../../../assets/images/ContactAdience.svg'
import ListUpload from './ListUpload.vue'
import ConnectPlatforms from './ConnectPlatforms.vue'
import ListMembers from './ListMembers.vue'
import ListExportModal from './ListExportModal.vue'
import ListMergeModal from './ListMergeModal.vue'
import ListSuppressions from './ListSuppressions.vue'
import ListGrowth from './ListGrowth.vue'
import ListImports from './ListImports.vue'
import ListSettings from './ListSettings.vue'
import ListRemoveSuppressedModal from './ListRemoveSuppressedModal.vue'

const props = defineProps({
  listName: {
    type: String,
    default: 'Master List'
  },
  tags: {
    type: Array,
    default: () => []
  },
  memberCount: {
    type: Number,
    default: 0
  },
  /** True when the list was just created (no id yet); hides tabs and Manage list */
  isNewList: {
    type: Boolean,
    default: false
  },
  listId: {
    type: [String, Number],
    default: undefined
  }
})

const emit = defineEmits([
  'back',
  'importCsv',
  'exportCsv',
  'mergeLists',
  'removeSuppressed',
  'connectIntegration',
  'manageListAction'
])

const showListUpload = ref(false)
const showConnectPlatforms = ref(false)
const showSuppressionsView = ref(false)
const activeNavTab = ref('members')
const isManageListOpen = ref(false)
const isExportModalOpen = ref(false)
const isExportLoading = ref(false)
const isMergeModalOpen = ref(false)
const isMergeLoading = ref(false)
const isRemoveSuppressedModalOpen = ref(false)
const isRemoveSuppressedLoading = ref(false)
const manageListRoot = ref(null)

const manageListOptions = [
  { id: 'import-contacts', label: 'Import contacts' },
  { id: 'export-csv', label: 'Export to CSV' },
  { id: 'merge-lists', label: 'Merge lists' },
  { id: 'view-suppressions', label: 'View list suppressions' },
  { id: 'remove-suppressed', label: 'Remove suppressed profiles' }
]

const navTabs = computed(() => [
  { id: 'members', label: `Members (${props.memberCount})` },
  { id: 'growth', label: 'Growth' },
  { id: 'imports', label: 'Imports' },
  { id: 'settings', label: 'Settings' }
])

function closeListUpload() {
  showListUpload.value = false
}

function openConnectPlatforms() {
  showConnectPlatforms.value = true
  emit('connectIntegration')
}

function closeConnectPlatforms() {
  showConnectPlatforms.value = false
}

function onNavTabClick(tabId) {
  showSuppressionsView.value = false
  activeNavTab.value = tabId
}

function openSuppressionsView() {
  isManageListOpen.value = false
  showSuppressionsView.value = true
}

function openRemoveSuppressedModal() {
  isManageListOpen.value = false
  nextTick(() => {
    isRemoveSuppressedModalOpen.value = true
  })
}

function onRemoveSuppressedConfirm() {
  isRemoveSuppressedLoading.value = true
  emit('removeSuppressed', { listName: props.listName })
  isRemoveSuppressedLoading.value = false
  isRemoveSuppressedModalOpen.value = false
}

function openListUpload() {
  isManageListOpen.value = false
  nextTick(() => {
    showListUpload.value = true
    emit('importCsv')
  })
}

function openExportModal() {
  isManageListOpen.value = false
  nextTick(() => {
    isExportModalOpen.value = true
  })
}

function onExportConfirm() {
  isExportLoading.value = true
  emit('exportCsv', {
    listName: props.listName,
    memberCount: props.memberCount
  })
  isExportLoading.value = false
  isExportModalOpen.value = false
}

function openMergeModal() {
  isManageListOpen.value = false
  nextTick(() => {
    isMergeModalOpen.value = true
  })
}

function onMergeConfirm(payload) {
  isMergeLoading.value = true
  emit('mergeLists', payload)
  isMergeLoading.value = false
  isMergeModalOpen.value = false
}

function toggleManageList() {
  isManageListOpen.value = !isManageListOpen.value
}

function onManageListOption(opt) {
  isManageListOpen.value = false
  if (opt.id === 'import-contacts') {
    openListUpload()
    return
  }
  if (opt.id === 'export-csv') {
    openExportModal()
    return
  }
  if (opt.id === 'merge-lists') {
    openMergeModal()
    return
  }
  if (opt.id === 'view-suppressions') {
    openSuppressionsView()
    return
  }
  if (opt.id === 'remove-suppressed') {
    openRemoveSuppressedModal()
    return
  }
  emit('manageListAction', opt.label)
}

function handleDocumentClick(event) {
  if (!isManageListOpen.value) return
  const el = manageListRoot.value
  if (el && el.contains(event.target)) return
  isManageListOpen.value = false
}

onMounted(() => {
  document.addEventListener('click', handleDocumentClick, true)
  document.addEventListener('touchend', handleDocumentClick, true)
})

onUnmounted(() => {
  document.removeEventListener('click', handleDocumentClick, true)
  document.removeEventListener('touchend', handleDocumentClick, true)
})
</script>
