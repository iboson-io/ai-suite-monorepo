<template>
    <main class="flex-1 bg_primary_color  px-3xl py-12xl md:px-10xl lg:py-10xl">
    <Filter v-model:activeTab="activeTab"/>
    <section class="flex gap-5xl overflow-x-auto hide-scrollbar sm:grid sm:grid-cols-1 md:grid md:grid-cols-2 lg:grid lg:grid-cols-4 mt-4xl">
     <AnalyticsStatCard
      v-for="(stat, index) in stats"
      :key="index"
      v-bind="stat"
    />
    </section>
    <PerformanceChart/>
    <PostList :rows="tableData"/>
    </main>
</template>

<script setup>
import { ref, computed } from 'vue'
import Filter from "../components/Dashboard/Analytics/Filter.vue"
import AnalyticsStatCard from "../components/Dashboard/Analytics/AnalyticsCard.vue"
import PerformanceChart from "../components/Dashboard/Analytics/PerformanceChart.vue"
import PostList from "../components/Dashboard/Analytics/PostList.vue"
import TotalReach from "../assets/images/TotalReach.svg"
import MessageIcon from "../assets/images/MessageIcon.svg"
import Flowers from "../assets/images/Flowers.svg"
import CopyIcon from "../assets/images/CopyIcon.svg"
import PostImage from "../assets/images/PostImage.png"

const activeTab = ref('Month')

// filter

const baseStats = [
  {
    title: 'Total reach',
    description: 'Total users who saw your posts',
    icon: TotalReach,
    iconBg: 'bg-green-100',
    iconColor: 'text-green-600',
    mobileWdth: 'w-70',
    valueDay: '50K',
    valueWeek: '200K',
    valueMonth: '128K',
    valueCustom: '125K',
  },
  {
    title: 'Engagement rate',
    description: 'Likes, comments, shares vs impressions',
   icon: MessageIcon,
    iconBg: 'bg-yellow-100',
    iconColor: 'text-yellow-600',
    mobileWdth: 'w-70',
    valueDay: '4.2%',
    valueWeek: '5.5%',
    valueMonth: '6.8%',
    valueCustom: '6.9%',
  },
  {
    title: 'Followers gained',
    description: 'Growth over selected period',
    icon: Flowers,
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    mobileWdth: 'w-70',
    valueDay: '+200',
    valueWeek: '+800',
    valueMonth: '+1,230',
    valueCustom: '+1,630',
  },
  {
    title: 'Posts published',
    description: 'Number of posts in time period',
    icon: CopyIcon,
    iconBg: 'bg-pink-100',
    iconColor: 'text-pink-600',
    mobileWdth: 'w-70',
    valueDay: '5',
    valueWeek: '15',
    valueMonth: '32',
    valueCustom: '39',
  },
];

const stats = computed(() => {
  return baseStats.map(stat => ({
    ...stat,
    value: stat[`value${activeTab.value}`]
  }))
})

// post List data
const tableData = [
  {
    image: PostImage,
    title: 'Big Sale this weekend!',
    platforms: ['TikTok', 'Facebook', 'Twitter', 'YouTube', 'Instagram'],
    date: 'Oct 28,',
    time: '10:00 AM',
    reach: '125K',
    engagement: '6.2%',
    status: 'Published',
  },
  {
    image: PostImage,
    title: 'Big Sale this weekend!',
    platforms: ['TikTok', 'Facebook', 'Twitter', 'YouTube', 'Instagram'],
    date: 'Oct 28,',
    time: '10:00 AM',
    reach: '125K',
    engagement: '6.2%',
    status: 'Pending',
  },
  {
    image: PostImage,
    title: 'Big Sale this weekend!',
    platforms: ['TikTok', 'Facebook', 'Twitter', 'YouTube', 'Instagram'],
    date: 'Oct 28,',
    time: '10:00 AM',
    reach: '125K',
    engagement: '6.2%',
    status: 'Approved',
  },
];
</script>

