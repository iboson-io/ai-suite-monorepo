import { TOKEN_KEY } from '../api.js'

export { TOKEN_KEY }

export async function logoutCurrentSession() {
  // Session logout endpoint not wired for agent builder yet.
}

export async function logoutSession() {
  // Session logout endpoint not wired for agent builder yet.
}

export async function fetchSessions() {
  return []
}

export async function fetchAuthUser() {
  return { hasPasswordCreated: true }
}

export async function requestAccountDeletion() {
  throw new Error('Account deletion is not available yet.')
}

export async function deleteAccount() {
  throw new Error('Account deletion is not available yet.')
}

export async function logoutAllDevices() {
  // No-op until backend endpoint is available.
}

export async function resendDeletionCode() {
  throw new Error('Account deletion is not available yet.')
}
