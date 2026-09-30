import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'dashboard',
      component: () => import('../views/Dashboard.vue')
    },
    {
      path: '/transactions',
      name: 'transactions',
      component: () => import('../views/Transactions.vue')
    },
    {
      path: '/budget',
      name: 'budgets',
      component: () => import('../views/Budgets.vue')
    },
    {
      path: '/budget/planner/:id',
      name: 'budget-planner',
      component: () => import('../views/BudgetPlanner.vue')
    },
    {
      path: '/record-transaction',
      name: 'record-transaction',
      component: () => import('../views/RecordTransaction.vue')
    },
    {
      path: '/record-transaction/siri',
      name: 'record-transaction-siri',
      component: () => import('../views/RecordTransactionSiri.vue')
    },
    {
      path: '/budget/record-transaction',
      redirect: (to) => ({ path: '/record-transaction/siri', query: to.query })
    },
    {
      path: '/period',
      name: 'periods',
      component: () => import('../views/Periods.vue')
    }
  ]
});

export default router;
