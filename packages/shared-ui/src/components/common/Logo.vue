<template>
<div class="absolute left-0 right-0 justify-center lg:justify-start top-md md:top-8xl lg:left-8 flex items-center gap-md border_none">
      <img
        v-if="brandIcon"
        :src="brandIcon"
        alt=""
        class="h-6 w-6 shrink-0"
      />
      <div
        v-else
        class="h-6 w-6 rounded-full bg-gradient-to-r from-purple-500 to-pink-500"
      ></div>
      <span class="heading_h5_semibold gradient_text_color">{{ brandName }}</span>
    </div>
</template>

<script setup>
import { computed } from 'vue';
import { getBrandingSectionConfig } from "@app/services/auth/branding.js";

const brandingConfig = computed(() => {
  try {
    return getBrandingSectionConfig() || {};
  } catch (e) {
    return {};
  }
});

const brandName = computed(() => brandingConfig.value.brandName || 'Genius AI');
const brandIcon = computed(() => brandingConfig.value.brandIcon || null);
</script>