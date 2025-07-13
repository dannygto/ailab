#!/bin/bash
# AILAB平台 - 2核4G服务器最小化配置

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
echo "  AILAB平台 - 最小化配置脚本"
echo "  适用于2核4G服务器"
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
  if [ -d "src/backend" ]; then
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

log_info "使用后端目录: $BACKEND_DIR"

# 停止所有PM2进程
log_info "停止当前PM2进程..."
pm2 stop all
pm2 delete all

# 创建最小化PM2配置（仅前后端）
log_info "创建最小化PM2配置..."

cat > ecosystem.config.js << EOF
module.exports = {
  apps: [
    {
      name: 'ailab-backend',
      cwd: './$BACKEND_DIR',
      script: 'src/server.ts',
      interpreter: 'node',
      interpreter_args: '--loader ts-node/esm --experimental-specifier-resolution=node --max-old-space-size=1024',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
        TS_NODE_PROJECT: 'tsconfig.json',
        TS_NODE_ESM: 'true'
      },
      watch: false,
      instances: 1,
      exec_mode: 'fork',
      max_memory_restart: '1G',
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
      instances: 1,
      exec_mode: 'fork',
      max_memory_restart: '512M',
      error_file: './logs/frontend-error.log',
      out_file: './logs/frontend-out.log',
      log_file: './logs/frontend.log'
    }
  ]
};
EOF

log_success "最小化PM2配置创建完成"

# 检查serve可用性和ESM兼容性
log_info "检查serve可用性和ESM兼容性..."

# 先尝试使用http-server作为替代方案（更稳定）
if command -v npx >/dev/null && npx http-server --version >/dev/null 2>&1; then
  log_success "npx http-server 可用，使用http-server替代serve（支持API代理）"
  # 更新PM2配置使用http-server
  sed -i "s|script: '/usr/bin/npx'|script: '/usr/bin/npx'|g" ecosystem.config.js
  sed -i "s|args: \['serve', '-s', 'build', '-l', '3000'\]|args: ['http-server', 'build', '-p', '3000', '-a', '0.0.0.0', '--proxy', 'http://localhost:3001?', '--cors']|g" ecosystem.config.js
  log_success "已配置为使用http-server（支持API代理）"
elif npm install -g http-server 2>/dev/null; then
  log_success "安装并使用http-server（支持API代理）"
  sed -i "s|script: '/usr/bin/npx'|script: '/usr/bin/npx'|g" ecosystem.config.js
  sed -i "s|args: \['serve', '-s', 'build', '-l', '3000'\]|args: ['http-server', 'build', '-p', '3000', '-a', '0.0.0.0', '--proxy', 'http://localhost:3001?', '--cors']|g" ecosystem.config.js
  log_success "已配置为使用http-server（支持API代理）"
elif command -v npx >/dev/null && npx serve --version >/dev/null 2>&1; then
  log_warning "使用serve，但需要特殊配置避免ESM问题"
  # 使用exec_mode: cluster模式或者直接用shell脚本包装
  cat > frontend-start.sh << 'EOF'
#!/bin/bash
cd src/frontend
echo "注意：serve不支持代理，API请求可能失败"
echo "建议安装http-server: npm install -g http-server"
npx serve -s build -l 3000
EOF
  chmod +x frontend-start.sh
  # 更新PM2配置使用shell脚本
  sed -i "s|script: '/usr/bin/npx'|script: './frontend-start.sh'|g" ecosystem.config.js
  sed -i "s|args: \['serve', '-s', 'build', '-l', '3000'\]|args: []|g" ecosystem.config.js
  log_warning "已创建shell脚本包装器，但serve不支持API代理"
elif command -v serve >/dev/null; then
  log_warning "全局serve可用，更新配置使用全局serve..."
  sed -i "s|script: '/usr/bin/npx'|script: 'serve'|g" ecosystem.config.js
  sed -i "s|args: \['serve', '-s', 'build', '-l', '3000'\]|args: ['-s', 'build', '-l', '3000']|g" ecosystem.config.js
  log_warning "已更新为使用全局serve，但不支持API代理"
else
  log_error "serve不可用，尝试安装..."
  if npm install -g serve; then
    log_success "serve安装成功"
    sed -i "s|script: '/usr/bin/npx'|script: 'serve'|g" ecosystem.config.js
    sed -i "s|args: \['serve', '-s', 'build', '-l', '3000'\]|args: ['-s', 'build', '-l', '3000']|g" ecosystem.config.js
  else
    log_error "无法安装serve，请手动安装: npm install -g serve"
    exit 1
  fi
fi

# 创建必要的日志目录
mkdir -p logs

# 启用swap（如果未启用）
log_info "检查swap分区..."
if ! swapon --show | grep -q "/swapfile"; then
  log_info "创建2G swap分区..."
  sudo fallocate -l 2G /swapfile
  sudo chmod 600 /swapfile
  sudo mkswap /swapfile
  sudo swapon /swapfile
  echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
  log_success "Swap分区创建完成"
else
  log_success "Swap分区已存在"
fi

# 重新启动服务
log_info "启动AILAB平台核心服务..."
pm2 start ecosystem.config.js

# 等待启动
log_info "等待服务启动..."
sleep 10

# 显示状态
log_info "当前服务状态:"
pm2 status

# 简单健康检查
log_info "运行健康检查..."
sleep 5

# 获取外部IP地址
EXTERNAL_IP=$(curl -s ifconfig.me 2>/dev/null || curl -s ipinfo.io/ip 2>/dev/null || hostname -I | awk '{print $1}')
log_info "检测到外部IP: $EXTERNAL_IP"

# 检查后端（本地检查）
if curl -s http://localhost:3001 >/dev/null 2>&1; then
  log_success "✅ 后端服务正常（本地）"
  # 尝试外部访问检查
  if curl -s http://$EXTERNAL_IP:3001/api/health >/dev/null 2>&1; then
    log_success "✅ 后端API外部访问正常"
  else
    log_warning "⚠️ 后端API外部访问可能需要配置防火墙"
  fi
else
  log_warning "⚠️ 后端服务可能需要更多时间启动"
fi

# 检查前端（本地检查）
if curl -s http://localhost:3000 >/dev/null 2>&1; then
  log_success "✅ 前端服务正常（本地）"
  # 尝试外部访问检查
  if curl -s http://$EXTERNAL_IP:3000 >/dev/null 2>&1; then
    log_success "✅ 前端外部访问正常"
  else
    log_warning "⚠️ 前端外部访问可能需要配置防火墙"
  fi
else
  log_warning "⚠️ 前端服务可能需要更多时间启动"
fi

# 保存PM2配置
pm2 save

echo ""
echo "======================================="
echo "  最小化配置完成"
echo "======================================="
echo "🌐 访问地址:"
echo "• 前端: http://$EXTERNAL_IP:3000"
echo "• 后端: http://$EXTERNAL_IP:3001"
echo "• API健康检查: http://$EXTERNAL_IP:3001/api/health"
echo ""
echo "📊 监控命令:"
echo "• pm2 status      - 查看服务状态"
echo "• pm2 logs        - 查看所有日志"
echo "• pm2 monit       - 实时监控"
echo "• free -h         - 查看内存使用"
echo ""
echo "🔧 防火墙配置（如需要）:"
echo "• sudo ufw allow 3000"
echo "• sudo ufw allow 3001"
echo ""
echo "⚠️ 注意事项:"
echo "• AI服务已禁用以节省资源"
echo "• 启用了内存限制防止OOM"
echo "• 创建了2G swap分区"
echo "• 请确保防火墙允许3000和3001端口访问"
echo ""
log_info "如需启用AI服务，请确保服务器有足够资源（建议4核8G+）"
