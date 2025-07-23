# TCP/Socket设备模拟器启动脚本 (PowerShell版本)

Write-Host "========================================"
Write-Host "   TCP/Socket设备模拟器启动脚本"
Write-Host "========================================"
Write-Host ""

# 检查Node.js是否安装
try {
    $nodeVersion = node --version
    Write-Host "检测到Node.js: $nodeVersion"
}
catch {
    Write-Host "[错误] 未检测到Node.js，请安装Node.js后再运行此脚本" -ForegroundColor Red
    exit
}

# 检查模拟器文件是否存在
$simulatorDir = "$PSScriptRoot\simulator"
$simulatorScript = "$simulatorDir\start-all-simulators.js"

if (-not (Test-Path $simulatorScript)) {
    Write-Host "[错误] 未找到模拟器启动脚本: $simulatorScript" -ForegroundColor Red
    exit
}

# 检查chalk依赖
Write-Host "正在检查依赖..."
try {
    npm list chalk --prefix $simulatorDir | Out-Null
}
catch {
    Write-Host "正在安装chalk模块..."
    Push-Location $simulatorDir
    npm install chalk --no-fund --no-audit --loglevel=error
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[错误] 安装chalk模块失败" -ForegroundColor Red
        Pop-Location
        exit
    }
    Pop-Location
}

Write-Host ""
Write-Host "正在启动TCP/Socket设备模拟器..." -ForegroundColor Cyan
Write-Host ""

# 启动模拟器
node $simulatorScript

Write-Host ""
