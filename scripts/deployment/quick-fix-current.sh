#!/bin/bash
# AILAB平台 - 快速修复当前部署问题

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
echo "  AILAB平台 - 快速修复脚本"
echo "======================================="

# 获取AILAB项目根目录
SCRIPT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
DEPLOY_DIR=$(cd "$SCRIPT_DIR/../.." && pwd)

log_info "脚本目录: $SCRIPT_DIR"
log_info "部署目录: $DEPLOY_DIR"

# 切换到部署目录
cd $DEPLOY_DIR

# 验证目录结构
log_info "验证项目目录结构..."
if [ ! -d "src/backend/backend" ]; then
  log_error "后端目录不存在: src/backend/backend"
  if [ -d "src/backend" ]; then
    log_info "发现简化目录结构，使用 src/backend"
    BACKEND_DIR="src/backend"
  else
    log_error "无法找到后端目录"
    exit 1
  fi
else
  BACKEND_DIR="src/backend/backend"
fi

if [ ! -d "src/frontend" ]; then
  log_error "前端目录不存在: src/frontend"
  exit 1
fi

if [ ! -d "src/ai-service" ]; then
  log_warning "AI服务目录不存在: src/ai-service"
  AI_SERVICE_EXISTS=false
else
  AI_SERVICE_EXISTS=true
fi

log_info "使用后端目录: $BACKEND_DIR"
log_info "前端目录: src/frontend"
if [ "$AI_SERVICE_EXISTS" = true ]; then
  log_info "AI服务目录: src/ai-service"
else
  log_info "AI服务目录: 不存在（将跳过AI服务）"
fi

# 停止所有PM2进程
log_info "停止当前PM2进程..."
pm2 stop all
pm2 delete all

# 修复前端serve的ESM问题
log_info "修复前端serve配置..."

# 动态生成PM2配置
if [ "$AI_SERVICE_EXISTS" = true ]; then
  # 包含AI服务的完整配置
  cat > ecosystem.config.js << EOF
module.exports = {
  apps: [
    {
      name: 'ailab-backend',
      cwd: './$BACKEND_DIR',
      script: 'src/index.ts',
      interpreter: 'node',
      interpreter_args: '--loader ts-node/esm --max-old-space-size=1024',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
        TS_NODE_PROJECT: 'tsconfig.json'
      },
      watch: false,
      instances: 1,
      exec_mode: 'fork',
      error_file: './logs/backend-error.log',
      out_file: './logs/backend-out.log',
      log_file: './logs/backend.log'
    },
    {
      name: 'ailab-frontend',
      cwd: './src/frontend',
      script: '/usr/bin/npx',
      args: ['serve', '-s', 'build', '-l', '3000'],
      env: {
        NODE_ENV: 'production'
      },
      watch: false,
      exec_mode: 'fork',
      error_file: './logs/frontend-error.log',
      out_file: './logs/frontend-out.log',
      log_file: './logs/frontend.log'
    },
    {
      name: 'ailab-ai-service',
      cwd: './src/ai-service',
      script: 'ai/main.py',
      interpreter: 'python3',
      env: {
        PYTHONPATH: './ai',
        ENVIRONMENT: 'production'
      },
      watch: false,
      instances: 1,
      exec_mode: 'fork',
      error_file: './logs/ai-service-error.log',
      out_file: './logs/ai-service-out.log',
      log_file: './logs/ai-service.log'
    }
  ]
};
EOF
else
  # 仅核心服务的最小化配置
  cat > ecosystem.config.js << EOF
module.exports = {
  apps: [
    {
      name: 'ailab-backend',
      cwd: './$BACKEND_DIR',
      script: 'src/index.ts',
      interpreter: 'node',
      interpreter_args: '--loader ts-node/esm --max-old-space-size=1024',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
        TS_NODE_PROJECT: 'tsconfig.json'
      },
      watch: false,
      instances: 1,
      exec_mode: 'fork',
      error_file: './logs/backend-error.log',
      out_file: './logs/backend-out.log',
      log_file: './logs/backend.log'
    },
    {
      name: 'ailab-frontend',
      cwd: './src/frontend',
      script: '/usr/bin/npx',
      args: ['serve', '-s', 'build', '-l', '3000'],
      env: {
        NODE_ENV: 'production'
      },
      watch: false,
      exec_mode: 'fork',
      error_file: './logs/frontend-error.log',
      out_file: './logs/frontend-out.log',
      log_file: './logs/frontend.log'
    }
  ]
};
EOF
fi

log_success "PM2配置文件已更新"

# 安装motor依赖
if [ "$AI_SERVICE_EXISTS" = true ]; then
  log_info "修复AI服务motor依赖..."
  cd $DEPLOY_DIR/src/ai-service
  pip3 install --force-reinstall motor==3.3.2
  pip3 install pymongo[srv]

  # 验证motor安装
  if python3 -c "import motor; print('Motor version:', motor.__version__)" 2>/dev/null; then
    log_success "Motor依赖安装成功"
  else
    log_error "Motor依赖安装失败"
    log_info "尝试alternative方法..."
    python3 -m pip install motor==3.3.2
  fi

  # 回到部署目录
  cd $DEPLOY_DIR
else
  log_info "跳过AI服务依赖安装（AI服务目录不存在）"
fi

# 检查serve是否可用
log_info "检查serve可用性..."
if command -v npx >/dev/null && npx serve --version >/dev/null 2>&1; then
  log_success "npx serve 可用"
elif command -v serve >/dev/null; then
  log_warning "全局serve可用，更新配置使用全局serve..."
  # 更新配置使用全局serve
  sed -i "s|script: '/usr/bin/npx'|script: 'serve'|g" ecosystem.config.js
  sed -i "s|args: \['serve', '-s', 'build', '-l', '3000'\]|args: ['-s', 'build', '-l', '3000']|g" ecosystem.config.js
  log_success "已更新为使用全局serve"
else
  log_error "serve不可用，安装serve..."
  npm install -g serve
fi

# 重新启动服务
log_info "重新启动AILAB平台服务..."
pm2 start ecosystem.config.js

# 等待启动
log_info "等待服务启动..."
sleep 15

# 显示状态
log_info "当前服务状态:"
pm2 status

# 运行健康检查
log_info "运行健康检查..."
if [ -f "scripts/health-check.js" ]; then
  node scripts/health-check.js
else
  log_info "手动检查服务状态..."

  # 检查后端
  if curl -s http://localhost:3001/api/health >/dev/null; then
    log_success "✅ 后端服务正常"
  else
    log_error "❌ 后端服务异常"
  fi

  # 检查前端
  if curl -s http://localhost:3000 >/dev/null; then
    log_success "✅ 前端服务正常"
  else
    log_error "❌ 前端服务异常"
  fi

  # 检查AI服务
  if curl -s http://localhost:8001/health >/dev/null; then
    log_success "✅ AI服务正常"
  else
    log_warning "⚠️ AI服务可能异常（可选服务）"
  fi
fi

echo ""
echo "======================================="
echo "  快速修复完成"
echo "======================================="
log_info "如果服务仍有问题，请查看日志:"
log_info "pm2 logs"
log_info ""
log_info "或查看特定服务日志:"
log_info "pm2 logs ailab-frontend"
log_info "pm2 logs ailab-backend"
log_info "pm2 logs ailab-ai-service"
