# AICAM平台一键启动脚本 (ASCII兼容版本)
# 此脚本用于一键启动AICAM平台的所有服务

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  AICAM Platform Auto Start Script" -ForegroundColor Cyan
Write-Host "  AI-Assisted Experiment Platform" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# 设置工作目录为脚本所在目录
Set-Location $PSScriptRoot

# 首先停止所有现有服务，避免端口冲突
Write-Host "Stopping all existing services..." -ForegroundColor Yellow
try {
    Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
    Get-NetTCPConnection -LocalPort 3000,3002 -ErrorAction SilentlyContinue | ForEach-Object {
        try {
            Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue
        } catch { }
    }
    Write-Host "All existing services stopped" -ForegroundColor Green
    Start-Sleep -Seconds 2
} catch {
    Write-Host "No existing services to stop" -ForegroundColor Yellow
}

# 检查必要的脚本文件
$requiredScripts = @(
    "scripts\run-backend.ps1",
    "scripts\run-frontend.ps1"
)

foreach ($script in $requiredScripts) {
    if (-not (Test-Path $script)) {
        Write-Host "Error: Required script not found: $script" -ForegroundColor Red
        exit 1
    }
}

Write-Host "Starting all services..." -ForegroundColor Yellow

# 启动后端服务
Write-Host "Starting backend service..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-ExecutionPolicy", "Bypass", "-File", "scripts\run-backend.ps1"
Start-Sleep -Seconds 3

# 启动前端服务
Write-Host "Starting frontend service..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-ExecutionPolicy", "Bypass", "-File", "scripts\run-frontend.ps1"
Start-Sleep -Seconds 3

Write-Host "All services are starting..." -ForegroundColor Green
Write-Host "Please wait for all services to be ready." -ForegroundColor Yellow
Write-Host "Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "Backend API: http://localhost:3002" -ForegroundColor Cyan
Write-Host "To stop all services, use task '5-Stop All Services'" -ForegroundColor Yellow
