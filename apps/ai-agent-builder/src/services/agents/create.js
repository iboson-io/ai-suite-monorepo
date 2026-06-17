import { apiService } from '../agentApi.js'
import { USER_KEY } from '../api.js'
import {
  extractAgentPayload,
  extractCreatedAgentId,
  extractEnhancedPrompt,
  mapAgentDetails,
  mapAgentItem,
} from './mappers.js'
import { validateAgentName, validateAgentPromptForEnhance } from './validation.js'

export function resolveKnowledgeType({
  knowledgeTab = 'api',
  schemaFiles = [],
  documentFiles = [],
  dbConfig = null,
  selectedComposioApps = [],
}) {
  if (knowledgeTab === 'composio' && selectedComposioApps.length > 0) return 'composio'
  if (knowledgeTab === 'db' && dbConfig?.type) return 'db'
  if (knowledgeTab === 'api' && schemaFiles.length > 0) return 'api'
  if (knowledgeTab === 'documents' && documentFiles.length > 0) return 'doc'
  if (documentFiles.length > 0) return 'doc'
  if (schemaFiles.length > 0) return 'api'
  return 'api'
}

function getUserIdFromStorage() {
  try {
    const raw = localStorage.getItem(USER_KEY)
    if (!raw) return ''
    const userData = JSON.parse(raw)
    return userData.id ?? userData.user_id ?? ''
  } catch {
    return ''
  }
}

export function buildCreateAgentPayload({
  name,
  prompt = '',
  role = '',
  rules = [],
  knowledgeTab = 'api',
  schemaFiles = [],
  documentFiles = [],
  baseUrl = '',
  accessToken = '',
  dbConfig = null,
  selectedComposioApps = [],
}) {
  const knowledgeType = resolveKnowledgeType({
    knowledgeTab,
    schemaFiles,
    documentFiles,
    dbConfig,
    selectedComposioApps,
  })

  const agentData = {
    name: String(name).trim(),
    status: 'published',
    system_type: 'single',
    base_url: '',
    token: '',
    auth_type: 'none',
    auth_config: {},
    voice: true,
  }

  const promptTrimmed = String(prompt ?? '').trim()
  if (promptTrimmed) agentData.prompt = promptTrimmed

  const roleTrimmed = String(role ?? '').trim()
  if (roleTrimmed) agentData.role = roleTrimmed

  const cleanedRules = (Array.isArray(rules) ? rules : [])
    .map((rule) => String(rule).trim())
    .filter(Boolean)
  if (cleanedRules.length > 0) agentData.rules = cleanedRules

  const trimmedBaseUrl = String(baseUrl ?? '').trim()
  const trimmedToken = String(accessToken ?? '').trim()

  switch (knowledgeType) {
    case 'api':
      agentData.auth_type = 'bearer_token'
      agentData.auth_config = {
        base_url: trimmedBaseUrl,
        token: trimmedToken,
      }
      agentData.base_url = trimmedBaseUrl
      agentData.token = trimmedToken
      break

    case 'doc':
      agentData.auth_type = 'document_access'
      agentData.auth_config = {
        base_url: trimmedBaseUrl,
        token: trimmedToken,
      }
      agentData.base_url = trimmedBaseUrl
      agentData.token = trimmedToken
      break

    case 'db':
      if (dbConfig?.type) {
        agentData.db_config = { ...dbConfig }
        agentData.auth_type = 'db_credentials'
        agentData.auth_config = {
          host: dbConfig.host,
          port: parseInt(dbConfig.port, 10),
          username: dbConfig.username,
          password: dbConfig.password,
          database: dbConfig.database,
          db_type: dbConfig.type,
        }
      }
      break

    case 'composio':
      agentData.agent_type = 'composio'
      agentData.auth_type = 'composio_creds'
      if (selectedComposioApps.length > 0) {
        const userId = getUserIdFromStorage()
        let connectedAccountIdFromUrl = ''
        try {
          connectedAccountIdFromUrl =
            new URLSearchParams(window.location.search).get('connected_account_id') ?? ''
        } catch {
          connectedAccountIdFromUrl = ''
        }

        agentData.auth_config = selectedComposioApps.map((app) => ({
          connected_account_id:
            connectedAccountIdFromUrl || app.connected_account_id || '',
          slug_name: app.slug_name || app.name || app.app_name || '',
          auth_config_id: app.auth_config_id || '',
          composio_entity_id: app.composio_entity_id || app.id || '',
          user_id: userId,
        }))
      }
      break

    default:
      break
  }

  return { agentData, knowledgeType }
}

export async function createSingleAgent({
  name,
  prompt,
  role = '',
  rules = [],
  knowledgeTab = 'api',
  schemaFiles = [],
  documentFiles = [],
  baseUrl = '',
  accessToken = '',
  dbConfig = null,
  selectedComposioApps = [],
} = {}) {
  const nameValidation = validateAgentName(name)
  if (!nameValidation.valid) {
    throw new Error(nameValidation.message)
  }

  const { agentData, knowledgeType } = buildCreateAgentPayload({
    name,
    prompt,
    role,
    rules,
    knowledgeTab,
    schemaFiles,
    documentFiles,
    baseUrl,
    accessToken,
    dbConfig,
    selectedComposioApps,
  })

  const response = await apiService.createAgentWithFiles(
    agentData,
    schemaFiles,
    documentFiles,
    knowledgeType
  )

  const agentId = extractCreatedAgentId(response)
  if (!agentId) {
    throw new Error(response?.message || 'Failed to create agent.')
  }

  const agentResponse = await apiService.getAgentById(agentId)
  const raw = extractAgentPayload(agentResponse) ?? agentResponse
  return mapAgentItem(raw, 'single') ?? mapAgentDetails(raw)
}

export async function enhanceAgentPrompt(agentId, prompt) {
  const promptTrimmed = String(prompt ?? '').trim()
  const promptValidation = validateAgentPromptForEnhance(promptTrimmed)
  if (!promptValidation.valid) {
    throw new Error(promptValidation.message)
  }

  const response = await apiService.enhancePrompt(agentId ?? null, promptTrimmed)
  const enhanced = extractEnhancedPrompt(response)

  if (!enhanced) {
    throw new Error('Could not improve the prompt. Please try again.')
  }

  return enhanced
}
