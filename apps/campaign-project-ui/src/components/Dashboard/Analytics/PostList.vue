<template>
  <div class="overflow-auto rounded-2xl bg_secondary_color primary_border_color mt-4xl lg:overflow-hidden">
    <!-- Table -->
    <table class="w-full border-collapse">
      <!-- Header -->
      <thead class="bg_secondary_color">
        <tr class="text-left label_3_semibold secondary_text_color">
          <th class="px-6xl py-xl">
            <input
              type="checkbox"
              :checked="isAllSelected"
              :indeterminate="isIndeterminate"
              @change="toggleSelectAll"
              class="h-5xl w-5xl cursor-pointer rounded custom-checkbox"
            />
          </th>
          <th class="px-6xl py-xxl">Preview</th>
          <th class="px-6xl py-xxl">Caption / Title</th>
          <th class="px-6xl py-xxl">Platform</th>
          <th class="px-6xl py-xxl">Date / Time</th>
          <th class="px-6xl py-xxl">Reach</th>
          <th class="px-6xl py-xxl">Engagement</th>
          <th class="px-6xl py-xxl">Status</th>
          <th class="px-6xl py-xxl text-center">Actions</th>
        </tr>
      </thead>

      <!-- Body -->
      <tbody>
        <tr
          v-for="(row, index) in rows"
          :key="index"
          class="border-t primary_border_color"
        >
          <!-- Checkbox -->
          <td class="px-6xl py-xl">
            <input
              type="checkbox"
              :checked="selectedRows.includes(index)"
              @change="toggleRowSelection(index)"
              class="h-5xl w-5xl cursor-pointer rounded custom-checkbox"
            />
          </td>

          <!-- Preview -->
          <td class="px-6xl py-xl">
            <img
              :src="row.image"
              class="h-11xl w-11xl rounded-lg object-cover"
            />
          </td>

          <!-- Caption -->
          <td class="px-6xl py-xxl">
            <p class="label_2_semibold primary_text_color">
              {{ row.title }}
            </p>
          </td>

          <!-- Platforms -->
          <td class="px-6xl py-xxl">
            <div class="flex flex-wrap gap-xs">
              <span
                v-for="p in row.platforms"
                :key="p"
                class="rounded-lg bg-info-50 border border-black-25 px-md py-xxs body_4_medium secondary_text_color"
              >
                {{ p }}
              </span>
            </div>
          </td>

          <!-- Date -->
          <td class="px-6xl py-xxl label_2_medium secondary_text_color">
            <div>{{ row.date }}</div>
            <div>{{ row.time }}</div>
          </td>

          <!-- Reach -->
          <td class="px-6xl py-xxl label_2_medium secondary_text_color">
            {{ row.reach }}
          </td>

          <!-- Engagement -->
          <td class="px-6xl py-xxl label_2_medium secondary_text_color">
            {{ row.engagement }}
          </td>

          <!-- Status -->
          <td class="px-6xl py-xxl">
            <span
              class="rounded-lg px-md py-xxs body_4_medium"
              :class="statusClass(row.status)"
            >
              {{ row.status }}
            </span>
          </td>

          <!-- Actions -->
          <td class="px-6xl py-xxl text-center">
            <div class="relative dropdown-container">
              <button
                @click.stop="toggleDropdown(index)"
                class="flex h-8xl w-8xl items-center justify-center rounded-full hover:primary_border_color hover:bg-gray-25"
              >
                <img :src="ThreeDotsIcon" alt="ThreeDotsIcon">
              </button>
              
              <!-- Dropdown Menu -->
              <div
                v-if="openDropdownIndex === index"
                class="absolute right-0 top-10 z-50 min-w-[160px] rounded-lg bg_secondary_color shadow-lg primary_border_color"
              >
                <div
                  @click.stop="handleViewPost(row)"
                  class="flex items-center gap-3xl px-5xl py-3xl cursor-pointer hover:bg_primary_color first:rounded-t-lg"
                >
                  <img :src="ViewPostIcon" alt="">
                  <span class="body_2_medium primary_text_color">View post</span>
                  
                </div>
                <div
                  @click.stop="handleRepost(row)"
                  class="flex items-center gap-3xl px-5xl py-3xl cursor-pointer hover:bg_primary_color last:rounded-b-lg"
                >
                  <img :src="RepostIcon" alt="">
                  <span class="body_2_medium primary_text_color">Repost</span>
                  
                </div>
              </div>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>

  <!-- View Post Modal -->
  <ViewPostModal
    :open="showViewPostModal"
    :postData="selectedPost"
    @close="closeViewPostModal"
    @repost="handleRepostFromModal"
  />
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import ViewPostModal from './ViewPostModal.vue';
import ViewPostIcon from  "../../../assets/images/ViewPostIcon.svg"
import RepostIcon from "../../../assets/images/RepostIcon.svg"
import ThreeDotsIcon from "../../../assets/images/ThreeDotsIcon.svg"

const props = defineProps({
  rows: Array,
});

const openDropdownIndex = ref(null);
const showViewPostModal = ref(false);
const selectedPost = ref(null);
const selectedRows = ref([]);

const isAllSelected = computed(() => {
  return props.rows && props.rows.length > 0 && selectedRows.value.length === props.rows.length;
});

const isIndeterminate = computed(() => {
  return selectedRows.value.length > 0 && selectedRows.value.length < props.rows.length;
});

const toggleSelectAll = () => {
  if (isAllSelected.value) {
    selectedRows.value = [];
  } else {
    selectedRows.value = props.rows.map((_, index) => index);
  }
};

const toggleRowSelection = (index) => {
  const idx = selectedRows.value.indexOf(index);
  if (idx > -1) {
    selectedRows.value.splice(idx, 1);
  } else {
    selectedRows.value.push(index);
  }
};

const statusClass = (status) => {
  if (status === 'Published')
    return 'border border-blue-100 bg-blue-25 text-blue-200';
  if (status === 'Pending')
    return 'border border-warning-200 bg-warning-50 text-warning-500';
  if (status === 'Approved')
    return ' border border-success-200 bg-success-50 text-success-800';
};

const toggleDropdown = (index) => {
  if (openDropdownIndex.value === index) {
    openDropdownIndex.value = null;
  } else {
    openDropdownIndex.value = index;
  }
};

const handleViewPost = (row) => {
  selectedPost.value = row;
  showViewPostModal.value = true;
  openDropdownIndex.value = null;
};

const closeViewPostModal = () => {
  showViewPostModal.value = false;
  selectedPost.value = null;
};

const handleRepost = (row) => {
  console.log('Repost:', row);
  openDropdownIndex.value = null;
  // Add your repost logic here
};

const handleRepostFromModal = (postData) => {
  console.log('Repost from modal:', postData);
  // Add your repost logic here
};

const handleClickOutside = (event) => {
  if (!event.target.closest('.dropdown-container')) {
    openDropdownIndex.value = null;
  }
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>
