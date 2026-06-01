import api from '../api.js'

export function mapRegisterToApi({ email, password, name }) {
  return {
    email: email.trim(),
    password,
    username: name.trim(),
    full_name: name.trim(),
  }
}

export async function register({ email, password, name }) {
  await api.post('/auth/register', mapRegisterToApi({ email, password, name }))
}

export function parseRegisterError(error) {
  return error?.response?.data?.message || 'Unable to create account. Please try again.'
}
