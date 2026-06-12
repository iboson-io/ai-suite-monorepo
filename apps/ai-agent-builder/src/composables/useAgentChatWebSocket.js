import { useDashboardChatWebSocket } from './useDashboardChatWebSocket.js'

export function useAgentChatWebSocket() {
  return useDashboardChatWebSocket('single')
}
