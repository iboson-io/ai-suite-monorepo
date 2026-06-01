<template>
  <!-- Fixed size so every layout option has identical thumb height. -->
  <div
    class="mx-auto flex h-32 w-24 max-w-full flex-col overflow-hidden"
    aria-hidden="true"
  >
    <!-- Split -->
    <div
      v-if="variant === 'split'"
      class="flex h-full min-h-0 w-full flex-col justify-between gap-0.5"
    >
      <div class="shrink-0 space-y-0.5">
        <div :class="['h-2.5 w-full rounded-sm', fill]" />
        <div
          v-for="i in 2"
          :key="`a${i}`"
          :class="['h-0.5 w-full rounded-sm', fill]"
        />
      </div>
      <div class="min-h-0 w-full flex-1 py-0.5">
        <div class="flex h-full w-full min-h-0 gap-0.5">
          <div :class="['min-h-0 min-w-0 flex-1 rounded-sm', fill]" />
          <div :class="['min-h-0 min-w-0 flex-1 rounded-sm', fill]" />
        </div>
      </div>
      <div class="shrink-0 space-y-0.5">
        <div
          v-for="i in 2"
          :key="`b${i}`"
          :class="['h-0.5 w-full rounded-sm', fill]"
        />
        <div :class="['mx-auto h-1.5 w-1/2 rounded-sm', fill]" />
      </div>
    </div>

    <!-- Minimal: hero, scrollable text stack, CTA — fills same h-32 -->
    <div
      v-else-if="variant === 'minimal'"
      class="flex h-full min-h-0 w-full flex-col justify-between gap-0.5"
    >
      <div :class="['h-2.5 w-full shrink-0 rounded-sm', fill]" />
      <div class="min-h-0 w-full flex-1 overflow-hidden py-0.5">
        <div
          class="flex h-full min-h-0 flex-col justify-center gap-px"
        >
          <div
            v-for="(w, i) in minimalWidths"
            :key="`m${i}`"
            :class="['h-0.5 min-h-0 shrink-0 rounded-sm', fill, w.split(' ')]"
          />
        </div>
      </div>
      <div :class="['h-1.5 w-1/2 shrink-0 self-center rounded-sm', fill]" />
    </div>

    <!-- Narrative -->
    <div
      v-else-if="variant === 'narrative'"
      class="flex h-full min-h-0 w-full flex-col justify-between gap-0.5"
    >
      <div class="shrink-0 space-y-0.5">
        <div :class="['h-2.5 w-full rounded-sm', fill]" />
        <div :class="['h-0.5 w-full rounded-sm', fill]" />
      </div>
      <div class="min-h-0 w-full flex-1 py-0.5">
        <div class="flex h-full w-full min-h-0 flex-col gap-0.5">
          <div class="flex min-h-0 flex-1 gap-0.5">
            <div :class="['h-full w-[42%] shrink-0 rounded-sm', fill]" />
            <div class="flex min-h-0 min-w-0 flex-1 flex-col justify-center gap-px">
              <div
                v-for="i in 3"
                :key="`n1${i}`"
                :class="['h-0.5 w-full rounded-sm', fill]"
              />
            </div>
          </div>
          <div class="flex min-h-0 flex-1 gap-0.5">
            <div class="flex min-h-0 min-w-0 flex-1 flex-col justify-center gap-px">
              <div
                v-for="i in 2"
                :key="`n2${i}`"
                :class="['h-0.5 w-full rounded-sm', fill]"
              />
            </div>
            <div :class="['h-full w-[42%] shrink-0 rounded-sm', fill]" />
          </div>
        </div>
      </div>
    </div>

    <!-- Spotlight -->
    <div
      v-else-if="variant === 'spotlight'"
      class="flex h-full min-h-0 w-full flex-col justify-between gap-0.5"
    >
      <div :class="['h-0.5 w-2/3 shrink-0 self-center rounded-sm', fill]" />
      <div class="min-h-0 w-full flex-1">
        <div :class="['h-full w-full min-h-0 rounded-sm', fill]" />
      </div>
      <div class="shrink-0 space-y-0.5">
        <div
          v-for="i in 2"
          :key="`s1${i}`"
          :class="['h-0.5 w-full rounded-sm', fill]"
        />
        <div class="flex w-full justify-between gap-0.5">
          <div
            v-for="i in 3"
            :key="`s2${i}`"
            :class="['h-1.5 min-w-0 flex-1 rounded-sm', fill]"
          />
        </div>
        <div
          v-for="i in 2"
          :key="`s3${i}`"
          :class="['h-0.5 w-full rounded-sm', fill]"
        />
      </div>
    </div>

    <!-- Gallery: top fixed, rest fills same height as other thumbs -->
    <div
      v-else-if="variant === 'gallery'"
      class="flex h-full min-h-0 w-full flex-col justify-between gap-0.5"
    >
      <div class="shrink-0 space-y-0.5">
        <div :class="['h-2.5 w-full rounded-sm', fill]" />
        <div :class="['h-0.5 w-full rounded-sm', fill]" />
      </div>
      <div class="flex min-h-0 w-full flex-1 flex-col justify-between gap-0.5 py-0.5">
        <div class="flex w-full justify-between gap-0.5">
          <div
            v-for="i in 3"
            :key="`g1${i}`"
            :class="['h-1.5 min-h-0 min-w-0 flex-1 rounded-sm', fill]"
          />
        </div>
        <div class="flex w-full min-h-0 flex-1 gap-0.5">
          <div
            v-for="i in 2"
            :key="`g2${i}`"
            :class="['min-h-0 min-w-0 flex-1 rounded-sm', fill]"
          />
        </div>
        <div :class="['h-1.5 w-full shrink-0 rounded-sm', fill]" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const minimalWidths = [
  'w-full',
  'w-[92%] self-center',
  'w-full',
  'w-4/5 self-center',
  'w-full',
  'w-3/4 self-center',
  'w-11/12 self-center',
  'w-2/3 self-center',
  'w-full',
]

const props = defineProps({
  variant: {
    type: String,
    required: true
  },
  selected: {
    type: Boolean,
    default: false
  }
})

const fill = computed(() => (props.selected ? 'bg-blue-100' : 'bg-info-200'))
</script>
