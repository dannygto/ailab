#!/bin/bash

# 彻底清理并重启AILAB服务脚本

set -e

echo "=========================================="
echo "🔄 彻底清理并重启AILAB服务"
echo "=========================================="

# 1. 停止所有PM2进程
echo "🛑 停止所有PM2进程..."
pm2 stop all || true
pm2 delete all || true

# 2. 强制清理端口占用
echo "🧹 强制清理端口占用..."
echo "清理3000端口..."
lsof -ti:3000 | xargs -r kill -9 || true
echo "清理3001端口..."
lsof -ti:3001 | xargs -r kill -9 || true

# 等待端口释放
sleep 3

# 3. 验证端口已释放
echo "🔍 验证端口状态..."
if lsof -i:3000 > /dev/null 2>&1; then
    echo "❌ 端口3000仍被占用"
    lsof -i:3000
    exit 1
else
    echo "✅ 端口3000已释放"
fi

if lsof -i:3001 > /dev/null 2>&1; then
    echo "❌ 端口3001仍被占用"
    lsof -i:3001
    exit 1
else
    echo "✅ 端口3001已释放"
fi

# 4. 启动后端服务
echo "🚀 启动后端服务..."
cd /home/ubuntu/ailab/src/backend
pm2 start npm --name "ailab-backend" -- run dev

# 5. 等待后端启动
echo "⏳ 等待后端启动..."
sleep 5

# 6. 验证后端API
echo "🧪 验证后端API..."
max_attempts=10
attempt=1
while [ $attempt -le $max_attempts ]; do
    if curl -s http://localhost:3001/api/schools > /dev/null; then
        echo "✅ 后端API正常 (尝试 $attempt/$max_attempts)"
        break
    else
        echo "⏳ 后端API未就绪，等待... (尝试 $attempt/$max_attempts)"
        sleep 2
        ((attempt++))
    fi
done

if [ $attempt -gt $max_attempts ]; then
    echo "❌ 后端API启动失败"
    pm2 logs ailab-backend --lines 10
    exit 1
fi

# 7. 确保前端已构建
echo "🔨 确保前端已构建..."
cd /home/ubuntu/ailab/src/frontend
if [ ! -d "build" ]; then
    echo "🔨 构建前端..."
    npm run build
else
    echo "✅ 前端构建文件已存在"
fi

# 8. 启动前端服务
echo "🌐 启动前端服务..."
pm2 start http-server --name "ailab-frontend" -- build -p 3000 -c-1 --cors

# 9. 等待前端启动
echo "⏳ 等待前端启动..."
sleep 5

# 10. 验证前端服务
echo "🧪 验证前端服务..."
max_attempts=10
attempt=1
while [ $attempt -le $max_attempts ]; do
    if curl -s http://localhost:3000 > /dev/null; then
        echo "✅ 前端服务正常 (尝试 $attempt/$max_attempts)"
        break
    else
        echo "⏳ 前端服务未就绪，等待... (尝试 $attempt/$max_attempts)"
        sleep 2
        ((attempt++))
    fi
done

if [ $attempt -gt $max_attempts ]; then
    echo "❌ 前端服务启动失败"
    pm2 logs ailab-frontend --lines 10
    exit 1
fi

# 11. 显示最终状态
echo "📊 最终服务状态:"
pm2 list

echo ""
echo "🔍 端口状态验证:"
echo "3000端口："
lsof -i:3000 | head -5 || echo "无占用"
echo "3001端口："
lsof -i:3001 | head -5 || echo "无占用"

echo ""
echo "=========================================="
echo "✅ 服务重启完成"
echo "=========================================="
echo ""
echo "🌐 访问地址:"
echo "- 前端: http://82.156.75.232:3000"
echo "- 后端API: http://82.156.75.232:3001"
echo ""
echo "📋 管理命令:"
echo "- 查看状态: pm2 list"
echo "- 查看日志: pm2 logs"
echo "- 重启服务: pm2 restart all"
echo ""
