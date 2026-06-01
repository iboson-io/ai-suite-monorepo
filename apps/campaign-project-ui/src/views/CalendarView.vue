<template>
  <main class="flex-1 bg_primary_color  px-3xl py-12xl md:px-10xl lg:py-10xl">
    <div>
      <!-- Header -->
      <div class="rounded-xl bg_secondary_color p-6xl primary_border_color">
        <h2 class="primary_text_color heading_h6_bold ">Calendar</h2>
        <p class="label_1_regular secondary_text_color mt-md">
          Manage your brands, connect their channels, and keep assets in one place.
        </p>
      </div>

      <!-- Controls -->
      <div
        class="flex items-center justify-between rounded-xl bg_secondary_color primary_border_color py-md px-6xl gap-0 lg:gap-3xl md:gap-0 flex-col lg:flex-row mt-5xl">
        <!-- View Switch -->
        <div class="flex rounded-full bg-gray-25 primary_border_color p-xs w-full justify-center  mt-xl lg:mt-0 lg:w-auto">
          <button v-for="view in views" :key="view" @click="activeView = view"
            class="rounded-full primary_border_color px-6xl md:px-12xl lg:px-4xl py-xs label_2_semibold" :class="
            activeView === view
              ? 'bg_secondary_color primary_text_color'
              : 'secondary_text_color'
          ">
            {{ view }}
          </button>
        </div>

        <!-- Right Actions -->
        <div class="flex flex-col md:flex-row items-center gap-4xl mt-5xl mb-xl w-full justify-center lg:w-auto lg:mt-0 lg:mb-0">
          <img :src="ProductIcon" alt="" class="hidden lg:block mr-[-40px] md:mr-[-44px] z-10">
          <div class="relative w-full lg:w-1/2">
            <img :src="ProductIcon" alt="" class="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 z-10 pointer-events-none lg:hidden">
            <button
              @click="toggleProductDropdown"
              class="flex items-center w-full gap-md rounded-lg regular_border_color pl-10xl pr-10xl md:pl-10xl md:pr-10xl py-md label_2_medium primary_text_color bg_secondary_color product-select relative"
              :class="isProductDropdownOpen ? 'border-[3px] border-[#D9E2FC]':''"
            >
              <span class="product-text whitespace-nowrap truncate">{{ getProductDisplayText() }}</span>
              <img :src="DownArrow" alt="" class="absolute right-3 md:right-4 top-1/2 -translate-y-1/2 pointer-events-none">
            </button>
            
            <!-- Products Dropdown Panel -->
            <div
              v-if="isProductDropdownOpen"
              class="absolute top-full left-0 mt-sm bg_secondary_color rounded-md primary_border_color shadow-lg z-50 min-w-[155px] lg:min-w-[190px]"
              @click.stop
            >
              <div>
                <label
                  :class="['flex items-center gap-md px-xl py-3xl hover:bg-info-50', { 'bg-info-50': selectedProducts.length === 0 }]"
                >
                  <input
                    type="checkbox"
                    :checked="selectedProducts.length === 0"
                    @change="toggleAllProducts"
                    class="w-5xl h-5xl rounded cursor-pointer custom-checkbox"
                  />
                  <span class="label_2_medium primary_text_color">All products</span>
                </label>
                <label
                  v-for="product in calendarProducts"
                  :key="product.id"
                  :class="['flex items-center gap-md px-xl py-3xl border-b primary_border_color hover:bg-info-50', { 'bg-info-50': selectedProducts.includes(product.id) }]"
                >
                  <input
                    type="checkbox"
                    :value="product.id"
                    v-model="selectedProducts"
                    @change="handleProductChange"
                    class="w-5xl h-5xl rounded cursor-pointer custom-checkbox"
                  />
                  <span class="label_2_medium primary_text_color">{{ product.name }}</span>
                </label>
              </div>
              <div class="px-xl pb-xl">
                <button
                  @click="applyProductFilter"
                  class="w-full primary_add_button label_3_medium py-md px-md rounded-b-md"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
          <img :src="AllPlatformsIcon" alt="" class="hidden lg:block mr-[-40px] md:mr-[-44px] z-10">
          <div class="relative w-full lg:w-1/2">
            <img :src="AllPlatformsIcon" alt="" class="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 z-10 pointer-events-none lg:hidden">
            <button
              @click="togglePlatformDropdown"
              class="flex items-center w-full gap-md rounded-lg regular_border_color pl-10xl pr-10xl md:pl-10xl md:pr-10xl py-md label_2_medium primary_text_color bg_secondary_color product-select relative"
              :class="isPlatformDropdownOpen ? 'border-[3px] border-[#D9E2FC]':''"
            >
              <span class="product-text whitespace-nowrap truncate">{{ getPlatformDisplayText() }}</span>
              <img :src="DownArrow" alt="" class="absolute right-3 md:right-4 top-1/2 -translate-y-1/2 pointer-events-none">
            </button>
            
            <!-- Platforms Dropdown Panel -->
            <div
              v-if="isPlatformDropdownOpen"
              class="absolute top-full left-0 mt-sm bg_secondary_color rounded-md primary_border_color shadow-lg z-50 min-w-[155px] lg:min-w-[190px]"
              @click.stop
            >
              <div>
                <label
                  :class="['flex items-center gap-md px-xl py-3xl hover:bg-info-50', { 'bg-info-50': selectedPlatforms.length === 0 }]"
                >
                  <input
                    type="checkbox"
                    :checked="selectedPlatforms.length === 0"
                    @change="toggleAllPlatforms"
                    class="w-5xl h-5xl rounded cursor-pointer custom-checkbox"
                  />
                  <span class="label_2_medium primary_text_color">All platforms</span>
                </label>
                <label
                  v-for="platform in calendarPlatforms"
                  :key="platform.name"
                  :class="['flex items-center gap-md px-xl py-3xl border-b primary_border_color hover:bg-info-50', { 'bg-info-50': selectedPlatforms.includes(platform.name) }]"
                >
                  <input
                    type="checkbox"
                    :value="platform.name"
                    v-model="selectedPlatforms"
                    @change="handlePlatformChange"
                    class="w-5xl h-5xl rounded cursor-pointer custom-checkbox"
                  />
                  <span class="label_2_medium primary_text_color">{{ platform.name }}</span>
                </label>
              </div>
              <div class="px-xl pb-xl">
                <button
                  @click="applyPlatformFilter"
                  class="w-full primary_add_button label_3_medium py-md px-md rounded-b-md"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- MONTH VIEW with Modal -->
      <div v-if="activeView === 'Month'" class="flex items-start lg:items-stretch mt-5xl gap-5xl">
        <!-- Calendar -->
        <div class="rounded-xl bg_secondary_color primary_border_color flex-1 relative"
          :class="selectedDate ? 'md:w-[65%] lg:w-[60%] 2xl:w-[70%]' : 'w-full'">
          <!-- Month Header -->
          <div class="flex items-center justify-between border-b border-gray-25 p-6xl relative z-0">
            <button @click="prevMonth"><img :src="CircleLeftArrow" alt=""></button>
            <p class="heading_h6_semibold primary_text_color">{{ monthYear }}</p>
            <button @click="nextMonth"><img :src="CircleRightArrow" alt=""></button>
          </div>

          <!-- Week Days -->
          <div class="grid grid-cols-7 border-b border-gray-25 bg-gray-25 text-center bg_primary_color relative z-0">
            <div v-for="day in weekDays" :key="day" class="py-3xl label_3_semibold secondary_text_color">
              {{ day }}
            </div>
          </div>

          <!-- Calendar Grid -->
          <div class="grid grid-cols-7 relative z-0"
            :class="selectedDate ? 'pointer-events-none lg:pointer-events-auto' : ''">
            <div v-for="date in calendarDays" :key="date.key" @click="openDateModal(date.fullDate)"
              class="h-14 md:h-[4.4em]  primary_border_color p-lg relative cursor-pointer hover:bg-blue-25 hover:border hover:border-blue-200" :class="[
            date.isToday ? 'border border-blue-200' : '',
            !date.isCurrentMonth ? 'bg_secondary_color' : '',
            isDateSelected(date.fullDate) ? 'bg-blue-25 border-blue-200' : ''
          ]">
              <p class="text-right body_3_medium"
                :class="date.isCurrentMonth ? 'primary_text_color' : 'disable_text_color'">
                {{ date.day }}
              </p>

              <!-- Post Images for Month View (Today and Future) -->
              <div v-if="isDateTodayOrFuture(date.fullDate) && getPostsForDate(date.fullDate).length > 0"
                class="flex flex-wrap gap-xxs mt-sm md:mt-lg">
                <img v-for="(post, idx) in getPostsForDate(date.fullDate).slice(0, 2)" :key="post.id"
                  :src="post.postImage" :alt="`Post ${idx + 1}`" class="w-3xl h-3xl md:w-6xl md:h-6xl rounded object-cover" />
                <span v-if="getPostsForDate(date.fullDate).length > 2" class="label_3_medium secondary_text_color">
                  +{{ getPostsForDate(date.fullDate).length - 2 }}
                </span>
              </div>

              <!-- Post Count Text for Past Dates -->
              <div v-else-if="!isDateTodayOrFuture(date.fullDate) && getPostsForDate(date.fullDate).length > 0"
                class="absolute bottom-0 border_none">
                <p class="text-blue-200 body_4_medium md:body_3_medium">
                  {{ getPostsForDate(date.fullDate).length }} {{ getPostsForDate(date.fullDate).length === 1 ? 'Post' :
                  'Posts' }}
                </p>
              </div>
            </div>
          </div>

          <!-- Black Overlay when date is selected -->
          <div v-if="selectedDate"
            class="block lg:hidden absolute inset-0 bg_overlay rounded-xl z-20 pointer-events-auto"
            @click="closeDateModal"></div>
        </div>

        <!-- Right Side Modal Panel -->
        <div v-if="selectedDate"
          class="hidden lg:flex lg:flex-col lg:min-h-0 w-[30%] h-[37em] lg:w-[40%] 2xl:w-[30%] rounded-xl bg_secondary_color primary_border_color shadow-lg flex-shrink-0 relative z-20 px-xxl py-6xl">
          <!-- Post Detail View -->
          <div v-if="selectedPost" class="flex min-h-0 flex-1 flex-col">
            <!-- Modal Header with Back Button -->
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-6xl">
                <button @click="closePostDetail" class="rounded-full transition-colors" aria-label="Back">
                  <img :src="BackButtonArrow" alt="Back">
                </button>
                <h2 class="label_1_semibold primary_text_color">Post details</h2>
              </div>
              <button @click="closeDateModal" class="p-xs border primary_border_color hover:bg-black-25 rounded-lg transition-colors" aria-label="Close">
                <img :src="closeIcon" alt="">
              </button>
            </div>

        

            <!-- Post Detail Content with Auto Scroll -->
            <div
              class="mt-6xl min-h-0 flex-1 overflow-y-auto primary_border_color p-5xl rounded-lg custom-scrollbar-calendar">
              <!-- Status Badge -->
              <div :class="[
                'inline-flex items-center gap-md p-xl rounded-md label_1_semibold w-full',
                selectedPost.status === 'approved' ? 'bg-success-50 text-success-800' : 'pending_text_style'
              ]">
                <img v-if="selectedPost.status === 'approved'" :src="ApproveIcon" alt="Approved" class="w-4 h-4">
                <img v-else :src="PendingIcon" alt="Pending" class="w-4 h-4">
                <span>{{ selectedPost.status }}</span>
              </div>

              <!-- Post Type Dropdown -->
              <div class="relative mt-xl">
                <img :src="PostFilter" class="absolute left-2 top-[10px]" alt="">
                <select v-model="selectedPost.postType"
                  class="w-full rounded-lg regular_border_color p-md label_2_medium primary_text_color bg_secondary_color appearance-none pl-9xl">


                  <option value="Instagram post (4:5)">Instagram post (4:5)</option>
                  <option value="Instagram post (1:1)">Instagram post (1:1)</option>
                  <option value="Instagram post (9:16)">Instagram post (9:16)</option>
                  <option value="Facebook post (4:5)">Facebook post (4:5)</option>
                  <option value="LinkedIn post (4:5)">LinkedIn post (4:5)</option>
                  <option value="Twitter post (16:9)">Twitter post (16:9)</option>
                </select>
                <img :src="DownArrow" alt="" class="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              </div>

              <!-- Image Preview -->
              <div class="rounded-lg overflow-hidden bg_primary_color flex justify-center items-center mt-xl h-72">
                <img :src="selectedPost.postImage" :alt="selectedPost.title" class="w-full max-w-md object-contain" />
              </div>

              <!-- Caption -->
              <p class="label_2_medium primary_text_color mt-6xl"> Caption</p>
              <div class="relative mt-md">
                <textarea v-model="selectedPost.caption"
                  class="w-full rounded-lg primary_border_color p-xl label_1_regular primary_text_color bg_secondary_color min-h-[140px] resize-none "
                  placeholder="Write your caption here..."></textarea>
                <!-- AI Sparkle Icon -->
                <button class="absolute bottom-3 right-3 p-md">
                  <img :src="AiIcon" alt="">
                </button>
              </div>

              <!-- Platforms -->
              <p class="label_2_medium primary_text_color mt-6xl"> Platforms</p>
              <div class="flex items-center gap-xl mt-md overflow-auto hide-scrollbar">
                <img v-for="platform in selectedPost.platforms" :key="platform" :src="getPlatformIcon(platform)"
                  :alt="platform" class="h-10 w-10 shrink-0 object-contain"
                  @error="onCalendarPlatformIconError" />
                <img @click="openPlatformModal" :src="ImageEditIcon" alt=""
                  class=" primary_border_color rounded-lg p-md cursor-pointer w-10 h-10">
              </div>

              <!-- Scheduled For -->
              <div class="mt-6xl p-3xl primary_border_color rounded-lg">
                <p class="flex justify-between" v-html="formatScheduledTime(selectedPost, true)"
                  @click="handleTimeClick">
                </p>
              </div>

              <!-- Action Buttons -->
              <div class="flex items-center gap-6xl  mt-6xl relative">
                <div class="relative px-4xl py-md bg-gray-25 rounded-lg hover:bg-black-25" >
                  <button @click.stop="togglePostMenu" class="relative" ref="dotsButtonRef">
                    <img :src="DotsIcon" alt="" class="mb-xs">
                  </button>

                  <!-- Post Actions Dropdown Menu -->
                  <TogglePostModal ref="togglePostModalRef" :open="showPostMenu" @close="showPostMenu = false"
                    @share="handleShareNow" @regenerate="handleRegeneratePost" @delete="handleDeletePost" />
                </div>

                <button @click="savePostChanges" :disabled="!hasUnsavedChanges || savePostLoading"
                  class="rounded-lg p-md label_1_semibold flex justify-center gap-md w-full transition-opacity primary_2_text_color"
                  :class="hasUnsavedChanges && !savePostLoading ? 'primary_add_button' : 'primary_add_button opacity-50 cursor-not-allowed'">
                  <img v-if="!savePostLoading" :src="SaveIcon" alt="">
                  {{ savePostLoading ? "Saving…" : "Save Changes" }}
                </button>
              </div>
              <p v-if="savePostError" class="label_3_regular mt-3 text-red-600">{{ savePostError }}</p>
            </div>
          </div>

          <!-- Posts List View -->
          <div v-else class="flex min-h-0 flex-1 flex-col">
            <!-- Modal Header -->
            <div class="flex items-center justify-between">
              <h2 class="heading_h6_semibold primary_text_color">
                {{ formatSelectedDate(selectedDate) }}
              </h2>

              <button @click="closeDateModal" class="p-xs  rounded-lg border primary_border_color hover:bg-black-25 transition-colors" aria-label="Close">
                <img :src="closeIcon" alt="">
              </button>
            </div>

            <div class="block h-[1px] w-full bg-gray-25 mt-5xl"></div>

            <!-- Posts List (scroll area matches post detail panel) -->
            <div
              class="mt-6xl min-h-0 flex-1 overflow-y-auto rounded-lg primary_border_color p-5xl custom-scrollbar-calendar">
              <div v-if="getPostsForDate(selectedDate).length === 0" class="text-center py-9xl">
                <p class="label_3_medium secondary_text_color">No posts scheduled for this date</p>
              </div>

              <div v-else class="space-y-4">
                <div v-for="post in getPostsForDate(selectedDate)" :key="post.id" @click="openPostDetail(post)"
                  class="flex gap-xl p-xl rounded-lg primary_border_color cursor-pointer hover:bg-gray-25 transition-colors">
                  <!-- Post Image -->
                  <img :src="post.postImage" :alt="post.title"
                    class="w-20 h-20 md:w-20 md:h-20 rounded-lg object-cover flex-shrink-0" />

                  <!-- Post Details -->
                  <div class="flex-1 min-w-0">
                    <!-- Title -->
                    <h3 class="label_2_semibold primary_text_color">
                      {{ post.title || 'Scheduled Post' }}
                    </h3>

                    <!-- Platforms -->
                    <div class="flex items-center gap-sm  flex-wrap mt-md">
                      <img v-for="platform in post.platforms.slice(0, 4)" :key="platform"
                        :src="getPlatformIcon(platform)" :alt="platform" class="h-5 w-5 shrink-0 object-contain"
                        @error="onCalendarPlatformIconError" />
                      <span v-if="post.platforms.length > 4" class="text-xs label_2_medium primary_text_color">
                        +{{ post.platforms.length - 4 }}
                      </span>
                    </div>

                    <!-- Status and Time -->
                    <div class="flex items-center gap-4 flex-wrap mt-xl">
                      <!-- Status -->
                      <div :class="[
                        'flex items-center gap-2 label_3_semibold',
                        post.status === 'approved' ? 'text-success-700' : 'pending_text_color'
                      ]">

                        <img v-if="post.status === 'approved'" :src="ApproveIcon" alt="Approved">
                        <img v-else :src="PendingIcon" alt="Pending">
                        <span>{{ post.status }}</span>
                      </div>

                      <!-- Time -->
                      <div class="flex items-center gap-2 label_3_semibold secondary_text_color">
                        <img :src="TimeIcon" alt="">
                        <span>{{ formatTime(post.postTime) }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Mobile Modal Overlay -->
      <div v-if="selectedDate && activeView === 'Month'" class="lg:hidden fixed inset-0 z-50 " @click="closeDateModal">
        <div
          class="fixed right-0 top-[41%] md:top-[38%] bottom-0 flex w-full min-h-0 flex-col overflow-hidden bg_secondary_color shadow-2xl transform transition-transform duration-300 ease-in-out p-6xl rounded-lg"
          @click.stop>
          <!-- Post Detail View -->
          <div v-if="selectedPost" class="flex min-h-0 flex-1 flex-col">
            <!-- Modal Header with Back Button -->
            <div>
              <div class="flex items-center justify-between gap-6xl pb-5xl">
                <h2 class="label_1_medium primary_text_color">Post details</h2>
                <button @click="closePostDetail" class="p-xs  rounded-lg border primary_border_color hover:bg-black-25 transition-colors" aria-label="Back">
                  <img :src="closeIcon" alt="Back">
                </button>

              </div>
            </div>

            <!-- Post Detail Content with Auto Scroll -->
            <div class="min-h-0 flex-1 overflow-y-auto custom-scrollbar">

              <div
                class="min-h-0 flex-1 overflow-y-auto primary_border_color p-xl rounded-lg custom-scrollbar-calendar">
              <div class="md:hidden">
                <!-- Status Badge -->
                    <div :class="[
                'inline-flex items-center gap-md p-xl rounded-md label_3_semibold w-full mt-xl md:mt-0',
                selectedPost.status === 'approved' ? 'bg-success-50 text-success-800' : 'pending_text_style'
              ]">
                      <img v-if="selectedPost.status === 'approved'" :src="ApproveIcon" alt="Approved" class="w-4 h-4">
                      <img v-else :src="PendingIcon" alt="Pending" class="w-4 h-4">
                      <span>{{ selectedPost.status }}</span>
                    </div>

                    <!-- Post Type Dropdown -->
                    <div class="relative mt-xl">
                      <img :src="PostFilter" class="absolute left-2 top-[10px]" alt="">
                      <select v-model="selectedPost.postType"
                        class="w-full rounded-lg primary_border_color p-md label_2_regular primary_text_color bg_secondary_color appearance-none pl-9">


                        <option value="Instagram post (4:5)">Instagram post (4:5)</option>
                        <option value="Instagram post (1:1)">Instagram post (1:1)</option>
                        <option value="Instagram post (9:16)">Instagram post (9:16)</option>
                        <option value="Facebook post (4:5)">Facebook post (4:5)</option>
                        <option value="LinkedIn post (4:5)">LinkedIn post (4:5)</option>
                        <option value="Twitter post (16:9)">Twitter post (16:9)</option>
                      </select>
                      <img :src="DownArrow" alt=""
                        class="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    </div>
                </div>
                <div class="md:grid md:grid-cols-2 md:gap-4 mt-xl">
                  <!-- Image Preview -->
                  <div class="rounded-lg overflow-hidden  bg_primary_color flex justify-center items-center h-[16.8em] md:h-[17.8em]">
                    <img :src="selectedPost.postImage" :alt="selectedPost.title"
                      class="w-full max-w-md object-contain" />
                  </div>
                  <div>
                    
                    <!-- Status Badge -->
                     <div class="hidden md:block lg:hidden">
                    <div :class="[
                'inline-flex items-center gap-md p-xl rounded-md label_3_semibold w-full mt-xl md:mt-0',
                selectedPost.status === 'approved' ? 'bg-success-50 text-success-800' : 'pending_text_style'
              ]">
                      <img v-if="selectedPost.status === 'approved'" :src="ApproveIcon" alt="Approved" class="w-4 h-4">
                      <img v-else :src="PendingIcon" alt="Pending" class="w-4 h-4">
                      <span>{{ selectedPost.status }}</span>
                    </div>

                    <!-- Post Type Dropdown -->
                    <div class="relative mt-xl">
                      <img :src="PostFilter" class="absolute left-2 top-[10px]" alt="">
                      <select v-model="selectedPost.postType"
                        class="w-full rounded-lg primary_border_color p-md label_2_regular primary_text_color bg_secondary_color appearance-none pl-9">


                        <option value="Instagram post (4:5)">Instagram post (4:5)</option>
                        <option value="Instagram post (1:1)">Instagram post (1:1)</option>
                        <option value="Instagram post (9:16)">Instagram post (9:16)</option>
                        <option value="Facebook post (4:5)">Facebook post (4:5)</option>
                        <option value="LinkedIn post (4:5)">LinkedIn post (4:5)</option>
                        <option value="Twitter post (16:9)">Twitter post (16:9)</option>
                      </select>
                      <img :src="DownArrow" alt=""
                        class="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    </div>
                  </div>
                    <!-- Caption -->
                    <p class="label_2_semibold primary_text_color mt-6xl"> Caption</p>
                    <div class="relative mt-md">
                      <textarea v-model="selectedPost.caption"
                        class="w-full rounded-lg regular_border_color p-xl label_1_regular bg_secondary_color min-h-[140px] resize-none "
                        placeholder="Write your caption here..."></textarea>
                      <!-- AI Sparkle Icon -->
                      <button class="absolute bottom-3 right-3 p-md">
                        <img :src="AiIcon" alt="">
                      </button>
                    </div>
                  </div>
                </div>
                <!-- Platforms -->
                <div class="">
                  <p class="label_2_medium primary_text_color mt-6xl left-8"> Platforms</p>
                  <div class="flex items-center gap-xl mt-md overflow-auto hide-scrollbar">
                    <img v-for="platform in selectedPost.platforms" :key="platform" :src="getPlatformIcon(platform)"
                      :alt="platform" class="h-10 w-10 shrink-0 object-contain"
                      @error="onCalendarPlatformIconError" />
                    <img @click="openPlatformModal" :src="ImageEditIcon" alt=""
                      class=" primary_border_color rounded-lg p-md cursor-pointer w-10 h-10">
                  </div>
                </div>
                <!-- Scheduled For -->
                <div class="mt-6xl p-3xl primary_border_color rounded-lg">
                  <p class="flex justify-between" v-html="formatScheduledTime(selectedPost, true)"
                    @click="handleTimeClick">
                  </p>
                </div>

                <!-- Action Buttons -->
                <div class="flex items-center gap-6xl  mt-6xl relative">
                  <div class="relative px-4xl py-md bg-gray-25 rounded-lg hover:bg-black-25">
                    <button @click.stop="togglePostMenu" class="relative" ref="dotsButtonRefMobile">
                      <img :src="DotsIcon" alt="" class="mb-xs">
                    </button>

                    <!-- Post Actions Dropdown Menu -->
                    <TogglePostModal ref="togglePostModalRefMobile" :open="showPostMenu" @close="showPostMenu = false"
                      @share="handleShareNow" @regenerate="handleRegeneratePost" @delete="handleDeletePost" />
                  </div>

                  <button @click="savePostChanges" :disabled="!hasUnsavedChanges || savePostLoading"
                    class="rounded-lg p-md label_2_semibold primary_2_text_color flex justify-center gap-md w-full transition-opacity"
                    :class="hasUnsavedChanges && !savePostLoading ? 'primary_add_button' : 'primary_add_button opacity-50 cursor-not-allowed'">
                    <img v-if="!savePostLoading" :src="SaveIcon" alt="">
                    {{ savePostLoading ? "Saving…" : "Save Changes" }}
                  </button>
                </div>
                <p v-if="savePostError" class="label_3_regular mt-3 text-red-600">{{ savePostError }}</p>
              </div>
            </div>
          </div>

          <!-- Posts List View -->
          <div v-else class="flex min-h-0 flex-1 flex-col">
            <!-- Modal Header -->
            <div class="flex items-center justify-between">
              <h2 class="heading_h6_semibold primary_text_color">
                {{ formatSelectedDate(selectedDate) }}
              </h2>
              <button @click="closeDateModal" class=" rounded-full transition-colors" aria-label="Close">
                <img :src="closeIcon" alt="">
              </button>
            </div>
            <div class="block h-[2px] w-full bg_primary_color mt-5xl"></div>
            <!-- Posts List (scroll area matches post detail panel) -->
            <div
              class="mt-6xl min-h-0 flex-1 overflow-y-auto rounded-lg primary_border_color p-5xl custom-scrollbar-calendar">
              <div v-if="getPostsForDate(selectedDate).length === 0" class="text-center py-8">
                <p class="label_3_medium secondary_text_color">No posts scheduled for this date</p>
              </div>

              <div v-else class="space-y-4">
                <div v-for="post in getPostsForDate(selectedDate)" :key="post.id" @click="openPostDetail(post)"
                  class="flex gap-4 rounded-lg p-xl primary_border_color cursor-pointer hover:bg-gray-50 transition-colors">
                  <!-- Post Image -->
                  <img :src="post.postImage" :alt="post.title"
                    class="w-20 h-20 md:w-20 md:h-20 rounded-lg object-cover flex-shrink-0" />

                  <!-- Post Details -->
                  <div class="flex-1 min-w-0">
                    <!-- Title -->
                    <h3 class="label_2_semibold primary_text_color">
                      {{ post.title || 'Scheduled Post' }}
                    </h3>

                    <!-- Platforms -->
                    <div class="flex items-center gap-2 flex-wrap mt-md">
                      <img v-for="platform in post.platforms.slice(0, 4)" :key="platform"
                        :src="getPlatformIcon(platform)" :alt="platform" class="h-5 w-5 shrink-0 object-contain"
                        @error="onCalendarPlatformIconError" />
                      <span v-if="post.platforms.length > 4" class="text-xs label_2_medium primary_text_color">
                        +{{ post.platforms.length - 4 }}
                      </span>
                    </div>

                    <!-- Status and Time -->
                    <div class="flex items-center gap-4 flex-wrap mt-xl">
                      <!-- Status -->
                      <div :class="[
                        'flex items-center gap-2 label_3_semibold',
                        post.status === 'approved' ? 'text-success-700' : 'pending_text_color'
                      ]">
                        <img v-if="post.status === 'approved'" :src="ApproveIcon" alt="Approved">
                        <img v-else :src="PendingIcon" alt="Pending">
                        <span>{{ post.status }}</span>
                      </div>

                      <!-- Time -->
                      <div class="flex items-center gap-2 label_3_semibold secondary_text_color">
                        <img :src="TimeIcon" alt="">
                        <span>{{ formatTime(post.postTime) }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- WEEK VIEW -->
      <div v-if="activeView === 'Week'" class="rounded-xl bg_secondary_color mt-5xl shadow">
        <div class="flex items-center justify-between border-b border-gray-25 p-6xl">
          <button @click="prevWeek"><img :src="CircleLeftArrow" alt=""></button>
          <p class="heading_h6_semibold primary_text_color">{{ monthYear }}</p>
          <button @click="nextWeek"> <img :src="CircleRightArrow" alt=""></button>
        </div>

        <!-- Mobile Week View -->
        <div class="md:hidden">
          <!-- Week Header - Mobile -->
          <div class="flex items-center justify-between  bg-gray-25 p-md gap-xs">
            <div v-for="day in weekDaysOnly" :key="day.day" @click="selectedWeekDay = day.dateString"
              class="flex-1 text-center cursor-pointer" :class="[
              selectedWeekDay === day.dateString || (selectedWeekDay === null && day.isToday) 
                ? 'bg-blue-25 rounded-lg py-md' 
                : ''
            ]">
              <p class="label_2_semibold flex flex-col  active:bg_primary_color" :class="selectedWeekDay === day.dateString || (selectedWeekDay === null && day.isToday) 
                ? 'primary_text_color' 
                : 'secondary_text_color'">
               <span class="active:bg_primary_color">{{ day.dateNumber }} </span> <span class=" active:bg_primary_color">{{ day.dayLabel }}</span>
              </p>
            </div>
          </div>

          <!-- Time Slots - Mobile -->
          <div ref="mobileWeekScrollContainer" class="overflow-auto h-[64vh] hide-scrollbar">
            <div v-for="hour in 24" :key="hour" class="border-b border-gray-25 relative min-h-32">
              <div class="flex">
                <!-- Time Label -->
                <div class="w-20 flex-shrink-0 px-md label_2_semibold primary_text_color absolute bottom-0 pb-md">
                  {{ formatHour(hour === 24 ? 0 : hour - 1) }}
                </div>

                <!-- Posts Column -->
                <div class="flex-1 relative pl-20">
                  <!-- Posts for selected day and hour -->
                  <div v-for="post in getPostsForWeekDayAndHourMobile(hour)" :key="post.id" :data-post-id="post.id"
                    :data-post-hour="hour"
                    class="absolute left-20 right-1 rounded-md bg_secondary_color shadow-sm primary_border_color p-md z-10 max-w-72"
                    :style="{
                    top: `${getPostTopPosition(post.postTime)}px`,
                    height: 'auto',
                    minHeight: '60px',
                    maxHeight: '90px'
                  }">
                    <div class="flex gap-2">
                      <!-- Post Image -->
                      <img :src="post.postImage" :alt="`Post ${post.id}`"
                        class="w-12 h-12 rounded object-cover flex-shrink-0" />

                      <!-- Post Details -->
                      <div class="flex-1 min-w-0">
                        <p class="label_2_semibold primary_text_color">
                          {{ post.title || 'Scheduled Post' }}
                        </p>

                        <!-- Platforms -->
                        <div class="flex items-center gap-2  flex-wrap mt-md">
                          <img v-for="platform in post.platforms.slice(0, 4)" :key="platform"
                            :src="getPlatformIcon(platform)" :alt="platform" class="h-4 w-4 shrink-0 object-contain"
                            @error="onCalendarPlatformIconError" />
                          <span v-if="post.platforms.length > 4" class="text-xs label_2_medium primary_text_color">
                            +{{ post.platforms.length - 4 }}
                          </span>
                        </div>

                        <!-- Status and Time -->
                        <!-- Status and Time -->
                        <div class="flex items-center gap-4 flex-wrap mt-xl">
                          <!-- Status -->
                          <div :class="[
                      'flex items-center gap-md label_3_semibold',
                      post.status === 'approved' ? 'text-success-700' : 'pending_text_color'
                    ]">
                            <img v-if="post.status === 'approved'" :src="ApproveIcon" alt="Approved">
                            <img v-else :src="PendingIcon" alt="Pending">
                            <span>{{ post.status }}</span>
                          </div>

                          <!-- Time -->
                          <div class="flex items-center gap-2 label_3_semibold secondary_text_color">
                            <img :src="TimeIcon" alt="">
                            <span>{{ formatTime(post.postTime) }}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Desktop Week View -->
        <div class="hidden md:block">
          <!-- Week Header -->
          <div class="grid border-b border-gray-25 bg-gray-25" :class="windowWidth >= 768 ? '' : 'grid-cols-8'"
            :style="windowWidth >= 768 ? { gridTemplateColumns: weekGridTemplate } : {}">
            <div class="border-r primary_border_color"></div>
            <div v-for="day in weekDaysOnly" :key="day.day"
              class=" md:p-3xl text-center border-r primary_border_color last:border-r-0"
              :class="day.isToday ? 'bg-blue-25 ' : ''">
              <p class="heading_h5_semibold" :class="day.isToday ? 'text-blue-300' : 'primary_text_color'">
                {{ day.dateNumber }}
              </p>

              <p class="body_4_medium secondary_text_color mt-lg">
                {{ day.dayLabel }}
              </p>
            </div>
          </div>

          <!-- Week Grid with Time Slots and Posts -->
          <div ref="desktopWeekScrollContainer" class="grid overflow-auto h-[44vh] hide-scrollbar"
            :class="windowWidth >= 768 ? '' : 'grid-cols-8'"
            :style="windowWidth >= 768 ? { gridTemplateColumns: weekGridTemplate } : {}">
            <!-- Time Column -->
            <div class="border-r primary_border_color">
              <div v-for="hour in 24" :key="hour" class="h-24 border-b border-gray-25 flex items-end pt-md px-md label_2_semibold primary_text_color">
                {{ formatHour(hour === 24 ? 0 : hour - 1) }}
              </div>
            </div>

            <!-- Day Columns -->
            <div v-for="day in weekDaysOnly" :key="day.day" class="border-r border-gray-25 last:border-r-0 relative">
              <div v-for="hour in 24" :key="hour" class="h-24 border-b border-gray-25 relative">
                <!-- Posts for this day and hour -->
                <div v-for="post in getPostsForWeekDayAndHour(day.dateString, hour)" :key="post.id"
                  :data-post-id="post.id"
                  class="absolute left-1 right-1 rounded-md bg_primary_color shadow-sm primary_border_color p-sm z-10 w-60"
                  :style="{
                  top: `${getPostTopPosition(post.postTime)}px`,
                  height: 'auto',
                  minHeight: '60px',
                  maxHeight: '90px'
                }">
                  <div class="flex gap-md">
                    <!-- Post Image -->
                    <img :src="post.postImage" :alt="`Post ${post.id}`"
                      class="w-12 h-12 rounded object-cover flex-shrink-0" />

                    <!-- Post Details -->
                    <div class="flex-1 min-w-0">
                      <p class="label_2_semibold primary_text_color">
                        {{ post.title || 'Scheduled Post' }}
                      </p>

                      <!-- Platforms -->
                      <div class="flex items-center gap-sm  flex-wrap mt-md">
                        <img v-for="platform in post.platforms.slice(0, 4)" :key="platform"
                          :src="getPlatformIcon(platform)" :alt="platform" class="h-4 w-4 shrink-0 object-contain"
                          @error="onCalendarPlatformIconError" />
                        <span v-if="post.platforms.length > 4" class="text-xs bady_4_medium secondary_text_color">
                          +{{ post.platforms.length - 4 }}
                        </span>
                      </div>

                      <!-- Status and Time -->
                      <div class="flex items-center gap-3xl label_3_semibold mt-md">
                        <span :class="[
                          'flex items-center gap-xs ',
                          post.status === 'approved' ? 'text-success-700' : 'pending_text_color'
                        ]">
                          <img v-if="post.status === 'approved'" :src="ApproveIcon" alt="Approved">
                          <img v-else :src="PendingIcon" alt="Pending">
                          {{ post.status === 'approved' ? 'Approved' : 'Pending' }}
                        </span>
                        <!-- Time -->
                        <span class="flex items-center gap-xs secondary_text_color">
                          <img :src="TimeIcon" alt="">
                          {{ formatTime(post.postTime) }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- DAY VIEW -->
      <div v-if="activeView === 'Day'" class="rounded-xl bg_secondary_color primary_border_color shadow mt-5xl">

        <!-- Day Header -->
        <div class="flex items-center justify-between border-b border-gray-25 p-6xl">
          <button @click="prevDay"><img :src="CircleLeftArrow" alt=""></button>

          <p class="heading_h6_semibold primary_text_color">
            {{ fullDate }}
          </p>

          <button @click="nextDay"><img :src="CircleRightArrow" alt=""></button>
        </div>



        <div class="flex flex-col items-start justify-center border-b border-gray-25 primary_text_color p-3xl bg-gray-25">
          <p class="heading_h5_semibold primary_text_color ml-xs">
            {{ dayNumber }}
          </p>
          <p class="body_4_medium secondary_text_color ml-xs mt-lg">
            {{ dayShort }}
          </p>
        </div>

        <!-- Day Grid with Time Slots and Posts -->
        <div ref="dayViewScrollContainer"
          class="grid grid-cols-[30%_70%] md:grid-cols-[20%_80%] overflow-auto h-[60vh] md:h-[44vh] hide-scrollbar">
          <!-- Time Column -->
          <div>
            <div v-for="hour in 24" :key="hour" class="h-24 border-b border-gray-25 flex items-end pt-md px-md label_2_semibold primary_text_color">
              {{ formatHour(hour === 24 ? 0 : hour - 1) }}
            </div>
          </div>

          <!-- Posts Column -->
          <div class="relative">
            <div v-for="hour in 24" :key="hour" class="h-24 border-b border-gray-25 relative ">
              <!-- Posts for this day and hour -->
              <div v-for="post in getPostsForDayAndHour(hour)" :key="post.id" :data-post-id="post.id"
                class="absolute left-1 right-1 rounded-md bg_primary_color shadow-sm primary_border_color p-sm z-10 md:w-[35%]"
                :style="{
            top: `${getPostTopPosition(post.postTime)}px`,
            height: 'auto',
            minHeight: '60px',
            maxHeight: '90px'
          }">
                <div class="flex gap-sm">
                  <!-- Post Image -->
                  <img :src="post.postImage" :alt="`Post ${post.id}`"
                    class="w-12 h-12 rounded object-cover flex-shrink-0" />

                  <!-- Post Details -->
                  <div class="flex-1 min-w-0">
                    <p class="label_2_semibold primary_text_color">
                      {{ post.title || 'Scheduled Post' }}
                    </p>

                    <!-- Platforms -->
                    <div class="flex items-center gap-sm flex-wrap mt-md">
                      <img v-for="platform in post.platforms.slice(0, 4)" :key="platform"
                        :src="getPlatformIcon(platform)" :alt="platform" class="h-4 w-4 shrink-0 object-contain"
                        @error="onCalendarPlatformIconError" />
                      <span v-if="post.platforms.length > 4" class="text-xs label_2_medium primary_text_color">
                        +{{ post.platforms.length - 4 }}
                      </span>
                    </div>

                    <!-- Status and Time -->
                    <div class="flex items-center gap-3xl label_3_semibold mt-md">
                      <span :class="[
                    'flex items-center gap-xs',
                    post.status === 'approved' ? 'text-success-700' : 'pending_text_color'
                  ]">
                        <img v-if="post.status === 'approved'" :src="ApproveIcon" alt="Approved">
                        <img v-else :src="PendingIcon" alt="Pending">
                        {{ post.status === 'approved' ? 'Approved' : 'Pending' }}
                      </span>
                      <span class="flex items-center gap-xs secondary_text_color">
                        <img :src="TimeIcon" alt="">
                        {{ formatTime(post.postTime) }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>

    <!-- Social Media Platform Modal -->
    <SocialMediaModal
      :open="showPlatformModal"
      require-product-id
      :product-id="calendarModalProductId"
      :selected-platforms="selectedPost ? selectedPost.platforms : []"
      @close="closePlatformModal"
      @update:selected-platforms="updatePlatforms"
      @add-platforms="handleAddPlatformsFromCalendarModal"
    />

    <!-- Scheduler Calendar Modal -->
    <SchedulerCalendarModal :open="showSchedulerModal" :initial-date="schedulerInitialDate"
      :initial-time="schedulerInitialTime" @close="closeSchedulerModal" @schedule="handleSchedule" />

    <!-- Delete Post Confirmation Modal -->
    <DeletePostModal :open="showDeleteModal" @close="closeDeleteModal" @confirm="confirmDeletePost" />

  </main>
</template>

<script setup>
  import { ref, computed, watch, nextTick, onMounted, onUnmounted } from "vue";
  import ProductIcon from "../assets/images/ProductIcon.svg"
  import AiIcon from "../assets/images/AiIcon.svg"
  import WhitePlusIcon from "../assets/images/WhitePlusIcon.svg"
  import CircleLeftArrow from "../assets/images/CircleLeftArrow.svg"
  import CircleRightArrow from "../assets/images/CircleRightArrow.svg"
  import DownArrow from "../assets/images/DownArrow.svg"
  import PlatformIcon from "../assets/images/PlatformIcon.svg"
  import closeIcon from "../assets/images/closeIcon.svg"
  import PendingIcon from "../assets/images/PendingIcon.svg"
  import ApproveIcon from "../assets/images/ApproveIcon.svg"
  import TimeIcon from "../assets/images/TimeIcon.svg"
  import BackButtonArrow from "../assets/images/BackButtonArrow.svg"
  import PostFilter from "../assets/images/PostFilter.svg"
  import ImageEditIcon from "../assets/images/ImageEditIcon.svg"
  import DotsIcon from "../assets/images/DotsIcon.svg"
  import SaveIcon from "../assets/images/SaveIcon.svg"
  import SocialMediaModal from "../components/Calendar/SocialMediaModal.vue"
  import TogglePostModal from "../components/Calendar/TogglePostModal.vue"
  import { SchedulerCalendarModal, DeletePostModal } from "@ai-suite/shared-ui"
  import AllPlatformsIcon from "../assets/images/AllPlatformsIcon.svg"
  import api from "../services/api.js"
  import { useRouter } from "vue-router";

  const router = useRouter();
  const selectedTime = ref(null);
  const selectedDate = ref(null);
  const selectedPost = ref(null); // Selected post for detail view
  const selectedWeekDay = ref(null); // For mobile week view
  const mobileWeekScrollContainer = ref(null); // Ref for mobile week scroll container
  const desktopWeekScrollContainer = ref(null); // Ref for desktop week scroll container
  const dayViewScrollContainer = ref(null); // Ref for day view scroll container
  const windowWidth = ref(typeof window !== 'undefined' ? window.innerWidth : 1024);
  const showPlatformModal = ref(false); // State for platform modal
  const showSchedulerModal = ref(false); // State for scheduler modal
  const schedulerInitialDate = ref(null); // Initial date for scheduler
  const schedulerInitialTime = ref(null); // Initial time for scheduler
  const originalPost = ref(null); // Store original post data to track changes
  const hasUnsavedChanges = ref(false); // Track if there are unsaved changes
  const savePostLoading = ref(false);
  const savePostError = ref("");
  const showPostMenu = ref(false); // State for post actions dropdown menu
  const dotsButtonRef = ref(null); // Ref for dots button (desktop)
  const dotsButtonRefMobile = ref(null); // Ref for dots button (mobile)
  const togglePostModalRef = ref(null); // Ref for dropdown modal (desktop)
  const togglePostModalRefMobile = ref(null); // Ref for dropdown modal (mobile)
  const showDeleteModal = ref(false); // State for delete confirmation modal

  // Update window width on resize
  const handleResize = () => {
    windowWidth.value = window.innerWidth;
  };

  const calendarProducts = ref([]);

  const fetchCalendarProducts = async () => {
    try {
      const response = await api.get("/api/products");
      let list = [];
      if (Array.isArray(response.data)) {
        list = response.data;
      } else if (response.data?.products && Array.isArray(response.data.products)) {
        list = response.data.products;
      }
      calendarProducts.value = list;
    } catch (e) {
      console.error("Error fetching products:", e);
      calendarProducts.value = [];
    }
  };

  const calendarPlatforms = ref([]);

  const fetchCalendarPlatforms = async () => {
    try {
      const response = await api.get("/api/platforms");
      let list = [];
      if (Array.isArray(response.data)) {
        list = response.data;
      } else if (response.data?.platforms && Array.isArray(response.data.platforms)) {
        list = response.data.platforms;
      }
      calendarPlatforms.value = list;
    } catch (e) {
      console.error("Error fetching platforms:", e);
      calendarPlatforms.value = [];
    }
  };

  const scheduledPosts = ref([]);

  /** `postDate` (YYYY-MM-DD) + `postTime` (HH:mm) → ISO for `scheduledAt` on PUT /post/:id */
  const postLocalDateTimeToIso = (postDateStr, postTimeStr) => {
    if (!postDateStr || !postTimeStr) return null;
    const [y, mo, d] = String(postDateStr).split("-").map(Number);
    const [hh, mm] = String(postTimeStr).split(":").map(Number);
    if (!Number.isFinite(y) || !Number.isFinite(hh)) return null;
    const dt = new Date(y, (mo || 1) - 1, d || 1, hh || 0, mm || 0, 0, 0);
    if (Number.isNaN(dt.getTime())) return null;
    return dt.toISOString();
  };

  /** FormData for `PUT /post/:id` from calendar post detail panel. */
  const buildCalendarPostUpdateFormData = (post) => {
    const fd = new FormData();
    if (post.title != null && String(post.title).trim() !== "") {
      fd.append("title", String(post.title).trim());
    }
    if (post.caption != null) {
      fd.append("content", String(post.caption));
    }
    if (post.postImage != null && String(post.postImage).trim() !== "") {
      fd.append("imageUrl", String(post.postImage).trim());
    }
    const platformsStr =
      Array.isArray(post.platforms) && post.platforms.length > 0
        ? post.platforms
            .map((p) => String(p).toLowerCase().trim())
            .filter(Boolean)
            .join(",")
        : "";
    fd.append("platforms", platformsStr);
    const iso = postLocalDateTimeToIso(post.postDate, post.postTime);
    if (iso) {
      fd.append("scheduledAt", iso);
    }
    if (post.status != null && String(post.status).trim() !== "") {
      fd.append("status", String(post.status).trim());
    }
    return fd;
  };

  /** Map GET /post item to calendar post shape (postDate/postTime from scheduledAt; caption from content). */
  const mapApiPostToCalendarPost = (apiPost) => {
    const scheduledAt = apiPost.scheduledAt ? new Date(apiPost.scheduledAt) : null;
    const fallbackSource = apiPost.updatedAt || apiPost.createdAt;
    const fallback = fallbackSource ? new Date(fallbackSource) : new Date();
    const when =
      scheduledAt && !Number.isNaN(scheduledAt.getTime()) ? scheduledAt : fallback;

    const hours = when.getHours();
    const minutes = when.getMinutes();
    const postTime = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
    const postDate = formatDateToString(when);

    let platforms = [];
    if (Array.isArray(apiPost.platforms)) {
      platforms = apiPost.platforms.map((p) =>
        typeof p === "string" ? p.toLowerCase() : String(p).toLowerCase()
      );
    }

    const placeholderImage =
      "https://png.pngtree.com/png-vector/20221125/ourmid/pngtree-no-image-available-icon-flatvector-illustration-thumbnail-graphic-illustration-vector-png-image_40966590.jpg";

    const productId =
      apiPost.productId ??
      apiPost.product_id ??
      (typeof apiPost.product === "object" && apiPost.product != null
        ? apiPost.product.id
        : null) ??
      null;

    return {
      id: apiPost.id,
      productId: productId != null ? String(productId) : null,
      caption: apiPost.content ?? "",
      postImage: apiPost.imageUrl || placeholderImage,
      platforms,
      postDate,
      postTime,
      status: apiPost.status ?? "draft",
      postType: "Instagram post (4:5)",
      title: apiPost.title?.trim() || "Post",
    };
  };

  const fetchScheduledPosts = async () => {
    try {
      const response = await api.get("/post");
      let list = [];
      if (Array.isArray(response.data)) {
        list = response.data;
      } else if (response.data?.posts && Array.isArray(response.data.posts)) {
        list = response.data.posts;
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        list = response.data.data;
      }
      scheduledPosts.value = list.map(mapApiPostToCalendarPost);
    } catch (e) {
      console.error("Error fetching scheduled posts:", e);
      scheduledPosts.value = [];
    }
  };

  onMounted(() => {
    fetchCalendarProducts();
    fetchCalendarPlatforms();
    fetchScheduledPosts();
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', handleResize);
      // Use document for better mobile support
      document.addEventListener('click', handleClickOutside, true);
      document.addEventListener('touchend', handleClickOutside, true);
      windowWidth.value = window.innerWidth;
    }
  });

  onUnmounted(() => {
    if (typeof window !== 'undefined') {
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('click', handleClickOutside, true);
      document.removeEventListener('touchend', handleClickOutside, true);
    }
  });

  /* Views */
  const views = ["Day", "Week", "Month"];
  const activeView = ref("Month");

  /* Selected Products and Platforms */
  const selectedProducts = ref([]);
  const selectedPlatforms = ref([]);
  const isProductDropdownOpen = ref(false);
  const isPlatformDropdownOpen = ref(false);

  /* Active Filters (applied when Apply button is clicked) */
  const activeProducts = ref([]);
  const activePlatforms = ref([]);

  /** Resolves product for `GET /api/platforms?productId=` (post first, else calendar filter). */
  const calendarModalProductId = computed(() => {
    const postPid = selectedPost.value?.productId;
    if (postPid != null && String(postPid).trim() !== "") {
      return String(postPid).trim();
    }
    if (selectedProducts.value.length > 0) {
      return selectedProducts.value[0]; // Use first selected product for modal
    }
    return null;
  });

  // Dropdown management functions
  const toggleProductDropdown = () => {
    isProductDropdownOpen.value = !isProductDropdownOpen.value;
    isPlatformDropdownOpen.value = false;
  };

  const togglePlatformDropdown = () => {
    isPlatformDropdownOpen.value = !isPlatformDropdownOpen.value;
    isProductDropdownOpen.value = false;
  };

  const toggleAllProducts = () => {
    if (selectedProducts.value.length === 0) {
      selectedProducts.value = [...calendarProducts.value.map(p => p.id)];
    } else {
      selectedProducts.value = [];
    }
  };

  const toggleAllPlatforms = () => {
    if (selectedPlatforms.value.length === 0) {
      selectedPlatforms.value = [...calendarPlatforms.value.map(p => p.name)];
    } else {
      selectedPlatforms.value = [];
    }
  };

  const handleProductChange = () => {
    // Remove "All products" selection if individual products are selected
    if (selectedProducts.value.length > 0) {
      const allProductsIndex = selectedProducts.value.indexOf(0); // 0 represents "All products"
      if (allProductsIndex > -1) {
        selectedProducts.value.splice(allProductsIndex, 1);
      }
    }
  };

  const handlePlatformChange = () => {
    // Remove "All platforms" selection if individual platforms are selected
    if (selectedPlatforms.value.length > 0) {
      const allPlatformsIndex = selectedPlatforms.value.indexOf(0); // 0 represents "All platforms"
      if (allPlatformsIndex > -1) {
        selectedPlatforms.value.splice(allPlatformsIndex, 1);
      }
    }
  };

  const applyProductFilter = () => {
    activeProducts.value = [...selectedProducts.value];
    isProductDropdownOpen.value = false;
  };

  const applyPlatformFilter = () => {
    activePlatforms.value = [...selectedPlatforms.value];
    isPlatformDropdownOpen.value = false;
  };

  const getProductDisplayText = () => {
    if (activeProducts.value.length === 0) {
      return "All products";
    } else if (activeProducts.value.length === 1) {
      const product = calendarProducts.value.find(p => p.id === activeProducts.value[0]);
      return product ? product.name : "1 product";
    } else {
      return `${activeProducts.value.length} products`;
    }
  };

  const getPlatformDisplayText = () => {
    if (activePlatforms.value.length === 0) {
      return "All platforms";
    } else if (activePlatforms.value.length === 1) {
      return activePlatforms.value[0];
    } else {
      return `${activePlatforms.value.length} platforms`;
    }
  };

  /** `name` key → `icon` URL from `GET /api/platforms` (same as ChatPage / SocialMediaModal). */
  const platformIconUrlByKey = ref({});

  function normalizePlatformIconKey(raw) {
    return String(raw ?? "")
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "");
  }

  const platformIconPlaceholder = PlatformIcon;

  function registerPlatformIconKeys(map, row, iconUrl) {
    const candidates = [
      row?.name,
      row?.label,
      row?.platform,
      row?.slug,
      row?.id != null ? String(row.id) : null,
    ];
    for (const raw of candidates) {
      if (raw == null || String(raw).trim() === "") continue;
      const key = normalizePlatformIconKey(raw);
      if (key) map[key] = iconUrl;
    }
  }

  async function fetchPlatformIconsCatalog(productId = null) {
    try {
      const params = {};
      if (productId) params.productId = productId;
      const response = await api.get("/api/platforms", { params });
      let list = [];
      if (Array.isArray(response.data)) {
        list = response.data;
      } else if (response.data?.platforms && Array.isArray(response.data.platforms)) {
        list = response.data.platforms;
      }
      const map = {};
      for (const p of list) {
        if (typeof p?.icon !== "string" || p.icon.trim() === "") continue;
        const url = p.icon.trim();
        registerPlatformIconKeys(map, p, url);
      }
      platformIconUrlByKey.value = map;
    } catch (e) {
      console.warn("GET /api/platforms (calendar platform icons):", e);
      platformIconUrlByKey.value = {};
    }
  }

  const getPlatformIcon = (platform) => {
    const k = normalizePlatformIconKey(platform);
    const fromApi = platformIconUrlByKey.value[k];
    if (fromApi) return fromApi;
    return platformIconPlaceholder;
  };

  function onCalendarPlatformIconError(e) {
    const el = e?.target;
    if (!el || typeof el !== "object" || !("src" in el)) return;
    if (el.dataset?.platformIconFallbackApplied) return;
    el.dataset.platformIconFallbackApplied = "1";
    el.src = platformIconPlaceholder;
  }

  watch(
    calendarModalProductId,
    (id) => {
      fetchPlatformIconsCatalog(id ?? null);
    },
    { immediate: true }
  );

  /* Date State */
  const currentDate = ref(new Date()); // Current date

  /* Helpers */
  const weekDays = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

  /* Month Label */
  const monthYear = computed(() =>
    currentDate.value.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    })
  );

  /* Month Navigation */
  const prevMonth = () => {
    currentDate.value = new Date(
      currentDate.value.getFullYear(),
      currentDate.value.getMonth() - 1,
      1
    );
  };

  const nextMonth = () => {
    currentDate.value = new Date(
      currentDate.value.getFullYear(),
      currentDate.value.getMonth() + 1,
      1
    );
  };





  // week navigation
  const prevWeek = () => {
    const d = new Date(currentDate.value);
    d.setDate(d.getDate() - 7);
    currentDate.value = d;
    selectedWeekDay.value = null; // Reset to show today's posts
  };

  const nextWeek = () => {
    const d = new Date(currentDate.value);
    d.setDate(d.getDate() + 7);
    currentDate.value = d;
    selectedWeekDay.value = null; // Reset to show today's posts
  };


  const weekDaysOnly = computed(() => {
    const start = new Date(currentDate.value);
    start.setDate(start.getDate() - start.getDay()); // start from Sunday

    return Array.from({ length: 7 }).map((_, i) => {
      const date = new Date(start);
      date.setDate(start.getDate() + i);

      const today = new Date();
      const dateString = formatDateToString(date);

      return {
        day: date.toDateString(), // unique key
        dateNumber: date.getDate(), // 16
        dayLabel: date.toLocaleDateString("en-US", { weekday: "short" }), // Thu
        dateLabel: date.getDate(), // if you want only number
        fullDate: new Date(date), // Full date object for matching
        dateString: dateString, // YYYY-MM-DD format
        isToday:
          date.getDate() === today.getDate() &&
          date.getMonth() === today.getMonth() &&
          date.getFullYear() === today.getFullYear(),
        hasPosts: dayHasPosts(dateString), // Check if day has posts
      };
    });
  });

  // Computed grid template for week view (wider columns for days with posts on md/lg)
  const weekGridTemplate = computed(() => {
    // Base column widths: time column + 7 day columns
    // On md/lg: make columns with posts wider (2x), others normal (1x)
    const timeCol = '80px'; // Fixed width for time column
    const normalCol = 'minmax(0, 1fr)';
    const wideCol = 'minmax(0, 2.2fr)'; // Wider for columns with posts

    const dayCols = weekDaysOnly.value.map(day =>
      day.hasPosts ? wideCol : normalCol
    ).join(' ');

    return `${timeCol} ${dayCols}`;
  });



  // day nagigation

  /* Previous Day */
  const prevDay = () => {
    const date = new Date(currentDate.value);
    date.setDate(date.getDate() - 1);
    currentDate.value = date;
  };

  /* Next Day */
  const nextDay = () => {
    const date = new Date(currentDate.value);
    date.setDate(date.getDate() + 1);
    currentDate.value = date;
  };

  /* Full Date Label */
  const fullDate = computed(() =>
    currentDate.value.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    })
  );

  const dayNumber = computed(() =>
    currentDate.value.getDate()
  );

  const dayShort = computed(() =>
    currentDate.value.toLocaleDateString("en-US", {
      weekday: "short",
    })
  );


  /* Calendar Grid */
  const calendarDays = computed(() => {
    const year = currentDate.value.getFullYear();
    const month = currentDate.value.getMonth();

    const firstDay = new Date(year, month, 1);
    const dayOfWeek = firstDay.getDay();
    const diff = (dayOfWeek + 6) % 7; // days to go back to Monday
    const startDate = new Date(firstDay);
    startDate.setDate(firstDay.getDate() - diff);

    const days = [];
    const today = new Date();

    for (let i = 0; i < 42; i++) {
      const d = new Date(startDate);
      d.setDate(startDate.getDate() + i);

      const isToday =
        d.getDate() === today.getDate() &&
        d.getMonth() === today.getMonth() &&
        d.getFullYear() === today.getFullYear();

      const isCurrentMonth = d.getMonth() === month;

      days.push({
        key: i,
        day: d.getDate(),
        isToday,
        isCurrentMonth,
        fullDate: new Date(d),
      });
    }

    return days;
  });

  /* Week View */
  const currentWeek = computed(() => {
    const start = new Date(currentDate.value);
    const day = start.getDay();
    const diff = start.getDate() - (day === 0 ? 6 : day - 1);
    start.setDate(diff);

    return Array.from({ length: 7 }).map((_, i) => {
      const date = new Date(start);
      date.setDate(start.getDate() + i);

      return {
        label: date.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase(),
        date: date.toLocaleDateString(),
      };
    });
  });



  /* Format Hour */
  const formatHour = (hour) => {
    const h = hour % 12 || 12;
    const ampm = hour < 12 ? 'AM' : 'PM';
    return `${h}:00 ${ampm}`;
  };


  const timeSlots = [
    "09:00 AM",
    "09:30 AM",
    "10:00 AM",
    "10:30 AM",
    "11:00 AM",
    "11:30 AM",
    "12:00 PM",
    "12:30 PM",
    "01:00 PM",
    "01:30 PM",
    "02:00 PM",
    "02:30 PM",
  ];



  const clearPopup = () => {
    selectedDate.value = null;
    selectedTime.value = null;
  };

  /* Helper Functions for Posts */

  // Format date to YYYY-MM-DD
  const formatDateToString = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Check if a date is today or in the future
  const isDateTodayOrFuture = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);

    return checkDate >= today;
  };

  // Get posts for a specific date with filtering by multiple products and platforms
  const getPostsForDate = (date) => {
    const dateString = formatDateToString(date);
    let filteredPosts = scheduledPosts.value.filter(post => post.postDate === dateString);
    
    // Filter by products if any are selected
    if (activeProducts.value.length > 0) {
      filteredPosts = filteredPosts.filter(post => 
        activeProducts.value.includes(post.productId)
      );
    }
    
    // Filter by platforms if any are selected
    if (activePlatforms.value.length > 0) {
      filteredPosts = filteredPosts.filter(post => 
        post.platforms && post.platforms.some(platform => 
          activePlatforms.value.includes(platform)
        )
      );
    }
    
    return filteredPosts;
  };

  // Check if a day has posts (for week view column width) with multiple filtering
  const dayHasPosts = (dateString) => {
    let filteredPosts = scheduledPosts.value.filter(post => post.postDate === dateString);
    
    // Filter by products if any are selected
    if (activeProducts.value.length > 0) {
      filteredPosts = filteredPosts.filter(post => 
        activeProducts.value.includes(post.productId)
      );
    }
    
    // Filter by platforms if any are selected
    if (activePlatforms.value.length > 0) {
      filteredPosts = filteredPosts.filter(post => 
        post.platforms && post.platforms.some(platform => 
          activePlatforms.value.includes(platform)
        )
      );
    }
    
    return filteredPosts.some(post => isDateTodayOrFuture(new Date(post.postDate)));
  };

  // Get posts for a specific date (only today and future posts)
  const getActivePostsForDate = (date) => {
    const dateString = formatDateToString(date);
    return scheduledPosts.value.filter(post => {
      if (post.postDate !== dateString) return false;
      return isDateTodayOrFuture(new Date(post.postDate));
    });
  };

  // Get posts for a specific week day and hour slot (only today and future posts)
  const getPostsForWeekDayAndHour = (dayDateString, hour) => {
    const dateString = dayDateString; // Already in YYYY-MM-DD format

    // hour from loop is 1-24, where 1 = 0:00 (midnight), 2 = 1:00, ..., 24 = 23:00
    // Convert to 0-23 for matching with post times
    const hour24 = hour === 24 ? 23 : hour - 1;

    return scheduledPosts.value.filter(post => {
      if (post.postDate !== dateString) return false;
      if (!isDateTodayOrFuture(new Date(post.postDate))) return false;

      const [postHour] = post.postTime.split(':').map(Number);
      // Show post in the hour slot that matches its hour (e.g., 10:00 and 10:30 both in 10 AM slot)
      return postHour === hour24;
    });
  };

  // Get posts for mobile week view - uses selected day or today
  const getPostsForWeekDayAndHourMobile = (hour) => {
    // Use selected day, or find today's date string if none selected
    let dateString;
    if (selectedWeekDay.value) {
      dateString = selectedWeekDay.value;
    } else {
      const today = new Date();
      dateString = formatDateToString(today);
    }

    // hour from loop is 1-24, where 1 = 0:00 (midnight), 2 = 1:00, ..., 24 = 23:00
    // Convert to 0-23 for matching with post times
    const hour24 = hour === 24 ? 23 : hour - 1;

    return scheduledPosts.value.filter(post => {
      if (post.postDate !== dateString) return false;
      if (!isDateTodayOrFuture(new Date(post.postDate))) return false;

      const [postHour] = post.postTime.split(':').map(Number);
      // Show post in the hour slot that matches its hour (e.g., 10:00 and 10:30 both in 10 AM slot)
      return postHour === hour24;
    });
  };

  // Helper function to scroll to first post in a container
  const scrollToFirstPost = async (container, dateString) => {
    await nextTick();

    if (!container) return;

    const dayPosts = scheduledPosts.value.filter(post => {
      if (post.postDate !== dateString) return false;
      return isDateTodayOrFuture(new Date(post.postDate));
    });

    if (dayPosts.length === 0) return;

    // Sort by time and get the first post
    dayPosts.sort((a, b) => {
      const [aHour, aMin] = a.postTime.split(':').map(Number);
      const [bHour, bMin] = b.postTime.split(':').map(Number);
      return aHour * 60 + aMin - (bHour * 60 + bMin);
    });

    const firstPostId = dayPosts[0].id;

    // Find the first post element by ID
    const firstPostElement = container.querySelector(`[data-post-id="${firstPostId}"]`);

    if (firstPostElement) {
      // Scroll to the first post with smooth behavior
      firstPostElement.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'nearest'
      });
    }
  };

  // Watch for selectedWeekDay changes and scroll to first post (Mobile Week View)
  watch(selectedWeekDay, async () => {
    if (activeView.value !== 'Week') return;

    let dateString;
    if (selectedWeekDay.value) {
      dateString = selectedWeekDay.value;
    } else {
      const today = new Date();
      dateString = formatDateToString(today);
    }

    await scrollToFirstPost(mobileWeekScrollContainer.value, dateString);
  });

  // Helper function to scroll to first post in desktop week view (across all days in week)
  const scrollToFirstPostInWeek = async (container) => {
    await nextTick();

    if (!container) return;

    // Get all dates in the current week
    const weekDates = weekDaysOnly.value.map(day => day.dateString);

    // Get all posts for the week
    const weekPosts = scheduledPosts.value.filter(post => {
      if (!weekDates.includes(post.postDate)) return false;
      return isDateTodayOrFuture(new Date(post.postDate));
    });

    if (weekPosts.length === 0) return;

    // Sort by date and time to get the first post
    weekPosts.sort((a, b) => {
      const [aHour, aMin] = a.postTime.split(':').map(Number);
      const [bHour, bMin] = b.postTime.split(':').map(Number);
      const aTime = aHour * 60 + aMin;
      const bTime = bHour * 60 + bMin;

      // First compare by date, then by time
      if (a.postDate !== b.postDate) {
        return a.postDate.localeCompare(b.postDate);
      }
      return aTime - bTime;
    });

    const firstPostId = weekPosts[0].id;

    // Find the first post element by ID
    const firstPostElement = container.querySelector(`[data-post-id="${firstPostId}"]`);

    if (firstPostElement) {
      // Scroll to the first post with smooth behavior
      firstPostElement.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'nearest'
      });
    }
  };

  // Watch for currentDate changes in Week view and scroll to first post (Desktop Week View)
  watch([currentDate, activeView], async ([newDate, view]) => {
    if (view !== 'Week') return;
    if (!desktopWeekScrollContainer.value) return;

    await scrollToFirstPostInWeek(desktopWeekScrollContainer.value);
  }, { immediate: true });

  // Watch for currentDate changes in Day view and scroll to first post
  watch([currentDate, activeView], async ([newDate, view]) => {
    if (view !== 'Day') return;
    if (!dayViewScrollContainer.value) return;

    const dateString = formatDateToString(newDate);

    await scrollToFirstPost(dayViewScrollContainer.value, dateString);
  }, { immediate: true });

  // Watch for activeView changes to scroll when initially switching to Week or Day tab
  watch(activeView, async (newView) => {
    // Wait for DOM to be ready
    await nextTick();

    // Use requestAnimationFrame to ensure DOM is fully rendered
    requestAnimationFrame(async () => {
      await nextTick();

      if (newView === 'Week') {
        // Desktop Week View
        if (desktopWeekScrollContainer.value) {
          await scrollToFirstPostInWeek(desktopWeekScrollContainer.value);
        }
        // Mobile Week View - scroll to today's first post
        if (mobileWeekScrollContainer.value) {
          const today = new Date();
          const dateString = formatDateToString(today);
          await scrollToFirstPost(mobileWeekScrollContainer.value, dateString);
        }
      } else if (newView === 'Day') {
        if (dayViewScrollContainer.value) {
          const dateString = formatDateToString(currentDate.value);
          await scrollToFirstPost(dayViewScrollContainer.value, dateString);
        }
      }
    });
  });

  // Get posts for the current day and hour slot (Day view) - only today and future posts
  const getPostsForDayAndHour = (hour) => {
    const dateString = formatDateToString(currentDate.value);

    // hour from loop is 1-24, where 1 = 0:00 (midnight), 2 = 1:00, ..., 24 = 23:00
    // Convert to 0-23 for matching with post times
    const hour24 = hour === 24 ? 23 : hour - 1;

    return scheduledPosts.value.filter(post => {
      if (post.postDate !== dateString) return false;
      if (!isDateTodayOrFuture(new Date(post.postDate))) return false;

      const [postHour] = post.postTime.split(':').map(Number);
      // Show post in the hour slot that matches its hour (e.g., 10:00 and 10:30 both in 10 AM slot)
      return postHour === hour24;
    });
  };

  // Get top position for post in hour slot based on minutes
  const getPostTopPosition = (timeString) => {
    const [hours, minutes] = timeString.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes;
    const hourStartMinutes = Math.floor(totalMinutes / 60) * 60;
    const minutesOffset = totalMinutes - hourStartMinutes;

    // Each hour slot is 96px (h-24 = 6rem = 96px)
    // Calculate position based on minutes
    return (minutesOffset / 60) * 96;
  };

  // Format time from HH:mm to readable format
  const formatTime = (timeString) => {
    const [hours, minutes] = timeString.split(':').map(Number);
    const h = hours % 12 || 12;
    const ampm = hours < 12 ? 'AM' : 'PM';
    const m = minutes > 0 ? `:${String(minutes).padStart(2, '0')}` : '';
    return `${h}${m} ${ampm}`;
  };

  // Format selected date for modal header
  const formatSelectedDate = (date) => {
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  // Check if date is selected
  const isDateSelected = (date) => {
    if (!selectedDate.value) return false;
    return formatDateToString(date) === formatDateToString(selectedDate.value);
  };

  // Open date modal
  const openDateModal = (date) => {
    selectedPost.value = null;
    selectedDate.value = date;
  };

  // Close date modal
  const closeDateModal = () => {
    selectedDate.value = null;
    selectedPost.value = null;
  };

  // Open post detail view
  const openPostDetail = (post) => {
    const platforms = Array.isArray(post.platforms) ? [...post.platforms] : [];
    selectedPost.value = { ...post, platforms };
    originalPost.value = { ...post, platforms: [...platforms] };
    hasUnsavedChanges.value = false;
    savePostError.value = "";
  };

  // Close post detail view
  const closePostDetail = () => {
    selectedPost.value = null;
    originalPost.value = null;
    hasUnsavedChanges.value = false;
    savePostError.value = "";
  };

  // Format scheduled time for detail view
  const formatScheduledTime = (post, clickable = false) => {
    if (!post) return '';
    const date = new Date(post.postDate);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const isToday = date.toDateString() === today.toDateString();
    const isTomorrow = date.toDateString() === tomorrow.toDateString();

    let dateLabel = '';
    if (isToday) {
      dateLabel = 'Today';
    } else if (isTomorrow) {
      dateLabel = 'Tomorrow';
    } else {
      dateLabel = date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    }

    const timeDisplay = formatTime(post.postTime);

    return `<span class="label_2_medium secondary_text_color">Scheduled for </span><span class="body_3_medium primary_text_color cursor-pointer"  data-time-clickable="true"> ${dateLabel} <span class="inline-block w-[1px] h-4 mx-1 xl:mx-2 bg-gray-400 align-middle"></span>${timeDisplay}</span>`;
  };

  // Platform modal handlers
  const openPlatformModal = () => {
    if (selectedPost.value) {
      fetchPlatformIconsCatalog(calendarModalProductId.value ?? null);
      showPlatformModal.value = true;
    }
  };

  const closePlatformModal = () => {
    showPlatformModal.value = false;
  };

  const updatePlatforms = (platforms) => {
    if (selectedPost.value) {
      // Only update the local copy, not the main calendar
      selectedPost.value.platforms = platforms;
      // Check if platforms have changed
      checkForChanges();
    }
  };

  const handleAddPlatformsFromCalendarModal = () => {
    showPlatformModal.value = false;
    router.push({ path: "/products" });
  };

  // Scheduler modal handlers
  const openSchedulerModal = (post) => {
    if (post) {
      const date = new Date(post.postDate);
      schedulerInitialDate.value = date;
      schedulerInitialTime.value = post.postTime;
      showSchedulerModal.value = true;
    }
  };

  const closeSchedulerModal = () => {
    showSchedulerModal.value = false;
  };

  const handleSchedule = (scheduleData) => {
    if (selectedPost.value) {
      // Only update the local copy, not the main calendar
      const newDate = scheduleData.date;
      const newTime = scheduleData.time;

      selectedPost.value.postDate = formatDateToString(newDate);
      selectedPost.value.postTime = newTime;

      // Check if schedule has changed
      checkForChanges();
    }
  };

  // Handle click on time in scheduled time display
  const handleTimeClick = (event) => {
    if (event.target.dataset.timeClickable === 'true' && selectedPost.value) {
      openSchedulerModal(selectedPost.value);
    }
  };

  // Toggle post actions menu
  const togglePostMenu = () => {
    showPostMenu.value = !showPostMenu.value;
  };

  // Close post menu when clicking outside
  const handleClickOutside = (event) => {
    if (!showPostMenu.value) return;

    const target = event.target;

    // Check if click is inside the dots button
    const isClickOnDotsButton =
      (dotsButtonRef.value && dotsButtonRef.value.contains(target)) ||
      (dotsButtonRefMobile.value && dotsButtonRefMobile.value.contains(target));

    if (isClickOnDotsButton) {
      return; // Don't close if clicking the button
    }

    // Check if click is inside the dropdown menu using refs
    let isClickInDropdown = false;

    // Check desktop dropdown
    if (togglePostModalRef.value && togglePostModalRef.value.dropdownRef) {
      try {
        isClickInDropdown = togglePostModalRef.value.dropdownRef.contains(target);
      } catch (e) {
        // Ref might not be ready yet
      }
    }

    // Check mobile dropdown
    if (!isClickInDropdown && togglePostModalRefMobile.value && togglePostModalRefMobile.value.dropdownRef) {
      try {
        isClickInDropdown = togglePostModalRefMobile.value.dropdownRef.contains(target);
      } catch (e) {
        // Ref might not be ready yet
      }
    }

    // Fallback: check by class name or data attribute
    if (!isClickInDropdown) {
      const dropdownElement = target.closest('.post-dropdown-menu') ||
        target.closest('[class*="bottom-full"]') ||
        target.closest('.bg_secondary_color.rounded-xl.shadow-2xl');
      isClickInDropdown = dropdownElement !== null;
    }

    // Close if click is outside both button and dropdown
    if (!isClickInDropdown) {
      showPostMenu.value = false;
    }
  };

  // Handle Share Now action
  const handleShareNow = () => {
    if (selectedPost.value) {
      console.log('Share Now:', selectedPost.value);
      // TODO: Implement share functionality
      showPostMenu.value = false;
    }
  };

  // Handle Regenerate Post action
  const handleRegeneratePost = () => {
    if (selectedPost.value) {
      console.log('Regenerate Post:', selectedPost.value);
      // TODO: Implement regenerate functionality
      showPostMenu.value = false;
    }
  };

  // Handle Delete Post action
  const handleDeletePost = () => {
    if (selectedPost.value) {
      showDeleteModal.value = true;
      showPostMenu.value = false;
    }
  };

  // Confirm delete action
  const confirmDeletePost = () => {
    if (selectedPost.value) {
      const postIndex = scheduledPosts.value.findIndex(p => p.id === selectedPost.value.id);
      if (postIndex !== -1) {
        scheduledPosts.value.splice(postIndex, 1);
      }
      selectedPost.value = null;
      showDeleteModal.value = false;
    }
  };

  // Close delete modal
  const closeDeleteModal = () => {
    showDeleteModal.value = false;
  };

  // Check if there are unsaved changes
  const checkForChanges = () => {
    if (!selectedPost.value || !originalPost.value) {
      hasUnsavedChanges.value = false;
      return;
    }

    const platformsChanged =
      JSON.stringify([...(selectedPost.value.platforms || [])].sort()) !==
      JSON.stringify([...(originalPost.value.platforms || [])].sort());

    // Check if date changed
    const dateChanged = selectedPost.value.postDate !== originalPost.value.postDate;

    // Check if time changed
    const timeChanged = selectedPost.value.postTime !== originalPost.value.postTime;

    // Check if other fields changed (caption, postType, etc.)
    const otherFieldsChanged =
      selectedPost.value.caption !== originalPost.value.caption ||
      selectedPost.value.postType !== originalPost.value.postType ||
      (selectedPost.value.title || "") !== (originalPost.value.title || "");

    hasUnsavedChanges.value = platformsChanged || dateChanged || timeChanged || otherFieldsChanged;
  };

  // Save post changes via API, then sync local calendar state
  const savePostChanges = async () => {
    if (!selectedPost.value || !hasUnsavedChanges.value || savePostLoading.value) return;

    const id = selectedPost.value.id;
    if (id == null) return;

    savePostError.value = "";
    savePostLoading.value = true;
    try {
      const formData = buildCalendarPostUpdateFormData(selectedPost.value);
      const { data } = await api.put(`/post/${encodeURIComponent(id)}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 60000,
      });

      const raw = data?.post ?? data;
      let merged = { ...selectedPost.value };

      if (raw && typeof raw === "object" && (raw.id != null || data?.post)) {
        const mapped = mapApiPostToCalendarPost(data?.post ?? raw);
        merged = {
          ...mapped,
          postType: selectedPost.value.postType,
          productId: mapped.productId ?? selectedPost.value.productId ?? null,
          platforms: Array.isArray(mapped.platforms)
            ? [...mapped.platforms]
            : [...(selectedPost.value.platforms || [])],
        };
      } else {
        merged = {
          ...selectedPost.value,
          platforms: [...(selectedPost.value.platforms || [])],
        };
      }

      const postIndex = scheduledPosts.value.findIndex((p) => p.id === id);
      if (postIndex !== -1) {
        scheduledPosts.value[postIndex] = { ...scheduledPosts.value[postIndex], ...merged };
      }

      selectedPost.value = { ...merged };
      originalPost.value = { ...merged };
      hasUnsavedChanges.value = false;
      await fetchPlatformIconsCatalog(merged.productId ?? null);
    } catch (e) {
      console.error("PUT /post/:id (calendar save) failed:", e);
      savePostError.value =
        e?.response?.data?.message || e?.message || "Could not save changes.";
    } finally {
      savePostLoading.value = false;
    }
  };

  watch(
    selectedPost,
    () => {
      if (selectedPost.value && originalPost.value) {
        checkForChanges();
      }
    },
    { deep: true }
  );



</script>