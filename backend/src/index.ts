import path from 'path';
import dotenv from 'dotenv';
import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const prisma = new PrismaClient();
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (_req: Request, res: Response) => {
  res.json({ status: 'ok', message: 'ez-money-tracker API is running' });
});

// API: POST /record-transaction body: amount, type, source, category
app.post('/record-transaction', async (req: Request, res: Response) => {
  try {
    const { amount, type, source, category } = req.body;

    if (amount === undefined || !type || !source) {
       res.status(400).json({ error: 'Missing required fields: amount, type, or source' });
       return;
    }

    const transaction = await prisma.transaction.create({
      data: {
        amount: Number(amount),
        type,
        source,
        category,
      },
    });

    res.status(201).json(transaction);
  } catch (error) {
    console.error('Error creating transaction:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
