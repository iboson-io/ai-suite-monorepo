/**
 * Client-side rules for which nodes may connect (no backend).
 */

function roleOf(node) {
  if (!node) return 'unknown'
  if (node.type === 'wfWorkflowHub') return 'hub'
  if (node.type === 'wfTriggerChip') return 'trigger'
  if (node.type === 'wfPattern') return 'pattern'
  if (node.type === 'wfRouter') return 'router'
  if (node.type === 'wfCard') return node.data?.role || 'card'
  return 'unknown'
}

/**
 * @param {import('@vue-flow/core').Connection} c
 * @param {Array<{ id: string, type?: string, data?: object }>} nodes
 */
export function isWorkflowFlowConnectionAllowed(c, nodes) {
  if (!c?.source || !c?.target || c.source === c.target) return false
  const list = Array.isArray(nodes) ? nodes : []
  const s = list.find((n) => n.id === c.source)
  const t = list.find((n) => n.id === c.target)
  if (!s || !t) return false

  const sr = roleOf(s)
  const tr = roleOf(t)

  // Hub is the workflow “main” card: it may only emit to HITL, not receive edges.
  if (tr === 'hub') return false
  if (sr === 'hub') return tr === 'hitl'

  // Triggers only emit (no incoming); outputs / HITL only receive (no outgoing) — enforced by handles,
  // but keep defensive rules:
  if (tr === 'trigger') return false
  if (sr === 'output' || sr === 'hitl') return false

  // Avoid wiring "back" into the start of the flow from terminal-only nodes
  if (tr === 'output' && (sr === 'pattern' || sr === 'router' || sr === 'agent')) return true
  if (tr === 'hitl' && (sr === 'pattern' || sr === 'router' || sr === 'agent')) return true

  if (sr === 'trigger' && (tr === 'pattern' || tr === 'agent' || tr === 'router')) return true

  if (sr === 'pattern' && (tr === 'pattern' || tr === 'agent' || tr === 'router' || tr === 'output' || tr === 'hitl'))
    return true

  if (sr === 'router' && tr === 'agent') return true

  if (sr === 'agent' && (tr === 'agent' || tr === 'pattern' || tr === 'router' || tr === 'output' || tr === 'hitl'))
    return true

  return false
}
