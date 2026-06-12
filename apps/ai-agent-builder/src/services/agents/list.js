import { apiService } from '../agentApi.js'
import { AGENTS_PAGE_LIMIT } from './constants.js'
import {
  extractList,
  filterByStatuses,
  hasMorePages,
  mapAgentItem,
  normalizeStatus,
  sortAgentsByUpdatedAt,
  toApiStatusLabel,
} from './mappers.js'

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

export function statusFromActive(active) {
  return active ? 'published' : 'archived'
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

export async function deleteAgentRecord(agent) {
  if (agent.kind === 'multi') {
    return apiService.deleteAgentGroupById(agent.id)
  }

  return apiService.deleteAgent(agent.id)
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
