#!/bin/bash

# AICAM 项目备份脚本
# 版本: v1.0.0

set -e

BACKUP_DIR="备份/$(date +%Y%m%d)"
BACKUP_FILE="aicam-backup-$(date +%Y%m%d-%H%M%S).tar.gz"

echo "开始备份 AICAM 项目..."

# 创建备份目录
mkdir -p "$BACKUP_DIR"

# 备份数据库
echo "备份数据库..."
docker-compose exec -T db pg_dump -U user aicam > "$BACKUP_DIR/database.sql"

# 备份文件
echo "备份项目文件..."
tar -czf "$BACKUP_DIR/$BACKUP_FILE" \
    --exclude=node_modules \
    --exclude=.git \
    --exclude=logs \
    --exclude=备份 \
    .

echo "备份完成: $BACKUP_DIR/$BACKUP_FILE"

# 清理旧备份（保留最近7天）
find 备份 -name "*.tar.gz" -mtime +7 -delete
find 备份 -name "*.sql" -mtime +7 -delete

echo "清理完成"
