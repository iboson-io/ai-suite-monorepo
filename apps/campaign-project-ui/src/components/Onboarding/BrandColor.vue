<template> 
  <div class="bg_secondary_color rounded-2xl p-6xl brand_section_height primary_border_color">
    <ul>
      <!-- Primary -->
      <div class=" flex flex-col items-start justify-between md:flex-row">
        <span class="label_2_medium primary_text_color">
          Primary
        </span>

        <div
          class="relative flex items-center rounded-lg px-3xl py-xl w-[100%] md:w-[70%] mt-sm md:mt-0"
          :style="{ backgroundColor: colors.primary }"
        >
          <input
            type="color"
            v-model="colors.primary"
            class="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          />
          <span class="body_2_medium primary_2_text_color">
            {{ colors.primary.toUpperCase() }}
          </span>
        </div>
    </div>

      <!-- Secondary -->
      <div class=" flex flex-col items-start justify-between mt-10xl md:flex-row">
        <span class="label_2_medium primary_text_color">
          Secondary
        </span>

        <div
          class="relative flex items-center rounded-lg px-3xl py-xl w-[100%] md:w-[70%] mt-sm md:mt-0"
          :style="{ backgroundColor: colors.secondary }"
        >
          <input
            type="color"
            v-model="colors.secondary"
            class="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          />
          <span class="label_2_medium primary_2_text_color">
            {{ colors.secondary.toUpperCase() }}
          </span>
        </div>
    </div>

      <!-- Font -->
      <li class="mt-10xl flex flex-col items-start justify-between md:flex-row">
        <span class="label_2_medium primary_text_color">
          Font
        </span>

        <div
          class="relative flex items-center rounded-lg px-3xl py-xl w-[100%] md:w-[70%] mt-sm md:mt-0"
          :style="{ backgroundColor: colors.font }"
        >
          <input
            type="color"
            v-model="colors.font"
            class="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          />
          <span class="label_2_medium primary_2_text_color">
            {{ colors.font.toUpperCase() }}
          </span>
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup>
const colors = defineModel("colors", {
  type: Object,
  default: () => ({
    primary: "#2684FF",
    secondary: "#8CB9FF",
    font: "#5A6772",
  }),
});
</script>
