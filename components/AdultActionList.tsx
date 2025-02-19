// components/AdultActionList.tsx
import React, { useRef } from 'react';
import { FlatList, View, Text, StyleSheet, StyleProp, ViewStyle, Platform } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { FontFamily } from '@/constants/Fonts';
import { ActionResponse } from '@/types/types';
import { SwipeableItem } from '@/components/SwipeableItem';
import { AndroidActionItem } from '@/components/AndroidActionItem';

interface AdultActionListProps {
  actions: ActionResponse[];
  childActionId: number;
  isFlatListScrollable: boolean;
  onDeleteItem: (id: number) => void;
  contentContainerStyle?: StyleProp<ViewStyle>;
}

export function AdultActionList({
  actions,
  childActionId,
  isFlatListScrollable,
  onDeleteItem,
  contentContainerStyle,
}: AdultActionListProps) {
  const scrollRef = useRef<FlatList>(null);

  const renderItem = ({ item }: { item: ActionResponse }) => {
    const ItemComponent =
      Platform.OS === 'android' ? AndroidActionItem : SwipeableItem;

    return (
      <ItemComponent onDelete={() => onDeleteItem(item.id)} scrollRef={scrollRef}>
        <View style={styles.itemContainer}>
          <Text style={styles.itemText}>{item.content.text}</Text>
          {/* iOS의 경우 기존에 체크 아이콘(받은 칭찬 표시)을 추가 */}
          {Platform.OS !== 'android' && item.responses && item.responses.length > 0 && (
            <View style={styles.checkContainer}>
              <AntDesign name="checkcircle" size={16} color="#FF69B4" />
            </View>
          )}
        </View>
      </ItemComponent>
    );
  };

  return (
    <FlatList
      ref={scrollRef}
      data={actions}
      renderItem={renderItem}
      keyExtractor={(item) => item.id.toString()}
      scrollEnabled={isFlatListScrollable}
      contentContainerStyle={contentContainerStyle}
    />
  );
}

const styles = StyleSheet.create({
  itemContainer: {
    backgroundColor: '#fff',
    padding: 15,
    marginVertical: 2,
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
});