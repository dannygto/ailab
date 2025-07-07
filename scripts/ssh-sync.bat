@echo off
echo ===================================================
echo        AICAM V2 Linux Remote Sync Tool (OpenSSH)
echo ===================================================

setlocal enabledelayedexpansion

set REMOTE_HOST=82.156.75.232
set REMOTE_USER=ubuntu
set LOCAL_PATH=D:\AICAMV2
set REMOTE_PATH=/home/ubuntu/AICAMV2

echo Testing connection to remote server...
ping -n 1 %REMOTE_HOST% >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Cannot connect to remote server!
    exit /b 1
)
echo [OK] Remote server is reachable.

echo.
echo Creating remote directories...
ssh %REMOTE_USER%@%REMOTE_HOST% "mkdir -p %REMOTE_PATH%/{frontend,backend,ai,scripts,项目管理}"

echo.
echo Syncing frontend code...
scp -r "%LOCAL_PATH%\frontend\src" "%REMOTE_USER%@%REMOTE_HOST%:%REMOTE_PATH%/frontend/"
scp -r "%LOCAL_PATH%\frontend\package.json" "%REMOTE_USER%@%REMOTE_HOST%:%REMOTE_PATH%/frontend/"

echo.
echo Syncing backend code...
scp -r "%LOCAL_PATH%\backend\src" "%REMOTE_USER%@%REMOTE_HOST%:%REMOTE_PATH%/backend/"
scp -r "%LOCAL_PATH%\backend\package.json" "%REMOTE_USER%@%REMOTE_HOST%:%REMOTE_PATH%/backend/"

echo.
echo Syncing AI service code...
scp -r "%LOCAL_PATH%\ai\*.py" "%REMOTE_USER%@%REMOTE_HOST%:%REMOTE_PATH%/ai/"
scp -r "%LOCAL_PATH%\ai\requirements.txt" "%REMOTE_USER%@%REMOTE_HOST%:%REMOTE_PATH%/ai/"

echo.
echo Syncing project documents...
scp -r "%LOCAL_PATH%\项目管理\*.md" "%REMOTE_USER%@%REMOTE_HOST%:%REMOTE_PATH%/项目管理/"

echo.
echo Setting up correct file permissions on Linux...
ssh %REMOTE_USER%@%REMOTE_HOST% "find %REMOTE_PATH% -type d -exec chmod 755 {} \; && find %REMOTE_PATH% -type f -exec chmod 644 {} \; && find %REMOTE_PATH% -name '*.sh' -exec chmod +x {} \;"

echo.
echo Converting files to Unix format...
ssh %REMOTE_USER%@%REMOTE_HOST% "sudo apt-get update -y && sudo apt-get install -y dos2unix && find %REMOTE_PATH% -type f -name '*.py' -exec dos2unix {} \; && find %REMOTE_PATH% -type f -name '*.js' -exec dos2unix {} \; && find %REMOTE_PATH% -type f -name '*.ts' -exec dos2unix {} \; && find %REMOTE_PATH% -type f -name '*.md' -exec dos2unix {} \;"

echo.
echo ===================================================
echo               Sync Complete!
echo ===================================================
echo You can now:
echo 1. Use 'ssh %REMOTE_USER%@%REMOTE_HOST%' to connect to the Linux server
echo 2. Navigate to '%REMOTE_PATH%' to access the project

echo.
echo Timestamp: %date% %time%
echo "Last sync: %date% %time%" > "%LOCAL_PATH%\scripts\last_sync.txt"

echo.
echo Done!
