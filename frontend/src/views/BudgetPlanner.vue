<template>
  <div class="space-y-8" v-if="budget">
    <div class="flex items-center gap-4 mb-8">
      <button @click="$router.push('/budget')" class="w-10 h-10 flex items-center justify-center bg-white rounded-full shadow-sm hover:bg-gray-50 text-gray-500 transition-colors">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path></svg>
      </button>
      <h1 class="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
        <div v-if="editingName" class="flex items-center gap-2">
          <input 
            ref="nameInputRef"
            v-model="tempName" 
            @keyup.enter="saveBudgetName" 
            @keydown.esc="cancelEditingName"
            class="bg-white border-2 border-indigo-500 rounded-xl px-3 py-1 text-2xl font-bold text-gray-900 focus:outline-none shadow-sm" 
          />
          <button @click="saveBudgetName" class="p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors shadow-sm" title="Save">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"></path></svg>
          </button>
          <button @click="cancelEditingName" class="p-2 bg-gray-100 text-gray-500 rounded-xl hover:bg-gray-200 transition-colors" title="Cancel">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>
        <template v-else>
          <span>{{ budget.name }}</span>
          <button @click="startEditingName" class="text-gray-400 hover:text-indigo-600 transition-colors p-1.5 hover:bg-indigo-50 rounded-xl" title="Rename Budget">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
          </button>
        </template>
      </h1>
    </div>

    <!-- Summary Card -->
    <div class="bg-gradient-to-br from-indigo-50 to-white rounded-3xl p-7 shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-indigo-50 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
      <div class="bg-white rounded-2xl p-4 shadow-sm border border-gray-50">
        <div class="text-emerald-500 font-semibold text-sm mb-1">Total Income</div>
        <div class="text-2xl font-bold text-gray-900">Rp {{ formatNumber(totalIncome) }}</div>
      </div>
      <div class="bg-white rounded-2xl p-4 shadow-sm border border-gray-50">
        <div class="text-rose-500 font-semibold text-sm mb-1">Total Expense</div>
        <div class="text-2xl font-bold text-gray-900">Rp {{ formatNumber(totalExpense) }}</div>
      </div>
      <div class="bg-indigo-600 rounded-2xl p-4 shadow-md text-white">
        <div class="text-indigo-100 font-semibold text-sm mb-1">Remaining</div>
        <div class="text-2xl font-bold">Rp {{ formatNumber(remaining) }}</div>
      </div>
    </div>

    <!-- Items List -->
    <div class="bg-white rounded-3xl shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-gray-50 overflow-hidden">
      <div class="p-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
        <h2 class="text-xl font-bold text-gray-900">Budget Items</h2>
        <button @click="addNewItem" class="text-sm bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-full font-semibold flex items-center gap-2 shadow-sm transition-colors">
          <span class="text-lg leading-none mt-[-2px]">+</span> Add Item
        </button>
      </div>

      <!-- Desktop Table -->
      <table class="hidden md:table min-w-full divide-y divide-gray-50">
        <thead>
          <tr>
            <th class="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Item Name</th>
            <th class="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Type</th>
            <th class="px-6 py-4 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">Amount (Rp)</th>
            <th class="px-6 py-4 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-50">
          <tr v-for="item in budget.items" :key="item.id" class="hover:bg-[#F4F5FB] transition-colors group">
            <td class="px-6 py-3">
              <input v-model="item.name" @change="saveItem(item)" class="w-full bg-transparent border-none focus:ring-0 px-2 py-2 font-bold text-gray-900 placeholder-gray-300 rounded-lg hover:bg-white focus:bg-white" placeholder="e.g. Groceries" />
            </td>
            <td class="px-6 py-3">
              <select v-model="item.type" @change="saveItem(item)" class="bg-transparent border-none text-sm font-semibold focus:ring-0 cursor-pointer rounded-lg hover:bg-white focus:bg-white px-3 py-2" :class="item.type === 'income' ? 'text-emerald-600' : 'text-rose-600'">
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
            </td>
            <td class="px-6 py-3 text-right">
              <div class="flex items-center justify-end">
                <input v-model.number="item.amount" @change="saveItem(item)" type="number" class="w-32 bg-transparent text-right border-none focus:ring-0 px-3 py-2 font-bold text-gray-900 rounded-lg hover:bg-white focus:bg-white" />
              </div>
            </td>
            <td class="px-6 py-3 text-center">
              <button @click="removeItem(item)" class="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-rose-500 hover:bg-rose-50 transition-colors mx-auto">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Mobile List -->
      <div class="md:hidden divide-y divide-gray-50">
        <div v-for="item in budget.items" :key="item.id" class="p-5 space-y-4">
          <div class="flex justify-between items-center">
            <input v-model="item.name" @change="saveItem(item)" class="font-bold text-lg bg-transparent border-none focus:ring-0 p-0 w-2/3 text-gray-900" placeholder="Item name" />
            <button @click="removeItem(item)" class="text-rose-400 p-2 bg-rose-50 rounded-full">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
            </button>
          </div>
          <div class="flex justify-between items-center bg-gray-50 p-3 rounded-2xl">
            <select v-model="item.type" @change="saveItem(item)" class="text-sm font-semibold bg-transparent border-none focus:ring-0 p-0" :class="item.type === 'income' ? 'text-emerald-600' : 'text-rose-600'">
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
            <div class="flex items-center">
              <span class="text-sm text-gray-500 mr-2 font-medium">Rp</span>
              <input v-model.number="item.amount" @change="saveItem(item)" type="number" class="w-24 text-right bg-transparent border-none focus:ring-0 p-0 font-bold text-gray-900" />
            </div>
          </div>
        </div>
      </div>
      
      <div v-if="budget.items.length === 0" class="p-10 text-center flex flex-col items-center justify-center">
        <div class="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-300 mb-4">
          <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4M12 20V4"></path></svg>
        </div>
        <h3 class="text-lg font-bold text-gray-900 mb-1">No items yet</h3>
        <p class="text-gray-400 text-sm">Click the "+ Add Item" button to create your first budget item.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue';
import { useRoute } from 'vue-router';
import { fetchBudget, createBudgetItem, updateBudgetItem, deleteBudgetItem, updateBudget } from '../api';

const route = useRoute();
const budget = ref<any>(null);
const editingName = ref(false);
const tempName = ref('');
const nameInputRef = ref<HTMLInputElement | null>(null);

const loadBudget = async () => {
  try {
    budget.value = await fetchBudget(route.params.id as string);
  } catch (err) {
    console.error('Failed to load budget');
  }
};

onMounted(loadBudget);

const startEditingName = () => {
  tempName.value = budget.value?.name || '';
  editingName.value = true;
  nextTick(() => {
    nameInputRef.value?.focus();
    nameInputRef.value?.select();
  });
};

const cancelEditingName = () => {
  editingName.value = false;
};

const saveBudgetName = async () => {
  if (!editingName.value) return;
  const newName = tempName.value.trim();
  if (!newName) {
    cancelEditingName();
    return;
  }

  editingName.value = false;
  if (budget.value) {
    budget.value.name = newName;
    try {
      await updateBudget(budget.value.id, {
        name: newName
      });
    } catch(err) {
      console.error(err);
      alert('Failed to update budget name');
    }
  }
};

const addNewItem = async () => {
  try {
    const newItem = await createBudgetItem(budget.value.id, {
      name: '',
      type: 'expense',
      amount: 0
    });
    budget.value.items.push(newItem);
  } catch (err) {
    console.error(err);
  }
};

const saveItem = async (item: any) => {
  try {
    await updateBudgetItem(item.id, {
      name: item.name,
      type: item.type,
      amount: item.amount
    });
  } catch (err) {
    console.error(err);
  }
};

const removeItem = async (item: any) => {
  if (!confirm('Are you sure you want to delete this item?')) return;
  try {
    await deleteBudgetItem(item.id);
    budget.value.items = budget.value.items.filter((i: any) => i.id !== item.id);
  } catch (err) {
    console.error(err);
  }
};

const totalIncome = computed(() => {
  if (!budget.value || !budget.value.items) return 0;
  return budget.value.items.filter((i: any) => i.type === 'income').reduce((sum: number, i: any) => sum + Number(i.amount), 0);
});

const totalExpense = computed(() => {
  if (!budget.value || !budget.value.items) return 0;
  let expense = budget.value.items.filter((i: any) => i.type === 'expense').reduce((sum: number, i: any) => sum + Number(i.amount), 0);
  if (budget.value.period && budget.value.daily_budget) {
    const days = Math.ceil((new Date(budget.value.period.end_date).getTime() - new Date(budget.value.period.start_date).getTime()) / (1000 * 3600 * 24)) + 1;
    expense += Number(budget.value.daily_budget) * days;
  }
  return expense;
});

const remaining = computed(() => totalIncome.value - totalExpense.value);

const formatNumber = (num: number) => {
  return new Intl.NumberFormat('id-ID').format(Number(num) || 0);
};
</script>

