import { apiService } from '../../agentApi.js'
import { mapAgentItem } from '../mappers.js'

function extractCreatedGroup(response) {
  const raw =
    response?.data?.group ??
    response?.data ??
    response?.group ??
    response

  if (!raw || typeof raw !== 'object') return null

  const id = raw.id ?? raw.group_id
  if (id == null) return null

  return {
    id,
    name: raw.group_name ?? raw.name ?? 'Untitled Group',
    description: raw.description ?? '',
    agents: Array.isArray(raw.agents) ? raw.agents : [],
    kind: 'multi',
  }
}

export async function createMultiAgentGroup({ groupName, description, agentIds }) {
  const trimmedName = String(groupName ?? '').trim()
  if (!trimmedName) {
    throw new Error('System name is required.')
  }

  const ids = Array.isArray(agentIds)
    ? agentIds.filter((id) => id != null && String(id).trim() !== '')
    : []

  if (ids.length < 2) {
    throw new Error('Please select at least two agents.')
  }

  const response = await apiService.createAgentGroup({
    group_name: trimmedName,
    description: String(description ?? '').trim(),
    agent_ids: ids,
  })

  const created = extractCreatedGroup(response)
  if (!created?.id) {
    throw new Error('Multi-agent system was created but no group id was returned.')
  }

  return mapAgentItem(
    {
      ...created,
      group_name: created.name,
      description: created.description,
    },
    'multi'
  )
}
