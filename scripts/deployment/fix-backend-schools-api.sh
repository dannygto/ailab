#!/bin/bash

# 修复后端学校API - 重启服务并测试

set -e

echo "=========================================="
echo "🔧 修复后端学校API"
echo "=========================================="

# 1. 停止现有的后端服务
echo "🛑 停止现有后端服务..."
pm2 stop ailab-backend || echo "后端服务未运行"

# 2. 启动后端服务
echo "🚀 启动后端服务..."
cd /home/ubuntu/ailab/src/backend
pm2 start src/server.js --name "ailab-backend" --watch

# 3. 等待服务启动
echo "⏳ 等待服务启动..."
sleep 5

# 4. 测试API端点
echo "🧪 测试API端点..."

# 测试基本健康检查
echo "📡 测试健康检查..."
curl -s http://localhost:3001/health | jq '.' || echo "健康检查失败"

# 测试学校API
echo "📡 测试学校API..."
curl -s http://localhost:3001/api/schools | jq '.' || echo "学校API失败"

# 测试特定校区
echo "📡 测试特定校区..."
curl -s http://localhost:3001/api/schools/bjsyzx | jq '.' || echo "特定校区API失败"

# 5. 检查服务状态
echo "📊 检查服务状态..."
pm2 list | grep ailab

# 6. 显示日志
echo "📋 显示最近日志..."
pm2 logs ailab-backend --lines 10

echo "=========================================="
echo "✅ 后端学校API修复完成"
echo "=========================================="
echo ""
echo "🌐 API测试地址:"
echo "- 健康检查: http://82.156.75.232:3001/health"
echo "- 学校列表: http://82.156.75.232:3001/api/schools"
echo "- 特定校区: http://82.156.75.232:3001/api/schools/bjsyzx"
echo ""
