const SELECTED_AGENT_ID_KEY = 'selectedAgentId'
const CREATED_AGENT_CONTEXT_KEY = 'created_agent_context'
const CONTEXT_MAX_AGE_MS = 60 * 60 * 1000

export function setSelectedAgentId(agentId) {
  if (agentId != null && String(agentId).trim()) {
    localStorage.setItem(SELECTED_AGENT_ID_KEY, String(agentId))
  }
}

export function getSelectedAgentId() {
  return localStorage.getItem(SELECTED_AGENT_ID_KEY)
}

export function setCreatedAgentContext(context) {
  sessionStorage.setItem(
    CREATED_AGENT_CONTEXT_KEY,
    JSON.stringify({
      ...context,
      timestamp: Date.now(),
    })
  )
}

export function getCreatedAgentContext() {
  try {
    const raw = sessionStorage.getItem(CREATED_AGENT_CONTEXT_KEY)
    if (!raw) return null

    const data = JSON.parse(raw)
    if (Date.now() - (data.timestamp ?? 0) >= CONTEXT_MAX_AGE_MS) {
      sessionStorage.removeItem(CREATED_AGENT_CONTEXT_KEY)
      return null
    }

    return data
  } catch {
    sessionStorage.removeItem(CREATED_AGENT_CONTEXT_KEY)
    return null
  }
}

export function clearCreatedAgentContext() {
  sessionStorage.removeItem(CREATED_AGENT_CONTEXT_KEY)
}
