@echo off
echo ===================================================
echo        AICAM V2 Linux Remote Sync Tool
echo ===================================================

echo Testing connection to remote server...
ssh -o BatchMode=yes ubuntu@82.156.75.232 "echo Connection successful" >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Cannot connect to remote server!
    goto :error
)
echo [OK] Remote server is reachable.

echo.
echo Creating remote directories...
ssh ubuntu@82.156.75.232 "mkdir -p /home/ubuntu/AICAMV2/{frontend,backend,ai,scripts,project_docs}"

echo.
echo Syncing frontend code...
scp -r D:\AICAMV2\frontend\src ubuntu@82.156.75.232:/home/ubuntu/AICAMV2/frontend/
scp -r D:\AICAMV2\frontend\package.json ubuntu@82.156.75.232:/home/ubuntu/AICAMV2/frontend/

echo.
echo Syncing backend code...
scp -r D:\AICAMV2\backend\src ubuntu@82.156.75.232:/home/ubuntu/AICAMV2/backend/
scp -r D:\AICAMV2\backend\package.json ubuntu@82.156.75.232:/home/ubuntu/AICAMV2/backend/

echo.
echo Syncing AI service code...
scp -r D:\AICAMV2\ai\*.py ubuntu@82.156.75.232:/home/ubuntu/AICAMV2/ai/
scp -r D:\AICAMV2\ai\requirements.txt ubuntu@82.156.75.232:/home/ubuntu/AICAMV2/ai/

echo.
echo Syncing project documents...
:: 创建临时英文目录避免中文编码问题
mkdir -p temp_docs >nul 2>&1
copy D:\AICAMV2\项目管理\*.md temp_docs\ >nul 2>&1
scp -r temp_docs\*.md ubuntu@82.156.75.232:/home/ubuntu/AICAMV2/project_docs/
rmdir /s /q temp_docs >nul 2>&1

echo.
echo Setting up correct file permissions on Linux...
ssh ubuntu@82.156.75.232 "find /home/ubuntu/AICAMV2 -type d -exec chmod 755 {} \; && find /home/ubuntu/AICAMV2 -type f -exec chmod 644 {} \; && find /home/ubuntu/AICAMV2 -name '*.sh' -exec chmod +x {} \;"

echo.
echo Converting files to Unix format...
ssh ubuntu@82.156.75.232 "sudo apt-get update -y && sudo apt-get install -y dos2unix && find /home/ubuntu/AICAMV2 -type f -name '*.py' -exec dos2unix {} \; && find /home/ubuntu/AICAMV2 -type f -name '*.js' -exec dos2unix {} \; && find /home/ubuntu/AICAMV2 -type f -name '*.ts' -exec dos2unix {} \; && find /home/ubuntu/AICAMV2 -type f -name '*.md' -exec dos2unix {} \;"

echo.
echo Installing dependencies on the remote server...
ssh ubuntu@82.156.75.232 "cd /home/ubuntu/AICAMV2/frontend && npm install && cd /home/ubuntu/AICAMV2/backend && npm install && cd /home/ubuntu/AICAMV2/ai && pip3 install -r requirements.txt"

echo.
echo ===================================================
echo               Sync Complete!
echo ===================================================
echo You can now:
echo 1. Use 'ssh ubuntu@82.156.75.232' to connect to the Linux server
echo 2. Access your project at /home/ubuntu/AICAMV2
echo 3. Check project status docs at /home/ubuntu/AICAMV2/project_docs
echo.
echo Happy coding!
exit /b 0

:error
echo Sync failed!
exit /b 1
