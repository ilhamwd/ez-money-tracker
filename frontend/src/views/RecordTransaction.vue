<template>
  <div class="max-w-xl mx-auto min-h-[80vh] flex flex-col pt-8">
    
    <div class="text-center mb-10">
      <div class="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 text-indigo-600 rounded-2xl mb-4 shadow-sm">
        <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
      </div>
      <h1 class="text-3xl font-bold text-gray-900 tracking-tight">Record Transaction</h1>
      <p class="text-gray-500 mt-2">Log a new budget transaction from Siri Shortcuts</p>
    </div>
    
    <div v-if="loading" class="flex-1 flex flex-col items-center justify-center text-indigo-600">
      <div class="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
      <p class="font-medium text-gray-500">Loading details...</p>
    </div>
    
    <div v-else-if="error" class="flex-1">
      <div class="bg-rose-50 text-rose-600 p-6 rounded-3xl border border-rose-100 text-center">
        <p class="font-bold text-lg mb-1">Error</p>
        <p>{{ error }}</p>
      </div>
    </div>
    
    <div v-else class="flex-1 space-y-6 pb-24">
      
      <!-- Card 1: Transaction Detail -->
      <div class="bg-white p-7 rounded-3xl shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-gray-50">
        <h2 class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-5">Transaction Details</h2>
        <div class="grid grid-cols-2 gap-y-4">
          <div class="text-gray-500 font-medium">Amount</div>
          <div class="font-bold text-right text-xl text-gray-900">Rp {{ formatNumber(amount) }}</div>
          
          <div class="text-gray-500 font-medium">Type</div>
          <div class="text-right">
            <span class="px-3 py-1 text-xs font-bold rounded-full uppercase" :class="type === 'income' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'">
              {{ type }}
            </span>
          </div>
          
          <div class="text-gray-500 font-medium">Source</div>
          <div class="text-right">
            <span class="px-3 py-1 text-xs font-bold rounded-full uppercase bg-gray-100 text-gray-600">
              {{ source }}
            </span>
          </div>
        </div>
      </div>
      
      <!-- Card 2: Select Budget Item -->
      <div class="bg-white rounded-3xl shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-gray-50 overflow-hidden">
        <div class="p-6 border-b border-gray-50 bg-gray-50/50">
          <h2 class="text-sm font-bold text-gray-900">Select Budget Category</h2>
        </div>
        <div class="divide-y divide-gray-50 max-h-[40vh] overflow-y-auto">
          <label v-for="item in matchingItems" :key="item.id" class="flex items-center p-5 hover:bg-[#F4F5FB] cursor-pointer transition-colors group">
            <input type="radio" :value="item.id" v-model="selectedItemId" class="w-5 h-5 text-indigo-600 focus:ring-indigo-500 border-gray-300 transition-colors">
            <div class="ml-4 flex-1">
              <div class="font-bold text-gray-900">{{ item.name }}</div>
              <div class="text-xs text-gray-400 font-medium">{{ item.budgetName }}</div>
            </div>
            <div class="text-right">
              <div class="text-sm font-bold" :class="item.remaining >= 0 ? 'text-gray-900' : 'text-rose-500'">Rp {{ formatNumber(item.remaining) }}</div>
              <div class="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">remaining</div>
            </div>
          </label>
          <div v-if="matchingItems.length === 0" class="p-10 text-center flex flex-col items-center justify-center">
             <div class="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 mb-3">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"></path></svg>
            </div>
            <p class="text-gray-500 font-medium">No budget items found for type: {{ type }}</p>
          </div>
        </div>
      </div>
      
    </div>
    
    <!-- Submit Button (Fixed at bottom on mobile, inline on desktop) -->
    <div v-if="!loading && !error" class="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-md border-t border-gray-100 shadow-[0_-4px_24px_rgba(0,0,0,0.02)] md:relative md:bg-transparent md:border-none md:shadow-none md:p-0">
      <button 
        @click="submit" 
        :disabled="!selectedItemId || submitting" 
        class="w-full py-4 rounded-2xl font-bold text-white transition-all transform active:scale-[0.98]"
        :class="(!selectedItemId || submitting) ? 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-none' : 'bg-indigo-600 hover:bg-indigo-700 shadow-[0_4px_14px_0_rgb(79,70,229,0.39)]'">
        {{ submitting ? 'Submitting...' : 'Confirm & Save' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { fetchDashboard, recordTransaction } from '../api';

const route = useRoute();
const router = useRouter();

const loading = ref(true);
const error = ref('');
const submitting = ref(false);
const data = ref<any>(null);

const amount = computed(() => Number(route.query.amount) || 0);
const type = computed(() => route.query.type as string || 'expense');
const source = computed(() => route.query.source as string || 'cash');

const selectedItemId = ref<string | null>(null);

onMounted(async () => {
  try {
    loading.value = true;
    if (!amount.value) {
      error.value = 'Invalid amount parameter from Siri Shortcut';
      return;
    }
    data.value = await fetchDashboard();
  } catch (err: any) {
    error.value = err.message || 'Failed to load data';
  } finally {
    loading.value = false;
  }
});

const matchingItems = computed(() => {
  if (!data.value || !data.value.period || !data.value.period.budgets) return [];
  
  const items: any[] = [];
  data.value.period.budgets.forEach((b: any) => {
    b.items.filter((i: any) => i.type === type.value).forEach((i: any) => {
      const realized = data.value.period.transactions
        .filter((t: any) => t.budget_item_id === i.id)
        .reduce((sum: number, t: any) => sum + t.amount, 0);
      
      items.push({
        ...i,
        budgetName: b.name,
        realized,
        remaining: Number(i.amount) - realized
      });
    });
  });
  return items;
});

const formatNumber = (num: number) => {
  return new Intl.NumberFormat('id-ID').format(Number(num) || 0);
};

const submit = async () => {
  if (!selectedItemId.value || submitting.value) return;
  
  const selectedItem = matchingItems.value.find(i => i.id === selectedItemId.value);
  if (!selectedItem) return;
  
  try {
    submitting.value = true;
    await recordTransaction({
      amount: amount.value,
      type: type.value,
      source: source.value,
      category: selectedItem.name,
      budget_item_id: selectedItem.id,
      period_id: data.value.period.id
    });
    
    // Optional: visual feedback
    setTimeout(() => {
      router.push('/');
    }, 400);
  } catch (err: any) {
    alert('Failed to record: ' + err.message);
    submitting.value = false;
  }
};
</script>
