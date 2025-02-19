import React, { FC, ReactNode } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { FontFamily } from '@/constants/Fonts';

interface AndroidActionItemProps {
  children: ReactNode;
  onDelete: () => void;
}

export const AndroidActionItem: FC<AndroidActionItemProps> = ({ children, onDelete }) => {
  return (
    <View style={styles.androidContainer}>
      <TouchableOpacity onPress={onDelete} style={styles.androidDeleteButton}>
        <AntDesign name="minuscircleo" size={20} color="#FF69B4" />
      </TouchableOpacity>
      <View style={styles.androidContent}>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  androidContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginVertical: 2,
    marginHorizontal: 16,
    borderRadius: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  androidDeleteButton: {
    padding: 10,
  },
  androidContent: {
    flex: 1,
  },
}); 