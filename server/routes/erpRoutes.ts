import { Router, Request, Response } from 'express';
import {
  getApprovals,
  createApproval,
  updateApproval,
  getAttendance,
  getGrades,
  getExpenses,
  getSystemHealth,
} from '../services/supabaseClient.ts';

const router = Router();

// Approvals CRUD
router.get('/approvals', async (_req: Request, res: Response): Promise<void> => {
  try {
    const list = await getApprovals();
    res.json(list);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/approvals', async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, category, requested_by, department, amount, currency, description, justification } = req.body;

    if (!title || !department || !amount) {
      res.status(400).json({ error: 'Title, department, and amount are required.' });
      return;
    }

    const randomCode = `REQ-2026-${Math.floor(100 + Math.random() * 900)}`;

    const created = await createApproval({
      request_code: randomCode,
      title,
      category: category || 'Procurement',
      requested_by: requested_by || 'Staff Member',
      department,
      amount: Number(amount),
      currency: currency || 'USD',
      description: description || '',
      justification: justification || '',
      status: 'Pending',
    });

    res.status(201).json(created);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/approvals/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const updated = await updateApproval(id, updates);
    if (!updated) {
      res.status(404).json({ error: 'Approval request not found.' });
      return;
    }
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Operational records for attendance, grades, budgets
router.get('/attendance', async (_req: Request, res: Response): Promise<void> => {
  try {
    const data = await getAttendance();
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/grades', async (_req: Request, res: Response): Promise<void> => {
  try {
    const data = await getGrades();
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/expenses', async (_req: Request, res: Response): Promise<void> => {
  try {
    const data = await getExpenses();
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/system-status', async (_req: Request, res: Response): Promise<void> => {
  try {
    const health = await getSystemHealth();
    res.json(health);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
