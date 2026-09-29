import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User, UserRole } from '../types';
import { authService } from '../services/authService';

interface AuthContextType {
  currentUser: User | null;
  role: UserRole;
  isAuthenticated: boolean;
  login: (email: string, password: string, role: UserRole) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  updateProfilePhoto: (file: File) => Promise<{ success: boolean; message?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    return authService.getCurrentUser();
  });

  const role: UserRole = currentUser ? currentUser.role : 'principal';

  const login = async (email: string, password: string, newRole: UserRole) => {
    const res = await authService.login(email, password, newRole);
    if (res.success && res.user) {
      setCurrentUser(res.user);
    }
    return { success: res.success, message: res.message };
  };

  const logout = () => {
    authService.logout();
    setCurrentUser(null);
  };

  const updateProfilePhoto = async (file: File) => {
    const result = await authService.updateProfilePhoto(file);
    if (result.success && result.user && currentUser) {
      const updatedUser = { ...currentUser, ...result.user };
      authService.setCurrentUser(updatedUser);
      setCurrentUser(updatedUser);
    }
    return { success: result.success, message: result.message };
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        role,
        isAuthenticated: !!currentUser,
        login,
        logout,
        updateProfilePhoto
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
