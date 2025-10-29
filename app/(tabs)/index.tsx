import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useTasks } from '@/contexts/TaskContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Priority, Task } from '@/types/task';
import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useState } from 'react';
import { Alert, Modal, Platform, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

function TasksScreenContent() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { state, addTask, updateTask, deleteTask, toggleTaskCompletion } = useTasks();
  
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTaskName, setNewTaskName] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [newTaskCategory, setNewTaskCategory] = useState('Work');
  const [newTaskPriority, setNewTaskPriority] = useState<Priority>('normal');
  const [newTaskDeadline, setNewTaskDeadline] = useState<Date | null>(null);
  const [showCategorySelector, setShowCategorySelector] = useState(false);
  const [showPrioritySelector, setShowPrioritySelector] = useState(false);
  const [showDeadlinePicker, setShowDeadlinePicker] = useState(false);
  
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  
  const totalTasks = state.tasks.length;
  const completedTasks = state.tasks.filter(task => task.completed).length;
  
  const handleAddTask = () => {
    if (newTaskName.trim()) {
      addTask({
        name: newTaskName.trim(),
        description: newTaskDescription.trim() || undefined,
        category: newTaskCategory,
        priority: newTaskPriority,
        deadline: newTaskDeadline?.toISOString(),
        completed: false,
      });
      setNewTaskName('');
      setNewTaskDescription('');
      setNewTaskCategory('Work');
      setNewTaskPriority('normal');
      setNewTaskDeadline(null);
      setShowAddTask(false);
    }
  };

  const handleUpdateTask = () => {
    if (editingTask && editingTask.name.trim()) {
      updateTask({
        ...editingTask,
        name: editingTask.name.trim(),
        description: editingTask.description?.trim() || undefined,
      });
      setEditingTask(null);
      setShowEditModal(false);
    }
  };

  const handleDeleteTask = (taskId: string, taskName: string) => {
    Alert.alert(
      'Delete Task',
      `Are you sure you want to delete "${taskName}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => deleteTask(taskId)
        },
      ]
    );
  };

  const openEditModal = (task: Task) => {
    setEditingTask({ ...task });
    setShowEditModal(true);
  };

  const getCategoryColor = (categoryName: string) => {
    const category = state.categories.find(c => c.name === categoryName);
    return category?.color || colors.tint;
  };

  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case 'important': return '#D0021B';
      case 'normal': return '#F5A623';
      case 'low': return '#7ED321';
      default: return colors.tint;
    }
  };

  const getPriorityIcon = (priority: Priority) => {
    switch (priority) {
      case 'important': return 'exclamationmark.triangle.fill';
      case 'normal': return 'circle.fill';
      case 'low': return 'arrow.down.circle.fill';
      default: return 'circle.fill';
    }
  };

  const sortedTasks = [...state.tasks].sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    if (a.priority !== b.priority) {
      const priorityOrder = { important: 3, normal: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

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
            Tasks
          </ThemedText>
          <ThemedText 
            style={styles.subtitle}
            lightColor="rgba(255, 255, 255, 0.7)"
            darkColor="rgba(255, 255, 255, 0.7)"
          >
            Manage your daily tasks and stay productive
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
                  {completedTasks} of {totalTasks} tasks completed
                </ThemedText>
              </View>
              <View style={[styles.progressCircle, { backgroundColor: colors.tint + (colorScheme === 'dark' ? '30' : '20') }]}>
                <View style={[styles.progressInnerCircle, { backgroundColor: colors.tint }]}>
                  <ThemedText style={styles.progressText}>
                    {totalTasks > 0 ? `${Math.round((completedTasks / totalTasks) * 100)}%` : '0%'}
                  </ThemedText>
                </View>
              </View>
            </View>
          </View>
        </View>

        <ThemedView 
          style={styles.tasksSection}
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
              Your Tasks
            </ThemedText>
            <TouchableOpacity 
              style={[styles.addButton, { backgroundColor: colors.tint, borderColor: colors.tint }]}
              onPress={() => setShowAddTask(!showAddTask)}
              activeOpacity={0.7}
            >
              <IconSymbol name="plus" size={22} color="white" />
            </TouchableOpacity>
          </View>

          {showAddTask && (
            <ThemedView style={styles.addTaskForm}>
              <TextInput
                style={[styles.textInput, { color: colorScheme === 'dark' ? colors.text : 'white', borderColor: colorScheme === 'dark' ? colors.border : 'white' }]}
                placeholder="Task name"
                placeholderTextColor={colorScheme === 'dark' ? colors.text + '80' : 'rgba(255, 255, 255, 0.5)'}
                value={newTaskName}
                onChangeText={setNewTaskName}
              />
              <TextInput
                style={[styles.textInput, { color: colorScheme === 'dark' ? colors.text : 'white', borderColor: colorScheme === 'dark' ? colors.border : 'white' }]}
                placeholder="Description (optional)"
                placeholderTextColor={colorScheme === 'dark' ? colors.text + '80' : 'rgba(255, 255, 255, 0.5)'}
                value={newTaskDescription}
                onChangeText={setNewTaskDescription}
                multiline
              />
              
              <TouchableOpacity
                style={[styles.textInput, styles.selectorInput, { borderColor: colorScheme === 'dark' ? colors.border : 'white' }]}
                onPress={() => setShowCategorySelector(true)}
              >
                <ThemedText 
                  style={styles.selectorText}
                  lightColor="white"
                  darkColor={undefined}
                >
                  Category: {newTaskCategory}
                </ThemedText>
                <IconSymbol name="chevron.down" size={16} color={colorScheme === 'dark' ? colors.icon : 'white'} />
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.textInput, styles.selectorInput, { borderColor: colorScheme === 'dark' ? colors.border : 'white' }]}
                onPress={() => setShowPrioritySelector(true)}
              >
                <ThemedText 
                  style={styles.selectorText}
                  lightColor="white"
                  darkColor={undefined}
                >
                  Priority: {newTaskPriority.charAt(0).toUpperCase() + newTaskPriority.slice(1)}
                </ThemedText>
                <IconSymbol name="chevron.down" size={16} color={colorScheme === 'dark' ? colors.icon : 'white'} />
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.textInput, styles.selectorInput, { borderColor: colorScheme === 'dark' ? colors.border : 'white' }]}
                onPress={() => setShowDeadlinePicker(true)}
              >
                <ThemedText 
                  style={styles.selectorText}
                  lightColor="white"
                  darkColor={undefined}
                >
                  Deadline: {newTaskDeadline ? newTaskDeadline.toLocaleDateString() : 'None'}
                </ThemedText>
                <IconSymbol name="calendar" size={16} color={colorScheme === 'dark' ? colors.icon : 'white'} />
              </TouchableOpacity>

              {showDeadlinePicker && (
                <DateTimePicker
                  value={newTaskDeadline || new Date()}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={(event, selectedDate) => {
                    setShowDeadlinePicker(Platform.OS === 'ios');
                    setNewTaskDeadline(selectedDate || null);
                  }}
                />
              )}

              <View style={styles.formActions}>
                <TouchableOpacity 
                  style={styles.cancelButton}
                  onPress={() => {
                    setShowAddTask(false);
                    setNewTaskName('');
                    setNewTaskDescription('');
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
                  onPress={handleAddTask}
                >
                  <ThemedText style={styles.saveButtonText}>Add Task</ThemedText>
                </TouchableOpacity>
              </View>
            </ThemedView>
          )}
          
          {sortedTasks.length === 0 ? (
            <View style={styles.emptyState}>
              <IconSymbol name="list.bullet" size={48} color={colors.icon} />
              <ThemedText 
                style={styles.emptyTitle}
                lightColor="white"
                darkColor="white"
              >
                No tasks yet
              </ThemedText>
              <ThemedText 
                style={styles.emptyDescription}
                lightColor="rgba(255, 255, 255, 0.7)"
                darkColor="rgba(255, 255, 255, 0.7)"
              >
                Start organizing your day by adding your first task!
              </ThemedText>
              <TouchableOpacity 
                style={[styles.primaryButton, { backgroundColor: colors.tint }]}
                onPress={() => setShowAddTask(true)}
                activeOpacity={0.8}
              >
                <ThemedText style={styles.primaryButtonText}>+ Add Task</ThemedText>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.tasksList}>
              {sortedTasks.map((task) => (
                <ThemedView 
                  key={task.id} 
                  style={styles.taskCard}
                  darkColor="#1E1E1E"
                >
                  <View style={styles.taskHeader}>
                    <TouchableOpacity 
                      style={[
                        styles.completeButton,
                        { 
                          borderColor: task.completed ? (colorScheme === 'dark' ? '#6FCF97' : "#7ED321") : (colorScheme === 'dark' ? '#9BA1A6' : '#1A1A1A'),
                          backgroundColor: task.completed ? (colorScheme === 'dark' ? '#6FCF97' : "#7ED321") : 'transparent'
                        }
                      ]}
                      onPress={() => toggleTaskCompletion(task.id)}
                      activeOpacity={0.7}
                    >
                      {task.completed && (
                        <IconSymbol 
                          name="checkmark" 
                          size={16} 
                          color="white" 
                        />
                      )}
                    </TouchableOpacity>
                    <View style={styles.taskInfo}>
                      <View style={styles.priorityIndicator}>
                        <IconSymbol 
                          name={getPriorityIcon(task.priority)} 
                          size={16} 
                          color={getPriorityColor(task.priority)} 
                        />
                      </View>
                      <View style={styles.taskDetails}>
                        <ThemedText 
                          type="defaultSemiBold" 
                          style={[
                            styles.taskName,
                            task.completed && styles.completedTask
                          ]}
                        >
                          {task.name}
                        </ThemedText>
                        {task.description && (
                          <ThemedText 
                            style={[
                              styles.taskDescription,
                              task.completed && styles.completedTask
                            ]}
                          >
                            {task.description}
                          </ThemedText>
                        )}
                        <View style={styles.taskMeta}>
                          <ThemedText 
                            style={[styles.taskCategory, { color: getCategoryColor(task.category) }]}
                          >
                            {task.category}
                          </ThemedText>
                          {task.deadline && (
                            <ThemedText style={styles.taskDeadline}>
                              {new Date(task.deadline).toLocaleDateString()}
                            </ThemedText>
                          )}
                        </View>
                      </View>
                    </View>
                    <View style={styles.taskActions}>
                      <TouchableOpacity
                        style={styles.editButton}
                        onPress={() => openEditModal(task)}
                      >
                        <IconSymbol name="pencil" size={18} color={colors.text} />
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={styles.deleteButton}
                        onPress={() => handleDeleteTask(task.id, task.name)}
                      >
                        <IconSymbol name="trash" size={18} color="#D0021B" />
                      </TouchableOpacity>
                    </View>
                  </View>
                </ThemedView>
              ))}
            </View>
          )}
        </ThemedView>
      </ScrollView>

      <Modal
        visible={showCategorySelector}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCategorySelector(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowCategorySelector(false)}
        >
          <ThemedView 
            style={styles.modalContent}
            lightColor="#3C1518"
            darkColor="#D58936"
          >
            <ThemedText style={styles.modalTitle}>Select Category</ThemedText>
            {state.categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryOption,
                  newTaskCategory === category.name && { backgroundColor: colors.tint + '20' }
                ]}
                onPress={() => {
                  setNewTaskCategory(category.name);
                  setShowCategorySelector(false);
                }}
              >
                <View style={[styles.categoryIcon, { backgroundColor: category.color }]}>
                  <IconSymbol name={(category.icon as any) || 'folder.fill'} size={20} color="white" />
                </View>
                <ThemedText style={styles.categoryOptionText}>{category.name}</ThemedText>
                {newTaskCategory === category.name && (
                  <IconSymbol name="checkmark" size={20} color={colors.tint} />
                )}
              </TouchableOpacity>
            ))}
          </ThemedView>
        </TouchableOpacity>
      </Modal>

      <Modal
        visible={showPrioritySelector}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPrioritySelector(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowPrioritySelector(false)}
        >
          <ThemedView 
            style={styles.modalContent}
            lightColor="#3C1518"
            darkColor="#D58936"
          >
            <ThemedText style={styles.modalTitle}>Select Priority</ThemedText>
            {(['important', 'normal', 'low'] as Priority[]).map((priority) => (
              <TouchableOpacity
                key={priority}
                style={[
                  styles.priorityOption,
                  newTaskPriority === priority && { backgroundColor: colors.tint + '20' }
                ]}
                onPress={() => {
                  setNewTaskPriority(priority);
                  setShowPrioritySelector(false);
                }}
              >
                <IconSymbol 
                  name={getPriorityIcon(priority)} 
                  size={20} 
                  color={getPriorityColor(priority)} 
                />
                <ThemedText style={styles.priorityOptionText}>
                  {priority.charAt(0).toUpperCase() + priority.slice(1)}
                </ThemedText>
                {newTaskPriority === priority && (
                  <IconSymbol name="checkmark" size={20} color={colors.tint} />
                )}
              </TouchableOpacity>
            ))}
          </ThemedView>
        </TouchableOpacity>
      </Modal>

      <Modal
        visible={showEditModal}
        transparent
        animationType="slide"
        onRequestClose={() => {
          setShowEditModal(false);
          setEditingTask(null);
        }}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => {
            setShowEditModal(false);
            setEditingTask(null);
          }}
        >
          <ThemedView 
            style={styles.modalContent}
            lightColor="#3C1518"
            darkColor="#D58936"
          >
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>Edit Task</ThemedText>
              <TouchableOpacity onPress={() => {
                setShowEditModal(false);
                setEditingTask(null);
              }}>
                <IconSymbol name="xmark.circle.fill" size={28} color={colors.text} />
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.textInput}
              placeholder="Task name"
              placeholderTextColor={colors.text + '80'}
              value={editingTask?.name || ''}
              onChangeText={(text) => editingTask && setEditingTask({ ...editingTask, name: text })}
            />
            <TextInput
              style={styles.textInput}
              placeholder="Description"
              placeholderTextColor={colors.text + '80'}
              value={editingTask?.description || ''}
              onChangeText={(text) => editingTask && setEditingTask({ ...editingTask, description: text })}
              multiline
            />
            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => {
                  setShowEditModal(false);
                  setEditingTask(null);
                }}
              >
                <ThemedText style={styles.cancelButtonText}>Cancel</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.saveButton, { backgroundColor: colors.tint }]}
                onPress={handleUpdateTask}
              >
                <ThemedText style={styles.saveButtonText}>Save</ThemedText>
              </TouchableOpacity>
            </View>
          </ThemedView>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

export default function TasksScreen() {
  return <TasksScreenContent />;
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
    padding: 20,
    paddingTop: 10,
  },
  title: {
    marginBottom: 4,
  },
  subtitle: {
    opacity: 0.7,
    fontSize: 14,
  },
  statsCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    overflow: 'hidden',
  },
  statsGradient: {
    padding: 20,
  },
  statsContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statsText: {
    flex: 1,
  },
  statsTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  statsIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsTitle: {
    fontSize: 18,
  },
  statsDescription: {
    opacity: 0.7,
    fontSize: 14,
  },
  progressCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressInnerCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '700',
  },
  tasksSection: {
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
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  addTaskForm: {
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.02)',
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
    fontSize: 16,
  },
  selectorInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectorText: {
    flex: 1,
  },
  formActions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
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
  tasksList: {
    gap: 12,
  },
  taskCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  taskHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  completeButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  taskInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  priorityIndicator: {
    marginTop: 2,
  },
  taskDetails: {
    flex: 1,
  },
  taskName: {
    fontSize: 16,
    marginBottom: 4,
  },
  taskDescription: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 8,
  },
  taskMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  taskCategory: {
    fontSize: 12,
    fontWeight: '600',
  },
  taskDeadline: {
    fontSize: 12,
    opacity: 0.6,
  },
  taskActions: {
    flexDirection: 'row',
    gap: 8,
  },
  editButton: {
    padding: 8,
  },
  deleteButton: {
    padding: 8,
  },
  completedTask: {
    textDecorationLine: 'line-through',
    opacity: 0.6,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    opacity: 0.7,
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 40,
  },
  primaryButton: {
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxWidth: 400,
    padding: 24,
    borderRadius: 16,
    gap: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  categoryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  categoryIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryOptionText: {
    flex: 1,
    fontSize: 16,
  },
  priorityOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  priorityOptionText: {
    flex: 1,
    fontSize: 16,
  },
});
