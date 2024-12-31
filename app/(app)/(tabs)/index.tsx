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
            Alert.alert('오류', '해당 날짜의 감사 목록을 불러오는 중 오류가 발생했습니다.');
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
                Alert.alert('오류', '감사 내용을 전송하는 중 문제가 발생했습니다.');
            }
        }
    };

    const handleLongPressItem = (item: ChildActionItem) => {
        setSelectedItemId(item.id);
        setModalVisible(true);
    };

    const addAdultAction = async () => {
        if (adultActionInput.trim() !== '' && selectedItemId.trim() !== '') {
            const childActionIdNum = parseInt(selectedItemId, 10);

            if (isNaN(childActionIdNum)) {
                Alert.alert('오류', '선택된 아동 행동 ID가 유효하지 않습니다.');
                return;
            }

            try {
                // 백엔드에 adultActionContent 및 childActionId 데이터 전송
                await adultExecute({
                    adultActionContent: adultActionInput,
                    childActionId: childActionIdNum
                });
            } catch (err) {
                Alert.alert('오류', '칭찬 내용을 전송하는 중 문제가 발생했습니다.');
            }
        } else {
            Alert.alert('오류', '칭찬 내용과 아동 행동을 선택해주세요.');
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
                            <View style={styles.adultActionInputContainer}>
                                <TextInput
                                    style={styles.adultActionTextInput}
                                    placeholder="어른인 내가 칭찬을 해줘요"
                                    value={adultActionInput}
                                    onChangeText={setAdultActionInput}
                                    multiline
                                    textAlignVertical="top"
                                    scrollEnabled={true}
                                    editable={true}
                                    keyboardType="default"
                                />
                                <TouchableOpacity onPress={addAdultAction}>
                                    <AntDesign name="pluscircleo" size={30} color="black" />
                                </TouchableOpacity>
                            </View>
                            <TouchableOpacity style={styles.button} onPress={completePraise}>
                                <Text style={[styles.buttonText, CommonStyles.button]}>칭찬 완료</Text>
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
        height: '3%',
    },
    speechBubbleContainer: {
        height: '25%',
        justifyContent: 'center',
        zIndex: 2,
    },
    avatarContainer: {
        height: '35%',
        width: '60%',
        alignSelf: 'center',
        zIndex: 1,
    },
    avatarImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'contain',
    },
    spacer: {
        height: '37%',
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
        width: '80%',
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 18,
        marginBottom: 10,
        fontFamily: FontFamily.medium,
    },
    adultActionInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
    },
    adultActionTextInput: {
        flex: 1,
        minHeight: 40,
        maxHeight: 80,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 10,
        backgroundColor: '#fff',
        textAlignVertical: 'top',
        marginRight: 10,
        fontFamily: FontFamily.regular,
    },
    button: {
        backgroundColor: '#000',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
        marginTop: 5,
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
});