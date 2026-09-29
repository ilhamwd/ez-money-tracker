<template>
  <div class="space-y-8">
    
    <!-- Header Section -->
    <div class="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
      <div>
        <p class="text-sm text-gray-500 font-medium tracking-wide mb-1">{{ currentDateStr }}</p>
        <h1 class="text-4xl font-bold text-gray-900 tracking-tight">Hello, Arifin</h1>
        <h2 class="text-3xl font-medium text-teal-400 mt-1 tracking-tight">Have a great {{ currentDayName }}</h2>
        
        <div class="flex flex-wrap gap-3 mt-6">
          <button @click="$router.push('/budget/record-transaction')" class="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-full text-sm font-semibold flex items-center gap-2 transition-all shadow-[0_4px_14px_0_rgb(79,70,229,0.39)]">
            <span class="text-lg leading-none mt-[-2px]">✧</span> Record Transaction
          </button>
          <button @click="$router.push('/budget')" class="bg-white text-gray-700 border border-gray-200 px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-gray-50 transition-colors shadow-sm">
            Manage Budgets
          </button>
          <button @click="$router.push('/period')" class="bg-white text-gray-700 border border-gray-200 px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-gray-50 transition-colors shadow-sm">
            Active Period
          </button>
        </div>
      </div>
    </div>
    
    <div v-if="loading" class="text-gray-500 flex items-center gap-3">
      <div class="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      Loading dashboard...
    </div>
    <div v-else-if="error" class="bg-red-50 text-red-600 p-4 rounded-2xl border border-red-100">{{ error }}</div>
    
    <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      <!-- Left Column (Wider) -->
      <div class="lg:col-span-2 space-y-8">
        
        <!-- Expenses Card (Like My Tasks) -->
        <div class="bg-white rounded-3xl p-7 shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-gray-50">
          <div class="flex items-center justify-between mb-6">
            <div class="flex items-center gap-3">
              <div class="p-2 bg-rose-50 rounded-lg text-rose-500">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              </div>
              <h2 class="text-xl font-bold text-gray-900">Expenses</h2>
            </div>
            <button @click="$router.push('/budget')" class="text-gray-400 hover:text-gray-600">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"></path></svg>
            </button>
          </div>
          
          <div class="space-y-4">
            <!-- Table Header equivalent -->
            <div class="grid grid-cols-12 text-xs font-semibold text-gray-400 uppercase tracking-wider px-2">
              <div class="col-span-6">Name</div>
              <div class="col-span-3 text-right">Remaining</div>
              <div class="col-span-3 text-right">Action</div>
            </div>
            
            <div v-for="item in expenseItems" :key="item.id" class="group flex items-center grid grid-cols-12 p-3 rounded-2xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
              <div class="col-span-6 flex items-center gap-3">
                <div class="w-2 h-2 rounded-full" :class="getRemainingColorClass(item)"></div>
                <div>
                  <p class="font-semibold text-gray-900 text-sm">{{ item.name }}</p>
                  <p class="text-xs text-gray-400">{{ item.budgetName }}</p>
                </div>
              </div>
              <div class="col-span-3 flex items-center justify-end">
                <span class="px-2.5 py-1 rounded-full text-xs font-bold" :class="getRemainingBadgeClass(item)">
                  Rp {{ formatNumber(item.remaining) }}
                </span>
              </div>
              <div class="col-span-3 flex justify-end">
                <button @click="openRecordModal(item)" class="text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-full transition-colors">
                  Record
                </button>
              </div>
            </div>
            
            <div v-if="expenseItems.length === 0" class="text-center py-6 text-gray-400 text-sm">
              No expenses budgeted for this period.
            </div>
          </div>
        </div>

        <!-- Income Card -->
        <div class="bg-white rounded-3xl p-7 shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-gray-50">
          <div class="flex items-center justify-between mb-6">
            <div class="flex items-center gap-3">
              <div class="p-2 bg-emerald-50 rounded-lg text-emerald-500">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              </div>
              <h2 class="text-xl font-bold text-gray-900">Income</h2>
            </div>
          </div>
          
          <div class="space-y-4">
            <div class="grid grid-cols-12 text-xs font-semibold text-gray-400 uppercase tracking-wider px-2">
              <div class="col-span-6">Name</div>
              <div class="col-span-3 text-right">To Receive</div>
              <div class="col-span-3 text-right">Action</div>
            </div>
            
            <div v-for="item in incomeItems" :key="item.id" class="group flex items-center grid grid-cols-12 p-3 rounded-2xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
              <div class="col-span-6 flex items-center gap-3">
                <div class="w-2 h-2 rounded-full bg-emerald-400"></div>
                <div>
                  <p class="font-semibold text-gray-900 text-sm">{{ item.name }}</p>
                  <p class="text-xs text-gray-400">{{ item.budgetName }}</p>
                </div>
              </div>
              <div class="col-span-3 flex items-center justify-end">
                <span class="px-2.5 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-700">
                  Rp {{ formatNumber(item.remaining) }}
                </span>
              </div>
              <div class="col-span-3 flex justify-end">
                <button @click="openRecordModal(item)" class="text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-full transition-colors">
                  Record
                </button>
              </div>
            </div>
            
            <div v-if="incomeItems.length === 0" class="text-center py-6 text-gray-400 text-sm">
              No income budgeted for this period.
            </div>
          </div>
        </div>
        
      </div>
      
      <!-- Right Column -->
      <div class="space-y-8">
        
        <!-- Summary / Overview Card -->
        <div class="bg-gradient-to-br from-indigo-50 to-white rounded-3xl p-7 shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-indigo-50">
          <h3 class="text-lg font-bold text-gray-900 mb-6">Financial Overview</h3>
          
          <div class="space-y-6">
            <div>
              <p class="text-sm font-medium text-gray-500 mb-1">Total Balance</p>
              <p class="text-3xl font-bold text-gray-900">Rp {{ formatNumber(data.balances.total) }}</p>
            </div>
            
            <div class="grid grid-cols-2 gap-4">
              <div class="bg-white p-4 rounded-2xl shadow-sm border border-gray-50">
                <p class="text-xs text-gray-400 font-medium mb-1">Cash</p>
                <p class="text-sm font-bold text-gray-800">Rp {{ formatNumber(data.balances.cash) }}</p>
              </div>
              <div class="bg-white p-4 rounded-2xl shadow-sm border border-gray-50">
                <p class="text-xs text-gray-400 font-medium mb-1">Balance</p>
                <p class="text-sm font-bold text-gray-800">Rp {{ formatNumber(data.balances.balance) }}</p>
              </div>
              <div class="bg-white p-4 rounded-2xl shadow-sm border border-gray-50 col-span-2">
                <p class="text-xs text-gray-400 font-medium mb-1">Credit</p>
                <p class="text-sm font-bold text-gray-800">Rp {{ formatNumber(data.balances.credit) }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Budget Goals Card (Mimicking My Goals from ref) -->
        <div class="bg-white rounded-3xl p-7 shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-gray-50">
          <div class="flex items-center gap-3 mb-6">
            <div class="p-2 bg-blue-50 rounded-lg text-blue-500">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
            </div>
            <h3 class="text-lg font-bold text-gray-900">Budget Health</h3>
          </div>
          
          <div class="space-y-5">
            <div>
              <div class="flex justify-between items-end mb-2">
                <div>
                  <p class="font-semibold text-gray-900 text-sm">Daily Budget Remaining</p>
                  <p class="text-xs text-gray-400">For the rest of the period</p>
                </div>
                <span class="text-sm font-bold text-indigo-600">Rp {{ formatNumber(dailyBudgetRemaining) }}</span>
              </div>
              <div class="w-full bg-gray-100 rounded-full h-2">
                <div class="bg-indigo-500 h-2 rounded-full" style="width: 100%"></div>
              </div>
            </div>
            
            <div class="pt-2 border-t border-gray-50">
              <div class="flex justify-between items-end mb-2">
                <div>
                  <p class="font-semibold text-gray-900 text-sm">Excess / Deficit</p>
                  <p class="text-xs text-gray-400">Total projection</p>
                </div>
                <span class="text-sm font-bold" :class="excessDeficit >= 0 ? 'text-teal-500' : 'text-rose-500'">
                  Rp {{ formatNumber(excessDeficit) }}
                </span>
              </div>
              <div class="w-full bg-gray-100 rounded-full h-2">
                <div class="h-2 rounded-full" :class="excessDeficit >= 0 ? 'bg-teal-400' : 'bg-rose-400'" style="width: 100%"></div>
              </div>
            </div>
          </div>
        </div>
        
      </div>
    </div>

    <!-- Record Transaction Modal/BottomSheet -->
    <div v-if="selectedItem" class="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-gray-900/40 backdrop-blur-sm transition-opacity">
      <div class="bg-white w-full sm:w-96 rounded-t-3xl sm:rounded-3xl p-7 shadow-2xl transform transition-transform">
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-xl font-bold text-gray-900">Record {{ selectedItem.name }}</h3>
          <button @click="selectedItem = null" class="text-gray-400 hover:text-gray-600 bg-gray-50 rounded-full p-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>
        
        <div class="space-y-5">
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-1">Amount (Rp)</label>
            <input v-model.number="recordAmount" type="number" class="block w-full rounded-xl border-gray-200 bg-gray-50 border p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white transition-colors outline-none font-medium">
          </div>
          
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-1">Source</label>
            <select v-model="recordSource" class="block w-full rounded-xl border-gray-200 bg-gray-50 border p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white transition-colors outline-none font-medium">
              <option value="cash">Cash</option>
              <option value="balance">Balance</option>
              <option value="credit">Credit</option>
            </select>
          </div>
          
          <div class="pt-4">
            <button @click="submitTransaction" class="w-full py-3.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-lg shadow-indigo-200 transition-all">
              Save Transaction
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { fetchDashboard, recordTransaction } from '../api';

const loading = ref(true);
const error = ref('');
const data = ref<any>(null);

const selectedItem = ref<any>(null);
const recordAmount = ref(0);
const recordSource = ref('cash');

const currentDateStr = computed(() => {
  const d = new Date();
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
});

const currentDayName = computed(() => {
  return new Date().toLocaleDateString('en-US', { weekday: 'long' });
});

const loadData = async () => {
  try {
    loading.value = true;
    data.value = await fetchDashboard();
  } catch (err: any) {
    error.value = err.message || 'Failed to load dashboard';
  } finally {
    loading.value = false;
  }
};

onMounted(loadData);

const formatNumber = (num: number) => {
  return new Intl.NumberFormat('id-ID').format(Number(num) || 0);
};

const getItemsWithType = (type: string) => {
  if (!data.value || !data.value.period || !data.value.period.budgets) return [];
  
  const items: any[] = [];
  data.value.period.budgets.forEach((b: any) => {
    b.items.filter((i: any) => i.type === type).forEach((i: any) => {
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
};

const expenseItems = computed(() => getItemsWithType('expense'));
const incomeItems = computed(() => getItemsWithType('income'));

const getRemainingColorClass = (item: any) => {
  if (item.remaining < 0) return 'bg-rose-400';
  if (item.remaining === 0) return 'bg-gray-300';
  return 'bg-amber-400';
};

const getRemainingBadgeClass = (item: any) => {
  if (item.remaining < 0) return 'bg-rose-50 text-rose-600';
  if (item.remaining === 0) return 'bg-gray-100 text-gray-500';
  return 'bg-amber-50 text-amber-600';
};

const dailyBudgetRemaining = computed(() => {
  if (!data.value || !data.value.period || !data.value.period.budgets) return 0;
  
  const period = data.value.period;
  const startDate = new Date(period.start_date);
  const endDate = new Date(period.end_date);
  const now = new Date();
  
  const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24)) + 1;
  const totalDailyBudget = period.budgets.reduce((sum: number, b: any) => sum + Number(b.daily_budget), 0);
  const totalAllocated = totalDailyBudget * totalDays;
  
  const actualDailySpent = period.transactions
    .filter((t: any) => t.type === 'expense' && !t.budget_item_id)
    .reduce((sum: number, t: any) => sum + t.amount, 0);
    
  return totalAllocated - actualDailySpent;
});

const excessDeficit = computed(() => {
  if (!data.value) return 0;
  const balance = data.value.balances.total;
  const receivable = incomeItems.value.reduce((sum, i) => sum + i.remaining, 0);
  const remainingExpenses = expenseItems.value.reduce((sum, i) => sum + i.remaining, 0);
  
  return (balance + receivable) - remainingExpenses - dailyBudgetRemaining.value;
});

const openRecordModal = (item: any) => {
  selectedItem.value = item;
  recordAmount.value = item.remaining > 0 ? item.remaining : 0;
  recordSource.value = 'cash';
};

const submitTransaction = async () => {
  if (!selectedItem.value) return;
  
  try {
    await recordTransaction({
      amount: recordAmount.value,
      type: selectedItem.value.type,
      source: recordSource.value,
      category: selectedItem.value.name,
      budget_item_id: selectedItem.value.id
    });
    
    selectedItem.value = null;
    await loadData();
  } catch (err: any) {
    alert('Failed to record: ' + err.message);
  }
};
</script>
