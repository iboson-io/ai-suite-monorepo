/**
 * Persist workflow canvas layout + user-drawn edges in localStorage (no backend).
 * Keyed by workflow id so each workflow has its own overlay.
 */

const STORAGE_PREFIX = 'agent-lab-wf-diagram:'

function key(workflowId) {
  return `${STORAGE_PREFIX}${workflowId}`
}

export function loadWorkflowDiagramLocal(workflowId) {
  if (typeof localStorage === 'undefined' || !workflowId) return null
  try {
    const raw = localStorage.getItem(key(workflowId))
    if (!raw) return null
    const data = JSON.parse(raw)
    if (!data || typeof data !== 'object') return null
    return data
  } catch {
    return null
  }
}

export function saveWorkflowDiagramLocal(workflowId, payload) {
  if (typeof localStorage === 'undefined' || !workflowId) return
  try {
    localStorage.setItem(key(workflowId), JSON.stringify(payload))
  } catch (e) {
    console.warn('workflow diagram local save failed', e)
  }
}

export function clearWorkflowDiagramLocal(workflowId) {
  if (typeof localStorage === 'undefined' || !workflowId) return
  try {
    localStorage.removeItem(key(workflowId))
  } catch {
    /* ignore */
  }
}

/**
 * @param {string} workflowId
 * @param {{ nodes: any[], edges: any[] }} built - from buildWorkflowFlowGraph
 * @returns {{ nodes: any[], edges: any[] }}
 */
export function mergeLocalDiagram(workflowId, built) {
  const local = loadWorkflowDiagramLocal(workflowId)
  let nodes = built.nodes.map((n) => ({ ...n }))
  const pos = local?.positions && typeof local.positions === 'object' ? local.positions : null
  if (pos) {
    nodes = nodes.map((n) => {
      const p = pos[n.id]
      return p && typeof p.x === 'number' && typeof p.y === 'number'
        ? { ...n, position: { x: p.x, y: p.y } }
        : n
    })
  }

  const schemaEdges = built.edges.map((e) => ({
    ...e,
    deletable: false
  }))

  const userEdges = Array.isArray(local?.userEdges) ? local.userEdges : []
  const nodeIds = new Set(nodes.map((n) => n.id))
  const seen = new Set(schemaEdges.map((e) => `${e.source}|${e.target}|${e.sourceHandle || ''}|${e.targetHandle || ''}`))
  const merged = [...schemaEdges]

  for (const ue of userEdges) {
    if (!ue?.source || !ue?.target) continue
    if (!nodeIds.has(ue.source) || !nodeIds.has(ue.target)) continue
    const k = `${ue.source}|${ue.target}|${ue.sourceHandle || ''}|${ue.targetHandle || ''}`
    if (seen.has(k)) continue
    seen.add(k)
    merged.push({
      ...ue,
      deletable: ue.deletable !== false
    })
  }

  return { nodes, edges: merged }
}

/**
 * Snapshot positions + user edges for storage.
 */
export function buildLocalPayload(nodes, edges) {
  const positions = {}
  for (const n of nodes) {
    if (n.position && typeof n.position.x === 'number' && typeof n.position.y === 'number') {
      positions[n.id] = { x: n.position.x, y: n.position.y }
    }
  }
  const userEdges = edges.filter((e) => e.data?.local === true || e.id?.startsWith?.('local-'))
  return { positions, userEdges }
}
