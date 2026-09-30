import { PrismaClient } from '@prisma/client';
import express, { Request, Response } from 'express';

export function setupRoutes(app: express.Express, prisma: PrismaClient) {
  // --- SETTINGS ---
  app.get('/settings', async (req, res) => {
    let settings = await prisma.settings.findFirst();
    if (!settings) {
      settings = await prisma.settings.create({ data: {} });
    }
    res.json(settings);
  });

  app.put('/settings/active-period', async (req, res) => {
    const { period_id } = req.body;
    let settings = await prisma.settings.findFirst();
    if (settings) {
      settings = await prisma.settings.update({
        where: { id: settings.id },
        data: { active_period: period_id },
      });
    } else {
      settings = await prisma.settings.create({
        data: { active_period: period_id },
      });
    }
    res.json(settings);
  });

  // --- PERIODS ---
  app.get('/periods', async (req, res) => {
    const periods = await prisma.period.findMany({
      include: { budgets: true },
      orderBy: { start_date: 'desc' }
    });
    res.json(periods);
  });
  
  app.post('/periods', async (req, res) => {
    const { start_date, end_date } = req.body;
    const period = await prisma.period.create({
      data: { start_date: new Date(start_date), end_date: new Date(end_date) }
    });
    res.json(period);
  });

  app.put('/periods/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { start_date, end_date, budget_id } = req.body;
      const data: any = {};
      if (start_date) data.start_date = new Date(start_date);
      if (end_date) data.end_date = new Date(end_date);

      let period = await prisma.period.update({
        where: { id },
        data
      });

      if (budget_id !== undefined) {
        await prisma.budget.updateMany({
          where: { period_id: id },
          data: { period_id: null },
        });
        if (budget_id) {
          await prisma.budget.update({
            where: { id: budget_id },
            data: { period_id: id },
          });
        }
        const updated = await prisma.period.findUnique({
          where: { id },
          include: { budgets: true }
        });
        if (updated) period = updated;
      }

      res.json(period);
    } catch (error) {
      console.error('Error updating period:', error);
      res.status(500).json({ error: 'Failed to update period' });
    }
  });

  // --- BUDGETS ---
  app.get('/budgets', async (req, res) => {
    const budgets = await prisma.budget.findMany({
      include: { period: true, items: true }
    });
    res.json(budgets);
  });

  app.get('/budgets/:id', async (req, res) => {
    const budget = await prisma.budget.findUnique({
      where: { id: req.params.id },
      include: { items: true, period: true }
    });
    res.json(budget);
  });

  app.post('/budgets', async (req, res) => {
    const { name, daily_budget, period_id } = req.body;
    const budget = await prisma.budget.create({
      data: { name, daily_budget, period_id }
    });
    res.json(budget);
  });
  
  app.put('/budgets/:id', async (req, res) => {
    try {
      const { name, daily_budget, period_id } = req.body;
      const data: any = {};
      if (name !== undefined) data.name = name;
      if (daily_budget !== undefined) data.daily_budget = daily_budget;
      if (period_id !== undefined) data.period_id = period_id;

      const budget = await prisma.budget.update({
        where: { id: req.params.id },
        data,
      });
      res.json(budget);
    } catch (error) {
      console.error('Error updating budget:', error);
      res.status(500).json({ error: 'Failed to update budget' });
    }
  });

  app.put('/periods/:id/assign-budget', async (req, res) => {
    try {
      const { id } = req.params;
      const { budget_id } = req.body;

      // Unassign any budget currently attached to this period
      await prisma.budget.updateMany({
        where: { period_id: id },
        data: { period_id: null },
      });

      // If budget_id provided, assign it
      if (budget_id) {
        await prisma.budget.update({
          where: { id: budget_id },
          data: { period_id: id },
        });
      }

      const period = await prisma.period.findUnique({
        where: { id },
        include: { budgets: true },
      });
      res.json(period);
    } catch (error) {
      console.error('Error assigning budget to period:', error);
      res.status(500).json({ error: 'Failed to assign budget to period' });
    }
  });

  // --- BUDGET ITEMS ---
  app.post('/budgets/:id/items', async (req, res) => {
    const { name, type, amount } = req.body;
    const item = await prisma.budgetItem.create({
      data: { budget_id: req.params.id, name, type, amount }
    });
    res.json(item);
  });

  app.put('/budget-items/:id', async (req, res) => {
    const { name, type, amount } = req.body;
    const item = await prisma.budgetItem.update({
      where: { id: req.params.id },
      data: { name, type, amount }
    });
    res.json(item);
  });

  app.delete('/budget-items/:id', async (req, res) => {
    await prisma.budgetItem.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  });

  // --- DASHBOARD / TRANSACTIONS ---
  app.get('/dashboard', async (req, res) => {
    const settings = await prisma.settings.findFirst();
    if (!settings || !settings.active_period) {
      return res.status(400).json({ error: 'No active period set' });
    }
    const period = await prisma.period.findUnique({
      where: { id: settings.active_period },
      include: { 
        budgets: { include: { items: true } },
        transactions: {
          where: { is_deleted: false },
          include: { budget_item: true },
          orderBy: { date: 'desc' }
        } 
      }
    });
    if (!period) return res.status(404).json({ error: 'Period not found' });
    
    // Balance aggregation
    let cash = 0, balance = 0, credit = 0;
    period.transactions.forEach(t => {
      const amt = t.type === 'income' ? t.amount : -t.amount;
      if (t.source === 'cash') cash += amt;
      else if (t.source === 'balance') balance += amt;
      else if (t.source === 'credit') credit += amt;
    });

    res.json({
      period,
      balances: { cash, balance, credit, total: cash + balance + credit }
    });
  });

  app.get('/transactions', async (req, res) => {
    try {
      const settings = await prisma.settings.findFirst();
      const periodId = (req.query.period_id as string) || settings?.active_period;
      if (!periodId) {
        return res.json([]);
      }
      const transactions = await prisma.transaction.findMany({
        where: {
          period_id: periodId,
          is_deleted: false,
        },
        include: {
          budget_item: true,
        },
        orderBy: { date: 'desc' },
      });
      res.json(transactions);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      res.status(500).json({ error: 'Failed to fetch transactions' });
    }
  });

  app.delete('/transactions/:id', async (req, res) => {
    try {
      await prisma.transaction.update({
        where: { id: req.params.id },
        data: { is_deleted: true },
      });
      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting transaction:', error);
      res.status(500).json({ error: 'Failed to delete transaction' });
    }
  });
}
