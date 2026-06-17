<template>
  <div class="w-full h-full bg-slate-50 p-6 overflow-hidden flex flex-col min-h-0">
    <!-- Top Header Card -->
    <div class="bg-white rounded-xl p-6 mb-6 flex items-center justify-between flex-wrap gap-4">
      <div class="flex flex-col gap-1">
        <button
          type="button"
          class="flex items-center gap-1 label_2_medium text-gray-500 hover:text-gray-900 transition-colors self-start"
          @click="$emit('back')"
        >
          <svg class="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Run
        </button>
        <h1 class="text-md font-bold  text-gray-950 mt-1">Set up your agent</h1>
        <p class="label_3_regular text-gray-500">Connect your agent to chat, calls, and integrations to go live</p>
      </div>
    </div>

    <!-- Main Content Area -->
    <div class="flex-1 flex flex-col min-h-0">
      <!-- Tabs Bar Card -->
      <div class="bg-white  rounded-xl p-4  mb-6 flex items-center justify-between flex-wrap gap-4">
        <div class="flex items-center gap-3 flex-wrap">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            type="button"
            class="flex items-center gap-2 px-4 py-2.5 rounded-md text-xs font-bold transition-all "
            :class="
              activeTab === tab.id
                ? 'bg-info-50 text-slate-900'
                : 'bg-white text-gray-500 border-transparent hover:bg-slate-50 hover:text-gray-800'
            "
            @click="activeTab = tab.id"
          >
            <span class="h-4 w-4 shrink-0 flex items-center justify-center">
              <!-- Chatbot Customization Icon -->
              <svg v-if="tab.id === 'chat'" class="h-4 w-4" viewBox="0 0 18 18" fill="none" stroke="currentColor">
                <path d="M5.33333 5.33333H12.6667M5.33333 9H10.8333M6.25 13.5833H3.5C2.77065 13.5833 2.07118 13.2936 1.55546 12.7779C1.03973 12.2622 0.75 11.5627 0.75 10.8333V3.5C0.75 2.77065 1.03973 2.07118 1.55546 1.55546C2.07118 1.03973 2.77065 0.75 3.5 0.75H14.5C15.2293 0.75 15.9288 1.03973 16.4445 1.55546C16.9603 2.07118 17.25 2.77065 17.25 3.5V10.8333C17.25 11.5627 16.9603 12.2622 16.4445 12.7779C15.9288 13.2936 15.2293 13.5833 14.5 13.5833H11.75L9 16.3333L6.25 13.5833Z" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>

              <!-- SDK Integration Icon -->
              <svg v-else-if="tab.id === 'sdk'" class="h-4 w-4" viewBox="0 0 20 20" fill="none" stroke="currentColor">
                <path d="M4.41667 2.58333C4.41667 3.06956 4.22351 3.53588 3.8797 3.8797C3.53588 4.22351 3.06956 4.41667 2.58333 4.41667C2.0971 4.41667 1.63079 4.22351 1.28697 3.8797C0.943154 3.53588 0.75 3.06956 0.75 2.58333C0.75 2.0971 0.943154 1.63079 1.28697 1.28697C1.63079 0.943154 2.0971 0.75 2.58333 0.75C3.06956 0.75 3.53588 0.943154 3.8797 1.28697C4.22351 1.63079 4.41667 2.0971 4.41667 2.58333ZM4.41667 2.58333H10.8333C11.0764 2.58333 11.3096 2.67991 11.4815 2.85182C11.6534 3.02373 11.75 3.25688 11.75 3.5V12.6667C11.75 12.9098 11.6534 13.1429 11.4815 13.3148C11.3096 13.4868 11.0764 13.5833 10.8333 13.5833H9M15.4167 8.08333C15.4167 8.56956 15.6098 9.03588 15.9536 9.3797C16.2975 9.72351 16.7638 9.91667 17.25 9.91667C17.7362 9.91667 18.2025 9.72351 18.5464 9.3797C18.8902 9.03588 19.0833 8.56956 19.0833 8.08333C19.0833 7.5971 18.8902 7.13079 18.5464 6.78697C18.2025 6.44315 17.7362 6.25 17.25 6.25C16.7638 6.25 16.2975 6.44315 15.9536 6.78697C15.6098 7.13079 15.4167 7.5971 15.4167 8.08333ZM15.4167 8.08333H11.75M4.41667 9.91667C4.41667 10.4029 4.22351 10.8692 3.8797 11.213C3.53588 11.5568 3.06956 11.75 2.58333 11.75C2.0971 11.75 1.63079 11.5568 1.28697 11.213C0.943154 10.8692 0.75 10.4029 0.75 9.91667C0.75 9.43044 0.943154 8.96412 1.28697 8.6203C1.63079 8.27649 2.0971 8.08333 2.58333 8.08333C3.06956 8.08333 3.53588 8.27649 3.8797 8.6203C4.22351 8.96412 4.41667 9.43044 4.41667 9.91667ZM4.41667 9.91667H7.16667C7.40978 9.91667 7.64294 10.0132 7.81485 10.1852C7.98676 10.3571 8.08333 10.5902 8.08333 10.8333V16.3333C8.08333 16.5764 7.98676 16.8096 7.81485 16.9815C7.64294 17.1534 7.40978 17.25 7.16667 17.25H4.41667M4.41667 17.25C4.41667 17.7362 4.22351 18.2025 3.8797 18.5464C3.53588 18.8902 3.06956 19.0833 2.58333 19.0833C2.0971 19.0833 1.63079 18.8902 1.28697 18.5464C0.943154 18.2025 0.75 17.7362 0.75 17.25C0.75 16.7638 0.943154 16.2975 1.28697 15.9536C1.63079 15.6098 2.0971 15.4167 2.58333 15.4167C3.06956 15.4167 3.53588 15.6098 3.8797 15.9536C4.22351 16.2975 4.41667 16.7638 4.41667 17.25Z" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <!-- API Endpoint Icon -->
              <svg v-else-if="tab.id === 'api'" class="h-4 w-4" viewBox="0 0 15 18" fill="none" stroke="currentColor">
                <path d="M9 0.75V4.41667C9 4.65978 9.09658 4.89294 9.26849 5.06485C9.44039 5.23676 9.67355 5.33333 9.91667 5.33333H13.5833M13.5833 5.33333L9 0.75H2.58333C2.0971 0.75 1.63079 0.943154 1.28697 1.28697C0.943154 1.63079 0.75 2.0971 0.75 2.58333V15.4167C0.75 15.9029 0.943154 16.3692 1.28697 16.713C1.63079 17.0568 2.0971 17.25 2.58333 17.25H11.75C12.2362 17.25 12.7025 17.0568 13.0464 16.713C13.3902 16.3692 13.5833 15.9029 13.5833 15.4167V5.33333ZM9.91667 9V13.5833M4.41667 9.91667C4.41667 9.67355 4.51324 9.44039 4.68515 9.26849C4.85706 9.09658 5.09022 9 5.33333 9H6.25C6.49311 9 6.72627 9.09658 6.89818 9.26849C7.07009 9.44039 7.16667 9.67355 7.16667 9.91667V12.6667C7.16667 12.9098 7.07009 13.1429 6.89818 13.3148C6.72627 13.4868 6.49311 13.5833 6.25 13.5833H5.33333C5.09022 13.5833 4.85706 13.4868 4.68515 13.3148C4.51324 13.1429 4.41667 12.9098 4.41667 12.6667V9.91667Z" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </span>
            {{ tab.label }}
          </button>
        </div>

        <!-- Environment Selector (only shown if a deployment exists) -->
        <div v-if="hasDeploymentData" class="flex gap-1 bg-gray-100 p-1 rounded-full border border-gray-200 shrink-0">
          <button
            v-for="env in environments"
            :key="env.value"
            type="button"
            class="px-4 py-1.5 rounded-full text-[10px] font-bold transition-all"
            :class="
              selectedEnvironment === env.value
                ? 'bg-white text-info-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-900'
            "
            @click="selectEnv(env.value)"
          >
            {{ env.label }}
          </button>
        </div>
      </div>

      <!-- Loading / Error states or Deployment screen -->
      <div v-if="loading" class="flex-1 flex items-center justify-center p-12">
        <div class="text-center">
          <div class="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-info-500 mx-auto mb-2" />
          <p class="text-sm text-gray-500">Loading setup details...</p>
        </div>
      </div>

      <div v-else-if="error" class="flex-1 flex items-center justify-center p-6 text-center">
        <div class="max-w-md bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
          <p class="text-error-600 font-semibold mb-2">Error Loading Setup</p>
          <p class="text-sm text-gray-500 mb-6">{{ error }}</p>
          <button
            type="button"
            class="bg-info-600 hover:bg-info-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors text-sm"
            @click="loadData"
          >
            Retry
          </button>
        </div>
      </div>

      <!-- If no deployment for active environment -->
      <div v-else-if="!currentDeployment" class="flex-1 flex items-center justify-center p-6">
        <div class="max-w-md text-center bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
          <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <h2 class="text-lg font-bold text-gray-900 mb-2">No Deployment Found</h2>
          <p class="text-sm text-gray-500 mb-6">
            There is no active deployment for the <span class="font-semibold text-gray-700 capitalize">{{ selectedEnvironment }}</span> environment.
            Deploy your agent to activate the integration setup.
          </p>
          <button
            type="button"
            class="primary_add_button  hover:bg-info-900 text-white font-semibold py-2 px-6 rounded-lg transition-colors text-sm inline-flex items-center gap-2"
            :disabled="deploying"
            @click="createDeployment"
          >
            <span v-if="deploying" class="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
            {{ deploying ? 'Deploying...' : 'Deploy Agent' }}
          </button>
        </div>
      </div>

      <div v-else class="flex-1 bg-white rounded-xl p-8 flex lg:flex-row flex-col gap-8 min-h-0 overflow-hidden">
        <!-- Left Column: Form Settings -->
        <div class="flex-1 flex flex-col min-h-0 lg:max-w-[70%]">
          <ChatbotCustomizationForm
            v-if="activeTab === 'chat'"
            v-model:name="customizationName"
            v-model:color="customizationColor"
            :logo-preview-url="logoPreviewUrl"
            :icon-preview-url="iconPreviewUrl"
            :saving="saving"
            @logo-change="handleLogoChange"
            @icon-change="handleIconChange"
            @save="saveChanges"
          />



          <SdkIntegrationForm
            v-else-if="activeTab === 'sdk'"
            :sdk-snippet="sdkSnippet"
            :copied-label="copiedLabel['sdk']"
            @copy="copyToClipboard(unmaskedSdkSnippet, 'sdk')"
          />

          <ApiEndpointForm
            v-else-if="activeTab === 'api'"
            :formatted-endpoint="formattedEndpoint"
            :api-key="apiKey"
            v-model:show-api-key="showApiKey"
            :regenerating-key="regeneratingKey"
            :endpoint-copied-label="copiedLabel['endpoint']"
            :key-copied-label="copiedLabel['apikey']"
            @copy-endpoint="copyToClipboard(formattedEndpoint, 'endpoint')"
            @copy-key="copyToClipboard(apiKey, 'apikey')"
            @regenerate-key="regenerateKey"
          />
        </div>

        <!-- Right Column: Interactive Widget Mockup Preview -->
        <div
          v-if="activeTab === 'chat'"
          class="flex-1 w-full bg-info-50 rounded-2xl flex flex-col items-center justify-center relative shadow-inner min-h-[400px] p-8 pb-24"
        >
          <ChatbotPreviewWidget
            :name="customizationName"
            :color="customizationColor"
            :logo-preview-url="logoPreviewUrl"
            :icon-preview-url="iconPreviewUrl"
          />
        </div>
      </div>
    </div>
  </div>

  <SuccessToastNotification
    :open="toastOpen"
    :main-message="toastMessage"
    :secondary-message="toastSecondaryMessage"
    :type="toastType"
    @close="toastOpen = false"
  />
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { SuccessToastNotification } from '@ai-suite/shared-ui'

// Import Sub-components
import ChatbotCustomizationForm from './setup/ChatbotCustomizationForm.vue'

import SdkIntegrationForm from './setup/SdkIntegrationForm.vue'
import ApiEndpointForm from './setup/ApiEndpointForm.vue'
import ChatbotPreviewWidget from './setup/ChatbotPreviewWidget.vue'


// Import deployment icons
import ChatbotIcon from '../../../assets/images/deployment/chatbot.svg'

import SdkIntegrationIcon from '../../../assets/images/deployment/sdkintegration.svg'
import ApiEndpointIcon from '../../../assets/images/deployment/apiendpoint.svg'

// Deployment service actions
import {
  fetchAgentDeployment,
  createAgentDeployment,
  updateAgentDeployment,
  regenerateDeploymentApiKey,
} from '../../../services/agents/deployment.js'

import {
  fetchGroupDeployment,
  createGroupDeployment,
} from '../../../services/agents/multi/deployment.js'

const props = defineProps({
  agent: { type: Object, default: null },
  group: { type: Object, default: null },
  mode: { type: String, default: 'single' }, // 'single' or 'multi'
})

defineEmits(['back'])

// Setup Component Local State
const loading = ref(true)
const deploying = ref(false)
const saving = ref(false)
const regeneratingKey = ref(false)
const error = ref('')
const deployments = ref([])
const selectedEnvironment = ref('production')
const activeTab = ref('chat')
const showApiKey = ref(false)

// Toast Notifications
const toastOpen = ref(false)
const toastMessage = ref('')
const toastSecondaryMessage = ref('')
const toastType = ref('success')

function showToast(main, secondary = '', type = 'success') {
  toastMessage.value = main
  toastSecondaryMessage.value = secondary
  toastType.value = type
  toastOpen.value = true
}

// Chatbot Customization Inputs
const customizationName = ref('AI Assistant')
const customizationColor = ref('#006AF1')
const logoPreviewUrl = ref('')
const iconPreviewUrl = ref('')
const selectedLogoFile = ref(null)
const selectedIconFile = ref(null)



// HTML template references for input click triggers

// Icons definition mapping
const tabs = [
  { id: 'chat', label: 'Chatbot Customization', icon: ChatbotIcon },
  { id: 'sdk', label: 'SDK Integration', icon: SdkIntegrationIcon },
  { id: 'api', label: 'API Endpoint', icon: ApiEndpointIcon },
]

const environments = [
  { label: 'Production', value: 'production' },
  { label: 'Development', value: 'develop' },
  { label: 'Test', value: 'test' },
]

// Computed Values
const hasDeploymentData = computed(() => deployments.value.length > 0)

const currentDeployment = computed(() => {
  const env = selectedEnvironment.value
  return (
    deployments.value.find(
      (d) => String(d.environment || d.env || '').toLowerCase() === env
    ) ?? null
  )
})

const apiKey = computed(() => currentDeployment.value?.api_key || '')

const formattedEndpoint = computed(() => {
  const endpoint = currentDeployment.value?.api_endpoint || currentDeployment.value?.endpoint || ''
  if (!endpoint || endpoint === 'No endpoint available') {
    return 'No endpoint available'
  }
  const id = props.mode === 'multi' ? props.group?.id : props.agent?.id
  if (!id) return endpoint

  const queryParam = props.mode === 'multi' ? `group_id=${id}` : `agent_id=${id}`
  if (endpoint.includes(queryParam)) return endpoint

  const separator = endpoint.endsWith('/') ? '' : '/'
  return `${endpoint}${separator}${queryParam}`
})

const sdkSnippet = computed(() => {
  const widgetUrl = 'https://ai-agent-session.s3.ap-south-1.amazonaws.com/widget/js/chatwidget-agent.js'
  const socket = currentDeployment.value?.socket_endpoint || 'http://localhost:5000'
  const id = props.mode === 'multi' ? props.group?.id : props.agent?.id
  const token = '••••••••••••••••••••••••••••••••'
  const key = apiKey.value ? '••••••••••••••••••••••••••••••••' : 'YOUR_API_KEY'
  const name = customizationName.value
  const color = customizationColor.value
  const icon = iconPreviewUrl.value || ''
  const logo = logoPreviewUrl.value || ''
  const idAttr = props.mode === 'multi' ? `data-group-id="${id || ''}"` : `data-agent-id="${id || ''}"`

  return `<script src="${widgetUrl}"
        data-chat-widget
        data-socket-endpoint="${socket}"
        data-token="${token}"
        data-api-key="${key}"
        data-company-name="${name}"
        ${idAttr}
        data-chat-color="${color}"
        data-chat-icon="${icon}"
        data-logo="${logo}"
><\/script>`
})

const unmaskedSdkSnippet = computed(() => {
  const widgetUrl = 'https://ai-agent-session.s3.ap-south-1.amazonaws.com/widget/js/chatwidget-agent.js'
  const socket = currentDeployment.value?.socket_endpoint || 'http://localhost:5000'
  const id = props.mode === 'multi' ? props.group?.id : props.agent?.id
  const actualToken = localStorage.getItem('auth_token') || 'YOUR_AUTH_TOKEN'
  const actualKey = currentDeployment.value?.api_key || 'YOUR_API_KEY'
  const name = customizationName.value
  const color = customizationColor.value
  const icon = iconPreviewUrl.value || ''
  const logo = logoPreviewUrl.value || ''
  const idAttr = props.mode === 'multi' ? `data-group-id="${id || ''}"` : `data-agent-id="${id || ''}"`

  return `<script src="${widgetUrl}"
        data-chat-widget
        data-socket-endpoint="${socket}"
        data-token="${actualToken}"
        data-api-key="${actualKey}"
        data-company-name="${name}"
        ${idAttr}
        data-chat-color="${color}"
        data-chat-icon="${icon}"
        data-logo="${logo}"
><\/script>`
})

// Clipboard Handling
const copiedLabel = ref({})

async function copyToClipboard(text, id) {
  if (!text || text === 'No endpoint available') return
  try {
    await navigator.clipboard.writeText(text)
    copiedLabel.value[id] = 'Copied!'
    setTimeout(() => {
      delete copiedLabel.value[id]
    }, 2000)
    showToast('Success', 'Copied to clipboard successfully')
  } catch (err) {
    showToast('Error', 'Failed to copy to clipboard', 'error')
  }
}

function handleLogoChange(file) {
  if (!file) return
  if (file.size > 5 * 1024 * 1024) {
    showToast('File Too Large', 'Max file size is 5MB.', 'error')
    return
  }
  selectedLogoFile.value = file
  logoPreviewUrl.value = URL.createObjectURL(file)
}

function handleIconChange(file) {
  if (!file) return
  if (file.size > 5 * 1024 * 1024) {
    showToast('File Too Large', 'Max file size is 5MB.', 'error')
    return
  }
  selectedIconFile.value = file
  iconPreviewUrl.value = URL.createObjectURL(file)
}



// Fetch Deployment Data
async function loadData() {
  const id = props.mode === 'multi' ? props.group?.id : props.agent?.id
  if (!id) {
    loading.value = false
    return
  }

  loading.value = true
  error.value = ''

  try {
    let result
    if (props.mode === 'multi') {
      result = await fetchGroupDeployment(id)
    } else {
      result = await fetchAgentDeployment(id)
    }
    deployments.value = result.deployments || []
  } catch (err) {
    error.value = err?.message || 'Failed to load deployment details.'
    deployments.value = []
  } finally {
    loading.value = false
  }
}

// Create Deployment if not exists
async function createDeployment() {
  const id = props.mode === 'multi' ? props.group?.id : props.agent?.id
  if (!id) return

  deploying.value = true
  error.value = ''

  try {
    const payload = {
      environment: selectedEnvironment.value,
      color: '#006AF1',
      logo_file: '',
      icon_file: '',
      company_name: props.mode === 'multi' ? (props.group?.name || 'AI Group') : (props.agent?.name || 'AI Agent'),
    }

    if (props.mode === 'multi') {
      await createGroupDeployment(id, payload)
    } else {
      await createAgentDeployment(id, payload)
    }

    await loadData()
    showToast('Success', 'Deployment created successfully')
  } catch (err) {
    showToast('Deployment Failed', err?.message || 'Failed to deploy agent.', 'error')
  } finally {
    deploying.value = false
  }
}

// Save Chatbot Customization Changes
async function saveChanges() {
  const deploymentId = currentDeployment.value?.id
  if (!deploymentId) return

  saving.value = true
  try {
    const payload = {
      color: customizationColor.value,
      company_name: customizationName.value,
      logoFile: selectedLogoFile.value,
      iconFile: selectedIconFile.value,
    }

    await updateAgentDeployment(deploymentId, payload)
    await loadData()
    showToast('Success', 'Chatbot customization saved successfully')
  } catch (err) {
    showToast('Save Failed', err?.message || 'Failed to save chatbot customization.', 'error')
  } finally {
    saving.value = false
  }
}

// Regenerate Key
async function regenerateKey() {
  const deploymentId = currentDeployment.value?.id
  if (!deploymentId) return

  regeneratingKey.value = true
  try {
    await regenerateDeploymentApiKey(deploymentId)
    await loadData()
    showToast('Success', 'API key regenerated successfully')
  } catch (err) {
    showToast('Regeneration Failed', err?.message || 'Failed to regenerate API key.', 'error')
  } finally {
    regeneratingKey.value = false
  }
}

function selectEnv(env) {
  selectedEnvironment.value = env
}

const isLightColor = (hex) => {
  if (!hex) return false
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (!result) return false
  const r = parseInt(result[1], 16)
  const g = parseInt(result[2], 16)
  const b = parseInt(result[3], 16)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luminance > 0.5
}

// Watchers
watch(currentDeployment, (deployment) => {
  if (deployment) {
    customizationColor.value = deployment.color || '#006AF1'
    customizationName.value = deployment.company_name || (props.mode === 'multi' ? (props.group?.name || 'AI Group') : (props.agent?.name || 'AI Agent'))
    logoPreviewUrl.value = deployment.logo || ''
    iconPreviewUrl.value = deployment.icon || ''
    selectedLogoFile.value = null
    selectedIconFile.value = null
  }
}, { immediate: true })

onMounted(() => {
  loadData()
})
</script>

<style scoped>
/* Custom styled styling to match tailwind scrollbar and elements */
.custom-color-indicator {
  transition: transform 0.1s ease-out;
}
.custom-color-indicator:active {
  transform: scale(0.95);
}
</style>
