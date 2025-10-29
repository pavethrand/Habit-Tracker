import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { HabitProvider } from '@/contexts/HabitContext';
import { LeaveHabitProvider } from '@/contexts/LeaveHabitContext';
import { TaskProvider } from '@/contexts/TaskContext';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <TaskProvider>
      <HabitProvider>
        <LeaveHabitProvider>
          <Tabs
            screenOptions={{
              tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
              headerShown: false,
              tabBarButton: HapticTab,
            }}
          >
            <Tabs.Screen
              name="index"
              options={{
                title: 'Tasks',
                tabBarIcon: ({ color }) => <IconSymbol size={28} name="list.bullet" color={color} />,
              }}
            />
            <Tabs.Screen
              name="habits"
              options={{
                title: 'Habits',
                tabBarIcon: ({ color }) => <IconSymbol size={28} name="checkmark.circle.fill" color={color} />,
              }}
            />
            <Tabs.Screen
              name="leave"
              options={{
                title: 'Leave',
                tabBarIcon: ({ color }) => <IconSymbol size={28} name="xmark.circle.fill" color={color} />,
              }}
            />
            <Tabs.Screen
              name="admin"
              options={{
                title: 'Settings',
                tabBarIcon: ({ color }) => <IconSymbol size={28} name="gearshape.fill" color={color} />,
              }}
            />
          </Tabs>
        </LeaveHabitProvider>
      </HabitProvider>
    </TaskProvider>
  );
}
