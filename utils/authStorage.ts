import * as SecureStore from "expo-secure-store";

const JWT_KEY = "jwt_token";

export const saveToken = async (token: string): Promise<void> => {
    await SecureStore.setItemAsync(JWT_KEY, token);
};

export const getToken = async (): Promise<string | null> => {
    return await SecureStore.getItemAsync(JWT_KEY);
};

export const removeToken = async (): Promise<void> => {
    await SecureStore.deleteItemAsync(JWT_KEY);
};
