// src/hooks/useApiGeneric.ts

import { useState, useCallback } from 'react';
import { getToken, getTokenByType, saveToken } from '@/utils/authStorage';
import { ApiHookConfig, ApiHookResult, ApiResponse } from '@/types/types';
import { router } from 'expo-router';
import { Alert } from 'react-native';

/**
 * 공용 API 요청 훅
 * - accessToken 만료 시 /auth/token/refresh 로 새 토큰 받아 저장
 * - 새 토큰 받아도, 전역 AuthContext는 굳이 갱신하지 않음(=로그인 아님)
 * - 새 토큰만 SecureStore에 저장하면 이후 요청엔 자동으로 사용됨
 */
export function useApiGeneric<T = any, U = any>(
  config: ApiHookConfig<T>
): ApiHookResult<U> {
  const [response, setResponse] = useState<Response | null>(null);
  const [data, setData] = useState<U | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<any>(null);

  // ─────────────────────────────────────────────────────────────
  // 주의: 여기서 useAuth()를 import해 쓰면 AuthProvider와 순환 의존 생김
  // ─────────────────────────────────────────────────────────────

  // Refresh Token 로직
  const refreshToken = async (): Promise<string | null> => {
    try {
          // 1) SecureStore 등에서 refreshToken 꺼내기
    const storedRefreshToken = await getTokenByType("refresh_token");
    if (!storedRefreshToken) {
      console.log('No stored refresh token found');
      return null;
    }

      const response = await fetch('https://api-dev.worthyilife.com/auth/token/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: storedRefreshToken }),
      });
      const responseData: ApiResponse<{ accessToken: string }> = await response.json();

      console.log("response:", response);
      console.log("responseData:", responseData);

      // 200 OK이고, data.accessToken 있으면 저장
      if (response.ok && responseData.data?.accessToken) {
        const newAccessToken = responseData.data.accessToken;
        // SecureStore 에 저장
        await saveToken(newAccessToken);
        // 전역 AuthContext를 갱신하지 않음(→ circular dependency 피함)
        return newAccessToken;
      }

      // refresh 실패하면 null
      return null;
    } catch (err) {
      console.error('Token Refresh Error:', err);
      return null;
    }
  };

  // 내부 요청 수행 함수
  const excuteRequest = async (
    url: string,
    options: RequestInit,
    isRetry: boolean = false
  ): Promise<any> => {
    // 실제 요청
    const res = await fetch(url, options);
    setResponse(res);

    let responseData: any = {};
    try {
      responseData = await res.json();
    } catch (err) {
      console.warn('Failed to parse JSON response:', err);
    }

    console.log("res:",res);
    console.log("responseData:", responseData);
    console.log("responseData:", responseData);
    console.log("res.status:", res.status);


    // 만약 accessToken 만료(HTTP 401 + code=40121)라면 → refresh
    if (responseData.code === 40121 && !isRetry) {
      console.log('Access token expired, attempting refresh...');
      const newToken = await refreshToken();
      if (newToken) {
        console.log('Token refreshed successfully:', newToken.slice(0, 10) + '...');

        // 기존 요청 재시도
        const newOptions = {
          ...options,
          headers: {
            ...options.headers,
            Authorization: `Bearer ${newToken}`,
          },
        };
        return excuteRequest(url, newOptions, true);
      }
      // refresh 실패 시 → 로그인 화면으로 이동
      console.log('Token refresh failed, redirecting to login...');
      router.replace('/login');
      throw new Error('다시 로그인이 필요합니다.');
    }

    // 2xx 아니면 로그
    if (!res.ok) {
      console.error('API Error:', {
        status: res.status,
        statusText: res.statusText,
        code: responseData.code,
        message: responseData.message,
      });
    }

    return responseData;
  };

  // 외부에서 사용할 main 함수
  const execute = useCallback(
    async (payload?: T, dynamicUrl?: string, id?: number) => {
      if (!config.condition) return null;
      setIsLoading(true);
      setError(null);

      try {
        const token = await getToken();
        if (!token) {
          // 토큰이 없는 상태 → 로그인 필요
          throw new Error('No authentication token found');
        }

        const headers = {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        };

        const finalUrl = dynamicUrl || (id ? `${config.url}/${id}` : config.url);
        const options = {
          method: config.method,
          headers,
          body: config.method !== 'GET' && payload ? JSON.stringify(payload) : undefined,
        };

        const responseData = await excuteRequest(finalUrl, options);
        setData(responseData);
        return responseData
      } catch (err) {
        console.error('API Error in useApiGeneric:', err);
        if (err instanceof Error && err.message === 'No authentication token found') {
          router.replace('/login');
        }
        setError(err);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [config]
  );

  return { data, isLoading, error, execute, response };
}