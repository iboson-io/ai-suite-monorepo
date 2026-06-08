<template>
  <div
    class="mx-auto max-w-3xl"
    :class="embedded ? 'block w-full' : 'hidden md:inline'"
  >
    <p
      v-if="sectionHeading"
      class="text-left label_2_semibold text_primary_color"
      :class="embedded ? 'mt-0' : 'mt-9xl'"
    >
      {{ sectionHeading }}
    </p>

    <section :class="embedded ? 'mt-md max-w-none' : 'mt-xl max-w-3xl'">
      <div
        class="grid grid-cols-1 gap-5xl"
        :class="columns === 2 ? 'sm:grid-cols-2' : 'md:grid-cols-3'"
      >
        <div
          v-for="(card, index) in resolvedCards"
          :key="card.prompt ?? card.title ?? index"
          :role="isInteractive(card) ? 'button' : undefined"
          :tabindex="isInteractive(card) ? 0 : undefined"
          class="p-5xl rounded-lg border primary_border_color bg_secondary_color hover:border-black-25 text-left transition-colors"
          :class="isInteractive(card) ? 'cursor-pointer' : ''"
          @click="handleCardClick(card)"
          @keydown.enter.prevent="handleCardClick(card)"
          @keydown.space.prevent="handleCardClick(card)"
        >
          <div v-if="card.icon">
            <img :src="card.icon" class="icon" alt="">
          </div>
          <div class="flex text-start flex-col mt-5xl">
            <h3 class="label_1_semibold primary_text_color">{{ card.title }}</h3>
            <p v-if="card.description" class="body_3_regular secondary_text_color mt-md">
              {{ card.description }}
            </p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { getStarterCards } from '@app/services/chat/starterCards.js'

const props = defineProps({
  heading: {
    type: String,
    default: '',
  },
  cards: {
    type: Array,
    default: null,
  },
  embedded: {
    type: Boolean,
    default: false,
  },
  columns: {
    type: Number,
    default: 3,
    validator: (value) => value === 2 || value === 3,
  },
})

const emit = defineEmits(['fill-prompt'])

const starterData = getStarterCards()

const sectionHeading = computed(() => props.heading || starterData.heading || '')

const resolvedCards = computed(() => {
  if (Array.isArray(props.cards) && props.cards.length > 0) {
    return props.cards
  }
  return starterData.cards ?? []
})

const isInteractive = (card) => Boolean(card?.prompt)

const handleCardClick = (card) => {
  if (!card?.prompt) return
  emit('fill-prompt', card.prompt)
}
</script>
