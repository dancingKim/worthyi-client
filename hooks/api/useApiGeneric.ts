// src/hooks/useApiGeneric.ts

import { useState, useCallback } from 'react';
// React의 상태 관리, 사이드 이펙트 처리, 함수 메모이제이션을 위한 훅들

import { getToken, saveToken } from '@/utils/authStorage';
// 인증 토큰을 안전하게 저장하고 불러오기 위한 유틸리티 함수들

import { ApiHookConfig, ApiHookResult } from '@/types/api.types';
// API 훅의 타입을 정의하는 인터페이스

import { router } from 'expo-router';
import { ApiResponse } from '@/types/types';

// 제네릭을 사용하여 재사용 가능한 API 훅 정의
export function useApiGeneric<T = any, U = any>(
    config: ApiHookConfig<T>
): ApiHookResult<U> {
    const [response, setResponse] = useState<Response | null>(null);
    const [data, setData] = useState<U | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<any>(null);

    const refreshToken = async () : Promise<string | null> => {
        try {
            const response = await fetch('/auth/token/refresh', {
                method: 'POST',
                credentials: 'include',
        });

        const data: ApiResponse<{accessToken: string}> = await response.json();

        if (data.data?.accessToken) {
         await saveToken(data.data.accessToken);
         return data.data.accessToken;
        }
        return null;

        } catch (error) {
            console.error('Token Refresh Error:', error);
            return null;
        }
    }

    const excuteRequest = async (
        url: string,
        options: RequestInit,
        isRetry: boolean = false
    )
    : Promise<any> => {
        const response = await fetch(config.url, options);
        const responseData = await response.json();

        if (response.status === 40121 && !isRetry) {
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
                return excuteRequest(url, newOptions, true);
            }
            console.log('Token refresh failed, redirecting to login');
            router.replace("/login");
            throw new Error('인증이 필요합니다.');
        }

        if (!response.ok) {
            console.error('API Error:', {
                status: response.status,
                statusText: response.statusText,
                code: responseData.code,
                message: responseData.message
            });
        }

        return responseData;
    }

    const execute = useCallback(async (payload?: T, dynamicUrl?: string, id?: number) => {
        if (!config.condition) return null;
        setIsLoading(true);
        setError(null);

        try {
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