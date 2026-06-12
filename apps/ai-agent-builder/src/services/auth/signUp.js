import { API_ENDPOINTS } from '../constants.js'
import { apiService } from '../agentApi.js'

export function mapRegisterToApi({ email, password, name }) {
  return {
    email: email.trim(),
    password,
    name: name.trim(),
  }
}

/** Agent-lab register via agentApi (same payload as agent-lab-dashboard Signup). */
export async function register({ email, password, name }) {
  await apiService.signup(mapRegisterToApi({ email, password, name }))
}

export function parseRegisterError(error) {
  return error?.message || 'Unable to create account. Please try again.'
}
