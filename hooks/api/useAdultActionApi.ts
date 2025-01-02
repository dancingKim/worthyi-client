import { useApiGeneric } from './useApiGeneric';
import { ApiResponse, DeleteResponse, ActionResponse, AddAdultActionRequest } from '@/types/types';
import Constants from 'expo-constants';

const BASE_URL = Constants.expoConfig?.extra?.BASE_URL;

export function useAdultActionApi() {
    const { execute: executeAddAdultAction } = useApiGeneric<AddAdultActionRequest, ApiResponse<ActionResponse>>({
        condition: true,
        method: 'POST',
        url: `${BASE_URL}/action/{childActionId}/adult`  // 올바른 URL 패턴
    });
    
    // 수정해야 할 코드
const { execute: executeDeleteAdultAction } = useApiGeneric<null, DeleteResponse>({
    condition: true,
    method: 'DELETE',
    url: `${BASE_URL}/action/{childActionId}/adult/{adultActionId}`  // 올바른 URL 패턴
});

    return { executeAddAdultAction, executeDeleteAdultAction };
} 