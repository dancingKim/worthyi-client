// components/ChildActionList.tsx
import React from 'react';
import { FlatList, TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { ChildActionItem } from '@/types/types';

interface ChildActionListProps {
    childActionList: ChildActionItem[];
    isFlatListScrollable: boolean;
    onLongPressItem: (item: ChildActionItem) => void;
}

const ChildActionList: React.FC<ChildActionListProps> = ({
                                                             childActionList,
                                                             isFlatListScrollable,
                                                             onLongPressItem,
                                                         }) => (
    <FlatList
        data={childActionList}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
            <TouchableOpacity onLongPress={() => onLongPressItem(item)}>
                <View style={styles.childActionItem}>
                    <Text style={styles.childActionText}>아이의 감사: {item.childActionContent}</Text>
                    {item.adultActions.length > 0 && (
                        <Text style={styles.adultActionsText}>
                            칭찬: {item.adultActions.join(', ')}
                        </Text>
                    )}
                </View>
            </TouchableOpacity>
        )}
        contentContainerStyle={{ paddingBottom: 20 }}
        scrollEnabled={isFlatListScrollable}
    />
);

const styles = StyleSheet.create({
    childActionItem: {
        backgroundColor: '#f5f5f5',
        borderRadius: 10,
        padding: 15,
        marginHorizontal: 20,
        marginBottom: 10,
    },
    childActionText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    adultActionsText: {
        fontSize: 14,
        marginTop: 5,
    },
});

export default ChildActionList;
