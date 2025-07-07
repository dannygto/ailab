# ============================================================================
# 人工智能辅助实验平台通用启动脚本（修复版）
# 解决concurrently参数传递问题和中文乱码问题
# ============================================================================

# 设置输出编码为UTF-8，解决中文乱码
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host "🚀 启动人工智能辅助实验平台服务..." -ForegroundColor Green

# 确保当前目录是项目根目录
$projectRoot = $PSScriptRoot
Set-Location $projectRoot

# 停止已存在的Node进程（端口3001, 3002）
Write-Host "🔌 正在检查端口占用情况..." -ForegroundColor Cyan
try {
    Get-NetTCPConnection -LocalPort 3001,3002 -ErrorAction SilentlyContinue | 
        ForEach-Object { 
            try {
                $process = Get-Process -Id $_.OwningProcess -ErrorAction SilentlyContinue
                if ($process) {
                    Write-Host "  ⚠️ 停止进程: $($process.ProcessName) (PID: $($process.Id), 端口: $($_.LocalPort))" -ForegroundColor Yellow
                    Stop-Process -Id $process.Id -Force -ErrorAction SilentlyContinue
                }
            } catch {}
        }
} catch {
    Write-Host "  ⚠️ 检查端口时出错: $($_.Exception.Message)" -ForegroundColor Yellow
}

# 等待端口释放
Start-Sleep -Seconds 2

# 检查并安装 concurrently（如果需要）
Write-Host "🔧 检查 concurrently 工具..." -ForegroundColor Blue
try {
    $null = npm list concurrently --depth=0 2>$null
    if ($LASTEXITCODE -ne 0) {
        Write-Host "📦 安装 concurrently..." -ForegroundColor Yellow
        npm install --save-dev concurrently --silent
    }
} catch {
    Write-Host "📦 安装 concurrently..." -ForegroundColor Yellow
    npm install --save-dev concurrently --silent
}

Write-Host "🌐 前端地址: http://localhost:3001" -ForegroundColor Cyan
Write-Host "🔧 后端地址: http://localhost:3002" -ForegroundColor Cyan
Write-Host "⚠️ 按 Ctrl+C 可停止所有服务" -ForegroundColor Yellow
Write-Host ""

# 启用颜色输出
$env:FORCE_COLOR = "1"

# 使用临时脚本绕过PowerShell的参数传递问题
$tempScriptPath = "$env:TEMP\run-services-$(Get-Random).ps1"

@"
# 临时脚本 - 启动所有服务
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
Set-Location '$projectRoot'

# 直接执行命令，避免参数传递问题
npx concurrently `
    --names "🎨前端,⚙️后端" `
    --prefix-colors "blue,green" `
    --kill-others-on-fail `
    --restart-tries 3 `
    "cd frontend && npm start" `
    "cd backend && npm run dev"
"@ | Out-File -FilePath $tempScriptPath -Encoding utf8

try {
    # 执行临时脚本
    powershell -ExecutionPolicy Bypass -NoProfile -File $tempScriptPath
}
catch {
    Write-Host "× 启动服务时出错: $($_.Exception.Message)" -ForegroundColor Red
}
finally {
    # 清理临时脚本
    if (Test-Path $tempScriptPath) {
        Remove-Item $tempScriptPath -Force -ErrorAction SilentlyContinue
    }
}
