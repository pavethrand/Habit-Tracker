import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { DailyHabit } from '@/types/habit';
import React from 'react';
import { Animated, StyleSheet, TouchableOpacity, View } from 'react-native';

interface HabitCardProps {
  dailyHabit: DailyHabit;
  onToggle: () => void;
}

export function HabitCard({ dailyHabit, onToggle }: HabitCardProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { habit, isCompleted, stats } = dailyHabit;

  const animatedValue = React.useRef(new Animated.Value(isCompleted ? 1 : 0)).current;

  React.useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: isCompleted ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [isCompleted]);

  // Determine card background color
  let cardBg = '';
  if (isCompleted) {
    cardBg = habit.color + '20';
  } else {
    cardBg = 'rgba(0, 0, 0, 0.3)';
  }

  // Determine border color
  let cardBorder = '';
  if (isCompleted) {
    cardBorder = habit.color;
  } else {
    cardBorder = 'rgba(255, 255, 255, 0.2)';
  }

  const backgroundColor = cardBg;
  const borderColor = cardBorder;

  return (
    <View style={[styles.card, { backgroundColor, borderColor }]}>
      <TouchableOpacity
        style={styles.cardContent}
        onPress={onToggle}
        activeOpacity={0.7}
      >
        <View style={styles.habitInfo}>
          <View style={styles.habitHeader}>
            <View style={[styles.iconContainer, { backgroundColor: habit.color + '30' }]}>
              <IconSymbol 
                name={habit.icon || 'checkmark.circle'} 
                size={24} 
                color={habit.color} 
              />
            </View>
            <View style={styles.habitDetails}>
              <ThemedText 
                type="defaultSemiBold" 
                style={styles.habitName}
                lightColor="white"
                darkColor="white"
              >
                {habit.name}
              </ThemedText>
              <ThemedText 
                style={styles.habitFrequency}
                lightColor="rgba(255, 255, 255, 0.7)"
                darkColor="rgba(255, 255, 255, 0.7)"
              >
                {habit.frequency === 'daily' ? 'Daily' : 
                 habit.frequency === 'weekly' ? 'Weekly' : 'Custom'}
              </ThemedText>
            </View>
          </View>
          
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <ThemedText 
                style={styles.statValue}
                lightColor="white"
                darkColor="white"
              >
                {stats.currentStreak}
              </ThemedText>
              <ThemedText 
                style={styles.statLabel}
                lightColor="rgba(255, 255, 255, 0.7)"
                darkColor="rgba(255, 255, 255, 0.7)"
              >
                Streak
              </ThemedText>
            </View>
            <View style={styles.statItem}>
              <ThemedText 
                style={styles.statValue}
                lightColor="white"
                darkColor="white"
              >
                {Math.round(stats.successRate)}%
              </ThemedText>
              <ThemedText 
                style={styles.statLabel}
                lightColor="rgba(255, 255, 255, 0.7)"
                darkColor="rgba(255, 255, 255, 0.7)"
              >
                Success
              </ThemedText>
            </View>
          </View>
        </View>

        <Animated.View style={[
          styles.checkbox,
          { 
            backgroundColor: animatedValue.interpolate({
              inputRange: [0, 1],
              outputRange: ['rgba(0, 0, 0, 0.3)', habit.color],
            }),
            borderColor: habit.color,
          }
        ]}>
          <Animated.View style={{
            opacity: animatedValue,
            transform: [{
              scale: animatedValue.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 1],
              })
            }]
          }}>
            <IconSymbol name="checkmark" size={16} color="white" />
          </Animated.View>
        </Animated.View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 12,
    overflow: 'hidden',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  habitInfo: {
    flex: 1,
  },
  habitHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  habitDetails: {
    flex: 1,
  },
  habitName: {
    fontSize: 16,
    marginBottom: 2,
  },
  habitFrequency: {
    fontSize: 12,
    opacity: 0.7,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  statLabel: {
    fontSize: 10,
    opacity: 0.7,
    marginTop: 2,
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
