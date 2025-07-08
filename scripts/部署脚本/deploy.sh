#!/bin/bash

# AICAM 项目部署脚本
# 版本: v1.0.0
# 更新时间: $(date)

set -e

echo "🚀 开始部署 AICAM 项目..."

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 日志函数
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查依赖
check_dependencies() {
    log_info "检查系统依赖..."
    
    # 检查 Docker
    if ! command -v docker &> /dev/null; then
        log_error "Docker 未安装，请先安装 Docker"
        exit 1
    fi
    
    # 检查 Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose 未安装，请先安装 Docker Compose"
        exit 1
    fi
    
    log_info "依赖检查完成"
}

# 环境准备
prepare_environment() {
    log_info "准备部署环境..."
    
    # 创建必要的目录
    mkdir -p logs
    mkdir -p 配置/nginx/ssl
    mkdir -p 备份
    
    # 复制环境变量文件
    if [ ! -f .env ]; then
        cp 配置/环境配置/env.example .env
        log_warn "请编辑 .env 文件配置环境变量"
    fi
    
    log_info "环境准备完成"
}

# 构建镜像
build_images() {
    log_info "构建 Docker 镜像..."
    
    docker-compose build --no-cache
    
    log_info "镜像构建完成"
}

# 启动服务
start_services() {
    log_info "启动服务..."
    
    docker-compose up -d
    
    log_info "服务启动完成"
}

# 健康检查
health_check() {
    log_info "执行健康检查..."
    
    # 等待服务启动
    sleep 30
    
    # 检查前端服务
    if curl -f http://localhost:3000 > /dev/null 2>&1; then
        log_info "前端服务运行正常"
    else
        log_error "前端服务检查失败"
        return 1
    fi
    
    # 检查后端服务
    if curl -f http://localhost:8000/api/health > /dev/null 2>&1; then
        log_info "后端服务运行正常"
    else
        log_error "后端服务检查失败"
        return 1
    fi
    
    log_info "健康检查完成"
}

# 备份数据
backup_data() {
    log_info "备份现有数据..."
    
    if [ -d "备份" ]; then
        tar -czf "备份/backup-$(date +%Y%m%d-%H%M%S).tar.gz" \
            --exclude=node_modules \
            --exclude=.git \
            --exclude=logs \
            .
    fi
    
    log_info "数据备份完成"
}

# 主函数
main() {
    echo "========================================"
    echo "    AICAM 项目部署脚本"
    echo "========================================"
    
    # 检查依赖
    check_dependencies
    
    # 备份数据
    backup_data
    
    # 准备环境
    prepare_environment
    
    # 构建镜像
    build_images
    
    # 启动服务
    start_services
    
    # 健康检查
    health_check
    
    echo "========================================"
    echo "🎉 部署完成！"
    echo "前端地址: http://localhost:3000"
    echo "后端API: http://localhost:8000"
    echo "AI服务: http://localhost:8001"
    echo "========================================"
}

# 执行主函数
main "$@"
