<template>
  <div>
    <div class="mb-3xl flex flex-wrap items-start justify-between gap-md">
      <div>
        <h2 class="label_1_semibold primary_text_color">Import history</h2>
        <p class="mt-sm label_2_regular secondary_text_color">
          {{ headerSummary }}
        </p>
      </div>
      <button
        type="button"
        class="inline-flex min-h-[2.75rem] shrink-0 items-center justify-center rounded-lg bg-gray-25  px-xl py-md label_1_semibold primary_text_color transition-colors hover:bg-info-100"
        @click="emit('import-contacts')"
      >
        Import contacts
      </button>
    </div>
  <div class="h-px shrink-0 bg-info-50" />
    <ul class="flex flex-col gap-md mt-3xl">
      <li
        v-for="item in imports"
        :key="item.id"
        class="flex flex-wrap items-center justify-between gap-md rounded-lg border bg_secondary_color px-4xl py-4xl primary_border_color"
      >
        <div class="min-w-0 flex-1">
          <div class="flex flex-wrap items-center gap-md">
            <span class="label_1_semibold primary_text_color">{{ item.fileName }}</span>
            <span
              class="inline-flex items-center gap-xs rounded-md border px-md py-xs body_4_medium capitalize"
              :class="statusBadgeClass(item.status)"
            >
              <img
                v-if="item.status === 'completed'"
                :src="GreenTickIcon"
                alt=""
                class="h-3.5 w-3.5"
                aria-hidden="true"
              />
              <img
                v-else
                :src="WarningIcon"
                alt=""
                class="h-3.5 w-3.5"
                aria-hidden="true"
              />
              {{ item.status }}
            </span>
          </div>
          <p class="mt-sm label_1_medium secondary_text_color">
            {{ item.dateLabel }}
          </p>
        </div>
        <p class="shrink-0 label_1_medium secondary_text_color">
          {{ item.stats }}
        </p>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import GreenTickIcon from '../../../assets/images/GreenTickIcon.svg'
import WarningIcon from '../../../assets/images/WarningIcon.svg'

const DEMO_IMPORTS = [
  {
    id: 1,
    fileName: 'contacts-q4-2025.csv',
    status: 'completed',
    dateLabel: 'Apr 28, 2026 · 9:00 AM',
    stats: '104 of 108 rows imported',
    contactsAdded: 104
  },
  {
    id: 2,
    fileName: 'vip-list-jan.xlsx',
    status: 'completed',
    dateLabel: 'Mar 15, 2026 · 2:30 PM',
    stats: '4 of 208 rows imported',
    contactsAdded: 4
  },
  {
    id: 3,
    fileName: 'event-attendees.csv',
    status: 'failed',
    dateLabel: 'Feb 10, 2026 · 4:00 PM',
    stats: 'Import failed',
    contactsAdded: 0
  }
]

const props = defineProps({
  /** Omit to use demo data */
  imports: {
    type: Array,
    default: undefined
  }
})

const emit = defineEmits(['import-contacts'])

const imports = computed(() => props.imports ?? DEMO_IMPORTS)

const headerSummary = computed(() => {
  const list = imports.value
  const count = list.length
  const total = list.reduce((sum, row) => sum + (row.contactsAdded ?? 0), 0)
  const importLabel = count === 1 ? 'import' : 'imports'
  return `${count} ${importLabel} · ${total} total contacts added`
})

function statusBadgeClass(status) {
  if (status === 'completed') {
    return 'border-success-200 bg-success-50 text-success-600'
  }
  return 'border-error-200 bg-error-50 text-error-600'
}
</script>
