#!/bin/bash
# AI实验平台 - 重置初始化状态脚本

echo "============================================"
echo "  重置AI实验平台初始化状态"
echo "============================================"

# 确认操作
read -p "此操作将重置系统初始化状态，系统将需要重新初始化。确定要继续吗? [y/N] " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]
then
    echo "操作已取消"
    exit 0
fi

# 获取Docker容器ID
BACKEND_CONTAINER=$(docker ps --filter "name=ailab_backend" --format "{{.ID}}")

if [ -z "$BACKEND_CONTAINER" ]; then
    echo "错误: 未找到后端容器。请确保AI实验平台正在运行。"
    exit 1
fi

echo "正在重置初始化状态..."

# 调用API重置初始化状态
docker exec $BACKEND_CONTAINER curl -X POST http://localhost:8000/api/system/reset-initialization

if [ $? -eq 0 ]; then
    echo "✅ 初始化状态已重置"
    echo "请访问 http://localhost:3000/initialize 重新初始化系统"
else
    echo "❌ 重置初始化状态失败"
fi
