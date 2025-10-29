import { ProgressRing } from '@/components/progress-ring';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import React from 'react';
import { StyleSheet, View } from 'react-native';

interface HomeHeaderProps {
  totalHabits: number;
  completedHabits: number;
}

export function HomeHeader({ totalHabits, completedHabits }: HomeHeaderProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  
  const today = new Date();
  const dayName = today.toLocaleDateString('en-US', { weekday: 'long' });
  const dateString = today.toLocaleDateString('en-US', { 
    month: 'long', 
    day: 'numeric' 
  });
  
  const completionPercentage = totalHabits > 0 ? (completedHabits / totalHabits) * 100 : 0;

  return (
    <ThemedView style={styles.container}>
      <View style={styles.greetingSection}>
        <View style={styles.textContent}>
          <ThemedText type="title" style={styles.greeting}>
            Good {getTimeOfDay()}!
          </ThemedText>
          <ThemedText style={styles.date}>
            {dayName}, {dateString}
          </ThemedText>
        </View>
        <ProgressRing 
          progress={completionPercentage}
          size={70}
          strokeWidth={6}
        />
      </View>
      
      <View style={styles.statsSection}>
        <View style={styles.statCard}>
          <IconSymbol name="checkmark.circle.fill" size={20} color={colors.tint} />
          <ThemedText style={styles.statNumber}>{completedHabits}</ThemedText>
          <ThemedText style={styles.statLabel}>Completed</ThemedText>
        </View>
        <View style={styles.statCard}>
          <IconSymbol name="circle" size={20} color={colors.icon} />
          <ThemedText style={styles.statNumber}>{totalHabits - completedHabits}</ThemedText>
          <ThemedText style={styles.statLabel}>Remaining</ThemedText>
        </View>
        <View style={styles.statCard}>
          <IconSymbol name="target" size={20} color={colors.tint} />
          <ThemedText style={styles.statNumber}>{totalHabits}</ThemedText>
          <ThemedText style={styles.statLabel}>Total</ThemedText>
        </View>
      </View>
    </ThemedView>
  );
}

function getTimeOfDay(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  return 'evening';
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  greetingSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  textContent: {
    flex: 1,
  },
  greeting: {
    marginBottom: 4,
  },
  date: {
    fontSize: 16,
    opacity: 0.7,
  },
  statsSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statCard: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 4,
  },
  statLabel: {
    fontSize: 12,
    opacity: 0.7,
    marginTop: 2,
  },
});
