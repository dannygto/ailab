@echo off
:: TCP/Socket设备集成测试批处理脚本
:: 此脚本用于启动设备模拟器和测试工具

echo TCP/Socket设备集成测试启动脚本
echo =================================
echo.

:: 设置工作目录为脚本所在目录
cd /d "%~dp0"

:: 检查Node.js是否安装
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo 错误: 未检测到Node.js，请安装Node.js后再运行此脚本。
    goto :EOF
)

:: 检查所需文件是否存在
if not exist "device-simulator-proc.js" (
    echo 错误: 未找到处理器设备模拟器脚本 (device-simulator-proc.js)
    goto :EOF
)

if not exist "device-simulator-sens.js" (
    echo 错误: 未找到传感器设备模拟器脚本 (device-simulator-sens.js)
    goto :EOF
)

if not exist "tcp-socket-device-integration-test.ts" (
    echo 错误: 未找到TCP/Socket设备集成测试脚本 (tcp-socket-device-integration-test.ts)
    goto :EOF
)

echo 正在启动设备模拟器和测试环境...
echo.

:: 创建日志目录
if not exist "logs" mkdir logs

:: 启动处理器设备模拟器 (新命令窗口)
start "处理器设备模拟器" cmd /c "node device-simulator-proc.js > logs\processor-simulator.log 2>&1"
echo 已启动处理器设备模拟器 (端口 8081)

:: 等待一秒
timeout /t 1 > nul

:: 启动传感器设备模拟器 (新命令窗口)
start "传感器设备模拟器" cmd /c "node device-simulator-sens.js > logs\sensor-simulator.log 2>&1"
echo 已启动传感器设备模拟器 (端口 8082)

:: 等待两秒，确保模拟器启动完成
echo 等待设备模拟器启动...
timeout /t 2 > nul

:: 输出菜单
:menu
cls
echo TCP/Socket设备集成测试菜单
echo =================================
echo.
echo  [1] 运行设备发现测试
echo  [2] 运行基本连接测试
echo  [3] 运行命令发送测试
echo  [4] 运行数据接收测试
echo  [5] 运行设备监控测试
echo  [6] 运行完整集成测试
echo  [7] 查看设备模拟器日志
echo  [8] 停止所有模拟器
echo  [9] 退出
echo.
echo =================================
echo.

:: 获取用户选择
set /p option=请选择操作 (1-9):

:: 根据选择执行相应操作
if "%option%"=="1" (
    echo 运行设备发现测试...
    npx ts-node tcp-socket-device-integration-test.ts --type=discovery --verbose
    pause
    goto menu
)

if "%option%"=="2" (
    echo 运行基本连接测试...
    npx ts-node tcp-socket-device-integration-test.ts --type=connect --verbose
    pause
    goto menu
)

if "%option%"=="3" (
    echo 运行命令发送测试...
    set /p cmd=请输入要发送的命令:
    set /p host=请输入设备主机地址 (默认 localhost):
    if "%host%"=="" set host=localhost
    set /p port=请输入设备端口 (处理器: 8081, 传感器: 8082):
    npx ts-node tcp-socket-device-integration-test.ts --type=send --host=%host% --port=%port% --command="%cmd%" --verbose
    pause
    goto menu
)

if "%option%"=="4" (
    echo 运行数据接收测试...
    set /p host=请输入设备主机地址 (默认 localhost):
    if "%host%"=="" set host=localhost
    set /p port=请输入设备端口 (处理器: 8081, 传感器: 8082):
    npx ts-node tcp-socket-device-integration-test.ts --type=receive --host=%host% --port=%port% --verbose
    pause
    goto menu
)

if "%option%"=="5" (
    echo 运行设备监控测试...
    set /p host=请输入设备主机地址 (默认 localhost):
    if "%host%"=="" set host=localhost
    set /p port=请输入设备端口 (处理器: 8081, 传感器: 8082):
    set /p duration=请输入监控时间 (秒):
    npx ts-node tcp-socket-device-integration-test.ts --type=monitor --host=%host% --port=%port% --duration=%duration% --verbose
    pause
    goto menu
)

if "%option%"=="6" (
    echo 运行完整集成测试...
    npx ts-node tcp-socket-device-integration-test.ts --type=full --verbose
    pause
    goto menu
)

if "%option%"=="7" (
    :logmenu
    cls
    echo 查看设备模拟器日志
    echo =================================
    echo.
    echo  [1] 查看处理器设备模拟器日志
    echo  [2] 查看传感器设备模拟器日志
    echo  [3] 返回主菜单
    echo.
    echo =================================
    echo.

    set /p logoption=请选择要查看的日志 (1-3):

    if "%logoption%"=="1" (
        type logs\processor-simulator.log | more
        pause
        goto logmenu
    )

    if "%logoption%"=="2" (
        type logs\sensor-simulator.log | more
        pause
        goto logmenu
    )

    if "%logoption%"=="3" (
        goto menu
    )

    echo 无效选择，请重试。
    pause
    goto logmenu
)

if "%option%"=="8" (
    echo 正在停止所有模拟器...
    taskkill /f /fi "WINDOWTITLE eq 处理器设备模拟器*" > nul 2>&1
    taskkill /f /fi "WINDOWTITLE eq 传感器设备模拟器*" > nul 2>&1
    echo 所有模拟器已停止。
    pause
    goto menu
)

if "%option%"=="9" (
    echo 正在停止所有模拟器并退出...
    taskkill /f /fi "WINDOWTITLE eq 处理器设备模拟器*" > nul 2>&1
    taskkill /f /fi "WINDOWTITLE eq 传感器设备模拟器*" > nul 2>&1
    echo 感谢使用TCP/Socket设备集成测试工具！
    goto :EOF
)

echo 无效选择，请重试。
pause
goto menu
