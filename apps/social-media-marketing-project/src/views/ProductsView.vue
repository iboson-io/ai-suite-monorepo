<template>
    <div
        v-if="isResolvingProductFromUrl"
        class="flex-1 bg_primary_color px-3xl py-12xl md:px-10xl lg:py-10xl flex items-center justify-center"
    >
        <p class="label_1_regular secondary_text_color">Loading product…</p>
    </div>
    <ProductIntroPage
        v-else-if="view === 'list'"
        ref="introPageRef"
        @add-product="handleAddProduct"
        @select-product="handleSelectProduct"
    />
    <ProductInfoForm
        v-else-if="view === 'create'"
        @back="handleCreateBack"
        @product-created="handleProductCreated"
    />
    <ProductEditPage
        v-else-if="view === 'edit' && editingProduct"
        :key="String(editingProduct.id ?? editingProduct.productId ?? editingProduct._id ?? '')"
        :product="editingProduct"
        @back="handleCloseEdit"
        @saved="handleEditSaved"
        @deleted="handleEditDeleted"
    />
</template>

<script setup>
import { ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import api, { LONG_REQUEST_TIMEOUT_MS } from "../services/api.js";
import ProductIntroPage from "../components/Dashboard/Product/ProductIntroPage.vue";
import ProductInfoForm from "../components/Dashboard/Product/ProductInfoForm.vue";
import ProductEditPage from "../components/Dashboard/Product/ProductEditPage.vue";

const route = useRoute();
const router = useRouter();

const view = ref("list"); // 'list' | 'create' | 'edit'
const editingProduct = ref(null);
const introPageRef = ref(null);
/** True while resolving `?productId=` from the URL (direct link / refresh / after create). */
const isResolvingProductFromUrl = ref(false);

function normalizeProductIdQuery(val) {
    if (val == null) return "";
    const s = Array.isArray(val) ? val[0] : val;
    return String(s).trim();
}

function pushProductIdToUrl(id) {
    if (!id) return;
    router.push({
        path: "/products",
        query: { ...route.query, productId: String(id) },
    });
}

function clearProductIdFromUrl() {
    if (route.query.productId == null) return;
    const { productId: _removed, ...rest } = route.query;
    router.replace({ path: "/products", query: rest });
}

async function resolveProductIdFromRoute(queryVal) {
    const id = normalizeProductIdQuery(queryVal);

    if (!id) {
        if (view.value === "edit") {
            editingProduct.value = null;
            view.value = "list";
        }
        return;
    }

    if (view.value === "create") return;

    if (
        view.value === "edit" &&
        editingProduct.value &&
        String(editingProduct.value.id) === id
    ) {
        return;
    }

    isResolvingProductFromUrl.value = true;
    try {
        const { data } = await api.get(
            `/api/products/${encodeURIComponent(id)}`,
            { timeout: LONG_REQUEST_TIMEOUT_MS }
        );
        const product = data && typeof data === "object" ? data : null;
        if (product?.id) {
            editingProduct.value = product;
            view.value = "edit";
        } else {
            clearProductIdFromUrl();
        }
    } catch (e) {
        console.error("Failed to load product from URL:", e);
        clearProductIdFromUrl();
        editingProduct.value = null;
        view.value = "list";
    } finally {
        isResolvingProductFromUrl.value = false;
    }
}

watch(() => route.query.productId, resolveProductIdFromRoute, {
    immediate: true,
});

const handleAddProduct = () => {
    clearProductIdFromUrl();
    view.value = "create";
};

const handleSelectProduct = (product) => {
    if (!product?.id) return;
    editingProduct.value = product;
    view.value = "edit";
    pushProductIdToUrl(product.id);
};

const handleCloseEdit = () => {
    editingProduct.value = null;
    view.value = "list";
    clearProductIdFromUrl();
};

const handleEditSaved = () => {
    introPageRef.value?.fetchProducts?.();
};

const handleEditDeleted = () => {
    introPageRef.value?.fetchProducts?.();
    handleCloseEdit();
};

const handleCreateBack = () => {
    view.value = "list";
    clearProductIdFromUrl();
};

/** After POST /api/products from create flow: load full product and open edit. */
async function handleProductCreated(payload) {
    const rawId =
        payload && typeof payload === "object"
            ? payload.id ?? payload.productId
            : payload;
    const id = rawId != null ? String(rawId).trim() : "";
    if (!id) return;

    isResolvingProductFromUrl.value = true;
    try {
        const { data } = await api.get(`/api/products/${encodeURIComponent(id)}`, {
            timeout: LONG_REQUEST_TIMEOUT_MS,
        });
        const product = data && typeof data === "object" ? data : null;
        if (product?.id) {
            editingProduct.value = product;
            view.value = "edit";
            await router.replace({
                path: "/products",
                query: { ...route.query, productId: String(product.id) },
            });
            introPageRef.value?.fetchProducts?.();
        }
    } catch (e) {
        console.error("Failed to load created product:", e);
        view.value = "list";
        clearProductIdFromUrl();
    } finally {
        isResolvingProductFromUrl.value = false;
    }
}
</script>
