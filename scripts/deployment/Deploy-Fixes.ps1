# 快速部署修复到远程服务器 (PowerShell版本)

Write-Host "=======================================" -ForegroundColor Green
Write-Host "  推送修复到远程服务器" -ForegroundColor Green
Write-Host "=======================================" -ForegroundColor Green

$REMOTE_USER = "ubuntu"
$REMOTE_HOST = "82.156.75.232"
$REMOTE_PATH = "/home/ubuntu/ailab"
$SSH_KEY = "ailab.pem"

# 检查SSH密钥
if (!(Test-Path $SSH_KEY)) {
    Write-Host "❌ SSH密钥文件不存在: $SSH_KEY" -ForegroundColor Red
    Write-Host "请确保密钥文件在当前目录" -ForegroundColor Red
    exit 1
}

Write-Host "🚀 推送本地修改到远程服务器..." -ForegroundColor Yellow

# 1. 传输学校API修复脚本
Write-Host "📤 传输学校API修复脚本..." -ForegroundColor Cyan
scp -i $SSH_KEY scripts/deployment/fix-school-api.sh ${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_PATH}/

# 2. 传输前端路由修复脚本
Write-Host "📤 传输前端路由修复脚本..." -ForegroundColor Cyan
scp -i $SSH_KEY scripts/deployment/fix-frontend-routing.sh ${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_PATH}/

# 3. 传输更新的部署脚本
Write-Host "📤 传输部署脚本..." -ForegroundColor Cyan
scp -i $SSH_KEY scripts/deployment/minimal-fix.sh ${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_PATH}/scripts/deployment/

# 3. 传输后端server.ts（恢复WebSocket）
Write-Host "📤 传输后端服务器文件..." -ForegroundColor Cyan
scp -i $SSH_KEY src/backend/src/server.ts ${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_PATH}/src/backend/src/

# 4. 传输设置控制器
Write-Host "📤 传输设置控制器..." -ForegroundColor Cyan
scp -i $SSH_KEY src/backend/src/controllers/settings.controller.ts ${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_PATH}/src/backend/src/controllers/

# 5. 连接到远程服务器执行修复
Write-Host "🔧 连接远程服务器执行修复..." -ForegroundColor Cyan

$sshCommands = @"
cd /home/ubuntu/ailab
echo "📂 当前目录: `$(pwd)"

# 给脚本执行权限
chmod +x fix-school-api.sh
chmod +x fix-frontend-routing.sh
chmod +x scripts/deployment/minimal-fix.sh

# 执行学校API修复（这是主要问题）
echo "🔧 执行学校API修复..."
./fix-school-api.sh

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
"@

ssh -i $SSH_KEY ${REMOTE_USER}@${REMOTE_HOST} $sshCommands

Write-Host ""
Write-Host "🎉 部署完成！" -ForegroundColor Green
Write-Host ""
Write-Host "🔍 验证步骤：" -ForegroundColor Yellow
Write-Host "  1. 访问: http://82.156.75.232:3000" -ForegroundColor White
Write-Host "  2. 导航到任意页面" -ForegroundColor White
Write-Host "  3. 刷新页面测试SPA路由" -ForegroundColor White
Write-Host "  4. 检查WebSocket功能是否正常" -ForegroundColor White
