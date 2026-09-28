import { Response } from 'express';
import { supabase, isSupabaseConfigured } from '../config/supabase';
import { AuthRequest } from '../types';
import { dbStore } from '../services/dbStore';

// GET /api/users
export const getUsers = async (req: AuthRequest, res: Response) => {
  try {
    const { role } = req.query;
    let users = dbStore.users;

    if (role && typeof role === 'string') {
      users = users.filter(u => u.role.toUpperCase() === role.toUpperCase());
    }

    const safeUsers = users.map(u => ({
      id: u.id,
      email: u.email,
      role: u.role,
      name: u.name,
      is_active: u.is_active,
      created_at: u.created_at,
    }));

    res.json({ success: true, data: safeUsers });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/users/:id
export const getUserById = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const user = dbStore.users.find(u => u.id === id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    const safeUser = {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      is_active: user.is_active,
      created_at: user.created_at,
    };
    res.json({ success: true, data: safeUser });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/users/:id
export const updateUser = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const { name, is_active } = req.body;
    const idx = dbStore.users.findIndex(u => u.id === id);
    if (idx === -1) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (name !== undefined) dbStore.users[idx].name = name;
    if (is_active !== undefined) dbStore.users[idx].is_active = is_active;
    dbStore.users[idx].updated_at = new Date().toISOString();

    const safeUser = {
      id: dbStore.users[idx].id,
      email: dbStore.users[idx].email,
      role: dbStore.users[idx].role,
      name: dbStore.users[idx].name,
      is_active: dbStore.users[idx].is_active,
    };

    res.json({ success: true, data: safeUser });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/users/:id
export const deleteUser = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    if (req.user && req.user.id === id) {
      return res.status(400).json({ success: false, message: 'Cannot delete your own account' });
    }
    const idx = dbStore.users.findIndex(u => u.id === id);
    if (idx === -1) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    dbStore.users.splice(idx, 1);
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};
