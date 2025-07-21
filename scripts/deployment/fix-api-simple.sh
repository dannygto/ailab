#!/bin/bash

# 简化的API配置修复脚本 - 只修复关键配置

set -e

echo "=========================================="
echo "🔧 简化API配置修复"
echo "=========================================="

# 1. 备份原始文件
echo "💾 备份API配置文件..."
cp /home/ubuntu/ailab/src/frontend/src/services/api.ts /home/ubuntu/ailab/src/frontend/src/services/api.ts.bak

# 2. 修复API基础URL
echo "📝 修复API基础URL配置..."

# 使用sed修复API_BASE_URL配置
sed -i 's|process.env.NODE_ENV === .production. ? ./api. : .http://localhost:3001/api.|.http://82.156.75.232:3001/api.|g' /home/ubuntu/ailab/src/frontend/src/services/api.ts

# 3. 验证修复结果
echo "✅ 验证修复结果..."
echo "修复后的API配置:"
grep -A 2 -B 2 "api_BASE_URL\|API_BASE_URL" /home/ubuntu/ailab/src/frontend/src/services/api.ts | head -10

# 4. 构建前端
echo "🔨 构建前端..."
cd /home/ubuntu/ailab/src/frontend
npm run build

if [ $? -eq 0 ]; then
    echo "✅ 前端构建成功"
else
    echo "❌ 前端构建失败，恢复备份..."
    cp /home/ubuntu/ailab/src/frontend/src/services/api.ts.bak /home/ubuntu/ailab/src/frontend/src/services/api.ts
    exit 1
fi

# 5. 重启前端服务
echo "🔄 重启前端服务..."
pm2 restart ailab-frontend

# 6. 测试API连接
echo "🧪 测试API连接..."
sleep 5

echo "📡 测试结果:"
curl -s http://82.156.75.232:3001/api/schools | head -100
echo ""

echo "✅ API配置修复完成!"
