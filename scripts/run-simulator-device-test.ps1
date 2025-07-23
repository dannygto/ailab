# TCP/Socket模拟设备集成测试启动脚本 (PowerShell版本)

Write-Host "========================================"
Write-Host "   TCP/Socket模拟设备集成测试启动脚本"
Write-Host "========================================"
Write-Host ""

# 确认是否先启动模拟器
$start_sim = Read-Host "此测试需要先启动设备模拟器。是否需要启动设备模拟器? (Y/N)"

if ($start_sim -eq "Y" -or $start_sim -eq "y") {
    # 启动模拟器
    Write-Host ""
    Write-Host "正在启动设备模拟器..."

    # 启动新进程运行模拟器
    Start-Process powershell -ArgumentList "-NoProfile -ExecutionPolicy Bypass -Command `"& '$PSScriptRoot\start-device-simulators.ps1'`""

    # 等待模拟器启动
    Write-Host "等待模拟器启动..."
    Start-Sleep -Seconds 5
}

# 运行测试脚本
Write-Host ""
Write-Host "正在编译并运行模拟设备集成测试..."
Write-Host ""

# 切换到项目根目录
Set-Location (Split-Path -Parent $PSScriptRoot)

# 编译测试脚本
npx tsc --esModuleInterop --skipLibCheck "$PSScriptRoot\simulator-device-test.ts"

if ($LASTEXITCODE -ne 0) {
    Write-Host "[错误] 编译测试脚本失败" -ForegroundColor Red
    exit
}

# 运行测试
node "$PSScriptRoot\simulator-device-test.js"

Write-Host ""
