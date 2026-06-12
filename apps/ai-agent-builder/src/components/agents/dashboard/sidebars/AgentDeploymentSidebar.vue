<template>
  <AgentDashboardSubSidebarShell title="Deployment" :is-open="isOpen" @close="$emit('close')">
    <div v-if="loading" class="flex flex-1 items-center justify-center py-10xl">
      <div class="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-info-500" />
    </div>

    <p v-else-if="error" class="label_2_regular text-error-600">{{ error }}</p>

    <div v-else class="flex min-h-0 flex-1 flex-col">
      <div class="flex shrink-0 gap-sm">
        <button
          v-for="env in environments"
          :key="env.value"
          type="button"
          class="flex-1 rounded-full border px-3xl py-sm label_3_semibold transition-colors"
          :class="
            selectedEnvironment === env.value
              ? 'border-info-500 bg-info-50 text-info-600'
              : 'primary_border_color bg-white secondary_text_color hover:bg-gray-25'
          "
          @click="selectedEnvironment = env.value"
        >
          {{ env.label }}
        </button>
      </div>

      <div v-if="currentDeployment" class="custom_scrollbar mt-5xl space-y-4xl overflow-y-auto">
        <div class="rounded-xl border primary_border_color bg-gray-25 p-4xl">
          <p class="label_2_semibold primary_text_color">Deployment status</p>
          <p class="label_3_medium mt-sm capitalize" :class="statusClass">
            {{ currentDeployment.status || 'unknown' }}
          </p>
        </div>

        <div>
          <p class="label_2_semibold primary_text_color mb-md">API endpoint</p>
          <div class="flex items-center gap-md rounded-xl border primary_border_color bg-white px-3xl py-md">
            <input
              :value="endpoint"
              readonly
              class="label_3_regular primary_text_color min-w-0 flex-1 bg-transparent outline-none"
            />
            <button type="button" class="label_3_semibold text-info-600" @click="copyText(endpoint)">
              Copy
            </button>
          </div>
        </div>

        <div>
          <div class="mb-md flex items-center justify-between">
            <p class="label_2_semibold primary_text_color">API key</p>
            <button
              type="button"
              class="label_3_semibold text-info-600 disabled:opacity-50"
              :disabled="regenerating"
              @click="handleRegenerate"
            >
              {{ regenerating ? 'Regenerating...' : 'Regenerate' }}
            </button>
          </div>
          <div class="flex items-center gap-md rounded-xl border primary_border_color bg-white px-3xl py-md">
            <input
              :type="showApiKey ? 'text' : 'password'"
              :value="apiKey"
              readonly
              class="label_3_regular primary_text_color min-w-0 flex-1 bg-transparent outline-none"
            />
            <button type="button" class="label_3_semibold text-info-600" @click="showApiKey = !showApiKey">
              {{ showApiKey ? 'Hide' : 'Show' }}
            </button>
            <button type="button" class="label_3_semibold text-info-600" @click="copyText(apiKey)">
              Copy
            </button>
          </div>
        </div>
      </div>

      <div v-else class="flex flex-1 flex-col items-center justify-center px-4xl py-10xl text-center">
        <div
          class="mb-4xl flex h-16 w-16 items-center justify-center rounded-full bg-gray-25"
          aria-hidden="true"
        >
          <svg class="h-8 w-8 tertiary_text_color" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </div>

        <h4 class="label_1_semibold primary_text_color">No Deployment Found</h4>
        <p class="body_3_regular secondary_text_color mt-sm max-w-[240px]">
          No deployment found for {{ selectedEnvironmentLabel }} environment
        </p>

        <button
          type="button"
          class="primary_add_button mt-5xl rounded-lg px-6xl py-md label_2_semibold primary_2_text_color disabled:opacity-50"
          :disabled="creating || !agent?.id"
          @click="handleCreateDeployment"
        >
          <span v-if="creating" class="inline-flex items-center gap-md">
            <span class="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
            Deploying...
          </span>
          <span v-else>Deploy Agent</span>
        </button>
      </div>
    </div>
  </AgentDashboardSubSidebarShell>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import AgentDashboardSubSidebarShell from '../AgentDashboardSubSidebarShell.vue'
import {
  createAgentDeployment,
  fetchAgentDeployment,
  getDeploymentForEnvironment,
  regenerateDeploymentApiKey,
} from '../../../../services/agents/deployment.js'

const props = defineProps({
  isOpen: { type: Boolean, default: false },
  agent: { type: Object, default: null },
})

defineEmits(['close'])

const environments = [
  { label: 'Production', value: 'production' },
  { label: 'Development', value: 'develop' },
  { label: 'Test', value: 'test' },
]

const loading = ref(false)
const creating = ref(false)
const regenerating = ref(false)
const error = ref('')
const deployments = ref([])
const selectedEnvironment = ref('production')
const showApiKey = ref(false)

const selectedEnvironmentLabel = computed(() => {
  const match = environments.find((env) => env.value === selectedEnvironment.value)
  return match?.label ?? 'Production'
})

const currentDeployment = computed(() =>
  getDeploymentForEnvironment(deployments.value, selectedEnvironment.value)
)

const endpoint = computed(() => {
  const deployment = currentDeployment.value
  const raw =
    deployment?.api_endpoint ??
    deployment?.endpoint ??
    deployment?.url ??
    ''

  if (!raw || raw === 'No endpoint available') return 'No endpoint available'

  const agentId = deployment?.agent_id || props.agent?.id
  if (!agentId || String(raw).includes('/agent_id=')) return raw

  const separator = String(raw).endsWith('/') ? '' : '/'
  return `${raw}${separator}agent_id=${agentId}`
})

const apiKey = computed(() => currentDeployment.value?.api_key || '')

const statusClass = computed(() => {
  const status = String(currentDeployment.value?.status ?? '').toLowerCase()
  if (status === 'active') return 'text-success-600'
  if (status === 'pending') return 'text-warning-600'
  if (status === 'deleted') return 'text-error-600'
  return 'secondary_text_color'
})

async function loadDeployments() {
  if (!props.agent?.id) return

  loading.value = true
  error.value = ''

  try {
    const result = await fetchAgentDeployment(props.agent.id)
    deployments.value = result.deployments
  } catch (err) {
    error.value = err?.message || 'Failed to load deployment.'
    deployments.value = []
  } finally {
    loading.value = false
  }
}

watch(
  () => [props.agent?.id, props.isOpen],
  ([agentId, isOpen]) => {
    if (agentId && isOpen) loadDeployments()
  },
  { immediate: true }
)

async function handleCreateDeployment() {
  if (!props.agent?.id) return

  creating.value = true
  error.value = ''

  try {
    await createAgentDeployment(props.agent.id, {
      environment: selectedEnvironment.value,
      color: '#ffffff',
      logo_file: '',
      icon_file: '',
      company_name: 'AI Assistant',
    })
    await loadDeployments()
  } catch (err) {
    error.value = err?.message || 'Failed to create deployment.'
  } finally {
    creating.value = false
  }
}

async function handleRegenerate() {
  const deploymentId = currentDeployment.value?.id
  if (!deploymentId) return

  regenerating.value = true
  error.value = ''

  try {
    await regenerateDeploymentApiKey(deploymentId)
    await loadDeployments()
  } catch (err) {
    error.value = err?.message || 'Failed to regenerate API key.'
  } finally {
    regenerating.value = false
  }
}

async function copyText(text) {
  if (!text || text === 'No endpoint available') return
  try {
    await navigator.clipboard.writeText(text)
  } catch {
    // ignore clipboard errors
  }
}
</script>
