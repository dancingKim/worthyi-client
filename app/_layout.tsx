import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect } from 'react';
import { useColorScheme } from '@/hooks/useColorScheme';
import { AuthProvider } from "@/context/AuthContext";
import { Slot } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';

// 가장 먼저 실행되도록 파일 최상단에 배치
SplashScreen.preventAutoHideAsync()
  .catch((err) => {
    console.error('Error preventing splash screen auto hide:', err);
  });

export default function RootLayout() {
  const colorScheme = useColorScheme();
  
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

  useEffect(() => {
    console.log('Font loading status:', loaded);
    console.log('Font loading error:', error);  // 에러 로그 추가
    if (loaded) {
      // 폰트 로딩이 완료되면 Splash Screen 숨기기
      SplashScreen.hideAsync().catch(err => {
        console.error('Error hiding splash screen:', err);
      });
    }
  }, [loaded, error]);

  // 에러 로깅을 console.error로 통일
  useEffect(() => {
    if (error) {
      console.error('Font loading error:', error);
    }
  }, [error]);

  // 폰트 로딩 중에는 null 반환 (Splash Screen 유지)
  if (!loaded) return null;

  return (
    <GestureHandlerRootView style={styles.container}>
      <AuthProvider>
        <Slot />
      </AuthProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
