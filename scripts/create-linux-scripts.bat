@echo off
echo ===================================================
echo        AICAM V2 Linux启动脚本创建工具
echo ===================================================

echo 正在创建远程Linux环境下的启动和管理脚本...
powershell -ExecutionPolicy Bypass -File "%~dp0create-linux-scripts.ps1"

echo.
echo ===================================================
echo 脚本创建完成！现在可以使用remote-login.bat登录到
echo 远程Linux服务器，然后运行相应的脚本。
echo ===================================================

pause
