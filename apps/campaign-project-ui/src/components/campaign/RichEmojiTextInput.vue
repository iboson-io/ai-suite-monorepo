<template>
  <div class="rich-emoji-input relative min-w-0 w-full max-w-full flex-1">
    <div
      v-show="!hasText"
      class="pointer-events-none absolute left-3 right-3 top-1/2 z-0 -translate-y-1/2 select-none text-sm text-gray-400"
    >
      {{ placeholder }}
    </div>
    <div
      ref="editable"
      :aria-placeholder="placeholder"
      :aria-label="label || undefined"
      class="rich-emoji-input__ed relative z-[1] min-h-[2.75rem] w-full min-w-0 max-w-full rounded-md bg-transparent px-3 py-2.5 pr-3 text-left text-sm leading-normal text-[#1F1F1F] outline-none ring-0 [word-break:break-word] focus:ring-0"
      :tabindex="0"
      contenteditable
      role="textbox"
      @input="onInput"
      @paste="onPaste"
      @keydown="onKeydown"
    />
  </div>
</template>

<script setup>
import { ref, watch, onMounted, nextTick, computed } from 'vue'
import { isFromFlagsCategory } from './emojiPickerData'
import { twemoji72PngUrl } from '../../utils/twemojiUrl.js'

const props = defineProps({
  modelValue: { type: String, default: '' },
  placeholder: { type: String, default: '' },
  label: { type: String, default: '' }
})

const emit = defineEmits(['update:modelValue', 'input'])

const editable = ref(/** @type {HTMLElement | null} */ (null))

const hasText = computed(() => Boolean(props.modelValue && props.modelValue.length > 0))

let isRendering = false

const segmenter =
  typeof Intl !== 'undefined' && typeof Intl.Segmenter !== 'undefined'
    ? new Intl.Segmenter(undefined, { granularity: 'grapheme' })
    : null

/**
 * @param {string} s
 */
function escapeHtml(s) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

/**
 * @param {string} s
 * @returns {string}
 */
function toDisplayHtml(s) {
  if (!s) return ''
  const segs = []
  if (segmenter) {
    for (const { segment } of segmenter.segment(s)) {
      if (segment) segs.push(segment)
    }
  } else if (isFromFlagsCategory(s)) {
    segs.push(s)
  } else {
    return escapeHtml(s)
  }
  let out = ''
  for (const seg of segs) {
    if (!seg) continue
    if (isFromFlagsCategory(seg)) {
      const enc = encodeURIComponent(seg)
      out += `<img class="align-[-0.2em] mx-px inline-block h-[1.1em] w-[1.1em] max-h-[1.1em] max-w-[1.1em] object-contain object-center select-none" contenteditable="false" draggable="false" alt="" src="${twemoji72PngUrl(seg)}" data-emoji="${enc}"/>`
    } else {
      out += escapeHtml(seg)
    }
  }
  return out
}

/**
 * @param {HTMLElement} el
 * @returns {string}
 */
function getPlainFromEditable(el) {
  let s = ''
  for (const node of el.childNodes) {
    if (node.nodeType === Node.TEXT_NODE) {
      s += node.textContent || ''
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const eln = /** @type {Element} */ (node)
      const t = eln.tagName
      if (t === 'IMG' && eln.getAttribute('data-emoji') != null) {
        s += decodeURIComponent(String(eln.getAttribute('data-emoji')))
      } else if (t === 'BR') {
        s += ' '
      } else {
        s += eln.textContent || ''
      }
    }
  }
  return s
}

/**
 * @param {string} s
 * @param {object} [opts]
 * @param {boolean} [opts.moveToEnd]
 */
function renderFromString(s, opts) {
  const el = editable.value
  if (!el) return
  const v = s ?? ''
  isRendering = true
  const html = toDisplayHtml(v)
  if (el.innerHTML !== html) {
    el.innerHTML = html
  }
  isRendering = false
  if (opts?.moveToEnd) {
    nextTick(() => {
      const t = editable.value
      if (!t) return
      const r = document.createRange()
      r.selectNodeContents(t)
      r.collapse(false)
      const sel = window.getSelection()
      if (sel) {
        sel.removeAllRanges()
        sel.addRange(r)
      }
    })
  }
}

function onInput() {
  if (isRendering) return
  const t = /** @type {HTMLElement} */ (editable.value)
  if (!t) return
  const v = getPlainFromEditable(t)
  emit('update:modelValue', v)
  emit('input', { target: { value: v } })
}

/**
 * @param {KeyboardEvent} e
 */
function onKeydown(e) {
  if (e.key === 'Enter') e.preventDefault()
}

/**
 * @param {ClipboardEvent} e
 */
function onPaste(e) {
  e.preventDefault()
  const raw = e.clipboardData?.getData('text/plain') ?? ''
  const text = raw.replace(/[\r\n]+/g, ' ').replace(/\0/g, '')
  if (typeof document.queryCommandSupported === 'function' && document.queryCommandSupported('insertText')) {
    document.execCommand('insertText', false, text)
  } else {
    const next = (props.modelValue || '') + text
    renderFromString(next, { moveToEnd: true })
    emit('update:modelValue', next)
  }
}

function syncViewFromModel() {
  const t = /** @type {HTMLElement} */ (editable.value)
  if (!t) return
  const m = props.modelValue ?? ''
  if (m === getPlainFromEditable(t)) return
  const hadFocus = document.activeElement === t
  renderFromString(m, false)
  if (!hadFocus) {
    nextTick(() => {
      const e = editable.value
      if (!e) return
      const r = document.createRange()
      r.selectNodeContents(e)
      r.collapse(false)
      const sel = window.getSelection()
      if (sel) {
        sel.removeAllRanges()
        sel.addRange(r)
      }
    })
  } else {
    nextTick(() => {
      const e2 = editable.value
      if (e2) e2.focus()
    })
  }
}

watch(
  () => props.modelValue,
  () => {
    nextTick(syncViewFromModel)
  }
)

onMounted(() => {
  nextTick(() => {
    renderFromString(props.modelValue || '', false)
  })
})

defineExpose({
  /**
   * Focus the editable; useful after appending an emoji from the picker.
   */
  focus: () => {
    editable.value?.focus()
  }
})
</script>
