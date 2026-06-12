import { apiService } from '../../agentApi.js'
import { extractList, hasMorePages } from '../mappers.js'

function mapPickerAgent(raw) {
  if (!raw || typeof raw !== 'object') return null

  const id = raw.id ?? raw.agent_id
  if (id == null) return null

  return {
    id,
    name: raw.name ?? raw.agent_name ?? 'Untitled Agent',
    description: raw.description ?? raw.prompt ?? '',
    agentType: raw.agent_type ?? raw.knowledge_type ?? '',
    status: raw.status ?? 'published',
  }
}

export async function fetchPublishedAgentsForPicker({
  page = 1,
  limit = 12,
  search = '',
} = {}) {
  const response = await apiService.getAgentData(
    page,
    limit,
    'Published',
    search.trim() || null
  )

  const items = extractList(response, ['agents'])
    .map(mapPickerAgent)
    .filter(Boolean)

  return {
    items,
    hasMore: hasMorePages(response, page, limit, items.length),
  }
}
