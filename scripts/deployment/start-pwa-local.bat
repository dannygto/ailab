@echo off
echo ==========================================
echo 🚀 AILAB PWA 本地快速启动
echo ==========================================

REM 记录正确的连接信息
echo 📝 连接信息记录:
echo    SSH密钥: C:\Users\danny\.ssh\id_rsa_aicam
echo    远程服务器: ubuntu@82.156.75.232
echo    本地用户: danny

echo.
echo 🛑 停止占用3000端口的进程...

REM 查找并杀死占用3000端口的进程
for /f "tokens=5" %%a in ('netstat -aon ^| find ":3000" ^| find "LISTENING"') do (
    echo 杀死进程 %%a
    taskkill /f /pid %%a 2>nul
)

echo.
echo 📂 进入前端目录...
cd /d "d:\ailab\ailab\src\frontend"

echo.
echo 🔨 构建前端应用...
call npm run build

if not exist "build" (
    echo ❌ 构建失败！
    pause
    exit /b 1
)

echo.
echo ✅ 构建成功！

echo.
echo 🔍 验证PWA文件...
if exist "build\manifest.json" (
    echo ✅ manifest.json 存在
) else (
    echo ❌ manifest.json 缺失
)

if exist "build\sw.js" (
    echo ✅ Service Worker 存在
) else (
    echo ❌ Service Worker 缺失
)

if exist "public\sw.js" (
    echo 📋 复制Service Worker到构建目录...
    copy "public\sw.js" "build\sw.js"
)

echo.
echo 🌐 启动PWA服务器（端口3000）...
echo    本地地址: http://localhost:3000
echo    局域网地址: http://192.168.0.145:3000

echo.
echo 🚀 正在启动服务器...
start "AILAB PWA Server" npx serve -s build -l 3000

echo.
echo ⏰ 等待服务启动...
timeout /t 5 /nobreak >nul

echo.
echo 🧪 测试连接...
curl -s http://localhost:3000 >nul 2>&1
if %errorlevel% == 0 (
    echo ✅ 服务启动成功！
) else (
    echo ⚠️  服务可能仍在启动中...
)

echo.
echo ==========================================
echo 📱 PWA测试说明
echo ==========================================
echo.
echo 请在浏览器中访问: http://localhost:3000
echo.
echo 🔍 PWA功能测试清单:
echo  1. 等待5秒，查看是否出现安装按钮
echo  2. 检查右上角网络状态指示器
echo  3. 尝试断网测试离线功能
echo  4. 测试移动端响应式布局
echo  5. 查看开发者工具 ^> Application ^> Service Workers
echo.
echo 🌍 浏览器兼容性:
echo  ✅ Chrome/Edge: 100%% 功能支持
echo  ✅ Firefox: 部分支持（无安装提示）
echo  ✅ Safari: 基础PWA支持
echo.
echo 按任意键打开浏览器...
pause >nul

start http://localhost:3000

echo.
echo 🎯 服务器正在运行...
echo 按 Ctrl+C 停止服务
pause
