import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/db/dbConfig';
import ExpenseModel from '@/db/models/expensesModel';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();
  const { id } = req.query;

  if (req.method === 'DELETE') {
    try {
      const deleted = await ExpenseModel.findByIdAndDelete(id);
      if (!deleted) {
        return res.status(404).json({ error: 'Expense not found' });
      }
      return res.status(200).json({ success: true });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  res.setHeader('Allow', ['DELETE']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}

// This file is empty or not implemented yet.