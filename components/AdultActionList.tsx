import React, { useState, useEffect } from 'react';
import { FlatList, TouchableOpacity, View, Text, StyleSheet, StyleProp, ViewStyle, ScrollView } from 'react-native';
import { ActionResponse } from '@/types/types';
import { FontFamily } from '@/constants/Fonts';
import { AntDesign } from '@expo/vector-icons';
import SwipeableItem from './SwipeableItem';

interface AdultActionListProps {
    actions: ActionResponse[];
    childActionId: number;
    isFlatListScrollable: boolean;
    onLongPressItem: (item: ActionResponse) => void;
    onDeleteItem: (id: number) => void;
    contentContainerStyle?: StyleProp<ViewStyle>;
    nestedScrollEnabled?: boolean;
}

const AdultActionList: React.FC<AdultActionListProps> = ({
    actions,
    childActionId,
    isFlatListScrollable,
    onLongPressItem,
    onDeleteItem,
    contentContainerStyle,
    nestedScrollEnabled
}) => {
    const renderItem = ({ item }: { item: ActionResponse }) => (
        <SwipeableItem onDelete={() => onDeleteItem(item.id)}>
            <TouchableOpacity 
                onLongPress={() => onLongPressItem(item)}
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
        </SwipeableItem>
    );

    return (
        <FlatList
            data={actions}
            renderItem={renderItem}
            keyExtractor={item => item.id.toString()}
            scrollEnabled={isFlatListScrollable}
            contentContainerStyle={contentContainerStyle}
            nestedScrollEnabled={nestedScrollEnabled}
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
    },
    checkContainer: {
        marginLeft: 8,
        padding: 4,
    },
});

export default AdultActionList; 