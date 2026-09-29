<template>
  <div class="space-y-8">
    <div class="flex justify-between items-end mb-8">
      <div>
        <h1 class="text-3xl font-bold text-gray-900 tracking-tight">Periods</h1>
        <p class="text-gray-500 mt-2">Manage budget timelines</p>
      </div>
      <button @click="showAddModal = true" class="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-full text-sm font-semibold flex items-center gap-2 transition-all shadow-[0_4px_14px_0_rgb(79,70,229,0.39)]">
        <span class="text-lg leading-none mt-[-2px]">+</span> Add Period
      </button>
    </div>

    <div v-if="loading" class="text-gray-500 flex items-center gap-3">
      <div class="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      Loading periods...
    </div>
    
    <div v-else class="bg-white shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-gray-50 rounded-3xl overflow-hidden hidden md:block p-2">
      <table class="min-w-full">
        <thead>
          <tr>
            <th class="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
            <th class="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Start Date</th>
            <th class="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">End Date</th>
            <th class="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Assigned Budget</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-50">
          <tr v-for="p in periods" :key="p.id" class="hover:bg-[#F4F5FB] transition-colors rounded-2xl group">
            <td class="px-6 py-4 whitespace-nowrap">
              <label class="flex items-center gap-3 cursor-pointer">
                <input type="radio" :checked="p.isActive" @change="toggleActive(p)" name="activePeriod" class="w-5 h-5 text-indigo-600 focus:ring-indigo-500 border-gray-300" />
                <span class="text-sm font-bold" :class="p.isActive ? 'text-indigo-600' : 'text-gray-500'">{{ p.isActive ? 'Active' : 'Inactive' }}</span>
              </label>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm">
              <input 
                type="date" 
                v-model="p.formatted_start" 
                @change="onStartDateChange(p)" 
                class="bg-transparent border-none focus:ring-2 focus:ring-indigo-100 rounded px-2 py-1 text-gray-900 font-medium cursor-pointer" 
              />
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm">
              <input 
                type="date" 
                v-model="p.formatted_end" 
                :min="p.formatted_start"
                @change="savePeriod(p)" 
                class="bg-transparent border-none focus:ring-2 focus:ring-indigo-100 rounded px-2 py-1 text-gray-900 font-medium cursor-pointer" 
              />
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm">
              <div class="flex items-center space-x-2">
                <select 
                  :value="p.assigned_budget_id" 
                  @change="handleAssignBudget(p.id, ($event.target as HTMLSelectElement).value)"
                  class="bg-indigo-50/70 hover:bg-indigo-50 text-indigo-700 font-semibold px-3 py-1.5 rounded-full border border-indigo-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                >
                  <option value="">No budget assigned</option>
                  <option v-for="b in allBudgets" :key="b.id" :value="b.id">
                    {{ b.name }}
                  </option>
                </select>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Mobile view -->
    <div v-if="!loading" class="md:hidden space-y-4">
      <div v-for="p in periods" :key="p.id" class="bg-white p-5 rounded-3xl shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-gray-50 space-y-4 transition-all" :class="{'ring-2 ring-indigo-500': p.isActive}">
        <div class="flex justify-between items-center pb-3 border-b border-gray-50">
          <label class="flex items-center gap-2 cursor-pointer">
            <input type="radio" :checked="p.isActive" @change="toggleActive(p)" name="activePeriodMobile" class="w-5 h-5 text-indigo-600 focus:ring-indigo-500 border-gray-300" />
            <span class="font-bold text-lg" :class="p.isActive ? 'text-indigo-600' : 'text-gray-900'">{{ p.isActive ? 'Active Period' : 'Inactive' }}</span>
          </label>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div class="bg-gray-50 p-3 rounded-2xl">
            <label class="block text-xs font-semibold text-gray-400 mb-1">Start Date</label>
            <input 
              type="date" 
              v-model="p.formatted_start" 
              @change="onStartDateChange(p)" 
              class="w-full text-sm bg-transparent border-none p-0 focus:ring-0 font-medium text-gray-900" 
            />
          </div>
          <div class="bg-gray-50 p-3 rounded-2xl">
            <label class="block text-xs font-semibold text-gray-400 mb-1">End Date</label>
            <input 
              type="date" 
              v-model="p.formatted_end" 
              :min="p.formatted_start"
              @change="savePeriod(p)" 
              class="w-full text-sm bg-transparent border-none p-0 focus:ring-0 font-medium text-gray-900" 
            />
          </div>
        </div>
        <div class="pt-2">
          <label class="block text-xs font-semibold text-gray-400 mb-2">Assigned Budget</label>
          <select 
            :value="p.assigned_budget_id" 
            @change="handleAssignBudget(p.id, ($event.target as HTMLSelectElement).value)"
            class="w-full bg-indigo-50/70 hover:bg-indigo-50 text-indigo-700 font-semibold px-3 py-2 rounded-xl border border-indigo-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
          >
            <option value="">No budget assigned</option>
            <option v-for="b in allBudgets" :key="b.id" :value="b.id">
              {{ b.name }}
            </option>
          </select>
        </div>
      </div>
    </div>

    <!-- Add Period Modal -->
    <div v-if="showAddModal" class="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-gray-900/40 backdrop-blur-sm transition-opacity px-4">
      <div class="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl p-7 shadow-2xl">
        <h3 class="text-xl font-bold text-gray-900 mb-6">Add New Period</h3>
        <div class="space-y-5">
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-1">Start Date</label>
            <input 
              v-model="newPeriod.start_date" 
              @change="onNewPeriodStartDateChange"
              type="date" 
              class="block w-full rounded-xl border-gray-200 bg-gray-50 border p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white outline-none transition-colors font-medium"
            >
          </div>
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-1">End Date</label>
            <input 
              v-model="newPeriod.end_date" 
              :min="newPeriod.start_date"
              type="date" 
              class="block w-full rounded-xl border-gray-200 bg-gray-50 border p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white outline-none transition-colors font-medium"
            >
          </div>
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-1">Assign Budget (Optional)</label>
            <select 
              v-model="newPeriod.budget_id"
              class="block w-full rounded-xl border-gray-200 bg-gray-50 border p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white outline-none transition-colors font-medium"
            >
              <option value="">No budget assigned</option>
              <option v-for="b in allBudgets" :key="b.id" :value="b.id">
                {{ b.name }}
              </option>
            </select>
          </div>
          <div class="flex gap-3 pt-4">
            <button @click="showAddModal = false" class="flex-1 py-3.5 text-sm font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors">Cancel</button>
            <button @click="submitPeriod" class="flex-1 py-3.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-lg shadow-indigo-200 transition-colors">Save Period</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { fetchPeriods, fetchBudgets, createPeriod, updatePeriod, setActivePeriod, assignBudgetToPeriod } from '../api';

const periods = ref<any[]>([]);
const allBudgets = ref<any[]>([]);
const loading = ref(true);
const showAddModal = ref(false);

const newPeriod = ref({
  start_date: '',
  end_date: '',
  budget_id: ''
});

const loadData = async () => {
  try {
    loading.value = true;
    const [resPeriods, resBudgets, settingsRes] = await Promise.all([
      fetchPeriods(),
      fetchBudgets(),
      fetch('/api/settings').then(r => r.json())
    ]);
    
    allBudgets.value = resBudgets;

    periods.value = resPeriods.map((p: any) => ({
      ...p,
      formatted_start: p.start_date ? new Date(p.start_date).toISOString().split('T')[0] : '',
      formatted_end: p.end_date ? new Date(p.end_date).toISOString().split('T')[0] : '',
      isActive: settingsRes.active_period === p.id,
      assigned_budget_id: p.budgets && p.budgets.length > 0 ? p.budgets[0].id : ''
    }));
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
};

onMounted(loadData);

const onStartDateChange = async (p: any) => {
  if (p.formatted_end && p.formatted_end < p.formatted_start) {
    p.formatted_end = p.formatted_start;
  }
  await savePeriod(p);
};

const onNewPeriodStartDateChange = () => {
  if (newPeriod.value.end_date && newPeriod.value.end_date < newPeriod.value.start_date) {
    newPeriod.value.end_date = newPeriod.value.start_date;
  }
};

const savePeriod = async (p: any) => {
  if (p.formatted_end && p.formatted_start && p.formatted_end < p.formatted_start) {
    p.formatted_end = p.formatted_start;
  }
  try {
    await updatePeriod(p.id, {
      start_date: p.formatted_start,
      end_date: p.formatted_end
    });
  } catch (err) {
    console.error(err);
    alert('Failed to update period');
  }
};

const handleAssignBudget = async (periodId: string, budgetId: string) => {
  try {
    await assignBudgetToPeriod(periodId, budgetId || null);
    await loadData();
  } catch (err: any) {
    console.error(err);
    alert('Failed to assign budget');
  }
};

const toggleActive = async (p: any) => {
  try {
    await setActivePeriod(p.id);
    periods.value.forEach(period => period.isActive = period.id === p.id);
  } catch (err) {
    console.error(err);
    alert('Failed to set active period');
  }
};

const submitPeriod = async () => {
  if (!newPeriod.value.start_date || !newPeriod.value.end_date) return;
  try {
    const created = await createPeriod({
      start_date: newPeriod.value.start_date,
      end_date: newPeriod.value.end_date
    });
    if (newPeriod.value.budget_id) {
      await assignBudgetToPeriod(created.id, newPeriod.value.budget_id);
    }
    showAddModal.value = false;
    newPeriod.value = { start_date: '', end_date: '', budget_id: '' };
    await loadData();
  } catch (err) {
    alert('Failed to create period');
  }
};
</script>

