import { apiService } from '../../agentApi.js'

function normalizeAgent(raw) {
  if (!raw || typeof raw !== 'object') return null

  const id = raw.id ?? raw.agent_id
  if (id == null) return null

  return {
    id,
    name: raw.name ?? raw.agent_name ?? 'Untitled Agent',
    description: raw.description ?? raw.prompt ?? '',
    status: raw.status ?? 'published',
    agentType: raw.agent_type ?? raw.knowledge_type ?? '',
  }
}

function extractGroupPayload(response) {
  if (response?.data?.group) {
    return {
      group: response.data.group,
      agents: response.data.group.agents ?? response.data.agents ?? [],
    }
  }

  if (response?.group) {
    return {
      group: response.group,
      agents: response.agents ?? response.group.agents ?? [],
    }
  }

  if (response?.data && typeof response.data === 'object') {
    return {
      group: response.data,
      agents: response.data.agents ?? [],
    }
  }

  return { group: response, agents: [] }
}

export async function fetchGroupDetails(groupId) {
  const response = await apiService.getGroupAgentsById(groupId)
  let { group, agents } = extractGroupPayload(response)

  try {
    const detailed = await apiService.fetchGroupAgents(groupId)
    const detailedGroup = detailed?.data?.group ?? detailed?.group
    if (detailedGroup) {
      group = { ...group, ...detailedGroup }
      agents = detailedGroup.agents ?? agents
    }
  } catch {
    // keep basic group payload when details endpoint fails
  }

  const id = group?.id ?? group?.group_id ?? groupId

  return {
    id,
    name: group?.group_name ?? group?.name ?? 'Untitled Group',
    description: group?.description ?? '',
    voice: Boolean(group?.voice),
    agents: (Array.isArray(agents) ? agents : []).map(normalizeAgent).filter(Boolean),
    redirectionRules: Array.isArray(group?.redirection_rules)
      ? group.redirection_rules
      : [],
    kind: 'multi',
    status: group?.is_active === false ? 'archived' : 'published',
    updatedAt: group?.updated_at ?? group?.created_at,
  }
}

export async function updateMultiAgentGroup({
  groupId,
  groupName,
  description,
  agentIds,
  redirectionRules,
}) {
  const ids = Array.isArray(agentIds)
    ? agentIds.filter((id) => id != null && String(id).trim() !== '')
    : []

  if (ids.length < 1) {
    throw new Error('A group must include at least one agent.')
  }

  return apiService.updateAgentGroup(
    groupId,
    ids,
    groupName ?? null,
    description ?? null,
    null,
    redirectionRules
  )
}

export async function updateGroupName(groupId, newName) {
  const trimmed = String(newName ?? '').trim()
  if (!trimmed) throw new Error('Group name is required.')
  return apiService.updateGroupName(groupId, trimmed)
}
