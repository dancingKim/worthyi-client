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

  // 사용자가 로그인할 때 호출. 토큰 저장 + 로그인 상태 true
  const login = async (token: string): Promise<void> => {
    // SecureStore 에 저장
    await saveToken(token);
    setIsLoggedIn(true);
    // TODO: 사용자 정보를 토큰을 통해 불러오고 싶다면, 
    // 여기서 서버에 /user/me 요청해서 setUser(...) 가능
    // 예: const userData = await fetchUserInfoFromServer(token);
    // setUser(userData);
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