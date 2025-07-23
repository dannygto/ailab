# 运行TCP/Socket协议适配器测试的PowerShell脚本
# 更新日期: 2025-07-23

# 设置控制台输出编码为UTF-8
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host "正在运行TCP/Socket协议适配器测试..." -ForegroundColor Cyan

# 检查并确保所需目录存在
$testDir = ".\src\backend\test"
$logsDir = ".\logs"
$resultsDir = ".\logs\test-results"

if (-not (Test-Path -Path $logsDir)) {
    New-Item -Path $logsDir -ItemType Directory | Out-Null
    Write-Host "创建日志目录: $logsDir" -ForegroundColor Yellow
}

if (-not (Test-Path -Path $resultsDir)) {
    New-Item -Path $resultsDir -ItemType Directory | Out-Null
    Write-Host "创建测试结果目录: $resultsDir" -ForegroundColor Yellow
}

# 设置日志文件路径
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$logFile = "$logsDir\tcp-socket-adapter-test-$timestamp.log"
$resultsFile = "$resultsDir\test-results-$timestamp.json"

Write-Host "测试日志将保存在: $logFile" -ForegroundColor Gray
Write-Host "测试结果将保存在: $resultsFile" -ForegroundColor Gray

# 设置测试配置
$TEST_ITERATIONS = 10
$CONCURRENT_CONNECTIONS = 20
$DATA_SIZE_KB = 128
$TEST_TIMEOUT_SEC = 30
$USE_DEVICE_SIMULATOR = $true
$SIMULATOR_PORT = 8888

# 定义测试类型
$TEST_TYPES = @("basic", "performance", "security", "reliability", "integration")

# 定义颜色
$COLOR_SUCCESS = "Green"
$COLOR_ERROR = "Red"
$COLOR_INFO = "Cyan"
$COLOR_WARNING = "Yellow"

# 确保进入正确的目录
Set-Location -Path (Get-Item -Path ".").FullName

# 检查Node.js是否安装
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "❌ 未找到Node.js。请安装Node.js后再运行此测试。" -ForegroundColor $COLOR_ERROR
    exit 1
}

# 检查必要的文件是否存在
$requiredFiles = @(
    ".\scripts\device-simulator-proc.js",
    ".\scripts\device-simulator-sens.js",
    ".\scripts\tcp-socket-adapter-test-tool.js",
    ".\src\backend\device\adapters\tcp-socket\tcp-socket-adapter.ts",
    ".\src\backend\device\adapters\tcp-socket\tcp-socket-client.impl.ts"
)
)

foreach ($file in $requiredFiles) {
    if (-not (Test-Path -Path $file)) {
        Write-Host "❌ 未找到必要的文件: $file" -ForegroundColor $COLOR_ERROR
        exit 1
    }
}

# 启动设备模拟器函数
function Start-DeviceSimulator {
    param (
        [string]$Type,
        [int]$Port
    )

    Write-Host "正在启动$Type设备模拟器，端口: $Port..." -ForegroundColor $COLOR_INFO

    $scriptPath = if ($Type -eq "processor") {
        ".\scripts\device-simulator-proc.js"
    } else {
        ".\scripts\device-simulator-sens.js"
    }

    # 启动设备模拟器作为后台任务
    $job = Start-Job -ScriptBlock {
        param($nodePath, $scriptPath, $port)
        & $nodePath $scriptPath --port=$port
    } -ArgumentList "node", (Resolve-Path $scriptPath), $Port

    Start-Sleep -Seconds 2

    return $job
}

# 停止设备模拟器函数
function Stop-DeviceSimulator {
    param (
        [System.Management.Automation.Job]$Job
    )

    if ($null -ne $Job) {
        Write-Host "正在停止设备模拟器..." -ForegroundColor $COLOR_INFO
        Stop-Job -Job $Job
        Remove-Job -Job $Job -Force
    }
}

# 运行测试函数
function Invoke-TCPSocketTest {
    param (
        [string]$TestType,
        [int]$Port,
        [string]$LogFile
    )

    Write-Host "`n🔄 正在运行 $TestType 测试..." -ForegroundColor $COLOR_INFO

    $testScript = ".\scripts\tcp-socket-adapter-test-tool.js"
    $testCommand = "node $testScript --type=$TestType --port=$Port --iterations=$TEST_ITERATIONS --connections=$CONCURRENT_CONNECTIONS --dataSize=$DATA_SIZE_KB --timeout=$TEST_TIMEOUT_SEC"

    Write-Host "执行命令: $testCommand" -ForegroundColor Gray

    try {
        $testOutput = Invoke-Expression $testCommand
        $testOutput | Out-File -Append -FilePath $LogFile

        # 解析测试结果
        if ($testOutput -match "测试结果: 成功") {
            Write-Host "✅ $TestType 测试成功完成" -ForegroundColor $COLOR_SUCCESS
            return $true
        } else {
            Write-Host "❌ $TestType 测试失败" -ForegroundColor $COLOR_ERROR
            return $false
        }
    } catch {
        Write-Host "❌ $TestType 测试执行出错: $_" -ForegroundColor $COLOR_ERROR
        $_.Exception | Format-List -Force | Out-File -Append -FilePath $LogFile
        return $false
    }
}

# 编译TypeScript代码
function Invoke-TypeScriptCompile {
    Write-Host "`n🔄 正在编译TypeScript代码..." -ForegroundColor $COLOR_INFO

    try {
        # 进入后端目录
        Push-Location -Path ".\src\backend"

        # 运行编译命令
        $compileOutput = Invoke-Expression "npx tsc --project tsconfig.json"

        # 检查编译结果
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ TypeScript编译成功" -ForegroundColor $COLOR_SUCCESS
            Pop-Location
            return $true
        } else {
            Write-Host "❌ TypeScript编译失败" -ForegroundColor $COLOR_ERROR
            $compileOutput | Out-File -Append -FilePath $logFile
            Pop-Location
            return $false
        }
    } catch {
        Write-Host "❌ TypeScript编译过程出错: $_" -ForegroundColor $COLOR_ERROR
        $_.Exception | Format-List -Force | Out-File -Append -FilePath $logFile
        Pop-Location
        return $false
    }
}

# 初始化测试环境
function Initialize-TestEnvironment {
    Write-Host "`n🔄 正在初始化测试环境..." -ForegroundColor $COLOR_INFO

    # 确保依赖项已安装
    Push-Location -Path ".\src\backend"

    if (-not (Test-Path -Path "node_modules")) {
        Write-Host "正在安装后端依赖..." -ForegroundColor $COLOR_INFO
        Invoke-Expression "npm install"
    }

    Pop-Location

    # 确保测试工具依赖已安装
    Push-Location -Path ".\scripts"

    if (-not (Test-Path -Path "node_modules")) {
        Write-Host "正在安装测试工具依赖..." -ForegroundColor $COLOR_INFO
        Invoke-Expression "npm install"
    }

    Pop-Location

    return $true
}

# 运行所有测试
function Invoke-AllTests {
    param (
        [int]$Port,
        [string]$LogFile
    )

    $testResults = @{}
    $allTestsPassed = $true

    foreach ($testType in $TEST_TYPES) {
        $testResult = Invoke-TCPSocketTest -TestType $testType -Port $Port -LogFile $LogFile
        $testResults[$testType] = $testResult

        if (-not $testResult) {
            $allTestsPassed = $false
        }
    }

    # 将测试结果保存为JSON文件
    $testResultsObj = [PSCustomObject]@{
        timestamp = (Get-Date).ToString("o")
        results = $testResults
        allTestsPassed = $allTestsPassed
        testConfig = [PSCustomObject]@{
            iterations = $TEST_ITERATIONS
            connections = $CONCURRENT_CONNECTIONS
            dataSize = $DATA_SIZE_KB
            timeout = $TEST_TIMEOUT_SEC
        }
    }

    $testResultsObj | ConvertTo-Json -Depth 4 | Out-File -FilePath $resultsFile

    return $allTestsPassed
}

# 主测试流程
try {
    Write-Host "`n======== TCP/Socket协议适配器测试开始 ========" -ForegroundColor $COLOR_INFO
    Write-Host "时间: $(Get-Date)" -ForegroundColor $COLOR_INFO
    Write-Host "=====================================" -ForegroundColor $COLOR_INFO

    # 初始化测试环境
    if (-not (Initialize-TestEnvironment)) {
        Write-Host "❌ 测试环境初始化失败" -ForegroundColor $COLOR_ERROR
        exit 1
    }

    # 编译TypeScript代码
    if (-not (Invoke-TypeScriptCompile)) {
        Write-Host "❌ TypeScript编译失败，无法继续测试" -ForegroundColor $COLOR_ERROR
        exit 1
    }

    # 启动设备模拟器
    $simulatorJob = $null
    if ($USE_DEVICE_SIMULATOR) {
        $simulatorJob = Start-DeviceSimulator -Type "processor" -Port $SIMULATOR_PORT
    }

    # 运行所有测试
    $testsPassed = Invoke-AllTests -Port $SIMULATOR_PORT -LogFile $logFile

    # 停止设备模拟器
    if ($USE_DEVICE_SIMULATOR -and $null -ne $simulatorJob) {
        Stop-DeviceSimulator -Job $simulatorJob
    }

    # 输出测试总结
    Write-Host "`n======== TCP/Socket协议适配器测试完成 ========" -ForegroundColor $COLOR_INFO
    Write-Host "时间: $(Get-Date)" -ForegroundColor $COLOR_INFO

    if ($testsPassed) {
        Write-Host "✅ 所有测试通过！" -ForegroundColor $COLOR_SUCCESS
        exit 0
    } else {
        Write-Host "❌ 部分测试失败，请查看日志以获取详细信息。" -ForegroundColor $COLOR_ERROR
        exit 1
    }
} catch {
    # 确保在出错时也停止设备模拟器
    if ($USE_DEVICE_SIMULATOR -and $null -ne $simulatorJob) {
        Stop-DeviceSimulator -Job $simulatorJob
    }

    Write-Host "`n❌ 测试执行过程中发生错误: $_" -ForegroundColor $COLOR_ERROR
    $_.Exception | Format-List -Force | Out-File -Append -FilePath $logFile
    exit 1
} finally {
    Write-Host "`n测试日志已保存到: $logFile" -ForegroundColor $COLOR_INFO
    Write-Host "请检查日志文件以获取详细信息。" -ForegroundColor $COLOR_INFO
}

# 检查环境
Write-Host "检查测试环境..." -ForegroundColor $COLOR_INFO
$testFilePath = ".\src\backend\test\tcp-socket-adapter-test.ts"
$simulatorFilePath = ".\src\backend\device\simulators\tcp-socket-device-simulator.ts"

if (-not (Test-Path -Path $testFilePath)) {
    Write-Host "❌ 错误: 找不到测试文件 $testFilePath" -ForegroundColor $COLOR_ERROR
    Write-Host "请确保TCP/Socket协议适配器测试文件已正确设置" -ForegroundColor $COLOR_ERROR
    exit 1
}

if ($USE_DEVICE_SIMULATOR -and -not (Test-Path -Path $simulatorFilePath)) {
    Write-Host "❌ 错误: 找不到设备模拟器文件 $simulatorFilePath" -ForegroundColor $COLOR_ERROR
    Write-Host "请确保TCP/Socket设备模拟器文件已正确设置" -ForegroundColor $COLOR_ERROR
    exit 1
}

# 启动设备模拟器
function Start-DeviceSimulator {
    Write-Host "`n===== 启动设备模拟器 =====" -ForegroundColor $COLOR_INFO

    try {
        # 构建参数
        $params = @(
            "--project", ".\src\backend\tsconfig.json",
            "-e", "require('./device/simulators/tcp-socket-device-simulator').createDeviceSimulator({
                id: 'test-device-1',
                name: 'Test Device 1',
                type: 'sensor',
                mode: 'server',
                port: $SIMULATOR_PORT,
                useJson: true,
                autoReconnect: true,
                responseDelay: 50,
                simulatedErrorRate: 0.01
            }).start().then(() => console.log('Device simulator started on port $SIMULATOR_PORT'));"
        )

        # 在后台启动模拟器
        $job = Start-Job -ScriptBlock {
            param($workingDir, $params)
            Set-Location $workingDir
            & ts-node @params
        } -ArgumentList ((Get-Location).Path), $params

        # 等待模拟器启动
        Start-Sleep -Seconds 2

        $jobState = Receive-Job -Job $job
        Write-Host $jobState -ForegroundColor $COLOR_INFO

        Write-Host "✅ 设备模拟器启动成功 (Port: $SIMULATOR_PORT)" -ForegroundColor $COLOR_SUCCESS
        return $job
    } catch {
        Write-Host "❌ 启动设备模拟器时出错: $_" -ForegroundColor $COLOR_ERROR
        $_.Exception | Format-List -Force | Out-File -Append -FilePath $logFile
        return $null
    }
}

# 停止设备模拟器
function Stop-DeviceSimulator {
    param (
        [Parameter(Mandatory=$true)]
        $Job
    )

    Write-Host "`n===== 停止设备模拟器 =====" -ForegroundColor $COLOR_INFO

    try {
        Stop-Job -Job $Job
        Remove-Job -Job $Job -Force
        Write-Host "✅ 设备模拟器已停止" -ForegroundColor $COLOR_SUCCESS
    } catch {
        Write-Host "❌ 停止设备模拟器时出错: $_" -ForegroundColor $COLOR_ERROR
    }
}

# 运行指定类型的测试
function Run-Test {
    param (
        [Parameter(Mandatory=$true)]
        [string]$Type
    )

    Write-Host "`n===== 运行 $Type 测试 =====" -ForegroundColor $COLOR_INFO

    try {
        # 构建参数
        $params = @(
            "--project", ".\src\backend\tsconfig.json",
            $testFilePath,
            "--type", $Type,
            "--iterations", $TEST_ITERATIONS,
            "--connections", $CONCURRENT_CONNECTIONS,
            "--dataSize", $DATA_SIZE_KB,
            "--timeout", $TEST_TIMEOUT_SEC
        )

        if ($USE_DEVICE_SIMULATOR) {
            $params += @("--simulator", "true", "--simulatorPort", $SIMULATOR_PORT)
        }

        # 运行测试
        & ts-node @params | Tee-Object -Append -FilePath $logFile

        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ $Type 测试完成成功!" -ForegroundColor $COLOR_SUCCESS
            return $true
        } else {
            Write-Host "❌ $Type 测试失败!" -ForegroundColor $COLOR_ERROR
            return $false
        }
    } catch {
        Write-Host "❌ 执行 $Type 测试时出错: $_" -ForegroundColor $COLOR_ERROR
        $_.Exception | Format-List -Force | Out-File -Append -FilePath $logFile
        return $false
    }
}

# 主测试流程
try {
    Write-Host "`n=====================================" -ForegroundColor $COLOR_INFO
    Write-Host "  TCP/Socket协议适配器测试" -ForegroundColor $COLOR_INFO
    Write-Host "=====================================" -ForegroundColor $COLOR_INFO

    # 记录测试开始时间
    $startTime = Get-Date
    Write-Host "测试开始时间: $startTime" -ForegroundColor $COLOR_INFO
    "测试开始时间: $startTime" | Out-File -FilePath $logFile

    # 启动设备模拟器(如果启用)
    $simulatorJob = $null
    if ($USE_DEVICE_SIMULATOR) {
        $simulatorJob = Start-DeviceSimulator
        if ($null -eq $simulatorJob) {
            Write-Host "❌ 无法启动设备模拟器，测试中止" -ForegroundColor $COLOR_ERROR
            exit 1
        }
    }

    # 存储测试结果
    $results = @{}

    # 运行所有测试类型
    foreach ($type in $TEST_TYPES) {
        $results[$type] = Run-Test -Type $type
    }

    # 停止设备模拟器(如果启用)
    if ($USE_DEVICE_SIMULATOR -and $null -ne $simulatorJob) {
        Stop-DeviceSimulator -Job $simulatorJob
    }

    # 计算测试时间
    $endTime = Get-Date
    $duration = $endTime - $startTime
    Write-Host "`n测试结束时间: $endTime" -ForegroundColor $COLOR_INFO
    Write-Host "总测试时间: $($duration.TotalMinutes.ToString('0.00')) 分钟" -ForegroundColor $COLOR_INFO

    # 生成测试报告
    Write-Host "`n===== 测试结果汇总 =====" -ForegroundColor $COLOR_INFO
    $overallSuccess = $true

    foreach ($type in $TEST_TYPES) {
        $status = if ($results[$type]) { "通过" } else { "失败" }
        $color = if ($results[$type]) { $COLOR_SUCCESS } else { $COLOR_ERROR }
        Write-Host "$type 测试: $status" -ForegroundColor $color

        if (-not $results[$type]) {
            $overallSuccess = $false
        }
    }

    # 输出总体结果
    Write-Host "`n总体测试结果: " -NoNewline
    if ($overallSuccess) {
        Write-Host "通过" -ForegroundColor $COLOR_SUCCESS
    } else {
        Write-Host "失败" -ForegroundColor $COLOR_ERROR
    }

    # 将结果写入日志
    "测试结束时间: $endTime" | Out-File -Append -FilePath $logFile
    "总测试时间: $($duration.TotalMinutes.ToString('0.00')) 分钟" | Out-File -Append -FilePath $logFile
    "===== 测试结果汇总 =====" | Out-File -Append -FilePath $logFile
    foreach ($type in $TEST_TYPES) {
        "$type 测试: $(if ($results[$type]) { "通过" } else { "失败" })" | Out-File -Append -FilePath $logFile
    }
    "总体测试结果: $(if ($overallSuccess) { "通过" } else { "失败" })" | Out-File -Append -FilePath $logFile

    # 将结果写入JSON文件
    $resultsJson = @{
        startTime = $startTime.ToString("o")
        endTime = $endTime.ToString("o")
        duration = $duration.TotalSeconds
        results = @{}
        overallSuccess = $overallSuccess
        configuration = @{
            iterations = $TEST_ITERATIONS
            connections = $CONCURRENT_CONNECTIONS
            dataSize = $DATA_SIZE_KB
            timeout = $TEST_TIMEOUT_SEC
            useSimulator = $USE_DEVICE_SIMULATOR
            simulatorPort = if ($USE_DEVICE_SIMULATOR) { $SIMULATOR_PORT } else { $null }
        }
    }

    foreach ($type in $TEST_TYPES) {
        $resultsJson.results[$type] = $results[$type]
    }

    $resultsJson | ConvertTo-Json -Depth 5 | Out-File -FilePath $resultsFile
    Write-Host "`n测试结果已保存到: $resultsFile" -ForegroundColor $COLOR_INFO

    # 返回适当的退出代码
    if ($overallSuccess) {
        exit 0
    } else {
        exit 1
    }
} catch {
    # 确保在出错时也停止设备模拟器
    if ($USE_DEVICE_SIMULATOR -and $null -ne $simulatorJob) {
        Stop-DeviceSimulator -Job $simulatorJob
    }

    Write-Host "`n❌ 测试执行过程中发生错误: $_" -ForegroundColor $COLOR_ERROR
    $_.Exception | Format-List -Force | Out-File -Append -FilePath $logFile
    exit 1
} finally {
    Write-Host "`n测试日志已保存到: $logFile" -ForegroundColor $COLOR_INFO
    Write-Host "请检查日志文件以获取详细信息。" -ForegroundColor $COLOR_INFO
}
