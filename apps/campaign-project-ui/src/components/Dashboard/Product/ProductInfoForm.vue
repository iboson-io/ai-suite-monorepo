<template>
  <div class="flex-1 bg_primary_color px-3xl py-12xl md:px-10xl lg:py-10xl">
    <div class="w-full h-[100%] flex flex-col">
      <div class="bg_secondary_color rounded-2xl p-6xl primary_border_color">
        <h1 class="heading_h6_bold primary_text_color">
          Create a new product
        </h1>
        <p class="label_1_regular secondary_text_color mt-md">
          Enter your website URL, upload a PDF (brand guide / brief), or both. We will extract brand data and create your product.
        </p>
      </div>

      <div class="flex-1 mt-6xl">
        <BrandInfo
          ref="brandInfoRef"
          v-model:website-url="websiteUrl"
          v-model:brand-logo-url="brandLogoUrl"
          @files-selected="handleFilesSelected"
          @validation-change="handleValidationChange"
        />
      </div>

      <div class="bg_secondary_color mt-5xl px-6xl py-xl primary_border_color rounded-lg">
        <p v-if="submitError" class="mb-xl label_2_regular text-error-600">
          {{ submitError }}
        </p>
        <div class="flex items-center justify-between">
          <button
            type="button"
            @click="handleBack"
            :disabled="isSubmitting"
            class="label_1_semibold primary_text_color bg_primary_color primary_border_color px-5xl py-xl rounded-lg disabled:opacity-50"
          >
            Back
          </button>
          <button
            type="button"
            @click="handleContinue"
            :disabled="continueDisabled"
            :class="[
              'flex items-center gap-md rounded-lg px-5xl py-xl',
              continueDisabled
                ? 'modal_disabled_primary_button cursor-not-allowed label_1_semibold'
                : 'modal_primary_button cursor-pointer',
            ]"
          >
            <span>{{ proceedButtonLabel }}</span>
            <img v-if="!isSubmitting" :src="DoneArrowRight" alt="" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import BrandInfo from "./BrandInfo.vue";
import DoneArrowRight from "../../../assets/images/DoneArrowRight.svg";
import api, { LONG_REQUEST_TIMEOUT_MS } from "../../../services/api.js";

const emit = defineEmits(["back", "product-created"]);

const brandInfoRef = ref(null);
const websiteUrl = ref("");
const isStep1Valid = ref(false);
const isSubmitting = ref(false);
const submitError = ref("");
const brandLogoUrl = ref("");

const normalizeWebsite = (raw) => {
  const s = (raw || "").trim();
  if (!s) return "";
  if (!/^https?:\/\//i.test(s)) return `https://${s}`;
  return s;
};

function pickPdfFile(files) {
  if (!Array.isArray(files) || !files.length) return null;
  return (
    files.find(
      (f) =>
        f instanceof File &&
        (f.type === "application/pdf" ||
          String(f.name || "")
            .toLowerCase()
            .endsWith(".pdf"))
    ) || null
  );
}

/** `multipart/form-data`: optional `website`, optional `pdf` (API field name). */
function buildProductCreateFormData() {
  const fd = new FormData();
  const website = normalizeWebsite(websiteUrl.value);
  if (website) {
    fd.append("website", website);
  }
  const completed = brandInfoRef.value?.getCompletedFiles?.() ?? [];
  const pdfFile = pickPdfFile(completed);
  if (pdfFile) {
    fd.append("pdf", pdfFile, pdfFile.name);
  }
  return fd;
}

function extractCreatedProductId(resData) {
  if (resData == null || typeof resData !== "object") return "";
  if (resData.id != null) return String(resData.id).trim();
  if (resData.product?.id != null) return String(resData.product.id).trim();
  if (resData.data?.id != null) return String(resData.data.id).trim();
  return "";
}

const continueDisabled = computed(
  () => !isStep1Valid.value || isSubmitting.value
);

const proceedButtonLabel = computed(() =>
  isSubmitting.value ? "Creating…" : "Continue"
);

const handleBack = () => {
  emit("back");
};

const handleContinue = async () => {
  if (!isStep1Valid.value || isSubmitting.value) return;
  submitError.value = "";
  const website = normalizeWebsite(websiteUrl.value);
  const completed = brandInfoRef.value?.getCompletedFiles?.() ?? [];
  const pdfFile = pickPdfFile(completed);

  if (!website && !pdfFile) {
    submitError.value =
      "Enter a valid website URL or upload a PDF. (Images alone are not used for product creation.)";
    return;
  }

  isSubmitting.value = true;
  try {
    const formData = buildProductCreateFormData();
    const { data } = await api.post("/api/products", formData, {
      timeout: LONG_REQUEST_TIMEOUT_MS,
      transformRequest: [
        (payload, headers) => {
          if (payload instanceof FormData) {
            if (headers && typeof headers.delete === "function") {
              headers.delete("Content-Type");
            } else if (headers && typeof headers === "object") {
              delete headers["Content-Type"];
            }
          }
          return payload;
        },
      ],
    });
    const id = extractCreatedProductId(data);
    if (id) {
      emit("product-created", { id });
    } else {
      submitError.value =
        "Product was created but the server did not return an id. Check your product list.";
    }
  } catch (err) {
    const msg =
      err?.response?.data?.message ||
      err?.response?.data?.error ||
      err?.message ||
      "Could not create product. Please try again.";
    submitError.value = typeof msg === "string" ? msg : "Could not create product.";
    console.error("POST /api/products failed:", err);
  } finally {
    isSubmitting.value = false;
  }
};

const handleFilesSelected = () => {
  /* Files live on BrandInfo; getCompletedFiles() reads them on submit. */
};

const handleValidationChange = (validation) => {
  isStep1Valid.value = validation.isValid;
};
</script>
