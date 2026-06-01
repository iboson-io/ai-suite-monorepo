<template>
  <!-- Backdrop -->
  <div
    v-if="open"
    class="fixed inset-0 z-[60] flex items-center justify-center"
    @click="$emit('close')"
  >
    <!-- Modal -->
    <div
      class="relative w-[92%] md:max-w-md mx-4 bg_secondary_color rounded-lg primary_border_color shadow-2xl"
      @click.stop
    >
      <!-- Date Picker -->
      <div class="px-5xl pt-6xl pb-md">
        <!-- Header -->
        <div class="flex items-center justify-between">
          <button
            @click="prevMonth"
            aria-label="Previous month"
          >
            <img :src="ArrowLeftIcon" alt="Previous" >
          </button>
          <h2 class="label_1_medium primary_text_color">{{ monthYearLabel }}</h2>
          <button
            @click="nextMonth"
            aria-label="Next month"
          >
            <img :src="ArrowRightIcon" alt="Next" >
          </button>
        </div>
         
        <!-- Week Days Header -->
        <div class="grid grid-cols-7 gap-1 mt-5xl">
          <div
            v-for="day in weekDays"
            :key="day"
            class="body_3_medium text-center"
          >
            {{ day }}
          </div>
        </div>
        
        <div class="block h-[1px] w-full bg-black-25 mt-6xl"></div>
        
        <!-- Calendar Grid -->
        <div class="grid grid-cols-7 gap-1 mt-6xl">
          <div
            v-for="date in calendarDays"
            :key="date.key"
            @click="!date.isEmpty && date.isCurrentMonth ? selectDate(date) : null"
            @mouseenter="!date.isEmpty && date.isCurrentMonth ? hoveredDate = date.fullDate : null"
            @mouseleave="hoveredDate = null"
            class="aspect-square flex items-center justify-center rounded-md transition-colors label_2_medium "
            :class="[
              date.isEmpty ? '' : 
              date.isCurrentMonth ? 'primary_text_color cursor-pointer' : 'text-black-50 cursor-not-allowed',
              !date.isEmpty && date.isCurrentMonth && isDateSelected(date.fullDate) ? 'bg-black-600 primary_2_text_color hover:bg-black-600' : '',
              !date.isEmpty && date.isCurrentMonth && !isDateSelected(date.fullDate) && isDateHovered(date.fullDate) ? 'bg-gray-25' : '',
            ]"
          >
            {{ date.day }}
          </div>
        </div>
      </div>

      <!-- Date Range Selection -->
      <div class="px-5xl py-4xl border-t primary_border_color">
        <div class="space-y-3xl">
          <div>
            <label class="label_2_medium primary_text_color block mb-md">Start Date</label>
            <div class="relative">
              <div class="absolute left-3 top-1/2 -translate-y-1/2">
                <img :src="CalendarIcon" alt="Calendar" class="w-4 h-4">
              </div>
              <input
                :value="formatDate(startDate)"
                type="text"
                class="w-full rounded-lg regular_border_color p-3xl pl-10 label_2_medium primary_text_color bg_secondary_color"
                placeholder="Select start date"
                readonly
              />
            </div>
          </div>
          
          <div>
            <label class="label_2_medium primary_text_color block mb-md">End Date</label>
            <div class="relative">
              <div class="absolute left-3 top-1/2 -translate-y-1/2">
                <img :src="CalendarIcon" alt="Calendar" class="w-4 h-4">
              </div>
              <input
                :value="formatDate(endDate)"
                type="text"
                class="w-full rounded-lg regular_border_color p-3xl pl-10 label_2_medium primary_text_color bg_secondary_color"
                placeholder="Select end date"
                readonly
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex items-center justify-end gap-xl px-5xl py-5xl">
        <button
          @click="clearSelection"
          class="rounded-lg bg-gray-25 p-xl label_1_semibold primary_text_color w-24"
        >
          Clear
        </button>
        <button
          @click="applyDateRange"
          :disabled="!startDate || !endDate"
          class="rounded-lg bg-black-400 hover:bg-black-700 disabled:opacity-50 disabled:cursor-not-allowed primary_2_text_color label_1_semibold p-xl w-24"
        >
          Apply
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import ArrowLeftIcon from "../../../assets/images/ArrowLeftIcon.svg";
import ArrowRightIcon from "../../../assets/images/ArrowRightIcon.svg";
import CalendarIcon from "../../../assets/images/CalendarIcon.svg";

const props = defineProps({
  open: {
    type: Boolean,
    default: false,
  },
  initialStartDate: {
    type: Date,
    default: null,
  },
  initialEndDate: {
    type: Date,
    default: null,
  },
});

const emit = defineEmits(['close', 'apply']);

// Calendar state
const currentDate = ref(new Date());
const startDate = ref(props.initialStartDate);
const endDate = ref(props.initialEndDate);
const hoveredDate = ref(null);
const isSelectingStartDate = ref(true); // Toggle between selecting start and end date

// Week days (Sunday first)
const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

// Month/Year label
const monthYearLabel = computed(() => {
  return currentDate.value.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
});

// Calendar days
const calendarDays = computed(() => {
  const year = currentDate.value.getFullYear();
  const month = currentDate.value.getMonth();

  // Get first and last day of the month
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();

  const days = [];
  
  // Get the day of week for the first day (0 = Sunday, 1 = Monday, etc.)
  const firstDayOfWeek = firstDay.getDay();
  
  // Add empty cells for days before the first day of the month
  for (let i = 0; i < firstDayOfWeek; i++) {
    days.push({
      key: `empty-${i}`,
      day: '',
      isCurrentMonth: false,
      fullDate: null,
      isEmpty: true,
    });
  }

  // Add all days of the current month
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Reset time to compare dates only
  
  for (let day = 1; day <= daysInMonth; day++) {
    const d = new Date(year, month, day);
    d.setHours(0, 0, 0, 0);
    const isPast = d < today;
    
    days.push({
      key: day,
      day: day,
      isCurrentMonth: true,
      fullDate: new Date(d),
      isEmpty: false,
      isPast: isPast,
    });
  }

  // Calculate remaining cells to fill the grid (7 columns)
  const totalCells = days.length;
  const remainingCells = 7 - (totalCells % 7);
  if (remainingCells < 7) {
    for (let i = 0; i < remainingCells; i++) {
      days.push({
        key: `empty-end-${i}`,
        day: '',
        isCurrentMonth: false,
        fullDate: null,
        isEmpty: true,
      });
    }
  }

  return days;
});

// Check if date is selected (either start or end date)
const isDateSelected = (date) => {
  if (!startDate.value && !endDate.value) return false;
  
  const checkDate = new Date(date);
  checkDate.setHours(0, 0, 0, 0);
  
  if (startDate.value) {
    const start = new Date(startDate.value);
    start.setHours(0, 0, 0, 0);
    if (checkDate.getTime() === start.getTime()) return true;
  }
  
  if (endDate.value) {
    const end = new Date(endDate.value);
    end.setHours(0, 0, 0, 0);
    if (checkDate.getTime() === end.getTime()) return true;
  }
  
  return false;
};

// Check if date is hovered
const isDateHovered = (date) => {
  if (!hoveredDate.value) return false;
  return (
    date.getDate() === hoveredDate.value.getDate() &&
    date.getMonth() === hoveredDate.value.getMonth() &&
    date.getFullYear() === hoveredDate.value.getFullYear()
  );
};

// Select date
const selectDate = (date) => {
  if (date.isCurrentMonth) {
    const selectedDate = new Date(date.fullDate);
    
    if (isSelectingStartDate.value || !startDate.value) {
      startDate.value = selectedDate;
      isSelectingStartDate.value = false;
    } else {
      // Ensure end date is after start date
      if (selectedDate >= startDate.value) {
        endDate.value = selectedDate;
      } else {
        // If end date is before start date, swap them
        endDate.value = startDate.value;
        startDate.value = selectedDate;
      }
      isSelectingStartDate.value = true;
    }
  }
};

// Format date for display
const formatDate = (date) => {
  if (!date) return '';
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

// Month navigation
const prevMonth = () => {
  currentDate.value = new Date(
    currentDate.value.getFullYear(),
    currentDate.value.getMonth() - 1,
    1
  );
};

const nextMonth = () => {
  currentDate.value = new Date(
    currentDate.value.getFullYear(),
    currentDate.value.getMonth() + 1,
    1
  );
};

// Clear selection
const clearSelection = () => {
  startDate.value = null;
  endDate.value = null;
  isSelectingStartDate.value = true;
};

// Apply date range
const applyDateRange = () => {
  if (startDate.value && endDate.value) {
    emit('apply', {
      startDate: startDate.value,
      endDate: endDate.value
    });
    emit('close');
  }
};

// Watch for modal open/close to reset state
watch(() => props.open, (isOpen) => {
  if (!isOpen) {
    isSelectingStartDate.value = true;
  }
});
</script>
