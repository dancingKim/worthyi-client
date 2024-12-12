// types/types.ts
export interface ChildActionItem {
    id: string;
    childActionContent: string;
    adultActions: string[];
}

export interface ApiResponse<T> {
    code: number;
    message: string;
    data: T;
}

export interface ActionResponse {
    childActionId: number;
    childActionContent: string;
    adultActions: Object[];
}

export interface AdultActionResponse {
    adultActionId: number;
    adultActionContent: string;
    childActionId: number;
}

export interface AdultActionItem {
    id: string;
    adultActionContent: string;
    childActionId: string;
}

export interface AddAdultActionRequest {
    adultActionContent: string;
    childActionId: number; // 백엔드에서 Long 타입으로 기대
}
