# Final Clean Health Check Script
# Disable progress bars and clean output

# Disable all progress bars
$ProgressPreference = 'SilentlyContinue'

# Clear screen and set consistent output
Clear-Host

Write-Host "AICAM Platform Health Check" -ForegroundColor Cyan
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
Write-Host "=========================" -ForegroundColor Cyan
Write-Host "SYSTEM STATUS:" -ForegroundColor Cyan

if ($backendPort -and $frontendPort) {
    Write-Host "✅ All services are running normally" -ForegroundColor Green
    Write-Host "   Access: http://localhost:3000" -ForegroundColor Gray
} elseif ($backendPort -or $frontendPort) {
    Write-Host "⚠️  Some services are not running" -ForegroundColor Yellow
    if (-not $backendPort) { Write-Host "   • Backend service needs to be started" -ForegroundColor Yellow }
    if (-not $frontendPort) { Write-Host "   • Frontend service needs to be started" -ForegroundColor Yellow }
} else {
    Write-Host "❌ No services are running" -ForegroundColor Red
    Write-Host "   Use VS Code task '1-启动全部服务' to start all services" -ForegroundColor Yellow
}

Write-Host "=========================" -ForegroundColor Cyan
