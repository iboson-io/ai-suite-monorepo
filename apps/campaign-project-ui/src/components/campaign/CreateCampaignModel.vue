<template>
  <Teleport to="body">
    <div
      v-if="modelValue"
      class="fixed inset-0 z-[110] flex items-center justify-center p-4"
      role="presentation"
    >
      <div
        class="absolute inset-0 bg-black-800/45 backdrop-blur-[2px]"
        aria-hidden="true"
        @click="onBackdropClick"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-campaign-title"
        class="relative z-[1] flex w-full max-w-[min(96vw,840px)] flex-col overflow-hidden rounded-[1.5rem] bg_secondary_color shadow-2xl primary_border_color"
        @click.stop
      >
        <div class="shrink-0 px-6xl pb-4xl pt-6xl">
          <h2 id="create-campaign-title" class="heading_h6_semibold primary_text_color">
            Create a Campaign
          </h2>
          <p class="label_1_medium primary_text_color mt-md">
            Choose a channel and start building your campaign.
          </p>
        </div>
        <div class="h-px w-full shrink-0 bg-gray-25" />

        <div class="px-6xl py-5xl">
          <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <button
              v-for="opt in channelOptions"
              :key="opt.id"
              type="button"
              class="flex flex-col items-start rounded-xl p-6xl text-left transition-colors"
              :class="
                selectedId === opt.id
                  ? ' shadow-sm border border-gray-50'
                  : 'primary_border_color bg_secondary_color shadow-sm hover:border-info-100'
              "
              @click="selectedId = opt.id"
            >
              <div
                class="mb-4 flex shrink-0 items-center justify-center rounded-lg"
              >
                <img :src="opt.icon" alt="" class="h-10xl w-10xl object-contain" />
              </div>
              <h3 class="label_1_semibold primary_text_color">
                {{ opt.title }}
              </h3>
              <p class="mt-md body_3_regular leading-relaxed secondary_text_color">
                {{ opt.description }}
              </p>
            </button>
          </div>
        </div>

        <div class="h-px w-full shrink-0 bg-gray-25" />

        <div class="flex shrink-0 flex-wrap justify-end gap-md px-6xl py-4xl">
          <button
            type="button"
            :disabled="!canSubmit"
            class="inline-flex min-h-[2.75rem] min-w-[9rem] items-center justify-center rounded-lg px-5xl label_1_semibold transition-colors"
            :class="canSubmit ? 'primary_add_button py-lg' : 'modal_disabled_primary_button'"
            @click="onSubmit"
          >
            Create Campaign
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch, onUnmounted } from 'vue'
import RegularEmailIcon from '../../assets/images/RegularEmailIcon.svg'
import SmsLogo from '../../assets/images/SmsLogo.svg'
import MetaLeadAdsIcon from '../../assets/images/MetaLeadAdsIcon.svg'
import GoogleAdsIcon from '../../assets/images/GoogleAdsIcon.svg'
import SmsIcon from '../../assets/images/SmsIcon.svg'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'create', 'cancel'])

const channelOptions = [
  {
    id: 'email',
    title: 'Regular email',
    description: 'Create and send your campaign quickly using our email builder.',
    icon: RegularEmailIcon,
  },
  {
    id: 'sms',
    title: 'SMS',
    description: 'AI suggests days, times, and post ideas for your brand.',
    icon: SmsIcon,
  },
  {
    id: 'meta',
    title: 'Meta Ads',
    description: 'Connect and manage Facebook leads with Genius AI.',
    icon: MetaLeadAdsIcon,
  },
  {
    id: 'google',
    title: 'Google Lead Ads',
    description: 'Connect Google leads to Genius AI.',
    icon: GoogleAdsIcon,
  }
]

const selectedId = ref(null)

const canSubmit = computed(() => selectedId.value != null)

function close() {
  emit('update:modelValue', false)
}

function reset() {
  selectedId.value = null
}

function onBackdropClick() {
  close()
}

function onCancel() {
  emit('cancel')
  close()
}

function onSubmit() {
  if (!canSubmit.value) return
  emit('create', { channel: selectedId.value })
  close()
}

function onEscapeKey(e) {
  if (e.key === 'Escape' && props.modelValue) {
    close()
  }
}

watch(
  () => props.modelValue,
  (open) => {
    if (open) {
      reset()
      window.addEventListener('keydown', onEscapeKey)
    } else {
      window.removeEventListener('keydown', onEscapeKey)
    }
  }
)

onUnmounted(() => {
  window.removeEventListener('keydown', onEscapeKey)
})
</script>
