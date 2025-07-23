@echo off
setlocal

echo ========================================
echo    TCP/Socket模拟设备集成测试启动脚本
echo ========================================
echo.

:: 确认是否先启动模拟器
echo 此测试需要先启动设备模拟器。
set /p start_sim="是否需要启动设备模拟器? (Y/N): "

if /i "%start_sim%"=="Y" (
    :: 启动模拟器
    echo.
    echo 正在启动设备模拟器...
    start "设备模拟器" cmd /c "%~dp0start-device-simulators.bat"

    :: 等待模拟器启动
    echo 等待模拟器启动...
    timeout /t 5 > nul
)

:: 运行测试脚本
echo.
echo 正在编译并运行模拟设备集成测试...
echo.

:: 编译测试脚本
cd "%~dp0.."
npx tsc --esModuleInterop --skipLibCheck "%~dp0simulator-device-test.ts"

if %ERRORLEVEL% neq 0 (
    echo [错误] 编译测试脚本失败
    goto :exit
)

:: 运行测试
node "%~dp0simulator-device-test.js"

:exit
echo.
endlocal
