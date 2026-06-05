export {
  AGENT_STATUS_OPTIONS,
  AGENT_CATEGORY_TABS,
  AGENTS_PAGE_LIMIT,
  MIN_AGENT_PROMPT_LENGTH,
  KNOWLEDGE_TABS,
} from './constants.js'

export {
  validateAgentName,
  validateAgentPromptForEnhance,
  validateApiBaseUrl,
  validateDbConfig,
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
  resolveKnowledgeType,
  buildCreateAgentPayload,
  createSingleAgent,
  enhanceAgentPrompt,
} from './create.js'

// Legacy export used during migration
export function deriveAgentNameFromPrompt(prompt) {
  const trimmed = String(prompt ?? '').trim()
  if (!trimmed) return 'New Agent'

  const firstLine = trimmed.split(/\r?\n/)[0].trim()
  if (!firstLine) return 'New Agent'

  return firstLine.length > 80 ? `${firstLine.slice(0, 77)}...` : firstLine
}
