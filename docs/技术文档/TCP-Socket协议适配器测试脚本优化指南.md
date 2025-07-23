# TCP/Socket协议适配器测试脚本优化指南

*创建日期：2025年7月23日*  
*版本：1.0*

本文档提供了TCP/Socket协议适配器测试脚本的优化建议和实施指南，用于支持实际设备测试阶段的工作。

## 1. 测试脚本结构优化

### 1.1 模块化设计

将测试脚本重构为以下模块：

```
/tests/tcp-socket-adapter/
  ├── config/                # 测试配置文件
  │   ├── devices/           # 设备特定配置
  │   ├── test-suites/       # 测试套件配置
  │   └── global-config.js   # 全局测试配置
  ├── lib/                   # 测试工具库
  │   ├── device-connector.ts    # 设备连接工具
  │   ├── command-builder.ts     # 命令构建工具
  │   ├── response-parser.ts     # 响应解析工具
  │   ├── performance-monitor.ts # 性能监控工具
  │   ├── test-reporter.ts       # 测试报告生成工具
  │   └── utils.ts               # 通用工具函数
  ├── scenarios/             # 测试场景
  │   ├── basic-connectivity/    # 基础连接测试
  │   ├── command-interaction/   # 命令交互测试
  │   ├── advanced-features/     # 高级功能测试
  │   ├── performance/           # 性能测试
  │   └── security/              # 安全测试
  ├── data/                  # 测试数据
  │   ├── commands/              # 测试命令集
  │   ├── expected-responses/    # 预期响应数据
  │   └── test-files/            # 测试用文件
  ├── logs/                  # 测试日志
  └── reports/               # 测试报告
```

### 1.2 主要测试流程优化

每个测试场景应包含以下标准流程：

1. 测试环境初始化
2. 设备连接建立
3. 测试准备（设备状态设置）
4. 测试执行
5. 结果验证
6. 性能数据收集
7. 资源清理
8. 报告生成

## 2. 日志记录增强

### 2.1 分级日志系统

实现五级日志系统：

- **ERROR**：测试失败或严重问题
- **WARNING**：潜在问题或异常情况
- **INFO**：测试流程和状态信息
- **DEBUG**：详细调试信息
- **TRACE**：最详细的通信数据和变量值

### 2.2 结构化日志格式

使用JSON格式记录日志，包含以下字段：

```json
{
  "timestamp": "2025-07-23T15:30:45.123Z",
  "level": "INFO",
  "device": "DEV001",
  "testId": "CONN-001",
  "category": "CONNECTION",
  "message": "成功建立TCP连接",
  "details": {
    "host": "192.168.1.101",
    "port": 5001,
    "connectionTime": 23,
    "attempt": 1
  },
  "context": {
    "testSuite": "BasicConnectivity",
    "testCase": "EstablishConnection",
    "runId": "2025072301"
  }
}
```

### 2.3 日志存储和轮转

- 实现按大小和时间的日志轮转
- 为每个测试会话创建单独的日志文件
- 保留最近10个测试会话的日志
- 压缩归档较早的日志文件

## 3. 性能监控指标采集

### 3.1 系统级指标

- CPU使用率（整体和进程级）
- 内存使用情况
- 网络吞吐量
- 磁盘I/O活动
- 系统负载

### 3.2 适配器级指标

- 活动连接数
- 命令处理速率
- 响应时间统计（最小、最大、平均、中位数、95%百分位）
- 错误率和类型
- 重连次数和时间
- 内存分配和垃圾回收活动

### 3.3 设备级指标

- 连接建立时间
- 命令响应时间
- 数据传输速率
- 错误响应数量
- 超时次数
- 特殊命令性能

### 3.4 性能数据收集代码

```typescript
// performance-monitor.ts
import * as os from 'os';
import { EventEmitter } from 'events';

export class PerformanceMonitor extends EventEmitter {
  private metrics: Map<string, any> = new Map();
  private startTime: number;
  private sampleInterval: number;
  private timer: NodeJS.Timeout | null = null;
  
  constructor(sampleInterval = 1000) {
    super();
    this.startTime = Date.now();
    this.sampleInterval = sampleInterval;
  }
  
  public start(): void {
    this.startTime = Date.now();
    this.timer = setInterval(() => this.collectMetrics(), this.sampleInterval);
  }
  
  public stop(): Map<string, any> {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.collectMetrics(); // 收集最终指标
    return this.metrics;
  }
  
  private collectMetrics(): void {
    // 系统指标
    const systemMetrics = {
      timestamp: Date.now(),
      uptime: process.uptime(),
      cpuUsage: process.cpuUsage(),
      memoryUsage: process.memoryUsage(),
      systemMemory: {
        total: os.totalmem(),
        free: os.freemem(),
      },
      loadAverage: os.loadavg(),
    };
    
    this.metrics.set(`system_${Date.now()}`, systemMetrics);
    this.emit('metrics', systemMetrics);
  }
  
  public recordEvent(category: string, name: string, data: any): void {
    const event = {
      timestamp: Date.now(),
      category,
      name,
      data,
    };
    
    this.metrics.set(`event_${category}_${name}_${Date.now()}`, event);
    this.emit('event', event);
  }
  
  public generateReport(): any {
    // 处理收集的指标并生成报告
    return {
      duration: Date.now() - this.startTime,
      sampleCount: this.metrics.size,
      // 其他统计分析...
    };
  }
}
```

## 4. 测试脚本优化示例

### 4.1 基础连接测试脚本

```typescript
// scenarios/basic-connectivity/connection-establishment.ts
import { DeviceConnector } from '../../lib/device-connector';
import { TestReporter } from '../../lib/test-reporter';
import { PerformanceMonitor } from '../../lib/performance-monitor';
import { getDeviceConfig } from '../../config/devices';

export async function runConnectionTest(deviceId: string): Promise<boolean> {
  const logger = createLogger(`connection-test-${deviceId}`);
  const reporter = new TestReporter('BasicConnectivity', 'ConnectionEstablishment', deviceId);
  const perfMonitor = new PerformanceMonitor();
  
  logger.info(`开始设备 ${deviceId} 的连接测试`);
  reporter.startTest();
  perfMonitor.start();
  
  try {
    // 加载设备配置
    const deviceConfig = getDeviceConfig(deviceId);
    logger.debug('加载设备配置', { deviceId, config: deviceConfig });
    
    // 创建设备连接器
    const connector = new DeviceConnector(deviceConfig);
    
    // 记录连接开始
    perfMonitor.recordEvent('connection', 'start', { deviceId, timestamp: Date.now() });
    
    // 尝试连接
    logger.info('尝试建立连接', { host: deviceConfig.connection.host, port: deviceConfig.connection.port });
    const connected = await connector.connect();
    
    // 记录连接结果
    perfMonitor.recordEvent('connection', 'result', { 
      deviceId, 
      success: connected, 
      timestamp: Date.now(),
      connectionTime: connector.getLastConnectionTime()
    });
    
    if (connected) {
      logger.info('连接成功建立', { deviceId, connectionTime: connector.getLastConnectionTime() });
      
      // 发送识别命令
      const idCommand = deviceConfig.protocol.identificationCommand;
      logger.debug('发送设备识别命令', { command: idCommand });
      
      perfMonitor.recordEvent('command', 'send', { 
        deviceId, command: idCommand, timestamp: Date.now() 
      });
      
      const response = await connector.sendCommand(idCommand);
      
      perfMonitor.recordEvent('command', 'response', { 
        deviceId, command: idCommand, response, timestamp: Date.now(),
        responseTime: connector.getLastCommandTime()
      });
      
      logger.debug('收到设备响应', { response, responseTime: connector.getLastCommandTime() });
      
      // 验证设备身份
      const identificationValid = response.includes(deviceConfig.protocol.expectedIdentificationResponse);
      
      if (identificationValid) {
        logger.info('设备身份验证成功', { deviceId, response });
      } else {
        logger.warn('设备身份验证失败', { deviceId, response, expected: deviceConfig.protocol.expectedIdentificationResponse });
      }
      
      // 断开连接
      await connector.disconnect();
      logger.info('测试完成，连接已断开', { deviceId });
      
      reporter.addResult('connectionEstablished', true);
      reporter.addResult('identificationValid', identificationValid);
      reporter.setSuccess(identificationValid);
      
      return identificationValid;
    } else {
      logger.error('无法建立连接', { deviceId, lastError: connector.getLastError() });
      reporter.addResult('connectionEstablished', false);
      reporter.addError('connectionFailed', connector.getLastError());
      reporter.setSuccess(false);
      
      return false;
    }
  } catch (error) {
    logger.error('测试执行异常', { deviceId, error });
    reporter.addError('testException', error);
    reporter.setSuccess(false);
    
    return false;
  } finally {
    const perfReport = perfMonitor.stop();
    reporter.addPerformanceData(perfReport);
    reporter.finishTest();
    
    logger.info('生成测试报告', { reportPath: reporter.getReportPath() });
  }
}
```

### 4.2 命令执行测试脚本

```typescript
// scenarios/command-interaction/command-execution.ts
import { DeviceConnector } from '../../lib/device-connector';
import { CommandBuilder } from '../../lib/command-builder';
import { ResponseParser } from '../../lib/response-parser';
import { TestReporter } from '../../lib/test-reporter';
import { PerformanceMonitor } from '../../lib/performance-monitor';
import { getDeviceConfig, getCommandSet } from '../../config/devices';

export async function runCommandTest(deviceId: string, testLevel: 'basic' | 'advanced' | 'full' = 'basic'): Promise<boolean> {
  const logger = createLogger(`command-test-${deviceId}`);
  const reporter = new TestReporter('CommandInteraction', 'CommandExecution', deviceId);
  const perfMonitor = new PerformanceMonitor();
  
  logger.info(`开始设备 ${deviceId} 的命令执行测试，级别: ${testLevel}`);
  reporter.startTest();
  perfMonitor.start();
  
  try {
    // 加载设备配置和命令集
    const deviceConfig = getDeviceConfig(deviceId);
    const commandSet = getCommandSet(deviceId, testLevel);
    
    logger.debug('加载设备配置和命令集', { deviceId, commandCount: commandSet.length });
    
    // 创建设备连接器
    const connector = new DeviceConnector(deviceConfig);
    const cmdBuilder = new CommandBuilder(deviceConfig.protocol);
    const respParser = new ResponseParser(deviceConfig.protocol);
    
    // 连接设备
    logger.info('连接设备', { deviceId });
    const connected = await connector.connect();
    
    if (!connected) {
      logger.error('无法连接设备，测试中止', { deviceId, lastError: connector.getLastError() });
      reporter.addError('connectionFailed', connector.getLastError());
      reporter.setSuccess(false);
      return false;
    }
    
    // 初始化设备
    logger.info('执行设备初始化命令', { deviceId });
    for (const initCmd of deviceConfig.commands.initialize) {
      await connector.sendCommand(initCmd);
    }
    
    // 执行命令测试
    let successCount = 0;
    let failCount = 0;
    
    for (const cmd of commandSet) {
      logger.debug('准备执行命令', { command: cmd.name, payload: cmd.command });
      
      // 构建命令
      const formattedCmd = cmdBuilder.build(cmd.command, cmd.parameters);
      
      // 记录命令开始
      perfMonitor.recordEvent('command', 'start', { 
        deviceId, command: cmd.name, timestamp: Date.now() 
      });
      
      // 发送命令
      const response = await connector.sendCommand(formattedCmd);
      
      // 记录命令结束
      perfMonitor.recordEvent('command', 'end', { 
        deviceId, 
        command: cmd.name, 
        responseTime: connector.getLastCommandTime(),
        timestamp: Date.now() 
      });
      
      // 解析响应
      const parsedResponse = respParser.parse(response, cmd.responseType);
      
      // 验证响应
      const isValid = respParser.validate(parsedResponse, cmd.expectedResponse);
      
      if (isValid) {
        logger.info('命令执行成功', { 
          command: cmd.name, 
          responseTime: connector.getLastCommandTime() 
        });
        successCount++;
      } else {
        logger.warn('命令执行失败', { 
          command: cmd.name, 
          actual: parsedResponse, 
          expected: cmd.expectedResponse 
        });
        failCount++;
      }
      
      reporter.addResult(`command_${cmd.name}`, isValid);
      
      // 添加详细信息
      reporter.addDetail(`command_${cmd.name}`, {
        command: formattedCmd,
        rawResponse: response,
        parsedResponse,
        expectedResponse: cmd.expectedResponse,
        responseTime: connector.getLastCommandTime(),
        valid: isValid
      });
    }
    
    // 断开连接
    await connector.disconnect();
    
    // 设置测试结果
    const totalSuccess = failCount === 0;
    const successRate = (successCount / (successCount + failCount)) * 100;
    
    logger.info('命令测试完成', { 
      deviceId, 
      total: successCount + failCount,
      success: successCount, 
      fail: failCount,
      successRate: `${successRate.toFixed(2)}%`
    });
    
    reporter.addSummary({
      totalCommands: successCount + failCount,
      successCount,
      failCount,
      successRate
    });
    
    reporter.setSuccess(totalSuccess);
    
    return totalSuccess;
  } catch (error) {
    logger.error('测试执行异常', { deviceId, error });
    reporter.addError('testException', error);
    reporter.setSuccess(false);
    
    return false;
  } finally {
    const perfReport = perfMonitor.stop();
    reporter.addPerformanceData(perfReport);
    reporter.finishTest();
    
    logger.info('生成测试报告', { reportPath: reporter.getReportPath() });
  }
}
```

## 5. 测试结果报告模板

创建标准化的测试报告格式，包含以下部分：

1. **测试摘要**：测试名称、设备信息、执行时间、总体结果
2. **测试详情**：各测试用例的详细结果
3. **性能数据**：关键性能指标和图表
4. **日志摘要**：重要日志记录和错误信息
5. **环境信息**：测试环境和配置详情

示例报告JSON结构：

```json
{
  "testId": "TCP-SOCKET-TEST-2025072301",
  "testSuite": "BasicConnectivity",
  "testCase": "ConnectionEstablishment",
  "deviceId": "DEV001",
  "deviceName": "数字多功能测量仪",
  "timestamp": "2025-07-23T15:30:45.123Z",
  "duration": 12500,
  "status": "SUCCESS",
  "summary": {
    "total": 5,
    "success": 5,
    "fail": 0,
    "skip": 0
  },
  "results": [
    {
      "step": "connectionEstablished",
      "status": "SUCCESS",
      "duration": 235,
      "details": { /* 详细信息 */ }
    },
    {
      "step": "identificationValid",
      "status": "SUCCESS",
      "duration": 189,
      "details": { /* 详细信息 */ }
    }
    // 其他步骤...
  ],
  "performance": {
    "connectionTime": 235,
    "commandResponseTimes": {
      "min": 15,
      "max": 230,
      "avg": 45,
      "median": 32,
      "p95": 120
    },
    "cpuUsage": {
      "avg": 5.2,
      "max": 12.5
    },
    "memoryUsage": {
      "avg": 45600000,
      "max": 68400000
    },
    "networkActivity": {
      "sent": 12500,
      "received": 45600
    },
    // 其他性能指标...
  },
  "logs": [
    {
      "level": "ERROR",
      "message": "连接超时",
      "timestamp": "2025-07-23T15:30:40.123Z",
      "details": { /* 详细信息 */ }
    }
    // 其他重要日志...
  ],
  "environment": {
    "testHost": "TEST-SERVER-01",
    "adapterVersion": "1.5.2",
    "nodeVersion": "20.5.0",
    "osInfo": "Windows Server 2025",
    "networkConfig": { /* 网络配置 */ },
    "deviceConfig": { /* 设备配置 */ }
  }
}
```

## 6. 测试脚本运行方法

### 6.1 基本运行命令

```bash
# 运行单个设备的所有测试
npm run test:device -- --device=DEV001

# 运行特定测试场景
npm run test:scenario -- --scenario=basic-connectivity --device=all

# 运行完整测试套件
npm run test:all
```

### 6.2 PowerShell运行脚本

创建 `run-device-test.ps1` 脚本用于Windows环境：

```powershell
param (
    [Parameter(Mandatory=$true)]
    [string]$Device,
    
    [Parameter(Mandatory=$false)]
    [string]$Scenario = "all",
    
    [Parameter(Mandatory=$false)]
    [string]$Level = "basic",
    
    [Parameter(Mandatory=$false)]
    [string]$OutputDir = "./reports"
)

# 设置编码为UTF-8，解决中文显示问题
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host "开始TCP/Socket协议适配器测试" -ForegroundColor Green
Write-Host "设备ID: $Device" -ForegroundColor Cyan
Write-Host "测试场景: $Scenario" -ForegroundColor Cyan
Write-Host "测试级别: $Level" -ForegroundColor Cyan
Write-Host "输出目录: $OutputDir" -ForegroundColor Cyan

# 创建输出目录
if (-Not (Test-Path $OutputDir)) {
    New-Item -ItemType Directory -Path $OutputDir
}

# 运行测试
try {
    # 记录开始时间
    $startTime = Get-Date
    
    # 根据参数构建命令
    $command = "npm run test:custom -- --device=$Device --scenario=$Scenario --level=$Level --output=$OutputDir"
    
    # 执行命令
    Write-Host "执行命令: $command" -ForegroundColor Yellow
    Invoke-Expression $command
    
    # 计算耗时
    $endTime = Get-Date
    $duration = $endTime - $startTime
    
    Write-Host "测试完成!" -ForegroundColor Green
    Write-Host "总耗时: $($duration.TotalSeconds.ToString('0.00')) 秒" -ForegroundColor Cyan
    
    # 打开报告文件
    $reportFile = Join-Path $OutputDir "report-$Device-$Scenario-$((Get-Date).ToString('yyyyMMddHHmmss')).html"
    if (Test-Path $reportFile) {
        Write-Host "打开测试报告: $reportFile" -ForegroundColor Green
        Invoke-Item $reportFile
    }
} catch {
    Write-Host "测试执行失败: $_" -ForegroundColor Red
    exit 1
}
```

## 7. 持续改进策略

为确保测试脚本的持续优化，执行以下策略：

1. **每日测试结果分析**：分析测试日志，识别改进点
2. **测试覆盖率监控**：定期评估测试覆盖范围，填补空白
3. **性能指标跟踪**：监控测试性能，优化低效测试
4. **自动化程度提升**：逐步增加自动化比例
5. **脚本共享与重用**：提取通用功能到共享库
6. **定期代码审查**：评估测试代码质量和可维护性

---

准备人员：王测试  
最后更新：2025年7月23日
