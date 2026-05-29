<template>
  <!-- Show delete comformation popup -->
  <ConfirmDataDeletionModal
      ref="deleteModal"
      :open="showDeleteModal"
      title="Delete Your Account"
      description="To confirm, we've sent a 6-digit code to your registered email. Please enter the code below to verify your request. "
      @close="showDeleteModal = false"
      @delete="handleDeleteData"
    />
  
  <!-- Show Logout Confirmation Modal -->
  <LogoutConfirmationModal
    :open="showLogoutModal"
    title="Log Out From All Devices?"
    description="This will immediately sign you out from all logged-in devices, including desktop, mobile, and web sessions."
    additional-info="You'll stay signed in on this current device."
    confirm-button-text="Log Out All Devices"
    @close="showLogoutModal = false"
    @confirm="handleLogoutAllDevices"
  />
  
  <!-- Show Create Password Form -->
  <CreatePassword 
    v-if="showCreatePassword && !hasPasswordCreated" 
    @back="showCreatePassword = false"
    @passwordCreated="handlePasswordCreated"
  />
  
  <!-- Show Update Password Form -->
  <UpdatePassword 
    v-else-if="showUpdatePassword && hasPasswordCreated" 
    @back="showUpdatePassword = false"
    @passwordUpdated="handlePasswordUpdated"
  />
  
  <!-- Show Security Settings -->
  <div v-if="!showCreatePassword && !showUpdatePassword" class="rounded-2xl bg_secondary_color p-6xl shadow-sm h-[100%] data-privacy-full-height">
    <!-- Header -->
    <h2 class="heading_h6_bold primary_text_color">Security</h2>
    <p class="label_1_regular secondary_text_color mt-md">
      Manage your password and login sessions securely.
    </p>

    <!-- Create/Update your password -->
    <div class="flex flex-col items-start mt-[50px] md:flex-row  md:justify-between gap-4xl">
      <div class="flex-1">
        <h3 class="label_1_semibold primary_text_color">{{ hasPasswordCreated ? 'Update your password' : 'Create your password' }}</h3>
        <p class="label_1_regular secondary_text_color mt-xs">
          {{ hasPasswordCreated ? 'Update your password to keep your account secure.' : 'Create a strong password to keep your account safe.' }}
        </p>
      </div>
      <button
        @click="hasPasswordCreated ? showUpdatePassword = true : showCreatePassword = true"
        class="p-xl px-xxl rounded-lg border border-black-200 bg_secondary_color label_1_semibold  primary_text_color hover:bg-gray-25"
      >
        {{ hasPasswordCreated ? 'change password' : 'Create password' }}
      </button>
    </div>

    <!-- Delete your account -->
    <div class="flex flex-col items-start mt-10xl md:flex-row  md:justify-between gap-4xl">
      <div class="flex-1">
        <h3 class="label_1_semibold primary_text_color">Delete your account</h3>
        <p class="label_1_regular secondary_text_color mt-xs">
          Deleting your account will permanently remove access to all designs.
        </p>
      </div>
      <button @click="requestAccountDeletion"
        :disabled="isDeleting"
        class="p-xl px-xxl rounded-lg border border-black-200 bg_secondary_color label_1_semibold  primary_text_color hover:bg-gray-25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-sm"
      >
        <div v-if="isDeleting" class="h-4 w-4 animate-spin rounded-full border-2 border-gray-400 border-t-primary_color"></div>
        {{ isDeleting ? 'Requesting...' : 'Delete account' }}
      </button>
    </div>

    <!-- Forgot to sign out on a shared device? -->
    <div class="flex flex-col items-start mt-10xl md:flex-row  md:justify-between gap-4xl">
      <div class="flex-1">
        <h3 class="label_1_semibold primary_text_color">Forgot to sign out on a shared device?</h3>
        <p class="label_1_regular secondary_text_color mt-xs">
          Secure your account by signing out from all sessions.
        </p>
      </div>
      <button
        @click="showLogoutModal = true"
        class="p-xl px-xxl rounded-lg border border-black-200 bg_secondary_color label_1_semibold  primary_text_color hover:bg-gray-25"
      >
        Log Out From All Devices
      </button>
    </div>

    <!-- Active Sessions -->
    <div>
      <h3 class="label_1_semibold primary_text_color mt-10xl">Active Sessions</h3>
      <div>
        <p
          v-if="isSessionsLoading"
          class="label_2_regular secondary_text_color mt-xxl"
        >
          Loading sessions…
        </p>
        <p
          v-else-if="sessionsError"
          class="label_2_semibold text-error-600 mt-xxl"
          role="alert"
        >
          {{ sessionsError }}
        </p>
        <template v-else>
          <p
            v-if="sessions.length === 0"
            class="label_2_regular secondary_text_color mt-xxl"
          >
            No sessions found.
          </p>
          <div
            v-for="session in sessions"
            :key="session.id"
            class="flex justify-between rounded-lg bg_secondary_color mt-xxl p-4xl primary_border_color md:w-1/2"
          >
            <p class="label_2_medium primary_text_color min-w-0 flex-1">{{ sessionDisplayLine(session) }}</p>
            <button
              type="button"
              :disabled="loggingOutSessionId === session.id"
              class="label_1_regular tertiary_text_color underline shrink-0 disabled:cursor-not-allowed disabled:opacity-50"
              @click="handleSessionLogout(session)"
            >
              {{ loggingOutSessionId === session.id ? "Logging out…" : "Logout" }}
            </button>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router"
import CreatePassword from "./CreatePassword.vue";
import UpdatePassword from "./UpdatePassword.vue";
import ConfirmDataDeletionModal from "./ConfirmDataDeletionModal.vue";
import LogoutConfirmationModal from "./LogoutConfirmationModal.vue";
import {
  TOKEN_KEY,
  logoutCurrentSession,
  logoutSession,
  fetchSessions as fetchSessionsApi,
  fetchAuthUser,
  requestAccountDeletion as requestAccountDeletionApi,
  deleteAccount,
} from "@app/services/settings/security.js";

const router = useRouter()
const showCreatePassword = ref(false);
const showUpdatePassword = ref(false);
const hasPasswordCreated = ref(false);
const showDeleteModal = ref(false);
const showLogoutModal = ref(false);
const isDeleting = ref(false);

const sessions = ref([]);
const isSessionsLoading = ref(false);
const sessionsError = ref("");
const loggingOutSessionId = ref(null);

function formatSessionActivity(session) {
  if (session.isCurrent) return "Active now";
  const raw = session.lastUsedAt || session.createdAt;
  if (!raw) return "Recently active";
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return "Recently active";
  const diffMs = Date.now() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "Last active just now";
  if (diffMins < 60) return `Last active ${diffMins} min${diffMins === 1 ? "" : "s"} ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `Last active ${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `Last active ${diffDays} day${diffDays === 1 ? "" : "s"} ago`;
}

function sessionDisplayLine(session) {
  return `${session.browser} on ${session.os} – ${formatSessionActivity(session)}`;
}

async function handleSessionLogout(session) {
  sessionsError.value = "";
  loggingOutSessionId.value = session.id;
  try {
    if (session.isCurrent) {
      try {
        await logoutCurrentSession();
      } catch (error) {
        console.error("Logout request failed:", error);
      } finally {
        localStorage.removeItem(TOKEN_KEY);
        window.location.href = "/signin";
      }
      return;
    }

    await logoutSession(session.id);
    sessions.value = sessions.value.filter((s) => s.id !== session.id);
  } catch (error) {
    console.error("Failed to log out session:", error);
    sessionsError.value = "Could not log out from that device. Please try again.";
  } finally {
    loggingOutSessionId.value = null;
  }
}

async function fetchSessions() {
  sessionsError.value = "";
  isSessionsLoading.value = true;
  try {
    sessions.value = await fetchSessionsApi();
  } catch (error) {
    console.error("Failed to fetch sessions:", error);
    sessions.value = [];
    sessionsError.value = "Could not load sessions. Please try again.";
  } finally {
    isSessionsLoading.value = false;
  }
}

const handlePasswordCreated = () => {
  hasPasswordCreated.value = true;
  showCreatePassword.value = false;
};

const handlePasswordUpdated = () => {
  // Password was updated, you can add any additional logic here
  showUpdatePassword.value = false;
};

const handleLogoutAllDevices = () => {
  // Handle logout from all devices logic here
  console.log("Logging out from all devices");
  // You can add API call here
  showLogoutModal.value = false;
};

const deleteModal = ref(null);

// Fetch user data to check if password exists
const fetchUserData = async () => {
  try {
    const { hasPasswordCreated: passwordExists } = await fetchAuthUser();
    hasPasswordCreated.value = passwordExists;
  } catch (error) {
    console.error('Failed to fetch user data:', error);
    // Default to false if API call fails
    hasPasswordCreated.value = false;
  }
};

// Fetch user data on component mount
onMounted(() => {
  fetchUserData();
  fetchSessions();
});

const handleDeleteData = async (code) => {
  try {
    await deleteAccount(code);
    
    // Account deleted successfully, call modal's success handler
    deleteModal.value?.handleDeleteResult(true);
    
    // Redirect to confirmation page
    setTimeout(() => {
      router.push("/deleted-message");
    }, 500);
  } catch (error) {
    console.error('Failed to delete account:', error);
    
    // Show error message in the modal
    let errorMessage = 'Failed to delete account. Please try again later.';
    if (error.response?.status === 400) {
      errorMessage = 'Invalid verification code. Please check your email and try again.';
    } else if (error.response?.status === 401) {
      errorMessage = 'Verification code has expired. Please request a new one.';
    }
    
    // Call modal's error handler
    deleteModal.value?.handleDeleteResult(false, errorMessage);
  }
};

const requestAccountDeletion = async () => {
  try {
    isDeleting.value = true;
    await requestAccountDeletionApi();
    showDeleteModal.value = true;
  } catch (error) {
    console.error('Failed to request account deletion:', error);
    // You might want to show an error message to the user here
  } finally {
    isDeleting.value = false;
  }
};

</script>

