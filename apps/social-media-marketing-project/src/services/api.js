import axios from "axios"

const TOKEN_KEY = "access_token"

/** Backend API origin — single source for axios `baseURL` and for consumers that read `api.defaults.baseURL` */
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

/** Default for most requests */
const DEFAULT_TIMEOUT_MS = 20000;

/**
 * Slow backend work (e.g. product create + site crawl).
 * Per-request `config.timeout` overrides this for specific calls.
 */
export const LONG_REQUEST_TIMEOUT_MS = 4 * 60 * 1000;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    'ngrok-skip-browser-warning': 'true',
  },
  timeout: DEFAULT_TIMEOUT_MS,
})

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(TOKEN_KEY)
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error("Authentication failed - Token expired or invalid")
      // Clear the invalid token
      localStorage.removeItem(TOKEN_KEY)
      // Redirect to login page
      window.location.href = "/signin"
    }
    return Promise.reject(error)
  }
)

export { TOKEN_KEY }
export default api
