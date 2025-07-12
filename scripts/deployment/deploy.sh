#!/bin/bash

echo "🚀 开始部署AICAM系统..."

# 检查Docker环境
if ! command -v docker &> /dev/null; then
    echo "❌ Docker未安装，请先运行 install-docker.sh"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose未安装，请先运行 install-docker.sh"
    exit 1
fi

# 检查配置文件
if [ ! -f "配置/环境配置/.env.production" ]; then
    echo "❌ 生产环境配置文件不存在，请先运行 generate-prod-config.sh"
    exit 1
fi

# 创建必要的目录
echo "📁 创建必要目录..."
mkdir -p logs
mkdir -p uploads
mkdir -p 备份
mkdir -p 配置/SSL配置

# 设置文件权限
echo "🔐 设置文件权限..."
chmod 600 配置/环境配置/.env.production
chmod +x 脚本/部署脚本/*.sh

# 构建Docker镜像
echo "🔨 构建Docker镜像..."
docker-compose -f 配置/部署配置/docker-compose.prod.yml build

# 启动服务
echo "🚀 启动服务..."
docker-compose -f 配置/部署配置/docker-compose.prod.yml up -d

# 等待服务启动
echo "⏳ 等待服务启动..."
sleep 30

# 健康检查
echo "🔍 执行健康检查..."
./脚本/测试脚本/health-check.js

# 显示服务状态
echo "📊 服务状态:"
docker-compose -f 配置/部署配置/docker-compose.prod.yml ps

echo "\n✅ 部署完成！"
echo "🌐 访问地址: https://$(grep DOMAIN 配置/环境配置/.env.production | cut -d'=' -f2)"
echo "📊 监控地址: http://$(curl -s ifconfig.me):9090"
