@echo off
echo Building frontend...
call npx vite build
if %errorlevel% neq 0 (
    echo Frontend build failed with error code %errorlevel%
    pause
    exit /b %errorlevel%
)

echo Frontend build successful!
echo.
echo Building Tauri app...
cd src-tauri
call cargo tauri build
if %errorlevel% neq 0 (
    echo Tauri build failed with error code %errorlevel%
    cd ..
    pause
    exit /b %errorlevel%
)

cd ..
echo.
echo Build completed successfully!
echo Installer location: src-tauri\target\release\bundle\nsis\
pause
