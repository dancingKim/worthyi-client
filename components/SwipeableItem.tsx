import React, { FC, ReactNode } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import {
  PanGestureHandler,
  State,
  HandlerStateChangeEvent,
  PanGestureHandlerEventPayload,
} from 'react-native-gesture-handler';
import { FontFamily } from '@/constants/Fonts';

interface SwipeableItemProps {
  children: ReactNode;
  onDelete: () => void;
}

const SwipeableItem: FC<SwipeableItemProps> = ({ children, onDelete }) => {
  const translateX = new Animated.Value(0);
  const deleteButtonWidth = 80;

  // 수평 드래그
  const onGestureEvent = Animated.event([{ nativeEvent: { translationX: translateX } }], {
    useNativeDriver: true,
  });

  // 제스처 상태
  const onHandlerStateChange = (event: HandlerStateChangeEvent<PanGestureHandlerEventPayload>) => {
    if (event.nativeEvent.state === State.END) {
      const { translationX } = event.nativeEvent;
      if (translationX < -deleteButtonWidth / 2) {
        // 왼쪽으로 스와이프
        Animated.spring(translateX, {
          toValue: -deleteButtonWidth,
          useNativeDriver: true,
        }).start();
      } else {
        // 원위치
        Animated.spring(translateX, {
          toValue: 0,
          useNativeDriver: true,
        }).start();
      }
    }
  };

  return (
    <View style={styles.container}>
      {/* 삭제 버튼 */}
      <TouchableOpacity style={[styles.deleteButton, { width: deleteButtonWidth }]} onPress={onDelete}>
        <Text style={styles.deleteButtonText}>삭제</Text>
      </TouchableOpacity>

      <PanGestureHandler
        onGestureEvent={onGestureEvent}
        onHandlerStateChange={onHandlerStateChange}
        activeOffsetX={[-10, 10]}
        failOffsetY={[-20, 20]}
      >
        <Animated.View
          style={[
            styles.content,
            {
              transform: [
                {
                  translateX: translateX.interpolate({
                    inputRange: [-deleteButtonWidth, 0],
                    outputRange: [-deleteButtonWidth, 0],
                    extrapolate: 'clamp',
                  }),
                },
              ],
            },
          ]}
        >
          {children}
        </Animated.View>
      </PanGestureHandler>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { position: 'relative' },
  content: {
    backgroundColor: '#fff',
  },
  deleteButton: {
    position: 'absolute',
    right: 0,
    height: '100%',
    backgroundColor: '#FF1493',
    justifyContent: 'center',
    alignItems: 'center',
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
  },
  deleteButtonText: {
    color: '#fff',
    fontFamily: FontFamily.medium,
    fontSize: 14,
  },
});

export default SwipeableItem;