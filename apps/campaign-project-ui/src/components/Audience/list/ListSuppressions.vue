<template>
  <div>
    <div class="mb-6xl flex flex-wrap items-center justify-between gap-md">
      <div ref="reasonDropdownRoot" class="relative min-w-[160px]">
        <button
          type="button"
          class="product-select relative flex w-full min-w-[160px] items-center rounded-lg bg_secondary_color py-lg pl-xl pr-10xl label_2_medium primary_text_color regular_border_color"
          :class="isReasonOpen ? 'border-[3px] border-[#D9E2FC]' : ''"
          @click="toggleReasonDropdown"
        >
          <span class="truncate">{{ selectedReasonFilter }}</span>
          <img
            :src="DownArrow"
            alt=""
            class="pointer-events-none absolute right-3 top-1/2 h-5xl w-5xl  -translate-y-1/2 md:right-4"
            aria-hidden="true"
          />
        </button>
        <div
          v-if="isReasonOpen"
          class="absolute left-0 top-full z-20 mt-sm min-w-full overflow-hidden rounded-lg border bg_secondary_color shadow-lg primary_border_color"
          @click.stop
        >
          <button
            v-for="(reason, index) in reasonOptions"
            :key="reason"
            type="button"
            class="flex w-full px-xl py-3xl text-left label_2_medium primary_text_color transition-colors hover:bg-info-50"
            :class="[
              selectedReasonFilter === reason ? 'bg-info-50' : '',
              index > 0 ? 'border-t primary_border_color' : ''
            ]"
            @click="selectReason(reason)"
          >
            {{ reason }}
          </button>
        </div>
      </div>
    </div>

    <div class="overflow-x-auto rounded-lg border primary_border_color">
      <table class="w-full min-w-[720px]">
        <thead>
          <tr class="border-b primary_border_color bg-info-50">
            <th class="p-xl text-left label_3_semibold secondary_text_color">Contact</th>
            <th class="p-xl text-left label_3_semibold secondary_text_color">Reason</th>
            <th class="p-xl text-left label_3_semibold secondary_text_color">Channel</th>
            <th class="p-xl text-left label_3_semibold secondary_text_color">Suppressed at</th>
            <th class="p-xl text-left label_3_semibold secondary_text_color">Source</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="row in filteredRows"
            :key="row.id"
            class="border-b primary_border_color last:border-b-0 hover:bg-info-50"
          >
            <td class="p-6xl label_2_medium secondary_text_color">{{ row.contact }}</td>
            <td class="p-6xl label_2_medium secondary_text_color">{{ row.reason }}</td>
            <td class="p-6xl label_2_medium secondary_text_color">{{ row.channel }}</td>
            <td class="p-6xl label_2_medium secondary_text_color">
              {{ formatSuppressedAt(row.suppressedAt) }}
            </td>
            <td class="p-xl label_2_medium secondary_text_color">{{ row.source }}</td>
          </tr>
          <tr v-if="!filteredRows.length">
            <td colspan="5" class="p-xl text-center label_2_regular secondary_text_color">
              No suppressions found.
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import DownArrow from '../../../assets/images/DownArrow.svg'
import {
  SEED_LIST_SUPPRESSIONS,
  SUPPRESSION_REASON_OPTIONS
} from './listSuppressionsSeed.js'

const props = defineProps({
  /** Omit to use demo seed data */
  suppressions: {
    type: Array,
    default: undefined
  }
})

const reasonOptions = SUPPRESSION_REASON_OPTIONS
const selectedReasonFilter = ref('Any reason')
const isReasonOpen = ref(false)
const reasonDropdownRoot = ref(null)

const rows = computed(() =>
  props.suppressions === undefined ? SEED_LIST_SUPPRESSIONS : props.suppressions ?? []
)

const filteredRows = computed(() => {
  if (selectedReasonFilter.value === 'Any reason') return rows.value
  return rows.value.filter((r) => r.reason === selectedReasonFilter.value)
})

function formatSuppressedAt(value) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

function toggleReasonDropdown() {
  isReasonOpen.value = !isReasonOpen.value
}

function selectReason(reason) {
  selectedReasonFilter.value = reason
  isReasonOpen.value = false
}

function handleDocumentClick(event) {
  if (!isReasonOpen.value) return
  const el = reasonDropdownRoot.value
  if (el && !el.contains(event.target)) isReasonOpen.value = false
}

onMounted(() => {
  document.addEventListener('click', handleDocumentClick, true)
})

onUnmounted(() => {
  document.removeEventListener('click', handleDocumentClick, true)
})
</script>
