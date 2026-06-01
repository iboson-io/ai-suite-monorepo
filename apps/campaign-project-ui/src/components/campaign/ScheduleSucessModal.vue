<template>
  <div
    class="schedule-success relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border primary_border_color bg_secondary_color shadow-sm"
  >
    <div
      class="schedule-success__content relative z-10 flex min-h-0 flex-1 flex-col items-center justify-center px-5 py-10 text-center md:px-8 md:py-12"
    >
      <img
        :src="ContactAdience"
        alt=""
        class="schedule-success__hero h-auto max-h-[min(40vh,280px)] w-full max-w-md object-contain"
        width="400"
        height="280"
      />
      <h2
        class="schedule-success__title mt-6xl heading_h5_bold primary_text_color md:mt-8xl"
      >
        Your campaign is scheduled
      </h2>
      <p class="mt-3xl max-w-lg label_2_medium leading-relaxed secondary_text_color md:mt-4">
        {{ datetimeLine }}
      </p>
      <span
        class="mt-3xl inline-flex shrink-0 rounded-full border border-blue-200 bg-blue-25 px-4 py-1.5 label_2_medium text-blue-600 md:mt-6"
      >
        {{ sendTypeLabel }}
      </span>
    </div>
  </div>
</template>

<script setup>
import { onMounted, nextTick } from 'vue'
import confetti from 'canvas-confetti'
import ContactAdience from '../../assets/images/ContactAdience.svg'

defineProps({
  datetimeLine: { type: String, default: '' },
  sendTypeLabel: { type: String, default: 'Fixed send time' },
})

function runScheduleConfetti() {
  confetti({
    particleCount: 100,
    spread: 70,
    angle: 90,
    origin: {
      x: 0.55,
      y: 1,
    },
  })
}

onMounted(() => {
  void nextTick(() => {
    requestAnimationFrame(() => {
      runScheduleConfetti()
    })
  })
})
</script>

<style scoped>
.schedule-success__hero {
  animation: schedule-success-hero-in 0.65s cubic-bezier(0.22, 1, 0.36, 1) both;
}

.schedule-success__title {
  animation: schedule-success-fade-up 0.55s ease 0.12s both;
}

.schedule-success__content > p {
  animation: schedule-success-fade-up 0.55s ease 0.22s both;
}

.schedule-success__content > span {
  animation: schedule-success-fade-up 0.55s ease 0.32s both;
}

@keyframes schedule-success-hero-in {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.96);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes schedule-success-fade-up {
  from {
    opacity: 0;
    transform: translateY(14px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
