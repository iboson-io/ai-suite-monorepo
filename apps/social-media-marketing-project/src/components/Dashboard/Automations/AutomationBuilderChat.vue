<template>
  <aside
    class="flex min-h-0 w-full shrink-0 flex-col overflow-hidden rounded-2xl bg_secondary_color shadow-sm lg:w-[min(100%,380px)]"
  >
    <header
      class="flex shrink-0 items-center justify-between gap-md px-6xl pt-5xl pb-lg"
    >
      <div class="flex min-w-0 items-center gap-md">
        <AutomationBrandLogo size="sm" />
        <h2 class="heading_h6_semibold primary_text_color truncate">
          Automation Builder
        </h2>
      </div>
    </header>

    <div
      ref="chatScrollRef"
      class="custom-scrollbar-calendar min-h-0 flex-1 overflow-y-auto px-5xl py-5xl"
    >
      <div class="flex flex-col gap-5xl">
        <template v-for="(message, index) in messages" :key="index">
          <div
            v-if="message.role === 'user'"
            class="rounded-xl border primary_border_color bg_secondary_color p-3xl"
          >
            <p class="body_2_regular primary_text_color whitespace-pre-wrap">
              {{ message.text }}
            </p>
          </div>

          <div
            v-else
            class="flex items-center gap-md"
          >
            <AutomationBrandLogo size="sm" class="mt-xs shrink-0" />
            <p class="label_3_regular primary_text_color whitespace-pre-wrap">
              {{ message.text }}
            </p>
          </div>
        </template>
      </div>
    </div>

    <div class="shrink-0 p-4xl">
      <div class="button-gradient">
        <div class="prompt-box-inner flex items-center gap-md rounded-xl bg_secondary_color px-4xl py-3xl">
          <input
            ref="promptInputRef"
            v-model="changePrompt"
            type="text"
            placeholder="Describe what you want to change..."
            class="min-w-0 flex-1 border-none bg-transparent outline-none body_2_medium placeholder:secondary_text_color py-3xl"
            :class="changePrompt ? 'primary_text_color' : 'secondary_text_color'"
            :disabled="isAwaitingReply"
            @keyup.enter="handleSend"
          />
          <button
            type="button"
            class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-black-400 primary_2_text_color disabled:opacity-50"
            :disabled="!changePrompt.trim() || isAwaitingReply"
            aria-label="Send"
            @click="handleSend"
          >
            <span class="block h-3 w-3 rounded-sm bg-white" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { nextTick, ref, watch } from "vue";
import AutomationBrandLogo from "./AutomationBrandLogo.vue";

const props = defineProps({
  initialPrompt: {
    type: String,
    required: true,
  },
});

const emit = defineEmits(["send-change"]);

const changePrompt = ref("");
const chatScrollRef = ref(null);
const promptInputRef = ref(null);
const isAwaitingReply = ref(false);

const messages = ref([]);

const ASSISTANT_REPLY = "Got it, give me a moment...";

function buildSeedMessages(prompt) {
  const text = prompt.trim();
  if (!text) return [];
  return [
    { role: "user", text },
    { role: "assistant", text: ASSISTANT_REPLY },
  ];
}

function scrollChatToBottom() {
  nextTick(() => {
    const el = chatScrollRef.value;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  });
}

function focusPromptInput() {
  nextTick(() => {
    promptInputRef.value?.focus();
  });
}

watch(
  () => props.initialPrompt,
  (prompt) => {
    messages.value = buildSeedMessages(prompt);
    isAwaitingReply.value = false;
    changePrompt.value = "";
    scrollChatToBottom();
    focusPromptInput();
  },
  { immediate: true }
);

async function handleSend() {
  const text = changePrompt.value.trim();
  if (!text || isAwaitingReply.value) return;

  messages.value.push({ role: "user", text });
  changePrompt.value = "";
  isAwaitingReply.value = true;
  scrollChatToBottom();

  emit("send-change", text);

  await new Promise((resolve) => setTimeout(resolve, 400));

  messages.value.push({ role: "assistant", text: ASSISTANT_REPLY });
  isAwaitingReply.value = false;
  scrollChatToBottom();
  focusPromptInput();
}
</script>
