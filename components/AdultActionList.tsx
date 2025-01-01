import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { ActionResponse } from '@/types/types';
import { FontFamily } from '@/constants/Fonts';
import Animated, { 
    useAnimatedStyle,
    withSpring,
    useSharedValue,
    runOnJS
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { AntDesign } from '@expo/vector-icons';

interface AdultActionListProps {
    actions: ActionResponse[];
    onDeleteAction: (id: number) => void;
}

interface SwipeableItemProps {
    item: ActionResponse;
    onDelete: (id: number) => void;
}

const SwipeableItem: React.FC<SwipeableItemProps> = ({ item, onDelete }) => {
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
                <View style={styles.itemContainer}>
                    <Text style={styles.itemText}>{item.content.text}</Text>
                    <View style={styles.iconContainer}>
                        <AntDesign name="heart" size={16} color="#FF69B4" />
                    </View>
                </View>
            </Animated.View>
        </GestureDetector>
    );
};

const AdultActionList: React.FC<AdultActionListProps> = ({ actions, onDeleteAction }) => {
    const renderItem = ({ item }: { item: ActionResponse }) => (
        <SwipeableItem
            item={item}
            onDelete={onDeleteAction}
        />
    );

    return (
        <FlatList
            data={actions}
            renderItem={renderItem}
            keyExtractor={item => item.id.toString()}
            scrollEnabled={false}
            contentContainerStyle={styles.listContainer}
        />
    );
};

const styles = StyleSheet.create({
    listContainer: {
        paddingVertical: 8,
    },
    itemContainer: {
        backgroundColor: '#fff',
        padding: 12,
        marginVertical: 4,
        marginHorizontal: 8,
        borderRadius: 8,
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    itemText: {
        flex: 1,
        fontSize: 14,
        color: '#333',
        fontFamily: FontFamily.regular,
        lineHeight: 20,
    },
    iconContainer: {
        marginLeft: 8,
        padding: 4,
    }
});

export default AdultActionList; 