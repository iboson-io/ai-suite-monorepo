<template>
  <div class="flex h-full min-h-0 w-full flex-col bg_primary_color">
    <!-- Reserve right space on lg+ when post panel is open so chat does not sit under the fixed sheet -->
    <div
      class="flex min-h-0 min-w-0 flex-1 flex-col transition-[padding] duration-300 ease-in-out"
    >
    <!-- Chat Messages Container -->
    <div class="flex-1 overflow-y-auto px-3xl md:px-6xl pt-12xl pb-6xl  custom_scrollbar">
      <div class="mx-auto max-w-3xl space-y-7">
        <!-- Message Pair -->
        <div
          v-for="(message, index) in messages"
          :key="index"
        >
          <!-- User Message Bubble (Right Aligned) - Only show if there's user text -->
          <div v-if="message.text" class="flex flex-row justify-end gap-xl items-center group">
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
              <!-- Loading State with Animated Dots -->
              <div v-if="message.isLoading" class="rounded-2xl lg:px-3xl py-xs">
               <p class="primary_text_color body_3_regular"> Got it, give me a moment<span class="loading-dots"></span></p>
              </div>

              <!-- AI Response Content (default / conversation) -->
              <div v-else-if="message.aiResponse">
                <div class="Body_2_regular primary_text_color lg:px-3xl pb-md pt-3xl" v-html="formatMarkdownToHtml(message.aiResponse)"></div>
                
                <!-- Suggested Responses (for conversation type) -->
                <div 
                  v-if="message.responseType === 'conversation' && message.suggestedResponses && message.suggestedResponses.length > 0"
                  class="mt-3 px-3xl"
                  :class="suggestedResponseRowClass"
                >
                  <template
                    v-for="(suggestion, sIndex) in message.suggestedResponses"
                    :key="sIndex"
                  >
                    <!-- Render as link if URL exists -->
                    <a
                      v-if="suggestion.url"
                      :href="suggestion.url"
                      :class="suggestedChipLinkClass"
                    >
                      {{ unescapeHtmlEntities(suggestion.text || suggestion) }}
                    </a>
                    <!-- Render as button otherwise -->
                    <button
                      v-else
                      @click="handleSuggestedResponse(suggestion, index)"
                      :class="suggestedChipButtonClass"
                      :disabled="isAiGenerating"
                    >
                      {{ unescapeHtmlEntities(suggestion.text || suggestion) }}
                    </button>
                  </template>
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
      class="fixed bottom-0 left-0 right-0 z-40 transition-all duration-300 ease-in-out bg_primary_color z-[9] px-4 md:px-6"
      :class="[
        isSidebarCollapsed ? 'lg:left-16' : 'lg:left-64'
      ]"
    >
      <div class="mx-auto max-w-3xl">
        <PromptBox @send-message="handleNewMessage" :is-ai-generating="isAiGenerating" />
        
        <!-- Disclaimer -->
        <div class="text-center p-xl">
          <p class="body_4_regular tertiary_text_color">
            Genius AI can make mistakes. Please check for accuracy.
          </p>
        </div>
      </div>
    </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, nextTick, watch, onMounted, onUnmounted, computed } from "vue";
import { useRouter } from "vue-router";
import { PromptBox, ChatActionBar } from "@ai-suite/shared-ui";
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
import PlatformIcon from "../../../assets/images/PlatformIcon.svg";
import api, { TOKEN_KEY, API_BASE_URL } from "../../../services/api.js";

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
  "inline-flex shrink-0 cursor-pointer items-center justify-center whitespace-nowrap rounded-full bg-[#EBF5FF] px-4 py-2 text-[#3182CE] label_2_medium no-underline transition-colors hover:bg-[#DBEAFE]";
const suggestedChipButtonClass =
  "inline-flex shrink-0 cursor-pointer items-center justify-center whitespace-nowrap rounded-full bg-[#EBF5FF] px-4 py-2 text-[#3182CE] label_2_medium transition-colors hover:bg-[#DBEAFE] disabled:cursor-not-allowed disabled:opacity-60";

const messages = ref([...props.initialMessages]);
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
/** `name` key → `icon` URL from `GET /api/platforms` (same source as SocialMediaModal). */
const showPostMenuChat = ref(false);
const dotsButtonRefChat = ref(null);
let removePostMenuDocClick = null;
let removeProductCreatedMenuDocClick = null;
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

const plainTextFromAi = (value) => {
  if (!value) return "";
  const temp = document.createElement("div");
  temp.innerHTML = String(value);
  return (temp.textContent || temp.innerText || "").trim();
};

const escapeHtmlForNarrative = (str) =>
  String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");


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
    model: messages.value[currentMessageIndex]?.model || 'Gemini 2.5 pro',
    files: []
  });
};

const handleNewMessage = async (messageData) => {
  // Add user message
  const newMessage = {
    text: messageData.text,
    product: messageData.product,
    model: messageData.model,
    files: messageData.files,
    isLoading: true,
    aiResponse: null, // Will be updated when AI responds
    isLiked: false,
    isDisliked: false,
    typeData: null
  };
  
  messages.value.push(newMessage);
  

  console.log("message data", messages)
  // Scroll to bottom when new message is added
  scrollToBottom();
  
  try {
    // Build FormData for API request
    const formData = new FormData();
    formData.append('message', messageData.text);
    formData.append('isHidden', 'false');
    
    // Add sessionId if available (for continuing conversation)
    if (props.sessionId) {
      formData.append('sessionId', props.sessionId);
    }
    
    // Add optional fields if provided
    if (messageData.product) {
      formData.append('productId', messageData.product);
    }
    if (messageData.model) {
      formData.append('model', messageData.model);
    }
    
    // Add files if any
    if (messageData.files && messageData.files.length > 0) {
      messageData.files.forEach(file => {
        formData.append('files', file);
      });
    }
    
    // Make API call with 60-second timeout
    const response = await api.post('/api/ai/chat', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      timeout: 60000
    });
    
    // Console log the API response
    console.log('API Response:', response.data);
    
    const messageIndex = messages.value.length - 1;
    
    // Extract sessionId from response and update parent if needed
    if (response.data && response.data.sessionId) {
      // Only emit if sessionId is different (shouldn't happen in normal flow)
      if (response.data.sessionId !== props.sessionId) {
        emit('update:sessionId', response.data.sessionId);
      }
    }
    
    // Update the message with AI response
    if (messages.value[messageIndex]) {
      messages.value[messageIndex].isLoading = false;
      messages.value[messageIndex].aiResponse = response.data?.message || response.data?.response || "No response received";
      messages.value[messageIndex].responseType = response.data?.type || null;
      messages.value[messageIndex].suggestedResponses = response.data?.suggestedResponses || [];
      messages.value[messageIndex].typeData = response.data?.typeData ?? null;
    }
    
    // Scroll when AI response updates
    scrollToBottom();
    
  } catch (error) {
    console.error("Error sending message:", error);
    
    const messageIndex = messages.value.length - 1;
    
    // Show error message
    if (messages.value[messageIndex]) {
      messages.value[messageIndex].isLoading = false;
      messages.value[messageIndex].aiResponse = "Sorry, I encountered an error. Please try again.";
    }
    
    // Scroll to show error
    scrollToBottom();
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
  () => messages.value.map(m => m.aiResponse || m.isLoading),
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
    
    console.log('Chat History API Response:', response.data);
    console.log('Response type:', typeof response.data);
    console.log('Is Array:', Array.isArray(response.data));
    console.log('Response.data keys:', Object.keys(response.data));
    console.log('Response.data.success:', response.data.success);
    console.log('Response.data.history:', response.data.history);
    console.log('Is history array:', Array.isArray(response.data.history));
    
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
  if (removeProductCreatedMenuDocClick) {
    document.removeEventListener("click", removeProductCreatedMenuDocClick, true);
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

button:hover .disconnect-icon-chat path {
  stroke: #e3665d;
  transition: stroke 0.2s ease-in-out;
}
</style>
