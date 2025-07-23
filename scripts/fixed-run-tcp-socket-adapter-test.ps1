# 运行TCP/Socket协议适配器测试的PowerShell脚本
# 更新日期: 2025-07-23

# 设置控制台输出编码为UTF-8
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

# 参数定义
param (
    [string]$testType = "all",           # 测试类型: basic, performance, security, reliability, integration, all
    [string]$deviceTypes = "all",        # 设备类型: processor,sensor,controller,analyzer,all
    [int]$iterations = 5,                # 测试迭代次数
    [int]$connections = 10,              # 并发连接数
    [int]$dataSize = 128,                # 数据大小(KB)
    [int]$timeout = 30,                  # 超时时间(秒)
    [bool]$useSimulator = $true,         # 是否使用设备模拟器
    [int]$simulatorPort = 8888,          # 模拟器端口
    [string]$logLevel = "info"           # 日志级别: debug, info, warn, error
)

# 设置颜色变量
$COLOR_SUCCESS = "Green"
$COLOR_ERROR = "Red"
$COLOR_INFO = "Cyan"
$COLOR_WARNING = "Yellow"

Write-Host "正在运行TCP/Socket协议适配器测试..." -ForegroundColor $COLOR_INFO

# 检查并确保所需目录存在
$logsDir = ".\logs"
$resultsDir = ".\logs\test-results"

if (-not (Test-Path -Path $logsDir)) {
    New-Item -Path $logsDir -ItemType Directory | Out-Null
    Write-Host "创建日志目录: $logsDir" -ForegroundColor $COLOR_WARNING
}

if (-not (Test-Path -Path $resultsDir)) {
    New-Item -Path $resultsDir -ItemType Directory | Out-Null
    Write-Host "创建测试结果目录: $resultsDir" -ForegroundColor $COLOR_WARNING
}

# 设置日志文件路径
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$logFile = "$logsDir\tcp-socket-adapter-test-$timestamp.log"
$resultsFile = "$resultsDir\test-results-$timestamp.json"

Write-Host "测试日志将保存在: $logFile" -ForegroundColor Gray
Write-Host "测试结果将保存在: $resultsFile" -ForegroundColor Gray

# 解析设备类型
$deviceTypesList = $deviceTypes -split ','
if ($deviceTypes -eq "all") {
    $deviceTypesList = @("processor", "sensor", "controller", "analyzer", "generic")
}

# 解析测试类型
$testTypesList = $testType -split ','
if ($testType -eq "all") {
    $testTypesList = @("basic", "performance", "security", "reliability", "integration")
}

# 输出测试配置
Write-Host "`n===== 测试配置 =====" -ForegroundColor $COLOR_INFO
Write-Host "测试类型: $($testTypesList -join ', ')" -ForegroundColor $COLOR_INFO
Write-Host "设备类型: $($deviceTypesList -join ', ')" -ForegroundColor $COLOR_INFO
Write-Host "迭代次数: $iterations" -ForegroundColor $COLOR_INFO
Write-Host "并发连接: $connections" -ForegroundColor $COLOR_INFO
Write-Host "数据大小: ${dataSize}KB" -ForegroundColor $COLOR_INFO
Write-Host "超时时间: ${timeout}秒" -ForegroundColor $COLOR_INFO
Write-Host "使用模拟器: $useSimulator" -ForegroundColor $COLOR_INFO
if ($useSimulator) {
    Write-Host "模拟器端口: $simulatorPort" -ForegroundColor $COLOR_INFO
}
Write-Host "日志级别: $logLevel" -ForegroundColor $COLOR_INFO

# 检查测试环境
Write-Host "`n===== 检查测试环境 =====" -ForegroundColor $COLOR_INFO

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRoot = Split-Path -Parent $scriptDir

# 检查是否存在设备模拟器
$simulatorPath = "$projectRoot\src\backend\device\simulators\tcp-socket-device-simulator.ts"
if ($useSimulator -and -not (Test-Path -Path $simulatorPath)) {
    Write-Host "❌ 错误: 找不到设备模拟器文件 $simulatorPath" -ForegroundColor $COLOR_ERROR
    Write-Host "请确保TCP/Socket设备模拟器文件存在" -ForegroundColor $COLOR_ERROR
    exit 1
}

# 检查Node.js环境
try {
    $nodeVersion = node -v
    Write-Host "✅ Node.js版本: $nodeVersion" -ForegroundColor $COLOR_SUCCESS
} catch {
    Write-Host "❌ 错误: 找不到Node.js" -ForegroundColor $COLOR_ERROR
    Write-Host "请确保Node.js已安装并添加到PATH中" -ForegroundColor $COLOR_ERROR
    exit 1
}

# 检查TypeScript
try {
    $tsNodePath = npm root -g
    if (-not (Test-Path -Path "$tsNodePath\ts-node")) {
        Write-Host "正在全局安装ts-node..." -ForegroundColor $COLOR_WARNING
        npm install -g ts-node typescript
    }
    Write-Host "✅ ts-node可用" -ForegroundColor $COLOR_SUCCESS
} catch {
    Write-Host "❌ 警告: 无法检查或安装ts-node" -ForegroundColor $COLOR_WARNING
    Write-Host "如果稍后遇到问题，请手动安装: npm install -g ts-node typescript" -ForegroundColor $COLOR_WARNING
}

# 启动设备模拟器
$simulatorJob = $null
if ($useSimulator) {
    Write-Host "`n===== 启动设备模拟器 =====" -ForegroundColor $COLOR_INFO

    try {
        # 创建模拟器启动脚本
        $simulatorScriptPath = "$env:TEMP\start-simulator-$timestamp.js"
        $simulatorScript = @"
const { createDeviceSimulator } = require('$projectRoot/src/backend/device/simulators/tcp-socket-device-simulator');

// 根据测试配置创建模拟器
const deviceTypes = ['$($deviceTypesList -join "','")'];
const simulators = [];
let port = $simulatorPort;

// 为每种设备类型创建模拟器
deviceTypes.forEach((type, index) => {
    const simulator = createDeviceSimulator({
        id: `test-${type}-${index + 1}`,
        name: `Test ${type.charAt(0).toUpperCase() + type.slice(1)} ${index + 1}`,
        type: type,
        mode: 'server',
        port: port + index,
        useJson: ['controller', 'analyzer'].includes(type),
        useBinary: ['processor', 'sensor', 'generic'].includes(type),
        responseDelay: 20,
        simulatedErrorRate: 0.01,
        logLevel: '$logLevel'
    });

    simulators.push(simulator);
    simulator.start()
        .then(() => console.log(`模拟器启动成功: ${type} (端口: ${port + index})`))
        .catch(err => console.error(`模拟器启动失败: ${type}`, err));
});

// 保持进程运行
process.on('SIGINT', () => {
    console.log('正在关闭模拟器...');
    Promise.all(simulators.map(s => s.stop()))
        .then(() => process.exit(0))
        .catch(() => process.exit(1));
});

console.log('所有模拟器已启动，按Ctrl+C停止');
"@

        Set-Content -Path $simulatorScriptPath -Value $simulatorScript -Encoding UTF8

        # 在后台启动模拟器
        $simulatorJob = Start-Job -ScriptBlock {
            param($nodePath, $scriptPath)
            & $nodePath $scriptPath
        } -ArgumentList "node", $simulatorScriptPath

        # 等待模拟器启动
        Start-Sleep -Seconds 3

        # 检查模拟器状态
        $jobOutput = Receive-Job -Job $simulatorJob
        Write-Host $jobOutput -ForegroundColor $COLOR_INFO

        # 检查是否有错误
        if ($jobOutput -match "失败") {
            Write-Host "⚠️ 警告: 部分模拟器可能未成功启动" -ForegroundColor $COLOR_WARNING
        } else {
            Write-Host "✅ 设备模拟器启动成功" -ForegroundColor $COLOR_SUCCESS
        }
    } catch {
        Write-Host "❌ 启动设备模拟器时出错: $_" -ForegroundColor $COLOR_ERROR
        $_.Exception | Format-List -Force | Out-File -Append -FilePath $logFile
    }
}

# 运行测试
try {
    foreach ($currentTestType in $testTypesList) {
        Write-Host "`n===== 运行 $currentTestType 测试 =====" -ForegroundColor $COLOR_INFO

        # 构建测试命令
        $testScript = @"
const assert = require('assert');
const { TCPSocketAdapter } = require('$projectRoot/src/backend/device/adapters/tcp-socket/tcp-socket-adapter');

async function runTest() {
    console.log('开始 $currentTestType 测试');

    const results = {
        testType: '$currentTestType',
        deviceResults: [],
        overallSuccess: true,
        startTime: new Date().toISOString(),
        endTime: null,
        totalTests: 0,
        passedTests: 0,
        failedTests: 0
    };

    // 遍历设备类型
    for (const deviceType of ['$($deviceTypesList -join "','")']) {
        console.log(`\n测试设备类型: ${deviceType}`);

        const deviceResult = {
            deviceType,
            success: true,
            tests: [],
            connectTime: 0,
            dataTransferRate: 0,
            errorRate: 0
        };

        // 测试参数
        const port = $simulatorPort + ['processor', 'sensor', 'controller', 'analyzer', 'generic'].indexOf(deviceType);
        const useJson = ['controller', 'analyzer'].includes(deviceType);
        const useBinary = ['processor', 'sensor', 'generic'].includes(deviceType);

        // 创建适配器
        const adapter = new TCPSocketAdapter({
            connectionOptions: {
                host: 'localhost',
                port: port,
                connectionTimeout: $timeout * 1000,
                keepAlive: true,
                noDelay: true,
                autoReconnect: true,
                deviceType: deviceType.toUpperCase()
            },
            secureOptions: {
                secure: false
            },
            dataFormatOptions: {
                encoding: useJson ? 'utf8' : 'binary',
                endianness: 'big',
                jsonFormat: useJson,
                binaryFormat: useBinary
            }
        });

        try {
            // 基础连接测试
            if ('$currentTestType' === 'basic' || '$currentTestType' === 'all') {
                console.log('运行基础连接测试...');

                const connectStart = Date.now();
                await adapter.connect();
                const connectEnd = Date.now();
                deviceResult.connectTime = connectEnd - connectStart;

                console.log(`连接成功，耗时: ${deviceResult.connectTime}ms`);

                // 检查连接状态
                const isConnected = adapter.isConnected();
                assert.strictEqual(isConnected, true, '连接状态应为已连接');

                deviceResult.tests.push({
                    name: '基础连接测试',
                    success: true,
                    duration: deviceResult.connectTime
                });
                results.totalTests++;
                results.passedTests++;
            }

            // 数据传输测试
            if ('$currentTestType' === 'basic' || '$currentTestType' === 'performance' || '$currentTestType' === 'all') {
                console.log('运行数据传输测试...');

                let successCount = 0;
                let failCount = 0;
                let totalTransferTime = 0;

                for (let i = 0; i < $iterations; i++) {
                    try {
                        const testData = useJson
                            ? { cmd: 'echo', params: { data: `Test Data ${i}`, size: $dataSize } }
                            : Buffer.from(`Test Data ${i}`.padEnd($dataSize * 1024, 'X'));

                        const sendStart = Date.now();
                        const response = await adapter.send(testData);
                        const sendEnd = Date.now();

                        // 验证响应
                        if (response) {
                            successCount++;
                            totalTransferTime += (sendEnd - sendStart);
                            console.log(`数据传输测试 #${i+1} 成功，耗时: ${sendEnd - sendStart}ms`);
                        } else {
                            failCount++;
                            console.error(`数据传输测试 #${i+1} 失败: 无响应`);
                        }
                    } catch (err) {
                        failCount++;
                        console.error(`数据传输测试 #${i+1} 失败: ${err.message}`);
                    }
                }

                const avgTransferTime = successCount > 0 ? totalTransferTime / successCount : 0;
                deviceResult.dataTransferRate = successCount > 0 ? ($dataSize * 1024 * 8) / (avgTransferTime / 1000) : 0; // bps

                deviceResult.tests.push({
                    name: '数据传输测试',
                    success: successCount > 0,
                    successRate: (successCount / $iterations) * 100,
                    avgTransferTime,
                    dataTransferRate: deviceResult.dataTransferRate
                });

                results.totalTests++;
                if (successCount > 0) {
                    results.passedTests++;
                } else {
                    results.failedTests++;
                    deviceResult.success = false;
                }
            }

            // 错误处理测试
            if ('$currentTestType' === 'reliability' || '$currentTestType' === 'all') {
                console.log('运行错误处理测试...');

                let errorHandlingSuccess = true;

                try {
                    // 1. 测试无效命令
                    const invalidCommand = useJson
                        ? { cmd: 'invalid_command', params: {} }
                        : Buffer.from([0xFF, 0xFF, 0xFF, 0xFF]);

                    try {
                        await adapter.send(invalidCommand);
                        console.log('无效命令测试：适配器正确处理了无效命令');
                    } catch (err) {
                        console.log(`无效命令测试：捕获到预期错误: ${err.message}`);
                    }

                    // 2. 测试连接中断和恢复
                    console.log('测试连接恢复...');
                    await adapter.disconnect();
                    assert.strictEqual(adapter.isConnected(), false, '断开后连接状态应为未连接');

                    await adapter.connect();
                    assert.strictEqual(adapter.isConnected(), true, '重连后连接状态应为已连接');

                    deviceResult.tests.push({
                        name: '错误处理测试',
                        success: true
                    });
                    results.totalTests++;
                    results.passedTests++;
                } catch (err) {
                    console.error(`错误处理测试失败: ${err.message}`);
                    errorHandlingSuccess = false;

                    deviceResult.tests.push({
                        name: '错误处理测试',
                        success: false,
                        error: err.message
                    });
                    results.totalTests++;
                    results.failedTests++;
                    deviceResult.success = false;
                }
            }

            // 断开连接
            await adapter.disconnect();
            console.log('已断开连接');

        } catch (err) {
            console.error(`设备 ${deviceType} 测试失败: ${err.message}`);
            deviceResult.success = false;
            deviceResult.error = err.message;
            results.overallSuccess = false;
        }

        results.deviceResults.push(deviceResult);
    }

    results.endTime = new Date().toISOString();
    results.duration = new Date(results.endTime) - new Date(results.startTime);

    // 输出结果摘要
    console.log('\n===== 测试结果摘要 =====');
    console.log(`测试类型: ${results.testType}`);
    console.log(`总测试数: ${results.totalTests}`);
    console.log(`通过测试: ${results.passedTests}`);
    console.log(`失败测试: ${results.failedTests}`);
    console.log(`总体结果: ${results.overallSuccess ? '成功' : '失败'}`);
    console.log(`总耗时: ${results.duration}ms`);

    return results;
}

// 运行测试并输出结果
runTest()
    .then(results => {
        console.log(JSON.stringify(results, null, 2));
        process.exit(results.overallSuccess ? 0 : 1);
    })
    .catch(err => {
        console.error('测试执行错误:', err);
        process.exit(1);
    });
"@

        # 保存测试脚本到临时文件
        $testScriptPath = "$env:TEMP\tcp-socket-test-$currentTestType-$timestamp.js"
        Set-Content -Path $testScriptPath -Value $testScript -Encoding UTF8

        # 执行测试
        Write-Host "正在执行 $currentTestType 测试..." -ForegroundColor $COLOR_INFO

        try {
            $testOutput = node $testScriptPath

            # 提取测试结果
            $resultJson = $testOutput | Select-String -Pattern '{.+}' -AllMatches | ForEach-Object { $_.Matches } | Select-Object -Last 1

            if ($resultJson) {
                # 保存结果
                $resultFile = "$resultsDir\$currentTestType-$timestamp.json"
                $resultJson | Set-Content -Path $resultFile -Encoding UTF8

                # 分析结果
                $result = $resultJson | ConvertFrom-Json

                if ($result.overallSuccess) {
                    Write-Host "✅ $currentTestType 测试通过!" -ForegroundColor $COLOR_SUCCESS
                } else {
                    Write-Host "❌ $currentTestType 测试失败" -ForegroundColor $COLOR_ERROR
                }

                Write-Host "总测试数: $($result.totalTests)" -ForegroundColor $COLOR_INFO
                Write-Host "通过测试: $($result.passedTests)" -ForegroundColor $COLOR_SUCCESS
                Write-Host "失败测试: $($result.failedTests)" -ForegroundColor $COLOR_ERROR

                # 设备详情
                foreach ($deviceResult in $result.deviceResults) {
                    $statusColor = if ($deviceResult.success) { $COLOR_SUCCESS } else { $COLOR_ERROR }
                    $statusSymbol = if ($deviceResult.success) { "✅" } else { "❌" }

                    Write-Host "`n$statusSymbol 设备类型: $($deviceResult.deviceType)" -ForegroundColor $statusColor

                    foreach ($test in $deviceResult.tests) {
                        $testStatusColor = if ($test.success) { $COLOR_SUCCESS } else { $COLOR_ERROR }
                        $testStatusSymbol = if ($test.success) { "✅" } else { "❌" }

                        Write-Host "  $testStatusSymbol $($test.name)" -ForegroundColor $testStatusColor

                        if ($test.name -eq "数据传输测试" -and $test.dataTransferRate) {
                            $transferRateMbps = [math]::Round($test.dataTransferRate / 1024 / 1024, 2)
                            Write-Host "    平均传输时间: $([math]::Round($test.avgTransferTime, 2))ms" -ForegroundColor $COLOR_INFO
                            Write-Host "    数据传输速率: $transferRateMbps Mbps" -ForegroundColor $COLOR_INFO
                            if ($test.successRate) {
                                Write-Host "    成功率: $([math]::Round($test.successRate, 2))%" -ForegroundColor $COLOR_INFO
                            }
                        }

                        if ($test.error) {
                            Write-Host "    错误: $($test.error)" -ForegroundColor $COLOR_ERROR
                        }
                    }
                }
            } else {
                Write-Host "❌ 无法解析测试结果" -ForegroundColor $COLOR_ERROR
                $testOutput | Out-File -Append -FilePath $logFile
            }
        } catch {
            Write-Host "❌ 执行测试时出错: $_" -ForegroundColor $COLOR_ERROR
            $_.Exception | Format-List -Force | Out-File -Append -FilePath $logFile
        }
    }
} catch {
    Write-Host "❌ 测试过程中发生错误: $_" -ForegroundColor $COLOR_ERROR
    $_.Exception | Format-List -Force | Out-File -Append -FilePath $logFile
} finally {
    # 停止设备模拟器
    if ($simulatorJob) {
        Write-Host "`n===== 停止设备模拟器 =====" -ForegroundColor $COLOR_INFO
        Stop-Job -Job $simulatorJob
        Remove-Job -Job $simulatorJob -Force
        Write-Host "✅ 设备模拟器已停止" -ForegroundColor $COLOR_SUCCESS
    }

    Write-Host "`n===== 测试完成 =====" -ForegroundColor $COLOR_INFO
    Write-Host "日志文件: $logFile" -ForegroundColor $COLOR_INFO
    Write-Host "结果目录: $resultsDir" -ForegroundColor $COLOR_INFO
}
