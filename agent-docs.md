# ez-money-tracker - Agent Documentation

## Technical Stack
- **Database:** PostgreSQL (v15)
- **ORM:** Prisma
- **Framework:** Express.js (Node.js/TypeScript)

## Project Structure
- `.env`: Single source of truth (SSOT) configuration for both backend and postgres services.
- `.env.example`: Template for environment variables.
- `docker-compose.yaml`: Unified Compose file for the entire stack (PostgreSQL and Express backend).
- `backend/`: Contains the Express.js application and Prisma schema.
  - `backend/Dockerfile`: Docker image definition; copies root `.env` into `/app/.env` during build.
  - `backend/prisma/schema.prisma`: Database schema definitions.
  - `backend/src/index.ts`: Main Express application entrypoint.
- `postgres/`: Contains the database setup.
  - `postgres/.docker/db`: Local volume mount for persistent PostgreSQL data.
- `nginx/`: Nginx reverse proxy configuration for domain `ezmoneytracker.biz.id`.
  - `nginx/ezmoneytracker.biz.id.conf`: Port 80 reverse proxy configured for Cloudflare (passes CF-Connecting-IP, X-Forwarded-Proto, WebSocket support, no 443 required).

## Database Schema
**Table:** `periods` (mapped to `Period` model in Prisma)
- `id`: UUID (Primary Key)
- `start_date`: Date (start date of the budgeting period)
- `end_date`: Date (end date of the budgeting period)

**Table:** `transactions` (mapped to `Transaction` model in Prisma)
- `id`: UUID (Primary Key)
- `amount`: Integer (default: 0)
- `type`: Enum (`income`, `expense`)
- `source`: Enum (`cash`, `balance`, `credit`)
- `category`: String (optional)
- `date`: DateTime (default: current timestamp)
- `is_deleted`: Boolean (default: false)
- `period_id`: UUID (optional, foreign key to `periods.id`)

**Table:** `settings` (mapped to `Settings` model in Prisma)
- `id`: UUID (Primary Key)
- `active_period`: UUID (optional, foreign key to `periods.id`)

**Table:** `budgets` (mapped to `Budget` model in Prisma)
- `id`: UUID (Primary Key)
- `name`: String (not null)
- `daily_budget`: Decimal (not null)
- `period_id`: UUID (optional, foreign key to `periods.id`)

**Table:** `budget_items` (mapped to `BudgetItem` model in Prisma)
- `id`: UUID (Primary Key)
- `budget_id`: UUID (foreign key to `budgets.id`, cascade delete)
- `name`: String (optional)
- `type`: Enum (`income`, `expense`)
- `amount`: Decimal (default: 0)

## Budgets & Daily Budget Business Logic
### Overview
Budgets and BudgetItems define the planned/allocated finances for a given period. The structure mirrors transactions, capturing multiple planned income and planned expense entries.
Example breakdown:
- `+$250` freelance gig (income)
- `+$2000` office salary (income)
- `-$120` electricity bill (expense)
- `-$200` groceries (expense)
- `-$1500` total daily budget (planned monthly expense calculated as `daily_budget * num_of_days_in_period`)

### Daily Budget & Gamification (Excess / Deficit)
- `daily_budget` on `budgets` represents the maximum planned spending per day.
- Daily spending is tracked against allocated daily budget. When spending is under budget, it represents an **Excess**; when over budget, it represents a **Deficit**.
- **Important:** Excess/deficit calculation is purely for UI display/gamification. It does **not** alter stored transaction or budget numbers.
- **Pseudo-logic (Dart):**
  ```dart
  final now = DateTime.now();
  final numOfDaysSincePeriodStart = now.difference(period.startDate).inDays;
  final allocatedBudget = budget.dailyBudget * numOfDaysSincePeriodStart;
  final actualSpending = transactions.where((e) => e.category == "daily").fold<double>(0, (sum, e) => sum + e.amount);
  final message = "${allocatedBudget >= actualSpending ? "Excess" : "Deficit"}: ${(allocatedBudget - actualSpending).abs()}";
  ```
- **Example Usecase:**
  - Daily budget set to `$50` for Budget A at the start of the period.
  - Day 1: User spends `$20`.
  - Day 2: User spends `$10`.
  - Day 3: Total allocated budget = `3 * $50 = $150` (or `2 * $50 = $100` elapsed days). Total actual spent = `$20 + $10 = $30`. Excess budget = `$100 - $30 = $70` (or as elapsed in usecase: `$100 - $70 = $30`).
- **UI Display:**
  - The total daily budget for the entire period (`daily_budget * num_of_period_days`) is displayed in the UI as one of the monthly planned expenses.

## API Endpoints
### `POST /record-transaction`
Records a new transaction. If `period_id` is omitted in the request body, the endpoint will check `Settings.active_period` and automatically assign the transaction to the active period if one exists.

**Request Body:**
```json
{
  "amount": 100,
  "type": "income",
  "source": "cash",
  "category": "Salary",
  "period_id": "optional-uuid"
}
```

## How to Run

1. **Start the Database (or entire stack):**
   ```bash
   docker compose up -d postgres
   # or start both backend & postgres together:
   # docker compose up -d
   ```

2. **Initialize Database Schema (Prisma):**
   *(Note: Ensure the database is running before this step.)*
   ```bash
   cd backend
   npx prisma db push
   # or
   npx prisma migrate dev
   ```

3. **Start the Backend Service:**
   ```bash
   docker compose up -d backend
   ```
   Alternatively, run locally for development:
   ```bash
   cd backend
   npm run build
   npm start
   ```

## Agent Workflows
When making changes to the database:
1. Update `backend/prisma/schema.prisma`.
2. Run `npx prisma format` to ensure correct formatting.
3. Run `npx prisma generate` to update the Prisma Client.
4. Run `npx prisma db push` (or `migrate dev`) to sync the database schema.
