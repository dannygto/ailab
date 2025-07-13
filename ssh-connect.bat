@echo off
REM AILAB 服务器快速连接脚本
REM 使用方法: 双击运行或在CMD中执行

echo ======================================
echo   AILAB 服务器快速连接
echo   服务器: 82.156.75.232
echo ======================================

REM 检查密钥文件
if not exist "ailab.pem" (
    echo [错误] 找不到密钥文件 ailab.pem
    echo 请确保密钥文件在当前目录中
    pause
    exit /b 1
)

REM 连接到服务器
echo [信息] 正在连接到服务器...
ssh -i "ailab.pem" ubuntu@82.156.75.232

pause
