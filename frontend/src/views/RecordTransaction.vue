<template>
  <div class="max-w-xl mx-auto min-h-[80vh] flex flex-col pt-8">
    <div class="text-center mb-10">
      <div class="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 text-indigo-600 rounded-2xl mb-4 shadow-sm">
        <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
      </div>
      <h1 class="text-3xl font-bold text-gray-900 tracking-tight">Record Transaction</h1>
      <p class="text-gray-500 mt-2">Log a new general income or expense transaction</p>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex-1 flex flex-col items-center justify-center text-indigo-600">
      <div class="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
      <p class="font-medium text-gray-500">Loading details...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="flex-1">
      <div class="bg-rose-50 text-rose-600 p-6 rounded-3xl border border-rose-100 text-center">
        <p class="font-bold text-lg mb-1">Error</p>
        <p>{{ error }}</p>
        <button @click="loadData" class="mt-4 px-4 py-2 bg-rose-600 text-white font-semibold text-xs rounded-xl cursor-pointer">
          Retry
        </button>
      </div>
    </div>

    <!-- Form Content -->
    <div v-else class="flex-1 space-y-6 pb-24 text-left">
      <!-- Card 1: Transaction Details Form -->
      <div class="bg-white p-7 rounded-3xl shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-gray-50 space-y-5">
        <h2 class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Transaction Details</h2>

        <!-- Amount Input -->
        <div>
          <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Amount</label>
          <div class="relative">
            <span class="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-400 text-base">Rp</span>
            <input 
              v-model.number="form.amount" 
              type="number" 
              min="1" 
              placeholder="0" 
              class="w-full pl-12 pr-4 py-3.5 bg-gray-50 rounded-2xl border border-gray-200 focus:border-indigo-500 focus:bg-white focus:outline-none font-bold text-lg text-gray-900 transition-colors"
            />
          </div>
        </div>

        <!-- Type (Dropdown) -->
        <div>
          <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Type</label>
          <div class="relative">
            <select 
              v-model="form.type" 
              class="w-full p-3.5 bg-gray-50 rounded-2xl border border-gray-200 focus:border-indigo-500 focus:bg-white focus:outline-none font-semibold text-gray-800 transition-colors appearance-none cursor-pointer"
            >
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>
            <div class="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
          </div>
        </div>

        <!-- Source (Dropdown) -->
        <div>
          <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Source</label>
          <div class="grid grid-cols-3 gap-2">
            <button
              v-for="s in (['cash', 'balance', 'credit'] as const)"
              :key="s"
              type="button"
              @click="form.source = s"
              class="py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer border"
              :class="form.source === s ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm' : 'bg-gray-50 text-gray-600 border-gray-100 hover:bg-gray-100'"
            >
              {{ s }}
            </button>
          </div>
        </div>

        <!-- Category Selection: daily, budget, other -->
        <div>
          <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Category</label>
          <div class="grid grid-cols-3 gap-2">
            <button
              type="button"
              @click="onCategoryChoice('daily')"
              class="py-2.5 rounded-xl font-bold text-xs capitalize transition-all cursor-pointer border"
              :class="categoryChoice === 'daily' ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm' : 'bg-gray-50 text-gray-600 border-gray-100 hover:bg-gray-100'"
            >
              Daily
            </button>
            <button
              type="button"
              @click="onCategoryChoice('budget')"
              class="py-2.5 rounded-xl font-bold text-xs capitalize transition-all cursor-pointer border"
              :class="categoryChoice === 'budget' ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm' : 'bg-gray-50 text-gray-600 border-gray-100 hover:bg-gray-100'"
            >
              Budget
            </button>
            <button
              type="button"
              @click="onCategoryChoice('other')"
              class="py-2.5 rounded-xl font-bold text-xs capitalize transition-all cursor-pointer border"
              :class="categoryChoice === 'other' ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm' : 'bg-gray-50 text-gray-600 border-gray-100 hover:bg-gray-100'"
            >
              Other
            </button>
          </div>

          <!-- Other custom category text input -->
          <div v-if="categoryChoice === 'other'" class="mt-3">
            <input 
              v-model="customCategory" 
              type="text" 
              placeholder="e.g. Gift, Bonus, Investment" 
              class="w-full px-4 py-3 bg-gray-50 rounded-2xl border border-gray-200 focus:border-indigo-500 focus:bg-white focus:outline-none font-medium text-sm text-gray-900 transition-colors"
            />
          </div>
        </div>

        <!-- Period (Dropdown, default value = active period) -->
        <div>
          <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Period</label>
          <div class="relative">
            <select 
              v-model="form.period_id" 
              class="w-full p-3.5 bg-gray-50 rounded-2xl border border-gray-200 focus:border-indigo-500 focus:bg-white focus:outline-none font-medium text-sm text-gray-800 transition-colors appearance-none cursor-pointer"
            >
              <option v-for="p in periods" :key="p.id" :value="p.id">
                {{ formatDate(p.start_date) }} &ndash; {{ formatDate(p.end_date) }} {{ p.id === activePeriodId ? '★ (Active)' : '' }}
              </option>
            </select>
            <div class="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
          </div>
        </div>
      </div>

      <!-- Card 2: Reusable Budget Item Selector (shown only if category is 'budget') -->
      <BudgetItemSelector
        v-if="categoryChoice === 'budget'"
        v-model="selectedBudgetItemId"
        :items="matchingBudgetItems"
        :type="form.type"
        @select="onBudgetItemSelected"
      />
    </div>

    <!-- Submit Button (Fixed at bottom on mobile, inline on desktop) -->
    <div v-if="!loading && !error" class="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-md border-t border-gray-100 shadow-[0_-4px_24px_rgba(0,0,0,0.02)] md:relative md:bg-transparent md:border-none md:shadow-none md:p-0">
      <button 
        @click="submit" 
        :disabled="isSubmitDisabled" 
        class="w-full py-4 rounded-2xl font-bold text-white transition-all transform active:scale-[0.98] cursor-pointer"
        :class="isSubmitDisabled ? 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-none' : 'bg-indigo-600 hover:bg-indigo-700 shadow-[0_4px_14px_0_rgb(79,70,229,0.39)]'">
        {{ submitting ? 'Saving...' : 'Confirm & Save' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { fetchPeriods, fetchDashboard, recordTransaction } from '../api';
import BudgetItemSelector from '../components/BudgetItemSelector.vue';

const router = useRouter();

const loading = ref(true);
const error = ref('');
const submitting = ref(false);

const periods = ref<any[]>([]);
const activePeriodId = ref<string | null>(null);

const categoryChoice = ref<'daily' | 'budget' | 'other'>('daily');
const customCategory = ref('');
const selectedBudgetItemId = ref<string | null>(null);
const selectedBudgetItemObj = ref<any>(null);

const form = reactive({
  amount: undefined as number | undefined,
  type: 'expense' as 'expense' | 'income',
  source: 'cash' as 'cash' | 'balance' | 'credit',
  period_id: ''
});

const loadData = async () => {
  try {
    loading.value = true;
    error.value = '';

    const [periodsRes, dashboardRes] = await Promise.all([
      fetchPeriods(),
      fetchDashboard().catch(() => null)
    ]);

    periods.value = periodsRes || [];
    if (dashboardRes?.period?.id) {
      activePeriodId.value = dashboardRes.period.id;
      form.period_id = dashboardRes.period.id;
    } else if (periods.value.length > 0) {
      form.period_id = periods.value[0].id;
    }
  } catch (err: any) {
    error.value = err.message || 'Failed to load periods';
  } finally {
    loading.value = false;
  }
};

onMounted(loadData);

const selectedPeriod = computed(() => {
  return periods.value.find(p => p.id === form.period_id);
});

// Watch type change: if type changes while budget category is selected, clear selection
watch(() => form.type, () => {
  selectedBudgetItemId.value = null;
  selectedBudgetItemObj.value = null;
});

// Watch period change: clear selected budget item
watch(() => form.period_id, () => {
  selectedBudgetItemId.value = null;
  selectedBudgetItemObj.value = null;
});

const onCategoryChoice = (choice: 'daily' | 'budget' | 'other') => {
  categoryChoice.value = choice;
  if (choice !== 'budget') {
    selectedBudgetItemId.value = null;
    selectedBudgetItemObj.value = null;
  }
};

const matchingBudgetItems = computed(() => {
  const p = selectedPeriod.value;
  if (!p || !p.budgets) return [];

  const items: any[] = [];
  const txs = p.transactions || [];

  p.budgets.forEach((b: any) => {
    (b.items || [])
      .filter((i: any) => i.type === form.type)
      .forEach((i: any) => {
        const realized = txs
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

const onBudgetItemSelected = (item: any) => {
  selectedBudgetItemObj.value = item;
};

const isSubmitDisabled = computed(() => {
  if (submitting.value) return true;
  if (!form.amount || form.amount <= 0) return true;
  if (!form.period_id) return true;

  if (categoryChoice.value === 'budget') {
    return !selectedBudgetItemId.value;
  }

  if (categoryChoice.value === 'other') {
    return !customCategory.value.trim();
  }

  return false;
});

const formatDate = (dateStr: string) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
};

const submit = async () => {
  if (isSubmitDisabled.value) return;

  let finalCategory = 'daily';
  let budgetItemId: string | null = null;

  if (categoryChoice.value === 'budget') {
    const item = selectedBudgetItemObj.value || matchingBudgetItems.value.find(i => i.id === selectedBudgetItemId.value);
    if (!item) return;
    finalCategory = item.name;
    budgetItemId = item.id;
  } else if (categoryChoice.value === 'other') {
    finalCategory = customCategory.value.trim();
  } else {
    finalCategory = 'daily';
  }

  try {
    submitting.value = true;
    await recordTransaction({
      amount: form.amount,
      type: form.type,
      source: form.source,
      category: finalCategory,
      budget_item_id: budgetItemId,
      period_id: form.period_id
    });

    setTimeout(() => {
      router.push('/transactions');
    }, 300);
  } catch (err: any) {
    alert('Failed to record transaction: ' + err.message);
    submitting.value = false;
  }
};
</script>
