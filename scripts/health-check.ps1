# System Health Check Script

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "        AICAM平台系统健康检查                  " -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""

# 检查后端服务
Write-Host "【服务状态检查】" -ForegroundColor Yellow
try {
    $backendResponse = Invoke-WebRequest -Uri "http://localhost:3002/health" -UseBasicParsing -TimeoutSec 2 -ErrorAction Stop
    Write-Host "✅ 后端服务运行正常" -ForegroundColor Green
    Write-Host "   状态码: $($backendResponse.StatusCode)" -ForegroundColor Gray
    Write-Host "   响应: $($backendResponse.Content)" -ForegroundColor Gray
    
    # 尝试检查API版本
    try {
        $apiVersionResponse = Invoke-WebRequest -Uri "http://localhost:3002/api/version" -UseBasicParsing -TimeoutSec 2 -ErrorAction SilentlyContinue
        if ($apiVersionResponse.StatusCode -eq 200) {
            Write-Host "   API版本: $($apiVersionResponse.Content)" -ForegroundColor Gray
        }
    } catch {}
}
catch {
    Write-Host "❌ 后端服务未运行或不健康" -ForegroundColor Red
    Write-Host "   错误: $_" -ForegroundColor Red
}

# 检查前端服务
try {
    $frontend = Test-NetConnection -ComputerName localhost -Port 3000 -InformationLevel Quiet -ErrorAction Stop
    if ($frontend) {
        Write-Host "✅ 前端服务运行正常 (http://localhost:3000)" -ForegroundColor Green
        
        # 尝试获取前端页面
        try {
            $frontendResponse = Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing -TimeoutSec 2 -ErrorAction SilentlyContinue
            if ($frontendResponse.StatusCode -eq 200) {
                Write-Host "   状态码: $($frontendResponse.StatusCode)" -ForegroundColor Gray
                Write-Host "   页面大小: $([math]::Round($frontendResponse.RawContentLength / 1KB, 2)) KB" -ForegroundColor Gray
            }
        } catch {}
    }
    else {
        Write-Host "❌ 前端服务未运行" -ForegroundColor Red
    }
}
catch {
    Write-Host "❌ 前端服务检查失败" -ForegroundColor Red
    Write-Host "   错误: $_" -ForegroundColor Red
}

# 检查端口使用情况
Write-Host ""
Write-Host "【端口使用情况】" -ForegroundColor Yellow
$ports = @(3000, 3002)
foreach ($port in $ports) {
    $portCheck = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
    if ($portCheck) {
        foreach ($conn in $portCheck) {
            $process = Get-Process -Id $conn.OwningProcess -ErrorAction SilentlyContinue
            $processName = if ($process) { $process.Name } else { "未知进程" }
            Write-Host "✅ 端口 $port : 服务运行中 ($processName PID: $($conn.OwningProcess))" -ForegroundColor Green
        }
    } else {
        Write-Host "❌ 端口 $port : 服务未启动" -ForegroundColor Red
    }
}

# 检查系统资源
Write-Host ""
Write-Host "【系统资源状态】" -ForegroundColor Yellow
$cpuUsage = (Get-Counter '\Processor(_Total)\% Processor Time' -ErrorAction SilentlyContinue).CounterSamples.CookedValue
$memoryInfo = Get-CimInstance -ClassName Win32_OperatingSystem -ErrorAction SilentlyContinue
$diskInfo = Get-CimInstance -ClassName Win32_LogicalDisk -Filter "DeviceID='C:'" -ErrorAction SilentlyContinue

if ($cpuUsage) {
    $cpuUsageFormatted = [math]::Round($cpuUsage, 2)
    $cpuStatus = if($cpuUsageFormatted -gt 80) { "🔴 高" } elseif($cpuUsageFormatted -gt 60) { "🟡 中" } else { "🟢 低" }
    Write-Host "CPU 使用率: $cpuUsageFormatted% - $cpuStatus" -ForegroundColor $(if($cpuUsageFormatted -gt 80){"Red"}elseif($cpuUsageFormatted -gt 60){"Yellow"}else{"Green"})
}

if ($memoryInfo) {
    $totalMemoryGB = [math]::Round($memoryInfo.TotalVisibleMemorySize / 1MB, 2)
    $freeMemoryGB = [math]::Round($memoryInfo.FreePhysicalMemory / 1MB, 2)
    $usedMemoryPercent = [math]::Round(($totalMemoryGB - $freeMemoryGB) * 100 / $totalMemoryGB, 2)
    $memStatus = if($usedMemoryPercent -gt 80) { "🔴 高" } elseif($usedMemoryPercent -gt 60) { "🟡 中" } else { "🟢 低" }
    Write-Host "内存使用率: $usedMemoryPercent% - $memStatus" -ForegroundColor $(if($usedMemoryPercent -gt 80){"Red"}elseif($usedMemoryPercent -gt 60){"Yellow"}else{"Green"})
    Write-Host "  总内存: $totalMemoryGB GB" -ForegroundColor Gray
    Write-Host "  可用内存: $freeMemoryGB GB" -ForegroundColor Gray
}

if ($diskInfo) {
    $totalSpaceGB = [math]::Round($diskInfo.Size / 1GB, 2)
    $freeSpaceGB = [math]::Round($diskInfo.FreeSpace / 1GB, 2)
    $usedSpacePercent = [math]::Round(($totalSpaceGB - $freeSpaceGB) * 100 / $totalSpaceGB, 2)
    $diskStatus = if($usedSpacePercent -gt 80) { "🔴 高" } elseif($usedSpacePercent -gt 60) { "🟡 中" } else { "🟢 低" }
    Write-Host "磁盘使用率: $usedSpacePercent% - $diskStatus" -ForegroundColor $(if($usedSpacePercent -gt 80){"Red"}elseif($usedSpacePercent -gt 60){"Yellow"}else{"Green"})
    Write-Host "  总空间: $totalSpaceGB GB" -ForegroundColor Gray
    Write-Host "  可用空间: $freeSpaceGB GB" -ForegroundColor Gray
}

# 检查进程
Write-Host ""
Write-Host "【关键进程状态】" -ForegroundColor Yellow
$nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
if ($nodeProcesses) {
    Write-Host "发现 $($nodeProcesses.Count) 个Node.js进程:" -ForegroundColor Cyan
    foreach ($process in $nodeProcesses) {
        $memoryMB = [math]::Round($process.WorkingSet / 1MB, 2)
        Write-Host "  PID: $($process.Id), 内存: ${memoryMB}MB, 运行时间: $($process.StartTime)" -ForegroundColor Gray
    }
} else {
    Write-Host "未发现正在运行的Node.js进程" -ForegroundColor Yellow
}

# 健康检查摘要
Write-Host ""
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "健康检查摘要:" -ForegroundColor Cyan

$backendHealthy = $false
$frontendHealthy = $false

try {
    $backendHealth = Invoke-WebRequest -Uri "http://localhost:3002/health" -UseBasicParsing -TimeoutSec 1 -ErrorAction SilentlyContinue
    $backendHealthy = ($backendHealth.StatusCode -eq 200)
} catch {}

try {
    $frontendHealth = Test-NetConnection -ComputerName localhost -Port 3000 -InformationLevel Quiet -ErrorAction SilentlyContinue
    $frontendHealthy = $frontendHealth
} catch {}

Write-Host "前端服务: $(if ($frontendHealthy) { "✅ 正常" } else { "❌ 未运行" })" -ForegroundColor $(if ($frontendHealthy) { "Green" } else { "Red" })
Write-Host "后端服务: $(if ($backendHealthy) { "✅ 正常" } else { "❌ 未运行" })" -ForegroundColor $(if ($backendHealthy) { "Green" } else { "Red" })
Write-Host "系统资源: $(if (($cpuUsageFormatted -lt 80) -and ($usedMemoryPercent -lt 80) -and ($usedSpacePercent -lt 80)) { "✅ 正常" } else { "⚠️ 需注意" })" -ForegroundColor $(if (($cpuUsageFormatted -lt 80) -and ($usedMemoryPercent -lt 80) -and ($usedSpacePercent -lt 80)) { "Green" } else { "Yellow" })

# 操作建议
Write-Host ""
Write-Host "【操作建议】" -ForegroundColor Yellow
if (-not $backendHealthy -and -not $frontendHealthy) {
    Write-Host "• 请使用任务 '1-启动全部服务' 启动平台" -ForegroundColor Yellow
} elseif (-not $backendHealthy) {
    Write-Host "• 请使用任务 '3-启动后端' 启动后端服务" -ForegroundColor Yellow
} elseif (-not $frontendHealthy) {
    Write-Host "• 请使用任务 '2-启动前端' 启动前端服务" -ForegroundColor Yellow
}

if ($cpuUsageFormatted -gt 80 -or $usedMemoryPercent -gt 80) {
    Write-Host "• 系统资源占用较高，可能影响平台性能，建议关闭不必要的应用" -ForegroundColor Yellow
}

Write-Host "==================================================" -ForegroundColor Cyan

