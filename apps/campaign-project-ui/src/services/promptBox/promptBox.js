import api from '../api.js'

export function getPromptBoxConfig() {
  return {
    allProductsLabel: 'All products',
  }
}

/** Map raw API product to `{ id, name }`. */
export function mapProduct(raw) {
  if (raw == null) return null
  if (typeof raw === 'string') return { id: raw, name: raw }

  const id = raw._id ?? raw.id ?? null
  const name = raw.name ?? raw.title ?? String(id ?? '')

  if (id == null && !name) return null
  return { id, name: name || String(id) }
}

/** Map raw API model to `{ id, name, isDefault }`. */
export function mapModel(raw) {
  if (raw == null) return null
  if (typeof raw === 'string') {
    const id = raw.trim()
    return id ? { id, name: id, isDefault: false } : null
  }

  const id = raw.id != null ? String(raw.id).trim() : (raw.name != null ? String(raw.name).trim() : '')
  const name = raw.name != null ? String(raw.name).trim() : id
  if (!id) return null

  return {
    id,
    name: name || id,
    isDefault: Boolean(raw.isDefault ?? raw.is_default),
  }
}

function extractProductList(data) {
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.products)) return data.products
  if (Array.isArray(data?.data?.products)) return data.data.products
  if (Array.isArray(data?.data)) return data.data
  return []
}

function extractModelList(data) {
  if (Array.isArray(data?.models)) return data.models
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.data?.models)) return data.data.models
  if (Array.isArray(data?.data)) return data.data
  return []
}

export async function fetchProducts() {
  const { data } = await api.get('/api/products')
  return extractProductList(data).map(mapProduct).filter(Boolean)
}

export async function fetchModels() {
  const { data } = await api.get('/api/ai/models')
  return extractModelList(data).map(mapModel).filter(Boolean)
}
