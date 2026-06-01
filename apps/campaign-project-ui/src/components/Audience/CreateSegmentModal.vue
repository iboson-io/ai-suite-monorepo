<template>
  <Teleport to="body">
    <div
      v-if="modelValue"
      class="fixed inset-0 z-[110] flex items-center justify-center p-4"
      role="presentation"
    >
      <div
        class="absolute inset-0 bg-black-800/45 backdrop-blur-[2px]"
        aria-hidden="true"
        @click="onBackdropClick"
      />
      <div
        role="dialog"
        aria-modal="true"
        :aria-labelledby="step === 'create' ? 'create-segment-title' : 'review-segment-title'"
        class="relative z-[1] flex max-h-[min(92vh,780px)] w-full flex-col overflow-hidden rounded-2xl bg_secondary_color shadow-2xl primary_border_color transition-[max-width] duration-200"
        :class="step === 'review' ? 'max-w-[min(96vw,840px)]' : 'max-w-[640px]'"
        @click.stop
      >
        <!-- ========== CREATE STEP ========== -->
        <template v-if="step === 'create'">
          <div class="shrink-0 px-6xl pb-4xl pt-6xl">
            <h2 id="create-segment-title" class="heading_h6_semibold primary_text_color">
              Create a Segment
            </h2>
            <p class="label_1_medium primary_text_color mt-md leading-relaxed">
              Group contacts based on rules and behavior to personalize your campaigns.
            </p>
          </div>
          <div class="h-px w-full shrink-0 bg-[#E9EAEC]" />

          <div class="min-h-0 flex-1 overflow-y-auto px-6xl py-5xl">
            <label class="block">
              <span class="label_2_semibold primary_text_color">Segment name</span>
              <input
                v-model="segmentName"
                type="text"
                class="mt-md block w-full rounded-lg regular_border_color bg_secondary_color py-3xl pl-3xl pr-3xl label_2_medium primary_text_color outline-none transition-colors placeholder:text-gray-400 focus:border-[3px] focus:border-[#D9E2FC]"
                placeholder=""
              />
            </label>

            <div class="mt-6xl">
              <template v-for="(block, idx) in filterBlocks" :key="block.id">
                <div v-if="idx > 0" class="mt-5xl" role="group" aria-label="Combine with previous filter">
                  <div class="inline-flex rounded-lg bg-[#ECEEF1] p-1">
                    <button
                      type="button"
                      class="min-w-[3.5rem] rounded-md px-4 py-2 text-center transition-all label_2_semibold"
                      :class="
                        block.joinWithPrevious === 'and'
                          ? 'bg_secondary_color text-black-400 shadow-sm'
                          : 'text-gray-500 hover:text-black-400'
                      "
                      @click="block.joinWithPrevious = 'and'"
                    >
                      And
                    </button>
                    <button
                      type="button"
                      class="min-w-[3.5rem] rounded-md px-4 py-2 text-center transition-all label_2_semibold"
                      :class="
                        block.joinWithPrevious === 'or'
                          ? 'bg_secondary_color text-black-400 shadow-sm'
                          : 'text-gray-500 hover:text-black-400'
                      "
                      @click="block.joinWithPrevious = 'or'"
                    >
                      Or
                    </button>
                  </div>
                </div>

                <div :class="idx > 0 ? 'mt-5xl' : ''">
                  <span class="label_2_semibold primary_text_color">Segment Filters</span>
                  <div
                    class="mt-md flex flex-wrap items-stretch justify-between gap-md rounded-lg regular_border_color bg_secondary_color px-xl py-xxl"
                  >
                    <div class="flex items-center gap-sm">
                    <button
                      type="button"
                      class="product-select relative flex min-w-[7rem] flex items-center gap-sm rounded-lg border border-black-25 bg-info-50 py-xs pl-3xl pr-10xl text-left label_2_medium primary_text_color"
                    >
                      <span class="truncate">{{ labelForAttribute(block.attribute) }}</span>
                      <img
                        :src="DownArrow"
                        alt=""
                        class="pointer-events-none absolute right-3 top-1/2 h-3 w-3 -translate-y-1/2 opacity-70"
                      />
                    </button>
                    <button
                      type="button"
                      class="product-select relative flex min-w-[4.5rem] shrink-0 items-center gap-sm rounded-lg border border-black-25 bg-info-50 py-xs pl-3xl pr-10xl text-left label_2_medium primary_text_color"
                    >
                      <span class="truncate">{{ block.operator }}</span>
                      <img
                        :src="DownArrow"
                        alt=""
                        class="pointer-events-none absolute right-2.5 top-1/2 h-3 w-3 -translate-y-1/2 opacity-70"
                      />
                    </button>
                    <button
                      type="button"
                      class="product-select relative flex min-w-[6rem] flex items-center gap-sm rounded-lg border border-black-25 bg-info-50 py-xs pl-3xl pr-10xl text-left label_2_medium primary_text_color"
                    >
                      <span class="truncate">{{ labelForValue(block.value) }}</span>
                      <img
                        :src="DownArrow"
                        alt=""
                        class="pointer-events-none absolute right-3 top-1/2 h-3 w-3 -translate-y-1/2 opacity-70"
                      />
                    </button>
                    </div>
                    <button
                      type="button"
                      class="flex h-[2.75rem] w-[2.75rem] shrink-0 items-center justify-center self-center rounded-md text-gray-500 transition-colors hover:bg-info-50 hover:text-black-400"
                      :disabled="filterBlocks.length <= 1"
                      aria-label="Remove filter row"
                      @click="removeBlock(block.id)"
                    >
                      <img :src="CloseIcon" alt="" class="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </template>

              <button
                type="button"
                class="mt-5xl flex w-auto items-center justify-center gap-sm rounded-lg border border-black-25 bg_secondary_color py-xl px-xl transition-colors label_1_semibold primary_text_color hover:bg-info-50"
                @click="addFilterBlock"
              >
                <svg class="h-4 w-4 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                Add Filters
              </button>
            </div>
          </div>

          <div class="h-px w-full shrink-0 regular_border_color" />
          <div class="flex shrink-0 justify-end gap-md px-6xl py-5xl">
            <button
              type="button"
              class="rounded-lg bg-gray-25 px-4 py-2.5 transition-colors label_1_semibold primary_text_color"
              @click="onCancel"
            >
              Cancel
            </button>
            <button type="button" class="primary_add_button rounded-lg px-xl py-xxl label_1_semibold" @click="goToReviewStep">
              Review Segment
            </button>
          </div>
        </template>

        <!-- ========== REVIEW STEP ========== -->
        <template v-else>
          <div class="flex shrink-0 items-center gap-md px-6xl pb-4xl pt-6xl">
            <button
              type="button"
              class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-black-400 transition-colors hover:bg-info-50"
              aria-label="Back to edit segment"
              @click="backToCreateStep"
            >
              <svg class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h2 id="review-segment-title" class="heading_h6_bold primary_text_color">
              Review your segment
            </h2>
          </div>
          <div class="h-px w-full shrink-0 bg-black-25" />

          <div class="min-h-0 flex-1 overflow-y-auto px-6xl py-5xl">
            <div class="flex flex-wrap items-start gap-6xl gap-y-md">
              <div class="text-[2.5rem] heading_h2_semibold leading-none tracking-tight text-black-400 tabular-nums">
                {{ matchedCount }}
              </div>
              <div class="min-w-0 flex-1">
                <p class="heading_h6_semibold primary_text_color">Contacts matching your segment filters</p>
                <p class="label_1_medium primary_text_color mt-xs">{{ reviewTimestampLabel }}</p>
              </div>
            </div>

            <div class="mt-6xl">
              <p class="label_2_semibold primary_text_color">Segment Filters</p>
              <div class="mt-4xl flex flex-wrap items-center gap-sm">
                <template v-for="(block, idx) in filterBlocks" :key="'chip-' + block.id">
                  <span
                    v-if="idx > 0"
                    class="px-1 label_2_bold uppercase tracking-wide text-black-400"
                  >
                    {{ (block.joinWithPrevious || 'and').toUpperCase() }}
                  </span>
                  <span
                    class="inline-flex max-w-full rounded-lg border border-black-25 bg-info-50 px-xl py-xs body_3_medium primary_text_color"
                  >
                    {{ filterChipText(block) }}
                  </span>
                </template>
              </div>
            </div>

            <p
              v-if="matchedCount === 0"
              class="mt-6xl label_2_medium primary_text_color"
            >
              No contacts match these filters
            </p>

            <div v-else class="mt-6xl overflow-x-auto rounded-lg border border-[#E9EAEC]">
              <table class="w-full min-w-[640px]">
                <thead>
                  <tr class="border-b regular_border_color bg-info-50">
                    <th class="p-xl text-left label_3_semibold secondary_text_color">Name</th>
                    <th class="p-xl text-left label_3_semibold secondary_text_color">Tags</th>
                    <th class="p-xl text-left label_3_semibold secondary_text_color">First Name</th>
                    <th class="p-xl text-left label_3_semibold secondary_text_color">Last Name</th>
                    <th class="p-xl text-left label_3_semibold secondary_text_color">Address</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="(row, rIdx) in reviewMatchedContacts"
                    :key="row.userId || row.email || rIdx"
                    class="border-b border-[#E9EAEC] last:border-b-0 hover:bg-info-50"
                  >
                    <td class="p-xl label_2_medium primary_text_color">
                      {{ row.email }}
                    </td>
                    <td class="p-xl">
                      <span
                        class="inline-block max-w-full truncate rounded-full border border-[#DADDE1] bg-[#F7F8FA] px-3 py-1 label_3_medium primary_text_color"
                      >
                        {{ previewRowTag }}
                      </span>
                    </td>
                    <td class="p-xl label_2_medium secondary_text_color">
                      {{ row.firstName }}
                    </td>
                    <td class="p-xl label_2_medium secondary_text_color">
                      {{ row.lastName }}
                    </td>
                    <td class="p-xl label_2_medium secondary_text_color">
                      {{ row.address }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div class="h-px w-full shrink-0 bg-black-25" />
          <div class="flex shrink-0 justify-end gap-md px-6xl py-5xl">
            <button
              type="button"
              class="rounded-lg bg-gray-25 px-xxl py-xl transition-colors label_1_semibold primary_text_color primary_border_color"
              @click="onCancel"
            >
              Cancel
            </button>
            <button type="button" class="primary_add_button rounded-lg px-xxl py-xl label_1_semibold" @click="onUseSegment">
              Use segment
            </button>
          </div>
        </template>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch, onUnmounted } from 'vue'
import DownArrow from '../../assets/images/DownArrow.svg'
import CloseIcon from '../../assets/images/CloseIcon.svg'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  /** Audience contacts used to evaluate filters (e.g. from Audience.vue) */
  contacts: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:modelValue', 'review', 'use-segment', 'cancel'])

const step = ref('create')
const segmentName = ref('')
const reviewMatchedContacts = ref([])
const reviewAt = ref(null)

const filterBlocks = ref([{ id: 1, attribute: 'email_client', operator: 'is', value: 'gmail' }])

let nextBlockId = 2

function labelForAttribute(key) {
  const map = {
    email_client: 'Email Client',
    email_engagement: 'Email engagement'
  }
  return map[key] || key
}

function labelForValue(key) {
  const map = {
    gmail: 'Gmail',
    new: 'New',
    company: 'Company domain'
  }
  return map[key] || key
}

function filterChipText(block) {
  return `${labelForAttribute(block.attribute)} > ${block.operator} > ${labelForValue(block.value)}`
}

const previewRowTag = computed(() => {
  const raw = filterBlocks.value.map((b) => String(b.value || '')).filter(Boolean).join('-')
  if (!raw) return '—'
  return raw
    .split('-')
    .map((seg, i) =>
      i === 0 ? seg.charAt(0).toUpperCase() + seg.slice(1).toLowerCase() : seg.toLowerCase()
    )
    .join('-')
})

const matchedCount = computed(() => reviewMatchedContacts.value.length)

const reviewTimestampLabel = computed(() => {
  const d = reviewAt.value
  if (!d) return ''
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  const yy = String(d.getFullYear()).slice(-2)
  let h = d.getHours()
  const isPm = h >= 12
  let hr = h % 12
  if (hr === 0) hr = 12
  const min = String(d.getMinutes()).padStart(2, '0')
  const suf = isPm ? 'pm' : 'am'
  return `as of ${mm}/${dd}/${yy} at ${hr}:${min}${suf}`
})

function evaluateBlockOnContact(contact, block) {
  const email = (contact.email || '').toLowerCase()
  const v = (block.value || '').toLowerCase()
  const attr = block.attribute

  if (attr === 'email_client') {
    if (v === 'gmail') return email.includes('@gmail.') || email.includes('gmail.com')
    if (v === 'outlook') return email.includes('outlook')
    if (v === 'company') return email.includes('domain.com')
    return false
  }
  if (attr === 'email_engagement') {
    if (v === 'new') return Boolean(contact.email)
    if (v === 'active') return Boolean(contact.email && contact.phoneNumber)
    return false
  }
  return false
}

function filterContactsByBlocks(contacts, blocks) {
  const list = Array.isArray(contacts) ? contacts : []
  if (!blocks.length) return [...list]
  return list.filter((contact) => {
    let acc = evaluateBlockOnContact(contact, blocks[0])
    for (let i = 1; i < blocks.length; i++) {
      const next = evaluateBlockOnContact(contact, blocks[i])
      const join = blocks[i].joinWithPrevious === 'or' ? 'or' : 'and'
      acc = join === 'and' ? acc && next : acc || next
    }
    return acc
  })
}

function onEscapeKey(e) {
  if (e.key === 'Escape' && props.modelValue) {
    close()
  }
}

function resetForm() {
  step.value = 'create'
  segmentName.value = ''
  filterBlocks.value = [{ id: 1, attribute: 'email_client', operator: 'is', value: 'gmail' }]
  nextBlockId = 2
  reviewMatchedContacts.value = []
  reviewAt.value = null
}

watch(
  () => props.modelValue,
  (open) => {
    if (open) {
      resetForm()
      window.addEventListener('keydown', onEscapeKey)
    } else {
      window.removeEventListener('keydown', onEscapeKey)
    }
  }
)

onUnmounted(() => {
  window.removeEventListener('keydown', onEscapeKey)
})

function close() {
  emit('update:modelValue', false)
}

function onBackdropClick() {
  close()
}

function onCancel() {
  emit('cancel')
  close()
}

function serializeFilters() {
  return filterBlocks.value.map((b, i) => {
    const base = {
      attribute: b.attribute,
      operator: b.operator,
      value: b.value
    }
    if (i > 0 && b.joinWithPrevious) {
      return { ...base, joinWithPrevious: b.joinWithPrevious }
    }
    return base
  })
}

function goToReviewStep() {
  reviewMatchedContacts.value = filterContactsByBlocks(props.contacts, filterBlocks.value)
  reviewAt.value = new Date()
  step.value = 'review'
  emit('review', {
    name: segmentName.value.trim(),
    filters: serializeFilters(),
    matchCount: reviewMatchedContacts.value.length
  })
}

function backToCreateStep() {
  step.value = 'create'
}

function onUseSegment() {
  emit('use-segment', {
    name: segmentName.value.trim(),
    filters: serializeFilters(),
    contacts: [...reviewMatchedContacts.value],
    matchCount: reviewMatchedContacts.value.length
  })
  close()
}

function removeBlock(id) {
  if (filterBlocks.value.length <= 1) return
  const idx = filterBlocks.value.findIndex((b) => b.id === id)
  if (idx === -1) return
  filterBlocks.value.splice(idx, 1)
  const first = filterBlocks.value[0]
  if (first && 'joinWithPrevious' in first) {
    delete first.joinWithPrevious
  }
}

function addFilterBlock() {
  filterBlocks.value.push({
    id: nextBlockId++,
    joinWithPrevious: 'and',
    attribute: 'email_client',
    operator: 'is',
    value: 'gmail'
  })
}
</script>
