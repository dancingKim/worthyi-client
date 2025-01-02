// HomeScreen.tsx
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  Keyboard,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  PanResponder,
  Dimensions,
  Modal,
  Alert,
  FlatList,
  GestureResponderHandlers,
  GestureResponderEvent,
  PanResponderGestureState,
} from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import Constants from 'expo-constants';

import { useApiGeneric } from '@/hooks/api/useApiGeneric';
import { useChildActionApi } from '@/hooks/api/useChildActionApi';
import { useAdultActionApi } from '@/hooks/api/useAdultActionApi';

import SpeechBubble from '@/components/SpeechBubble';
import ChildActionList from '@/components/ChildActionList';
import AdultActionList from '@/components/AdultActionList';

import {
  ApiResponse,
  ActionContent,
  ActionResponse,
  AddAdultActionRequest,
  DeleteResponse
} from '@/types/types';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CommonStyles } from '@/constants/Styles';
import { FontFamily } from '@/constants/Fonts';

import Animated, {
  useAnimatedStyle,
  withTiming,
  useSharedValue
} from 'react-native-reanimated';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;

// 플랫폼별 레이아웃 높이 계산
const LAYOUT_HEIGHTS = {
  ...(Platform.OS === 'android'
    ? {
        TOP_PADDING: SCREEN_HEIGHT * 0.08,
        SPEECH_BUBBLE: SCREEN_HEIGHT * 0.22,
        AVATAR: SCREEN_HEIGHT * 0.30,
        SPACER: SCREEN_HEIGHT * 0.60,
        INITIAL_LIST_POSITION: SCREEN_HEIGHT * 0.60,
      }
    : {
        TOP_PADDING: SCREEN_HEIGHT * 0.03,
        SPEECH_BUBBLE: SCREEN_HEIGHT * 0.27,
        AVATAR: SCREEN_HEIGHT * 0.30,
        SPACER: SCREEN_HEIGHT * 0.60,
        INITIAL_LIST_POSITION: SCREEN_HEIGHT * 0.60,
      })
};

export function HomeScreen() {
  const insets = useSafeAreaInsets();

  // State
  const [childActionContent, setChildActionContent] = useState<string>('');
  const [childActionList, setChildActionList] = useState<ActionResponse[]>([]);
  const [isFlatListScrollable, setIsFlatListScrollable] = useState(true);

  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [selectedItemId, setSelectedItemId] = useState<string>('');
  const [adultActionInput, setAdultActionInput] = useState<string>('');
  const [selectedChildAction, setSelectedChildAction] = useState<ActionResponse | null>(null);

  // API Hooks
  const { executeAddChildAction, executeDeleteChildAction } = useChildActionApi();
  const { executeAddAdultAction, executeDeleteAdultAction } = useAdultActionApi();

  // 날짜 포맷 함수
  function formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  const [selectedDate, setSelectedDate] = useState<string>(formatDate(new Date()));

  // Animated 값
  const currentPosition = useSharedValue(LAYOUT_HEIGHTS.INITIAL_LIST_POSITION);
  const BASE_URL = Constants.expoConfig?.extra?.BASE_URL ?? '';

  // 예시: 공용 API 훅
  const { data, execute } = useApiGeneric<{ content: ActionContent }, ApiResponse<ActionResponse>>({
    condition: true,
    method: 'POST',
    url: `${BASE_URL}/action/child`
  });

  const { data: adultData, execute: adultExecute } = useApiGeneric<AddAdultActionRequest, ApiResponse<ActionResponse>>({
    condition: true,
    method: 'POST',
    url: `${BASE_URL}/action/{childActionId}/adult`
  });

  const { data: dateData, execute: dateExecute } = useApiGeneric<null, ApiResponse<ActionResponse[]>>({
    condition: true,
    method: 'GET',
    url: `${BASE_URL}/action?date=${selectedDate}`
  });

  const { execute: executeDeleteChild } = useApiGeneric<null, DeleteResponse>({
    condition: true,
    method: 'DELETE',
    url: `${BASE_URL}/action/child`
  });

  const { execute: executeDeleteAdult } = useApiGeneric<null, DeleteResponse>({
    condition: true,
    method: 'DELETE',
    url: `${BASE_URL}/action/{childActionId}/adult/{adultActionId}`
  });

  // 날짜 바뀔 때마다 데이터 로드
  useEffect(() => {
    (async () => {
      await dateExecute();
    })();
  }, [selectedDate]);

  // dateData 불러오면 리스트 갱신
  useEffect(() => {
    if (dateData?.data) {
      setChildActionList(dateData.data);
    }
  }, [dateData]);

  // ────────────────────────────────────────────────
  //   PanResponder: 수직 스와이프만 부모가 처리
  // ────────────────────────────────────────────────
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (
        evt: GestureResponderEvent,
        gestureState: PanResponderGestureState
      ) => {
        const dx = Math.abs(gestureState.dx);
        const dy = Math.abs(gestureState.dy);
        // 수직 이동이 더 크고, 일정 픽셀(예: 10) 이상일 때만 부모에서 스와이프 처리
        return dy > 10 && dy > dx;
      },
      onPanResponderGrant: () => {
        setIsFlatListScrollable(false);
      },
      onPanResponderMove: (evt: GestureResponderEvent, gestureState: PanResponderGestureState) => {
        const newPos = currentPosition.value + gestureState.dy;
        currentPosition.value = Math.max(0, Math.min(SCREEN_HEIGHT, newPos));
      },
      onPanResponderRelease: (evt: GestureResponderEvent, gestureState: PanResponderGestureState) => {
        setIsFlatListScrollable(true);
        if (gestureState.dy < -50) {
          // 위로 크게 스와이프
          currentPosition.value = withTiming(0);
        } else if (gestureState.dy > 50) {
          // 아래로 크게 스와이프
          currentPosition.value = withTiming(LAYOUT_HEIGHTS.INITIAL_LIST_POSITION);
        } else {
          // 중간쯤
          currentPosition.value = withTiming(
            currentPosition.value < LAYOUT_HEIGHTS.INITIAL_LIST_POSITION / 2
              ? 0
              : LAYOUT_HEIGHTS.INITIAL_LIST_POSITION
          );
        }
      },
    })
  ).current;

  // 아이 행동 추가
  const addChildAction = async () => {
    if (childActionContent.trim() !== '') {
      try {
        await execute({ content: { text: childActionContent, imageUrl: null } });
      } catch (err) {
        console.error('감사 내용 전송 오류:', err);
      }
    }
  };

  // 아이 행동 성공적으로 추가되면 리스트에 prepend
  useEffect(() => {
    if (data?.data) {
      const newChildAction = data.data;
      setChildActionList(prev => [newChildAction, ...prev]);
      setChildActionContent('');
    }
  }, [data]);

  // 아이템 롱프레스 -> 칭찬 모달 열기
  const handleLongPressItem = (item: ActionResponse) => {
    setSelectedItemId(item.id.toString());
    setSelectedChildAction(item);
    setModalVisible(true);
  };

  // 어른 칭찬 추가
  const addAdultAction = async () => {
    if (adultActionInput.trim() !== '' && selectedChildAction) {
      try {
        const response = await executeAddAdultAction(
          { content: { text: adultActionInput, imageUrl: null }, actionId: selectedChildAction.id },
          `${BASE_URL}/action/${selectedChildAction.id}/adult`
        );
        if (response?.data) {
          const newAdultAction = response.data;
          setSelectedChildAction(prev =>
            prev
              ? {
                  ...prev,
                  responses: [...(prev.responses || []), newAdultAction],
                }
              : null
          );
          setChildActionList(prevList =>
            prevList.map(item =>
              item.id === selectedChildAction.id
                ? { ...item, responses: [...(item.responses || []), newAdultAction] }
                : item
            )
          );
        }
        setAdultActionInput('');
      } catch (error) {
        console.error('칭찬 내용 전송 오류:', error);
      }
    }
  };

  // adultData가 변경되면 반영 (주의: 실제론 executeAddAdultAction를 따로 쓰면 중복될 수 있어 생략 가능)
  useEffect(() => {
    if (adultData?.data) {
      // 이 로직은 이미 addAdultAction 안에 들어있으면 중복될 수 있으므로 상황 따라 삭제 가능
      const adultActionData = adultData.data;
      setChildActionList(prev =>
        prev.map(item => {
          if (item.id === parseInt(selectedItemId, 10)) {
            return {
              ...item,
              responses: [...(item.responses || []), adultActionData],
            };
          }
          return item;
        })
      );
      setAdultActionInput('');
    }
  }, [adultData]);

  // 칭찬 모달 완료
  const completePraise = async () => {
    if (adultActionInput.trim() !== '') {
      try {
        await addAdultAction();
      } catch (err) {
        console.error('칭찬 내용을 전송하는 중 문제가 발생했습니다:', err);
      }
    }
    setModalVisible(false);
    setAdultActionInput('');
    setSelectedItemId('');
  };

  // 아동 행동 삭제
  const handleDeleteChildAction = async (id: number) => {
    try {
      await executeDeleteChildAction(null, `${BASE_URL}/action/child/${id}`);
      setChildActionList(prev => prev.filter(item => item.id !== id));
    } catch (error) {
      console.error('아동 행동 삭제 실패:', error);
      Alert.alert('삭제 실패', '다시 시도해주세요.');
    }
  };

  // 어른 행동 삭제
  const handleDeleteAdultAction = async (childActionId: number, adultActionId: number) => {
    try {
      await executeDeleteAdultAction(null, `${BASE_URL}/action/${childActionId}/adult/${adultActionId}`);
      setSelectedChildAction(prev =>
        prev
          ? {
              ...prev,
              responses: prev.responses?.filter(r => r.id !== adultActionId) || [],
            }
          : null
      );
      setChildActionList(prev =>
        prev.map(item =>
          item.id === childActionId
            ? {
                ...item,
                responses: item.responses?.filter(r => r.id !== adultActionId) || [],
              }
            : item
        )
      );
    } catch (error) {
      console.error('어른 행동 삭제 실패:', error);
      Alert.alert('삭제 실패', '다시 시도해주세요.');
    }
  };

  // 하단 패널 애니메이션
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: currentPosition.value }],
  }));

  // 리스트 패딩
  const screenHeight = Dimensions.get('window').height;
  const bottomPadding = insets.bottom + screenHeight * 0.3;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* 상단 */}
        <View style={styles.mainScreen}>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.mainContent}>
              <View style={styles.topPadding} />
              <View style={styles.speechBubbleContainer}>
                <SpeechBubble
                  title="오늘은 이런 점이 감사했어요"
                  placeholder="아이 입장에서 감사를 들려주세요"
                  value={childActionContent}
                  onChangeText={setChildActionContent}
                  onPress={addChildAction}
                  buttonText="어른인 내게 감사 들려주기"
                />
              </View>
              <View style={styles.avatarContainer}>
                <Image
                  source={require('@/assets/images/avatar-girl-transparent.png')}
                  style={styles.avatarImage}
                />
              </View>
              <View style={styles.spacer} />
            </View>
          </TouchableWithoutFeedback>
        </View>

        {/* 하단 슬라이드 영역 */}
        <Animated.View style={[styles.childActionListScreen, animatedStyle]}>
          <View style={styles.swipeBarContainer} {...panResponder.panHandlers}>
            <View style={styles.swipeBar} />
          </View>

          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.listContent}>
              <Text style={[styles.childActionListTitle, CommonStyles.heading2]}>
                감사를 <Text style={styles.emphasizedText}>꾹 눌러</Text> 칭찬해 주기
              </Text>
              <ChildActionList
                childActionList={childActionList}
                isFlatListScrollable={isFlatListScrollable}
                onLongPressItem={handleLongPressItem}
                onDeleteItem={handleDeleteChildAction}
                contentContainerStyle={{ paddingBottom: bottomPadding }}
              />
            </View>
          </TouchableWithoutFeedback>
        </Animated.View>
      </View>

      {/* 칭찬 모달 */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <FlatList
                  ListHeaderComponent={() => (
                    <>
                      <View style={styles.selectedActionContainer}>
                        <Text style={styles.selectedActionLabel}>아이가 들려준 감사에요</Text>
                        <Text style={styles.selectedActionContent}>
                          {selectedChildAction?.content.text}
                        </Text>
                      </View>

                      {selectedChildAction?.responses && selectedChildAction.responses.length > 0 && (
                        <View style={styles.existingActionsContainer}>
                          <Text style={styles.existingActionsLabel}>받은 칭찬들</Text>
                          <AdultActionList
                            actions={selectedChildAction.responses}
                            childActionId={selectedChildAction.id}
                            onDeleteItem={(adultActionId) =>
                              handleDeleteAdultAction(selectedChildAction.id, adultActionId)
                            }
                            isFlatListScrollable={true}
                            contentContainerStyle={{ paddingBottom: 150 }}
                          />
                        </View>
                      )}
                    </>
                  )}
                  data={[]}
                  renderItem={null}
                  style={{ flex: 1 }}
                  contentContainerStyle={{ padding: 20, paddingBottom: 200 }}
                  showsVerticalScrollIndicator={false}
                />

                <View style={styles.modalBottomContainer}>
                  <View style={styles.adultActionInputContainer}>
                    <TextInput
                      style={styles.adultActionTextInput}
                      placeholder="어른인 내가 칭찬을 해줘요"
                      value={adultActionInput}
                      onChangeText={setAdultActionInput}
                      multiline
                      textAlignVertical="top"
                    />
                    <TouchableOpacity style={styles.addButton} onPress={addAdultAction}>
                      <AntDesign name="pluscircleo" size={30} color="black" />
                    </TouchableOpacity>
                  </View>

                  <TouchableOpacity style={styles.completeButton} onPress={completePraise}>
                    <Text style={[styles.buttonText, CommonStyles.button]}>완료</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  container: { flex: 1 },
  mainScreen: { flex: 1, backgroundColor: '#fff' },
  mainContent: { flex: 1 },
  topPadding: { height: LAYOUT_HEIGHTS.TOP_PADDING },
  speechBubbleContainer: {
    height: LAYOUT_HEIGHTS.SPEECH_BUBBLE,
    justifyContent: 'center',
  },
  avatarContainer: {
    height: LAYOUT_HEIGHTS.AVATAR,
    width: SCREEN_WIDTH * 0.6,
    alignSelf: 'center',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  spacer: { height: LAYOUT_HEIGHTS.SPACER },

  childActionListScreen: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: SCREEN_HEIGHT,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
  swipeBarContainer: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  swipeBar: {
    width: 50,
    height: 5,
    backgroundColor: '#ccc',
    borderRadius: 2.5,
  },
  listContent: { flex: 1 },
  childActionListTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 10,
    alignSelf: 'center',
    fontFamily: FontFamily.bold,
  },
  emphasizedText: {
    color: '#FF69B4',
    fontFamily: FontFamily.bold,
  },

  // 모달
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 15,
    width: '90%',
    height: '70%',
    paddingTop: 20,
    overflow: 'hidden',
    position: 'relative',
  },
  modalBottomContainer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: '#fff',
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
    width: '100%',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  adultActionInputContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    gap: 10,
  },
  adultActionTextInput: {
    flex: 1,
    minHeight: 40,
    maxHeight: 80,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    backgroundColor: '#fff',
    fontFamily: FontFamily.regular,
  },
  addButton: {
    padding: 5,
  },
  completeButton: {
    backgroundColor: '#000',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignSelf: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: FontFamily.medium,
  },
  selectedActionContainer: {
    width: '100%',
    marginBottom: 15,
    padding: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  selectedActionLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
    fontFamily: FontFamily.medium,
  },
  selectedActionContent: {
    fontSize: 16,
    color: '#000',
    fontFamily: FontFamily.regular,
  },
  existingActionsContainer: {
    width: '100%',
    marginBottom: 15,
    padding: 15,
    backgroundColor: '#FFF0F5',
    borderRadius: 8,
    flex: 1,
  },
  existingActionsLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    fontFamily: FontFamily.medium,
  },
});

export default HomeScreen;