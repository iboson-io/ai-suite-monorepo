<template>
  <div class="rounded-lg border primary_border_color p-6xl bg_secondary_color">
    <!-- Summary stats -->
    <div class="grid grid-cols-1 gap-md sm:grid-cols-3 md:w-1/2">
      <div
        v-for="stat in summaryStats"
        :key="stat.label"
        class="rounded-lg border primary_border_color bg_secondary_color p-5xl text-left"
      >
        <p class="heading_h5_bold primary_text_color">
          {{ stat.value }}
        </p>
        <p class="body_2_medium secondary_text_color">
          {{ stat.label }}
        </p>
      </div>
    </div>

    <!-- Import details -->
    <ul class="mt-5xl ">
      <li
        v-for="item in detailItems"
        :key="item.label"
        class="flex flex-wrap items-baseline gap-xs label_1_regular secondary_text_color mt-xxs"
      >
        <span class="mr-sm text-gray-400" aria-hidden="true">•</span>
        <span>{{ item.label }}:</span>
        <span class="label_1_semibold primary_text_color">{{ item.value }}</span>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  totalContacts: {
    type: Number,
    default: 2450
  },
  fieldsMapped: {
    type: Number,
    default: 4
  },
  tagsAssigned: {
    type: Number,
    default: 1
  },
  dateTime: {
    type: String,
    default: 'May 16, 10:17 PM'
  },
  status: {
    type: String,
    default: 'Completed'
  },
  rowsImported: {
    type: Number,
    default: 2450
  },
  rowsTotal: {
    type: Number,
    default: 2450
  },
  duplicatesFound: {
    type: String,
    default: 'No'
  },
  destinationList: {
    type: String,
    default: 'Standard'
  }
})

const summaryStats = computed(() => [
  {
    value: props.totalContacts.toLocaleString('en-US'),
    label: 'Total contacts'
  },
  {
    value: String(props.fieldsMapped),
    label: 'Fields mapped'
  },
  {
    value: String(props.tagsAssigned),
    label: 'Tags assigned'
  }
])

const detailItems = computed(() => [
  { label: 'Date & Time', value: props.dateTime },
  { label: 'Status', value: props.status },
  {
    label: 'Rows imported',
    value: `${props.rowsImported.toLocaleString('en-US')}/${props.rowsTotal.toLocaleString('en-US')}`
  },
  { label: 'Duplicates found', value: props.duplicatesFound },
  { label: 'Destination list', value: props.destinationList }
])
</script>
