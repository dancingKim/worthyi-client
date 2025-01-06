import React, { createContext, ReactNode, useContext, useState } from 'react';
import { User, AuthContextType } from '@/types/types';
import { removeToken, saveToken } from '@/utils/authStorage';

interface AuthProviderProps {
  children: ReactNode;
}
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const login = async (token: string): Promise<void>=> {
    saveToken(token);
    setIsLoggedIn(true);
    setUser(user);
  };

  const logout = () => {
    removeToken();
    setIsLoggedIn(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, user, login, logout, isLoading }}>
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
