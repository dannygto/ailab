# build-project
# 设置编码为UTF-8，避免中文乱码
# 编码设置已优化

# Build Project Script
Write-Host "Building AICAM platform..." -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Cyan

# Save current directory
$currentDir = Get-Location

# Build frontend
Write-Host "Building frontend..." -ForegroundColor Blue
Set-Location "$PSScriptRoot/../frontend"
npm run build

# Build backend
Write-Host "Building backend..." -ForegroundColor Green
Set-Location "$PSScriptRoot/../backend"
npm run build

# Return to original directory
Set-Location $currentDir

Write-Host "Build complete!" -ForegroundColor Cyan


