# ez-money-tracker

## Startup Instructions

### 1. Database
Make sure you have your database running:
```bash
docker compose up -d postgres
```

### 2. Backend
Apply the database schema changes and start the backend:
```bash
cd backend
npm install
npx prisma db push
npx prisma generate
npm run dev # or npm start
```

### 3. Frontend
Start the newly built Vue frontend:
```bash
cd frontend
npm install
npm run dev
```

Visit `http://localhost:5173` to view the app!
