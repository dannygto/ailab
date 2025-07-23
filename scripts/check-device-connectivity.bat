@echo off
REM 设备连接检查工具启动器
REM 此脚本用于启动设备连接检查工具

echo ======================================
echo      设备连接检查工具启动器
echo ======================================
echo.

REM 设置当前目录
cd /d "%~dp0"

REM 检查Node.js环境
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
  echo 错误: 未找到Node.js环境，请安装Node.js后重试。
  goto :end
)

REM 安装所需依赖
echo 正在检查依赖...
call npm list -g ts-node >nul 2>nul || npm install -g ts-node
call npm list -g typescript >nul 2>nul || npm install -g typescript

REM 运行设备连接检查工具
echo 启动设备连接检查工具...
npx ts-node check-device-connectivity.ts %*

:end
echo.
echo 按任意键退出...
pause > nul
