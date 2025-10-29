import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useHabits } from '@/contexts/HabitContext';
import { useLeaveHabits } from '@/contexts/LeaveHabitContext';
import { useTasks } from '@/contexts/TaskContext';
import { useTheme } from '@/contexts/ThemeContext';
import { storage } from '@/utils/storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { useState } from 'react';
import { Alert, Linking, Modal, Platform, ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

function AdminScreenContent() {
  const { colorScheme, setThemeMode, themeMode } = useTheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { state, addCategory, updateCategory, deleteCategory } = useTasks();
  const { state: habitsState } = useHabits();
  const { state: leaveHabitsState } = useLeaveHabits();

  const openLinkedIn = (url: string) => {
    Linking.openURL(url).catch((err) => console.error('Failed to open LinkedIn:', err));
  };
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryColor, setNewCategoryColor] = useState('#4A90E2');
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [showExportOptions, setShowExportOptions] = useState(false);
  const [exportFilter, setExportFilter] = useState<'all' | 'monthly' | 'custom'>('all');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [startDate, setStartDate] = useState(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)); // 30 days ago
  const [endDate, setEndDate] = useState(new Date());
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  const { tasks, categories } = state;

  // Handle notification toggle
  const handleNotificationToggle = (value: boolean) => {
    setNotificationsEnabled(value);
    Alert.alert(
      'Notifications',
      value 
        ? 'Notifications are now enabled. You will receive reminders for your habits.' 
        : 'Notifications are now disabled.'
    );
  };

  const handleAddCategory = () => {
    if (newCategoryName.trim()) {
      addCategory({
        name: newCategoryName.trim(),
        color: newCategoryColor,
        icon: 'folder.fill',
      });
      setNewCategoryName('');
      setShowAddCategory(false);
    }
  };

  const handleEditCategory = (categoryId: string) => {
    setEditingCategory(categoryId);
    const category = categories.find(c => c.id === categoryId);
    if (category) {
      setNewCategoryName(category.name);
      setNewCategoryColor(category.color);
      setShowAddCategory(true);
    }
  };

  const handleSaveCategory = () => {
    if (newCategoryName.trim() && editingCategory) {
      const category = categories.find(c => c.id === editingCategory);
      if (category) {
        updateCategory({
          ...category,
          name: newCategoryName.trim(),
          color: newCategoryColor,
        });
        setNewCategoryName('');
        setNewCategoryColor('#4A90E2');
        setEditingCategory(null);
        setShowAddCategory(false);
      }
    }
  };

  const handleDeleteCategory = (categoryId: string, categoryName: string) => {
    const tasksInCategory = tasks.filter(task => task.category === categoryName);
    
    if (tasksInCategory.length > 0) {
      Alert.alert(
        'Cannot Delete Category',
        `This category has ${tasksInCategory.length} task(s). Please move or delete the tasks first.`,
        [{ text: 'OK' }]
      );
      return;
    }

    Alert.alert(
      'Delete Category',
      `Are you sure you want to delete "${categoryName}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => deleteCategory(categoryId)
        },
      ]
    );
  };

  const getFilteredTasks = () => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    switch (exportFilter) {
      case 'monthly':
        return tasks.filter(task => {
          if (task.createdAt) {
            const taskDate = new Date(task.createdAt);
            return taskDate >= startOfMonth;
          }
          return false;
        });
      case 'custom':
        return tasks.filter(task => {
          if (task.createdAt) {
            const taskDate = new Date(task.createdAt);
            return taskDate >= startDate && taskDate <= endDate;
          }
          return false;
        });
      default:
        return tasks;
    }
  };

  const handleExportData = async () => {
    try {
      const filteredTasks = getFilteredTasks();
      
      // Helper function to convert array to CSV
      const arrayToCSV = (data: any[], headers: string[]): string => {
        const rows = [headers.join(',')];
        data.forEach(item => {
          const values = headers.map(header => {
            const value = item[header] || '';
            // Escape commas and quotes in values
            return `"${String(value).replace(/"/g, '""')}"`;
          });
          rows.push(values.join(','));
        });
        return rows.join('\n');
      };
      
      // Generate CSV content
      let csvContent = '=== TASKS ===\n';
      csvContent += arrayToCSV(
        filteredTasks.map(task => ({
          Title: task.name,
          Category: task.category,
          Priority: task.priority,
          Status: task.completed ? 'Completed' : 'Pending',
          Deadline: task.deadline ? new Date(task.deadline).toLocaleDateString() : 'N/A',
          Created: task.createdAt ? new Date(task.createdAt).toLocaleDateString() : 'N/A',
        })),
        ['Title', 'Category', 'Priority', 'Status', 'Deadline', 'Created']
      );
      
      csvContent += '\n\n=== HABITS ===\n';
      csvContent += arrayToCSV(
        habitsState.habits.map(habit => {
          const stats = habitsState.stats.find(s => s.habitId === habit.id);
          return {
            Name: habit.name,
            Category: habit.category,
            Frequency: habit.frequency,
            Priority: habit.priority,
            'Current Streak': stats?.currentStreak || 0,
            Created: habit.createdAt ? new Date(habit.createdAt).toLocaleDateString() : 'N/A',
          };
        }),
        ['Name', 'Category', 'Frequency', 'Priority', 'Current Streak', 'Created']
      );
      
      csvContent += '\n\n=== LEAVE HABITS ===\n';
      csvContent += arrayToCSV(
        leaveHabitsState.leaveHabits.map(habit => ({
          Name: habit.name,
          Description: habit.description || 'N/A',
          Priority: habit.priority,
          Streak: habit.streak,
          Created: habit.createdAt ? new Date(habit.createdAt).toLocaleDateString() : 'N/A',
        })),
        ['Name', 'Description', 'Priority', 'Streak', 'Created']
      );
      
      csvContent += '\n\n=== CATEGORIES ===\n';
      csvContent += arrayToCSV(
        categories.map(category => ({
          Name: category.name,
          Color: category.color,
        })),
        ['Name', 'Color']
      );
      
      // Create filename with timestamp
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const fileName = `habit_tracker_export_${timestamp}.csv`;
      
      // Create the file (will be shared)
      const fileUri = `${FileSystem.documentDirectory || ''}${fileName}`;
      
      // Write the file
      await FileSystem.writeAsStringAsync(fileUri, csvContent);
      
      console.log('File saved to:', fileUri);
      
      // Share the file - this will open share dialog where user can save to Downloads
      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'text/csv',
          dialogTitle: 'Save Habit Tracker Data',
          UTI: 'public.comma-separated-values-text',
        });
        
        Alert.alert(
          'Export Successful!',
          `Exported ${filteredTasks.length} tasks, ${habitsState.habits.length} habits, ${leaveHabitsState.leaveHabits.length} leave habits, and ${categories.length} categories to CSV.\n\nUse the share menu to save to Downloads.`,
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          'Export Data',
          `Exported to CSV but sharing is not available.\nFile saved to: ${fileUri}`,
          [{ text: 'OK' }]
        );
      }
      
      setShowExportOptions(false);
    } catch (error) {
      console.error('Export error:', error);
      Alert.alert('Export Failed', `Could not export data. Error: ${error}`);
    }
  };

  const handleClearAllData = () => {
    Alert.alert(
      'Clear All Data',
      'This will delete all tasks, habits, and settings. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear All', 
          style: 'destructive',
          onPress: async () => {
            await storage.clearAllData();
            Alert.alert('Data Cleared', 'All data has been cleared. Please restart the app to see changes.');
          }
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
                 <ThemedView style={styles.header}>
           <ThemedText type="title" style={styles.title}>
             Settings
           </ThemedText>
           <ThemedText style={styles.subtitle}>
             Manage categories, export data, and app settings
           </ThemedText>
         </ThemedView>

                 {/* Category Management */}
         <ThemedView 
           style={styles.section}
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
              Category Management
            </ThemedText>
                         <TouchableOpacity 
               style={[styles.addButton, colorScheme === 'dark' && { backgroundColor: '#4FD1C7' }]}
               onPress={() => {
                 setShowAddCategory(!showAddCategory);
                 setEditingCategory(null);
                 setNewCategoryName('');
               }}
             >
               <IconSymbol name="plus" size={20} color={colorScheme === 'dark' ? '#FFFFFF' : colors.tint} />
             </TouchableOpacity>
          </View>

          {showAddCategory && (
            <ThemedView style={styles.addCategoryForm}>
              <TextInput
                style={[styles.textInput, { color: colors.text, borderColor: colors.border }]}
                placeholder="Category name"
                placeholderTextColor={colors.text + '80'}
                value={newCategoryName}
                onChangeText={setNewCategoryName}
              />
              <View style={styles.colorPicker}>
                {['#4A90E2', '#7ED321', '#F5A623', '#D0021B', '#9013FE'].map((color) => (
                  <TouchableOpacity
                    key={color}
                    style={[
                      styles.colorOption,
                      { backgroundColor: color },
                      newCategoryColor === color && styles.selectedColor
                    ]}
                    onPress={() => setNewCategoryColor(color)}
                  />
                ))}
              </View>
              <View style={styles.formActions}>
                <TouchableOpacity 
                  style={styles.cancelButton}
                  onPress={() => {
                    setShowAddCategory(false);
                    setEditingCategory(null);
                  }}
                >
                  <ThemedText style={styles.cancelButtonText}>Cancel</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.saveButton, { backgroundColor: colors.tint }]}
                  onPress={editingCategory ? handleSaveCategory : handleAddCategory}
                >
                  <ThemedText style={styles.saveButtonText}>
                    {editingCategory ? 'Update' : 'Save'}
                  </ThemedText>
                </TouchableOpacity>
              </View>
            </ThemedView>
          )}

          <View style={styles.categoriesList}>
            {categories.map((category) => (
              <View key={category.id} style={styles.categoryItem}>
                <View style={styles.categoryInfo}>
                  <IconSymbol name={(category.icon || 'folder.fill') as any} size={24} color={category.color} />
                  <ThemedText 
                    type="defaultSemiBold" 
                    style={styles.categoryName}
                    lightColor="white"
                    darkColor={undefined}
                  >
                    {category.name}
                  </ThemedText>
                </View>
                <View style={styles.categoryActions}>
                  <TouchableOpacity 
                    style={styles.editButton}
                    onPress={() => handleEditCategory(category.id)}
                  >
                    <IconSymbol name="pencil" size={18} color="white" />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.deleteButton}
                    onPress={() => handleDeleteCategory(category.id, category.name)}
                  >
                    <IconSymbol name="trash" size={18} color="#D0021B" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        </ThemedView>

                 {/* Data Management */}
         <ThemedView 
           style={styles.section}
           lightColor="#3C1518"
           darkColor="#D58936"
         >
          <ThemedText 
            type="subtitle" 
            style={styles.sectionTitle}
            lightColor="white"
            darkColor={undefined}
          >
            Data Management
          </ThemedText>
          
          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={() => setShowExportOptions(true)}
          >
            <View style={styles.actionButtonContent}>
              <IconSymbol name="square.and.arrow.up" size={24} color={colors.tint} />
              <View style={styles.actionButtonText}>
                <ThemedText type="defaultSemiBold" style={colorScheme === 'light' ? { color: 'white' } : {}}>
                  Export Data
                </ThemedText>
                <ThemedText style={[styles.actionButtonSubtext, colorScheme === 'light' ? { color: 'rgba(255,255,255,0.7)' } : {}]}>
                  Export as CSV/JSON
                </ThemedText>
              </View>
            </View>
                         <IconSymbol name="chevron.right" size={16} color={colorScheme === 'dark' ? '#FFFFFF' : colors.icon} />
           </TouchableOpacity>

           <TouchableOpacity style={styles.actionButton} onPress={handleClearAllData}>
             <View style={styles.actionButtonContent}>
               <IconSymbol name="trash" size={24} color="#D0021B" />
               <View style={styles.actionButtonText}>
                 <ThemedText type="defaultSemiBold" style={colorScheme === 'light' ? { color: 'white' } : {}}>
                   Clear All Data
                 </ThemedText>
                 <ThemedText style={[styles.actionButtonSubtext, colorScheme === 'light' ? { color: 'rgba(255,255,255,0.7)' } : {}]}>
                   Reset app to initial state
                 </ThemedText>
               </View>
             </View>
             <IconSymbol name="chevron.right" size={16} color={colorScheme === 'dark' ? '#FFFFFF' : colors.icon} />
          </TouchableOpacity>
        </ThemedView>

                 {/* General Settings */}
         <ThemedView 
           style={styles.section}
           lightColor="#3C1518"
           darkColor="#D58936"
         >
          <ThemedText 
            type="subtitle" 
            style={styles.sectionTitle}
            lightColor="white"
            darkColor={undefined}
          >
            General Settings
          </ThemedText>
          
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <IconSymbol name="moon.fill" size={24} color={colors.icon} />
              <View style={styles.settingText}>
                <ThemedText type="defaultSemiBold" style={colorScheme === 'light' ? { color: 'white' } : {}}>
                  Dark Mode
                </ThemedText>
                <ThemedText style={[styles.actionButtonSubtext, colorScheme === 'light' ? { color: 'rgba(255,255,255,0.7)' } : {}]}>
                  Toggle dark/light theme
                </ThemedText>
              </View>
            </View>
            <Switch
              value={colorScheme === 'dark'}
              onValueChange={(value) => {
                const newMode = value ? 'dark' : 'light';
                setThemeMode(newMode);
              }}
              trackColor={{ false: '#767577', true: colors.tint }}
              thumbColor={colorScheme === 'dark' ? '#ffffff' : '#f4f3f4'}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <IconSymbol name="bell.fill" size={24} color={colors.icon} />
              <View style={styles.settingText}>
                <ThemedText type="defaultSemiBold" style={colorScheme === 'light' ? { color: 'white' } : {}}>
                  Notifications
                </ThemedText>
                <ThemedText style={[styles.actionButtonSubtext, colorScheme === 'light' ? { color: 'rgba(255,255,255,0.7)' } : {}]}>
                  Enable/disable notifications
                </ThemedText>
              </View>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={handleNotificationToggle}
              trackColor={{ false: '#767577', true: colors.tint }}
              thumbColor={notificationsEnabled ? '#ffffff' : '#f4f3f4'}
            />
          </View>
        </ThemedView>

                 {/* App Info */}
         <ThemedView 
           style={styles.section}
           lightColor="#3C1518"
           darkColor="#D58936"
         >
          <ThemedText 
            type="subtitle" 
            style={styles.sectionTitle}
            lightColor="white"
            darkColor={undefined}
          >
            App Information
          </ThemedText>
          
          <View style={styles.infoItem}>
            <ThemedText style={[styles.infoLabel, colorScheme === 'light' ? { color: 'rgba(255,255,255,0.7)' } : {}]}>
              Total Tasks
            </ThemedText>
            <ThemedText style={[styles.infoValue, colorScheme === 'light' ? { color: 'white' } : {}]}>
              {tasks.length}
            </ThemedText>
          </View>
          
          <View style={styles.infoItem}>
            <ThemedText style={[styles.infoLabel, colorScheme === 'light' ? { color: 'rgba(255,255,255,0.7)' } : {}]}>
              Categories
            </ThemedText>
            <ThemedText style={[styles.infoValue, colorScheme === 'light' ? { color: 'white' } : {}]}>
              {categories.length}
            </ThemedText>
          </View>
        </ThemedView>

        {/* Credits */}
        <ThemedView 
          style={styles.section}
          lightColor="#3C1518"
          darkColor="#D58936"
        >
          <ThemedText 
            type="subtitle" 
            style={styles.sectionTitle}
            lightColor="white"
            darkColor={undefined}
          >
            Credits
          </ThemedText>
          
          <View style={styles.creditItem}>
            <View style={styles.creditInfo}>
              <IconSymbol name="person.fill" size={24} color="#4A90E2" />
              <View style={styles.creditDetails}>
                <ThemedText 
                  type="defaultSemiBold"
                  style={styles.creditRole}
                  lightColor="white"
                  darkColor={undefined}
                >
                  Developed by
                </ThemedText>
                <ThemedText 
                  style={styles.creditName}
                  lightColor="rgba(255,255,255,0.9)"
                  darkColor={undefined}
                >
                  Pavethran D
                </ThemedText>
              </View>
            </View>
            <TouchableOpacity 
              style={[styles.linkedinButton, { backgroundColor: '#0077B5' }]}
              onPress={() => openLinkedIn('https://in.linkedin.com/in/pavethran')}
            >
              <Text style={styles.linkedinText}>in</Text>
            </TouchableOpacity>
          </View>

        </ThemedView>
      </ScrollView>

             {/* Export Options Modal */}
       <Modal
         visible={showExportOptions}
         animationType="slide"
         transparent={true}
         onRequestClose={() => setShowExportOptions(false)}
       >
         <View style={styles.modalOverlay}>
           <ThemedView 
             style={styles.modalContent}
             lightColor="white"
             darkColor="#D58936"
           >
                         <View style={styles.modalHeader}>
               <ThemedText 
                 type="subtitle" 
                 style={[styles.modalTitle, colorScheme === 'dark' && { color: 'white' }]}
               >
                 Export Options
               </ThemedText>
               <TouchableOpacity onPress={() => setShowExportOptions(false)}>
                 <IconSymbol name="xmark.circle.fill" size={24} color={colorScheme === 'dark' ? 'white' : colors.icon} />
               </TouchableOpacity>
             </View>
            
            <View style={styles.exportOptions}>
                             <TouchableOpacity
                 style={[styles.exportOption, exportFilter === 'all' && styles.selectedExportOption]}
                 onPress={() => setExportFilter('all')}
               >
                 <IconSymbol name="folder.fill" size={20} color={colors.tint} />
                 <ThemedText style={colorScheme === 'dark' ? { color: 'white' } : {}}>All Data</ThemedText>
                 {exportFilter === 'all' && (
                   <IconSymbol name="checkmark.circle.fill" size={20} color={colors.tint} />
                 )}
               </TouchableOpacity>
               
               <TouchableOpacity
                 style={[styles.exportOption, exportFilter === 'monthly' && styles.selectedExportOption]}
                 onPress={() => setExportFilter('monthly')}
               >
                 <IconSymbol name="calendar" size={20} color={colors.tint} />
                 <ThemedText style={colorScheme === 'dark' ? { color: 'white' } : {}}>This Month</ThemedText>
                 {exportFilter === 'monthly' && (
                   <IconSymbol name="checkmark.circle.fill" size={20} color={colors.tint} />
                 )}
               </TouchableOpacity>
               
               <TouchableOpacity
                 style={[styles.exportOption, exportFilter === 'custom' && styles.selectedExportOption]}
                 onPress={() => setExportFilter('custom')}
               >
                 <IconSymbol name="calendar.badge.clock" size={20} color={colors.tint} />
                 <ThemedText style={colorScheme === 'dark' ? { color: 'white' } : {}}>Custom Range</ThemedText>
                 {exportFilter === 'custom' && (
                   <IconSymbol name="checkmark.circle.fill" size={20} color={colors.tint} />
                 )}
               </TouchableOpacity>
            </View>

            {/* Custom Date Range Selector */}
            {exportFilter === 'custom' && (
              <View style={styles.dateRangeContainer}>
                <TouchableOpacity
                  style={[styles.dateInput, { borderColor: colors.border }]}
                  onPress={() => setShowStartDatePicker(true)}
                >
                  <IconSymbol name="calendar" size={20} color={colors.tint} />
                  <ThemedText style={[styles.dateText, colorScheme === 'dark' && { color: 'white' }]}>
                    {startDate.toLocaleDateString()}
                  </ThemedText>
                </TouchableOpacity>

                <IconSymbol name="arrow.right" size={20} color={colors.tint} />

                <TouchableOpacity
                  style={[styles.dateInput, { borderColor: colors.border }]}
                  onPress={() => setShowEndDatePicker(true)}
                >
                  <IconSymbol name="calendar" size={20} color={colors.tint} />
                  <ThemedText style={[styles.dateText, colorScheme === 'dark' && { color: 'white' }]}>
                    {endDate.toLocaleDateString()}
                  </ThemedText>
                </TouchableOpacity>
              </View>
            )}

            {showStartDatePicker && (
              <DateTimePicker
                value={startDate}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={(event, selectedDate) => {
                  setShowStartDatePicker(Platform.OS === 'ios');
                  if (selectedDate) {
                    setStartDate(selectedDate);
                  }
                }}
              />
            )}

            {showEndDatePicker && (
              <DateTimePicker
                value={endDate}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={(event, selectedDate) => {
                  setShowEndDatePicker(Platform.OS === 'ios');
                  if (selectedDate) {
                    setEndDate(selectedDate);
                  }
                }}
              />
            )}

                         <View style={styles.modalActions}>
               <TouchableOpacity
                 style={styles.cancelButton}
                 onPress={() => setShowExportOptions(false)}
               >
                 <ThemedText style={[styles.cancelButtonText, colorScheme === 'dark' && { color: 'white' }]}>
                   Cancel
                 </ThemedText>
               </TouchableOpacity>
               <TouchableOpacity
                 style={[styles.saveButton, { backgroundColor: colors.tint }]}
                 onPress={handleExportData}
               >
                 <ThemedText style={styles.saveButtonText}>Export</ThemedText>
               </TouchableOpacity>
             </View>
          </ThemedView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

export default function AdminScreen() {
  return <AdminScreenContent />;
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
  section: {
    marginHorizontal: 20,
    marginBottom: 24,
    borderRadius: 16,
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  addCategoryForm: {
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
  colorPicker: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  colorOption: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedColor: {
    borderColor: '#000',
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
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  categoriesList: {
    gap: 4,
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
    backgroundColor: 'transparent',
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  categoryName: {
    flex: 1,
    fontSize: 16,
  },
  categoryActions: {
    flexDirection: 'row',
    gap: 8,
  },
  editButton: {
    padding: 8,
  },
  deleteButton: {
    padding: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  actionButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  actionButtonText: {
    marginLeft: 12,
    flex: 1,
  },
  actionButtonSubtext: {
    fontSize: 12,
    opacity: 0.7,
    marginTop: 2,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  infoLabel: {
    opacity: 0.7,
  },
  infoValue: {
    fontWeight: '600',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingText: {
    marginLeft: 12,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '80%',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 16,
  },
  modalTitle: {
    flex: 1,
  },
  exportOptions: {
    width: '100%',
    marginBottom: 20,
  },
  exportOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  selectedExportOption: {
    backgroundColor: 'rgba(74, 144, 226, 0.1)',
    borderColor: '#4A90E2',
    borderWidth: 1,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  dateRangeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 20,
    gap: 12,
  },
  dateInput: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  dateText: {
    fontSize: 14,
  },
  creditItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  creditInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  creditDetails: {
    flex: 1,
  },
  creditRole: {
    fontSize: 12,
    marginBottom: 4,
  },
  creditName: {
    fontSize: 16,
    marginBottom: 2,
  },
  creditPosition: {
    fontSize: 14,
  },
  linkedinButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  linkedinText: {
    color: 'white',
    fontSize: 20,
    fontWeight: '700',
    fontFamily: 'Arial',
  },
});
