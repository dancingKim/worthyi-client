import React, { createContext, useContext, useState, useEffect } from 'react';
import { getToken, removeToken, saveToken } from '@/utils/authStorage';
import { UserMeResponse } from '@/types/types';
import { useUserMe } from '@/hooks/api/useUserMe';

interface AuthContextType {
    isLoggedIn: boolean;
    isLoading: boolean;
    user: UserMeResponse | null;
    login: (token: string) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [user, setUser] = useState<UserMeResponse | null>(null);
    const { execute: fetchUserMe } = useUserMe();

    useEffect(() => {
        const initializeAuth = async () => {
            try {
                setIsLoading(true);
                const token = await getToken();
                console.log('Stored token:', token);

                if (token) {
                    const userResponse = await fetchUserMe();
                    console.log('User response:', userResponse);
                    
                    if (userResponse?.data) {
                        setUser(userResponse.data);
                        setIsLoggedIn(true);
                    } else {
                        await logout();
                    }
                }
            } catch (error) {
                console.error('Auth initialization failed:', error);
                await logout();
            } finally {
                setIsLoading(false);
            }
        };

        initializeAuth();
    }, []);

    const login = async (token: string) => {
        try {
            await saveToken(token);
            const userResponse = await fetchUserMe();
            if (userResponse?.data) {
                setUser(userResponse.data);
                setIsLoggedIn(true);
            } else {
                throw new Error('Failed to get user data');
            }
        } catch (error) {
            console.error('Login failed:', error);
            await logout();
            throw error;
        }
    };

    const logout = async () => {
        try {
            await removeToken();
            setUser(null);
            setIsLoggedIn(false);
        } catch (error) {
            console.error('Logout failed:', error);
            throw error;
        }
    };

    return (
        <AuthContext.Provider value={{ isLoggedIn, isLoading, user, login, logout }}>
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
