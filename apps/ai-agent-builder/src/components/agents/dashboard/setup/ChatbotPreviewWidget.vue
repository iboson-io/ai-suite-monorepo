<template>
  <div class="relative w-full flex flex-col items-center justify-center">
    <!-- Scoping container to ensure launcher is absolute positioned relative to the chat widget frame -->
    <div class="relative w-full max-w-[280px]">
      <!-- Chat Customization & Generic Tab Widget Preview -->
      <div class="w-full bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-200 flex flex-col justify-between aspect-[9/12]">
        <!-- Header bar colored by customizationColor -->
        <div
          class="px-4 py-3 flex items-center justify-between text-white transition-all shadow-md shrink-0"
          :style="{ backgroundColor: color }"
        >
          <div class="flex items-center gap-2.5 min-w-0">
            <div class="w-8 h-8 rounded-full bg-white/20 border border-white/20 overflow-hidden flex items-center justify-center shrink-0">
              <img
                v-if="logoPreviewUrl"
                :src="logoPreviewUrl"
                alt="Bot Logo"
                class="w-full h-full object-contain p-1"
              />
              <svg v-else class="w-4.5 h-4.5 text-white" viewBox="0 0 20 20" fill="none" stroke="currentColor">
                <path d="M6.85417 1.8475C7.20917 0.384167 9.29083 0.384167 9.64583 1.8475C9.6991 2.06733 9.80352 2.27148 9.95059 2.44333C10.0977 2.61518 10.2832 2.74988 10.4922 2.83645C10.7012 2.92303 10.9276 2.95904 11.1532 2.94156C11.3787 2.92407 11.5969 2.85359 11.79 2.73583C13.0758 1.9525 14.5483 3.42417 13.765 4.71083C13.6474 4.90388 13.577 5.12195 13.5596 5.34731C13.5422 5.57267 13.5781 5.79897 13.6646 6.00782C13.7511 6.21666 13.8856 6.40215 14.0573 6.54921C14.2289 6.69627 14.4329 6.80075 14.6525 6.85417C16.1158 7.20917 16.1158 9.29083 14.6525 9.64583C14.4327 9.6991 14.2285 9.80352 14.0567 9.95059C13.8848 10.0977 13.7501 10.2832 13.6635 10.4922C13.577 10.7012 13.541 10.9276 13.5584 11.1532C13.5759 11.3787 13.6464 11.5969 13.7642 11.79C14.5475 13.0758 13.0758 14.5483 11.7892 13.765C11.5961 13.6474 11.3781 13.577 11.1527 13.5596C10.9273 13.5422 10.701 13.5781 10.4922 13.6646C10.2833 13.7511 10.0979 13.8856 9.95079 14.0573C9.80373 14.2289 9.69925 14.4329 9.64583 14.6525C9.29083 16.1158 7.20917 16.1158 6.85417 14.6525C6.8009 14.4327 6.69648 14.2285 6.54941 14.0567C6.40233 13.8848 6.21676 13.7501 6.00779 13.6635C5.79882 13.577 5.57236 13.541 5.34685 13.5584C5.12133 13.5759 4.90313 13.6464 4.71 13.7642C3.42417 14.5475 1.95167 13.0758 2.735 11.7892C2.85258 11.5961 2.92296 11.3781 2.9404 11.1527C2.95785 10.9273 2.92187 10.701 2.83539 10.4922C2.74892 10.2833 2.61438 10.0979 2.44273 9.95079C2.27107 9.80373 2.06714 9.69925 1.8475 9.64583C0.384167 9.29083 0.384167 7.20917 1.8475 6.85417C2.06733 6.8009 2.27148 6.69648 2.44333 6.54941C2.61518 6.40233 2.74988 6.21676 2.83645 6.00779C2.92303 5.79882 2.95904 5.57236 2.94156 5.34685C2.92407 5.12133 2.85359 4.90313 2.73583 4.71C1.9525 3.42417 3.42417 1.95167 4.71083 2.735C5.54417 3.24167 6.62417 2.79333 6.85417 1.8475Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M5.75 8.25C5.75 8.91304 6.01339 9.54893 6.48223 10.0178C6.95107 10.4866 7.58696 10.75 8.25 10.75C8.91304 10.75 9.54893 10.4866 10.0178 10.0178C10.4866 9.54893 10.75 8.91304 10.75 8.25C10.75 7.58696 10.4866 6.95107 10.0178 6.48223C9.54893 6.01339 8.91304 5.75 8.25 5.75C7.58696 5.75 6.95107 6.01339 6.48223 6.48223C6.01339 6.95107 5.75 7.58696 5.75 8.25Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <div class="min-w-0">
              <h4 class="text-xs font-bold truncate leading-tight">
                {{ name || 'AI Assistant' }}
              </h4>
              <span class="text-[9px] text-white/80 flex items-center gap-1">
                <span class="w-1.5 h-1.5 bg-[#4ADE80] rounded-full inline-block" />
                Connected
              </span>
            </div>
          </div>
          <button type="button" class="text-white/60 hover:text-white transition-colors">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Messages Stream -->
        <div class="flex-1 bg-white overflow-y-auto p-4 space-y-3 flex flex-col justify-end">
          <!-- Welcome message -->
          <div class="flex items-start gap-2 max-w-[85%]">
            <div class="w-6 h-6 rounded-full  flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
              <img
                v-if="logoPreviewUrl"
                :src="logoPreviewUrl"
                alt="Widget Logo"
                class="w-full h-full object-contain p-0.5"
              />
              <svg v-else class="w-3.5 h-3.5 text-gray-500" viewBox="0 0 20 20" fill="none" stroke="currentColor">
                <path d="M6.85417 1.8475C7.20917 0.384167 9.29083 0.384167 9.64583 1.8475C9.6991 2.06733 9.80352 2.27148 9.95059 2.44333C10.0977 2.61518 10.2832 2.74988 10.4922 2.83645C10.7012 2.92303 10.9276 2.95904 11.1532 2.94156C11.3787 2.92407 11.5969 2.85359 11.79 2.73583C13.0758 1.9525 14.5483 3.42417 13.765 4.71083C13.6474 4.90388 13.577 5.12195 13.5596 5.34731C13.5422 5.57267 13.5781 5.79897 13.6646 6.00782C13.7511 6.21666 13.8856 6.40215 14.0573 6.54921C14.2289 6.69627 14.4329 6.80075 14.6525 6.85417C16.1158 7.20917 16.1158 9.29083 14.6525 9.64583C14.4327 9.6991 14.2285 9.80352 14.0567 9.95059C13.8848 10.0977 13.7501 10.2832 13.6635 10.4922C13.577 10.7012 13.541 10.9276 13.5584 11.1532C13.5759 11.3787 13.6464 11.5969 13.7642 11.79C14.5475 13.0758 13.0758 14.5483 11.7892 13.765C11.5961 13.6474 11.3781 13.577 11.1527 13.5596C10.9273 13.5422 10.701 13.5781 10.4922 13.6646C10.2833 13.7511 10.0979 13.8856 9.95079 14.0573C9.80373 14.2289 9.69925 14.4329 9.64583 14.6525C9.29083 16.1158 7.20917 16.1158 6.85417 14.6525C6.8009 14.4327 6.69648 14.2285 6.54941 14.0567C6.40233 13.8848 6.21676 13.7501 6.00779 13.6635C5.79882 13.577 5.57236 13.541 5.34685 13.5584C5.12133 13.5759 4.90313 13.6464 4.71 13.7642C3.42417 14.5475 1.95167 13.0758 2.735 11.7892C2.85258 11.5961 2.92296 11.3781 2.9404 11.1527C2.95785 10.9273 2.92187 10.701 2.83539 10.4922C2.74892 10.2833 2.61438 10.0979 2.44273 9.95079C2.27107 9.80373 2.06714 9.69925 1.8475 9.64583C0.384167 9.29083 0.384167 7.20917 1.8475 6.85417C2.06733 6.8009 2.27148 6.69648 2.44333 6.54941C2.61518 6.40233 2.74988 6.21676 2.83645 6.00779C2.92303 5.79882 2.95904 5.57236 2.94156 5.34685C2.92407 5.12133 2.85359 4.90313 2.735 4.71C1.9525 3.42417 3.42417 1.95167 4.71083 2.735C5.54417 3.24167 6.62417 2.79333 6.85417 1.8475Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M5.75 8.25C5.75 8.91304 6.01339 9.54893 6.48223 10.0178C6.95107 10.4866 7.58696 10.75 8.25 10.75C8.91304 10.75 9.54893 10.4866 10.0178 10.0178C10.4866 9.54893 10.75 8.91304 10.75 8.25C10.75 7.58696 10.4866 6.95107 10.0178 6.48223C9.54893 6.01339 8.91304 5.75 8.25 5.75C7.58696 5.75 6.95107 6.01339 6.48223 6.48223C6.01339 6.95107 5.75 7.58696 5.75 8.25Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <div class="bg-[#fafafa] text-gray-700 text-[11px] py-2 px-3 rounded-2xl rounded-tl-none  shadow-sm leading-relaxed">
              Connected to agent '{{ name || 'AI Assistant' }}' (your_agent)! Started new chat. Agent is ready!
            </div>
          </div>

          <!-- User sent message -->
          <div class="flex items-start gap-2 justify-end max-w-[85%] self-end">
            <div class="bg-[#1E2238] text-white text-[11px] py-2 px-3 rounded-2xl rounded-tr-none shadow-sm transition-all">
              hi
            </div>
          </div>

          <!-- Bot response message -->
          <div class="flex items-start gap-2 max-w-[85%]">
            <div class="w-6 h-6 rounded-full  flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
              <img
                v-if="logoPreviewUrl"
                :src="logoPreviewUrl"
                alt="Widget Logo"
                class="w-full h-full object-contain p-0.5"
              />
              <svg v-else class="w-3.5 h-3.5 text-gray-500" viewBox="0 0 20 20" fill="none" stroke="currentColor">
                <path d="M6.85417 1.8475C7.20917 0.384167 9.29083 0.384167 9.64583 1.8475C9.6991 2.06733 9.80352 2.27148 9.95059 2.44333C10.0977 2.61518 10.2832 2.74988 10.4922 2.83645C10.7012 2.92303 10.9276 2.95904 11.1532 2.94156C11.3787 2.92407 11.5969 2.85359 11.79 2.73583C13.0758 1.9525 14.5483 3.42417 13.765 4.71083C13.6474 4.90388 13.577 5.12195 13.5596 5.34731C13.5422 5.57267 13.5781 5.79897 13.6646 6.00782C13.7511 6.21666 13.8856 6.40215 14.0573 6.54921C14.2289 6.69627 14.4329 6.80075 14.6525 6.85417C16.1158 7.20917 16.1158 9.29083 14.6525 9.64583C14.4327 9.6991 14.2285 9.80352 14.0567 9.95059C13.8848 10.0977 13.7501 10.2832 13.6635 10.4922C13.577 10.7012 13.541 10.9276 13.5584 11.1532C13.5759 11.3787 13.6464 11.5969 13.7642 11.79C14.5475 13.0758 13.0758 14.5483 11.7892 13.765C11.5961 13.6474 11.3781 13.577 11.1527 13.5596C10.9273 13.5422 10.701 13.5781 10.4922 13.6646C10.2833 13.7511 10.0979 13.8856 9.95079 14.0573C9.80373 14.2289 9.69925 14.4329 9.64583 14.6525C9.29083 16.1158 7.20917 16.1158 6.85417 14.6525C6.8009 14.4327 6.69648 14.2285 6.54941 14.0567C6.40233 13.8848 6.21676 13.7501 6.00779 13.6635C5.79882 13.577 5.57236 13.541 5.34685 13.5584C5.12133 13.5759 4.90313 13.6464 4.71 13.7642C3.42417 14.5475 1.95167 13.0758 2.735 11.7892C2.85258 11.5961 2.92296 11.3781 2.9404 11.1527C2.95785 10.9273 2.92187 10.701 2.83539 10.4922C2.74892 10.2833 2.61438 10.0979 2.44273 9.95079C2.27107 9.80373 2.06714 9.69925 1.8475 9.64583C0.384167 9.29083 0.384167 7.20917 1.8475 6.85417C2.06733 6.8009 2.27148 6.69648 2.44333 6.54941C2.61518 6.40233 2.74988 6.21676 2.83645 6.00779C2.92303 5.79882 2.95904 5.57236 2.94156 5.34685C2.92407 5.12133 2.85359 4.90313 2.735 4.71C1.9525 3.42417 3.42417 1.95167 4.71083 2.735C5.54417 3.24167 6.62417 2.79333 6.85417 1.8475Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M5.75 8.25C5.75 8.91304 6.01339 9.54893 6.48223 10.0178C6.95107 10.4866 7.58696 10.75 8.25 10.75C8.91304 10.75 9.54893 10.4866 10.0178 10.0178C10.4866 9.54893 10.75 8.91304 10.75 8.25C10.75 7.58696 10.4866 6.95107 10.0178 6.48223C9.54893 6.01339 8.91304 5.75 8.25 5.75C7.58696 5.75 6.95107 6.01339 6.48223 6.48223C6.01339 6.95107 5.75 7.58696 5.75 8.25Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <div class="bg-[#fafafa] text-gray-700 text-[11px] py-2 px-3 rounded-2xl rounded-tl-none  shadow-sm leading-relaxed">
              Hello! How can I assist you today?
            </div>
          </div>
        </div>

        <!-- Input area mock -->
        <div class="p-3.5 border-t border-gray-100 bg-white flex items-center gap-3 shrink-0">
          <input
            type="text"
            readonly
            placeholder="Type your message..."
            class="flex-1 bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-xs text-gray-400 outline-none"
          />
          <button
            type="button"
            class="text-gray-500 hover:text-gray-800 shrink-0 p-1 transition-colors"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M7 17L17 7M17 7H7M17 7V17" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Bottom right circular widget launcher preview -->
      <div
        class="absolute -bottom-16 right-3 w-12 h-12 rounded-full bg-white shadow-xl flex items-center justify-center transition-all cursor-pointer border border-gray-100 hover:scale-105"
      >
        <img
          v-if="iconPreviewUrl"
          :src="iconPreviewUrl"
          alt="Launcher"
          class="w-full h-full object-contain p-1 rounded-full"
        />
        <img
          v-else-if="logoPreviewUrl"
          :src="logoPreviewUrl"
          alt="Launcher Fallback"
          class="w-full h-full object-contain p-1 rounded-full"
        />
        <svg v-else class="w-7 h-7 text-[#006AF1]" viewBox="0 0 125 130" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M44.7268 48.5547C46.0725 48.5547 47.1635 47.4637 47.1635 46.1179C47.1635 44.7722 46.0725 43.6812 44.7268 43.6812C43.381 43.6812 42.29 44.7722 42.29 46.1179C42.29 47.4637 43.381 48.5547 44.7268 48.5547Z" fill="currentColor"/>
          <path d="M78.5149 48.5547C79.8606 48.5547 80.9516 47.4637 80.9516 46.1179C80.9516 44.7722 79.8606 43.6812 78.5149 43.6812C77.1691 43.6812 76.0781 44.7722 76.0781 46.1179C76.0781 47.4637 77.1691 48.5547 78.5149 48.5547Z" fill="currentColor"/>
          <path d="M44.7268 81.552C46.0725 81.552 47.1635 80.461 47.1635 79.1153C47.1635 77.7695 46.0725 76.6785 44.7268 76.6785C43.381 76.6785 42.29 77.7695 42.29 79.1153C42.29 80.461 43.381 81.552 44.7268 81.552Z" fill="currentColor"/>
          <path d="M78.5149 81.552C79.8606 81.552 80.9516 80.461 80.9516 79.1153C80.9516 77.7695 79.8606 76.6785 78.5149 76.6785C77.1691 76.6785 76.0781 77.7695 76.0781 79.1153C76.0781 80.461 77.1691 81.552 78.5149 81.552Z" fill="currentColor"/>
          <path d="M62.1685 70.079C66.4161 70.079 69.8594 66.6356 69.8594 62.388C69.8594 58.1404 66.4161 54.6971 62.1685 54.6971C57.9209 54.6971 54.4775 58.1404 54.4775 62.388C54.4775 66.6356 57.9209 70.079 62.1685 70.079Z" fill="currentColor"/>
          <path d="M18.1027 24.9239C9.21875 28.6805 3 37.4629 3 47.6921C3 53.2001 4.80217 58.2767 7.84808 62.3887H36.6066" stroke="currentColor" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M106.559 25.1008C115.239 28.9336 121.28 37.6145 121.28 47.7168C121.28 53.2248 119.478 58.3013 116.432 62.4133H87.877" stroke="currentColor" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M7.84808 62.3886C4.80217 66.5006 3 71.5771 3 77.0852C3 87.1113 8.9903 95.7668 17.5696 99.6249C17.5696 99.6249 25.9205 102.925 33.8145 103.102" stroke="currentColor" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M116.459 62.3886C119.505 66.5006 121.307 71.5771 121.307 77.0852C121.307 86.9082 115.571 95.4114 107.245 99.3965" stroke="currentColor" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M62.3443 89.3949V112.062C62.3443 112.062 60.1614 125.591 45.4141 126.53C30.6414 127.469 18.2039 113.153 17.5947 100.716V99.6241" stroke="currentColor" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M106.561 25.1008C103.947 13.7293 92.5501 2.23101 79.2749 3.06864C64.5022 4.0078 62.3447 17.5367 62.3447 17.5367V37.0814" stroke="currentColor" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M62.3424 17.5116C62.3424 17.5116 60.1595 3.98268 45.4122 3.04352C32.1879 2.20589 20.8165 13.6027 18.1513 24.9233C18.1513 24.9233 15.1815 35.4318 21.3241 44.8487" stroke="currentColor" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M62.3447 111.605C62.3447 111.605 64.5276 125.134 79.2749 126.073C92.4993 126.911 103.871 115.514 106.536 104.193C106.536 104.193 109.506 93.6847 103.363 84.2678" stroke="currentColor" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M53.2588 40.5848C57.98 35.8637 65.6201 35.8637 70.3413 40.5848" stroke="currentColor" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M70.77 84.1924C66.0488 88.9136 58.4087 88.9136 53.6875 84.1924" stroke="currentColor" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M40.1337 71.7796C35.4125 67.0584 35.4125 59.4183 40.1337 54.6971" stroke="currentColor" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M84.1494 54.6971C88.8706 59.4183 88.8706 67.0584 84.1494 71.7796" stroke="currentColor" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M21.748 49.8799C24.9808 49.8799 27.6015 47.2592 27.6015 44.0264C27.6015 40.7936 24.9808 38.1729 21.748 38.1729C18.5152 38.1729 15.8945 40.7936 15.8945 44.0264C15.8945 47.2592 18.5152 49.8799 21.748 49.8799Z" fill="currentColor"/>
          <path d="M34.8945 109.808C38.1273 109.808 40.748 107.188 40.748 103.955C40.748 100.722 38.1273 98.1013 34.8945 98.1013C31.6617 98.1013 29.041 100.722 29.041 103.955C29.041 107.188 31.6617 109.808 34.8945 109.808Z" fill="currentColor"/>
          <path d="M116.46 62.3879C119.506 58.2759 121.308 53.1994 121.308 47.6913C121.308 37.6652 115.318 29.0097 106.739 25.1516C106.739 25.1516 99.987 22.461 92.8545 21.8264" stroke="currentColor" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M90.0029 28.762C93.2357 28.762 95.8564 26.1413 95.8564 22.9085C95.8564 19.6757 93.2357 17.055 90.0029 17.055C86.7701 17.055 84.1494 19.6757 84.1494 22.9085C84.1494 26.1413 86.7701 28.762 90.0029 28.762Z" fill="currentColor"/>
          <path d="M103.885 89.6805C107.118 89.6805 109.738 87.0598 109.738 83.827C109.738 80.5942 107.118 77.9735 103.885 77.9735C100.652 77.9735 98.0312 80.5942 98.0312 83.827C98.0312 87.0598 100.652 89.6805 103.885 89.6805Z" fill="currentColor"/>
        </svg>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  name: { type: String, required: true },
  color: { type: String, required: true },
  logoPreviewUrl: { type: String, default: '' },
  iconPreviewUrl: { type: String, default: '' },
})
</script>
