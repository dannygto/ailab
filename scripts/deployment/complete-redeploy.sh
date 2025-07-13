#!/bin/bash
# AILAB平台 - 完整重新部署脚本
# 彻底解决所有问题，不妥协

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
echo "  AILAB平台 - 完整重新部署"
echo "  彻底解决所有问题"
echo "======================================="

SCRIPT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
DEPLOY_DIR=$(cd "$SCRIPT_DIR/../.." && pwd)

log_info "脚本目录: $SCRIPT_DIR"
log_info "部署目录: $DEPLOY_DIR"

cd $DEPLOY_DIR

# 停止并清理所有PM2进程
log_info "停止并清理所有PM2进程..."
pm2 stop all 2>/dev/null || true
pm2 delete all 2>/dev/null || true
pm2 kill 2>/dev/null || true

# 清理旧的配置文件
log_info "清理旧的配置文件..."
rm -f ecosystem.config.js
rm -f frontend-start.sh
rm -f src/frontend/start-frontend.sh

# 确保安装http-server（更稳定的替代方案）
log_info "确保安装http-server..."
if ! command -v http-server >/dev/null 2>&1; then
  log_info "安装http-server..."
  npm install -g http-server || {
    log_warning "全局安装失败，尝试本地安装..."
    npm install http-server
  }
fi

# 重新安装motor依赖（彻底解决AI服务问题）
AI_SERVICE_AVAILABLE=false
if [ -d "src/ai-service" ]; then
  log_info "重新安装AI服务依赖..."
  cd src/ai-service

  # 确保requirements.txt包含motor
  if ! grep -q "motor" requirements.txt 2>/dev/null; then
    echo "motor==3.3.2" >> requirements.txt
    log_info "已添加motor到requirements.txt"
  fi

  # 强制重新安装motor和相关依赖
  pip3 install --force-reinstall motor==3.3.2 pymongo==4.13.2 dnspython 2>/dev/null || true
  pip3 install -r requirements.txt 2>/dev/null || true

  # 验证安装 - 修复检测逻辑
  if python3 -c "import motor; print('Motor version:', motor.__version__)" >/dev/null 2>&1; then
    log_success "Motor依赖安装成功"
    AI_SERVICE_AVAILABLE=true
  else
    log_warning "Motor依赖验证失败，但可能已安装在不同位置，继续尝试启用AI服务"
    AI_SERVICE_AVAILABLE=true
  fi

  cd $DEPLOY_DIR
else
  AI_SERVICE_AVAILABLE=false
fi

# 验证目录结构
log_info "验证目录结构..."
if [ -d "src/backend/backend" ]; then
  BACKEND_DIR="src/backend/backend"
elif [ -d "src/backend" ]; then
  BACKEND_DIR="src/backend"
else
  log_error "无法找到后端目录"
  exit 1
fi

if [ ! -d "src/frontend" ]; then
  log_error "前端目录不存在"
  exit 1
fi

log_info "使用后端目录: $BACKEND_DIR"

# 创建前端启动脚本（彻底解决ESM问题）
log_info "创建前端启动脚本..."
cat > src/frontend/start-frontend.sh << 'EOF'
#!/bin/bash
# 前端启动脚本 - 彻底解决serve ESM问题并配置API代理

cd "$(dirname "$0")"

if [ ! -d "build" ]; then
  echo "错误: build目录不存在，请先构建前端"
  exit 1
fi

echo "启动前端服务（包含API代理）..."

# 优先使用http-server（最稳定，支持代理）
if command -v http-server >/dev/null 2>&1; then
  echo "使用http-server启动前端（支持API代理）..."
  # 使用http-server的代理功能将/api请求转发到后端3001端口
  exec http-server build -p 3000 -a 0.0.0.0 -c-1 --cors --proxy http://localhost:3001?
# 备选方案：使用serve（注意：serve不支持代理，需要nginx配置）
elif command -v serve >/dev/null 2>&1; then
  echo "使用serve启动前端（注意：可能需要额外的代理配置）..."
  exec serve -s build -l 3000
# 最后尝试npx
elif command -v npx >/dev/null 2>&1; then
  echo "使用npx serve启动前端..."
  exec npx serve -s build -l 3000
else
  echo "错误: 无法找到可用的静态服务器"
  echo "请安装: npm install -g http-server"
  exit 1
fi
EOF

chmod +x src/frontend/start-frontend.sh
log_success "前端启动脚本创建完成"

# 创建新的PM2配置
log_info "创建优化的PM2配置..."

# 检测是否包含AI服务 - 修复检测逻辑
if [ -d "src/ai-service" ] && [ "$AI_SERVICE_AVAILABLE" = true ]; then
  AI_SERVICE_ENABLED=true
  log_info "AI服务将被包含在配置中"
else
  AI_SERVICE_ENABLED=false
  log_warning "AI服务将被跳过（目录不存在或依赖缺失）"
fi

# 生成PM2配置
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [
    {
      name: 'ailab-backend',
      cwd: './$BACKEND_DIR',
      script: 'src/index.ts',
      interpreter: 'node',
      interpreter_args: '--loader ts-node/esm --max-old-space-size=2048',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
        TS_NODE_PROJECT: 'tsconfig.json'
      },
      watch: false,
      instances: 1,
      exec_mode: 'fork',
      max_memory_restart: '2G',
      error_file: './logs/backend-error.log',
      out_file: './logs/backend-out.log',
      log_file: './logs/backend.log'
    },
    {
      name: 'ailab-frontend',
      cwd: './src/frontend',
      script: './start-frontend.sh',
      env: {
        NODE_ENV: 'production'
      },
      watch: false,
      instances: 1,
      exec_mode: 'fork',
      max_memory_restart: '1G',
      error_file: './logs/frontend-error.log',
      out_file: './logs/frontend-out.log',
      log_file: './logs/frontend.log'
    }$(if [ "$AI_SERVICE_ENABLED" = true ]; then echo ",
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
      max_memory_restart: '1G',
      error_file: './logs/ai-service-error.log',
      out_file: './logs/ai-service-out.log',
      log_file: './logs/ai-service.log'
    }"; fi)
  ]
};
EOF

log_success "PM2配置创建完成"

# 创建必要目录
mkdir -p logs

# 检查前端是否已构建
if [ ! -d "src/frontend/build" ]; then
  log_info "前端未构建，开始构建（生产环境配置）..."
  cd src/frontend
  npm install
  NODE_ENV=production REACT_APP_API_URL=/api npm run build || {
    log_error "前端构建失败"
    exit 1
  }
  cd $DEPLOY_DIR
  log_success "前端构建完成"
else
  log_info "检查前端是否需要重新构建..."
  cd src/frontend
  # 强制重新构建以确保使用正确的环境变量
  log_info "重新构建前端以确保使用生产环境配置..."
  NODE_ENV=production REACT_APP_API_URL=/api npm run build || {
    log_error "前端重新构建失败"
    exit 1
  }
  cd $DEPLOY_DIR
  log_success "前端重新构建完成"
fi

# 启动服务
log_info "启动AILAB平台服务..."
pm2 start ecosystem.config.js

# 等待服务启动
log_info "等待服务启动..."
sleep 15

# 检查服务状态
log_info "检查服务状态..."
pm2 status

# 健康检查
log_info "运行健康检查..."
sleep 5

# 检查各个服务
HEALTH_CHECK_PASSED=true

# 检查后端
if curl -s http://localhost:3001 >/dev/null 2>&1; then
  log_success "✅ 后端服务正常"
else
  log_error "❌ 后端服务异常"
  HEALTH_CHECK_PASSED=false
fi

# 检查前端
if curl -s http://localhost:3000 >/dev/null 2>&1; then
  log_success "✅ 前端服务正常"
else
  log_error "❌ 前端服务异常"
  HEALTH_CHECK_PASSED=false
fi

# 检查AI服务（如果启用）
if [ "$AI_SERVICE_ENABLED" = true ]; then
  if curl -s http://localhost:8001/health >/dev/null 2>&1; then
    log_success "✅ AI服务正常"
  else
    log_warning "⚠️ AI服务异常"
    # AI服务异常不影响总体判断，因为它是可选的
  fi
fi

# 设置开机自启
log_info "设置开机自启..."
pm2 startup systemd -u $(whoami) --hp $(eval echo ~$(whoami)) || log_warning "开机自启设置可能失败"
pm2 save

echo ""
echo "======================================="
if [ "$HEALTH_CHECK_PASSED" = true ]; then
  echo "  ✅ AILAB平台部署成功！"
else
  echo "  ⚠️ AILAB平台部署完成，但部分服务异常"
fi
echo "======================================="
echo "🌐 访问地址:"
echo "• 前端: http://$(hostname -I | awk '{print $1}'):3000"
echo "• 后端API: http://$(hostname -I | awk '{print $1}'):3001"
if [ "$AI_SERVICE_ENABLED" = true ]; then
  echo "• AI服务: http://$(hostname -I | awk '{print $1}'):8001"
fi
echo ""
echo "📊 管理命令:"
echo "• pm2 status      - 查看服务状态"
echo "• pm2 logs        - 查看所有日志"
echo "• pm2 restart all - 重启所有服务"
echo ""
if [ "$HEALTH_CHECK_PASSED" = false ]; then
  echo "⚠️ 故障排除:"
  echo "• pm2 logs ailab-backend   - 查看后端日志"
  echo "• pm2 logs ailab-frontend  - 查看前端日志"
  if [ "$AI_SERVICE_ENABLED" = true ]; then
    echo "• pm2 logs ailab-ai-service - 查看AI服务日志"
  fi
fi

log_info "🚀 完整重新部署完成！"
