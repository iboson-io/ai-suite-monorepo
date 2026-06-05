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
  return response.data ?? response.agent ?? response
}

export function mapAgentDetails(raw) {
  if (!raw || typeof raw !== 'object') return null

  const id = raw.id ?? raw._id
  if (id == null) return null

  const descriptionSource =
    raw.description ?? raw.summary ?? raw.system_prompt ?? raw.prompt

  const description =
    descriptionSource != null && String(descriptionSource).trim()
      ? String(descriptionSource).trim()
      : ''

  const role = raw.role != null ? String(raw.role).trim() : ''

  return {
    id,
    name: raw.name ?? raw.title ?? 'Untitled Agent',
    description,
    role,
    rules: parseAgentRules(raw.rules),
    status: normalizeStatus(raw.status),
    updatedAt: raw.updated_at ?? raw.updatedAt ?? raw.created_at ?? raw.createdAt,
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
