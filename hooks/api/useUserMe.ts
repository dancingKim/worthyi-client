import Constants from 'expo-constants';
import { useApiGeneric } from './useApiGeneric';
import { ApiResponse, UserMeResponse } from '@/types/types';

export const useUserMe = () => {
    const BASE_URL = Constants.expoConfig?.extra?.BASE_URL;
    const { execute, data, isLoading, error } = useApiGeneric<null, ApiResponse<UserMeResponse>>({
        method: 'GET',
        url: `${BASE_URL}/user/me`,
        condition: true,
    });

    const wrappedExecute = async () => {
        try {
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