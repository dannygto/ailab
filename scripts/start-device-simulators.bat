@echo off
setlocal

echo ========================================
echo    TCP/Socket设备模拟器启动脚本
echo ========================================
echo.

:: 检查Node.js是否安装
where node >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [错误] 未检测到Node.js，请安装Node.js后再运行此脚本
    goto :exit
)

:: 检查模拟器文件是否存在
set SIMULATOR_DIR=%~dp0simulator
set SIMULATOR_SCRIPT=%SIMULATOR_DIR%\start-all-simulators.js

if not exist "%SIMULATOR_SCRIPT%" (
    echo [错误] 未找到模拟器启动脚本: %SIMULATOR_SCRIPT%
    goto :exit
)

:: 检查chalk依赖
echo 正在检查依赖...
npm list chalk --prefix "%SIMULATOR_DIR%" >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo 正在安装chalk模块...
    cd "%SIMULATOR_DIR%" && npm install chalk --no-fund --no-audit --loglevel=error
    if %ERRORLEVEL% neq 0 (
        echo [错误] 安装chalk模块失败
        goto :exit
    )
)

echo.
echo 正在启动TCP/Socket设备模拟器...
echo.

:: 启动模拟器
node "%SIMULATOR_SCRIPT%"

:exit
echo.
endlocal
