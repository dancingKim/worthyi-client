// (tabs)/HomeScreen.tsx
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
    Animated,
    PanResponder,
    Dimensions,
    Modal,
    Alert,
    ScrollView,
    FlatList
} from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { useApiGeneric } from '@/hooks/api/useApiGeneric';
import Constants from 'expo-constants';
import SpeechBubble from '@/components/SpeechBubble';
import ChildActionList from '@/components/ChildActionList';
import {
    ChildActionItem,
    ApiResponse,
    ActionResponse,
    AdultActionResponse,
    AddAdultActionRequest
} from '@/types/types';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CommonStyles } from '@/constants/Styles';
import { FontFamily } from '@/constants/Fonts';

const BASE_URL = Constants.expoConfig?.extra?.BASE_URL;
const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;
const INITIAL_POSITION = SCREEN_HEIGHT * 0.6;
interface DateResponse extends ApiResponse<ActionResponse[]> {}


export default function HomeScreen() {
    const insets = useSafeAreaInsets();
    const [childActionContent, setChildActionContent] = useState<string>('');
    const [childActionList, setChildActionList] = useState<ChildActionItem[]>([]);
    const [isFlatListScrollable, setIsFlatListScrollable] = useState(true);

    const [modalVisible, setModalVisible] = useState<boolean>(false);
    const [selectedItemId, setSelectedItemId] = useState<string>('');
    const [adultActionInput, setAdultActionInput] = useState<string>('');
    const [selectedChildAction, setSelectedChildAction] = useState<ChildActionItem | null>(null);

    // 날짜 포맷 함수 예시
    function formatDate(date: Date): string {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0'); // 월 0부터 시작
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    const [selectedDate, setSelectedDate] = useState<string>(formatDate(new Date())); // 예: 기본 날짜

    const animatedValue = useRef(new Animated.Value(INITIAL_POSITION)).current;
    const currentPosition = useRef(INITIAL_POSITION);
    const BASE_URL = Constants.expoConfig?.extra?.BASE_URL;

    const { data, isLoading, error, execute } = useApiGeneric<{ childActionContent: string }, ApiResponse<ActionResponse>>({
        condition: true,
        method: 'POST',
        url: `${BASE_URL}/action/child`
    });

    const { data: adultData, isLoading: adultIsLoading, error: adultError, execute: adultExecute } = useApiGeneric<AddAdultActionRequest, ApiResponse<AdultActionResponse>>({
        condition: true,
        method: 'POST',
        url: `${BASE_URL}/action/adult`
    });

    const { data: dateData, isLoading: dateLoading, error: dateError, execute: dateExecute } = useApiGeneric<null, DateResponse>({
        condition: true,
        method: 'GET',
        url: `${BASE_URL}/action?date=${selectedDate}`
    });

    useEffect(() => {
        // selectedDate가 변경될 때마다 해당 날짜의 데이터를 fetch
        (async () => {
            await dateExecute();
        })();
    }, [selectedDate]);

    useEffect(() => {
        if (dateData && dateData.data) {
            const actionList: ChildActionItem[] = dateData.data.map(item => ({
                id: item.childActionId.toString(),
                childActionContent: item.childActionContent,
                // adultActions: AdultActionDto.Response[] -> string[]
                adultActions: item.adultActions.map(a => a.adultActionContent)
            }));
            setChildActionList(actionList);
        }
    }, [dateData]);

    useEffect(() => {
        if (dateError) {
            console.error('데이터 로딩 오류:', dateError);
        }
    }, [dateError]);

    useEffect(() => {
        const listenerId = animatedValue.addListener(({ value }) => {
            currentPosition.current = value;
        });
        return () => {
            animatedValue.removeListener(listenerId);
        };
    }, [animatedValue]);

    const panResponder = useRef(
        PanResponder.create({
            onMoveShouldSetPanResponderCapture: (_, gestureState) => false,
            onMoveShouldSetPanResponder: (_, gestureState) => {
                return Math.abs(gestureState.dy) > 10;
            },
            onPanResponderGrant: () => {
                setIsFlatListScrollable(false);
            },
            onPanResponderMove: (_, gestureState) => {
                const newValue = currentPosition.current + gestureState.dy;
                if (newValue >= 0 && newValue <= SCREEN_HEIGHT) {
                    animatedValue.setValue(newValue);
                }
            },
            onPanResponderRelease: (_, gestureState) => {
                setIsFlatListScrollable(true);
                const finalPosition = currentPosition.current;

                if (gestureState.dy < -50) {
                    animateToPosition(0);
                } else if (gestureState.dy > 50) {
                    animateToPosition(INITIAL_POSITION);
                } else {
                    const destination =
                        finalPosition < INITIAL_POSITION / 2 ? 0 : INITIAL_POSITION;
                    animateToPosition(destination);
                }
            },
        })
    ).current;

    const animateToPosition = (position: number) => {
        Animated.timing(animatedValue, {
            toValue: position,
            duration: 300,
            useNativeDriver: false,
        }).start(() => {
            currentPosition.current = position;
        });
    };

    const addChildAction = async () => {
        if (childActionContent.trim() !== '') {
            try {
                await execute({ childActionContent: childActionContent });
            } catch (err) {
                console.error('감사 내용 전송 오류:', err);
            }
        }
    };

    const handleLongPressItem = (item: ChildActionItem) => {
        setSelectedItemId(item.id);
        setSelectedChildAction(item);
        setModalVisible(true);
    };

    const addAdultAction = async () => {
        if (adultActionInput.trim() !== '' && selectedItemId.trim() !== '') {
            const childActionIdNum = parseInt(selectedItemId, 10);

            if (isNaN(childActionIdNum)) {
                console.error('유효하지 않은 아동 행동 ID');
                return;
            }

            try {
                await adultExecute({
                    adultActionContent: adultActionInput,
                    childActionId: childActionIdNum
                });
                
                // 로컬 상태 업데이트
                if (selectedChildAction) {
                    setSelectedChildAction({
                        ...selectedChildAction,
                        adultActions: [...selectedChildAction.adultActions, adultActionInput]
                    });
                }
                setAdultActionInput(''); // 입력 필드 초기화
            } catch (err) {
                console.error('칭찬 내용 전송 오류:', err);
            }
        }
    };

    useEffect(() => {
        if (data && data.data) {
            const childActionData = data.data;
            const newChildAction: ChildActionItem = {
                id: childActionData.childActionId.toString(),
                childActionContent: childActionData.childActionContent,
                adultActions: []
            };
            setChildActionList(prevList => [newChildAction, ...prevList]);
            setChildActionContent('');
        }
    }, [data]);

    useEffect(() => {
        if (adultData && adultData.data) {
            const adultActionData = adultData.data;
            setChildActionList(prevList => prevList.map(item => {
                if (item.id === adultActionData.childActionId.toString()) {
                    return {
                        ...item,
                        adultActions: [...item.adultActions, adultActionData.adultActionContent]
                    };
                }
                return item;
            }));
            setAdultActionInput('');
        }
    }, [adultData]);

    const completePraise = async () => {
        if (adultActionInput.trim() !== '') {
            try {
                await addAdultAction();
            } catch (err) {
                Alert.alert('오류', '칭찬 내용을 전송하는 중 문제가 발생했습니다.');
                return;
            }
        }
        
        setModalVisible(false);
        setAdultActionInput('');
        setSelectedItemId('');
    };

    // 화면 크기에 따른 동적 패딩 계산
    const screenHeight = Dimensions.get('window').height;
    const bottomPadding = insets.bottom + (screenHeight * 0.3); // 화면 높이의 12% 정도를 패딩으로 설정

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                style={styles.container}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
            >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
                    <View style={styles.mainScreen}>
                        <View style={styles.contentContainer}>
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
                                    source={require('@/assets/images/avatar-girl.jpeg')}
                                    style={styles.avatarImage}
                                />
                            </View>

                            <View style={styles.spacer} />
                        </View>
                    </View>
                </TouchableWithoutFeedback>

                <Animated.View
                    style={[
                        styles.childActionListScreen,
                        {
                            transform: [
                                {
                                    translateY: animatedValue.interpolate({
                                        inputRange: [0, INITIAL_POSITION],
                                        outputRange: [0, INITIAL_POSITION],
                                        extrapolate: 'clamp',
                                    }),
                                },
                            ],
                        },
                    ]}
                >
                    <View style={styles.swipeBarContainer} {...panResponder.panHandlers}>
                        <View style={styles.swipeBar}></View>
                    </View>
                    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
                        <View>
                            <Text style={[styles.childActionListTitle, CommonStyles.heading2]}>
                                감사를 <Text style={styles.emphasizedText}>꾹 눌러</Text> 칭찬해 주기
                            </Text>
                            <ChildActionList
                                childActionList={childActionList}
                                isFlatListScrollable={isFlatListScrollable}
                                onLongPressItem={handleLongPressItem}
                                contentContainerStyle={{paddingBottom: bottomPadding}}
                            />
                        </View>
                    </TouchableWithoutFeedback>
                </Animated.View>
            </KeyboardAvoidingView>

            <Modal
                visible={modalVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setModalVisible(false)}
            >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
                    <View style={styles.modalBackground}>
                        <View style={styles.modalContainer}>
                            <Text style={[styles.modalTitle, CommonStyles.heading2]}>내가 칭찬해줄게</Text>
                            
                            <View style={styles.selectedActionContainer}>
                                <Text style={styles.selectedActionLabel}>아이가 들려준 감사에요</Text>
                                <Text style={styles.selectedActionContent}>
                                    {selectedChildAction?.childActionContent}
                                </Text>
                            </View>

                            {selectedChildAction?.adultActions && selectedChildAction.adultActions.length > 0 && (
                                <View style={styles.existingActionsContainer}>
                                    <Text style={styles.existingActionsLabel}>칭찬 해줄게</Text>
                                    <Text style={styles.existingActionContent}>
                                        {selectedChildAction.adultActions.map((action, index) => (
                                            <Text key={index}>
                                                {action}
                                                {index < selectedChildAction.adultActions.length - 1 ? ' • ' : ''}
                                            </Text>
                                        ))}
                                    </Text>
                                </View>
                            )}

                            <View style={styles.adultActionInputContainer}>
                                <TextInput
                                    style={styles.adultActionTextInput}
                                    placeholder="어른인 내가 칭찬을 해줘요"
                                    value={adultActionInput}
                                    onChangeText={setAdultActionInput}
                                    multiline
                                    textAlignVertical="top"
                                />
                                <TouchableOpacity 
                                    style={styles.addButton} 
                                    onPress={addAdultAction}
                                >
                                    <AntDesign name="pluscircleo" size={30} color="black" />
                                </TouchableOpacity>
                            </View>
                            
                            <TouchableOpacity 
                                style={styles.completeButton} 
                                onPress={() => setModalVisible(false)}
                            >
                                <Text style={[styles.buttonText, CommonStyles.button]}>완료</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    mainScreen: {
        flex: 1,
        backgroundColor: '#fff',
    },
    contentContainer: {
        flex: 1,
    },
    topPadding: {
        height: SCREEN_HEIGHT * 0.03,
    },
    speechBubbleContainer: {
        height: SCREEN_HEIGHT * 0.25,
        justifyContent: 'center',
        zIndex: 2,
    },
    avatarContainer: {
        height: SCREEN_HEIGHT * 0.35,
        width: SCREEN_WIDTH * 0.6,
        alignSelf: 'center',
        zIndex: 1,
    },
    avatarImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'contain',
    },
    spacer: {
        height: SCREEN_HEIGHT * 0.37,
    },
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
    childActionListTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginVertical: 10,
        alignSelf: 'center',
        fontFamily: FontFamily.bold,
    },
    modalBackground: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        backgroundColor: '#fff',
        borderRadius: 15,
        padding: 20,
        width: '90%',
        maxHeight: '80%',
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 18,
        marginBottom: 10,
        fontFamily: FontFamily.medium,
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
    emphasizedText: {
        color: '#FF69B4',
        fontFamily: FontFamily.bold,
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
    },
    existingActionsLabel: {
        fontSize: 14,
        color: '#666',
        marginBottom: 8,
        fontFamily: FontFamily.medium,
    },
    existingActionContent: {
        fontSize: 14,
        color: '#333',
        lineHeight: 20,
        fontFamily: FontFamily.regular,
    },
});