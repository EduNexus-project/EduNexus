import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole } from '../types';
import { authService } from '../services/authService';
import { DEMO_USERS } from '../data/mockData';

interface AuthContextType {
  currentUser: User | null;
  role: UserRole;
  isAuthenticated: boolean;
  login: (role: UserRole) => void;
  logout: () => void;
  switchRole: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    return authService.getCurrentUser();
  });

  const role: UserRole = currentUser ? currentUser.role : 'principal';

  const login = async (newRole: UserRole) => {
    const res = await authService.login(newRole);
    if (res.success) {
      setCurrentUser(res.user);
    }
  };

  const logout = () => {
    authService.logout();
    setCurrentUser(null);
  };

  const switchRole = (newRole: UserRole) => {
    const user = authService.switchRole(newRole);
    setCurrentUser(user);
  };

  useEffect(() => {
    if (!currentUser) {
      setCurrentUser(DEMO_USERS.principal);
    }
  }, [currentUser]);

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        role,
        isAuthenticated: !!currentUser,
        login,
        logout,
        switchRole
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
