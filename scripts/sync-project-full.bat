@echo off
setlocal enabledelayedexpansion

echo ===================================================
echo AICAM V2 项目远程开发同步工具
echo ===================================================
echo.
echo 正在连接远程开发机 (82.156.75.232)...

:: 检查远程主机是否可访问
ping -n 1 82.156.75.232 >nul 2>&1
if %errorlevel% neq 0 (
    echo [错误] 无法连接到远程主机，请检查网络连接
    goto :exit
)

echo [√] 远程主机连接正常

echo.
echo 1. 正在同步项目代码...
echo    - 本地路径: D:\AICAMV2
echo    - 远程路径: /home/ubuntu/AICAMV2
echo.

:: 创建远程目录结构
plink -batch -ssh ubuntu@82.156.75.232 -pw "Danny486020!!&&" "mkdir -p /home/ubuntu/AICAMV2"
if %errorlevel% neq 0 (
    echo [错误] 创建远程目录失败
    goto :exit
)

:: 同步整个项目
pscp -batch -r -pw "Danny486020!!&&" D:\AICAMV2\* ubuntu@82.156.75.232:/home/ubuntu/AICAMV2/
if %errorlevel% neq 0 (
    echo [错误] 项目同步失败
    goto :exit
)

echo [√] 项目代码同步完成

echo.
echo 2. 正在设置远程开发环境...

:: 创建远程安装脚本
echo #!/bin/bash > setup_temp.sh
echo echo "===== 正在设置AICAM V2开发环境 =====" >> setup_temp.sh
echo echo "安装Node.js依赖..." >> setup_temp.sh
echo cd /home/ubuntu/AICAMV2 >> setup_temp.sh
echo npm install --prefix ./frontend >> setup_temp.sh
echo npm install --prefix ./backend >> setup_temp.sh
echo echo "安装Python依赖..." >> setup_temp.sh
echo pip install -r ./ai/requirements.txt >> setup_temp.sh
echo echo "===== 环境设置完成 =====" >> setup_temp.sh

:: 上传并执行安装脚本
pscp -batch -pw "Danny486020!!&&" setup_temp.sh ubuntu@82.156.75.232:/home/ubuntu/setup_aicam.sh
del setup_temp.sh
plink -batch -ssh ubuntu@82.156.75.232 -pw "Danny486020!!&&" "chmod +x /home/ubuntu/setup_aicam.sh && /home/ubuntu/setup_aicam.sh"

echo [√] 远程环境设置完成

echo.
echo 3. 正在创建项目状态报告...

:: 创建项目状态报告
plink -batch -ssh ubuntu@82.156.75.232 -pw "Danny486020!!&&" "cat > /home/ubuntu/AICAM-PROJECT-STATUS.md" < D:\AICAMV2\项目管理\项目进度报告汇总-新.md

echo [√] 项目状态报告已同步

echo.
echo ===================================================
echo 同步完成！远程开发环境已准备就绪
echo ===================================================
echo 您现在可以：
echo 1. 使用remote-login.bat连接到远程开发机
echo 2. 在远程机器上访问以下路径：
echo    - 项目代码: /home/ubuntu/AICAMV2
echo    - 项目状态: /home/ubuntu/AICAM-PROJECT-STATUS.md
echo.
echo 开发愉快！
echo ===================================================

:exit
pause
