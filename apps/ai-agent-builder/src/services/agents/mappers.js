import { AGENT_STATUS_OPTIONS } from './constants.js'

export function normalizeStatus(status) {
  const value = String(status ?? 'draft').toLowerCase()
  if (value === 'published' || value === 'active') return 'published'
  if (value === 'archived') return 'archived'
  return 'draft'
}

export function parseAgentRules(raw) {
  if (Array.isArray(raw)) {
    return raw.map((rule) => String(rule).trim()).filter(Boolean)
  }

  if (typeof raw === 'string' && raw.trim()) {
    try {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) {
        return parsed.map((rule) => String(rule).trim()).filter(Boolean)
      }
    } catch {
      return [raw.trim()]
    }
    return [raw.trim()]
  }

  return []
}

export function extractAgentPayload(response) {
  if (!response || typeof response !== 'object') return null

  const data = response.data ?? response

  if (data?.agent && typeof data.agent === 'object') {
    return data.agent
  }

  if (response.agent && typeof response.agent === 'object') {
    return response.agent
  }

  return data
}

export function extractCreatedAgentId(response) {
  if (!response || typeof response !== 'object') return null

  const id =
    response.data?.agent?.id ??
    response.data?.agent?._id ??
    response.agent?.id ??
    response.agent?._id

  if (id != null) return id

  const payload = extractAgentPayload(response)
  return payload?.id ?? payload?._id ?? null
}

export function resolveAgentKnowledgeType(raw) {
  if (!raw || typeof raw !== 'object') return 'api'

  const agentTypeValue = String(raw.agent_type ?? '').toLowerCase()
  const authType = String(raw.auth_type ?? '').toLowerCase()

  if (agentTypeValue === 'composio' || authType === 'composio_creds') {
    return 'composio'
  }

  switch (authType) {
    case 'bearer_token':
      return 'api'
    case 'document_access':
      return 'documents'
    case 'db_credentials':
      return 'db'
    default:
      if (Array.isArray(raw.schema_files) && raw.schema_files.length > 0) return 'api'
      if (Array.isArray(raw.document_files) && raw.document_files.length > 0) return 'documents'
      if (raw.db_config) return 'db'
      return 'api'
  }
}

export function knowledgeTabFromType(type) {
  const normalized = String(type ?? 'api').toLowerCase()
  if (normalized === 'documents' || normalized === 'doc') return 'documents'
  if (normalized === 'db') return 'db'
  if (normalized === 'composio') return 'composio'
  return 'api'
}

export function mapAgentDetails(raw) {
  if (!raw || typeof raw !== 'object') return null

  const id = raw.id ?? raw._id
  if (id == null) return null

  const promptSource = raw.prompt ?? raw.system_prompt ?? raw.description ?? raw.summary
  const prompt = promptSource != null ? String(promptSource).trim() : ''

  const descriptionSource = raw.description ?? raw.summary ?? prompt
  const description =
    descriptionSource != null && String(descriptionSource).trim()
      ? String(descriptionSource).trim()
      : ''

  const role = raw.role != null ? String(raw.role).trim() : ''
  const authConfig = raw.auth_config && typeof raw.auth_config === 'object' ? raw.auth_config : {}

  return {
    id,
    name: raw.name ?? raw.title ?? 'Untitled Agent',
    description,
    prompt,
    role,
    rules: parseAgentRules(raw.rules),
    language: raw.language ?? 'english',
    status: normalizeStatus(raw.status),
    voice: Boolean(raw.voice),
    updatedAt: raw.updated_at ?? raw.updatedAt ?? raw.created_at ?? raw.createdAt,
    agentType: resolveAgentKnowledgeType(raw),
    knowledgeTab: knowledgeTabFromType(resolveAgentKnowledgeType(raw)),
    baseUrl: raw.base_url ?? authConfig.base_url ?? '',
    accessToken: raw.token ?? authConfig.token ?? '',
    authType: raw.auth_type ?? '',
    authConfig,
    dbConfig: raw.db_config ?? null,
    schemaFiles: Array.isArray(raw.schema_files) ? raw.schema_files : [],
    documentFiles: Array.isArray(raw.document_files) ? raw.document_files : [],
    connectedApps: Array.isArray(raw.connected_apps) ? raw.connected_apps : [],
    selectedComposioApps: Array.isArray(raw.auth_config)
      ? raw.auth_config
      : Array.isArray(raw.connected_apps)
        ? raw.connected_apps
        : [],
  }
}

function mapMultiAgentStatus(raw) {
  if (raw.is_active === false) return 'archived'
  return 'published'
}

export function mapAgentItem(raw, kind) {
  if (!raw || typeof raw !== 'object') return null

  const id = raw.id ?? raw._id ?? raw.group_id
  if (id == null) return null

  const descriptionSource =
    raw.description ?? raw.summary ?? raw.system_prompt ?? raw.prompt

  const description =
    descriptionSource != null && String(descriptionSource).trim()
      ? String(descriptionSource).trim()
      : 'Description not available'

  return {
    id,
    name: raw.name ?? raw.title ?? raw.group_name ?? 'Untitled Agent',
    description,
    status: kind === 'multi' ? mapMultiAgentStatus(raw) : normalizeStatus(raw.status),
    updatedAt: raw.updated_at ?? raw.updatedAt ?? raw.created_at ?? raw.createdAt,
    kind,
    agentType: kind === 'multi' ? 'multi' : resolveAgentKnowledgeType(raw),
  }
}

export function extractList(data, keys = ['agents', 'groups', 'data']) {
  if (Array.isArray(data)) return data

  for (const key of keys) {
    if (Array.isArray(data?.[key])) return data[key]
    if (Array.isArray(data?.data?.[key])) return data.data[key]
  }

  if (Array.isArray(data?.data)) return data.data
  return []
}

export function hasMorePages(response, page, limit, itemCount) {
  const total =
    response?.total ??
    response?.meta?.total ??
    response?.pagination?.total ??
    response?.data?.total ??
    response?.data?.meta?.total ??
    null

  if (total != null && !Number.isNaN(Number(total))) {
    return page * limit < Number(total)
  }

  return itemCount >= limit
}

export function toApiStatusLabel(statusId) {
  const match = AGENT_STATUS_OPTIONS.find((item) => item.id === statusId)
  return match?.label ?? null
}

export function filterByStatuses(items, statuses) {
  if (!statuses?.length || statuses.length === AGENT_STATUS_OPTIONS.length) {
    return items
  }

  const allowed = new Set(statuses.map(normalizeStatus))
  return items.filter((item) => allowed.has(item.status))
}

export function sortAgentsByUpdatedAt(items) {
  return items.sort((a, b) => {
    const aTime = new Date(a.updatedAt).getTime()
    const bTime = new Date(b.updatedAt).getTime()
    return (Number.isNaN(bTime) ? 0 : bTime) - (Number.isNaN(aTime) ? 0 : aTime)
  })
}

export function extractEnhancedPrompt(response) {
  const payload = extractAgentPayload(response) ?? response

  const enhanced =
    payload?.prompt ??
    payload?.enhanced_prompt ??
    payload?.enhancedPrompt ??
    response?.prompt ??
    response?.enhanced_prompt ??
    response?.data?.prompt ??
    response?.data?.enhanced_prompt

  return enhanced != null && String(enhanced).trim() ? String(enhanced).trim() : ''
}
