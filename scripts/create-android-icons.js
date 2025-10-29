#!/usr/bin/env node

/**
 * This script creates Android icon files from the SVG
 * Requires: npm install --save-dev sharp
 */

const fs = require('fs');
const path = require('path');

console.log('Checking for icon SVG...');

const iconSVGPath = path.join(__dirname, '../assets/icon.svg');
if (!fs.existsSync(iconSVGPath)) {
  console.error('Error: assets/icon.svg not found. Run "node scripts/generate-icon.js" first.');
  process.exit(1);
}

try {
  // Check if sharp is installed
  const sharp = require('sharp');
  
  console.log('Creating Android icons...');
  
  const outputDir = path.join(__dirname, '../assets/images');
  
  // Create icon.png (1024x1024)
  sharp(iconSVGPath)
    .resize(1024, 1024)
    .png()
    .toFile(path.join(outputDir, 'icon.png'))
    .then(() => console.log('✓ icon.png created'));
  
  // Create android-icon-foreground.png
  sharp(iconSVGPath)
    .resize(1024, 1024)
    .png()
    .toFile(path.join(outputDir, 'android-icon-foreground.png'))
    .then(() => console.log('✓ android-icon-foreground.png created'));
  
  // Create android-icon-monochrome.png (grayscale)
  sharp(iconSVGPath)
    .resize(1024, 1024)
    .greyscale()
    .png()
    .toFile(path.join(outputDir, 'android-icon-monochrome.png'))
    .then(() => console.log('✓ android-icon-monochrome.png created'));
  
  // Create android-icon-background.png (solid color)
  sharp({
    create: {
      width: 1024,
      height: 1024,
      channels: 3,
      background: { r: 230, g: 244, b: 254 }
    }
  })
    .png()
    .toFile(path.join(outputDir, 'android-icon-background.png'))
    .then(() => {
      console.log('✓ android-icon-background.png created');
      console.log('\n✓ All Android icons generated successfully!');
      console.log('\nNext steps:');
      console.log('1. Review the icons in assets/images/');
      console.log('2. Run: npm start');
      console.log('3. Build the app to see the new icon on your device');
    });
    
} catch (error) {
  console.log('\n⚠ Sharp not installed. Installing...\n');
  console.log('Run this command:');
  console.log('npm install --save-dev sharp');
  console.log('\nThen run this script again.');
  console.log('\nOr use online tools as described in ICON_GUIDE.md');
}



