import { apiService } from '../agentApi.js'

export function getPromptBoxConfig() {
  return {
    allProductsLabel: 'All Agents',
    placeholder: 'Ask a question, select an agent, or create a new one',
    showModelsDropdown: false,
  }
}

export function mapAgent(raw, kind) {
  if (raw == null) return null
  if (typeof raw === 'string') return { id: raw, name: raw, kind: kind || 'single' }

  const id = raw._id ?? raw.id ?? raw.group_id ?? null
  const name = raw.name ?? raw.title ?? raw.group_name ?? String(id ?? '')

  if (id == null && !name) return null
  return { id, name: name || String(id), kind: kind || (raw.group_id ? 'multi' : 'single') }
}

function extractList(data, keys = ['agents', 'groups', 'data']) {
  if (Array.isArray(data)) return data
  if (!data) return []

  for (const key of keys) {
    if (Array.isArray(data[key])) return data[key]
    if (Array.isArray(data.data?.[key])) return data.data[key]
  }

  if (Array.isArray(data.data)) return data.data
  return []
}

export async function fetchProducts() {
  try {
    const [agentsRes, groupsRes] = await Promise.allSettled([
      apiService.getAgentData(1, 100),
      apiService.getMultiAgents(1, 100)
    ])

    const agentsData = agentsRes.status === 'fulfilled' ? agentsRes.value : null
    const groupsData = groupsRes.status === 'fulfilled' ? groupsRes.value : null

    const agents = extractList(agentsData, ['agents']).map(item => mapAgent(item, 'single')).filter(Boolean)
    const groups = extractList(groupsData, ['groups']).map(item => mapAgent(item, 'multi')).filter(Boolean)

    return [...agents, ...groups]
  } catch (error) {
    console.error('[promptBox] fetchProducts failed:', error)
    return []
  }
}

export async function fetchModels() {
  return []
}
