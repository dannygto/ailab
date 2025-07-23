@echo off
echo ===================================================
echo     TCP设备测试流程
echo     包括测试和结果分析
echo ===================================================
echo.

REM 步骤1: 运行TCP设备测试
echo 步骤1: 正在运行TCP设备集成测试...
call "%~dp0run-tcp-device-test-v3.bat"

REM 步骤2: 分析测试结果
echo.
echo 步骤2: 正在分析测试结果...
call "%~dp0analyze-tcp-device-tests.bat"

echo.
echo 测试流程已完成，感谢使用！
echo 按任意键退出...
pause > nul
