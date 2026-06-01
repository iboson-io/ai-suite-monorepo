<template>
    <main class="flex-1 bg_primary_color  px-3xl py-12xl md:px-10xl lg:py-10xl">
    <Filter 
      v-model:activeTab="activeTab"
      @customDateRange="handleCustomDateRange"
      @platform-filter="handlePlatformFilter"
      @product-filter="handleProductFilter"
    />

    <div>
    <!-- Empty state: no published posts -->
    <div
      v-if="publishedPost === null"
      class="mt-4xl flex min-h-[min(68vh,calc(100vh-14rem))] w-full items-center justify-center rounded-2xl bg_secondary_color shadow-sm"
    >
      <div class="flex flex-col items-center px-6xl py-10xl text-center max-w-xl">
        <img
          :src="AnalyticsEmptyStateImage"
          alt="There's no analytics data to display yet. Performance insights will appear once data becomes available."
          class="max-w-full w-auto h-auto"
        />
        <p class="label_1_regular secondary_text_color mt-4xl">
        There’s no analytics data to display yet. Performance insights will appear once data becomes available.
        </p>
      </div>
    </div>

    <template v-else>
    <section class="flex gap-5xl overflow-x-auto hide-scrollbar sm:grid sm:grid-cols-1 md:grid md:grid-cols-2 lg:grid lg:grid-cols-4 mt-4xl">
     <AnalyticsStatCard
      v-for="(stat, index) in stats"
      :key="index"
      v-bind="stat"
    />
    </section>
    <PerformanceChart 
      :activeTab="activeTab"
      :customDateRange="customDateRange"
      :applied-platform-slugs="appliedPlatformSlugs"
      :applied-product-ids="appliedProductIds"
    />
    <PostList :rows="tableData" :loading="isOverviewLoading" @saved="fetchOverviewPosts" />
    <div
      v-if="overviewShowPager"
      class="mt-xl flex items-center justify-center gap-sm rounded-2xl border primary_border_color bg_secondary_color px-6xl py-xl"
    >
      <button
        type="button"
        :disabled="overviewPage <= 1 || isOverviewLoading"
        class="flex items-center gap-xl rounded-lg border primary_border_color bg_secondary_color px-3xl py-lg label_2_semibold primary_text_color hover:bg-gray-25 disabled:cursor-not-allowed disabled:opacity-50"
        @click="goOverviewPrev"
      >
        <svg width="14" height="12" viewBox="0 0 14 12" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M0.75 5.75H12.4167M5.75 0.75L0.75 5.75L5.75 10.75" stroke="#6F707D" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>

        Previous
      </button>
      <div class="flex items-center gap-xs">
        <button
          v-for="pageNum in overviewPageNumbers"
          :key="pageNum"
          type="button"
          :disabled="pageNum === '...' || isOverviewLoading"
          :class="[
            'border px-3xl py-lg label_2_semibold',
            pageNum === overviewPage
              ? 'border-gray-25 bg-info-50 primary_text_color'
              : 'primary_border_color bg_secondary_color primary_text_color hover:bg-gray-25',
            pageNum === '...' ? 'cursor-default disabled:opacity-50' : 'cursor-pointer disabled:cursor-not-allowed disabled:opacity-50'
          ]"
          @click="pageNum !== '...' && goToOverviewPage(pageNum)"
        >
          {{ pageNum }}
        </button>
      </div>
      <button
        type="button"
        :disabled="!overviewHasNext || isOverviewLoading"
        class="flex items-center gap-xl rounded-lg border primary_border_color bg_secondary_color px-3xl py-lg label_2_semibold primary_text_color hover:bg-gray-25 disabled:cursor-not-allowed disabled:opacity-50"
        @click="goOverviewNext"
      >
        Next
        <svg width="14" height="12" viewBox="0 0 14 12" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M0.75 5.75H12.4167M7.41667 0.75L12.4167 5.75L7.41667 10.75" stroke="#6F707D" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>

      </button>
    </div>
    </template>
    </div>
    </main>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import Filter from "../components/Dashboard/Analytics/Filter.vue"
import AnalyticsStatCard from "../components/Dashboard/Analytics/AnalyticsCard.vue"
import PerformanceChart from "../components/Dashboard/Analytics/PerformanceChart.vue"
import PostList from "../components/Dashboard/Analytics/PostList.vue"
import TotalReach from "../assets/images/TotalReach.svg"
import MessageIcon from "../assets/images/MessageIcon.svg"
import Flowers from "../assets/images/Flowers.svg"
import CopyIcon from "../assets/images/CopyIcon.svg"
import PostImage from "../assets/images/PostImage.png"
import AnalyticsEmptyStateImage from "../assets/images/AnalyticsEmptyStateImage.png"
import api from '../services/api.js'

const activeTab = ref('Month')
const customDateRange = ref(null)
/** Slugs from platform filter Apply — empty means all platforms (omit `platform` query). */
const appliedPlatformSlugs = ref([])
/** Product UUIDs from product filter Apply — empty means all products (omit `productId` query). */
const appliedProductIds = ref([])

function summaryParams(base) {
  const out = { ...base }
  const slugs = appliedPlatformSlugs.value.map((s) => String(s).trim().toLowerCase()).filter(Boolean)
  if (slugs.length) out.platform = slugs.join(',')
  const pids = appliedProductIds.value.map((id) => String(id).trim()).filter(Boolean)
  if (pids.length) out.productId = pids.join(',')
  return out
}

function refetchAnalyticsSummary() {
  if (activeTab.value === 'Custom' && customDateRange.value) {
    fetchAnalyticsDataWithCustomRange(customDateRange.value)
  } else if (activeTab.value !== 'Custom') {
    fetchAnalyticsData(activeTab.value)
  }
}

function handlePlatformFilter(slugs) {
  appliedPlatformSlugs.value = Array.isArray(slugs) ? slugs : []
  refetchAnalyticsSummary()
}

function handleProductFilter(ids) {
  appliedProductIds.value = Array.isArray(ids) ? ids.map((id) => String(id).trim()).filter(Boolean) : []
  refetchAnalyticsSummary()
}

/** Query params for overview (same date + platform + product filters as summary). */
function overviewParams() {
  if (activeTab.value === 'Custom' && customDateRange.value) {
    return summaryParams({
      startDate: customDateRange.value.startDate.toISOString().split('T')[0],
      endDate: customDateRange.value.endDate.toISOString().split('T')[0],
    })
  }
  if (activeTab.value !== 'Custom') {
    return summaryParams({ dateRange: activeTab.value.toLowerCase() })
  }
  return summaryParams({})
}

function extractUrlFromImageRow(row) {
  if (row == null) return null
  if (typeof row === 'string') {
    const s = row.trim()
    return s || null
  }
  if (typeof row !== 'object') return null
  const u = row.imageUrl ?? row.image_url ?? row.url ?? row.src ?? row.href
  return u != null && String(u).trim() !== '' ? String(u).trim() : null
}

/** Same rules as Chat/Calendar: prefer `Default (1:1)`, then `aspect` 1:1, else first usable URL. */
function normalizeOverviewImageVariants(rawImages) {
  if (!Array.isArray(rawImages) || rawImages.length === 0) return []
  return rawImages
    .map((row) => {
      const imageUrl = extractUrlFromImageRow(row)
      if (!imageUrl) return null
      const aspect = row.aspect != null ? String(row.aspect).trim() : ''
      const aspectName =
        String(row.aspectName ?? '').trim() ||
        (aspect ? `Aspect (${aspect})` : 'Variant')
      return { aspect, aspectName, imageUrl }
    })
    .filter(Boolean)
}

function pickDefaultImageVariant(variants) {
  if (!variants?.length) return null
  const byName = variants.find((r) => r.aspectName === 'Default (1:1)')
  if (byName) return byName
  const byShort = variants.find((r) => String(r.aspectName ?? '').trim().toLowerCase() === 'default')
  if (byShort) return byShort
  const byAspect = variants.find((r) => r.aspect === '1:1')
  if (byAspect) return byAspect
  const loose = variants.find((r) => {
    const n = String(r.aspectName ?? '').toLowerCase()
    return n.includes('default') && (n.includes('1:1') || n.includes('1x1'))
  })
  if (loose) return loose
  return variants[0]
}

/** Overview row: top-level image fields, then `images` / `postImages` / `media`. */
function pickOverviewPostImage(item) {
  if (!item || typeof item !== 'object') return null
  const top = [
    item.imageUrl,
    item.image_url,
    item.postImage,
    item.image,
    item.coverImageUrl,
    item.thumbnailUrl,
  ]
    .map((x) => (x != null && String(x).trim() !== '' ? String(x).trim() : null))
    .find(Boolean)
  if (top) return top

  const rawList = item.images ?? item.postImages ?? item.media
  const variants = normalizeOverviewImageVariants(Array.isArray(rawList) ? rawList : [])
  const picked = pickDefaultImageVariant(variants)
  return picked?.imageUrl ?? null
}

function formatPlatformLabel(slug) {
  if (slug == null || String(slug).trim() === '') return ''
  const s = String(slug).trim().toLowerCase()
  if (s === 'twitter') return 'Twitter (X)'
  return s.charAt(0).toUpperCase() + s.slice(1)
}

function formatStatusDisplay(status) {
  const s = String(status ?? '').trim().toLowerCase()
  if (s === 'published') return 'Published'
  if (s === 'pending') return 'Pending'
  if (s === 'approved') return 'Approved'
  if (!s) return 'Published'
  return s.charAt(0).toUpperCase() + s.slice(1)
}

function formatReachDisplay(n) {
  const v = Number(n)
  if (Number.isNaN(v)) return '0'
  if (v >= 1000000) return `${(v / 1000000).toFixed(1)}M`
  if (v >= 1000) return `${(v / 1000).toFixed(0)}K`
  return String(Math.round(v))
}

function formatEngagementDisplay(n) {
  const v = Number(n)
  if (Number.isNaN(v)) return '0%'
  return `${v.toFixed(1)}%`
}

function formatPostedDateTime(iso) {
  if (!iso) return { date: '—', time: '' }
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return { date: '—', time: '' }
  return {
    date: `${d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })},`,
    time: d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' }),
  }
}

function mapOverviewRow(item) {
  const imgUrl = pickOverviewPostImage(item) ?? PostImage
  const posted = item.postedAt ?? item.posted_at
  const dt = formatPostedDateTime(posted)
  const platformsRaw = Array.isArray(item.platforms) ? item.platforms : []
  const postId = item.postId ?? item.post_id ?? ''
  const productId = item.productId ?? item.product_id ?? ''
  return {
    postId,
    productId: productId != null && String(productId).trim() !== '' ? String(productId).trim() : '',
    image: imgUrl,
    title: item.title != null ? String(item.title) : '',
    platforms: platformsRaw.map((p) => formatPlatformLabel(p)),
    date: dt.date,
    time: dt.time,
    reach: formatReachDisplay(item.reach),
    engagement: formatEngagementDisplay(item.engagement),
    status: formatStatusDisplay(item.status),
  }
}

const tableData = ref([])

/**
 * Null when there are no published posts (show empty state).
 * Undefined while overview/summary is loading (avoid empty-state flash).
 * Truthy when analytics content should render.
 */
const publishedPost = computed(() => {
  if (isOverviewLoading.value || isLoading.value) return undefined
  const hasOverviewRows = tableData.value.length > 0
  const hasOverviewTotal =
    overviewTotal.value != null && !Number.isNaN(Number(overviewTotal.value)) && Number(overviewTotal.value) > 0
  const hasSummaryPosts = Number(analyticsData.value.totalPostsPublished) > 0
  if (hasOverviewRows || hasOverviewTotal || hasSummaryPosts) return true
  return null
})

/** Server-side pagination: API commonly defaults to 10 rows without `page` / `limit`. */
const overviewPage = ref(1)
const overviewPageSize = ref(10)
/** Total rows if API returns it; otherwise inferred from full last page. */
const overviewTotal = ref(null)
const isOverviewLoading = ref(false)

function parseOverviewPayload(data) {
  let list = []
  let total = null
  if (!data?.success) return { list, total }

  const raw = data.data
  if (Array.isArray(raw)) {
    list = raw
    total =
      data.total ??
      data.meta?.total ??
      data.pagination?.total ??
      null
  } else if (raw && typeof raw === 'object') {
    list = Array.isArray(raw.posts)
      ? raw.posts
      : Array.isArray(raw.items)
        ? raw.items
        : Array.isArray(raw.rows)
          ? raw.rows
          : []
    const nested =
      raw.total ??
      raw.totalCount ??
      raw.count ??
      raw.pagination?.total ??
      data.total ??
      data.meta?.total ??
      null
    total = nested != null ? Number(nested) : null
    if (total != null && Number.isNaN(total)) total = null
  }

  return { list, total }
}

const overviewHasNext = computed(() => {
  const len = tableData.value.length
  const page = overviewPage.value
  const size = overviewPageSize.value
  const total = overviewTotal.value
  if (total != null && !Number.isNaN(total)) {
    return page * size < total
  }
  return len === size
})

const overviewPaginationLabel = computed(() => {
  const page = overviewPage.value
  const size = overviewPageSize.value
  const total = overviewTotal.value
  const count = tableData.value.length
  if (count === 0) return 'No posts in this range.'
  const start = (page - 1) * size + 1
  const end = (page - 1) * size + count
  if (total != null && !Number.isNaN(total)) {
    return `Showing ${start}–${end} of ${total}`
  }
  return `Page ${page} · rows ${start}–${end}${overviewHasNext.value ? ' (more on Next)' : ''}`
})

const overviewShowPager = computed(() => {
  return overviewPage.value > 1 || overviewHasNext.value || tableData.value.length > 0
})

const overviewTotalPages = computed(() => {
  const total = overviewTotal.value
  const size = overviewPageSize.value
  if (total != null && !Number.isNaN(total) && size > 0) {
    return Math.ceil(total / size)
  }
  return overviewPage.value + (overviewHasNext.value ? 1 : 0)
})

const overviewPageNumbers = computed(() => {
  const totalPages = overviewTotalPages.value
  const currentPage = overviewPage.value
  const pages = []
  
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i)
    }
  } else {
    if (currentPage <= 4) {
      for (let i = 1; i <= 5; i++) {
        pages.push(i)
      }
      pages.push('...')
      pages.push(totalPages)
    } else if (currentPage >= totalPages - 3) {
      pages.push(1)
      pages.push('...')
      for (let i = totalPages - 4; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      pages.push(1)
      pages.push('...')
      for (let i = currentPage - 1; i <= currentPage + 1; i++) {
        pages.push(i)
      }
      pages.push('...')
      pages.push(totalPages)
    }
  }
  
  return pages
})

async function fetchOverviewPosts() {
  isOverviewLoading.value = true
  try {
    const { data } = await api.get('/api/analytics/overview', {
      params: {
        ...overviewParams(),
        page: overviewPage.value,
        limit: overviewPageSize.value,
      },
    })
    const { list, total } = parseOverviewPayload(data)
    tableData.value = list.map(mapOverviewRow)
    if (total != null && !Number.isNaN(Number(total))) {
      overviewTotal.value = Number(total)
    } else if (overviewPage.value === 1 && list.length < overviewPageSize.value) {
      overviewTotal.value = list.length
    }
  } catch (error) {
    console.error('Failed to fetch analytics overview:', error)
    tableData.value = []
    overviewTotal.value = null
  } finally {
    isOverviewLoading.value = false
  }
}

function goOverviewPrev() {
  if (overviewPage.value <= 1 || isOverviewLoading.value) return
  overviewPage.value -= 1
  fetchOverviewPosts()
}

function goToOverviewPage(page) {
  if (page === overviewPage.value || isOverviewLoading.value) return
  overviewPage.value = page
  fetchOverviewPosts()
}

async function goOverviewNext() {
  if (!overviewHasNext.value || isOverviewLoading.value) return
  const prevPage = overviewPage.value
  overviewPage.value += 1
  await fetchOverviewPosts()
  if (tableData.value.length === 0) {
    overviewPage.value = prevPage
    if (overviewTotal.value == null) {
      overviewTotal.value = prevPage * overviewPageSize.value
    }
    await fetchOverviewPosts()
  }
}

// Analytics data state
const analyticsData = ref({
  totalReach: 0,
  totalEngagementRate: 0,
  totalPostsPublished: 0,
  followersGained: 0
})

const isLoading = ref(false)

// Static stat configuration
const statsConfig = [
  {
    title: 'Total reach',
    description: 'Total users who saw your posts',
    icon: TotalReach,
    iconBg: 'bg-green-100',
    iconColor: 'text-green-600',
    mobileWdth: 'w-70',
    key: 'totalReach',
    formatter: (value) => {
      if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`
      if (value >= 1000) return `${(value / 1000).toFixed(0)}K`
      return value.toString()
    }
  },
  {
    title: 'Engagement rate',
    description: 'Likes, comments, shares vs impressions',
    icon: MessageIcon,
    iconBg: 'bg-yellow-100',
    iconColor: 'text-yellow-600',
    mobileWdth: 'w-70',
    key: 'totalEngagementRate',
    formatter: (value) => `${value}%`
  },
  {
    title: 'Followers gained',
    description: 'Growth over selected period',
    icon: Flowers,
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    mobileWdth: 'w-70',
    key: 'followersGained',
    formatter: (value) => value > 0 ? `+${value}` : value.toString()
  },
  {
    title: 'Posts published',
    description: 'Number of posts in time period',
    icon: CopyIcon,
    iconBg: 'bg-pink-100',
    iconColor: 'text-pink-600',
    mobileWdth: 'w-70',
    key: 'totalPostsPublished',
    formatter: (value) => value.toString()
  },
];

// Handle custom date range selection
const handleCustomDateRange = (dateRange) => {
  customDateRange.value = dateRange
  fetchAnalyticsDataWithCustomRange(dateRange)
}

// Fetch analytics data from API
const fetchAnalyticsData = async (dateRange) => {
  try {
    isLoading.value = true
    const response = await api.get('/api/analytics/summary', {
      params: summaryParams({ dateRange: dateRange.toLowerCase() })
    })
    
    if (response.data.success) {
      analyticsData.value = response.data.data
    }
  } catch (error) {
    console.error('Failed to fetch analytics data:', error)
    // Set default values on error
    analyticsData.value = {
      totalReach: 0,
      totalEngagementRate: 0,
      totalPostsPublished: 0,
      followersGained: 0
    }
  } finally {
    isLoading.value = false
  }
}

// Fetch analytics data with custom date range
const fetchAnalyticsDataWithCustomRange = async (dateRange) => {
  try {
    isLoading.value = true
    const response = await api.get('/api/analytics/summary', {
      params: summaryParams({
        startDate: dateRange.startDate.toISOString().split('T')[0],
        endDate: dateRange.endDate.toISOString().split('T')[0]
      })
    })
    
    if (response.data.success) {
      analyticsData.value = response.data.data
    }
  } catch (error) {
    console.error('Failed to fetch analytics data with custom range:', error)
    // Set default values on error
    analyticsData.value = {
      totalReach: 0,
      totalEngagementRate: 0,
      totalPostsPublished: 0,
      followersGained: 0
    }
  } finally {
    isLoading.value = false
  }
}

// Computed stats with dynamic data
const stats = computed(() => {
  return statsConfig.map(config => ({
    ...config,
    value: config.formatter(analyticsData.value[config.key])
  }))
})

// Watch for tab changes and fetch data
watch(activeTab, (newTab) => {
  if (newTab !== 'Custom') {
    fetchAnalyticsData(newTab)
  }
}, { immediate: true })

watch(
  [activeTab, customDateRange, appliedPlatformSlugs, appliedProductIds],
  () => {
    overviewPage.value = 1
    overviewTotal.value = null
    fetchOverviewPosts()
  },
  { deep: true, immediate: true }
)

// Fetch initial data on mount
onMounted(() => {
  if (activeTab.value !== 'Custom') {
    fetchAnalyticsData(activeTab.value)
  }
})
</script>

