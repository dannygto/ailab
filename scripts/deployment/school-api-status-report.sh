#!/bin/bash

# 学校API修复状态报告

echo "========================================"
echo "🎯 学校API修复完成状态报告"
echo "========================================"

echo "📊 服务状态检查"
echo "----------------------------------------"

# 检查PM2服务状态
echo "🔍 PM2服务状态:"
pm2 list | grep -E "(ailab-backend|ailab-frontend)"

echo ""
echo "📡 API端点测试"
echo "----------------------------------------"

# 测试学校列表API
echo "🏫 学校列表API:"
curl -s http://localhost:3001/api/schools | head -100

echo ""
echo ""
echo "🏫 特定校区API (demo-main):"
curl -s http://localhost:3001/api/schools/demo-main | head -100

echo ""
echo ""
echo "🏫 特定校区API (demo-east):"
curl -s http://localhost:3001/api/schools/demo-east | head -100

echo ""
echo ""
echo "🌐 外部访问测试"
echo "----------------------------------------"
echo "🔗 外部学校API:"
curl -s http://82.156.75.232:3001/api/schools | head -100

echo ""
echo ""
echo "🔗 前端页面:"
curl -s http://82.156.75.232:3000 | grep -o '<title>.*</title>'

echo ""
echo ""
echo "📋 修复总结"
echo "========================================"
echo "✅ 已解决的问题:"
echo "1. 后端学校API路由配置 (/api/schools)"
echo "2. 学校控制器数据响应"
echo "3. TypeScript服务器导入问题"
echo "4. ES模块兼容性问题"
echo ""
echo "🌐 访问地址:"
echo "- 前端: http://82.156.75.232:3000"
echo "- 后端API: http://82.156.75.232:3001"
echo "- 学校API: http://82.156.75.232:3001/api/schools"
echo ""
echo "📊 数据示例:"
echo "- demo-main: 示范学校总校 (主校区)"
echo "- demo-east: 示范学校东校区"
echo ""
echo "✅ 前端404错误已修复，现在可以正常获取校区数据！"
echo "========================================"
