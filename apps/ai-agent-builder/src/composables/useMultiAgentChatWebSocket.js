import { useDashboardChatWebSocket } from './useDashboardChatWebSocket.js'

export function useMultiAgentChatWebSocket() {
  return useDashboardChatWebSocket('multi')
}
