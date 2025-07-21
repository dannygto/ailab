#!/bin/bash

# 前端服务完全重置脚本 - 清理并重新启动所有服务

set -e

echo "=========================================="
echo "🔄 开始前端服务完全重置"
echo "=========================================="

# 1. 停止所有相关进程
echo "🛑 停止所有相关进程..."

# 停止PM2管理的进程
pm2 delete ailab-frontend 2>/dev/null || true
pm2 delete ailab-backend 2>/dev/null || true
pm2 delete all 2>/dev/null || true

# 强制杀死占用3000和3001端口的进程
echo "🔪 强制释放端口..."
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
lsof -ti:3001 | xargs kill -9 2>/dev/null || true

# 等待端口释放
sleep 3

# 验证端口已释放
if lsof -i:3000 >/dev/null 2>&1; then
    echo "⚠️  端口3000仍被占用，继续尝试释放..."
    fuser -k 3000/tcp 2>/dev/null || true
fi

if lsof -i:3001 >/dev/null 2>&1; then
    echo "⚠️  端口3001仍被占用，继续尝试释放..."
    fuser -k 3001/tcp 2>/dev/null || true
fi

echo "✅ 端口清理完成"

# 2. 检查服务目录
echo "📁 检查服务目录..."
cd /home/ubuntu/ailab

if [ ! -d "src/frontend" ]; then
    echo "❌ 前端目录不存在"
    exit 1
fi

if [ ! -d "src/backend" ]; then
    echo "❌ 后端目录不存在"
    exit 1
fi

# 3. 重新构建前端
echo "🔨 重新构建前端..."
cd /home/ubuntu/ailab/src/frontend

# 清理构建缓存
rm -rf node_modules/.cache 2>/dev/null || true
rm -rf build 2>/dev/null || true

# 确保依赖已安装
npm install

# 构建项目
npm run build

# 4. 启动后端服务
echo "🚀 启动后端服务..."
cd /home/ubuntu/ailab/src/backend

# 确保后端依赖已安装
npm install

# 启动后端服务（在3001端口）
pm2 start npm --name "ailab-backend" -- run dev

# 等待后端启动
sleep 5

# 5. 启动前端服务
echo "🌐 启动前端服务..."
cd /home/ubuntu/ailab/src/frontend

# 使用serve启动构建的静态文件（避免端口冲突）
npm install -g serve 2>/dev/null || true
pm2 start serve --name "ailab-frontend" -- -s build -l 3000

# 等待前端启动
sleep 5

# 6. 验证服务状态
echo "✅ 验证服务状态..."

# 检查PM2进程
echo "📊 PM2进程状态:"
pm2 list

# 检查端口占用
echo "🔍 端口占用情况:"
lsof -i:3000 2>/dev/null || echo "端口3000: 未占用"
lsof -i:3001 2>/dev/null || echo "端口3001: 未占用"

# 测试服务连通性
echo "🌐 测试服务连通性..."

# 测试后端API
if curl -s http://localhost:3001/api/schools >/dev/null; then
    echo "✅ 后端API (3001) 正常"
else
    echo "❌ 后端API (3001) 异常"
fi

# 测试前端页面
if curl -s http://localhost:3000 >/dev/null; then
    echo "✅ 前端服务 (3000) 正常"
else
    echo "❌ 前端服务 (3000) 异常"
fi

# 7. 显示服务信息
echo "=========================================="
echo "✅ 前端服务重置完成"
echo "=========================================="
echo ""
echo "🌐 访问地址:"
echo "- 前端: http://82.156.75.232:3000"
echo "- 后端API: http://82.156.75.232:3001"
echo ""
echo "📊 进程管理:"
echo "- 查看状态: pm2 list"
echo "- 查看日志: pm2 logs"
echo "- 重启前端: pm2 restart ailab-frontend"
echo "- 重启后端: pm2 restart ailab-backend"
echo ""
