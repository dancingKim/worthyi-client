// components/ChildActionList.tsx
import React from 'react';
import { FlatList, TouchableOpacity, View, Text, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { ChildActionItem } from '@/types/types';
import { CommonStyles } from '@/constants/Styles';
import { FontFamily } from '@/constants/Fonts';

interface ChildActionListProps {
    childActionList: ChildActionItem[];
    isFlatListScrollable: boolean;
    onLongPressItem: (item: ChildActionItem) => void;
    contentContainerStyle?: StyleProp<ViewStyle>;
}

const ChildActionList: React.FC<ChildActionListProps> = ({
                                                             childActionList,
                                                             isFlatListScrollable,
                                                             onLongPressItem,
                                                             contentContainerStyle
                                                         }) => (
    <FlatList
        data={childActionList}
        keyExtractor={(item) => item.childActionId.toString()}
        renderItem={({ item }) => (
            <TouchableOpacity onLongPress={() => onLongPressItem(item)}>
                <View style={styles.childActionItem}>
                    <Text style={[styles.childActionText, { fontFamily: FontFamily.bold }]}>
                        아이의 감사: {item.content.text}
                    </Text>
                    {item.adultActions.length > 0 && (
                        <Text style={[styles.adultActionsText, { fontFamily: FontFamily.medium }]}>
                            칭찬: {item.adultActions.map(action => action.content.text).join(' • ')}
                        </Text>
                    )}
                </View>
            </TouchableOpacity>
        )}
        contentContainerStyle={[{ paddingBottom: 20 }, contentContainerStyle]}
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
    },
    adultActionsText: {
        fontSize: 14,
        marginTop: 5,
    },
});

export default ChildActionList;
