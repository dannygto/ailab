@echo off
REM AILAB 快速部署脚本 (Windows版本)
REM 自动构建前端并部署到服务器

echo ======================================
echo   AILAB 快速部署工具
echo   服务器: 82.156.75.232
echo ======================================

REM 检查密钥文件
if not exist "ailab.pem" (
    echo [错误] 找不到密钥文件 ailab.pem
    pause
    exit /b 1
)

REM 构建前端
echo [信息] 正在构建前端...
cd src\frontend
call npm run build
if errorlevel 1 (
    echo [错误] 前端构建失败
    pause
    exit /b 1
)
cd ..\..

REM 上传构建文件
echo [信息] 正在上传文件到服务器...
scp -i "ailab.pem" -r src\frontend\build\* ubuntu@82.156.75.232:/home/ubuntu/ailab/src/frontend/build/

REM 上传后端代码
echo [信息] 正在上传后端代码...
scp -i "ailab.pem" -r src\backend\src\* ubuntu@82.156.75.232:/home/ubuntu/ailab/src/backend/src/
scp -i "ailab.pem" src\backend\package.json ubuntu@82.156.75.232:/home/ubuntu/ailab/src/backend/
scp -i "ailab.pem" src\backend\tsconfig.json ubuntu@82.156.75.232:/home/ubuntu/ailab/src/backend/

REM 重启服务
echo [信息] 正在重启服务...
ssh -i "ailab.pem" ubuntu@82.156.75.232 "cd /home/ubuntu/ailab && pm2 restart all"

echo [成功] 部署完成！
echo 访问地址: http://82.156.75.232:3000
pause
