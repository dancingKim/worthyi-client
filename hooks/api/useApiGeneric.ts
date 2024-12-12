// src/hooks/useApiGeneric.ts

import { useState, useEffect, useCallback } from 'react';
// React의 상태 관리, 사이드 이펙트 처리, 함수 메모이제이션을 위한 훅들

// import NetInfo from '@react-native-community/netinfo';
// 네트워크 연결 상태를 확인하기 위한 NetInfo 모듈

import { Alert } from 'react-native';
// 사용자에게 알림을 표시하기 위한 Alert 컴포넌트

import { getToken, removeToken } from '@/utils/authStorage';
// 인증 토큰을 안전하게 저장하고 불러오기 위한 유틸리티 함수들

import { handleError } from '@/utils/errorHander';
// 공통 에러 처리 함수를 임포트 (오타: 'errorHandler'가 맞을 수 있습니다)

import { useAuth } from '@/context/AuthContext';
// 인증 상태를 관리하는 커스텀 훅을 임포트

// API 요청에 필요한 프로퍼티를 정의하는 인터페이스
interface UseApiProps<T, U> {
    method: 'GET' | 'POST' | 'PUT' | 'DELETE'; // HTTP 메소드
    url: string; // API 엔드포인트 URL
    data?: T | null; // 요청 본문에 포함될 데이터 (옵셔널)
    condition?: boolean; // 요청 실행 조건 (옵셔널, 기본값은 true)
}

// API 훅이 반환할 값의 타입을 정의하는 인터페이스
interface UseApiReturn<U> {
    data: U | null; // 응답 데이터 또는 null
    isLoading: boolean; // 로딩 상태
    error: any; // 에러 객체
    execute: (data?: any) => Promise<void>; // API 요청을 실행하는 함수
    response: Response | null; // 원시 fetch Response 객체 또는 null
}

// 제네릭을 사용하여 재사용 가능한 API 훅 정의
export function useApiGeneric<T = any, U = any>({
                                                    method,
                                                    url,
                                                    data,
                                                    condition = true,
                                                }: UseApiProps<T, U>): UseApiReturn<U> {
    // 원시 Response 객체를 저장할 상태
    const [response, setResponse] = useState<Response | null>(null);

    // 파싱된 응답 데이터를 저장할 상태
    const [dataState, setDataState] = useState<U | null>(null);

    // 로딩 상태를 저장할 상태
    const [isLoading, setIsLoading] = useState<boolean>(false);

    // 에러 객체를 저장할 상태
    const [error, setError] = useState<any>(null);

    // 인증 컨텍스트에서 logout 함수를 가져옴
    const { logout } = useAuth();

    /**
     * API 요청을 실행하는 함수
     * @param payload 요청 본문에 포함될 데이터 (옵셔널)
     */
    const execute = useCallback(
        async (payload?: T) => {
            console.log("execute", payload);
            console.log("conditoin", condition);
            console.log("url", url);
            console.log("method", method);
            console.log("data", data);
            console.log("error", error);
            // 요청 실행 조건이 false면 함수 종료
            if (!condition) return;
            // 로딩 상태를 true로 설정
            setIsLoading(true);

            // 이전 에러를 초기화
            setError(null);

            // 네트워크 상태 확인
            // const netState = await NetInfo.fetch();
            // if (!netState.isConnected) {
            //     // 네트워크가 연결되지 않았을 경우 사용자에게 알림
            //     Alert.alert('네트워크 오류', '인터넷 연결을 확인해주세요.');
            //     // 로딩 상태를 false로 설정하고 함수 종료
            //     setIsLoading(false);
            //     return;
            // }

            // 요청을 취소할 수 있는 AbortController 생성
            const controller = new AbortController();
            const signal = controller.signal;

            try {
                // 저장된 인증 토큰 가져오기
                const token = await getToken();

                console.log("token", token);

                // 요청 헤더 설정
                const headers: HeadersInit = {
                    'Content-Type': 'application/json', // JSON 형식 지정
                };
                if (token) {
                    // 토큰이 존재하면 Authorization 헤더에 추가
                    headers['Authorization'] = `Bearer ${token}`;
                }

                // fetch 옵션 설정
                let fetchOptions: RequestInit = {
                    method, // HTTP 메소드
                    headers, // 설정된 헤더
                    signal, // 요청 취소 시그널
                };

                console.log("fetchOptions = ",fetchOptions);

                // GET 메소드가 아닌 경우, 요청 본문에 데이터 추가
                if (method !== 'GET' && payload) {
                    fetchOptions.body = JSON.stringify(payload); // 데이터를 JSON 문자열로 변환
                }

                console.log("fetchOptions.body:",fetchOptions.body);
                console.log("fetchOptions after body added:",fetchOptions);

                // fetch를 사용하여 API 요청 실행
                const res = await fetch(url, fetchOptions);
                console.log("res:",res);
                // 응답을 상태에 저장
                setResponse(res);
                console.log("response set:",response);

                if (!res.ok) {
                    const contentType = res.headers.get('content-type');
                    let errorData: any;
                    if (contentType && contentType.includes('application/json')) {
                        errorData = await res.json();
                    } else {
                        // JSON이 아닐 경우 텍스트로 받아옴
                        const textData = await res.text();
                        errorData = { message: textData };
                    }

                    if (res.status === 401) {
                        await removeToken();
                    }

                    throw { ...errorData, status: res.status };
                }


                // 응답 데이터를 JSON으로 파싱
                const responseData: U = await res.json();
                // 파싱된 데이터를 상태에 저장
                setDataState(responseData);
            } catch (err: any) {
                // 요청이 취소된 경우 처리
                if (err.name === 'AbortError') {
                    console.log('Fetch aborted');
                } else {
                    // 기타 에러 처리
                    console.log(`${method} 요청 실패:`, err);
                    // 에러 상태를 업데이트
                    setError(err);
                    // 공통 에러 처리 함수 호출, logout 함수 전달
                    await handleError(err, logout);
                }
            } finally {
                // 로딩 상태를 false로 설정
                setIsLoading(false);
            }

            // execute 함수는 더 이상 cleanup 함수를 반환하지 않음
        },
        [method, url, condition, logout] // useCallback의 의존성 배열: method, url, condition, logout이 변경될 때 execute 함수 재생성
    );

    /**
     * 컴포넌트가 마운트되거나 의존성이 변경될 때 API 요청을 자동으로 실행
     */
    useEffect(() => {
        // 요청 실행 조건과 메소드가 GET인지 확인
        if (condition && method === 'GET') {
            execute(); // execute 함수를 호출하여 API 요청 실행

            // 이전에는 execute 함수의 반환 값을 cleanup 함수로 반환했으나, 이제는 반환하지 않음
        }
    }, [url, condition, method, execute]); // useEffect의 의존성 배열: url, condition, method, execute가 변경될 때마다 실행

    /**
     * 훅이 반환하는 값들
     */
    return { data: dataState, isLoading, error, execute, response };
    // data: 응답 데이터
    // isLoading: 로딩 상태
    // error: 에러 객체
    // execute: API 요청을 수동으로 실행하는 함수
    // response: 원시 fetch Response 객체
}
