import { apiService } from '../agentApi.js'

export function getPromptBoxConfig() {
  return {
    allProductsLabel: 'All Agents',
    placeholder: 'Ask a question, type @ to select an agent, or create a new one',
    showModelsDropdown: false,
  }
}

export function mapAgent(raw) {
  if (raw == null) return null
  if (typeof raw === 'string') return { id: raw, name: raw }

  const id = raw._id ?? raw.id ?? null
  const name = raw.name ?? raw.title ?? String(id ?? '')

  if (id == null && !name) return null
  return { id, name: name || String(id) }
}

function extractAgentList(data) {
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.agents)) return data.agents
  if (Array.isArray(data?.data?.agents)) return data.data.agents
  if (Array.isArray(data?.data)) return data.data
  return []
}

export async function fetchProducts() {
  const data = await apiService.getAgentData(1, 50)
  return extractAgentList(data).map(mapAgent).filter(Boolean)
}

export async function fetchModels() {
  return []
}
