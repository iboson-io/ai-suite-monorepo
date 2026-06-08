import { apiService } from '../agentApi.js'

function extractChatList(response) {
  if (Array.isArray(response)) return response
  if (response?.status === true && Array.isArray(response?.data?.chats)) {
    return response.data.chats
  }
  if (Array.isArray(response?.data?.data?.chats)) return response.data.data.chats
  if (Array.isArray(response?.data?.chats)) return response.data.chats
  if (Array.isArray(response?.data)) return response.data
  if (Array.isArray(response?.chats)) return response.chats
  return []
}

function extractPagination(response, page, limit, itemCount) {
  const pagination =
    response?.data?.data?.pagination ??
    response?.data?.pagination ??
    response?.pagination

  if (pagination) {
    return {
      currentPage: pagination.current_page ?? page,
      totalPages: pagination.total_pages ?? 1,
      totalItems: pagination.total_items ?? itemCount,
      itemsPerPage: pagination.items_per_page ?? limit,
      hasNext: Boolean(pagination.has_next),
      hasPrev: Boolean(pagination.has_prev),
    }
  }

  const total =
    response?.total ??
    response?.meta?.total ??
    response?.data?.total ??
    itemCount

  const totalPages = Math.max(1, Math.ceil(Number(total) / limit))

  return {
    currentPage: page,
    totalPages,
    totalItems: Number(total),
    itemsPerPage: limit,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  }
}

export function extractChatFromCreateResponse(response) {
  const chat =
    response?.data?.data?.chat ??
    response?.data?.chat ??
    response?.chat ??
    (response?.data?.id ? response.data : null) ??
    (response?.id ? response : null)

  const id = chat?.id ?? chat?.chat_id
  if (!id) return null

  return {
    id,
    name: chat.name || 'New Chat',
    created_at: chat.created_at || new Date().toISOString(),
    updated_at: chat.updated_at || new Date().toISOString(),
    status: chat.status || 'active',
    agent_id: chat.agent_id,
    user_id: chat.user_id,
  }
}

export async function fetchAgentChats(agentId, page = 1, limit = 50) {
  const response = await apiService.getChats(agentId, page, limit)
  const chats = extractChatList(response)

  return {
    chats,
    pagination: extractPagination(response, page, limit, chats.length),
  }
}

export async function deleteAgentChat(chatId) {
  return apiService.deleteChat(chatId)
}

export async function renameAgentChat(chatId, name) {
  return apiService.updateChat(chatId, { name })
}

export async function createAgentChat(agentId, chatName = 'New Chat') {
  return apiService.createChat(agentId, chatName)
}

export async function fetchChatHistory(chatId) {
  return apiService.getChatHistory(chatId)
}
