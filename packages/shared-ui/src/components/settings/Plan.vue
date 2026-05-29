<template>
  <div class="primary_border_color rounded-xl py-6xl px-4xl bg_secondary_color w-[75%] md:w-full flex-shrink-0  min-w-[200px] md:flex-shrink md:min-w-0">
    <!-- Icon + Title -->
    <div class="flex items-start flex-col">
      <img :src="icon" alt="">
      <div class="mt-3xl gap-xs flex">
      <p class="label_2_medium secondary_text_color">{{ title }}</p>
      <img :src="Iicon" alt="">
      </div>
    </div>

    <!-- Value -->
    <p class="mt-md heading_h6_semibold primary_text_color">
      {{ used }} of {{ total }} used
    </p>

    <!-- Progress bar -->
    <div class="mt-3xl h-[8px] w-full rounded-full bg-black-25">
      <div
        class="h-[8px] rounded-full transition-all duration-300"
        :style="{ 
          width: percentage + '%',
          background: 'linear-gradient(170.39deg, #FAB000 3.53%, #9966FF 15.8%, #0073E6 80.91%, #15BE53 99.57%)'
        }"
      ></div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import Iicon from "../../assets/images/Iicon.svg";


const props = defineProps({
  title: String,
  used: Number,
  total: Number,
  icon: String,
});

const percentage = computed(() => {
  if (props.total == null || props.total <= 0) {
    return props.used > 0 ? 100 : 0;
  }
  return Math.min((props.used / props.total) * 100, 100);
});
</script>
