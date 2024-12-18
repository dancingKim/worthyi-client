import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";
import Constants from "expo-constants";
import {Alert} from "react-native";
import {router} from "expo-router";

export const handleSocialLogin = async (provider: string, login: (token: string) => void) => {
    /*
    * TODO: BASE_URL 로컬, 배포 환경에 따라 다르게 처리
    * */
    const OAUTH_BASE_URL = Constants.expoConfig?.extra?.OAUTH_BASE_URL;
    console.log('Current ENV:', Constants.expoConfig?.extra?.ENV);
    console.log('All extra config:', Constants.expoConfig?.extra);
    console.log("OAUTH_BASE_URL:", OAUTH_BASE_URL);
    // React Native Deep Linking URL 생성
    const redirectUri = Linking.createURL("sociallogin");
    const FRONTEND_URL = Linking.createURL('');
    // Spring Boot 서버의 인증 요청 URL
    const AUTH_URL = `${OAUTH_BASE_URL}/oauth2/authorization/${provider}?redirect_uri=${FRONTEND_URL}`;
    console.log("AUTH_URL:", AUTH_URL);

    try {
        // Expo WebBrowser를 사용하여 인증 세션 시작
        const result = await WebBrowser.openAuthSessionAsync(AUTH_URL);

        if (result.type === "success") {
            const token =  extractTokenFromUrl(result.url);
            if (token) {
                console.log("토큰 추출 성공:", token);
                await login(token);
                Alert.alert("로그인 성공", "로그인이 완료되었습니다.");
                router.replace("/(app)/(tabs)");
            } else {
                console.error("URL에 토큰이 포함되지 않았습니다.");
                Alert.alert("로그인 실패", "토큰을 가져오지 못했습니다.");
            }
        } else
        {
            console.error("WebBrowser 세션 종료 실패");
            Alert.alert("로그인 실패", "인증 과정에서 문제가 발생했습니다.");
        }
        console.log("result = ", result);
    } catch (error) {
        console.error("Auth Error:", error);
        Alert.alert("로그인 실패", "문제가 발생했습니다. 다시 시도해주세요.");
    }
};

const extractTokenFromUrl = (url: string): string | undefined => {
    const parsedUrl = Linking.parse(url);
    const rawToken = parsedUrl.queryParams?.token;

    // 토큰이 배열일 경우 첫 번째 값 반환
    if (Array.isArray(rawToken)) {
        return rawToken[0];
    }

    // 토큰이 문자열일 경우 그대로 반환
    return typeof rawToken === "string" ? rawToken : undefined;
}

// export const socialLogin = async (provider: string) => {
//     const BASE_URL = Constants.expoConfig?.extra?.BASE_URL;
//
//     console.log("BASE_URL",BASE_URL);
//
//     const FRONTEND_URL = Linking.createURL('');
//     console.log("frontendURL = ", FRONTEND_URL);
//     const AUTH_URL = `${BASE_URL}/auth/authorize/${provider}?redirect_url=${FRONTEND_URL}`;
//     console.log("AUTH_URL = ",AUTH_URL);
//
//
//     console.log("before try");
//     try {[]
//         console.log("try starts");
//         const result = await WebBrowser.openAuthSessionAsync(AUTH_URL);
//         console.log("result: ",result);
//     } catch (error) {
//         console.error("Auth Error: ", error);
//     }
// };
