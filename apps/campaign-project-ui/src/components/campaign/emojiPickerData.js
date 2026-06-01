/**
 * Emoji picker data from `@emoji-mart/data` (Unicode 15, native skin strings).
 * No static emoji arrays — categories and search are derived at module load.
 */
import emojiMartData from '@emoji-mart/data'

/** @type {import('@emoji-mart/data').default} */
const data = emojiMartData

/**
 * @param {string} id Shortcode id, e.g. "grinning"
 * @returns {string | null}
 */
function nativeForId(id) {
  const e = data.emojis[id]
  const n = e?.skins?.[0]?.native
  return n || null
}

/**
 * Our UI tab ids → emoji-mart `categories[].id` in native.json
 * (order matches CATEGORY_ORDER except `recent`, which is client-only)
 */
const INTERNAL_TO_MART = {
  smileys: 'people',
  nature: 'nature',
  food: 'foods',
  travel: 'places',
  activities: 'activity',
  objects: 'objects',
  symbols: 'symbols',
  flags: 'flags'
}

export const CATEGORY_ORDER = [
  { id: 'recent', title: 'Recent' },
  { id: 'smileys', title: 'Smileys & People' },
  { id: 'nature', title: 'Animals & Nature' },
  { id: 'food', title: 'Food & Drink' },
  { id: 'travel', title: 'Travel & Places' },
  { id: 'activities', title: 'Activities' },
  { id: 'objects', title: 'Objects' },
  { id: 'symbols', title: 'Symbols' },
  { id: 'flags', title: 'Flags' }
]

/** @type {Record<string, string[]>} */
const EMOJIS_BY_CATEGORY_ID = {}

const martById = new Map(data.categories.map((c) => [c.id, c]))

for (const [internalId, martId] of Object.entries(INTERNAL_TO_MART)) {
  const cat = martById.get(martId)
  if (!cat?.emojis) {
    EMOJIS_BY_CATEGORY_ID[internalId] = []
    continue
  }
  const list = []
  for (const shortcode of cat.emojis) {
    const native = nativeForId(shortcode)
    if (native) list.push(native)
  }
  EMOJIS_BY_CATEGORY_ID[internalId] = list
}

export { EMOJIS_BY_CATEGORY_ID }

/** Natives in the flags category (country, subdivision, etc.); used to render with Twemoji on Windows. */
export const FLAG_NATIVE_SET = new Set(EMOJIS_BY_CATEGORY_ID.flags)

/**
 * True if this native string is from the Flags category in Emoji Mart
 * (including e.g. 🏴󠁧󠁢󠁥󠁮󠁧󠁿 — long sequences, not just two letter codes).
 * @param {string} native
 * @returns {boolean}
 */
export function isFromFlagsCategory(native) {
  return typeof native === 'string' && FLAG_NATIVE_SET.has(native)
}

/** Search index: one row per unique native, text = id + name + keywords (all lowercased at query time) */
function buildSearchable() {
  const rows = []
  const seen = new Set()
  for (const e of Object.values(data.emojis)) {
    const native = e.skins?.[0]?.native
    if (!native || seen.has(native)) continue
    seen.add(native)
    const idWords = (e.id || '')
      .replace(/_/g, ' ')
      .toLowerCase()
    const name = (e.name || '').toLowerCase()
    const kw = (e.keywords || []).map((k) => String(k).toLowerCase())
    const t = [idWords, name, ...kw].filter(Boolean).join(' ')
    rows.push({ c: native, t })
  }
  return rows
}

export const SEARCHABLE_EMOJIS = buildSearchable()

export function getGridEmojis(activeCategoryId, recent, search) {
  const q = (search || '').trim().toLowerCase()
  if (q) {
    const out = []
    const seen = new Set()
    for (const row of SEARCHABLE_EMOJIS) {
      if (row.t.includes(q) && !seen.has(row.c)) {
        seen.add(row.c)
        out.push(row.c)
      }
    }
    return out
  }
  if (activeCategoryId === 'recent') {
    return recent
  }
  return EMOJIS_BY_CATEGORY_ID[activeCategoryId] || []
}

export function getSectionTitle(activeCategoryId, search) {
  if ((search || '').trim()) {
    return 'Search results'
  }
  const row = CATEGORY_ORDER.find((c) => c.id === activeCategoryId)
  return row?.title || 'Emojis'
}
