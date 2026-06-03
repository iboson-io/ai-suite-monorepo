/**
 * Normalizes API validation payloads: values may be strings or string arrays (e.g. Laravel).
 */
export function flattenWorkflowValidationErrors(errors) {
  if (!errors || typeof errors !== 'object') return {}
  const out = {}
  for (const [k, v] of Object.entries(errors)) {
    if (v == null) continue
    out[k] = Array.isArray(v) ? String(v[0] ?? '') : String(v)
  }
  return out
}

/** First non-empty message for any of the given keys (API may use dotted paths). */
export function firstErrorForKeys(errors, keys) {
  const flat = flattenWorkflowValidationErrors(errors)
  for (const key of keys) {
    if (flat[key]) return flat[key]
  }
  return ''
}

/**
 * Human-readable summary for toasts (all fields).
 */
export function formatWorkflowValidationToast(errors) {
  const flat = flattenWorkflowValidationErrors(errors)
  const parts = Object.values(flat).map((s) => s.trim()).filter(Boolean)
  return parts.length ? parts.join(' · ') : 'Validation failed'
}
