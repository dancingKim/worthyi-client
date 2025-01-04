import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect, useState } from 'react';
import { useColorScheme } from '@/hooks/useColorScheme';
import { AuthProvider } from "@/context/AuthContext";
import { Slot, Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';
import { ErrorBoundary } from 'react-error-boundary';
import { View, Text } from 'react-native';

// 가장 먼저 실행되도록 파일 최상단에 배치
SplashScreen.preventAutoHideAsync()
  .catch((err) => {
    console.error('Error preventing splash screen auto hide:', err);
  });

function ErrorFallback({ error, logs }: { error: Error, logs: string[] }) {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>앱 로딩 중 문제가 발생했습니다: {error.message}</Text>
      <Text>error name</Text>
      <Text>{error.name}</Text>
      <Text>error stack</Text>
      <Text>{error.stack ?? 'No stack trace available'}</Text>
      <Text>error cause</Text>
      <Text>{String(error.cause) ?? 'No cause available'}</Text>
      <Text>Logs:</Text>
      {logs.map((log, index) => (
        <Text key={index}>{log}</Text>
      ))}
    </View>
  );
}

export default function RootLayout() {
  const [logs, setLogs] = useState<string[]>([]);
  const colorScheme = useColorScheme();
  
  const logMessage = (message: string) => {
    setLogs((prevLogs) => [...prevLogs, message]);
    console.log(message);
  };

  useEffect(() => {
    logMessage('Root layout rendering');
  }, []);

  const [loaded, error] = useFonts({
    'Pretendard-Thin': require('../assets/fonts/Pretendard-Thin.otf'),
    'Pretendard-ExtraLight': require('../assets/fonts/Pretendard-ExtraLight.otf'),
    'Pretendard-Light': require('../assets/fonts/Pretendard-Light.otf'),
    'Pretendard-Regular': require('../assets/fonts/Pretendard-Regular.otf'),
    'Pretendard-Medium': require('../assets/fonts/Pretendard-Medium.otf'),
    'Pretendard-SemiBold': require('../assets/fonts/Pretendard-SemiBold.otf'),
    'Pretendard-Bold': require('../assets/fonts/Pretendard-Bold.otf'),
    'Pretendard-ExtraBold': require('../assets/fonts/Pretendard-ExtraBold.otf'),
    'Pretendard-Black': require('../assets/fonts/Pretendard-Black.otf'),
  });

  // 폰트 로딩 에러 처리 강화
  if (error) {
    logMessage(`Font loading failed: ${error.message}`);
  }

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync().catch(err => {
        logMessage(`Error hiding splash screen: ${err.message}`);
      });
    }
  }, [loaded]);

  // 에러 로깅을 console.error로 통일
  useEffect(() => {
    if (error) {
      logMessage(`Font loading error: ${error.message}`);
    }
  }, [error]);

  // 폰트 로딩 중에는 null 반환 (Splash Screen 유지)
  if (!loaded) return null;

  return (
    <ErrorBoundary FallbackComponent={(props) => <ErrorFallback {...props} logs={logs} />}>
      <GestureHandlerRootView style={styles.container}>
        <AuthProvider>
          <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
            <Stack>
              <Stack.Screen name="(app)" options={{ headerShown: false }} />
              <Stack.Screen name="login" options={{ headerShown: false }} />
            </Stack>
          </ThemeProvider>
        </AuthProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
