<template>
  <Teleport to="body">
    <div
      v-show="open"
      class="fixed inset-0 z-[199] bg-transparent"
      aria-hidden="true"
      @click="$emit('close')"
    />
    <div
      v-show="open"
      class="emoji-picker-popover fixed z-[200] flex w-[min(calc(100vw-1rem),20rem)] flex-col overflow-hidden rounded-xl border border-gray-200 bg-white p-3 shadow-lg sm:min-w-[20rem] sm:max-w-[20rem]"
      :style="panelStyle"
      role="dialog"
      aria-label="Emoji picker"
      @click.stop
    >
      <div class="relative">
        <span
          class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          aria-hidden="true"
        >
          <svg
            class="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
          >
            <circle cx="11" cy="11" r="5.5" />
            <path stroke-linecap="round" d="M20 20l-3.2-3.2" />
          </svg>
        </span>
        <input
          v-model="search"
          type="search"
          autocomplete="off"
          class="w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-2 text-sm text-[#1F1F1F] outline-none ring-0 placeholder:text-gray-400 focus:border-blue-200 focus:ring-1 focus:ring-blue-100"
          placeholder="Search"
        />
      </div>

      <div
        v-show="!search.trim()"
        class="mt-3 -mx-0.5 flex min-h-[2.25rem] max-w-full justify-start gap-1 overflow-x-auto overflow-y-hidden pb-1 [scrollbar-width:thin]"
        role="tablist"
        aria-label="Emoji categories"
      >
        <button
          v-for="cat in categoryTabs"
          :key="cat.id"
          type="button"
          class="category-tab flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-gray-500 transition-colors"
          :class="
            activeCategoryId === cat.id
              ? 'ring-1 ring-blue-200 bg-blue-50 text-blue-600'
              : 'hover:bg-gray-50 hover:text-gray-700'
          "
          role="tab"
          :aria-selected="activeCategoryId === cat.id"
          :title="cat.title"
          @click="activeCategoryId = cat.id"
        >
          <span
            class="flex h-5 w-5 items-center justify-center [&>svg]:h-5 [&>svg]:w-5"
            v-html="cat.svg"
          />
        </button>
      </div>

      <p class="mb-1.5 mt-2.5 text-[0.7rem] font-semibold text-[#6B5B7A]">
        {{ sectionTitle }}
      </p>
      <div class="min-h-[12rem] max-h-[12rem] overflow-y-auto pr-0.5 [scrollbar-width:thin]">
        <div
          v-if="gridEmojis.length === 0"
          class="flex h-32 items-center justify-center text-center text-sm text-gray-400"
        >
          <template v-if="activeCategoryId === 'recent' && !search.trim()">
            No recent emojis yet. Pick a category to start.
          </template>
          <template v-else> No emojis found. </template>
        </div>
        <div
          v-else
          class="grid grid-cols-8 gap-0.5"
          role="listbox"
        >
          <button
            v-for="(char, i) in gridEmojis"
            :key="char + '-' + i"
            type="button"
            class="flex h-9 w-full min-w-0 max-w-full items-center justify-center rounded p-0 text-center text-lg leading-none transition-colors hover:bg-gray-100"
            :aria-label="`Insert ${char}`"
            @click="onPick(char)"
          >
            <img
              v-if="isFromFlagsCategory(char) && !twemojiFailed.has(char)"
              :src="twemoji72PngUrl(char)"
              :alt="char"
              class="h-5 w-5 object-contain select-none"
              loading="lazy"
              decoding="async"
              draggable="false"
              @error="onTwemojiImgError(char)"
            />
            <span v-else class="text-[1.1rem] leading-none">{{ char }}</span>
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch, onUnmounted } from 'vue'
import {
  CATEGORY_ORDER,
  getGridEmojis,
  getSectionTitle,
  isFromFlagsCategory
} from './emojiPickerData.js'
import { twemoji72PngUrl } from '../../utils/twemojiUrl.js'

const RECENT_KEY = 'email-campaign-emoji-recent'
const MAX_RECENT = 32

const props = defineProps({
  open: { type: Boolean, default: false },
  top: { type: Number, default: 0 },
  left: { type: Number, default: 0 }
})

const emit = defineEmits(['close', 'pick'])

const search = ref('')
const activeCategoryId = ref('smileys')
const recent = ref([])

/** @type {import('vue').Ref<Set<string>>} */
const twemojiFailed = ref(new Set())

function onTwemojiImgError(char) {
  const next = new Set(twemojiFailed.value)
  next.add(char)
  twemojiFailed.value = next
}

function loadRecent() {
  try {
    const raw = localStorage.getItem(RECENT_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      recent.value = Array.isArray(parsed) ? parsed.filter((c) => typeof c === 'string') : []
    }
  } catch {
    recent.value = []
  }
}

function saveRecent() {
  try {
    localStorage.setItem(RECENT_KEY, JSON.stringify(recent.value.slice(0, MAX_RECENT)))
  } catch {
    // ignore
  }
}

function pushRecent(char) {
  const next = [char, ...recent.value.filter((c) => c !== char)]
  recent.value = next.slice(0, MAX_RECENT)
  saveRecent()
}

const categoryTabs = computed(() =>
  CATEGORY_ORDER.map((c) => ({
    id: c.id,
    title: c.title,
    svg: categoryIconSvg(c.id)
  }))
)

const sectionTitle = computed(() => getSectionTitle(activeCategoryId.value, search.value))

const gridEmojis = computed(() =>
  getGridEmojis(activeCategoryId.value, recent.value, search.value)
)

let escHandler = null

watch(
  () => props.open,
  (v) => {
    if (v) {
      loadRecent()
      search.value = ''
      activeCategoryId.value = 'smileys'
      twemojiFailed.value = new Set()
      escHandler = (e) => {
        if (e.key === 'Escape') {
          e.preventDefault()
          emit('close')
        }
      }
      document.addEventListener('keydown', escHandler)
    } else {
      if (escHandler) {
        document.removeEventListener('keydown', escHandler)
        escHandler = null
      }
    }
  }
)

onUnmounted(() => {
  if (escHandler) {
    document.removeEventListener('keydown', escHandler)
  }
})

const panelStyle = computed(() => ({
  top: `${props.top}px`,
  left: `${props.left}px`
}))

function onPick(char) {
  pushRecent(char)
  emit('pick', char)
}

function categoryIconSvg(id) {
  const icons = {
    recent:
      '<circle cx="12" cy="12" r="8.5" />'
      + '<path d="M12 7.5V12l2.5 1.2" />',
    smileys:
      '<circle cx="12" cy="12" r="8.5" />'
      + '<path d="M8.5 14.5C9.5 16.2 14.5 16.2 15.5 14.5" />'
      + '<circle cx="8.5" cy="9.5" r="0.45" fill="currentColor" stroke="none" />'
      + '<circle cx="15.5" cy="9.5" r="0.45" fill="currentColor" stroke="none" />',
    nature:
      '<path d="M12 2C8 5.5 6.5 8.5 6.5 12.5c0 3.5 2.2 5.2 5.5 5.2s5.5-1.7 5.5-5.2C17.5 8.5 16 5.5 12 2Z" />'
      + '<line x1="12" y1="10" x2="12" y2="18" />',
    food:
      '<line x1="4" y1="9" x2="20" y2="9" />'
      + '<line x1="4" y1="12" x2="20" y2="12" />'
      + '<line x1="4" y1="15" x2="20" y2="15" />'
      + '<path d="M5.5 9V7.5A1.5 1.5 0 0 1 7 6h10a1.5 1.5 0 0 1 1.5 1.5V9" />',
    travel:
      '<rect x="3.5" y="6.5" width="17" height="6.5" rx="0.2" />'
      + '<line x1="2" y1="16" x2="22" y2="16" />'
      + '<circle cx="6" cy="16" r="1" fill="currentColor" stroke="none" />'
      + '<circle cx="18" cy="16" r="1" fill="currentColor" stroke="none" />',
    activities:
      '<circle cx="12" cy="12" r="5" />'
      + '<path d="M6.5 9.2a3 3 0 0 0 0 4.1" />'
      + '<path d="M17.5 14.8a3 3 0 0 0 0-4.1" />',
    objects:
      '<path d="M4 5.5L6 3.5L9 2h4l2 1.5L20 5.5" />'
      + '<rect x="4" y="5" width="16" height="11" rx="0.1" />'
      + '<line x1="4" y1="9" x2="20" y2="9" />',
    symbols:
      '<line x1="7" y1="3" x2="7" y2="15" />'
      + '<path d="M7 3h3.5a1.5 1.5 0 0 1 0 2.2L7 6" />'
      + '<ellipse cx="3" cy="16" rx="2" ry="0.7" fill="currentColor" stroke="none" transform="rotate(-18 3 16)" />',
    flags:
      '<line x1="4" y1="4" x2="4" y2="21" />'
      + '<path d="M4.5 4.5C8 2.2 12 1.2 20 2.2v1.1c-4 .8-6 0-7.2-.1H4.2v-1" />',
  }
  const inner = icons[id] || '<circle cx="12" cy="12" r="3" />'
  return `<svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${inner}</svg>`
}
</script>
