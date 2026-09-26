# ez-money-tracker - Agent Documentation

## Technical Stack
- **Database:** PostgreSQL (v15)
- **ORM:** Prisma
- **Framework:** Express.js (Node.js/TypeScript)

## Project Structure
- `.env`: Single source of truth (SSOT) configuration for both backend and postgres services.
- `.env.example`: Template for environment variables.
- `backend/`: Contains the Express.js application and Prisma schema.
  - `backend/docker-compose.yaml`: Compose file for the backend service (builds from root context).
  - `backend/Dockerfile`: Docker image definition; copies root `.env` into `/app/.env` during build.
  - `backend/prisma/schema.prisma`: Database schema definitions.
  - `backend/src/index.ts`: Main Express application entrypoint.
- `postgres/`: Contains the database setup.
  - `postgres/docker-compose.yaml`: Compose file for the PostgreSQL service (reads `../.env`).
  - `postgres/.docker/db`: Local volume mount for persistent PostgreSQL data.

## Database Schema
**Table:** `transactions` (mapped to `Transaction` model in Prisma)
- `id`: UUID (Primary Key)
- `amount`: Integer (default: 0)
- `type`: Enum (`income`, `expense`)
- `source`: Enum (`cash`, `balance`, `credit`)
- `category`: String (optional)
- `date`: DateTime (default: current timestamp)
- `is_deleted`: Boolean (default: false)

## API Endpoints
### `POST /record-transaction`
Records a new transaction.

**Request Body:**
```json
{
  "amount": 100,
  "type": "income",
  "source": "cash",
  "category": "Salary"
}
```

## How to Run

1. **Start the Database:**
   ```bash
   cd postgres
   docker-compose up -d
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
   cd backend
   docker-compose up -d
   ```
   Alternatively, run locally for development:
   ```bash
   npm run build
   npm start
   ```

## Agent Workflows
When making changes to the database:
1. Update `backend/prisma/schema.prisma`.
2. Run `npx prisma format` to ensure correct formatting.
3. Run `npx prisma generate` to update the Prisma Client.
4. Run `npx prisma db push` (or `migrate dev`) to sync the database schema.
