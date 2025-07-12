# AI实验平台 - 重置初始化状态脚本 (Windows版)

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  重置AI实验平台初始化状态" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan

# 确认操作
$confirmation = Read-Host "此操作将重置系统初始化状态，系统将需要重新初始化。确定要继续吗? [y/N]"
if ($confirmation -ne "y" -and $confirmation -ne "Y") {
    Write-Host "操作已取消" -ForegroundColor Yellow
    exit 0
}

# 获取Docker容器ID
$backendContainer = docker ps --filter "name=ailab_backend" --format "{{.ID}}"

if ([string]::IsNullOrEmpty($backendContainer)) {
    Write-Host "错误: 未找到后端容器。请确保AI实验平台正在运行。" -ForegroundColor Red
    exit 1
}

Write-Host "正在重置初始化状态..." -ForegroundColor Green

# 调用API重置初始化状态
docker exec $backendContainer curl -X POST http://localhost:8000/api/system/reset-initialization

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ 初始化状态已重置" -ForegroundColor Green
    Write-Host "请访问 http://localhost:3000/initialize 重新初始化系统" -ForegroundColor White
}
else {
    Write-Host "❌ 重置初始化状态失败" -ForegroundColor Red
}
