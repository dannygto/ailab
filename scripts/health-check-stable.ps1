# Stable Health Check Script
# Avoid output buffering issues

# Set consistent encoding
$OutputEncoding = [System.Text.Encoding]::UTF8

# Clear any existing output
Clear-Host

Write-Host ""
Write-Host "AICAM Platform Health Check" -ForegroundColor Cyan
Write-Host "=========================" -ForegroundColor Cyan
Write-Host ""

# Check Backend Service
Write-Host "Checking Backend Service..." -ForegroundColor Yellow
try {
    $backendResponse = Invoke-WebRequest -Uri "http://localhost:3002/health" -UseBasicParsing -TimeoutSec 5 -ErrorAction Stop
    if ($backendResponse.StatusCode -eq 200) {
        Write-Host "✅ Backend Service: RUNNING" -ForegroundColor Green
    } else {
        Write-Host "❌ Backend Service: ERROR (Status: $($backendResponse.StatusCode))" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Backend Service: NOT RUNNING" -ForegroundColor Red
}

Write-Host ""

# Check Frontend Service
Write-Host "Checking Frontend Service..." -ForegroundColor Yellow
try {
    $frontendResponse = Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing -TimeoutSec 5 -ErrorAction Stop
    if ($frontendResponse.StatusCode -eq 200) {
        Write-Host "✅ Frontend Service: RUNNING" -ForegroundColor Green
    } else {
        Write-Host "❌ Frontend Service: ERROR (Status: $($frontendResponse.StatusCode))" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Frontend Service: NOT RUNNING" -ForegroundColor Red
}

Write-Host ""

# Check Ports
Write-Host "Checking Ports..." -ForegroundColor Yellow
$ports = @(3000, 3002)
$portNames = @{3000 = "Frontend"; 3002 = "Backend"}

foreach ($port in $ports) {
    $connection = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
    $serviceName = $portNames[$port]
    
    if ($connection) {
        Write-Host "✅ Port $port ($serviceName): ACTIVE" -ForegroundColor Green
    } else {
        Write-Host "❌ Port $port ($serviceName): INACTIVE" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "Health check completed" -ForegroundColor Cyan
Write-Host ""

# Summary
Write-Host "=========================" -ForegroundColor Cyan
Write-Host "SUMMARY:" -ForegroundColor Cyan

$backendPort = Get-NetTCPConnection -LocalPort 3002 -ErrorAction SilentlyContinue
$frontendPort = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue

if ($backendPort -and $frontendPort) {
    Write-Host "✅ All services are running normally" -ForegroundColor Green
} elseif ($backendPort -or $frontendPort) {
    Write-Host "⚠️  Some services are not running" -ForegroundColor Yellow
} else {
    Write-Host "❌ No services are running" -ForegroundColor Red
    Write-Host "   Run task '1-启动全部服务' to start services" -ForegroundColor Yellow
}

Write-Host "=========================" -ForegroundColor Cyan
Write-Host ""
