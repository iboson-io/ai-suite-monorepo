import api from '../api.js'

export function mapChatSession(raw) {
  if (raw == null) return null
  return {
    id: raw.id ?? raw._id,
    title: raw.title ?? 'Untitled Chat',
    updatedAt: raw.updatedAt ?? raw.updated_at,
    createdAt: raw.createdAt ?? raw.created_at,
    lastActive: raw.lastActive ?? raw.last_active_at,
  }
}

function extractSessionList(data) {
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.sessions)) return data.sessions
  if (Array.isArray(data?.data?.sessions)) return data.data.sessions
  if (Array.isArray(data?.data)) return data.data
  return []
}

export function getSessionActivityMs(session) {
  const raw =
    session?.updatedAt ??
    session?.updated_at ??
    session?.lastActive ??
    session?.last_active_at ??
    session?.createdAt ??
    session?.created_at ??
    0
  const t = new Date(raw).getTime()
  return Number.isFinite(t) ? t : 0
}

export async function fetchChatSessions() {
  const { data } = await api.get('/api/ai/sessions')
  return extractSessionList(data)
    .map(mapChatSession)
    .filter(Boolean)
    .sort((a, b) => getSessionActivityMs(b) - getSessionActivityMs(a))
}

export async function renameChatSession(sessionId, title) {
  await api.patch(`/api/ai/sessions/${sessionId}`, { title })
}

export async function deleteChatSession(sessionId) {
  await api.delete(`/api/ai/history/${encodeURIComponent(String(sessionId))}`)
}

export function mapSidebarUser(data) {
  const user = data?.data?.user ?? data?.user ?? null
  if (!user || typeof user !== 'object') {
    return { displayName: '', email: '', avatarUrl: '' }
  }

  const email = user.email != null ? String(user.email).trim() : ''
  const fullName = user.fullName != null ? String(user.fullName).trim() : ''
  const username = user.username != null ? String(user.username).trim() : ''
  const displayName = username || fullName
  const pic = user.profilePictureUrl != null ? String(user.profilePictureUrl).trim() : ''

  return { displayName, email, avatarUrl: pic }
}

export function sidebarFallbackAvatar(seed) {
  const label = (seed && String(seed).trim()) || 'User'
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(label)}&background=7950F2&color=fff&size=96`
}

export async function fetchSidebarUser() {
  const { data } = await api.get('/auth/me')
  const mapped = mapSidebarUser(data)
  const seed = mapped.displayName || mapped.email
  return {
    ...mapped,
    avatarUrl: mapped.avatarUrl || sidebarFallbackAvatar(seed),
  }
}
