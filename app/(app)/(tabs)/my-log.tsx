// app/(app)/(tabs)/my-log/index.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert, Button, ScrollView, Dimensions, SafeAreaView, FlatList } from 'react-native';
import { useApiGeneric } from '@/hooks/api/useApiGeneric';
import Constants from 'expo-constants';
import CalendarWithGratitude from '@/components/CalendarWithGratitude';
import { ApiResponse, ActionLogResponse, ActionResponse } from '@/types/types';
import { Ionicons, AntDesign } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CommonStyles } from '@/constants/Styles';
import { FontFamily } from '@/constants/Fonts';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '@/context/AuthContext';

const BASE_URL = Constants.expoConfig?.extra?.BASE_URL;

// 날짜 포맷 헬퍼 함수 추가
const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function MyLogScreen() {
  const insets = useSafeAreaInsets();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  // date-fns format 함수를 커스텀 formatDate 함수로 교체

  const {isLoggedIn} = useAuth();

  // API 훅
  const { data: actionData, error, isLoading, execute: executeGetActions } = useApiGeneric<null, ApiResponse<ActionLogResponse>>({
    condition: isLoggedIn,
    method: 'GET',
    url: `${BASE_URL}/action/logs?date=${formatDate(selectedDate)}`
  });

  // 탭 포커스될 때마다 데이터 새로고침
  useFocusEffect(
    useCallback(() => {
      if (isLoggedIn) {
        executeGetActions();
      }
    }, [selectedDate])
  );

  useEffect(() => {
    if (error) {
      // Alert 제거하고 콘솔 로그만 남김
      console.error('데이터를 불러오는 중 문제가 발생했습니다:', error);
    }
  }, [error]);

  useEffect(() => {
    if (actionData?.data) {
      console.log('Daily Logs:', JSON.stringify(actionData.data.dailyLogs, null, 2));
      // 데이터 구조 확인
      actionData.data.dailyLogs.forEach((log, index) => {
        console.log(`Log ${index}:`, {
          date: log.date,
          actionsCount: log.actions?.length
        });
      });
    }
  }, [actionData]);

  // 데이터를 가져오지 못했거나 에러가 발생한 경우 기본값 사용
  const dailyLogs = actionData?.data?.dailyLogs || [];
  const weeklyCount = actionData?.data?.weeklyCount || 0;
  const monthlyCount = actionData?.data?.monthlyCount || 0;
  const yearlyCount = actionData?.data?.yearlyCount || 0;

  // 감사한 날짜 목록: 데이터가 없으면 빈 배열
  const gratitudeDates = dailyLogs?.map(log => log.date) || [];
  const actions = dailyLogs?.reduce((acc, log) => {
    return [...acc, ...(log.actions || [])];
  }, [] as ActionResponse[]) || [];
  
  // 화면 크기에 따른 동적 패딩 계산
  const screenHeight = Dimensions.get('window').height;
  const bottomPadding = insets.bottom + (screenHeight * 0.12); // 화면 높이의 12% + 하단 안전영역

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={{
          paddingBottom: bottomPadding // 하단 패딩 추가
        }}
      >
        <Text style={[styles.title, CommonStyles.heading1]}>내 감사 로그</Text>

        <CalendarWithGratitude
          selectedDate={selectedDate}
          onDateChange={(date) => setSelectedDate(date)}
          gratitudeDates={gratitudeDates}
        />

        {isLoading && <ActivityIndicator size="large" />}

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Ionicons name="calendar-outline" size={24} color="#4A90E2" />
            <Text style={styles.statValue}>{weeklyCount}</Text>
            <Text style={styles.statLabel}>이번 주</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="moon-outline" size={24} color="#50C878" />
            <Text style={styles.statValue}>{monthlyCount}</Text>
            <Text style={styles.statLabel}>이번 달</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="star-outline" size={24} color="#FFB347" />
            <Text style={styles.statValue}>{yearlyCount}</Text>
            <Text style={styles.statLabel}>올해</Text>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <Button title="이전날" onPress={() => {
            const prevDay = new Date(selectedDate);
            prevDay.setDate(prevDay.getDate() - 1);
            setSelectedDate(prevDay);
          }} />
          <Button title="다음날" onPress={() => {
            const nextDay = new Date(selectedDate);
            nextDay.setDate(nextDay.getDate() + 1);
            setSelectedDate(nextDay);
          }} />
        </View>

        <FlatList
          data={actions}
          scrollEnabled={false}
          renderItem={({ item: action }) => (
            <View key={action.id} style={styles.actionContainer}>
              <Text style={[styles.actionTitle, { fontFamily: FontFamily.medium }]}>
                감사: {action.content.text}
              </Text>
              <Text style={[styles.adultAction, { fontFamily: FontFamily.regular }]}>
                칭찬: {(action.responses || [])
                  .map(response => response.content.text)
                  .filter(Boolean)
                  .join(' • ')}
              </Text>
            </View>
          )}
          keyExtractor={item => item.id.toString()}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Text>해당 날짜에 대한 데이터가 없습니다.</Text>
            </View>
          )}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontFamily: FontFamily.bold,
    marginVertical: 24,
    color: '#333',
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 24,
    backgroundColor: '#FFF0F5',
    borderRadius: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statItem: {
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    minWidth: '28%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  statValue: {
    fontSize: 28,
    fontFamily: FontFamily.bold,
    color: '#333',
    marginBottom: 4,
    marginTop: 4,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: FontFamily.medium,
    color: '#666',
  },
  buttonContainer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
  actionContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  actionTitle: { fontSize: 16, fontWeight: 'bold' },
  adultAction: { fontSize: 14, marginLeft: 10 },
  emptyContainer: { marginTop: 20, alignItems: 'center' },
});