# System Check Script
# 设置编码为UTF-8，避免中文乱码
# 编码设置已优化

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "        AICAM平台 - 系统状态检查工具           " -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""

# 检查环境
function Check-Environment {
    Write-Host "正在检查环境..." -ForegroundColor Yellow
    
    # 检查Node.js
    try {
        $nodeVersion = node -v
        Write-Host "✅ Node.js版本: $nodeVersion" -ForegroundColor Green
    } catch {
        Write-Host "❌ Node.js未安装或不在PATH中" -ForegroundColor Red
    }
    
    # 检查npm
    try {
        $npmVersion = npm -v
        Write-Host "✅ npm版本: $npmVersion" -ForegroundColor Green
    } catch {
        Write-Host "❌ npm未安装或不在PATH中" -ForegroundColor Red
    }
    
    # 检查Python
    try {
        $pythonVersion = python --version 2>&1
        Write-Host "✅ Python版本: $pythonVersion" -ForegroundColor Green
    } catch {
        try {
            $pythonVersion = python3 --version 2>&1
            Write-Host "✅ Python版本: $pythonVersion" -ForegroundColor Green
        } catch {
            Write-Host "⚠️ Python未安装或不在PATH中(AI服务可能无法运行)" -ForegroundColor Yellow
        }
    }
    
    # 检查操作系统
    $osInfo = Get-CimInstance -ClassName Win32_OperatingSystem
    Write-Host "✅ 操作系统: $($osInfo.Caption) $($osInfo.Version)" -ForegroundColor Green
    
    # 检查可用内存
    $totalMemoryGB = [math]::Round($osInfo.TotalVisibleMemorySize / 1MB, 2)
    $freeMemoryGB = [math]::Round($osInfo.FreePhysicalMemory / 1MB, 2)
    $memoryUsagePercent = [math]::Round(($totalMemoryGB - $freeMemoryGB) / $totalMemoryGB * 100, 2)
    
    Write-Host "✅ 系统内存: 总计 ${totalMemoryGB}GB, 可用 ${freeMemoryGB}GB (使用率: ${memoryUsagePercent}%)" -ForegroundColor $(if ($memoryUsagePercent -gt 90) { "Red" } elseif ($memoryUsagePercent -gt 70) { "Yellow" } else { "Green" })
    
    # 检查CPU使用率
    $cpuUsage = Get-CimInstance -ClassName Win32_Processor | Measure-Object -Property LoadPercentage -Average | Select-Object -ExpandProperty Average
    Write-Host "✅ CPU使用率: ${cpuUsage}%" -ForegroundColor $(if ($cpuUsage -gt 90) { "Red" } elseif ($cpuUsage -gt 70) { "Yellow" } else { "Green" })
}

# 检查服务状态
function Check-Services {
    Write-Host ""
    Write-Host "正在检查服务状态..." -ForegroundColor Yellow
    
    # 检查后端服务
    try {
        $backendResponse = Invoke-WebRequest -Uri "http://localhost:3002/health" -UseBasicParsing -TimeoutSec 2 -ErrorAction Stop
        Write-Host "✅ 后端服务运行正常" -ForegroundColor Green
        Write-Host "   状态: $($backendResponse.Content)" -ForegroundColor Gray
    } catch {
        Write-Host "❌ 后端服务未运行或不健康" -ForegroundColor Red
    }
    
    # 检查前端服务
    try {
        $frontend = Test-NetConnection -ComputerName localhost -Port 3000 -InformationLevel Quiet -ErrorAction Stop
        if ($frontend) {
            Write-Host "✅ 前端服务运行正常" -ForegroundColor Green
        } else {
            Write-Host "❌ 前端服务未运行" -ForegroundColor Red
        }
    } catch {
        Write-Host "❌ 前端服务未运行" -ForegroundColor Red
    }
    
    # 检查端口占用情况
    $ports = @(3000, 3002)
    foreach ($port in $ports) {
        $portUsage = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
        if ($portUsage) {
            $process = Get-Process -Id $portUsage.OwningProcess -ErrorAction SilentlyContinue
            Write-Host "ℹ️ 端口 $port 被进程 $($process.Name) (PID: $($portUsage.OwningProcess)) 占用" -ForegroundColor Cyan
        } else {
            Write-Host "ℹ️ 端口 $port 空闲" -ForegroundColor Gray
        }
    }
}

# 检查项目文件状态
function Check-Files {
    Write-Host ""
    Write-Host "正在检查项目文件..." -ForegroundColor Yellow
    
    # 检查关键目录
    $directories = @("frontend", "backend", "ai", "scripts")
    foreach ($dir in $directories) {
        if (Test-Path "$PSScriptRoot/$dir") {
            Write-Host "✅ 目录 $dir 存在" -ForegroundColor Green
        } else {
            Write-Host "❌ 目录 $dir 不存在" -ForegroundColor Red
        }
    }
    
    # 检查关键文件
    $files = @(
        "package.json",
        "frontend/package.json",
        "backend/package.json",
        "ai/requirements.txt",
        "scripts/run-all-services.ps1",
        "scripts/run-frontend.ps1",
        "scripts/run-backend.ps1"
    )
    
    foreach ($file in $files) {
        if (Test-Path "$PSScriptRoot/$file") {
            Write-Host "✅ 文件 $file 存在" -ForegroundColor Green
        } else {
            Write-Host "❌ 文件 $file 不存在" -ForegroundColor Red
        }
    }
    
    # 检查node_modules
    $nodeModulesPaths = @(
        "node_modules",
        "frontend/node_modules",
        "backend/node_modules"
    )
    
    foreach ($path in $nodeModulesPaths) {
        if (Test-Path "$PSScriptRoot/$path") {
            Write-Host "✅ 依赖目录 $path 已安装" -ForegroundColor Green
        } else {
            Write-Host "⚠️ 依赖目录 $path 未安装" -ForegroundColor Yellow
        }
    }
}

# 执行检查
Check-Environment
Check-Services
Check-Files

Write-Host ""
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "系统状态检查完成！" -ForegroundColor Cyan

# 提供建议
Write-Host ""
Write-Host "建议操作:" -ForegroundColor Yellow
if (-not (Test-Path "$PSScriptRoot/frontend/node_modules") -or -not (Test-Path "$PSScriptRoot/backend/node_modules")) {
    Write-Host "• 运行任务 '7-安装所有依赖' 安装所需依赖包" -ForegroundColor Yellow
}

$backendRunning = $null
try {
    $backendRunning = Invoke-WebRequest -Uri "http://localhost:3002/health" -UseBasicParsing -TimeoutSec 1 -ErrorAction SilentlyContinue
} catch {}

$frontendRunning = Test-NetConnection -ComputerName localhost -Port 3000 -InformationLevel Quiet -ErrorAction SilentlyContinue

if (-not $backendRunning -and -not $frontendRunning) {
    Write-Host "• 运行任务 '1-启动全部服务' 启动前端和后端服务" -ForegroundColor Yellow
} elseif (-not $backendRunning) {
    Write-Host "• 运行任务 '3-启动后端' 启动后端服务" -ForegroundColor Yellow
} elseif (-not $frontendRunning) {
    Write-Host "• 运行任务 '2-启动前端' 启动前端服务" -ForegroundColor Yellow
}

Write-Host "• 若遇到端口占用问题，请运行任务 '5-停止所有服务' 后再重试" -ForegroundColor Yellow
Write-Host "==================================================" -ForegroundColor Cyan

try {
    $frontend = Test-NetConnection -ComputerName localhost -Port 3000 -InformationLevel Quiet
    if ($frontend) {
        Write-Host "Frontend service is running" -ForegroundColor Green
    } else {
        Write-Host "Frontend service is not running" -ForegroundColor Red
    }
} catch {
    Write-Host "Frontend service check failed" -ForegroundColor Red
}

# Check environment file
Write-Host ""
Write-Host "Environment configuration check:" -ForegroundColor Cyan
if (Test-Path -Path ".env") {
    Write-Host ".env file exists" -ForegroundColor Green
    $envContent = Get-Content .env -Raw
    if ($envContent -match "ARK_API_KEY=") {
        Write-Host "ARK API key is configured" -ForegroundColor Green
    } else {
        Write-Host "ARK API key is not configured" -ForegroundColor Yellow
    }
    if ($envContent -match "DEEPSEEK_API_KEY=") {
        Write-Host "DeepSeek API key is configured" -ForegroundColor Green
    } else {
        Write-Host "DeepSeek API key is not configured" -ForegroundColor Yellow
    }
} else {
    Write-Host ".env file does not exist" -ForegroundColor Red
    Write-Host "  Tip: Run '11-Configure AI Keys' task to create environment configuration" -ForegroundColor Yellow
}

# Check project directories
Write-Host ""
Write-Host "Project structure check:" -ForegroundColor Cyan
$directories = @("frontend", "backend", "ai")
foreach ($dir in $directories) {
    if (Test-Path -Path $dir -PathType Container) {
        Write-Host "$dir directory exists" -ForegroundColor Green
        
        # Check package.json
        if ($dir -ne "ai" -and (Test-Path -Path "$dir/package.json")) {
            Write-Host "  $dir/package.json exists" -ForegroundColor Green
            
            # Check node_modules
            if (Test-Path -Path "$dir/node_modules") {
                Write-Host "  $dir/node_modules exists" -ForegroundColor Green
            } else {
                Write-Host "  $dir/node_modules does not exist" -ForegroundColor Yellow
                Write-Host "    Tip: Run '7-Install All Dependencies' task to install dependencies" -ForegroundColor Yellow
            }
        } elseif ($dir -eq "ai" -and (Test-Path -Path "$dir/requirements.txt")) {
            Write-Host "  $dir/requirements.txt exists" -ForegroundColor Green
        }
    } else {
        Write-Host "$dir directory does not exist" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "System check complete!" -ForegroundColor Cyan
Read-Host "Press Enter to continue"

