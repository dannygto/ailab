@echo off
REM AICAM远程一键部署和启动脚本

echo ===================================================
echo            AICAM远程一键部署和启动
echo ===================================================
echo.

REM 设置默认值
set REMOTE_USER=aicam
set REMOTE_HOST=192.168.1.100
set REMOTE_PORT=22
set REMOTE_PATH=/home/aicam/aicam-platform

REM 解析命令行参数
:parse_args
if "%~1"=="" goto :continue
if /i "%~1"=="--host" (
    set REMOTE_HOST=%~2
    shift
    shift
    goto :parse_args
)
if /i "%~1"=="--user" (
    set REMOTE_USER=%~2
    shift
    shift
    goto :parse_args
)
if /i "%~1"=="--port" (
    set REMOTE_PORT=%~2
    shift
    shift
    goto :parse_args
)
if /i "%~1"=="--path" (
    set REMOTE_PATH=%~2
    shift
    shift
    goto :parse_args
)
if /i "%~1"=="--help" (
    goto :show_help
)
echo 未知参数: %~1
shift
goto :parse_args

:show_help
echo 用法:
echo   remote-deploy-start.bat [选项]
echo.
echo 选项:
echo   --host HOST        远程主机地址 (默认: 192.168.1.100)
echo   --user USER        远程用户名 (默认: aicam)
echo   --port PORT        SSH端口 (默认: 22)
echo   --path PATH        远程目标路径 (默认: /home/aicam/aicam-platform)
echo   --help             显示此帮助信息
exit /b 0

:continue
echo 部署配置:
echo   远程主机: %REMOTE_USER%@%REMOTE_HOST%:%REMOTE_PORT%
echo   远程路径: %REMOTE_PATH%
echo.

echo 步骤1: 同步项目文件到远程服务器...
call scripts\sync-linux-incremental.bat --host %REMOTE_HOST% --user %REMOTE_USER% --port %REMOTE_PORT% --path %REMOTE_PATH%

if %ERRORLEVEL% neq 0 (
    echo 错误: 文件同步失败! 错误代码: %ERRORLEVEL%
    exit /b %ERRORLEVEL%
)

echo.
echo 步骤2: 在远程服务器上执行启动脚本...
ssh -p %REMOTE_PORT% %REMOTE_USER%@%REMOTE_HOST% "cd %REMOTE_PATH% && chmod +x scripts/linux-server-start.sh && ./scripts/linux-server-start.sh"

if %ERRORLEVEL% neq 0 (
    echo 错误: 远程启动脚本执行失败! 错误代码: %ERRORLEVEL%
    exit /b %ERRORLEVEL%
)

echo.
echo ===================================================
echo         远程部署和启动成功!
echo ===================================================
echo.
echo 服务已在远程服务器上启动:
echo   - 前端: http://%REMOTE_HOST%:3000
echo   - 后端: http://%REMOTE_HOST%:3002
echo   - AI服务: http://%REMOTE_HOST%:5000
echo.
echo 使用以下命令停止远程服务:
echo   ssh -p %REMOTE_PORT% %REMOTE_USER%@%REMOTE_HOST% "cd %REMOTE_PATH% && ./scripts/linux-server-stop.sh"
echo.
