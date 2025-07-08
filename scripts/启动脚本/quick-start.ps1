# 根目录快速启动脚本 - 调用scripts目录中的实际脚本

 = Join-Path  "scripts\quick-start.ps1"
if (Test-Path ) {
    & 
} else {
    Write-Host "错误: 找不到启动脚本: " -ForegroundColor Red
}
