#!/bin/bash
# AILAB后端问题诊断脚本

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
echo "  AILAB后端问题诊断"
echo "======================================="

SCRIPT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
DEPLOY_DIR=$(cd "$SCRIPT_DIR/../.." && pwd)

cd $DEPLOY_DIR

log_info "当前目录: $(pwd)"

# 检查PM2状态
log_info "检查PM2服务状态..."
pm2 status

echo ""
log_info "检查后端日志..."
if pm2 logs ailab-backend --lines 20; then
  echo ""
else
  log_warning "无法获取PM2日志，检查文件日志..."
  if [ -f "logs/backend-error.log" ]; then
    log_info "后端错误日志 (最近20行):"
    tail -20 logs/backend-error.log
  fi

  if [ -f "logs/backend-out.log" ]; then
    log_info "后端输出日志 (最近20行):"
    tail -20 logs/backend-out.log
  fi
fi

echo ""
log_info "检查后端服务连接..."
if curl -s http://localhost:3001 >/dev/null 2>&1; then
  log_success "✅ 后端服务可以连接"

  # 测试具体的API端点
  if curl -s http://localhost:3001/api/health >/dev/null 2>&1; then
    log_success "✅ 后端健康检查端点正常"
  else
    log_warning "⚠️ 后端健康检查端点异常"
  fi
else
  log_error "❌ 后端服务无法连接"
fi

echo ""
log_info "检查端口占用情况..."
if command -v netstat >/dev/null 2>&1; then
  log_info "端口3001占用情况:"
  netstat -tlnp | grep :3001 || echo "端口3001未被占用"
elif command -v ss >/dev/null 2>&1; then
  log_info "端口3001占用情况:"
  ss -tlnp | grep :3001 || echo "端口3001未被占用"
fi

echo ""
log_info "检查后端目录结构..."
if [ -d "src/backend/backend" ]; then
  BACKEND_DIR="src/backend/backend"
elif [ -d "src/backend" ]; then
  BACKEND_DIR="src/backend"
else
  log_error "无法找到后端目录"
  exit 1
fi

log_info "使用后端目录: $BACKEND_DIR"

if [ -f "$BACKEND_DIR/src/index.ts" ]; then
  log_success "✅ 后端入口文件存在: $BACKEND_DIR/src/index.ts"
else
  log_error "❌ 后端入口文件不存在: $BACKEND_DIR/src/index.ts"
fi

if [ -f "$BACKEND_DIR/tsconfig.json" ]; then
  log_success "✅ TypeScript配置文件存在"
else
  log_warning "⚠️ TypeScript配置文件不存在"
fi

if [ -f "$BACKEND_DIR/package.json" ]; then
  log_success "✅ package.json存在"

  # 检查关键依赖
  echo ""
  log_info "检查关键依赖..."
  cd $BACKEND_DIR

  if npm list ts-node >/dev/null 2>&1; then
    log_success "✅ ts-node已安装"
  else
    log_error "❌ ts-node未安装"
  fi

  if npm list typescript >/dev/null 2>&1; then
    log_success "✅ typescript已安装"
  else
    log_error "❌ typescript未安装"
  fi

  if npm list @types/node >/dev/null 2>&1; then
    log_success "✅ @types/node已安装"
  else
    log_error "❌ @types/node未安装"
  fi

  cd $DEPLOY_DIR
else
  log_error "❌ package.json不存在"
fi

echo ""
log_info "检查Node.js环境..."
node --version
echo "ts-node版本:"
if command -v ts-node >/dev/null 2>&1; then
  ts-node --version
else
  echo "ts-node未在全局PATH中找到"
fi

echo ""
log_info "尝试手动启动后端进行测试..."
cd $BACKEND_DIR
echo "在目录 $(pwd) 中执行测试启动..."

# 尝试直接运行后端
echo "测试命令: node --loader ts-node/esm --max-old-space-size=2048 src/index.ts"
timeout 10s node --loader ts-node/esm --max-old-space-size=2048 src/index.ts &
TEST_PID=$!

sleep 3

if kill -0 $TEST_PID 2>/dev/null; then
  log_info "后端进程启动成功，PID: $TEST_PID"

  # 测试连接
  if curl -s http://localhost:3001 >/dev/null 2>&1; then
    log_success "✅ 手动启动的后端服务可以连接"
  else
    log_warning "⚠️ 手动启动的后端服务无法连接"
  fi

  # 清理测试进程
  kill $TEST_PID 2>/dev/null
  wait $TEST_PID 2>/dev/null
else
  log_error "❌ 后端进程启动失败"
fi

cd $DEPLOY_DIR

echo ""
log_info "检查后端目录结构..."
if [ -d "src/backend/backend" ]; then
  BACKEND_DIR="src/backend/backend"
  log_info "发现标准后端目录: $BACKEND_DIR"
elif [ -d "src/backend" ]; then
  BACKEND_DIR="src/backend"
  log_info "发现简化后端目录: $BACKEND_DIR"
else
  log_error "未找到后端目录！"
  exit 1
fi

# 检查后端文件
log_info "检查后端关键文件..."
echo "目录内容："
ls -la $BACKEND_DIR/

if [ -d "$BACKEND_DIR/src" ]; then
  echo ""
  echo "src目录内容："
  ls -la $BACKEND_DIR/src/

  if [ -f "$BACKEND_DIR/src/index.ts" ]; then
    log_success "✅ 入口文件存在: $BACKEND_DIR/src/index.ts"
  else
    log_error "❌ 入口文件不存在: $BACKEND_DIR/src/index.ts"
    echo "查找其他可能的入口文件..."
    find $BACKEND_DIR -name "*.ts" -o -name "*.js" | grep -E "(index|main|app|server)" | head -5
  fi
else
  log_error "❌ src目录不存在"
  echo "查找可能的入口文件..."
  find $BACKEND_DIR -name "*.ts" -o -name "*.js" | head -10
fi

# 检查依赖
echo ""
log_info "检查package.json..."
if [ -f "$BACKEND_DIR/package.json" ]; then
  log_success "✅ package.json存在"
  echo "关键依赖："
  cat $BACKEND_DIR/package.json | grep -A 20 '"dependencies"' | head -25
else
  log_error "❌ package.json不存在"
fi

# 检查node_modules
if [ -d "$BACKEND_DIR/node_modules" ]; then
  log_success "✅ node_modules存在"
else
  log_error "❌ node_modules不存在，需要运行 npm install"
fi

# 检查环境变量
echo ""
log_info "检查环境配置..."
if [ -f "$BACKEND_DIR/.env" ]; then
  log_success "✅ .env文件存在"
  echo "环境变量："
  cat $BACKEND_DIR/.env
else
  log_warning "⚠️ .env文件不存在"
fi

# 检查tsconfig.json
if [ -f "$BACKEND_DIR/tsconfig.json" ]; then
  log_success "✅ tsconfig.json存在"
else
  log_warning "⚠️ tsconfig.json不存在"
fi

# 检查端口占用
echo ""
log_info "检查端口3001占用情况..."
if command -v netstat >/dev/null; then
  netstat -tlnp | grep :3001 || log_info "端口3001未被占用"
elif command -v ss >/dev/null; then
  ss -tlnp | grep :3001 || log_info "端口3001未被占用"
else
  log_warning "无法检查端口占用（netstat/ss不可用）"
fi

# 手动尝试启动后端
echo ""
log_info "尝试手动启动后端..."
cd $BACKEND_DIR

log_info "检查Node.js和TypeScript依赖..."
if command -v node >/dev/null; then
  echo "Node.js版本: $(node -v)"
else
  log_error "Node.js不可用"
fi

if command -v npx >/dev/null && npx ts-node --version >/dev/null 2>&1; then
  echo "ts-node可用"
else
  log_warning "ts-node不可用，尝试安装..."
  npm install ts-node typescript @types/node
fi

echo ""
log_info "尝试编译TypeScript..."
if npx tsc --noEmit; then
  log_success "TypeScript编译检查通过"
else
  log_error "TypeScript编译有错误"
fi

echo ""
log_info "建议的修复命令："
echo "1. 重新安装依赖:"
echo "   cd $DEPLOY_DIR/$BACKEND_DIR && npm install"
echo ""
echo "2. 手动启动测试:"
echo "   cd $DEPLOY_DIR/$BACKEND_DIR && npx ts-node --loader ts-node/esm src/index.ts"
echo ""
echo "3. 重启PM2服务:"
echo "   pm2 restart ailab-backend"
echo ""
echo "4. 如果问题持续，完全重新部署:"
echo "   cd $DEPLOY_DIR && ./scripts/deployment/complete-redeploy.sh"
