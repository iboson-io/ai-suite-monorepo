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

  if (Array.isArray(data.errors)) {
    const parts = data.errors.map((item) =>
      typeof item === 'string' ? item : item?.message || item?.msg || String(item)
    )
    const message = parts.filter(Boolean).join(' ')
    if (message) return message
  }

  if (data.errors && typeof data.errors === 'object' && !Array.isArray(data.errors)) {
    const parts = Object.entries(data.errors).flatMap(([key, value]) =>
      Array.isArray(value) ? value.map((item) => `${key}: ${item}`) : [`${key}: ${value}`]
    )
    if (parts.length) return parts.join(' ')
  }

  return 'Something went wrong. Please try again.'
}
