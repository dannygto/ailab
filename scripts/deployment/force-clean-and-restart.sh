#!/bin/bash

# 强制清理端口占用并重启服务脚本

set -e

echo "=========================================="
echo "🧹 强制清理端口占用并重启服务"
echo "=========================================="

# 1. 停止所有相关的PM2进程
echo "🛑 停止所有PM2进程..."
pm2 stop all || true
pm2 delete all || true

# 2. 强制杀死占用3000、3001、3002端口的进程
echo "🔪 强制杀死端口占用进程..."

# 杀死3000端口进程
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
netstat -tulpn | grep :3000 | awk '{print $7}' | cut -d'/' -f1 | xargs kill -9 2>/dev/null || true

# 杀死3001端口进程
lsof -ti:3001 | xargs kill -9 2>/dev/null || true
netstat -tulpn | grep :3001 | awk '{print $7}' | cut -d'/' -f1 | xargs kill -9 2>/dev/null || true

# 杀死3002端口进程
lsof -ti:3002 | xargs kill -9 2>/dev/null || true
netstat -tulpn | grep :3002 | awk '{print $7}' | cut -d'/' -f1 | xargs kill -9 2>/dev/null || true

# 3. 杀死所有node和npm进程
echo "🔪 杀死所有node进程..."
pkill -f "node" || true
pkill -f "npm" || true
pkill -f "next" || true

# 4. 等待端口释放
echo "⏳ 等待端口释放..."
sleep 5

# 5. 检查端口是否已释放
echo "🔍 检查端口状态..."
for port in 3000 3001 3002; do
    if lsof -i:$port >/dev/null 2>&1; then
        echo "❌ 端口 $port 仍被占用"
        lsof -i:$port
    else
        echo "✅ 端口 $port 已释放"
    fi
done

# 6. 清理npm缓存
echo "🧹 清理npm缓存..."
cd /home/ubuntu/ailab/src/frontend
npm cache clean --force || true

cd /home/ubuntu/ailab/src/backend/backend
npm cache clean --force || true

# 7. 重新安装依赖（如果需要）
echo "📦 检查并重新安装依赖..."
cd /home/ubuntu/ailab/src/backend/backend
if [ ! -d "node_modules" ] || [ ! -f "node_modules/.package-lock.json" ]; then
    echo "📦 重新安装后端依赖..."
    npm install
fi

cd /home/ubuntu/ailab/src/frontend
if [ ! -d "node_modules" ] || [ ! -f "node_modules/.package-lock.json" ]; then
    echo "📦 重新安装前端依赖..."
    npm install
fi

# 8. 确保ts-node可用
echo "🔧 确保ts-node可用..."
cd /home/ubuntu/ailab/src/backend/backend
if ! npm list ts-node >/dev/null 2>&1; then
    echo "📦 安装ts-node..."
    npm install --save-dev ts-node @types/node typescript
fi

# 9. 重新构建前端
echo "🔨 重新构建前端..."
cd /home/ubuntu/ailab/src/frontend
npm run build

# 10. 启动后端服务
echo "🚀 启动后端服务..."
cd /home/ubuntu/ailab/src/backend/backend

# 使用不同的启动方式，确保端口唯一
PORT=3001 pm2 start npm --name "ailab-backend" -- run dev

# 11. 等待后端启动
echo "⏳ 等待后端启动..."
sleep 10

# 12. 启动前端服务
echo "🚀 启动前端服务..."
cd /home/ubuntu/ailab/src/frontend

# 使用不同端口避免冲突
PORT=3000 pm2 start npm --name "ailab-frontend" -- start

# 13. 等待前端启动
echo "⏳ 等待前端启动..."
sleep 10

# 14. 验证服务状态
echo "✅ 验证服务状态..."
pm2 list

# 检查端口监听状态
echo "🔍 检查端口监听状态..."
netstat -tulpn | grep -E ":(3000|3001|3002)"

# 15. 测试服务可用性
echo "🧪 测试服务可用性..."

# 测试后端API
if curl -s http://localhost:3001/api/schools >/dev/null; then
    echo "✅ 后端API (3001) 可用"
else
    echo "❌ 后端API (3001) 不可用"
    # 查看后端日志
    pm2 logs ailab-backend --lines 20
fi

# 测试前端页面
if curl -s http://localhost:3000 >/dev/null; then
    echo "✅ 前端页面 (3000) 可用"
else
    echo "❌ 前端页面 (3000) 不可用"
    # 查看前端日志
    pm2 logs ailab-frontend --lines 20
fi

echo "=========================================="
echo "✅ 强制清理和重启完成"
echo "=========================================="
echo ""
echo "📊 服务状态:"
pm2 list
echo ""
echo "🌐 访问地址:"
echo "- 前端: http://82.156.75.232:3000"
echo "- 后端API: http://82.156.75.232:3001"
echo ""
echo "📋 如果服务仍有问题，请查看日志:"
echo "- 后端日志: pm2 logs ailab-backend"
echo "- 前端日志: pm2 logs ailab-frontend"
