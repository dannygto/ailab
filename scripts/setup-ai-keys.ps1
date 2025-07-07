# setup-ai-keys
# 设置编码为UTF-8，避免中文乱码
# 编码设置已优化

# Setup AI Keys Script
Write-Host "Setting up AI keys..." -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Cyan

# Set current directory
Set-Location $PSScriptRoot/..

# Run setup-ai.js
node setup-ai.js

Write-Host ""
Read-Host "Press Enter to continue"


