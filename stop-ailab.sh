#!/bin/bash
# AILAB平台停止脚本

# 获取脚本所在目录作为部署目录
DEPLOY_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)

# 导入日志函数
log_info() {
  echo -e "\033[0;32m[信息]\033[0m $1"
}

log_warning() {
  echo -e "\033[0;33m[警告]\033[0m $1"
}

log_error() {
  echo -e "\033[0;31m[错误]\033[0m $1"
}

log_success() {
  echo -e "\033[0;32m[成功]\033[0m $1"
}

echo "====================================="
echo "  AILAB平台 - 停止服务"
echo "====================================="
echo "部署目录: $DEPLOY_DIR"

# 切换到部署目录
cd $DEPLOY_DIR

# 检查PM2是否已全局安装
if command -v pm2 &> /dev/null; then
  PM2_CMD="pm2"
# 检查本地PM2是否可用
elif [ -f "$DEPLOY_DIR/node_modules/.bin/pm2" ]; then
  PM2_CMD="$DEPLOY_DIR/node_modules/.bin/pm2"
# 检查我们创建的本地链接
elif [ -f "$DEPLOY_DIR/bin/pm2" ]; then
  PM2_CMD="$DEPLOY_DIR/bin/pm2"
else
  log_error "未找到PM2，无法停止服务"
  exit 1
fi

log_info "使用PM2命令: $PM2_CMD"

# 停止所有服务
log_info "停止AILAB平台服务..."
$PM2_CMD stop all

# 显示状态
log_info "当前服务状态:"
$PM2_CMD status

echo ""
log_success "AILAB平台服务已停止"
echo ""
echo "如需完全删除服务进程:"
echo "  $PM2_CMD delete all"
