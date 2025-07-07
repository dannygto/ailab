# ASCII兼容增强版启动脚本 - 解决终端乱码问题
# 版本: 1.1.0
# 日期: 2025-06-30
# 功能: 使用ASCII兼容字符输出，确保在所有终端环境中正确显示

# 强制设置UTF-8编码
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

# ASCII兼容的标题栏
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "        AICAM Platform - ASCII Compatible         " -ForegroundColor Cyan 
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""

# 使用ASCII兼容字符的函数
function Show-StartupBanner {
    Write-Host "Starting AICAM Platform..." -ForegroundColor Cyan
    Write-Host "* Platform Version: 1.0.0" -ForegroundColor Yellow
    Write-Host "* Mode: Development" -ForegroundColor Yellow
    Write-Host "* Services: Frontend + Backend" -ForegroundColor Yellow
    Write-Host ""
}

# 端口检查和释放函数
function Clear-Port {
    param (
        [int]$Port
    )
    
    try {
        Write-Host "Checking port $Port..." -ForegroundColor Yellow
        $connections = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
        
        if ($connections) {
            Write-Host "Port $Port is in use, attempting to release..." -ForegroundColor Yellow
            foreach ($conn in $connections) {
                $processId = $conn.OwningProcess
                try {
                    $process = Get-Process -Id $processId -ErrorAction SilentlyContinue
                    if ($process) {
                        $processName = $process.ProcessName
                        Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
                        Write-Host "Stopped process: $processName (PID: $processId)" -ForegroundColor Green
                    }
                } catch {
                    Write-Host "Could not stop PID: $processId, Error: $_" -ForegroundColor Red
                }
            }
            Start-Sleep -Seconds 2
        } else {
            Write-Host "Port $Port is available" -ForegroundColor Green
        }
    } catch {
        Write-Host "Error checking port: $_" -ForegroundColor Red
    }
}

# 显示启动横幅
Show-StartupBanner

# 检查和清理端口
Write-Host "Preparing environment..." -ForegroundColor Cyan
Write-Host "Checking port status..." -ForegroundColor Yellow
Clear-Port -Port 3000  # Frontend port
Clear-Port -Port 3002  # Backend port

# 确保工作目录在项目根目录
$scriptPath = $MyInvocation.MyCommand.Path
$scriptDir = Split-Path -Parent $scriptPath
Set-Location $scriptDir

# 确保依赖项已安装
function Ensure-Dependencies {
    try {
        # 检查concurrently
        $concurrentlyVersion = npx concurrently --version 2>$null
        if (-not $concurrentlyVersion) {
            Write-Host "Installing concurrently..." -ForegroundColor Yellow
            npm install --no-save concurrently
        } else {
            Write-Host "concurrently is installed: $concurrentlyVersion" -ForegroundColor Green
        }
        
        # 检查前端依赖
        if (-not (Test-Path "frontend/node_modules")) {
            Write-Host "Frontend dependencies not found, installing..." -ForegroundColor Yellow
            Push-Location frontend
            npm install
            Pop-Location
        } else {
            Write-Host "Frontend dependencies found" -ForegroundColor Green
        }
        
        # 检查后端依赖
        if (-not (Test-Path "backend/node_modules")) {
            Write-Host "Backend dependencies not found, installing..." -ForegroundColor Yellow
            Push-Location backend
            npm install
            Pop-Location
        } else {
            Write-Host "Backend dependencies found" -ForegroundColor Green
        }
    } catch {
        Write-Host "Error checking dependencies: $_" -ForegroundColor Red
        return $false
    }
    return $true
}

# 检查依赖项
$dependenciesOk = Ensure-Dependencies
if (-not $dependenciesOk) {
    Write-Host "Failed to verify or install dependencies. Please check the errors above." -ForegroundColor Red
    exit 1
}

# 创建临时启动脚本
$tempScriptPath = "$env:TEMP\aicam-ascii-start-$([Guid]::NewGuid().ToString()).ps1"
Write-Host "Creating temporary startup script: $tempScriptPath" -ForegroundColor Gray

$tempScript = @"
# AICAM Platform ASCII Compatible Startup Script
# Sets UTF-8 encoding and uses ASCII-compatible output
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
`$OutputEncoding = [System.Text.Encoding]::UTF8

# Set directory to project root
Set-Location "$scriptDir"

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "        AICAM Platform Services Starting...       " -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan

# Enable color in terminal
`$env:FORCE_COLOR = "1"

# Start services with concurrently
`$concurrentlyArgs = @(
    "--names",
    "Frontend,Backend",
    "--prefix-colors",
    "blue,green",
    "--kill-others-on-fail",
    "--restart-tries",
    "3",
    "cd frontend && npm start",
    "cd backend && npm run dev"
)

# Run the command directly
Write-Host "Starting all services..." -ForegroundColor Green
npx concurrently `$concurrentlyArgs

# Fallback if the above command fails
if (`$LASTEXITCODE -ne 0) {
    Write-Host "Using fallback method to start services..." -ForegroundColor Yellow
    Start-Process powershell -ArgumentList "-NoExit", "-NoProfile", "-Command", "Set-Location '$scriptDir/frontend'; npm start"
    Start-Process powershell -ArgumentList "-NoExit", "-NoProfile", "-Command", "Set-Location '$scriptDir/backend'; npm run dev"
}
"@

# 将临时脚本写入文件，确保UTF-8编码
$tempScript | Out-File -FilePath $tempScriptPath -Encoding utf8
Write-Host "Temporary startup script created" -ForegroundColor Green

# 启动临时脚本
Write-Host "Starting services, please wait..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-ExecutionPolicy", "Bypass", "-NoProfile", "-File", $tempScriptPath

# 显示访问信息
Write-Host ""
Write-Host "Services launched! You can access:" -ForegroundColor Green
Write-Host "- Frontend: http://localhost:3000" -ForegroundColor Blue
Write-Host "- Backend API: http://localhost:3002" -ForegroundColor Green
Write-Host "- API Health: http://localhost:3002/health" -ForegroundColor Green
Write-Host ""
Write-Host "To stop services, close the new terminal window or run the 'Stop All Services' task" -ForegroundColor Yellow
