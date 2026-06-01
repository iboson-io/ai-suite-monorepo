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
            :disabled="fontsLoading"
            class="w-full appearance-none rounded-lg border border-gray-400 px-3xl py-xl label_1_regular primary_text_color
            focus-visible:outline-none
         focus-visible:ring-1
         focus-visible:ring-black-50
         focus-visible:border-black-200 disabled:cursor-wait disabled:opacity-60"
          >
            <option
              v-for="name in fontNames"
              :key="name"
              :value="name"
            >
              {{ name }}
            </option>
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
            :disabled="fontsLoading"
            class="w-full appearance-none rounded-lg border border-gray-400 px-3xl py-xl label_2_medium primary_text_color 
            focus-visible:outline-none
         focus-visible:ring-1
         focus-visible:ring-black-50
         focus-visible:border-black-200 disabled:cursor-wait disabled:opacity-60"
          >
            <option
              v-for="name in fontNames"
              :key="name"
              :value="name"
            >
              {{ name }}
            </option>
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
import { ref, onMounted } from 'vue';
import api from '../../../../services/api.js';

const typography = defineModel('typography', {
  type: String,
  default: 'Open Sans',
});

const FONT_FALLBACK = ['Open Sans', 'Inter', 'Roboto', 'Lato'];
const fontNames = ref([...FONT_FALLBACK]);
const fontsLoading = ref(false);

function alignTypographyToList(list) {
  if (!list.length) return;
  const t = typography.value;
  if (typeof t !== 'string' || !list.includes(t)) {
    typography.value = list[0];
  }
}

async function fetchFonts() {
  fontsLoading.value = true;
  try {
    const { data } = await api.get('/api/typography/fonts');
    const raw = Array.isArray(data?.fonts)
      ? data.fonts
      : Array.isArray(data?.data?.fonts)
        ? data.data.fonts
        : [];
    const names = raw
      .map((row) => (row && typeof row.name === 'string' ? row.name.trim() : ''))
      .filter(Boolean);
    if (names.length) {
      fontNames.value = names;
    } else {
      fontNames.value = [...FONT_FALLBACK];
    }
  } catch (e) {
    console.error('GET /api/typography/fonts failed:', e);
    fontNames.value = [...FONT_FALLBACK];
  } finally {
    fontsLoading.value = false;
    alignTypographyToList(fontNames.value);
  }
}

onMounted(() => {
  fetchFonts();
});
</script>
