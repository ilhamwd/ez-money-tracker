const API_BASE = '/api';

export async function fetchDashboard() {
  const res = await fetch(`${API_BASE}/dashboard`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function fetchBudgets() {
  const res = await fetch(`${API_BASE}/budgets`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function createBudget(data: any) {
  const res = await fetch(`${API_BASE}/budgets`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function fetchBudget(id: string) {
  const res = await fetch(`${API_BASE}/budgets/${id}`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function createBudgetItem(budgetId: string, data: any) {
  const res = await fetch(`${API_BASE}/budgets/${budgetId}/items`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function updateBudgetItem(id: string, data: any) {
  const res = await fetch(`${API_BASE}/budget-items/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function deleteBudgetItem(id: string) {
  const res = await fetch(`${API_BASE}/budget-items/${id}`, { method: 'DELETE' });
  return res.json();
}

export async function fetchPeriods() {
  const res = await fetch(`${API_BASE}/periods`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function createPeriod(data: any) {
  const res = await fetch(`${API_BASE}/periods`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function updatePeriod(id: string, data: any) {
  const res = await fetch(`${API_BASE}/periods/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function setActivePeriod(periodId: string) {
  const res = await fetch(`${API_BASE}/settings/active-period`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ period_id: periodId })
  });
  return res.json();
}

export async function recordTransaction(data: any) {
  const res = await fetch(`${API_BASE}/record-transaction`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function updateBudget(id: string, data: any) {
  const res = await fetch(`${API_BASE}/budgets/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function assignBudgetToPeriod(periodId: string, budgetId: string | null) {
  // Strategy 1: Dedicated assign-budget endpoint
  try {
    const res = await fetch(`${API_BASE}/periods/${periodId}/assign-budget`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ budget_id: budgetId || null })
    });
    if (res.ok) return await res.json();
    if (res.status !== 404) throw new Error(await res.text());
  } catch (err: any) {
    if (!err.message?.includes('Cannot PUT')) throw err;
  }

  // Strategy 2 (Fallback): PUT /periods/:id with budget_id
  try {
    const res = await fetch(`${API_BASE}/periods/${periodId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ budget_id: budgetId || null })
    });
    if (res.ok) return await res.json();
  } catch (e) {
    // continue to strategy 3
  }

  // Strategy 3 (Fallback): PUT /budgets/:id setting period_id directly
  if (budgetId) {
    const res = await fetch(`${API_BASE}/budgets/${budgetId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ period_id: periodId })
    });
    if (!res.ok) throw new Error(await res.text());
    return await res.json();
  }

  return { success: true };
}

export async function fetchTransactions(periodId?: string) {
  const url = periodId ? `${API_BASE}/transactions?period_id=${periodId}` : `${API_BASE}/transactions`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function deleteTransaction(id: string) {
  const res = await fetch(`${API_BASE}/transactions/${id}`, {
    method: 'DELETE'
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function duplicateBudget(id: string, data?: { name?: string; period_id?: string | null }) {
  const res = await fetch(`${API_BASE}/budgets/${id}/duplicate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data || {})
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function deleteBudget(id: string) {
  const res = await fetch(`${API_BASE}/budgets/${id}`, {
    method: 'DELETE'
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

