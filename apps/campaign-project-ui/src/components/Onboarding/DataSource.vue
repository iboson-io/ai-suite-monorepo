<template>
  <div class="bg_secondary_color rounded-2xl p-6xl primary_border_color h-[100%]">
    <!-- Header Section -->
    <div class="mb-6xl">
      <h2 class="heading_h6_bold primary_text_color mb-md">
        Let's bring your data with you
      </h2>
      <p class="label_1_regular secondary_text_color">
        Tell us where you're coming from so we can migrate your data automatically.
      </p>
    </div>

    <!-- Data Source Options Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4xl">
      <!-- Option 1: Nothing, I'm new to this (Selected) -->
      <div 
        class="p-5xl rounded-lg cursor-pointer transition-all relative"
        :class="selectedOption === 'new' ? 'bg_primary_color gradient-border' : 'bg_secondary_color border-2 border-gray-200 hover:border-gray-300'"
        @click="selectOption('new')"
      >
        <div class="relative z-10">
          <span class="label_1_regular primary_text_color">Nothing, I'm new to this</span>
        </div>
      </div>

      <!-- Option 2: Klaviyo -->
      <div 
        class="p-5xl rounded-lg cursor-pointer transition-all relative"
        :class="selectedOption === 'klaviyo' ? 'bg_primary_color gradient-border' : 'bg_secondary_color border-2 border-gray-200 hover:border-gray-300'"
        @click="selectOption('klaviyo')"
      >
        <div class="relative z-10">
          <span class="label_1_regular primary_text_color">Klaviyo</span>
        </div>
      </div>

      <!-- Option 3: ActiveCampaign -->
      <div 
        class="p-5xl rounded-lg cursor-pointer transition-all relative"
        :class="selectedOption === 'activecampaign' ? 'bg_primary_color gradient-border' : 'bg_secondary_color border-2 border-gray-200 hover:border-gray-300'"
        @click="selectOption('activecampaign')"
      >
        <div class="relative z-10">
          <span class="label_1_regular primary_text_color">ActiveCampaign</span>
        </div>
      </div>

      <!-- Option 4: Hubspot -->
      <div 
        class="p-5xl rounded-lg cursor-pointer transition-all relative"
        :class="selectedOption === 'hubspot' ? 'bg_primary_color gradient-border' : 'bg_secondary_color border-2 border-gray-200 hover:border-gray-300'"
        @click="selectOption('hubspot')"
      >
        <div class="relative z-10">
          <span class="label_1_regular primary_text_color">Hubspot</span>
        </div>
      </div>

      <!-- Option 5: Attentive -->
      <div 
        class="p-5xl rounded-lg cursor-pointer transition-all relative"
        :class="selectedOption === 'attentive' ? 'bg_primary_color gradient-border' : 'bg_secondary_color border-2 border-gray-200 hover:border-gray-300'"
        @click="selectOption('attentive')"
      >
        <div class="relative z-10">
          <span class="label_1_regular primary_text_color">Attentive</span>
        </div>
      </div>

      <!-- Option 6: Flodesk -->
      <div 
        class="p-5xl rounded-lg cursor-pointer transition-all relative"
        :class="selectedOption === 'flodesk' ? 'bg_primary_color gradient-border' : 'bg_secondary_color border-2 border-gray-200 hover:border-gray-300'"
        @click="selectOption('flodesk')"
      >
        <div class="relative z-10">
          <span class="label_1_regular primary_text_color">Flodesk</span>
        </div>
      </div>

      <!-- Option 7: Gmail, Outlook, or Direct Messaging -->
      <div 
        class="p-5xl rounded-lg cursor-pointer transition-all relative"
        :class="selectedOption === 'email' ? 'bg_primary_color gradient-border' : 'bg_secondary_color border-2 border-gray-200 hover:border-gray-300'"
        @click="selectOption('email')"
      >
        <div class="relative z-10">
          <span class="label_1_regular primary_text_color">Gmail, Outlook, or Direct Messaging</span>
        </div>
      </div>

      <!-- Option 8: Other -->
      <div 
        class="p-5xl rounded-lg cursor-pointer transition-all relative"
        :class="selectedOption === 'other' ? 'bg_primary_color gradient-border' : 'bg_secondary_color border-2 border-gray-200 hover:border-gray-300'"
        @click="selectOption('other')"
      >
        <div class="relative z-10">
          <span class="label_1_regular primary_text_color">Other</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';

const selectedOption = ref('new'); // Default to "Nothing, I'm new to this"

const selectOption = (option) => {
  selectedOption.value = option;
};

// Emit validation change to parent
const emit = defineEmits(['validation-change']);

watch(selectedOption, () => {
  emit('validation-change', {
    isValid: true, // Always valid since an option is always selected
    selectedOption: selectedOption.value
  });
}, { immediate: true });
</script>

<style scoped>
/* Custom styles for hover effects */
.border-gray-200 {
  border-color: #e5e7eb;
}

.border-gray-300 {
  border-color: #d1d5db;
}

.hover\:border-gray-300:hover {
  border-color: #d1d5db;
}

/* Gradient border for selected option */
.gradient-border::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 0.5rem;
  padding: 2px;
  background: linear-gradient(131.96deg, #FAB000 -3.18%, #9966FF 12.33%, #0073E6 85.54%, #15BE53 103.49%);
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  pointer-events: none;
  z-index: 0;
}

/* Transition for smooth hover effects */
.transition-all {
  transition: all 0.2s ease-in-out;
}
</style>