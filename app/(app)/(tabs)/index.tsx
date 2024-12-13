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
    KeyboardAvoidingView,
    Animated,
    PanResponder,
    Dimensions,
    Modal,
    Alert
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

const BASE_URL = Constants.expoConfig?.extra?.BASE_URL;
const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;
const INITIAL_POSITION = SCREEN_HEIGHT * 0.6;

export default function HomeScreen() {
    const [childActionContent, setChildActionContent] = useState<string>('');
    const [childActionList, setChildActionList] = useState<ChildActionItem[]>([]);
    const [isFlatListScrollable, setIsFlatListScrollable] = useState(true);

    const [modalVisible, setModalVisible] = useState<boolean>(false);
    const [selectedItemId, setSelectedItemId] = useState<string>('');
    const [adultActionInput, setAdultActionInput] = useState<string>('');

    const animatedValue = useRef(new Animated.Value(INITIAL_POSITION)).current;
    const currentPosition = useRef(INITIAL_POSITION);

    const { data, isLoading, error, execute } = useApiGeneric<{ childActionContent: string }, ApiResponse<ActionResponse>>({
        condition: true,
        data: null,
        method: 'POST',
        // url: 'http://10.138.45.132:8080/action/child'
        url: 'http://192.168.0.7:8080/action/child'
    });

    const { data: adultData, isLoading: adultIsLoading, error: adultError, execute: adultExecute } = useApiGeneric<AddAdultActionRequest, ApiResponse<AdultActionResponse>>({
        condition: true,
        data: null,
        method: 'POST',
        // url: 'http://10.138.45.132:8080/action/adult'
        url: 'http://192.168.0.7:8080/action/adult'
    });

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
            console.log("data:", data);
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
            console.log("adultData:", adultData);
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

    const completePraise = () => {
        setModalVisible(false);
        setAdultActionInput('');
        setSelectedItemId('');
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                style={styles.container}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
            >
                <View style={styles.mainScreen}>
                    <View style={styles.fixedContent}>
                        <SpeechBubble
                            title="오늘은 이런 점이 감사했어요"
                            placeholder="아이 입장에서 감사를 들려주세요"
                            value={childActionContent}
                            onChangeText={setChildActionContent}
                            onPress={addChildAction}
                            buttonText="어른인 내게 감사 들려주기"
                        />
                        <Image
                            source={require('@/assets/images/avatar-pixel.png')}
                            style={styles.avatarImage}
                        />
                    </View>
                </View>

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
                    <Text style={styles.childActionListTitle}>감사와 칭찬 목록</Text>
                    <ChildActionList
                        childActionList={childActionList}
                        isFlatListScrollable={isFlatListScrollable}
                        onLongPressItem={handleLongPressItem}
                    />
                </Animated.View>
            </KeyboardAvoidingView>

            <Modal
                visible={modalVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalBackground}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>칭찬을 입력해주세요</Text>
                        <View style={styles.adultActionInputContainer}>
                            <TextInput
                                style={styles.adultActionTextInput}
                                placeholder="칭찬을 입력하세요"
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
                            <Text style={styles.buttonText}>칭찬 완료</Text>
                        </TouchableOpacity>
                    </View>
                </View>
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
    fixedContent: {
        alignItems: 'center',
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
    },
    avatarImage: {
        width: 100,
        height: 100,
        resizeMode: 'contain',
        marginVertical: 10,
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
    },
});
