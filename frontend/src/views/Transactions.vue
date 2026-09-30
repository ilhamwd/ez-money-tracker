<template>
  <div class="space-y-8">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-3xl font-bold text-gray-900 tracking-tight">Transactions</h1>
        <p class="text-sm text-gray-400 mt-1" v-if="period">
          Active Period: <span class="font-medium text-gray-700">{{ formatDate(period.start_date) }} &ndash; {{ formatDate(period.end_date) }}</span>
        </p>
        <p class="text-sm text-gray-400 mt-1" v-else>
          Showing all transactions within the active period
        </p>
      </div>

      <router-link
        to="/budget/record-transaction"
        class="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-2xl shadow-lg shadow-indigo-100 transition-colors shrink-0"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"></path></svg>
        Record Transaction
      </router-link>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-20 text-gray-400">
      <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mx-auto mb-4"></div>
      <p class="text-sm">Loading transactions...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="bg-rose-50 text-rose-600 p-6 rounded-3xl border border-rose-100 flex items-center justify-between">
      <p class="text-sm font-medium">{{ error }}</p>
      <button @click="loadData" class="text-xs font-bold underline hover:no-underline">Retry</button>
    </div>

    <!-- No Active Period State -->
    <div v-else-if="!period" class="bg-white rounded-3xl p-12 text-center shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-gray-50">
      <div class="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-amber-500">
        <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
      </div>
      <h2 class="text-lg font-bold text-gray-900 mb-1">No Active Period Selected</h2>
      <p class="text-sm text-gray-400 mb-6">Select an active period to view its recorded transactions.</p>
      <router-link to="/period" class="inline-flex px-5 py-2.5 bg-indigo-600 text-white font-semibold text-sm rounded-xl">
        Go to Periods
      </router-link>
    </div>

    <!-- Main Content -->
    <div v-else class="space-y-6">
      <!-- Summary Metric Cards -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="bg-white p-5 rounded-2xl shadow-sm border border-gray-50">
          <p class="text-xs text-gray-400 font-medium mb-1">Total Transactions</p>
          <p class="text-2xl font-bold text-gray-900">{{ transactions.length }}</p>
        </div>

        <div class="bg-white p-5 rounded-2xl shadow-sm border border-gray-50">
          <p class="text-xs text-gray-400 font-medium mb-1">Total Income</p>
          <p class="text-xl sm:text-2xl font-bold text-emerald-600">+Rp {{ formatNumber(summary.totalIncome) }}</p>
        </div>

        <div class="bg-white p-5 rounded-2xl shadow-sm border border-gray-50">
          <p class="text-xs text-gray-400 font-medium mb-1">Total Expenses</p>
          <p class="text-xl sm:text-2xl font-bold text-rose-600">-Rp {{ formatNumber(summary.totalExpense) }}</p>
        </div>

        <div class="bg-white p-5 rounded-2xl shadow-sm border border-gray-50">
          <p class="text-xs text-gray-400 font-medium mb-1">Net Flow</p>
          <p class="text-xl sm:text-2xl font-bold" :class="summary.netFlow >= 0 ? 'text-teal-600' : 'text-rose-600'">
            {{ summary.netFlow >= 0 ? '+' : '-' }}Rp {{ formatNumber(Math.abs(summary.netFlow)) }}
          </p>
        </div>
      </div>

      <!-- Single Card: All Transactions -->
      <div class="bg-white rounded-3xl p-6 sm:p-7 shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-gray-50">
        <!-- Card Header Controls -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-50">
          <div class="flex items-center gap-3">
            <div class="p-2.5 bg-indigo-50 rounded-xl text-indigo-600">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>
            </div>
            <div>
              <h2 class="text-lg font-bold text-gray-900">All Transactions</h2>
              <p class="text-xs text-gray-400">{{ filteredTransactions.length }} of {{ transactions.length }} items</p>
            </div>
          </div>

          <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <!-- Filter Pills -->
            <div class="flex bg-gray-50 p-1 rounded-xl text-xs font-semibold">
              <button
                @click="filterType = 'all'"
                class="px-3 py-1.5 rounded-lg transition-colors"
                :class="filterType === 'all' ? 'bg-white text-indigo-600 shadow-xs' : 'text-gray-500 hover:text-gray-900'"
              >
                All
              </button>
              <button
                @click="filterType = 'expense'"
                class="px-3 py-1.5 rounded-lg transition-colors"
                :class="filterType === 'expense' ? 'bg-white text-rose-600 shadow-xs' : 'text-gray-500 hover:text-gray-900'"
              >
                Expense
              </button>
              <button
                @click="filterType = 'income'"
                class="px-3 py-1.5 rounded-lg transition-colors"
                :class="filterType === 'income' ? 'bg-white text-emerald-600 shadow-xs' : 'text-gray-500 hover:text-gray-900'"
              >
                Income
              </button>
            </div>

            <!-- Search input -->
            <div class="relative">
              <svg class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Search transactions..."
                class="w-full sm:w-48 pl-9 pr-3 py-2 text-xs bg-gray-50 rounded-xl border border-transparent focus:border-indigo-200 focus:bg-white focus:outline-none transition-colors"
              />
            </div>
          </div>
        </div>

        <!-- Transactions List -->
        <div class="divide-y divide-gray-50 mt-2">
          <div
            v-for="item in filteredTransactions"
            :key="item.id"
            class="flex items-center justify-between py-3.5 px-2 hover:bg-gray-50/70 rounded-2xl transition-colors group"
          >
            <!-- Left Info -->
            <div class="flex items-center gap-3.5 min-w-0 pr-4">
              <!-- Type Icon -->
              <div
                class="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105"
                :class="item.type === 'income' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'"
              >
                <!-- Income arrow down -->
                <svg v-if="item.type === 'income'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
                </svg>
                <!-- Expense arrow up -->
                <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 10l7-7m0 0l7 7m-7-7v18"></path>
                </svg>
              </div>

              <!-- Title & Meta -->
              <div class="min-w-0">
                <div class="flex items-center gap-2 flex-wrap">
                  <p class="font-semibold text-gray-900 text-sm truncate capitalize">
                    {{ item.category || item.budget_item?.name || 'Transaction' }}
                  </p>
                  <!-- Source badge -->
                  <span
                    class="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
                    :class="getSourceBadgeClass(item.source)"
                  >
                    {{ item.source }}
                  </span>
                  <!-- Linked Budget Item (if different from category) -->
                  <span
                    v-if="item.budget_item && item.budget_item.name !== item.category"
                    class="text-[11px] text-gray-400 font-medium truncate hidden sm:inline"
                  >
                    &bull; {{ item.budget_item.name }}
                  </span>
                </div>
                <p class="text-xs text-gray-400 mt-0.5">
                  {{ formatDateTime(item.date) }}
                </p>
              </div>
            </div>

            <!-- Right Info: Amount & Actions -->
            <div class="flex items-center gap-3 shrink-0">
              <span
                class="text-sm sm:text-base font-bold tracking-tight"
                :class="item.type === 'income' ? 'text-emerald-600' : 'text-rose-600'"
              >
                {{ item.type === 'income' ? '+' : '-' }}Rp {{ formatNumber(item.amount) }}
              </span>

              <!-- Delete Button -->
              <button
                @click="onDeleteTransaction(item)"
                class="p-2 text-gray-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors opacity-70 group-hover:opacity-100"
                title="Delete transaction"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>

        <!-- Empty State inside card -->
        <div v-if="filteredTransactions.length === 0" class="text-center py-16 text-gray-400">
          <div class="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-3 text-gray-400">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>
          </div>
          <p class="text-sm font-semibold text-gray-600">No transactions found</p>
          <p class="text-xs text-gray-400 mt-1" v-if="searchQuery || filterType !== 'all'">
            Try adjusting your search or filter options.
          </p>
          <p class="text-xs text-gray-400 mt-1" v-else>
            No transactions have been recorded in this period yet.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { fetchDashboard, deleteTransaction } from '../api';

const loading = ref(true);
const error = ref<string | null>(null);
const period = ref<any>(null);
const transactions = ref<any[]>([]);

const filterType = ref<'all' | 'expense' | 'income'>('all');
const searchQuery = ref('');

const loadData = async () => {
  try {
    loading.value = true;
    error.value = null;
    const res = await fetchDashboard();
    period.value = res.period || null;
    transactions.value = (res.period?.transactions || []).filter((t: any) => !t.is_deleted);
  } catch (err: any) {
    error.value = err.message || 'Failed to load transactions';
  } finally {
    loading.value = false;
  }
};

onMounted(loadData);

const formatNumber = (num: number) => {
  return new Intl.NumberFormat('id-ID').format(Number(num) || 0);
};

const formatDate = (dateStr: string) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
};

const formatDateTime = (dateStr: string) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const dateFormatted = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  const timeFormatted = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return `${dateFormatted} • ${timeFormatted}`;
};

const getSourceBadgeClass = (source: string) => {
  switch (source) {
    case 'cash':
      return 'bg-emerald-50 text-emerald-700 border border-emerald-100';
    case 'balance':
      return 'bg-blue-50 text-blue-700 border border-blue-100';
    case 'credit':
      return 'bg-purple-50 text-purple-700 border border-purple-100';
    default:
      return 'bg-gray-100 text-gray-700';
  }
};

const summary = computed(() => {
  let totalIncome = 0;
  let totalExpense = 0;
  transactions.value.forEach(t => {
    if (t.type === 'income') totalIncome += Number(t.amount);
    else totalExpense += Number(t.amount);
  });
  return {
    totalIncome,
    totalExpense,
    netFlow: totalIncome - totalExpense
  };
});

const filteredTransactions = computed(() => {
  return transactions.value.filter(t => {
    // Type filter
    if (filterType.value !== 'all' && t.type !== filterType.value) {
      return false;
    }

    // Search query filter
    if (searchQuery.value.trim()) {
      const q = searchQuery.value.toLowerCase().trim();
      const cat = (t.category || '').toLowerCase();
      const budgetName = (t.budget_item?.name || '').toLowerCase();
      const source = (t.source || '').toLowerCase();
      const amountStr = String(t.amount);
      if (!cat.includes(q) && !budgetName.includes(q) && !source.includes(q) && !amountStr.includes(q)) {
        return false;
      }
    }

    return true;
  });
});

const onDeleteTransaction = async (item: any) => {
  const name = item.category || item.budget_item?.name || 'this transaction';
  if (!confirm(`Are you sure you want to delete ${name} (Rp ${formatNumber(item.amount)})?`)) {
    return;
  }

  try {
    await deleteTransaction(item.id);
    transactions.value = transactions.value.filter(t => t.id !== item.id);
  } catch (err: any) {
    alert(err.message || 'Failed to delete transaction');
  }
};
</script>
