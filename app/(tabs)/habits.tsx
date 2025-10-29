import { HabitCard } from '@/components/habit-card';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useHabits } from '@/contexts/HabitContext';
import { useTasks } from '@/contexts/TaskContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Habit, HabitPriority } from '@/types/habit';
import React, { useState } from 'react';
import { Alert, Modal, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

function HabitsScreenContent() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { state, getTodayHabits, toggleHabitCompletion, dispatch } = useHabits();
  const { categories } = useTasks().state;
  
  const [showAddHabit, setShowAddHabit] = useState(false);
  const [newHabitName, setNewHabitName] = useState('');
  const [newHabitDescription, setNewHabitDescription] = useState('');
  const [newHabitFrequency, setNewHabitFrequency] = useState<'daily' | 'weekly' | 'monthly' | 'custom'>('daily');
  const [newHabitCategory, setNewHabitCategory] = useState('Health');
  const [newHabitPriority, setNewHabitPriority] = useState<HabitPriority>('normal');
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [showCategorySelector, setShowCategorySelector] = useState(false);
  const [showFrequencySelector, setShowFrequencySelector] = useState(false);
  const [showPrioritySelector, setShowPrioritySelector] = useState(false);
  const [customDays, setCustomDays] = useState<number[]>([]);
  const [showCustomDaysSelector, setShowCustomDaysSelector] = useState(false);
  
  const todayHabits = getTodayHabits();
  const completedHabits = todayHabits.filter(habit => habit.isCompleted).length;
  const totalHabits = todayHabits.length;

  const handleAddHabit = () => {
    if (newHabitName.trim()) {
      const habit: Habit = {
        id: Date.now().toString(),
        name: newHabitName.trim(),
        description: newHabitDescription.trim() || undefined,
        frequency: newHabitFrequency,
        customDays: newHabitFrequency === 'custom' ? customDays : undefined,
        startDate: new Date().toISOString(),
        category: newHabitCategory,
        priority: newHabitPriority,
        createdAt: new Date().toISOString(),
        color: categories.find(c => c.name === newHabitCategory)?.color || '#4A90E2',
        icon: 'checkmark.circle',
      };
      dispatch({ type: 'ADD_HABIT', payload: habit });
      setNewHabitName('');
      setNewHabitDescription('');
      setNewHabitCategory('Health');
      setNewHabitFrequency('daily');
      setNewHabitPriority('normal');
      setCustomDays([]);
      setShowAddHabit(false);
    }
  };

  const handleUpdateHabit = () => {
    if (editingHabit && editingHabit.name.trim()) {
      const updatedHabit = {
        ...editingHabit,
        name: editingHabit.name.trim(),
        description: editingHabit.description?.trim() || undefined,
        category: editingHabit.category,
        priority: editingHabit.priority,
        color: categories.find(c => c.name === editingHabit.category)?.color || '#4A90E2',
      };
      dispatch({ type: 'UPDATE_HABIT', payload: updatedHabit });
      setEditingHabit(null);
    }
  };

  const handleDeleteHabit = (habitId: string, habitName: string) => {
    Alert.alert(
      'Delete Habit',
      `Are you sure you want to delete "${habitName}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => dispatch({ type: 'DELETE_HABIT', payload: habitId })
        },
      ]
    );
  };

  const openEditModal = (habit: Habit) => {
    setEditingHabit({ ...habit });
  };

  const getCategoryColor = (categoryName: string) => {
    const category = categories.find(c => c.name === categoryName);
    return category?.color || colors.tint;
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
            Build Good Habits
          </ThemedText>
          <ThemedText 
            style={styles.subtitle}
            lightColor="rgba(255, 255, 255, 0.7)"
            darkColor="rgba(255, 255, 255, 0.7)"
          >
            Track your daily habits and build consistency
          </ThemedText>
        </ThemedView>

        <View style={styles.statsCard}>
          <View style={[styles.statsGradient, { backgroundColor: colorScheme === 'dark' ? '#1A2744' : '#E8F4FD' }]}>
            <View style={styles.statsContent}>
              <View style={styles.statsText}>
                <View style={styles.statsTitleRow}>
                  <View style={[styles.statsIconCircle, { backgroundColor: colors.tint }]}>
                    <IconSymbol name="chart.bar.fill" size={20} color="white" />
                  </View>
                  <ThemedText type="subtitle" style={styles.statsTitle}>
                    Today's Progress
                  </ThemedText>
                </View>
                <ThemedText style={styles.statsDescription}>
                  {completedHabits} of {totalHabits} habits completed
                </ThemedText>
              </View>
              <View style={styles.streakContainer}>
                <IconSymbol name="flame.fill" size={32} color="#FF6B35" />
                <ThemedText style={styles.streakText}>
                  {completedHabits > 0 ? `Fire! ${completedHabits}/${totalHabits}` : 'Complete habits!'}
                </ThemedText>
              </View>
            </View>
          </View>
        </View>

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
              Your Habits
            </ThemedText>
            <TouchableOpacity 
              style={[styles.addButton, { backgroundColor: colors.tint, borderColor: colors.tint }]}
              onPress={() => setShowAddHabit(!showAddHabit)}
              activeOpacity={0.7}
            >
              <IconSymbol name="plus" size={22} color="white" />
            </TouchableOpacity>
          </View>

          {showAddHabit && (
            <ThemedView style={styles.addHabitForm}>
              <TextInput
                style={[styles.textInput, { color: colorScheme === 'dark' ? colors.text : 'white', borderColor: colorScheme === 'dark' ? colors.border : 'white' }]}
                placeholder="Habit name"
                placeholderTextColor={colorScheme === 'dark' ? colors.text + '80' : 'rgba(255, 255, 255, 0.5)'}
                value={newHabitName}
                onChangeText={setNewHabitName}
              />
              <TextInput
                style={[styles.textInput, { color: colorScheme === 'dark' ? colors.text : 'white', borderColor: colorScheme === 'dark' ? colors.border : 'white' }]}
                placeholder="Description (optional)"
                placeholderTextColor={colorScheme === 'dark' ? colors.text + '80' : 'rgba(255, 255, 255, 0.5)'}
                value={newHabitDescription}
                onChangeText={setNewHabitDescription}
                multiline
              />
              
              {/* Category Selector */}
              <TouchableOpacity
                style={[styles.textInput, styles.selectorInput, { borderColor: colorScheme === 'dark' ? colors.border : 'white' }]}
                onPress={() => setShowCategorySelector(true)}
              >
                <ThemedText 
                  style={styles.selectorText}
                  lightColor="white"
                  darkColor={undefined}
                >
                  Category: {newHabitCategory}
                </ThemedText>
                <IconSymbol name="chevron.down" size={16} color={colorScheme === 'dark' ? colors.icon : 'white'} />
              </TouchableOpacity>

              {/* Frequency Selector */}
              <TouchableOpacity
                style={[styles.textInput, styles.selectorInput, { borderColor: colorScheme === 'dark' ? colors.border : 'white' }]}
                onPress={() => setShowFrequencySelector(true)}
              >
                <ThemedText 
                  style={styles.selectorText}
                  lightColor="white"
                  darkColor={undefined}
                >
                  Frequency: {newHabitFrequency.charAt(0).toUpperCase() + newHabitFrequency.slice(1)}
                </ThemedText>
                <IconSymbol name="chevron.down" size={16} color={colorScheme === 'dark' ? colors.icon : 'white'} />
              </TouchableOpacity>

              {/* Custom Days Selector - Only show when frequency is 'custom' */}
              {newHabitFrequency === 'custom' && (
                <View style={{ marginBottom: 12 }}>
                  <TouchableOpacity
                    style={[
                      styles.textInput, 
                      styles.selectorInput, 
                      { 
                        borderColor: 'white',
                        backgroundColor: 'rgba(255, 255, 255, 0.15)',
                        borderWidth: 2
                      }
                    ]}
                    onPress={() => {
                      console.log('Opening custom days selector');
                      setShowCustomDaysSelector(true);
                    }}
                    activeOpacity={0.7}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                      <ThemedText 
                        style={[styles.selectorText, { fontWeight: '600' }]}
                        lightColor="white"
                        darkColor="white"
                      >
                        Custom Days: {customDays.length > 0 ? customDays.map(d => ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d]).join(', ') : 'Select days'}
                      </ThemedText>
                    </View>
                    <IconSymbol name="chevron.down" size={16} color="white" />
                  </TouchableOpacity>
                </View>
              )}

              {/* Priority Selector */}
              <TouchableOpacity
                style={[styles.textInput, styles.selectorInput, { borderColor: colorScheme === 'dark' ? colors.border : 'white' }]}
                onPress={() => setShowPrioritySelector(true)}
              >
                <ThemedText 
                  style={styles.selectorText}
                  lightColor="white"
                  darkColor={undefined}
                >
                  Priority: {newHabitPriority.charAt(0).toUpperCase() + newHabitPriority.slice(1)}
                </ThemedText>
                <IconSymbol name="chevron.down" size={16} color={colorScheme === 'dark' ? colors.icon : 'white'} />
              </TouchableOpacity>

              <View style={styles.formActions}>
                <TouchableOpacity 
                  style={styles.cancelButton}
                  onPress={() => {
                    setShowAddHabit(false);
                    setNewHabitName('');
                    setNewHabitDescription('');
                  }}
                >
                  <ThemedText 
                    style={styles.cancelButtonText}
                    lightColor="white"
                    darkColor={undefined}
                  >
                    Cancel
                  </ThemedText>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.saveButton, { backgroundColor: colors.tint }]}
                  onPress={handleAddHabit}
                >
                  <ThemedText style={styles.saveButtonText}>Add Habit</ThemedText>
                </TouchableOpacity>
              </View>
            </ThemedView>
          )}
          
          {todayHabits.length === 0 ? (
            <View style={styles.emptyState}>
              <IconSymbol name="checkmark.circle" size={48} color={colors.icon} />
              <ThemedText 
                style={styles.emptyTitle}
                lightColor="white"
                darkColor="white"
              >
                No habits yet
              </ThemedText>
              <ThemedText 
                style={styles.emptyDescription}
                lightColor="rgba(255, 255, 255, 0.7)"
                darkColor="rgba(255, 255, 255, 0.7)"
              >
                Start building good habits by adding your first one!
              </ThemedText>
              <TouchableOpacity 
                style={[styles.primaryButton, { backgroundColor: colors.tint }]}
                onPress={() => setShowAddHabit(true)}
              >
                <ThemedText style={styles.primaryButtonText}>Add Habit</ThemedText>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.habitsList}>
              {todayHabits.map((dailyHabit) => (
                <View key={dailyHabit.habit.id} style={styles.habitWrapper}>
                  <HabitCard
                    dailyHabit={dailyHabit}
                    onToggle={() => toggleHabitCompletion(dailyHabit.habit.id)}
                  />
                  <View style={styles.habitActions}>
                    <TouchableOpacity
                      style={styles.editButton}
                      onPress={() => openEditModal(dailyHabit.habit)}
                    >
                      <IconSymbol name="pencil" size={18} color={colors.text} />
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={styles.deleteButton}
                      onPress={() => handleDeleteHabit(dailyHabit.habit.id, dailyHabit.habit.name)}
                    >
                      <IconSymbol name="trash" size={18} color="#D0021B" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          )}
        </ThemedView>
      </ScrollView>

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
            <ScrollView style={{ maxHeight: 400 }}>
              {categories && categories.length > 0 ? (
                categories.map(cat => (
                  <TouchableOpacity
                    key={cat.id}
                    style={styles.categoryOption}
                    onPress={() => {
                      setNewHabitCategory(cat.name);
                      setShowCategorySelector(false);
                    }}
                  >
                    <View style={[styles.categoryDot, { backgroundColor: cat.color }]} />
                    <ThemedText>{cat.name}</ThemedText>
                  </TouchableOpacity>
                ))
              ) : (
                <ThemedText style={{ padding: 20, textAlign: 'center' }}>
                  No categories available
                </ThemedText>
              )}
            </ScrollView>
          </ThemedView>
        </View>
      </Modal>

      {/* Frequency Selector Modal */}
      <Modal
        visible={showFrequencySelector}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowFrequencySelector(false)}
      >
        <View style={styles.modalOverlay}>
          <ThemedView style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <ThemedText type="subtitle" style={styles.modalTitle}>Select Frequency</ThemedText>
              <TouchableOpacity onPress={() => setShowFrequencySelector(false)}>
                <IconSymbol name="xmark.circle.fill" size={24} color={colors.icon} />
              </TouchableOpacity>
            </View>
            {(['daily', 'weekly', 'monthly', 'custom'] as const).map(frequency => (
              <TouchableOpacity
                key={frequency}
                style={styles.frequencyOption}
                onPress={() => {
                  setNewHabitFrequency(frequency);
                  setShowFrequencySelector(false);
                }}
              >
                <ThemedText>{frequency.charAt(0).toUpperCase() + frequency.slice(1)}</ThemedText>
              </TouchableOpacity>
            ))}
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
            {(['important', 'normal', 'low'] as HabitPriority[]).map(priority => (
              <TouchableOpacity
                key={priority}
                style={styles.priorityOption}
                onPress={() => {
                  setNewHabitPriority(priority);
                  setShowPrioritySelector(false);
                }}
              >
                <ThemedText>{priority.charAt(0).toUpperCase() + priority.slice(1)}</ThemedText>
              </TouchableOpacity>
            ))}
          </ThemedView>
        </View>
      </Modal>

      {/* Custom Days Selector Modal */}
      <Modal
        visible={showCustomDaysSelector}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCustomDaysSelector(false)}
      >
        <View style={styles.modalOverlay}>
          <ThemedView style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <ThemedText type="subtitle" style={styles.modalTitle}>Select Days</ThemedText>
              <TouchableOpacity onPress={() => setShowCustomDaysSelector(false)}>
                <IconSymbol name="xmark.circle.fill" size={24} color={colors.icon} />
              </TouchableOpacity>
            </View>
            {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day, index) => (
              <TouchableOpacity
                key={day}
                style={[
                  styles.customDayOption,
                  customDays.includes(index) && { backgroundColor: colors.tint + '20' }
                ]}
                onPress={() => {
                  if (customDays.includes(index)) {
                    setCustomDays(customDays.filter(d => d !== index));
                  } else {
                    setCustomDays([...customDays, index]);
                  }
                }}
              >
                <ThemedText>{day}</ThemedText>
                {customDays.includes(index) && (
                  <IconSymbol name="checkmark.circle.fill" size={20} color={colors.tint} />
                )}
              </TouchableOpacity>
            ))}
          </ThemedView>
        </View>
      </Modal>

      {/* Edit Habit Modal */}
      <Modal
        visible={editingHabit !== null}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setEditingHabit(null)}
      >
        <View style={styles.modalOverlay}>
          <ThemedView style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <ThemedText type="subtitle" style={styles.modalTitle}>Edit Habit</ThemedText>
              <TouchableOpacity onPress={() => setEditingHabit(null)}>
                <IconSymbol name="xmark.circle.fill" size={24} color={colors.icon} />
              </TouchableOpacity>
            </View>

            {editingHabit && (
              <ScrollView>
                <TextInput
                  style={[styles.textInput, { color: colors.text, borderColor: colors.border }]}
                  placeholder="Habit name"
                  placeholderTextColor={colors.text + '80'}
                  value={editingHabit.name}
                  onChangeText={(text) => setEditingHabit({ ...editingHabit, name: text })}
                />
                <TextInput
                  style={[styles.textInput, { color: colors.text, borderColor: colors.border }]}
                  placeholder="Description (optional)"
                  placeholderTextColor={colors.text + '80'}
                  value={editingHabit.description || ''}
                  onChangeText={(text) => setEditingHabit({ ...editingHabit, description: text })}
                  multiline
                />

                <View style={styles.modalActions}>
                  <TouchableOpacity 
                    style={styles.cancelButton}
                    onPress={() => setEditingHabit(null)}
                  >
                    <ThemedText style={styles.cancelButtonText}>Cancel</ThemedText>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.saveButton, { backgroundColor: colors.tint }]}
                    onPress={handleUpdateHabit}
                  >
                    <ThemedText style={styles.saveButtonText}>Save Changes</ThemedText>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            )}
          </ThemedView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

export default function HabitsScreen() {
  return <HabitsScreenContent />;
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
    paddingBottom: 0,
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
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statsGradient: {
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
  statsTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statsIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  statsTitle: {
    fontSize: 18,
  },
  statsDescription: {
    opacity: 0.8,
    fontSize: 14,
  },
  streakContainer: {
    alignItems: 'center',
  },
  streakText: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
    color: '#FF6B35',
  },
  habitsSection: {
    paddingHorizontal: 20,
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
  },
  habitsList: {
    gap: 14,
  },
  habitWrapper: {
    position: 'relative',
  },
  habitActions: {
    position: 'absolute',
    right: 16,
    top: 16,
    flexDirection: 'row',
    gap: 8,
  },
  editButton: {
    padding: 8,
  },
  deleteButton: {
    padding: 8,
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
    paddingVertical: 14,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  primaryButtonText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 16,
    letterSpacing: 0.5,
  },
  addHabitForm: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    marginBottom: 12,
  },
  selectorInput: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectorText: {
    flex: 1,
  },
  formActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  cancelButtonText: {
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  saveButtonText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 16,
    letterSpacing: 0.5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
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
  categoryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  categoryDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  frequencyOption: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  priorityOption: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  customDayOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
});
