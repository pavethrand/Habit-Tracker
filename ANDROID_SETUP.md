# Android Development Setup Guide

## Quick Solution: Use Expo Go on Your Phone (No Setup Required)

1. Install **Expo Go** app from Google Play Store (Android) or App Store (iOS)
2. Make sure your phone and computer are on the same WiFi network
3. Run `npm start` in your terminal
4. Scan the QR code with:
   - **Android**: Open Expo Go app → Scan QR code
   - **iOS**: Open Camera app → Scan QR code

## Setting Up Android SDK for Emulator

If you need to use Android Emulator, follow these steps:

### Step 1: Install Android Studio

1. Download Android Studio from: https://developer.android.com/studio
2. Run the installer and follow the setup wizard
3. During installation, make sure to install:
   - Android SDK
   - Android SDK Platform-Tools
   - Android Virtual Device (AVD)

### Step 2: Find Your Android SDK Location

After installation, the SDK is typically located at:
- **Windows**: `C:\Users\YOUR_USERNAME\AppData\Local\Android\Sdk`

To find your exact path:
1. Open Android Studio
2. Go to **File** → **Settings** (or **Preferences** on Mac)
3. Navigate to **Appearance & Behavior** → **System Settings** → **Android SDK**
4. Copy the "Android SDK Location" path

### Step 3: Set Environment Variables on Windows

#### Option A: Using PowerShell (Temporary - Current Session Only)

```powershell
# Replace YOUR_USERNAME with your Windows username
$env:ANDROID_HOME = "C:\Users\YOUR_USERNAME\AppData\Local\Android\Sdk"
$env:PATH += ";$env:ANDROID_HOME\platform-tools;$env:ANDROID_HOME\tools"
```

#### Option B: Using System Properties (Permanent)

1. Press `Win + R`, type `sysdm.cpl`, and press Enter
2. Go to the **Advanced** tab
3. Click **Environment Variables**
4. Under **User variables**, click **New**:
   - Variable name: `ANDROID_HOME`
   - Variable value: `C:\Users\YOUR_USERNAME\AppData\Local\Android\Sdk`
5. Find **Path** in User variables, click **Edit**:
   - Click **New** and add: `%ANDROID_HOME%\platform-tools`
   - Click **New** and add: `%ANDROID_HOME%\tools`
6. Click **OK** on all dialogs
7. **Restart your terminal/PowerShell** for changes to take effect

### Step 4: Verify Installation

Open a new PowerShell window and run:

```powershell
adb version
```

If you see the ADB version, the setup is successful!

### Step 5: Create an Android Virtual Device (AVD)

1. Open Android Studio
2. Go to **Tools** → **Device Manager**
3. Click **Create Device**
4. Select a device (e.g., Pixel 5)
5. Select a system image (e.g., Android 13.0)
6. Click **Finish**

### Step 6: Start Android Emulator

1. In Android Studio Device Manager, click the **Play** button next to your AVD
2. Wait for the emulator to boot up
3. Then run: `npm run android`

## Alternative: Use Expo Go (Recommended for Development)

For React Native development with Expo, using Expo Go on a physical device is often faster and doesn't require Android SDK setup:

```bash
npm start
# Then scan QR code with Expo Go app
```

This is the recommended approach for Expo projects during development!

