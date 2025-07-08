# AICAM平台完整启动与健康检查脚本 (ASCII兼容版本)
# 此脚本用于一键启动AICAM平台的所有服务并立即检查健康状态

$ProgressPreference = 'SilentlyContinue'

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  AICAM Platform Auto Start & Health Check" -ForegroundColor Cyan
Write-Host "  AI-Assisted Experiment Platform" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# 设置工作目录为脚本所在目录
Set-Location $PSScriptRoot

# 首先停止所有现有服务，避免端口冲突
Write-Host "Step 1: Stopping all existing services..." -ForegroundColor Yellow
try {
    Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
    Get-NetTCPConnection -LocalPort 3000,3002 -ErrorAction SilentlyContinue | ForEach-Object {
        try {
            Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue
        } catch { }
    }
    Write-Host "✅ All existing services stopped" -ForegroundColor Green
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

Write-Host "Step 2: Starting all services..." -ForegroundColor Yellow

# 启动后端服务
Write-Host "Starting backend service..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-ExecutionPolicy", "Bypass", "-File", "scripts\run-backend.ps1"
Start-Sleep -Seconds 3

# 启动前端服务
Write-Host "Starting frontend service..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-ExecutionPolicy", "Bypass", "-File", "scripts\run-frontend.ps1"
Start-Sleep -Seconds 3

# 等待服务启动完成
Write-Host "Waiting for services to fully start..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

Write-Host ""
Write-Host "Step 3: Performing health check..." -ForegroundColor Yellow
Write-Host "=========================" -ForegroundColor Cyan
Write-Host ""

# Check Backend Service (Port 3002)
Write-Host "Checking Backend Service (Port 3002)..." -ForegroundColor Yellow
try {
    $backendResponse = Invoke-WebRequest -Uri "http://localhost:3002/health" -UseBasicParsing -TimeoutSec 3 -ErrorAction Stop
    Write-Host "✅ Backend Service: RUNNING (Status: $($backendResponse.StatusCode))" -ForegroundColor Green
} catch {
    Write-Host "❌ Backend Service: NOT RUNNING" -ForegroundColor Red
}

# Check Frontend Service (Port 3000)
Write-Host "Checking Frontend Service (Port 3000)..." -ForegroundColor Yellow
try {
    $frontendResponse = Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing -TimeoutSec 3 -ErrorAction Stop
    Write-Host "✅ Frontend Service: RUNNING (Status: $($frontendResponse.StatusCode))" -ForegroundColor Green
} catch {
    Write-Host "❌ Frontend Service: NOT RUNNING" -ForegroundColor Red
}

Write-Host ""

# Check Port Status
Write-Host "Port Status:" -ForegroundColor Yellow
$backendPort = Get-NetTCPConnection -LocalPort 3002 -ErrorAction SilentlyContinue
$frontendPort = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue

if ($backendPort) {
    Write-Host "✅ Port 3002 (Backend): ACTIVE" -ForegroundColor Green
} else {
    Write-Host "❌ Port 3002 (Backend): INACTIVE" -ForegroundColor Red
}

if ($frontendPort) {
    Write-Host "✅ Port 3000 (Frontend): ACTIVE" -ForegroundColor Green  
} else {
    Write-Host "❌ Port 3000 (Frontend): INACTIVE" -ForegroundColor Red
}

Write-Host ""

# System Summary
Write-Host "System Summary:" -ForegroundColor Cyan
Write-Host "===============" -ForegroundColor Cyan

$allHealthy = $true
$servicesStatus = @()

# Check services status
if ($backendPort) {
    $servicesStatus += "Backend Service: RUNNING"
} else {
    $servicesStatus += "Backend Service: NOT RUNNING"
    $allHealthy = $false
}

if ($frontendPort) {
    $servicesStatus += "Frontend Service: RUNNING"
} else {
    $servicesStatus += "Frontend Service: NOT RUNNING"
    $allHealthy = $false
}

foreach ($status in $servicesStatus) {
    Write-Host $status -ForegroundColor $(if ($status -like "*RUNNING*") { "Green" } else { "Red" })
}

if ($allHealthy) {
    Write-Host ""
    Write-Host "🎉 All services are healthy and ready!" -ForegroundColor Green
    Write-Host "Frontend URL: http://localhost:3000" -ForegroundColor Blue
    Write-Host "Backend API:  http://localhost:3002" -ForegroundColor Blue
} else {
    Write-Host ""
    Write-Host "⚠️  Some services are not running properly" -ForegroundColor Yellow
    Write-Host "Please check the logs for more details" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  AICAM Platform Start & Health Check Complete" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
