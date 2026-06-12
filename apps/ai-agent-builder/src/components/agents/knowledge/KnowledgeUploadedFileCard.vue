<template>
  <div
    class="rounded-xl border primary_border_color bg-white"
    :class="compact ? 'p-md' : 'p-4xl'"
  >
    <div class="flex gap-md">
      <div
        class="flex shrink-0 items-center justify-center rounded-lg bg-gray-25"
        :class="compact ? 'h-8 w-8' : 'h-10 w-10'"
        aria-hidden="true"
      >
        <img
          :src="DocumentIcon"
          alt=""
          class="shrink-0"
          :class="compact ? 'h-[18px] w-[18px]' : 'h-5 w-5'"
        />
      </div>
      <div class="min-w-0 flex-1">
        <p
          class="primary_text_color truncate"
          :class="compact ? 'caption_1_semibold' : 'label_3_bold'"
        >
          {{ item.name }}
        </p>
        <p class="caption_1_regular tertiary_text_color mt-xs break-words label_3_regular">
          <template v-if="item.status === 'uploading'">
            {{ formatFileSize(item.size) }} | Last updated {{ formatFileDateTime(item.addedAt) }}
          </template>
          <template v-else>
            {{ formatFileSize(item.size) }} | {{ formatFileDateTime(item.completedAt ?? item.addedAt) }}
          </template>
        </p>
      </div>
    </div>

    <div v-if="item.status === 'uploading'" class="mt-md flex items-center gap-sm">
      <svg
        class="h-4 w-4 shrink-0 animate-spin"
        viewBox="0 0 16 16"
        fill="none"
        aria-hidden="true"
      >
        <g stroke="#22C55E" stroke-width="1.75" stroke-linecap="round">
          <line x1="8" y1="2" x2="8" y2="4.75" opacity="1" />
          <line x1="8" y1="2" x2="8" y2="4.75" opacity="0.9" transform="rotate(45 8 8)" />
          <line x1="8" y1="2" x2="8" y2="4.75" opacity="0.75" transform="rotate(90 8 8)" />
          <line x1="8" y1="2" x2="8" y2="4.75" opacity="0.6" transform="rotate(135 8 8)" />
          <line x1="8" y1="2" x2="8" y2="4.75" opacity="0.45" transform="rotate(180 8 8)" />
          <line x1="8" y1="2" x2="8" y2="4.75" opacity="0.3" transform="rotate(225 8 8)" />
          <line x1="8" y1="2" x2="8" y2="4.75" opacity="0.2" transform="rotate(270 8 8)" />
          <line x1="8" y1="2" x2="8" y2="4.75" opacity="0.1" transform="rotate(315 8 8)" />
        </g>
      </svg>
      <div class="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-success-100">
        <div
          class="h-full rounded-full bg-success-600 transition-all duration-300 ease-out"
          :style="{ width: `${item.progress}%` }"
        />
      </div>
      <button
        type="button"
        class="shrink-0 rounded p-xs text-gray-400 transition-colors hover:text-gray-600"
        aria-label="Cancel upload"
        @click="$emit('cancel')"
      >
        <svg class="h-4 w-4" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path
            d="M12 4L4 12M4 4L12 12"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
          />
        </svg>
      </button>
    </div>

    <div v-else class="mt-md flex items-center justify-between gap-md">
      <span class="flex items-center gap-xs caption_1_medium text-success-600">
        <svg class="h-4 w-4 shrink-0" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path
            d="M13.3333 4L6 11.3333L2.66667 8"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
        Completed
      </span>
      <button
        type="button"
        class="shrink-0 rounded p-xs transition-opacity hover:opacity-70"
        aria-label="Remove file"
        @click="$emit('remove')"
      >
        <img :src="TrashIcon" alt="" class="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  </div>
</template>

<script setup>
import DocumentIcon from '../../../assets/images/agents/documents.svg'
import TrashIcon from '../../../assets/images/trash.svg'
import { formatFileDateTime, formatFileSize } from './fileUploadUtils.js'

defineProps({
  item: {
    type: Object,
    required: true,
  },
  compact: {
    type: Boolean,
    default: false,
  },
})

defineEmits(['cancel', 'remove'])
</script>
