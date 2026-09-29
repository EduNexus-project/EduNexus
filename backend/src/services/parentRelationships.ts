import { supabase, isSupabaseConfigured } from '../config/supabase';
import { AuthRequest } from '../types';
import { dbStore } from './dbStore';

export const getParentStudentIds = async (userId: string, email: string): Promise<string[]> => {
  const normalizedEmail = email.trim().toLowerCase();

  if (isSupabaseConfigured && supabase) {
    const ids = new Set<string>();
    const { data: contactStudents } = await supabase
      .from('students')
      .select('id')
      .eq('parent_email', normalizedEmail);
    contactStudents?.forEach((student) => ids.add(student.id));

    const { data: parentProfile } = await supabase
      .from('parents')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();
    if (parentProfile) {
      const { data: relations } = await supabase
        .from('student_parents')
        .select('student_id')
        .eq('parent_id', parentProfile.id);
      relations?.forEach((relation) => ids.add(relation.student_id));
    }

    return [...ids];
  }

  const ids = dbStore.students
    .filter((student) => (student.parentEmail || student.parent_email || '').trim().toLowerCase() === normalizedEmail)
    .map((student) => student.id as string);
  const existingStudentIds = new Set(dbStore.students.map((student) => student.id as string));
  const profile = dbStore.parents.find((parent) => parent.user_id === userId);
  profile?.studentIds?.forEach((studentId) => {
    if (existingStudentIds.has(studentId)) ids.push(studentId);
  });
  if (profile?.studentId && existingStudentIds.has(profile.studentId)) ids.push(profile.studentId);
  return [...new Set(ids)];
};

export const syncStudentParentLink = async (
  studentId: string,
  parentEmail: string,
  relationship: string
): Promise<void> => {
  if (!isSupabaseConfigured || !supabase) {
    dbStore.parents.forEach((parent) => {
      const linkedIds = new Set(parent.studentIds || (parent.studentId ? [parent.studentId] : []));
      if (parentEmail && parent.email?.trim().toLowerCase() === parentEmail.trim().toLowerCase()) {
        linkedIds.add(studentId);
      } else {
        linkedIds.delete(studentId);
      }
      parent.studentIds = [...linkedIds];
      parent.studentId = parent.studentIds[0];
    });
    return;
  }

  const { error: removeError } = await supabase
    .from('student_parents')
    .delete()
    .eq('student_id', studentId);
  if (removeError) throw removeError;
  if (!parentEmail) return;

  const { data: parentUser } = await supabase
    .from('users')
    .select('id')
    .eq('email', parentEmail.trim().toLowerCase())
    .eq('role', 'PARENT')
    .maybeSingle();
  if (!parentUser) return;

  const { data: parentProfile } = await supabase
    .from('parents')
    .select('id')
    .eq('user_id', parentUser.id)
    .maybeSingle();
  if (!parentProfile) return;

  const { error: insertError } = await supabase.from('student_parents').insert({
    student_id: studentId,
    parent_id: parentProfile.id,
    relationship,
  });
  if (insertError) throw insertError;
};

export const parentCanAccessStudent = async (req: AuthRequest, studentId: string): Promise<boolean> => {
  if (req.user?.role !== 'PARENT') return Boolean(req.user);
  const ids = await getParentStudentIds(req.user.id, req.user.email);
  return ids.includes(studentId);
};