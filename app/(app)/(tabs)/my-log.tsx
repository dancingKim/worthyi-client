// app/(app)/(tabs)/my-log/index.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert, Button, ScrollView, Dimensions } from 'react-native';
import { useApiGeneric } from '@/hooks/api/useApiGeneric';
import Constants from 'expo-constants';
import CalendarWithGratitude from '@/components/CalendarWithGratitude';
import { ApiResponse, ActionLogResponse } from '@/types/types';
import { Ionicons } from '@expo/vector-icons';

const BASE_URL = Constants.expoConfig?.extra?.BASE_URL;

// 날짜 포맷 헬퍼 함수 추가
const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function MyLogScreen() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  // date-fns format 함수를 커스텀 formatDate 함수로 교체
  const dateStr = formatDate(selectedDate);

  // API 훅
  const { data, isLoading, error, execute } = useApiGeneric<null, ApiResponse<ActionLogResponse>>({
    condition: true,
    method: 'GET',
    url: `${BASE_URL}/action/logs?date=${dateStr}`
  });

  useEffect(() => {
    execute();
  }, [dateStr]);

  useEffect(() => {
    if (error) {
      // 네트워크나 API 요청에 실패해도 알림은 띄우되, UI는 기본 상태 유지
      Alert.alert('오류', '데이터를 불러오는 중 문제가 발생했습니다. 기본 화면을 표시합니다.');
    }
  }, [error]);

  // 데이터를 가져오지 못했거나 에러가 발생한 경우 기본값 사용
  const dailyLogs = data?.data?.dailyLogs || [];
  const weeklyCount = data?.data?.weeklyCount || 0;
  const monthlyCount = data?.data?.monthlyCount || 0;
  const yearlyCount = data?.data?.yearlyCount || 0;

  // 감사한 날짜 목록: 데이터가 없으면 빈 배열
  const gratitudeDates = dailyLogs.map(log => log.date);
  const actions = dailyLogs.length > 0 ? dailyLogs[0].actions : [];

  return (
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>내 감사 로그</Text>

        {/* 캘린더는 항상 표시되며, 데이터 없으면 마크 없는 캘린더 */}
        <CalendarWithGratitude
            selectedDate={selectedDate}
            onDateChange={(date) => setSelectedDate(date)}
            gratitudeDates={gratitudeDates}
        />

        {/* 로딩 중일 때 로딩 표시 (캘린더 외 UI도 표시되나, 로딩중임을 알림) */}
        {isLoading && <ActivityIndicator size="large" />}

        {/* 통계 정보 섹션 업데이트 */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Ionicons name="calendar-outline" size={24} color="#4A90E2" />
            <Text style={styles.statLabel}>이번 주</Text>
            <Text style={styles.statValue}>{weeklyCount}일</Text>
          </View>
          
          <View style={styles.statCard}>
            <Ionicons name="moon-outline" size={24} color="#50C878" />
            <Text style={styles.statLabel}>이번 달</Text>
            <Text style={styles.statValue}>{monthlyCount}일</Text>
          </View>
          
          <View style={styles.statCard}>
            <Ionicons name="star-outline" size={24} color="#FFB347" />
            <Text style={styles.statLabel}>올해</Text>
            <Text style={styles.statValue}>{yearlyCount}일</Text>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <Button title="다음날" onPress={() => {
            const nextDay = new Date(selectedDate);
            nextDay.setDate(nextDay.getDate() + 1);
            setSelectedDate(nextDay);
          }} />
          <Button title="이전날" onPress={() => {
            const prevDay = new Date(selectedDate);
            prevDay.setDate(prevDay.getDate() - 1);
            setSelectedDate(prevDay);
          }} />
        </View>

        {/* 감사 리스트: 데이터가 없는 경우 표시 안 하거나, 빈 상태 표시 */}
        {actions.length > 0 ? (
            actions.map(action => (
                <View key={action.childActionId} style={styles.actionContainer}>
                    <Text style={styles.actionTitle}>감사: {action.childActionContent}</Text>
                    <Text style={styles.adultAction}>
                        칭찬: {action.adultActions.map(adult => adult.adultActionContent).join(', ')}
                    </Text>
                </View>
            ))
        ) : (
            <View style={styles.emptyContainer}>
                <Text>해당 날짜에 대한 데이터가 없습니다.</Text>
            </View>
        )}
      </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 16, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 20,
    paddingHorizontal: 10,
  },
  statCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    width: Dimensions.get('window').width / 3.5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 3,
  },
  buttonContainer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
  actionContainer: { marginTop: 10, padding: 10, backgroundColor: '#f9f9f9', borderRadius: 5 },
  actionTitle: { fontSize: 16, fontWeight: 'bold' },
  adultAction: { fontSize: 14, marginLeft: 10 },
  emptyContainer: { marginTop: 20, alignItems: 'center' },
});