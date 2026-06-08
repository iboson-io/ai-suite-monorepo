import { onUnmounted, ref } from 'vue'
import { CHAT_AI_API_URL_WS } from '../services/constants.js'
import { TOKEN_KEY } from '../services/api.js'

export function useDashboardChatWebSocket(mode = 'single') {
  const websocket = ref(null)
  const isConnected = ref(false)
  const isReconnecting = ref(false)

  let onMessageHandler = null
  let reconnectTimeout = null

  function setOnMessage(handler) {
    onMessageHandler = handler
  }

  function buildWsUrl(scopeId, chatId) {
    const token = localStorage.getItem(TOKEN_KEY)
    if (!token) {
      throw new Error('No auth token found')
    }

    const baseWsUrl = CHAT_AI_API_URL_WS
    const path =
      mode === 'multi' ? `${baseWsUrl}/${scopeId}` : `${baseWsUrl}/agent/${scopeId}`

    if (chatId) {
      return `${path}?chat_id=${chatId}&token=${token}`
    }

    return `${path}?token=${token}`
  }

  function disconnect() {
    if (reconnectTimeout) {
      clearTimeout(reconnectTimeout)
      reconnectTimeout = null
    }

    if (websocket.value) {
      websocket.value.onclose = null
      websocket.value.close(1000, 'Disconnecting')
      websocket.value = null
    }

    isConnected.value = false
    isReconnecting.value = false
  }

  function connect(scopeId, chatId = null) {
    if (!scopeId) return

    if (reconnectTimeout) {
      clearTimeout(reconnectTimeout)
      reconnectTimeout = null
    }

    if (websocket.value) {
      websocket.value.onclose = null
      websocket.value.close()
      websocket.value = null
    }

    isReconnecting.value = true

    try {
      const wsUrl = buildWsUrl(scopeId, chatId)
      websocket.value = new WebSocket(wsUrl)

      websocket.value.onopen = () => {
        isConnected.value = true
        isReconnecting.value = false
      }

      websocket.value.onmessage = (event) => {
        if (!onMessageHandler) return

        try {
          const data = JSON.parse(event.data)
          onMessageHandler(data)
        } catch {
          onMessageHandler({ type: 'raw', content: event.data })
        }
      }

      websocket.value.onerror = () => {
        isReconnecting.value = false
      }

      websocket.value.onclose = () => {
        isConnected.value = false
        isReconnecting.value = false
        websocket.value = null
      }
    } catch {
      isReconnecting.value = false
    }
  }

  async function reconnect(scopeId, chatId) {
    disconnect()
    await new Promise((resolve) => setTimeout(resolve, 300))
    connect(scopeId, chatId)

    return new Promise((resolve, reject) => {
      const maxWaitTime = 10000
      const startTime = Date.now()

      const checkConnection = setInterval(() => {
        if (websocket.value?.readyState === WebSocket.OPEN && isConnected.value) {
          clearInterval(checkConnection)
          resolve()
        } else if (Date.now() - startTime > maxWaitTime) {
          clearInterval(checkConnection)
          reject(new Error('WebSocket connection timeout'))
        }
      }, 100)
    })
  }

  async function ensureConnected(scopeId, chatId) {
    if (websocket.value?.readyState === WebSocket.OPEN && isConnected.value) {
      return
    }

    await reconnect(scopeId, chatId)
  }

  function send(message) {
    if (!websocket.value || websocket.value.readyState !== WebSocket.OPEN) {
      throw new Error('WebSocket is not connected')
    }

    websocket.value.send(message)
  }

  onUnmounted(() => {
    disconnect()
  })

  return {
    isConnected,
    isReconnecting,
    connect,
    disconnect,
    reconnect,
    ensureConnected,
    send,
    setOnMessage,
  }
}
