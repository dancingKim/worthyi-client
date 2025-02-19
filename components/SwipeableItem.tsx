// src/components/SwipeableItem.tsx
import React, { FC, ReactNode } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, FlatList, Platform } from 'react-native';
import {
  PanGestureHandler,
  State,
  HandlerStateChangeEvent,
  PanGestureHandlerEventPayload,
} from 'react-native-gesture-handler';
import { FontFamily } from '@/constants/Fonts';

/** props 타입 정의 */
interface SwipeableItemProps {
  /** 아이템 내부에 표시할 Children (예: 텍스트, 버튼 등) */
  children: ReactNode;
  /** 스와이프 후 삭제 버튼을 눌렀을 때 실행할 함수 */
  onDelete: () => void;
  /** 스와이프 대상 컴포넌트의 ref */
  scrollRef: React.RefObject<FlatList>;
}

export const SwipeableItem: FC<SwipeableItemProps> = ({ children, onDelete, scrollRef }) => {
  const translateX = new Animated.Value(0);
  const deleteButtonWidth = 80;

  /** 수평 드래그 이벤트 */
  const onGestureEvent = Animated.event([{ nativeEvent: { translationX: translateX } }], {
    useNativeDriver: true,
  });

  /** 제스처 상태 변경: 드래그 끝난 후 위치에 따라 삭제 버튼 노출/원위치 */
  const onHandlerStateChange = (event: HandlerStateChangeEvent<PanGestureHandlerEventPayload>) => {
    if (event.nativeEvent.state === State.END) {
      const { translationX } = event.nativeEvent;
      if (translationX < -deleteButtonWidth / 2) {
        Animated.spring(translateX, {
          toValue: -deleteButtonWidth,
          useNativeDriver: true,
        }).start();
      } else {
        Animated.spring(translateX, {
          toValue: 0,
          useNativeDriver: true,
        }).start();
      }
    }
  };

  return (
    <View style={styles.container}>
      {/* 삭제 버튼 (스와이프로 왼쪽이 열렸을 때 보이게 됨) */}
      <TouchableOpacity
        style={[styles.deleteButton, { width: deleteButtonWidth }]}
        onPress={onDelete}
      >
        <Text style={styles.deleteButtonText}>삭제</Text>
      </TouchableOpacity>

      <PanGestureHandler
        onGestureEvent={onGestureEvent}
        onHandlerStateChange={onHandlerStateChange}
        activeOffsetX={[-5, 5]}   // 가로 스와이프 감도
        failOffsetY={[-50, 50]}  // 수직으로 살짝 움직여도 실패 처리되지 않도록
        {...(Platform.OS === 'ios' ? { simultaneousHandlers: scrollRef, waitFor: scrollRef } : {})}
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
  container: {
    position: 'relative',
  },
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