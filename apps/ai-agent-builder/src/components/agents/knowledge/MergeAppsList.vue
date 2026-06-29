<template>
  <div class="flex min-h-0 flex-col">
    <!-- Loading -->
    <div v-if="loading" class="flex flex-1 flex-col items-center justify-center py-10xl">
      <div class="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-info-500" />
      <p class="caption_1_regular secondary_text_color mt-4xl">Loading Merge apps...</p>
    </div>

    <!-- Load error -->
    <p
      v-else-if="loadError"
      class="caption_1_regular text-error-600 rounded-lg border border-error-200 bg-error-50 p-4xl"
    >
      {{ loadError }}
    </p>

    <template v-else>
      <!-- Search bar -->
      <div class="mb-4xl flex items-center justify-between gap-4xl">
        <p class="label_2_semibold primary_text_color shrink-0">Connect tools to enable actions</p>
        <div class="relative max-w-[280px] w-full">
          <img
            :src="SearchIcon"
            alt=""
            class="pointer-events-none absolute left-4xl top-1/2 h-[18px] w-[18px] -translate-y-1/2"
            aria-hidden="true"
          />
          <input
            ref="searchInputRef"
            v-model="searchQuery"
            type="text"
            placeholder="Search"
            class="label_2_regular primary_text_color w-full rounded-xl border primary_border_color bg-white py-xl pl-12xl outline-none transition-colors focus:border-info-500"
            :class="searchQuery.trim() ? 'pr-12xl' : 'pr-4xl'"
          />
          <button
            v-if="searchQuery.trim()"
            type="button"
            class="absolute right-4xl top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full text-tertiary_text_color transition-colors hover:bg-gray-25"
            aria-label="Clear search"
            @click="clearSearch"
          >
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <!-- App grid -->
      <div ref="appsListRef" class="custom_scrollbar relative min-h-0 flex-1 overflow-y-auto">
        <Transition name="apps-fade" mode="out-in">
          <div
            v-if="apps.length"
            :key="listTransitionKey"
            class="relative grid grid-cols-3 gap-md"
          >
            <!-- Page loading overlay -->
            <div
              v-if="pageLoading"
              class="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-white/70"
            >
              <div class="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-info-500" />
            </div>

            <!-- App card -->
            <div
              v-for="app in apps"
              :key="app.id"
              class="flex flex-col items-start rounded-xl border p-4xl transition-all duration-200"
              :class="isSelected(app.id)
                ? 'border-info-500 bg-info-50 shadow-sm'
                : 'primary_border_color bg-white'"
            >
              <!-- Logo row + action chip (top-right) -->
              <div class="mb-md flex w-full items-start justify-between gap-sm">
                <div class="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border primary_border_color bg-white">
                  <img
                    :src="app.image_url || DefaultAppLogo"
                    :alt="app.name"
                    class="h-full w-full object-cover"
                    loading="lazy"
                    @error="onLogoError"
                  />
                </div>

                <!-- Added ×  chip -->
                <span
                  v-if="isSelected(app.id)"
                  class="inline-flex items-center gap-xs rounded-full border border-info-200 bg-info-50 px-md py-xs caption_1_medium text-info-700"
                >
                  Added
                  <button
                    type="button"
                    class="flex h-4 w-4 items-center justify-center rounded-full text-info-500 hover:bg-info-100 hover:text-info-700 transition-colors"
                    aria-label="Remove app"
                    @click.stop="removeSelected(app.id)"
                  >
                    ×
                  </button>
                </span>

                <!-- Add to Agent chip (connected, not yet selected) -->
                <button
                  v-else-if="isConnected(app.slug)"
                  type="button"
                  class="inline-flex items-center rounded-full border primary_border_color bg-white px-md py-xs caption_1_medium secondary_text_color hover:bg-gray-25 transition-colors"
                  @click.stop="toggleSelect(app)"
                >
                  + Add
                </button>

                <!-- Connecting spinner chip -->
                <span
                  v-else-if="connecting === app.id"
                  class="inline-flex items-center gap-xs rounded-full border primary_border_color bg-white px-md py-xs caption_1_medium secondary_text_color"
                >
                  <svg class="h-3 w-3 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                </span>
              </div>

              <!-- Name + category -->
              <span class="label_2_semibold primary_text_color line-clamp-1 w-full">{{ app.name }}</span>
              <span class="label_2_regular tertiary_text_color mt-xs line-clamp-1 capitalize">
                {{ app.categories?.[0] || 'Integration' }}
              </span>

              <!-- Bottom action row -->
              <div class="mt-md w-full">
                <!-- Connected badge -->
                <template v-if="isConnected(app.slug)">
                  <span class="caption_1_regular rounded-full bg-success-50 px-md py-xs text-success-700">
                    ✓ Connected
                  </span>
                </template>

                <!-- Connect button (not yet connected) -->
                <template v-else>
                  <button
                    type="button"
                    class="w-full rounded-lg border primary_border_color px-md py-xs label_2_medium secondary_text_color hover:bg-gray-25 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
                    :disabled="connecting === app.id || pageLoading"
                    @click="connectApp(app)"
                  >
                    <span v-if="connecting === app.id" class="flex items-center justify-center gap-xs">
                      <svg class="h-3 w-3 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Connecting...
                    </span>
                    <span v-else>Connect</span>
                  </button>
                  <p v-if="connectErrors[app.id]" class="caption_1_regular text-error-600 mt-xs">
                    {{ connectErrors[app.id] }}
                  </p>
                </template>
              </div>
            </div>
          </div>

          <p
            v-else-if="searchQuery.trim()"
            key="no-search-results"
            class="body_3_regular secondary_text_color py-8xl text-center"
          >
            No apps found matching "{{ searchQuery }}"
          </p>
          <p v-else key="no-apps" class="body_3_regular secondary_text_color py-8xl text-center">
            No Merge apps available
          </p>
        </Transition>
      </div>

      <!-- Pagination -->
      <div
        v-if="pagination && pagination.total_pages > 1"
        class="mt-4xl flex items-center justify-between gap-md pt-4xl pb-2 label_2_regular"
      >
        <p class="caption_1_regular secondary_text_color whitespace-nowrap">
          Page {{ pagination.current_page }} / {{ pagination.total_pages }}
          <span v-if="pagination.total_count" class="tertiary_text_color">({{ pagination.total_count }})</span>
        </p>

        <div class="flex items-center gap-xs">
          <button
            type="button"
            class="flex h-8 w-8 items-center justify-center rounded-lg border transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50"
            :class="pagination.has_prev && !pageLoading ? 'primary_border_color bg-white hover:bg-gray-25' : 'primary_border_color bg-gray-25'"
            :disabled="!pagination.has_prev || pageLoading"
            aria-label="Previous page"
            @click="goToPage(pagination.current_page - 1)"
          >
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <div class="flex items-center gap-xs overflow-x-auto">
            <template v-for="(page, index) in visiblePages" :key="`${page}-${index}`">
              <span v-if="page === 'ellipsis'" class="caption_1_regular tertiary_text_color px-xs">...</span>
              <button
                v-else
                type="button"
                class="min-h-8 min-w-8 rounded-lg border px-sm py-xs caption_1_medium transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50"
                :class="page === pagination.current_page
                  ? 'border-info-500 bg-info-500 primary_2_text_color shadow-sm'
                  : 'primary_border_color bg-white hover:bg-gray-25'"
                :disabled="pageLoading"
                @click="goToPage(page)"
              >
                {{ page }}
              </button>
            </template>
          </div>

          <button
            type="button"
            class="flex h-8 w-8 items-center justify-center rounded-lg border transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50"
            :class="pagination.has_next && !pageLoading ? 'primary_border_color bg-white hover:bg-gray-25' : 'primary_border_color bg-gray-25'"
            :disabled="!pagination.has_next || pageLoading"
            aria-label="Next page"
            @click="goToPage(pagination.current_page + 1)"
          >
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, reactive, ref, watch } from 'vue'
import DefaultAppLogo from '../../../assets/images/AiIcon.svg'
import SearchIcon from '../../../assets/images/search.svg'
import { apiService } from '../../../services/agentApi.js'
import { useAuth } from '../../../composables/useAuth.js'

const props = defineProps({
  selectedApps: { type: Array, default: () => [] },
  agentId: { type: String, default: null },
})

const emit = defineEmits(['update:selected-apps'])

const { getToken, checkAuth } = useAuth()

const loading = ref(false)
const pageLoading = ref(false)
const loadError = ref('')
const apps = ref([])
const connectedApps = ref([])
const searchQuery = ref('')
const pagination = ref(null)
const connecting = ref(null)
const connectErrors = reactive({})
const appLookup = reactive({})
const appsListRef = ref(null)
const searchInputRef = ref(null)
let searchDebounceTimer = null

function loadMergeSDK() {
  if (window.AgentHandlerLink) return Promise.resolve()
  return new Promise((resolve, reject) => {
    const existing = document.querySelector('script[src*="ah-cdn.merge.dev"]')
    if (existing) {
      existing.addEventListener('load', resolve)
      existing.addEventListener('error', () => reject(new Error('Failed to load Merge SDK.')))
      return
    }
    const script = document.createElement('script')
    script.src = 'https://ah-cdn.merge.dev/initialize.js'
    script.onload = resolve
    script.onerror = () => reject(new Error('Failed to load Merge SDK.'))
    document.head.appendChild(script)
  })
}

const listTransitionKey = computed(
  () => `${pagination.value?.current_page ?? 1}-${searchQuery.value.trim()}`
)

const visiblePages = computed(() => {
  if (!pagination.value) return []
  const current = pagination.value.current_page
  const total = pagination.value.total_pages
  const pages = []
  if (total <= 7) {
    for (let i = 1; i <= total; i++) pages.push(i)
    return pages
  }
  pages.push(1)
  if (current > 3) pages.push('ellipsis')
  const start = Math.max(2, current - 1)
  const end = Math.min(total - 1, current + 1)
  for (let i = start; i <= end; i++) pages.push(i)
  if (current < total - 2) pages.push('ellipsis')
  pages.push(total)
  return pages
})

function isConnected(slug) {
  return connectedApps.value.some((ca) => ca.connector_slug === slug && ca.status === 'active')
}

function isSelected(appId) {
  return props.selectedApps.includes(appId)
}

function getNameForId(appId) {
  return appLookup[appId]?.name || apps.value.find((a) => a.id === appId)?.name || appId
}

function getLogoForId(appId) {
  return appLookup[appId]?.image_url || apps.value.find((a) => a.id === appId)?.image_url || DefaultAppLogo
}

function onLogoError(event) {
  const target = event.target
  if (!target || target.src === DefaultAppLogo) return
  target.src = DefaultAppLogo
  target.onerror = null
}

function clearSearch() {
  searchQuery.value = ''
  searchInputRef.value?.focus()
}

function toggleSelect(app) {
  const current = [...props.selectedApps]
  const idx = current.indexOf(app.id)
  if (idx === -1) {
    current.push(app.id)
  } else {
    current.splice(idx, 1)
  }
  emit('update:selected-apps', current)
}

function removeSelected(appId) {
  emit('update:selected-apps', props.selectedApps.filter((id) => id !== appId))
}

async function fetchApps(page = 1, search = null) {
  const isFirstLoad = apps.value.length === 0
  if (isFirstLoad) {
    loading.value = true
  } else {
    pageLoading.value = true
  }
  loadError.value = ''

  try {
    if (!checkAuth()) throw new Error('Please sign in to load apps.')
    const token = getToken()
    if (token) apiService.setAuthToken(token)

    const response = await apiService.getMergeApps(page, 100, search)

    if (response?.status && response?.data?.apps) {
      apps.value = response.data.apps
      pagination.value = response.data.pagination ?? null
      response.data.apps.forEach((app) => {
        appLookup[app.id] = { name: app.name, image_url: app.image_url }
      })
    } else {
      apps.value = []
      pagination.value = null
    }
  } catch (err) {
    loadError.value = err?.message || 'Failed to load Merge apps.'
    apps.value = []
    pagination.value = null
  } finally {
    loading.value = false
    pageLoading.value = false
  }
}

async function fetchConnectedApps() {
  try {
    const token = getToken()
    if (token) apiService.setAuthToken(token)
    const response = await apiService.getMergeConnectedApps()
    const apps = response?.data?.apps || []
    connectedApps.value = apps

    // Auto-select any already-connected apps that aren't yet in selectedApps.
    // Requires backend to include merge_app_id in the connected apps response.
    const autoSelectIds = apps
      .filter((ca) => ca.status === 'active' && ca.merge_app_id)
      .map((ca) => ca.merge_app_id)
      .filter((id) => !props.selectedApps.includes(id))

    if (autoSelectIds.length > 0) {
      emit('update:selected-apps', [...props.selectedApps, ...autoSelectIds])
    }
  } catch {
    connectedApps.value = []
  }
}

async function connectApp(app) {
  if (!checkAuth()) {
    connectErrors[app.id] = 'Please sign in to connect apps.'
    return
  }

  connecting.value = app.id
  delete connectErrors[app.id]

  try {
    const token = getToken()
    if (token) apiService.setAuthToken(token)

    const tokenRes = await apiService.generateMergeLinkToken(app.id)
    const linkToken = tokenRes?.data?.link_token
    if (!linkToken) throw new Error('Failed to generate link token.')

    await loadMergeSDK()

    let connectionSucceeded = false

    await new Promise((resolve, reject) => {
      window.AgentHandlerLink.initialize({
        linkToken,
        onSuccess: () => {
          connectionSucceeded = true
          resolve()
        },
        onExit: (error) => {
          if (!connectionSucceeded) {
            if (error) {
              reject(new Error(typeof error === 'string' ? error : 'Connection cancelled.'))
            } else {
              resolve()
            }
          }
        },
      })
      window.AgentHandlerLink.openLink()
    })

    if (connectionSucceeded) {
      try {
        await apiService.mergeLinkCallback(app.id)
      } catch {
        // non-fatal — connection may already be stored
      }
      await fetchConnectedApps()
      if (!isSelected(app.id)) toggleSelect(app)
    }
  } catch (err) {
    connectErrors[app.id] = err?.message || 'Connection failed. Please try again.'
  } finally {
    connecting.value = null
  }
}

async function goToPage(page) {
  if (page < 1 || (pagination.value && page > pagination.value.total_pages)) return
  if (pagination.value?.current_page === page) return
  await fetchApps(page, searchQuery.value.trim() || null)
  await nextTick()
  appsListRef.value?.scrollTo({ top: 0, behavior: 'smooth' })
}

watch(searchQuery, () => {
  if (searchDebounceTimer) clearTimeout(searchDebounceTimer)
  searchDebounceTimer = setTimeout(async () => {
    await fetchApps(1, searchQuery.value.trim() || null)
    await nextTick()
    appsListRef.value?.scrollTo({ top: 0, behavior: 'smooth' })
  }, 300)
})

async function fetchAgentMergeApps() {
  if (!props.agentId) return
  try {
    const token = getToken()
    if (token) apiService.setAuthToken(token)
    const response = await apiService.getAgentMergeApps(props.agentId)
    const agentApps = response?.data?.apps || []
    agentApps.forEach((app) => {
      if (app.id) {
        appLookup[app.id] = { name: app.name, image_url: app.image_url }
      }
    })
    const ids = agentApps.map((a) => a.id).filter(Boolean)
    if (ids.length > 0) {
      const merged = [...new Set([...props.selectedApps, ...ids])]
      emit('update:selected-apps', merged)
    }
  } catch {
    // non-fatal — fall back to selectedApps from parent
  }
}

onMounted(async () => {
  await Promise.all([fetchApps(1, null), fetchConnectedApps(), fetchAgentMergeApps()])
})
</script>

<style scoped>
.apps-fade-enter-active,
.apps-fade-leave-active {
  transition: opacity 0.2s ease;
}
.apps-fade-enter-from,
.apps-fade-leave-to {
  opacity: 0;
}
</style>
