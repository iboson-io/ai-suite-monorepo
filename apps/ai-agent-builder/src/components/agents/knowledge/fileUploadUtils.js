export function formatFileSize(bytes) {
  if (!bytes || bytes === 0) return '0 KB'
  const kb = bytes / 1024
  if (kb < 1024) {
    return `${Math.round(kb)} KB`
  }
  const mb = kb / 1024
  return `${mb.toFixed(2)} MB`
}

export function formatFileDateTime(date) {
  const value = date instanceof Date ? date : new Date(date)
  if (Number.isNaN(value.getTime())) return ''

  const formattedDate = value.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
  const time = value
    .toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
    .replace(/\s/g, '')

  return `${formattedDate}, ${time}`
}
