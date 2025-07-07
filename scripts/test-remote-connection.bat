@echo off
REM AICAM远程服务器连接测试

echo ===================================================
echo            AICAM远程服务器连接测试
echo ===================================================
echo.

set /p REMOTE_HOST=请输入远程服务器地址(例如: 192.168.1.100): 
set /p REMOTE_USER=请输入远程用户名(默认: aicam): 
if "%REMOTE_USER%"=="" set REMOTE_USER=aicam

set /p REMOTE_PORT=请输入SSH端口(默认: 22): 
if "%REMOTE_PORT%"=="" set REMOTE_PORT=22

echo.
echo 正在测试与远程服务器的连接...
echo 服务器: %REMOTE_USER%@%REMOTE_HOST%:%REMOTE_PORT%
echo.

REM 测试SSH连接
ssh -p %REMOTE_PORT% %REMOTE_USER%@%REMOTE_HOST% "echo 连接成功! && uname -a"

if %ERRORLEVEL% neq 0 (
    echo.
    echo ===================================================
    echo            连接失败!
    echo ===================================================
    echo.
    echo 请检查以下可能的问题:
    echo 1. 远程服务器地址是否正确
    echo 2. 远程服务器是否开启了SSH服务
    echo 3. 用户名和密码是否正确
    echo 4. 是否有网络连接问题
    echo.
    exit /b %ERRORLEVEL%
)

echo.
echo ===================================================
echo            连接成功!
echo ===================================================
echo.
echo 远程服务器准备就绪，可以部署和启动服务。
echo.
echo 请使用以下命令部署并启动服务:
echo .\scripts\remote-deploy-start.bat --host %REMOTE_HOST% --user %REMOTE_USER% --port %REMOTE_PORT%
echo.
