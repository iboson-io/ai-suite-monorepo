import { TOKEN_KEY, USER_KEY } from '../api.js'
import { apiService } from '../agentApi.js'

export { TOKEN_KEY, USER_KEY }

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function extractToken(payload) {
  if (!payload || typeof payload !== 'object') return ''

  return (
    payload.access_token ||
    payload.token ||
    payload.accessToken ||
    payload.jwt ||
    payload?.data?.access_token ||
    payload?.data?.token ||
    payload?.data?.accessToken ||
    ''
  )
}

function extractUser(payload) {
  if (!payload || typeof payload !== 'object') return null
  return payload.user || payload.userData || payload?.data?.user || null
}

function persistSession(token, user) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token)
    apiService.setAuthToken(token)
  }
  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user))
  }
}

/** Agent-lab: email format only before password step (no campaign check-account API). */
export function mapCheckAccountResponse(data) {
  return {
    success: Boolean(data?.status ?? data?.success),
    message: data?.message ?? data?.error ?? 'Unable to continue with this email.',
  }
}

export async function checkAccount(email) {
  const trimmed = String(email ?? '').trim()
  if (!trimmed) {
    return { success: false, message: 'Email is required' }
  }
  if (!emailRegex.test(trimmed)) {
    return { success: false, message: 'Please enter a valid email address' }
  }
  return { success: true }
}

export function mapLoginResponse(data) {
  const responseData = data?.data || data

  return {
    token: extractToken(responseData) || extractToken(data),
    redirectPath: '/home',
  }
}

/** Agent-lab login via agentApi (same as useAuth.login). */
export async function login({ email, password }) {
  const response = await apiService.login({ email, password })
  const responseData = response?.data || response
  const token = extractToken(responseData) || extractToken(response)
  const user = extractUser(responseData) || extractUser(response)

  persistSession(token, user)

  return mapLoginResponse(response)
}

export function normalizeAuthToken(tokenValue) {
  return String(tokenValue ?? '').replace(/^"+|"+$/g, '').trim()
}

export function saveAuthToken(token) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token)
    apiService.setAuthToken(token)
  }
}

export { parseLoginError } from './errors.js'
