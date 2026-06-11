<template>
  <div class="rounded-2xl bg_secondary_color p-6xl shadow-sm h-[100%] data-privacy-full-height overflow-y-auto"> 
    <!-- Delete Confirmation Modal -->
    <ConfirmDataDeletionModal
      ref="deleteModal"
      :open="showDeleteModal"
      title="Confirm Data Deletion"
      description="To keep your account secure, we've sent a 6-digit verification code to your registered email address. Please enter it below to permanently delete all stored data."
      resend-endpoint="/auth/account/resend-clear-data"
      @close="showDeleteModal = false"
      @delete="handleDeleteData"
    />

    <!-- Success Toast Notification -->
    <SuccessToastNotification
      :open="showSuccessToast"
      main-message="Your account and all data have been permanently deleted."
      secondary-message="You'll be signed out shortly."
      @close="showSuccessToast = false"
    />

    <!-- Header -->
    <h2 class="heading_h6_bold primary_text_color">Data & Privacy Settings</h2>
    <p class="label_1_regular secondary_text_color mt-md">
      Manage how your personal and brand data is stored and used.
    </p>

    <!-- Delete your data -->
    <div class="flex flex-col md:flex-row items-start md:justify-between gap-4xl mt-10xl">
      <div class="flex-1">
        <h3 class="label_1_semibold primary_text_color">Delete your data</h3>
        <p class="label_1_regular secondary_text_color mt-md">
          Permanently remove all account data.
        </p>
      </div>
      <button
        @click="requestDeleteData"
        :disabled="isRequestingDelete"
        class="p-xl px-xxl rounded-lg border border-black-200 bg_secondary_color label_1_semibold  primary_text_color hover:bg-gray-25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-sm"
      >
        <div v-if="isRequestingDelete" class="h-4 w-4 animate-spin rounded-full border-2 border-gray-400 border-t-primary_color"></div>
        {{ isRequestingDelete ? 'Requesting...' : 'Delete My Data' }}
      </button>
    </div>

    <!-- AI Content Learning -->
    <div class="flex flex-row-reverse  md:flex-row items-start md:justify-between gap-4xl mt-10xl">
      <div class="flex-1">
        <h3 class="label_1_semibold primary_text_color">AI Content Learning</h3>
        <p class="label_1_regular secondary_text_color mt-md">
          Allow AI learning from content:
        </p>
      </div>
      <button
        @click="updateAiLearningConsent"
        type="button"
        class="relative inline-flex h-6 w-11 items-center rounded-full  "
        :class="aiContentLearning ? ' bg-green-300' : 'bg-gray-50'"
      >
        <span
          class="inline-block h-5 w-5 transform rounded-full bg_secondary_color transition-transform"
          :class="aiContentLearning ? 'translate-x-5' : 'translate-x-1'"
        ></span>
      </button>
    </div>

    <!-- Analytics Sharing -->
    <div class="flex flex-row-reverse  md:flex-row items-start md:justify-between gap-4xl mt-10xl">
      <div class="flex-1">
        <h3 class="label_1_semibold primary_text_color">Analytics Sharing</h3>
        <p class="label_1_regular secondary_text_color mt-md">
          Share analytics for improvements:
        </p>
      </div>
      <button
        @click="updateAnalyticsConsent"
        type="button"
        class="relative inline-flex h-6 w-11 items-center rounded-full "
        :class="analyticsSharing ? 'bg-green-300' : 'bg-gray-50'"
      >
        <span
          class="inline-block h-5 w-5 transform rounded-full bg_secondary_color transition-transform"
          :class="analyticsSharing ? 'translate-x-5' : 'translate-x-1'"
        ></span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import ConfirmDataDeletionModal from "./ConfirmDataDeletionModal.vue";
import SuccessToastNotification from "../common/SuccessToastNotification.vue";
import {
  requestClearData,
  deleteAccountData,
  fetchPrivacySettings as fetchPrivacySettingsApi,
  updateAiLearningConsent as updateAiLearningConsentApi,
  updateAnalyticsConsent as updateAnalyticsConsentApi,
} from "@app/services/settings/dataPrivacy.js";

const aiContentLearning = ref(false);
const analyticsSharing = ref(false);
const showDeleteModal = ref(false);
const showSuccessToast = ref(false);
const isRequestingDelete = ref(false);
const deleteModal = ref(null);

const requestDeleteData = async () => {
  try {
    isRequestingDelete.value = true;
    await requestClearData();
    showDeleteModal.value = true;
  } catch (error) {
    console.error('Failed to request data deletion:', error);
    // You might want to show an error message to the user here
  } finally {
    isRequestingDelete.value = false;
  }
};

const handleDeleteData = async (code) => {
  try {
    await deleteAccountData(code);
    
    // Data deleted successfully, call modal's success handler
    deleteModal.value?.handleDeleteResult(true);
    
    // Show success toast after deletion
    setTimeout(() => {
      showSuccessToast.value = true;
      // Refresh page to clear all data from frontend
      window.location.reload();
    }, 1500); // Show toast after modal closes
    window.location.reload();
  } catch (error) {
    console.error('Failed to delete data:', error);
    
    // Show error message in the modal
    let errorMessage = 'Failed to delete data. Please try again later.';
    if (error.response?.status === 400) {
      errorMessage = 'Invalid verification code. Please check your email and try again.';
    } else if (error.response?.status === 401) {
      errorMessage = 'Verification code has expired. Please request a new one.';
    }
    
    // Call modal's error handler
    deleteModal.value?.handleDeleteResult(false, errorMessage);
  }
};

// Fetch privacy settings from API
const fetchPrivacySettings = async () => {
  try {
    const settings = await fetchPrivacySettingsApi();
    if (settings) {
      aiContentLearning.value = settings.aiLearningConsent || false;
      analyticsSharing.value = settings.analyticsConsent || false;
    }
  } catch (error) {
    console.error('Failed to fetch privacy settings:', error);
    // Default to false if API call fails
    aiContentLearning.value = false;
    analyticsSharing.value = false;
  }
};

// Update AI Learning consent
const updateAiLearningConsent = async () => {
  try {
    const newValue = !aiContentLearning.value;
    await updateAiLearningConsentApi(newValue);
    aiContentLearning.value = newValue;
    console.log('AI Learning consent updated successfully');
  } catch (error) {
    console.error('Failed to update AI Learning consent:', error);
    // Revert on error
    aiContentLearning.value = !aiContentLearning.value;
  }
};

// Update Analytics consent
const updateAnalyticsConsent = async () => {
  try {
    const newValue = !analyticsSharing.value;
    await updateAnalyticsConsentApi(newValue);
    analyticsSharing.value = newValue;
    console.log('Analytics consent updated successfully');
  } catch (error) {
    console.error('Failed to update Analytics consent:', error);
    // Revert on error
    analyticsSharing.value = !analyticsSharing.value;
  }
};

// Fetch privacy settings on component mount
onMounted(() => {
  fetchPrivacySettings();
});
</script>


