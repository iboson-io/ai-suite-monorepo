import api, { TOKEN_KEY } from '../api.js'

export { TOKEN_KEY }

function mapSession(raw) {
  if (!raw || typeof raw !== 'object') return null

  const id = raw.id != null ? String(raw.id).trim() : ''
  if (!id) return null

  return {
    id,
    browser: raw.browser != null && String(raw.browser).trim() !== ''
      ? String(raw.browser).trim()
      : 'Unknown browser',
    os: raw.os != null && String(raw.os).trim() !== ''
      ? String(raw.os).trim()
      : 'Unknown device',
    lastUsedAt: raw.lastUsedAt ?? raw.last_used_at ?? null,
    createdAt: raw.createdAt ?? raw.created_at ?? null,
    isCurrent: raw.isCurrent === true || raw.is_current === true,
  }
}

export async function logoutCurrentSession() {
  await api.post('/api/logout')
}

export async function logoutSession(sessionId) {
  await api.delete(`/auth/sessions/${sessionId}`)
}

export async function fetchSessions() {
  const { data } = await api.get('/auth/sessions')
  const list =
    (data?.status && Array.isArray(data.data?.sessions) && data.data.sessions) ||
    (Array.isArray(data?.sessions) && data.sessions) ||
    (Array.isArray(data?.data) && data.data) ||
    []

  return list.map(mapSession).filter(Boolean)
}

export async function fetchAuthUser() {
  const response = await api.get('/auth/me')
  const user = response.data?.data?.user ?? response.data?.user ?? null

  return {
    hasPasswordCreated: Boolean(
      user?.passwordExist ??
      user?.password_exist ??
      user?.hasPassword ??
      user?.has_password
    ),
  }
}

export async function requestAccountDeletion() {
  await api.post('/auth/account/request-delete')
}

export async function deleteAccount(code) {
  await api.delete('/auth/account', { data: { code } })
}

export async function logoutAllDevices() {
  await api.post('/auth/logout-all-devices')
}

export async function resendDeletionCode(endpoint) {
  await api.post(endpoint)
}
