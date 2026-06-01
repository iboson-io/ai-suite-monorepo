<template>
  <div class="flex-1 bg_primary_color px-3xl py-12xl md:px-10xl lg:py-10xl">
    <div class="w-full flex max-w-6xl mx-auto flex-col min-h-0">
      <!-- Loading -->
      <div
        v-if="!productData"
        class="rounded-2xl bg_secondary_color min-h-[280px] flex items-center justify-center primary_border_color border"
      >
        <p class="label_1_regular secondary_text_color">Loading product…</p>
      </div>

      <template v-else>
        <button
          type="button"
          class="label_2_medium primary_text_color hover:underline mb-6xl text-left w-fit"
          @click="$emit('back')"
        >
          &lt; Back to products
        </button>

        <div class="bg_secondary_color rounded-2xl p-6xl primary_border_color">
          <h1 class="heading_h6_bold primary_text_color">
            {{ productName || "Product" }}
          </h1>
          <p class="label_1_regular secondary_text_color mt-md">
            Update your brand info, colors, fonts, and social connections.
          </p>

          <!-- Main tabs (Brand Info | Brand Identity | Social Connections) -->
          <div ref="scrollContainer" class="overflow-x-auto mt-6xl scrollbar-hide">
            <div class="flex items-center min-w-max gap-3xl">
              <button
                v-for="tab in mainTabs"
                :key="tab.id"
                type="button"
                class="flex items-center justify-center rounded-lg px-3xl py-xl border border-blue-50 whitespace-nowrap profile_tab_border flex-shrink-0"
                :class="
                  mainTab === tab.id ? 'bg-blue-25' : 'bg_secondary_color'
                "
                @click.stop="mainTab = tab.id"
              >
                <span class="body_3_medium text-blue-300">{{ tab.label }}</span>
              </button>
            </div>
          </div>
        </div>

        <div class="flex-1 mt-6xl min-h-0">
          <!-- v-show keeps BrandIdentity mounted so edits persist when switching tabs -->
          <BrandInfo
            ref="brandInfoRef"
            v-show="mainTab === 1"
            variant="edit"
            v-model:website-url="websiteUrl"
            v-model:brand-logo-url="brandLogoUrl"
            @files-selected="handleFilesSelected"
            @validation-change="handleValidationChange"
            @files-state-change="bumpFormWatch"
          />

          <BrandIdentity
            v-show="mainTab === 2"
            :key="`${resolveProductId(productData)}-${brandIdentityKey}`"
            ref="brandIdentityRef"
            v-model:active-tab="activeIdentityTab"
            v-model:product-name="productName"
            v-model:description="description"
            :initial-brand-colors="initialBrandColors"
            :initial-brand-voice="initialBrandVoiceUi"
            :initial-typography="initialTypography"
            @field-change="bumpFormWatch"
          />

          <SocialConnections
            ref="socialConnectionsRef"
            v-show="mainTab === 3"
            :product-id="resolveProductId(productData)"
            :initial-platforms="productData.platforms || []"
            @connect-social="handleConnectSocial"
            @platforms-change="bumpFormWatch"
          />
        </div>

        <p v-if="saveError" class="mt-5xl label_2_regular text-error-600">
          {{ saveError }}
        </p>

        <div
          class="flex items-center justify-between bg_secondary_color mt-5xl px-6xl py-xl primary_border_color rounded-lg flex-wrap gap-3"
        >
          <button
            type="button"
            class="inline-flex items-center gap-md rounded-lg border primary_border_color bg-gray-25 px-5xl py-xl label_1_semibold primary_text_color hover:bg-gray-50 disabled:opacity-50"
            @click.stop.prevent="handleDelete"
          >
            <img :src="TrashIcon" alt="" class="h-5 w-5 opacity-80" />
            Delete
          </button>
          <button
            type="button"
            class="flex items-center gap-md rounded-lg px-5xl py-xl modal_primary_button cursor-pointer label_1_semibold disabled:opacity-50"
            :disabled="!canSave || !hasUnsavedChanges || isSavingProduct"
            @click.stop.prevent="handleSave"
          >
            <span>{{ isSavingProduct ? "Saving…" : "Save Changes" }}</span>
            <img v-if="!isSavingProduct" :src="DoneArrowRight" alt="" />
          </button>
        </div>
      </template>
    </div>

    <BrandDeleteSuccessModal
      :open="showDeleteModal"
      :loading="isDeletingProduct"
      :error="deleteModalError"
      :product-name="productName || ''"
      @close="closeDeleteModal"
      @confirm="confirmDelete"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from "vue";
import BrandInfo from "./BrandInfo.vue";
import BrandIdentity from "./BrandIdentity.vue";
import SocialConnections from "./SocialConnections.vue";
import BrandDeleteSuccessModal from "./BrandDeleteSuccessModal.vue";
import api, { LONG_REQUEST_TIMEOUT_MS } from "../../../services/api.js";
import DoneArrowRight from "../../../assets/images/DoneArrowRight.svg";
import TrashIcon from "../../../assets/images/TrashIcon.svg";

const props = defineProps({
  product: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(["back", "saved", "deleted"]);

/** API may use `id`, `productId`, `_id`, or `uuid`. */
function resolveProductId(obj) {
  if (!obj || typeof obj !== "object") return "";
  const raw =
    obj.id ?? obj.productId ?? obj.product_id ?? obj._id ?? obj.uuid;
  if (raw == null || raw === "") return "";
  return String(raw).trim();
}

/** GET/PATCH body may be the product or wrapped in `product` / `data`. */
function unwrapProductPayload(data) {
  if (!data || typeof data !== "object") return null;
  if (data.product && typeof data.product === "object") return data.product;
  if (data.data && typeof data.data === "object") return data.data;
  return data;
}

const productData = ref(null);
/** Bump after GET /api/products/:id so BrandIdentity remounts with server fields */
const brandIdentityKey = ref(0);
const mainTab = ref(1);
const activeIdentityTab = ref("product-info");
const websiteUrl = ref("");
const productName = ref("");
const description = ref("");
const brandLogoUrl = ref("");
const brandIdentityRef = ref(null);
const brandInfoRef = ref(null);
const socialConnectionsRef = ref(null);
const isStep1Valid = ref(true);
const saveError = ref("");
const scrollContainer = ref(null);
const showDeleteModal = ref(false);
const isDeletingProduct = ref(false);
const deleteModalError = ref("");
const isSavingProduct = ref(false);

/** Serialized form snapshot after load / save — used to enable Save only when dirty */
const baselineSerialized = ref(null);
const formBaselineReady = ref(false);
const formWatchTick = ref(0);

function bumpFormWatch() {
  formWatchTick.value += 1;
}

function serializeFormState() {
  const identity = brandIdentityRef.value?.getBrandIdentitySelections?.() ?? null;
  const social =
    socialConnectionsRef.value?.getConnectedPlatformKeys?.() ?? [];
  const uploadsSig = brandInfoRef.value?.getUploadsSignature?.() ?? "";

  const payload = {
    websiteUrl: websiteUrl.value,
    productName: productName.value,
    description: description.value,
    brandLogoUrl: brandLogoUrl.value,
    identity: identity
      ? {
          brandColors: {
            primary: identity.brandColors?.primary ?? "",
            secondary: identity.brandColors?.secondary ?? "",
            font: identity.brandColors?.font ?? "",
          },
          brandVoice: identity.brandVoice ?? "",
          typography: identity.typography ?? "",
        }
      : null,
    socialPlatforms: social,
    uploadsSig,
  };
  return JSON.stringify(payload);
}

function captureBaseline() {
  baselineSerialized.value = serializeFormState();
  formBaselineReady.value = true;
}

const hasUnsavedChanges = computed(() => {
  formWatchTick.value;
  if (!formBaselineReady.value || baselineSerialized.value === null) {
    return false;
  }
  return serializeFormState() !== baselineSerialized.value;
});

const mainTabs = [
  { id: 1, label: "Brand Info" },
  { id: 2, label: "Brand Identity" },
  { id: 3, label: "Social Connections" },
];

function mapApiBrandColorsToObject(arr) {
  const a = Array.isArray(arr) ? arr : [];
  return {
    primary: a[0] || "#2684FF",
    secondary: a[1] || "#8CB9FF",
    font: a[2] || "#5A6772",
  };
}

function apiBrandVoiceToUi(v) {
  if (v === "formal") return "professional";
  return v || "friendly";
}

function voiceUiToApi(v) {
  if (v === "professional") return "formal";
  return v || "friendly";
}

function normalizeWebsite(raw) {
  const s = (raw || "").trim();
  if (!s) return "";
  if (!/^https?:\/\//i.test(s)) return `https://${s}`;
  return s;
}

const initialBrandColors = computed(() =>
  mapApiBrandColorsToObject(productData.value?.brandColors)
);

const initialBrandVoiceUi = computed(() =>
  apiBrandVoiceToUi(productData.value?.brandVoice)
);

const initialTypography = computed(
  () => productData.value?.typography || "Open Sans"
);

const canSave = computed(() => {
  if (mainTab.value === 1) return isStep1Valid.value;
  return true;
});

function applyProductToForm(p) {
  websiteUrl.value = p.website || "";
  productName.value = p.name || "";
  if (Object.prototype.hasOwnProperty.call(p, "description")) {
    description.value = p.description == null ? "" : String(p.description);
  } else {
    description.value =
      p.additionalInstructions == null ? "" : String(p.additionalInstructions);
  }
  brandLogoUrl.value = p.brandLogoUrl || "";
}

function loadProduct() {
  const id = resolveProductId(props.product);
  if (!id) {
    productData.value = null;
    return;
  }
  productData.value = { ...props.product, id };
  applyProductToForm(productData.value);
}

function buildUpdateBody() {
  const identity = brandIdentityRef.value?.getBrandIdentitySelections?.() ?? {};
  const colors = identity.brandColors || mapApiBrandColorsToObject(productData.value?.brandColors);
  const desc = (description.value || "").trim();
  return {
    name: productName.value.trim() || "Untitled product",
    website: normalizeWebsite(websiteUrl.value),
    typography: identity.typography || initialTypography.value,
    brandColors: [colors.primary, colors.secondary].filter(Boolean),
    brandVoice: voiceUiToApi(identity.brandVoice),
    brandLogoUrl: brandLogoUrl.value || "",
    description: desc,
    additionalInstructions: desc,
  };
}

async function handleSave() {
  const id = resolveProductId(productData.value);
  if (!id) return;
  saveError.value = "";
  isSavingProduct.value = true;
  try {
    const body = buildUpdateBody();
    let saveRes;
    try {
      saveRes = await api.patch(
        `/api/products/${encodeURIComponent(id)}`,
        body,
        { timeout: LONG_REQUEST_TIMEOUT_MS }
      );
    } catch (e1) {
      const st = e1?.response?.status;
      if (st === 404 || st === 405) {
        saveRes = await api.put(
          `/api/products/${encodeURIComponent(id)}`,
          body,
          { timeout: LONG_REQUEST_TIMEOUT_MS }
        );
      } else {
        throw e1;
      }
    }

    let updated = unwrapProductPayload(saveRes.data);
    if (!resolveProductId(updated)) {
      const getRes = await api.get(`/api/products/${encodeURIComponent(id)}`, {
        timeout: LONG_REQUEST_TIMEOUT_MS,
      });
      updated = unwrapProductPayload(getRes.data);
    }
    const resolvedId = resolveProductId(updated);
    if (updated && resolvedId) {
      productData.value = { ...updated, id: resolvedId };
      applyProductToForm(productData.value);
      brandIdentityKey.value += 1;
      await nextTick();
      captureBaseline();
      emit("saved");
    }
  } catch (e) {
    const msg =
      e?.response?.data?.message ||
      e?.response?.data?.error ||
      e?.message ||
      "Could not save changes.";
    saveError.value = typeof msg === "string" ? msg : "Could not save changes.";
    console.error("PATCH/PUT /api/products/:id failed:", e);
  } finally {
    isSavingProduct.value = false;
  }
}

function closeDeleteModal() {
  if (isDeletingProduct.value) return;
  showDeleteModal.value = false;
  deleteModalError.value = "";
}

function handleDelete() {
  const id = resolveProductId(productData.value);
  if (!id) return;
  deleteModalError.value = "";
  showDeleteModal.value = true;
}

async function confirmDelete() {
  const id = resolveProductId(productData.value);
  if (!id) return;
  deleteModalError.value = "";
  isDeletingProduct.value = true;
  try {
    await api.delete(`/api/products/${encodeURIComponent(id)}`);
    showDeleteModal.value = false;
    emit("deleted");
  } catch (e) {
    const data = e?.response?.data;
    const msg =
      (typeof data?.message === "string" && data.message) ||
      (typeof data?.error === "string" && data.error) ||
      e?.message ||
      "Could not delete product.";
    deleteModalError.value = msg;
  } finally {
    isDeletingProduct.value = false;
  }
}

function handleFilesSelected() {
  /* Logo upload URL would be set here after a real upload API */
}

function handleValidationChange(validation) {
  isStep1Valid.value = validation.isValid;
}

function handleConnectSocial(_platform) {
  /* Wired when OAuth flow is connected to product */
}

onMounted(async () => {
  loadProduct();
  await nextTick();
  await nextTick();
  await nextTick();
  captureBaseline();
});
</script>

<style scoped>
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
</style>
