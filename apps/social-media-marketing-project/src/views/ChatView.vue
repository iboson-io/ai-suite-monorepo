<template>
  <div class="flex h-full min-h-0 flex-1 flex-col">
  <!-- Initial View (No Messages) -->
  <main
    v-if="!hasMessages"
    class="flex min-h-0 flex-1 items-center bg_primary_color px-6xl py-10xl"
  >
    <div class="mx-auto max-w-5xl text-center">
      <div
        class="mx-auto mb-6 h-20 w-20 rounded-full bg-gradient-to-tr from-pink-400 via-purple-400 to-indigo-400"
      ></div>

      <h4
        class="primary_text_color heading_h5_semibold md:heading_h4_semibold"
      >
        Good Afternoon, Cliff
      </h4>
      <span class="heading_h5_semibold md:heading_h3_semibold gradient_text_color">How can I help your brand today?</span>



      <div class="block md:hidden">
     <p class="lebel_2_semibold text-start primary_text_color mt-10xl md:mt-14xl ">
      Start with the example below
    </p>
    <div class="flex gap-md mb-[-2.5em] py-xxl overflow-auto hide-scrollbar">
      <button
        type="button"
        class="cursor-pointer px-xl py-xxl gap-xl items-center bg_secondary_color rounded-lg flex shrink-0 border border-transparent hover:border-black-25 transition-colors"
        @click="onFillPromptFromCard('Set Up My Brand')"
      >
        <img :src="HomeIcon" alt="" class="w-6 h-6" />
        <span class="label_2_semibold primary_text_color">Set Up Your Brand</span>
      </button>
      <button
        type="button"
        class="cursor-pointer px-xl py-xxl gap-xl items-center bg_secondary_color rounded-lg flex shrink-0 border border-transparent hover:border-black-25 transition-colors"
        @click="onFillPromptFromCard('Plan Weekly Posts')"
      >
        <img :src="DateIcon" alt="" class="w-6 h-6" />
        <span class="label_2_semibold primary_text_color">Plan Weekly Posts</span>
      </button>
      <button
        type="button"
        class="cursor-pointer px-xl py-xxl gap-xl items-center bg_secondary_color rounded-lg flex shrink-0 border border-transparent hover:border-black-25 transition-colors"
        @click="onFillPromptFromCard('Create Social Media Posts')"
      >
        <img :src="GalleryIcon" alt="" class="w-6 h-6" />
        <span class="label_2_semibold primary_text_color">Create Social Media Posts</span>
      </button>
   </div>
   </div>
 <div class="flex md:flex-col-reverse lg:flex-col">
      <PromptBox
        ref="promptBoxRef"
        @send-message="handleFirstMessage"
        :is-ai-generating="isLoading"
      />
      <Cards @fill-prompt="onFillPromptFromCard" />
  </div>     
          <p class="body_4_regular secondary_text_color  block lg:hidden absolute left-0 right-0 mt-5 md:mt-0 md:bottom-7xl">Genius AI can make mistakes. Please check for accuracy.</p>
    </div>
  </main>

  <!-- Chat Page (With Messages) -->
  <ChatPage 
    v-else 
    :initial-messages="messages" 
    :isSidebarCollapsed="isSidebarCollapsed" 
    :session-id="sessionId"
    :external-session-id="loadedSessionId"
    @update:session-id="sessionId = $event"
    @session-loaded="handleSessionLoaded"
    ref="chatPageRef" 
    class="flex min-h-0 flex-1 flex-col"
  />
  </div>
</template>

<script setup>
import { ref, watch } from "vue";
import { PromptBox, Cards } from "@ai-suite/shared-ui";
import ChatPage from "../components/Dashboard/Chat/ChatPage.vue";
import api from "../services/api.js";
import HomeIcon from "../assets/images/HomeIcon.svg"
import DateIcon from "../assets/images/DateIcon.svg"
import GalleryIcon from "../assets/images/GalleryIcon.svg"

const props = defineProps({
  resetChat: {
    type: Boolean,
    default: false
  },
  isSidebarCollapsed: {
    type: Boolean,
    default: false
  },
  sessionToLoad: {
    type: String,
    default: null
  },
  /** Set when a session is deleted from the sidebar (same id as API). */
  sessionRemovedFromList: {
    type: [String, Number],
    default: null
  }
});

const hasMessages = ref(false);
const messages = ref([]);
const chatPageRef = ref(null);
const promptBoxRef = ref(null);

const onFillPromptFromCard = (text) => {
  promptBoxRef.value?.setPrompt?.(text, { submit: true });
};
const sessionId = ref(null);
const isLoading = ref(false);
const loadedSessionId = ref(null);

const emit = defineEmits(['reset-complete', 'sessionLoaded', 'newSessionCreated']);

// Watch for resetChat prop changes
watch(() => props.resetChat, (newVal) => {
  if (newVal) {
    handleNewChat();
    // Reset the flag after handling
    emit('reset-complete');
  }
});

const handleFirstMessage = async (messageData) => {
  // Prevent multiple submissions while loading
  if (isLoading.value) return;
  
  isLoading.value = true;
  
  // Add the first message
  messages.value = [
    {
      text: messageData.text,
      product: messageData.product,
      model: messageData.model,
      files: messageData.files,
      isLoading: true,
      aiResponse: null
    }
  ];
  
  hasMessages.value = true;
  
  try {
    // Build FormData for API request
    const formData = new FormData();
    formData.append('message', messageData.text);
    formData.append('isHidden', 'false');
    
    // Only add sessionId if it exists (it shouldn't for first message)
    if (sessionId.value) {
      formData.append('sessionId', sessionId.value);
    }
    
    // Add optional fields if provided
    if (messageData.product && messageData.product !== 'All products') {
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
    
    // Extract sessionId from response and store it
    if (response.data && response.data.sessionId) {
      sessionId.value = response.data.sessionId;
      // Emit event that new session was created
      emit('newSessionCreated', response.data.sessionId);
    }
    
    // Update the message with AI response
    if (messages.value[0]) {
      messages.value[0].isLoading = false;
      messages.value[0].aiResponse = response.data?.message || response.data?.response || "No response received";
      messages.value[0].responseType = response.data?.type || null;
      messages.value[0].suggestedResponses = response.data?.suggestedResponses || [];
    }
    
  } catch (error) {
    console.error("Error sending first message:", error);
    
    // Show error message
    if (messages.value[0]) {
      messages.value[0].isLoading = false;
      messages.value[0].aiResponse = "Sorry, I encountered an error. Please try again.";
    }
  } finally {
    isLoading.value = false;
  }
};

const handleNewChat = () => {
  hasMessages.value = false;
  messages.value = [];
  sessionId.value = null;
  isLoading.value = false;
  loadedSessionId.value = null;
};

// Handle session loaded from ChatPage
const handleSessionLoaded = (loadedId) => {
  hasMessages.value = true;
  emit('sessionLoaded', loadedId);
};

// Watch for sessionToLoad prop changes (from sidebar click)
watch(() => props.sessionToLoad, (newSessionId) => {
  if (newSessionId) {
    loadedSessionId.value = newSessionId;
    // Immediately show ChatPage so it can fetch and display history
    hasMessages.value = true;
  }
}, { immediate: true });

watch(
  () => props.sessionRemovedFromList,
  (removedId) => {
    if (removedId == null || removedId === "") return;
    const r = String(removedId);
    if (
      (sessionId.value != null && String(sessionId.value) === r) ||
      (loadedSessionId.value != null && String(loadedSessionId.value) === r)
    ) {
      handleNewChat();
    }
  }
);
</script>

