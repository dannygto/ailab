# ============================================================================
# 人工智能辅助实验平台启动脚本（最终修复版）
# 解决乱码和Service Worker问题
# ============================================================================

# 设置输出编码为UTF-8，解决中文乱码
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

# 颜色输出函数
function Write-ColorText {
    param (
        [string]$Text,
        [string]$Color = "White"
    )
    Write-Host $Text -ForegroundColor $Color
}

# 确保当前目录是项目根目录
$projectRoot = $PSScriptRoot
Set-Location $projectRoot

Write-ColorText "====================================================" "Cyan"
Write-ColorText "       人工智能辅助实验平台启动脚本（最终修复版）      " "Green"
Write-ColorText "====================================================" "Cyan"

# 停止已存在的Node进程（端口3000, 3001, 3002）
Write-ColorText "正在检查端口占用情况..." "Yellow"
try {
    $ports = @(3000, 3001, 3002)
    foreach ($port in $ports) {
        $connections = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
        if ($connections) {
            foreach ($conn in $connections) {
                try {
                    $process = Get-Process -Id $conn.OwningProcess -ErrorAction SilentlyContinue
                    if ($process) {
                        Write-ColorText "  停止进程: $($process.ProcessName) (PID: $($process.Id), 端口: $port)" "Yellow"
                        Stop-Process -Id $process.Id -Force -ErrorAction SilentlyContinue
                    }
                } catch {}
            }
        } else {
            Write-ColorText "  端口 $port 空闲" "Green"
        }
    }
} catch {
    Write-ColorText "  检查端口时出错: $($_.Exception.Message)" "Red"
}

# 等待端口释放
Start-Sleep -Seconds 2

# 修复Service Worker问题 - 复制修复版Service Worker
Write-ColorText "正在应用Service Worker修复..." "Yellow"
try {
    if (Test-Path "frontend/public/sw-fixed.js") {
        Copy-Item -Path "frontend/public/sw-fixed.js" -Destination "frontend/public/sw.js" -Force
        Write-ColorText "  已应用Service Worker修复" "Green"
    } else {
        Write-ColorText "  未找到修复版Service Worker" "Red"
    }
} catch {
    Write-ColorText "  应用Service Worker修复失败: $($_.Exception.Message)" "Red"
}

# 检查目录结构
Write-ColorText "正在检查项目目录结构..." "Yellow"
$frontendExists = Test-Path "frontend"
$backendExists = Test-Path "backend"

if (-not $frontendExists) {
    Write-ColorText "  错误: 前端目录不存在!" "Red"
    exit 1
}

if (-not $backendExists) {
    Write-ColorText "  错误: 后端目录不存在!" "Red"
    exit 1
}

Write-ColorText "  项目目录结构正常" "Green"

# 显示服务信息
Write-ColorText "服务信息：" "Cyan"
Write-ColorText "  前端地址: http://localhost:3000" "White"
Write-ColorText "  后端地址: http://localhost:3002" "White"
Write-ColorText "  按 Ctrl+C 可停止所有服务" "Yellow"
Write-ColorText ""

# 使用临时脚本启动服务，避免参数传递问题
$tempScriptPath = "$env:TEMP\run-services-final-fix-$(Get-Random).ps1"

# 创建临时启动脚本
@"
# 临时启动脚本
# 设置输出编码为UTF-8，解决中文乱码
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

# 设置工作目录
Set-Location '$projectRoot'

# 执行concurrently命令，避免参数传递问题
npx concurrently --names "前端,后端" --prefix-colors "blue,green" --kill-others-on-fail "cd frontend && npm start" "cd backend && npm run dev"
"@ | Out-File -FilePath $tempScriptPath -Encoding utf8

try {
    # 执行临时脚本
    Write-ColorText "正在启动所有服务..." "Green"
    powershell -ExecutionPolicy Bypass -NoProfile -File $tempScriptPath
}
catch {
    Write-ColorText "启动服务时出错: $($_.Exception.Message)" "Red"
}
finally {
    # 清理临时脚本
    if (Test-Path $tempScriptPath) {
        Remove-Item $tempScriptPath -Force -ErrorAction SilentlyContinue
    }
}
