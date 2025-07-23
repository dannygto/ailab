@echo off
echo ===================================================
echo     正在运行TCP设备集成测试 V3
echo     用于测试实际设备与平台的通信和数据交换
echo ===================================================
echo.
powershell -ExecutionPolicy Bypass -File "%~dp0scripts\run-tcp-device-test-v3.ps1"
echo.
echo 测试已完成，测试报告保存在 tests\reports 目录
echo 按任意键退出...
pause > nul
