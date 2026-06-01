import api, { TOKEN_KEY } from '../api.js'

export { TOKEN_KEY }

export function mapCheckAccountResponse(data) {
  return {
    success: Boolean(data?.status ?? data?.success),
    message: data?.message ?? data?.error ?? 'Unable to continue with this email.',
  }
}

export async function checkAccount(email) {
  const { data } = await api.post('/auth/check-account', { email })
  return mapCheckAccountResponse(data)
}

function extractToken(payload) {
  if (!payload || typeof payload !== 'object') return ''

  return (
    payload.access_token ||
    payload.token ||
    payload.jwt ||
    payload?.data?.access_token ||
    payload?.data?.token ||
    ''
  )
}

export function mapLoginResponse(data) {
  return {
    token: extractToken(data),
    redirectPath: '/dashboard',
  }
}

export async function login({ email, password }) {
  const { data } = await api.post('/auth/login', { email, password })
  return mapLoginResponse(data)
}

export function normalizeAuthToken(tokenValue) {
  return String(tokenValue ?? '').replace(/^"+|"+$/g, '').trim()
}

export function saveAuthToken(token) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token)
  }
}

export function parseLoginError(error) {
  const data = error?.response?.data
  const msg = data?.detail ?? data?.message ?? data?.error ?? 'Invalid email or password.'
  return typeof msg === 'string' ? msg : 'Invalid password.'
}
