// types/types.ts
export interface ActionContent {
    text?: string;
    image?: string | null;
}

export interface ChildActionItem {
    childActionId: number;
    content: ActionContent;
    adultActions: AdultActionResponse[];
}

export interface ApiResponse<T> {
    code: number;
    message: string;
    data: T | null;
}

export interface AdultActionResponse {
    adultActionId: number;
    childActionId: number;
    content: ActionContent;
}

export interface DailyLog {
    date: string;
    actions: ChildActionItem[];
}

export interface ActionLogResponse {
    dailyLogs: DailyLog[];
    weeklyCount: number;
    monthlyCount: number;
    yearlyCount: number;
}

export interface AddAdultActionRequest {
    content: ActionContent;
    childActionId: number;
}

export interface AddChildActionRequest {
    content: ActionContent;
}

interface Avatar {
    avatarId: number;
    name: string;
    appearance: string;
}

export interface UserMeResponse {
    email: string;
    name: string;
    avatars: Avatar[];
}
