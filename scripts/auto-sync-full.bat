@echo off
echo AICAM V2 项目完整同步工具
echo ===================================================

REM 执行完整同步
powershell -ExecutionPolicy Bypass -File "%~dp0auto-sync.ps1"

echo.
echo 完整同步完成！
echo ===================================================

REM 显示最后同步时间
if exist "%~dp0last_sync.txt" (
    type "%~dp0last_sync.txt"
)

pause
