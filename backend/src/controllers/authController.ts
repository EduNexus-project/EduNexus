import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { supabase, isSupabaseConfigured } from '../config/supabase';
import { generateToken } from '../middleware/authMiddleware';
import { AuthRequest } from '../types';
import { dbStore } from '../services/dbStore';
import { createAuditLog } from '../utils/auditLogger';
import { getParentStudentIds } from '../services/parentRelationships';

// Helper to format user for frontend
function formatUserResponse(user: any, profile?: any, linkedStudentIds?: string[]) {
  const roleLower = (user.role || '').toLowerCase();
  const studentIds = linkedStudentIds || profile?.studentIds || (profile?.studentId ? [profile.studentId] : []);
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: roleLower,
    avatar: user.avatar || undefined,
    department: profile?.department || (roleLower === 'principal' ? 'Administrative Directorate' : 'Computer Science & Engineering'),
    designation: profile?.qualification || profile?.occupation || (roleLower === 'principal' ? 'Principal & Dean of Academics' : roleLower === 'teacher' ? 'Associate Professor & Class Incharge' : 'Parent / Guardian'),
    phone: profile?.phone || user.phone || undefined,
    relationship: profile?.relationship || user.relationship || undefined,
    studentIds,
    studentId: studentIds[0] || profile?.student_id || undefined,
    studentName: profile?.studentName || profile?.student_name || undefined,
  };
}

// POST /api/auth/login
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password, role } = req.body;
    const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
    const normalizedRole = typeof role === 'string' ? role.trim().toUpperCase() : '';

    if (!normalizedEmail || typeof password !== 'string' || !password || !normalizedRole) {
      return res.status(400).json({ success: false, message: 'Email, password, and role are required' });
    }

    if (!['PRINCIPAL', 'TEACHER', 'PARENT'].includes(normalizedRole)) {
      return res.status(400).json({ success: false, message: 'Role must be PRINCIPAL, TEACHER, or PARENT' });
    }

    let user: any = null;
    let profile: any = null;

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', normalizedEmail)
        .maybeSingle();
      if (error) {
        return res.status(500).json({ success: false, message: 'Unable to verify credentials' });
      }
      user = data;
      if (user) {
        if (user.role === 'TEACHER') {
          const { data: p } = await supabase.from('teachers').select('*').eq('user_id', user.id).single();
          profile = p;
        } else if (user.role === 'PARENT') {
          const { data: p } = await supabase.from('parents').select('*').eq('user_id', user.id).single();
          profile = p;
        }
      }
    } else {
      user = dbStore.users.find(u => u.email.toLowerCase() === normalizedEmail);

      if (user) {
        if (user.role === 'TEACHER') {
          profile = dbStore.teachers.find(t => t.user_id === user.id || t.id === user.id);
        } else if (user.role === 'PARENT') {
          profile = dbStore.parents.find(p => p.user_id === user.id || p.id === user.id);
        }
      }
    }

    if (
      !user ||
      user.role.toUpperCase() !== normalizedRole ||
      user.is_active === false ||
      !user.password_hash ||
      !(await bcrypt.compare(password, user.password_hash))
    ) {
      return res.status(401).json({ success: false, message: 'Invalid email, password, or role' });
    }

    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    });

    const linkedStudentIds = user.role.toUpperCase() === 'PARENT'
      ? await getParentStudentIds(user.id, user.email)
      : undefined;

    await createAuditLog({
      user_id: user.id,
      action: 'USER_LOGIN',
      entity_type: 'AUTH',
      entity_id: user.id,
      new_data: { email: user.email, role: user.role },
      ip_address: req.ip || '127.0.0.1'
    });

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: formatUserResponse(user, profile, linkedStudentIds),
        profile,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/auth/me
export const getMe = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id || (req.query.userId as string) || (req.headers['x-user-id'] as string);

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    let user: any = null;
    let profile: any = null;

    if (isSupabaseConfigured && supabase) {
      const { data } = await supabase.from('users').select('*').eq('id', userId).single();
      user = data;
    }

    if (!user) {
      user = dbStore.users.find(u => u.id === userId || u.role.toLowerCase() === userId.toLowerCase());
    }

    if (!user) {
      // Default to principal if demo user
      user = dbStore.users[0];
    }

    if (user.role === 'TEACHER') {
      profile = dbStore.teachers.find(t => t.user_id === user.id || t.id === user.id);
    } else if (user.role === 'PARENT') {
      profile = dbStore.parents.find(p => p.user_id === user.id || p.id === user.id);
    }

    const formattedUser = formatUserResponse(user, profile);

    res.json({
      success: true,
      data: {
        user: formattedUser,
        profile,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/auth/register
export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, role, name, phone, relationship } = req.body;
    const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
    const normalizedName = typeof name === 'string' ? name.trim() : '';
    const normalizedRole = typeof role === 'string' ? role.trim().toUpperCase() : '';

    if (!normalizedEmail || typeof password !== 'string' || !password || !normalizedRole || !normalizedName) {
      return res.status(400).json({ success: false, message: 'All fields (email, password, role, name) are required' });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      return res.status(400).json({ success: false, message: 'A valid email address is required' });
    }

    if (!['PRINCIPAL', 'TEACHER', 'PARENT'].includes(normalizedRole)) {
      return res.status(400).json({ success: false, message: 'Role must be PRINCIPAL, TEACHER, or PARENT' });
    }

    const normalizedPhone = typeof phone === 'string' ? phone.trim() : '';
    const normalizedRelationship = typeof relationship === 'string' ? relationship.trim().toLowerCase() : '';
    if (normalizedRole === 'PARENT' && (!normalizedPhone || !['father', 'mother', 'guardian'].includes(normalizedRelationship))) {
      return res.status(400).json({ success: false, message: 'Parent phone and relationship are required' });
    }

    if (isSupabaseConfigured && supabase) {
      const { data: existing, error } = await supabase
        .from('users')
        .select('id')
        .eq('email', normalizedEmail)
        .maybeSingle();
      if (error) {
        return res.status(500).json({ success: false, message: 'Unable to verify email availability' });
      }
      if (existing) {
        return res.status(409).json({ success: false, message: 'An account with this email already exists' });
      }
    } else if (dbStore.users.some(u => u.email.toLowerCase() === normalizedEmail)) {
      return res.status(409).json({ success: false, message: 'An account with this email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);
    let newUser: any;

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('users')
        .insert({
          email: normalizedEmail,
          password_hash,
          role: normalizedRole,
          name: normalizedName,
          is_active: true
        })
        .select('*')
        .single();
      if (error) {
        if (error.code === '23505') {
          return res.status(409).json({ success: false, message: 'An account with this email already exists' });
        }
        return res.status(500).json({ success: false, message: 'Unable to create the account' });
      }
      newUser = data;
    } else {
      if (dbStore.users.some(u => u.email.toLowerCase() === normalizedEmail)) {
        return res.status(409).json({ success: false, message: 'An account with this email already exists' });
      }
      newUser = {
        id: `usr_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        email: normalizedEmail,
        password_hash,
        role: normalizedRole as any,
        name: normalizedName,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      dbStore.users.push(newUser);
    }

    let parentProfile: any;
    if (normalizedRole === 'PARENT') {
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase
          .from('parents')
          .insert({
            user_id: newUser.id,
            name: normalizedName,
            phone: normalizedPhone,
            relationship: normalizedRelationship,
          })
          .select('*')
          .single();
        if (error) {
          await supabase.from('users').delete().eq('id', newUser.id);
          return res.status(500).json({ success: false, message: 'Unable to create parent profile' });
        }
        parentProfile = data;
        const { data: linkedStudents } = await supabase
          .from('students')
          .select('id,parent_relationship')
          .eq('parent_email', normalizedEmail);
        if (linkedStudents?.length) {
          const { error: relationError } = await supabase.from('student_parents').upsert(
            linkedStudents.map((student) => ({
              student_id: student.id,
              parent_id: parentProfile.id,
              relationship: student.parent_relationship || normalizedRelationship,
            })),
            { onConflict: 'student_id,parent_id' }
          );
          if (relationError) console.warn('[authController] Parent relationship sync failed:', relationError.message);
        }
      } else {
        const linkedStudents = dbStore.students.filter(
          (student) => (student.parentEmail || '').trim().toLowerCase() === normalizedEmail
        );
        parentProfile = {
          id: newUser.id,
          user_id: newUser.id,
          name: normalizedName,
          phone: normalizedPhone,
          relationship: normalizedRelationship,
          email: normalizedEmail,
          studentIds: linkedStudents.map((student) => student.id),
          studentId: linkedStudents[0]?.id,
          studentName: linkedStudents[0]?.name,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        dbStore.parents.push(parentProfile);
      }
    }

    const linkedStudentIds = normalizedRole === 'PARENT'
      ? await getParentStudentIds(newUser.id, newUser.email)
      : undefined;

    res.status(201).json({
      success: true,
      data: formatUserResponse(newUser, parentProfile, linkedStudentIds),
      message: 'User registered successfully',
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/auth/logout
export const logout = async (_req: Request, res: Response) => {
  res.json({ success: true, message: 'Logged out successfully' });
};
