import { Request, Response } from 'express';
import {
  getTeachers,
  getTeacherById,
  getTeacherClasses,
} from './academicController';
import { dbStore } from '../services/dbStore';
import { supabase, isSupabaseConfigured } from '../config/supabase';
import { AuthRequest } from '../types';

export {
  getTeachers,
  getTeacherById,
  getTeacherClasses,
};

export const createTeacher = async (req: AuthRequest, res: Response) => {
  try {
    const { user_id, name, employee_id, department, phone, qualification } = req.body;
    const newTeacher = {
      id: `usr_teacher_${Date.now()}`,
      user_id: user_id || `usr_teacher_${Date.now()}`,
      name,
      employee_id,
      department: department || 'Engineering',
      phone: phone || '+91 98400 00000',
      qualification: qualification || 'M.Tech, Ph.D',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      assignedClasses: ['cls_cse_a'],
      subjectsTaught: ['CS8401 Operating Systems'],
    };

    dbStore.teachers.push(newTeacher);

    if (isSupabaseConfigured && supabase) {
      await supabase.from('teachers').insert([newTeacher]);
    }

    res.status(201).json({ success: true, data: newTeacher });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateTeacher = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const idx = dbStore.teachers.findIndex(t => t.id === id || t.user_id === id);
    if (idx === -1) return res.status(404).json({ success: false, message: 'Teacher not found' });
    dbStore.teachers[idx] = { ...dbStore.teachers[idx], ...req.body, updated_at: new Date().toISOString() };
    res.json({ success: true, data: dbStore.teachers[idx] });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteTeacher = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const idx = dbStore.teachers.findIndex(t => t.id === id || t.user_id === id);
    if (idx === -1) return res.status(404).json({ success: false, message: 'Teacher not found' });
    dbStore.teachers.splice(idx, 1);
    res.json({ success: true, message: 'Teacher deleted successfully' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};
