@echo off
REM TCP/Socket协议适配器实际设备集成测试 V2
REM 用法: run-test-v2.bat [设备名称] [测试模式] [主机] [端口] [选项]

echo TCP/Socket协议适配器实际设备集成测试 V2
echo ----------------------------------------

set DEVICE=GX-5000
set MODE=test
set HOST=
set PORT=
set VERBOSE=
set SECURE=

REM 解析参数
if not "%~1"=="" set DEVICE=%~1
if not "%~2"=="" set MODE=%~2
if not "%~3"=="" set HOST=--host=%~3
if not "%~4"=="" set PORT=--port=%~4
if "%~5"=="verbose" set VERBOSE=--verbose
if "%~5"=="secure" set SECURE=--secure
if "%~6"=="verbose" set VERBOSE=--verbose
if "%~6"=="secure" set SECURE=--secure

echo 设备: %DEVICE%
echo 模式: %MODE%
if not "%HOST%"=="" echo 主机: %HOST%
if not "%PORT%"=="" echo 端口: %PORT%
if not "%VERBOSE%"=="" echo 详细输出: 启用
if not "%SECURE%"=="" echo 安全连接: 启用
echo ----------------------------------------

REM 检查Node.js
node --version > nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo 错误: 未找到Node.js，请安装Node.js后重试
    exit /b 1
)

REM 检查TypeScript
npx tsc --version > nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo 安装TypeScript...
    npm install -g typescript
)

REM 检查ts-node
npx ts-node --version > nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo 安装ts-node...
    npm install -g ts-node
)

REM 创建必要的目录
if not exist "logs\test-results" mkdir logs\test-results
if not exist "config\devices" mkdir config\devices

REM 构建命令参数
set ARGS=scripts\device-integration-test-v2.ts --device=%DEVICE% --mode=%MODE% %HOST% %PORT% %VERBOSE% %SECURE%

REM 确保后端依赖项已安装
if not exist "src\backend\node_modules" (
    echo 安装后端依赖项...
    cd src\backend
    npm install
    cd ..\..
)

REM 执行测试
echo 正在执行设备集成测试...
npx ts-node %ARGS%

if %ERRORLEVEL% equ 0 (
    echo 测试成功完成！
) else (
    echo 测试失败，退出代码: %ERRORLEVEL%
    exit /b %ERRORLEVEL%
)

exit /b 0
