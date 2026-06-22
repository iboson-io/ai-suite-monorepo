import { apiService } from '../agentApi.js'
import { extractAgentPayload, mapAgentDetails } from './mappers.js'
import { buildCreateAgentPayload } from './create.js'
import { validateAgentName, validateAgentPromptOptional } from './validation.js'

export async function updateAgentInfo(agentId, { name, prompt, role, rules, language } = {}) {
  const nameValidation = validateAgentName(name)
  if (!nameValidation.valid) {
    throw new Error(nameValidation.message)
  }

  const promptValidation = validateAgentPromptOptional(prompt)
  if (!promptValidation.valid) {
    throw new Error(promptValidation.message)
  }

  const payload = {
    name: String(name ?? '').trim(),
  }

  const promptTrimmed = String(prompt ?? '').trim()
  if (promptTrimmed) payload.prompt = promptTrimmed

  const roleTrimmed = String(role ?? '').trim()
  if (roleTrimmed) payload.role = roleTrimmed

  const cleanedRules = (Array.isArray(rules) ? rules : [])
    .map((rule) => String(rule).trim())
    .filter(Boolean)
  if (cleanedRules.length > 0) payload.rules = cleanedRules

  if (language) payload.language = language

  const response = await apiService.updateAgent(agentId, payload)
  const details = mapAgentDetails(extractAgentPayload(response))

  if (!details) {
    throw new Error('Failed to update agent info.')
  }

  return details
}

export async function updateAgentKnowledge(agentId, {
  knowledgeTab = 'api',
  schemaFiles = [],
  documentFiles = [],
  baseUrl = '',
  accessToken = '',
  dbConfig = null,
  selectedComposioApps = [],
} = {}) {
  const { agentData, knowledgeType } = buildCreateAgentPayload({
    name: 'placeholder',
    knowledgeTab,
    schemaFiles,
    documentFiles,
    baseUrl,
    accessToken,
    dbConfig,
    selectedComposioApps,
  })

  delete agentData.name
  delete agentData.status
  delete agentData.system_type

  const hasNewFiles = schemaFiles.length > 0 || documentFiles.length > 0

  const response = hasNewFiles
    ? await apiService.updateAgentWithFiles(
        agentId,
        agentData,
        schemaFiles,
        documentFiles,
        knowledgeType
      )
    : await apiService.updateAgent(agentId, agentData)

  const details = mapAgentDetails(extractAgentPayload(response))

  if (!details) {
    throw new Error('Failed to update agent knowledge.')
  }

  return details
}

export async function deleteAgentKnowledgeFile(agentId, fileId, fileType = null) {
  return apiService.deleteAgentFile(agentId, fileId, fileType)
}

export async function refreshAgentDetails(agentId) {
  const response = await apiService.getAgentById(agentId)
  const details = mapAgentDetails(extractAgentPayload(response))

  if (!details) {
    throw new Error('Agent details are unavailable.')
  }

  return details
}
