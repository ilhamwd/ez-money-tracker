<template>
  <div class="flex h-screen bg-[#F6F8FD] text-gray-800 font-sans overflow-hidden">
    <!-- Desktop Sidebar -->
    <aside class="w-64 bg-white flex flex-col justify-between hidden md:flex border-r border-gray-100 shrink-0">
      <div class="p-6">
        <router-link to="/" class="flex items-center gap-3 mb-10 hover:opacity-90 transition-opacity">
          <div class="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
            E
          </div>
          <span class="font-bold text-lg tracking-tight text-gray-900">ez-money</span>
        </router-link>
        
        <nav class="space-y-1">
          <router-link to="/" class="flex items-center gap-3 px-4 py-3 rounded-xl transition-colors" :class="[ $route.path === '/' ? 'bg-[#F4F5FB] text-indigo-700 font-semibold' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900 font-medium' ]">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
            Dashboard
          </router-link>

          <router-link to="/transactions" class="flex items-center gap-3 px-4 py-3 rounded-xl transition-colors" :class="[ $route.path === '/transactions' ? 'bg-[#F4F5FB] text-indigo-700 font-semibold' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900 font-medium' ]">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>
            Transactions
          </router-link>
          
          <router-link to="/budget" class="flex items-center gap-3 px-4 py-3 rounded-xl transition-colors" :class="[ $route.path.startsWith('/budget') ? 'bg-[#F4F5FB] text-indigo-700 font-semibold' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900 font-medium' ]">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>
            Budgets
          </router-link>
          
          <router-link to="/period" class="flex items-center gap-3 px-4 py-3 rounded-xl transition-colors" :class="[ $route.path.startsWith('/period') ? 'bg-[#F4F5FB] text-indigo-700 font-semibold' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900 font-medium' ]">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
            Periods
          </router-link>
        </nav>
      </div>
    </aside>

    <!-- Mobile Drawer & Backdrop -->
    <div v-if="mobileMenuOpen" class="fixed inset-0 z-40 md:hidden">
      <!-- Backdrop -->
      <div 
        @click="mobileMenuOpen = false" 
        class="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
      ></div>

      <!-- Drawer Content -->
      <aside class="fixed inset-y-0 left-0 w-72 bg-white shadow-2xl z-50 p-6 flex flex-col justify-between">
        <div>
          <div class="flex items-center justify-between mb-8">
            <router-link to="/" @click="mobileMenuOpen = false" class="flex items-center gap-3">
              <div class="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                E
              </div>
              <span class="font-bold text-lg tracking-tight text-gray-900">ez-money</span>
            </router-link>
            <button @click="mobileMenuOpen = false" class="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors" aria-label="Close menu">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>

          <nav class="space-y-1">
            <router-link 
              to="/" 
              @click="mobileMenuOpen = false"
              class="flex items-center gap-3 px-4 py-3 rounded-xl transition-colors" 
              :class="[ $route.path === '/' ? 'bg-[#F4F5FB] text-indigo-700 font-semibold' : 'text-gray-600 hover:bg-gray-50 font-medium' ]"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
              Dashboard
            </router-link>

            <router-link 
              to="/transactions" 
              @click="mobileMenuOpen = false"
              class="flex items-center gap-3 px-4 py-3 rounded-xl transition-colors" 
              :class="[ $route.path === '/transactions' ? 'bg-[#F4F5FB] text-indigo-700 font-semibold' : 'text-gray-600 hover:bg-gray-50 font-medium' ]"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>
              Transactions
            </router-link>
            
            <router-link 
              to="/budget" 
              @click="mobileMenuOpen = false"
              class="flex items-center gap-3 px-4 py-3 rounded-xl transition-colors" 
              :class="[ $route.path.startsWith('/budget') ? 'bg-[#F4F5FB] text-indigo-700 font-semibold' : 'text-gray-600 hover:bg-gray-50 font-medium' ]"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>
              Budgets
            </router-link>
            
            <router-link 
              to="/period" 
              @click="mobileMenuOpen = false"
              class="flex items-center gap-3 px-4 py-3 rounded-xl transition-colors" 
              :class="[ $route.path.startsWith('/period') ? 'bg-[#F4F5FB] text-indigo-700 font-semibold' : 'text-gray-600 hover:bg-gray-50 font-medium' ]"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
              Periods
            </router-link>
          </nav>
        </div>
      </aside>
    </div>

    <!-- Main Content -->
    <div class="flex-1 flex flex-col h-screen overflow-hidden">
      <!-- Mobile Header -->
      <header class="bg-white h-16 flex items-center justify-between px-4 border-b border-gray-100 md:hidden shrink-0">
        <router-link to="/" class="flex items-center gap-2 hover:opacity-90 transition-opacity">
          <div class="w-8 h-8 bg-indigo-600 rounded flex items-center justify-center text-white font-bold">E</div>
          <span class="font-bold text-gray-900">ez-money</span>
        </router-link>
        <button 
          @click="mobileMenuOpen = true" 
          class="p-2 -mr-1 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Open navigation menu"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
        </button>
      </header>

      <main class="flex-1 overflow-y-auto">
        <div class="max-w-6xl mx-auto p-4 sm:p-8">
          <router-view></router-view>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const mobileMenuOpen = ref(false);

watch(() => route.path, () => {
  mobileMenuOpen.value = false;
});
</script>

<style>
/* Custom styling for scrollbars to match the soft UI */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background-color: #cbd5e1;
  border-radius: 20px;
}
body {
  margin: 0;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>
