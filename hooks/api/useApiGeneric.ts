// src/hooks/useApiGeneric.ts

import { useState, useCallback } from 'react';
// React의 상태 관리, 사이드 이펙트 처리, 함수 메모이제이션을 위한 훅들

import { getToken, saveToken } from '@/utils/authStorage';
// 인증 토큰을 안전하게 저장하고 불러오기 위한 유틸리티 함수들

import { ApiHookConfig, ApiHookResult } from '@/types/api.types';
// API 훅의 타입을 정의하는 인터페이스

import { router } from 'expo-router';
import { ApiResponse } from '@/types/types';

// (선택) AuthContext를 써서 글로벌 로그인 상태를 갱신하고 싶다면 import
import { useAuth } from '@/context/AuthContext';

export function useApiGeneric<T = any, U = any>(
    config: ApiHookConfig<T>
): ApiHookResult<U> {
    const [response, setResponse] = useState<Response | null>(null);
    const [data, setData] = useState<U | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<any>(null);

    // (선택) AuthContext에서 login 함수를 불러온다. 
    // 새 토큰이 왔을 때 'login(newToken)'을 호출하면, 
    // 전역 Context에서도 토큰이 갱신됨.
    const { login } = useAuth(); 

    const refreshToken = async (): Promise<string | null> => {
        try {
            // '/auth/token/refresh' 로 새 토큰 받기
            const response = await fetch('/auth/token/refresh', {
                method: 'POST',
                credentials: 'include', // refreshToken은 HttpOnly 쿠키
            });

            const data: ApiResponse<{ accessToken: string }> = await response.json();

            // 서버 응답에 새 accessToken이 있다면 저장
            if (data.data?.accessToken) {
                // 1) SecureStore 에 저장
                await saveToken(data.data.accessToken);

                // 2) (선택) AuthContext 갱신
                await login(data.data.accessToken);

                return data.data.accessToken;
            }
            return null;
        } catch (error) {
            console.error('Token Refresh Error:', error);
            return null;
        }
    };

    const excuteRequest = async (
        url: string,
        options: RequestInit,
        isRetry: boolean = false
    ): Promise<any> => {
        // 요청 전송
        const response = await fetch(url, options);
        const responseData = await response.json();

        // 만약 토큰 만료(HTTP 401 + code=40121) 상황이면 → refreshToken 로직
        if (response.status === 401 && String(responseData.code) === '40121' && !isRetry) {
            const newToken = await refreshToken();
            if (newToken) {
                console.log('Token Refreshed:', newToken);
                const newOptions = {
                    ...options,
                    headers: {
                        ...options.headers,
                        'Authorization': `Bearer ${newToken}`
                    }
                };
                // 재시도
                return excuteRequest(url, newOptions, true);
            }
            // refresh 실패 시 → 로그인 화면으로 이동
            console.log('Token refresh failed, redirecting to login');
            router.replace("/login");
            throw new Error('인증이 필요합니다.');
        }

        // 2xx가 아니면 Error 로그
        if (!response.ok) {
            console.error('API Error:', {
                status: response.status,
                statusText: response.statusText,
                code: responseData.code,
                message: responseData.message
            });
        }

        // 최종 응답 데이터 반환
        return responseData;
    };

    // 메인 API 요청 함수
    const execute = useCallback(async (payload?: T, dynamicUrl?: string, id?: number) => {
        if (!config.condition) return null;
        setIsLoading(true);
        setError(null);

        try {
            // storage에서 현재 accessToken 가져오기
            const token = await getToken();

            if (!token) {
                throw new Error('No authentication token found');
            }

            const headers = {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            };

            const finalUrl = dynamicUrl || (id ? `${config.url}/${id}` : config.url);
            console.log('Request URL:', finalUrl);
            console.log('Request Headers:', headers);
            console.log('Request Payload:', payload);
            console.log('Request Method:', config.method);

            const options = {
                method: config.method,
                headers,
                body: config.method !== 'GET' && payload ? JSON.stringify(payload) : undefined,
            };

            const responseData = await excuteRequest(finalUrl, options);
            setData(responseData);
            return responseData.data;
        } catch (err) {
            console.error('API Error:', err);
            if (err instanceof Error && err.message === 'No authentication token found') {
                router.replace("/login");
            }
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, [config]);

    return { data, isLoading, error, execute, response };
}