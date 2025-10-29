#!/usr/bin/env node

/**
 * This script generates Android and iOS icons from a base SVG
 * Run: node scripts/generate-icon.js
 */

const fs = require('fs');
const path = require('path');

// Minimalist habit tracker icon - Checkmark in circle with gradient
const iconSVG = `<svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#4A90E2;stop-opacity:1" />
      <stop offset="50%" style="stop-color:#50C878;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#7ED321;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Background -->
  <rect width="1024" height="1024" rx="240" fill="url(#gradient)"/>
  
  <!-- Circle with border -->
  <circle cx="512" cy="420" r="280" fill="none" stroke="white" stroke-width="20" opacity="0.3"/>
  <circle cx="512" cy="520" r="180" fill="none" stroke="white" stroke-width="18" opacity="0.4"/>
  
  <!-- Large checkmark -->
  <path d="M 300 480 L 440 620 L 720 340" 
        stroke="white" 
        stroke-width="80" 
        stroke-linecap="round" 
        stroke-linejoin="round" 
        fill="none"/>
  
  <!-- Calendar grid pattern (subtle) -->
  <g transform="translate(150, 620)" opacity="0.15">
    <rect x="0" y="0" width="50" height="50" rx="8" fill="white"/>
    <rect x="70" y="0" width="50" height="50" rx="8" fill="white"/>
    <rect x="140" y="0" width="50" height="50" rx="8" fill="white"/>
    <rect x="350" y="0" width="50" height="50" rx="8" fill="white"/>
    <rect x="420" y="0" width="50" height="50" rx="8" fill="white"/>
    <rect x="490" y="0" width="50" height="50" rx="8" fill="white"/>
    
    <rect x="70" y="70" width="50" height="50" rx="8" fill="white"/>
    <rect x="140" y="70" width="50" height="50" rx="8" fill="white"/>
    <rect x="280" y="70" width="50" height="50" rx="8" fill="white"/>
    <rect x="420" y="70" width="50" height="50" rx="8" fill="white"/>
  </g>
</svg>`;

console.log('Creating icon SVG...');
fs.writeFileSync(path.join(__dirname, '../assets/icon.svg'), iconSVG);

console.log('✓ Icon SVG created at assets/icon.svg');
console.log('\nTo generate Android/iOS icons:');
console.log('1. Use an online tool like: https://www.appicon.co/');
console.log('2. Upload the icon.svg file');
console.log('3. Download the generated icons');
console.log('4. Replace the files in assets/images/');
console.log('\nOr use the Expo CLI:');
console.log('npx expo install @expo/config-plugins');
console.log('Then run: npx expo-doctor');

