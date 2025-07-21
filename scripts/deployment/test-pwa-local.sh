#!/bin/bash

# 🚨 正确的连接信息记录
# SSH密钥: C:\Users\danny\.ssh\id_rsa_aicam
# 远程服务器: ubuntu@82.156.75.232
# 本地用户目录: C:\Users\danny

echo "=========================================="
echo "🚀 AILAB PWA 本地部署和修复"
echo "=========================================="

# 检查本地前端构建状态
echo "📦 检查本地前端构建..."
cd "d:\ailab\ailab\src\frontend"

# 先停止可能占用3000端口的进程
echo "🛑 停止可能的端口占用..."
for /f "tokens=5" %a in ('netstat -aon ^| find ":3000" ^| find "LISTENING"') do taskkill /f /pid %a 2>nul

# 安装依赖（如果需要）
if [ ! -d "node_modules" ]; then
    echo "📥 安装前端依赖..."
    npm install
fi

# 构建前端
echo "🔨 构建前端应用..."
npm run build

# 检查构建结果
if [ -d "build" ]; then
    echo "✅ 前端构建成功"
    echo "📁 构建目录大小: $(du -sh build | cut -f1)"
    echo "📄 主要文件:"
    ls -la build/static/js/*.js | head -3
    ls -la build/static/css/*.css | head -3
else
    echo "❌ 前端构建失败"
    exit 1
fi

# 验证PWA文件
echo "🔍 验证PWA配置文件..."
echo "📋 检查清单:"

if [ -f "build/manifest.json" ]; then
    echo "✅ manifest.json 存在"
    echo "   - 应用名称: $(cat build/manifest.json | jq -r '.name' 2>/dev/null || echo '未知')"
    echo "   - 短名称: $(cat build/manifest.json | jq -r '.short_name' 2>/dev/null || echo '未知')"
else
    echo "❌ manifest.json 缺失"
fi

if [ -f "build/sw.js" ]; then
    echo "✅ Service Worker 存在"
    echo "   - 文件大小: $(ls -lh build/sw.js | awk '{print $5}')"
else
    echo "❌ Service Worker 缺失"
fi

if [ -f "build/offline.html" ]; then
    echo "✅ 离线页面存在"
else
    echo "❌ 离线页面缺失"
fi

if [ -f "build/favicon.ico" ]; then
    echo "✅ 图标文件存在"
else
    echo "❌ 图标文件缺失"
fi

# 启动本地服务器测试
echo "🌐 启动本地PWA测试服务器..."
echo "   端口: 3000"
echo "   地址: http://localhost:3000"

# 使用serve启动（确保指定端口3000）
npx serve -s build -l 3000 &
SERVER_PID=$!

echo "🔄 等待服务启动..."
sleep 5

# 测试本地服务
echo "🧪 测试本地PWA功能..."

# 基础连接测试
if curl -s http://localhost:3000 > /dev/null; then
    echo "✅ 前端服务正常"

    # 测试PWA特性
    echo "🔍 检查PWA特性..."

    # 检查manifest
    if curl -s http://localhost:3000/manifest.json | grep -q "人工智能辅助实验平台"; then
        echo "✅ PWA Manifest 可访问"
    else
        echo "⚠️  PWA Manifest 可能有问题"
    fi

    # 检查Service Worker
    if curl -s http://localhost:3000/sw.js | grep -q "Service Worker"; then
        echo "✅ Service Worker 可访问"
    else
        echo "⚠️  Service Worker 可能有问题"
    fi

    # 检查离线页面
    if curl -s http://localhost:3000/offline.html | grep -q "离线模式"; then
        echo "✅ 离线页面正常"
    else
        echo "⚠️  离线页面可能有问题"
    fi

else
    echo "❌ 前端服务异常"
fi

echo ""
echo "=========================================="
echo "📱 PWA 浏览器兼容性说明"
echo "=========================================="
echo ""
echo "✅ 支持的浏览器和平台:"
echo "   🌍 桌面端:"
echo "   - Chrome 73+ (完全支持)"
echo "   - Edge 79+ (完全支持)"
echo "   - Firefox 44+ (部分支持，无安装提示)"
echo "   - Safari 11.1+ (iOS添加到主屏幕)"
echo ""
echo "   📱 移动端:"
echo "   - Android Chrome (完全支持安装)"
echo "   - iOS Safari (添加到主屏幕)"
echo "   - Samsung Internet (支持安装)"
echo "   - 华为浏览器 (基于Chrome，支持安装)"
echo "   - 小米浏览器 (基于Chrome，支持安装)"
echo ""
echo "⚠️  限制说明:"
echo "   - iOS Safari: 不支持真正的PWA安装，但可添加到主屏幕"
echo "   - Firefox: 支持Service Worker但无安装横幅"
echo "   - 某些企业浏览器可能限制PWA功能"
echo ""
echo "🎯 最佳体验浏览器:"
echo "   1. Chrome (Android/Desktop) - 100%功能支持"
echo "   2. Edge (Desktop) - 100%功能支持"
echo "   3. Samsung Internet - 90%功能支持"
echo "   4. Safari (iOS) - 70%功能支持"
echo ""

echo "=========================================="
echo "🧪 PWA 功能测试指南"
echo "=========================================="
echo ""
echo "请在浏览器中测试以下功能:"
echo ""
echo "1️⃣  安装测试 (Chrome/Edge):"
echo "   - 访问 http://localhost:3000"
echo "   - 等待5秒后应显示安装浮动按钮"
echo "   - 点击安装按钮，确认安装对话框"
echo "   - 检查桌面是否出现应用图标"
echo ""
echo "2️⃣  离线测试:"
echo "   - 断开网络连接"
echo "   - 刷新页面，应显示离线页面"
echo "   - 重新连接网络，点击'重新连接'"
echo ""
echo "3️⃣  缓存测试:"
echo "   - 首次访问后，第二次打开速度应更快"
echo "   - 开发者工具 > Application > Storage 查看缓存"
echo ""
echo "4️⃣  响应式测试:"
echo "   - 调整浏览器窗口大小"
echo "   - 使用开发者工具模拟移动设备"
echo "   - 检查各种屏幕尺寸下的显示效果"
echo ""

echo "🌐 本地测试地址: http://localhost:3000"
echo "📱 移动端测试: http://192.168.0.145:3000 (局域网)"
echo ""
echo "⏰ 服务器将保持运行，Ctrl+C 停止服务"
echo "🔗 服务进程ID: $SERVER_PID"

# 保持服务运行
wait $SERVER_PID
