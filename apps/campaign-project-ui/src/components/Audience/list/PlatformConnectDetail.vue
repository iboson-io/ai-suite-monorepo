<template>
  <div class="flex h-full min-h-0 flex-col overflow-hidden">
    <!-- Main card -->
    <div
      class="flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border bg_secondary_color primary_border_color"
    >
      <!-- Header -->
      <div class="shrink-0 px-6xl pb-3xl pt-6xl">
        <div class=" gap-4xl">
          <img
            :src="platform.icon"
            :alt="platform.name"
            class="h-10 w-10 shrink-0"
            aria-hidden="true"
          />
          <div class="min-w-0 flex-1">
            <h1 class="label_1_semibold primary_text_color mt-md">
              {{ platform.name }}
            </h1>
            <p class="paragraph_p3_regular secondary_text_color mt-sm">
              {{ detail.subtitle }}
            </p>
          </div>
        </div>
        <div class="mt-3xl h-px shrink-0 bg-info-50" />
      </div>

      <!-- Connected accounts -->
      <div v-if="isConnected" class="min-h-0 flex-1 overflow-auto p-3xl">
        <p class="label_1_semibold primary_text_color">
          {{ accountsSummary }}
        </p>

        <ul class="mt-4xl flex flex-col gap-4xl">
          <li
            v-for="account in connectedAccounts"
            :key="account.id"
            class="rounded-lg border bg_secondary_color p-4xl primary_border_color"
          >
            <div class="flex flex-wrap items-start justify-between gap-md">
              <div class="min-w-0 flex-1">
                <div class="flex flex-wrap items-center gap-md">
                  <span class="label_1_semibold primary_text_color">
                    {{ platform.name }}
                  </span>
                  <span
                    class="inline-flex items-center gap-xs rounded-md px-md py-xs body_4_medium"
                    :class="statusBadgeClass(account.status)"
                  >
                    <svg
                      v-if="account.status === 'connected'"
                      class="h-3.5 w-3.5 shrink-0"
                      viewBox="0 0 16 16"
                      fill="none"
                      aria-hidden="true"
                    >
                      <path
                        d="M3.33398 7.99935L6.66732 11.3327L13.334 4.66602"
                        stroke="currentColor"
                        stroke-width="1.5"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                    </svg>
                    <img
                      v-else-if="account.status === 'syncing'"
                      :src="RestartIcon"
                      alt=""
                      class="h-3.5 w-3.5 shrink-0"
                      aria-hidden="true"
                    />
                    <img
                      v-else-if="account.status === 'action-needed'"
                      :src="WarningIcon"
                      alt=""
                      class="h-3.5 w-3.5 shrink-0"
                      aria-hidden="true"
                    />
                    {{ statusLabel(account.status) }}
                  </span>
                </div>

                <p
                  class="mt-sm flex flex-wrap items-center gap-sm label_2_regular secondary_text_color"
                >
                  <svg
                    class="h-4 w-4 shrink-0 text-gray-400"
                    viewBox="0 0 16 16"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M2.667 3.333h10.666c.736 0 1.334.597 1.334 1.334v6.666c0 .737-.598 1.334-1.334 1.334H2.667c-.736 0-1.334-.597-1.334-1.334V4.667c0-.737.598-1.334 1.334-1.334Z"
                      stroke="currentColor"
                      stroke-width="1.2"
                    />
                    <path
                      d="M2.667 4.667 8 9.333l5.333-4.666"
                      stroke="currentColor"
                      stroke-width="1.2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                  <span>{{ account.email }}</span>
                  <span class="text-gray-300" aria-hidden="true">·</span>
                  <span>{{ account.contactsLabel }}</span>
                  <span class="text-gray-300" aria-hidden="true">·</span>
                  <span>{{ account.timeLabel }}</span>
                </p>
              </div>

              <div class="flex shrink-0 items-center gap-md">
                <button
                  type="button"
                  class="inline-flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:bg-gray-25"
                  :class="
                    account.status === 'action-needed'
                      ? 'text-error-600 hover:bg-error-50'
                      : 'text-gray-500'
                  "
                  aria-label="Disconnect account"
                  @click="emit('disconnectAccount', account)"
                >
                  <svg
                    class="h-[18px] w-[18px]"
                    viewBox="0 0 18 18"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M6.75 6.75V4.5a2.25 2.25 0 012.25-2.25h0A2.25 2.25 0 0111.25 4.5v2.25M6.75 11.25v2.25a2.25 2.25 0 002.25 2.25h0a2.25 2.25 0 002.25-2.25v-2.25M3 9h12"
                      stroke="currentColor"
                      stroke-width="1.4"
                      stroke-linecap="round"
                    />
                  </svg>
                </button>
                <button
                  type="button"
                  class="inline-flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-25"
                  aria-label="Sync account"
                  @click="emit('syncAccount', account)"
                >
                  <img :src="RestartIcon" alt="" class="h-[18px] w-[18px]" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  class="inline-flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-25"
                  aria-label="Delete account"
                  @click="emit('deleteAccount', account)"
                >
                  <svg
                    class="h-4 w-4"
                    viewBox="0 0 16 16"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M2.667 4.667h10.666M6.667 7.333v4M9.333 7.333v4M3.333 4.667l.667 8h8l.667-8M6 4.667V3.333h4v1.334"
                      stroke="currentColor"
                      stroke-width="1.3"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </li>
        </ul>
      </div>

      <!-- Pre-connect info -->
      <div v-else class="flex min-h-0 flex-1 flex-col gap-6xl overflow-auto px-6xl pb-6xl">
        <section>
          <h2 class="label_2_regular secondary_text_color">
            Once connected, this agent can:
          </h2>
          <ul class="mt-4xl flex flex-col gap-3xl">
            <li
              v-for="item in detail.capabilities"
              :key="item"
              class="flex items-start gap-md"
            >
              <span
                class="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#2ABB7F]"
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
              <span class="paragraph_p3_regular secondary_text_color">{{ item }}</span>
            </li>
          </ul>
        </section>

        <section>
          <h2 class="paragraph_p3_regular secondary_text_color">
            Imported data may include:
          </h2>
          <ul class="mt-4xl flex flex-col gap-3xl">
            <li
              v-for="item in detail.importedData"
              :key="item"
              class="flex items-start gap-md"
            >
              <span
                class="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#2ABB7F]"
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
              <span class="paragraph_p3_regular secondary_text_color">{{ item }}</span>
            </li>
          </ul>
        </section>
      </div>
    </div>

    <!-- Footer (below card) -->
    <div class="mt-6xl flex shrink-0 flex-wrap items-center justify-between gap-md bg_secondary_color px-6xl py-xl primary_border_color rounded-lg">
      <button
        type="button"
        class="inline-flex min-h-[2.75rem] items-center justify-center rounded-lg border bg-gray-25 px-7xl py-xl label_1_semibold primary_text_color transition-colors hover:bg-gray-50 primary_border_color"
        @click="emit('back')"
      >
        Back
      </button>
      <button
        type="button"
        class="inline-flex min-h-[2.75rem] items-center justify-center gap-md rounded-lg px-7xl py-xl label_1_semibold primary_add_button"
        @click="onConnectClick"
      >
        {{ isConnected ? 'Connect new' : detail.connectLabel }}
        <img :src="ArrowRightWhite" alt="" class="h-4 w-4 shrink-0" aria-hidden="true" />
      </button>
    </div>

    <PlatformConnectSelectListModal
      v-model="isSelectListModalOpen"
      @confirm="onSelectListConfirm"
      @cancel="isSelectListModalOpen = false"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import ArrowRightWhite from '../../../assets/images/LeftWhiteArrow.svg'
import RestartIcon from '../../../assets/images/RestartIcon.svg'
import WarningIcon from '../../../assets/images/WarningIcon.svg'
import PlatformConnectSelectListModal from './PlatformConnectSelectListModal.vue'

const props = defineProps({
  platform: {
    type: Object,
    required: true
  },
  isConnected: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits([
  'back',
  'connect',
  'disconnectAccount',
  'syncAccount',
  'deleteAccount'
])

const isSelectListModalOpen = ref(false)

const PLATFORM_ACCOUNTS = {
  'google-contacts': [
    {
      id: 'gc-1',
      email: 'ava@gmail.com',
      contactsLabel: '1,820 contacts',
      timeLabel: '22 mins ago',
      status: 'connected'
    },
    {
      id: 'gc-2',
      email: 'marketing@gmail.com',
      contactsLabel: '1,452 contacts',
      timeLabel: 'Syncing now',
      status: 'syncing'
    },
    {
      id: 'gc-3',
      email: 'old-team@gmail.com',
      contactsLabel: '852 contacts',
      timeLabel: '2 days ago',
      status: 'action-needed'
    }
  ],
  gmail: [
    {
      id: 'gmail-1',
      email: 'team@gmail.com',
      contactsLabel: '940 contacts',
      timeLabel: '1 hour ago',
      status: 'connected'
    }
  ],
  shopify: [
    {
      id: 'shopify-1',
      email: 'store@shopify.com',
      contactsLabel: '2,104 customers',
      timeLabel: '3 hours ago',
      status: 'connected'
    }
  ]
}

const PLATFORM_DETAILS = {
  'google-contacts': {
    subtitle: 'Import and sync contacts from Google Contacts.',
    capabilities: [
      'Import and sync contacts automatically',
      'Keep your audience up to date',
      'Use contacts in campaigns and automations'
    ],
    importedData: ['Names', 'Emails', 'Phone numbers'],
    connectLabel: 'Connect Google Contacts'
  },
  gmail: {
    subtitle: 'Import and sync contacts from your Gmail account.',
    capabilities: [
      'Import and sync contacts automatically',
      'Keep your audience up to date',
      'Use contacts in campaigns and automations'
    ],
    importedData: ['Names', 'Emails', 'Phone numbers'],
    connectLabel: 'Connect Gmail'
  },
  shopify: {
    subtitle: 'Sync customers and orders from your store.',
    capabilities: [
      'Import and sync customers automatically',
      'Keep your audience up to date',
      'Use customers in campaigns and automations'
    ],
    importedData: ['Names', 'Emails', 'Phone numbers', 'Order history'],
    connectLabel: 'Connect Shopify'
  }
}

const connectedAccounts = computed(() => {
  return PLATFORM_ACCOUNTS[props.platform.id] ?? []
})

const accountsSummary = computed(() => {
  const count = connectedAccounts.value.length
  return `${count} connected account${count === 1 ? '' : 's'}`
})

const detail = computed(() => {
  const config = PLATFORM_DETAILS[props.platform.id]
  if (config) return config
  return {
    subtitle: props.platform.description,
    capabilities: [
      'Import and sync contacts automatically',
      'Keep your audience up to date',
      'Use contacts in campaigns and automations'
    ],
    importedData: ['Names', 'Emails', 'Phone numbers'],
    connectLabel: `Connect ${props.platform.name}`
  }
})

function statusLabel(status) {
  if (status === 'connected') return 'Connected'
  if (status === 'syncing') return 'Syncing'
  if (status === 'action-needed') return 'Action needed'
  return status
}

function statusBadgeClass(status) {
  if (status === 'connected') return 'bg-[#E6F7F0] text-[#2ABB7F]'
  if (status === 'syncing') return 'bg-blue-25 text-blue-600'
  if (status === 'action-needed') return 'bg-error-50 text-error-600'
  return 'bg-gray-25 secondary_text_color'
}

function onConnectClick() {
  isSelectListModalOpen.value = true
}

function onSelectListConfirm(payload) {
  emit('connect', {
    platform: props.platform,
    list: payload.list,
    tags: payload.tags
  })
}
</script>
