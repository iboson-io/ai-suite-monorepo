<template>
  <div class="flex min-h-0 flex-1 flex-col bg_primary_color px-3xl py-3xl md:px-10xl md:py-10xl">
    <template v-if="!builderPrompt">
      <AutomationsHeader class="shrink-0" />
      <AutomationsEmptyState class="min-h-0 flex-1" @generate="onGenerateAutomation" />
    </template>

    <template v-else>
      <header
        class="flex shrink-0 flex-wrap items-center gap-3xl rounded-2xl bg_secondary_color py-xl px-6xl"
      >
        <div class="flex min-w-0 flex-1 flex-wrap items-center gap-3xl">
          <AutomationBrandLogo />
          <input
            v-model="automationTitle"
            type="text"
            class="min-w-0 flex-1 rounded-lg border regular_border_color bg_secondary_color px-3xl py-xl label_1_medium primary_text_color outline-none focus:border-info-500 max-w-md"
          />
          <span
            class="shrink-0 rounded-md border border-warning-300 bg-warning-50 px-xl py-xs body_4_medium text-warning-500"
          >
            Draft
          </span>
        </div>

        <div class="flex w-full items-center justify-end gap-3xl sm:w-auto">
          <button
            type="button"
            class="inline-flex items-center justify-center gap-md rounded-lg px-6xl py-xl label_1_semibold disabled_primary_button"
            disabled
          >
            <img :src="GreenTickIcon" alt="" class="h-4 w-4" />
            Run Automation
          </button>
        </div>
      </header>

      <div
        class="mt-4xl flex min-h-0 flex-1 flex-col gap-4xl lg:flex-row lg:gap-5xl"
      >
        <AutomationBuilderWorkflow class="min-h-[320px] lg:min-h-0" />
        <AutomationBuilderChat :initial-prompt="builderPrompt" />
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref } from "vue";
import AutomationsHeader from "../components/Dashboard/Automations/AutomationsHeader.vue";
import AutomationsEmptyState from "../components/Dashboard/Automations/AutomationsEmptyState.vue";
import AutomationBrandLogo from "../components/Dashboard/Automations/AutomationBrandLogo.vue";
import AutomationBuilderWorkflow from "../components/Dashboard/Automations/AutomationBuilderWorkflow.vue";
import AutomationBuilderChat from "../components/Dashboard/Automations/AutomationBuilderChat.vue";
import GreenTickIcon from "../assets/images/GreenTickIcon.svg";

const builderPrompt = ref("");
const automationTitle = ref("");

function deriveTitle(prompt) {
  const text = prompt.trim();
  if (!text) return "New automation";
  if (text.length <= 42) return text;
  return `${text.slice(0, 42).trim()}…`;
}

function onGenerateAutomation(description) {
  builderPrompt.value = description;
  automationTitle.value = deriveTitle(description);
}

</script>
