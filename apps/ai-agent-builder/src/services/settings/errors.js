export function parseSettingsError(error) {
  const data = error?.response?.data

  if (data == null) {
    return error?.message || 'Something went wrong. Please try again.'
  }

  if (typeof data === 'string') return data

  if (data.message != null) {
    const message = data.message
    return Array.isArray(message) ? message.join(', ') : String(message)
  }

  if (data.error != null) {
    return typeof data.error === 'string' ? data.error : JSON.stringify(data.error)
  }

  return 'Something went wrong. Please try again.'
}
