<template>
  <div class="bg_secondary_color rounded-2xl p-6xl primary_border_color h-[100%]">
    <!-- Create flow: illustration + stacked fields -->
    <template v-if="variant === 'create'">
      <div class="mb-4">
        <div class="lg:w-1/2">
          

          <div class="flex-1 mt-6xl">

            <div class="mt-6xl">
              <label class="label_2_semiboldblock primary_text_color"> Website URL </label>
              <input
                :value="getWebsiteUrl()"
                @input="handleUrlInput"
                type="url"
                placeholder="Enter your website URL here..."
                :class="[
                  'input_box w-full Label_2_Medium bg_secondary_color tertiary_text_color regular_border_color mt-sm py-xl px-3xl',
                  urlError ? '!border-error-600 !border-1' : '',
                ]"
              />
              <p
                v-if="urlError"
                class="mt-md label_2_semibold text-error-600 flex items-center gap-sm"
              >
                <img :src="WarningIcon" alt="" />
                {{ urlError }}
              </p>
            </div>

            <div class="mt-6xl">
              <span class="label_2_medium secondary_text_color">Or </span>
              <button
                type="button"
                @click="showUploadModal = true"
                class="label_2_medium primary_text_color underline"
              >
                click here to upload files
              </button>
              <span class="label_2_medium secondary_text_color">
                to help AI learn your brand.
              </span>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- Edit product: same row pattern as Brand Info / Product Info fields (label left, field right) -->
    <template v-else>
      <div class="flex flex-col gap-11xl">
        <div class="flex flex-col justify-between md:flex-row md:items-start">
          <label
            class="label_2_medium primary_text_color w-32 flex-shrink-0 pt-0 md:pt-2"
          >
            Website
          </label>
          <div class="w-[100%] md:w-[70%]">
            <input
              :value="getWebsiteUrl()"
              @input="handleUrlInput"
              type="url"
              placeholder="https://example.com"
              :class="[
                'input_box w-full border border-gray-400 py-xl px-3xl mt-sm md:mt-0 label_1_regular primary_text_color rounded-lg outline-none focus-visible:ring-1 focus-visible:ring-black-50 focus-visible:border-black-200',
                urlError ? '!border-error-600' : '',
              ]"
            />
            <p
              v-if="urlError"
              class="mt-md label_2_semibold text-error-600 flex items-center gap-sm"
            >
              <img :src="WarningIcon" alt="" class="shrink-0" />
              {{ urlError }}
            </p>
          </div>
        </div>

        <div class="flex flex-col justify-between md:flex-row md:items-start">
          <label class="label_2_medium primary_text_color w-32 flex-shrink-0">
            Uploaded Docs
          </label>
          <div class="w-[100%] md:w-[70%] space-y-3">
            <!-- Brand logo from API (remote URL) -->
            <div
              v-if="trimmedBrandLogoUrl"
              class="flex items-center gap-xl rounded-lg border primary_border_color bg_secondary_color p-xl"
            >
              <div
                class="h-11 w-11 shrink-0 overflow-hidden rounded-md border primary_border_color bg-[#F3F4FD]"
              >
                <img
                  v-if="!brandLogoImgError"
                  :src="trimmedBrandLogoUrl"
                  alt=""
                  class="h-full w-full object-cover"
                  @error="brandLogoImgError = true"
                />
                <div
                  v-else
                  class="flex h-full w-full items-center justify-center bg-gray-25"
                >
                  <img
                    :src="UploadaImageIcon"
                    alt=""
                    class="h-6 w-6 opacity-70"
                  />
                </div>
              </div>
              <div class="min-w-0 flex-1">
                <p class="label_3_bold primary_text_color truncate">
                  {{ brandLogoFileLabel }}
                </p>
                <p class="label_3_regular secondary_text_color mt-xs">
                  {{ brandLogoMetaLabel }}
                </p>
              </div>
              <span
                class="shrink-0 text-gray-400 opacity-70"
                aria-hidden="true"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.5"
                  stroke-linejoin="round"
                >
                  <path d="M12 4l7.2 7.2-7.2 7.2-7.2-7.2L12 4z" />
                </svg>
              </span>
            </div>

            <!-- Local uploads completed in this session -->
            <div
              v-for="fileItem in completedLocalFiles"
              :key="fileItem.id"
              class="flex items-center gap-xl rounded-lg border primary_border_color bg_secondary_color p-xl"
            >
              <div
                class="flex h-11 w-11 shrink-0 items-center justify-center rounded-md border primary_border_color bg-gray-25"
              >
                <img :src="UploadaImageIcon" alt="" class="h-6 w-6 opacity-80" />
              </div>
              <div class="min-w-0 flex-1">
                <p class="label_3_bold primary_text_color truncate">
                  {{ fileItem.name }}
                </p>
                <p class="label_3_regular secondary_text_color mt-xs">
                  {{ formatFileSize(fileItem.size) }}
                </p>
              </div>
            </div>

            <button
              type="button"
              class="inline-flex w-full items-center justify-center gap-sm rounded-lg border border-gray-300 bg_secondary_color px-4 py-3 label_2_medium secondary_text_color transition-colors hover:bg-gray-25 sm:w-auto"
              @click="showUploadModal = true"
            >
              <span class="text-lg font-medium leading-none text-gray-500">+</span>
              Add more files
            </button>
          </div>
        </div>
      </div>
    </template>

    <input
      ref="fileInput"
      type="file"
      multiple
      accept=".pdf,.png,.jpg,.jpeg"
      class="hidden"
      @change="handleFileChange"
    />

    <!-- Upload Brand Files Modal -->
    <div
      v-if="showUploadModal"
      class="fixed inset-0 z-[60] flex items-center justify-center bg_overlay backdrop-blur-sm"
      @click.self="closeModal"
    >
      <!-- Modal -->
      <div
        class="relative w-full max-w-md bg_secondary_color rounded-2xl shadow-2xl overflow-hidden p-6"
        @click.stop
      >
        <!-- Title -->
        <h2 class="heading_h6_bold primary_text_color">
          Upload brand files
        </h2>
        
        <!-- Subtitle -->
        <p class="label_2_medium primary_text_color p-xs">
          Add your brand or product documents to help AI understand your identity.
        </p>

        <!-- File Upload Area -->
        <div
          ref="dropZone"
          @drop="handleDrop"
          @dragover.prevent
          @dragenter.prevent
          @dragleave="isDragOver = false"
          @dragenter="isDragOver = true"
          :class="[
            'rounded-lg pt-20 text-center cursor-pointer transition-colors mt-4xl' ,
            isDragOver ? 'border-2 border-dashed border-gray-500 bg_secondary_color' : 'border-2 border-dashed border-gray-500'
          ]"
          @click="fileInput?.click()"
        >
          <!-- Cloud Upload Icon -->
          <div class="flex justify-center">
            <img :src="UploadImageIcon" alt="">
          </div>
          
          <p class="body_3_medium text_color mt-7xl ">
            Drag & drop your files here or <span class="font-semibold primary_text_color">browse</span> to upload.
          </p>
          
          <p class="label_3_regular text-[#A7ABB3] mb-md mt-14xl">
            Accepted formats - .pdf, .png, .jpg, .jpeg | Max file size - 5MB
          </p>
        </div>

        <!-- File Upload Status List -->
        <div v-if="fileList.length > 0" class="mt-4 space-y-3">
          <div
            v-for="(fileItem, index) in fileList"
            :key="fileItem.id"
            class=" border primary_border_color rounded-lg p-xl"
          >
            <!-- File Name -->
            <div class="flex items-start justify-between mb-md">
              <div class="flex-1 min-w-0 flex gap-1">
                <img :src="UploadaImageIcon" alt="">
              <div>
                <p class="label_3_bold primary_text_color truncate">
                  {{ fileItem.name }}
                </p>
                <!-- File Size and Status -->
                <div class="flex items-center gap-md mt-xs">
                  <p v-if="fileItem.status === 'uploading'" class="label_3_regular">
                    {{ formatFileSize(fileItem.uploaded) }} of {{ formatFileSize(fileItem.size) }}
                  </p>
                  <p v-else class="label_3_regular secondary_text_color">
                    {{ formatFileSize(fileItem.size) }}
                  </p>
                </div>
                </div>
              </div>
             
            </div>
             <div class="flex justify-between">
                  <span
                    v-if="fileItem.status === 'completed'"
                    class="flex items-center gap-1 label_3_regular text-success-600"
                  >
                    <!-- Checkmark Icon -->
                    <img :src="GreenTickIcon" alt="">
                    Completed
                  </span>
                   <!-- Cancel/Delete Button (only for completed files) -->
              <button
                v-if="fileItem.status === 'completed'"
                @click="removeFile(index)"
                class="ml-md text-[#6B7280]"
              >
                <!-- Trash Icon -->
                <img :src="ClearIcon" alt="">
              </button>
                  </div>
            <!-- Progress Bar (only for uploading files) -->
            <div v-if="fileItem.status === 'uploading'" class="flex items-center gap-2">
              <!-- Spinner Icon -->
              <svg
                class="animate-spin"
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle
                  cx="8"
                  cy="8"
                  r="7"
                  stroke="#E5E7EB"
                  stroke-width="2"
                  fill="none"
                />
                <path
                  d="M8 1C10.7614 1 13 3.23858 13 6"
                  stroke="#22C55E"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-dasharray="15 15"
                />
              </svg>
              <!-- Progress Bar -->
              <div class="flex-1 h-2 bg-success-100 rounded-full overflow-hidden">
                <div
                  class="h-full bg-success-600 rounded-full transition-all duration-300 ease-out"
                  :style="{ width: `${fileItem.progress}%` }"
                ></div>
              </div>
              <!-- Cancel Button at the end of progress bar -->
              <button
                @click="removeFile(index)"
                class="text-[#6B7280] hover:text-[#4B5563] transition-colors"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 4L4 12M4 4L12 12"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <!-- Error Message -->
        <div
          v-if="fileError"
          class="mt-4 flex items-center justify-between bg_secondary_color border bg-gray-25 rounded-lg px-3xl py-xl"
        >
          <div class="flex items-center gap-xl">
            <!-- Error Icon -->
           <img :src="WarningIcon" alt="">
            <span class="label_2_semibold text-error-600">
              {{ fileError }}
            </span>
          </div>
          <button
            @click="fileError = null"
            class="label_2_semibold text-error-600"
          >
            <img :src="CloseIcon" alt="">
          </button>
        </div>

        <!-- Action Buttons -->
        <div class="flex mt-6xl justify-between">
          <button
            @click="closeModal"
            class="px-xxl py-xl rounded-lg label_1_semibold primary_border_color bg-gray-25 primary_text_color hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            @click="handleContinue"
            :disabled="fileError || completedFilesCount === 0"
            :class="[
              ' px-xxl py-xl rounded-lg flex items-center justify-center gap-2 ',
              fileError || completedFilesCount === 0
                ? 'label_2_medium disabled_primary_button cursor-not-allowed '
                : 'label_2_medium primary_button cursor-pointer'
            ]"
          >
            Continue
            <img :src="DoneArrowRight" alt="">
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, computed } from "vue";
import UploadImageIcon from "../../assets/images/UploadImageIcon.svg"
import UploadaImageIcon from "../../assets/images/UploadaImageIcon.svg"
import GreenTickIcon from "../../assets/images/GreenTickIcon.svg"
import ClearIcon from "../../assets/images/ClearIcon.svg"
import CloseIcon from "../../assets/images/CloseIcon.svg"
import WarningIcon from "../../assets/images/WarningIcon.svg"
import DoneArrowRight from "../../assets/images/DoneArrowRight.svg"

const props = defineProps({
  websiteUrl: {
    type: String,
    default: "",
  },
  "website-url": {
    type: String,
    default: "",
  },
  /** `edit` matches product edit screen (label left, field right); `create` keeps the wizard layout */
  variant: {
    type: String,
    default: "create",
    validator: (v) => v === "create" || v === "edit",
  },
});

const brandLogoUrl = defineModel("brandLogoUrl", {
  type: String,
  default: "",
});

const emit = defineEmits([
  "update:websiteUrl",
  "update:website-url",
  "files-selected",
  "validation-change",
  "files-state-change",
]);

const fileInput = ref(null);
const dropZone = ref(null);
const hasFiles = ref(false);
const showUploadModal = ref(false);
const isDragOver = ref(false);
const fileError = ref(null);
const urlError = ref(null);
const selectedFiles = ref([]);
const fileList = ref([]);
const uploadIntervals = ref({});

// Store uploaded files to preserve on navigation
const uploadedFiles = ref([]);

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes
const ACCEPTED_FORMATS = ['.pdf', '.png', '.jpg', '.jpeg'];

// Computed property for completed files count
const completedFilesCount = computed(() => {
  return fileList.value.filter(f => f.status === 'completed').length;
});

const brandLogoImgError = ref(false);

watch(brandLogoUrl, () => {
  brandLogoImgError.value = false;
});

const trimmedBrandLogoUrl = computed(() => (brandLogoUrl.value || "").trim());

function fileNameFromUrl(url) {
  if (!url) return "Brand logo";
  try {
    const normalized =
      url.startsWith("http://") || url.startsWith("https://") ? url : `https://${url}`;
    const u = new URL(normalized);
    const seg = u.pathname.split("/").filter(Boolean).pop();
    if (seg) return decodeURIComponent(seg);
    return "Brand logo";
  } catch {
    const parts = String(url).split(/[/\\]/);
    const last = parts.filter(Boolean).pop();
    return last ? decodeURIComponent(last) : "Brand logo";
  }
}

const brandLogoFileLabel = computed(() =>
  trimmedBrandLogoUrl.value ? fileNameFromUrl(trimmedBrandLogoUrl.value) : ""
);

const brandLogoMetaLabel = computed(() =>
  trimmedBrandLogoUrl.value ? "Image · remote URL" : ""
);

/** Completed uploads shown under Uploaded Docs (edit layout) */
const completedLocalFiles = computed(() =>
  props.variant === "edit"
    ? fileList.value.filter((f) => f.status === "completed")
    : []
);

// Format file size
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 KB';
  const kb = bytes / 1024;
  if (kb < 1024) {
    return `${Math.round(kb)} KB`;
  }
  const mb = kb / 1024;
  return `${mb.toFixed(2)} MB`;
};

// URL validation function
const isValidUrl = (urlString) => {
  if (!urlString || urlString.trim() === "") {
    return false;
  }
  
  try {
    // Add protocol if missing
    let url = urlString.trim();
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      url = "https://" + url;
    }
    
    const urlObj = new URL(url);
    // Check if it has a valid hostname with at least one dot
    return urlObj.hostname.length > 0 && urlObj.hostname.includes(".");
  } catch {
    return false;
  }
};

// Get the website URL from props (handle both naming conventions)
const getWebsiteUrl = () => {
  return props.websiteUrl || props["website-url"] || "";
};

// Function to emit validation status
const emitValidation = () => {
  const urlValue = getWebsiteUrl();
  const isValid = isValidUrl(urlValue);
  const finalIsValid = isValid || hasFiles.value;
  
  emit("validation-change", {
    isValid: finalIsValid,
    hasUrl: isValid,
    hasFiles: hasFiles.value,
  });
};

// Validate URL whenever it changes (watch both prop names)
watch(() => [props.websiteUrl, props["website-url"]], () => {
  emitValidation();
}, { immediate: true });

// Validate file size and format
const validateFiles = (files) => {
  fileError.value = null;
  const invalidFiles = [];
  
  Array.from(files).forEach(file => {
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
    
    // Check file format
    if (!ACCEPTED_FORMATS.includes(fileExtension)) {
      invalidFiles.push(`${file.name} (Invalid format)`);
      return;
    }
    
    // Check file size (only show error if > 5MB)
    if (file.size > MAX_FILE_SIZE) {
      invalidFiles.push(`${file.name} (File size exceeded 5 MB)`);
    }
  });
  
  if (invalidFiles.length > 0) {
    fileError.value = invalidFiles[0]; // Show first error
    return false;
  }
  
  return true;
};

// Simulate file upload with progress
const uploadFile = (file, id) => {
  const fileItem = {
    id,
    name: file.name,
    size: file.size,
    uploaded: 0,
    progress: 0,
    status: 'uploading',
    file: file
  };
  
  fileList.value.push(fileItem);
  
  // Simulate upload progress (simulate based on file size - larger files take longer)
  const totalSteps = 20; // 20 steps to complete
  const stepSize = file.size / totalSteps;
  let currentStep = 0;
  
  const interval = setInterval(() => {
    const item = fileList.value.find(f => f.id === id);
    if (item) {
      currentStep++;
      // Increment progress
      item.uploaded = Math.min(currentStep * stepSize, file.size);
      item.progress = Math.min((item.uploaded / item.size) * 100, 100);
      
      // Complete upload when done
      if (item.progress >= 100 || currentStep >= totalSteps) {
        item.uploaded = item.size;
        item.progress = 100;
        item.status = 'completed';
        clearInterval(interval);
        delete uploadIntervals.value[id];
      }
    } else {
      // File was removed, clear interval
      clearInterval(interval);
      delete uploadIntervals.value[id];
    }
  }, 150); // Update every 150ms for smoother animation
  
  uploadIntervals.value[id] = interval;
};

// Remove file from list
const removeFile = (index) => {
  const fileItem = fileList.value[index];
  
  // Clear upload interval if exists
  if (uploadIntervals.value[fileItem.id]) {
    clearInterval(uploadIntervals.value[fileItem.id]);
    delete uploadIntervals.value[fileItem.id];
  }
  
  // Remove from list
  fileList.value.splice(index, 1);
  
  // Update selectedFiles
  selectedFiles.value = fileList.value
    .filter(f => f.status === 'completed')
    .map(f => f.file);
};

// Handle file drop
const handleDrop = (event) => {
  event.preventDefault();
  isDragOver.value = false;
  
  const files = event.dataTransfer.files;
  if (files && files.length > 0) {
    processFiles(Array.from(files));
  }
};

const handleFileChange = (event) => {
  const files = event.target.files;
  if (files && files.length > 0) {
    processFiles(Array.from(files));
  }
};

// Process and upload files
const processFiles = (files) => {
  fileError.value = null;
  
  files.forEach(file => {
    // Validate file
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
    
    if (!ACCEPTED_FORMATS.includes(fileExtension)) {
      fileError.value = `${file.name} (Invalid format)`;
      return;
    }
    
    if (file.size > MAX_FILE_SIZE) {
      fileError.value = `${file.name} (File size exceeded 5 MB)`;
      return;
    }
    
    // Add to selected files
    if (!selectedFiles.value.find(f => f.name === file.name && f.size === file.size)) {
      selectedFiles.value.push(file);
      
      // Start upload simulation
      const id = Date.now() + Math.random();
      uploadFile(file, id);
    }
  });
};

// Close modal and reset
const closeModal = () => {
  // Clear all upload intervals
  Object.values(uploadIntervals.value).forEach(interval => {
    clearInterval(interval);
  });
  uploadIntervals.value = {};
  
  showUploadModal.value = false;
  fileError.value = null;
  isDragOver.value = false;
  // Don't reset fileList and selectedFiles here - keep them for continue
  // Reset file input
  if (fileInput.value) {
    fileInput.value.value = '';
  }
};

// Handle continue button
const handleContinue = () => {
  // Only allow continue if no errors and files are selected
  if (fileError.value) {
    return;
  }
  
  // Get completed files
  const completedFiles = fileList.value
    .filter(f => f.status === 'completed')
    .map(f => f.file);
  
  if (completedFiles.length > 0) {
    hasFiles.value = true;
    uploadedFiles.value = [...completedFiles];
    
    // Create a FileList-like object for emit
    const dataTransfer = new DataTransfer();
    completedFiles.forEach(file => {
      dataTransfer.items.add(file);
    });
    
    emit("files-selected", dataTransfer.files);
    emitValidation();
    
    // Clear intervals before closing
    Object.values(uploadIntervals.value).forEach(interval => {
      clearInterval(interval);
    });
    uploadIntervals.value = {};
    
    // Close modal but keep completed files visible for reference
    showUploadModal.value = false;
    fileError.value = null;
    isDragOver.value = false;
  } else if (fileList.value.length > 0) {
    // If there are files but none completed, just show message or wait
    // For now, allow closing
    closeModal();
  } else {
    closeModal();
  }
};

watch(
  fileList,
  () => emit("files-state-change"),
  { deep: true }
);

defineExpose({
  getUploadsSignature() {
    return fileList.value
      .filter((f) => f.status === "completed")
      .map((f) => `${f.name}:${f.size}`)
      .sort()
      .join("|");
  },
});

// Check if files exist on mount (preserve state when navigating back)
onMounted(() => {
  if (uploadedFiles.value.length > 0) {
    hasFiles.value = true;
  }
  emitValidation();
});

// Handle URL input
const handleUrlInput = (event) => {
  const value = event.target.value;
  
  // Validate URL if user has typed something
  if (value.trim() === "") {
    urlError.value = null;
  } else {
    // Check if it's a valid website URL
    if (!isValidUrl(value)) {
      urlError.value = "Please enter a valid website URL";
    } else {
      urlError.value = null;
    }
  }
  
  // Emit the update event - Vue will handle kebab-case conversion
  emit("update:websiteUrl", value);
  emit("update:website-url", value);
};
</script>

