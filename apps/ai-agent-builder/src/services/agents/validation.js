import { MIN_AGENT_PROMPT_LENGTH } from './constants.js'

export function validateAgentName(name) {
  const trimmed = String(name ?? '').trim()

  if (!trimmed) {
    return { valid: false, message: 'Agent name is required.' }
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
      message: 'Prompt must be at least 10 characters long.',
    }
  }

  return { valid: true, message: '' }
}

export function validateApiBaseUrl(url) {
  const trimmed = String(url ?? '').trim()

  if (!trimmed) {
    return { valid: false, message: 'API Base URL is required.' }
  }

  try {
    const parsed = new URL(trimmed)
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return { valid: false, message: 'API base URL must start with http:// or https://' }
    }
    return { valid: true, message: '' }
  } catch {
    return { valid: false, message: 'Enter a valid API base URL.' }
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
