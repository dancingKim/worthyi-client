import { useApiGeneric } from './useApiGeneric';
import { ApiResponse, ActionResponse, DeleteResponse, ActionContent } from '@/types/types';
import Constants from 'expo-constants';

const BASE_URL = Constants.expoConfig?.extra?.BASE_URL;

export function useChildActionApi() {
    const { execute: executeAddChildAction } = useApiGeneric<{ content: ActionContent }, ApiResponse<ActionResponse>>({
        condition: true,
        method: 'POST',
        url: `${BASE_URL}/action/child`
    });

    const { execute: executeDeleteChildAction } = useApiGeneric<null, DeleteResponse>({
        condition: true,
        method: 'DELETE',
        url: `${BASE_URL}/action/child`
    });

    return { executeAddChildAction, executeDeleteChildAction };
} 