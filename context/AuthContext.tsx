import React, {createContext, useContext, useEffect, useState} from "react";
import {getToken, removeToken, saveToken} from "@/utils/authStorage";

interface AuthContextType {
    isLoggedIn: boolean;
    isLoading: boolean;
    login: (token : string) => void;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const login = async (token : string) => {
        await saveToken(token)
        setIsLoggedIn(true);
    }
    const logout = async () => {
        await removeToken();
        setIsLoggedIn(false);
    }

    useEffect(() => {
        const checkLoginStatus = async () => {
            const token = await getToken();
            console.log("token = ", token);

            setIsLoggedIn(!!token);
            setIsLoading(false);
        }
        checkLoginStatus();
        console.log("AuthContext isLogedIn = " + isLoggedIn);
    }, []);

    return (
        <AuthContext.Provider value={{ isLoggedIn, isLoading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
