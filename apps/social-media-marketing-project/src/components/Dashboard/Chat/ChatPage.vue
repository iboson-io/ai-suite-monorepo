<template>
  <div class="flex min-h-0 flex-1 w-full flex-col bg_primary_color">
    <!-- Reserve right space on lg+ when post panel is open so chat does not sit under the fixed sheet -->
    <div
      class="flex min-h-0 min-w-0 flex-1 flex-col transition-[padding] duration-300 ease-in-out"
      :class="
        showPostShareModal && isLgUp ? 'lg:pr-[30vw]' : ''
      "
    >
    <!-- Chat Messages Container -->
    <div class="flex-1 overflow-y-auto px-3xl pb-6xl pt-3xl custom_scrollbar md:px-6xl md:pt-6xl">
      <div class="mx-auto max-w-3xl space-y-7">
        <!-- Message Pair -->
        <div
          v-for="(message, index) in messages"
          :key="index"
        >
          <!-- User Message Bubble (Right Aligned) - Only show if there's user text -->
          <div v-if="message.text" class="flex flex-row justify-end gap-xl items-center group mb-xl">
            <!-- Copy and Edit Buttons (Show on Hover, Hide when editing) -->
            <div v-if="editingIndex !== index" class="flex gap-xl  opacity-0 group-hover:opacity-100 transition-opacity border_transparent">
              <!-- Copy Button with Tooltip -->
              <div class="relative group/button">
                <button
                  @click="handleCopy(message.text)"
                  class="flex items-center gap-sm rounded-lg bg_secondary_color p-md "
                >
                  <img :src="TextCopyIcon" alt="Copy" />
                </button>
                <!-- Speech Bubble Tooltip -->
                <div class=" absolute bottom-full left-1/2 -translate-x-1/2 mb-md invisible group-hover/button:visible transition-all duration-200 pointer-events-none whitespace-nowrap z-[1000] ">
                  <div class="relative bg-black-400 primary_2_text_color label_3_semibold rounded-lg px-md py-xl  outline-none ring-0">
                    Copy
                    <!-- Speech Bubble Tail -->
                    <div class="absolute top-full left-1/2 -translate-x-1/2 -mt-px">
                      <div class="w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-transparent border-t-black-400"></div>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Edit Button with Tooltip -->
              <!-- <div class="relative group/button">
                <button
                  @click="handleEdit(index)"
                  class="flex items-center gap-sm rounded-lg bg_secondary_color p-md "
                >
                  <img :src="ImageEditIcon" alt="Edit"  />
                </button> -->
                <!-- Speech Bubble Tooltip -->
                <!-- <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-md invisible group-hover/button:visible transition-all duration-200 pointer-events-none whitespace-nowrap z-[1000]">
                  <div class="relative bg-black-400 primary_2_text_color label_3_semibold rounded-lg px-md py-xl outline-none ring-0">
                    Edit -->
                    <!-- Speech Bubble Tail -->
                    <!-- <div class="absolute top-full left-1/2 -translate-x-1/2 -mt-px">
                      <div class="w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-transparent border-t-black-400"></div>
                    </div>
                  </div>
                </div>
              </div> -->
            </div>
            
            <!-- Message Bubble -->
            <div
              class="relative max-w-[80%]  bg_secondary_color p-3xl rounded-2xl border primary_border_color"
              :class="editingIndex === index ? 'w-full' : ''"
            >
              <!-- Edit Mode -->
              <!-- <div v-if="editingIndex === index" class="flex flex-col gap-md">
                <textarea
                  v-model="editingText"
                  @keydown.enter.exact.prevent="saveEdit(index)"
                  @keydown.escape="cancelEdit"
                  @keydown.enter.shift.exact="editingText += '\n'"
                  class="w-full border-none outline-none Body_2_regular primary_text_color resize-none"
                  rows="3"
                  :ref="el => { if (el && editingIndex === index) editTextareaRef = el }"
                ></textarea>
                <div class="flex gap-md justify-end">
                  <button
                    @click="cancelEdit"
                    class="px-md py-sm rounded-md label_2_medium bg_primary_color"
                  >
                    Cancel
                  </button>
                  <button
                    @click="saveEdit(index)"
                    class="px-md py-sm rounded-md label_2_medium primary_add_button"
                  >
                    Sent
                  </button>
                </div>
              </div> -->
              <!-- Display Mode -->
              <p class="Body_2_regular primary_text_color">
                {{ message.text }}
              </p>
            </div>
          </div>

          <!-- AI Response (Left Aligned) -->
          <div class="flex items-start gap-3">
            <!-- AI Icon with Gradient -->
            <div
              class="flex-shrink-0 h-8 w-8 rounded-full bg-gradient-to-tr from-pink-400 via-purple-400 to-indigo-400"
            ></div>
            
            <!-- AI Message -->
            <div class="min-w-0 flex-1">
              <!-- Loading: stream status from API, or default placeholder -->
              <div v-if="message.isLoading" class="rounded-2xl lg:px-3xl py-2xl">
                <p class="primary_text_color body_3_regular">
                  {{ message.streamStatus || "Got it, give me a moment" }}<span
                    v-if="!message.streamStatus"
                    class="loading-dots"
                  ></span>
                </p>
              </div>
              <!-- AI Response: post generated (image + caption + pills) -->
              <PostGeneration
                v-else-if="message.aiResponse && message.responseType === 'post_generated'"
                :message="message"
                :is-ai-generating="isAiGenerating"
                :highlighted-post-id="highlightedPostImageId"
                @image-click="onPostGeneratedImageClick"
                @suggested-response="handleSuggestedResponse($event, index)"
                @like="handleLike(index)"
                @dislike="handleDislike(index)"
              />

              <!-- AI Response: connect social platforms (grid + suggested pills + actions) -->
              <SocialPlatforms
                v-else-if="message.aiResponse && message.responseType === 'social_platforms'"
                :message="message"
                :is-ai-generating="isAiGenerating"
                :is-platform-disconnecting="(platform) => isChatPlatformDisconnecting(index, platform)"
                @connect-platform="handleSocialPlatformCardAction($event, index)"
                @disconnect-platform="handleChatPlatformDisconnect($event, index)"
                @suggested-response="handleSuggestedResponse($event, index)"
                @copy="handleCopyAIResponse(message.aiResponse, index)"
                @like="handleLike(index)"
                @dislike="handleDislike(index)"
              />

              <!-- AI Response: product created (card + CTAs from GET /api/products/:id) -->
              <ProductCreations
                v-else-if="message.aiResponse && message.responseType === 'product_created'"
                :message="message"
                :is-ai-generating="isAiGenerating"
                :product-id="message.typeData?.productId"
                :product="message.typeData?.productId ? productCreatedCache[message.typeData.productId] : null"
                :loading="Boolean(message.typeData?.productId && productCreatedLoading[message.typeData.productId])"
                :error="message.typeData?.productId ? productCreatedError[message.typeData.productId] : null"
                :gone="Boolean(message.typeData?.productId && productCreatedGone[message.typeData.productId])"
                :is-active="
                  productCreatedCache[message.typeData?.productId]
                    ? isChatProductCardActive(productCreatedCache[message.typeData.productId])
                    : true
                "
                @toggle-active="toggleChatProductCardActive"
                @edit="handleProductCreatedEdit"
                @delete="handleProductCreatedDelete"
                @suggested-response="handleSuggestedResponse($event, index)"
              />

              <!-- AI Response: analytics report (narrative + HTML table from typeData.analyticsHtml) -->
              <AnalyticsReport
                v-else-if="message.aiResponse && message.responseType === 'analytics_report'"
                :message="message"
                :is-ai-generating="isAiGenerating"
                @suggested-response="handleSuggestedResponse($event, index)"
                @copy="handleCopyAIResponse(message.aiResponse, index)"
                @like="handleLike(index)"
                @dislike="handleDislike(index)"
              />

              <!-- AI Response Content (default / conversation) -->
              <div v-else-if="message.aiResponse">
                <div class="Body_2_regular primary_text_color lg:px-3xl pb-md pt-3xl" v-html="formatMarkdownToHtml(message.aiResponse)"></div>

                <div
                  v-if="message.suggestedResponses && message.suggestedResponses.length > 0"
                  class="mt-3 px-3xl pb-md"
                >
                  <p class="body_4_regular tertiary_text_color mb-2">Suggested responses</p>
                  <div :class="suggestedResponseRowClass">
                    <template
                      v-for="(suggestion, sIndex) in message.suggestedResponses"
                      :key="sIndex"
                    >
                      <router-link
                        v-if="suggestion.url && isInternalPath(suggestion.url)"
                        :to="suggestion.url"
                        :class="suggestedChipLinkClass"
                      >
                        {{ unescapeHtmlEntities(suggestion.text || suggestion) }}
                      </router-link>
                      <a
                        v-else-if="suggestion.url"
                        :href="suggestion.url"
                        :class="suggestedChipLinkClass"
                      >
                        {{ unescapeHtmlEntities(suggestion.text || suggestion) }}
                      </a>
                      <button
                        v-else
                        type="button"
                        :class="suggestedChipButtonClass"
                        :disabled="isAiGenerating"
                        @click="handleSuggestedResponse(suggestion, index)"
                      >
                        {{ unescapeHtmlEntities(suggestion.text || suggestion) }}
                      </button>
                    </template>
                  </div>
                </div>

                <ChatActionBar
                  :is-liked="message.isLiked"
                  :is-disliked="message.isDisliked"
                  @copy="handleCopyAIResponse(message.aiResponse, index)"
                  @like="handleLike(index)"
                  @dislike="handleDislike(index)"
                />
              </div>
            </div>
          </div>
        </div>
        <!-- Bottom Anchor for Auto-Scroll (height matches prompt box to ensure full scroll) -->
        <div ref="scrollAnchor" class="h-64 md:h-56"></div>
      </div>
    </div>

    <!-- Prompt Box at Bottom (Fixed; narrows on desktop when post panel is open) -->
    <div 
      class="fixed bottom-0 left-0 right-0 z-40 bg_primary_color px-4 transition-all duration-300 ease-in-out md:px-6"
      :class="[
        isSidebarCollapsed ? 'lg:left-16' : 'lg:left-64',
        showPostShareModal ? 'lg:right-[30%]' : '',
      ]"
    >
      <div class="mx-auto max-w-3xl">
        <PromptBox
          ref="promptBoxRef"
          :initial-product-id="chatInitialProductId"
          @send-message="handleNewMessage"
          :is-ai-generating="isAiGenerating"
        />
        
        <!-- Disclaimer -->
        <div class="text-center p-xl">
          <p class="body_4_regular tertiary_text_color">
            Genius AI can make mistakes. Please check for accuracy.
          </p>
        </div>
      </div>
    </div>
    </div>

    <!-- Post panel: always fixed; teleported to body (desktop = right sheet, mobile = overlay + sheet) -->
    <Teleport to="body">
      <aside
        v-if="showPostShareModal"
        class="flex flex-col overflow-hidden primary_border_color bg_secondary_color"
        :class="
          isLgUp
            ? 'fixed inset-y-0 right-0 z-50 h-full min-h-0 w-[30%] flex-shrink-0 rounded-xl border px-xxl py-6xl shadow-lg'
            : 'fixed inset-0 z-50 flex w-full justify-end border-0'
        "
        role="dialog"
        aria-modal="true"
        aria-labelledby="chat-post-modal-title"
      >
        <div
          v-if="!isLgUp"
          class="absolute inset-0 bg_overlay lg:hidden"
          aria-hidden="true"
          @click="closePostShareModal"
        />
        <div
          class="relative flex min-h-0 flex-1 flex-col overflow-hidden border-l primary_border_color bg_secondary_color max-lg:ml-auto max-lg:h-full max-lg:max-h-[min(100dvh,100%)] max-lg:w-full max-lg:max-w-md max-lg:shadow-[-8px_0_32px_rgba(15,23,42,0.12)]"
          :class="isLgUp ? 'h-full w-full rounded-xl border-0 shadow-none' : ''"
          @click.stop
        >
          <div
            class="flex shrink-0 items-center justify-between gap-md border-b primary_border_color px-5xl py-xl"
          >
            <div class="min-w-0 flex-1 pr-md">
              <h2 id="chat-post-modal-title" class="sr-only">Post details</h2>
              <div
                v-if="selectedPostForModal"
                class="chat-post-aspect-dropdown-container relative w-full"
              >
                <img
                  :src="PostFilter"
                  alt=""
                  class="pointer-events-none absolute left-2 top-1/2 z-10 h-5 w-5 -translate-y-1/2"
                />
                <button
                  type="button"
                  class="flex w-full items-center gap-md rounded-lg bg_secondary_color py-md pl-9xl pr-10xl text-left label_1_medium primary_text_color transition-colors hover:bg-gray-25"
                  :class="
                    postAspectDropdownOpen
                      ? 'border-[3px] border-[#D9E2FC]'
                      : 'border primary_border_color'
                  "
                  aria-haspopup="listbox"
                  :aria-expanded="postAspectDropdownOpen"
                  aria-label="Post format or aspect"
                  @click.stop="togglePostAspectDropdown"
                >
                  <span class="min-w-0 flex-1 truncate">{{ selectedPostForModal.postType }}</span>
                  <img
                    :src="DownArrow"
                    alt=""
                    class="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 shrink-0"
                  />
                </button>
                <div
                  v-if="postAspectDropdownOpen"
                  class="absolute left-0 top-full z-50 mt-sm min-w-[155px] w-full max-w-full rounded-md bg_secondary_color shadow-lg primary_border_color lg:min-w-[200px]"
                  role="listbox"
                  @click.stop
                >
                  <div class="max-h-[min(16rem,40vh)] overflow-y-auto">
                    <button
                      v-for="opt in postAspectSelectOptions"
                      :key="opt.value"
                      type="button"
                      role="option"
                      :aria-selected="selectedPostForModal.postType === opt.value"
                      :class="[
                        'flex w-full items-center gap-md border-b px-xl py-3xl text-left label_1_medium primary_text_color transition-colors hover:bg-info-50 primary_border_color last:border-b-0',
                        { 'bg-info-50': selectedPostForModal.postType === opt.value },
                      ]"
                      @click="selectPostAspectOption(opt.value)"
                    >
                      {{ opt.label }}
                    </button>
                  </div>
                </div>
              </div>
              <div
                v-else-if="postModalLoading"
                class="h-10 w-full animate-pulse rounded-lg bg-gray-25"
                aria-hidden="true"
              />
              <p v-else class="label_1_semibold primary_text_color">Post details</p>
            </div>
            <button
              type="button"
              class="shrink-0 rounded-lg border primary_border_color p-xs transition-colors hover:bg-black-25"
              aria-label="Close"
              @click="closePostShareModal"
            >
              <img :src="closeIcon" alt="" class="h-4 w-4" />
            </button>
          </div>

          <div class="custom-scrollbar-calendar min-h-0 flex-1 overflow-y-auto p-5xl">
            <div v-if="postModalLoading" class="py-10xl text-center label_1_regular secondary_text_color">
              Loading post…
            </div>
            <div v-else-if="postModalError" class="py-10xl text-center label_1_regular text-red-600">
              {{ postModalError }}
            </div>
            <template v-else-if="selectedPostForModal">
              <div
                v-if="String(selectedPostForModal.status ?? '').toLowerCase() !== 'draft'"
                :class="[
                  'inline-flex w-full items-center gap-md rounded-md p-xl label_1_semibold',
                  selectedPostForModal.status === 'approved'
                    ? 'bg-success-50 text-success-800'
                    : 'pending_text_style'
                ]"
              >
                <img
                  v-if="selectedPostForModal.status === 'approved'"
                  :src="ApproveIcon"
                  alt=""
                  class="h-4 w-4"
                />
                <img v-else :src="PendingIcon" alt="" class="h-4 w-4" />
                <span>{{ selectedPostForModal.status }}</span>
              </div>

              <div
                class="mt-xl flex h-72 items-center justify-center overflow-hidden rounded-lg bg_primary_color"
              >
                <img
                  :src="postModalDisplayImageUrl"
                  :alt="selectedPostForModal.title"
                  class="max-h-full w-full max-w-md object-contain"
                />
              </div>

              <p class="label_2_medium primary_text_color mt-6xl">Caption</p>
              <div class="relative mt-md">
                <textarea
                  v-model="selectedPostForModal.caption"
                  class="min-h-[140px] w-full resize-none rounded-lg bg_secondary_color p-xl label_1_regular primary_text_color primary_border_color"
                  placeholder="Write your caption here..."
                />
                <button
                  type="button"
                  class="absolute bottom-3 right-3 p-md transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
                  aria-label="Regenerate caption with AI"
                  :disabled="regenerateCaptionLoading || !selectedPostForModal?.id"
                  @click="regeneratePostCaption"
                >
                  <img :src="AiIcon" alt="" />
                </button>
              </div>

              <p class="label_2_medium primary_text_color mt-6xl">Platforms</p>
              <div class="mt-md flex items-center gap-xl overflow-auto hide-scrollbar">
                <img
                  v-for="platform in selectedPostForModal.platforms"
                  :key="platform"
                  :src="getPlatformIcon(platform)"
                  :alt="String(platform)"
                  class="h-10 w-10 object-contain"
                  @error="onChatPlatformIconError"
                />
                <img
                  :src="ImageEditIcon"
                  alt="Edit platforms"
                  class="w-10 cursor-pointer rounded-lg p-md primary_border_color"
                  @click="openPlatformModalChat"
                />
              </div>

              <div class="mt-6xl">
                <div class="flex items-center gap-sm">
                  <p class="label_2_medium secondary_text_color">Scheduled for</p>
                  <img
                    :src="ScheduleHelpIcon"
                    alt=""
                    class="h-4 w-4 shrink-0"
                    aria-hidden="true"
                  />
                </div>
                <button
                  type="button"
                  class="mt-md flex w-full cursor-pointer items-center justify-between rounded-lg border regular_border_color bg_secondary_color px-3xl py-xl text-left transition-colors hover:bg-gray-25"
                  @click="openSchedulerFromPostModal"
                >
                  <span class="label_1_medium primary_text_color">
                    {{ getScheduledDateTimeLabel(selectedPostForModal) }}
                  </span>
                  <img :src="CalendarIcon" alt="" class="h-5 w-5 shrink-0" />
                </button>
              </div>

              <div class="relative mt-6xl flex items-center gap-6xl">
                <div
                  class="relative rounded-lg bg-gray-25 px-4xl py-md hover:bg-black-25 cursor-pointer"
                  data-chat-dots-
                  @click.stop="togglePostMenuChat"
                >
                  <button
                    ref="dotsButtonRefChat"
                    type="button"
                    aria-label="More actions"
                    
                  >
                    <img :src="DotsIcon" alt="" class="mb-xs" />
                  </button>
                  <TogglePostModal
                    ref="togglePostModalRefChat"
                    :open="showPostMenuChat"
                    @close="showPostMenuChat = false"
                    @share="handlePostModalShare"
                    @regenerate="handlePostModalRegenerate"
                    @delete="handlePostModalDelete"
                  />
                </div>
                <button
                  type="button"
                  class="primary_add_button label_1_semibold flex flex-1 items-center justify-center gap-md rounded-lg p-xl primary_2_text_color transition-opacity disabled:cursor-not-allowed disabled:opacity-60"
                  :disabled="
                    schedulePostLoading ||
                    !selectedPostForModal?.id ||
                    !canSchedulePostInChatModal
                  "
                  @click="handleSchedulePostSubmit"
                >
                  <img :src="CalendarIcon" alt="" class="h-4 w-4" />
                  {{ schedulePostLoading ? "Saving…" : "Schedule post" }}
                </button>
              </div>
              <p
                v-if="regenerateCaptionError"
                class="body_3_regular mt-3 text-red-600"
                role="alert"
              >
                {{ regenerateCaptionError }}
              </p>
              <p
                v-if="schedulePostError"
                class="body_3_regular mt-3 text-red-600"
                role="alert"
              >
                {{ schedulePostError }}
              </p>
            </template>
          </div>
        </div>
      </aside>
    </Teleport>

    <SocialMediaModal
      :open="showPlatformModalChat"
      require-product-id
      :product-id="selectedPostForModal?.productId ?? null"
      :selected-platforms="selectedPostForModal ? selectedPostForModal.platforms : []"
      @close="closePlatformModalChat"
      @update:selected-platforms="updatePlatformsChat"
      @add-platforms="handleAddPlatformsFromChatModal"
    />
    <SchedulerCalendarModal
      :open="showSchedulerModalChat"
      :initial-date="schedulerInitialDateChat"
      :initial-time="schedulerInitialTimeChat"
      @close="closeSchedulerModalChat"
      @schedule="handleScheduleChat"
    />
    <DeletePostModal
      :open="showDeletePostModalChat"
      :loading="deletePostLoading"
      :error-message="deletePostError"
      @close="closeDeletePostModalChat"
      @confirm="confirmDeletePostChat"
    />
  </div>
</template>

<script setup>
import { ref, reactive, nextTick, watch, onMounted, onUnmounted, computed, triggerRef } from "vue";
import { useRouter } from "vue-router";
import { PromptBox, SchedulerCalendarModal, DeletePostModal, ChatActionBar } from "@ai-suite/shared-ui";
import ImageEditIcon from "../../../assets/images/ImageEditIcon.svg";
import TrashIcon from "../../../assets/images/TrashIcon.svg";
import TextCopyIcon from "../../../assets/images/TextCopyIcon.svg";
import closeIcon from "../../../assets/images/CloseIcon.svg";
import PostFilter from "../../../assets/images/PostFilter.svg";
import DownArrow from "../../../assets/images/DownArrow.svg";
import AiIcon from "../../../assets/images/AiIcon.svg";
import ApproveIcon from "../../../assets/images/ApproveIcon.svg";
import PendingIcon from "../../../assets/images/PendingIcon.svg";
import DotsIcon from "../../../assets/images/DotsIcon.svg";
import CalendarIcon from "../../../assets/images/CalendarIcon.svg";
import ScheduleHelpIcon from "../../../assets/images/Iicon.svg";
import PlatformIcon from "../../../assets/images/PlatformIcon.svg";
import SocialMediaModal from "../../Calendar/SocialMediaModal.vue";
import SocialPlatforms from "./SocialPlatforms.vue";
import PostGeneration from "./PostGeneration.vue";
import ProductCreations from "./ProductCreations.vue";
import AnalyticsReport from "./AnalyticsReport.vue";
import TogglePostModal from "../../Calendar/TogglePostModal.vue";
import api, { TOKEN_KEY, API_BASE_URL, LONG_REQUEST_TIMEOUT_MS } from "../../../services/api.js";

const props = defineProps({
  initialMessages: {
    type: Array,
    default: () => []
  },
  isSidebarCollapsed: {
    type: Boolean,
    default: false
  },
  sessionId: {
    type: String,
    default: null
  },
  externalSessionId: {
    type: String,
    default: null
  }
});

const emit = defineEmits(['update:sessionId', 'sessionLoaded', 'socialAuthLinked']);

const router = useRouter();

/** Mobile: single-row pills with horizontal scroll; desktop: wrap. Matches pale blue pill spec (#EBF5FF / #3182CE). */
const suggestedResponseRowClass =
  "max-w-full min-w-0 overflow-x-auto overflow-y-hidden hide-scrollbar flex flex-nowrap gap-2 [-webkit-overflow-scrolling:touch] md:flex-wrap md:overflow-x-visible";
const suggestedChipLinkClass =
  "inline-flex shrink-0 cursor-pointer items-center justify-center whitespace-nowrap rounded-full bg-[#EBF5FF] px-3xl py-xl border border-blue-50 text-blue-300 body_3_medium no-underline transition-colors hover:bg-[#DBEAFE]";
const suggestedChipButtonClass =
  "inline-flex shrink-0 cursor-pointer items-center justify-center whitespace-nowrap rounded-full bg-[#EBF5FF] px-3xl py-xl border border-blue-50 text-blue-300 body_3_medium transition-colors hover:bg-[#DBEAFE] disabled:cursor-not-allowed disabled:opacity-60";

const messages = ref([...props.initialMessages]);
const promptBoxRef = ref(null);

/** Product id from the first chat message (set when user starts chat from ChatView). */
const chatInitialProductId = computed(() => {
  const msg = messages.value[0] ?? props.initialMessages?.[0];
  const product = msg?.product;
  if (product == null || product === "" || product === "All products") return null;
  return product;
});

const editingIndex = ref(null);
const editingText = ref("");
let editTextareaRef = null;
const scrollAnchor = ref(null);

/** lg+ = post panel is in-flow (Teleport disabled); mobile = teleported with backdrop */
const isLgUp = ref(
  typeof window !== "undefined" ? window.matchMedia("(min-width: 1024px)").matches : false
);
const updateIsLgUp = () => {
  if (typeof window === "undefined") return;
  isLgUp.value = window.matchMedia("(min-width: 1024px)").matches;
};

/* —— Post share modal (GET /post/:id) —— */
const showPostShareModal = ref(false);
/** Post id of the generated image thumbnail currently highlighted (post panel open). */
const highlightedPostImageId = ref(null);
const postModalLoading = ref(false);
const postModalError = ref(null);
const selectedPostForModal = ref(null);
/** `name` key → `icon` URL from `GET /api/platforms` (same source as SocialMediaModal). */
const platformIconUrlByKey = ref({});
const schedulePostLoading = ref(false);
const schedulePostError = ref("");
const regenerateCaptionLoading = ref(false);
const regenerateCaptionError = ref("");
const showPlatformModalChat = ref(false);
const showSchedulerModalChat = ref(false);
const schedulerInitialDateChat = ref(null);
const schedulerInitialTimeChat = ref(null);
const showPostMenuChat = ref(false);
const showDeletePostModalChat = ref(false);
const deletePostLoading = ref(false);
const deletePostError = ref("");
/** Custom aspect / format picker in post side panel (replaces native `<select>` UI). */
const postAspectDropdownOpen = ref(false);
const dotsButtonRefChat = ref(null);
const togglePostModalRefChat = ref(null);
let removePostMenuDocClick = null;
let removePostAspectDropdownClick = null;
let mediaQueryLg;
/** Interval for OAuth popup completion polling */
let socialAuthPollIntervalId = null;
/** While chat OAuth popup is open — for `postMessage` when payload omits platform / index */
const pendingChatOAuth = ref(null);
/** `messageIndex:platformKey` while `DELETE /api/products/:id/platforms/:platform` is in flight */
const chatPlatformDisconnectingKey = ref(null);

function getApiMessageOrigin() {
  try {
    return new URL(API_BASE_URL).origin;
  } catch {
    return "";
  }
}

const formatDateToString = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

/** Normalize `GET /post/:id` `images[]` rows for aspect picker + preview. */
function normalizePostImageVariants(rawImages) {
  if (!Array.isArray(rawImages) || rawImages.length === 0) return [];
  return rawImages
    .map((row) => {
      if (!row || typeof row !== "object") return null;
      const imageUrl = String(row.imageUrl ?? "").trim();
      if (!imageUrl) return null;
      const aspect = row.aspect != null ? String(row.aspect).trim() : "";
      const aspectName =
        String(row.aspectName ?? "").trim() ||
        (aspect ? `Aspect (${aspect})` : "Variant");
      return { aspect, aspectName, imageUrl };
    })
    .filter(Boolean);
}

/** Prefer `aspectName` "Default (1:1)", then `aspect` "1:1", else first row. */
function pickDefaultImageVariant(variants) {
  if (!variants?.length) return null;
  const byName = variants.find((r) => r.aspectName === "Default (1:1)");
  if (byName) return byName;
  const byAspect = variants.find((r) => r.aspect === "1:1");
  if (byAspect) return byAspect;
  return variants[0];
}

/** Image URL for schedule payload / preview: `postImages` + selected `postType` (aspectName), else legacy `postImage`. */
function resolveSelectedPostImageUrl(post) {
  if (!post || typeof post !== "object") return "";
  const variants = post.postImages;
  if (Array.isArray(variants) && variants.length) {
    const sel = post.postType;
    const match =
      variants.find((r) => r.aspectName === sel) ||
      pickDefaultImageVariant(variants) ||
      variants[0];
    return String(match?.imageUrl ?? "").trim();
  }
  return String(post.postImage ?? "").trim();
}

const mapApiPostToSelectedPost = (apiPost) => {
  const scheduledAt = apiPost.scheduledAt ? new Date(apiPost.scheduledAt) : null;
  const fallbackSource = apiPost.updatedAt || apiPost.createdAt;
  const fallback = fallbackSource ? new Date(fallbackSource) : new Date();
  const when =
    scheduledAt && !Number.isNaN(scheduledAt.getTime()) ? scheduledAt : fallback;

  const hours = when.getHours();
  const minutes = when.getMinutes();
  const postTime = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
  const postDate = formatDateToString(when);

  let platforms = [];
  if (Array.isArray(apiPost.platforms)) {
    platforms = apiPost.platforms.map((p) =>
      typeof p === "string" ? p.toLowerCase() : String(p).toLowerCase()
    );
  }

  const productId =
    apiPost.productId ??
    apiPost.product_id ??
    (typeof apiPost.product === "object" && apiPost.product != null
      ? apiPost.product.id
      : null) ??
    null;

  const normalizedImages = normalizePostImageVariants(apiPost.images);
  const postImages = normalizedImages.length > 0 ? normalizedImages : null;
  const defaultVariant = pickDefaultImageVariant(normalizedImages);
  const legacyImage = String(apiPost.imageUrl ?? "").trim();

  let postType = "Instagram post (4:5)";
  let postImage = legacyImage;
  if (postImages && defaultVariant) {
    postType = defaultVariant.aspectName;
    postImage = defaultVariant.imageUrl;
  }

  return {
    id: apiPost.id,
    productId: productId != null ? String(productId) : null,
    caption: apiPost.content ?? "",
    /** Legacy single URL; superseded by `resolveSelectedPostImageUrl` when `postImages` is set. */
    postImage,
    /** When set, aspect dropdown uses each row's `aspectName`; preview follows `postType`. */
    postImages,
    platforms,
    postDate,
    postTime,
    status: apiPost.status ?? "draft",
    postType,
    title: apiPost.title?.trim() || "Post",
  };
};

/** Rows from `selectedPostForModal.postImages` for aspect `<select>` (API `images[].aspectName`). */
const postModalAspectOptions = computed(() => {
  const imgs = selectedPostForModal.value?.postImages;
  return Array.isArray(imgs) && imgs.length ? imgs : [];
});

const postModalDisplayImageUrl = computed(() =>
  resolveSelectedPostImageUrl(selectedPostForModal.value)
);

/** Local scheduled instant from `postDate` (YYYY-MM-DD) + `postTime` (HH:mm). */
function getPostModalScheduledMs(post) {
  if (!post || typeof post !== "object") return null;
  const dateStr = String(post.postDate ?? "").trim();
  const timeStr = String(post.postTime ?? "").trim();
  if (!dateStr) return null;
  const dp = dateStr.split("-").map((x) => Number(x));
  if (dp.length < 3 || dp.some((n) => Number.isNaN(n))) return null;
  const [y, mo, da] = dp;
  let hh = 0;
  let mi = 0;
  if (timeStr) {
    const tp = timeStr.split(":").map((x) => Number(x));
    if (tp.length && !Number.isNaN(tp[0])) hh = tp[0];
    if (tp.length > 1 && !Number.isNaN(tp[1])) mi = tp[1];
  }
  const d = new Date(y, mo - 1, da, hh, mi, 0, 0);
  const t = d.getTime();
  return Number.isNaN(t) ? null : t;
}

/** Schedule post is allowed only with ≥1 platform and a future date/time. */
const canSchedulePostInChatModal = computed(() => {
  const post = selectedPostForModal.value;
  if (!post?.id) return false;
  const pls = post.platforms;
  if (!Array.isArray(pls) || pls.length < 1) return false;
  const nonempty = pls.filter((p) => String(p ?? "").trim() !== "");
  if (nonempty.length < 1) return false;
  const ms = getPostModalScheduledMs(post);
  if (ms == null) return false;
  return ms > Date.now();
});

const STATIC_POST_FORMAT_OPTIONS = [
  { value: "Instagram post (4:5)", label: "Instagram post (4:5)" },
  { value: "Instagram post (1:1)", label: "Instagram post (1:1)" },
  { value: "Instagram post (9:16)", label: "Instagram post (9:16)" },
  { value: "Facebook post (4:5)", label: "Facebook post (4:5)" },
  { value: "LinkedIn post (4:5)", label: "LinkedIn post (4:5)" },
  { value: "Twitter post (16:9)", label: "Twitter post (16:9)" },
];

/** Options for the custom aspect dropdown: API `aspectName` rows or static format list. */
const postAspectSelectOptions = computed(() => {
  const dynamic = postModalAspectOptions.value;
  if (dynamic.length) {
    return dynamic.map((o) => ({ value: o.aspectName, label: o.aspectName }));
  }
  return STATIC_POST_FORMAT_OPTIONS;
});

function togglePostAspectDropdown() {
  postAspectDropdownOpen.value = !postAspectDropdownOpen.value;
}

function selectPostAspectOption(value) {
  if (!selectedPostForModal.value) return;
  selectedPostForModal.value.postType = value;
  postAspectDropdownOpen.value = false;
}

watch(postAspectDropdownOpen, (open) => {
  if (removePostAspectDropdownClick) {
    document.removeEventListener("click", removePostAspectDropdownClick, true);
    removePostAspectDropdownClick = null;
  }
  if (!open) return;
  nextTick(() => {
    if (!postAspectDropdownOpen.value) return;
    removePostAspectDropdownClick = (e) => {
      const t = e?.target;
      if (t && typeof t.closest === "function" && t.closest(".chat-post-aspect-dropdown-container")) {
        return;
      }
      postAspectDropdownOpen.value = false;
    };
    document.addEventListener("click", removePostAspectDropdownClick, true);
  });
});

function normalizePlatformIconKey(raw) {
  return String(raw ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "");
}

/** Generic placeholder when backend has no icon URL for a key (platform list is backend-driven). */
const platformIconPlaceholder = PlatformIcon;

/** Register every normalized alias so post `platforms[]` strings match API rows. */
function registerPlatformIconKeys(map, row, iconUrl) {
  const candidates = [
    row?.name,
    row?.label,
    row?.platform,
    row?.slug,
    row?.id != null ? String(row.id) : null,
  ];
  for (const raw of candidates) {
    if (raw == null || String(raw).trim() === "") continue;
    const key = normalizePlatformIconKey(raw);
    if (key) map[key] = iconUrl;
  }
}

/** Loads platform rows (`icon` URLs from backend) — same `GET /api/platforms` as SocialMediaModal. */
async function fetchPlatformIconsCatalog(productId = null) {
  try {
    const params = {};
    if (productId) params.productId = productId;
    const response = await api.get("/api/platforms", { params });
    let list = [];
    if (Array.isArray(response.data)) {
      list = response.data;
    } else if (response.data?.platforms && Array.isArray(response.data.platforms)) {
      list = response.data.platforms;
    }
    const map = {};
    for (const p of list) {
      if (typeof p?.icon !== "string" || p.icon.trim() === "") continue;
      const url = p.icon.trim();
      registerPlatformIconKeys(map, p, url);
    }
    platformIconUrlByKey.value = map;
  } catch (e) {
    console.warn("GET /api/platforms (chat platform icons):", e);
    platformIconUrlByKey.value = {};
  }
}

const getPlatformIcon = (platform) => {
  const k = normalizePlatformIconKey(platform);
  const fromApi = platformIconUrlByKey.value[k];
  if (fromApi) return fromApi;
  return platformIconPlaceholder;
};

function onChatPlatformIconError(e) {
  const el = e?.target;
  if (!el || typeof el !== "object" || !("src" in el)) return;
  if (el.dataset?.platformIconFallbackApplied) return;
  el.dataset.platformIconFallbackApplied = "1";
  el.src = platformIconPlaceholder;
}

const formatTimeForModal = (timeString) => {
  if (!timeString || typeof timeString !== "string") return "";
  const [hours, minutes] = timeString.split(":").map(Number);
  const h = hours % 12 || 12;
  const ampm = hours < 12 ? "AM" : "PM";
  const m = minutes > 0 ? `:${String(minutes).padStart(2, "0")}` : "";
  return `${h}${m} ${ampm}`;
};

/** Combine panel `postDate` (YYYY-MM-DD) + `postTime` (HH:mm) to ISO string for `scheduledAt`. */
function postLocalDateTimeToIso(postDateStr, postTimeStr) {
  if (!postDateStr || !postTimeStr) return null;
  const [y, mo, d] = String(postDateStr).split("-").map(Number);
  const [hh, mm] = String(postTimeStr).split(":").map(Number);
  if (!Number.isFinite(y) || !Number.isFinite(hh)) return null;
  const dt = new Date(y, (mo || 1) - 1, d || 1, hh || 0, mm || 0, 0, 0);
  if (Number.isNaN(dt.getTime())) return null;
  return dt.toISOString();
}

/** FormData for `PUT /post/:id` from the post side panel (optional fields per API). */
function buildSchedulePostFormData(post) {
  const fd = new FormData();
  if (post.title != null && String(post.title).trim() !== "") {
    fd.append("title", String(post.title).trim());
  }
  if (post.caption != null) {
    fd.append("content", String(post.caption));
  }
  const imageUrl = resolveSelectedPostImageUrl(post);
  if (imageUrl) {
    fd.append("imageUrl", imageUrl);
  }
  const platformsStr =
    Array.isArray(post.platforms) && post.platforms.length > 0
      ? post.platforms
          .map((p) => String(p).toLowerCase().trim())
          .filter(Boolean)
          .join(",")
      : "";
  fd.append("platforms", platformsStr);
  const iso = postLocalDateTimeToIso(post.postDate, post.postTime);
  if (iso) {
    fd.append("scheduledAt", iso);
  }
  fd.append("status", "scheduled");
  return fd;
}

/** e.g. "Today, 4:00 PM" for the post panel schedule field */
const getScheduledDateTimeLabel = (post) => {
  if (!post?.postDate) return "";
  const date = new Date(post.postDate);
  if (Number.isNaN(date.getTime())) return "";
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const isToday = date.toDateString() === today.toDateString();
  const isTomorrow = date.toDateString() === tomorrow.toDateString();

  let dateLabel = "";
  if (isToday) {
    dateLabel = "Today";
  } else if (isTomorrow) {
    dateLabel = "Tomorrow";
  } else {
    dateLabel = date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  }

  const timeDisplay = formatTimeForModal(post.postTime);
  if (!timeDisplay) return dateLabel;
  return `${dateLabel}, ${timeDisplay}`;
};

const onPostGeneratedImageClick = (postId) => {
  if (!postId) return;
  highlightedPostImageId.value = postId;
  openPostShareModal(postId);
};

const openPostShareModal = async (postId) => {
  showPostShareModal.value = true;
  postModalLoading.value = true;
  postModalError.value = null;
  selectedPostForModal.value = null;
  schedulePostError.value = "";
  regenerateCaptionError.value = "";
  regenerateCaptionLoading.value = false;
  showPostMenuChat.value = false;
  postAspectDropdownOpen.value = false;
  showDeletePostModalChat.value = false;
  deletePostError.value = "";
  try {
    const { data } = await api.get(`/post/${postId}`);
    const raw = data?.post ?? data;
    if (!raw || typeof raw !== "object") {
      throw new Error("Invalid post response");
    }
    const mapped = mapApiPostToSelectedPost(raw);
    selectedPostForModal.value = mapped;
    await fetchPlatformIconsCatalog(mapped?.productId ?? null);
  } catch (e) {
    console.error("Failed to load post:", e);
    postModalError.value =
      e?.response?.data?.message || e?.message || "Failed to load post";
  } finally {
    postModalLoading.value = false;
  }
};

const closePostShareModal = () => {
  showPostShareModal.value = false;
  highlightedPostImageId.value = null;
  postModalError.value = null;
  selectedPostForModal.value = null;
  platformIconUrlByKey.value = {};
  schedulePostError.value = "";
  regenerateCaptionError.value = "";
  regenerateCaptionLoading.value = false;
  showPostMenuChat.value = false;
  postAspectDropdownOpen.value = false;
  showDeletePostModalChat.value = false;
  deletePostError.value = "";
  deletePostLoading.value = false;
};

const closeDeletePostModalChat = () => {
  showDeletePostModalChat.value = false;
  deletePostError.value = "";
};

const confirmDeletePostChat = async () => {
  const post = selectedPostForModal.value;
  if (!post?.id || deletePostLoading.value) return;
  const id = post.id;
  deletePostError.value = "";
  deletePostLoading.value = true;
  try {
    await api.delete(`/post/${encodeURIComponent(id)}`);
    showDeletePostModalChat.value = false;
    closePostShareModal();
  } catch (e) {
    console.error("DELETE /post/:id failed:", e);
    deletePostError.value =
      e?.response?.data?.message || e?.message || "Could not delete post.";
  } finally {
    deletePostLoading.value = false;
  }
};

const handleSchedulePostSubmit = async () => {
  const post = selectedPostForModal.value;
  console.log("post", post);
  if (!post?.id || schedulePostLoading.value) return;
  if (!canSchedulePostInChatModal.value) return;

  schedulePostError.value = "";
  schedulePostLoading.value = true;
  try {
    const formData = buildSchedulePostFormData(post);
    const { data } = await api.put(`/post/${encodeURIComponent(post.id)}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
      timeout: 600000,
    });
    const raw = data?.post ?? data;

    if (raw && typeof raw === "object" && (raw.id != null || data?.post)) {
      const mapped = mapApiPostToSelectedPost(data?.post ?? raw);
      selectedPostForModal.value = mapped;
      await fetchPlatformIconsCatalog(mapped?.productId ?? null);
    }
  } catch (e) {
    console.error("PUT /post/:id failed:", e);
    schedulePostError.value =
      e?.response?.data?.message || e?.message || "Could not update post.";
  } finally {
    schedulePostLoading.value = false;
  }
};

const openPlatformModalChat = () => {
  if (selectedPostForModal.value) {
    showPlatformModalChat.value = true;
    fetchPlatformIconsCatalog(selectedPostForModal.value?.productId ?? null);
  }
};

const closePlatformModalChat = () => {
  showPlatformModalChat.value = false;
};

const handleAddPlatformsFromChatModal = () => {
  showPlatformModalChat.value = false;
  router.push({ path: "/products" });
};

const updatePlatformsChat = (platforms) => {
  if (selectedPostForModal.value) {
    selectedPostForModal.value.platforms = platforms;
  }
};

const openSchedulerFromPostModal = () => {
  if (!selectedPostForModal.value) return;
  const d = new Date(selectedPostForModal.value.postDate);
  schedulerInitialDateChat.value = d;
  schedulerInitialTimeChat.value = selectedPostForModal.value.postTime;
  showSchedulerModalChat.value = true;
};

const closeSchedulerModalChat = () => {
  showSchedulerModalChat.value = false;
};

const handleScheduleChat = (scheduleData) => {
  if (!selectedPostForModal.value) return;
  const newDate = scheduleData.date;
  const newTime = scheduleData.time;
  selectedPostForModal.value.postDate = formatDateToString(newDate);
  selectedPostForModal.value.postTime = newTime;
};

const togglePostMenuChat = () => {
  showPostMenuChat.value = !showPostMenuChat.value;
};

const handlePostModalShare = () => {
  console.log("Share now", selectedPostForModal.value);
};

const regeneratePostCaption = async () => {
  const post = selectedPostForModal.value;
  if (!post?.id || regenerateCaptionLoading.value) return;

  regenerateCaptionError.value = "";
  regenerateCaptionLoading.value = true;
  try {
    const { data } = await api.post(
      "/api/captions/regenerate",
      {
        postId: post.id,
        caption: post.caption ?? "",
      },
      { timeout: LONG_REQUEST_TIMEOUT_MS }
    );
    if (data?.success === false) {
      throw new Error(data?.message || "Could not regenerate caption.");
    }
    const nextCaption = data?.caption;
    if (nextCaption == null) {
      throw new Error("Invalid caption response");
    }
    post.caption = nextCaption;
  } catch (e) {
    console.error("POST /api/captions/regenerate failed:", e);
    regenerateCaptionError.value =
      e?.response?.data?.message || e?.message || "Could not regenerate caption.";
  } finally {
    regenerateCaptionLoading.value = false;
  }
};

const handlePostModalRegenerate = () => {
  showPostMenuChat.value = false;
  regeneratePostCaption();
};

const handlePostModalDelete = () => {
  if (!selectedPostForModal.value?.id) return;
  deletePostError.value = "";
  showDeletePostModalChat.value = true;
};

watch(showPostMenuChat, (open) => {
  if (removePostMenuDocClick) {
    document.removeEventListener("click", removePostMenuDocClick, true);
    removePostMenuDocClick = null;
  }
  if (!open) return;
  nextTick(() => {
    removePostMenuDocClick = (e) => {
      if (dotsButtonRefChat.value?.contains(e.target)) return;
      if (togglePostModalRefChat.value?.dropdownRef?.contains(e.target)) return;
      showPostMenuChat.value = false;
    };
    document.addEventListener("click", removePostMenuDocClick, true);
  });
});

// Computed property to check if AI is generating
const isAiGenerating = computed(() => {
  return messages.value.some(message => message.isLoading === true);
});

// Auto-scroll function to bottom anchor
const scrollToBottom = () => {
  nextTick(() => {
    if (scrollAnchor.value) {
      scrollAnchor.value.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  });
};

const handleCopy = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    // You could add a toast notification here
    console.log("Copied to clipboard");
  } catch (err) {
    console.error("Failed to copy text: ", err);
    // Fallback for older browsers
    const textArea = document.createElement("textarea");
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand("copy");
    document.body.removeChild(textArea);
  }
};

const unescapeHtmlEntities = (text) => {
  if (text == null || text === "") return "";
  const div = document.createElement('div');
  div.innerHTML = text;
  return div.textContent || div.innerText || '';
};

/** Convert markdown formatting to safe HTML for AI responses */
const formatMarkdownToHtml = (text) => {
  if (text == null || text === "") return "";
  
  // First escape HTML to prevent XSS
  let html = String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
  
  // Convert markdown bold (**text**) to HTML bold (<strong>text</strong>)
  html = html.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  
  // Convert markdown italic (*text*) to HTML italic (<em>text</em>)
  html = html.replace(/\*([^*]+)\*/g, "<em>$1</em>");
  
  // Convert line breaks to <br>
  html = html.replace(/\n/g, "<br>");
  
  return html;
};

const isInternalPath = (url) => typeof url === "string" && url.startsWith("/") && !url.startsWith("//");

/** Same slug rules as `SocialConnections.vue` `normalizePlatformKey` — API `name` is source of truth. */
const normalizeSocialPlatformKey = (raw) => {
  if (raw == null || raw === "") return null;
  let s = String(raw).trim().toLowerCase();
  if (!s) return null;
  s = s.replace(/\s+/g, "_");
  s = s.replace(/[^a-z0-9_-]/g, "");
  s = s.replace(/_+/g, "_").replace(/^_|_$/g, "");
  return s || null;
};

function setChatMessagePlatformConnected(messageIndex, platformName, connected) {
  const msg = messages.value[messageIndex];
  if (!msg?.typeData?.platforms?.length) return;
  const key = normalizeSocialPlatformKey(platformName);
  if (!key) return;
  const platforms = msg.typeData.platforms.map((p) => {
    const pk = normalizeSocialPlatformKey(p?.name);
    if (pk && pk === key) return { ...p, connected };
    return p;
  });
  messages.value[messageIndex] = {
    ...msg,
    typeData: { ...msg.typeData, platforms },
  };
}

function handleChatSocialAuthMessage(event) {
  const allowed = getApiMessageOrigin();
  if (!allowed || event.origin !== allowed) return;

  const data = event.data;
  if (data == null || typeof data !== "object") return;
  if (!data.success) return;

  console.log("Auth success:", data);

  const raw =
    data.platform ??
    data.name ??
    data.platformName ??
    data.platformKey ??
    "";
  const fromPayload = String(raw || "").trim();

  let messageIndex =
    typeof data.messageIndex === "number" && !Number.isNaN(data.messageIndex)
      ? data.messageIndex
      : pendingChatOAuth.value?.messageIndex;
  if (messageIndex == null || messageIndex < 0 || messageIndex >= messages.value.length) {
    pendingChatOAuth.value = null;
    return;
  }

  const platformName =
    fromPayload || String(pendingChatOAuth.value?.platformName || "").trim();
  pendingChatOAuth.value = null;

  if (!platformName) return;

  setChatMessagePlatformConnected(messageIndex, platformName, true);
  emit("socialAuthLinked", { platform: platformName, action: "connect" });

  if (socialAuthPollIntervalId) {
    clearInterval(socialAuthPollIntervalId);
    socialAuthPollIntervalId = null;
  }
}

const isChatPlatformDisconnecting = (messageIndex, platform) => {
  const k = normalizeSocialPlatformKey(platform?.name);
  if (!k) return false;
  return chatPlatformDisconnectingKey.value === `${messageIndex}:${k}`;
};

/**
 * `DELETE /api/products/:id/platforms/:platform` — id from message.typeData.productId, platform slug from `platform.name`.
 */
const handleChatPlatformDisconnect = async (platform, messageIndex) => {
  const segment = normalizeSocialPlatformKey(platform?.name);
  if (!segment) return;

  const lockKey = `${messageIndex}:${segment}`;
  if (chatPlatformDisconnectingKey.value === lockKey) return;

  const productId = String(
    messages.value[messageIndex]?.typeData?.productId ?? ""
  ).trim();

  if (!productId) {
    setChatMessagePlatformConnected(messageIndex, platform.name, false);
    emit("socialAuthLinked", { platform: platform.name, action: "disconnect" });
    return;
  }

  chatPlatformDisconnectingKey.value = lockKey;
  try {
    await api.delete(
      `/api/products/${encodeURIComponent(productId)}/platforms/${encodeURIComponent(segment)}`
    );
    setChatMessagePlatformConnected(messageIndex, platform.name, false);
    emit("socialAuthLinked", { platform: platform.name, action: "disconnect" });
  } catch (e) {
    console.error("DELETE /api/products/:id/platforms/:platform failed:", e);
  } finally {
    chatPlatformDisconnectingKey.value = null;
  }
};

const handleSocialPlatformCardAction = (platform, messageIndex) => {
  if (platform.connected) return;
  goToSocialPlatformAuth(platform.authUrl, platform.name, messageIndex);
};

/**
 * Opens OAuth in a popup; appends `token` from localStorage (TOKEN_KEY).
 * Relative `authUrl` is resolved with axios `baseURL` from `src/services/api.js`.
 * Polls until the popup closes or the callback URL indicates success (e.g. `linked=` in query).
 * @param {number|null} chatMessageIndex — when set, marks that message’s platform row connected on success.
 */
const goToSocialPlatformAuth = (authUrl, platformName = "", chatMessageIndex = null) => {
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
    if (
      chatMessageIndex != null &&
      chatMessageIndex >= 0 &&
      chatMessageIndex < messages.value.length
    ) {
      const productId = String(
        messages.value[chatMessageIndex]?.typeData?.productId ?? ""
      ).trim();
      if (productId) {
        fullUrl.searchParams.set("productId", productId);
      }
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

  if (
    chatMessageIndex != null &&
    chatMessageIndex >= 0 &&
    chatMessageIndex < messages.value.length
  ) {
    pendingChatOAuth.value = {
      messageIndex: chatMessageIndex,
      platformName,
    };
  } else {
    pendingChatOAuth.value = null;
  }

  if (socialAuthPollIntervalId) {
    clearInterval(socialAuthPollIntervalId);
    socialAuthPollIntervalId = null;
  }

  socialAuthPollIntervalId = setInterval(() => {
    try {
      if (popup.closed) {
        if (socialAuthPollIntervalId) {
          clearInterval(socialAuthPollIntervalId);
          socialAuthPollIntervalId = null;
        }
        pendingChatOAuth.value = null;
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
        emit("socialAuthLinked", { platform: platformName, href, action: "connect" });
        if (
          chatMessageIndex != null &&
          chatMessageIndex >= 0 &&
          chatMessageIndex < messages.value.length
        ) {
          setChatMessagePlatformConnected(chatMessageIndex, platformName, true);
        }
        pendingChatOAuth.value = null;
      }
    } catch {
      /* cross-origin while on provider — expected */
    }
  }, 500);
};

/** Cached GET /api/products/:id for product_created chat messages */
const productCreatedCache = reactive({});
const productCreatedLoading = reactive({});
const productCreatedError = reactive({});
/** True after successful DELETE or GET /api/products/:id returns 404 (refresh / history). */
const productCreatedGone = reactive({});
/** Local Active/Inactive state keyed by product id (aligned with Products list cards). */
const productCreatedActiveOverrides = ref({});

const fetchProductCreatedDetails = async (productId) => {
  if (!productId || productCreatedLoading[productId]) return;
  if (productCreatedCache[productId]) return;
  if (productCreatedGone[productId]) return;
  productCreatedLoading[productId] = true;
  productCreatedError[productId] = null;
  try {
    const { data } = await api.get(`/api/products/${encodeURIComponent(productId)}`);
    if (data && typeof data === "object") {
      productCreatedCache[productId] = data;
      delete productCreatedGone[productId];
    } else {
      productCreatedError[productId] = "Invalid product response";
    }
  } catch (e) {
    const status = e?.response?.status;
    if (status === 404) {
      productCreatedGone[productId] = true;
      delete productCreatedError[productId];
    } else {
      console.error("Failed to load product for chat card:", e);
      const msg =
        e?.response?.data?.message ||
        (typeof e?.message === "string" && !e.message.includes("status code")
          ? e.message
          : null);
      productCreatedError[productId] =
        msg || "Could not load product. Please try again.";
    }
  } finally {
    productCreatedLoading[productId] = false;
  }
};

watch(
  () =>
    messages.value.map((m) => ({
      rt: m.responseType,
      pid: m.typeData?.productId,
    })),
  () => {
    messages.value.forEach((m) => {
      if (m.responseType === "product_created" && m.typeData?.productId) {
        fetchProductCreatedDetails(m.typeData.productId);
      }
    });
  },
  { deep: true, immediate: true }
);

const isChatProductCardActive = (product) => {
  if (!product?.id) return true;
  const id = product.id;
  if (productCreatedActiveOverrides.value[id] !== undefined) {
    return productCreatedActiveOverrides.value[id];
  }
  if (product.isActive !== undefined && product.isActive !== null) {
    return Boolean(product.isActive);
  }
  return true;
};

const toggleChatProductCardActive = (product) => {
  if (!product?.id) return;
  const id = product.id;
  const next = !isChatProductCardActive(product);
  productCreatedActiveOverrides.value = { ...productCreatedActiveOverrides.value, [id]: next };
};

const handleProductCreatedEdit = () => {
  router.push("/products");
};

/** DELETE /api/products/:id — removes product; `id` is PRODUCT_UUID */
const handleProductCreatedDelete = async (productId) => {
  if (!productId) return;
  try {
    await api.delete(`/api/products/${encodeURIComponent(productId)}`);
    delete productCreatedCache[productId];
    delete productCreatedError[productId];
    productCreatedGone[productId] = true;
  } catch (e) {
    console.error("Delete product failed:", e);
    productCreatedError[productId] =
      e?.response?.data?.message || e?.message || "Could not delete product";
  }
};

// Copy AI response (strip HTML tags)
const handleCopyAIResponse = async (htmlContent, index) => {
  // Create a temporary div to extract text content
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = htmlContent;
  const textContent = tempDiv.textContent || tempDiv.innerText || "";
  
  try {
    await navigator.clipboard.writeText(textContent);
    console.log("AI response copied to clipboard");
    // You could add a toast notification here
  } catch (err) {
    console.error("Failed to copy AI response: ", err);
    // Fallback for older browsers
    const textArea = document.createElement("textarea");
    textArea.value = textContent;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand("copy");
    document.body.removeChild(textArea);
  }
};

// Handle like action
const handleLike = (index) => {
  if (messages.value[index]) {
    // Toggle like state
    messages.value[index].isLiked = !messages.value[index].isLiked;
    // If liked, remove dislike
    if (messages.value[index].isLiked) {
      messages.value[index].isDisliked = false;
    }
  }
};

// Handle dislike action
const handleDislike = (index) => {
  if (messages.value[index]) {
    // Toggle dislike state
    messages.value[index].isDisliked = !messages.value[index].isDisliked;
    // If disliked, remove like
    if (messages.value[index].isDisliked) {
      messages.value[index].isLiked = false;
    }
  }
};

// Handle refresh/regenerate response
// const handleRefresh = (index) => {
//   if (messages.value[index]) {
//     // Set loading state
//     messages.value[index].isLoading = true;
//     messages.value[index].aiResponse = null;
//     messages.value[index].responseType = null;
//     messages.value[index].suggestedResponses = [];
    
//     // Scroll to bottom
//     scrollToBottom();
    
//     // Regenerate response after a delay (simulating API call)
//     setTimeout(() => {
//       if (messages.value[index]) {
//         messages.value[index].isLoading = false;
//         // Regenerate with same dummy message for now
//         messages.value[index].aiResponse = "Great! ✨ Let's set up your brand. You can share your <strong>website</strong>, upload <strong>brand documents</strong>, or simply describe your <strong>products</strong> and style here in the chat. I'll use this info to understand your brand's tone, personality, and style.";
        
//         // Reset like/dislike states
//         messages.value[index].isLiked = false;
//         messages.value[index].isDisliked = false;
        
//         // Scroll when AI response updates
//         scrollToBottom();
//       }
//     }, 5000);
//   }
// };

// const handleEdit = (index) => {
//   editingIndex.value = index;
//   editingText.value = messages.value[index].text;
//   nextTick(() => {
//     if (editTextareaRef) {
//       editTextareaRef.focus();
//       // Move cursor to end
//       editTextareaRef.setSelectionRange(
//         editTextareaRef.value.length,
//         editTextareaRef.value.length
//       );
//     }
//   });
// };

// const saveEdit = (index) => {
//   if (editingText.value.trim()) {
//     const editedText = editingText.value.trim();
    
//     // Update the message text
//     messages.value[index].text = editedText;
    
//     // Remove all messages after the edited message (like ChatGPT workflow)
//     messages.value = messages.value.slice(0, index + 1);
    
//     // Clear AI response and set loading state for the edited message
//     messages.value[index].aiResponse = null;
//     messages.value[index].isLoading = true;
//     messages.value[index].isLiked = false;
//     messages.value[index].isDisliked = false;
//     messages.value[index].responseType = null;
//     messages.value[index].suggestedResponses = [];
    
//     // Exit edit mode
//     editingIndex.value = null;
//     editingText.value = "";
    
//     // Scroll to bottom after edit
//     scrollToBottom();
    
//     // Trigger new AI response after a delay (simulating API call)
//     setTimeout(() => {
//       if (messages.value[index]) {
//         messages.value[index].isLoading = false;
//         // Show first dummy message
//         messages.value[index].aiResponse = "Great! ✨ Let's set up your brand. You can share your <strong>website</strong>, upload <strong>brand documents</strong>, or simply describe your <strong>products</strong> and style here in the chat. I'll use this info to understand your brand's tone, personality, and style.";
        
//         // Scroll when AI response updates
//         scrollToBottom();
        
//         // Add second dummy message after a short delay

//       }
//     }, 5000);
//   }
// };

// const cancelEdit = () => {
//   editingIndex.value = null;
//   editingText.value = "";
// };

// Handle suggested response button click
const handleSuggestedResponse = (suggestion, currentMessageIndex) => {
  // Prevent clicking if AI is already generating
  if (isAiGenerating.value) return;
  
  // Extract text from suggestion object or use as-is if string
  const suggestionText = typeof suggestion === 'object' && suggestion !== null 
    ? suggestion.text 
    : suggestion;
  
  // Send the suggestion as a new message
  handleNewMessage({
    text: suggestionText,
    product: messages.value[currentMessageIndex]?.product || null,
    model: messages.value[currentMessageIndex]?.model || "gemini-2.5-pro",
    files: []
  });
};

/** Apply non-stream or final stream `result` payload to the AI placeholder message. */
const applyAiPayloadToMessage = (aiMessage, raw) => {
  if (!aiMessage || raw == null) return;
  const data =
    typeof raw === "object" && raw !== null && !Array.isArray(raw) ? { ...raw } : {};
  delete data.streamEvent;
  delete data.success;
  if (data.sessionId != null && data.sessionId !== props.sessionId) {
    emit("update:sessionId", data.sessionId);
  }
  aiMessage.isLoading = false;
  aiMessage.streamStatus = null;
  aiMessage.aiResponse = data.message ?? data.response ?? "No response received";
  aiMessage.responseType = data.type ?? null;
  aiMessage.suggestedResponses = Array.isArray(data.suggestedResponses)
    ? data.suggestedResponses
    : [];
  aiMessage.typeData = data.typeData ?? null;
};

/** Strip SSE `data:` prefix so one line parses as JSON. */
const normalizeChatStreamLine = (raw) => {
  let s = String(raw).trim();
  if (!s) return "";
  if (s.startsWith("data:")) {
    s = s.slice(5).trim();
  }
  return s;
};

/** Status text from `{ streamEvent: "status", ... }` (flexible keys / casing). */
const getStreamStatusDisplayText = (evt) => {
  if (evt == null || typeof evt !== "object") return null;
  const kind = String(evt.streamEvent ?? evt.event ?? evt.type ?? "").toLowerCase();
  if (kind !== "status") return null;
  const nested =
    evt.data != null && typeof evt.data === "object" && !Array.isArray(evt.data) ? evt.data : null;
  const text =
    evt.message ??
    nested?.message ??
    evt.msg ??
    evt.text ??
    evt.statusText ??
    evt.statusMessage ??
    (typeof evt.status === "string" ? evt.status : null) ??
    evt.body;
  if (text == null) return null;
  const s = String(text).trim();
  return s === "" ? null : s;
};

/** Parse one NDJSON / SSE line; returns true when a final `result` was applied. */
const handleChatStreamLine = (line, messageIndex) => {
  const trimmed = normalizeChatStreamLine(line);
  if (!trimmed) return false;
  let evt;
  try {
    evt = JSON.parse(trimmed);
  } catch {
    return false;
  }
  const msg = messages.value[messageIndex];
  if (!msg) return false;

  const statusText = getStreamStatusDisplayText(evt);
  if (statusText != null) {
    msg.streamStatus = statusText;
    triggerRef(messages);
    return false;
  }
  if (String(evt.streamEvent ?? "").toLowerCase() === "result") {
    const inner =
      evt.data != null && typeof evt.data === "object" && !Array.isArray(evt.data)
        ? evt.data
        : evt;
    applyAiPayloadToMessage(msg, inner);
    return true;
  }
  if (String(evt.streamEvent ?? "").toLowerCase() === "error") {
    throw new Error(evt.error || evt.message || "Stream error");
  }
  if (
    evt.streamEvent == null &&
    (evt.message != null || evt.response != null || evt.type != null)
  ) {
    applyAiPayloadToMessage(msg, evt);
    return true;
  }
  return false;
};

const handleNewMessage = async (messageData) => {
  const newMessage = {
    text: messageData.text,
    product: messageData.product,
    model: messageData.model,
    files: messageData.files,
    isLoading: true,
    streamStatus: null,
    aiResponse: null,
    isLiked: false,
    isDisliked: false,
    typeData: null,
  };

  messages.value.push(newMessage);
  scrollToBottom();

  const messageIndex = messages.value.length - 1;
  const aiMsg = () => messages.value[messageIndex];

  const formData = new FormData();
  formData.append("message", messageData.text);
  formData.append("isHidden", "false");
  formData.append("streamProgress", "true");

   console.log("messageData......",messageData);
   

  if (props.sessionId) {
    formData.append("sessionId", props.sessionId);
  }
  if (messageData.product) {
    formData.append("productId", messageData.product);
  }
  if (messageData.model) {
    formData.append("model", messageData.model);
  }
  if (messageData.files && messageData.files.length > 0) {
    messageData.files.forEach((file) => {
      formData.append("files", file);
    });
  }

  const baseUrl = String(API_BASE_URL || "").replace(/\/+$/, "");
  const url = `${baseUrl}/api/ai/chat`;
  const headers = { "ngrok-skip-browser-warning": "true" };
  const token = typeof localStorage !== "undefined" ? localStorage.getItem(TOKEN_KEY) : null;
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const abortController = new AbortController();
  const timeoutId = setTimeout(() => abortController.abort(), 600000);

  try {
    const response = await fetch(url, {
      method: "POST",
      body: formData,
      headers,
      signal: abortController.signal,
    });

    if (response.status === 401) {
      if (typeof localStorage !== "undefined") {
        localStorage.removeItem(TOKEN_KEY);
      }
      window.location.href = "/signin";
      return;
    }

    if (!response.ok) {
      const errText = await response.text().catch(() => "");
      throw new Error(errText || `HTTP ${response.status}`);
    }

    let gotResult = false;

    // Prefer streaming the body whenever possible — many servers send
    // `Content-Type: application/json` while still emitting NDJSON lines, which
    // would skip status updates if we used `response.json()` once.
    if (response.body && typeof response.body.getReader === "function") {
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split(/\r?\n/);
        buffer = parts.pop() ?? "";
        for (const part of parts) {
          if (handleChatStreamLine(part, messageIndex)) gotResult = true;
          scrollToBottom();
        }
      }
      if (buffer.trim()) {
        if (handleChatStreamLine(buffer, messageIndex)) gotResult = true;
      }
    } else {
      const text = await response.text();
      if (!text.trim()) {
        throw new Error("Empty response body");
      }
      const lines = text.split(/\r?\n/).map(normalizeChatStreamLine).filter((l) => l);
      for (const part of lines) {
        if (handleChatStreamLine(part, messageIndex)) gotResult = true;
      }
      if (!gotResult) {
        try {
          const data = JSON.parse(normalizeChatStreamLine(text) || text.trim());
          if (aiMsg()) {
            applyAiPayloadToMessage(aiMsg(), data);
            gotResult = true;
          }
        } catch {
          throw new Error("Unexpected response format");
        }
      }
    }

    if (!gotResult && aiMsg()?.isLoading) {
      throw new Error("Stream ended without a result");
    }

    scrollToBottom();
  } catch (error) {
    console.error("Error sending message:", error);
    const msg = messages.value[messageIndex];
    if (msg) {
      msg.isLoading = false;
      msg.streamStatus = null;
      msg.aiResponse =
        error?.name === "AbortError"
          ? "Request timed out. Please try again."
          : error?.message || "Sorry, I encountered an error. Please try again.";
    }
    scrollToBottom();
  } finally {
    clearTimeout(timeoutId);
  }
};

// Watch for changes in messages array to auto-scroll
watch(
  () => messages.value.length,
  () => {
    scrollToBottom();
  }
);

// Watch for changes in AI responses to auto-scroll
watch(
  () => messages.value.map((m) => m.aiResponse || m.isLoading || m.streamStatus),
  () => {
    scrollToBottom();
  },
  { deep: true }
);

// Fetch chat history for a session
const fetchChatHistory = async (sessionId) => {
  if (!sessionId) return;
  
  try {
    console.log('Fetching chat history for session:', sessionId);
    
    const response = await api.get('/api/ai/history', {
      params: { sessionId }
    });
    
    
    let historyMessages = [];
    
    // Handle different response structures
    if (response.data?.messages && Array.isArray(response.data.messages)) {
      console.log('Found messages array in response.data.messages');
      historyMessages = response.data.messages;
    } else if (Array.isArray(response.data)) {
      console.log('Found direct array in response.data');
      historyMessages = response.data;
    } else if (response.data?.data && Array.isArray(response.data.data)) {
      console.log('Found messages in response.data.data');
      historyMessages = response.data.data;
    } else if (response.data?.history && Array.isArray(response.data.history)) {
      console.log('Found messages in response.data.history');
      historyMessages = response.data.history;
    } else if (response.data?.chats && Array.isArray(response.data.chats)) {
      console.log('Found messages in response.data.chats');
      historyMessages = response.data.chats;
    } else {
      console.log('No recognized message array found in response');
      // Try to find any array in the response
      for (const key in response.data) {
        console.log(`Checking key: ${key}, value:`, response.data[key], 'isArray:', Array.isArray(response.data[key]));
        if (Array.isArray(response.data[key])) {
          console.log(`Found array in response.data.${key}`);
          historyMessages = response.data[key];
          break;
        }
      }
    }
    
    console.log('History messages count:', historyMessages.length);
    
    // Clear existing messages first
    messages.value = [];
    
    if (historyMessages.length > 0) {
      // Group messages by user/AI pairs
      const groupedMessages = [];
      let currentUserMessage = null;
      
      historyMessages.forEach((msg, index) => {
        console.log(`Processing message ${index}:`, msg);
        
        if (msg.role === 'user') {
          // Save previous user message if exists
          if (currentUserMessage) {
            groupedMessages.push(currentUserMessage);
          }
          // Start new user message
          currentUserMessage = {
            text: msg.content || '',
            aiResponse: null,
            isLoading: false,
            isLiked: msg.isLiked || false,
            isDisliked: msg.isDisliked || false,
            responseType: msg.responseType || msg.type || null,
            suggestedResponses: msg.suggestedResponses || [],
            typeData: msg.typeData || null,
            product: msg.product || 'All products',
            model: msg.model || ''
          };
        } else if (msg.role === 'ai' || msg.role === 'assistant') {
          // Attach AI response to current user message
          if (currentUserMessage) {
            currentUserMessage.aiResponse = msg.content || null;
            currentUserMessage.typeData = msg.typeData ?? currentUserMessage.typeData ?? null;
            currentUserMessage.responseType = msg.responseType || msg.type || currentUserMessage.responseType;
            currentUserMessage.suggestedResponses = msg.suggestedResponses?.length
              ? msg.suggestedResponses
              : (currentUserMessage.suggestedResponses || []);
            groupedMessages.push(currentUserMessage);
            currentUserMessage = null;
          } else {
            // AI message without preceding user message (edge case)
            groupedMessages.push({
              text: '',
              aiResponse: msg.content || null,
              isLoading: false,
              isLiked: msg.isLiked || false,
              isDisliked: msg.isDisliked || false,
              responseType: msg.responseType || msg.type || null,
              suggestedResponses: msg.suggestedResponses || [],
              typeData: msg.typeData || null,
              product: msg.product || 'All products',
              model: msg.model || ''
            });
          }
        }
      });
      
      // Add any remaining user message
      if (currentUserMessage) {
        groupedMessages.push(currentUserMessage);
      }
      
      messages.value = groupedMessages;
      
      console.log('Mapped messages:', messages.value);
      
      // Update sessionId
      emit('update:sessionId', sessionId);
      emit('sessionLoaded', sessionId);
      
      // Scroll to bottom after loading history
      nextTick(() => {
        scrollToBottom();
      });
    } else {
      console.log('No messages to display');
    }
  } catch (error) {
    console.error('Error fetching chat history:', error);
  }
};

// Watch for external session ID changes (when clicked from sidebar)
watch(() => props.externalSessionId, (newSessionId) => {
  if (newSessionId) {
    fetchChatHistory(newSessionId);
  }
});

// Scroll to bottom on initial mount if there are messages; media query for post panel layout
onMounted(() => {
  updateIsLgUp();
  mediaQueryLg = window.matchMedia("(min-width: 1024px)");
  mediaQueryLg.addEventListener("change", updateIsLgUp);

  window.addEventListener("message", handleChatSocialAuthMessage);

  if (messages.value.length > 0) {
    scrollToBottom();
  }

  if (props.externalSessionId) {
    fetchChatHistory(props.externalSessionId);
  }
});

onUnmounted(() => {
  window.removeEventListener("message", handleChatSocialAuthMessage);
  pendingChatOAuth.value = null;
  if (removePostMenuDocClick) {
    document.removeEventListener("click", removePostMenuDocClick, true);
  }
  if (removePostAspectDropdownClick) {
    document.removeEventListener("click", removePostAspectDropdownClick, true);
  }
  if (socialAuthPollIntervalId) {
    clearInterval(socialAuthPollIntervalId);
    socialAuthPollIntervalId = null;
  }
  mediaQueryLg?.removeEventListener("change", updateIsLgUp);
});

defineExpose({
  messages
});
</script>

<style scoped>
.loading-dots::after {
  content: '...';
  animation: dots 1.5s steps(4, end) infinite;
}

@keyframes dots {
  0%, 20% {
    content: '.';
  }
  40% {
    content: '..';
  }
  60%, 100% {
    content: '...';
  }
}
</style>
