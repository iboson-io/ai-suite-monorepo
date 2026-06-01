<template>
  <section
    class="mt-8xl flex w-full flex-1 flex-col items-center justify-center rounded-2xl bg_secondary_color px-6xl py-10xl shadow-sm min-h-0"
  >
    <img
      :src="AutomationsEmptyIllustration"
      alt=""
      class="h-44 w-auto max-w-full object-contain md:h-52"
    />

    <div class="mt-6xl flex max-w-lg items-start justify-center gap-xl">
      <div class="text-center">
        <h2 class="heading_h6_bold primary_text_color">
          Start Your First Automation
        </h2>
        <p class="mt-md label_1_regular secondary_text_color">
          Begin your automation journey with smarter social media workflows.
        </p>
      </div>
    </div>

    <button
      type="button"
      class="primary_button mt-6xl px-8xl py-xl label_1_semibold"
      @click="showCreateModal = true"
    >
      Create automation
    </button>

    <CreateAutomationModal
      :open="showCreateModal"
      @close="showCreateModal = false"
      @generate="onGenerateAutomation"
    />
  </section>
</template>

<script setup>
import { ref } from "vue";
import AutomationsEmptyIllustration from "../../../assets/images/AutomationsEmptyIllustration.png";
import CreateAutomationModal from "./CreateAutomationModal.vue";

const emit = defineEmits(["generate"]);

const showCreateModal = ref(false);

function onGenerateAutomation(description) {
  showCreateModal.value = false;
  emit("generate", description);
}
</script>
