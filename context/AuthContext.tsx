// src/context/AuthContext.tsx

import React, { createContext, ReactNode, useContext, useState, useEffect } from 'react';
import { User, AuthContextType } from '@/types/types';
import { removeToken, saveToken, getToken } from '@/utils/authStorage';
// ↑ getToken 불러와서, 앱 시작 시 토큰이 있는지 확인

interface AuthProviderProps {
  children: ReactNode;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  // 앱이 처음 켜졌을 때 토큰 검사하는 동안 스플래시 or 로딩 표시할 수 있도록
  const [isLoading, setIsLoading] = useState(true);

  // ++++++++++++ 추가: 앱이 처음 실행될 때 SecureStore에 토큰이 있는지 확인 ++++++++++++
  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = await getToken();  // SecureStore에서 토큰 가져오기
        if (token) {
          // 토큰이 존재하면 isLoggedIn=true
          setIsLoggedIn(true);
          // 여기서 서버에 /user/me 같은 API 호출하여 user 정보도 세팅 가능
          // 예) const userData = await fetchUserInfo(token);
          // setUser(userData);
        }
      } catch (err) {
        console.error('Failed to restore token from SecureStore:', err);
      } finally {
        // 로딩 끝
        setIsLoading(false);
      }
    };
    initAuth();
  }, []);

  // 사용자가 로그인할 때 호출. 토큰 저장 + 로그인 상태 true
  const login = async (token: string): Promise<void> => {
    await saveToken(token);
    setIsLoggedIn(true);
    // 필요 시 여기서 /user/me API로 사용자 정보 불러오면 setUser(...)
  };

  const logout = () => {
    removeToken();
    setIsLoggedIn(false);
    setUser(null);
  };

  // ++++++++++++ isLoading 동안에는 children을 렌더링 안 할 수도 있음 ++++++++++++
  // 예: 아래처럼 하면, AuthProvider 바깥쪽에서 isLoading 상태를 써도 되고,
  //     여기서 return null로 로딩 표시를 해도 되고, 자유롭게 구성 가능
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