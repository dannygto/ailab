@echo off
echo ===================================================
echo        AICAM V2 Linux Remote Sync Tool (OpenSSH)
echo ===================================================

set REMOTE_HOST=82.156.75.232
set USERNAME=ubuntu
set PASSWORD=Danny486020!!&&
set LOCAL_PATH=D:\AICAMV2
set REMOTE_PATH=/home/ubuntu/AICAMV2

echo Testing connection to remote server...
ping -n 1 %REMOTE_HOST% >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Cannot connect to remote server!
    exit /b 1
)
echo [OK] Remote server is reachable.

REM 创建一个临时的expect脚本，用于自动输入密码
echo.
echo Creating temporary expect script for SSH automation...
set TEMP_EXPECT=%TEMP%\ssh_expect.exp
echo spawn ssh %USERNAME%@%REMOTE_HOST% "mkdir -p %REMOTE_PATH%/{frontend,backend,ai,scripts,docs}" > %TEMP_EXPECT%
echo expect "password:" >> %TEMP_EXPECT%
echo send "%PASSWORD%\r" >> %TEMP_EXPECT%
echo expect eof >> %TEMP_EXPECT%

REM 使用expect自动输入密码执行远程命令
echo.
echo Creating remote directories...
expect -f %TEMP_EXPECT%

REM 同步前端代码
echo.
echo Syncing frontend code...
set TEMP_EXPECT=%TEMP%\scp_frontend_src.exp
echo spawn scp -r %LOCAL_PATH%\frontend\src %USERNAME%@%REMOTE_HOST%:%REMOTE_PATH%/frontend/ > %TEMP_EXPECT%
echo expect "password:" >> %TEMP_EXPECT%
echo send "%PASSWORD%\r" >> %TEMP_EXPECT%
echo expect eof >> %TEMP_EXPECT%
expect -f %TEMP_EXPECT%

set TEMP_EXPECT=%TEMP%\scp_frontend_pkg.exp
echo spawn scp -r %LOCAL_PATH%\frontend\package.json %USERNAME%@%REMOTE_HOST%:%REMOTE_PATH%/frontend/ > %TEMP_EXPECT%
echo expect "password:" >> %TEMP_EXPECT%
echo send "%PASSWORD%\r" >> %TEMP_EXPECT%
echo expect eof >> %TEMP_EXPECT%
expect -f %TEMP_EXPECT%

REM 同步后端代码
echo.
echo Syncing backend code...
set TEMP_EXPECT=%TEMP%\scp_backend_src.exp
echo spawn scp -r %LOCAL_PATH%\backend\src %USERNAME%@%REMOTE_HOST%:%REMOTE_PATH%/backend/ > %TEMP_EXPECT%
echo expect "password:" >> %TEMP_EXPECT%
echo send "%PASSWORD%\r" >> %TEMP_EXPECT%
echo expect eof >> %TEMP_EXPECT%
expect -f %TEMP_EXPECT%

set TEMP_EXPECT=%TEMP%\scp_backend_pkg.exp
echo spawn scp -r %LOCAL_PATH%\backend\package.json %USERNAME%@%REMOTE_HOST%:%REMOTE_PATH%/backend/ > %TEMP_EXPECT%
echo expect "password:" >> %TEMP_EXPECT%
echo send "%PASSWORD%\r" >> %TEMP_EXPECT%
echo expect eof >> %TEMP_EXPECT%
expect -f %TEMP_EXPECT%

REM 同步AI服务代码
echo.
echo Syncing AI service code...
set TEMP_EXPECT=%TEMP%\scp_ai_py.exp
echo spawn scp -r %LOCAL_PATH%\ai\*.py %USERNAME%@%REMOTE_HOST%:%REMOTE_PATH%/ai/ > %TEMP_EXPECT%
echo expect "password:" >> %TEMP_EXPECT%
echo send "%PASSWORD%\r" >> %TEMP_EXPECT%
echo expect eof >> %TEMP_EXPECT%
expect -f %TEMP_EXPECT%

set TEMP_EXPECT=%TEMP%\scp_ai_req.exp
echo spawn scp -r %LOCAL_PATH%\ai\requirements.txt %USERNAME%@%REMOTE_HOST%:%REMOTE_PATH%/ai/ > %TEMP_EXPECT%
echo expect "password:" >> %TEMP_EXPECT%
echo send "%PASSWORD%\r" >> %TEMP_EXPECT%
echo expect eof >> %TEMP_EXPECT%
expect -f %TEMP_EXPECT%

REM 同步项目文档（避免中文路径问题）
echo.
echo Syncing project documents...
set TEMP_EXPECT=%TEMP%\scp_docs_status.exp
echo spawn scp -r "%LOCAL_PATH%\项目管理\项目进度报告汇总-新.md" %USERNAME%@%REMOTE_HOST%:%REMOTE_PATH%/docs/project-status.md > %TEMP_EXPECT%
echo expect "password:" >> %TEMP_EXPECT%
echo send "%PASSWORD%\r" >> %TEMP_EXPECT%
echo expect eof >> %TEMP_EXPECT%
expect -f %TEMP_EXPECT%

set TEMP_EXPECT=%TEMP%\scp_docs_plan.exp
echo spawn scp -r "%LOCAL_PATH%\项目管理\T1-10-第一阶段测试与验收计划.md" %USERNAME%@%REMOTE_HOST%:%REMOTE_PATH%/docs/test-plan.md > %TEMP_EXPECT%
echo expect "password:" >> %TEMP_EXPECT%
echo send "%PASSWORD%\r" >> %TEMP_EXPECT%
echo expect eof >> %TEMP_EXPECT%
expect -f %TEMP_EXPECT%

REM 设置正确的Linux文件权限
echo.
echo Setting up correct file permissions on Linux...
set TEMP_EXPECT=%TEMP%\ssh_chmod.exp
echo spawn ssh %USERNAME%@%REMOTE_HOST% "find %REMOTE_PATH% -type d -exec chmod 755 {} \; && find %REMOTE_PATH% -type f -exec chmod 644 {} \; && find %REMOTE_PATH% -name '*.sh' -exec chmod +x {} \;" > %TEMP_EXPECT%
echo expect "password:" >> %TEMP_EXPECT%
echo send "%PASSWORD%\r" >> %TEMP_EXPECT%
echo expect eof >> %TEMP_EXPECT%
expect -f %TEMP_EXPECT%

REM 转换文件为Unix格式
echo.
echo Converting files to Unix format...
set TEMP_EXPECT=%TEMP%\ssh_dos2unix.exp
echo spawn ssh %USERNAME%@%REMOTE_HOST% "sudo apt-get update -y && sudo apt-get install -y dos2unix && find %REMOTE_PATH% -type f -name '*.py' -exec dos2unix {} \; && find %REMOTE_PATH% -type f -name '*.js' -exec dos2unix {} \; && find %REMOTE_PATH% -type f -name '*.ts' -exec dos2unix {} \; && find %REMOTE_PATH% -type f -name '*.md' -exec dos2unix {} \;" > %TEMP_EXPECT%
echo expect "password:" >> %TEMP_EXPECT%
echo send "%PASSWORD%\r" >> %TEMP_EXPECT%
echo expect "password" >> %TEMP_EXPECT%
echo send "%PASSWORD%\r" >> %TEMP_EXPECT%
echo expect eof >> %TEMP_EXPECT%
expect -f %TEMP_EXPECT%

REM 在远程安装依赖
echo.
echo Installing dependencies on remote server...
set TEMP_EXPECT=%TEMP%\ssh_install_deps.exp
echo spawn ssh %USERNAME%@%REMOTE_HOST% "cd %REMOTE_PATH%/frontend && npm install && cd %REMOTE_PATH%/backend && npm install && cd %REMOTE_PATH%/ai && pip3 install -r requirements.txt" > %TEMP_EXPECT%
echo expect "password:" >> %TEMP_EXPECT%
echo send "%PASSWORD%\r" >> %TEMP_EXPECT%
echo expect eof >> %TEMP_EXPECT%
expect -f %TEMP_EXPECT%

REM 清理临时文件
echo.
echo Cleaning up temporary files...
del /q %TEMP%\ssh_*.exp
del /q %TEMP%\scp_*.exp

echo.
echo ===================================================
echo               Sync Complete!
echo ===================================================
echo You can now:
echo 1. Use remote-login-new.bat to connect to the Linux server
echo 2. On the remote Linux server, you can:
echo    - View project status: cat %REMOTE_PATH%/docs/project-status.md
echo    - Enter frontend directory: cd %REMOTE_PATH%/frontend
echo    - Enter backend directory: cd %REMOTE_PATH%/backend
echo    - Start frontend: cd %REMOTE_PATH%/frontend && npm start
echo    - Start backend: cd %REMOTE_PATH%/backend && npm start
echo    - Start AI service: cd %REMOTE_PATH%/ai && python3 main.py
echo.
echo Sync completed at: %DATE% %TIME%
echo ===================================================
