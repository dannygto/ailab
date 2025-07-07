@echo off
echo AICAM V2 项目定时同步工具
echo ===================================================

REM 执行快速同步
powershell -ExecutionPolicy Bypass -File "%~dp0auto-sync.ps1" -QuickSync

echo.
echo 快速同步完成！
echo 若需完整同步（包括环境设置），请运行 auto-sync-full.bat
echo ===================================================

REM 显示最后同步时间
if exist "%~dp0last_sync.txt" (
    type "%~dp0last_sync.txt"
)

pause
