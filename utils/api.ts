import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";
import Constants from "expo-constants";

WebBrowser.maybeCompleteAuthSession();

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export const handleSocialLogin = async (provider: string) => {
  const OAUTH_BASE_URL = Constants.expoConfig?.extra?.OAUTH_BASE_URL;
  const FRONTEND_URL = Linking.createURL("");
  const AUTH_URL = `${OAUTH_BASE_URL}/oauth2/authorization/${provider}?redirect_url=${encodeURIComponent(FRONTEND_URL)}`;

  const result = await WebBrowser.openAuthSessionAsync(AUTH_URL, FRONTEND_URL);

  if (result.type === "cancel" || result.type === "dismiss") {
    return;
  }

  if (result.type !== "success") {
    throw new Error(`Unsupported auth session result: ${result.type}`);
  }
};

export async function exchangeCodeForTokens(code: string): Promise<AuthTokens | null> {
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
      return null;
    }
    // { code:200, data:{ accessToken, refreshToken } }
    if (json.data?.accessToken && json.data?.refreshToken) {
      return {
        accessToken: json.data.accessToken,
        refreshToken: json.data.refreshToken,
      };
    }
    return null;
  } catch (err) {
    console.error('Exchange error:', err);
    return null;
  }
}
