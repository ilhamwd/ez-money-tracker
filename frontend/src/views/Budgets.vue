<template>
  <div class="space-y-8">
    <div class="flex justify-between items-end mb-8">
      <div>
        <h1 class="text-3xl font-bold text-gray-900 tracking-tight">Budgets</h1>
        <p class="text-gray-500 mt-2">Manage your planned budget and expenses</p>
      </div>
      <button @click="showAddModal = true" class="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-full text-sm font-semibold flex items-center gap-2 transition-all shadow-[0_4px_14px_0_rgb(79,70,229,0.39)]">
        <span class="text-lg leading-none mt-[-2px]">+</span> Add Budget
      </button>
    </div>
    
    <div v-if="loading" class="text-gray-500 flex items-center gap-3">
      <div class="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      Loading budgets...
    </div>
    
    <div v-else class="hidden md:block bg-white shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-gray-50 rounded-3xl overflow-hidden p-2">
      <table class="min-w-full">
        <thead>
          <tr>
            <th class="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Name</th>
            <th class="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Period</th>
            <th class="px-6 py-4 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Income</th>
            <th class="px-6 py-4 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Expense</th>
            <th class="px-6 py-4 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">Remaining</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-50">
          <tr v-for="b in processedBudgets" :key="b.id" class="hover:bg-[#F4F5FB] cursor-pointer transition-colors rounded-2xl group" @click="$router.push('/budget/planner/' + b.id)">
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="font-bold text-gray-900">{{ b.name }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-medium">
              <span class="bg-gray-50 text-gray-600 px-3 py-1 rounded-full group-hover:bg-white transition-colors border border-gray-100">
                {{ b.period ? formatDate(b.period.start_date) + ' - ' + formatDate(b.period.end_date) : 'No period' }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-right font-bold text-emerald-500">Rp {{ formatNumber(b.totalIncome) }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-right font-bold text-rose-500">Rp {{ formatNumber(b.totalExpense) }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-right">
              <span class="px-3 py-1.5 rounded-full font-bold text-xs" :class="b.remaining >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'">
                Rp {{ formatNumber(b.remaining) }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-if="processedBudgets.length === 0" class="text-center py-10 text-gray-400">
        No budgets available. Create one to get started.
      </div>
    </div>

    <!-- Mobile view -->
    <div v-if="!loading" class="md:hidden space-y-4">
      <div v-for="b in processedBudgets" :key="b.id" class="bg-white p-5 rounded-3xl shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-gray-50 cursor-pointer active:scale-95 transition-transform" @click="$router.push('/budget/planner/' + b.id)">
        <h3 class="font-bold text-xl text-gray-900">{{ b.name }}</h3>
        <p class="text-xs text-gray-500 mb-4 mt-1 font-medium bg-gray-50 inline-block px-2 py-1 rounded border border-gray-100">{{ b.period ? formatDate(b.period.start_date) + ' - ' + formatDate(b.period.end_date) : 'No period' }}</p>
        <div class="grid grid-cols-2 gap-3 mb-4">
          <div class="bg-emerald-50 rounded-2xl p-3">
            <span class="block text-xs text-emerald-600 font-medium mb-1">Income</span> 
            <span class="block text-emerald-600 font-bold">Rp {{ formatNumber(b.totalIncome) }}</span>
          </div>
          <div class="bg-rose-50 rounded-2xl p-3">
            <span class="block text-xs text-rose-600 font-medium mb-1">Expense</span> 
            <span class="block text-rose-600 font-bold">Rp {{ formatNumber(b.totalExpense) }}</span>
          </div>
        </div>
        <div class="pt-3 border-t border-gray-50 flex justify-between items-center">
          <span class="text-gray-400 text-sm font-medium">Remaining:</span>
          <span class="font-bold text-lg" :class="b.remaining >= 0 ? 'text-emerald-500' : 'text-rose-500'">Rp {{ formatNumber(b.remaining) }}</span>
        </div>
      </div>
    </div>

    <!-- Add Budget Modal -->
    <div v-if="showAddModal" class="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-gray-900/40 backdrop-blur-sm transition-opacity px-4">
      <div class="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl p-7 shadow-2xl">
        <h3 class="text-xl font-bold text-gray-900 mb-6">Add New Budget</h3>
        <div class="space-y-5">
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-1">Name</label>
            <input v-model="newBudget.name" type="text" class="block w-full rounded-xl border-gray-200 bg-gray-50 border p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white outline-none transition-colors font-medium" placeholder="e.g. October 2026 Budget">
          </div>
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-1">Daily Budget (Rp)</label>
            <input v-model.number="newBudget.daily_budget" type="number" class="block w-full rounded-xl border-gray-200 bg-gray-50 border p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white outline-none transition-colors font-medium">
          </div>
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-1">Period</label>
            <select v-model="newBudget.period_id" class="block w-full rounded-xl border-gray-200 bg-gray-50 border p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white outline-none transition-colors font-medium text-gray-700">
              <option :value="null">None</option>
              <option v-for="p in periods" :key="p.id" :value="p.id">
                {{ formatDate(p.start_date) }} - {{ formatDate(p.end_date) }}
              </option>
            </select>
          </div>
          <div class="flex gap-3 pt-4">
            <button @click="showAddModal = false" class="flex-1 py-3.5 text-sm font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors">Cancel</button>
            <button @click="submitBudget" class="flex-1 py-3.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-lg shadow-indigo-200 transition-colors">Create</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { fetchBudgets, createBudget, fetchPeriods } from '../api';

const router = useRouter();
const budgets = ref<any[]>([]);
const periods = ref<any[]>([]);
const loading = ref(true);
const showAddModal = ref(false);

const newBudget = ref({
  name: '',
  daily_budget: 0,
  period_id: null as string | null
});

onMounted(async () => {
  try {
    const [bRes, pRes] = await Promise.all([fetchBudgets(), fetchPeriods()]);
    budgets.value = bRes;
    periods.value = pRes;
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
});

const processedBudgets = computed(() => {
  return budgets.value.map(b => {
    let totalIncome = 0;
    let totalExpense = 0;
    if (b.items) {
      b.items.forEach((item: any) => {
        if (item.type === 'income') totalIncome += Number(item.amount);
        else totalExpense += Number(item.amount);
      });
    }
    
    if (b.period && b.daily_budget) {
      const days = Math.ceil((new Date(b.period.end_date).getTime() - new Date(b.period.start_date).getTime()) / (1000 * 3600 * 24)) + 1;
      totalExpense += Number(b.daily_budget) * days;
    }

    return {
      ...b,
      totalIncome,
      totalExpense,
      remaining: totalIncome - totalExpense
    };
  });
});

const formatNumber = (num: number) => {
  return new Intl.NumberFormat('id-ID').format(Number(num) || 0);
};

const formatDate = (dateStr: string) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
};

const submitBudget = async () => {
  if (!newBudget.value.name) return;
  try {
    const created = await createBudget(newBudget.value);
    showAddModal.value = false;
    router.push('/budget/planner/' + created.id);
  } catch (err) {
    alert('Failed to create budget');
  }
};
</script>
