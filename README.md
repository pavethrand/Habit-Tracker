# Habit Tracker Mobile App

A comprehensive React Native mobile application built with Expo that helps users manage tasks, build positive habits, and break bad ones. The app provides a clean, intuitive interface for tracking daily productivity and personal growth.

## Features

### 🏠 Home Page - Task Dashboard
- Create and manage tasks with priorities (Important, Normal, Low)
- Add task details including name, description, category, and deadline
- Filter and sort tasks by category or priority
- Mark tasks as completed
- View task completion statistics

### 🌱 Habits Page - Build Good Habits
- Create habits with customizable frequency (Daily, Weekly, Monthly, Custom days)
- Track daily habit completion with visual progress indicators
- View streak counters and success rates
- Calendar view for tracking habit history
- Analytics with progress charts and completion statistics
- Organize habits by category and priority

### 🚫 Leave Page - Break Bad Habits
- Track habits you want to quit
- Daily check-ins to record when you avoided the habit
- Streak tracking - builds up as you avoid the habit each day
- Automatic removal after 7 consecutive days of success
- Calendar visualization of your progress

### ⚙️ Admin/Settings Page
- Category management (add, edit, delete categories)
- Data export functionality (CSV/JSON format)
- Dark/Light mode toggle
- Clear all data option
- App version information
- Filter exports by date range

## Tech Stack

- **Framework**: React Native with Expo (~54.0.21)
- **Routing**: Expo Router (file-based routing)
- **State Management**: React Context API
- **Storage**: AsyncStorage for local persistence
- **UI Components**: Custom themed components with dark mode support
- **Language**: TypeScript with strict mode
- **Navigation**: React Navigation
- **Styling**: StyleSheet API with responsive design

## Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (v18 or higher)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- Expo Go app on your mobile device (for testing) or Android Studio/iOS Simulator

## Getting Started

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd habit_tracker
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npx expo start
   ```

4. **Run on your device**
   - Install Expo Go on your iOS or Android device
   - Scan the QR code displayed in the terminal
   - Or press `a` for Android emulator, `i` for iOS simulator

## Available Scripts

- `npm start` - Start the Expo development server
- `npm run android` - Start the app on Android emulator
- `npm run ios` - Start the app on iOS simulator
- `npm run web` - Start the app in web browser
- `npm run lint` - Run ESLint to check code quality

## Project Structure

```
habit_tracker/
├── app/                  # Expo Router pages
│   ├── (tabs)/          # Tab navigation screens
│   │   ├── index.tsx    # Home/Tasks page
│   │   ├── habits.tsx   # Habits page
│   │   ├── leave.tsx    # Leave habits page
│   │   └── admin.tsx    # Admin/Settings page
│   └── _layout.tsx       # Root layout
├── components/          # Reusable UI components
├── contexts/           # React Context providers
│   ├── HabitContext.tsx
│   ├── TaskContext.tsx
│   ├── LeaveHabitContext.tsx
│   └── ThemeContext.tsx
├── constants/          # App constants (theme, colors)
├── types/              # TypeScript type definitions
├── utils/              # Utility functions (storage, helpers)
├── hooks/              # Custom React hooks
├── data/               # Sample data and initial data
└── assets/             # Images, icons, and static assets
```

## Key Features Implementation

### State Management
The app uses React Context API for global state management:
- `HabitContext` - Manages habits and completions
- `TaskContext` - Manages tasks and categories
- `LeaveHabitContext` - Manages leave habits tracking
- `ThemeContext` - Manages theme (light/dark mode)

### Data Persistence
All data is stored locally using AsyncStorage:
- Tasks, Habits, Leave Habits
- Completions and progress tracking
- Categories and user preferences

### Theming
The app supports automatic dark/light mode based on system preferences with custom themed components for consistent styling.

## Development

### Adding New Features
1. Create components in the `components/` directory
2. Add new screens in `app/(tabs)/` for tab screens
3. Update context providers for new state management needs
4. Add types in `types/` directory

### Code Style
- Follow TypeScript best practices
- Use functional components with hooks
- Maintain consistent naming conventions
- Follow the existing project structure

## Building for Production

### Android
```bash
eas build --platform android
```

### iOS
```bash
eas build --platform ios
```

Make sure you have configured EAS (Expo Application Services) in your `eas.json` file.

## Configuration

The app configuration is managed in:
- `app.json` - Expo app configuration
- `eas.json` - EAS Build configuration
- `tsconfig.json` - TypeScript configuration
- `package.json` - Dependencies and scripts

## Documentation

- See `requirements_docs` for detailed feature requirements
- See `ANDROID_SETUP.md` for Android development setup
- See `ICON_GUIDE.md` for icon generation guide

## License

This project is private. All rights reserved.

## Contributing

This is a personal project. Contributions are not currently accepted.

## Support

For issues or questions, please open an issue on the repository.

---

Built with ❤️ using React Native and Expo
