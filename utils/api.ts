import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";
import Constants from "expo-constants";
import {Alert} from "react-native";
import {router} from "expo-router";
import {Platform} from "react-native";
import * as AppleAuthentication from 'expo-apple-authentication';
import { useAuth } from '@/context/AuthContext';

interface WebBrowserResultWithUrl extends WebBrowser.WebBrowserResult {
  url: string;
}

export const handleSocialLogin = async (provider: string,login: (token: string) => Promise<void>) => {
  const OAUTH_BASE_URL = Constants.expoConfig?.extra?.OAUTH_BASE_URL;
  const FRONTEND_URL = Linking.createURL('');
  const AUTH_URL = `${OAUTH_BASE_URL}/oauth2/authorization/${provider}?redirect_uri=${FRONTEND_URL}`;
  console.log("AUTH_URL:", AUTH_URL);

  try {
    const result = await WebBrowser.openAuthSessionAsync(AUTH_URL, FRONTEND_URL);

    if (result.type === "success" || (Platform.OS === 'android' && result.type === "dismiss")) {
      const resultWithUrl = result as WebBrowserResultWithUrl;
      const token = resultWithUrl.url ? extractTokenFromUrl(resultWithUrl.url) : null;

      if (token) {
        await login(token);
        router.push("/(app)/(tabs)");
      }
    }
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'ERR_CANCELED') {
        Alert.alert('Login canceled');
      } else {
        Alert.alert('Login error', error.message);
      }
    } else {
      Alert.alert('An unknown error occurred');
    }
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
