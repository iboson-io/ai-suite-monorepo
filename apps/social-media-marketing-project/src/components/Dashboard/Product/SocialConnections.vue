<template>
  <div class=" bg_secondary_color rounded-2xl p-6xl brand_section_height">
    <!-- Section Header -->
    <div>
      <h2 class="label_1_semibold primary_text_color">
        Connect your social media accounts
      </h2>
      <p class="label_2_regular secondary_text_color mt-md">
        Link your brand's social profiles to create and publish posts directly from one place.
      </p>
      <p v-if="disconnectError" class="label_2_regular text-error-600 mt-md">
        {{ disconnectError }}
      </p>
    </div>
    <!-- Social Media Cards Grid -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6xl mt-10xl">
      <div
        v-for="platform in apiPlatforms"
        :key="platformKey(platform) || platform.name"
        class="primary_border_color flex items-center justify-between rounded-lg p-5xl hover:bg-gray-25 transition-shadow cursor-pointer"
        :class="
          clickedSocials.has(platformKey(platform))
            ? 'selected_platform_border bg-gray-25'
            : ''
        "
        @click="handleConnectClick(platform)"
      >
        <div class="flex items-center gap-xl">
          <img
            :src="platform.icon"
            :alt="displayLabel(platform)"
            class="h-9 w-9 flex-shrink-0 object-contain"
          />
          <div class="flex flex-col">
            <p class="label_1_medium primary_text_color">
              {{ displayLabel(platform) }}
            </p>
          </div>
        </div>
        <!-- Chain Link Icon (Connected) or Plus Icon -->
        <div
          v-if="clickedSocials.has(platformKey(platform))"
          class="relative group"
          :class="{ 'pointer-events-none opacity-60': disconnectingKey === platformKey(platform) }"
          @click.stop="handleDisconnectClick(platformKey(platform))"
        >
          <svg
            class="disconnect-icon"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M17 22V20M9 15L15 9M11 6.00031L11.463 5.46431C12.4008 4.52663 13.6727 3.99991 14.9989 4C16.325 4.00009 17.5968 4.527 18.5345 5.46481C19.4722 6.40261 19.9989 7.6745 19.9988 9.00066C19.9987 10.3268 19.4718 11.5986 18.534 12.5363L18 13.0003M13.0001 18L12.6031 18.534C11.6544 19.4722 10.3739 19.9984 9.03964 19.9984C7.70535 19.9984 6.42489 19.4722 5.47614 18.534C5.0085 18.0716 4.63724 17.521 4.38385 16.9141C4.13047 16.3073 4 15.6561 4 14.9985C4 14.3408 4.13047 13.6897 4.38385 13.0829C4.63724 12.476 5.0085 11.9254 5.47614 11.463L6.00014 11M20 17H22M2 7H4M7 2V4"
              stroke="#1D2125"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>

          <span class="tooltip">Disconnect</span>
        </div>
        <svg
          v-else
          class="h-5 w-5 text-[#8590A2]"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 4v16m8-8H4"
          />
        </svg>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted } from "vue";
import api, { TOKEN_KEY, API_BASE_URL } from "../../../services/api.js";

const emit = defineEmits(["connect-social", "platforms-change"]);

const props = defineProps({
  /** `platforms` from GET /api/products (strings or objects) */
  initialPlatforms: {
    type: Array,
    default: () => [],
  },
  /** When set (e.g. product edit), disconnect calls DELETE /api/products/:id/platforms/:platform */
  productId: {
    type: String,
    default: "",
  },
});

const apiPlatforms = ref([]);
let socialAuthPollIntervalId = null;
const disconnectError = ref("");
const disconnectingKey = ref(null);
/** Set while OAuth popup is open — used when `postMessage` has `success` but no platform field */
const pendingOAuthPlatformKey = ref(null);

function getApiMessageOrigin() {
  try {
    return new URL(API_BASE_URL).origin;
  } catch {
    return "";
  }
}

function handleSocialAuthMessage(event) {
  const allowed = getApiMessageOrigin();
  if (!allowed || event.origin !== allowed) return;

  const data = event.data;
  if (data == null || typeof data !== "object") return;
  if (!data.success) return;

  const fromPayload =
    data.platform ??
    data.name ??
    data.platformName ??
    data.platformKey ??
    "";
  const key =
    normalizePlatformKey(fromPayload) || pendingOAuthPlatformKey.value || "";
  pendingOAuthPlatformKey.value = null;

  if (!key) return;

  clickedSocials.value = new Set([...clickedSocials.value, key]);
  emit("connect-social", key);

  if (socialAuthPollIntervalId) {
    clearInterval(socialAuthPollIntervalId);
    socialAuthPollIntervalId = null;
  }
}

/**
 * Stable id for UI + DELETE path: derived only from API strings (no platform whitelist).
 * Align `GET /api/products` platform entries with `GET /api/platforms[].name` (same spelling).
 */
function normalizePlatformKey(raw) {
  if (raw == null || raw === "") return null;
  let s = String(raw).trim().toLowerCase();
  if (!s) return null;
  s = s.replace(/\s+/g, "_");
  s = s.replace(/[^a-z0-9_-]/g, "");
  s = s.replace(/_+/g, "_").replace(/^_|_$/g, "");
  return s || null;
}

/** Path segment for `DELETE /api/products/:id/platforms/:platform` — same slug the API uses */
function platformSegmentForApiPath(normalizedKey) {
  if (!normalizedKey) return "";
  return String(normalizedKey).toLowerCase();
}

function platformKey(platform) {
  return normalizePlatformKey(platform?.name) || "";
}

/**
 * Prefer `platform.label` from API when present; otherwise title-case from `name` / slug.
 */
function displayLabel(platformOrName) {
  const p =
    platformOrName && typeof platformOrName === "object" ? platformOrName : null;
  const labelFromApi =
    p && typeof p.label === "string" && p.label.trim() !== ""
      ? p.label.trim()
      : "";
  if (labelFromApi) return labelFromApi;

  const name = p ? p.name : platformOrName;
  const raw = String(name ?? "").trim();
  if (!raw) return "";

  if (/^[a-z0-9_-]+$/i.test(raw)) {
    return raw
      .replace(/_/g, " ")
      .replace(/-/g, " ")
      .split(/\s+/)
      .filter(Boolean)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(" ");
  }
  return raw.charAt(0).toUpperCase() + raw.slice(1);
}

function platformFromEntry(entry) {
  if (entry == null) return null;
  if (typeof entry === "string") return normalizePlatformKey(entry);
  if (typeof entry === "object") {
    const cand =
      entry.platform ??
      entry.platformType ??
      entry.type ??
      entry.name ??
      entry.provider ??
      entry.socialPlatform;
    return normalizePlatformKey(cand);
  }
  return null;
}

function buildConnectedSetFromProduct(platforms) {
  const next = new Set();
  if (!Array.isArray(platforms)) return next;
  for (const item of platforms) {
    const k = platformFromEntry(item);
    if (k) next.add(k);
  }
  return next;
}

const clickedSocials = ref(new Set());

watch(
  () => props.initialPlatforms,
  (platforms) => {
    clickedSocials.value = buildConnectedSetFromProduct(platforms);
  },
  { immediate: true, deep: true }
);

watch(
  () => props.productId,
  () => {
    disconnectError.value = "";
  }
);

watch(
  () => [...clickedSocials.value].sort().join(","),
  () => {
    emit("platforms-change");
  }
);

defineExpose({
  getConnectedPlatformKeys() {
    return [...clickedSocials.value].sort();
  },
});

/**
 * Same behavior as ChatPage `goToSocialPlatformAuth`: popup OAuth, token on URL,
 * poll until callback indicates success, then mark connected.
 */
function goToSocialPlatformAuth(authUrl, platformName = "") {
  if (!authUrl || typeof authUrl !== "string") return;

  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) {
    console.warn("Social connect: no access token; sign in required.");
    return;
  }

  const apiBase = api.defaults.baseURL;
  if (!apiBase || typeof apiBase !== "string") {
    console.error("Social connect: backend base URL is not set in api.js.");
    return;
  }

  let fullUrl;
  try {
    if (/^https?:\/\//i.test(authUrl)) {
      fullUrl = new URL(authUrl);
    } else {
      const path = authUrl.startsWith("/") ? authUrl : `/${authUrl}`;
      fullUrl = new URL(path, apiBase);
    }
    fullUrl.searchParams.set("token", token);
    const productId = String(props.productId || "").trim();
    if (productId) {
      fullUrl.searchParams.set("productId", productId);
    }
  } catch (e) {
    console.error("Social connect: invalid auth URL", e);
    return;
  }

  const slug = String(platformName || "oauth").replace(/\W+/g, "_");
  const windowName = `SocialAuth_${slug}`;
  const popup = window.open(
    fullUrl.toString(),
    windowName,
    "width=600,height=700,scrollbars=yes,resizable=yes"
  );

  if (!popup) {
    console.warn("Social connect: popup was blocked.");
    return;
  }

  if (socialAuthPollIntervalId) {
    clearInterval(socialAuthPollIntervalId);
    socialAuthPollIntervalId = null;
  }

  const key = normalizePlatformKey(platformName);
  if (!key) return;

  pendingOAuthPlatformKey.value = key;

  socialAuthPollIntervalId = setInterval(() => {
    try {
      if (popup.closed) {
        if (socialAuthPollIntervalId) {
          clearInterval(socialAuthPollIntervalId);
          socialAuthPollIntervalId = null;
        }
        pendingOAuthPlatformKey.value = null;
        return;
      }
      const href = popup.location.href;
      const done =
        href.includes("linked=") ||
        /[?&]linked(?:&|$)/.test(href) ||
        href.includes("auth/success");
      if (done) {
        if (socialAuthPollIntervalId) {
          clearInterval(socialAuthPollIntervalId);
          socialAuthPollIntervalId = null;
        }
        try {
          popup.close();
        } catch {
          /* ignore */
        }
        clickedSocials.value = new Set([...clickedSocials.value, key]);
        pendingOAuthPlatformKey.value = null;
        emit("connect-social", key);
      }
    } catch {
      /* cross-origin while on provider — expected */
    }
  }, 500);
}

async function fetchPlatforms() {
  try {
    const response = await api.get("/api/platforms");
    let list = [];
    if (Array.isArray(response.data)) {
      list = response.data;
    } else if (response.data?.platforms && Array.isArray(response.data.platforms)) {
      list = response.data.platforms;
    }
    apiPlatforms.value = list.filter(
      (p) => p && typeof p.name === "string" && p.name.trim() !== ""
    );
  } catch (e) {
    console.error("GET /api/platforms failed:", e);
    apiPlatforms.value = [];
  }
}

onMounted(() => {
  fetchPlatforms();
  window.addEventListener("message", handleSocialAuthMessage);
});

onUnmounted(() => {
  window.removeEventListener("message", handleSocialAuthMessage);
  pendingOAuthPlatformKey.value = null;
  if (socialAuthPollIntervalId) {
    clearInterval(socialAuthPollIntervalId);
    socialAuthPollIntervalId = null;
  }
});

function disconnectErrorMessage(err) {
  const data = err?.response?.data;
  const msg =
    (typeof data?.message === "string" && data.message) ||
    (typeof data?.error === "string" && data.error) ||
    err?.message ||
    "Could not disconnect platform.";
  return typeof msg === "string" ? msg : "Could not disconnect platform.";
}

const handleDisconnectClick = async (platform) => {
  if (!clickedSocials.value.has(platform)) return;
  if (disconnectingKey.value) return;

  const productId = (props.productId || "").trim();
  if (!productId) {
    const next = new Set(clickedSocials.value);
    next.delete(platform);
    clickedSocials.value = next;
    emit("connect-social", platform);
    return;
  }

  const segment = platformSegmentForApiPath(platform);
  if (!segment) return;

  disconnectError.value = "";
  disconnectingKey.value = platform;
  try {
    await api.delete(
      `/api/products/${encodeURIComponent(productId)}/platforms/${encodeURIComponent(segment)}`
    );
    const next = new Set(clickedSocials.value);
    next.delete(platform);
    clickedSocials.value = next;
    emit("connect-social", platform);
  } catch (e) {
    disconnectError.value = disconnectErrorMessage(e);
    console.error("DELETE product platform failed:", e);
  } finally {
    disconnectingKey.value = null;
  }
};

const handleConnectClick = (platform) => {
  const key = platformKey(platform);
  if (!key) return;
  if (clickedSocials.value.has(key)) return;
  goToSocialPlatformAuth(platform.authUrl, platform.name);
};
</script>

<style scoped>
.tooltip {
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  margin-bottom: 8px;
  padding: 6px 12px;
  background-color: #1a1a1a;
  color: white;
  font-size: 12px;
  white-space: nowrap;
  border-radius: 6px;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.2s ease-in-out;
  z-index: 10;
}

.tooltip::after {
  content: "";
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border: 5px solid transparent;
  border-top-color: #1a1a1a;
}

.group:hover .tooltip {
  opacity: 1;
}

.group:hover .disconnect-icon path {
  stroke: #e3665d;
  transition: stroke 0.2s ease-in-out;
}
</style>
