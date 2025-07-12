#!/bin/bash

echo "🚀 启动生产环境..."

# 使用Docker Compose启动
docker-compose -f 配置/部署配置/docker-compose.yml up -d

echo "✅ 生产环境启动完成！"
echo "前端地址: http://localhost:3000"
echo "后端地址: http://localhost:8000"
echo "AI服务地址: http://localhost:8001"
