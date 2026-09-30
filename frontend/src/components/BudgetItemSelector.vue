<template>
  <div class="bg-white rounded-3xl shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-gray-50 overflow-hidden">
    <div class="p-6 border-b border-gray-50 bg-gray-50/50 flex items-center justify-between">
      <h2 class="text-sm font-bold text-gray-900">Select Budget Item</h2>
      <span class="text-xs text-gray-400 font-medium" v-if="computedItems.length > 0">
        {{ computedItems.length }} available
      </span>
    </div>
    <div class="divide-y divide-gray-50 max-h-[40vh] overflow-y-auto">
      <label 
        v-for="item in computedItems" 
        :key="item.id" 
        class="flex items-center p-5 hover:bg-[#F4F5FB] cursor-pointer transition-colors group"
      >
        <input 
          type="radio" 
          :name="radioGroupName" 
          :value="item.id" 
          :checked="modelValue === item.id"
          @change="onSelect(item)"
          class="w-5 h-5 text-indigo-600 focus:ring-indigo-500 border-gray-300 transition-colors cursor-pointer"
        >
        <div class="ml-4 flex-1">
          <div class="font-bold text-gray-900">{{ item.name }}</div>
          <div class="text-xs text-gray-400 font-medium">{{ item.budgetName }}</div>
        </div>
        <div class="text-right">
          <div class="text-sm font-bold" :class="item.remaining >= 0 ? 'text-gray-900' : 'text-rose-500'">
            Rp {{ formatNumber(item.remaining) }}
          </div>
          <div class="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">remaining</div>
        </div>
      </label>
      <div v-if="computedItems.length === 0" class="p-10 text-center flex flex-col items-center justify-center">
        <div class="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 mb-3">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"></path></svg>
        </div>
        <p class="text-gray-500 font-medium">No budget items found for type: {{ type || 'selected' }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(defineProps<{
  modelValue: string | null;
  items?: any[];
  budgets?: any[];
  transactions?: any[];
  type?: string;
  name?: string;
}>(), {
  items: undefined,
  budgets: undefined,
  transactions: () => [],
  type: 'expense',
  name: 'budget-item-radio'
});

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
  (e: 'select', item: any): void;
}>();

const radioGroupName = computed(() => props.name || 'budget_item_selection');

const formatNumber = (num: number) => {
  return new Intl.NumberFormat('id-ID').format(Number(num) || 0);
};

const computedItems = computed(() => {
  if (props.items !== undefined) {
    return props.items;
  }

  if (!props.budgets) return [];

  const list: any[] = [];
  const targetType = props.type || 'expense';
  const txs = props.transactions || [];

  props.budgets.forEach((b: any) => {
    (b.items || [])
      .filter((i: any) => i.type === targetType)
      .forEach((i: any) => {
        const realized = txs
          .filter((t: any) => t.budget_item_id === i.id)
          .reduce((sum: number, t: any) => sum + t.amount, 0);

        list.push({
          ...i,
          budgetName: b.name,
          realized,
          remaining: Number(i.amount) - realized
        });
      });
  });

  return list;
});

const onSelect = (item: any) => {
  emit('update:modelValue', item.id);
  emit('select', item);
};
</script>
