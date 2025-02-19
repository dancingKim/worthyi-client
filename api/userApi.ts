import Constants from 'expo-constants';
import { getToken } from '@/utils/authStorage';
import { ApiResponse, UserMeResponse } from '@/types/types';

const BASE_URL = Constants.expoConfig?.extra?.BASE_URL;

export const fetchUserMe = async (): Promise<ApiResponse<UserMeResponse>> => {
    const token = await getToken();
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
    };
    
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${BASE_URL}/api/user/me`, {
        method: 'GET',
        headers,
    });

    const data = await response.json();
    
    if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch user data');
    }

    return data;
}; 