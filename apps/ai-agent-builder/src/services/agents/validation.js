import { MIN_AGENT_PROMPT_LENGTH } from './constants.js'

export function validateAgentName(name) {
  const trimmed = String(name ?? '').trim()

  if (!trimmed) {
    return { valid: false, message: 'Agent name is required.' }
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
