#!/bin/bash

# 🏫 测试并修复校区API脚本
echo "🔧 开始修复校区API问题..."

# 1. 检查后端是否运行
echo "📡 检查后端服务状态..."
if ! pgrep -f "node.*src/backend" > /dev/null; then
    echo "🚀 启动后端服务..."
    cd /home/ubuntu/ailab/src/backend
    npm run dev > /tmp/backend.log 2>&1 &
    echo "⏳ 等待后端启动..."
    sleep 5
fi

# 2. 测试API连接
echo "🧪 测试API连接..."
API_TEST=$(curl -s -w "%{http_code}" -o /dev/null http://localhost:3001/api/schools)
echo "API响应状态码: $API_TEST"

if [ "$API_TEST" != "200" ]; then
    echo "❌ API测试失败，开始详细检查..."

    # 检查后端日志
    echo "📋 后端日志:"
    tail -20 /tmp/backend.log

    # 重新编译并启动后端
    echo "🔨 重新编译后端..."
    cd /home/ubuntu/ailab/src/backend
    npm run build

    echo "🔄 重启后端服务..."
    pkill -f "node.*src/backend"
    sleep 2
    npm run dev > /tmp/backend.log 2>&1 &
    sleep 5

    # 再次测试
    API_TEST2=$(curl -s -w "%{http_code}" -o /dev/null http://localhost:3001/api/schools)
    echo "重启后API响应状态码: $API_TEST2"
fi

# 3. 详细测试API端点
echo "🧪 详细测试校区API端点..."

echo "测试 GET /api/schools:"
curl -s -X GET http://localhost:3001/api/schools | jq .

echo ""
echo "测试 GET /api/schools/bjsyzx:"
curl -s -X GET http://localhost:3001/api/schools/bjsyzx | jq .

echo ""
echo "测试 POST /api/schools (创建测试校区):"
curl -s -X POST http://localhost:3001/api/schools \
  -H "Content-Type: application/json" \
  -d '{
    "name": "测试校区",
    "code": "test_school",
    "logoUrl": "/assets/test-logo.png"
  }' | jq .

# 4. 检查前端调用
echo ""
echo "🖥️ 检查前端调用..."
cd /home/ubuntu/ailab/src/frontend

# 搜索前端API调用
echo "前端中的校区API调用:"
grep -r "api/schools" src/ || echo "未找到前端API调用"

# 5. 修复可能的CORS问题
echo "🔧 检查并修复CORS配置..."
cd /home/ubuntu/ailab/src/backend

# 确保server.ts有正确的CORS配置
grep -n "cors" src/server.ts || echo "需要添加CORS配置"

# 6. 生成API测试报告
echo ""
echo "📊 生成API测试报告..."
cat > /home/ubuntu/ailab/school-api-test-report.json << 'EOL'
{
  "timestamp": "$(date -Iseconds)",
  "tests": {
    "backend_running": "$(pgrep -f 'node.*src/backend' > /dev/null && echo 'true' || echo 'false')",
    "api_accessible": "$(curl -s -w '%{http_code}' -o /dev/null http://localhost:3001/api/schools)",
    "get_schools": "$(curl -s http://localhost:3001/api/schools | jq -r '.success // false')",
    "get_school_by_code": "$(curl -s http://localhost:3001/api/schools/bjsyzx | jq -r '.success // false')"
  },
  "recommendations": [
    "检查后端服务是否正常运行",
    "验证路由注册是否正确",
    "确认CORS配置允许前端访问",
    "检查controller导出是否正确"
  ]
}
EOL

echo "📋 测试报告已生成: /home/ubuntu/ailab/school-api-test-report.json"

# 7. 快速修复常见问题
echo "🔧 应用快速修复..."

# 确保routes导出正确
cd /home/ubuntu/ailab/src/backend/src/routes
if ! grep -q "export default router" school.routes.ts; then
    echo "添加默认导出到 school.routes.ts"
    echo -e "\nexport default router;" >> school.routes.ts
fi

# 确保controller导出正确
cd /home/ubuntu/ailab/src/backend/src/controllers
if ! grep -q "export default new SchoolController" school.controller.ts; then
    echo "修复controller导出"
    sed -i 's/export default SchoolController;/export default new SchoolController();/g' school.controller.ts
fi

# 8. 最终验证
echo "✅ 最终验证..."
sleep 3
FINAL_TEST=$(curl -s -w "%{http_code}" -o /dev/null http://localhost:3001/api/schools)
echo "最终API测试状态码: $FINAL_TEST"

if [ "$FINAL_TEST" = "200" ]; then
    echo "✅ 校区API修复成功！"
    echo "📋 可用端点:"
    echo "  GET  /api/schools - 获取所有校区"
    echo "  GET  /api/schools/:code - 获取特定校区"
    echo "  POST /api/schools - 创建校区"
    echo "  PUT  /api/schools/:id - 更新校区"
    echo "  DELETE /api/schools/:id - 删除校区"
else
    echo "❌ 校区API仍有问题，需要进一步调试"
    echo "📋 后端日志:"
    tail -20 /tmp/backend.log
fi

echo "🏁 校区API修复脚本执行完成"
