# 快速启动脚本
# 此脚本用于快速启动AICAM平台的前后端服务

Write-Host "正在启动AICAM人工智能辅助实验平台..." -ForegroundColor Cyan
Write-Host "使用快速启动模式，无需额外检查" -ForegroundColor Cyan

# 调用scripts目录下的启动平台脚本
 = Join-Path  "scripts\start-platform.ps1"
if (Test-Path ) {
    & 
} else {
    Write-Host "错误: 找不到启动脚本: " -ForegroundColor Red
    Write-Host "请确保scripts目录中存在start-platform.ps1文件" -ForegroundColor Red
}

