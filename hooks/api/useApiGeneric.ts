// src/hooks/useApiGeneric.ts

import { useState, useCallback } from 'react';
// React의 상태 관리, 사이드 이펙트 처리, 함수 메모이제이션을 위한 훅들

import { getToken } from '@/utils/authStorage';
// 인증 토큰을 안전하게 저장하고 불러오기 위한 유틸리티 함수들

import { ApiHookConfig, ApiHookResult } from '@/types/api.types';
// API 훅의 타입을 정의하는 인터페이스

import { router } from 'expo-router';

// 제네릭을 사용하여 재사용 가능한 API 훅 정의
export function useApiGeneric<T = any, U = any>(
    config: ApiHookConfig<T>
): ApiHookResult<U> {
    const [response, setResponse] = useState<Response | null>(null);
    const [data, setData] = useState<U | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<any>(null);

    const execute = useCallback(async (payload?: T) => {
        if (!config.condition) return null;
        setIsLoading(true);
        setError(null);

        const headers: HeadersInit = {
            'Content-Type': 'application/json',
            'Accept': '*/*',
            'Connection': 'keep-alive'
        };

        try {
            const token = await getToken();
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            console.log('Request URL:', config.url);
            console.log('Request Headers:', headers);

            const response = await fetch(config.url, {
                method: config.method,
                headers,
                body: config.method !== 'GET' && payload ? JSON.stringify(payload) : undefined,
            });

            console.log('Response Status:', response.status);
            console.log('Response Headers:', response.headers);

            if (response.status === 401) {
                console.log('인증 실패: 로그인 페이지로 이동합니다.');
                router.replace("/login");
                throw new Error('인증이 필요합니다.');
            }

            const responseData = await response.json();
            
            if (!response.ok) {
                throw new Error(responseData.message || 'API request failed');
            }

            console.log('Response Data:', responseData);

            setData(responseData);
            console.log('Data set:', data);
            return responseData;
        } catch (err) {
            const error = err as Error;
            console.error('Network error details:', {
                message: error.message,
                name: error.name,
                stack: error.stack,
                url: config.url,
                headers
            });
            setError(error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, [config]);

    return { data, isLoading, error, execute, response };
}
