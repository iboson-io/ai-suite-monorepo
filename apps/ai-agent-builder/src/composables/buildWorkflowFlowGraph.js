import { MarkerType } from '@vue-flow/core'

const M = 32
const COL_GAP = 44
const HEADER_H = 40
const ROUTER_H = 64
const AGENT_W = 216
const AGENT_H = 64
const TRIGGER_H = 76
const OUT_W = 200
const FRAME_PAD = 20

function patternStyle(patternType) {
  const map = {
    sequential: { fill: 'rgba(254, 243, 199, 0.65)', stroke: '#ca8a04', header: '#fef3c7' },
    parallel: { fill: 'rgba(219, 234, 254, 0.65)', stroke: '#2563eb', header: '#dbeafe' },
    supervisor: { fill: 'rgba(237, 233, 254, 0.65)', stroke: '#7c3aed', header: '#ede9fe' },
    agent_to_agent: { fill: 'rgba(255, 228, 230, 0.65)', stroke: '#e11d48', header: '#ffe4e6' }
  }
  return map[patternType] || map.sequential
}

export function cellKey(type, id) {
  return `${type}:${id}`
}

export function workflowHubNodeId(workflowRecordId) {
  return cellKey('workflow', workflowRecordId != null ? String(workflowRecordId) : 'root')
}

function buildTriggerSubtitle(t) {
  const c = t.config || {}
  const ty = t.trigger_type
  if (ty === 'email') return String(c.inbound_email || '')
  if (ty === 'webhook') return String(c.endpoint || '')
  if (ty === 'schedule') return String(c.cron || '')
  if (ty === 'sms' || ty === 'voice') return String(c.phone_number || '')
  try {
    return JSON.stringify(c).slice(0, 96)
  } catch {
    return ''
  }
}

function shortId(id) {
  if (id == null) return ''
  const s = String(id)
  return s.length > 14 ? `${s.slice(0, 10)}…` : s
}

function mapType(t) {
  if (t === 'trigger') return 'trigger'
  if (t === 'pattern') return 'pattern'
  if (t === 'output_channel') return 'output_channel'
  if (t === 'agent') return 'agent'
  if (t === 'router') return 'router'
  return t
}

function sortAgents(agents) {
  return [...(agents || [])].sort(
    (a, b) => (Number(a.execution_order) || 0) - (Number(b.execution_order) || 0)
  )
}

/** Visible arrowhead at path end (matches stroke so links read clearly at all zoom levels). */
export const workflowEdgeMarkerEnd = {
  type: MarkerType.ArrowClosed,
  width: 22,
  height: 22,
  color: '#334155',
  strokeWidth: 1.5
}

export function baseEdge(overrides) {
  return {
    // Orthogonal routing like JointJS diagram demos (vs. smooth bezier curves)
    type: 'step',
    animated: false,
    markerEnd: workflowEdgeMarkerEnd,
    ...overrides
  }
}

/** Relative coords inside pattern frame (parent top-left = pattern position). */
function relToPattern(fx, fy, ax, ay) {
  return { x: ax - fx, y: ay - fy }
}

/** Vue Flow node id for an agent inside a pattern (unique per workflow_pattern_agents row). */
function patternAgentVueNodeId(patternId, row) {
  if (row?.id != null) return cellKey('agent', row.id)
  if (row?.agent_id != null && patternId != null) {
    return cellKey('agent', `${String(patternId)}:${String(row.agent_id)}`)
  }
  return cellKey('agent', row?.agent_id ?? 'unknown')
}

function routerAgentEdgeKey(patternId, agentId) {
  return `${String(patternId)}:${String(agentId)}`
}

/**
 * Build Vue Flow nodes + edges from workflow GET /schema payload.
 * @param {object} schema - API schema
 * @param {{ agentNameById?: Record<string, string> }} [options] - optional id → display name from agent catalog
 */
export function buildWorkflowFlowGraph(schema, options = {}) {
  const agentNameById = options.agentNameById && typeof options.agentNameById === 'object' ? options.agentNameById : {}
  const nodes = []
  const edges = []
  const cellSet = new Set()

  const wf = schema.workflow
  const meta = schema.meta || {}

  const triggers = schema.triggers || []
  const patterns = [...(schema.patterns || [])].sort(
    (a, b) => (Number(a.execution_order) || 0) - (Number(b.execution_order) || 0)
  )
  const outputs = schema.output_channels || []
  const connections = schema.connections || []

  /** Maps `patternId:agentId` → Vue Flow node id for router→agent edges (API uses agent_id, not pattern_agent row id). */
  const agentNodeIdByPatternAndAgent = new Map()

  const pushNode = (n) => {
    cellSet.add(n.id)
    nodes.push(n)
  }

  let cursorX = M
  const topY = 72

  const HUB_W = 300
  const HUB_PAD_X = 14
  const CHIP_W = 84
  const CHIP_H = 52
  const CHIP_GAP = 8
  const chipsPerRow = Math.max(1, Math.floor((HUB_W - 2 * HUB_PAD_X + CHIP_GAP) / (CHIP_W + CHIP_GAP)))
  const hubHeaderBlock = 76
  const hubTriggersTitle = 26
  const hubBodyTop = hubHeaderBlock + hubTriggersTitle
  const emptyBodyMin = 100
  const chipRows = triggers.length ? Math.ceil(triggers.length / chipsPerRow) : 0
  const chipAreaH = chipRows
    ? chipRows * CHIP_H + Math.max(0, chipRows - 1) * CHIP_GAP + 16
    : emptyBodyMin

  const hubFooter = 80
  const hubH = Math.max(220, hubBodyTop + chipAreaH + hubFooter)

  const hitl = schema.hitl

  const hubId = workflowHubNodeId(wf?.id)
  pushNode({
    id: hubId,
    type: 'wfWorkflowHub',
    position: { x: M, y: topY },
    width: HUB_W,
    height: hubH,
    zIndex: 2,
    selectable: true,
    data: {
      workflowName: wf?.name || 'Workflow',
      workflowId: wf?.id != null ? String(wf.id) : '',
      triggerCount: triggers.length
    }
  })

  triggers.forEach((t, i) => {
    const col = i % chipsPerRow
    const row = Math.floor(i / chipsPerRow)
    const id = cellKey('trigger', t.id)
    pushNode({
      id,
      type: 'wfTriggerChip',
      parentNode: hubId,
      position: {
        x: HUB_PAD_X + col * (CHIP_W + CHIP_GAP),
        y: hubBodyTop + row * (CHIP_H + CHIP_GAP)
      },
      extent: 'parent',
      width: CHIP_W,
      height: CHIP_H,
      zIndex: 10,
      selectable: true,
      data: {
        role: 'trigger',
        triggerId: t.id,
        triggerType: String(t.trigger_type || 'event'),
        subtitle: buildTriggerSubtitle(t)
      }
    })
  })

  cursorX += HUB_W + COL_GAP

  let maxBottom = topY

  patterns.forEach((p) => {
    const ps = patternStyle(p.pattern_type)
    const agents = sortAgents(p.agents)
    const hasRouter = p.pattern_type === 'supervisor' && p.router
    const rules = hasRouter ? p.router.routing_rules || [] : []
    const fallback = hasRouter ? p.router.fallback_agent_id : null

    const n = agents.length
    const parallel = p.pattern_type === 'parallel' && !hasRouter

    let frameW = Math.max(300, AGENT_W + FRAME_PAD * 2)
    let frameH = HEADER_H + FRAME_PAD

    if (hasRouter) {
      // Router is a top-level node (not a child of the pattern) so it can be dragged freely on the canvas.
      // Frame height only covers header + agents inside the dashed supervisor box.
      if (parallel) {
        frameW = Math.max(frameW, FRAME_PAD * 2 + n * AGENT_W + Math.max(0, n - 1) * 12)
        frameH += AGENT_H + FRAME_PAD
      } else {
        frameH += Math.max(1, n) * (AGENT_H + 12) + FRAME_PAD + (n === 0 ? 36 : 0)
      }
    } else if (parallel) {
      frameW = Math.max(frameW, FRAME_PAD * 2 + Math.max(1, n) * AGENT_W + Math.max(0, n - 1) * 12)
      frameH += Math.max(AGENT_H, 56) + FRAME_PAD
    } else {
      frameH += Math.max(1, n) * (AGENT_H + 12) + FRAME_PAD + (n === 0 ? 36 : 0)
    }

    const fx = cursorX
    const fy = topY

    const badge = String(p.pattern_type || 'pattern').replace(/_/g, ' ')
    const sub = p.description ? String(p.description).slice(0, 80) : `${badge} · ${n} agent(s)`
    const fid = cellKey('pattern', p.id)

    /** Align pattern border handles with first/last agent row (avoids overlapping agent in/out ports). */
    const bodyStart = HEADER_H + 10
    let handleInTopPct = 50
    let handleOutTopPct = 50
    if (n > 0 && frameH > 0) {
      if (parallel) {
        const rowCenter = bodyStart + AGENT_H / 2
        const t = (rowCenter / frameH) * 100
        handleInTopPct = Math.min(100, Math.max(0, t))
        handleOutTopPct = handleInTopPct
      } else {
        const firstCenter = bodyStart + AGENT_H / 2
        const lastCenter = bodyStart + (n - 1) * (AGENT_H + 12) + AGENT_H / 2
        handleInTopPct = Math.min(100, Math.max(0, (firstCenter / frameH) * 100))
        handleOutTopPct = Math.min(100, Math.max(0, (lastCenter / frameH) * 100))
      }
    }

    pushNode({
      id: fid,
      type: 'wfPattern',
      position: { x: fx, y: fy },
      zIndex: 0,
      selectable: true,
      width: frameW,
      height: frameH,
      data: {
        title: p.name || 'Pattern',
        subtitle: sub,
        ps,
        patternId: p.id,
        patternType: p.pattern_type,
        executionOrder: Number(p.execution_order) || 0,
        handleInTopPct,
        handleOutTopPct
      }
    })

    const innerX = fx + FRAME_PAD
    let innerY = fy + HEADER_H + 10

    /** Agents laid out in a horizontal row (parallel) vs vertical stack (sequential / supervisor). */
    const agentsInRow = !hasRouter && p.pattern_type === 'parallel'

    const agentData = (a) => {
      const sid = a?.agent_id != null ? String(a.agent_id) : ''
      const catalog = sid && agentNameById[sid] ? String(agentNameById[sid]).trim() : ''
      const sidShort = shortId(a.agent_id)
      const title = catalog || sidShort
      const subtitle = catalog ? sidShort : ''
      return {
        role: 'agent',
        heading: 'Agent',
        title,
        subtitle,
        patternId: p.id,
        patternType: p.pattern_type,
        patternAgentId: a.id != null ? a.id : null,
        agentId: a.agent_id,
        agentArrangement: agentsInRow ? 'row' : 'column',
        executionOrder: Number(a.execution_order) || 0
      }
    }

    /** Bottom Y of router when present (for maxBottom); 0 when absent. */
    let routerBottomY = 0

    if (hasRouter) {
      const rid = cellKey('router', p.id)
      const rw = Math.min(280, Math.max(160, frameW - FRAME_PAD * 2))
      const routerAbsX = fx + (frameW - rw) / 2
      const routerAbsY = fy + frameH + 16
      routerBottomY = routerAbsY + ROUTER_H
      pushNode({
        id: rid,
        type: 'wfRouter',
        position: { x: routerAbsX, y: routerAbsY },
        draggable: true,
        zIndex: 12,
        selectable: true,
        width: rw,
        height: ROUTER_H,
        data: {
          rules,
          hasFallback: !!fallback,
          patternId: p.id
        }
      })

      const placeAgent = (a, i, ax, ay) => {
        const aid = patternAgentVueNodeId(p.id, a)
        agentNodeIdByPatternAndAgent.set(routerAgentEdgeKey(p.id, a.agent_id), aid)
        const rp = relToPattern(fx, fy, ax, ay)
        pushNode({
          id: aid,
          type: 'wfCard',
          parentNode: fid,
          position: rp,
          extent: 'parent',
          zIndex: 10,
          selectable: true,
          data: agentData(a)
        })
      }

      if (parallel) {
        agents.forEach((a, i) => {
          placeAgent(a, i, innerX + i * (AGENT_W + 12), innerY)
        })
      } else {
        agents.forEach((a, i) => {
          placeAgent(a, i, innerX, innerY + i * (AGENT_H + 12))
        })
      }
    } else if (parallel) {
      agents.forEach((a, i) => {
        const aid = patternAgentVueNodeId(p.id, a)
        agentNodeIdByPatternAndAgent.set(routerAgentEdgeKey(p.id, a.agent_id), aid)
        pushNode({
          id: aid,
          type: 'wfCard',
          parentNode: fid,
          position: relToPattern(fx, fy, innerX + i * (AGENT_W + 12), innerY),
          extent: 'parent',
          zIndex: 10,
          selectable: true,
          data: agentData(a)
        })
      })
    } else {
      agents.forEach((a, i) => {
        const aid = patternAgentVueNodeId(p.id, a)
        agentNodeIdByPatternAndAgent.set(routerAgentEdgeKey(p.id, a.agent_id), aid)
        pushNode({
          id: aid,
          type: 'wfCard',
          parentNode: fid,
          position: relToPattern(fx, fy, innerX, innerY + i * (AGENT_H + 12)),
          extent: 'parent',
          zIndex: 10,
          selectable: true,
          data: agentData(a)
        })
      })
    }

    if (!hasRouter && (p.pattern_type === 'sequential' || p.pattern_type === 'agent_to_agent')) {
      for (let i = 0; i < agents.length - 1; i++) {
        const a = patternAgentVueNodeId(p.id, agents[i])
        const b = patternAgentVueNodeId(p.id, agents[i + 1])
        if (cellSet.has(a) && cellSet.has(b)) {
          edges.push(
            baseEdge({
              id: `seq-${p.id}-${i}`,
              source: a,
              target: b,
              sourceHandle: 'out',
              targetHandle: 'in',
              style: { stroke: '#94a3b8', strokeWidth: 1.5 }
            })
          )
        }
      }
    }

    // Supervisor: show stacked agent order (router still targets in-router; chain uses out → in-router).
    if (hasRouter && agents.length > 1) {
      for (let i = 0; i < agents.length - 1; i++) {
        const a = patternAgentVueNodeId(p.id, agents[i])
        const b = patternAgentVueNodeId(p.id, agents[i + 1])
        if (cellSet.has(a) && cellSet.has(b)) {
          edges.push(
            baseEdge({
              id: `seq-sup-${p.id}-${i}`,
              source: a,
              target: b,
              sourceHandle: 'out',
              targetHandle: 'in-router',
              style: { stroke: '#94a3b8', strokeWidth: 1.5 }
            })
          )
        }
      }
    }

    maxBottom = Math.max(maxBottom, fy + frameH, routerBottomY)
    cursorX += frameW + COL_GAP
  })

  const outX = cursorX
  outputs.forEach((o, i) => {
    const id = cellKey('output_channel', o.id)
    pushNode({
      id,
      type: 'wfCard',
      position: { x: outX, y: topY + i * (TRIGGER_H + 16) },
      zIndex: 5,
      selectable: true,
      data: {
        role: 'output',
        title: String(o.channel_type || 'Output'),
        subtitle: o.is_primary ? 'primary' : 'channel'
      }
    })
  })

  /** Standalone node (not inside hub) so HITL uses normal canvas connectors. */
  if (hitl) {
    const hid = 'hitl:config'
    const hitlY = topY + hubH + 28
    pushNode({
      id: hid,
      type: 'wfCard',
      position: { x: M, y: hitlY },
      zIndex: 5,
      selectable: true,
      data: {
        role: 'hitl',
        title: 'Human-in-the-loop',
        subtitle: hitl.is_enabled
          ? `${hitl.contact_channel || 'contact'} · ${hitl.pause_on || ''}`
          : 'disabled',
        hitl
      }
    })
    edges.push(
      baseEdge({
        id: 'schema-hub-hitl',
        source: hubId,
        target: hid,
        sourceHandle: 'out',
        style: { stroke: '#64748b', strokeWidth: 2 },
        zIndex: 1
      })
    )
  }

  /** Resolved schema edges before merging duplicate source→target (e.g. router rule + fallback to same agent). */
  const pendingSchemaEdges = []

  connections.forEach((c) => {
    const st = mapType(c.source_type)
    const tt = mapType(c.target_type)
    const sid = cellKey(st, c.source_id)
    let tid = cellKey(tt, c.target_id)
    // Schema edges use target_type agent + agent_id; nodes are keyed by pattern_agent row id (or pattern:agent).
    if (tt === 'agent' && st === 'router' && c.source_id != null && c.target_id != null) {
      const scoped = agentNodeIdByPatternAndAgent.get(routerAgentEdgeKey(c.source_id, c.target_id))
      if (scoped) tid = scoped
    }
    if (!cellSet.has(sid) || !cellSet.has(tid)) return

    let stroke = '#64748b'
    let strokeDasharray = undefined
    if (c.edge_type === 'conditional') stroke = '#7c3aed'
    if (c.edge_type === 'fallback') {
      stroke = '#ea580c'
      strokeDasharray = '6 4'
    }

    // Pattern / router / agent handles use explicit ids (see WfPatternNode, WfRouterNode, WfCardNode).
    const handlePatch = {}
    if (String(sid).startsWith('pattern:')) handlePatch.sourceHandle = 'out'
    if (String(tid).startsWith('pattern:')) handlePatch.targetHandle = 'in'
    if (String(sid).startsWith('router:')) handlePatch.sourceHandle = 'out'
    if (String(tid).startsWith('router:')) handlePatch.targetHandle = 'in'
    if (String(sid).startsWith('agent:')) handlePatch.sourceHandle = 'out'
    if (String(tid).startsWith('agent:')) {
      handlePatch.targetHandle = st === 'router' ? 'in-router' : 'in'
    }

    pendingSchemaEdges.push({
      id: c.id || `conn-${sid}-${tid}`,
      sid,
      tid,
      label: c.label,
      edge_type: c.edge_type,
      stroke,
      strokeDasharray,
      handlePatch,
      st
    })
  })

  const edgeGroups = new Map()
  for (const p of pendingSchemaEdges) {
    const key = `${p.sid}|||${p.tid}`
    if (!edgeGroups.has(key)) edgeGroups.set(key, [])
    edgeGroups.get(key).push(p)
  }

  for (const [, group] of edgeGroups) {
    if (group.length === 1) {
      const p = group[0]
      edges.push(
        baseEdge({
          id: p.id,
          source: p.sid,
          target: p.tid,
          label: p.label != null && String(p.label).trim() ? String(p.label) : undefined,
          style: { stroke: p.stroke, strokeWidth: 2, strokeDasharray: p.strokeDasharray },
          labelStyle: { fill: '#475569', fontSize: 11, fontWeight: 500 },
          labelBgStyle: { fill: '#f8fafc', fillOpacity: 0.95 },
          labelBgPadding: [4, 6],
          zIndex: 1,
          ...p.handlePatch
        })
      )
      continue
    }

    /** Merge labels so router→same-agent conditional + fallback don’t draw two overlapping edge labels. */
    const ruleLabels = []
    let hasFallbackEdge = false
    for (const p of group) {
      if (p.edge_type === 'fallback') {
        hasFallbackEdge = true
        continue
      }
      if (p.label != null && String(p.label).trim()) {
        ruleLabels.push(String(p.label).trim())
      }
    }
    const uniqueRules = [...new Set(ruleLabels)]
    let mergedLabel = uniqueRules.join(' · ')
    if (hasFallbackEdge) {
      mergedLabel = mergedLabel ? `${mergedLabel} · Else (fallback)` : 'Else (fallback)'
    }

    const hasConditional = group.some((x) => x.edge_type === 'conditional')
    let stroke = '#64748b'
    let strokeDasharray = undefined
    if (hasFallbackEdge && !hasConditional) {
      stroke = '#ea580c'
      strokeDasharray = '6 4'
    } else if (hasConditional) {
      stroke = '#7c3aed'
    }

    const p0 = group[0]
    const mergedId = group.map((x) => x.id).join('+')
    edges.push(
      baseEdge({
        id: mergedId,
        source: p0.sid,
        target: p0.tid,
        label: mergedLabel || undefined,
        style: { stroke, strokeWidth: 2, strokeDasharray },
        labelStyle: { fill: '#475569', fontSize: 11, fontWeight: 500 },
        labelBgStyle: { fill: '#f8fafc', fillOpacity: 0.95 },
        labelBgPadding: [4, 6],
        zIndex: 1,
        ...p0.handlePatch
      })
    )
  }

  return {
    nodes,
    edges,
    meta: {
      workflowTitle: wf?.name || 'Workflow',
      metaLine: [
        meta.total_triggers != null ? `${meta.total_triggers} triggers` : null,
        meta.total_patterns != null ? `${meta.total_patterns} patterns` : null,
        meta.total_agents != null ? `${meta.total_agents} agents` : null,
        wf?.status ? `status: ${wf.status}` : null
      ]
        .filter(Boolean)
        .join(' · ')
    }
  }
}
