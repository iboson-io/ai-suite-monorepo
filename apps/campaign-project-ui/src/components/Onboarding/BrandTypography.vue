<template>
  <div class="bg_secondary_color rounded-2xl p-6xl brand_section_height primary_border_color">
    <ul class="space-y-9">

      <!-- Secondary -->
      <div class="gap-xl flex flex-col items-start justify-between md:flex-row">
        <span class="label_2_medium primary_text_color">
          Heading
        </span>

        <div
          class="relative flex items-center rounded-lg w-[100%] md:w-[70%] mt-sm md:mt-0"
        >
          <select
            v-model="typography"
            class="w-full appearance-none rounded-lg border border-gray-400 px-3xl py-xl label_1_regular primary_text_color
            focus-visible:outline-none
         focus-visible:ring-1
         focus-visible:ring-black-50
         focus-visible:border-black-200"
          >
            <option value="Open Sans">Open Sans</option>
            <option value="Inter">Inter</option>
            <option value="Roboto">Roboto</option>
            <option value="Lato">Lato</option>
          </select>

          <!-- Chevron -->
          <svg
            class="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        
        </div>
    </div>

      <!-- Font -->
      <li class="gap-xl flex flex-col items-start justify-between md:flex-row">
        <span class="label_2_medium primary_text_color">
          Font
        </span>

        <div
          class="relative flex items-center rounded-xl w-[100%] md:w-[70%] mt-sm md:mt-0"
        >
          <select
            v-model="typography"
            class="w-full appearance-none rounded-lg border border-gray-400 px-3xl py-xl label_2_medium primary_text_color 
            focus-visible:outline-none
         focus-visible:ring-1
         focus-visible:ring-black-50
         focus-visible:border-black-200"
          >
            <option value="Open Sans">Open Sans</option>
            <option value="Inter">Inter</option>
            <option value="Roboto">Roboto</option>
            <option value="Lato">Lato</option>
          </select>

          <!-- Chevron -->
          <svg
            class="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup>
const typography = defineModel("typography", {
  type: String,
  default: "Open Sans",
});
</script>
