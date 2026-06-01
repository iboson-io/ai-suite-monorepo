<template>
  <!-- Backdrop -->
  <div
    v-if="open"
    class="fixed inset-0 z-50 bg_overlay"
    @click="$emit('close')"
  >
    <!-- Modal - Positioned on the right -->
    <div
      class="fixed right-0 bottom-0 w-full top-0 hide-scrollbar md:max-w-lg  max-h-screen overflow-y-auto bg_secondary_color shadow-2xl"
      @click.stop
    >
      <!-- Header -->
      <div class="sticky top-0 bg_primary_color  px-6xl py-6xl flex  z-10">
        <h2 class="heading_h6_semibold primary_text_color">View post</h2>
        <button
          @click="$emit('close')"
          class="absolute right-6 primary_text_color leading-none p-xl bg-gray-25 rounded-lg"
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M9 1L1 9M1 1L9 9" stroke="#28293D" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>

        </button>
      </div>

      <!-- Content -->
      <div class="pb-6xl px-6xl bg_primary_color">
        <!-- Performance Banner -->
        <div 
          class="rounded-2xl p-[1px]"
          style="background: linear-gradient(124.88deg, #9966FF 18.51%, #0073E6 38.28%, #FAB000 57.61%, #15BE53 76.05%);"
        >
          <div class="bg_secondary_color rounded-2xl px-xl py-3xl flex items-center justify-center">
            <img :src="LogoImage" alt="" class="h-7 ">
            <span class="label_2_semibold primary_text_color">
              This post performed 38% better than your average image post.
            </span>
          </div>
        </div>
      <div class="bg_secondary_color p-5xl rounded-2xl mt-6xl">
        <!-- Status and Post Type -->
        <div class="flex justify-between gap-3xl justify-center">
          <span
            class="rounded-lg px-md py-xxl label_2_semibold flex items-center gap-xs w-36 md:min-w-56"
            :class="statusClass(postData?.status)"
          >
            <img :src="PublishIcon" alt="">
            {{ postData?.status || 'Published' }}
          </span>
          <div class="relative platform-dropdown-container">
            <button
              @click.stop="togglePlatformDropdown"
              class="flex items-center gap-6xl md:gap-md px-md py-xxl label_2_semibold primary_text_color primary_border_color rounded-lg"
            >
              <img :src="PostFilter" alt="">
              <span class="hidden md:block">{{ getPostType() }}</span>
              <img :src="DownArrow" alt="" class="h-4 w-4" />
            </button>
            
            <!-- Platform Dropdown -->
            <div
              v-if="showPlatformDropdown"
              class="absolute right-0 md:left-0 top-8 z-50 min-w-[180px] rounded-lg bg_secondary_color shadow-lg primary_border_color py-md"
            >
              <div
                v-for="platform in availablePlatforms"
                :key="platform"
                @click.stop="selectPlatform(platform)"
                class="px-3xl py-xl hover:bg-gray-25 cursor-pointer body_3_medium"
                :class="selectedPlatform === platform ? 'body_3_medium' : ''"
              >
                {{ platform }} post (4:5)
              </div>
            </div>
          </div>
        </div>

        <!-- Post Image -->
        <div class="rounded-lg overflow-hidden bg_secondary_color flex justify-center mt-lg">
          <img
            :src="postData?.image"
            :alt="postData?.title"
            class="w-[30em] object-cover"
          />
        </div>

        <!-- Caption -->
        <div class="mt-xl">
          <p class="body_1_regular primary_text_color mt-xl" v-html="getFullCaption()">
          </p>
        </div>
         <div class="block h-[1px] w-full bg-gray-25 mt-5xl"></div>
        <!-- Date/Time -->
         <p class="label_2_semibold secondary_text_color mt-5xl">Date/Time</p>
        <div class="body_1_regular primary_text_color mt-xxs">
          {{ formatDateTime() }}
        </div>
      </div>
        <!-- Metrics Grid -->
        <div class=" flex flex-col justify-center items-center md:grid md:grid-cols-2 lg:grid grid-cols-1 gap-5xl lg:grid-cols-2 mt-6xl">

        <AnalyticsStatCard
          v-for="(stat, index) in stats"
          :key="index"
          v-bind="stat"
        />
        </div>

        <!-- Repost Button -->
        <button
          @click="handleRepost"
          class="w-full primary_button label_1_semibold flex items-center justify-center gap-md  rounded-lg mt-5xl"
        >
          <img :src="RepostBottonIcon" alt="">
          Repost
        </button>
      </div>
    </div>
  </div>

  <!-- Post Scheduled Modal -->
  <PostScheduledModal
    :open="showScheduledModal"
    :scheduledDate="scheduledDate"
    @close="closeScheduledModal"
    @viewCalendar="handleViewCalendar"
  />
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import PostScheduledModal from './PostScheduledModal.vue';
import AnalyticsStatCard from "./AnalyticsCard.vue"
import LogoImage from '../../../assets/images/LogoImage.png';
import PublishIcon from '../../../assets/images/PublishIcon.svg';
import DownArrow from '../../../assets/images/DownArrow.svg';
import PostFilter from '../../../assets/images/PostFilter.svg';
import TotalReach from '../../../assets/images/TotalReach.svg';
import MessageIcon from '../../../assets/images/MessageIcon.svg';
import LikeIcon from '../../../assets/images/LikeIcon.svg';
import CommentIcon from '../../../assets/images/CommentIcon.svg';
import RepostBottonIcon from "../../../assets/images/RepostBottonIcon.svg";


const props = defineProps({
  open: Boolean,
  postData: Object,
});

const emit = defineEmits(['close', 'repost', 'viewCalendar']);

const showScheduledModal = ref(false);
const showPlatformDropdown = ref(false);
const selectedPlatform = ref(null);

const statusClass = (status) => {
  if (status === 'Published') return ' bg-blue-25 text-blue-200';
  if (status === 'Pending') return 'bg-warning-50 text-warning-500';
  if (status === 'Approved') return 'bg-success-50 text-success-800';
  return 'bg-blue-25 text-blue-200';
};

const availablePlatforms = computed(() => {
  return props.postData?.platforms || ['Instagram', 'Facebook', 'LinkedIn', 'Twitter', 'TikTok', 'YouTube'];
});

const getPostType = () => {
  const platform = selectedPlatform.value || availablePlatforms.value[0] || 'Instagram';
  return `${platform} post (4:5)`;
};

const togglePlatformDropdown = () => {
  showPlatformDropdown.value = !showPlatformDropdown.value;
};

const selectPlatform = (platform) => {
  selectedPlatform.value = platform;
  showPlatformDropdown.value = false;
};

const handleClickOutside = (event) => {
  if (!event.target.closest('.platform-dropdown-container')) {
    showPlatformDropdown.value = false;
  }
};

const getFullCaption = () => {
  const title = props.postData?.title || 'Big Sale this weekend!';
  const caption = `${title} Don't miss your chance to grab your favorites at exclusive prices. #WeekendSale #LimitedOffer #ShopSmart`;
  
  // Replace hashtags with styled spans
  return caption.replace(/#(\w+)/g, '<span class="hashtag_text_color">#$1</span>');
};

const formatDateTime = () => {
  const date = props.postData?.date || 'Oct 28,';
  const time = props.postData?.time || '10:00 AM';
  return `${date} ${time}`;
};

const getMetricValue = (type) => {
  const metrics = {
    reach: props.postData?.reach || '128K',
    engagement: props.postData?.engagement || '6.8%',
    likes: props.postData?.likes || '3.2K',
    comments: props.postData?.comments || '210',
  };
  return metrics[type] || '0';
};

const scheduledDate = computed(() => {
  // Format: "Oct 30 at 10:00 AM"
  const date = props.postData?.date?.replace(',', '') || 'Oct 30';
  const time = props.postData?.time || '10:00 AM';
  return `${date} at ${time}`;
});

const handleRepost = () => {
  emit('repost', props.postData);
  // Show scheduled modal instead of closing
  showScheduledModal.value = true;
};

const closeScheduledModal = () => {
  showScheduledModal.value = false;
  // Close the view post modal as well
  emit('close');
};

const handleViewCalendar = () => {
  emit('viewCalendar');
};

// Watch for postData changes to update selected platform
watch(() => props.postData, (newData) => {
  if (newData && availablePlatforms.value.length > 0) {
    selectedPlatform.value = availablePlatforms.value[0];
  }
}, { immediate: true });

// Initialize selected platform
onMounted(() => {
  if (availablePlatforms.value.length > 0 && !selectedPlatform.value) {
    selectedPlatform.value = availablePlatforms.value[0];
  }
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});


//analystics 
const baseStats = [
  {
    title: 'Total reach',
    description: 'Total users who saw your posts',
    icon: TotalReach,
    iconBg: 'bg-green-100',
    iconColor: 'text-green-600',
    mobileWdth: 'w-[100%]',
    valueMonth: '',
    
  },
  {
    title: 'Engagement rate',
    description: 'Likes, comments, & impressions',
    icon: MessageIcon,
    iconBg: 'bg-yellow-100',
    iconColor: 'text-yellow-600',
    mobileWdth: 'w-[100%]',
    valueMonth: '',
    
  },
  {
    title: 'Likes',
    description: 'Total reactions',
    icon: LikeIcon,
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    mobileWdth: 'w-[100%]',
    valueMonth: '+1,230',
   
  },
  {
    title: 'comments',
    description: 'Total replies',
    icon: CommentIcon,
    iconBg: 'bg-pink-100',
    iconColor: 'text-pink-600',
    mobileWdth: 'w-[100%]',
    valueMonth: '210',
  },
];

const stats = computed(() => {
  // Use 'Month' as default since there's no activeTab in this component
  const defaultTab = 'Month';
  
  return baseStats.map(stat => {
    // Use post data values where available, otherwise use default values
    let value = stat[`value${defaultTab}`];
    
    // Map post data to stats if available
    if (stat.title === 'Total reach' && props.postData?.reach) {
      value = props.postData.reach;
    } else if (stat.title === 'Engagement rate' && props.postData?.engagement) {
      value = props.postData.engagement;
    }
    
    return {
      ...stat,
      value: value
    };
  });
});


</script>

