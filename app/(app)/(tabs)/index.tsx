// src/screens/HomeScreen.tsx
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
  FlatList,
  GestureResponderEvent,
  PanResponderGestureState,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { useAnimatedStyle, withTiming, useSharedValue } from 'react-native-reanimated';
import { AntDesign } from '@expo/vector-icons';
import Constants from 'expo-constants';

import { ChildActionList } from '@/components/ChildActionList';
import { AdultActionList } from '@/components/AdultActionList';
import SpeechBubble from '@/components/SpeechBubble';

import {
  ApiResponse,
  ActionResponse,
  ActionContent,
  AddAdultActionRequest,
} from '@/types/types';
import { useApiGeneric } from '@/hooks/api/useApiGeneric';
import { useChildActionApi } from '@/hooks/api/useChildActionApi';
import { useAdultActionApi } from '@/hooks/api/useAdultActionApi';

import { CommonStyles } from '@/constants/Styles';
import { FontFamily } from '@/constants/Fonts';
import { useAuth } from '@/context/AuthContext';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;

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

export default function HomeScreen() {
  console.log('Home screen rendering');
  const insets = useSafeAreaInsets();
  const [childActionContent, setChildActionContent] = useState('');
  const [childActionList, setChildActionList] = useState<ActionResponse[]>([]);
  const [isFlatListScrollable, setIsFlatListScrollable] = useState(true);

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<string>('');
  const [adultActionInput, setAdultActionInput] = useState<string>('');
  const [selectedChildAction, setSelectedChildAction] = useState<ActionResponse | null>(null);

  const currentPosition = useSharedValue(LAYOUT_HEIGHTS.INITIAL_LIST_POSITION);
  const BASE_URL = Constants.expoConfig?.extra?.BASE_URL ?? '';

  // API Hooks
  const { executeAddChildAction, executeDeleteChildAction } = useChildActionApi();
  const { executeAddAdultAction, executeDeleteAdultAction } = useAdultActionApi();

  // 날짜 형식
  function formatDate(date: Date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
  const [selectedDate, setSelectedDate] = useState<string>(formatDate(new Date()));

  const {isLoggedIn} = useAuth();

  // 예: GET /action?date=xxxx
  const { data: dateData, execute: dateExecute } = useApiGeneric<null, ApiResponse<ActionResponse[]>>({
    condition: isLoggedIn,
    method: 'GET',
    url: `${BASE_URL}/action?date=${selectedDate}`,
  });

  // POST child
  const { data, execute: childExecute } = useApiGeneric<{ content: ActionContent }, ApiResponse<ActionResponse>>({
    condition: true,
    method: 'POST',
    url: `${BASE_URL}/action/child`,
  });

  // POST adult
  const { data: adultData, execute: adultExecute } = useApiGeneric<AddAdultActionRequest, ApiResponse<ActionResponse>>({
    condition: true,
    method: 'POST',
    url: `${BASE_URL}/action/{childActionId}/adult`,
  });

  // 날짜 바뀔 때마다 GET
  useEffect(() => {
    if (isLoggedIn) {
    (async () => {
      await dateExecute();
    })();
  }
  }, [selectedDate]);

  // dateData -> 리스트
  useEffect(() => {
    if (dateData?.data) {
      setChildActionList(dateData.data);
    }
  }, [dateData]);

  // PanResponder: 안드로이드 충돌 방지
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_evt: GestureResponderEvent, gestureState: PanResponderGestureState) => {
        const dx = Math.abs(gestureState.dx);
        const dy = Math.abs(gestureState.dy);
        // 수직 드래그가 훨씬 크고 10px 이상
        if (dy > dx && dy > 10) {
          return true;
        }
        return false;
      },
      onPanResponderGrant: () => {
        setIsFlatListScrollable(false);
      },
      onPanResponderMove: (_evt, gestureState) => {
        const newPos = currentPosition.value + gestureState.dy;
        currentPosition.value = Math.max(0, Math.min(SCREEN_HEIGHT, newPos));
      },
      onPanResponderRelease: (_evt, gestureState) => {
        setIsFlatListScrollable(true);
        if (gestureState.dy < -50) {
          currentPosition.value = withTiming(0);
        } else if (gestureState.dy > 50) {
          currentPosition.value = withTiming(LAYOUT_HEIGHTS.INITIAL_LIST_POSITION);
        } else {
          currentPosition.value = withTiming(
            currentPosition.value < LAYOUT_HEIGHTS.INITIAL_LIST_POSITION / 2 ? 0 : LAYOUT_HEIGHTS.INITIAL_LIST_POSITION
          );
        }
      },
    })
  ).current;

  // Child 추가
  const addChildAction = async () => {
    if (!childActionContent.trim()) return;
    try {
      await childExecute({ content: { text: childActionContent, imageUrl: null } });
    } catch (error) {
      console.error('addChildAction error:', error);
    }
  };

  // Child 액션 성공 시 추가
  useEffect(() => {
    if (data?.data) {
      const newChild = data.data;
      setChildActionList((prev) => [newChild, ...prev]);
      setChildActionContent('');
    }
  }, [data]);

  // Adult 추가
  const addAdultAction = async () => {
    if (!adultActionInput.trim() || !selectedChildAction) return;
    try {
      const resp = await adultExecute(
        {
          content: { text: adultActionInput, imageUrl: null },
          actionId: selectedChildAction.id,
        },
        `${BASE_URL}/action/${selectedChildAction.id}/adult`
      );
      if (resp?.data) {
        const newAdult = resp.data;
        setSelectedChildAction((prev: ActionResponse | null) =>
          prev ? { ...prev, responses: [...(prev.responses || []), newAdult] } : null
        );
        setChildActionList((prevList) =>
          prevList.map((item) =>
            item.id === selectedChildAction.id
              ? { ...item, responses: [...(item.responses || []), newAdult] }
              : item
          )
        );
      }
      setAdultActionInput('');
    } catch (err) {
      console.error('addAdultAction error:', err);
    }
  };

  // adultData -> 이미 addAdultAction 안에서 처리
  useEffect(() => {
    if (adultData?.data) {
      setAdultActionInput('');
    }
  }, [adultData]);

  // 아이템 롱프레스 -> 모달
  const handleLongPressItem = (item: ActionResponse) => {
    setSelectedItemId(String(item.id));
    setSelectedChildAction(item);
    setModalVisible(true);
  };

  // 모달 완료
  const completePraise = async () => {
    if (adultActionInput.trim()) {
      await addAdultAction();
    }
    setModalVisible(false);
    setAdultActionInput('');
    setSelectedItemId('');
  };

  const handleDeleteChildAction = async (id: number) => {
    try {
      await executeDeleteChildAction(null, `${BASE_URL}/action/child/${id}`);
      setChildActionList(prev => prev.filter(item => item.id !== id));
    } catch (error) {
      console.error('아동 행동 삭제 실패:', error);
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
    }
  };
        

  // 애니메이션 스타일
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: currentPosition.value }],
  }));

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* 상단 영역 */}
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

        {/* 하단 슬라이드: ChildActionList */}
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
                onDeleteItem={async (childId) => {
                  try {
                    await executeDeleteChildAction(null, `${BASE_URL}/action/child/${childId}`);
                    setChildActionList(prev => prev.filter(item => item.id !== childId));
                  } catch (error) {
                    console.error('Child action delete failed:', error);
                  }
                }}
                contentContainerStyle={{ paddingBottom: 120 }}
              />
            </View>
          </TouchableWithoutFeedback>
        </Animated.View>
      </View>

      {/* 모달: AdultActionList */}
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
                        <Text style={styles.selectedActionLabel}>
                          아이가 들려준 감사에요
                        </Text>
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
                            onDeleteItem={(adultId) => {
                              handleDeleteAdultAction(selectedChildAction.id, adultId);
                              console.log('delete adult', adultId);
                            }}
                            isFlatListScrollable={true}
                            contentContainerStyle={{ paddingBottom: 100 }}
                          />
                        </View>
                      )}
                    </>
                  )}
                  data={[]} // 실 데이터를 FlatList로 표시할게 없으면 빈 배열
                  renderItem={null}
                  style={{ flex: 1 }}
                  contentContainerStyle={{ padding: 20, paddingBottom: 180 }}
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
                      returnKeyType="send"
                      onKeyPress={({nativeEvent}) => {
                        if (nativeEvent.key === 'Enter') {
                          addAdultAction();
                        }
                      }}
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
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  container: { flex: 1 },
  mainScreen: { flex: 1, backgroundColor: '#fff' },
  mainContent: { flex: 1 },
  topPadding: { height: LAYOUT_HEIGHTS.TOP_PADDING },
  speechBubbleContainer: { height: LAYOUT_HEIGHTS.SPEECH_BUBBLE, justifyContent: 'center' },
  avatarContainer: {
    height: LAYOUT_HEIGHTS.AVATAR,
    width: SCREEN_WIDTH * 0.6,
    alignSelf: 'center',
  },
  avatarImage: { width: '100%', height: '100%', resizeMode: 'contain' },
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

  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    width: '100%',
    height: '80%',
    paddingTop: 25,
    overflow: 'hidden',
    position: 'relative',
  },
  modalBottomContainer: {
    padding: 20,
    borderTopWidth: 0.5,
    borderTopColor: '#e0e0e0',
    backgroundColor: '#fff',
    width: '100%',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 5,
  },
  adultActionInputContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
    gap: 12,
  },
  adultActionTextInput: {
    flex: 1,
    minHeight: 45,
    maxHeight: 80,
    borderColor: '#e8e8e8',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    backgroundColor: '#fafafa',
    fontFamily: FontFamily.regular,
    fontSize: 15,
  },
  addButton: {
    padding: 8,
  },
  completeButton: {
    backgroundColor: '#FF69B4',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignSelf: 'center',
    shadowColor: '#FF69B4',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: FontFamily.medium,
  },
  selectedActionContainer: {
    width: '100%',
    marginBottom: 20,
    padding: 16,
    backgroundColor: '#f8f8f8',
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  selectedActionLabel: {
    fontSize: 14,
    color: '#888',
    marginBottom: 8,
    fontFamily: FontFamily.medium,
  },
  selectedActionContent: {
    fontSize: 16,
    color: '#333',
    fontFamily: FontFamily.regular,
    lineHeight: 22,
  },
  existingActionsContainer: {
    width: '100%',
    marginBottom: 15,
    padding: 18,
    backgroundColor: '#FFF5F9',
    borderRadius: 15,
    flex: 1,
  },
  existingActionsLabel: {
    fontSize: 14,
    color: '#777',
    marginBottom: 10,
    fontFamily: FontFamily.medium,
  },
});