export function parseAuthError(error) {
  const data = error?.response?.data

  if (data?.errors?.email) {
    return data.errors.email
  }

  if (data?.errors?.password) {
    return data.errors.password
  }

  const msg = data?.message ?? data?.error ?? error?.message
  if (typeof msg === 'string' && msg.trim()) {
    return msg
  }

  return 'Something went wrong. Please try again.'
}

export function parseLoginError(error) {
  const message = parseAuthError(error)

  if (message === 'data and hash arguments required') {
    return 'Use Google login instead'
  }

  if (message === 'HTTP error! status: 400') {
    return 'Invalid email or password'
  }

  return message || 'Invalid email or password.'
}
