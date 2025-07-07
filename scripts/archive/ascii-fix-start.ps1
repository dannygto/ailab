# =================================================================
# AI Experiment Platform Final Fix Start Script
# Resolves encoding issues by using only ASCII characters
# =================================================================

# Set UTF-8 encoding for both input and output
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

# Project root directory
$projectRoot = $PSScriptRoot
Set-Location $projectRoot

# Display header
Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host "       AI Experiment Platform - Final Fix Script      " -ForegroundColor Green
Write-Host "=====================================================" -ForegroundColor Cyan

# Check and release ports
Write-Host "Checking ports usage..." -ForegroundColor Yellow
try {
    $ports = @(3000, 3001, 3002)
    foreach ($port in $ports) {
        $connections = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
        if ($connections) {
            foreach ($conn in $connections) {
                try {
                    $process = Get-Process -Id $conn.OwningProcess -ErrorAction SilentlyContinue
                    if ($process) {
                        Write-Host "  Stopping process: $($process.ProcessName) (PID: $($process.Id), Port: $port)" -ForegroundColor Yellow
                        Stop-Process -Id $process.Id -Force -ErrorAction SilentlyContinue
                    }
                } catch {}
            }
        } else {
            Write-Host "  Port $port is free" -ForegroundColor Green
        }
    }
} catch {
    Write-Host "  Error checking ports: $($_.Exception.Message)" -ForegroundColor Red
}

# Wait for ports to be released
Start-Sleep -Seconds 2

# Fix Service Worker issues
Write-Host "Applying Service Worker fixes..." -ForegroundColor Yellow
try {
    # Create simplified Service Worker
    @'
// Simplified Service Worker - minimizes console errors
const CACHE_NAME = 'ai-experiment-platform-v1.0.4';

// Simplified installation event
self.addEventListener('install', (event) => {
  console.log('[SW] Installing simplified Service Worker v1.0.4');
  self.skipWaiting();
});

// Simplified activation event
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating simplified Service Worker');
  event.waitUntil(self.clients.claim());
});

// Bypass all fetch events to prevent network errors
self.addEventListener('fetch', (event) => {
  // Complete bypass - no interception
  return;
});

console.log('[SW] Simplified Service Worker loaded');
'@ | Out-File -FilePath "frontend/public/sw.js" -Encoding UTF8
    Write-Host "  Simplified Service Worker created" -ForegroundColor Green
} catch {
    Write-Host "  Failed to apply Service Worker fix: $($_.Exception.Message)" -ForegroundColor Red
}

# Check project structure
Write-Host "Checking project structure..." -ForegroundColor Yellow
$frontendExists = Test-Path "frontend"
$backendExists = Test-Path "backend"

if (-not $frontendExists) {
    Write-Host "  Error: Frontend directory missing!" -ForegroundColor Red
    exit 1
}

if (-not $backendExists) {
    Write-Host "  Error: Backend directory missing!" -ForegroundColor Red
    exit 1
}

Write-Host "  Project structure verified" -ForegroundColor Green

# Display service information
Write-Host "Service Information:" -ForegroundColor Cyan
Write-Host "  Frontend URL: http://localhost:3000" -ForegroundColor White
Write-Host "  Backend URL: http://localhost:3002" -ForegroundColor White
Write-Host "  Press Ctrl+C to stop all services" -ForegroundColor Yellow
Write-Host ""

# Create temporary script to run services
$tempScriptPath = "$env:TEMP\run-services-ascii-$(Get-Random).ps1"

# Create ASCII-only temporary script
@"
# Temporary startup script
# Set UTF-8 encoding for both input and output
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
`$OutputEncoding = [System.Text.Encoding]::UTF8

# Set working directory
Set-Location '$projectRoot'

# Run concurrently with ASCII-only parameters
npx concurrently --names "Frontend,Backend" --prefix-colors "blue,green" --kill-others-on-fail "cd frontend && npm start" "cd backend && npm run dev"
"@ | Out-File -FilePath $tempScriptPath -Encoding UTF8

try {
    # Execute temporary script
    Write-Host "Starting all services..." -ForegroundColor Green
    powershell -ExecutionPolicy Bypass -NoProfile -File $tempScriptPath
}
catch {
    Write-Host "Error starting services: $($_.Exception.Message)" -ForegroundColor Red
}
finally {
    # Clean up temporary script
    if (Test-Path $tempScriptPath) {
        Remove-Item $tempScriptPath -Force -ErrorAction SilentlyContinue
    }
}
