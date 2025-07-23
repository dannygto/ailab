# 运行设备数据存储服务测试的PowerShell脚本

# 设置控制台输出编码为UTF-8
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host "正在运行设备数据存储服务测试..." -ForegroundColor Cyan

# 检查并确保所需目录存在
$testDir = ".\src\backend\test"
$logsDir = ".\logs"

if (-not (Test-Path -Path $logsDir)) {
    New-Item -Path $logsDir -ItemType Directory | Out-Null
    Write-Host "创建日志目录: $logsDir" -ForegroundColor Yellow
}

# 设置日志文件路径
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$logFile = "$logsDir\device-data-storage-test-$timestamp.log"

Write-Host "测试日志将保存在: $logFile" -ForegroundColor Gray

# 检查TypeScript和ts-node是否已安装
$tsNodeInstalled = npm list -g ts-node 2>$null
if ($tsNodeInstalled -notmatch "ts-node") {
    Write-Host "正在全局安装ts-node..." -ForegroundColor Yellow
    npm install -g ts-node
}

# 确保进入正确的目录
Set-Location -Path (Get-Item -Path ".").FullName

try {
    # 编译TypeScript代码
    Write-Host "编译TypeScript代码..." -ForegroundColor Yellow

    # 使用ts-node运行测试脚本
    Write-Host "运行设备数据存储服务测试..." -ForegroundColor Green
    ts-node --project .\src\backend\tsconfig.json .\src\backend\test\device-data-storage-test.ts | Tee-Object -FilePath $logFile

    if ($LASTEXITCODE -eq 0) {
        Write-Host "`n✅ 设备数据存储服务测试成功完成!" -ForegroundColor Green
    } else {
        Write-Host "`n❌ 设备数据存储服务测试失败，退出代码: $LASTEXITCODE" -ForegroundColor Red
    }
} catch {
    Write-Host "`n❌ 执行测试时出错: $_" -ForegroundColor Red
    $_.Exception | Format-List -Force | Out-File -Append -FilePath $logFile
    exit 1
}

Write-Host "`n测试日志已保存到: $logFile" -ForegroundColor Cyan
Write-Host "请检查日志文件以获取详细信息。" -ForegroundColor Cyan
