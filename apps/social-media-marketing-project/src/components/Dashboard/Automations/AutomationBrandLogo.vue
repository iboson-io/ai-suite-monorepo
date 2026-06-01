<template>
  <div
    class="shrink-0 rounded-full bg-gradient-to-tr from-[#FAB000] via-[#9966FF] to-[#0073E6]"
    :class="sizeClass"
    aria-hidden="true"
  />
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  size: {
    type: String,
    default: "md",
  },
});

const sizeClass = computed(() =>
  props.size === "sm" ? "h-7 w-7" : "h-8 w-8"
);
</script>
