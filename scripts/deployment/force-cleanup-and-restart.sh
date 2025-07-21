#!/bin/bash

# 强制清理和重启AILAB服务

set -e

echo "=========================================="
echo "🛑 强制清理和重启AILAB服务"
echo "=========================================="

# 1. 停止所有PM2进程
echo "🛑 停止所有PM2进程..."
pm2 kill || true

# 2. 强制杀死所有相关进程
echo "🔥 强制杀死所有相关进程..."
pkill -f "http-server" || true
pkill -f "node.*3000" || true
pkill -f "node.*3001" || true
pkill -f "npm.*start" || true
pkill -f "ts-node" || true

# 3. 等待进程完全停止
echo "⏳ 等待进程完全停止..."
sleep 3

# 4. 强制释放端口
echo "🔓 强制释放端口..."
lsof -ti:3000 | xargs -r kill -9 || true
lsof -ti:3001 | xargs -r kill -9 || true

# 5. 再次等待端口释放
echo "⏳ 等待端口释放..."
sleep 2

# 6. 检查端口状态
echo "🔍 检查端口状态..."
echo "端口3000状态:"
lsof -i:3000 || echo "端口3000已释放"
echo "端口3001状态:"
lsof -i:3001 || echo "端口3001已释放"

# 7. 启动后端服务
echo "🚀 启动后端服务..."
cd /home/ubuntu/ailab/src/backend
pm2 start npm --name "ailab-backend" -- run dev

# 8. 等待后端启动
echo "⏳ 等待后端启动..."
sleep 5

# 9. 测试后端API
echo "🧪 测试后端API..."
if curl -s http://localhost:3001/api/schools > /dev/null; then
    echo "✅ 后端API正常"
else
    echo "❌ 后端API异常"
    pm2 logs ailab-backend --lines 5
fi

# 10. 构建前端
echo "🔨 构建前端..."
cd /home/ubuntu/ailab/src/frontend
npm run build

# 11. 启动前端服务（使用3000端口）
echo "🌐 启动前端服务..."
pm2 start http-server --name "ailab-frontend" -- build -p 3000 -c-1 --cors

# 12. 等待前端启动
echo "⏳ 等待前端启动..."
sleep 3

# 13. 测试前端服务
echo "🧪 测试前端服务..."
if curl -s http://localhost:3000 > /dev/null; then
    echo "✅ 前端服务正常"
else
    echo "❌ 前端服务异常"
    pm2 logs ailab-frontend --lines 5
fi

# 14. 显示最终状态
echo "📊 服务状态:"
pm2 list

echo "=========================================="
echo "✅ 强制清理和重启完成"
echo "=========================================="
echo ""
echo "🌐 访问地址:"
echo "- 前端: http://82.156.75.232:3000"
echo "- 后端API: http://82.156.75.232:3001"
echo ""
echo "📋 管理命令:"
echo "- 查看日志: pm2 logs"
echo "- 重启服务: pm2 restart all"
echo "- 停止服务: pm2 stop all"
echo ""
