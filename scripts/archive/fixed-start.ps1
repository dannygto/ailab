# 修复后的平台启动脚本
# 设置编码为UTF-8，避免中文乱码
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "        AICAM平台 - 快速启动工具 (修复版)        " -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""

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

Write-Host "正在检查服务状态..." -ForegroundColor Cyan

# 检查并释放前端端口3000
$frontendPortFreed = Kill-Process-On-Port -Port 3000

# 检查并释放后端端口3002
$backendPortFreed = Kill-Process-On-Port -Port 3002

Write-Host "正在启动所有服务..." -ForegroundColor Cyan

# 检查端口是否已经成功释放
$frontendPortCheck = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
$backendPortCheck = Get-NetTCPConnection -LocalPort 3002 -ErrorAction SilentlyContinue

if ($frontendPortCheck -or $backendPortCheck) {
    Write-Host "警告：一些端口仍被占用。尝试再次强制释放所有端口..." -ForegroundColor Red
    
    if ($frontendPortCheck) {
        Kill-Process-On-Port -Port 3000
    }
    
    if ($backendPortCheck) {
        Kill-Process-On-Port -Port 3002
    }
    
    Start-Sleep -Seconds 2
}

try {
    # 检查是否安装了concurrently
    $concurrentlyInstalled = $null
    try {
        $concurrentlyInstalled = npx concurrently --version
        Write-Host "concurrently已安装: $concurrentlyInstalled" -ForegroundColor Green
    } catch {
        Write-Host "正在安装concurrently包..." -ForegroundColor Yellow
        npm install --no-save concurrently
        Write-Host "concurrently安装完成" -ForegroundColor Green
    }
    
    # 开始服务
    Write-Host "正在启动所有服务..." -ForegroundColor Green
    Write-Host "前端将在 http://localhost:3000 启动" -ForegroundColor Blue
    Write-Host "后端将在 http://localhost:3002 启动" -ForegroundColor Green
    Write-Host "请稍候，启动可能需要一些时间..." -ForegroundColor Yellow
    
    # 使用数组定义参数，避免引号和反引号的问题
    $concurrentlyArgs = @(
        "--names", "Frontend,Backend",
        "--prefix-colors", "blue,green",
        "--kill-others-on-fail",
        "--restart-tries", "2",
        "cd frontend && npm start",
        "cd backend && npm run dev"
    )
    
    # 执行命令
    npx concurrently $concurrentlyArgs
    
    Write-Host "服务已成功启动" -ForegroundColor Green
    
} catch {
    Write-Host "启动服务时出错: $_" -ForegroundColor Red
    Write-Host "尝试使用备用方法启动服务..." -ForegroundColor Yellow
    
    try {
        # 备用方法：使用PowerShell启动多个进程
        Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm start"
        Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; npm run dev"
        Write-Host "服务已在单独的窗口中启动" -ForegroundColor Green
    } catch {
        Write-Host "备用启动方法也失败: $_" -ForegroundColor Red
        Write-Host "请尝试手动启动服务" -ForegroundColor Yellow
        exit 1
    }
}
