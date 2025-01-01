export interface ActionContent {
    text?: string;
    imageUrl?: string | null;
}

export interface ActionResponse {
    id: number;
    content: ActionContent;
    responses?: ActionResponse[];
}

export interface ApiResponse<T> {
    code: number;
    message: string;
    data: T | null;
}

export interface UserMeResponse {
    id: number;
    email: string;
    name: string;
}
