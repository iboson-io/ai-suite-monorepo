import { apiService } from '../agentApi.js'

export const AGENT_STATUS_OPTIONS = [
  { id: 'published', label: 'Published' },
  { id: 'draft', label: 'Draft' },
  { id: 'archived', label: 'Archived' },
]

export const AGENT_CATEGORY_TABS = [
  { key: 'all', label: 'All' },
  { key: 'agents', label: 'Agents' },
  { key: 'multi', label: 'Multi' },
]

function normalizeStatus(status) {
  const value = String(status ?? 'draft').toLowerCase()
  if (value === 'published' || value === 'active') return 'published'
  if (value === 'archived') return 'archived'
  return 'draft'
}

export function formatLastUpdated(dateStr) {
  if (!dateStr) return ''

  const date = new Date(dateStr)
  if (Number.isNaN(date.getTime())) return ''

  const now = new Date()
  const time = date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })

  if (date.toDateString() === now.toDateString()) {
    return `Last updated: Today, ${time}`
  }

  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)
  if (date.toDateString() === yesterday.toDateString()) {
    return `Last updated: Yesterday, ${time}`
  }

  const formattedDate = date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  return `Last updated: ${formattedDate}, ${time}`
}

export function getStatusBadgeClass(status) {
  const normalized = normalizeStatus(status)

  if (normalized === 'published') {
    return 'bg-success-50 text-success-600 border border-success-200'
  }
  if (normalized === 'archived') {
    return 'bg-gray-25 secondary_text_color border primary_border_color'
  }
  return 'bg-orange-25 text-orange-200 border border-orange-100'
}

export function getStatusLabel(status) {
  const normalized = normalizeStatus(status)
  return normalized.charAt(0).toUpperCase() + normalized.slice(1)
}

export const AGENTS_PAGE_LIMIT = 12

function extractList(data, keys = ['agents', 'groups', 'data']) {
  if (Array.isArray(data)) return data

  for (const key of keys) {
    if (Array.isArray(data?.[key])) return data[key]
    if (Array.isArray(data?.data?.[key])) return data.data[key]
  }

  if (Array.isArray(data?.data)) return data.data
  return []
}

function hasMorePages(response, page, limit, itemCount) {
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

function mapMultiAgentStatus(raw) {
  if (raw.is_active === false) return 'archived'
  return 'published'
}

function mapAgentItem(raw, kind) {
  if (!raw || typeof raw !== 'object') return null

  const id = raw.id ?? raw._id ?? raw.group_id
  if (id == null) return null

  const descriptionSource =
    raw.description ??
    raw.summary ??
    raw.system_prompt ??
    raw.prompt

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

function toApiStatusLabel(statusId) {
  const match = AGENT_STATUS_OPTIONS.find((item) => item.id === statusId)
  return match?.label ?? null
}

function filterByStatuses(items, statuses) {
  if (!statuses?.length || statuses.length === AGENT_STATUS_OPTIONS.length) {
    return items
  }

  const allowed = new Set(statuses.map(normalizeStatus))
  return items.filter((item) => allowed.has(item.status))
}

async function fetchSingleAgents(page, limit, statusLabel, search) {
  const response = await apiService.getAgentData(page, limit, statusLabel, search)
  const items = extractList(response, ['agents'])
    .map((item) => mapAgentItem(item, 'single'))
    .filter(Boolean)

  return {
    items,
    hasMore: hasMorePages(response, page, limit, items.length),
  }
}

async function fetchMultiAgents(page, limit, search) {
  const response = await apiService.getMultiAgents(page, limit, 'MultiAgents', search)
  const items = extractList(response, ['groups'])
    .map((item) => mapAgentItem(item, 'multi'))
    .filter(Boolean)

  return {
    items,
    hasMore: hasMorePages(response, page, limit, items.length),
  }
}

function sortAgentsByUpdatedAt(items) {
  return items.sort((a, b) => {
    const aTime = new Date(a.updatedAt).getTime()
    const bTime = new Date(b.updatedAt).getTime()
    return (Number.isNaN(bTime) ? 0 : bTime) - (Number.isNaN(aTime) ? 0 : aTime)
  })
}

export function statusFromActive(active) {
  return active ? 'published' : 'archived'
}

export async function setAgentActiveStatus(agent, active) {
  const status = statusFromActive(active)

  if (agent.kind === 'multi') {
    return apiService.requestAgent(`/api/agent-groups/${agent.id}`, {
      method: 'PUT',
      body: JSON.stringify({ is_active: active }),
    })
  }

  return apiService.updateAgentStatus(agent.id, status)
}

export async function fetchAgentsList({
  category = 'all',
  statuses = [],
  search = '',
  page = 1,
  limit = AGENTS_PAGE_LIMIT,
  multiLimit = AGENTS_PAGE_LIMIT,
} = {}) {
  const trimmedSearch = search.trim()
  const statusLabel =
    statuses.length === 1 ? toApiStatusLabel(statuses[0]) : null

  let items = []
  let singleHasMore = false
  let multiHasMore = false

  if (category === 'agents' || category === 'all') {
    const { items: singleAgents, hasMore } = await fetchSingleAgents(
      page,
      limit,
      statusLabel,
      trimmedSearch
    )
    items = items.concat(singleAgents)
    singleHasMore = hasMore
  }

  if (category === 'multi' || category === 'all') {
    const { items: multiAgents, hasMore } = await fetchMultiAgents(
      page,
      multiLimit,
      trimmedSearch
    )
    items = items.concat(multiAgents)
    multiHasMore = hasMore
  }

  items = filterByStatuses(items, statuses)

  const hasMore =
    category === 'agents'
      ? singleHasMore
      : category === 'multi'
        ? multiHasMore
        : singleHasMore || multiHasMore

  return {
    items: sortAgentsByUpdatedAt(items),
    hasMore,
  }
}
