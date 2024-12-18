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
    adultActions: AdultActionResponse[]; // Object[] 대신 AdultActionResponse[]
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

export interface DailyLog {
    date: string;
    actions: ActionResponse[];
}

export interface ActionLogResponse {
    dailyLogs: DailyLog[];
    weeklyCount: number;
    monthlyCount: number;
    yearlyCount: number;
}

export interface AddAdultActionRequest {
    adultActionContent: string;
    childActionId: number; // 백엔드에서 Long 타입으로 기대
}

interface Avatar {
    avatarId: number;
    name: string;
    appearance: string;
}

export interface UserMeResponse {
    email: string;
    photoURL?: string;
    name: string;
    avatars: Avatar[];
}
