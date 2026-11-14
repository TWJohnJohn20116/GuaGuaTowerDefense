@echo off
echo ========================================
echo 瓜瓜塔防 - 重新構建和打包腳本
echo ========================================
echo.

echo 步驟 1: 清理舊的構建文件...
if exist dist rmdir /s /q dist
if exist node_modules\.vite rmdir /s /q node_modules\.vite
echo 清理完成！
echo.

echo 步驟 2: 重新安裝依賴...
call npm ci
if %errorlevel% neq 0 (
    echo 依賴安裝失敗！
    pause
    exit /b %errorlevel%
)
echo 依賴安裝完成！
echo.

echo 步驟 3: 構建前端...
call npm run build
if %errorlevel% neq 0 (
    echo 前端構建失敗！
    pause
    exit /b %errorlevel%
)
echo 前端構建完成！
echo.

echo 步驟 4: 打包 Tauri 應用...
cd src-tauri
call cargo tauri build --bundles nsis
if %errorlevel% neq 0 (
    echo Tauri 打包失敗！
    cd ..
    pause
    exit /b %errorlevel%
)
cd ..
echo.

echo ========================================
echo 打包完成！
echo ========================================
echo.
echo 安裝程序位置：
echo src-tauri\target\release\bundle\nsis\
echo.
dir /b src-tauri\target\release\bundle\nsis\*.exe
echo.
pause
