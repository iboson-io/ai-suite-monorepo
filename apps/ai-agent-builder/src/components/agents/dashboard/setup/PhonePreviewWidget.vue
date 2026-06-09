<template>
  <div class="w-full max-w-[280px] bg-slate-900 text-white rounded-3xl p-6 shadow-2xl flex flex-col items-center text-center aspect-[9/16] justify-between relative border border-slate-800">
    <div class="w-12 h-1 bg-slate-700 rounded-full mb-6 mx-auto" />
    
    <div class="space-y-2">
      <span class="text-[10px] text-info-400 uppercase tracking-widest font-bold block animate-pulse">Call In Progress</span>
      <h4 class="text-lg font-bold truncate px-3">{{ name || 'AI Assistant' }}</h4>
      <p class="text-xs text-slate-400 font-mono">+1 (888) 456-7890</p>
    </div>

    <!-- Pulsing Circle Animation -->
    <div class="relative w-28 h-28 flex items-center justify-center my-6">
      <div class="absolute inset-0 bg-info-500/10 rounded-full animate-ping" />
      <div class="absolute inset-4 bg-info-500/20 rounded-full animate-ping" style="animation-delay: 0.5s" />
      <div class="w-16 h-16 rounded-full bg-info-500 shadow-lg flex items-center justify-center">
        <svg class="w-8 h-8 text-white" viewBox="0 0 18 18" fill="none" stroke="currentColor">
          <path d="M2.58333 0.75H6.25L8.08333 5.33333L5.79167 6.70833C6.77338 8.6989 8.38443 10.31 10.375 11.2917L11.75 9L16.3333 10.8333V14.5C16.3333 14.9862 16.1402 15.4525 15.7964 15.7964C15.4525 16.1402 14.9862 16.3333 14.5 16.3333C10.9243 16.116 7.55181 14.5976 5.01876 12.0646C2.48571 9.53153 0.967295 6.15901 0.75 2.58333C0.75 2.0971 0.943154 1.63079 1.28697 1.28697C1.63079 0.943154 2.0971 0.75 2.58333 0.75Z" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
    </div>

    <!-- Call Info / Controls -->
    <div class="w-full space-y-4">
      <p class="text-xs text-slate-300 italic px-2">"{{ voiceGreeting || 'Connecting...' }}"</p>
      <div class="flex items-center justify-center gap-6 pt-4 border-t border-slate-800">
        <button type="button" class="w-10 h-10 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
        </button>
        <button type="button" class="w-12 h-12 rounded-full bg-error-600 hover:bg-error-700 flex items-center justify-center text-white transition-colors">
          <svg class="w-6 h-6 rotate-[135deg]" viewBox="0 0 18 18" fill="none" stroke="currentColor">
            <path d="M2.58333 0.75H6.25L8.08333 5.33333L5.79167 6.70833C6.77338 8.6989 8.38443 10.31 10.375 11.2917L11.75 9L16.3333 10.8333V14.5C16.3333 14.9862 16.1402 15.4525 15.7964 15.7964C15.4525 16.1402 14.9862 16.3333 14.5 16.3333C10.9243 16.116 7.55181 14.5976 5.01876 12.0646C2.48571 9.53153 0.967295 6.15901 0.75 2.58333C0.75 2.0971 0.943154 1.63079 1.28697 1.28697C1.63079 0.943154 2.0971 0.75 2.58333 0.75Z" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  name: { type: String, required: true },
  voiceGreeting: { type: String, required: true },
})
</script>
