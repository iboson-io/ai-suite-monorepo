<template>
  <main class="flex-1 bg_primary_color px-3xl py-12xl md:px-10xl lg:py-10xl">
    <div class="max-w-full md:max-w-none">
      <!-- Navigation Tabs -->
      <div class="relative border-b primary_border_color bg_secondary_color rounded-2xl p-xl">
        <!-- Left Arrow Button (Mobile only) -->
        <button
          v-if="canScrollLeft"
          @click.stop="scrollTabs('left')"
          class="absolute left-2 top-1/2 -translate-y-1/2 z-10 md:hidden w-4 h-12 flex items-center justify-center bg_secondary_color"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12.5 5L7.5 10L12.5 15" stroke="#15172E" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>

        <!-- Right Arrow Button (Mobile only) -->
        <button
          v-if="canScrollRight"
          @click.stop="scrollTabs('right')"
          class="absolute right-2 top-1/2 -translate-y-1/2 z-10 md:hidden w-4 h-12 flex items-center justify-center bg_secondary_color"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M7.5 5L12.5 10L7.5 15" stroke="#15172E" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>

        <!-- Tabs Container -->
        <div 
          ref="tabsContainer"
          class="flex gap-xs md:gap-6xl overflow-x-auto scrollbar-hide lg:overflow-visible scroll-smooth mx-auto"
          @scroll="checkScrollPosition"
        >
          <button
            v-for="(tab, index) in tabs"
            :key="tab.id"
            :ref="el => { if (el) tabRefs[tab.id] = el }"
            @click="handleTabClick(tab.id, index)"
            :class="[
              'flex items-center justify-center gap-sm md:gap-xl p-xl rounded-xl transition-colors relative flex-shrink-0 tab-button',
              activeTab === tab.id
                ? 'label_2_semibold primary_text_color bg-info-50'
                : 'label_2_semibold secondary_text_color hover:bg-info-50'
            ]"
          >
            <!-- Icon -->
            <div class="flex-shrink-0 icon-wrapper">
              <component 
                :is="tab.iconComponent" 
                :class="[activeTab === tab.id ? 'text-[#000000]' : 'text-current']"
              />
            </div>
            <span>{{ tab.label }}</span>
          </button>
        </div>
      </div>

      <!-- Tab Content -->
      <div class="mt-5xl ">
        <!-- Account Tab Content -->
        <div v-if="activeTab === 'account'">
          <!-- Profile Information Section -->
             <UserProfile/>
        </div>

        <!-- Billing & Plan Tab Content -->
        <div v-else-if="activeTab === 'billing'">
          <Billing/>
        </div>

        <!-- Localization Tab Content -->
        <div v-else-if="activeTab === 'localization'">
          <Localization />
        </div>

        <!-- Security Tab Content -->
        <div v-else-if="activeTab === 'security'">
          <Security />
        </div>

        <!-- Data & Privacy Settings Tab Content -->
        <div v-else-if="activeTab === 'data-privacy'">
          <DataPrivacySettings/>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref, reactive, h, onMounted, nextTick } from "vue";
import UserProfile from "../components/settings/UserProfile.vue"
import Billing from "../components/settings/Billing.vue"
import Localization from "../components/settings/localization.vue"
import Security from "../components/settings/Security.vue"
import DataPrivacySettings from "../components/settings/DataPrivacySettings.vue"

const PersonIcon = (props) =>
  h("svg", { 
    width: "20", 
    height: "20", 
    viewBox: "0 0 20 20", 
    fill: "none",
    class: props?.class || ""
  }, [
    h("path", {
      d: "M5 17.5V15.8333C5 14.9493 5.35119 14.1014 5.97631 13.4763C6.60143 12.8512 7.44928 12.5 8.33333 12.5H11.6667C12.5507 12.5 13.3986 12.8512 14.0237 13.4763C14.6488 14.1014 15 14.9493 15 15.8333V17.5M6.66667 5.83333C6.66667 6.71739 7.01786 7.56523 7.64298 8.19036C8.2681 8.81548 9.11594 9.16667 10 9.16667C10.8841 9.16667 11.7319 8.81548 12.357 8.19036C12.9821 7.56523 13.3333 6.71739 13.3333 5.83333C13.3333 4.94928 12.9821 4.10143 12.357 3.47631C11.7319 2.85119 10.8841 2.5 10 2.5C9.11594 2.5 8.2681 2.85119 7.64298 3.47631C7.01786 4.10143 6.66667 4.94928 6.66667 5.83333Z",
      stroke: "currentColor",
      "stroke-width": "1.5",
      "stroke-linecap": "round",
      "stroke-linejoin": "round",
    }),
  ]);



const MoneyIcon = (props) =>
  h("svg", { 
    width: "20", 
    height: "20", 
    viewBox: "0 0 20 20", 
    fill: "none",
    class: props?.class || ""
  }, [
    h("path", {
      d: "M10.8333 16.6673H4.16667C3.72464 16.6673 3.30072 16.4917 2.98816 16.1792C2.67559 15.8666 2.5 15.4427 2.5 15.0007V5.00065C2.5 4.55862 2.67559 4.1347 2.98816 3.82214C3.30072 3.50958 3.72464 3.33398 4.16667 3.33398H15.8333C16.2754 3.33398 16.6993 3.50958 17.0118 3.82214C17.3244 4.1347 17.5 4.55862 17.5 5.00065V8.75065M7.5 14.1673H10.8333M17.5 12.5007H15.4167C15.0851 12.5007 14.7672 12.6323 14.5328 12.8668C14.2984 13.1012 14.1667 13.4191 14.1667 13.7507C14.1667 14.0822 14.2984 14.4001 14.5328 14.6345C14.7672 14.869 15.0851 15.0007 15.4167 15.0007H16.25C16.5815 15.0007 16.8995 15.1323 17.1339 15.3668C17.3683 15.6012 17.5 15.9191 17.5 16.2507C17.5 16.5822 17.3683 16.9001 17.1339 17.1345C16.8995 17.369 16.5815 17.5007 16.25 17.5007H14.1667M15.8333 17.5007V18.334M15.8333 11.6673V12.5007",
      stroke: "currentColor",
      "stroke-width": "1.5",
      "stroke-linecap": "round",
      "stroke-linejoin": "round",
    }),
  ]);

const GlobeIcon = (props) =>
  h("svg", { 
    width: "20", 
    height: "20", 
    viewBox: "0 0 20 20", 
    fill: "none",
    class: props?.class || ""
  }, [
    h("path", {
      d: "M3 7.5H17M3 12.5H17M9.58333 2.5C8.17945 4.74968 7.43517 7.34822 7.43517 10C7.43517 12.6518 8.17945 15.2503 9.58333 17.5M10.4167 2.5C11.8205 4.74968 12.5648 7.34822 12.5648 10C12.5648 12.6518 11.8205 15.2503 10.4167 17.5M2.5 10C2.5 10.9849 2.69399 11.9602 3.0709 12.8701C3.44781 13.7801 4.00026 14.6069 4.6967 15.3033C5.39314 15.9997 6.21993 16.5522 7.12987 16.9291C8.03982 17.306 9.01509 17.5 10 17.5C10.9849 17.5 11.9602 17.306 12.8701 16.9291C13.7801 16.5522 14.6069 15.9997 15.3033 15.3033C15.9997 14.6069 16.5522 13.7801 16.9291 12.8701C17.306 11.9602 17.5 10.9849 17.5 10C17.5 8.01088 16.7098 6.10322 15.3033 4.6967C13.8968 3.29018 11.9891 2.5 10 2.5C8.01088 2.5 6.10322 3.29018 4.6967 4.6967C3.29018 6.10322 2.5 8.01088 2.5 10Z",
      stroke: "currentColor",
      "stroke-width": "1.5",
      "stroke-linecap": "round",
      "stroke-linejoin": "round",
    }),
  ]);

const ShieldIcon = (props) =>
  h("svg", { 
    width: "20", 
    height: "20", 
    viewBox: "0 0 20 20", 
    fill: "none",
    class: props?.class || ""
  }, [
    h("path", {
      d: "M10 10C9.779 10 9.56703 9.9122 9.41075 9.75592C9.25447 9.59964 9.16668 9.38768 9.16668 9.16667C9.16668 8.94565 9.25447 8.73369 9.41075 8.57741C9.56703 8.42113 9.779 8.33333 10 8.33333C10.221 8.33333 10.433 8.42113 10.5893 8.57741C10.7455 8.73369 10.8333 8.94565 10.8333 9.16667C10.8333 9.38768 10.7455 9.59964 10.5893 9.75592C10.433 9.9122 10.221 10 10 10ZM10 10V12.0833M10 2.5C11.9466 4.22215 14.4871 5.11881 17.0834 5C17.4614 6.28585 17.577 7.63456 17.4235 8.96598C17.2699 10.2974 16.8503 11.5844 16.1895 12.7504C15.5288 13.9165 14.6403 14.9378 13.5771 15.7537C12.5138 16.5696 11.2973 17.1635 10 17.5C8.7027 17.1635 7.48626 16.5696 6.42298 15.7537C5.3597 14.9378 4.47128 13.9165 3.81052 12.7504C3.14976 11.5844 2.73014 10.2974 2.57659 8.96598C2.42304 7.63456 2.5387 6.28585 2.91669 5C5.51296 5.11881 8.0535 4.22215 10 2.5Z",
      stroke: "currentColor",
      "stroke-width": "1.5",
      "stroke-linecap": "round",
      "stroke-linejoin": "round",
    }),
  ]);

const DatabaseIcon = (props) =>
  h("svg", { 
    width: "20", 
    height: "20", 
    viewBox: "0 0 20 20", 
    fill: "none",
    class: props?.class || ""
  }, [
    h("path", {
      d: "M3.33325 5C3.33325 5.66304 4.03563 6.29893 5.28587 6.76777C6.53612 7.23661 8.23181 7.5 9.99992 7.5C11.768 7.5 13.4637 7.23661 14.714 6.76777C15.9642 6.29893 16.6666 5.66304 16.6666 5M3.33325 5C3.33325 4.33696 4.03563 3.70107 5.28587 3.23223C6.53612 2.76339 8.23181 2.5 9.99992 2.5C11.768 2.5 13.4637 2.76339 14.714 3.23223C15.9642 3.70107 16.6666 4.33696 16.6666 5M3.33325 5V10M16.6666 5V10M3.33325 10C3.33325 10.663 4.03563 11.2989 5.28587 11.7678C6.53612 12.2366 8.23181 12.5 9.99992 12.5C11.768 12.5 13.4637 12.2366 14.714 11.7678C15.9642 11.2989 16.6666 10.663 16.6666 10M3.33325 10V15C3.33325 15.663 4.03563 16.2989 5.28587 16.7678C6.53612 17.2366 8.23181 17.5 9.99992 17.5C11.768 17.5 13.4637 17.2366 14.714 16.7678C15.9642 16.2989 16.6666 15.663 16.6666 15V10",
      stroke: "currentColor",
      "stroke-width": "1.5",
      "stroke-linecap": "round",
      "stroke-linejoin": "round",
    }),
  ]);

// Tab navigation
const activeTab = ref("account");
const tabsContainer = ref(null);
const tabRefs = ref({});
const canScrollLeft = ref(false);
const canScrollRight = ref(true);

const tabs = [
  {
    id: "account",
    label: "Account",
    iconComponent: PersonIcon,
  },
  {
    id: "billing",
    label: "Billing & Plan",
    iconComponent: MoneyIcon,
  },
  {
    id: "localization",
    label: "Localization",
    iconComponent: GlobeIcon,
  },
  {
    id: "security",
    label: "Security",
    iconComponent: ShieldIcon,
  },
  {
    id: "data-privacy",
    label: "Data & Privacy Settings",
    iconComponent: DatabaseIcon,
  },
];

const checkScrollPosition = () => {
  if (!tabsContainer.value) return;
  
  const container = tabsContainer.value;
  const scrollLeft = container.scrollLeft;
  const scrollWidth = container.scrollWidth;
  const clientWidth = container.clientWidth;
  
  // Only show arrows if content overflows
  const needsScrolling = scrollWidth > clientWidth;
  
  if (!needsScrolling) {
    canScrollLeft.value = false;
    canScrollRight.value = false;
    return;
  }
  
  // Check if we can scroll left
  canScrollLeft.value = scrollLeft > 5; // Small threshold for rounding
  
  // Check if we can scroll right (with a small threshold to account for rounding)
  canScrollRight.value = scrollLeft < (scrollWidth - clientWidth - 5);
};

const handleTabClick = (tabId, index) => {
  // Set active tab first
  activeTab.value = tabId;
  
  // Scroll to tab on mobile
  nextTick(() => {
    if (tabRefs.value && tabRefs.value[tabId] && tabsContainer.value) {
      const tabElement = tabRefs.value[tabId];
      
      // Scroll the tab into view (centered if possible)
      tabElement.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'nearest',
        inline: 'center'
      });
      
      // Update scroll position after scroll
      setTimeout(checkScrollPosition, 300);
    }
  });
};

const scrollTabs = (direction) => {
  if (!tabsContainer.value) return;
  
  const container = tabsContainer.value;
  const containerWidth = container.clientWidth;
  
  // On mobile, we show 2 tabs, so scroll by half the container width (one tab)
  // On desktop, calculate based on actual tab width
  const isMobile = window.innerWidth < 768;
  let scrollAmount;
  
  if (isMobile) {
    // Scroll by half container width (one tab) + gap
    scrollAmount = (containerWidth / 2) + 4; // gap-1 = 4px
  } else {
    // Get the first visible tab button to calculate width
    const firstButton = container.querySelector('button');
    if (!firstButton) return;
    const tabWidth = firstButton.offsetWidth;
    const gap = 20; // gap-5 = 20px on desktop
    scrollAmount = tabWidth + gap;
  }
  
  if (direction === 'left') {
    container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
  } else {
    container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  }
  
  // Check position after a short delay to allow smooth scroll to complete
  setTimeout(checkScrollPosition, 100);
};

onMounted(() => {
  nextTick(() => {
    checkScrollPosition();
    // Also check on window resize
    window.addEventListener('resize', checkScrollPosition);
  });
});


</script>

<style scoped>
.scrollbar-hide {
  -ms-overflow-style: none;  /* IE and Edge */
  scrollbar-width: none;  /* Firefox */
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;  /* Chrome, Safari and Opera */
}

/* Mobile: Show only 2 tabs at a time */
@media (max-width: 767px) {
  .tabs-container {
    max-width: calc(100% - 80px);
    margin-left: auto;
    margin-right: auto;
  }
  
  .tab-button {
    min-width: calc(50% - 2px);
    flex: 0 0 calc(50% - 2px);
    max-width: calc(50% - 2px);
    padding: 0.625rem 0.5rem;
  }
  
  .tab-button span {
    font-size: 0.75rem;
    line-height: 1rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    display: block;
    max-width: 100%;
  }
  
  .tab-button .icon-wrapper {
    width: 16px;
    height: 16px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .tab-button .icon-wrapper svg {
    width: 16px !important;
    height: 16px !important;
  }
}

/* Desktop: Normal behavior */
@media (min-width: 768px) {
  .tabs-container {
    max-width: 100%;
  }
  
  .tab-button {
    min-width: auto;
    flex: 0 0 auto;
  }
}
</style>

