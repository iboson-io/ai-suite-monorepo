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
            {{ app.name || app.app_name || 'App' }}
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

      <input
        v-model="searchQuery"
        type="text"
        placeholder="Search apps..."
        class="label_2_regular primary_text_color mb-4xl w-full rounded-xl border primary_border_color bg-white px-4xl py-3xl outline-none focus:border-info-500"
      />

      <div class="min-h-0 flex-1 overflow-y-auto">
        <div
          v-if="filteredApps.length"
          class="grid grid-cols-2 gap-md"
        >
          <button
            v-for="app in filteredApps"
            :key="app.id || app.app_name || app.name"
            type="button"
            class="flex flex-col items-center rounded-xl border p-4xl text-center transition-colors"
            :class="isAppSelected(app)
              ? 'border-info-500 bg-info-50'
              : 'primary_border_color bg-white hover:bg-gray-25'"
            @click.stop="toggleAppSelection(app)"
          >
            <span
              class="mb-md flex h-5 w-5 items-center justify-center rounded-full border-2"
              :class="isAppSelected(app) ? 'border-info-500 bg-info-500 text-white' : 'primary_border_color'"
            >
              <span v-if="isAppSelected(app)" class="text-[10px]">✓</span>
            </span>
            <span class="label_2_medium primary_text_color line-clamp-2">
              {{ app.name || app.app_name || 'Unnamed App' }}
            </span>
          </button>
        </div>

        <p
          v-else-if="searchQuery.trim()"
          class="body_3_regular secondary_text_color py-8xl text-center"
        >
          No apps found matching "{{ searchQuery }}"
        </p>
        <p v-else class="body_3_regular secondary_text_color py-8xl text-center">
          No Composio apps available
        </p>
      </div>

      <div
        v-if="pagination && pagination.total_pages > 1"
        class="mt-4xl flex items-center justify-between gap-md border-t primary_border_color pt-4xl"
      >
        <p class="caption_1_regular secondary_text_color">
          Page {{ pagination.current_page }} / {{ pagination.total_pages }}
        </p>
        <div class="flex gap-sm">
          <button
            type="button"
            class="rounded-lg border primary_border_color px-md py-xs caption_1_medium disabled:opacity-50"
            :disabled="!pagination.has_prev || loading"
            @click="goToPage(pagination.current_page - 1)"
          >
            Prev
          </button>
          <button
            type="button"
            class="rounded-lg border primary_border_color px-md py-xs caption_1_medium disabled:opacity-50"
            :disabled="!pagination.has_next || loading"
            @click="goToPage(pagination.current_page + 1)"
          >
            Next
          </button>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { apiService } from '../../../services/agentApi.js'
import { useAuth } from '../../../composables/useAuth.js'

const props = defineProps({
  selectedApps: { type: Array, default: () => [] },
})

const emit = defineEmits([
  'update:selected-apps',
  'app-selected',
  'app-deselected',
  'store-form-data-before-redirect',
])

const { getToken, checkAuth } = useAuth()

const loading = ref(false)
const error = ref('')
const apps = ref([])
const searchQuery = ref('')
const pagination = ref(null)
let searchDebounceTimer = null

const filteredApps = computed(() => apps.value)

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
  loading.value = true
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
  }
}

function goToPage(page) {
  if (page < 1 || (pagination.value && page > pagination.value.total_pages)) return
  fetchComposioApps(page, searchQuery.value.trim() || null)
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
  searchDebounceTimer = setTimeout(() => {
    fetchComposioApps(1, searchQuery.value.trim() || null)
  }, 300)
})

onMounted(() => {
  checkPendingAppSelection()
  fetchComposioApps(1, null)
})
</script>
