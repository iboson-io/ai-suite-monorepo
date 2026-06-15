export {
  AGENT_STATUS_OPTIONS,
  AGENT_CATEGORY_TABS,
  AGENTS_PAGE_LIMIT,
  MIN_AGENT_PROMPT_LENGTH,
  KNOWLEDGE_TABS,
  KNOWLEDGE_TYPE_LABELS,
} from './constants.js'

export {
  validateAgentName,
  validateAgentPromptOptional,
  validateAgentPromptForEnhance,
  validateApiBaseUrl,
  validateDbConfig,
  validateAgentRoleOptional,
  validateAgentRulesOptional,
  validateSingleRule,
  validateGroupName,
  validateGroupDescriptionOptional,
  validateGroupRedirectionRules,
} from './validation.js'

export {
  validateApiSchemaFiles,
  validateSchemaFiles,
  validateDocumentFiles,
  validateCreateKnowledgeStep,
} from './knowledgeValidation.js'

export {
  formatLastUpdated,
  getStatusBadgeClass,
  getStatusLabel,
  statusFromActive,
  fetchAgentsList,
  deleteAgentRecord,
  setAgentActiveStatus,
} from './list.js'

export { fetchAgentDetails } from './details.js'

export {
  fetchAgentChats,
  deleteAgentChat,
  renameAgentChat,
  createAgentChat,
  fetchChatHistory,
} from './chats.js'

export {
  fetchAgentDeployment,
  createAgentDeployment,
  updateAgentDeployment,
  regenerateDeploymentApiKey,
  getDeploymentForEnvironment,
} from './deployment.js'

export {
  updateAgentInfo,
  updateAgentKnowledge,
  deleteAgentKnowledgeFile,
  refreshAgentDetails,
} from './update.js'

export {
  resolveKnowledgeType,
  buildCreateAgentPayload,
  createSingleAgent,
  enhanceAgentPrompt,
} from './create.js'

export { createMultiAgentGroup } from './multi/create.js'
export {
  fetchGroupDetails,
  updateMultiAgentGroup,
  updateGroupName,
} from './multi/details.js'
export {
  fetchGroupChats,
  createGroupChat,
  deleteGroupChat,
  renameGroupChat,
} from './multi/chats.js'
export { fetchPublishedAgentsForPicker } from './multi/picker.js'
export {
  fetchGroupDeployment,
  createGroupDeployment,
} from './multi/deployment.js'

// Legacy export used during migration
export function deriveAgentNameFromPrompt(prompt) {
  const trimmed = String(prompt ?? '').trim()
  if (!trimmed) return 'New Agent'

  const firstLine = trimmed.split(/\r?\n/)[0].trim()
  if (!firstLine) return 'New Agent'

  return firstLine.length > 80 ? `${firstLine.slice(0, 77)}...` : firstLine
}
