# Run Frontend Service Script
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

Write-Host "正在检查前端服务状态..." -ForegroundColor Cyan

# 检查端口3000是否被占用并尝试释放
$portFreed = Kill-Process-On-Port -Port 3000

Write-Host "正在启动前端服务..." -ForegroundColor Blue

# 当端口成功释放或没有被占用时才启动服务
$maxRetries = 3
$retryCount = 0
$success = $false

while (-not $success -and $retryCount -lt $maxRetries) {
    try {
        # Set working directory
        Set-Location $PSScriptRoot/../frontend
        
        # 检查一次端口状态
        $portCheck = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
        if ($portCheck) {
            Write-Host "警告：端口3000仍被占用，尝试再次释放..." -ForegroundColor Yellow
            Kill-Process-On-Port -Port 3000
            Start-Sleep -Seconds 2
        }
        
        Write-Host "正在启动前端服务 (尝试 $($retryCount + 1)/$maxRetries)..." -ForegroundColor Cyan
        Write-Host "前端将在 http://localhost:3000 启动" -ForegroundColor Blue
        Write-Host "请稍候，启动可能需要一些时间..." -ForegroundColor Yellow
        
        # 将启动命令写入临时脚本
        $tempScriptPath = "$env:TEMP\run-frontend-$([Guid]::NewGuid().ToString()).ps1"
        @"
Set-Location "$($PSScriptRoot)/../frontend"
Write-Host "启动前端服务..." -ForegroundColor Blue
npm start
"@ | Out-File -FilePath $tempScriptPath -Encoding utf8
        
        # 启动脚本
        Start-Process powershell -ArgumentList "-NoExit", "-ExecutionPolicy", "Bypass", "-File", $tempScriptPath
        
        Write-Host "前端服务启动命令已执行，请查看新打开的终端窗口" -ForegroundColor Green
        Write-Host "如需停止服务，请使用任务 '5-停止所有服务'" -ForegroundColor Yellow
        $success = $true
        
        # 返回到原始目录
        Set-Location $PSScriptRoot/..
    } catch {
        $retryCount++
        if ($retryCount -lt $maxRetries) {
            Write-Host "启动失败，将在3秒后重试... 错误: $_" -ForegroundColor Red
            Start-Sleep -Seconds 3
        } else {
            Write-Host "达到最大重试次数，启动失败。请手动检查端口占用情况。" -ForegroundColor Red
            Write-Host "可以尝试执行 '5-停止所有服务' 任务后再重试。" -ForegroundColor Yellow
        }
    }
}

