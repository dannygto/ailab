#!/bin/bash

# 强力清理并使用新端口重启服务

set -e

echo "=========================================="
echo "🔥 强力清理并重启AILAB服务"
echo "=========================================="

# 1. 停止PM2
echo "🛑 停止PM2服务..."
pm2 stop all || true
pm2 delete all || true
pm2 kill || true

# 2. 强力清理端口（多种方法）
echo "🧹 强力清理端口占用..."

# 方法1: lsof + kill
echo "方法1: lsof清理..."
lsof -ti:3000 | xargs -r kill -9 || true
lsof -ti:3001 | xargs -r kill -9 || true
lsof -ti:3002 | xargs -r kill -9 || true

# 方法2: netstat + kill
echo "方法2: netstat清理..."
netstat -tlnp | grep :3000 | awk '{print $7}' | cut -d'/' -f1 | xargs -r kill -9 || true
netstat -tlnp | grep :3001 | awk '{print $7}' | cut -d'/' -f1 | xargs -r kill -9 || true
netstat -tlnp | grep :3002 | awk '{print $7}' | cut -d'/' -f1 | xargs -r kill -9 || true

# 方法3: pkill http-server
echo "方法3: pkill清理..."
pkill -f "http-server" || true
pkill -f "node.*3000" || true
pkill -f "node.*3001" || true

# 等待端口释放
echo "⏳ 等待端口释放..."
sleep 5

# 3. 验证端口释放
echo "🔍 验证端口状态..."
for port in 3000 3001 3002; do
    if lsof -i:$port > /dev/null 2>&1; then
        echo "⚠️  端口$port仍被占用，尝试再次清理..."
        lsof -ti:$port | xargs -r kill -9 || true
        sleep 2
    fi
done

# 再次验证
for port in 3000 3001 3002; do
    if lsof -i:$port > /dev/null 2>&1; then
        echo "❌ 端口$port清理失败，占用进程："
        lsof -i:$port
    else
        echo "✅ 端口$port已释放"
    fi
done

# 4. 重启PM2守护进程
echo "🔄 重启PM2守护进程..."
pm2 resurrect || true

# 5. 启动后端服务 (端口3001)
echo "🚀 启动后端服务..."
cd /home/ubuntu/ailab/src/backend
pm2 start npm --name "ailab-backend" -- run dev

# 6. 等待后端启动
echo "⏳ 等待后端启动..."
sleep 8

# 验证后端
if curl -s http://localhost:3001/api/schools > /dev/null; then
    echo "✅ 后端API正常"
else
    echo "❌ 后端API异常"
    pm2 logs ailab-backend --lines 5
fi

# 7. 启动前端服务 (使用端口3002避免冲突)
echo "🌐 启动前端服务 (端口3002)..."
cd /home/ubuntu/ailab/src/frontend

# 确保构建存在
if [ ! -d "build" ]; then
    echo "🔨 构建前端..."
    npm run build
fi

# 使用3002端口启动前端
pm2 start http-server --name "ailab-frontend" -- build -p 3002 -c-1 --cors

# 8. 等待前端启动
echo "⏳ 等待前端启动..."
sleep 5

# 验证前端
if curl -s http://localhost:3002 > /dev/null; then
    echo "✅ 前端服务正常 (端口3002)"
else
    echo "❌ 前端服务异常"
    pm2 logs ailab-frontend --lines 5
fi

# 9. 显示最终状态
echo "📊 最终服务状态:"
pm2 list

echo ""
echo "🔍 端口占用检查:"
echo "3001端口 (后端)："
lsof -i:3001 | head -3 || echo "无占用"
echo "3002端口 (前端)："
lsof -i:3002 | head -3 || echo "无占用"

echo ""
echo "=========================================="
echo "✅ 强力重启完成"
echo "=========================================="
echo ""
echo "🌐 新的访问地址:"
echo "- 前端: http://82.156.75.232:3002 (注意端口变更)"
echo "- 后端API: http://82.156.75.232:3001"
echo ""
echo "⚠️  注意: 前端端口已更改为3002以避免冲突"
echo ""
