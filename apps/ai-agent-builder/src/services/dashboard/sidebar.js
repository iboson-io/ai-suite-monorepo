import { apiService } from '../agentApi.js'
import { API_ENDPOINTS } from '../constants.js'

export function mapChatSession(raw) {
  if (raw == null) return null
  return {
    id: raw.id ?? raw._id ?? raw.chat_id,
    title: raw.name ?? raw.title ?? 'Untitled Chat',
    updatedAt: raw.updatedAt ?? raw.updated_at,
    createdAt: raw.createdAt ?? raw.created_at,
    lastActive: raw.lastActive ?? raw.last_active_at,
  }
}

function extractSessionList(data) {
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.chats)) return data.chats
  if (Array.isArray(data?.data?.chats)) return data.data.chats
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

export async function fetchChatSessions(page = 1, limit = 50) {
  const queryParams = new URLSearchParams({ page: String(page), limit: String(limit) })
  const data = await apiService.requestChatList(`${API_ENDPOINTS.GET_CHATS}?${queryParams}`, {
    method: 'GET',
  })
  
  const rawList = extractSessionList(data);
  const chats = rawList
    .map(mapChatSession)
    .filter(Boolean)
    .sort((a, b) => getSessionActivityMs(b) - getSessionActivityMs(a));

  return {
    chats,
    pagination: data?.data?.pagination || data?.pagination || null
  };
}

export async function renameChatSession(sessionId, title) {
  await apiService.updateChat(sessionId, { name: title })
}

export async function deleteChatSession(sessionId) {
  await apiService.deleteChat(sessionId)
}

export function mapSidebarUser(data) {
  const user = data?.data?.user ?? data?.user ?? data?.data ?? data ?? null
  if (!user || typeof user !== 'object') {
    return { displayName: '', email: '', avatarUrl: '' }
  }

  const email = user.email != null ? String(user.email).trim() : ''
  const fullName = user.fullName ?? user.full_name ?? user.username ?? user.name ?? ''
  const displayName = String(fullName).trim()
  const pic =
    user.profilePictureUrl ??
    user.profile_picture_url ??
    user.avatar ??
    user.profile_picture ??
    ''

  return {
    displayName,
    email,
    avatarUrl: pic != null ? String(pic).trim() : '',
  }
}

export function sidebarFallbackAvatar(seed) {
  const label = (seed && String(seed).trim()) || 'User'
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(label)}&background=7950F2&color=fff&size=96`
}

export async function fetchSidebarUser() {
  const data = await apiService.getProfile()
  const mapped = mapSidebarUser(data)
  const seed = mapped.displayName || mapped.email
  return {
    ...mapped,
    avatarUrl: mapped.avatarUrl || sidebarFallbackAvatar(seed),
  }
}
