<template>
  <!-- Backdrop -->
  <div v-if="open" class="fixed inset-0 z-50 bg_overlay" @click="closeModal">
    <!-- Modal - Positioned on the right -->
    <div
      class="fixed right-0 bottom-0 w-full top-0 hide-scrollbar md:max-w-lg  max-h-screen overflow-y-auto bg_secondary_color shadow-2xl"
      @click.stop>
      <!-- Header -->
      <div class="sticky top-0 bg_primary_color px-6xl py-6xl flex items-center justify-between z-10 gap-xl">
        <div class="flex min-w-0 flex-1 items-center gap-6xl">
          <button v-if="showRepostPanel" type="button" class="shrink-0 rounded-full transition-colors" aria-label="Back"
            @click="backFromRepost">
            <img :src="BackButtonArrow" alt="Back">
          </button>
          <h2 class="heading_h6_semibold primary_text_color truncate">
            {{ modalTitle }}
          </h2>
        </div>
        <button type="button" @click="closeModal"
          class="shrink-0 rounded-lg border primary_border_color p-xs leading-none primary_text_color hover:bg-black-25"
          aria-label="Close">
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 1L1 9M1 1L9 9" stroke="#28293D" stroke-width="2" stroke-linecap="round"
              stroke-linejoin="round" />
          </svg>
        </button>
      </div>

      <!-- Content -->
      <div class="pb-6xl px-6xl bg_primary_color">
        <!-- Analytics view (default) -->
        <template v-if="!showRepostPanel">
          <p v-if="fetchError"
            class="mt-6xl rounded-lg border border-warning-200 bg-warning-50 px-xl py-md body_3_medium text-warning-700"
            role="alert">
            {{ fetchError }}
          </p>
          <div v-if="isLoading" class="mt-6xl flex items-center justify-center gap-md py-10xl">
            <div class="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-primary_color" />
            <span class="label_2_medium secondary_text_color">Loading post…</span>
          </div>
          <!-- Performance Banner -->
          <div class="rounded-2xl p-[1px]"
            style="background: linear-gradient(124.88deg, #9966FF 18.51%, #0073E6 38.28%, #FAB000 57.61%, #15BE53 76.05%);">
            <div class="bg_secondary_color rounded-2xl px-xl py-3xl flex items-center justify-center">
              <img :src="LogoImage" alt="" class="h-7 ">
              <span class="label_2_semibold primary_text_color">
                This post performed 38% better than your average image post.
              </span>
            </div>
          </div>
          <div class="bg_secondary_color p-5xl rounded-2xl mt-6xl">
            <!-- Status and aspect ratio -->
            <div class="flex justify-between gap-3xl justify-center">
              <span class="rounded-lg px-md py-xl label_2_semibold flex items-center gap-xs w-36 md:min-w-56"
                :class="statusClass(resolvedStatus)">
                <img :src="PublishIcon" alt="">
                {{ resolvedStatus }}
              </span>
              <div class="relative min-w-0 max-w-[min(100%,11rem)] shrink md:max-w-[14rem] aspect-dropdown-container">
                <button type="button" :disabled="!imageVariants.length" @click.stop="toggleAspectDropdown"
                  class="flex w-full min-w-0 max-w-full items-center gap-6xl overflow-hidden px-md py-xl label_2_semibold primary_text_color primary_border_color rounded-lg disabled:cursor-not-allowed disabled:opacity-50 md:gap-md">
                  <img :src="PostFilter" alt="" class="h-5 w-5 shrink-0 object-contain">
                  <span class=" min-w-0 flex-1 truncate text-left md:block">{{ aspectDropdownLabel }}</span>
                  <img :src="DownArrow" alt="" class="h-4 w-4 shrink-0" />
                </button>

                <!-- Aspect / image variant dropdown -->
                <div v-if="showAspectDropdown"
                  class="absolute right-0 md:left-0 top-8 z-50 min-w-[200px] max-h-64 overflow-y-auto rounded-lg bg_secondary_color shadow-lg primary_border_color py-md">
                  <div v-for="variant in imageVariants" :key="variant.aspectName"
                    @click.stop="selectAspect(variant.aspectName)"
                    class="px-3xl py-xl hover:bg-gray-25 cursor-pointer body_3_medium"
                    :class="selectedAspectName === variant.aspectName ? 'bg-info-50' : ''">
                    {{ aspectLabel(variant) }}
                  </div>
                </div>
              </div>
            </div>

            <!-- Post Image (fixed frame; variant aspect letterboxed inside) -->
            <div
              class="mx-auto mt-lg flex h-72 w-full max-w-[30em] items-center justify-center overflow-hidden rounded-lg bg_secondary_color">
              <img :src="previewImageUrl" :alt="resolvedTitle" class="h-full w-full object-contain"
                referrerpolicy="no-referrer" />
            </div>

            <!-- Caption / content -->
            <div class="mt-xl">
              <p v-if="resolvedContent" class="body_1_regular primary_text_color mt-xl whitespace-pre-wrap">
                {{ resolvedContent }}
              </p>
              <p v-else class="body_1_regular primary_text_color mt-xl">
                {{ resolvedTitle }}
              </p>
            </div>
            <div class="block h-[1px] w-full bg-gray-25 mt-5xl"></div>
            <!-- Date/Time -->
            <p class="label_2_semibold secondary_text_color mt-5xl">Date/Time</p>
            <div class="body_1_regular primary_text_color mt-xxs">
              {{ formatDetailDateTime() }}
            </div>
          </div>
          <!-- Metrics Grid -->
          <div
            class=" flex flex-col justify-center items-center md:grid md:grid-cols-2 lg:grid grid-cols-1 gap-5xl lg:grid-cols-2 mt-6xl">

            <AnalyticsStatCard v-for="(stat, index) in stats" :key="index" v-bind="stat" />
          </div>

          <!-- Repost Button -->
          <button type="button" :disabled="repostBeginLoading" @click="beginRepost"
            class="w-full primary_button label_1_semibold flex items-center justify-center gap-md rounded-lg mt-5xl disabled:cursor-not-allowed disabled:opacity-60">
            <img v-if="!repostBeginLoading" :src="RepostBottonIcon" alt="">
            <span v-if="repostBeginLoading"
              class="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
            {{ repostBeginLoading ? 'Opening…' : 'Repost' }}
          </button>
        </template>

        <!-- Calendar-style repost / post detail (GET /post/:id) -->
        <template v-else>
          <div v-if="repostBeginLoading" class="mt-6xl flex items-center justify-center gap-md py-10xl">
            <div class="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-primary_color" />
            <span class="label_2_medium secondary_text_color">Loading post…</span>
          </div>
          <p v-else-if="repostFetchError"
            class="mt-6xl rounded-lg border border-warning-200 bg-warning-50 px-xl py-md body_3_medium text-warning-700"
            role="alert">
            {{ repostFetchError }}
          </p>
          <div v-else-if="repostForm"
            class=" min-h-0 overflow-y-auto rounded-lg primary_border_color p-5xl custom-scrollbar-calendar">
            <div :class="[
                'inline-flex w-full items-center gap-md rounded-md p-xl label_1_semibold',
                repostStatusPositive ? 'bg-success-50 text-success-800' : 'pending_text_style',
              ]">
              <img v-if="repostStatusPositive" :src="ApproveIcon" alt="" class="h-4 w-4">
              <img v-else :src="PendingIcon" alt="" class="h-4 w-4">
              <span>{{ repostStatusLabel }}</span>
            </div>

            <div class="relative mt-xl">
              <div class="repost-aspect-dropdown-container relative w-full">
                <img :src="PostFilter" alt=""
                  class="pointer-events-none absolute left-2 top-1/2 h-5 w-5 -translate-y-1/2" />
                <button type="button"
                  class="flex w-full items-center gap-md rounded-lg bg_secondary_color py-md pl-9xl pr-10xl text-left label_1_medium primary_text_color transition-colors hover:bg-gray-25"
                  :class="repostAspectOpen ? 'border-[3px] border-[#D9E2FC]' : 'border primary_border_color'"
                  aria-haspopup="listbox" :aria-expanded="repostAspectOpen" aria-label="Post format or aspect"
                  @click.stop="toggleRepostAspectDropdown">
                  <span class="min-w-0 flex-1 truncate">{{ repostForm.postType }}</span>
                  <img :src="DownArrow" alt=""
                    class="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 shrink-0" />
                </button>
                <div v-if="repostAspectOpen"
                  class="absolute left-0 top-full z-50 mt-sm max-h-[min(16rem,40vh)] w-full min-w-[155px] max-w-full overflow-y-auto rounded-md bg_secondary_color shadow-lg primary_border_color lg:min-w-[200px]"
                  role="listbox" @click.stop>
                  <button v-for="opt in repostAspectOptions" :key="opt.value" type="button" role="option"
                    :aria-selected="repostForm.postType === opt.value" :class="[
                      'flex w-full items-center gap-md border-b px-xl py-3xl text-left label_2_medium primary_text_color transition-colors hover:bg-info-50 primary_border_color last:border-b-0',
                      { 'bg-info-50': repostForm.postType === opt.value },
                    ]" @click="selectRepostAspect(opt.value)">
                    {{ opt.label }}
                  </button>
                </div>
              </div>
            </div>

            <div class="mt-xl flex h-72 items-center justify-center overflow-hidden rounded-lg bg_primary_color">
              <img :src="repostDetailImageUrl" :alt="repostForm.title" class="max-h-full w-full max-w-md object-contain"
                referrerpolicy="no-referrer" @error="onRepostPreviewImgError" />
            </div>

            <p class="label_2_medium primary_text_color mt-6xl">Caption</p>
            <div class="relative mt-md">
              <textarea v-model="repostForm.caption" rows="5"
                class="min-h-[140px] w-full resize-none rounded-lg bg_secondary_color p-xl label_1_regular primary_text_color primary_border_color"
                placeholder="Write your caption here..." />
              <button type="button"
                class="absolute bottom-3 right-3 p-md transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Regenerate caption with AI" :disabled="regenerateCaptionLoading || !repostForm?.id"
                @click="regenerateRepostCaption">
                <img :src="AiIcon" alt="">
              </button>
            </div>

            <p class="label_2_medium primary_text_color mt-6xl">Platforms</p>
            <div class="mt-md flex items-center gap-xl overflow-auto hide-scrollbar">
              <img v-for="platform in repostForm.platforms" :key="platform" :src="getRepostPlatformIcon(platform)"
                :alt="platform" class="h-10 w-10 shrink-0 object-contain" @error="onRepostPlatformIconError" />
              <button type="button" class="shrink-0 cursor-pointer rounded-lg border primary_border_color p-md"
                aria-label="Edit platforms" @click="openRepostPlatformModal">
                <img :src="ImageEditIcon" alt="" class="h-6 w-6">
              </button>
            </div>

            <div class="mt-6xl">
              <div class="flex items-center gap-md mb-md">
                <p class="label_2_medium primary_text_color">Scheduled for</p>
                <img :src="Iicon" alt="" class="w-4 h-4 cursor-help">
              </div>
              <div
                class="cursor-pointer rounded-lg px-3xl py-xl regular_border_color hover:bg-gray-25 flex items-center justify-between"
                role="button" tabindex="0" @click="openRepostSchedulerModal"
                @keydown.enter.prevent="openRepostSchedulerModal">
                <p class="label_1_medium primary_text_color">
                  {{ formatRepostScheduledTimeText(repostForm) }}
                </p>
                <img :src="CalendarIcon" alt="" class="w-5 h-5">
              </div>
            </div>

            <p v-if="regenerateCaptionError"
              class="mt-6xl rounded-lg border border-warning-200 bg-warning-50 px-xl py-md body_3_medium text-warning-700"
              role="alert">
              {{ regenerateCaptionError }}
            </p>
            <p v-if="saveRepostError"
              class="mt-6xl rounded-lg border border-warning-200 bg-warning-50 px-xl py-md body_3_medium text-warning-700"
              role="alert">
              {{ saveRepostError }}
            </p>

            <div class="relative mt-6xl flex items-center gap-6xl">
              <div class="repost-dots-wrap relative rounded-lg bg-gray-25 px-4xl py-md hover:bg-black-25 cursor-pointer"
              @click.stop="toggleRepostDotsMenu">
                <button type="button" class="relative" aria-label="More actions" >
                  <img :src="DotsIcon" alt="" class="mb-xs">
                </button>
                <div v-if="repostDotsOpen"
                  class="absolute bottom-full left-0 z-50 mb-sm min-w-[160px] rounded-lg border primary_border_color bg_secondary_color py-md shadow-lg"
                  @click.stop>
                  <button type="button"
                    class="w-full px-5xl py-3xl text-left body_2_medium primary_text_color hover:bg-info-50"
                    @click="repostDotsOpen = false">
                    Actions coming soon
                  </button>
                </div>
              </div>
              <button type="button" :disabled="!canSaveRepostChanges || saveRepostLoading"
                class="flex w-full flex-1 items-center justify-center gap-md rounded-lg p-md label_1_semibold transition-opacity primary_2_text_color"
                :class="
                  canSaveRepostChanges && !saveRepostLoading
                    ? 'primary_add_button'
                    : 'primary_add_button cursor-not-allowed opacity-50'
                " @click="submitRepostForm">
                <span v-if="saveRepostLoading"
                  class="h-5 w-5 shrink-0 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                <img v-else :src="SaveIcon" alt="">
                {{ saveRepostLoading ? 'Saving…' : 'Save changes' }}
              </button>
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>

  <SocialMediaModal :open="showRepostPlatformModal" require-product-id :product-id="repostForm?.productId ?? null"
    :selected-platforms="repostForm?.platforms ?? []" @close="closeRepostPlatformModal"
    @update:selected-platforms="updateRepostPlatforms" @add-platforms="handleAddPlatformsFromRepostModal" />
  <SchedulerCalendarModal :open="showRepostSchedulerModal" :initial-date="repostSchedulerInitialDate"
    :initial-time="repostSchedulerInitialTime" @close="closeRepostSchedulerModal" @schedule="handleRepostSchedule" />
  <PostScheduledModal :open="showPostScheduledSuccess" :title="postScheduledModalTitle"
    :subtitle="postScheduledModalSubtitle" @close="closePostScheduledSuccess"
    @view-calendar="onPostScheduledViewCalendar" />
</template>

<script setup>
  import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue';
  import { useRouter } from 'vue-router';
  import api, { LONG_REQUEST_TIMEOUT_MS } from '../../../services/api.js';
  import SocialMediaModal from '../../Calendar/SocialMediaModal.vue';
  import { SchedulerCalendarModal } from '@ai-suite/shared-ui';
  import AnalyticsStatCard from "./AnalyticsCard.vue"
  import LogoImage from '../../../assets/images/LogoImage.png';
  import PublishIcon from '../../../assets/images/PublishIcon.svg';
  import DownArrow from '../../../assets/images/DownArrow.svg';
  import PostFilter from '../../../assets/images/PostFilter.svg';
  import TotalReach from '../../../assets/images/TotalReach.svg';
  import MessageIcon from '../../../assets/images/MessageIcon.svg';
  import LikeIcon from '../../../assets/images/LikeIcon.svg';
  import CommentIcon from '../../../assets/images/CommentIcon.svg';
  import RepostBottonIcon from "../../../assets/images/RepostBottonIcon.svg";
  import BackButtonArrow from '../../../assets/images/BackButtonArrow.svg';
  import ApproveIcon from '../../../assets/images/ApproveIcon.svg';
  import PendingIcon from '../../../assets/images/PendingIcon.svg';
  import AiIcon from '../../../assets/images/AiIcon.svg';
  import SaveIcon from '../../../assets/images/SaveIcon.svg';
  import DotsIcon from '../../../assets/images/DotsIcon.svg';
  import PlatformIcon from '../../../assets/images/PlatformIcon.svg';
  import PostFallbackImg from '../../../assets/images/PostImage.png';
  import ImageEditIcon from '../../../assets/images/ImageEditIcon.svg';
  import CalendarIcon from '../../../assets/images/CalendarIcon.svg';
  import Iicon from '../../../assets/images/Iicon.svg';
  import PostScheduledModal from './PostScheduledModal.vue';

  const props = defineProps({
    open: Boolean,
    postData: Object,
    /** When true (e.g. row “Repost”), open straight into schedule / repost panel after analytics load. */
    openRepostInitially: {
      type: Boolean,
      default: false,
    },
  });

  const emit = defineEmits(['close', 'repost', 'viewCalendar', 'saved']);

  const router = useRouter();

  const showAspectDropdown = ref(false);
  const selectedAspectName = ref(null);

  const showRepostPanel = ref(false);
  const repostForm = ref(null);
  const repostBeginLoading = ref(false);
  const repostFetchError = ref('');
  const repostAspectOpen = ref(false);
  const repostDotsOpen = ref(false);
  const showRepostPlatformModal = ref(false);
  const showRepostSchedulerModal = ref(false);
  const repostSchedulerInitialDate = ref(null);
  const repostSchedulerInitialTime = ref(null);
  const saveRepostLoading = ref(false);
  const saveRepostError = ref('');
  const regenerateCaptionLoading = ref(false);
  const regenerateCaptionError = ref('');
  const showPostScheduledSuccess = ref(false);
  const postScheduledModalTitle = ref('Post scheduled');
  const postScheduledModalSubtitle = ref('');
  let removeRepostAspectClick = null;

  /** Row from `GET /api/analytics/posts?postId=` */
  const detail = ref(null);
  const fetchError = ref('');
  const isLoading = ref(false);

  const modalTitle = computed(() =>
    showRepostPanel.value ? 'Post details' : 'View post'
  );

  function closeModal() {
    showRepostPanel.value = false;
    repostForm.value = null;
    repostFetchError.value = '';
    repostDotsOpen.value = false;
    repostAspectOpen.value = false;
    showRepostPlatformModal.value = false;
    showRepostSchedulerModal.value = false;
    saveRepostError.value = '';
    regenerateCaptionError.value = '';
    regenerateCaptionLoading.value = false;
    resetPostScheduledModalOnly();
    emit('close');
  }

  function backFromRepost() {
    showRepostPanel.value = false;
    repostForm.value = null;
    repostFetchError.value = '';
    regenerateCaptionError.value = '';
    regenerateCaptionLoading.value = false;
    repostDotsOpen.value = false;
    repostAspectOpen.value = false;
    showRepostPlatformModal.value = false;
    showRepostSchedulerModal.value = false;
    saveRepostError.value = '';
  }

  function resetPostScheduledModalOnly() {
    showPostScheduledSuccess.value = false;
    postScheduledModalSubtitle.value = '';
    postScheduledModalTitle.value = 'Post scheduled';
  }

  function closePostScheduledSuccess() {
    resetPostScheduledModalOnly();
    emit('close');
  }

  function onPostScheduledViewCalendar() {
    emit('viewCalendar');
    resetPostScheduledModalOnly();
  }

  function extractUrlFromImageRow(row) {
    if (row == null) return null;
    if (typeof row === 'string') {
      const s = row.trim();
      return s || null;
    }
    if (typeof row !== 'object') return null;
    const u = row.imageUrl ?? row.image_url ?? row.url ?? row.src ?? row.href;
    return u != null && String(u).trim() !== '' ? String(u).trim() : null;
  }

  function normalizeImageVariants(rawImages) {
    if (!Array.isArray(rawImages) || rawImages.length === 0) return [];
    return rawImages
      .map((row) => {
        const imageUrl = extractUrlFromImageRow(row);
        if (!imageUrl) return null;
        const aspect = row.aspect != null ? String(row.aspect).trim() : '1:1';
        const aspectName =
          String(row.aspectName ?? '').trim() ||
          (aspect ? `Aspect (${aspect})` : 'Variant');
        return { aspect, aspectName, imageUrl };
      })
      .filter(Boolean);
  }

  function pickDefaultImageVariant(variants) {
    if (!variants?.length) return null;
    const byName = variants.find((r) => r.aspectName === 'Default (1:1)');
    if (byName) return byName;
    const byShort = variants.find((r) => String(r.aspectName ?? '').trim().toLowerCase() === 'default');
    if (byShort) return byShort;
    const byAspect = variants.find((r) => r.aspect === '1:1');
    if (byAspect) return byAspect;
    const loose = variants.find((r) => {
      const n = String(r.aspectName ?? '').toLowerCase();
      return n.includes('default') && (n.includes('1:1') || n.includes('1x1'));
    });
    if (loose) return loose;
    return variants[0];
  }

  const imageVariants = computed(() => normalizeImageVariants(detail.value?.images ?? []));

  const selectedVariant = computed(() => {
    const v = imageVariants.value;
    if (!v.length) return null;
    const name = selectedAspectName.value;
    if (name) {
      const hit = v.find((x) => x.aspectName === name);
      if (hit) return hit;
    }
    return pickDefaultImageVariant(v) || v[0];
  });

  watch(
    imageVariants,
    (variants) => {
      if (!variants.length) {
        selectedAspectName.value = null;
        return;
      }
      if (
        !selectedAspectName.value ||
        !variants.some((x) => x.aspectName === selectedAspectName.value)
      ) {
        selectedAspectName.value =
          pickDefaultImageVariant(variants)?.aspectName ?? variants[0].aspectName;
      }
    },
    { immediate: true }
  );

  const previewImageUrl = computed(() => {
    const fromVariant = selectedVariant.value?.imageUrl;
    if (fromVariant) return fromVariant;
    return props.postData?.image || '';
  });

  function aspectLabel(variant) {
    const a = variant.aspect || '?';
    return `${variant.aspectName} (${a})`;
  }

  const aspectDropdownLabel = computed(() => {
    const v = selectedVariant.value;
    if (!v) return 'Image';
    return aspectLabel(v);
  });

  const resolvedTitle = computed(() => {
    const t = detail.value?.title ?? props.postData?.title;
    return t != null && String(t).trim() !== '' ? String(t).trim() : 'Post';
  });

  const resolvedContent = computed(() => {
    const c = detail.value?.content;
    if (c == null) return '';
    const s = String(c).trim();
    return s || '';
  });

  const resolvedStatus = computed(() => {
    const raw = props.postData?.status ?? detail.value?.status;
    if (raw == null || String(raw).trim() === '') return 'Published';
    const s = String(raw).trim();
    return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
  });

  const statusClass = (status) => {
    if (status === 'Published') return ' bg-blue-25 text-blue-200';
    if (status === 'Pending') return 'bg-warning-50 text-warning-500';
    if (status === 'Approved') return 'bg-success-50 text-success-800';
    return 'bg-blue-25 text-blue-200';
  };

  function formatReachLike(n) {
    const v = Number(n);
    if (Number.isNaN(v)) return '0';
    if (v >= 1000000) return `${(v / 1000000).toFixed(1)}M`;
    if (v >= 1000) return `${(v / 1000).toFixed(0)}K`;
    return String(Math.round(v));
  }

  function formatDetailDateTime() {
    const iso = detail.value?.createdAt ?? detail.value?.created_at;
    if (iso) {
      const d = new Date(iso);
      if (!Number.isNaN(d.getTime())) {
        const dateStr = `${d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })},`;
        const timeStr = d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
        return `${dateStr} ${timeStr}`;
      }
    }
    const date = props.postData?.date || '';
    const time = props.postData?.time || '';
    return `${date} ${time}`.trim() || '—';
  }

  const toggleAspectDropdown = () => {
    showAspectDropdown.value = !showAspectDropdown.value;
  };

  const selectAspect = (aspectName) => {
    selectedAspectName.value = aspectName;
    showAspectDropdown.value = false;
  };

  const handleClickOutside = (event) => {
    if (!event.target.closest('.aspect-dropdown-container')) {
      showAspectDropdown.value = false;
    }
    if (!event.target.closest('.repost-dots-wrap')) {
      repostDotsOpen.value = false;
    }
  };

  async function fetchPostAnalytics(postId) {
    fetchError.value = '';
    isLoading.value = true;
    try {
      const { data } = await api.get('/api/analytics/posts', {
        params: { postId: String(postId).trim() },
      });
      const list =
        data?.success && Array.isArray(data.analytics)
          ? data.analytics
          : Array.isArray(data?.data?.analytics)
            ? data.data.analytics
            : [];
      const id = String(postId).trim();
      const row =
        list.find((r) => String(r.id ?? r.postId ?? '').trim() === id) ||
        list[0] ||
        null;
      detail.value = row;
      if (!row) fetchError.value = 'No analytics found for this post.';
    } catch (e) {
      console.error('GET /api/analytics/posts failed:', e);
      detail.value = null;
      fetchError.value = 'Could not load post details. Please try again.';
    } finally {
      isLoading.value = false;
    }
  }

  watch(
    () => [props.open, props.postData?.postId, props.openRepostInitially],
    async ([open, postId]) => {
      if (!open) {
        detail.value = null;
        fetchError.value = '';
        isLoading.value = false;
        showRepostPanel.value = false;
        repostForm.value = null;
        repostFetchError.value = '';
        repostDotsOpen.value = false;
        repostAspectOpen.value = false;
        showRepostPlatformModal.value = false;
        showRepostSchedulerModal.value = false;
        saveRepostError.value = '';
        resetPostScheduledModalOnly();
        return;
      }
      const id = postId != null ? String(postId).trim() : '';
      if (!id) {
        fetchError.value = 'Missing post id.';
        detail.value = null;
        return;
      }
      resetPostScheduledModalOnly();
      await fetchPostAnalytics(id);
      if (props.open && props.openRepostInitially) {
        await beginRepost();
      }
    }
  );

  function formatDateToString(d) {
    const date = d instanceof Date ? d : new Date(d);
    if (Number.isNaN(date.getTime())) return '';
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  function normalizeRepostPostImages(rawImages) {
    if (!Array.isArray(rawImages) || rawImages.length === 0) return [];
    return rawImages
      .map((row) => {
        if (!row || typeof row !== 'object') return null;
        const imageUrl = String(row.imageUrl ?? extractUrlFromImageRow(row) ?? '').trim();
        if (!imageUrl) return null;
        const aspect = row.aspect != null ? String(row.aspect).trim() : '';
        const aspectName =
          String(row.aspectName ?? '').trim() ||
          (aspect ? `Aspect (${aspect})` : 'Variant');
        return { aspect, aspectName, imageUrl };
      })
      .filter(Boolean);
  }

  function pickDefaultRepostVariant(variants) {
    if (!variants?.length) return null;
    const byName = variants.find((r) => r.aspectName === 'Default (1:1)');
    if (byName) return byName;
    const byAspect = variants.find((r) => r.aspect === '1:1');
    if (byAspect) return byAspect;
    return variants[0];
  }

  function mapFullPostToRepostForm(apiPost) {
    const scheduledAt = apiPost.scheduledAt ? new Date(apiPost.scheduledAt) : null;
    const fallbackSource = apiPost.updatedAt || apiPost.createdAt;
    const fallback = fallbackSource ? new Date(fallbackSource) : new Date();
    const when =
      scheduledAt && !Number.isNaN(scheduledAt.getTime()) ? scheduledAt : fallback;

    const hours = when.getHours();
    const minutes = when.getMinutes();
    const postTime = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    const postDate = formatDateToString(when);

    let platforms = [];
    if (Array.isArray(apiPost.platforms)) {
      platforms = apiPost.platforms.map((p) =>
        typeof p === 'string' ? p.toLowerCase() : String(p).toLowerCase()
      );
    }

    const productId =
      apiPost.productId ??
      apiPost.product_id ??
      (typeof apiPost.product === 'object' && apiPost.product != null
        ? apiPost.product.id
        : null) ??
      null;

    const imageVariants = normalizeRepostPostImages(apiPost.images);
    const defaultVariant = pickDefaultRepostVariant(imageVariants);
    const legacyImage = String(apiPost.imageUrl ?? '').trim();
    const postImage =
      (defaultVariant?.imageUrl || legacyImage || '').trim() || PostFallbackImg;

    const postImages = imageVariants.length > 0 ? imageVariants : null;
    const postType =
      postImages && defaultVariant
        ? defaultVariant.aspectName
        : 'Instagram post (4:5)';

    return {
      id: apiPost.id,
      productId: productId != null ? String(productId) : null,
      caption: apiPost.content ?? '',
      postImage,
      postImages,
      platforms,
      postDate,
      postTime,
      status: apiPost.status ?? 'draft',
      postType,
      title: apiPost.title?.trim() || 'Post',
    };
  }

  const STATIC_REPOST_FORMAT_OPTIONS = [
    { value: 'Instagram post (4:5)', label: 'Instagram post (4:5)' },
    { value: 'Instagram post (1:1)', label: 'Instagram post (1:1)' },
    { value: 'Instagram post (9:16)', label: 'Instagram post (9:16)' },
    { value: 'Facebook post (4:5)', label: 'Facebook post (4:5)' },
    { value: 'LinkedIn post (4:5)', label: 'LinkedIn post (4:5)' },
    { value: 'Twitter post (16:9)', label: 'Twitter post (16:9)' },
  ];

  const repostAspectOptions = computed(() => {
    const imgs = repostForm.value?.postImages;
    if (Array.isArray(imgs) && imgs.length) {
      return imgs.map((o) => ({ value: o.aspectName, label: o.aspectName }));
    }
    return STATIC_REPOST_FORMAT_OPTIONS;
  });

  function resolveRepostDetailImageUrl(post) {
    if (!post || typeof post !== 'object') return '';
    const imgs = post.postImages;
    if (Array.isArray(imgs) && imgs.length) {
      const sel = post.postType;
      const row =
        imgs.find((r) => r.aspectName === sel) ||
        pickDefaultRepostVariant(imgs) ||
        imgs[0];
      return String(row?.imageUrl ?? '').trim();
    }
    return String(post.postImage ?? '').trim();
  }

  const repostDetailImageUrl = computed(() =>
    repostForm.value ? resolveRepostDetailImageUrl(repostForm.value) : ''
  );

  const repostStatusPositive = computed(() => {
    const s = String(repostForm.value?.status ?? '').toLowerCase();
    return ['approved', 'published', 'scheduled'].includes(s);
  });

  const repostStatusLabel = computed(() => {
    const raw = String(repostForm.value?.status ?? '').replace(/_/g, ' ').trim();
    if (!raw) return 'Draft';
    return raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase();
  });

  function postLocalDateTimeToIso(postDateStr, postTimeStr) {
    if (!postDateStr || !postTimeStr) return null;
    const [y, mo, d] = String(postDateStr).split('-').map(Number);
    const [hh, mm] = String(postTimeStr).split(':').map(Number);
    if (!Number.isFinite(y) || !Number.isFinite(hh)) return null;
    const dt = new Date(y, (mo || 1) - 1, d || 1, hh || 0, mm || 0, 0, 0);
    if (Number.isNaN(dt.getTime())) return null;
    return dt.toISOString();
  }

  function buildRepostCreateFormData(post) {
    const fd = new FormData();
    if (post.title != null && String(post.title).trim() !== '') {
      fd.append('title', String(post.title).trim());
    }
    if (post.caption != null) {
      fd.append('content', String(post.caption));
    }
    const platformsStr =
      Array.isArray(post.platforms) && post.platforms.length > 0
        ? post.platforms
          .map((p) => String(p).toLowerCase().trim())
          .filter(Boolean)
          .join(',')
        : '';
    fd.append('platforms', platformsStr);

    if (post.productId != null && String(post.productId).trim() !== '') {
      fd.append('productId', String(post.productId).trim());
    }

    const imageUrl = resolveRepostDetailImageUrl(post);
    if (imageUrl) {
      fd.append('imageUrl', imageUrl);
    }

    if (Array.isArray(post.postImages) && post.postImages.length > 0) {
      const imagesPayload = post.postImages
        .map((row) => ({
          aspect: row.aspect != null ? String(row.aspect).trim() : '',
          aspectName: row.aspectName != null ? String(row.aspectName).trim() : '',
          imageUrl: String(row.imageUrl ?? '').trim(),
        }))
        .filter((r) => r.imageUrl);
      if (imagesPayload.length) {
        fd.append('images', JSON.stringify(imagesPayload));
      }
    }

    const iso = postLocalDateTimeToIso(post.postDate, post.postTime);
    if (iso) {
      fd.append('scheduledAt', iso);
    }
    fd.append('status', 'scheduled');
    return fd;
  }

  function formatRepostTime(timeString) {
    if (!timeString || !String(timeString).includes(':')) return String(timeString ?? '');
    const [hours, minutes] = String(timeString).split(':').map(Number);
    if (Number.isNaN(hours)) return String(timeString);
    const h = hours % 12 || 12;
    const ampm = hours < 12 ? 'AM' : 'PM';
    const m = minutes > 0 ? `:${String(minutes).padStart(2, '0')}` : '';
    return `${h}${m} ${ampm}`;
  }

  function formatScheduledSuccessHuman(post) {
    if (!post?.postDate) return '—';
    const dateStr = String(post.postDate).trim();
    const timeStr = String(post.postTime ?? '').trim();
    const d = timeStr ? new Date(`${dateStr}T${timeStr}`) : new Date(dateStr);
    if (Number.isNaN(d.getTime())) {
      return `${dateStr} at ${formatRepostTime(post.postTime)}`;
    }
    const datePart = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    return `${datePart} at ${formatRepostTime(post.postTime)}`;
  }

  function formatRepostScheduledTimeText(post) {
    if (!post?.postDate) {
      return 'Pick a date and time below.';
    }
    const date = new Date(post.postDate);
    if (Number.isNaN(date.getTime())) {
      return 'Pick a date and time below.';
    }
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const isToday = date.toDateString() === today.toDateString();
    const isTomorrow = date.toDateString() === tomorrow.toDateString();
    let dateLabel = '';
    if (isToday) dateLabel = 'Today';
    else if (isTomorrow) dateLabel = 'Tomorrow';
    else {
      dateLabel = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
    const timeDisplay = formatRepostTime(post.postTime);
    return `${dateLabel}, ${timeDisplay}`;
  }

  function getRepostScheduledMs(post) {
    if (!post || typeof post !== 'object') return null;
    const dateStr = String(post.postDate ?? '').trim();
    const timeStr = String(post.postTime ?? '').trim();
    if (!dateStr || !timeStr) return null;
    const d = new Date(`${dateStr}T${timeStr}`);
    const t = d.getTime();
    return Number.isNaN(t) ? null : t;
  }

  function hasRepostAtLeastOnePlatform(post) {
    const p = post?.platforms;
    if (!Array.isArray(p) || p.length < 1) return false;
    return p.some((x) => String(x ?? '').trim() !== '');
  }

  const canSaveRepostChanges = computed(() => {
    const p = repostForm.value;
    if (!p) return false;
    if (!hasRepostAtLeastOnePlatform(p)) return false;
    const ms = getRepostScheduledMs(p);
    if (ms == null) return false;
    return ms > Date.now();
  });

  function openRepostPlatformModal() {
    if (!repostForm.value) return;
    resetPostScheduledModalOnly();
    fetchRepostPlatformIcons(repostForm.value.productId ?? null);
    showRepostPlatformModal.value = true;
  }

  function closeRepostPlatformModal() {
    showRepostPlatformModal.value = false;
  }

  function updateRepostPlatforms(platforms) {
    if (!repostForm.value) return;
    repostForm.value = {
      ...repostForm.value,
      platforms: Array.isArray(platforms) ? [...platforms] : [],
    };
  }

  function handleAddPlatformsFromRepostModal() {
    showRepostPlatformModal.value = false;
    router.push({ path: '/products' });
  }

  function openRepostSchedulerModal() {
    if (!repostForm.value) return;
    resetPostScheduledModalOnly();
    const date = new Date(repostForm.value.postDate);
    if (Number.isNaN(date.getTime())) return;
    repostSchedulerInitialDate.value = date;
    repostSchedulerInitialTime.value = repostForm.value.postTime;
    showRepostSchedulerModal.value = true;
  }

  function closeRepostSchedulerModal() {
    showRepostSchedulerModal.value = false;
  }

  function handleRepostSchedule(scheduleData) {
    if (!repostForm.value || !scheduleData) return;
    resetPostScheduledModalOnly();
    repostForm.value = {
      ...repostForm.value,
      postDate: formatDateToString(scheduleData.date),
      postTime: scheduleData.time,
    };
    closeRepostSchedulerModal();
  }

  const platformIconUrlByKey = ref({});

  function normalizePlatformIconKey(raw) {
    return String(raw ?? '')
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '');
  }

  function registerPlatformIconKeys(map, row, iconUrl) {
    const candidates = [
      row?.name,
      row?.label,
      row?.platform,
      row?.slug,
      row?.id != null ? String(row.id) : null,
    ];
    for (const raw of candidates) {
      if (raw == null || String(raw).trim() === '') continue;
      const key = normalizePlatformIconKey(raw);
      if (key) map[key] = iconUrl;
    }
  }

  async function fetchRepostPlatformIcons(productId = null) {
    try {
      const params = {};
      if (productId) params.productId = String(productId).trim();
      const response = await api.get('/api/platforms', { params });
      let list = [];
      if (Array.isArray(response.data)) {
        list = response.data;
      } else if (response.data?.platforms && Array.isArray(response.data.platforms)) {
        list = response.data.platforms;
      }
      const map = {};
      for (const p of list) {
        if (typeof p?.icon !== 'string' || p.icon.trim() === '') continue;
        const url = p.icon.trim();
        registerPlatformIconKeys(map, p, url);
      }
      platformIconUrlByKey.value = map;
    } catch (e) {
      console.warn('GET /api/platforms (repost modal):', e);
      platformIconUrlByKey.value = {};
    }
  }

  function getRepostPlatformIcon(platform) {
    const k = normalizePlatformIconKey(platform);
    const fromApi = platformIconUrlByKey.value[k];
    if (fromApi) return fromApi;
    return PlatformIcon;
  }

  function onRepostPlatformIconError(e) {
    const el = e?.target;
    if (!el || el.dataset?.platformIconFallbackApplied) return;
    el.dataset.platformIconFallbackApplied = '1';
    el.src = PlatformIcon;
  }

  function onRepostPreviewImgError(e) {
    const el = e?.target;
    if (!el || el.dataset?.repostPreviewFallback) return;
    el.dataset.repostPreviewFallback = '1';
    el.src = PostFallbackImg;
  }

  async function regenerateRepostCaption() {
    const post = repostForm.value;
    if (!post?.id || regenerateCaptionLoading.value) return;

    regenerateCaptionError.value = '';
    regenerateCaptionLoading.value = true;
    try {
      const { data } = await api.post(
        '/api/captions/regenerate',
        {
          postId: post.id,
          caption: post.caption ?? '',
        },
        { timeout: LONG_REQUEST_TIMEOUT_MS }
      );
      if (data?.success === false) {
        throw new Error(data?.message || 'Could not regenerate caption.');
      }
      const nextCaption = data?.caption;
      if (nextCaption == null) {
        throw new Error('Invalid caption response');
      }
      post.caption = nextCaption;
    } catch (e) {
      console.error('POST /api/captions/regenerate failed:', e);
      regenerateCaptionError.value =
        e?.response?.data?.message || e?.message || 'Could not regenerate caption.';
    } finally {
      regenerateCaptionLoading.value = false;
    }
  }

  async function beginRepost() {
    const id = props.postData?.postId ?? detail.value?.id;
    if (!id) return;
    repostBeginLoading.value = true;
    repostFetchError.value = '';
    saveRepostError.value = '';
    regenerateCaptionError.value = '';
    regenerateCaptionLoading.value = false;
    resetPostScheduledModalOnly();
    try {
      const { data } = await api.get(`/post/${encodeURIComponent(String(id).trim())}`);
      const raw = data?.post ?? data?.data?.post ?? null;
      if (!raw) {
        repostFetchError.value = 'Post not found.';
        return;
      }
      repostForm.value = mapFullPostToRepostForm(raw);
      await fetchRepostPlatformIcons(repostForm.value?.productId ?? null);
      showRepostPanel.value = true;
      repostAspectOpen.value = false;
      repostDotsOpen.value = false;
    } catch (e) {
      console.error('GET /post/:id failed:', e);
      repostFetchError.value = 'Could not load post for repost.';
    } finally {
      repostBeginLoading.value = false;
    }
  }

  function toggleRepostAspectDropdown() {
    repostAspectOpen.value = !repostAspectOpen.value;
  }

  function selectRepostAspect(value) {
    if (!repostForm.value) return;
    repostForm.value.postType = value;
    repostAspectOpen.value = false;
  }

  function toggleRepostDotsMenu() {
    repostDotsOpen.value = !repostDotsOpen.value;
  }

  async function submitRepostForm() {
    if (!repostForm.value || !canSaveRepostChanges.value || saveRepostLoading.value) return;

    saveRepostError.value = '';
    saveRepostLoading.value = true;
    try {
      const formData = buildRepostCreateFormData(repostForm.value);
      const { data } = await api.post('/post', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 60000,
      });

      const raw = data?.post ?? data?.data?.post ?? null;
      let merged = { ...repostForm.value };

      if (raw && typeof raw === 'object' && (raw.id != null || data?.post)) {
        const mapped = mapFullPostToRepostForm(data?.post ?? raw);
        merged = {
          ...mapped,
          postType: repostForm.value.postType,
          productId: mapped.productId ?? repostForm.value.productId ?? null,
          postImages:
            Array.isArray(mapped.postImages) && mapped.postImages.length
              ? [...mapped.postImages]
              : repostForm.value.postImages
                ? [...repostForm.value.postImages]
                : null,
          platforms: Array.isArray(mapped.platforms)
            ? [...mapped.platforms]
            : [...(repostForm.value.platforms || [])],
        };
        const resolvedImg = resolveRepostDetailImageUrl(merged);
        if (resolvedImg) merged.postImage = resolvedImg;
      } else {
        merged = {
          ...repostForm.value,
          platforms: [...(repostForm.value.platforms || [])],
        };
      }

      await fetchRepostPlatformIcons(merged.productId ?? null);

      const analyticsPostId =
        props.postData?.postId != null ? String(props.postData.postId).trim() : '';
      emit('saved', {
        postId: analyticsPostId || (merged.id != null ? String(merged.id).trim() : ''),
      });

      postScheduledModalTitle.value = 'Post scheduled';
      postScheduledModalSubtitle.value = `Your new post is scheduled for ${formatScheduledSuccessHuman(merged)}.`;
      showPostScheduledSuccess.value = true;

      backFromRepost();
      if (analyticsPostId) {
        await fetchPostAnalytics(analyticsPostId);
      }
    } catch (e) {
      console.error('POST /post (analytics schedule new post) failed:', e);
      saveRepostError.value =
        e?.response?.data?.message || e?.message || 'Could not schedule post.';
    } finally {
      saveRepostLoading.value = false;
    }
  }

  watch(repostAspectOpen, (open) => {
    if (removeRepostAspectClick) {
      document.removeEventListener('click', removeRepostAspectClick, true);
      removeRepostAspectClick = null;
    }
    if (!open) return;
    nextTick(() => {
      if (!repostAspectOpen.value) return;
      removeRepostAspectClick = (e) => {
        const t = e?.target;
        if (t?.closest?.('.repost-aspect-dropdown-container')) return;
        repostAspectOpen.value = false;
      };
      document.addEventListener('click', removeRepostAspectClick, true);
    });
  });

  const baseStats = [
    {
      title: 'Total reach',
      description: 'Total users who saw your posts',
      icon: TotalReach,
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
      mobileWdth: 'w-[100%]',
      valueMonth: '',
    },
    {
      title: 'Engagement rate',
      description: 'Likes, comments, & impressions',
      icon: MessageIcon,
      iconBg: 'bg-yellow-100',
      iconColor: 'text-yellow-600',
      mobileWdth: 'w-[100%]',
      valueMonth: '',
    },
    {
      title: 'Likes',
      description: 'Total reactions',
      icon: LikeIcon,
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      mobileWdth: 'w-[100%]',
      valueMonth: '',
    },
    {
      title: 'comments',
      description: 'Total replies',
      icon: CommentIcon,
      iconBg: 'bg-pink-100',
      iconColor: 'text-pink-600',
      mobileWdth: 'w-[100%]',
      valueMonth: '',
    },
  ];

  const stats = computed(() => {
    const d = detail.value;
    const pd = props.postData;
    return baseStats.map((stat) => {
      let value = stat.valueMonth;
      if (stat.title === 'Total reach') {
        if (d?.reach != null) value = formatReachLike(d.reach);
        else if (pd?.reach) value = String(pd.reach);
        else value = '0';
      } else if (stat.title === 'Engagement rate') {
        if (d?.engagement != null) value = `${Number(d.engagement).toFixed(1)}%`;
        else if (pd?.engagement) value = String(pd.engagement);
        else value = '0%';
      } else if (stat.title === 'Likes') {
        if (d?.likes != null) value = formatReachLike(d.likes);
        else value = '0';
      } else if (stat.title === 'comments') {
        if (d?.comments != null) value = String(d.comments);
        else value = '0';
      }
      return { ...stat, value };
    });
  });

  onMounted(() => {
    document.addEventListener('click', handleClickOutside);
  });

  onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside);
    if (removeRepostAspectClick) {
      document.removeEventListener('click', removeRepostAspectClick, true);
    }
  });
</script>