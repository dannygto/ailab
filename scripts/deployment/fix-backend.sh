#!/bin/bash
# AILAB后端快速修复脚本

log_info() {
  echo -e "\033[0;32m[信息]\033[0m $1"
}

log_error() {
  echo -e "\033[0;31m[错误]\033[0m $1"
}

log_success() {
  echo -e "\033[0;32m[成功]\033[0m $1"
}

log_warning() {
  echo -e "\033[0;33m[警告]\033[0m $1"
}

echo "======================================="
echo "  AILAB后端快速修复"
echo "======================================="

SCRIPT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
DEPLOY_DIR=$(cd "$SCRIPT_DIR/../.." && pwd)

cd $DEPLOY_DIR

# 检测后端目录
if [ -d "src/backend/backend" ]; then
  BACKEND_DIR="src/backend/backend"
elif [ -d "src/backend" ]; then
  BACKEND_DIR="src/backend"
else
  log_error "未找到后端目录"
  exit 1
fi

log_info "使用后端目录: $BACKEND_DIR"

# 停止后端服务
log_info "停止后端服务..."
pm2 stop ailab-backend 2>/dev/null || true

# 检查并修复后端依赖
log_info "检查后端依赖..."
cd $BACKEND_DIR

if [ ! -d "node_modules" ]; then
  log_info "安装后端依赖..."
  npm install
fi

# 确保TypeScript依赖可用
log_info "确保TypeScript依赖..."
npm list typescript ts-node @types/node >/dev/null 2>&1 || {
  log_info "安装TypeScript依赖..."
  npm install --save-dev typescript ts-node @types/node
}

# 检查入口文件
cd $DEPLOY_DIR
if [ ! -f "$BACKEND_DIR/src/index.ts" ]; then
  log_error "后端入口文件不存在: $BACKEND_DIR/src/index.ts"

  # 尝试查找其他入口文件
  POSSIBLE_ENTRIES=$(find $BACKEND_DIR -name "*.ts" | grep -E "(index|main|app|server)" | head -1)
  if [ ! -z "$POSSIBLE_ENTRIES" ]; then
    log_info "发现可能的入口文件: $POSSIBLE_ENTRIES"
    # 更新PM2配置
    ENTRY_RELATIVE=$(echo $POSSIBLE_ENTRIES | sed "s|$BACKEND_DIR/||")
    sed -i "s|script: 'src/index.ts'|script: '$ENTRY_RELATIVE'|g" ecosystem.config.js
    log_info "已更新PM2配置使用: $ENTRY_RELATIVE"
  else
    log_error "未找到合适的入口文件"
    exit 1
  fi
fi

# 创建或更新.env文件
log_info "确保后端环境配置..."
if [ ! -f "$BACKEND_DIR/.env" ]; then
  cat > $BACKEND_DIR/.env << 'EOF'
PORT=3001
NODE_ENV=production
DATABASE_URL=mongodb://localhost:27017/ailab
JWT_SECRET=ailab-secret-key-2024
API_BASE_URL=http://localhost:3001/api
CORS_ORIGIN=http://localhost:3000
EOF
  log_success "创建后端.env文件"
else
  # 确保端口配置正确
  if ! grep -q "PORT=3001" "$BACKEND_DIR/.env"; then
    echo "PORT=3001" >> "$BACKEND_DIR/.env"
    log_info "添加端口配置到.env"
  fi
fi

# 测试后端是否能启动
log_info "测试后端启动..."
cd $BACKEND_DIR

# 设置超时测试
timeout 15s npx ts-node --loader ts-node/esm src/index.ts &
TEST_PID=$!
sleep 5

if kill -0 $TEST_PID 2>/dev/null; then
  log_success "后端启动测试成功"
  kill $TEST_PID 2>/dev/null
else
  log_error "后端启动测试失败"
  log_info "尝试查看错误信息..."
  npx ts-node --loader ts-node/esm src/index.ts &
  sleep 3
  kill $! 2>/dev/null
fi

# 回到部署目录
cd $DEPLOY_DIR

# 重新启动后端服务
log_info "重新启动后端服务..."
pm2 start ecosystem.config.js --only ailab-backend

# 等待启动
log_info "等待后端启动..."
sleep 10

# 检查服务状态
log_info "检查服务状态..."
pm2 status

# 检查端口监听
log_info "检查端口3001..."
if command -v netstat >/dev/null; then
  netstat -tlnp | grep :3001 && log_success "端口3001正在监听" || log_warning "端口3001未监听"
elif command -v ss >/dev/null; then
  ss -tlnp | grep :3001 && log_success "端口3001正在监听" || log_warning "端口3001未监听"
fi

# 健康检查
log_info "运行健康检查..."
sleep 5

if curl -s http://localhost:3001 >/dev/null 2>&1; then
  log_success "✅ 后端服务正常响应"
elif curl -s http://localhost:3001/api >/dev/null 2>&1; then
  log_success "✅ 后端API正常响应"
elif curl -s http://localhost:3001/health >/dev/null 2>&1; then
  log_success "✅ 后端健康检查正常"
else
  log_error "❌ 后端服务仍无响应"

  log_info "查看最新日志..."
  pm2 logs ailab-backend --lines 10

  echo ""
  log_info "可能的解决方案："
  echo "1. 检查MongoDB是否运行: systemctl status mongod"
  echo "2. 检查后端日志: pm2 logs ailab-backend"
  echo "3. 手动启动测试: cd $BACKEND_DIR && npx ts-node --loader ts-node/esm src/index.ts"
  echo "4. 完全重新部署: ./scripts/deployment/complete-redeploy.sh"
fi

echo ""
echo "======================================="
echo "  后端修复完成"
echo "======================================="
log_info "如果问题仍然存在，请运行诊断脚本:"
log_info "chmod +x scripts/deployment/diagnose-backend.sh"
log_info "./scripts/deployment/diagnose-backend.sh"
