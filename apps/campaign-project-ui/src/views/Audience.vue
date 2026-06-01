<template>
  <div
    class="flex flex-col bg_primary_color px-3xl md:px-10xl"
    :class="
      activeListDetail
        ? 'min-h-0 flex-1 overflow-hidden py-4xl md:py-6xl lg:py-8xl'
        : 'flex-1 py-12xl lg:py-10xl'
    "
  >
    <MasterList
      v-if="activeListDetail"
      class="min-h-0 flex-1 overflow-hidden"
      :list-name="activeListDetail.name"
      :list-id="activeListDetail.id"
      :tags="activeListDetail.tags"
      :member-count="activeListDetail.memberCount"
      :is-new-list="activeListDetail.isNewList === true"
      @back="activeListDetail = null"
    />

    <template v-else>
    <!-- Header Card -->
    <div class="bg_secondary_color p-6xl rounded-lg primary_border_color">
      <h2 class="heading_h6_bold primary_text_color">Audience</h2>
      <p class="label_1_regular secondary_text_color mt-md">
        Import, manage, and segment your contacts to start sending campaigns.
      </p>
    </div>

    <!-- Tabs -->
    <div
      class="mb-6xl mt-8 w-full bg_secondary_color p-md"
      :class="
        hasContacts || activeTab === 'list'
          ? 'primary_border_color flex flex-wrap items-center justify-between gap-4 rounded-2xl md:p-xl'
          : 'rounded-[12px]'
      "
    >
      <div class="flex flex-wrap items-center gap-4xl">
        <!-- List Tab -->
        <div
          class="tab-button relative flex flex-shrink-0 cursor-pointer items-center justify-center gap-sm rounded-xl p-xl transition-colors label_2_semibold hover:bg-info-50 md:gap-xl"
          :class="activeTab === 'list' ? 'bg-gray-25' : 'secondary_text_color'"
          @click="setActiveTab('list')"
        >
          <img :src="ListIcon" alt="" class="h-5 w-5" />
          <span
            class="label_2_semibold transition-colors duration-200"
            :class="activeTab === 'list' ? 'primary_text_color' : 'secondary_text_color'"
          >
            Lists
          </span>
        </div>

        <!-- Segments Tab -->
        <div
          class="tab-button relative flex flex-shrink-0 cursor-pointer items-center justify-center gap-sm rounded-xl p-xl transition-colors label_2_semibold hover:bg-info-50 md:gap-xl"
          :class="activeTab === 'segments' ? 'bg-gray-25' : 'secondary_text_color'"
          @click="setActiveTab('segments')"
        >
          <img :src="SegmentsIcon" alt="" class="h-5 w-5" />
          <span
            class="label_2_semibold transition-colors duration-200"
            :class="activeTab === 'segments' ? 'primary_text_color' : 'secondary_text_color'"
          >
            Segments
          </span>
        </div>

        <!-- Contacts Tab -->
        <div
          class="tab-button relative flex flex-shrink-0 cursor-pointer items-center justify-center gap-sm rounded-xl p-xl transition-colors label_2_semibold hover:bg-info-50 md:gap-xl"
          :class="activeTab === 'contacts' ? 'bg-gray-25' : 'secondary_text_color'"
          @click="setActiveTab('contacts')"
        >
          <img :src="ContactsIcon" alt="" class="h-5 w-5" />
          <span
            class="label_2_semibold transition-colors duration-200"
            :class="activeTab === 'contacts' ? 'primary_text_color' : 'secondary_text_color'"
          >
            Contacts
          </span>
        </div>

        

        
      </div>

      <!-- Actions — list tab -->
      <div v-if="activeTab === 'list'" class="flex shrink-0 flex-wrap items-center gap-md">
        <button
          type="button"
          class="inline-flex items-center gap-2 rounded-lg px-4xl py-lg primary_add_button label_1_semibold"
          @click="onCreateList"
        >
          <img :src="PlusIconWhite" alt="" />
          Create list
        </button>
      </div>

      <!-- Actions when audience has contacts — contacts tab only -->
      <div v-if="hasContacts && activeTab === 'contacts'" class="flex shrink-0 flex-wrap items-center gap-md">
        <div ref="moreOptionsRoot" class="relative">
          <button
            type="button"
            class="relative flex min-w-[155px] items-center gap-md rounded-lg bg_secondary_color py-2.5 pl-3xl pr-10xl label_2_medium primary_text_color regular_border_color outline-none transition-colors focus:border-[3px] focus:border-[#D9E2FC]"
            :class="isMoreOptionsOpen ? 'border-[3px] border-[#D9E2FC]' : ''"
            aria-haspopup="listbox"
            :aria-expanded="isMoreOptionsOpen"
            @click="toggleMoreOptions"
          >
            <span class="whitespace-nowrap">More options</span>
            <img
              :src="DownArrow"
              alt=""
              class="pointer-events-none absolute right-3 top-1/2 h-3 w-3 -translate-y-1/2 md:right-4 md:h-3.5 md:w-3.5"
            />
          </button>
          <div
            v-if="isMoreOptionsOpen"
            class="absolute right-0 top-full z-50 mt-sm min-w-[190px] rounded-md bg_secondary_color py-xs shadow-lg primary_border_color"
            role="listbox"
            @click.stop
          >
            <button
              v-for="opt in moreOptionsItems"
              :key="opt"
              type="button"
              class="label_2_medium primary_text_color flex w-full px-xl py-3xl text-left hover:bg-info-50"
              @click="onMoreOption(opt)"
            >
              {{ opt }}
            </button>
          </div>
        </div>

        <button
          type="button"
          class="inline-flex items-center gap-2 rounded-lg px-4xl py-lg primary_add_button label_1_semibold"
          @click="onAddContacts"
        >
        <img :src="PlusIconWhite" alt="" />
          Add contacts
        </button>
      </div>
    </div>

    <!-- Dynamic Component Content -->
    <div class="transition-all duration-300 h-[70%]">
      <Contact v-if="activeTab === 'contacts'" :contacts="contact" />
      <Segment v-if="activeTab === 'segments'" :contacts="contact" />
      <List
        v-if="activeTab === 'list'"
        ref="listRef"
        @create-list="onListCreated"
        @open-list="onOpenList"
      />
    </div>
    </template>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import Contact from '../components/Audience/Contact.vue'
import Segment from '../components/Audience/Segment.vue'
import List from '../components/Audience/List.vue'
import MasterList from '../components/Audience/list/MasterList.vue'
import ContactsIcon from '../assets/images/ContactsIcon.svg'
import SegmentsIcon from '../assets/images/SegmentsIcon.svg'
import ListIcon from '../assets/images/ListIcon.svg'
import DownArrow from '../assets/images/DownArrow.svg'
import PlusIconWhite from '../assets/images/PlusIconWhite.svg'

const contact = [
  {
    email: 'sam.frank1@domain.com',
    firstName: 'Sam',
    lastName: 'Frank',
    address: 'Lane 4, Kerala',
    phoneNumber: '9876543210',
    userId: '5565IDW'
  },
  {
    email: 'john.doe@domain.com',
    firstName: 'John',
    lastName: 'Doe',
    address: 'MG Road, Bangalore',
    phoneNumber: '9123456780',
    userId: '7823KLM'
  },
  {
    email: 'emma.watson@domain.com',
    firstName: 'Emma',
    lastName: 'Watson',
    address: 'Anna Nagar, Chennai',
    phoneNumber: '9988776655',
    userId: '1298QWE'
  },
  {
    email: 'raj.kumar@domain.com',
    firstName: 'Raj',
    lastName: 'Kumar',
    address: 'Salt Lake, Kolkata',
    phoneNumber: '9012345678',
    userId: '6654RTY'
  },
  {
    email: 'anita.sharma@domain.com',
    firstName: 'Anita',
    lastName: 'Sharma',
    address: 'Andheri West, Mumbai',
    phoneNumber: '8899776655',
    userId: '3345UIO'
  },
  {
    email: 'vikram.singh@domain.com',
    firstName: 'Vikram',
    lastName: 'Singh',
    address: 'Sector 62, Noida',
    phoneNumber: '7766554433',
    userId: '9987PAS'
  },
  {
    email: 'meera.nair@domain.com',
    firstName: 'Meera',
    lastName: 'Nair',
    address: 'Kowdiar, Kerala',
    phoneNumber: '9090909090',
    userId: '1122LKJ'
  },
  {
    email: 'arjun.reddy@domain.com',
    firstName: 'Arjun',
    lastName: 'Reddy',
    address: 'Banjara Hills, Hyderabad',
    phoneNumber: '9345678901',
    userId: '7788HGF'
  },
  {
    email: 'neha.verma@domain.com',
    firstName: 'Neha',
    lastName: 'Verma',
    address: 'Dwarka, Delhi',
    phoneNumber: '9812345678',
    userId: '5566ZXC'
  },
  {
    email: 'rohit.menon@domain.com',
    firstName: 'Rohit',
    lastName: 'Menon',
    address: 'Panampilly Nagar, Kochi',
    phoneNumber: '9871234560',
    userId: '4433VBN'
  },
  {
    email: 'kiran.patel@domain.com',
    firstName: 'Kiran',
    lastName: 'Patel',
    address: 'Navrangpura, Ahmedabad',
    phoneNumber: '9701234567',
    userId: '2211GHJ'
  },
  {
    email: 'pooja.mehta@domain.com',
    firstName: 'Pooja',
    lastName: 'Mehta',
    address: 'Vashi, Navi Mumbai',
    phoneNumber: '9823456789',
    userId: '8877TRE'
  },
  {
    email: 'rahul.iyer@domain.com',
    firstName: 'Rahul',
    lastName: 'Iyer',
    address: 'Adyar, Chennai',
    phoneNumber: '9955667788',
    userId: '6644YUI'
  },
  {
    email: 'divya.naidu@domain.com',
    firstName: 'Divya',
    lastName: 'Naidu',
    address: 'MVP Colony, Vizag',
    phoneNumber: '9087654321',
    userId: '3322QAZ'
  },
  {
    email: 'suresh.nair@domain.com',
    firstName: 'Suresh',
    lastName: 'Nair',
    address: 'Technopark, Trivandrum',
    phoneNumber: '9898989898',
    userId: '1199WSX'
  }
]

const activeTab = ref('list')
const listRef = ref(null)
const activeListDetail = ref(null)
const isMoreOptionsOpen = ref(false)
const moreOptionsRoot = ref(null)

const moreOptionsItems = ['Export contacts', 'Import from file', 'Audience settings']

const hasContacts = computed(() => Array.isArray(contact) && contact.length > 0)

function setActiveTab(tab) {
  activeTab.value = tab
  isMoreOptionsOpen.value = false
}

function toggleMoreOptions() {
  isMoreOptionsOpen.value = !isMoreOptionsOpen.value
}

function onMoreOption(_opt) {
  isMoreOptionsOpen.value = false
}

function onAddContacts() {
  // Hook: open add-contact flow when wired
}

function onCreateList() {
  listRef.value?.openCreateModal()
}

function onListCreated(payload) {
  activeListDetail.value = {
    id: null,
    name: payload?.name?.trim() || 'Master List',
    tags: Array.isArray(payload?.tags) ? payload.tags : [],
    memberCount: 0,
    isNewList: true
  }
}

function onOpenList(row) {
  activeListDetail.value = {
    id: row?.id ?? null,
    name: row?.name ?? 'List',
    tags: Array.isArray(row?.tagIds) ? [...row.tagIds] : [],
    memberCount: Number(row?.memberCount) || 0,
    isNewList: false
  }
}

function handleMoreOptionsClickOutside(event) {
  if (!isMoreOptionsOpen.value) return
  const el = moreOptionsRoot.value
  if (el && el.contains(event.target)) return
  isMoreOptionsOpen.value = false
}

onMounted(() => {
  document.addEventListener('click', handleMoreOptionsClickOutside, true)
  document.addEventListener('touchend', handleMoreOptionsClickOutside, true)
})

onUnmounted(() => {
  document.removeEventListener('click', handleMoreOptionsClickOutside, true)
  document.removeEventListener('touchend', handleMoreOptionsClickOutside, true)
})
</script>