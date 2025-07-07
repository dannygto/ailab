# Install All Dependencies Script
# 设置编码为UTF-8，避免中文乱码
# 编码设置已优化

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "        AICAM平台 - 安装所有依赖              " -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""

# Save current directory
$currentDir = Get-Location

function Install-Package {
    param (
        [string]$Location,
        [string]$Description,
        [string]$Color
    )
    
    try {
        Write-Host "正在安装${Description}依赖..." -ForegroundColor $Color
        Set-Location $Location
        npm install
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ ${Description}依赖安装成功" -ForegroundColor Green
        } else {
            Write-Host "❌ ${Description}依赖安装失败，错误代码: $LASTEXITCODE" -ForegroundColor Red
            return $false
        }
    } catch {
        Write-Host "❌ ${Description}依赖安装过程中出错: $_" -ForegroundColor Red
        return $false
    }
    return $true
}

# 检查Node.js和npm版本
try {
    $nodeVersion = node -v
    $npmVersion = npm -v
    Write-Host "Node.js版本: $nodeVersion" -ForegroundColor Green
    Write-Host "npm版本: $npmVersion" -ForegroundColor Green
    Write-Host ""
} catch {
    Write-Host "❌ 未检测到Node.js或npm，请确保已安装Node.js环境" -ForegroundColor Red
    exit 1
}

# 安装根目录依赖
$rootSuccess = Install-Package -Location $PSScriptRoot/.. -Description "根目录" -Color "Cyan"

# 安装前端依赖
$frontendSuccess = Install-Package -Location "$PSScriptRoot/../frontend" -Description "前端" -Color "Blue"

# 安装后端依赖
$backendSuccess = Install-Package -Location "$PSScriptRoot/../backend" -Description "后端" -Color "Green"

# 检查Python环境并安装AI服务依赖
$pythonPath = $null
try {
    $pythonPath = python -c "import sys; print(sys.executable)" 2>$null
} catch {
    try {
        $pythonPath = python3 -c "import sys; print(sys.executable)" 2>$null
    } catch {
        Write-Host "⚠️ 未检测到Python环境，跳过AI服务依赖安装" -ForegroundColor Yellow
    }
}

$aiSuccess = $true
if ($pythonPath) {
    Write-Host "检测到Python环境: $pythonPath" -ForegroundColor Green
    try {
        Write-Host "正在安装AI服务依赖..." -ForegroundColor Magenta
        Set-Location "$PSScriptRoot/../ai"
        if (Test-Path "requirements.txt") {
            python -m pip install -r requirements.txt
            if ($LASTEXITCODE -eq 0) {
                Write-Host "✅ AI服务依赖安装成功" -ForegroundColor Green
            } else {
                Write-Host "❌ AI服务依赖安装失败，错误代码: $LASTEXITCODE" -ForegroundColor Red
                $aiSuccess = $false
            }
        } else {
            Write-Host "⚠️ 未找到AI服务依赖文件(requirements.txt)" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "❌ AI服务依赖安装过程中出错: $_" -ForegroundColor Red
        $aiSuccess = $false
    }
}

# 安装全局工具
try {
    Write-Host "正在安装全局工具(concurrently)..." -ForegroundColor Yellow
    npm install -g concurrently
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ 全局工具安装成功" -ForegroundColor Green
    } else {
        Write-Host "⚠️ 全局工具安装失败，将在需要时临时安装" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠️ 全局工具安装过程中出错: $_" -ForegroundColor Yellow
}

# Return to original directory
Set-Location $currentDir

Write-Host ""
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "依赖安装总结:" -ForegroundColor Cyan
Write-Host "根目录依赖: $(if ($rootSuccess) { "✅ 成功" } else { "❌ 失败" })" -ForegroundColor $(if ($rootSuccess) { "Green" } else { "Red" })
Write-Host "前端依赖: $(if ($frontendSuccess) { "✅ 成功" } else { "❌ 失败" })" -ForegroundColor $(if ($frontendSuccess) { "Green" } else { "Red" })
Write-Host "后端依赖: $(if ($backendSuccess) { "✅ 成功" } else { "❌ 失败" })" -ForegroundColor $(if ($backendSuccess) { "Green" } else { "Red" })
Write-Host "AI服务依赖: $(if ($aiSuccess) { "✅ 成功" } else { "⚠️ 警告" })" -ForegroundColor $(if ($aiSuccess) { "Green" } else { "Yellow" })
Write-Host "==================================================" -ForegroundColor Cyan

if ($rootSuccess -and $frontendSuccess -and $backendSuccess) {
    Write-Host "✅ 所有核心依赖安装完成！您现在可以启动AICAM平台了。" -ForegroundColor Green
    Write-Host "   使用任务 '1-启动全部服务' 启动平台" -ForegroundColor Green
} else {
    Write-Host "⚠️ 一些依赖安装失败，请检查错误信息并重试。" -ForegroundColor Red
}

