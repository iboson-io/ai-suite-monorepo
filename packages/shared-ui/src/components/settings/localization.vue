<template>
  <div class="rounded-2xl bg_secondary_color p-6xl shadow-sm h-[100%] data-privacy-full-height">
    <!-- Header -->
    <h2 class="heading_h6_semibold primary_text_color">Localization</h2>
    <p class="label_1_regular secondary_text_color mt-md">
      Set your preferred language, region, and time format.
    </p>

    <!-- Settings Fields -->
    <div class="mt-10xl">
      <!-- Interface Language -->
      <div class="">
        <label class="label_1_bold primary_text_color flex-shrink-0">
          Interface Language:
        </label>
        <div class="localization-select-wrap relative mt-md w-full md:w-[70%] lg:w-[60%]">
          <select
            v-model="localizationSettings.interfaceLanguage"
            class="localization-select w-full cursor-pointer appearance-none rounded-lg regular_border_color bg_secondary_color p-3xl pr-10xl label_2_medium primary_text_color focus-visible:outline-none focus-visible:ring-0"
          >
            <option 
              v-for="(code, language) in Languages" 
              :key="code" 
              :value="code"
            >
              {{ language }}
            </option>
          </select>
          <img
            :src="DownArrow"
            alt=""
            class="localization-select-chevron pointer-events-none absolute right-3xl top-1/2 h-5 w-5 -translate-y-1/2 shrink-0"
            aria-hidden="true"
          >
        </div>
      </div>

      <!-- Region -->
      <div class="mt-10xl">
        <label class="label_1_bold primary_text_color flex-shrink-0">
          Region:
        </label>
        <div class="localization-select-wrap relative mt-md w-full md:w-[70%] lg:w-[60%]">
          <select
            v-model="localizationSettings.region"
            class="localization-select w-full cursor-pointer appearance-none rounded-lg regular_border_color bg_secondary_color p-3xl pr-10xl label_2_medium primary_text_color focus-visible:outline-none focus-visible:ring-0"
          >
            <option 
              v-for="region in Regions" 
              :key="region.code" 
              :value="region.code"
            >
              {{ region.name }}
            </option>
          </select>
          <img
            :src="DownArrow"
            alt=""
            class="localization-select-chevron pointer-events-none absolute right-3xl top-1/2 h-5 w-5 -translate-y-1/2 shrink-0"
            aria-hidden="true"
          >
        </div>
      </div>

      <!-- Time Format -->
      <div class="mt-10xl">
        <label class="label_1_bold primary_text_color flex-shrink-0">
          Time Format:
        </label>
        <div class="localization-select-wrap relative mt-md w-full md:w-[70%] lg:w-[60%]">
          <select
            v-model="localizationSettings.timeFormat"
            class="localization-select w-full cursor-pointer appearance-none rounded-lg regular_border_color bg_secondary_color p-3xl pr-10xl label_2_medium primary_text_color focus-visible:outline-none focus-visible:ring-0"
          >
            <option value="24">24-hour</option>
            <option value="12">12-hour</option>
          </select>
          <img
            :src="DownArrow"
            alt=""
            class="localization-select-chevron pointer-events-none absolute right-3xl top-1/2 h-5 w-5 -translate-y-1/2 shrink-0"
            aria-hidden="true"
          >
        </div>
      </div>

      <!-- Timezone -->
      <div class="mt-10xl">
        <label class="label_1_bold primary_text_color flex-shrink-0">
          Timezone:
        </label>
        <div class="localization-select-wrap relative mt-md w-full md:w-[70%] lg:w-[60%]">
          <select
            v-model="localizationSettings.timezone"
            class="localization-select w-full cursor-pointer appearance-none rounded-lg regular_border_color bg_secondary_color p-3xl pr-10xl label_2_medium primary_text_color focus-visible:outline-none focus-visible:ring-0"
          >
            <option 
              v-for="timezone in Timezones" 
              :key="timezone.value" 
              :value="timezone.abbr"
            >
              {{ timezone.text }}
            </option>
          </select>
          <img
            :src="DownArrow"
            alt=""
            class="localization-select-chevron pointer-events-none absolute right-3xl top-1/2 h-5 w-5 -translate-y-1/2 shrink-0"
            aria-hidden="true"
          >
        </div>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="flex justify-center md:justify-end gap-4 md:gap-8 mt-10">
      <!-- <button
        @click="resetToDefault"
        class="p-md rounded-lg primary_border_color label_2_semibold md:px-xl md:py-md bg-gray-25 text_primary_color"
      >
        Reset to Default
      </button> -->
      <button
        @click="saveChanges"
        :disabled="!hasChanges || isSaving.value"
        class="p-md rounded-lg primary_button md:px-xl md:py-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
      >
        <span v-if="isSaving.value" class="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
        {{ isSaving.value ? 'Saving...' : 'Save Changes' }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.localization-select {
  position: relative;
}

.localization-select-chevron {
  z-index: 2;
}

.localization-select:focus {
  z-index: 10;
}
</style>

<script setup>
import { reactive, computed, onMounted } from 'vue';
import DownArrow from "../../assets/images/DownArrow.svg";
import { Languages, Regions, Timezones } from './Localization.js';
import api from '@app/services/api.js';

// Initial values (snapshot of original state)
const initialValues = {
  interfaceLanguage: 'en',
  region: 'IN',
  timeFormat: '24',
  timezone: 'IST',
};

// Fetch localization settings from API
const fetchLocalizationSettings = async () => {
  try {
    const response = await api.get('/api/settings/localization');
    if (response.data.status && response.data.data?.settings) {
      const { language, region, timeFormat, timezone } = response.data.data.settings;
      
      // Update initial values with API data
      initialValues.interfaceLanguage = language;
      initialValues.region = region;
      initialValues.timeFormat = timeFormat;
      initialValues.timezone = timezone;
      
      // Update current settings
      Object.assign(localizationSettings, {
        interfaceLanguage: language,
        region,
        timeFormat,
        timezone
      });
    }
  } catch (error) {
    console.error('Failed to fetch localization settings:', error);
  }
};

// Fetch data on component mount
onMounted(() => {
  fetchLocalizationSettings();
});

// Loading state for save button
const isSaving = reactive({ value: false });

// Localization settings state
const localizationSettings = reactive({
  interfaceLanguage: initialValues.interfaceLanguage,
  region: initialValues.region,
  timeFormat: initialValues.timeFormat,
  timezone: initialValues.timezone,
});

// Default values for reset functionality
const defaultValues = {
  interfaceLanguage: 'en',
  region: 'IN',
  timeFormat: '24',
  timezone: 'IST',
};

// Check if any changes have been made
const hasChanges = computed(() => {
  return (
    localizationSettings.interfaceLanguage !== initialValues.interfaceLanguage ||
    localizationSettings.region !== initialValues.region ||
    localizationSettings.timeFormat !== initialValues.timeFormat ||
    localizationSettings.timezone !== initialValues.timezone
  );
});

// const resetToDefault = () => {
//   Object.assign(localizationSettings, defaultValues);
//   // Update initial values to match default after reset
//   Object.assign(initialValues, defaultValues);
//   // Here you would typically make an API call to reset settings
// };

const saveChanges = async () => {
  isSaving.value = true;
  
  try {
    // Find timezone description from Timezones data
    const currentTimezone = Timezones.find(tz => tz.abbr === localizationSettings.timezone);
    const timezoneDescription = currentTimezone ? currentTimezone.text : '';
    
    const payload = {
      language: localizationSettings.interfaceLanguage,
      region: localizationSettings.region,
      time_format: localizationSettings.timeFormat,
      timezone: localizationSettings.timezone,
      timezoneDescription: timezoneDescription
    };
    
    const response = await api.put('/api/settings/localization', payload);
    
    if (response.data.status) {
      // Update initial values to match current values after successful save
      Object.assign(initialValues, { ...localizationSettings });
      console.log('Localization settings saved successfully:', response.data);
    }
  } catch (error) {
    console.error('Failed to save localization settings:', error);
  } finally {
    isSaving.value = false;
  }
};
</script>

