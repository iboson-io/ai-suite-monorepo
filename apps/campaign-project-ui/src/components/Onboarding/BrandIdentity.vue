<template>
  <div class="flex flex-col h-[100%] min-h-0">
    <!-- Sub-navigation Tabs -->
    <div class="flex gap-6xl overflow-x-auto bg_secondary_color rounded-2xl primary_border_color hide-scrollbar px-6xl py-xl flex-shrink-0">
      <button
        @click="$emit('update:activeTab', 'product-info')"
        class="flex items-center gap-xl rounded-lg p-xl flex-shrink-0 label_1_semibold hover:bg-info-50"
        :class="activeTab === 'product-info' ? 'bg-info-50 primary_text_color' : 'secondary_text_color'"
      >
        <!-- Document Icon -->
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M9 6.25H9.00917M8.08333 9H9V12.6667H9.91667M9 0.75C15.6 0.75 17.25 2.4 17.25 9C17.25 15.6 15.6 17.25 9 17.25C2.4 17.25 0.75 15.6 0.75 9C0.75 2.4 2.4 0.75 9 0.75Z" :stroke="activeTab === 'product-info' ? '#28293D' : '#6F707D'" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>

        <span>Product Info</span>
      </button>

      <button
        @click="$emit('update:activeTab', 'brand-colors')"
          class="flex items-center gap-xl rounded-lg p-xl flex-shrink-0 label_1_semibold hover:bg-info-50"
          :class="activeTab === 'brand-colors' ? 'bg-info-50 primary_text_color' : 'secondary_text_color'"
      >
        <!-- Paint Palette Icon -->
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M13.5833 3.5H14.5C14.9862 3.5 15.4525 3.69315 15.7964 4.03697C16.1402 4.38079 16.3333 4.8471 16.3333 5.33333C16.3333 6.54891 15.8504 7.7147 14.9909 8.57424C14.1314 9.43378 12.9656 9.91667 11.75 9.91667H7.16667V11.75M0.75 2.58333C0.75 2.0971 0.943154 1.63079 1.28697 1.28697C1.63079 0.943154 2.0971 0.75 2.58333 0.75H11.75C12.2362 0.75 12.7025 0.943154 13.0464 1.28697C13.3902 1.63079 13.5833 2.0971 13.5833 2.58333V4.41667C13.5833 4.9029 13.3902 5.36921 13.0464 5.71303C12.7025 6.05685 12.2362 6.25 11.75 6.25H2.58333C2.0971 6.25 1.63079 6.05685 1.28697 5.71303C0.943154 5.36921 0.75 4.9029 0.75 4.41667V2.58333ZM5.33333 12.6667C5.33333 12.4236 5.42991 12.1904 5.60182 12.0185C5.77373 11.8466 6.00688 11.75 6.25 11.75H8.08333C8.32645 11.75 8.55961 11.8466 8.73151 12.0185C8.90342 12.1904 9 12.4236 9 12.6667V16.3333C9 16.5764 8.90342 16.8096 8.73151 16.9815C8.55961 17.1534 8.32645 17.25 8.08333 17.25H6.25C6.00688 17.25 5.77373 17.1534 5.60182 16.9815C5.42991 16.8096 5.33333 16.5764 5.33333 16.3333V12.6667Z" :stroke="activeTab === 'brand-colors' ? '#28293D' : '#6F707D'" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
        <span>Brand Colors</span>
      </button>

      <button
        @click="$emit('update:activeTab', 'typography')"
        class="flex items-center gap-xl rounded-lg p-xl flex-shrink-0 label_1_semibold hover:bg-info-50"
        :class="activeTab === 'typography' ? 'bg-info-50 primary_text_color' : 'secondary_text_color'"
      >
        <!-- Typography Icon (A) -->
        <svg width="18" height="17" viewBox="0 0 18 17" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M0.75 15.4167H3.5M9.91667 15.4167H16.3333M3.40836 10.8333H9.73335M6.43334 2.85834L11.75 15.4167M1.66667 15.4167L7.16667 0.75H9L15.4167 15.4167" :stroke="activeTab === 'typography' ? '#28293D' : '#6F707D'" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>

        <span>Typography</span>
      </button>

      <button
        @click="$emit('update:activeTab', 'website-assets')"
        class="flex items-center gap-xl rounded-lg p-xl flex-shrink-0 label_1_semibold hover:bg-info-50"
        :class="activeTab === 'website-assets' ? 'bg-info-50 primary_text_color' : 'secondary_text_color'"
      >
        <!-- Folder Icon -->
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M4.58333 3.66602H8.25L11 6.41602H17.4167C17.9029 6.41602 18.3692 6.60917 18.713 6.95299C19.0568 7.2968 19.25 7.76312 19.25 8.24935V15.5827C19.25 16.0689 19.0568 16.5352 18.713 16.879C18.3692 17.2229 17.9029 17.416 17.4167 17.416H4.58333C4.0971 17.416 3.63079 17.2229 3.28697 16.879C2.94315 16.5352 2.75 16.0689 2.75 15.5827V5.49935C2.75 5.01312 2.94315 4.5468 3.28697 4.20299C3.63079 3.85917 4.0971 3.66602 4.58333 3.66602Z" :stroke="activeTab === 'website-assets' ? '#28293D' : '#6F707D'" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>

        <span>Website & Brand Assets</span>
      </button>
    </div>
    <div class="mt-5xl flex-1 min-h-0 overflow-y-auto">
    <!-- Tab Content: Product Info -->
    <div v-if="activeTab === 'product-info'" class="h-full">
      <BrandInfoFields
        :product-name="productName"
        :description="description"
        @update:product-name="$emit('update:productName', $event)"
        @update:description="$emit('update:description', $event)"
      />
    </div>

    <!-- Placeholder for other tabs -->
     <div v-else-if="activeTab === 'brand-colors'" class="h-full">
      <BrandColor v-model:colors="brandColors" />
    </div>
   <!-- tab for typography -->
    <div v-else-if="activeTab === 'typography'" class="h-full">
      <BrandTypography v-model:typography="typography" />
    </div>
    <!-- tab for typography -->

    <div v-else>
      <p class="label_1_regular secondary_text_color">{{ activeTab }} content coming soon...</p>
    </div>
</div>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted, watch } from "vue";
import BrandInfoFields from "./BrandInfoFields.vue";
import BrandColor from "./BrandColor.vue";
import BrandTypography from "./BrandTypography.vue"

const DEFAULT_COLORS = {
  primary: "#2684FF",
  secondary: "#8CB9FF",
  font: "#5A6772",
};

const brandColors = reactive({ ...DEFAULT_COLORS });
const brandVoice = ref("friendly");
const typography = ref("Open Sans");

const props = defineProps({
  activeTab: {
    type: String,
    default: "product-info",
  },
  productName: {
    type: String,
    default: "cvcbcvnb",
  },
  description: {
    type: String,
    default: "",
  },
  /** When set (e.g. product edit), merge into brand state — use with :key on parent to re-init per product */
  initialBrandColors: {
    type: Object,
    default: null,
  },
  initialBrandVoice: {
    type: String,
    default: null,
  },
  initialTypography: {
    type: String,
    default: null,
  },
});

function applyInitialBrandState() {
  if (props.initialBrandColors && typeof props.initialBrandColors === "object") {
    Object.assign(brandColors, DEFAULT_COLORS, props.initialBrandColors);
  }
  if (props.initialBrandVoice != null && props.initialBrandVoice !== "") {
    brandVoice.value = props.initialBrandVoice;
  }
  if (props.initialTypography != null && props.initialTypography !== "") {
    typography.value = props.initialTypography;
  }
}

onMounted(() => {
  applyInitialBrandState();
});

const emit = defineEmits([
  "update:activeTab",
  "update:productName",
  "update:description",
  "field-change",
]);

watch(brandColors, () => emit("field-change"), { deep: true, flush: "post" });
watch(brandVoice, () => emit("field-change"), { flush: "post" });
watch(typography, () => emit("field-change"), { flush: "post" });

defineExpose({
  getBrandIdentitySelections() {
    return {
      brandColors: { ...brandColors },
      brandVoice: brandVoice.value,
      typography: typography.value,
    };
  },
});

</script>

