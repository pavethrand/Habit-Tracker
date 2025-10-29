# Android SDK Environment Setup Script
# Run this script AFTER installing Android Studio
# Make sure to run PowerShell as Administrator

$sdkPath = "$env:LOCALAPPDATA\Android\Sdk"

if (Test-Path $sdkPath) {
    Write-Host "✓ Android SDK found at: $sdkPath" -ForegroundColor Green
    
    # Set ANDROID_HOME for current session
    $env:ANDROID_HOME = $sdkPath
    
    # Add to PATH for current session
    $env:PATH += ";$sdkPath\platform-tools;$sdkPath\tools"
    
    Write-Host "`n✓ Environment variables set for current session" -ForegroundColor Green
    Write-Host "`nTo make this permanent:" -ForegroundColor Yellow
    Write-Host "1. Press Win+R, type 'sysdm.cpl', press Enter" -ForegroundColor Cyan
    Write-Host "2. Go to Advanced tab → Environment Variables" -ForegroundColor Cyan
    Write-Host "3. Add ANDROID_HOME = $sdkPath" -ForegroundColor Cyan
    Write-Host "4. Add to PATH: %ANDROID_HOME%\platform-tools and %ANDROID_HOME%\tools" -ForegroundColor Cyan
    Write-Host "5. Restart your terminal after making changes" -ForegroundColor Cyan
    
    # Verify adb
    Write-Host "`nChecking ADB..." -ForegroundColor Yellow
    try {
        $adbVersion = & "$sdkPath\platform-tools\adb.exe" version 2>&1
        Write-Host "✓ ADB is working!" -ForegroundColor Green
    } catch {
        Write-Host "✗ ADB not found. Make sure Android SDK Platform-Tools is installed." -ForegroundColor Red
    }
} else {
    Write-Host "✗ Android SDK not found at: $sdkPath" -ForegroundColor Red
    Write-Host "`nPlease install Android Studio first:" -ForegroundColor Yellow
    Write-Host "1. Download from: https://developer.android.com/studio" -ForegroundColor Cyan
    Write-Host "2. During installation, make sure to install Android SDK" -ForegroundColor Cyan
    Write-Host "3. Run this script again after installation" -ForegroundColor Cyan
    Write-Host "`nOr use Expo Go on your phone (no setup required)!" -ForegroundColor Green
}

