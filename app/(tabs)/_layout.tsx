import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';

// Simple standard colors for the tabs
const ACTIVE_COLOR = '#007AFF';
const INACTIVE_COLOR = '#8E8E93';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        // Use our standard colors
        tabBarActiveTintColor: ACTIVE_COLOR,
        tabBarInactiveTintColor: INACTIVE_COLOR,
        // Hide the top header on all tabs
        headerShown: false,
        // Standard tab bar style
        tabBarStyle: {
          backgroundColor: '#1C1C1E', // Dark mode background
          borderTopColor: '#38383A',
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Scanner',
          // Using Ionicons directly
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'camera' : 'camera-outline'} size={28} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="watchlist"
        options={{
          title: 'Watchlist',
          // Using Ionicons directly
          tabBarIcon: ({ color, focused }) => (
             <Ionicons name={focused ? 'list' : 'list-outline'} size={28} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}