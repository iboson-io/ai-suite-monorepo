import { apiService } from '@app/services/agentApi.js'

/**
 * Workflow API helpers (node-ai-agents-ai-workflow service via WORKFLOW_API_URL).
 */
export function useWorkflow() {
  /**
   * @returns {{ workflows: object[], pagination: { current_page?: number, has_next?: boolean, total_items?: number } }}
   */
  async function fetchWorkflowList(page = 1, limit = 20, status = null, search = null) {
    const res = await apiService.getWorkflows(page, limit, status, search)
    const inner = res?.data ?? {}
    const list = inner.workflows ?? res?.workflows ?? []
    const pagination = inner.pagination ?? null
    return {
      workflows: Array.isArray(list) ? list : [],
      pagination: pagination || {
        current_page: page,
        has_next: false,
        total_items: Array.isArray(list) ? list.length : 0
      }
    }
  }

  async function createWorkflowRecord(payload) {
    const res = await apiService.createWorkflow(payload)
    return res?.data?.workflow ?? res?.workflow ?? res?.data
  }

  async function removeWorkflow(workflowId) {
    await apiService.deleteWorkflow(workflowId)
  }

  async function fetchWorkflowSchema(workflowId) {
    const res = await apiService.getWorkflowSchema(workflowId)
    return res?.data ?? res
  }

  /** Paginated agent catalog → map of agent id → display label (for workflow canvas cards). */
  async function fetchAgentNameByIdMap() {
    const collected = []
    let page = 1
    const limit = 100
    let hasMore = true
    try {
      while (hasMore && page <= 50) {
        const res = await apiService.getAgentData(page, limit, null, null)
        const data = res?.data ?? res
        const batch = Array.isArray(data?.agents) ? data.agents : Array.isArray(data) ? data : []
        collected.push(...batch)
        const pag = data?.pagination
        hasMore = pag?.has_next === true && batch.length > 0
        page += 1
        if (!batch.length) hasMore = false
      }
    } catch (e) {
      console.error(e)
      return {}
    }
    const map = Object.create(null)
    for (const a of collected) {
      if (!a || a.id == null) continue
      const id = String(a.id)
      const name = (a.name || a.title || a.agent_name || a.display_name || '').trim()
      map[id] = name || id
    }
    return map
  }

  async function getWorkflow(workflowId) {
    const res = await apiService.getWorkflow(workflowId)
    return res?.data?.workflow ?? res?.workflow ?? res?.data
  }

  async function listPatterns(workflowId) {
    const res = await apiService.getWorkflowPatterns(workflowId)
    return res?.data?.patterns ?? []
  }

  async function getPattern(workflowId, patternId) {
    const res = await apiService.getWorkflowPattern(workflowId, patternId)
    return res?.data?.pattern ?? res?.pattern ?? res?.data
  }

  async function nextPatternExecutionOrder(workflowId) {
    const patterns = await listPatterns(workflowId)
    const max = patterns.reduce((m, p) => Math.max(m, Number(p.execution_order) || 0), 0)
    return max + 1
  }

  async function createTrigger(workflowId, payload) {
    const res = await apiService.createWorkflowTrigger(workflowId, payload)
    return res?.data?.trigger ?? res?.trigger ?? res?.data
  }

  async function createPattern(workflowId, payload) {
    const res = await apiService.createWorkflowPattern(workflowId, payload)
    return res?.data?.pattern ?? res?.pattern ?? res?.data
  }

  async function listPatternAgents(workflowId, patternId) {
    const res = await apiService.listWorkflowPatternAgents(workflowId, patternId)
    const inner = res?.data ?? {}
    const list = inner.agents ?? []
    return Array.isArray(list) ? list : []
  }

  async function getPatternAgent(workflowId, patternId, patternAgentId) {
    const res = await apiService.getWorkflowPatternAgent(workflowId, patternId, patternAgentId)
    return res?.data?.agent ?? res?.agent ?? res?.data
  }

  async function addPatternAgent(workflowId, patternId, payload) {
    const res = await apiService.addWorkflowPatternAgent(workflowId, patternId, payload)
    return res?.data?.agent ?? res?.agent ?? res?.data
  }

  async function nextAgentExecutionOrder(workflowId, patternId) {
    const agents = await listPatternAgents(workflowId, patternId)
    const max = agents.reduce((m, a) => Math.max(m, Number(a.execution_order) || 0), 0)
    return max + 1
  }

  async function saveRouter(workflowId, patternId, payload, isUpdate) {
    if (isUpdate) {
      const res = await apiService.updateWorkflowRouter(workflowId, patternId, payload)
      return res?.data?.router ?? res?.router ?? res?.data
    }
    const res = await apiService.createWorkflowRouter(workflowId, patternId, payload)
    return res?.data?.router ?? res?.router ?? res?.data
  }

  async function getRouter(workflowId, patternId) {
    try {
      const res = await apiService.getWorkflowRouter(workflowId, patternId)
      return res?.data?.router ?? res?.router ?? null
    } catch {
      return null
    }
  }

  async function upsertHitl(workflowId, payload, exists) {
    if (exists) {
      const res = await apiService.updateHitlConfig(workflowId, payload)
      return res?.data?.config ?? res?.config ?? res?.data
    }
    const res = await apiService.createHitlConfig(workflowId, payload)
    return res?.data?.config ?? res?.config ?? res?.data
  }

  async function loadHitl(workflowId) {
    try {
      const res = await apiService.getHitlConfig(workflowId)
      return res?.data?.config ?? res?.config ?? null
    } catch {
      return null
    }
  }

  async function deleteHitl(workflowId) {
    await apiService.deleteHitlConfig(workflowId)
  }

  async function listTriggers(workflowId, page = 1, limit = 50) {
    const res = await apiService.getWorkflowTriggers(workflowId, page, limit)
    const inner = res?.data ?? res ?? {}
    const list = inner.triggers ?? inner.data?.triggers ?? []
    return Array.isArray(list) ? list : []
  }

  async function getTrigger(workflowId, triggerId) {
    const res = await apiService.getWorkflowTrigger(workflowId, triggerId)
    return res?.data?.trigger ?? res?.trigger ?? res?.data
  }

  async function updateTrigger(workflowId, triggerId, payload) {
    const res = await apiService.updateWorkflowTrigger(workflowId, triggerId, payload)
    return res?.data?.trigger ?? res?.trigger ?? res?.data
  }

  async function removeTrigger(workflowId, triggerId) {
    await apiService.deleteWorkflowTrigger(workflowId, triggerId)
  }

  async function updatePattern(workflowId, patternId, payload) {
    const res = await apiService.updateWorkflowPattern(workflowId, patternId, payload)
    return res?.data?.pattern ?? res?.pattern ?? res?.data
  }

  async function removePattern(workflowId, patternId) {
    await apiService.deleteWorkflowPattern(workflowId, patternId)
  }

  async function reorderPatterns(workflowId, order) {
    await apiService.reorderWorkflowPatterns(workflowId, order)
  }

  async function updatePatternAgent(workflowId, patternId, patternAgentId, payload) {
    const res = await apiService.updateWorkflowPatternAgent(workflowId, patternId, patternAgentId, payload)
    return res?.data?.agent ?? res?.agent ?? res?.data
  }

  async function removePatternAgent(workflowId, patternId, patternAgentId) {
    await apiService.deleteWorkflowPatternAgent(workflowId, patternId, patternAgentId)
  }

  async function reorderPatternAgents(workflowId, patternId, order) {
    await apiService.reorderWorkflowPatternAgents(workflowId, patternId, order)
  }

  async function removeRouter(workflowId, patternId) {
    await apiService.deleteWorkflowRouter(workflowId, patternId)
  }

  async function listOutputChannels(workflowId) {
    const res = await apiService.listWorkflowOutputChannels(workflowId)
    const inner = res?.data ?? res ?? {}
    const list = inner.channels ?? inner.output_channels ?? []
    return Array.isArray(list) ? list : []
  }

  async function getOutputChannel(workflowId, channelId) {
    const res = await apiService.getWorkflowOutputChannel(workflowId, channelId)
    return res?.data?.channel ?? res?.channel ?? res?.data
  }

  async function createOutputChannel(workflowId, payload) {
    const res = await apiService.createWorkflowOutputChannel(workflowId, payload)
    return res?.data?.channel ?? res?.channel ?? res?.data
  }

  async function updateOutputChannel(workflowId, channelId, payload) {
    const res = await apiService.updateWorkflowOutputChannel(workflowId, channelId, payload)
    return res?.data?.channel ?? res?.channel ?? res?.data
  }

  async function removeOutputChannel(workflowId, channelId) {
    await apiService.deleteWorkflowOutputChannel(workflowId, channelId)
  }

  async function updateWorkflowRecord(workflowId, payload) {
    const res = await apiService.updateWorkflow(workflowId, payload)
    return res?.data?.workflow ?? res?.workflow ?? res?.data
  }

  async function activateWorkflow(workflowId) {
    const res = await apiService.activateWorkflow(workflowId)
    return res?.data?.workflow ?? res?.workflow ?? res?.data
  }

  async function deactivateWorkflow(workflowId) {
    const res = await apiService.deactivateWorkflow(workflowId)
    return res?.data?.workflow ?? res?.workflow ?? res?.data
  }

  async function listExecutions(workflowId, options = {}) {
    const res = await apiService.listWorkflowExecutions(workflowId, options)
    const data = res?.data ?? res ?? {}
    return {
      executions: Array.isArray(data.executions) ? data.executions : [],
      pagination: data.pagination ?? null
    }
  }

  async function getExecution(workflowId, executionId) {
    const res = await apiService.getWorkflowExecution(workflowId, executionId)
    return res?.data?.execution ?? res?.execution ?? null
  }

  async function listExecutionSteps(workflowId, executionId, options = {}) {
    const res = await apiService.getWorkflowExecutionSteps(workflowId, executionId, options)
    const data = res?.data ?? res ?? {}
    return {
      steps: Array.isArray(data.steps) ? data.steps : [],
      pagination: data.pagination ?? null
    }
  }

  async function listHitlEvents(executionId, options = {}) {
    const res = await apiService.listHitlEventsForExecution(executionId, options)
    const data = res?.data ?? res ?? {}
    return {
      events: Array.isArray(data.events) ? data.events : [],
      pagination: data.pagination ?? null
    }
  }

  async function respondToHitlEvent(eventId, payload) {
    const res = await apiService.respondHitlEvent(eventId, payload)
    return res?.data?.event ?? res?.event ?? null
  }

  return {
    fetchWorkflowList,
    createWorkflowRecord,
    removeWorkflow,
    fetchWorkflowSchema,
    fetchAgentNameByIdMap,
    getWorkflow,
    updateWorkflowRecord,
    activateWorkflow,
    deactivateWorkflow,
    listPatterns,
    getPattern,
    nextPatternExecutionOrder,
    createTrigger,
    createPattern,
    listPatternAgents,
    getPatternAgent,
    nextAgentExecutionOrder,
    addPatternAgent,
    saveRouter,
    getRouter,
    removeRouter,
    upsertHitl,
    loadHitl,
    deleteHitl,
    listTriggers,
    getTrigger,
    updateTrigger,
    removeTrigger,
    updatePattern,
    removePattern,
    reorderPatterns,
    updatePatternAgent,
    removePatternAgent,
    reorderPatternAgents,
    listOutputChannels,
    getOutputChannel,
    createOutputChannel,
    updateOutputChannel,
    removeOutputChannel,
    listExecutions,
    getExecution,
    listExecutionSteps,
    listHitlEvents,
    respondToHitlEvent
  }
}
