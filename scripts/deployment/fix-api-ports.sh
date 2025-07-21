#!/bin/bash

# 修复前端API端口问题

echo "======================================="
echo "  修复前端API端口问题"
echo "======================================="

cd /home/ubuntu/ailab

echo "🔧 修复API端口配置..."

# 修复 constants.ts
echo "修复 constants.ts..."
sed -i "s|http://localhost:3002|http://localhost:3001|g" src/frontend/src/config/constants.ts

# 修复 services/index.ts
echo "修复 services/index.ts..."
sed -i "s|http://localhost:3002|http://localhost:3001|g" src/frontend/src/services/index.ts

# 修复 aiService.ts
echo "修复 aiService.ts..."
sed -i "s|http://localhost:3002|http://localhost:3001|g" src/frontend/src/services/aiService.ts

# 修复 enhancedAiService.ts
echo "修复 enhancedAiService.ts..."
sed -i "s|http://localhost:3002|http://localhost:3001|g" src/frontend/src/services/enhancedAiService.ts

# 修复 enhancedTemplateService.ts
echo "修复 enhancedTemplateService.ts..."
sed -i "s|http://localhost:3002|http://localhost:3001|g" src/frontend/src/services/enhancedTemplateService.ts

# 修复 DeviceMonitor.tsx
echo "修复 DeviceMonitor.tsx..."
sed -i "s|ws://localhost:3002|ws://localhost:3001|g" src/frontend/src/components/devices/DeviceMonitor.tsx

# 修复 test-api.js
echo "修复 test-api.js..."
sed -i "s|http://localhost:3002|http://localhost:3001|g" src/frontend/src/test-api.js

echo "✅ API端口修复完成"

# 重新构建前端
echo "🔧 重新构建前端..."
cd src/frontend
npm run build

# 重启前端服务
echo "🔄 重启前端服务..."
cd /home/ubuntu/ailab
pm2 restart ailab-frontend

# 重启后端服务（确保路由正确）
echo "🔄 重启后端服务..."
pm2 restart ailab-backend

# 等待服务启动
sleep 5

# 测试API连接
echo "🧪 测试API连接..."

# 测试学校API
echo "测试学校API..."
curl -s "http://localhost:3001/api/schools" | head -c 200
echo ""

# 测试设置API
echo "测试设置API..."
curl -s "http://localhost:3001/api/settings/version" | head -c 200
echo ""

# 显示最终状态
echo "📊 服务状态："
pm2 status

echo ""
echo "✅ 前端API端口修复完成！"
echo "🌐 测试地址: http://82.156.75.232:3000"
echo ""
echo "🔍 验证步骤："
echo "1. 访问前端页面"
echo "2. 打开浏览器开发者工具"
echo "3. 检查Network面板中的API请求"
echo "4. 确保API请求路径为 /api/xxx 而不是 /?/api/xxx"
