#!/bin/bash
# 修复前端路由刷新问题的脚本

echo "======================================="
echo "  修复前端路由刷新问题"
echo "======================================="

# 检查当前PM2进程
echo "当前PM2进程状态："
pm2 status

# 停止前端服务
echo "停止前端服务..."
pm2 stop ailab-frontend

# 检查http-server是否可用
if command -v http-server >/dev/null; then
    echo "✅ http-server 已安装"
else
    echo "📦 安装 http-server..."
    npm install -g http-server
fi

# 删除旧的前端进程
pm2 delete ailab-frontend

# 创建新的前端配置（支持SPA路由）
echo "📝 创建支持SPA路由的前端配置..."
cat > frontend-spa.config.js << 'EOF'
module.exports = {
  apps: [
    {
      name: 'ailab-frontend',
      cwd: './src/frontend',
      script: 'http-server',
      args: [
        'build',
        '-p', '3000',
        '-a', '0.0.0.0',
        '--proxy', 'http://localhost:3001?',
        '--cors',
        '--push-state'  // 这个参数支持SPA路由
      ],
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

# 启动新的前端服务
echo "🚀 启动支持SPA路由的前端服务..."
pm2 start frontend-spa.config.js

# 保存PM2配置
pm2 save

# 显示状态
echo "📊 当前服务状态："
pm2 status

echo ""
echo "✅ 前端路由修复完成！"
echo ""
echo "🔧 修复内容："
echo "  - 使用 http-server 替代 serve"
echo "  - 添加 --push-state 参数支持SPA路由"
echo "  - 保持API代理和CORS支持"
echo ""
echo "🌐 测试方法："
echo "  1. 访问: http://82.156.75.232:3000"
echo "  2. 导航到任意页面（如 /dashboard）"
echo "  3. 刷新页面，应该正常显示内容而不是API信息"
echo ""
echo "📝 如果还有问题，请检查："
echo "  - 前端build目录是否存在: ls -la src/frontend/build"
echo "  - http-server是否正确启动: pm2 logs ailab-frontend"
