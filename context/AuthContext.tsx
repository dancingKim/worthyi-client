// src/context/AuthContext.tsx
import React, { createContext, ReactNode, useContext, useState, useEffect } from 'react';
import { User, AuthContextType } from '@/types/types';
import { removeToken, saveToken, getToken, saveTokenByType } from '@/utils/authStorage';
import { useUserMe } from '@/hooks/api/useUserMe';

interface UserMeResponse {
  id: number;
  email: string;
  name: string;
}

interface AuthProviderProps {
  children: ReactNode;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // user/me 훅
  const { execute: fetchUserMe } = useUserMe();

  // 앱 시작 시 토큰과 사용자 정보를 복원
  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = await getToken();
        if (token) {
          setIsLoggedIn(true);
          // /user/me 호출
          const res = await fetchUserMe();
          // res => ApiResponse<UserMeResponse> | null
          if (res?.data) {
            setUser(res.data); // 전역 user정보 세팅
          }
        }
      } catch (err) {
        console.error('Failed to restore user info:', err);
      } finally {
        setIsLoading(false);
      }
    };
    initAuth();
  }, []);

  // 로그인 함수
  const login = async (accessToken: string, refreshToken: string) => {
    await saveToken(accessToken);
    await saveTokenByType("refresh_token", refreshToken);
    setIsLoggedIn(true);
    // 로그인 후 user/me 호출
    try {
      const res = await fetchUserMe();
      if (res?.data) {
        setUser(res.data);
      }
    } catch (err) {
      console.error('Error fetching user after login:', err);
    }
  };

  // 로그아웃
  const logout = async () => {
    await removeToken();
    setIsLoggedIn(false);
    setUser(null);
  };

  const value: AuthContextType = {
    isLoggedIn,
    user,
    login,
    logout,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
};