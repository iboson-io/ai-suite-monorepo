<template>
  <div class="rounded-2xl bg_secondary_color p-6xl shadow-sm h-[100%] data-privacy-full-height">
    <!-- Header -->
    <h2 class="heading_h6_semibold primary_text_color">Billing & Plan</h2>
    <p class="label_1_regular secondary_text_color mt-md">
      View your plan, manage payments, and track AI credits.
    </p>

    <!-- Current Plan -->
    <div class="mt-3xl md:mt-10xl">
      <h3 class="label_1_semibold primary_text_color">Current Plan</h3>

      <div class="grid grid-cols-1 gap-md md:grid-cols-2 md:gap-md primary_border_color rounded-lg p-4xl mt-4xl">
        <!-- Plan Info -->
        <div>
          <p class="label_2_medium secondary_text_color">{{ planLabel }}</p>
          <p class="heading_h6_semibold mt-3xl primary_text_color">{{ planPriceDisplay }}</p>

          <div class="mt-xl flex items-center gap-4xl">
            <button
              class="primary_add_button p-md w-4/5 lg:button_width"
            >
              Upgrade Plan
            </button>

            <div class="relative dropdown-container">
              <button
                @click.stop="toggleDropdown"
                class="h-9 w-9 rounded-lg border primary_border_color secondary_text_color flex items-center justify-center"
              >
                ⋯
              </button>
              
              <!-- Dropdown Menu -->
              <div
                v-if="showDropdown"
                class="absolute left-1/2 -translate-x-1/2 top-10 z-50 min-w-[120px] rounded-lg bg_secondary_color shadow-xl primary_border_color"
              >
                <div
                  @click.stop="handleCancelPlan"
                  class="flex items-center justify-center px-xl py-3xl cursor-pointer rounded-lg shadow-sm primary_border_color hover:bg-gray-100"
                >
                  <span class="label_2_regular primary_text_color">Cancel Plan</span>
                </div>
              </div>
            </div>
          </div>
        </div>
         <!-- Horizontal line (Mobile only) -->
        <div class="block md:hidden h-[2px] w-full bg-gray-25  my-4"></div>
        <!-- Renew -->
        <div class="flex">
            <!-- Vertical line (Desktop only) -->
           <div class=" hidden md:block w-[2px] h-28 bg-gray-25  mr-5xl"></div>

          <div class="w-[100%]">
          <p class="label_2_medium secondary_text_color">Renew at</p>
          <p class="heading_h6_semibold mt-3xl primary_text_color">{{ renewAtDisplay }}</p>

          <button
            class="mt-xl rounded-md p-md bg-gray-25 w-4/5 lg:button_width label_1_semibold primary_text_color"
          >
            Refill Credits
          </button>
          </div>
        </div>
      </div>
    </div>

<!-- plan -->
      
     <h3 class="label_1_semibold primary_text_color mt-6xl md:mt-10xl">Usage</h3>
     <div class="gap-xxl mt-xxl flex overflow-x-auto hide-scrollbar md:overflow-x-visible">
      <Plan
        title="AI Credits"
        :used="usage.credits.used"
        :total="usage.credits.total"
        :icon="GeminiIcon"
      />

      <Plan
        title="Generated Posts"
        :used="usage.posts.used"
        :total="usage.posts.total"
        :icon="PostIcon"
      />

      <!-- <Plan
        title="Images"
        :used="usage.images.used"
        :total="usage.images.total"
        :icon="GalleryIcon"
      />

      <Plan
        title="Videos"
        :used="usage.videos.used"
        :total="usage.videos.total"
        :icon="PublishIcon"
      /> -->

      <Plan
        title="Products (Brands)"
        :used="usage.products.used"
        :total="usage.products.total"
        :icon="PcircleIcon"
      />
    </div>

    <!-- Payment Method -->
    <div class=" mt-6xl md:mt-10">
      <h3 class="label_1_semibold primary_text_color">
        Payment Method
      </h3>
      <p class="label_1_regular secondary_text_color mt-md">
        Manage your saved payment methods and billing details securely.
      </p>

      <button
        class="rounded-md bg-gray-25 mt-xxl label_1_semibold primary_text_color p-md w-48"
      >
        View Invoices
      </button>
    </div>
  </div>
</template>
<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import Plan from "./Plan.vue";
import api from "@app/services/api.js";
import GeminiIcon from "../../assets/images/GeminiIcon.svg";
import PostIcon from "../../assets/images/PostIcon.svg";
import PcircleIcon from "../../assets/images/PcircleIcon.svg";
import GalleryIcon from "../../assets/images/GalleryIcon.svg";
import PublishIcon from "../../assets/images/PublishIcon.svg";

const showDropdown = ref(false);

const subscription = ref(null);
const subscriptionLoading = ref(true);

const emptyBucket = () => ({ used: 0, total: 0 });

const usage = computed(() => {
  const s = subscription.value;
  return {
    credits: s?.credits ?? emptyBucket(),
    posts: s?.posts ?? emptyBucket(),
    images: s?.images ?? emptyBucket(),
    videos: s?.videos ?? emptyBucket(),
    products: s?.products ?? emptyBucket(),
  };
});

function formatPlanTypeLabel(planType) {
  if (!planType || typeof planType !== 'string') return '-';
  const t = planType.trim();
  if (!t) return '-';
  return `${t.charAt(0).toUpperCase()}${t.slice(1).toLowerCase()} plan`;
}

const planLabel = computed(() => {
  if (subscriptionLoading.value) return '-';
  return formatPlanTypeLabel(subscription.value?.planName ?? '');
});

const planPriceDisplay = computed(() => {
  if (subscriptionLoading.value) return '-';
  const raw = subscription.value?.planPrice;
  if (raw === undefined || raw === null || raw === '') return '-';
  if (typeof raw === 'number' && Number.isFinite(raw)) {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(raw);
  }
  return String(raw);
});

const renewAtDisplay = computed(() => {
  if (subscriptionLoading.value) return '-';
  const iso = subscription.value?.expiryDate;
  if (!iso) return '-';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '-';
  return d.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
});

async function loadSubscription() {
  subscriptionLoading.value = true;
  try {
    const { data } = await api.get('/api/subscription');
    subscription.value = data;
  } catch (e) {
    console.error('GET /api/subscription failed:', e);
    subscription.value = null;
  } finally {
    subscriptionLoading.value = false;
  }
}

const toggleDropdown = () => {
  showDropdown.value = !showDropdown.value;
};

const handleCancelPlan = () => {
  // Add your cancel plan logic here
  console.log('Cancel Plan clicked');
  showDropdown.value = false;
};

const handleClickOutside = (event) => {
  if (!event.target.closest('.dropdown-container')) {
    showDropdown.value = false;
  }
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
  loadSubscription();
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>
