<template>
  <section
    class="relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl bg_secondary_color shadow-sm"
  >
    <div
      class="pointer-events-none absolute inset-0 opacity-40"
      aria-hidden="true"
      style="
        background-image: radial-gradient(circle, #d1d5db 1px, transparent 1px);
        background-size: 18px 18px;
      "
    />
    
    <div
      ref="workflowScrollRef"
      class="custom-scrollbar-calendar relative min-h-0 flex-1 overflow-x-hidden overflow-y-auto p-6xl md:p-10xl"
    >
      <div class="mx-auto flex min-h-full w-full flex-col items-center justify-center py-4xl">
        <article
          class="flex w-[min(100%,280px)] items-center gap-4xl rounded-xl border-2 border-[#86EFAC] bg-[#F0FDF4] px-5xl py-4xl"
        >
          <div
            class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#DCFCE7]"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path
                d="M11.25 2.5L4.375 11.25H10L8.75 17.5L15.625 8.75H10L11.25 2.5Z"
                stroke="#16A34A"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </div>
          <div class="min-w-0 flex-1 space-y-md">
            <div class="h-2.5 w-full max-w-[140px] rounded-full bg-[#BBF7D0]" />
            <div class="h-2.5 w-3/4 max-w-[100px] rounded-full bg-[#DCFCE7]" />
          </div>
        </article>

        <div class="flex flex-col items-center py-md">
          <div class="h-6 w-px bg-gray-200" />
          <div
            class="mt-xs flex h-7 w-7 items-center justify-center rounded-full border primary_border_color bg_secondary_color text-gray-400 label_2_medium"
          >
            +
          </div>
          <div class="mt-xs h-6 w-px bg-gray-200" />
        </div>

        <article
          class="flex w-[min(100%,280px)] items-center gap-4xl rounded-xl border-2 border-[#93C5FD] bg-[#EFF6FF] px-5xl py-4xl"
        >
          <div
            class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#DBEAFE]"
          >
            <img :src="EmailIcon" alt="" class="h-5 w-5" />
          </div>
          <div class="min-w-0 flex-1 space-y-md">
            <div class="h-2.5 w-full max-w-[140px] rounded-full bg-[#BFDBFE]" />
            <div class="h-2.5 w-3/4 max-w-[100px] rounded-full bg-[#DBEAFE]" />
          </div>
        </article>

        <div class="flex flex-col items-center py-md">
          <div class="h-6 w-px bg-gray-200" />
          <div
            class="mt-xs flex h-7 w-7 items-center justify-center rounded-full border primary_border_color bg_secondary_color text-gray-400 label_2_medium"
          >
            +
          </div>
          <div class="mt-xs h-6 w-px bg-gray-200" />
        </div>

        <article
          class="flex w-[min(100%,280px)] items-center gap-4xl rounded-xl border-2 border-[#C4B5FD] bg-[#F5F3FF] px-5xl py-4xl"
        >
          <div
            class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#EDE9FE]"
          >
            <img :src="TimeIcon" alt="" class="h-5 w-5" />
          </div>
          <div class="min-w-0 flex-1 space-y-md">
            <div class="h-2.5 w-full max-w-[140px] rounded-full bg-[#DDD6FE]" />
            <div class="h-2.5 w-3/4 max-w-[100px] rounded-full bg-[#EDE9FE]" />
          </div>
        </article>
      </div>
    </div>
  </section>
</template>

<script setup>
import { nextTick, onMounted, ref } from "vue";
import EmailIcon from "../../../assets/images/Email.svg";
import TimeIcon from "../../../assets/images/TimeIcon.svg";

const workflowScrollRef = ref(null);

function scrollWorkflowToBottom() {
  nextTick(() => {
    const el = workflowScrollRef.value;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  });
}

onMounted(() => {
  scrollWorkflowToBottom();
});
</script>
