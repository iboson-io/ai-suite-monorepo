import { MIN_AGENT_PROMPT_LENGTH } from './constants.js'

export function validateAgentName(name) {
  const trimmed = String(name ?? '').trim()

  if (!trimmed) {
    return { valid: false, message: 'Agent name is required.' }
  }

  if (trimmed.length > 100) {
    return { valid: false, message: 'Agent name cannot exceed 100 characters.' }
  }

  const pattern = /^[a-zA-Z0-9\s\-]+$/
  if (!pattern.test(trimmed)) {
    return { valid: false, message: 'Agent name can only contain letters, numbers, spaces and hyphens.' }
  }

  return { valid: true, message: '' }
}

export function validateAgentPromptOptional(prompt) {
  const trimmed = String(prompt ?? '').trim()

  if (!trimmed) {
    return { valid: true, message: '' }
  }

  if (trimmed.length < MIN_AGENT_PROMPT_LENGTH) {
    return {
      valid: false,
      message: 'Agent prompt must be at least 10 characters long.',
    }
  }

  if (trimmed.length > 5000) {
    return {
      valid: false,
      message: 'Agent prompt cannot exceed 5000 characters.',
    }
  }

  const pattern = /^[a-zA-Z0-9\s\-\.,']+$/
  if (!pattern.test(trimmed)) {
    return {
      valid: false,
      message: "Agent prompt can only contain letters, numbers, spaces, hyphens, commas, periods and single quotes.",
    }
  }

  return { valid: true, message: '' }
}

export function validateAgentPromptForEnhance(prompt) {
  const trimmed = String(prompt ?? '').trim()

  if (!trimmed) {
    return { valid: false, message: 'Add a description before improving with AI.' }
  }

  if (trimmed.length < MIN_AGENT_PROMPT_LENGTH) {
    return {
      valid: false,
      message: 'Agent prompt must be at least 10 characters long.',
    }
  }

  if (trimmed.length > 5000) {
    return {
      valid: false,
      message: 'Agent prompt cannot exceed 5000 characters.',
    }
  }

  const pattern = /^[a-zA-Z0-9\s\-\.,']+$/
  if (!pattern.test(trimmed)) {
    return {
      valid: false,
      message: "Agent prompt can only contain letters, numbers, spaces, hyphens, commas, periods and single quotes.",
    }
  }

  return { valid: true, message: '' }
}

export function validateAgentRoleOptional(role) {
  const trimmed = String(role ?? '').trim()

  if (!trimmed) {
    return { valid: true, message: '' }
  }

  if (trimmed.length > 50) {
    return {
      valid: false,
      message: 'Role cannot exceed 50 characters.',
    }
  }

  const pattern = /^[a-zA-Z0-9\s\-\.,']+$/
  if (!pattern.test(trimmed)) {
    return {
      valid: false,
      message: "Role can only contain letters, numbers, spaces, hyphens, commas, periods and single quotes.",
    }
  }

  return { valid: true, message: '' }
}

export function validateSingleRule(rule) {
  const trimmed = String(rule ?? '').trim()

  if (!trimmed) {
    return { valid: true, message: '' }
  }

  if (trimmed.length > 1000) {
    return {
      valid: false,
      message: 'Each rule cannot exceed 1000 characters.',
    }
  }

  const pattern = /^[a-zA-Z0-9\s\-\.,']+$/
  if (!pattern.test(trimmed)) {
    return {
      valid: false,
      message: "Each rule can only contain letters, numbers, spaces, hyphens, commas, periods and single quotes.",
    }
  }

  return { valid: true, message: '' }
}

export function validateAgentRulesOptional(rules) {
  const rulesArray = Array.isArray(rules) ? rules : []
  const cleanedRules = rulesArray.map((r) => String(r ?? '').trim()).filter(Boolean)

  if (cleanedRules.length === 0) {
    return { valid: true, message: '' }
  }

  if (cleanedRules.length > 100) {
    return {
      valid: false,
      message: 'Rules array cannot have more than 100 rules.',
    }
  }

  const pattern = /^[a-zA-Z0-9\s\-\.,']+$/
  for (let i = 0; i < cleanedRules.length; i++) {
    const rule = cleanedRules[i]
    if (rule.length > 1000) {
      return {
        valid: false,
        message: `Rule ${i + 1} cannot exceed 1000 characters.`,
        index: i,
      }
    }
    if (!pattern.test(rule)) {
      return {
        valid: false,
        message: `Rule ${i + 1} can only contain letters, numbers, spaces, hyphens, commas, periods and single quotes.`,
        index: i,
      }
    }
  }

  return { valid: true, message: '' }
}

export function validateApiBaseUrl(url, { required = true } = {}) {
  const trimmed = String(url ?? '').trim()

  if (!trimmed) {
    return required
      ? { valid: false, message: 'API Base URL is required.' }
      : { valid: true, message: '' }
  }

  if (trimmed.length > 255) {
    return { valid: false, message: 'Base URL cannot exceed 255 characters.' }
  }

  try {
    const parsed = new URL(trimmed)
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return { valid: false, message: 'Base URL must be a valid HTTP or HTTPS URL.' }
    }
    return { valid: true, message: '' }
  } catch {
    return { valid: false, message: 'Base URL must be a valid HTTP or HTTPS URL.' }
  }
}

export function validateDbConfig(dbConfig) {
  const errors = {}
  const config = dbConfig ?? {}

  if (!String(config.type ?? '').trim()) errors.type = 'Database type is required.'
  if (!String(config.host ?? '').trim()) errors.host = 'Host is required.'
  if (!String(config.port ?? '').trim()) errors.port = 'Port is required.'
  if (!String(config.database ?? '').trim()) errors.database = 'Database name is required.'
  if (!String(config.username ?? '').trim()) errors.username = 'Username is required.'
  if (!String(config.password ?? '').trim()) errors.password = 'Password is required.'

  return {
    valid: Object.keys(errors).length === 0,
    errors,
    message: Object.values(errors)[0] ?? '',
  }
}
