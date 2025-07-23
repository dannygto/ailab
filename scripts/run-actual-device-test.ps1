# PowerShell实际设备测试脚本
# 用于运行实际设备集成测试

# 设置脚本变量
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ConfigDir = Join-Path (Split-Path -Parent $ScriptDir) "config\devices"
$ReportDir = Join-Path (Split-Path -Parent $ScriptDir) "reports"
$LogsDir = Join-Path (Split-Path -Parent $ScriptDir) "logs\device-tests"

# 显示标题
Write-Host "======================================"
Write-Host "    实际设备测试工具启动器 v2.0    " -ForegroundColor Cyan
Write-Host "======================================"
Write-Host "       $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
Write-Host "======================================"

# 确保目录存在
if (-not (Test-Path $ReportDir)) {
    New-Item -ItemType Directory -Path $ReportDir | Out-Null
    Write-Host "创建报告目录: $ReportDir" -ForegroundColor Gray
}

if (-not (Test-Path $LogsDir)) {
    New-Item -ItemType Directory -Path $LogsDir | Out-Null
    Write-Host "创建日志目录: $LogsDir" -ForegroundColor Gray
}

# 列出可用的设备配置
Write-Host "`n可用的设备配置文件:" -ForegroundColor Yellow
Write-Host "-------------------"
$configFiles = Get-ChildItem -Path $ConfigDir -Filter "*.json"
$i = 1
$fileDict = @{}

foreach ($file in $configFiles) {
    # 读取配置文件获取设备名称和类型
    try {
        $deviceConfig = Get-Content -Path $file.FullName -Raw | ConvertFrom-Json
        $deviceName = $deviceConfig.deviceName
        $deviceType = $deviceConfig.deviceType
        Write-Host "$i. $($file.BaseName) - $deviceName ($deviceType)" -ForegroundColor White
    } catch {
        Write-Host "$i. $($file.BaseName) - [配置文件读取错误]" -ForegroundColor Red
    }
    $fileDict[$i] = $file.FullName
    $i++
}

# 获取用户选择
Write-Host ""
[int]$choice = Read-Host "请选择要测试的设备配置 (1-$($i-1))"

# 验证输入
if (-not $fileDict.ContainsKey($choice)) {
    Write-Host "无效的选择。" -ForegroundColor Red
    exit
}

$selectedFile = $fileDict[$choice]

# 读取所选配置文件信息
try {
    $deviceConfig = Get-Content -Path $selectedFile -Raw | ConvertFrom-Json
    $deviceName = $deviceConfig.deviceName
    $deviceType = $deviceConfig.deviceType
    $deviceManufacturer = $deviceConfig.manufacturer

    Write-Host "`n已选择设备: $deviceName" -ForegroundColor Green
    Write-Host "类型: $deviceType" -ForegroundColor Green
    Write-Host "制造商: $deviceManufacturer" -ForegroundColor Green
    Write-Host "配置文件: $selectedFile" -ForegroundColor Gray
} catch {
    Write-Host "`n无法解析配置文件: $_" -ForegroundColor Red
    Write-Host "配置文件: $selectedFile" -ForegroundColor Gray
}

# 选择测试模式
Write-Host "`n测试模式:" -ForegroundColor Yellow
Write-Host "1. 标准测试 - 执行所有基本命令测试"
Write-Host "2. 交互模式 - 允许手动发送命令"
Write-Host "3. 稳定性测试 - 长时间运行以测试稳定性"
Write-Host "4. 性能测试 - 测试设备响应性能"
Write-Host "5. 错误处理测试 - 测试设备对错误命令的处理"
[int]$modeChoice = Read-Host "`n请选择测试模式 (1-5)"

$testMode = "standard"
$testArgs = ""

switch ($modeChoice) {
    1 { $testMode = "standard"; $testDuration = 0 }
    2 { $testMode = "interactive"; $testDuration = 0 }
    3 {
        $testMode = "stability"
        [int]$testDuration = Read-Host "请输入测试持续时间(分钟)"
        $testArgs = "--duration=$testDuration"
    }
    4 {
        $testMode = "performance"
        [int]$testDuration = Read-Host "请输入测试持续时间(分钟)"
        $testArgs = "--duration=$testDuration"
    }
    5 { $testMode = "error"; $testDuration = 0 }
    default {
        Write-Host "无效的选择，使用标准测试模式。" -ForegroundColor Yellow
        $testMode = "standard"
        $testDuration = 0
    }
}

# 设置详细输出
$verboseOutput = $false
$verboseChoice = Read-Host "`n是否启用详细输出? (Y/N)"
if ($verboseChoice -eq "Y" -or $verboseChoice -eq "y") {
    $verboseOutput = $true
    $testArgs += " --verbose=true"
}

# 确认运行
Write-Host "`n测试配置摘要:" -ForegroundColor Cyan
Write-Host "- 设备: $deviceName"
Write-Host "- 测试模式: $testMode"
if ($testDuration -gt 0) {
    Write-Host "- 测试时长: $testDuration 分钟"
}
Write-Host "- 详细输出: $(if ($verboseOutput) { '是' } else { '否' })"

Write-Host ""
$confirm = Read-Host "是否开始测试? (Y/N)"
if ($confirm -ne "Y" -and $confirm -ne "y") {
    exit
}

# 创建日志文件名
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$logFileName = "device-test-$deviceType-$testMode-$timestamp.log"
$logFilePath = Join-Path $LogsDir $logFileName

# 执行测试脚本
Write-Host "`n开始测试..." -ForegroundColor Cyan
Write-Host "日志将保存到: $logFilePath" -ForegroundColor Gray
Write-Host ""

try {
    Set-Location (Split-Path -Parent $ScriptDir)
    $command = "npx ts-node `"$ScriptDir\actual-device-integration-test.ts`" --config=`"$selectedFile`" --mode=$testMode $testArgs"

    # 同时显示到控制台并保存到日志文件
    $command | Out-File -FilePath $logFilePath -Append
    Write-Host "执行命令: $command" -ForegroundColor Gray

    # 执行命令并捕获输出
    $result = Invoke-Expression $command 2>&1

    # 将结果写入日志文件并显示在控制台
    $result | ForEach-Object {
        $_ | Out-File -FilePath $logFilePath -Append
        Write-Host $_
    }

    Write-Host "`n测试完成。" -ForegroundColor Green
    Write-Host "- 日志已保存到: $logFilePath"
    Write-Host "- 报告已保存到: $ReportDir 目录"
} catch {
    $errorMessage = "测试执行出错: $_"
    Write-Host $errorMessage -ForegroundColor Red
    $errorMessage | Out-File -FilePath $logFilePath -Append
}
