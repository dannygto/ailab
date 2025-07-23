@echo off
setlocal enabledelayedexpansion

echo ======================================
echo 实际设备测试工具启动器
echo ======================================

REM 设置变量
set "SCRIPT_DIR=%~dp0"
set "CONFIG_DIR=%SCRIPT_DIR%..\config\devices"
set "REPORT_DIR=%SCRIPT_DIR%..\reports"

REM 确保目录存在
if not exist "%REPORT_DIR%" mkdir "%REPORT_DIR%"

REM 列出可用的设备配置
echo.
echo 可用的设备配置文件:
echo -------------------
set i=1
for %%f in ("%CONFIG_DIR%\*.json") do (
    echo !i!. %%~nf
    set "file!i!=%%f"
    set /a i+=1
)

echo.
REM 获取用户选择
set /p choice="请选择要测试的设备配置 (1-%i%): "

REM 验证输入
set "selected_file="
if defined file%choice% (
    for /f "tokens=2 delims==" %%a in ('set file%choice%') do set "selected_file=%%a"
) else (
    echo 无效的选择。
    goto :eof
)

echo.
echo 已选择: !selected_file!
echo.

REM 确认运行
set /p confirm="是否开始测试? (Y/N): "
if /i "%confirm%" neq "Y" goto :eof

echo.
echo 开始测试...
echo.

REM 执行测试脚本
cd %SCRIPT_DIR%..
npx ts-node "%SCRIPT_DIR%actual-device-integration-test.ts" --config="%selected_file%"

echo.
echo 测试完成。报告已保存到 %REPORT_DIR% 目录。
echo.

pause
endlocal
