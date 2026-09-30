# ez-money-tracker - Agent Documentation

## Technical Stack
- **Database:** PostgreSQL (v15)
- **ORM:** Prisma (v7 with `@prisma/adapter-pg` and `pg`)
- **Backend:** Express.js (Node.js 22 / TypeScript)
- **Frontend:** Vue 3 (Composition API / `<script setup>`), Vite 8, Tailwind CSS v4 (`@tailwindcss/vite`), Vue Router, TypeScript
- **Reverse Proxy:** Nginx (configured for Cloudflare proxying to `ezmoneytracker.biz.id` / `app.ezmoneytracker.biz.id`)

---

## Project Structure
- `.env`: Single source of truth (SSOT) environment configuration for both backend and postgres services.
- `.env.example`: Template for environment variables.
- `docker-compose.yaml`: Unified Compose configuration orchestrating `postgres`, `backend`, and `frontend` services.
- `backend/`: Express.js backend application.
  - `backend/Dockerfile`: Node 22 Alpine Docker image definition; builds TypeScript code and runs database client generation.
  - `backend/prisma/schema.prisma`: Prisma models and relations (note: Prisma 7 datasource URLs are managed via `prisma.config.ts`).
  - `backend/prisma.config.ts`: Prisma 7 configuration file for connection URLs.
  - `backend/src/index.ts`: Application entrypoint, CORS configuration, Prisma client initialization, and global middleware.
  - `backend/src/routes.ts`: REST API routes for settings, periods, budgets, budget items, and dashboard metrics.
- `frontend/`: Vue 3 Single Page Application (SPA).
  - `frontend/Dockerfile`: Node 22 Alpine Docker image for building and serving the frontend.
  - `frontend/vite.config.ts`: Vite 8 configuration with Tailwind v4 plugin, reverse proxy mapping (`/api` -> backend), and `server.allowedHosts: true`.
  - `frontend/src/api.ts`: Centralized API service with resilient fallback mechanisms.
  - `frontend/src/App.vue`: App shell with modern Google/Prodify-style sidebar navigation.
  - `frontend/src/components/BudgetItemSelector.vue`: Reusable radio selector for budget items with remaining budget calculations.
  - `frontend/src/views/Dashboard.vue`: Main dashboard showing financial overview, budget health cards, and categorized expense/income tables.
  - `frontend/src/views/Transactions.vue`: Unified transactions log for the active period in a single card with search and filters.
  - `frontend/src/views/Budgets.vue`: Budget overview list with responsive table (desktop) / card (mobile) layout, with quick actions to duplicate (including items) and delete budgets.
  - `frontend/src/views/BudgetPlanner.vue`: Detailed budget planning view with separated Income and Expense cards, inline item creation, inline budget renaming, budget duplication, and budget deletion.
  - `frontend/src/views/Periods.vue`: Period management view with active-period toggle, date picker validation, and period-budget assignment.
  - `frontend/src/views/RecordTransaction.vue`: General transaction recording form with category selection (daily, budget, other) and period assignment.
  - `frontend/src/views/RecordTransactionSiri.vue`: Dedicated quick transaction logger for Siri Shortcuts via URL query parameters.
- `postgres/`: Database container volume mapping (`postgres/.docker/db`).
- `nginx/`: Nginx proxy configuration files.

---

## Database Schema

### Table: `periods` (`Period` model)
- `id`: UUID (Primary Key)
- `start_date`: Date (start date of the budgeting period)
- `end_date`: Date (end date of the budgeting period)
- Relations: `transactions` (`Transaction[]`), `budgets` (`Budget[]`), `settings` (`Settings[]`)

### Table: `transactions` (`Transaction` model)
- `id`: UUID (Primary Key)
- `amount`: Integer (default: 0)
- `type`: Enum (`income`, `expense`)
- `source`: Enum (`cash`, `balance`, `credit`)
- `category`: String (optional; category `'daily'` designates daily budget spending)
- `date`: DateTime (default: current timestamp)
- `is_deleted`: Boolean (default: false)
- `period_id`: UUID (optional, foreign key to `periods.id`)
- `budget_item_id`: UUID (optional, foreign key to `budget_items.id`)

### Table: `settings` (`Settings` model)
- `id`: UUID (Primary Key)
- `active_period`: UUID (optional, foreign key to `periods.id`)

### Table: `budgets` (`Budget` model)
- `id`: UUID (Primary Key)
- `name`: String (not null)
- `daily_budget`: Decimal (not null)
- `period_id`: UUID (optional, foreign key to `periods.id`)
- Relations: `items` (`BudgetItem[]`), `period` (`Period?`)

### Table: `budget_items` (`BudgetItem` model)
- `id`: UUID (Primary Key)
- `budget_id`: UUID (foreign key to `budgets.id`, cascade delete)
- `name`: String (optional)
- `type`: Enum (`income`, `expense`)
- `amount`: Decimal (default: 0)

---

## Business Logic & Financial Calculations

### 1. Budgets & Budget Items Overview
A Budget represents the financial plan for an assigned period, containing:
- Multiple planned incomes (e.g. Salary, Freelance).
- Multiple planned expenses (e.g. Rent, Groceries, Electricity).
- A planned `daily_budget` allocation per day. Total planned daily budget for the entire period = `daily_budget * total_days_in_period`.

### 2. Daily Budget Remaining (For Rest of Period)
Tracks planned daily budget allocation for the remaining days in the period, taking into account elapsed days:
```typescript
const msPerDay = 1000 * 3600 * 24;
let remainingDays = 0;
if (today > endDate) {
  remainingDays = 0;
} else if (today < startDate) {
  remainingDays = Math.ceil((endDate.getTime() - startDate.getTime()) / msPerDay);
} else {
  remainingDays = Math.floor((endDate.getTime() - today.getTime()) / msPerDay) + 1;
}

const dailyBudgetRemaining = totalDailyBudget * remainingDays;
```

### 3. Remaining Daily Budget
Tracks spending for today specifically against the daily allowance:
```typescript
const dailyBudgetSpentToday = transactions
  .filter(t => t.type === 'expense' && t.category?.toLowerCase() === 'daily' && isSameDay(t.date, today))
  .reduce((sum, t) => sum + t.amount, 0);

const remainingToday = budget.daily_budget - dailyBudgetSpentToday;
```

### 4. Daily Budget Excess / Deficit (Elapsed Performance / Gamification)
Compares planned daily budget from period start up to today against actual daily spending incurred so far. This calculation is for gamification/display and does not alter underlying data:
```typescript
const elapsedDays = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 3600 * 24)) + 1;
const numOfDaysSinceStartPeriod = Math.min(totalDays, Math.max(1, elapsedDays));
const plannedBudgetUntilToday = budget.daily_budget * numOfDaysSinceStartPeriod;
const dailyExpensesUntilToday = transactions
  .filter(t => t.type === 'expense' && t.category?.toLowerCase() === 'daily')
  .reduce((sum, t) => sum + t.amount, 0);

const delta = plannedBudgetUntilToday - dailyExpensesUntilToday;
const status = delta < 0 ? "deficit" : "excess"; // excess if positive, deficit if negative
```

### 5. Remaining Monthly Budget (Projected Cash Flow)
Calculates projected funds left after covering remaining expenses:
- `currentBalance = cash + balance + credit`
- `remainingExpense = budgetedExpensesRemaining + dailyBudgetRemaining` (where `dailyBudgetRemaining = totalDailyBudget * remainingDays`)
- `remainingIncome = budgetedIncomeRemaining` (receivable)

**Two Metrics:**
1. **Without Receivable:**
   `remainingBudgetWithoutReceivable = currentBalance - remainingExpense`
2. **With Receivable:**
   `remainingBudgetWithReceivable = currentBalance - remainingExpense + remainingIncome`

---

## API Endpoints

### Settings
- `GET /settings`: Returns global settings (including active period ID).
- `PUT /settings/active-period`: Sets active period (`{ period_id: string }`).

### Periods
- `GET /periods`: Lists all periods ordered by start date descending (includes assigned budgets).
- `POST /periods`: Creates a period (`{ start_date: string, end_date: string }`).
- `PUT /periods/:id`: Updates dates and optionally assigns a budget (`{ start_date?: string, end_date?: string, budget_id?: string | null }`).
- `PUT /periods/:id/assign-budget`: Assigns or unassigns a budget to a period (`{ budget_id: string | null }`).

### Budgets
- `GET /budgets`: Lists all budgets with periods and items.
- `GET /budgets/:id`: Retrieves budget by ID with items and period.
- `POST /budgets`: Creates a budget (`{ name: string, daily_budget: number, period_id?: string | null }`).
- `PUT /budgets/:id`: Partially or fully updates a budget (`{ name?: string, daily_budget?: number, period_id?: string | null }`).
- `POST /budgets/:id/duplicate`: Duplicates a budget and all its associated budget items (`{ name?: string, period_id?: string | null }`).
- `DELETE /budgets/:id`: Deletes a budget (safely unlinks any transactions referencing its budget items before deletion).

### Budget Items
- `POST /budgets/:id/items`: Adds an item (`{ name: string, type: "income" | "expense", amount: number }`).
- `PUT /budget-items/:id`: Updates an item (`{ name?: string, type?: "income" | "expense", amount?: number }`).
- `DELETE /budget-items/:id`: Deletes an item by ID.

### Dashboard & Transactions
- `GET /dashboard`: Returns active period details, budgets with items, period transactions, and aggregate balances (`cash`, `balance`, `credit`, `total`).
- `GET /transactions`: Lists non-deleted transactions for the active period (or specified `?period_id=UUID`) ordered by date descending, including linked budget items.
- `DELETE /transactions/:id`: Soft-deletes a transaction by ID.
- `POST /record-transaction`: Records a transaction. If `period_id` is omitted, automatically assigns to `Settings.active_period`.
  ```json
  {
    "amount": 100000,
    "type": "expense",
    "source": "cash",
    "category": "daily",
    "budget_item_id": "optional-uuid",
    "period_id": "optional-uuid"
  }
  ```

---

## Siri Shortcuts Integration
The route `/record-transaction/siri` (with legacy fallback `/budget/record-transaction`) handles automated quick-recording triggered by Siri Shortcuts:
- **Query Parameters:** `?amount=150000&type=expense&source=cash`
- **UI Flow:** Displays the transaction parameters as read-only cards, renders a selectable radio list of matching budget items for the active period using `BudgetItemSelector`, and prompts the user to confirm.

---

## How to Run

### Option 1: Docker (Full Stack)
```bash
# Build and start all services (postgres, backend, frontend)
docker compose up -d --build

# View container logs
docker compose logs -f
```

### Option 2: Local Development

1. **Start PostgreSQL:**
   ```bash
   docker compose up -d postgres
   ```

2. **Initialize Database Schema (Prisma 7):**
   ```bash
   cd backend
   npx prisma generate
   npx prisma db push
   ```

3. **Run Backend Service:**
   ```bash
   cd backend
   npm run build
   npm run dev    # or npm start
   ```

4. **Run Frontend Application:**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

---

## Agent Guidelines & Database Schema Changes
When updating the database:
1. Edit `backend/prisma/schema.prisma`.
2. Run `npx prisma format` to ensure schema formatting.
3. Run `npx prisma generate` to refresh the Prisma Client.
4. Run `npx prisma db push` to synchronize changes to PostgreSQL.
5. In Prisma 7, direct connection strings belong in `prisma.config.ts`, not `schema.prisma`.
