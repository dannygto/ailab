#!/bin/bash

echo "🚀 启动开发环境..."

# 启动后端服务
echo "启动后端服务..."
cd 源代码/后端
npm install
npm run dev &

# 启动前端服务
echo "启动前端服务..."
cd ../前端
npm install
npm start &

echo "✅ 开发环境启动完成！"
echo "前端地址: http://localhost:3000"
echo "后端地址: http://localhost:8000"
