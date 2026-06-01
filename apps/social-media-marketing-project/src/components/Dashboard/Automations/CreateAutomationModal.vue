<template>
  <div
    v-if="open"
    class="fixed inset-0 z-[60] flex items-center justify-center bg_overlay backdrop-blur-sm px-3xl"
    @click="$emit('close')"
  >
    <div
      class="relative w-full max-w-xl rounded-2xl bg_secondary_color p-6xl shadow-2xl"
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-automation-title"
      @click.stop
    >
      <div class="flex items-start justify-between gap-4xl">
        <div class="min-w-0 pr-4xl">
          <h2
            id="create-automation-title"
            class="heading_h6_semibold primary_text_color"
          >
            Create automation
          </h2>
          <p class="mt-xl paragraph_p3_regular secondary_text_color">
            Ready to automate your social media workflow with AI?
          </p>
        </div>

        <div class="relative shrink-0">
          <button
            type="button"
            class="rounded-lg bg-gray-25 p-xl hover:bg-black-25"
            aria-label="Close"
            @click="$emit('close')"
          >
            <img :src="BlackCloseIcon" alt="" class="h-3 w-3" />
          </button>
        </div>
      </div>

      <div class="mt-5xl">
        <label
          for="automation-workflow-description"
          class="label_2_semibold primary_text_color"
        >
          Describe the workflow you want AI to automate
        </label>

        <div class="relative mt-md">
          <textarea
            id="automation-workflow-description"
            v-model="workflowDescription"
            rows="4"
            class="label_1_regular primary_text_color w-full resize-none rounded-lg border regular_border_color bg_secondary_color px-4xl py-3xl pr-12xl outline-none placeholder:secondary_text_color focus:border-info-500"
          />
          <img
            :src="AiIcon"
            alt=""
            class="pointer-events-none absolute bottom-3xl right-3xl h-[22px] w-[22px]"
            aria-hidden="true"
          />
        </div>
      </div>
        <div class="mt-xxl block h-[1px] w-full bg_primary_color"></div>
      <button
        type="button"
        class="mt-xxl w-full rounded-lg px-3xl py-md label_1_semibold primary_button disabled:disabled_primary_button"
        :disabled="!canGenerate"
        :aria-disabled="!canGenerate"
        @click="handleGenerate"
      >
        Generate automation
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from "vue";
import BlackCloseIcon from "../../../assets/images/BlackCloseIcon.svg";
import AiIcon from "../../../assets/images/AiIcon.svg";

const props = defineProps({
  open: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["close", "generate"]);

const workflowDescription = ref("");

const canGenerate = computed(
  () => workflowDescription.value.trim().length > 0
);

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      workflowDescription.value = "";
    }
  }
);

function handleGenerate() {
  if (!canGenerate.value) return;
  emit("generate", workflowDescription.value.trim());
}
</script>
