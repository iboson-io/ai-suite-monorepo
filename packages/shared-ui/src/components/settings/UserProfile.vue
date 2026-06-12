<template>
     <div class="bg_secondary_color rounded-2xl p-6xl primary_border_color h-[100%] data-privacy-full-height overflow-y-auto">
            <h2 class="heading_h6_semibold">Profile Information</h2>
            <p class="label_1_regular secondary_text_color mt-md">
              Update your profile, secure your account, and manage connected apps.
            </p>
            <div class="mt-10xl">
              <p
                v-if="isUserLoading"
                class="label_1_regular secondary_text_color"
              >
                Loading profile…
              </p>
              <template v-else>
              <!-- Profile Picture -->
              <div class="flex items-start gap-6xl">
                <div class="relative">
                  <div
                    class="w-24 h-24 rounded-full overflow-hidden flex items-center justify-center bg-gray-25"
                  >
                    <img
                      :src="profilePictureUrl"
                      alt="Profile"
                      class="w-full h-full object-cover"
                    />
                  </div>
                  <button
                    v-if="!hasCustomProfilePicture"
                    type="button"
                    class="absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full border border-white bg_primary_color"
                    aria-label="Change profile picture"
                    @click="openProfilePictureFilePicker"
                  >
                    <img :src="CameraIcon" alt="" />
                  </button>
                  <button
                    v-else
                    type="button"
                    class="absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center bg_secondary_color rounded-full border border-white disabled:cursor-not-allowed disabled:opacity-50"
                    aria-label="Remove profile picture"
                    :disabled="isDeletingProfilePicture"
                    @click="deleteProfilePicture"
                  >
                    <img :src="TrashIcon" alt="" class="h-3.5 w-3.5" />
                  </button>
                  <input
                    ref="avatarFileInputRef"
                    type="file"
                    accept="image/jpeg,image/jpg,image/png"
                    class="hidden"
                    @change="handleAvatarFileSelect"
                  />
                </div>
              </div>

              <!-- Name Field -->
              <div class="flex flex-col items-start mt-10xl">
                <label class="label_2_semibold primary_text_color w-20 flex-shrink-0 flex items-center gap-lg"
                :class="[!isEditing ? 'disable_text_color cursor-not-allowed' : '']">
                  Name: <span><img :src="WarningGrayIcon" alt=""></span>
                </label>
              <div class="flex w-[100%] gap-xl items-center mt-sm"> 
                <div class="flex items-center gap-xl w-1/2 lg:w-[40%]">
                  <input
                    v-model="profileForm.name"
                    type="text"
                    :disabled="!isEditing"
                    :class="[
                      ' flex-1 h-12 px-3xl py-xl rounded-lg border border-black-50  w-1/2 ',
                      !isEditing ? ' disable_text_color cursor-not-allowed bg-info-50' : 'Label_2_Medium'
                    ]"
                    :style="isEditing ? {
                      border: '1px solid #0068CF',
                      boxShadow: '0px 0px 0px 3px #D9E2FC'
                    } : {}"
                  />
                  
                </div>
                <div v-if="!isEditing" class="flex gap-xl">
                    <button
                      @click="startEditing"
                      class="flex items-center Label_2_Medium primary_text_color justify-center rounded-lg"
                    >
                      <img :src="InputboxEditIcon" alt="">
                    </button>
                  </div>
                  <div v-else class="flex gap-xl">
                    <button
                      type="button"
                      :disabled="isSavingName"
                      @click="cancelEditing"
                      class="px-xxl py-xl rounded-lg primary_border_color bg-gray-25 label_1_semibold h-12 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      :disabled="isSavingName"
                      @click="saveChanges"
                      class="px-xxl py-xl rounded-lg primary_button h-12 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {{ isSavingName ? "Saving…" : "Save" }}
                    </button>
                  </div>
              </div>
              <p
                v-if="nameSaveError"
                class="label_2_semibold text-error-600 mt-sm"
                role="alert"
              >
                {{ nameSaveError }}
              </p>
              </div> 

              <!-- Email Field -->
              <div class="flex flex-col items-start mt-10xl">
                <label class="label_2_semibold primary_text_color w-20 flex-shrink-0"
                :class="[!isEditingEmail ? 'disable_text_color cursor-not-allowed' : '']"
                >
                  Email:
                </label>
                <div class="flex w-[100%] gap-xl items-center mt-sm"> 
                  <div class="flex items-center gap-xl w-1/2 lg:w-[40%]">
                    <input
                      v-model="profileForm.email"
                      type="email"
                      :disabled="!isEditingEmail"
                      :class="[
                        ' flex-1 h-12 px-3xl py-xl rounded-lg border border-black-50  w-1/2 ',
                        !isEditingEmail ? ' disable_text_color cursor-not-allowed bg-info-50' : 'Label_2_Medium'
                      ]"
                      :style="isEditingEmail ? {
                        border: '1px solid #0068CF',
                        boxShadow: '0px 0px 0px 3px #D9E2FC'
                      } : {}"
                    />
                  </div>
                  <div v-if="!isEditingEmail" class="flex gap-xl">
                    <button
                      type="button"
                      :disabled="isRequestingEditEmailOtp"
                      @click="startEditingEmail"
                      class="flex items-center Label_2_Medium primary_text_color justify-center rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <img :src="InputboxEditIcon" alt="">
                    </button>
                  </div>
                  <div v-else class="flex gap-xl">
                    <button
                      type="button"
                      :disabled="isRequestingSaveEmailOtp"
                      @click="cancelEditingEmail"
                      class="px-xxl py-xl rounded-lg primary_border_color bg-gray-25 label_1_semibold h-12 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      :disabled="isRequestingSaveEmailOtp"
                      @click="saveEmailChanges"
                      class="px-xxl py-xl rounded-lg primary_button h-12 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {{ isRequestingSaveEmailOtp ? "Sending…" : "Save" }}
                    </button>
                  </div>
                </div>
                <p
                  v-if="emailOtpRequestError"
                  class="label_2_semibold text-error-600 mt-sm w-full"
                  role="alert"
                >
                  {{ emailOtpRequestError }}
                </p>
              </div>
              </template>
            </div>

            
          <!-- Connected Social Accounts Section -->
            <h2 class="heading_h6_semibold mt-10xl primary_text_color">Connected social accounts</h2>
            <p class="label_1_regular secondary_text_color mt-md">
              Services that you use to log in to Genius AI
            </p>

            <div class="mt-10xl w-[100%] md:w-1/2">
              <!-- Google Account -->
              <div
                class="flex items-center justify-between"
              >
                <div class="flex items-center gap-6xl">
                  <div
                    class="w-10 h-10 flex items-center justify-center"
                  >
                    <img :src="GoogleIcon" alt="">
                  </div>
                  <div>
                    <p class="label_1_medium primary_text_color">Google</p>
                    <p class="label_1_bold primary_text_color">{{ profileForm.name || "—" }}</p>
                  </div>
                </div>
                <button
                  type="button"
                  @click="isGoogleLinked ? openDisconnectModal() : connectGoogleAccount()"
                  class="px-5xl md:px-12xl py-md rounded-md bg-gray-25 label_1_semibold primary_text_color hover:bg-black-25 active:bg-black-25"
                >
                  {{ isGoogleLinked ? "Disconnect" : "Connect" }}
                </button>
              </div>
              <p
                v-if="googleConnectError"
                class="label_2_semibold text-error-600 mt-sm"
                role="alert"
              >
                {{ googleConnectError }}
              </p>
            </div>
          </div>
        
          

  <!-- Profile picture crop modal (opens after file is selected) -->
  <div
    v-if="editProfilePicture && cropperSrc"
    class="fixed inset-0 z-[60] flex items-center justify-center bg_overlay backdrop-blur-sm"
    @click.self="closeProfilePictureModal"
  >
    <div
      class="profile-picture-modal relative mx-4 w-full max-w-xl overflow-hidden rounded-2xl bg_secondary_color shadow-2xl"
      @click.stop
    >
      <div class="p-6xl">
        <div class="flex items-start justify-between gap-xl">
          <div class="min-w-0">
            <h2 class="heading_h5_semibold primary_text_color">Edit Profile Picture</h2>
            <p class="label_1_regular secondary_text_color mt-md">
              Crop and adjust your current photo
            </p>
          </div>
          <button
            type="button"
            :disabled="isSavingProfilePicture"
            class="shrink-0 rounded-lg bg-gray-25 p-md transition-colors hover:bg-black-25 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Close"
            @click="closeProfilePictureModal"
          >
            <img :src="BlackCloseIcon" alt="" />
          </button>
        </div>
      </div>

      <div class="px-6xl pb-6xl">
        <div class="profile-cropper-wrap relative w-full overflow-hidden rounded-lg">
          <Cropper
            ref="cropperRef"
            class="cropper"
            :key="cropperSrc"
            :src="cropperSrc"
            :stencil-component="CircleStencil"
            :stencil-props="{
              aspectRatio: 1,
              movable: true,
              resizable: true,
            }"
            :default-size="{
              width: 280,
              height: 280,
            }"
            image-restriction="stencil"
          />
        </div>
      </div>

      <div class="block h-[1px] w-full bg-gray-25"></div>

      <div class="flex flex-col gap-md p-6xl">
        <p
          v-if="pictureSaveError"
          class="label_2_semibold text-error-600 text-center"
          role="alert"
        >
          {{ pictureSaveError }}
        </p>
        <div class="flex items-center justify-between gap-xl">
          <button
            type="button"
            :disabled="isSavingProfilePicture"
            class="rounded-lg bg-gray-25 px-8xl py-xl label_1_semibold primary_text_color transition-colors hover:bg-black-25 disabled:cursor-not-allowed disabled:opacity-50"
            @click="closeProfilePictureModal"
          >
            Cancel
          </button>
          <button
            type="button"
            :disabled="isSavingProfilePicture"
            class="rounded-lg primary_button px-8xl py-xl label_1_semibold primary_2_text_color transition-colors disabled:cursor-not-allowed disabled:opacity-50"
            @click="saveProfilePicture"
          >
            {{ isSavingProfilePicture ? "Saving…" : "Save" }}
          </button>
        </div>
      </div>
    </div>
  </div>

  <SuccessToastNotification
    :open="showEmailUpdateSuccessToast"
    main-message="Your email address has been updated successfully."
    @close="showEmailUpdateSuccessToast = false"
  />

  <!-- Email Verification Modal -->
  <EmailVerificationModal
    :open="showEmailVerificationModal"
    :title="verificationTitle"
    :description="verificationDescription"
    :email="verificationEmail"
    :verify-error="verificationModalError"
    :is-verifying="isVerifyingEmailOtp"
    :resend-body="emailChangeResendBody"
    @close="closeEmailVerificationModal"
    @verify="handleVerifyCode"
    @clear-verify-error="verificationModalError = ''"
  />

  <!-- Disconnect Account Modal -->
  <DisconnectAccountModal
    :open="showDisconnectModal"
    :title="'Disconnect Google Account?'"
    :description="disconnectDescription"
    :email="googleAccountEmail"
    :is-disconnecting="isDisconnectingGoogle"
    :error-message="googleDisconnectError"
    @close="closeDisconnectModal"
    @disconnect="handleDisconnectGoogle"
  />
</template>

<script setup>
import { ref, reactive, computed, onMounted } from "vue";
import {
  TOKEN_KEY,
  parseSettingsError,
  fetchUserProfile as fetchUserProfileApi,
  updateProfileUsername,
  requestChangeEmail,
  verifyChangeEmail,
  getGoogleConnectUrl,
  disconnectGoogle,
  deleteProfilePicture as deleteProfilePictureApi,
  uploadProfilePicture,
} from "@app/services/settings/userProfile.js";
import { Cropper, CircleStencil } from "vue-advanced-cropper";
import "vue-advanced-cropper/dist/style.css";
import BlackCloseIcon from "../../assets/images/BlackCloseIcon.svg";
import EmailVerificationModal from "./EmailVerificationModal.vue";
import DisconnectAccountModal from "./DisconnectAccountModal.vue";
import SuccessToastNotification from "../common/SuccessToastNotification.vue";
import CameraIcon from "../../assets/images/CameraIcon.svg";
import TrashIcon from "../../assets/images/TrashIcon.svg";
import InputboxEditIcon from "../../assets/images/InputboxEditIcon.svg";
import GoogleIcon from "../../assets/images/GoogleIcon.svg";
import WarningGrayIcon from "../../assets/images/WarningGrayIcon.svg";

// Profile form state (name = API `username`)
const profileForm = reactive({
  name: "",
  email: "",
});

// Original values for cancel functionality
const originalValues = reactive({
  name: "",
  email: "",
});

const isUserLoading = ref(true);

/** Google link state from `/auth/me` and after `DELETE /auth/google`. */
const isGoogleLinked = ref(false);

function buildFallbackAvatar(seed) {
  const label = (seed && String(seed).trim()) || "User";
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(label)}&background=7950F2&color=fff&size=96`;
}

/** Whether Google OAuth is linked (normalized by app settings service). */
async function fetchUserProfile() {
  isUserLoading.value = true;
  try {
    const profile = await fetchUserProfileApi();
    if (!profile) return;

    const { username, email, profilePictureUrl: pictureUrl, isGoogleLinked: googleLinked } = profile;

    profileForm.name = username;
    profileForm.email = email;
    originalValues.name = username;
    originalValues.email = email;

    const fallback = buildFallbackAvatar(username || email);
    defaultAvatarUrl.value = fallback;
    profilePictureUrl.value = pictureUrl || fallback;

    googleAccountEmail.value = email;
    isGoogleLinked.value = googleLinked;
  } catch (e) {
    console.error("Failed to load user profile:", e);
  } finally {
    isUserLoading.value = false;
  }
}

onMounted(() => {
  fetchUserProfile();
});

// Edit states
const isEditing = ref(false);
const isEditingEmail = ref(false);
const editProfilePicture = ref(false);
const isSavingName = ref(false);
const nameSaveError = ref("");

// Email verification state
const showEmailVerificationModal = ref(false);
const showEmailUpdateSuccessToast = ref(false);
const verificationAction = ref("edit"); // 'edit' or 'save'
const verificationEmail = ref("");
const verificationTitle = ref("We've sent you a code");
const verificationDescription = ref("");
/** New address for the save flow; sent with verify when `verificationAction === 'save'`. */
const pendingNewEmail = ref("");
const verificationModalError = ref("");
const isVerifyingEmailOtp = ref(false);
const isRequestingEditEmailOtp = ref(false);
const isRequestingSaveEmailOtp = ref(false);
const emailOtpRequestError = ref("");

// Disconnect account modal state
const showDisconnectModal = ref(false);
const googleAccountEmail = ref("");
const disconnectDescription = ref("");
const isDisconnectingGoogle = ref(false);
const googleDisconnectError = ref("");
const googleConnectError = ref("");

// Profile picture state
const defaultAvatarUrl = ref(buildFallbackAvatar("User"));
const profilePictureUrl = ref(defaultAvatarUrl.value);
const uploadedImage = ref(null);
const avatarFileInputRef = ref(null);
const cropperRef = ref(null);
const isExistingImage = ref(false);
const isSavingProfilePicture = ref(false);
const isDeletingProfilePicture = ref(false);
const pictureSaveError = ref("");

const hasCustomProfilePicture = computed(() => {
  const url = String(profilePictureUrl.value || "").trim();
  if (!url) return false;
  if (url.includes("ui-avatars.com")) return false;
  if (url === String(defaultAvatarUrl.value)) return false;
  return true;
});

/** Body for `POST /auth/change-email/resend` when confirming a new email. */
const emailChangeResendBody = computed(() => {
  if (verificationAction.value === "save" && pendingNewEmail.value?.trim()) {
    return { new_email: pendingNewEmail.value.trim() };
  }
  return {};
});

/** Cropper source: new upload takes precedence over saved profile picture URL. */
const cropperSrc = computed(() => uploadedImage.value || profilePictureUrl.value || "");

function extractProfileUpdateError(e) {
  return parseSettingsError(e);
}

// Edit functions
const startEditing = () => {
  nameSaveError.value = "";
  isEditing.value = true;
  originalValues.name = profileForm.name;
};

const cancelEditing = () => {
  nameSaveError.value = "";
  isEditing.value = false;
  profileForm.name = originalValues.name;
};

const saveChanges = async () => {
  nameSaveError.value = "";
  const username = String(profileForm.name ?? "").trim();
  if (!username) {
    nameSaveError.value = "Username is required.";
    return;
  }
  if (username === String(originalValues.name ?? "").trim()) {
    isEditing.value = false;
    return;
  }
  isSavingName.value = true;
  try {
    await updateProfileUsername(username);
    originalValues.name = username;
    profileForm.name = username;
    isEditing.value = false;
    defaultAvatarUrl.value = buildFallbackAvatar(username);
    if (String(profilePictureUrl.value).includes("ui-avatars.com")) {
      profilePictureUrl.value = defaultAvatarUrl.value;
    }
    window.dispatchEvent(new CustomEvent("profile-updated"));
  } catch (e) {
    nameSaveError.value = extractProfileUpdateError(e);
  } finally {
    isSavingName.value = false;
  }
};

const startEditingEmail = async () => {
  emailOtpRequestError.value = "";
  verificationModalError.value = "";
  verificationAction.value = "edit";
  verificationEmail.value = profileForm.email;
  verificationTitle.value = "We've sent you a code";
  verificationDescription.value = `Before you make changes to your account, you'll need to enter the code we've sent to ${profileForm.email}`;

  isRequestingEditEmailOtp.value = true;
  try {
    await requestChangeEmail({});
    showEmailVerificationModal.value = true;
  } catch (e) {
    emailOtpRequestError.value = extractProfileUpdateError(e);
  } finally {
    isRequestingEditEmailOtp.value = false;
  }
};

const cancelEditingEmail = () => {
  emailOtpRequestError.value = "";
  isEditingEmail.value = false;
  profileForm.email = originalValues.email;
};

const saveEmailChanges = async () => {
  emailOtpRequestError.value = "";
  verificationModalError.value = "";

  const newEmail = String(profileForm.email ?? "").trim();
  if (!newEmail) {
    emailOtpRequestError.value = "Email is required.";
    return;
  }
  if (newEmail === String(originalValues.email ?? "").trim()) {
    emailOtpRequestError.value = "Enter a new email address before saving.";
    return;
  }
  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRe.test(newEmail)) {
    emailOtpRequestError.value = "Please enter a valid email address.";
    return;
  }

  isRequestingSaveEmailOtp.value = true;
  try {
    await requestChangeEmail({ new_email: newEmail });
    pendingNewEmail.value = newEmail;
    verificationAction.value = "save";
    verificationEmail.value = newEmail;
    verificationTitle.value = "Confirm your new email";
    verificationDescription.value = `We've sent a 6-digit verification code to ${newEmail}. Enter the code below to verify your new email address.`;
    showEmailVerificationModal.value = true;
  } catch (e) {
    emailOtpRequestError.value = extractProfileUpdateError(e);
  } finally {
    isRequestingSaveEmailOtp.value = false;
  }
};

/** Confirms OTP via `POST /auth/change-email/verify` (body includes `new_email` when confirming a new address). */
const handleVerifyCode = async (code) => {
  const trimmed = String(code ?? "").trim();
  if (trimmed.length !== 6 || !/^[0-9]{6}$/.test(trimmed)) {
    verificationModalError.value = "Enter the 6-digit code.";
    return;
  }

  verificationModalError.value = "";
  isVerifyingEmailOtp.value = true;
  try {
    const body =
      verificationAction.value === "save" && pendingNewEmail.value
        ? { code: trimmed, new_email: pendingNewEmail.value.trim() }
        : { code: trimmed };
    await verifyChangeEmail(body);

    if (verificationAction.value === "edit") {
      closeEmailVerificationModal();
      isEditingEmail.value = true;
    } else if (verificationAction.value === "save") {
      const next = pendingNewEmail.value.trim();
      closeEmailVerificationModal();
      isEditingEmail.value = false;
      profileForm.email = next;
      originalValues.email = next;
      googleAccountEmail.value = next;
      await fetchUserProfile();
      showEmailUpdateSuccessToast.value = true;
      window.dispatchEvent(new CustomEvent("profile-updated"));
    }
  } catch (e) {
    verificationModalError.value = extractProfileUpdateError(e);
  } finally {
    isVerifyingEmailOtp.value = false;
  }
};

const closeEmailVerificationModal = () => {
  showEmailVerificationModal.value = false;
  verificationAction.value = "edit";
  verificationModalError.value = "";
  isVerifyingEmailOtp.value = false;
  pendingNewEmail.value = "";
};

// Disconnect account functions
const openDisconnectModal = () => {
  googleDisconnectError.value = "";
  disconnectDescription.value = `You'll need to use your email address ${googleAccountEmail.value} and password next time you log in to Genius AI`;
  showDisconnectModal.value = true;
};

const closeDisconnectModal = () => {
  showDisconnectModal.value = false;
  googleDisconnectError.value = "";
};

const connectGoogleAccount = () => {
  googleConnectError.value = "";
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) {
    googleConnectError.value = "You need to be signed in to connect Google.";
    return;
  }
  window.location.href = getGoogleConnectUrl();
};

const handleDisconnectGoogle = async () => {
  googleDisconnectError.value = "";
  isDisconnectingGoogle.value = true;
  try {
    await disconnectGoogle();
    isGoogleLinked.value = false;
    closeDisconnectModal();
  } catch (e) {
    googleDisconnectError.value = extractProfileUpdateError(e);
  } finally {
    isDisconnectingGoogle.value = false;
  }
};

// Profile picture functions
const clearAvatarFileInput = () => {
  if (avatarFileInputRef.value) {
    avatarFileInputRef.value.value = "";
  }
};

const openProfilePictureFilePicker = () => {
  pictureSaveError.value = "";
  clearAvatarFileInput();
  avatarFileInputRef.value?.click();
};

const deleteProfilePicture = async () => {
  if (!hasCustomProfilePicture.value || isDeletingProfilePicture.value) return;

  isDeletingProfilePicture.value = true;
  try {
    const result = await deleteProfilePictureApi();

    if (!result.success) {
      throw new Error(result.message || "Could not delete profile picture.");
    }

    if (profilePictureUrl.value && profilePictureUrl.value.startsWith("blob:")) {
      URL.revokeObjectURL(profilePictureUrl.value);
    }

    uploadedImage.value = null;
    isExistingImage.value = false;
    resetProfilePictureDraft();
    clearAvatarFileInput();

    const seed = profileForm.name || profileForm.email || "User";
    defaultAvatarUrl.value = buildFallbackAvatar(seed);
    profilePictureUrl.value = defaultAvatarUrl.value;

    await fetchUserProfile();
    window.dispatchEvent(new CustomEvent("profile-updated"));
  } catch (e) {
    console.error("Failed to delete profile picture:", e);
    alert(extractProfileUpdateError(e));
  } finally {
    isDeletingProfilePicture.value = false;
  }
};

const handleAvatarFileSelect = (event) => {
  const file = event.target.files?.[0];
  if (!file) return;
  processImageFile(file);
  clearAvatarFileInput();
};

const processImageFile = (file) => {
  // Validate file type
  const validTypes = ["image/jpeg", "image/jpg", "image/png"];
  if (!validTypes.includes(file.type)) {
    alert("Please select a valid image file (JPG or PNG)");
    return;
  }

  // Validate file size (5MB)
  const maxSize = 5 * 1024 * 1024; // 5MB in bytes
  if (file.size > maxSize) {
    alert("File size must be less than 5MB");
    return;
  }

  // Create image URL from file
  const reader = new FileReader();
  reader.onload = (e) => {
    uploadedImage.value = e.target.result;
    isExistingImage.value = false;
    pictureSaveError.value = "";
    editProfilePicture.value = true;
  };
  reader.readAsDataURL(file);
};

const resetProfilePictureDraft = () => {
  uploadedImage.value = null;
  isExistingImage.value = false;
  clearAvatarFileInput();
};

const saveProfilePicture = async () => {
  if (!cropperRef.value || isSavingProfilePicture.value) {
    return;
  }

  const { canvas } = cropperRef.value.getResult();
  if (!canvas) {
    return;
  }

  pictureSaveError.value = "";
  isSavingProfilePicture.value = true;

  const blob = await new Promise((resolve) => {
    canvas.toBlob((b) => resolve(b), "image/jpeg", 0.9);
  });

  if (!blob) {
    pictureSaveError.value = "Could not create image. Please try again.";
    isSavingProfilePicture.value = false;
    return;
  }

  try {
    const formData = new FormData();
    formData.append("picture", blob, "profile-picture.jpg");

    const { profilePictureUrl: newUrl } = await uploadProfilePicture(formData);

    if (profilePictureUrl.value && profilePictureUrl.value.startsWith("blob:")) {
      URL.revokeObjectURL(profilePictureUrl.value);
    }

    if (newUrl) {
      profilePictureUrl.value = newUrl;
    } else {
      await fetchUserProfile();
    }

    isExistingImage.value = true;
    closeProfilePictureModal();
    window.dispatchEvent(new CustomEvent("profile-updated"));
  } catch (e) {
    pictureSaveError.value = extractProfileUpdateError(e);
  } finally {
    isSavingProfilePicture.value = false;
  }
};

const closeProfilePictureModal = () => {
  pictureSaveError.value = "";
  editProfilePicture.value = false;
  setTimeout(() => {
    resetProfilePictureDraft();
  }, 300);
};
</script>

<style scoped>
.profile-cropper-wrap {
  height: min(400px, 55vh);
  background: #1a1d21;
}

.cropper {
  width: 100%;
  height: 100%;
}

input:focus-visible {
  outline: none;
}

.profile-picture-modal :deep(.vue-advanced-cropper__foreground) {
  background: rgba(15, 23, 42, 0.72);
}

.profile-picture-modal :deep(.vue-circle-stencil) {
  border: 2px solid rgba(255, 255, 255, 0.35);
}

.profile-picture-modal :deep(.vue-circle-stencil__preview) {
  border-radius: 50%;
}

.profile-picture-modal :deep(.vue-simple-handler) {
  background: #ffffff;
  border: 2px solid #ffffff;
  width: 12px;
  height: 12px;
  border-radius: 1px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.35);
}

.profile-picture-modal :deep(.vue-line-wrapper) {
  border-color: rgba(255, 255, 255, 0.85);
}

.profile-picture-modal :deep(.vue-bounding-box) {
  border-color: rgba(255, 255, 255, 0.5);
}
</style>