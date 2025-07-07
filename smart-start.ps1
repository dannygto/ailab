# 根目录智能启动脚本 - 调用scripts目录中的实际脚本

$scriptsPath = Join-Path $PSScriptRoot "scripts\smart-start.ps1"
if (Test-Path $scriptsPath) {
    & $scriptsPath
} else {
    Write-Host "错误: 找不到启动脚本: $scriptsPath" -ForegroundColor Red
}
