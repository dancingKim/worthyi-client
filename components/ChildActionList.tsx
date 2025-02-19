// components/ChildActionList.tsx
import React, { useRef } from 'react';
import { FlatList, TouchableOpacity, View, Text, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { FontFamily } from '@/constants/Fonts';
import { ActionResponse } from '@/types/types';
import { SwipeableItem } from '@/components/SwipeableItem';

interface ChildActionListProps {
  childActionList: ActionResponse[];
  isFlatListScrollable: boolean;
  onLongPressItem: (item: ActionResponse) => void;
  onDeleteItem: (id: number) => void;
  contentContainerStyle?: StyleProp<ViewStyle>;
}

export function ChildActionList({
  childActionList,
  isFlatListScrollable,
  onLongPressItem,
  onDeleteItem,
  contentContainerStyle,
}: ChildActionListProps) {
  const scrollRef = useRef<FlatList>(null);

  const renderItem = ({ item }: { item: ActionResponse }) => (
    <SwipeableItem onDelete={() => onDeleteItem(item.id)} scrollRef={scrollRef}>
      <TouchableOpacity onLongPress={() => onLongPressItem(item)} delayLongPress={200}>
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
      data={childActionList}
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