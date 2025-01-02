export interface ApiResponse<T> {
    code: number;
    message: string;
    data: T | null;
}

export interface DeleteResponse extends ApiResponse<null> {}

export interface ActionContent {
    text?: string;
    imageUrl?: string | null;
}

export interface ActionResponse {
    id: number;
    content: ActionContent;
    responses?: ActionResponse[];
}

export interface AddAdultActionRequest {
    content: ActionContent;
    actionId: number;
}

export interface UserMeResponse {
    id: number;
    email: string;
    name: string;
    avatars?: Array<{
        appearance: string;
        id: number;
    }>;
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
