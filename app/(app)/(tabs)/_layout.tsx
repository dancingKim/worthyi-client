import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

import { TabBarIcon } from '@/components/navigation/TabBarIcon';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { CommonStyles } from '@/constants/Styles';
import { FontFamily } from '@/constants/Fonts';

export default function TabLayout() {
  console.log('Tab layout rendering');
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        tabBarStyle: Platform.select({
          ios: {
            backgroundColor: '#fff',
          },
          android: {
            backgroundColor: '#fff',
            elevation: 0,
            borderTopWidth: 1,
            borderTopColor: '#eee',
          },
        }),
        tabBarLabelStyle: {
          fontFamily: FontFamily.medium,
          fontSize: 12
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'home' : 'home-outline'} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="my-log"
        options={{
          title: 'My Log',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'stats-chart' : 'stats-chart-outline'} color={color} />
          ),
        }}
      />
        <Tabs.Screen
            name={"profile"}
        options={
            {
                title: 'Profile',
                tabBarIcon: ({ color, focused }) => (
                    <TabBarIcon name={focused ? 'man' : 'man-outline'} color={color} />
                )
            }
        }>

        </Tabs.Screen>
    </Tabs>
  );
}
