# TCP/Socket模拟设备集成测试启动脚本 (简易版本)

Write-Host "========================================"
Write-Host "   TCP/Socket模拟设备集成测试启动脚本"
Write-Host "========================================"
Write-Host ""

# 运行测试脚本
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
