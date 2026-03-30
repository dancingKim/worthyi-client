import React, { useEffect, useRef } from 'react';
import { ActivityIndicator, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { useAuth } from '@/context/AuthContext';
import { exchangeCodeForTokens } from '@/utils/api';

export default function SocialLoginScreen() {
  const { code } = useLocalSearchParams<{ code?: string | string[] }>();
  const router = useRouter();
  const { isLoggedIn, login } = useAuth();
  const hasStarted = useRef(false);

  useEffect(() => {
    if (isLoggedIn) {
      router.replace('/');
      return;
    }

    if (hasStarted.current) {
      return;
    }

    const authCode = Array.isArray(code) ? code[0] : code;
    if (!authCode) {
      router.replace('/login');
      return;
    }

    hasStarted.current = true;

    (async () => {
      try {
        const tokens = await exchangeCodeForTokens(authCode);
        if (!tokens) {
          throw new Error('Token exchange failed');
        }

        await login(tokens.accessToken, tokens.refreshToken);
        router.replace('/');
      } catch (error) {
        console.error('Social login callback failed:', error);
        router.replace('/login');
      }
    })();
  }, [code, isLoggedIn, login, router]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <ActivityIndicator size="large" color="#FF69B4" />
        <Text style={styles.text}>로그인 처리 중입니다...</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  text: {
    fontSize: 16,
    color: '#333333',
  },
});
