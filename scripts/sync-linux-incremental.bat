@echo off
REM AICAM增量同步工具
REM 支持选择性同步和增量同步到远程服务器

echo ===================================================
echo               AICAM增量同步工具
echo ===================================================
echo.

REM 设置默认值
set REMOTE_USER=aicam
set REMOTE_HOST=192.168.1.100
set REMOTE_PORT=22
set REMOTE_PATH=/home/aicam/aicam-platform
set SYNC_MODE=all
set DRY_RUN=false
set EXCLUDE_NODE_MODULES=true

REM 解析命令行参数
:parse_args
if "%~1"=="" goto :check_args
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
if /i "%~1"=="--mode" (
    set SYNC_MODE=%~2
    shift
    shift
    goto :parse_args
)
if /i "%~1"=="--dry-run" (
    set DRY_RUN=true
    shift
    goto :parse_args
)
if /i "%~1"=="--include-node-modules" (
    set EXCLUDE_NODE_MODULES=false
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
echo   sync-linux-incremental.bat [选项]
echo.
echo 选项:
echo   --host HOST             远程主机地址 (默认: 192.168.1.100)
echo   --user USER             远程用户名 (默认: aicam)
echo   --port PORT             SSH端口 (默认: 22)
echo   --path PATH             远程目标路径 (默认: /home/aicam/aicam-platform)
echo   --mode MODE             同步模式 (all, frontend, backend, ai, scripts, docs)
echo   --dry-run               仅显示将要同步的文件，不实际同步
echo   --include-node-modules  包含node_modules目录 (默认排除)
echo   --help                  显示此帮助信息
exit /b 0

:check_args
echo 同步配置:
echo   远程主机: %REMOTE_USER%@%REMOTE_HOST%:%REMOTE_PORT%
echo   远程路径: %REMOTE_PATH%
echo   同步模式: %SYNC_MODE%
echo   排除node_modules: %EXCLUDE_NODE_MODULES%
echo   仅模拟运行: %DRY_RUN%
echo.

REM 检查rsync是否安装
where rsync >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo 错误: rsync未安装. 请安装Windows版的rsync (如通过Cygwin或WSL)
    exit /b 1
)

REM 构建基本命令
set RSYNC_OPTS=-avz --progress
if "%DRY_RUN%"=="true" (
    set RSYNC_OPTS=%RSYNC_OPTS% --dry-run
)

REM 设置排除项
set EXCLUDE_OPTS=
if "%EXCLUDE_NODE_MODULES%"=="true" (
    set EXCLUDE_OPTS=--exclude="node_modules/" --exclude=".git/"
)

REM 设置同步源和目标
set SRC=.
set DEST=%REMOTE_USER%@%REMOTE_HOST%:%REMOTE_PATH%

REM 根据同步模式执行相应的同步命令
if /i "%SYNC_MODE%"=="all" (
    echo 同步整个项目...
    rsync %RSYNC_OPTS% %EXCLUDE_OPTS% -e "ssh -p %REMOTE_PORT%" %SRC%/ %DEST%/
) else if /i "%SYNC_MODE%"=="frontend" (
    echo 仅同步前端...
    rsync %RSYNC_OPTS% %EXCLUDE_OPTS% -e "ssh -p %REMOTE_PORT%" %SRC%/frontend/ %DEST%/frontend/
) else if /i "%SYNC_MODE%"=="backend" (
    echo 仅同步后端...
    rsync %RSYNC_OPTS% %EXCLUDE_OPTS% -e "ssh -p %REMOTE_PORT%" %SRC%/backend/ %DEST%/backend/
) else if /i "%SYNC_MODE%"=="ai" (
    echo 仅同步AI服务...
    rsync %RSYNC_OPTS% -e "ssh -p %REMOTE_PORT%" %SRC%/ai/ %DEST%/ai/
) else if /i "%SYNC_MODE%"=="scripts" (
    echo 仅同步脚本...
    rsync %RSYNC_OPTS% -e "ssh -p %REMOTE_PORT%" %SRC%/scripts/ %DEST%/scripts/
    rsync %RSYNC_OPTS% -e "ssh -p %REMOTE_PORT%" %SRC%/*.sh %DEST%/
) else if /i "%SYNC_MODE%"=="docs" (
    echo 仅同步文档...
    rsync %RSYNC_OPTS% -e "ssh -p %REMOTE_PORT%" %SRC%/文档/ %DEST%/文档/
) else (
    echo 错误: 未知的同步模式 %SYNC_MODE%
    echo 有效的模式: all, frontend, backend, ai, scripts, docs
    exit /b 1
)

if %ERRORLEVEL% neq 0 (
    echo 同步失败! 错误代码: %ERRORLEVEL%
    exit /b %ERRORLEVEL%
)

echo ===================================================
echo               同步完成!
echo ===================================================

REM 如果不是仅模拟运行，添加执行权限到Shell脚本
if "%DRY_RUN%"=="false" (
    echo 正在为远程Shell脚本添加执行权限...
    ssh -p %REMOTE_PORT% %REMOTE_USER%@%REMOTE_HOST% "chmod +x %REMOTE_PATH%/scripts/*.sh %REMOTE_PATH%/*.sh"
    echo 执行权限已添加!
)

exit /b 0
