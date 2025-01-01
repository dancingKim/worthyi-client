// types/types.ts
export interface ActionContent {
    text?: string;
    imageUrl?: string | null;
}

export interface ActionResponse {
    id: number;
    content: ActionContent;
    responses?: ActionResponse[];
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

export interface ApiResponse<T> {
    code: number;
    message: string;
    data: T | null;
}

export interface DeleteResponse {
    code: number;
    message: string;
    data: null;
}

export interface AddAdultActionRequest {
    content: ActionContent;
    childActionId: number;
}
