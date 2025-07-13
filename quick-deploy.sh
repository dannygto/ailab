#!/bin/bash
# AILAB 快速部署脚本 - 服务器端更新
# 此脚本用于快速推送本地修改到远程服务器

# 服务器配置
SERVER_IP="82.156.75.232"
SERVER_USER="ubuntu"
KEY_FILE="ailab.pem"
REMOTE_PATH="/home/ubuntu/ailab"

# 颜色输出
log_info() {
  echo -e "\033[0;32m[信息]\033[0m $1"
}

log_error() {
  echo -e "\033[0;31m[错误]\033[0m $1"
}

log_success() {
  echo -e "\033[0;32m[成功]\033[0m $1"
}

echo "======================================="
echo "  AILAB 服务器快速更新脚本"
echo "  服务器: $SERVER_IP"
echo "======================================="

# 检查密钥文件
if [ ! -f "$KEY_FILE" ]; then
  log_error "密钥文件 $KEY_FILE 不存在！"
  exit 1
fi

# 测试SSH连接
log_info "测试SSH连接..."
if ssh -i "$KEY_FILE" -o ConnectTimeout=10 -o BatchMode=yes "$SERVER_USER@$SERVER_IP" "echo 'SSH连接正常'" >/dev/null 2>&1; then
  log_success "SSH连接成功"
else
  log_error "SSH连接失败，请检查网络和密钥"
  exit 1
fi

# 推送前端构建文件
log_info "推送前端构建文件..."
if [ -d "src/frontend/build" ]; then
  scp -i "$KEY_FILE" -r src/frontend/build/* "$SERVER_USER@$SERVER_IP:$REMOTE_PATH/src/frontend/build/"
  log_success "前端文件推送完成"
else
  log_error "前端构建目录不存在，请先运行 npm run build"
fi

# 推送后端代码
log_info "推送后端代码..."
scp -i "$KEY_FILE" -r src/backend/src/* "$SERVER_USER@$SERVER_IP:$REMOTE_PATH/src/backend/src/"
scp -i "$KEY_FILE" src/backend/package.json "$SERVER_USER@$SERVER_IP:$REMOTE_PATH/src/backend/"
scp -i "$KEY_FILE" src/backend/tsconfig.json "$SERVER_USER@$SERVER_IP:$REMOTE_PATH/src/backend/"
log_success "后端代码推送完成"

# 推送部署脚本
log_info "推送部署脚本..."
scp -i "$KEY_FILE" scripts/deployment/*.sh "$SERVER_USER@$SERVER_IP:$REMOTE_PATH/scripts/deployment/"
log_success "部署脚本推送完成"

# 远程重启服务
log_info "远程重启服务..."
ssh -i "$KEY_FILE" "$SERVER_USER@$SERVER_IP" "cd $REMOTE_PATH && pm2 restart all"
log_success "服务重启完成"

echo ""
log_success "更新完成！访问地址: http://$SERVER_IP:3000"
