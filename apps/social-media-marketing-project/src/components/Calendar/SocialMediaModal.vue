<template>
  <!-- Backdrop -->
  <div
    v-if="open"
    class="fixed inset-0 z-[60] flex items-center justify-center lg:justify-end lg:mr-10"
    @click="$emit('close')"
  >
    <!-- Modal -->
    <div
      class="relative mx-4 w-full max-h-[90vh] overflow-y-auto md:max-w-lg lg:mx-0 lg:max-w-lg"
      @click.stop
    >
      <div
        class="bg_secondary_color rounded-lg primary_border_color p-6xl shadow-2xl"
      >
        <!-- Header -->
        <div class="flex items-center justify-between">
          <h2 class="label_2_semibold primary_text_color">Platforms</h2>
          <button
            type="button"
            class="rounded-lg bg-gray-25 p-md hover:bg-gray-50-hover"
            aria-label="Close"
            @click="$emit('close')"
          >
            <img :src="CloseIcon" alt="" class="h-5 w-5" />
          </button>
        </div>
        <div class="mt-5xl block h-px w-full bg_primary_color" />

        <!-- No product linked (e.g. chat post panel) -->
        <div
          v-if="showConnectPostToProduct"
          class="mt-6xl flex min-h-[14rem] flex-col items-center justify-center gap-3 px-2 text-center"
        >
          <p class="label_2_regular secondary_text_color">
            Connect this post to a product to choose platforms. Social accounts are linked
            per product.
          </p>
        </div>

        <!-- Loading -->
        <div
          v-else-if="loading"
          class="mt-6xl flex min-h-[12rem] items-center justify-center label_2_regular secondary_text_color"
        >
          Loading platforms…
        </div>

        <!-- Error -->
        <div
          v-else-if="fetchError"
          class="mt-6xl min-h-[12rem] rounded-lg border border-red-200 bg-red-50 p-4 label_2_regular text-red-800"
        >
          {{ fetchError }}
        </div>

        <!-- Empty: product has no connected platforms -->
        <div
          v-else-if="showEmptyConnected"
          class="mt-6xl flex min-h-[14rem] flex-col items-center justify-center gap-4 px-2 text-center"
        >
          <p class="label_2_regular secondary_text_color">
            No platforms connected to this product
          </p>
          <button
            type="button"
            class="primary_add_button label_2_medium rounded-lg px-6 py-3 primary_2_text_color"
            @click="$emit('add-platforms')"
          >
            Add platforms
          </button>
        </div>

        <!-- Platforms from GET /api/platforms -->
        <div
          v-else
          class="mt-6xl grid max-h-[min(28rem,50vh)] grid-cols-1 gap-6xl overflow-y-auto pr-1 md:grid-cols-2 md:max-h-none md:overflow-visible"
        >
          <div
            v-for="platform in displayPlatforms"
            :key="platformKey(platform)"
            class="relative cursor-pointer rounded-lg primary_border_color p-5xl transition-colors hover:bg-gray-25"
            :class="
              isSelected(platformKey(platform))
                ? 'selected_platform_border bg-gray-25'
                : ''
            "
            role="button"
            tabindex="0"
            @click="togglePlatform(platformKey(platform))"
            @keydown.enter.prevent="togglePlatform(platformKey(platform))"
          >
            <div class="flex items-center gap-md">
              <img
                :src="platform.icon || fallbackIcon"
                :alt="displayName(platform)"
                class="h-10 w-10 shrink-0 object-contain"
                @error="onImgError"
              />
              <div class="min-w-0 flex-1 text-left">
                <p class="label_1_medium primary_text_color">
                  {{ displayName(platform) }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer: apply selection only on Save changes -->
        <template v-if="showPlatformFooter">
          <div class="mt-6xl block h-px w-full bg-gray-25" />
          <div class="mt-6xl flex items-center justify-end gap-4xl">
            <button
              type="button"
              class="rounded-lg bg_primary_color py-xl px-xxl label_1_semibold primary_text_color transition-colors hover:bg-gray-25"
              @click="handleCancel"
            >
              Cancel
            </button>
            <button
              type="button"
              class="modal_primary_button rounded-lg py-xl px-xxl label_1_semibold transition-opacity"
              @click="handleSaveChanges"
            >
              Save changes
            </button>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import api from "../../services/api.js";
import InstagramIcon from "../../assets/images/InstagramIcon.svg";
import CloseIcon from "../../assets/images/CloseIcon.svg";

const props = defineProps({
  open: {
    type: Boolean,
    default: false,
  },
  selectedPlatforms: {
    type: Array,
    default: () => [],
  },
  /** When set, `GET /api/platforms?productId=` and only `connected` platforms are listed. */
  productId: {
    type: String,
    default: null,
  },
  /**
   * When true (e.g. chat post editor), opening without `productId` shows a hint instead of all platforms.
   * Calendar should leave this false so platforms load without a product.
   */
  requireProductId: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["close", "update:selectedPlatforms", "add-platforms"]);

const rawPlatforms = ref([]);
const loading = ref(false);
const fetchError = ref("");
const localSelectedPlatforms = ref([]);
const fallbackIcon = InstagramIcon;

function coercePlatformRow(p) {
  if (!p || typeof p !== "object") return null;
  const name =
    (typeof p.name === "string" && p.name.trim() !== "" && p.name) ||
    (typeof p.label === "string" && p.label.trim() !== "" && p.label) ||
    (typeof p.platform === "string" && p.platform.trim() !== "" && p.platform) ||
    null;
  if (!name) return null;
  return {
    ...p,
    name,
  };
}

function isPlatformConnected(p) {
  const c = p?.connected;
  return c === true || c === "true" || c === 1;
}

const displayPlatforms = computed(() => {
  const list = rawPlatforms.value.map(coercePlatformRow).filter(Boolean);
  if (!props.productId) {
    return list;
  }
  return list.filter((p) => isPlatformConnected(p));
});

const showConnectPostToProduct = computed(() => {
  return (
    props.requireProductId &&
    !props.productId &&
    !loading.value &&
    !fetchError.value
  );
});

const showEmptyConnected = computed(() => {
  return (
    Boolean(props.productId) &&
    !loading.value &&
    !fetchError.value &&
    displayPlatforms.value.length === 0
  );
});

const showPlatformFooter = computed(() => {
  return (
    !showConnectPostToProduct.value &&
    !loading.value &&
    !fetchError.value &&
    !showEmptyConnected.value &&
    displayPlatforms.value.length > 0
  );
});

function platformKey(platform) {
  return String(platform?.name || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "");
}

function displayName(platform) {
  const raw = String(platform?.name || platform?.label || "").trim();
  if (!raw) return "Platform";
  const lower = raw.toLowerCase();
  const map = {
    instagram: "Instagram",
    facebook: "Facebook",
    linkedin: "LinkedIn",
    twitter: "Twitter (X)",
    tiktok: "TikTok",
    youtube: "YouTube",
    whatsapp: "WhatsApp",
    googlecalendar: "Google Calendar",
  };
  if (map[lower]) return map[lower];
  if (lower.includes("google") && lower.includes("calendar")) return "Google Calendar";
  return raw.charAt(0).toUpperCase() + raw.slice(1);
}

function isSelected(key) {
  const k = String(key).toLowerCase();
  return localSelectedPlatforms.value.some((x) => String(x).toLowerCase() === k);
}

function syncLocalFromProps() {
  localSelectedPlatforms.value = (props.selectedPlatforms || []).map((x) =>
    String(x).toLowerCase()
  );
}

function togglePlatform(platformKeyStr) {
  const k = String(platformKeyStr).toLowerCase();
  const next = [...localSelectedPlatforms.value].map((x) => String(x).toLowerCase());
  const idx = next.indexOf(k);
  if (idx > -1) {
    next.splice(idx, 1);
  } else {
    next.push(k);
  }
  localSelectedPlatforms.value = next;
}

function handleCancel() {
  syncLocalFromProps();
  emit("close");
}

function handleSaveChanges() {
  emit("update:selectedPlatforms", [...localSelectedPlatforms.value]);
  emit("close");
}

function onImgError(e) {
  e.target.src = fallbackIcon;
}

async function fetchPlatforms() {
  fetchError.value = "";
  loading.value = true;
  try {
    const params = {};
    if (props.productId) {
      params.productId = props.productId;
    }
    const response = await api.get("/api/platforms", { params });
    let list = [];
    if (Array.isArray(response.data)) {
      list = response.data;
    } else if (response.data?.platforms && Array.isArray(response.data.platforms)) {
      list = response.data.platforms;
    }
    rawPlatforms.value = list;
  } catch (e) {
    console.error("GET /api/platforms failed:", e);
    rawPlatforms.value = [];
    fetchError.value =
      e?.response?.data?.message || e?.message || "Could not load platforms.";
  } finally {
    loading.value = false;
  }
}

watch(
  () => props.selectedPlatforms,
  () => {
    if (props.open) syncLocalFromProps();
  },
  { immediate: true }
);

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      syncLocalFromProps();
      fetchError.value = "";
      if (props.requireProductId && !props.productId) {
        rawPlatforms.value = [];
        return;
      }
      fetchPlatforms();
    }
  }
);
</script>

<style scoped>
.purple-checkmark {
  filter: brightness(0) saturate(100%) invert(40%) sepia(93%) saturate(1352%)
    hue-rotate(242deg) brightness(98%) contrast(95%);
}
</style>
