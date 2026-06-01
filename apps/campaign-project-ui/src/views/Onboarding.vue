<template>
  <div class="flex-1 bg_primary_color px-3xl py-12xl md:px-10xl lg:py-10xl h-[100vh] flex items-center justify-center">
    <!-- Card -->
    <div class="flex flex-col w-7/12 h-full">
        <!-- logo -->

      <div class=" justify-center mb-5xl top-md md:top-8xl lg:left-8 flex items-center gap-md border_none">
         <div class="h-6 w-6 rounded-full bg-gradient-to-r from-purple-500 to-pink-500"></div>
         <span class="heading_h5_semibold gradient_text_color">Genius AI</span>
    </div>

      <!-- Header Section -->
      <div class=" bg_secondary_color rounded-2xl p-6xl primary_border_color">
        
        <h1 class="heading_h6_bold primary_text_color">
          Create a new product
        </h1>
        <p class="label_1_regular secondary_text_color mt-md">
          Add your brand details and link social platforms for automated posting.
        </p>
      <!-- Step Navigation -->
      <div ref="scrollContainer" class="overflow-x-auto mt-6xl scrollbar-hide">
        <div class="flex items-center  min-w-max gap-3xl">
          <!-- Step 1: Brand Info -->
          <div ref="step1Ref" class="flex items-center flex-shrink-0">
            <div
              class="flex items-center justify-center rounded-lg px-3xl md:px-3xl py-xl border border-blue-50 whitespace-nowrap profile_tab_border"
              :class="currentStep === 1 ? 'bg-blue-25' : currentStep > 1 ? 'bg-blue-25' : 'bg_secondary_color'"
            > 
              <span class="body_3_medium text-blue-300">1. Brand Info</span>
            </div>
          </div>
          <!-- Step 2: Brand Identity -->
          <div ref="step2Ref" class="flex items-center flex-shrink-0">
            <div
              class="flex items-center justify-center rounded-lg px-3xl md:px-3xl py-xl border border-blue-50 whitespace-nowrap profile_tab_border"
              :class="currentStep === 2 ? 'bg-blue-25' : currentStep > 2 ? 'bg-blue-25' : 'bg_secondary_color'"
            >
              <span class="body_3_medium text-blue-300">2. Brand Identity</span>
            </div>
          </div>
          <!-- Step 3: Social Connections -->
          <div ref="step3Ref" class="flex items-center flex-shrink-0">
            <div
              class="flex items-center justify-center rounded-lg px-3xl md:px-3xl py-xl border border-blue-50 whitespace-nowrap profile_tab_border"
              :class="currentStep === 3 ? 'bg-blue-25' : 'bg_secondary_color'"
            >
              <span class="body_3_medium text-blue-300">3. Data Source</span>
            </div>
          </div>
        </div>
      </div>
      </div>
    <div class="flex-1 mt-6xl">
      <!-- Step 1: Brand Info -->
      <BrandInfo
        v-if="currentStep === 1"
        v-model:website-url="websiteUrl"
        @files-selected="handleFilesSelected"
        @validation-change="handleValidationChange"
      />

      <!-- Step 2: Brand Identity -->
      <BrandIdentity
        ref="brandIdentityRef"
        v-if="currentStep === 2"
        v-model:active-tab="activeTab"
        v-model:product-name="productName"
        v-model:description="description"
      />

      <!-- Step 3: Data Source -->
      <DataSource
        v-if="currentStep === 3"
      />
    </div>
      <!-- Bottom Navigation -->
      <div class="bg_secondary_color mt-5xl px-6xl py-xl primary_border_color rounded-lg">
        <p v-if="submitError" class="mb-xl label_2_regular text-error-600">
          {{ submitError }}
        </p>
        <div class="flex items-center justify-between">
          <button
            @click="handleBack"
            :disabled="isSubmitting"
            class="label_1_semibold primary_text_color bg_primary_color primary_border_color px-5xl py-xl rounded-lg disabled:opacity-50"
          >
            Back
          </button>
          <button
            @click="handleContinue"
            :disabled="continueDisabled"
            :class="[
              'flex items-center gap-md rounded-lg px-5xl py-xl',
              continueDisabled
                ? 'modal_disabled_primary_button cursor-not-allowed label_1_semibold'
                : 'modal_primary_button cursor-pointer'
            ]"
          >
            <span>Continue</span>
            <img v-if="!isSubmitting" :src="DoneArrowRight" alt="">
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick, computed } from "vue";
import { useRouter } from "vue-router";
import BrandInfo from "../components/Onboarding/BrandInfo.vue";
import BrandIdentity from "../components/Onboarding/BrandIdentity.vue";
import DataSource from "../components/Onboarding/DataSource.vue";
import DoneArrowRight from "../assets/images/DoneArrowRight.svg";


const currentStep = ref(1);

const emit = defineEmits(["back", "close"]);

const router = useRouter();

const activeTab = ref("product-info");
const websiteUrl = ref("");
const productName = ref("Lumo Vibe");
const description = ref("It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout.");
const isStep1Valid = ref(false);
const brandIdentityRef = ref(null);
const isSubmitting = ref(false);
const submitError = ref("");

/** Snapshot when leaving step 2 — BrandIdentity unmounts on step 3 */
const savedBrandColors = ref(null);
const savedBrandVoice = ref(null);
const savedTypography = ref("Open Sans");
const brandLogoUrl = ref("");

const normalizeWebsite = (raw) => {
  const s = (raw || "").trim();
  if (!s) return "";
  if (!/^https?:\/\//i.test(s)) return `https://${s}`;
  return s;
};

const isValidWebsiteUrl = (url) => {
  if (!url || url.trim() === "") {
    return false;
  }
  
  try {
    // Add protocol if missing
    let urlToCheck = url.trim();
    if (!urlToCheck.startsWith("http://") && !urlToCheck.startsWith("https://")) {
      urlToCheck = "https://" + urlToCheck;
    }
    
    const urlObj = new URL(urlToCheck);
    // Check if it has a valid hostname with at least one dot
    return urlObj.hostname.length > 0 && urlObj.hostname.includes(".");
  } catch {
    return false;
  }
};

const buildProductCreateBody = () => ({
  name: productName.value.trim() || "Untitled product",
  website: normalizeWebsite(websiteUrl.value),
  typography: savedTypography.value || "Open Sans",
  brandColors: savedBrandColors.value || ["#2684FF", "#8CB9FF"],
  brandVoice: savedBrandVoice.value || "friendly",
  brandLogoUrl: brandLogoUrl.value || "",
  additionalInstructions: (description.value || "").trim(),
});

const continueDisabled = computed(
  () =>
    (currentStep.value === 1 && !isValidWebsiteUrl(websiteUrl.value)) || isSubmitting.value
);
// Refs for step navigation scrolling
const scrollContainer = ref(null);
const step1Ref = ref(null);
const step2Ref = ref(null);
const step3Ref = ref(null);

// Auto-scroll to active step
const scrollToActiveStep = () => {
  nextTick(() => {
    if (!scrollContainer.value) return;
    
    let activeStepRef = null;
    switch (currentStep.value) {
      case 1:
        activeStepRef = step1Ref.value;
        break;
      case 2:
        activeStepRef = step2Ref.value;
        break;
      case 3:
        activeStepRef = step3Ref.value;
        break;
    }
    
    if (activeStepRef && scrollContainer.value) {
      activeStepRef.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center'
      });
    }
  });
};

// Watch for step changes and scroll to active step
watch(currentStep, () => {
  submitError.value = "";
  scrollToActiveStep();
}, { immediate: true });

const handleBack = () => {
  if (currentStep.value === 1) {
    // Go back to intro page
    emit("back");
  } else {
    // Go back to previous step
    currentStep.value--;
  }
};

const handleContinue = async () => {
  
  if (currentStep.value === 3) {
    // Final step - submit the form
    isSubmitting.value = true;
    submitError.value = "";
     router.push({ path: '/dashboard', query: { tab: 'chat' } });
    
    try {
      // Save brand identity data before submitting
      if (brandIdentityRef.value) {
        savedBrandColors.value = brandIdentityRef.value.brandColors;
        savedBrandVoice.value = brandIdentityRef.value.brandVoice;
        savedTypography.value = brandIdentityRef.value.typography;
      }
      
      const productData = buildProductCreateBody();
      
     
    } catch (error) {
      submitError.value = "Failed to create product. Please try again.";
    } finally {
      isSubmitting.value = false;
    }
  } else {
    // Move to next step
    currentStep.value++;
  }
};

const handleFilesSelected = (files) => {
  // Handle file upload logic here
};

const handleValidationChange = (validation) => {
  isStep1Valid.value = validation.isValid;
};
</script>

<style scoped>
.scrollbar-hide {
  -ms-overflow-style: none;  /* IE and Edge */
  scrollbar-width: none;  /* Firefox */
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;  /* Chrome, Safari and Opera */
}
</style>

