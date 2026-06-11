<template>
  <div
    class="flex items-center gap-sm mt-4xl"
    :class="{ 'px-3xl': padded }"
  >
    <div class="group/copy relative">
      <button
        type="button"
        class="flex items-center justify-center w-4xl h-4xl cursor-pointer action_icon_color"
        :aria-label="copyTitle"
        @click="$emit('copy')"
      >
        <svg
          class="w-4xl h-4xl"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M12 6V4.5C12 4.10218 11.842 3.72064 11.5607 3.43934C11.2794 3.15804 10.8978 3 10.5 3H4.5C4.10218 3 3.72064 3.15804 3.43934 3.43934C3.15804 3.72064 3 4.10218 3 4.5V10.5C3 10.8978 3.15804 11.2794 3.43934 11.5607C3.72064 11.842 4.10218 12 4.5 12H6M6 7.5C6 7.10218 6.15804 6.72064 6.43934 6.43934C6.72064 6.15804 7.10218 6 7.5 6H13.5C13.8978 6 14.2794 6.15804 14.5607 6.43934C14.842 6.72064 15 7.10218 15 7.5V13.5C15 13.8978 14.842 14.2794 14.5607 14.5607C14.2794 14.842 13.8978 15 13.5 15H7.5C7.10218 15 6.72064 14.842 6.43934 14.5607C6.15804 14.2794 6 13.8978 6 13.5V7.5Z"
            stroke="currentColor"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </button>
      <span
        role="tooltip"
        class="pointer-events-none absolute bottom-full left-1/2 z-10 mb-sm hidden -translate-x-1/2 whitespace-nowrap rounded-lg bg-black-400 px-md py-xs caption_1_medium primary_2_text_color shadow-md group-hover/copy:block"
      >
        {{ copyTitle }}
      </span>
    </div>

    <div class="group/like relative">
      <button
        type="button"
        class="flex items-center justify-center w-4xl h-4xl cursor-pointer"
        :class="isLiked ? 'liked_icon_color' : 'action_icon_color'"
        :aria-label="likeTitle"
        @click="$emit('like')"
      >
        <svg
          :class="compactIcons ? 'w-4xl h-4xl' : null"
          :width="compactIcons ? undefined : 60"
          :height="compactIcons ? undefined : 60"
          viewBox="0 0 18 18"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M5.25 8.25V14.25C5.25 14.4489 5.17098 14.6397 5.03033 14.7803C4.88968 14.921 4.69891 15 4.5 15H3C2.80109 15 2.61032 14.921 2.46967 14.7803C2.32902 14.6397 2.25 14.4489 2.25 14.25V9C2.25 8.80109 2.32902 8.61032 2.46967 8.46967C2.61032 8.32902 2.80109 8.25 3 8.25H5.25ZM5.25 8.25C6.04565 8.25 6.80871 7.93393 7.37132 7.37132C7.93393 6.80871 8.25 6.04565 8.25 5.25V4.5C8.25 4.10218 8.40804 3.72064 8.68934 3.43934C8.97064 3.15804 9.35218 3 9.75 3C10.1478 3 10.5294 3.15804 10.8107 3.43934C11.092 3.72064 11.25 4.10218 11.25 4.5V8.25H13.5C13.8978 8.25 14.2794 8.40804 14.5607 8.68934C14.842 8.97064 15 9.35218 15 9.75L14.25 13.5C14.1421 13.9601 13.9375 14.3552 13.667 14.6257C13.3964 14.8963 13.0746 15.0276 12.75 15H7.5C6.90326 15 6.33097 14.7629 5.90901 14.341C5.48705 13.919 5.25 13.3467 5.25 12.75"
            stroke="currentColor"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </button>
      <span
        role="tooltip"
        class="pointer-events-none absolute bottom-full left-1/2 z-10 mb-sm hidden -translate-x-1/2 whitespace-nowrap rounded-lg bg-black-400 px-md py-xs caption_1_medium primary_2_text_color shadow-md group-hover/like:block"
      >
        {{ likeTitle }}
      </span>
    </div>

    <div class="group/dislike relative">
      <button
        type="button"
        class="flex items-center justify-center w-4xl h-4xl cursor-pointer"
        :class="isDisliked ? 'disliked_icon_color' : 'action_icon_color'"
        :aria-label="dislikeTitle"
        @click="$emit('dislike')"
      >
        <svg
          :class="compactIcons ? 'w-4xl h-4xl' : null"
          :width="compactIcons ? undefined : 60"
          :height="compactIcons ? undefined : 60"
          viewBox="0 0 18 18"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M5.25 9.74971V3.74971C5.25 3.55079 5.17098 3.36003 5.03033 3.21938C4.88968 3.07872 4.69891 2.99971 4.5 2.99971H3C2.80109 2.99971 2.61032 3.07872 2.46967 3.21938C2.32902 3.36003 2.25 3.55079 2.25 3.74971V8.99971C2.25 9.19862 2.32902 9.38938 2.46967 9.53004C2.61032 9.67069 2.80109 9.74971 3 9.74971H5.25ZM5.25 9.74971C6.04565 9.74971 6.80871 10.0658 7.37132 10.6284C7.93393 11.191 8.25 11.9541 8.25 12.7497V13.4997C8.25 13.8975 8.40804 14.2791 8.68934 14.5604C8.97064 14.8417 9.35218 14.9997 9.75 14.9997C10.1478 14.9997 10.5294 14.8417 10.8107 14.5604C11.092 14.2791 11.25 13.8975 11.25 13.4997V9.74971H13.5C13.8978 9.74971 14.2794 9.59167 14.5607 9.31036C14.842 9.02906 15 8.64753 15 8.24971L14.25 4.49971C14.1421 4.0396 13.9375 3.64452 13.667 3.37398C13.3964 3.10344 13.0746 2.97209 12.75 2.99971H7.5C6.90326 2.99971 6.33097 3.23676 5.90901 3.65872C5.48705 4.08067 5.25 4.65297 5.25 5.24971"
            stroke="currentColor"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </button>
      <span
        role="tooltip"
        class="pointer-events-none absolute bottom-full left-1/2 z-10 mb-sm hidden -translate-x-1/2 whitespace-nowrap rounded-lg bg-black-400 px-md py-xs caption_1_medium primary_2_text_color shadow-md group-hover/dislike:block"
      >
        {{ dislikeTitle }}
      </span>
    </div>

    <div v-if="showRegenerate" class="group/regenerate relative">
      <button
        type="button"
        class="flex pt-1 items-center justify-center w-4xl h-4xl cursor-pointer action_icon_color"
        :aria-label="regenerateTitle"
        @click="$emit('regenerate')"
      >
        <svg
          class="w-4xl h-4xl"
          viewBox="0 0 18 18"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M12.5 5.73879C12.3166 4.41896 11.7043 3.19604 10.7575 2.25842C9.81066 1.32079 8.58182 0.720482 7.26025 0.549958C5.93869 0.379433 4.59772 0.648155 3.4439 1.31473C2.29009 1.9813 1.38744 3.00875 0.875 4.23879M0.5 1.23879V4.23879H3.5M0.5 7.23878C0.683419 8.55862 1.2957 9.78154 2.24252 10.7192C3.18934 11.6568 4.41818 12.2571 5.73975 12.4276C7.06131 12.5981 8.40228 12.3294 9.5561 11.6629C10.7099 10.9963 11.6126 9.96883 12.125 8.73878M12.5 11.7388V8.73878H9.5"
            stroke="currentColor"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </button>
      <span
        role="tooltip"
        class="pointer-events-none absolute bottom-full pt-2 left-1/2 z-10 mb-sm hidden -translate-x-1/2 whitespace-nowrap rounded-lg bg-black-400 px-md py-xs caption_1_medium primary_2_text_color shadow-md group-hover/regenerate:block"
      >
        {{ regenerateTitle }}
      </span>
    </div>
  </div>
</template>

<script setup>
defineProps({
  isLiked: {
    type: Boolean,
    default: false,
  },
  isDisliked: {
    type: Boolean,
    default: false,
  },
  padded: {
    type: Boolean,
    default: true,
  },
  compactIcons: {
    type: Boolean,
    default: false,
  },
  showRegenerate: {
    type: Boolean,
    default: false,
  },
  copyTitle: {
    type: String,
    default: 'Copy',
  },
  likeTitle: {
    type: String,
    default: 'Like',
  },
  dislikeTitle: {
    type: String,
    default: 'Dislike',
  },
  regenerateTitle: {
    type: String,
    default: 'Regenerate',
  },
})

defineEmits(['copy', 'like', 'dislike', 'regenerate'])
</script>
