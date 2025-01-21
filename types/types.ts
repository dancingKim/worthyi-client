// src/types.ts

/** 공용 API 응답 형태 */
export interface ApiResponse<T> {
    code: number;
    message: string;
    data: T | null;
  }

  export interface User {
    id: number;
    name: string;
    email: string
    avatars?: Array<{
      appearance: string;
      id: number;
    }>;
  }


  export interface AuthContextType {
    isLoggedIn: boolean;
    user: User | null; // Add user property
    login: (accessToken: string, refreshToken: string) => Promise<void>;
    logout: () => void;
    isLoading: boolean;
  }
  
  /** 삭제 시 응답 (data가 null) */
  export interface DeleteResponse extends ApiResponse<null> {}
  
  /** 행동(액션) 내용 */
  export interface ActionContent {
    text?: string;
    imageUrl?: string | null;
  }
  
  /** 행동(액션) 응답 구조 */
  export interface ActionResponse {
    id: number;
    content: ActionContent;
    responses?: ActionResponse[];
  }
  
  /** 어른 칭찬(AdultAction)을 추가할 때 필요한 요청 형식 */
  export interface AddAdultActionRequest {
    content: ActionContent;
    actionId: number;
  }
  
  /** User 정보 (예시) */
  export interface UserMeResponse {
    id: number;
    email: string;
    name: string;
    avatars?: Array<{
      appearance: string;
      id: number;
    }>;
  }
  
  /** 날짜별 Actions (예시) */
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
  
  /** API 훅 설정 */
  export interface ApiHookConfig<T> {
    url: string;
    method: 'GET' | 'POST' | 'PUT' | 'DELETE';
    condition: boolean;
    payload?: T;
  }
  
  /** API 훅 결과 */
  export interface ApiHookResult<U> {
    data: U | null;
    isLoading: boolean;
    error: any;
    execute: (payload?: any, url?: string) => Promise<U | null>;
    response: Response | null;
  }