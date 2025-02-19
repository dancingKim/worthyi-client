export interface ApiHookConfig<T> {
    url: string;
    method: 'GET' | 'POST' | 'PUT' | 'DELETE';
    condition: boolean;
    payload?: T;
}

export interface ApiHookResult<U> {
    data: U | null;
    isLoading: boolean;
    error: any;
    execute: (payload?: any, url?: string) => Promise<U | null>;
    response: Response | null;
} 