<template>
  <div class="flex-1 bg_primary_color px-3xl py-12xl md:px-10xl lg:py-10xl">
    <!-- Loading: keep layout stable -->
    <div
      v-if="isLoading"
      class="w-full rounded-2xl bg_secondary_color min-h-[320px] shadow-sm flex items-center justify-center"
    >
      <p class="label_1_regular secondary_text_color">Loading products…</p>
    </div>

    <!-- Products list -->
    <div v-else-if="hasProducts" class="w-full max-w-6xl mx-auto">
      <header class="mb-8xl">
        <h1 class="heading_h4_bold primary_text_color">Products</h1>
        <p class="mt-xs label_1_regular secondary_text_color">
          Manage your brands, connect their channels, and keep assets in one place.
        </p>

        <div
          class="mt-6xl flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between"
        >
          <div class="relative w-full sm:max-w-md">
            <span class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 secondary_text_color">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z" stroke="currentColor" stroke-width="2" />
                <path d="M16.5 16.5 21 21" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
              </svg>
            </span>
            <input
              v-model="searchQuery"
              type="search"
              placeholder="Search for products.."
              class="w-full rounded-lg border primary_border_color bg_secondary_color py-2.5 pl-10 pr-3 label_1_regular primary_text_color outline-none focus:border-black-400"
              autocomplete="off"
            />
          </div>

          <div class="flex flex-wrap items-center gap-3">
            <!-- <button
              type="button"
              class="inline-flex items-center gap-2 rounded-lg border primary_border_color bg_secondary_color px-xl py-md label_2_medium primary_text_color hover:bg-gray-25"
            >
              <img :src="PostFilterIcon" alt="" class="h-4 w-4" />
              Filter
            </button> -->
            <button
              type="button"
              @click="emit('add-product')"
              class="inline-flex items-center gap-md primary_button px-xl py-md"
            >
              <img :src="PlusIconWhite" alt="" class="h-4 w-4" />
              Add Product
            </button>
          </div>
        </div>
      </header>

      <div class="grid grid-cols-1 gap-5 md:grid-cols-2">
        <article
          v-for="product in filteredProducts"
          :key="product.id"
          class="rounded-2xl border primary_border_color bg_secondary_color p-5xl shadow-sm cursor-pointer transition-shadow hover:shadow-md"
          role="button"
          tabindex="0"
          @click="onProductCardClick(product, $event)"
          @keydown.enter.prevent="emitSelectProduct(product)"
          @keydown.space.prevent="emitSelectProduct(product)"
        >
          <div class="flex items-start justify-between gap-3">
            <div class="flex min-w-0 items-center gap-3">
              <img
                :src="product.brandLogoUrl"
                :alt="product.name"
                class="h-11 w-11 shrink-0 rounded-lg object-contain bg-gray-25"
                loading="lazy"
              />
              <span class="truncate label_1_semibold primary_text_color capitalize">
                {{ product.name }}
              </span>
            </div>
            <div class="relative shrink-0" data-product-card-menu>
              <button
                type="button"
                class="flex h-9 w-9 items-center justify-center rounded-full bg-gray-25 transition-colors hover:bg-gray-50"
                :aria-expanded="openMenuId === product.id"
                aria-label="Product options"
                @click.stop="toggleMenu(product.id)"
              >
                <img :src="ThreeDotsIcon" alt="" class="h-5 w-5 opacity-70" />
              </button>
              <div
                v-if="openMenuId === product.id"
                class="absolute right-0 z-10 mt-2 w-[min(calc(100vw-2rem),260px)] min-w-[220px] overflow-hidden rounded-xl border primary_border_color bg_secondary_color shadow-lg"
                @click.stop
              >
                <div class="flex items-center justify-between gap-3 px-4 py-3.5">
                  <span class="label_2_medium primary_text_color">Active / Inactive</span>
                  <button
                    type="button"
                    role="switch"
                    :aria-checked="isProductActive(product)"
                    class="inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full px-[3px] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40"
                    :class="
                      isProductActive(product)
                        ? 'justify-end bg-emerald-500'
                        : 'justify-start bg-gray-200'
                    "
                    @click.stop="toggleProductActive(product)"
                  >
                    <span
                      class="pointer-events-none h-5 w-5 rounded-full bg-white shadow-sm ring-1 ring-black/5"
                    />
                  </button>
                </div>
                <div class="h-px w-full bg-gray-25" aria-hidden="true" />
                <button
                  type="button"
                  class="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left label_2_medium primary_text_color transition-colors hover:bg-gray-25"
                  @click.stop="emitSelectProduct(product)"
                >
                  <span>Edit</span>
                  <img :src="ImageEditIcon" alt="" class="h-4 w-4 shrink-0 opacity-80" />
                </button>
                <div class="h-px w-full bg-gray-25" aria-hidden="true" />
                <button
                  type="button"
                  class="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left label_2_medium primary_text_color transition-colors hover:bg-gray-25 disabled:opacity-50"
                  :disabled="deletingProductId === product.id"
                  @click.stop="handleDeleteProduct(product)"
                >
                  <span>Delete</span>
                  <img :src="TrashIcon" alt="" class="h-4 w-4 shrink-0 opacity-80" />
                </button>
              </div>
            </div>
          </div>

          <div class="mt-6xl grid grid-cols-1 gap-6 sm:grid-cols-3 sm:gap-4">
            <div>
              <p class="label_2_medium secondary_text_color">Brand colors</p>
              <div class="mt-2 flex flex-wrap gap-2">
                <span
                  v-for="(hex, idx) in parseColors(product.brandColors)"
                  :key="idx"
                  class="inline-block h-8 w-8 rounded-md border primary_border_color"
                  :style="{ backgroundColor: hex }"
                  :title="hex"
                />
              </div>
            </div>
            <div class="min-w-0">
              <p class="label_2_medium secondary_text_color">Typography</p>
              <p class="mt-2 truncate label_1_medium primary_text_color">
                {{ product.typography || "—" }}
              </p>
            </div>
            <div>
              <p class="label_2_medium secondary_text_color">Connected platforms</p>
              <div class="mt-2 flex flex-wrap items-center gap-1.5">
                <template v-if="displayPlatforms(product).visible.length">
                  <img
                    v-for="(p, i) in displayPlatforms(product).visible"
                    :key="`${p}-${i}`"
                    :src="platformIcon(p)"
                    :alt="p"
                    class="h-8 w-8 rounded-full object-contain"
                  />
                  <span
                    v-if="displayPlatforms(product).extra > 0"
                    class="label_2_medium primary_text_color"
                  >
                    + {{ displayPlatforms(product).extra }}
                  </span>
                </template>
                <span v-else class="label_1_regular secondary_text_color">—</span>
              </div>
            </div>
          </div>
        </article>
      </div>
    </div>

    <!-- Empty state (existing UI) -->
    <div
      v-else
      class="w-full rounded-2xl bg_secondary_color h-[100%] shadow-sm flex items-center justify-center"
    >
      <div class="flex flex-col items-center text-center">
        <img
          :src="ProductIntroImage"
          alt="Empty State"
          class="h-44 w-auto"
        />

        <h2 class="heading_h6_bold primary_text_color mt-6xl">
          Add Your First Product
        </h2>

        <p class="mt-md label_1_regular secondary_text_color">
          Manage your brands, connect their channels, and keep assets in one place.
        </p>

        <button
          @click="emit('add-product')"
          class="mt-5xl flex items-center gap-md primary_button px-xl py-md"
        >
          <img :src="PlusIconWhite" alt="">
          Add Product
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from "vue";
import api from "../../../services/api.js";
import ProductIntroImage from "../../../assets/images/ProductIntroImage.png";
import PlusIconWhite from "../../../assets/images/PlusIconWhite.svg";
import PostFilterIcon from "../../../assets/images/PostFilter.svg";
import ThreeDotsIcon from "../../../assets/images/ThreeDotsIcon.svg";
import ImageEditIcon from "../../../assets/images/ImageEditIcon.svg";
import TrashIcon from "../../../assets/images/TrashIcon.svg";
import InstagramIcon from "../../../assets/images/InstagramIcon.svg";
import FacebookIcon from "../../../assets/images/FacebookIcon.svg";
import LinkedInIcon from "../../../assets/images/LinkedInIcon.svg";
import TwitterIcon from "../../../assets/images/TwitterIcon.svg";
import TikTokIcon from "../../../assets/images/TikTokIcon.svg";
import YoutubeIcon from "../../../assets/images/YoutubeIcon.svg";
import PlatformIcon from "../../../assets/images/PlatformIcon.svg";

const emit = defineEmits(["add-product", "select-product"]);

const products = ref([]);
const isLoading = ref(true);
const searchQuery = ref("");
const openMenuId = ref(null);
const deletingProductId = ref(null);
/** Local toggle state keyed by product id; falls back to API `isActive` when unset. */
const activeOverrides = ref({});

const platformMap = {
  instagram: InstagramIcon,
  facebook: FacebookIcon,
  linkedin: LinkedInIcon,
  twitter: TwitterIcon,
  tiktok: TikTokIcon,
  youtube: YoutubeIcon,
};

const hasProducts = computed(() => products.value.length > 0);

const filteredProducts = computed(() => {
  const q = searchQuery.value.trim().toLowerCase();
  if (!q) return products.value;
  return products.value.filter((p) => (p.name || "").toLowerCase().includes(q));
});

function parseColors(colors) {
  if (!colors) return [];
  if (Array.isArray(colors)) {
    return colors.map((c) => String(c).trim()).filter(Boolean);
  }
  if (typeof colors === "string") {
    return colors
      .split(",")
      .map((c) => c.trim())
      .filter(Boolean);
  }
  return [];
}

/** Map API / UI strings to keys used in platformMap (instagram, facebook, …). */
function normalizePlatformKey(raw) {
  if (raw == null || raw === "") return null;
  const s = String(raw).trim().toLowerCase().replace(/\s+/g, "");
  if (s.includes("instagram") || s === "ig") return "instagram";
  if (s.includes("facebook") || s === "fb") return "facebook";
  if (s.includes("linkedin")) return "linkedin";
  if (s.includes("twitter") || s === "x") return "twitter";
  if (s.includes("tiktok")) return "tiktok";
  if (s.includes("youtube") || s === "yt") return "youtube";
  if (platformMap[s]) return s;
  return s.replace(/[^a-z0-9]/g, "") || null;
}

function platformFromSocialAccount(entry) {
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

function normalizePlatformList(product) {
  const seen = new Set();
  const out = [];

  const pushKey = (k) => {
    const key = normalizePlatformKey(k);
    if (key && !seen.has(key)) {
      seen.add(key);
      out.push(key);
    }
  };

  const lists = [
    product.platforms,
    product.connectedPlatforms,
    product.connected_platforms,
  ];

  for (const raw of lists) {
    if (!Array.isArray(raw)) continue;
    for (const item of raw) {
      if (item != null && typeof item === "object" && !Array.isArray(item)) {
        pushKey(platformFromSocialAccount(item));
      } else {
        pushKey(item);
      }
    }
  }

  if (Array.isArray(product.socialAccounts) && product.socialAccounts.length) {
    for (const acc of product.socialAccounts) {
      pushKey(platformFromSocialAccount(acc));
    }
  }

  return out;
}

function displayPlatforms(product) {
  const list = normalizePlatformList(product);
  const maxIcons = 3;
  const visible = list.slice(0, maxIcons);
  const extra = Math.max(0, list.length - maxIcons);
  return { visible, extra };
}

function platformIcon(key) {
  const k = String(key).toLowerCase();
  return platformMap[k] || PlatformIcon;
}

function isProductActive(product) {
  const id = product.id;
  if (activeOverrides.value[id] !== undefined) {
    return activeOverrides.value[id];
  }
  if (product.isActive !== undefined && product.isActive !== null) {
    return Boolean(product.isActive);
  }
  return true;
}

function toggleProductActive(product) {
  const id = product.id;
  const next = !isProductActive(product);
  activeOverrides.value = { ...activeOverrides.value, [id]: next };
}

function toggleMenu(id) {
  openMenuId.value = openMenuId.value === id ? null : id;
}

function closeMenu() {
  openMenuId.value = null;
}

function emitSelectProduct(product) {
  closeMenu();
  emit("select-product", product);
}

function onProductCardClick(product, e) {
  if (e?.target?.closest?.("[data-product-card-menu]")) return;
  emitSelectProduct(product);
}

/** DELETE /api/products/:id */
async function handleDeleteProduct(product) {
  const id = product?.id;
  if (!id || deletingProductId.value) return;
  closeMenu();
  deletingProductId.value = id;
  try {
    await api.delete(`/api/products/${encodeURIComponent(id)}`);
    products.value = products.value.filter((p) => p.id !== id);
    const nextOverrides = { ...activeOverrides.value };
    delete nextOverrides[id];
    activeOverrides.value = nextOverrides;
  } catch (e) {
    console.error("Delete product failed:", e);
    window.alert(
      e?.response?.data?.message || e?.message || "Could not delete product"
    );
  } finally {
    deletingProductId.value = null;
  }
}

function onDocClick(e) {
  if (!e.target.closest("[data-product-card-menu]")) {
    openMenuId.value = null;
  }
}

async function fetchProducts() {
  isLoading.value = true;
  try {
    const response = await api.get("/api/products");
    let list = [];
    if (Array.isArray(response.data)) {
      list = response.data;
    } else if (response.data?.products && Array.isArray(response.data.products)) {
      list = response.data.products;
    }
    products.value = list;
  } catch (e) {
    console.error("Error fetching products:", e);
    products.value = [];
  } finally {
    isLoading.value = false;
  }
}

onMounted(() => {
  fetchProducts();
  document.addEventListener("click", onDocClick);
});

onUnmounted(() => {
  document.removeEventListener("click", onDocClick);
});

defineExpose({
  fetchProducts,
});
</script>
