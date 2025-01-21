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

export const handleSocialLogin = async (provider: string, login: (accessToken: string, refreshToken: string) => Promise<void>) => {
  const OAUTH_BASE_URL = Constants.expoConfig?.extra?.OAUTH_BASE_URL;
  const FRONTEND_URL = Linking.createURL('');
  const AUTH_URL = `${OAUTH_BASE_URL}/oauth2/authorization/${provider}?redirect_uri=${FRONTEND_URL}`;
  console.log("AUTH_URL:", AUTH_URL);

  try {
    const result = await WebBrowser.openAuthSessionAsync(AUTH_URL, FRONTEND_URL);
    console.log("login result:", result);

    if (result.type === "success" || (Platform.OS === 'android' && result.type === "dismiss")) {
      const resultWithUrl = result as WebBrowserResultWithUrl;
      const code = resultWithUrl.url ? extractCodeFromUrl(resultWithUrl.url) : null;
      

      if (code) {
        const tokens = await exchangeCodeForTokens(code);
        if (tokens) {
          const { accessToken, refreshToken } = tokens;
          await login(accessToken, refreshToken);
          router.push("/(app)/(tabs)");
        } else {
          Alert.alert('Token exchange failed');
        }
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

async function exchangeCodeForTokens(code: string) {
  try {
    const BASE_URL = Constants.expoConfig?.extra?.BASE_URL;
    const response = await fetch(`${BASE_URL}/auth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ authCode: code }),
    });
    const json = await response.json();
    if (!response.ok) {
      console.log('Token exchange failed:', json);
      return;
    }
    // { code:200, data:{ accessToken, refreshToken } }
    if (json.data?.accessToken && json.data?.refreshToken) {
      return {
        accessToken: json.data.accessToken,
        refreshToken: json.data.refreshToken,
      };
    }
    Alert.alert('Login success!');
  } catch (err) {
    console.error('Exchange error:', err);
    Alert.alert('Exchange error', String(err));
  }
}

const extractCodeFromUrl = (url: string): string | undefined => {
    const parsedUrl = Linking.parse(url);
    const rawCode = parsedUrl.queryParams?.code;

    // 토큰이 배열일 경우 첫 번째 값 반환
    if (Array.isArray(rawCode)) {
        return rawCode[0];
    }

    // 토큰이 문자열일 경우 그대로 반환
    return typeof rawCode === "string" ? rawCode : undefined;
}