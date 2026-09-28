import { User, UserRole } from '../types';
import { DEMO_USERS } from '../data/mockData';

const AUTH_STORAGE_KEY = 'edunexus_active_user';
const TOKEN_KEY = 'edunexus_auth_token';

export const authService = {
  getCurrentUser(): User {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // Fallback
    }
    return DEMO_USERS.principal;
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
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'x-user-id': user.id
    };
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

  switchRole(role: UserRole): User {
    const user = DEMO_USERS[role] || DEMO_USERS.principal;
    this.setCurrentUser(user);
    // Fire background API call to update server profile session
    fetch(`/api/auth/me?userId=${user.id}`, {
      headers: { 'x-user-id': user.id }
    }).catch(() => {});
    return user;
  },

  async login(role: UserRole, password?: string): Promise<{ success: boolean; user: User }> {
    const fallbackUser = DEMO_USERS[role] || DEMO_USERS.principal;
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: fallbackUser.email, role, password })
      });
      const data = await res.json();
      if (data.success && data.data?.user) {
        this.setCurrentUser(data.data.user);
        if (data.data?.token) {
          try {
            localStorage.setItem(TOKEN_KEY, data.data.token);
          } catch {}
        }
        return { success: true, user: data.data.user };
      }
    } catch (err) {
      console.warn('[authService] Backend offline, utilizing local fallback:', err);
    }

    this.setCurrentUser(fallbackUser);
    return { success: true, user: fallbackUser };
  },

  logout(): void {
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      localStorage.removeItem(TOKEN_KEY);
    } catch {
      // ignore
    }
  },

  getAvailableRoles(): { role: UserRole; name: string; title: string; email: string }[] {
    return [
      {
        role: 'principal',
        name: DEMO_USERS.principal.name,
        title: 'Principal / Institutional Dean',
        email: DEMO_USERS.principal.email
      },
      {
        role: 'teacher',
        name: DEMO_USERS.teacher.name,
        title: 'Faculty / Class Incharge (CSE-A)',
        email: DEMO_USERS.teacher.email
      },
      {
        role: 'parent',
        name: DEMO_USERS.parent.name,
        title: 'Guardian (Parent of Aarav Kumar)',
        email: DEMO_USERS.parent.email
      }
    ];
  }
};
