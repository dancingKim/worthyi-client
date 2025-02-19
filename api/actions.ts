import Constants from 'expo-constants';
import { ApiResponse, ActionResponse } from '@/types/types';
import { getToken } from '@/utils/authStorage';

const BASE_URL = Constants.expoConfig?.extra?.BASE_URL;

export async function fetchAdultActions(childActionId: number): Promise<ApiResponse<ActionResponse[]>> {
    const token = await getToken();
    const response = await fetch(`${BASE_URL}/action/${childActionId}/adult`, {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });
    return response.json();
} 