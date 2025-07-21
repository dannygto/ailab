#!/bin/bash
# 直接部署到远程服务器脚本
# 避免Git网络问题，直接上传文件

set -e

SERVER="82.156.75.232"
USER="ubuntu"
KEY_FILE="ailab.pem"
REMOTE_DIR="/home/ubuntu/ailab"

echo "======================================="
echo "  直接部署到远程服务器"
echo "======================================="
echo "服务器: $SERVER"
echo "用户: $USER"
echo "远程目录: $REMOTE_DIR"
echo "======================================="

# 检查SSH密钥
if [ ! -f "$KEY_FILE" ]; then
    echo "❌ SSH密钥文件 $KEY_FILE 不存在"
    exit 1
fi

echo "📋 准备上传文件..."

# 创建临时目录
TEMP_DIR="temp_deploy_$(date +%s)"
mkdir -p $TEMP_DIR

# 复制需要更新的关键文件
echo "📁 复制关键文件..."

# 后端文件
mkdir -p $TEMP_DIR/src/backend/src/controllers
cp src/backend/src/controllers/settings.controller.ts $TEMP_DIR/src/backend/src/controllers/

# 前端文件
mkdir -p $TEMP_DIR/src/frontend/src/pages/settings
cp src/frontend/src/pages/settings/GeneralSettings.tsx $TEMP_DIR/src/frontend/src/pages/settings/

# 配置文件
mkdir -p $TEMP_DIR/config/deployment
if [ -d "config/deployment" ]; then
    cp -r config/deployment/* $TEMP_DIR/config/deployment/ 2>/dev/null || true
fi

# 部署脚本
mkdir -p $TEMP_DIR/scripts/deployment
cp scripts/deployment/minimal-fix.sh $TEMP_DIR/scripts/deployment/
cp scripts/deployment/Generate-Config-Simple.ps1 $TEMP_DIR/scripts/deployment/ 2>/dev/null || true

echo "📤 上传文件到远程服务器..."

# 使用rsync上传文件（如果有的话）
if command -v rsync >/dev/null 2>&1; then
    echo "使用rsync同步文件..."
    rsync -avz -e "ssh -i $KEY_FILE -o StrictHostKeyChecking=no" \
        $TEMP_DIR/ $USER@$SERVER:$REMOTE_DIR/
else
    echo "使用scp上传文件..."
    # 使用tar打包后上传
    tar -czf $TEMP_DIR.tar.gz -C $TEMP_DIR .

    scp -i $KEY_FILE -o StrictHostKeyChecking=no \
        $TEMP_DIR.tar.gz $USER@$SERVER:$REMOTE_DIR/

    # 在远程服务器解压
    ssh -i $KEY_FILE -o StrictHostKeyChecking=no $USER@$SERVER \
        "cd $REMOTE_DIR && tar -xzf $TEMP_DIR.tar.gz && rm $TEMP_DIR.tar.gz"
fi

echo "🔧 在远程服务器上更新配置..."

# 在远程服务器执行更新
ssh -i $KEY_FILE -o StrictHostKeyChecking=no $USER@$SERVER << 'EOF'
    cd /home/ubuntu/ailab

    echo "停止当前服务..."
    pm2 stop all 2>/dev/null || true

    echo "重新构建前端..."
    cd src/frontend
    npm run build 2>/dev/null || echo "前端构建跳过"

    cd /home/ubuntu/ailab

    echo "重启服务..."
    pm2 start ecosystem.config.js 2>/dev/null || \
    pm2 start scripts/deployment/minimal-fix.sh 2>/dev/null || \
    echo "请手动启动服务"

    echo "检查服务状态..."
    pm2 status

    echo "检查服务健康..."
    sleep 5

    # 检查后端
    if curl -s http://localhost:3001/api/settings/general >/dev/null; then
        echo "✅ 后端服务正常"
    else
        echo "⚠️ 后端服务检查失败"
    fi

    # 检查前端
    if curl -s http://localhost:3000 >/dev/null; then
        echo "✅ 前端服务正常"
    else
        echo "⚠️ 前端服务检查失败"
    fi
EOF

# 清理临时文件
rm -rf $TEMP_DIR
rm -f $TEMP_DIR.tar.gz

echo ""
echo "✅ 部署完成！"
echo ""
echo "🌐 访问地址:"
echo "• 前端: http://$SERVER:3000"
echo "• 后端: http://$SERVER:3001"
echo "• 设置页面: http://$SERVER:3000/settings/general"
echo ""
echo "📊 检查服务:"
echo "ssh -i $KEY_FILE $USER@$SERVER 'pm2 status'"
