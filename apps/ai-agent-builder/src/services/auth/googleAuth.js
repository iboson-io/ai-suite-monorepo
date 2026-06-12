import api from '../api.js'
import { API_ENDPOINTS } from '../constants.js'

export function getGoogleAuthUrl() {
  const baseUrl = (api.defaults.baseURL || '').replace(/\/+$/, '')
  const authType =
    typeof window !== 'undefined' && window.location.pathname.includes('signup')
      ? 'signup'
      : 'login'

  if (typeof window !== 'undefined') {
    sessionStorage.setItem('googleAuthType', authType)
  }

  return `${baseUrl}${API_ENDPOINTS.GOOGLE_AUTH}?auth_type=${authType}`
}
