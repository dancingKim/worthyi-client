import * as SecureStore from "expo-secure-store";
import { UserMeResponse } from "@/types/types";

const USER_KEY = "user_info";

export const saveUser = async (user: UserMeResponse): Promise<void> => {
    await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
};

export const getUser = async (): Promise<UserMeResponse | null> => {
    const userStr = await SecureStore.getItemAsync(USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
};

export const removeUser = async (): Promise<void> => {
    await SecureStore.deleteItemAsync(USER_KEY);
}; 