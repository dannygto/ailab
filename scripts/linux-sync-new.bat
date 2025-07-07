@echo off
echo ===================================================
echo        AICAM V2 Linux Remote Sync Tool (OpenSSH)
echo ===================================================

echo Testing connection to remote server...
ping -n 1 82.156.75.232 >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Cannot connect to remote server!
    exit /b 1
)
echo [OK] Remote server is reachable.

echo.
echo Creating remote directories...
ssh ubuntu@82.156.75.232 "mkdir -p /home/ubuntu/AICAMV2/{frontend,backend,ai,scripts,docs}"

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
scp -r "D:\AICAMV2\项目管理\项目进度报告汇总-新.md" ubuntu@82.156.75.232:/home/ubuntu/AICAMV2/docs/project-status.md
scp -r "D:\AICAMV2\项目管理\T1-10-第一阶段测试与验收计划.md" ubuntu@82.156.75.232:/home/ubuntu/AICAMV2/docs/test-plan.md

echo.
echo Setting up correct file permissions on Linux...
ssh ubuntu@82.156.75.232 "find /home/ubuntu/AICAMV2 -type d -exec chmod 755 {} \; && find /home/ubuntu/AICAMV2 -type f -exec chmod 644 {} \; && find /home/ubuntu/AICAMV2 -name '*.sh' -exec chmod +x {} \;"

echo.
echo Converting files to Unix format...
ssh ubuntu@82.156.75.232 "sudo apt-get update -y && sudo apt-get install -y dos2unix && find /home/ubuntu/AICAMV2 -type f -name '*.py' -exec dos2unix {} \; && find /home/ubuntu/AICAMV2 -type f -name '*.js' -exec dos2unix {} \; && find /home/ubuntu/AICAMV2 -type f -name '*.ts' -exec dos2unix {} \; && find /home/ubuntu/AICAMV2 -type f -name '*.md' -exec dos2unix {} \;"

echo.
echo Setting up Node.js and Python environment...
ssh ubuntu@82.156.75.232 "sudo apt-get update -y && sudo apt-get install -y nodejs npm python3-pip"

echo.
echo Installing dependencies in remote environment...
ssh ubuntu@82.156.75.232 "cd /home/ubuntu/AICAMV2/frontend && npm install && cd /home/ubuntu/AICAMV2/backend && npm install && cd /home/ubuntu/AICAMV2/ai && pip3 install -r requirements.txt"

echo.
echo ===================================================
echo               Sync Complete!
echo ===================================================
echo You can now:
echo 1. Use remote-login-new.bat to connect to the Linux server
echo 2. Run the following commands on the remote Linux machine:
echo    - Check project status: cat /home/ubuntu/AICAMV2/docs/project-status.md
echo    - Frontend directory: cd /home/ubuntu/AICAMV2/frontend
echo    - Backend directory: cd /home/ubuntu/AICAMV2/backend
echo    - AI service directory: cd /home/ubuntu/AICAMV2/ai
echo.
echo Sync completed at %date% %time%

REM 记录同步时间
echo 最后同步时间: %date% %time% > last_sync.txt