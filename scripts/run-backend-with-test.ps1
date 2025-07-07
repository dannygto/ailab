# Run Backend and Test AI Script
# 设置编码为UTF-8，避免中文乱码
# 编码设置已优化

function Kill-Process-On-Port {
    param (
        [int]$Port
    )
    
    try {
        # 查找使用指定端口的连接
        $connections = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
        
        if ($connections) {
            foreach ($conn in $connections) {
                $processId = $conn.OwningProcess
                $process = Get-Process -Id $processId -ErrorAction SilentlyContinue
                
                if ($process) {
                    Write-Host "正在停止进程: $($process.Name) (ID: $processId) - 占用端口 $Port" -ForegroundColor Yellow
                    Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
                    Write-Host "进程已停止" -ForegroundColor Green
                }
            }
            # 确保端口完全释放
            Start-Sleep -Seconds 3
            
            # 再次检查端口是否已释放
            $stillInUse = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
            if ($stillInUse) {
                Write-Host "警告：端口 $Port 仍被占用，尝试更强制的方法关闭..." -ForegroundColor Red
                foreach ($conn in $stillInUse) {
                    $processId = $conn.OwningProcess
                    # 使用taskkill命令强制结束进程
                    & taskkill /F /PID $processId
                }
                Start-Sleep -Seconds 2
            }
        }
        
        # 最终检查
        $finalCheck = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
        if (-not $finalCheck) {
            Write-Host "端口 $Port 已成功释放" -ForegroundColor Green
            return $true
        } else {
            Write-Host "无法释放端口 $Port，请手动关闭占用该端口的应用程序" -ForegroundColor Red
            return $false
        }
    } catch {
        Write-Host "检查端口时发生错误: $_" -ForegroundColor Red
        return $false
    }
}

Write-Host "正在检查后端服务状态..." -ForegroundColor Cyan

# 检查并释放端口3002
$portFreed = Kill-Process-On-Port -Port 3002

Write-Host "正在启动后端服务和AI测试..." -ForegroundColor Cyan

# 检查端口是否已经成功释放
$portCheck = Get-NetTCPConnection -LocalPort 3002 -ErrorAction SilentlyContinue

if ($portCheck) {
    Write-Host "警告：端口3002仍被占用。尝试再次强制释放..." -ForegroundColor Red
    Kill-Process-On-Port -Port 3002
    Start-Sleep -Seconds 2
}

# Backend command
$backendCmd = "Set-Location $PSScriptRoot/../backend; npm run dev"

# Test command (delay 5 seconds before executing)
$testCmd = "Start-Sleep -Seconds 5; Set-Location $PSScriptRoot/..; node test-ai-complete.js"

try {
    # 1. 启动后端服务
    Write-Host "正在启动后端服务..." -ForegroundColor Green
    Write-Host "后端将在 http://localhost:3002 启动" -ForegroundColor Green
    
    # 将后端启动命令写入临时脚本
    $backendScriptPath = "$env:TEMP\run-backend-test-$([Guid]::NewGuid().ToString()).ps1"
    @"
Set-Location "$($PSScriptRoot)/../backend"
Write-Host "启动后端服务..." -ForegroundColor Green
npm run dev
"@ | Out-File -FilePath $backendScriptPath -Encoding utf8
    
    # 启动后端脚本
    Start-Process powershell -ArgumentList "-NoExit", "-ExecutionPolicy", "Bypass", "-File", $backendScriptPath
    
    Write-Host "后端服务启动命令已执行，请查看新打开的终端窗口" -ForegroundColor Green
    Write-Host "等待5秒后运行AI测试..." -ForegroundColor Yellow
    Start-Sleep -Seconds 5  # 等待后端启动
    
    # 2. 运行AI测试
    Write-Host "正在运行AI测试..." -ForegroundColor Cyan
    
    # 将AI测试命令写入临时脚本
    $testScriptPath = "$env:TEMP\run-ai-test-$([Guid]::NewGuid().ToString()).ps1"
    @"
Set-Location "$($PSScriptRoot)/.."
Write-Host "运行AI测试..." -ForegroundColor Cyan
node test-ai-complete.js
"@ | Out-File -FilePath $testScriptPath -Encoding utf8
    
    # 启动测试脚本
    Start-Process powershell -ArgumentList "-NoExit", "-ExecutionPolicy", "Bypass", "-File", $testScriptPath
    
    Write-Host "AI测试命令已执行，请查看新打开的终端窗口" -ForegroundColor Cyan
    Write-Host "如需停止服务，请使用任务 '5-停止所有服务'" -ForegroundColor Yellow
    
    # 返回到原始目录
    Set-Location $PSScriptRoot/..
} catch {
    Write-Host "启动服务或测试时出错: $_" -ForegroundColor Red
    Write-Host "请尝试先使用任务 '3-启动后端' 启动后端服务，然后使用任务 '4-测试AI服务' 运行测试" -ForegroundColor Yellow
}

