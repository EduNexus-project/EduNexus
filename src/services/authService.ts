import { ParentRelationship, User, UserRole } from '../types';

const AUTH_STORAGE_KEY = 'edunexus_active_user';
const TOKEN_KEY = 'edunexus_auth_token';

const isUser = (value: unknown): value is User => {
  if (!value || typeof value !== 'object') return false;
  const user = value as Partial<User>;
  return (
    typeof user.id === 'string' &&
    typeof user.name === 'string' &&
    typeof user.email === 'string' &&
    (user.role === 'principal' || user.role === 'teacher' || user.role === 'parent')
  );
};

export const authService = {
  getCurrentUser(): User | null {
    try {
      if (!this.getToken()) return null;
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        const user: unknown = JSON.parse(stored);
        return isUser(user) ? user : null;
      }
    } catch {
      return null;
    }
    return null;
  },

  getToken(): string | null {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },

  getAuthHeaders(): Record<string, string> {
    const user = this.getCurrentUser();
    const token = this.getToken();
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (user) headers['x-user-id'] = user.id;
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  },

  setCurrentUser(user: User): void {
    try {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    } catch (e) {
      console.warn('Storage unavailable', e);
    }
  },

  async login(
    email: string,
    password: string,
    role: UserRole
  ): Promise<{ success: boolean; user?: User; message?: string }> {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), role, password })
      });
      const data = await res.json();
      if (res.ok && data.success && isUser(data.data?.user) && typeof data.data?.token === 'string') {
        this.setCurrentUser(data.data.user);
        try {
          localStorage.setItem(TOKEN_KEY, data.data.token);
        } catch {
          // The active session remains available until the page is reloaded.
        }
        return { success: true, user: data.data.user };
      }
      return { success: false, message: data.message || 'Unable to sign in with those credentials.' };
    } catch (err) {
      console.warn('[authService] Backend login failed:', err);
      return { success: false, message: 'Unable to reach the authentication service. Please try again.' };
    }
  },

  async register(input: {
    name: string;
    email: string;
    password: string;
    role: UserRole;
    phone?: string;
    relationship?: ParentRelationship;
  }): Promise<{ success: boolean; message: string }> {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: input.name.trim(),
          email: input.email.trim(),
          password: input.password,
          role: input.role,
          phone: input.phone?.trim(),
          relationship: input.relationship
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        return { success: true, message: data.message || 'Account created successfully.' };
      }
      return { success: false, message: data.message || 'Unable to create the account.' };
    } catch (err) {
      console.warn('[authService] Backend registration failed:', err);
      return { success: false, message: 'Unable to reach the registration service. Please try again.' };
    }
  },

  async updateProfilePhoto(file: File): Promise<{ success: boolean; user?: User; message?: string }> {
    const token = this.getToken();
    if (!token) return { success: false, message: 'Your session has expired. Please sign in again.' };

    try {
      const res = await fetch('/api/users/me/profile-photo', {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': file.type
        },
        body: file
      });
      const data = await res.json();
      if (res.ok && data.success && isUser(data.data?.user)) {
        return { success: true, user: data.data.user };
      }
      return { success: false, message: data.message || 'Unable to update your profile photo.' };
    } catch (err) {
      console.warn('[authService] Profile photo update failed:', err);
      return { success: false, message: 'Unable to reach the profile service. Please try again.' };
    }
  },

  logout(): void {
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      localStorage.removeItem(TOKEN_KEY);
    } catch {
      // ignore
    }
  },

};
