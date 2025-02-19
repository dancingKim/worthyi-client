import Constants from 'expo-constants';
import { useApiGeneric } from './useApiGeneric';
import { ApiResponse } from '@/types/types';
import { getToken } from '@/utils/authStorage';

interface UserMeResponse {
    id: number;
    email: string;
    name: string;
    // 필요한 다른 사용자 필드들 추가
}

export const useUserMe = () => {
    const BASE_URL = Constants.expoConfig?.extra?.BASE_URL;
    const { execute, data, isLoading, error } = useApiGeneric<null, ApiResponse<UserMeResponse>>({
        method: 'GET',
        url: `${BASE_URL}/user/me`,
        condition: true,
    });

    const wrappedExecute = async () => {
        try {
            const token = await getToken();
            console.log('Token being used:', token?.substring(0, 20) + '...');
            const response = await execute();
            console.log('UserMe API response:', response);
            return response;
        } catch (error) {
            console.error('UserMe API error:', error);
            throw error;
        }
    };

    return { execute: wrappedExecute, data, isLoading, error };
}; 