import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { LeaveHabitProvider, useLeaveHabits } from '@/contexts/LeaveHabitContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { LeavePriority } from '@/types/leave-habit';
import React, { useEffect, useState } from 'react';
import { Modal, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

function LeaveScreenContent() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { state, checkLeaveHabit, addLeaveHabit } = useLeaveHabits();
  
  const { leaveHabits } = state;
  const activeHabits = leaveHabits.filter(habit => habit.streak < 7);
  const completedHabits = leaveHabits.filter(habit => habit.streak >= 7);

  // Form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newHabitName, setNewHabitName] = useState('');
  const [newHabitDescription, setNewHabitDescription] = useState('');
  const [newHabitCategory, setNewHabitCategory] = useState('General');
  const [newHabitPriority, setNewHabitPriority] = useState<LeavePriority>('normal');
  
  // Category selector
  const [showCategorySelector, setShowCategorySelector] = useState(false);
  const [showPrioritySelector, setShowPrioritySelector] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState<string | null>(null);

  const categories = ['General', 'Health', 'Social', 'Work', 'Study', 'Other'];

  // Track if any habit was auto-deleted (for success message)
  useEffect(() => {
    if (completedHabits.length > 0) {
      setShowSuccessMessage(`You're free from "${completedHabits[completedHabits.length - 1].name}"! 🎉`);
      setTimeout(() => setShowSuccessMessage(null), 5000);
    }
  }, [completedHabits.length]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return '#D0021B';
      case 'normal': return '#F5A623';
      case 'minor': return '#7ED321';
      default: return colors.text;
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'critical': return 'exclamationmark.triangle.fill';
      case 'normal': return 'circle.fill';
      case 'minor': return 'checkmark.circle.fill';
      default: return 'circle';
    }
  };

  const handleAddHabit = () => {
    if (newHabitName.trim()) {
      addLeaveHabit({
        name: newHabitName.trim(),
        description: newHabitDescription.trim() || undefined,
        category: newHabitCategory,
        priority: newHabitPriority,
      });
      setNewHabitName('');
      setNewHabitDescription('');
      setNewHabitCategory('General');
      setNewHabitPriority('normal');
      setShowAddForm(false);
    }
  };

  const generateCalendarDays = () => {
    const days = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      days.push(date);
    }
    return days;
  };

  const getDayStatus = (habitId: string, day: Date) => {
    const dayStr = day.toISOString().split('T')[0];
    const completion = state.completions.find(
      c => c.leaveHabitId === habitId && c.date === dayStr
    );
    return completion ? 'checked' : 'missed';
  };

  const handleCheckLeaveHabit = (habitId: string) => {
    checkLeaveHabit(habitId);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colorScheme === 'dark' ? '#D58936' : '#3C1518' }]} edges={['top']}>
      <ScrollView 
        style={[styles.scrollView, { backgroundColor: colorScheme === 'dark' ? '#D58936' : '#3C1518' }]}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <ThemedView 
          style={styles.header}
          lightColor="#3C1518"
          darkColor="#D58936"
        >
          <ThemedText 
            type="title" 
            style={styles.title}
            lightColor="white"
            darkColor="white"
          >
            Break Bad Habits
          </ThemedText>
          <ThemedText 
            style={styles.subtitle}
            lightColor="rgba(255, 255, 255, 0.7)"
            darkColor="rgba(255, 255, 255, 0.7)"
          >
            Track your progress in quitting unwanted habits
          </ThemedText>
        </ThemedView>

        {/* Success Message */}
        {showSuccessMessage && (
          <View style={styles.successMessage}>
            <IconSymbol name="checkmark.circle.fill" size={24} color="#7ED321" />
            <ThemedText style={styles.successText}>{showSuccessMessage}</ThemedText>
          </View>
        )}

        <ThemedView style={styles.statsCard}>
          <View style={styles.statsContent}>
            <View style={styles.statsText}>
              <ThemedText type="subtitle" style={styles.statsTitle}>
                Active Habits to Quit
              </ThemedText>
              <ThemedText style={styles.statsDescription}>
                {activeHabits.length} habits being tracked
              </ThemedText>
            </View>
            <View style={styles.streakIcon}>
              <IconSymbol name="xmark.circle.fill" size={32} color="#D0021B" />
              <ThemedText style={styles.streakText}>
                Stay Strong!
              </ThemedText>
            </View>
          </View>
        </ThemedView>

        <ThemedView 
          style={styles.habitsSection}
          lightColor="#3C1518"
          darkColor="#D58936"
        >
          <View style={styles.sectionHeader}>
            <ThemedText 
              type="subtitle" 
              style={styles.sectionTitle}
              lightColor="white"
              darkColor={undefined}
            >
              Habits to Quit
            </ThemedText>
            <TouchableOpacity 
              style={[styles.addButton, { backgroundColor: colors.tint, borderColor: colors.tint }]}
              onPress={() => setShowAddForm(true)}
              activeOpacity={0.7}
            >
              <IconSymbol name="plus" size={22} color="white" />
            </TouchableOpacity>
          </View>
          
          {activeHabits.length === 0 ? (
            <View style={styles.emptyState}>
              <IconSymbol name="checkmark.circle.fill" size={48} color="#7ED321" />
              <ThemedText 
                style={styles.emptyTitle}
                lightColor="white"
                darkColor="white"
              >
                No habits to quit
              </ThemedText>
              <ThemedText 
                style={styles.emptyDescription}
                lightColor="rgba(255, 255, 255, 0.7)"
                darkColor="rgba(255, 255, 255, 0.7)"
              >
                Great job! You're not tracking any bad habits to break.
              </ThemedText>
              <TouchableOpacity 
                style={[styles.primaryButton, { backgroundColor: colors.tint }]}
                onPress={() => setShowAddForm(true)}
              >
                <ThemedText style={styles.primaryButtonText}>Add Habit to Quit</ThemedText>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.habitsList}>
              {activeHabits.map((leaveHabit) => (
                <ThemedView 
                  key={leaveHabit.id} 
                  style={styles.habitCard}
                  lightColor="rgba(255, 255, 255, 0.05)"
                  darkColor="rgba(0, 0, 0, 0.3)"
                >
                  <View style={styles.habitHeader}>
                    <View style={styles.habitInfo}>
                      <View style={styles.priorityIndicator}>
                        <IconSymbol 
                          name={getPriorityIcon(leaveHabit.priority)} 
                          size={16} 
                          color={getPriorityColor(leaveHabit.priority)} 
                        />
                      </View>
                      <View style={styles.habitDetails}>
                        <ThemedText 
                          type="defaultSemiBold" 
                          style={styles.habitName}
                          lightColor="white"
                          darkColor="white"
                        >
                          {leaveHabit.name}
                        </ThemedText>
                        {leaveHabit.description && (
                          <ThemedText 
                            style={styles.habitDescription}
                            lightColor="rgba(255, 255, 255, 0.7)"
                            darkColor="rgba(255, 255, 255, 0.7)"
                          >
                            {leaveHabit.description}
                          </ThemedText>
                        )}
                      </View>
                    </View>
                    <View style={styles.streakContainer}>
                      <ThemedText 
                        style={styles.streakNumber}
                        lightColor="#D0021B"
                        darkColor="#D0021B"
                      >
                        {leaveHabit.streak}
                      </ThemedText>
                      <ThemedText 
                        style={styles.streakLabel}
                        lightColor="rgba(255, 255, 255, 0.7)"
                        darkColor="rgba(255, 255, 255, 0.7)"
                      >
                        days
                      </ThemedText>
                    </View>
                  </View>

                  {/* Calendar Tracker */}
                  <View style={styles.calendarContainer}>
                    <ThemedText 
                      style={styles.calendarTitle}
                      lightColor="rgba(255, 255, 255, 0.7)"
                      darkColor="rgba(255, 255, 255, 0.7)"
                    >
                      Last 7 Days
                    </ThemedText>
                    <View style={styles.calendarGrid}>
                      {generateCalendarDays().map((day, index) => {
                        const status = getDayStatus(leaveHabit.id, day);
                        const isToday = day.toDateString() === new Date().toDateString();
                        return (
                          <View key={index} style={styles.calendarDay}>
                            <ThemedText 
                              style={styles.calendarDayLabel}
                              lightColor="rgba(255, 255, 255, 0.7)"
                              darkColor="rgba(255, 255, 255, 0.7)"
                            >
                              {day.toLocaleDateString('en-US', { weekday: 'short' })}
                            </ThemedText>
                            <View style={[
                              styles.calendarDayCircle,
                              status === 'checked' && { backgroundColor: '#7ED321' },
                              status === 'missed' && { backgroundColor: isToday ? 'transparent' : '#D0021B' },
                              isToday && { borderWidth: 2, borderColor: colors.tint },
                            ]}>
                              {status === 'checked' && (
                                <IconSymbol name="checkmark" size={12} color="white" />
                              )}
                              {status === 'missed' && !isToday && (
                                <IconSymbol name="xmark" size={12} color="white" />
                              )}
                            </View>
                          </View>
                        );
                      })}
                    </View>
                  </View>
                  
                  <View style={styles.habitActions}>
                    <TouchableOpacity 
                      style={[styles.checkButton, { backgroundColor: '#7ED321' }]}
                      onPress={() => handleCheckLeaveHabit(leaveHabit.id)}
                    >
                      <IconSymbol name="checkmark" size={20} color="white" />
                      <ThemedText 
                        style={styles.checkButtonText}
                        lightColor="white"
                        darkColor="white"
                      >
                        Didn't do it today
                      </ThemedText>
                    </TouchableOpacity>
                  </View>
                  
                  {leaveHabit.streak >= 5 && (
                    <View style={styles.milestoneAlert}>
                      <IconSymbol name="star.fill" size={16} color="#F5A623" />
                      <ThemedText 
                        style={styles.milestoneText}
                        lightColor="#F5A623"
                        darkColor="#F5A623"
                      >
                        Almost there! {7 - leaveHabit.streak} more days to freedom!
                      </ThemedText>
                    </View>
                  )}
                </ThemedView>
              ))}
            </View>
          )}
        </ThemedView>
      </ScrollView>

      {/* Add Leave Habit Form Modal */}
      <Modal
        visible={showAddForm}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddForm(false)}
      >
        <View style={styles.modalOverlay}>
          <ThemedView style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <ThemedText type="subtitle" style={styles.modalTitle}>Add Habit to Quit</ThemedText>
              <TouchableOpacity onPress={() => setShowAddForm(false)}>
                <IconSymbol name="xmark.circle.fill" size={24} color={colors.icon} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {/* Habit Name */}
              <TextInput
                style={[styles.textInput, { color: colors.text, borderColor: colors.border }]}
                placeholder="What habit do you want to quit?"
                placeholderTextColor={colors.text + '80'}
                value={newHabitName}
                onChangeText={setNewHabitName}
              />

              {/* Description */}
              <TextInput
                style={[
                  styles.textInput, 
                  styles.textArea,
                  { color: colors.text, borderColor: colors.border }
                ]}
                placeholder="Why do you want to quit? (optional)"
                placeholderTextColor={colors.text + '80'}
                value={newHabitDescription}
                onChangeText={setNewHabitDescription}
                multiline
                numberOfLines={3}
              />

              {/* Category Selector */}
              <TouchableOpacity
                style={[styles.selectorInput, { borderColor: colors.border }]}
                onPress={() => setShowCategorySelector(true)}
              >
                <ThemedText style={styles.selectorText}>
                  {newHabitCategory}
                </ThemedText>
                <IconSymbol name="chevron.down" size={16} color={colors.icon} />
              </TouchableOpacity>

              {/* Priority Selector */}
              <TouchableOpacity
                style={[styles.selectorInput, { borderColor: colors.border }]}
                onPress={() => setShowPrioritySelector(true)}
              >
                <View style={styles.priorityOptionContent}>
                  <IconSymbol 
                    name={getPriorityIcon(newHabitPriority)} 
                    size={16} 
                    color={getPriorityColor(newHabitPriority)} 
                  />
                  <ThemedText style={styles.selectorText}>
                    {newHabitPriority.charAt(0).toUpperCase() + newHabitPriority.slice(1)}
                  </ThemedText>
                </View>
                <IconSymbol name="chevron.down" size={16} color={colors.icon} />
              </TouchableOpacity>
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowAddForm(false)}
              >
                <ThemedText style={styles.cancelButtonText}>Cancel</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveButton, { backgroundColor: colors.tint }]}
                onPress={handleAddHabit}
              >
                <ThemedText style={styles.saveButtonText}>Add Habit</ThemedText>
              </TouchableOpacity>
            </View>
          </ThemedView>
        </View>
      </Modal>

      {/* Category Selector Modal */}
      <Modal
        visible={showCategorySelector}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCategorySelector(false)}
      >
        <View style={styles.modalOverlay}>
          <ThemedView style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <ThemedText type="subtitle" style={styles.modalTitle}>Select Category</ThemedText>
              <TouchableOpacity onPress={() => setShowCategorySelector(false)}>
                <IconSymbol name="xmark.circle.fill" size={24} color={colors.icon} />
              </TouchableOpacity>
            </View>
            <ScrollView>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category}
                  style={styles.categoryOption}
                  onPress={() => {
                    setNewHabitCategory(category);
                    setShowCategorySelector(false);
                  }}
                >
                  <ThemedText>{category}</ThemedText>
                  {newHabitCategory === category && (
                    <IconSymbol name="checkmark.circle.fill" size={20} color={colors.tint} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </ThemedView>
        </View>
      </Modal>

      {/* Priority Selector Modal */}
      <Modal
        visible={showPrioritySelector}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowPrioritySelector(false)}
      >
        <View style={styles.modalOverlay}>
          <ThemedView style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <ThemedText type="subtitle" style={styles.modalTitle}>Select Priority</ThemedText>
              <TouchableOpacity onPress={() => setShowPrioritySelector(false)}>
                <IconSymbol name="xmark.circle.fill" size={24} color={colors.icon} />
              </TouchableOpacity>
            </View>
            {(['critical', 'normal', 'minor'] as LeavePriority[]).map((priority) => (
              <TouchableOpacity
                key={priority}
                style={styles.priorityOption}
                onPress={() => {
                  setNewHabitPriority(priority);
                  setShowPrioritySelector(false);
                }}
              >
                <View style={styles.priorityOptionContent}>
                  <IconSymbol 
                    name={getPriorityIcon(priority)} 
                    size={20} 
                    color={getPriorityColor(priority)} 
                  />
                  <ThemedText>{priority.charAt(0).toUpperCase() + priority.slice(1)}</ThemedText>
                </View>
                {newHabitPriority === priority && (
                  <IconSymbol name="checkmark.circle.fill" size={20} color={colors.tint} />
                )}
              </TouchableOpacity>
            ))}
          </ThemedView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

export default function LeaveScreen() {
  return (
    <LeaveHabitProvider>
      <LeaveScreenContent />
    </LeaveHabitProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  title: {
    marginBottom: 4,
  },
  subtitle: {
    opacity: 0.7,
  },
  statsCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    padding: 20,
  },
  statsContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statsText: {
    flex: 1,
  },
  statsTitle: {
    marginBottom: 4,
  },
  statsDescription: {
    opacity: 0.7,
  },
  streakIcon: {
    alignItems: 'center',
  },
  streakText: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
    color: '#D0021B',
  },
  habitsSection: {
    paddingHorizontal: 20,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  habitsList: {
    gap: 12,
  },
  habitCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  habitHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  habitInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  priorityIndicator: {
    marginRight: 12,
    marginTop: 2,
  },
  habitDetails: {
    flex: 1,
  },
  habitName: {
    marginBottom: 4,
  },
  habitDescription: {
    opacity: 0.7,
    fontSize: 14,
  },
  streakContainer: {
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  streakNumber: {
    fontSize: 18,
    fontWeight: '600',
    color: '#D0021B',
  },
  streakLabel: {
    fontSize: 10,
    opacity: 0.7,
  },
  calendarContainer: {
    marginBottom: 12,
    padding: 12,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 8,
  },
  calendarTitle: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
    opacity: 0.7,
  },
  calendarGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  calendarDay: {
    alignItems: 'center',
    flex: 1,
  },
  calendarDayLabel: {
    fontSize: 10,
    opacity: 0.7,
    marginBottom: 4,
  },
  calendarDayCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  habitActions: {
    marginBottom: 8,
  },
  checkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  checkButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  milestoneAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 166, 35, 0.1)',
    borderRadius: 8,
    padding: 8,
    gap: 6,
  },
  milestoneText: {
    fontSize: 12,
    color: '#F5A623',
    fontWeight: '500',
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    textAlign: 'center',
    opacity: 0.7,
    marginBottom: 24,
    lineHeight: 20,
  },
  primaryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  primaryButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  successMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(126, 211, 33, 0.2)',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 16,
    gap: 12,
  },
  successText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#7ED321',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
  },
  modalBody: {
    marginBottom: 20,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  selectorInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  selectorText: {
    fontSize: 16,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  categoryOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  priorityOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  priorityOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
});
