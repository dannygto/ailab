@echo off
echo ===================================================
echo        AICAM V2 SSH Key Setup Tool
echo ===================================================

set REMOTE_HOST=82.156.75.232
set USERNAME=ubuntu
set PASSWORD=Danny486020!!&&

echo.
echo Step 1: Generating SSH key pair...
if not exist "%USERPROFILE%\.ssh" mkdir "%USERPROFILE%\.ssh"

echo.
echo Checking if SSH key already exists...
if exist "%USERPROFILE%\.ssh\id_rsa" (
    echo SSH key already exists. Do you want to create a new one? (y/n)
    set /p choice=
    if /i "%choice%"=="y" (
        echo Creating new SSH key...
        ssh-keygen -t rsa -b 4096 -f "%USERPROFILE%\.ssh\id_rsa" -N ""
    ) else (
        echo Using existing SSH key.
    )
) else (
    echo Creating new SSH key...
    ssh-keygen -t rsa -b 4096 -f "%USERPROFILE%\.ssh\id_rsa" -N ""
)

echo.
echo Step 2: Testing connection to remote server...
ping -n 1 %REMOTE_HOST% >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Cannot connect to remote server!
    goto :error
)
echo [OK] Remote server is reachable.

echo.
echo Step 3: Installing public key on remote server...
echo This will require entering the password once to set up key-based authentication.
echo After this setup, you won't need to enter password again.
echo.

echo Creating .ssh directory on remote server...
ssh -o StrictHostKeyChecking=no %USERNAME%@%REMOTE_HOST% "mkdir -p ~/.ssh && chmod 700 ~/.ssh"

echo.
echo Copying public key to remote server...
type "%USERPROFILE%\.ssh\id_rsa.pub" | ssh %USERNAME%@%REMOTE_HOST% "cat >> ~/.ssh/authorized_keys && chmod 600 ~/.ssh/authorized_keys"

echo.
echo Step 4: Testing key-based authentication...
ssh -o StrictHostKeyChecking=no %USERNAME%@%REMOTE_HOST% "echo 'SSH key authentication successful!'"

if %errorlevel% equ 0 (
    echo.
    echo ===================================================
    echo           SSH Key Setup Complete!
    echo ===================================================
    echo SSH key-based authentication is now configured.
    echo You can now use the following scripts without password:
    echo - remote-login-new.bat (for SSH login)
    echo - linux-sync-new.bat (for project sync)
    echo.
    echo Your SSH key files:
    echo - Private key: %USERPROFILE%\.ssh\id_rsa
    echo - Public key: %USERPROFILE%\.ssh\id_rsa.pub
    echo.
    echo ===================================================
) else (
    echo.
    echo [ERROR] SSH key setup failed. Please check the connection and try again.
    goto :error
)

goto :end

:error
echo.
echo Setup failed. Please check:
echo 1. Network connection to %REMOTE_HOST%
echo 2. SSH service is running on remote server
echo 3. Username and password are correct
pause
exit /b 1

:end
echo Press any key to exit...
pause >nul
