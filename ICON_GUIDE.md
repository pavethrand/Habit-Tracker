# Icon Generation Guide for Habit Tracker App

## Icon Created
A modern habit tracker icon has been created at `assets/icon.svg`.

The icon features:
- **Blue to green gradient background** representing growth and completion
- **Large white checkmark** symbolizing completed habits
- **Subtle calendar grid pattern** indicating tracking and consistency
- **Circular design** with smooth rounded corners for modern app stores

## How to Generate Android Icons

### Option 1: Using Online Tool (Recommended)
1. Go to https://www.appicon.co/ or https://icon.kitchen/
2. Upload the `assets/icon.svg` file
3. Download the generated icon set
4. Extract and copy the Android icons to:
   - `assets/images/android-icon-foreground.png` (1024x1024)
   - `assets/images/android-icon-background.png` (1024x1024) 
   - `assets/images/android-icon-monochrome.png` (1024x1024)
   - `assets/images/icon.png` (1024x1024)

### Option 2: Using ImageMagick (if installed)
```bash
# Install ImageMagick: https://imagemagick.org/script/download.php

# Convert SVG to PNG
magick assets/icon.svg -background none -resize 1024x1024 assets/images/icon.png
magick assets/icon.svg -background "#E6F4FE" -resize 1024x1024 assets/images/android-icon-foreground.png

# Create monochrome version
magick assets/icon.svg -resize 1024x1024 -colorspace gray assets/images/android-icon-monochrome.png

# Create background (solid color)
magick -size 1024x1024 xc:#E6F4FE assets/images/android-icon-background.png
```

### Option 3: Using Node.js with sharp
```bash
npm install --save-dev sharp
node -e "
const sharp = require('sharp');
sharp('assets/icon.svg')
  .resize(1024, 1024)
  .png()
  .toFile('assets/images/icon.png')
  .then(() => console.log('✓ Icon generated'));
"
```

### Option 4: Manual Design
Use Figma, Adobe Illustrator, or similar tools:
1. Open the `assets/icon.svg` in your design tool
2. Export as PNG at 1024x1024 pixels
3. Create the following variations:
   - **Foreground**: Full icon with transparent background
   - **Monochrome**: Black/white version for adaptive icons
   - **Background**: Solid light blue color (#E6F4FE)

## Icon Specifications

### Android Adaptive Icon Requirements:
- **Foreground Image**: 1024x1024 PNG
  - Main icon content (checkmark with gradient background)
  - Safe zone: Center 512x512 pixels
  
- **Background Image**: 1024x1024 PNG
  - Solid color background (#E6F4FE - light blue)
  
- **Monochrome Image**: 1024x1024 PNG
  - Black and white version for Android 13+ themed icons

### Important Notes:
- The icon must be readable at small sizes (e.g., 48x48 dp)
- Ensure the checkmark is clearly visible
- The calendar grid pattern should be subtle enough to not distract

## Testing the Icon
After replacing the icon files:
```bash
# Clear cache and restart
npm start -- --clear
```

Then build the app to see the new icon on your device.

## Current Configuration
The app is configured in `app.json`:
```json
{
  "android": {
    "adaptiveIcon": {
      "backgroundColor": "#E6F4FE",
      "foregroundImage": "./assets/images/android-icon-foreground.png",
      "backgroundImage": "./assets/images/android-icon-background.png",
      "monochromeImage": "./assets/images/android-icon-monochrome.png"
    }
  }
}
```



