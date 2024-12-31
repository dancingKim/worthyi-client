import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";
import Constants from "expo-constants";
import {Alert} from "react-native";
import {router} from "expo-router";
import {Platform} from "react-native";

interface WebBrowserResultWithUrl extends WebBrowser.WebBrowserResult {
  url: string;
}

export const handleSocialLogin = async (provider: string, login: (token: string) => Promise<void>) => {
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

    console.log("FRONTEND_URL:", FRONTEND_URL);
    const returnUrl = redirectUri;
    console.log("returnUrl:", returnUrl);
    
    const AUTH_URL = `${OAUTH_BASE_URL}/oauth2/authorization/${provider}?redirect_uri=${FRONTEND_URL}`;
    console.log("AUTH_URL:", AUTH_URL);

    try {
        // returnUrl을 명시적으로 전달
        const result = await WebBrowser.openAuthSessionAsync(
            AUTH_URL,
            returnUrl
        );
        
        console.log('인증 결과:', result);

        // result.type이 dismiss여도 계속 진행
        if (result.type === "success" || (Platform.OS === 'android' && result.type === "dismiss")) {
            const resultWithUrl = result as WebBrowserResultWithUrl;
            console.log("resultWithUrl:", resultWithUrl);
            const token = resultWithUrl.url ? extractTokenFromUrl(resultWithUrl.url) : null;
            if (token) {
                console.log("토큰 추출 성공:", token);
                await login(token);
                Alert.alert("로그인 성공", "로그인이 완료되었습니다.");
                router.push("/(app)/(tabs)");
            } else {
                console.error("URL에 토큰이 포함되지 않았습니다.");
                Alert.alert("로그인 실패", "토큰을 가져오지 못했습니다.");
            }
        } else {
            if (Constants.expoConfig?.extra?.ENV === 'preview') {
                Alert.alert(
                    '디버그 정보', 
                    `인증 타입: ${result.type}`,
                    [{ text: '확인' }],
                    { cancelable: true }
                );
            }
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
