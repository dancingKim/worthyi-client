import { Alert } from "react-native";
import * as ExpoLinking from "expo-linking";
import { useCallback, useEffect } from "react";

const useDeepLinkingHandler = (login: (token: string) => void, router: any) => {
    // Deep Linking 이벤트 처리 함수
    const handleDeepLink = useCallback(
        (event: { url: string }) => {
            // Expo의 Linking API로 URL 파싱
            const parsedUrl = ExpoLinking.parse(event.url);

            // 토큰 추출
            const rawToken = parsedUrl.queryParams?.token;
            const token =
                typeof rawToken === "string"
                    ? rawToken
                    : Array.isArray(rawToken)
                        ? rawToken[0]
                        : undefined;

            if (token) {
                console.log("토큰 추출 성공:", token);
                login(token); // AuthContext의 로그인 함수 호출
                Alert.alert("로그인 성공", "로그인이 완료되었습니다.");
                router.push("/"); // 메인 화면으로 이동
            } else {
                console.error("URL에 토큰이 포함되지 않았습니다.");
                Alert.alert("로그인 실패", "토큰을 가져오지 못했습니다.");
            }
        },
        [login, router]
    );

    useEffect(() => {
        // Expo의 Linking API를 이용하여 이벤트 리스너 추가
        const subscription = ExpoLinking.addEventListener("url", handleDeepLink);

        return () => {
            // 컴포넌트 언마운트 시 이벤트 리스너 제거
            subscription.remove();
        };
    }, [handleDeepLink]);
};

export default useDeepLinkingHandler;
