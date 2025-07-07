@echo off
setlocal enabledelayedexpansion

echo ===================================================
echo        AICAM V2 Linux 远程同步工具 (OpenSSH版)
echo ===================================================

set REMOTE_HOST=82.156.75.232
set USERNAME=ubuntu
set PASSWORD=Danny486020!!&&
set LOCAL_PATH=D:\AICAMV2
set REMOTE_PATH=/home/ubuntu/AICAMV2

echo 正在测试远程连接...
ping -n 1 %REMOTE_HOST% >nul 2>&1
if %errorlevel% neq 0 (
    echo [错误] 无法连接到远程服务器!
    goto :error
)
echo [成功] 远程服务器连接正常.

echo.
echo 创建远程目录结构...
ssh %USERNAME%@%REMOTE_HOST% "mkdir -p %REMOTE_PATH%/{frontend,backend,ai,scripts,项目管理}"

echo.
echo 同步前端代码...
scp -r "%LOCAL_PATH%\frontend\src" "%USERNAME%@%REMOTE_HOST%:%REMOTE_PATH%/frontend/"
scp -r "%LOCAL_PATH%\frontend\package.json" "%USERNAME%@%REMOTE_HOST%:%REMOTE_PATH%/frontend/"

echo.
echo 同步后端代码...
scp -r "%LOCAL_PATH%\backend\src" "%USERNAME%@%REMOTE_HOST%:%REMOTE_PATH%/backend/"
scp -r "%LOCAL_PATH%\backend\package.json" "%USERNAME%@%REMOTE_HOST%:%REMOTE_PATH%/backend/"

echo.
echo 同步AI服务代码...
scp -r "%LOCAL_PATH%\ai\*.py" "%USERNAME%@%REMOTE_HOST%:%REMOTE_PATH%/ai/"
scp -r "%LOCAL_PATH%\ai\requirements.txt" "%USERNAME%@%REMOTE_HOST%:%REMOTE_PATH%/ai/"

echo.
echo 同步项目管理文档...
scp -r "%LOCAL_PATH%\项目管理\*.md" "%USERNAME%@%REMOTE_HOST%:%REMOTE_PATH%/项目管理/"

echo.
echo 设置Linux文件权限...
ssh %USERNAME%@%REMOTE_HOST% "find %REMOTE_PATH% -type d -exec chmod 755 {} \; && find %REMOTE_PATH% -type f -exec chmod 644 {} \; && find %REMOTE_PATH% -name '*.sh' -exec chmod +x {} \;"

echo.
echo 转换文件为Unix格式...
ssh %USERNAME%@%REMOTE_HOST% "sudo apt-get update -y && sudo apt-get install -y dos2unix && find %REMOTE_PATH% -type f -name '*.py' -exec dos2unix {} \; && find %REMOTE_PATH% -type f -name '*.js' -exec dos2unix {} \; && find %REMOTE_PATH% -type f -name '*.ts' -exec dos2unix {} \; && find %REMOTE_PATH% -type f -name '*.md' -exec dos2unix {} \;"

echo.
echo ===================================================
echo               同步完成!
echo ===================================================
echo 您现在可以:
echo 1. 使用SSH连接到Linux服务器: ssh %USERNAME%@%REMOTE_HOST%
echo 2. 检查远程文件: cd %REMOTE_PATH%
echo 3. 安装前后端依赖:
echo    - 前端: cd %REMOTE_PATH%/frontend && npm install
echo    - 后端: cd %REMOTE_PATH%/backend && npm install
echo    - AI: cd %REMOTE_PATH%/ai && pip3 install -r requirements.txt
echo.
echo 同步完成时间: %date% %time%
echo ===================================================

goto :eof

:error
echo 同步过程中出现错误，请检查网络连接和远程服务器状态。
exit /b 1
