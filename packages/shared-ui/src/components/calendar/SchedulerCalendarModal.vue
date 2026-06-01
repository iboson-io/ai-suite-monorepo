<template>
  <!-- Backdrop -->
  <div
    v-if="open"
    class="fixed inset-0 z-[210] flex items-center justify-center lg:justify-end lg:mr-10"
    @click="$emit('close')"
  >
    <!-- Modal -->
    <div
      class="relative w-[92%] md:max-w-lg lg:max-w-lg mx-4 lg:mx-0 bg_secondary_color rounded-lg primary_border_color shadow-2xl"
      @click.stop
    >
      <div class="flex flex-row">
        <div class="px-xl pt-6xl pb-md w-2/3 md:px-5xl">
          <div class="flex items-center justify-between">
            <button @click="prevMonth" aria-label="Previous month">
              <img :src="ArrowLeftIcon" alt="Previous">
            </button>
            <h2 class="label_2_semibold md:label_1_medium primary_text_color text-center">{{ monthYearLabel }}</h2>
            <button @click="nextMonth" aria-label="Next month">
              <img :src="ArrowRightIcon" alt="Next">
            </button>
          </div>

          <div class="grid grid-cols-7 gap-1 mt-5xl">
            <div
              v-for="day in weekDays"
              :key="day"
              class="body_4_medium md:body_3_medium text-center secondary_text_color"
            >
              {{ day }}
            </div>
          </div>
          <div class="block h-[1px] w-full bg-black-25 mt-6xl"></div>

          <div class="grid grid-cols-7 gap-1 mt-6xl mb-xl">
            <div
              v-for="date in calendarDays"
              :key="date.key"
              @click="!date.isEmpty && date.isCurrentMonth && !date.isPast ? selectDate(date) : null"
              @mouseenter="!date.isEmpty && date.isCurrentMonth && !date.isPast ? hoveredDate = date.fullDate : null"
              @mouseleave="hoveredDate = null"
              class="aspect-square flex items-center justify-center rounded-md transition-colors body_3_medium md:label_2_medium h-8 w-8 md:h-10 md:w-10 mx-auto"
              :class="[
                date.isEmpty ? '' :
                date.isPast ? 'text-black-50 cursor-not-allowed' :
                date.isCurrentMonth ? 'primary_text_color cursor-pointer' : 'text-black-50 cursor-not-allowed',
                !date.isEmpty && date.isCurrentMonth && !date.isPast && isDateSelected(date.fullDate) ? 'bg-black-600 primary_2_text_color hover:bg-black-600' : '',
                !date.isEmpty && date.isCurrentMonth && !date.isPast && !isDateSelected(date.fullDate) && isDateHovered(date.fullDate) ? 'bg-gray-25' : '',
              ]"
            >
              {{ date.day }}
            </div>
          </div>
        </div>

        <div class="md:primary_border_color pl-0 pr-xl pt-6xl pb-md w-1/3 md:pr-5xl">
          <h3 class="label_3_semibold md:label_2_medium primary_text_color text-center">Choose Time</h3>

          <div class="max-h-[300px] md:max-h-[330px] lg:max-h-[280px] overflow-y-auto mt-5xl custom-scrollbar-calendar">
            <div
              v-for="time in timeSlots"
              :key="time.value"
              @click="!isTimePast(time.value) ? selectTime(time) : null"
              @mouseenter="!isTimePast(time.value) ? hoveredTime = time.value : null"
              @mouseleave="hoveredTime = null"
              class="py-xl px-2xl md:px-4xl mt-xs rounded-lg transition-colors body_4_medium md:body_3_medium text-center"
              :class="[
                isTimePast(time.value) ? 'disable_text_color cursor-not-allowed' : 'cursor-pointer',
                !isTimePast(time.value) && isTimeSelected(time.value) ? 'bg-black-600 primary_2_text_color' : '',
                !isTimePast(time.value) && !isTimeSelected(time.value) && isTimeHovered(time.value) ? 'bg-gray-25' : '',
                !isTimePast(time.value) && !isTimeSelected(time.value) && !isTimeHovered(time.value) ? 'primary_text_color ' : ''
              ]"
            >
              {{ time.label }}
            </div>
          </div>
        </div>
      </div>
      <div class="block h-[1px] w-full bg-gray-25"></div>

      <div class="p-5xl">
        <label class="label_2_medium primary_text_color">Time zone</label>
        <div class="relative mt-md">
          <div class="absolute left-3 top-1/2 -translate-y-1/2">
            <img :src="TimeZoneIcon" alt="" class="w-5 h-5">
          </div>
          <div class="w-full rounded-lg regular_border_color p-3xl pl-10 flex items-center justify-between cursor-default">
            <span class="label_2_medium secondary_text_color truncate">{{ timeZone }}</span>
            <img :src="DownArrow" alt="" class="w-4 h-4">
          </div>
        </div>
      </div>

      <div class="block h-[1px] w-full bg-gray-25"></div>

      <div class="flex items-center justify-end gap-xl px-5xl py-5xl">
        <button
          @click="handleClose"
          class="rounded-lg bg-gray-25 px-8xl py-xl label_1_semibold primary_text_color transition-colors hover:bg-black-25"
        >
          Close
        </button>
        <button
          @click="schedule"
          class="rounded-lg bg-black-600 primary_2_text_color label_1_medium px-8xl py-xl transition-colors hover:bg-black-800"
        >
          Schedule
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onUnmounted } from 'vue'
import ArrowLeftIcon from '../../assets/images/ArrowLeftIcon.svg'
import ArrowRightIcon from '../../assets/images/ArrowRightIcon.svg'
import TimeZoneIcon from '../../assets/images/TimeZoneIcon.svg'
import DownArrow from '../../assets/images/DownArrow.svg'

const props = defineProps({
  open: {
    type: Boolean,
    default: false,
  },
  initialDate: {
    type: Date,
    default: null,
  },
  initialTime: {
    type: String,
    default: null,
  },
})

const emit = defineEmits(['close', 'schedule'])

const currentDate = ref(props.initialDate ? new Date(props.initialDate) : new Date())
const selectedDate = ref(props.initialDate ? new Date(props.initialDate) : null)
const hoveredDate = ref(null)

const selectedTime = ref(props.initialTime || null)
const hoveredTime = ref(null)

const currentTime = ref(new Date())
let timeInterval = null

const timeZone = computed(() => {
  const timeString = currentTime.value.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
  return `India Standard Time (${timeString.toLowerCase()})`
})

const updateTime = () => {
  currentTime.value = new Date()
}

watch(() => props.open, (isOpen) => {
  if (isOpen) {
    currentTime.value = new Date()
    timeInterval = setInterval(updateTime, 1000)
  } else if (timeInterval) {
    clearInterval(timeInterval)
    timeInterval = null
  }
})

onUnmounted(() => {
  if (timeInterval) {
    clearInterval(timeInterval)
    timeInterval = null
  }
})

const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

const monthYearLabel = computed(() => {
  return currentDate.value.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  })
})

const calendarDays = computed(() => {
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth()
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const daysInMonth = lastDay.getDate()
  const days = []
  const firstDayOfWeek = firstDay.getDay()

  for (let i = 0; i < firstDayOfWeek; i++) {
    days.push({
      key: `empty-${i}`,
      day: '',
      isCurrentMonth: false,
      fullDate: null,
      isEmpty: true,
    })
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  for (let day = 1; day <= daysInMonth; day++) {
    const d = new Date(year, month, day)
    d.setHours(0, 0, 0, 0)
    const isPast = d < today

    days.push({
      key: day,
      day,
      isCurrentMonth: true,
      fullDate: new Date(d),
      isEmpty: false,
      isPast,
    })
  }

  const totalCells = days.length
  const remainingCells = 7 - (totalCells % 7)
  if (remainingCells < 7) {
    for (let i = 0; i < remainingCells; i++) {
      days.push({
        key: `empty-end-${i}`,
        day: '',
        isCurrentMonth: false,
        fullDate: null,
        isEmpty: true,
      })
    }
  }

  return days
})

const timeSlots = computed(() => {
  const slots = []
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const h = hour % 12 || 12
      const ampm = hour < 12 ? 'AM' : 'PM'
      const m = `:${String(minute).padStart(2, '0')}`
      slots.push({
        value: `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`,
        label: `${h}${m} ${ampm}`,
      })
    }
  }
  return slots
})

const isDateSelected = (date) => {
  if (!selectedDate.value) return false
  return (
    date.getDate() === selectedDate.value.getDate() &&
    date.getMonth() === selectedDate.value.getMonth() &&
    date.getFullYear() === selectedDate.value.getFullYear()
  )
}

const isDateHovered = (date) => {
  if (!hoveredDate.value) return false
  return (
    date.getDate() === hoveredDate.value.getDate() &&
    date.getMonth() === hoveredDate.value.getMonth() &&
    date.getFullYear() === hoveredDate.value.getFullYear()
  )
}

const isTimeSelected = (time) => selectedTime.value === time
const isTimeHovered = (time) => hoveredTime.value === time

const isToday = (date) => {
  if (!date) return false
  const today = new Date()
  const checkDate = new Date(date)
  return (
    checkDate.getDate() === today.getDate() &&
    checkDate.getMonth() === today.getMonth() &&
    checkDate.getFullYear() === today.getFullYear()
  )
}

const isTimePastForDate = (timeValue, date) => {
  if (!date) return false

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const checkDate = new Date(date)
  checkDate.setHours(0, 0, 0, 0)

  if (checkDate.getTime() !== today.getTime()) {
    return false
  }

  const [hours, minutes] = timeValue.split(':').map(Number)
  const timeDate = new Date()
  timeDate.setHours(hours, minutes, 0, 0)

  return timeDate < new Date()
}

const isTimePast = (timeValue) => isTimePastForDate(timeValue, selectedDate.value)

const selectDate = (date) => {
  if (date.isCurrentMonth && !date.isPast) {
    selectedDate.value = new Date(date.fullDate)
    if (isToday(date.fullDate) && selectedTime.value && isTimePast(selectedTime.value)) {
      selectedTime.value = null
    }
  }
}

const selectTime = (time) => {
  if (!isTimePast(time.value)) {
    selectedTime.value = time.value
  }
}

const prevMonth = () => {
  currentDate.value = new Date(
    currentDate.value.getFullYear(),
    currentDate.value.getMonth() - 1,
    1
  )
}

const nextMonth = () => {
  currentDate.value = new Date(
    currentDate.value.getFullYear(),
    currentDate.value.getMonth() + 1,
    1
  )
}

const handleClose = () => {
  emit('close')
}

const schedule = () => {
  if (selectedDate.value && selectedTime.value) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const selectedDateOnly = new Date(selectedDate.value)
    selectedDateOnly.setHours(0, 0, 0, 0)

    if (selectedDateOnly < today) return
    if (selectedDateOnly.getTime() === today.getTime() && isTimePast(selectedTime.value)) return

    emit('schedule', {
      date: selectedDate.value,
      time: selectedTime.value,
      timeZone: timeZone.value,
    })
    emit('close')
  } else {
    alert('Please select both date and time before scheduling.')
  }
}

watch(() => props.open, (isOpen) => {
  if (!isOpen) return

  if (props.initialDate) {
    const initialDate = new Date(props.initialDate)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const checkDate = new Date(initialDate)
    checkDate.setHours(0, 0, 0, 0)

    if (checkDate >= today) {
      currentDate.value = initialDate
      selectedDate.value = new Date(initialDate)
    } else {
      currentDate.value = new Date()
      selectedDate.value = new Date()
    }
  } else {
    currentDate.value = new Date()
    selectedDate.value = new Date()
  }

  if (props.initialTime && selectedDate.value) {
    selectedTime.value = isTimePastForDate(props.initialTime, selectedDate.value)
      ? null
      : props.initialTime
  } else {
    selectedTime.value = null
  }
})

watch(() => props.initialDate, (newDate) => {
  if (newDate && props.open) {
    currentDate.value = new Date(newDate)
    selectedDate.value = new Date(newDate)
  }
})

watch(() => props.initialTime, (newTime) => {
  if (newTime && props.open) {
    selectedTime.value = newTime
  }
})
</script>
