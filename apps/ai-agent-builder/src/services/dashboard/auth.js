import { TOKEN_KEY, USER_KEY } from '../api.js'
import { apiService } from '../agentApi.js'

export async function signOut() {
  try {
    await apiService.request('/api/auth/logout', { method: 'POST' })
  } catch (error) {
    console.error('Logout request failed:', error)
  } finally {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    apiService.clearAuthToken()
    window.location.href = '/signin'
  }
}
