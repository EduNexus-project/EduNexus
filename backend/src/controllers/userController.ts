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

// PUT /api/users/me/profile-photo
export const updateProfilePhoto = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    const contentType = (req.headers['content-type'] || '').split(';')[0].toLowerCase();
    if (!['image/jpeg', 'image/png'].includes(contentType)) {
      return res.status(415).json({ success: false, message: 'Upload a JPG, JPEG, or PNG image' });
    }
    if (!Buffer.isBuffer(req.body) || req.body.length === 0) {
      return res.status(400).json({ success: false, message: 'An image file is required' });
    }
    if (req.body.length > 2 * 1024 * 1024) {
      return res.status(413).json({ success: false, message: 'Profile photos must be 2 MB or smaller' });
    }

    const isJpeg = contentType === 'image/jpeg' &&
      req.body.length >= 3 &&
      req.body[0] === 0xff && req.body[1] === 0xd8 && req.body[2] === 0xff;
    const pngSignature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    const isPng = contentType === 'image/png' &&
      req.body.length >= pngSignature.length &&
      req.body.subarray(0, pngSignature.length).equals(pngSignature);

    if (!isJpeg && !isPng) {
      return res.status(400).json({ success: false, message: 'The uploaded file is not a valid JPG or PNG image' });
    }

    const avatar = `data:${contentType};base64,${req.body.toString('base64')}`;
    let user: any;

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('users')
        .update({ avatar, updated_at: new Date().toISOString() })
        .eq('id', req.user.id)
        .select('id,email,role,name,avatar')
        .single();
      if (error) {
        return res.status(500).json({ success: false, message: 'Unable to save profile photo' });
      }
      user = data;
    } else {
      user = dbStore.users.find((storedUser) => storedUser.id === req.user?.id);
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
      user.avatar = avatar;
      user.updated_at = new Date().toISOString();
    }

    res.json({
      success: true,
      message: 'Profile photo updated',
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role.toLowerCase(),
          avatar: user.avatar,
        },
      },
    });
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
