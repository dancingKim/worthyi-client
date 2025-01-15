// src/context/AuthProvider.tsx
import React, { createContext, ReactNode, useContext, useState, useEffect } from 'react';
import { User, AuthContextType } from '@/types/types';
import { removeToken, saveToken, getToken } from '@/utils/authStorage';
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

  // useUserMe 훅 가져오기
  const { execute: fetchUserMe } = useUserMe();

  // 앱 시작 시 or 컴포넌트 마운트 시에 토큰/사용자 정보를 복원
  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = await getToken();
        if (token) {
          // 토큰이 있으면 isLoggedIn = true
          setIsLoggedIn(true);
          // 여기서 /user/me 호출
          const res = await fetchUserMe(); 
          // res => ApiResponse<UserMeResponse> | null
          if (res?.data) {
            // 실제 UserMeResponse 객체
            setUser(res.data);
          }
        }
      } catch (err) {
        console.error('Failed to restore token or fetch user info:', err);
      } finally {
        setIsLoading(false);
      }
    };
    initAuth();
  }, []);

  // 로그인 시: 토큰 저장 + isLoggedIn = true
  const login = async (token: string): Promise<void> => {
    await saveToken(token);
    setIsLoggedIn(true);

    // 토큰 기반으로 /user/me 다시 호출
    try {
      const res = await fetchUserMe();
      if (res?.data) {
        setUser(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch user info after login:', err);
    }
  };

  // 로그아웃 시
  const logout = () => {
    removeToken();
    setIsLoggedIn(false);
    setUser(null);
  };

  // AuthContext.Provider 리턴
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