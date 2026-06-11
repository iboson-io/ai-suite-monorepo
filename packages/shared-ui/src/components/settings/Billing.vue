<template>
  <div class="rounded-2xl bg_secondary_color p-6xl shadow-sm h-[100%] data-privacy-full-height overflow-y-auto">
    <!-- Header -->
    <h2 class="heading_h6_semibold primary_text_color">Billing & Plan</h2>
    <p class="label_1_regular secondary_text_color mt-md">
      View your plan, manage payments, and track AI credits.
    </p>

    <!-- Loader -->
    <div v-if="isLoading" class="flex items-center justify-center py-20">
      <div class="text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p class="label_1_medium primary_text_color">Loading plans and billing information...</p>
      </div>
    </div>

    <div v-else>
      <!-- Current Plan View -->
      <div v-if="!showPlansView">
        <!-- Current Plan Card -->
        <div class="mt-3xl md:mt-10xl">
          <h3 class="label_1_semibold primary_text_color">Current Plan</h3>

          <div class="grid grid-cols-1 gap-md md:grid-cols-2 md:gap-md primary_border_color rounded-lg p-4xl mt-4xl">
            <!-- Plan Info -->
            <div>
              <p class="label_2_medium secondary_text_color">{{ planLabel }}</p>
              <p class="heading_h6_semibold mt-3xl primary_text_color">{{ planPriceDisplay }}</p>

              <div class="mt-xl flex items-center gap-4xl">
                <button
                  @click="goToPlansView"
                  class="primary_add_button p-md w-4/5 lg:button_width"
                >
                  Upgrade Plan
                </button>

                <div class="relative dropdown-container">
                  <button
                    @click.stop="toggleDropdown"
                    class="h-9 w-9 rounded-lg border primary_border_color secondary_text_color flex items-center justify-center font-bold"
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
                      <span class="label_2_regular text-red-600 font-medium">Cancel Plan</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Horizontal line (Mobile only) -->
            <div class="block md:hidden h-[2px] w-full bg-gray-25 my-4"></div>

            <!-- Renew Section -->
            <div class="flex">
              <!-- Vertical line (Desktop only) -->
              <div class="hidden md:block w-[2px] h-28 bg-gray-25 mr-5xl"></div>

              <div class="w-[100%]">
                <p class="label_2_medium secondary_text_color">Renew at / Next Billing</p>
                <p class="heading_h6_semibold mt-3xl primary_text_color">{{ renewAtDisplay }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Usage Section -->
        <h3 v-if="hasUsageInfo" class="label_1_semibold primary_text_color mt-6xl md:mt-10xl">Usage</h3>
        <div v-if="hasUsageInfo" class="gap-xxl mt-xxl flex overflow-x-auto hide-scrollbar md:overflow-x-visible">
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

          <Plan
            title="Products (Brands)"
            :used="usage.products.used"
            :total="usage.products.total"
            :icon="PcircleIcon"
          />
        </div>

        <!-- Payment Method Section -->
        <div class="mt-6xl md:mt-10 pt-6 border-t primary_border_color">
          <h3 class="label_1_semibold primary_text_color">Payment Method</h3>
          <p class="label_2_regular secondary_text_color mt-md">
            Manage your saved payment methods and billing details securely.
          </p>

          <button
            @click="showInvoices = !showInvoices"
            class="rounded-md bg-gray-25 mt-xxl label_1_semibold primary_text_color p-md w-48 border primary_border_color hover:bg-gray-100 transition-colors"
          >
            {{ showInvoices ? 'Hide Invoices' : 'View Invoices' }}
          </button>
        </div>

        <!-- Billing History Section -->
        <div class="mt-8 border-t primary_border_color pt-8" v-if="showInvoices">
          <div v-if="purchaseHistoryData?.transactions && purchaseHistoryData?.transactions?.length > 0">
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-md">
              <div>
                <h3 class="label_1_semibold primary_text_color">Billing History</h3>
                <p class="label_2_regular secondary_text_color mt-1">Download previous invoices.</p>
              </div>
              <button 
                @click="downloadAllInvoices"
                class="flex items-center justify-center bg-gray-25 text-gray-900 border primary_border_color px-4 py-2 rounded-lg label_2_semibold hover:bg-gray-100 transition-colors"
              >
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download Selected
              </button>
            </div>

            <div class="overflow-x-auto border primary_border_color rounded-xl bg_secondary_color">
              <table class="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr class="border-b primary_border_color bg-gray-25 label_2_semibold primary_text_color">
                    <th class="py-3.5 px-4 w-1/2">
                      <div class="flex items-center">
                        <input 
                          type="checkbox" 
                          v-model="selectAll" 
                          @change="toggleSelectAll" 
                          class="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-4 w-4 cursor-pointer"
                        />
                        <span class="ml-3">Invoice</span>
                      </div>
                    </th>
                    <th class="py-3.5 px-4">Amount</th>
                    <th class="py-3.5 px-4">Date</th>
                    <th class="py-3.5 px-4">Status</th>
                    <th class="py-3.5 px-4 w-12"></th>
                  </tr>
                </thead>
                <tbody>
                  <tr 
                    v-for="payment in paginatedPayments" 
                    :key="payment.id"
                    class="border-b last:border-none primary_border_color label_2_regular primary_text_color hover:bg-gray-25/50"
                  >
                    <td class="py-3 px-4">
                      <div class="flex items-center">
                        <input 
                          type="checkbox" 
                          :checked="selectedInvoices.includes(payment.id)"
                          @change="(e) => toggleInvoiceSelection(payment.id, e.target.checked)"
                          class="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-4 w-4 cursor-pointer"
                        />
                        <span class="ml-3 font-medium">{{ (payment.subscription_details?.plan_name || 'Payment') }}-{{ new Date(payment.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long' }) }}</span>
                      </div>
                    </td>
                    <td class="py-3 px-4">{{ formatCurrency(parseFloat(payment.amount), payment.currency) }}</td>
                    <td class="py-3 px-4">{{ formatDate(payment.created_at) }}</td>
                    <td class="py-3 px-4">
                      <span 
                        class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold"
                        :class="getStatusClass(payment.status)"
                      >
                        {{ payment.status === 'completed' ? 'Paid' : payment.status }}
                      </span>
                    </td>
                    <td class="py-3 px-4 text-right">
                      <button 
                        @click="downloadInvoice(payment.subscription_details, payment.status, payment.id)"
                        class="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                        title="Download PDF"
                      >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Pagination -->
            <div class="flex items-center justify-between mt-4">
              <span class="label_2_regular secondary_text_color">
                Showing page {{ currentPage }} of {{ totalPages }}
              </span>
              <div class="flex items-center space-x-2">
                <button 
                  @click="previousPage"
                  :disabled="currentPage === 1"
                  class="px-3 py-1.5 border primary_border_color rounded-lg label_2_medium text-gray-500 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button 
                  @click="nextPage"
                  :disabled="currentPage === totalPages"
                  class="px-3 py-1.5 border primary_border_color rounded-lg label_2_medium text-gray-500 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
          <div v-else class="py-6 text-center label_2_regular secondary_text_color bg-gray-25/50 rounded-xl border primary_border_color">
            No invoices found.
          </div>
        </div>
      </div>

      <!-- Upgrade Plans View -->
      <div v-else class="mt-3xl md:mt-10xl">
        <div class="mb-6">
          <button 
            @click="goBackToCurrentPlanView"
            class="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <svg width="20" height="18" viewBox="0 0 14 9" class="mr-4" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M0.75 4.5H13.25M0.75 4.5L4.5 8.25M0.75 4.5L4.5 0.75" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span class="label_2_semibold primary_text_color">Back to Current Plan</span>
          </button>
        </div>

        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 border-b primary_border_color pb-4 gap-md">
          <div>
            <h3 class="label_1_semibold primary_text_color">Choose a Plan</h3>
            <p class="label_2_regular secondary_text_color mt-1">Upgrade or modify your current subscription cycle.</p>
          </div>

          <!-- Billing Cycle Toggle -->
          <div class="flex flex-col items-center sm:items-end">
            <div class="flex items-center space-x-3">
              <span class="label_2_medium primary_text_color">Billed monthly</span>
              <button 
                @click="toggleBillingCycle"
                class="relative inline-flex h-6 w-11 rounded-full transition-colors duration-200 ease-in-out bg-blue-600"
              >
                <span 
                  class="inline-block h-5 w-5 transform rounded-full bg-white transition duration-200 ease-in-out mt-[2px]"
                  :class="billingCycle === 'yearly' ? 'translate-x-5' : 'translate-x-1'"
                ></span>
              </button>
              <span class="label_2_medium primary_text_color">Billed yearly</span>
            </div>
            <div class="mt-1 text-blue-600 text-xs font-semibold">
              Save up to 20% with yearly billing
            </div>
          </div>
        </div>

        <!-- Available Plans Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div 
            v-for="plan in getPlansForBillingCycle()" 
            :key="plan.id"
            class="relative border primary_border_color rounded-2xl p-6xl bg_secondary_color transition-all duration-200 hover:shadow-lg flex flex-col justify-between"
          >
            <!-- Most Popular Badge -->
            <div v-if="plan.popular" class="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <span class="bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full">
                Most Popular
              </span>
            </div>

            <div class="mb-6">
              <h4 class="text-xl font-bold mb-2 primary_text_color">{{ plan.name }}</h4>
              <p class="label_2_regular secondary_text_color mb-4 leading-relaxed min-h-[40px]">{{ getPlanDescription(plan.name) }}</p>
              <div class="flex items-baseline border-t primary_border_color pt-4">
                <span class="text-2xl font-bold primary_text_color">{{ getPlanPrice(plan) }}</span>
                <span v-if="plan.name !== 'Enterprise'" class="text-sm ml-1 secondary_text_color">/month</span>
              </div>
            </div>

            <div class="mb-6 border-t primary_border_color pt-4 flex-1">
              <p class="label_2_semibold primary_text_color mb-3">{{ plan.name }} features:</p>
              <ul class="space-y-3">
                <li 
                  v-for="feature in getPlanFeatures(plan.name)" 
                  :key="feature"
                  class="flex items-start label_2_regular secondary_text_color"
                >
                  <svg class="w-4 h-4 text-green-500 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span>{{ feature }}</span>
                </li>
              </ul>
            </div>

            <button 
              @click="selectPlan(plan)"
              :disabled="plan.current || loadingStates[plan.id]"
              class="w-full py-3 px-4 rounded-lg font-medium transition-colors text-base mt-auto"
              :class="[
                plan.current
                  ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              ]"
            >
              <span v-if="loadingStates[plan.id]" class="flex items-center justify-center">
                <svg class="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
              <span v-else>
                {{ getPlanButtonText(plan) }}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Cancel Plan Confirmation Modal -->
    <div
      v-if="showCancelConfirmationModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      @click.self="closeCancelConfirmationModal"
    >
      <div class="bg_secondary_color rounded-2xl max-w-md w-full p-6xl shadow-2xl border primary_border_color mx-4">
        <h3 class="heading_h6_semibold primary_text_color mb-2">Cancel Subscription?</h3>
        <p class="label_2_regular secondary_text_color mb-6">
          You'll lose access to paid features at the end of your current billing cycle. This action cannot be undone.
        </p>
        <div class="flex justify-end gap-md">
          <button
            @click="closeCancelConfirmationModal"
            class="px-5xl py-2 rounded-lg label_1_semibold bg-gray-25 text-gray-900 border primary_border_color hover:bg-gray-100 transition-colors"
          >
            Keep Plan
          </button>
          <button
            @click="confirmCancelPlan"
            :disabled="isCancelling"
            class="px-5xl py-2 rounded-lg label_1_semibold bg-red-600 text-white hover:bg-red-700 transition-colors flex items-center gap-md disabled:opacity-50"
          >
            <svg v-if="isCancelling" class="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {{ isCancelling ? 'Cancelling...' : 'Confirm Cancel' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import Plan from "./Plan.vue";
import * as billingService from "@app/services/settings/billing.js";
import * as userProfileService from "@app/services/settings/userProfile.js";
import GeminiIcon from "../../assets/images/GeminiIcon.svg";
import PostIcon from "../../assets/images/PostIcon.svg";
import PcircleIcon from "../../assets/images/PcircleIcon.svg";
import GalleryIcon from "../../assets/images/GalleryIcon.svg";
import PublishIcon from "../../assets/images/PublishIcon.svg";

// Safely destructure billing functions with defaults to prevent compile/runtime breaks in other apps
const {
  fetchSubscription,
  fetchAvailablePlans = async () => ({ plans: [] }),
  fetchPurchaseHistory = async () => ({ transactions: [], pagination: { current_page: 1, total_pages: 1, total_items: 0 } }),
  cancelSubscription = async () => {},
  upgradePlan = async () => {},
  getPaymentById = async () => ({}),
  getPaymentByIdNotSubscription = async () => ({})
} = billingService;

const fetchUserProfileApi = userProfileService.fetchUserProfile || (async () => null);

// Reactive States
const showDropdown = ref(false);
const showPlansView = ref(false);
const billingCycle = ref('monthly');
const isLoading = ref(true);
const isCancelling = ref(false);
const showCancelConfirmationModal = ref(false);
const showInvoices = ref(false);

const subscription = ref(null);
const availablePlans = ref({ plans: [] });
const purchaseHistoryData = ref({ transactions: [], pagination: {} });
const profile = ref(null);

const loadingStates = ref({});
const selectedInvoices = ref([]);
const selectAll = ref(false);

// Pagination
const currentPage = ref(1);
const itemsPerPage = ref(2);

// Computed Mappings
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

const hasUsageInfo = computed(() => {
  const s = subscription.value;
  return s && (
    (s.credits && s.credits.total > 0) ||
    (s.posts && s.posts.total > 0) ||
    (s.products && s.products.total > 0)
  );
});

function formatPlanTypeLabel(planType) {
  if (!planType || typeof planType !== 'string') return '-';
  const t = planType.trim();
  if (!t || t.toLowerCase() === 'free') return 'Free';
  return `${t.charAt(0).toUpperCase()}${t.slice(1).toLowerCase()} plan`;
}

const planLabel = computed(() => {
  if (isLoading.value) return '-';
  return formatPlanTypeLabel(subscription.value?.planName ?? 'Free');
});

const planPriceDisplay = computed(() => {
  if (isLoading.value) return '-';
  const raw = subscription.value?.planPrice;
  if (raw === undefined || raw === null || raw === '') return '-';
  if (typeof raw === 'number' && Number.isFinite(raw)) {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(raw);
  }
  return String(raw);
});

const renewAtDisplay = computed(() => {
  if (isLoading.value) return '-';
  const iso = subscription.value?.expiryDate;
  if (!iso) return 'N/A';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return 'N/A';
  return d.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
});

const paginatedPayments = computed(() => {
  return purchaseHistoryData.value?.transactions || [];
});

const totalPages = computed(() => {
  return purchaseHistoryData.value?.pagination?.total_pages || 1;
});

// Plans Cycles Feature Maps
const planFeatures = {
  'Starter': ['No of sessions: 1000', 'No of agents: 1', 'White labeling'],
  'Growth': ['No of sessions: 10000', 'No of agents: 1', 'White labeling'],
  'Enterprise': ['No of sessions: Custom', 'No of agents: Custom', 'White labeling']
};

const planDescriptions = {
  'Starter': 'Ideal for individuals or small teams starting their AI journey. Build and deploy your first agent with essential features.',
  'Growth': 'Best for growing teams who need scale and flexibility. Run more sessions, refine agents, & unlock advanced customization.',
  'Enterprise': 'Designed for businesses with large-scale needs. Get custom sessions, multiple agents, and full white-label solutions.'
};

const getPlansForBillingCycle = () => {
  if (!availablePlans.value || !availablePlans.value.plans) {
    return [];
  }
  
  let plans = availablePlans.value.plans
    .filter(plan => plan.billing_interval === billingCycle.value)
    .map(plan => ({
      ...plan,
      popular: plan.name === 'Growth',
      current: isCurrentPlan(plan)
    }));
  
  const hasEnterprise = plans.some(plan => plan.name === 'Enterprise');
  
  if (!hasEnterprise) {
    const enterprisePlan = {
      id: `enterprise-${billingCycle.value}`,
      name: 'Enterprise',
      billing_interval: billingCycle.value,
      amount: 'Custom pricing',
      popular: false,
      current: isCurrentPlan({ name: 'Enterprise', billing_interval: billingCycle.value })
    };
    plans.push(enterprisePlan);
  }
  
  return plans;
};

const isCurrentPlan = (plan) => {
  if (!subscription.value) return false;
  
  const currentPlanName = subscription.value.planName?.toLowerCase().trim();
  const planName = plan.name?.toLowerCase().trim();
  
  const currentBillingInterval = subscription.value.billingInterval?.toLowerCase().trim() || 'monthly';
  const planBillingInterval = plan.billing_interval?.toLowerCase().trim() || 'monthly';
  
  return currentPlanName === planName && currentBillingInterval === planBillingInterval;
};

const getPlanFeatures = (planName) => {
  return planFeatures[planName] || ['Standard features', 'Email support'];
};

const getPlanDescription = (planName) => {
  return planDescriptions[planName] || 'Perfect for your needs';
};

const getPlanPrice = (plan) => {
  if (plan.name === 'Enterprise') {
    return 'Custom pricing';
  }
  if (billingCycle.value === 'monthly') {
    switch (plan.name) {
      case 'Starter':
        return '$99';
      case 'Growth':
        return '$499';
    }
  }
  if (billingCycle.value === 'yearly') {
    switch (plan.name) {
      case 'Starter':
        return '$79';
      case 'Growth':
        return '$399';
    }
  }
  return '$' + plan.amount;
};

const getPlanButtonText = (plan) => {
  if (!subscription.value || subscription.value.planName === 'Free') {
    return plan.name === 'Enterprise' ? 'Contact Sales' : 'Choose Plan';
  }
  
  const currentPlanName = subscription.value.planName?.toLowerCase().trim() || '';
  const currentBillingInterval = subscription.value.billingInterval?.toLowerCase().trim() || 'monthly';
  const planName = plan.name?.toLowerCase().trim() || '';
  const planBillingInterval = plan.billing_interval?.toLowerCase().trim() || 'monthly';
  
  const isCurrent = currentPlanName === planName && currentBillingInterval === planBillingInterval;
  
  if (isCurrent) {
    return `You're on ${plan.name}`;
  }
  
  const samePlanDifferentBilling = currentPlanName === planName && currentBillingInterval !== planBillingInterval;
  
  if (samePlanDifferentBilling) {
    if (currentBillingInterval === 'monthly' && planBillingInterval === 'yearly') {
      return 'Upgrade to Yearly';
    }
    if (currentBillingInterval === 'yearly' && planBillingInterval === 'monthly') {
      return 'Switch to Monthly';
    }
  }
  
  const planTiers = ['starter', 'growth', 'enterprise'];
  const currentTierIndex = planTiers.findIndex(tier => tier === currentPlanName);
  const planTierIndex = planTiers.findIndex(tier => tier === planName);
  
  if (planTierIndex > currentTierIndex && currentTierIndex !== -1) {
    if (plan.name === 'Enterprise') {
      return 'Contact Sales';
    }
    return `Upgrade to ${plan.name}`;
  }
  
  if (planTierIndex !== -1 && currentTierIndex !== -1 && planTierIndex < currentTierIndex) {
    return `Downgrade to ${plan.name}`;
  }
  
  if (plan.name === 'Enterprise') {
    return 'Contact Sales';
  }
  
  return 'Choose Plan';
};

// Toggle Cycle
const toggleBillingCycle = () => {
  billingCycle.value = billingCycle.value === 'monthly' ? 'yearly' : 'monthly';
};

// View management
const goToPlansView = () => {
  showPlansView.value = true;
};

const goBackToCurrentPlanView = () => {
  showPlansView.value = false;
};

// Cancel plan handlers
const handleCancelPlan = () => {
  showDropdown.value = false;
  if (!subscription.value?.id) {
    alert('No active subscription found');
    return;
  }
  showCancelConfirmationModal.value = true;
};

const confirmCancelPlan = async () => {
  const activeSubId = subscription.value?.id;
  if (!activeSubId) {
    alert('No active subscription found');
    showCancelConfirmationModal.value = false;
    return;
  }
  
  isCancelling.value = true;
  try {
    await cancelSubscription(activeSubId);
    alert('Plan cancelled successfully');
    await loadSubscriptionData();
    showCancelConfirmationModal.value = false;
  } catch (error) {
    console.error('Error cancelling plan:', error);
    alert(error.message || 'Failed to cancel plan');
  } finally {
    isCancelling.value = false;
  }
};

const closeCancelConfirmationModal = () => {
  showCancelConfirmationModal.value = false;
};

// Purchase select / pagination handlers
const toggleSelectAll = () => {
  if (selectAll.value) {
    selectedInvoices.value = paginatedPayments.value.map(p => p.id);
  } else {
    selectedInvoices.value = [];
  }
};

const toggleInvoiceSelection = (invoiceId, checked) => {
  if (checked) {
    selectedInvoices.value.push(invoiceId);
  } else {
    selectedInvoices.value = selectedInvoices.value.filter(id => id !== invoiceId);
  }
};

const previousPage = async () => {
  if (currentPage.value > 1) {
    currentPage.value--;
    await refreshPurchaseHistory();
  }
};

const nextPage = async () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
    await refreshPurchaseHistory();
  }
};

const refreshPurchaseHistory = async () => {
  try {
    const res = await fetchPurchaseHistory(currentPage.value, itemsPerPage.value);
    purchaseHistoryData.value = res?.data || res || { transactions: [], pagination: {} };
  } catch (e) {
    console.error('Failed to load pagination purchase history:', e);
  }
};

// Choose Plan Handler (Paddle integration)
const selectPlan = async (plan) => {
  if (plan.current) return;
  
  if (plan.name === 'Enterprise') {
    window.location.href = 'mailto:info@iboson.io?subject=Enterprise%20Package';
    return;
  }
  
  loadingStates.value[plan.id] = true;
  try {
    const result = await upgradePlan(plan.id, {
      email: profile.value?.email || '',
      name: profile.value?.username || ''
    });

    if (result && result.status && result.data && result.data.approval_url) {
      window.location.href = result.data.approval_url;
    } else if (result && result.success && result.data?.paypal_approval_url) {
      window.location.href = result.data.paypal_approval_url;
    } else {
      alert('Subscription initiated successfully!');
      await loadSubscriptionData();
      showPlansView.value = false;
    }
  } catch (error) {
    console.error('Plan selection error:', error);
    alert(error.message || 'Failed to select plan');
  } finally {
    loadingStates.value[plan.id] = false;
  }
};

// Invoice formatting utilities
const currencySymbols = {
  'USD': '$',
  'EUR': '€',
  'GBP': '£',
  'JPY': '¥',
  'CAD': 'C$',
  'AUD': 'A$',
  'CHF': 'CHF',
  'CNY': '¥',
  'INR': '₹'
};

const getCurrencySymbol = (code) => {
  return currencySymbols[code?.toUpperCase()] || code || '$';
};

const formatCurrency = (amount, code) => {
  const symbol = getCurrencySymbol(code);
  return `${symbol}${amount.toFixed(2)}`;
};

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'N/A';
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  } catch {
    return 'N/A';
  }
};

const getStatusClass = (status) => {
  switch (status) {
    case 'completed':
      return 'bg-[#DCFCE7] text-green-700';
    case 'failed':
      return 'bg-red-100 text-red-700';
    case 'pending':
      return 'bg-yellow-100 text-yellow-700';
    default:
      return 'bg-gray-100 text-gray-700';
  }
};

// PDF Invoice Download
const downloadInvoice = async (payment, status, id) => {
  try {
    let paymentDetails;
    try {
      if (payment?.subscription_id) {
        paymentDetails = await getPaymentById(payment.subscription_id);
      } else {
        paymentDetails = await getPaymentByIdNotSubscription(id);
      }
    } catch (error) {
      console.error('Error fetching payment details:', error);
      alert('Failed to fetch payment details');
      return;
    }
    
    let paymentData;
    if (paymentDetails?.data?.subscription) {
      paymentData = paymentDetails.data.subscription;
    } else if (paymentDetails?.data?.payment) {
      paymentData = paymentDetails.data.payment;
    } else {
      throw new Error('Payment details not found');
    }
    
    const invoiceNumber = `iBoson-invoice-${paymentData.gateway_subscription_id || paymentData.gateway_payment_id || paymentData.id}`;
    const invoiceDate = paymentData.created_at ? new Date(paymentData.created_at) : new Date();
    
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF('p', 'mm', 'a4');
    
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const contentWidth = pageWidth - (2 * margin);
    let yPosition = 30;
    
    const addRect = (x, y, width, height, color) => {
      doc.setFillColor(color[0], color[1], color[2]);
      doc.rect(x, y, width, height, 'F');
    };

    const addText = (text, x, y, fontSize = 12, fontStyle = 'normal', color = [0, 0, 0]) => {
      doc.setFontSize(fontSize);
      doc.setFont('helvetica', fontStyle);
      doc.setTextColor(color[0], color[1], color[2]);
      doc.text(text, x, y);
    };
    
    const addLine = (x1, y1, x2, y2) => {
      doc.setDrawColor(59, 130, 246);
      doc.line(x1, y1, x2, y2);
      doc.setDrawColor(0, 0, 0);
    };
    
    const wrapText = (text, x, y, maxWidth) => {
      const words = text.split(' ');
      let line = '';
      let currentY = y;
      
      for (let i = 0; i < words.length; i++) {
        const testLine = line + words[i] + ' ';
        const testWidth = doc.getTextWidth(testLine);
        
        if (testWidth > maxWidth && i > 0) {
          doc.text(line, x, currentY);
          line = words[i] + ' ';
          currentY += 7;
        } else {
          line = testLine;
        }
      }
      doc.text(line, x, currentY);
      return currentY + 10;
    };
    
    try {
      doc.addImage('/images/logoMain.png', 'PNG', margin, yPosition, 45, 15);
    } catch (imgError) {
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Genius AI', margin, yPosition + 10);
    }
    
    addText('INVOICE', pageWidth - margin - 30, yPosition, 20, 'bold');
    yPosition += 6;
    addText(`Date: ${new Date().toLocaleDateString()}`, pageWidth - margin - 30, yPosition, 10);
    yPosition += 25;
    
    addText('Bill To:', margin, yPosition, 14, 'bold');
    addText('From:', pageWidth - margin - 60, yPosition, 14, 'bold');
    yPosition += 10;
    
    const customerName = `${profile.value?.username || 'Customer'}`;
    const customerEmail = profile.value?.email || 'N/A';
    
    addText(customerName, margin, yPosition, 12, 'bold');
    addText('iBoson Innovations', pageWidth - margin - 60, yPosition, 12, 'bold');
    yPosition += 5;
    
    addText(customerEmail, margin, yPosition, 10);
    addText('CDAC ACE 1, 3rd Floor', pageWidth - margin - 60, yPosition, 10);
    yPosition += 5;
    
    addText('Technopark Campus', pageWidth - margin - 60, yPosition, 10);
    yPosition += 5;
    
    addText('Trivandrum, Kerala 695581', pageWidth - margin - 60, yPosition, 10);
    yPosition += 5;
    
    addText('Email: info@iboson.io', pageWidth - margin - 60, yPosition, 10);
    yPosition += 5;
    
    addText('Website: www.iboson.io', pageWidth - margin - 60, yPosition, 10);
    yPosition += 20;
    
    addText('Payment Details:', margin, yPosition, 14, 'bold');
    yPosition += 10;
  
    const tableStartY = yPosition;
    const rowHeight = 12;
    const availableWidth = pageWidth - (2 * margin);
    const col1Width = Math.floor(availableWidth * 0.35);
    const col2Width = Math.floor(availableWidth * 0.65);

    addRect(margin, yPosition, col1Width, rowHeight, [59, 130, 246]);
    addRect(margin + col1Width, yPosition, col2Width, rowHeight, [59, 130, 246]);

    addText('DESCRIPTION', margin + 5, yPosition + 8, 12, 'bold', [255, 255, 255]);
    addText('DETAILS', margin + col1Width + 5, yPosition + 8, 12, 'bold', [255, 255, 255]);
    yPosition += rowHeight;

    const tableData = [
      { description: 'Plan Name', details: paymentData.plan_name || '---' },
      { description: 'Transaction Date', details: formatDate(paymentData.created_at) },
      { description: 'Payment Method', details: paymentData.gateway || '---' },
      { description: 'Transaction ID', details: paymentData.gateway_subscription_id || paymentData.gateway_payment_id || paymentData.id },
      { description: 'Billing Period', details: paymentData.billing_interval || '---------' }
    ];

    tableData.forEach((row, index) => {
      const bgColor = index % 2 === 0 ? [255, 255, 255] : [245, 245, 245];
      addRect(margin, yPosition, col1Width, rowHeight, bgColor);
      addRect(margin + col1Width, yPosition, col2Width, rowHeight, bgColor);
      
      addText(row.description, margin + 5, yPosition + 8, 10, 'normal', [0, 0, 0]);
      addText(row.details, margin + col1Width + 5, yPosition + 8, 10, 'normal', [0, 0, 0]);
      yPosition += rowHeight;
    });

    addLine(margin, yPosition, margin + col1Width + col2Width, yPosition);
    yPosition += 15;
    
    const amount = parseFloat(paymentData.plan_amount || paymentData.amount || 0);
    const currency = paymentData.currency || 'USD';
    
    addText('Subtotal:', pageWidth - margin - 80, yPosition, 10);
    addText(formatCurrency(amount, currency), pageWidth - margin - 50, yPosition, 10);
    yPosition += 5;
    
    addText('Total:', pageWidth - margin - 80, yPosition, 12, 'bold');
    addText(formatCurrency(amount, currency), pageWidth - margin - 50, yPosition, 12, 'bold');
    yPosition += 20;
    
    const statusText = `Payment Status: ${status.toUpperCase()}`;
    const statusMessage = status === 'completed' 
      ? 'Payment completed successfully. Thank you for your business!' 
      : status === 'failed'
      ? 'Payment failed. Please contact support for assistance.'
      : 'Payment is pending. Please wait for confirmation.';
    
    const statusColor = status === 'completed' 
      ? [34, 197, 94] 
      : status === 'failed'
      ? [239, 68, 68]
      : [234, 179, 8];
    
    addText(statusText, margin, yPosition, 12, 'bold', statusColor);
    yPosition += 10;
    
    doc.setTextColor(0, 0, 0);
    yPosition = wrapText(statusMessage, margin, yPosition, contentWidth);
    yPosition += 20;
    
    addText('Thank you for choosing iBoson Innovations!', margin + 30 , yPosition, 10, 'bold');
    yPosition += 5;
    addText('For any questions, please contact us at info@iboson.io', margin + 30, yPosition, 9);
    
    const fileName = `invoice-${invoiceNumber}.pdf`;
    doc.save(fileName);
  } catch (error) {
    console.error('Error downloading invoice:', error);
    alert('Failed to download invoice');
  }
};

const downloadAllInvoices = () => {
  if (selectedInvoices.value.length === 0) {
    alert('Please select invoices to download');
    return;
  }
  selectedInvoices.value.forEach(invoiceId => {
    const payment = purchaseHistoryData.value.transactions.find(p => p.id === invoiceId);
    if (payment) {
      downloadInvoice(payment.subscription_details, payment.status, payment.id);
    }
  });
};

// Click outside drop downs
const handleClickOutside = (event) => {
  if (!event.target.closest('.dropdown-container')) {
    showDropdown.value = false;
  }
};

// Load data
async function loadSubscriptionData() {
  isLoading.value = true;
  try {
    // Load subscription details
    const sub = await fetchSubscription();
    subscription.value = sub;

    // Load available plans and purchase history parallelly
    const [plansRes, historyRes] = await Promise.all([
      fetchAvailablePlans().catch(() => ({ plans: [] })),
      fetchPurchaseHistory(currentPage.value, itemsPerPage.value).catch(() => ({ transactions: [], pagination: {} }))
    ]);

    availablePlans.value = plansRes?.data || plansRes || { plans: [] };
    purchaseHistoryData.value = historyRes?.data || historyRes || { transactions: [], pagination: {} };
    
    // Check if user is on Free / has no active plan, auto-show the available plans listing
    if (!sub || sub.planName?.toLowerCase() === 'free') {
      showPlansView.value = true;
    }
  } catch (e) {
    console.error('Failed to load subscription/billing details:', e);
  } finally {
    isLoading.value = false;
  }
}

onMounted(async () => {
  document.addEventListener('click', handleClickOutside);
  await Promise.all([
    loadSubscriptionData(),
    loadProfile()
  ]);
});

async function loadProfile() {
  try {
    profile.value = await fetchUserProfileApi();
  } catch (e) {
    console.error('Failed to load user profile in Billing component:', e);
  }
}

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});

const toggleDropdown = () => {
  showDropdown.value = !showDropdown.value;
};
</script>

<style scoped>
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
