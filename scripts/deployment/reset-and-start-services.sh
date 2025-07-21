#!/bin/bash

# 标准服务重置和启动脚本
# 使用 serve 托管前端，Node.js 运行后端

set -e

echo "=========================================="
echo "🔄 重置并启动AILAB服务"
echo "=========================================="

# 1. 停止所有相关服务
echo "🛑 停止所有服务..."
pm2 stop all || true
pm2 delete all || true

# 清理端口
echo "🧹 清理端口..."
lsof -ti:3000 | xargs -r kill -9 || true
lsof -ti:3001 | xargs -r kill -9 || true

# 2. 检查并安装 serve（全局安装）
echo "📦 检查serve依赖..."
if ! command -v serve &> /dev/null; then
    echo "安装serve..."
    npm install -g serve
fi

# 3. 进入后端目录并启动后端服务
echo "🚀 启动后端服务..."
cd /home/ubuntu/ailab/src/backend
npm install --production
pm2 start npm --name "ailab-backend" -- run dev

# 4. 等待后端启动
echo "⏳ 等待后端启动..."
sleep 5

# 5. 测试后端API
echo "🧪 测试后端API..."
if curl -s http://localhost:3001/api/schools > /dev/null; then
    echo "✅ 后端API正常"
else
    echo "❌ 后端API异常，请检查日志"
    pm2 logs ailab-backend --lines 10
fi

# 6. 进入前端目录并构建
echo "🔨 构建前端..."
cd /home/ubuntu/ailab/src/frontend
npm install --production

# 确保构建目录干净
rm -rf build/
npm run build

# 7. 使用serve启动前端服务
echo "🌐 启动前端服务..."
pm2 start serve --name "ailab-frontend" -- -s build -l 3000 -n

# 8. 等待前端启动
echo "⏳ 等待前端启动..."
sleep 5

# 9. 测试前端服务
echo "🧪 测试前端服务..."
if curl -s http://localhost:3000 > /dev/null; then
    echo "✅ 前端服务正常"
else
    echo "❌ 前端服务异常，请检查日志"
    pm2 logs ailab-frontend --lines 10
fi

# 10. 显示服务状态
echo "📊 服务状态:"
pm2 list

echo "=========================================="
echo "✅ 服务启动完成"
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
