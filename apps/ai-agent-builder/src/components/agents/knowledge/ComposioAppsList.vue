<template>
  <div class="flex min-h-0 flex-col">
    <div v-if="loading" class="flex flex-1 flex-col items-center justify-center py-10xl">
      <div class="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-info-500" />
      <p class="caption_1_regular secondary_text_color mt-4xl">Loading Composio apps...</p>
    </div>

    <p v-else-if="error" class="caption_1_regular text-error-600 rounded-lg border border-error-200 bg-error-50 p-4xl">
      {{ error }}
    </p>

    <template v-else>
      <div v-if="selectedApps.length" class="mb-4xl border-b primary_border_color pb-4xl">
        <p class="label_2_semibold primary_text_color mb-md">
          Selected Apps ({{ selectedApps.length }})
        </p>
        <div class="flex flex-wrap gap-md">
          <span
            v-for="app in selectedApps"
            :key="app.id || app.name || app.app_name"
            class="inline-flex items-center gap-sm rounded-lg border border-info-200 bg-info-50 px-md py-xs label_2_medium primary_text_color"
          >
            <img
              :src="getAppLogoUrl(app)"
              alt=""
              class="h-4 w-4 rounded-full object-cover"
              @error="onAppLogoError"
            />
            {{ app.name || app.app_name || app.slug_name || 'App' }}
            <button
              type="button"
              class="text-secondary_text_color hover:text-error-600"
              aria-label="Remove app"
              @click.stop="toggleAppSelection(app)"
            >
              ×
            </button>
          </span>
        </div>
      </div>

      <div class="mb-4xl flex flex-col items-stretch gap-y-3">
        <p class="label_2_semibold primary_text_color shrink-0">
          Connect tools to enable actions
        </p>
        <div class="relative w-full">
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
            class="absolute right-4xl top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full text-tertiary_text_color transition-colors hover:bg-gray-25 hover:primary_text_color"
            aria-label="Clear search"
            @click="clearSearch"
          >
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <div ref="appsListRef" class="custom_scrollbar relative min-h-0 flex-1 overflow-y-auto">
        <Transition name="apps-fade" mode="out-in">
          <div
            v-if="filteredApps.length"
            :key="listTransitionKey"
            class="relative grid grid-cols-2 gap-md"
          >
            <div
              v-if="pageLoading"
              class="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-white/70"
            >
              <div class="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-info-500" />
            </div>

            <button
              v-for="app in filteredApps"
              :key="app.id || app.app_name || app.name"
              type="button"
              class="flex flex-col items-start rounded-xl p-4xl text-left transition-all duration-200"
              :class="isAppSelected(app)
                ? 'selected_platform_border bg-white shadow-sm'
                : 'border primary_border_color bg-white hover:border-info-300 hover:bg-gray-25'"
              :disabled="pageLoading"
              @click.stop="toggleAppSelection(app)"
            >
              <div
                class="mb-md flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border primary_border_color bg-white"
              >
                <img
                  :src="getAppLogoUrl(app)"
                  :alt="app.name || app.app_name || 'App logo'"
                  class="h-full w-full object-cover"
                  loading="lazy"
                  @error="onAppLogoError"
                />
              </div>

              <span class="label_2_semibold primary_text_color line-clamp-1">
                {{ app.name || app.app_name || app.slug_name || 'Unnamed App' }}
              </span>
              <span class="label_2_regular tertiary_text_color mt-xs line-clamp-2">
                {{ getAppDescription(app) }}
              </span>
            </button>
          </div>

          <p
            v-else-if="searchQuery.trim()"
            key="no-search-results"
            class="body_3_regular secondary_text_color py-8xl text-center"
          >
            No apps found matching "{{ searchQuery }}"
          </p>
          <p v-else key="no-apps" class="body_3_regular secondary_text_color py-8xl text-center">
            No Composio apps available
          </p>
        </Transition>
      </div>

      <div
        v-if="pagination && pagination.total_pages > 1"
        class="flex items-center justify-between gap-md label_2_regular"
        style="position: sticky; bottom: -24px; background-color: #ffffff; z-index: 10; padding: 24px 0px; border-top: 1px solid #F3F4F5;"
      >
        <p class="label_1_regular secondary_text_color whitespace-nowrap">
          Page {{ pagination.current_page }} / {{ pagination.total_pages }}
          <span v-if="pagination.total_count" class="tertiary_text_color">
            ({{ pagination.total_count }})
          </span>
        </p>

        <div class="flex items-center gap-xs">
          <button
            type="button"
            class="flex h-8 w-8 items-center justify-center rounded-lg border transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50"
            :class="pagination.has_prev && !pageLoading
              ? 'primary_border_color bg-white hover:bg-gray-25'
              : 'primary_border_color bg-gray-25'"
            :disabled="!pagination.has_prev || pageLoading"
            aria-label="Previous page"
            @click="goToPage(pagination.current_page - 1)"
          >
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <div class="flex items-center gap-xs">
            <template v-for="(page, index) in visiblePages" :key="`${page}-${index}`">
              <span
                v-if="page === 'ellipsis'"
                class="caption_1_regular tertiary_text_color px-xs"
              >
                ...
              </span>
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
            :class="pagination.has_next && !pageLoading
              ? 'primary_border_color bg-white hover:bg-gray-25'
              : 'primary_border_color bg-gray-25'"
            :disabled="!pagination.has_next || pageLoading"
            aria-label="Next page"
            @click="goToPage(pagination.current_page + 1)"
          >
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import DefaultAppLogo from '../../../assets/images/AiIcon.svg'
import SearchIcon from '../../../assets/images/search.svg'
import { apiService } from '../../../services/agentApi.js'
import { useAuth } from '../../../composables/useAuth.js'

const COMPOSIO_LOGO_CDN = 'https://logos.composio.dev/api'

const props = defineProps({
  selectedApps: { type: Array, default: () => [] },
  editMode: { type: Boolean, default: false },
})

const emit = defineEmits([
  'update:selected-apps',
  'app-selected',
  'app-deselected',
  'store-form-data-before-redirect',
])

const { getToken, checkAuth } = useAuth()

const loading = ref(false)
const pageLoading = ref(false)
const error = ref('')
const apps = ref([])
const searchQuery = ref('')
const pagination = ref(null)
const appsListRef = ref(null)
const searchInputRef = ref(null)
let searchDebounceTimer = null

const filteredApps = computed(() => apps.value)

const listTransitionKey = computed(
  () => `${pagination.value?.current_page ?? 1}-${searchQuery.value.trim()}`
)

const visiblePages = computed(() => {
  if (!pagination.value) return []

  const current = pagination.value.current_page
  const total = pagination.value.total_pages
  const pages = []

  if (total <= 7) {
    for (let i = 1; i <= total; i += 1) pages.push(i)
    return pages
  }

  pages.push(1)

  if (current > 3) pages.push('ellipsis')

  const start = Math.max(2, current - 1)
  const end = Math.min(total - 1, current + 1)

  for (let i = start; i <= end; i += 1) pages.push(i)

  if (current < total - 2) pages.push('ellipsis')

  pages.push(total)
  return pages
})

function getAppSlug(app) {
  const raw = app.slug_name || app.app_name || app.name || ''
  return String(raw).trim().toLowerCase().replace(/\s+/g, '_')
}

function getAppLogoUrl(app) {
  const fromApi =
    app.logo ||
    app.logo_url ||
    app.meta?.logo ||
    app.icon ||
    app.icon_url ||
    app.image_url

  if (fromApi) return fromApi

  const slug = getAppSlug(app)
  if (slug) return `${COMPOSIO_LOGO_CDN}/${slug}`

  return DefaultAppLogo
}

function onAppLogoError(event) {
  const target = event.target
  if (!target || target.src === DefaultAppLogo) return
  target.src = DefaultAppLogo
  target.onerror = null
}

function getAppDescription(app) {
  const description =
    app.description ||
    app.meta?.description ||
    app.app_description ||
    app.summary ||
    app.tagline

  if (description) return description

  const name = app.name || app.app_name || 'This app'
  return `Connect ${name} to enable actions`
}

function clearSearch() {
  searchQuery.value = ''
  searchInputRef.value?.focus()
}

function isAppSelected(app) {
  const appId = app.id || app.name || app.app_name
  const appAuthConfigId = app.auth_config_id
  const appSlug = app.slug_name || app.app_name || app.name

  return props.selectedApps.some((selected) => {
    const selectedId = selected.id || selected.name || selected.app_name
    const selectedAuthConfigId = selected.auth_config_id
    const selectedSlug = selected.slug_name || selected.app_name || selected.name

    if (appId && selectedId && appId === selectedId) return true
    if (appAuthConfigId && selectedAuthConfigId && appAuthConfigId === selectedAuthConfigId) {
      return true
    }
    if (appSlug && selectedSlug && appSlug.toLowerCase() === selectedSlug.toLowerCase()) {
      return true
    }
    return false
  })
}

async function toggleAppSelection(app) {
  if (isAppSelected(app)) {
    const appId = app.id || app.name
    const updated = props.selectedApps.filter((selected) => {
      const selectedId = selected.id || selected.name
      return selectedId !== appId
    })
    emit('update:selected-apps', updated)
    emit('app-deselected', app)
    return
  }

  try {
    if (!checkAuth()) throw new Error('Please sign in to connect apps.')

    const token = getToken()
    if (token) apiService.setAuthToken(token)

    const response = await apiService.authenticateComposioApp(app.id)

    if (response?.status && response?.data?.redirect_url) {
      const authConfigId = response.data.auth_config_id
      sessionStorage.setItem(
        'composio_pending_app',
        JSON.stringify({
          app: { ...app, auth_config_id: authConfigId },
          callbackUrl: response.data.callback_url,
          timestamp: Date.now(),
        })
      )
      emit('store-form-data-before-redirect')
      window.location.href = response.data.redirect_url
      return
    }

    const updated = [...props.selectedApps, app]
    emit('update:selected-apps', updated)
    emit('app-selected', app)
  } catch (err) {
    error.value = err?.message || 'Failed to authenticate app. Please try again.'
  }
}

async function fetchComposioApps(page = 1, search = null) {
  const isInitialLoad = apps.value.length === 0
  if (isInitialLoad) {
    loading.value = true
  } else {
    pageLoading.value = true
  }
  error.value = ''

  try {
    if (!checkAuth()) throw new Error('Please sign in to load Composio apps.')

    const token = getToken()
    if (token) apiService.setAuthToken(token)

    const response = await apiService.getComposioApps(page, 50, search)

    if (response?.status && response?.data?.apps) {
      apps.value = response.data.apps
      pagination.value = response.data.pagination ?? null
    } else if (Array.isArray(response?.data)) {
      apps.value = response.data
      pagination.value = null
    } else if (Array.isArray(response)) {
      apps.value = response
      pagination.value = null
    } else {
      apps.value = []
      pagination.value = null
    }
  } catch (err) {
    error.value = err?.message || 'Failed to load Composio apps.'
    apps.value = []
    pagination.value = null
  } finally {
    loading.value = false
    pageLoading.value = false
  }
}

async function scrollAppsListToTop() {
  await nextTick()
  appsListRef.value?.scrollTo({ top: 0, behavior: 'smooth' })
}

async function goToPage(page) {
  if (page < 1 || (pagination.value && page > pagination.value.total_pages)) return
  if (pagination.value?.current_page === page) return

  await fetchComposioApps(page, searchQuery.value.trim() || null)
  await scrollAppsListToTop()
}

function checkPendingAppSelection() {
  try {
    const pendingRaw = sessionStorage.getItem('composio_pending_app')
    if (!pendingRaw) return

    const data = JSON.parse(pendingRaw)
    const appWithAuth = data.app
    const urlParams = new URLSearchParams(window.location.search)
    const hasError =
      urlParams.get('error') != null ||
      urlParams.get('error_description') != null ||
      urlParams.get('auth_error') === 'true'

    if (hasError) {
      sessionStorage.removeItem('composio_pending_app')
      const cleanUrl = window.location.pathname
      window.history.replaceState({}, document.title, cleanUrl)
      return
    }

    const hasSuccess =
      urlParams.get('auth_success') === 'true' ||
      urlParams.get('code') != null ||
      urlParams.get('state') != null
    const authSuccess = hasSuccess || !hasError

    if (authSuccess) {
      const connectedAccountId = urlParams.get('connected_account_id')
      const appId = appWithAuth.id || appWithAuth.name
      const alreadySelected = props.selectedApps.some(
        (selected) => (selected.id || selected.name) === appId
      )

      if (!alreadySelected) {
        const appWithConnectedAccount = {
          ...appWithAuth,
          ...(connectedAccountId ? { connected_account_id: connectedAccountId } : {}),
        }
        emit('update:selected-apps', [...props.selectedApps, appWithConnectedAccount])
        emit('app-selected', appWithConnectedAccount)
      }
    }

    sessionStorage.removeItem('composio_pending_app')

    if (
      urlParams.has('auth_success') ||
      urlParams.has('code') ||
      urlParams.has('state') ||
      urlParams.has('error') ||
      urlParams.has('connected_account_id')
    ) {
      window.history.replaceState({}, document.title, window.location.pathname)
    }
  } catch {
    sessionStorage.removeItem('composio_pending_app')
  }
}

watch(searchQuery, () => {
  if (searchDebounceTimer) clearTimeout(searchDebounceTimer)
  searchDebounceTimer = setTimeout(async () => {
    await fetchComposioApps(1, searchQuery.value.trim() || null)
    await scrollAppsListToTop()
  }, 300)
})

onMounted(() => {
  checkPendingAppSelection()
  fetchComposioApps(1, null)
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

:deep(.selected_platform_border::before) {
  border-radius: 0.75rem !important;
}
</style>
