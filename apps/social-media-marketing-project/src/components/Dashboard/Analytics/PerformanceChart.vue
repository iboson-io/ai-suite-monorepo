<template>
  <div class="rounded-2xl bg_secondary_color p-6xl primary_border_color shadow-sm mt-4xl">
    <!-- Header -->
    <div class="flex items-start justify-between mb-md">
      <div>
        <h3 class="heading_h6_semibold primary_text_color">
          Performance by platform
        </h3>
      </div>

      <!-- Dropdown -->
      <div class="relative metric-dropdown-container hidden md:block">
        <button
          @click.stop="toggleMetricDropdown"
          class="flex items-center gap-3xl rounded-lg border px-3 py-2 label_2_medium bg_secondary_color primary_border_color"
        >
          <img :src="getMetricIcon(selectedMetric)" alt="" class="h-6xl w-6xl" />
          <span class="label_2_medium min-w-[7em] text-start primary_text_color">{{ getMetricLabel(selectedMetric) }}</span>
          <img :src="DownArrow" alt="" class="h-4 w-4" />
        </button>
        
        <!-- Dropdown Menu -->
        <div
          v-if="showMetricDropdown"
          class="absolute right-0 top-10 z-50 min-w-[180px] rounded-lg bg_secondary_color shadow-lg primary_border_color mt-md"
        >
          <div
            v-for="metric in metrics"
            :key="metric.value"
            @click.stop="selectMetric(metric.value)"
            class="flex items-center gap-md px-3xl py-xl cursor-pointer hover:bg-gray-25 border-b primary_border_color"
            :class="selectedMetric === metric.value ? 'bg-gray-25' : ''"
          >
            <img 
              :src="metric.icon" 
              alt="" 
              class="h-6xl w-6xl"
              :style="metric.value === 'shares' ? 'filter: opacity(0.7)' : ''"
            />
             <span class="label_2_medium primary_text_color">{{ metric.label }}</span>
          </div>
        </div>
      </div>
    </div>
    <p class="bady_3_regular secondary_text_color mb-9xl lg:mt-[-18px]">
          Compare reach, engagement, likes, comments, and shares across all platforms.
        </p>
    <!-- Chart -->
   <!-- Dropdown mobile -->
    <div class="relative metric-dropdown-container block mb-5 md:hidden">
        <button
          @click.stop="toggleMetricDropdown"
          class="flex items-center gap-3xl rounded-lg border px-xl py-xxl bg_secondary_color primary_border_color"
        >
          <img :src="getMetricIcon(selectedMetric)" alt="" class="h-6xl w-6xl" />
          <span class="label_2_medium min-w-[7em] text-start primary_text_color">{{ getMetricLabel(selectedMetric) }}</span>
          <img :src="DownArrow" alt="" class="h-lg w-xxl" />
        </button>
        
        <!-- Dropdown Menu -->
        <div
          v-if="showMetricDropdown"
          class="absolute  top-10 z-50 min-w-[195px] rounded-lg bg_secondary_color shadow-lg primary_border_color mt-4xl"
        >
          <div
            v-for="metric in metrics"
            :key="metric.value"
            @click.stop="selectMetric(metric.value)"
            class="flex items-center gap-xl px-3xl py-xl cursor-pointer hover:bg-gray-25"
            :class="selectedMetric === metric.value ? 'bg-gray-25' : ''"
          >
            <img 
              :src="metric.icon" 
              alt="" 
              class="h-6xl w-6xl"
              :style="metric.value === 'shares' ? 'filter: opacity(0.7)' : ''"
            />
             <span class="label_2_medium primary_text_color">{{ metric.label }}</span>
          </div>
        </div>
      </div>

    <!-- Scrollable Chart Container for Mobile -->
    <div class="chart-scroll-container overflow-x-auto overflow-y-visible md:overflow-x-visible -mx-3xl md:mx-0 px-3xl md:px-0">
      <div class="min-w-[700px] md:min-w-0">
        <canvas ref="chartRef" height="80"></canvas>

        <!-- X Axis Labels (Icons + Text) -->
        <ul
          class="mt-xl grid text-center pl-8xl lg:pl-6xl gap-y-md"
          :style="platformGridStyle"
        >
          <li v-for="p in platforms" :key="p.key" class="flex justify-center items-center gap-md label_1_medium primary_text_color">
            <img :src="p.icon" class="h-5xl w-5xl" />
            <span class="hidden lg:inline">{{ p.name }}</span>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, onUnmounted, computed } from 'vue';
import {
  Chart,
  BarController,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
} from 'chart.js';
import api from '../../../services/api.js';

Chart.register(
  BarController,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip
);
import DownArrow from "../../../assets/images/DownArrow.svg"
import TotalReach from "../../../assets/images/ReachIcon.svg"
import MessageIcon from "../../../assets/images/MessageUp.svg"
import LikeIcon from "../../../assets/images/HeartIcon.svg"
import CommentIcon from "../../../assets/images/MessageCircleIcon.svg"
import ShareIcon from "../../../assets/images/ShareIcon.svg"



// Props
const props = defineProps({
  activeTab: {
    type: String,
    default: 'Month'
  },
  customDateRange: {
    type: Object,
    default: null
  },
  /** Applied platform slugs from analytics filter — sent as `platform=slug1,slug2`. */
  appliedPlatformSlugs: {
    type: Array,
    default: () => []
  },
  /** Applied product UUIDs from analytics filter — sent as `productId=id1,id2`. */
  appliedProductIds: {
    type: Array,
    default: () => []
  }
});

const chartRef = ref(null);
let chartInstance = null;

const selectedMetric = ref('reach');
const showMetricDropdown = ref(false);
const isLoading = ref(false);
const platformData = ref({});


// Metrics with icons
const metrics = [
  { value: 'reach', label: 'Reach', icon: TotalReach },
  { value: 'engagement', label: 'Engagement', icon: MessageIcon },
  { value: 'likes', label: 'Likes', icon: LikeIcon },
  { value: 'comments', label: 'Comments', icon: CommentIcon },
  { value: 'shares', label: 'Shares', icon: ShareIcon },
];

const getMetricIcon = (metric) => {
  const metricObj = metrics.find(m => m.value === metric);
  return metricObj ? metricObj.icon : TotalReach;
};

const getMetricLabel = (metric) => {
  const metricObj = metrics.find(m => m.value === metric);
  return metricObj ? metricObj.label : 'Reach';
};

const toggleMetricDropdown = () => {
  showMetricDropdown.value = !showMetricDropdown.value;
};

const selectMetric = (metric) => {
  selectedMetric.value = metric;
  showMetricDropdown.value = false;
};

const handleClickOutside = (event) => {
  if (!event.target.closest('.metric-dropdown-container')) {
    showMetricDropdown.value = false;
  }
};

/** Linked platforms from `GET /api/analytics/linked-platforms` — `key` matches `platform-interactions` slugs. */
const platforms = ref([]);

const platformGridStyle = computed(() => {
  const n = Math.max(platforms.value.length, 1);
  return { gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))` };
});

function displayNameFromPlatformSlug(slug) {
  if (slug == null || String(slug).trim() === "") return "—";
  const s = String(slug).trim();
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

async function fetchLinkedPlatforms() {
  try {
    const { data } = await api.get("/api/analytics/linked-platforms");
    if (data?.success && Array.isArray(data.platforms)) {
      platforms.value = data.platforms
        .map((item) => {
          const key = String(item.platform ?? "").trim().toLowerCase();
          const name =
            item.name != null && String(item.name).trim() !== ""
              ? String(item.name).trim()
              : displayNameFromPlatformSlug(item.platform);
          const icon = item.icon != null ? String(item.icon).trim() : "";
          return { key, name, icon };
        })
        .filter((p) => p.key);
    } else {
      platforms.value = [];
    }
  } catch (error) {
    console.error("Failed to fetch linked platforms:", error);
    platforms.value = [];
  }
}

function repeatPalette(colors, len) {
  if (!len) return [];
  const out = [];
  for (let i = 0; i < len; i++) out.push(colors[i % colors.length]);
  return out;
}

// Fetch platform interactions data from API
const fetchPlatformData = async () => {
  try {
    isLoading.value = true;
    
    let params = {};
    
    if (props.activeTab === 'Custom' && props.customDateRange) {
      params = {
        startDate: props.customDateRange.startDate.toISOString().split('T')[0],
        endDate: props.customDateRange.endDate.toISOString().split('T')[0]
      };
    } else if (props.activeTab !== 'Custom') {
      params = { dateRange: props.activeTab.toLowerCase() };
    }

    const slugs = (props.appliedPlatformSlugs ?? [])
      .map((s) => String(s).trim().toLowerCase())
      .filter(Boolean);
    if (slugs.length) {
      params.platform = slugs.join(',');
    }

    const pids = (props.appliedProductIds ?? [])
      .map((id) => String(id).trim())
      .filter(Boolean);
    if (pids.length) {
      params.productId = pids.join(',');
    }
    
    const response = await api.get('/api/analytics/platform-interactions', { params });
    
    if (response.data.success) {
      // Transform API data to platform key format
      const transformedData = {};
      response.data.data.forEach(item => {
        transformedData[item.platform] = item;
      });
      platformData.value = transformedData;
    }
  } catch (error) {
    console.error('Failed to fetch platform data:', error);
    // Set default empty data on error
    platformData.value = {};
  } finally {
    isLoading.value = false;
  }
};

// Computed metrics data based on API response
const metricsData = computed(() => {
  const data = {
    reach: [],
    engagement: [],
    likes: [],
    comments: [],
    shares: []
  };
  
  platforms.value.forEach((platform) => {
    const platformInfo = platformData.value[platform.key];
    
    if (platformInfo) {
      data.reach.push(platformInfo.reach || 0);
      data.engagement.push((platformInfo.likes || 0) + (platformInfo.comments || 0) + (platformInfo.reposts || 0));
      data.likes.push(platformInfo.likes || 0);
      data.comments.push(platformInfo.comments || 0);
      data.shares.push(platformInfo.reposts || 0);
    } else {
      // Default values if no data available
      data.reach.push(0);
      data.engagement.push(0);
      data.likes.push(0);
      data.comments.push(0);
      data.shares.push(0);
    }
  });
  
  return data;
});

const barColors = [
  '#FFECF8',
  '#E9F2FF',
  '#F3F0FF',
  '#E7F9FF',
  '#FFF3EB',
  '#FFECEB',
];

const borderColors = [
  '#EC4899',
  '#85B8FF',
  '#D0BFFF',
  '#9DD9EE',
  '#FEC195',
  '#FD9891',
];

const createChart = () => {
  if (!chartRef.value) return;
  const n = platforms.value.length;
  const bg = repeatPalette(barColors, n);
  const borders = repeatPalette(borderColors, n);
  chartInstance = new Chart(chartRef.value, {
    type: 'bar',
    data: {
      labels: platforms.value.map((p) => p.name),
      datasets: [
        {
          data: metricsData.value[selectedMetric.value] ?? [],
          backgroundColor: bg,
          borderColor: borders,
          borderWidth: 1,
          borderRadius: {
            topLeft: 8,
            topRight: 8,
            bottomLeft: 0,
            bottomRight: 0,
          },
          borderSkipped: 'bottom',
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
      },
      scales: {
        x: { display: false },
        y: {
          beginAtZero: true,
          grid: { color: '#f1f5f9' },
          ticks: { stepSize: 25 },
        },
      },
    },
  });
};

const updateChart = () => {
  if (chartInstance && metricsData.value) {
    chartInstance.data.datasets[0].data = metricsData.value[selectedMetric.value];
    chartInstance.update();
  }
};

onMounted(async () => {
  await fetchLinkedPlatforms();
  await fetchPlatformData();
  createChart();
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});

// Watch for metric changes and update chart
watch(selectedMetric, updateChart);

// Watch for date range changes and fetch new data
watch([() => props.activeTab, () => props.customDateRange, () => props.appliedPlatformSlugs, () => props.appliedProductIds], () => {
  fetchPlatformData();
}, { deep: true });

// Watch for platform data changes and update chart
watch(metricsData, updateChart, { deep: true });
</script>
