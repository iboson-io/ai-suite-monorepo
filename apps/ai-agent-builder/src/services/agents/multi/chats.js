import { apiService } from '../../agentApi.js'
import { extractChatFromCreateResponse } from '../chats.js'

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

export async function fetchGroupChats(groupId, page = 1, limit = 50) {
  const response = await apiService.getGroupChats(groupId, page, limit)
  const chats = extractChatList(response)

  return {
    chats,
    pagination: extractPagination(response, page, limit, chats.length),
  }
}

export async function createGroupChat(groupId, chatName = 'New Chat') {
  const response = await apiService.createMultiAgentChat(groupId, chatName)
  return extractChatFromCreateResponse(response) ?? response
}

export async function deleteGroupChat(chatId) {
  return apiService.deleteMultiAgentChat(chatId)
}

export async function renameGroupChat(chatId, name) {
  return apiService.updateChat(chatId, { name })
}
