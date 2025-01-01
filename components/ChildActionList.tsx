// components/ChildActionList.tsx
import React from 'react';
import { FlatList, TouchableOpacity, View, Text, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { ActionResponse } from '@/types/types';
import { CommonStyles } from '@/constants/Styles';
import { FontFamily } from '@/constants/Fonts';
import Animated, { 
    useAnimatedStyle,
    withSpring,
    useSharedValue,
    runOnJS
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { AntDesign } from '@expo/vector-icons';

interface ChildActionListProps {
    childActionList: ActionResponse[];
    isFlatListScrollable: boolean;
    onLongPressItem: (item: ActionResponse) => void;
    onDeleteItem: (id: number) => void;
    contentContainerStyle?: StyleProp<ViewStyle>;
}

interface SwipeableItemProps {
    item: ActionResponse;
    onDelete: (id: number) => void;
    onLongPress: (item: ActionResponse) => void;
}

const SwipeableItem: React.FC<SwipeableItemProps> = ({ item, onDelete, onLongPress }) => {
    const translateX = useSharedValue(0);

    const gesture = Gesture.Pan()
        .onChange((event) => {
            translateX.value = Math.min(0, event.translationX);
        })
        .onEnd(() => {
            const shouldBeDismissed = translateX.value < -100;
            if (shouldBeDismissed) {
                runOnJS(onDelete)(item.id);
            } else {
                translateX.value = withSpring(0);
            }
        });

    const rStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: translateX.value }],
    }));

    return (
        <GestureDetector gesture={gesture}>
            <Animated.View style={rStyle}>
                <TouchableOpacity 
                    onLongPress={() => onLongPress(item)}
                    delayLongPress={200}
                >
                    <View style={styles.itemContainer}>
                        <Text style={styles.itemText}>{item.content.text}</Text>
                        {item.responses && item.responses.length > 0 && (
                            <View style={styles.checkContainer}>
                                <AntDesign name="checkcircle" size={16} color="#FF69B4" />
                            </View>
                        )}
                    </View>
                </TouchableOpacity>
            </Animated.View>
        </GestureDetector>
    );
};

const ChildActionList: React.FC<ChildActionListProps> = ({
    childActionList,
    isFlatListScrollable,
    onLongPressItem,
    onDeleteItem,
    contentContainerStyle
}) => {
    const renderItem = ({ item }: { item: ActionResponse }) => (
        <SwipeableItem
            item={item}
            onDelete={onDeleteItem}
            onLongPress={onLongPressItem}
        />
    );

    return (
        <FlatList
            data={childActionList}
            renderItem={renderItem}
            keyExtractor={item => item.id.toString()}
            scrollEnabled={isFlatListScrollable}
            contentContainerStyle={contentContainerStyle}
        />
    );
};

const styles = StyleSheet.create({
    itemContainer: {
        backgroundColor: '#fff',
        padding: 15,
        marginVertical: 4,
        marginHorizontal: 16,
        borderRadius: 10,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    itemText: {
        flex: 1,
        fontSize: 16,
        color: '#333',
        fontFamily: FontFamily.semiBold,
        lineHeight: 24,
    },
    checkContainer: {
        marginLeft: 8,
        padding: 4,
    },
    deleteButton: {
        backgroundColor: '#FF1493',
        justifyContent: 'center',
        alignItems: 'center',
        width: 80,
        height: '100%',
        marginVertical: 4,
        borderTopRightRadius: 10,
        borderBottomRightRadius: 10,
    },
    deleteButtonText: {
        color: '#fff',
        fontFamily: FontFamily.medium,
        fontSize: 14,
    },
});

export default ChildActionList;
