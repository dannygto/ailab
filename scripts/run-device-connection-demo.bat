@echo off
REM 设备连接演示工具启动器
REM 此脚本用于启动设备连接演示工具

echo ======================================
echo      设备连接演示工具启动器
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

REM 设置配置文件目录
set CONFIG_DIR=..\config\devices

REM 列出可用的设备配置
echo.
echo 可用的设备配置文件:
echo -------------------
set i=1
set fileDict=

for %%f in (%CONFIG_DIR%\*.json) do (
  echo !i!. %%~nf
  set "fileDict[!i!]=%%f"
  set /a i+=1
)

REM 获取用户选择
echo.
set /p choice=请选择要测试的设备配置 (1-%i%):

REM 验证输入
if not defined fileDict[%choice%] (
  echo 无效的选择。
  goto :end
)

REM 启动连接演示工具
echo.
echo 启动设备连接演示工具...
npx ts-node device-connection-demo.ts "%fileDict[%choice%]%"

:end
echo.
echo 按任意键退出...
pause > nul
