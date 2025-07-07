@echo off
echo ===================================================
echo        AICAM V2 Linux Remote Sync Tool
echo ===================================================

echo Testing connection to remote server...
ping -n 1 82.156.75.232 >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Cannot connect to remote server!
    goto :error
)
echo [OK] Remote server is reachable.

echo.
echo Creating remote directories...
plink -batch -ssh ubuntu@82.156.75.232 -pw "Danny486020!!&&" "mkdir -p /home/ubuntu/AICAMV2/{frontend,backend,ai,scripts,项目管理}"

echo.
echo Syncing frontend code...
pscp -batch -r -pw "Danny486020!!&&" D:\AICAMV2\frontend\src ubuntu@82.156.75.232:/home/ubuntu/AICAMV2/frontend/
pscp -batch -r -pw "Danny486020!!&&" D:\AICAMV2\frontend\package.json ubuntu@82.156.75.232:/home/ubuntu/AICAMV2/frontend/

echo.
echo Syncing backend code...
pscp -batch -r -pw "Danny486020!!&&" D:\AICAMV2\backend\src ubuntu@82.156.75.232:/home/ubuntu/AICAMV2/backend/
pscp -batch -r -pw "Danny486020!!&&" D:\AICAMV2\backend\package.json ubuntu@82.156.75.232:/home/ubuntu/AICAMV2/backend/

echo.
echo Syncing AI service code...
pscp -batch -r -pw "Danny486020!!&&" D:\AICAMV2\ai\*.py ubuntu@82.156.75.232:/home/ubuntu/AICAMV2/ai/
pscp -batch -r -pw "Danny486020!!&&" D:\AICAMV2\ai\requirements.txt ubuntu@82.156.75.232:/home/ubuntu/AICAMV2/ai/

echo.
echo Syncing project documents...
pscp -batch -r -pw "Danny486020!!&&" D:\AICAMV2\项目管理\*.md ubuntu@82.156.75.232:/home/ubuntu/AICAMV2/项目管理/

echo.
echo Setting up correct file permissions on Linux...
plink -batch -ssh ubuntu@82.156.75.232 -pw "Danny486020!!&&" "find /home/ubuntu/AICAMV2 -type d -exec chmod 755 {} \; && find /home/ubuntu/AICAMV2 -type f -exec chmod 644 {} \; && find /home/ubuntu/AICAMV2 -name '*.sh' -exec chmod +x {} \;"

echo.
echo Converting files to Unix format...
plink -batch -ssh ubuntu@82.156.75.232 -pw "Danny486020!!&&" "sudo apt-get update -y && sudo apt-get install -y dos2unix && find /home/ubuntu/AICAMV2 -type f -name '*.py' -exec dos2unix {} \; && find /home/ubuntu/AICAMV2 -type f -name '*.js' -exec dos2unix {} \; && find /home/ubuntu/AICAMV2 -type f -name '*.ts' -exec dos2unix {} \; && find /home/ubuntu/AICAMV2 -type f -name '*.md' -exec dos2unix {} \;"

echo.
echo ===================================================
echo               Sync Complete!
echo ===================================================
echo You can now:
echo 1. Use remote-login.bat to connect to the Linux server
echo 2. Access your project at: /home/ubuntu/AICAMV2
echo.
echo Last sync time: %DATE% %TIME%
echo ===================================================

goto :end

:error
echo Sync process failed! Please check the errors above.

:end
pause
