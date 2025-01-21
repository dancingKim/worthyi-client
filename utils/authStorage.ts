import * as SecureStore from "expo-secure-store";

const ACCESS_TOKEN_KEY = "access_token";
const REFRESH_TOKEN_KEY = "refresh_token";

export const saveToken = async (token: string): Promise<void> => {
    await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, token);
};

export const getToken = async (): Promise<string | null> => {
    return await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
};

export const removeToken = async (): Promise<void> => {
    await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
};

export const saveTokenByType = async (name: string, token: string): Promise<void> => {
    await SecureStore.setItemAsync(name, token);
};

export const getTokenByType = async (name: string): Promise<string | null> => {
    return await SecureStore.getItemAsync(name);
};

export const removeTokenByType = async (name: string): Promise<void> => {
    await SecureStore.deleteItemAsync(name);
};

