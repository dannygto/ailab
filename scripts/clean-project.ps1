# clean-project
# 设置编码为UTF-8，避免中文乱码
# 编码设置已优化

# Clean Project Script
Write-Host "Cleaning project..." -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Cyan

# Clean node_modules
Write-Host "Cleaning node_modules..." -ForegroundColor Yellow
Remove-Item -Path "frontend/node_modules", "backend/node_modules", "node_modules" -Recurse -Force -ErrorAction SilentlyContinue

# Clean build files
Write-Host "Cleaning build files..." -ForegroundColor Yellow
Remove-Item -Path "frontend/build", "backend/dist" -Recurse -Force -ErrorAction SilentlyContinue

Write-Host "Project cleaned!" -ForegroundColor Green


