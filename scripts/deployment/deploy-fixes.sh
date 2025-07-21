#!/bin/bash
# 快速部署修复到远程服务器

echo "======================================="
echo "  推送修复到远程服务器"
echo "======================================="

REMOTE_USER="ubuntu"
REMOTE_HOST="82.156.75.232"
REMOTE_PATH="/home/ubuntu/ailab"
SSH_KEY="ailab.pem"

# 检查SSH密钥
if [ ! -f "$SSH_KEY" ]; then
    echo "❌ SSH密钥文件不存在: $SSH_KEY"
    echo "请确保密钥文件在当前目录"
    exit 1
fi

echo "🚀 推送本地修改到远程服务器..."

# 1. 传输修复脚本
echo "📤 传输修复脚本..."
scp -i "$SSH_KEY" scripts/deployment/fix-frontend-routing.sh $REMOTE_USER@$REMOTE_HOST:$REMOTE_PATH/

# 2. 传输更新的部署脚本
echo "📤 传输部署脚本..."
scp -i "$SSH_KEY" scripts/deployment/minimal-fix.sh $REMOTE_USER@$REMOTE_HOST:$REMOTE_PATH/scripts/deployment/

# 3. 传输后端server.ts（恢复WebSocket）
echo "📤 传输后端服务器文件..."
scp -i "$SSH_KEY" src/backend/src/server.ts $REMOTE_USER@$REMOTE_HOST:$REMOTE_PATH/src/backend/src/

# 4. 传输设置控制器
echo "📤 传输设置控制器..."
scp -i "$SSH_KEY" src/backend/src/controllers/settings.controller.ts $REMOTE_USER@$REMOTE_HOST:$REMOTE_PATH/src/backend/src/controllers/

# 5. 连接到远程服务器执行修复
echo "🔧 连接远程服务器执行修复..."
ssh -i "$SSH_KEY" $REMOTE_USER@$REMOTE_HOST << 'ENDSSH'
cd /home/ubuntu/ailab

echo "📂 当前目录: $(pwd)"

# 给脚本执行权限
chmod +x fix-frontend-routing.sh
chmod +x scripts/deployment/minimal-fix.sh

# 执行前端路由修复
echo "🔧 执行前端路由修复..."
./fix-frontend-routing.sh

# 重启后端服务（恢复WebSocket）
echo "🔄 重启后端服务..."
pm2 restart ailab-backend

# 显示最终状态
echo "📊 最终服务状态："
pm2 status

echo ""
echo "✅ 远程修复完成！"
echo "🌐 测试地址: http://82.156.75.232:3000"
ENDSSH

echo ""
echo "🎉 部署完成！"
echo ""
echo "🔍 验证步骤："
echo "  1. 访问: http://82.156.75.232:3000"
echo "  2. 导航到任意页面"
echo "  3. 刷新页面测试SPA路由"
echo "  4. 检查WebSocket功能是否正常"
