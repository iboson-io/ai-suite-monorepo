<template>
  <section>
    <!-- Header -->
    <div class="bg_secondary_color p-6xl rounded-lg primary_border_color">
      <h2 class="heading_h6_bold primary_text_color">Analytics</h2>
      <p class="label_1_regular secondary_text_color mt-md">
        Track engagement, reach, and performance across all your connected platforms.
      </p>
    </div>

    <!-- Tabs and Dropdowns -->
    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-3xl bg_secondary_color px-xl py-xl md:px-6xl rounded-2xl primary_border_color mt-4xl">
      
      <!-- Tabs -->
      <div class="flex bg-gray-25 rounded-full p-xs">
        <button
          v-for="tab in tabs"
          :key="tab"
          @click="emit('update:activeTab', tab)"
          :class="props.activeTab === tab ? 'bg_secondary_color primary_text_color' : 'bg-gray-25 secondary_text_color'"
          class="px-3xl py-sm rounded-full primary_border_color label_2_semibold"
        >
          {{ tab }}
        </button>
      </div>

      <!-- Dropdowns -->
      <div class="flex gap-3xl md:gap-6xl justify-center">
        <!-- Products Dropdown -->
        <div class="flex items-center gap-md">
          <img :src="ProductIcon" alt="" class="mr-[-40px] md:mr-[-42px] z-10">
          <div class="relative product-dropdown-container">
            <button
              @click="toggleProductDropdown"
              class="flex items-center gap-md rounded-md primary_border_color pl-8xl pr-8xl md:h-10xl md:pl-10xl md:pr-10xl py-md label_2_medium primary_text_color bg_secondary_color product-select relative"
              :class="isProductDropdownOpen ? 'border-[3px] border-[#D9E2FC]':''"
                >
              <span class="product-text">{{ getProductDisplayText() }}</span>
              <img :src="DownArrow" alt="" class="absolute right-xl md:right-md top-1/2 -translate-y-1/2 pointer-events-none">
            </button>
            
            <!-- Products Dropdown Panel -->
            <div
              v-if="isProductDropdownOpen"
              class="absolute top-full left-0 mt-sm bg_secondary_color rounded-md primary_border_color shadow-lg z-50 min-w-[155px] lg:min-w-[190px]"
              @click.stop
            >
              <div>
                <label
                  :class="['flex items-center gap-md px-xl py-3xl hover:bg-info-50', { 'bg-info-50': selectedProducts.length === 0 }]"
                >
                  <input
                    type="checkbox"
                    :checked="selectedProducts.length === 0"
                    @change="toggleAllProducts"
                    class="w-5xl h-5xl rounded cursor-pointer custom-checkbox"
                  />
                  <span class="label_2_medium primary_text_color">All products</span>
                </label>
                <label
                  v-for="product in products"
                  :key="product"
                  :class="['flex items-center gap-md px-xl py-3xl border-b primary_border_color hover:bg-info-50', { 'bg-info-50': selectedProducts.includes(product) }]"
                >
                  <input
                    type="checkbox"
                    :value="product"
                    v-model="selectedProducts"
                    @change="handleProductChange"
                    class="w-5xl h-5xl rounded cursor-pointer custom-checkbox"
                  />
                  <span class="label_2_medium primary_text_color">{{ product }}</span>
                </label>
              </div>
              <div class="px-xl pb-xl">
              <button
                @click="applyProductFilter"
                class="w-full primary_add_button label_3_medium py-md px-md rounded-b-md"
              >
                Apply
              </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Platforms Dropdown -->
        <div class="flex items-center gap-xl">
          <img :src="PlatformIcon" alt="" class="mr-[-40px] md:mr-[-42px] z-10">
          <div class="relative platform-dropdown-container">
            <button
              @click="togglePlatformDropdown"
              class="flex items-center gap-md rounded-md primary_border_color pl-8xl pr-8xl md:pl-10xl md:pr-10xl md:h-10xl lg:pr-10xl py-md label_2_medium bg_secondary_color product-select relative"
               :class="isPlatformDropdownOpen ? 'border-[3px] border-[#D9E2FC]':''"
              >
              <span class="product-text">{{ getPlatformDisplayText() }}</span>
              <img :src="DownArrow" alt="" class="absolute right-xl md:right-md top-1/2 -translate-y-1/2 pointer-events-none">
            </button>
            
            <!-- Platforms Dropdown Panel -->
            <div
              v-if="isPlatformDropdownOpen"
              class="absolute top-full left-0 mt-sm bg_secondary_color rounded-md primary_border_color shadow-lg z-50 min-w-[155px] lg:min-w-[190px]"
              @click.stop
            >
              <div>
                <label
                  :class="['flex items-center gap-md px-xl py-3xl hover:bg-info-50', { 'bg-info-50': selectedPlatforms.length === 0 }]"
                >
                  <input
                    type="checkbox"
                    :checked="selectedPlatforms.length === 0"
                    @change="toggleAllPlatforms"
                    class="w-5xl h-5xl rounded cursor-pointer custom-checkbox"
                  />
                  <span class="label_2_medium primary_text_color">All platforms</span>
                </label>
                <label
                  v-for="platform in platforms"
                  :key="platform"
                   :class="['flex items-center gap-md px-xl py-3xl border-b primary_border_color hover:bg-info-50', { 'bg-info-50': selectedPlatforms.includes(platform) }]"
                >
                  <input
                    type="checkbox"
                    :value="platform"
                    v-model="selectedPlatforms"
                    @change="handlePlatformChange"
                    class="w-5xl h-5xl rounded cursor-pointer custom-checkbox"
                  />
                  <span class="label_2_medium primary_text_color">{{ platform }}</span>
                </label>
              </div>
              <div class="px-xl pb-xl">
              <button
                @click="applyPlatformFilter"
                class="w-full primary_add_button label_3_medium py-md px-md rounded-b-md"
              >
                Apply
              </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import ProductIcon from "../../../assets/images/ProductIcon.svg"
import PlatformIcon from "../../../assets/images/PlatformIcon.svg"
import DownArrow from "../../../assets/images/DownArrow.svg"

const props = defineProps({
  activeTab: {
    type: String,
    default: 'Month'
  }
});

const emit = defineEmits(['update:activeTab']);

const tabs = ['Day', 'Week', 'Month', 'Custom'];

const products = ['Product One', 'Product Two', 'Product Three', 'Product four'];
const selectedProducts = ref([]);
const appliedProducts = ref([]);
const isProductDropdownOpen = ref(false);

const platforms = ['Instagram', 'Facebook', 'Twitter'];
const selectedPlatforms = ref([]);
const appliedPlatforms = ref([]);
const isPlatformDropdownOpen = ref(false);

const toggleProductDropdown = () => {
  isProductDropdownOpen.value = !isProductDropdownOpen.value;
  if (isProductDropdownOpen.value) {
    isPlatformDropdownOpen.value = false;
    // Sync selected with applied when opening
    selectedProducts.value = [...appliedProducts.value];
  }
};

const togglePlatformDropdown = () => {
  isPlatformDropdownOpen.value = !isPlatformDropdownOpen.value;
  if (isPlatformDropdownOpen.value) {
    isProductDropdownOpen.value = false;
    // Sync selected with applied when opening
    selectedPlatforms.value = [...appliedPlatforms.value];
  }
};

const applyProductFilter = () => {
  appliedProducts.value = [...selectedProducts.value];
  isProductDropdownOpen.value = false;
};

const applyPlatformFilter = () => {
  appliedPlatforms.value = [...selectedPlatforms.value];
  isPlatformDropdownOpen.value = false;
};

const getProductDisplayText = () => {
  if (appliedProducts.value.length === 0) {
    return 'All products';
  }
  if (appliedProducts.value.length === 1) {
    return appliedProducts.value[0];
  }
  return `${appliedProducts.value.length} products`;
};

const getPlatformDisplayText = () => {
  if (appliedPlatforms.value.length === 0) {
    return 'All platforms';
  }
  if (appliedPlatforms.value.length === 1) {
    return appliedPlatforms.value[0];
  }
  return `${appliedPlatforms.value.length} platforms`;
};

const toggleAllProducts = (event) => {
  if (event.target.checked) {
    selectedProducts.value = [];
  } else {
    selectedProducts.value = [...products];
  }
};

const toggleAllPlatforms = (event) => {
  if (event.target.checked) {
    selectedPlatforms.value = [];
  } else {
    selectedPlatforms.value = [...platforms];
  }
};

const handleProductChange = () => {
  // If all products are selected, automatically uncheck "All products" is handled by the checked condition
};

const handlePlatformChange = () => {
  // If all platforms are selected, automatically uncheck "All platforms" is handled by the checked condition
};

const handleClickOutside = (event) => {
  const productDropdown = event.target.closest('.product-dropdown-container');
  const platformDropdown = event.target.closest('.platform-dropdown-container');
  
  if (!productDropdown && isProductDropdownOpen.value) {
    isProductDropdownOpen.value = false;
  }
  if (!platformDropdown && isPlatformDropdownOpen.value) {
    isPlatformDropdownOpen.value = false;
  }
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>


