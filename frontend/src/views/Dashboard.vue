<template>
  <div class="space-y-8">
    
    <!-- Header Section -->
    <div class="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
      <div>
        <p class="text-sm text-gray-500 font-medium tracking-wide mb-1">{{ currentDateStr }}</p>
        <h1 class="text-4xl font-bold text-gray-900 tracking-tight">Hello, Arifin</h1>
        <h2 class="text-3xl font-medium text-teal-400 mt-1 tracking-tight">Have a great {{ currentDayName }}</h2>
        
        <div class="flex flex-wrap gap-3 mt-6">
          <button @click="$router.push('/record-transaction')" class="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-full text-sm font-semibold flex items-center gap-2 transition-all shadow-[0_4px_14px_0_rgb(79,70,229,0.39)] cursor-pointer">
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
      
      <!-- Left Column (Wider on desktop, below overview on mobile) -->
      <div class="lg:col-span-2 space-y-8 order-2 lg:order-1">
        
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
      
      <!-- Right Column (Top on mobile, right side on desktop) -->
      <div class="space-y-8 order-1 lg:order-2">
        
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
            <!-- Daily Budget Remaining -->
            <div>
              <div class="flex justify-between items-end mb-2">
                <div>
                  <p class="font-semibold text-gray-900 text-sm">Daily Budget Remaining</p>
                  <p class="text-xs text-gray-400">{{ remainingDays }} days remaining &bull; For the rest of the period</p>
                </div>
                <span class="text-sm font-bold text-indigo-600">Rp {{ formatNumber(dailyBudgetRemaining) }}</span>
              </div>
              <div class="w-full bg-gray-100 rounded-full h-2">
                <div class="bg-indigo-500 h-2 rounded-full transition-all" :style="{ width: dailyBudgetRemainingBarWidth + '%' }"></div>
              </div>
            </div>

            <!-- Remaining Daily Budget -->
            <div class="pt-2 border-t border-gray-50">
              <div class="flex justify-between items-end mb-2">
                <div>
                  <p class="font-semibold text-gray-900 text-sm">Remaining Daily Budget</p>
                  <p class="text-xs text-gray-400">
                    Daily budget Rp {{ formatNumber(dailyBudgetTodayData.dailyBudget) }} &bull; Spent today Rp {{ formatNumber(dailyBudgetTodayData.spentToday) }}
                  </p>
                </div>
                <span class="text-sm font-bold" :class="dailyBudgetTodayData.remainingToday >= 0 ? 'text-teal-500' : 'text-rose-500'">
                  {{ dailyBudgetTodayData.remainingToday >= 0 ? '' : '-' }}Rp {{ formatNumber(Math.abs(dailyBudgetTodayData.remainingToday)) }}
                </span>
              </div>
              <div class="w-full bg-gray-100 rounded-full h-2">
                <div 
                  class="h-2 rounded-full transition-all" 
                  :class="dailyBudgetTodayData.remainingToday >= 0 ? 'bg-teal-400' : 'bg-rose-400'" 
                  :style="{ width: dailyBudgetTodayBarWidth + '%' }">
                </div>
              </div>
            </div>

            <!-- Daily Budget Excess / Deficit -->
            <div class="pt-2 border-t border-gray-50">
              <div class="flex justify-between items-end mb-2">
                <div>
                  <p class="font-semibold text-gray-900 text-sm capitalize">
                    Daily Budget {{ dailyBudgetPerformance.status }}
                  </p>
                  <p class="text-xs text-gray-400">
                    Day {{ dailyBudgetPerformance.numOfDaysSinceStartPeriod }} &bull; Planned Rp {{ formatNumber(dailyBudgetPerformance.plannedBudgetUntilToday) }} vs spent Rp {{ formatNumber(dailyBudgetPerformance.dailyExpensesUntilToday) }}
                  </p>
                </div>
                <span class="text-sm font-bold" :class="dailyBudgetPerformance.delta >= 0 ? 'text-teal-500' : 'text-rose-500'">
                  {{ dailyBudgetPerformance.delta >= 0 ? '+' : '-' }}Rp {{ formatNumber(dailyBudgetPerformance.absDelta) }}
                </span>
              </div>
              <div class="w-full bg-gray-100 rounded-full h-2">
                <div class="h-2 rounded-full" :class="dailyBudgetPerformance.delta >= 0 ? 'bg-teal-400' : 'bg-rose-400'" style="width: 100%"></div>
              </div>
            </div>

            <!-- Remaining Monthly Budget (2 progress bars) -->
            <div class="pt-3 border-t border-gray-100 space-y-3.5">
              <div>
                <p class="font-semibold text-gray-900 text-sm">Remaining Monthly Budget</p>
                <p class="text-xs text-gray-400">Projected budget based on current balance & remaining expenses</p>
              </div>

              <!-- Bar 1: Without Receivable -->
              <div class="bg-gray-50/80 p-3.5 rounded-2xl border border-gray-100">
                <div class="flex justify-between items-end mb-2">
                  <div>
                    <span class="text-xs font-semibold text-gray-700">Without Receivable</span>
                    <p class="text-[11px] text-gray-400 mt-0.5">Balance Rp {{ formatNumber(currentBalance) }} &minus; Expenses Rp {{ formatNumber(remainingExpense) }}</p>
                  </div>
                  <span class="text-sm font-bold" :class="remainingBudgetWithoutReceivable >= 0 ? 'text-teal-500' : 'text-rose-500'">
                    {{ remainingBudgetWithoutReceivable >= 0 ? '+' : '-' }}Rp {{ formatNumber(Math.abs(remainingBudgetWithoutReceivable)) }}
                  </span>
                </div>
                <div class="w-full bg-gray-200/80 rounded-full h-2">
                  <div 
                    class="h-2 rounded-full transition-all" 
                    :class="remainingBudgetWithoutReceivable >= 0 ? 'bg-teal-400' : 'bg-rose-400'" 
                    :style="{ width: remainingWithoutReceivableBarWidth + '%' }">
                  </div>
                </div>
              </div>

              <!-- Bar 2: With Receivable -->
              <div class="bg-gray-50/80 p-3.5 rounded-2xl border border-gray-100">
                <div class="flex justify-between items-end mb-2">
                  <div>
                    <span class="text-xs font-semibold text-gray-700">With Receivable</span>
                    <p class="text-[11px] text-gray-400 mt-0.5">+Rp {{ formatNumber(remainingIncome) }} pending</p>
                  </div>
                  <span class="text-sm font-bold" :class="remainingBudgetWithReceivable >= 0 ? 'text-teal-500' : 'text-rose-500'">
                    {{ remainingBudgetWithReceivable >= 0 ? '+' : '-' }}Rp {{ formatNumber(Math.abs(remainingBudgetWithReceivable)) }}
                  </span>
                </div>
                <div class="w-full bg-gray-200/80 rounded-full h-2">
                  <div 
                    class="h-2 rounded-full transition-all" 
                    :class="remainingBudgetWithReceivable >= 0 ? 'bg-teal-400' : 'bg-rose-400'" 
                    :style="{ width: remainingWithReceivableBarWidth + '%' }">
                  </div>
                </div>
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

const totalDaysInPeriod = computed(() => {
  if (!data.value || !data.value.period) return 0;
  const period = data.value.period;
  const startDate = new Date(period.start_date);
  startDate.setHours(0, 0, 0, 0);
  const endDate = new Date(period.end_date);
  endDate.setHours(23, 59, 59, 999);
  const msPerDay = 1000 * 3600 * 24;
  return Math.ceil((endDate.getTime() - startDate.getTime()) / msPerDay);
});

const remainingDays = computed(() => {
  if (!data.value || !data.value.period) return 0;
  const period = data.value.period;
  const startDate = new Date(period.start_date);
  startDate.setHours(0, 0, 0, 0);
  const endDate = new Date(period.end_date);
  endDate.setHours(23, 59, 59, 999);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (today > endDate) return 0;
  const msPerDay = 1000 * 3600 * 24;
  if (today < startDate) {
    return Math.ceil((endDate.getTime() - startDate.getTime()) / msPerDay);
  }
  return Math.floor((endDate.getTime() - today.getTime()) / msPerDay) + 1;
});

const totalDailyBudget = computed(() => {
  if (!data.value || !data.value.period || !data.value.period.budgets) return 0;
  return data.value.period.budgets.reduce((sum: number, b: any) => sum + Number(b.daily_budget), 0);
});

const dailyBudgetRemaining = computed(() => {
  // daily_budget * remaining_days
  return totalDailyBudget.value * remainingDays.value;
});

const dailyBudgetRemainingBarWidth = computed(() => {
  if (totalDaysInPeriod.value <= 0) return 0;
  return Math.min(100, Math.max(5, Math.round((remainingDays.value / totalDaysInPeriod.value) * 100)));
});

const dailyBudgetTodayData = computed(() => {
  if (!data.value || !data.value.period || !data.value.period.budgets) {
    return {
      dailyBudget: 0,
      spentToday: 0,
      remainingToday: 0
    };
  }

  const period = data.value.period;
  const now = new Date();
  const isSameDay = (dateStr: string) => {
    if (!dateStr) return false;
    const d = new Date(dateStr);
    return d.getFullYear() === now.getFullYear() &&
           d.getMonth() === now.getMonth() &&
           d.getDate() === now.getDate();
  };

  const dailyBudget = period.budgets.reduce((sum: number, b: any) => sum + Number(b.daily_budget), 0);

  const spentToday = (period.transactions || [])
    .filter((t: any) => t.type === 'expense' && (t.category || '').toLowerCase() === 'daily' && isSameDay(t.date))
    .reduce((sum: number, t: any) => sum + Number(t.amount), 0);

  const remainingToday = dailyBudget - spentToday;

  return {
    dailyBudget,
    spentToday,
    remainingToday
  };
});

const dailyBudgetTodayBarWidth = computed(() => {
  const { dailyBudget, remainingToday } = dailyBudgetTodayData.value;
  if (!dailyBudget || dailyBudget <= 0) return 0;
  if (remainingToday <= 0) return 100;
  return Math.min(100, Math.max(5, Math.round((remainingToday / dailyBudget) * 100)));
});

const dailyBudgetPerformance = computed(() => {
  if (!data.value || !data.value.period || !data.value.period.budgets) {
    return {
      plannedBudgetUntilToday: 0,
      dailyExpensesUntilToday: 0,
      delta: 0,
      status: 'excess',
      absDelta: 0,
      numOfDaysSinceStartPeriod: 0
    };
  }

  const period = data.value.period;
  const startDate = new Date(period.start_date);
  startDate.setHours(0, 0, 0, 0);

  const endDate = new Date(period.end_date);
  endDate.setHours(23, 59, 59, 999);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const msPerDay = 1000 * 60 * 60 * 24;
  const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / msPerDay) + 1;

  let numOfDaysSinceStartPeriod = 0;
  if (today >= startDate) {
    const elapsed = Math.floor((today.getTime() - startDate.getTime()) / msPerDay) + 1;
    numOfDaysSinceStartPeriod = Math.min(totalDays, Math.max(1, elapsed));
  }

  const totalDailyBudget = period.budgets.reduce((sum: number, b: any) => sum + Number(b.daily_budget), 0);
  const plannedBudgetUntilToday = totalDailyBudget * numOfDaysSinceStartPeriod;

  const dailyExpensesUntilToday = period.transactions
    .filter((t: any) => t.type === 'expense' && (t.category || '').toLowerCase() === 'daily')
    .reduce((sum: number, t: any) => sum + t.amount, 0);

  const delta = plannedBudgetUntilToday - dailyExpensesUntilToday;
  const status = delta < 0 ? 'deficit' : 'excess';
  const absDelta = Math.abs(delta);

  return {
    plannedBudgetUntilToday,
    dailyExpensesUntilToday,
    delta,
    status,
    absDelta,
    numOfDaysSinceStartPeriod
  };
});

const allBudgetedIncomes = computed(() => {
  return incomeItems.value.reduce((sum, i) => sum + Number(i.amount), 0);
});

const allBudgetedExpenses = computed(() => {
  const itemExpenses = expenseItems.value.reduce((sum, i) => sum + Number(i.amount), 0);
  const plannedDailyBudget = totalDailyBudget.value * totalDaysInPeriod.value;
  return itemExpenses + plannedDailyBudget;
});

const totalProjection = computed(() => {
  return allBudgetedIncomes.value - allBudgetedExpenses.value;
});

const excessDeficit = totalProjection;

const currentBalance = computed(() => {
  return data.value?.balances?.total || 0;
});

const remainingExpense = computed(() => {
  const expenseRemaining = expenseItems.value.reduce((sum, i) => sum + Number(i.remaining), 0);
  return expenseRemaining + dailyBudgetRemaining.value;
});

const remainingIncome = computed(() => {
  return incomeItems.value.reduce((sum, i) => sum + Number(i.remaining), 0);
});

const remainingBudgetWithoutReceivable = computed(() => {
  return currentBalance.value - remainingExpense.value;
});

const remainingBudgetWithReceivable = computed(() => {
  return remainingBudgetWithoutReceivable.value + remainingIncome.value;
});

const remainingWithoutReceivableBarWidth = computed(() => {
  const balance = currentBalance.value;
  const rem = remainingBudgetWithoutReceivable.value;
  if (rem >= 0) {
    if (balance <= 0) return 100;
    return Math.min(100, Math.max(5, Math.round((rem / balance) * 100)));
  } else {
    const expense = remainingExpense.value;
    if (expense <= 0) return 100;
    return Math.min(100, Math.max(5, Math.round((Math.abs(rem) / expense) * 100)));
  }
});

const remainingWithReceivableBarWidth = computed(() => {
  const totalFunds = currentBalance.value + remainingIncome.value;
  const rem = remainingBudgetWithReceivable.value;
  if (rem >= 0) {
    if (totalFunds <= 0) return 100;
    return Math.min(100, Math.max(5, Math.round((rem / totalFunds) * 100)));
  } else {
    const expense = remainingExpense.value;
    if (expense <= 0) return 100;
    return Math.min(100, Math.max(5, Math.round((Math.abs(rem) / expense) * 100)));
  }
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
