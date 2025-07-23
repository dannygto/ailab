@echo off
echo ===================================================
echo     正在运行TCP设备测试分析工具
echo     用于分析测试结果并生成优化建议
echo ===================================================
echo.
powershell -ExecutionPolicy Bypass -File "%~dp0scripts\run-tcp-device-analyzer.ps1"
echo.
echo 分析已完成，分析报告保存在 tests\reports\analysis 目录
echo 按任意键退出...
pause > nul
