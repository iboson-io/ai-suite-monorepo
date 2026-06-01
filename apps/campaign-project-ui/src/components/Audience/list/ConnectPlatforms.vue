<template>
  <div class="flex h-full min-h-0 flex-col gap-8xl overflow-hidden">
    <PlatformConnectDetail
      v-if="selectedPlatform"
      :platform="selectedPlatform"
      :is-connected="isPlatformConnected(selectedPlatform.id)"
      @back="selectedPlatform = null"
      @connect="onPlatformConnect"
    />

    <template v-else>
    <div class="flex min-h-0 flex-1 flex-col gap-8xl overflow-hidden">
    <!-- Header -->
    <div class="shrink-0 rounded-lg bg_secondary_color p-6xl primary_border_color">
      <div class="flex items-center gap-xl">
      <button
        type="button"
        class="inline-flex items-center gap-sm label_2_medium secondary_text_color transition-colors hover:primary_text_color"
        aria-label="Back"
        @click="emit('back')"
      >
        <img :src="BackButtonArrow" alt="" class="h-5xl w-5xl" aria-hidden="true" />
      </button>
      <h1 class="heading_h6_bold primary_text_color">Connect Platform</h1>
      </div>
      <p class="label_1_regular secondary_text_color mt-sm max-w-3xl">
        Import contacts from tools like Shopify, HubSpot, or your CRM.
      </p>
    </div>
    <div
      class="flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border bg_secondary_color p-6xl primary_border_color"
    >
    <!-- Search -->
    <div class="relative shrink-0">
      <span class="pointer-events-none absolute left-3xl top-1/2 -translate-y-1/2 text-gray-400">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M21 21L15 15M3 10C3 10.9193 3.18106 11.8295 3.53284 12.6788C3.88463 13.5281 4.40024 14.2997 5.05025 14.9497C5.70026 15.5998 6.47194 16.1154 7.32122 16.4672C8.1705 16.8189 9.08075 17 10 17C10.9193 17 11.8295 16.8189 12.6788 16.4672C13.5281 16.1154 14.2997 15.5998 14.9497 14.9497C15.5998 14.2997 16.1154 13.5281 16.4672 12.6788C16.8189 11.8295 17 10.9193 17 10C17 9.08075 16.8189 8.1705 16.4672 7.32122C16.1154 6.47194 15.5998 5.70026 14.9497 5.05025C14.2997 4.40024 13.5281 3.88463 12.6788 3.53284C11.8295 3.18106 10.9193 3 10 3C9.08075 3 8.1705 3.18106 7.32122 3.53284C6.47194 3.88463 5.70026 4.40024 5.05025 5.05025C4.40024 5.70026 3.88463 6.47194 3.53284 7.32122C3.18106 8.1705 3 9.08075 3 10Z" stroke="#28293D" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>

      </span>
      <input
        v-model="searchQuery"
        type="search"
        class="w-full rounded-lg bg_secondary_color py-md pl-10 pr-3xl label_2_medium primary_text_color regular_border_color outline-none transition-colors placeholder:tertiary_text_color"
        placeholder="Search"
        autocomplete="off"
      />
    </div>

    <!-- Platform grid -->
    <div class="min-h-0 flex-1 overflow-auto mt-4xl">
      <div
        v-if="filteredPlatforms.length"
        class="grid grid-cols-1 gap-4xl sm:grid-cols-2 lg:grid-cols-3"
      >
        <button
          v-for="platform in filteredPlatforms"
          :key="platform.id"
          type="button"
          class="relative flex w-full flex-col items-start rounded-lg border bg_secondary_color p-4xl text-left primary_border_color transition-colors hover:border-black-400"
          @click="onPlatformClick(platform)"
        >
          <div class="flex w-full items-start justify-between gap-md">
            <img
              :src="platform.icon"
              :alt="platform.name"
              class="h-10 w-10 shrink-0"
              aria-hidden="true"
            />
            <span
              v-if="isPlatformConnected(platform.id)"
              class="inline-flex shrink-0 items-center gap-xs"
            >
              <span
                class="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#2ABB7F]"
                aria-hidden="true"
              >
                <svg
                  class="h-3 w-3"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M3.33398 7.99935L6.66732 11.3327L13.334 4.66602"
                    stroke="white"
                    stroke-width="1.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </span>
              <span class="label_2_medium text-[#2ABB7F]">Connected</span>
            </span>
          </div>
          <h2 class="label_2_semibold primary_text_color mt-sm">
            {{ platform.name }}
          </h2>
          <p class="label_2_regular secondary_text_color mt-sm w-full truncate">
            {{ platform.description }}
          </p>
        </button>
      </div>

      <p
        v-else
        class="py-12 text-center label_2_regular secondary_text_color"
      >
        No platforms match your search.
      </p>
    </div>
    </div>
    </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import PlatformConnectDetail from './PlatformConnectDetail.vue'
import BackButtonArrow from '../../../assets/images/BackButtonArrow.svg'
import GoogleContactsIcon from '../../../assets/images/GoogleContactsIcon.svg'
import GmailIcon from '../../../assets/images/GmailIcon.svg'
import ShopifyIcon from '../../../assets/images/ShopifyIcon.svg'

const emit = defineEmits(['back', 'selectPlatform', 'connect'])

const searchQuery = ref('')
const selectedPlatform = ref(null)
const connectedPlatformIds = ref([])

const platforms = [
  {
    id: 'google-contacts',
    name: 'Google Contacts',
    description: 'Import and sync contacts from your Google Contacts account.',
    icon: GoogleContactsIcon
  },
  {
    id: 'gmail',
    name: 'Gmail',
    description: 'Import and sync contacts from your Gmail account.',
    icon: GmailIcon
  },
  {
    id: 'shopify',
    name: 'Shopify',
    description: 'Sync customers and orders from your store',
    icon: ShopifyIcon
  }
]

const filteredPlatforms = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return platforms
  return platforms.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q)
  )
})

function isPlatformConnected(platformId) {
  return connectedPlatformIds.value.includes(platformId)
}

function onPlatformClick(platform) {
  selectedPlatform.value = platform
  emit('selectPlatform', platform)
}

function onPlatformConnect(payload) {
  const platformId = payload?.platform?.id
  if (platformId && !connectedPlatformIds.value.includes(platformId)) {
    connectedPlatformIds.value = [...connectedPlatformIds.value, platformId]
  }
  if (!selectedPlatform.value || selectedPlatform.value.id !== platformId) {
    selectedPlatform.value = null
  }
  emit('connect', payload)
}
</script>
