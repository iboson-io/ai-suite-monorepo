import api, { TOKEN_KEY } from '../api.js'

export async function signOut() {
  try {
    await api.post('/api/logout')
  } catch (error) {
    console.error('Logout request failed:', error)
  } finally {
    localStorage.removeItem(TOKEN_KEY)
    window.location.href = '/signin'
  }
}
