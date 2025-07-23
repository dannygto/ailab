# TCP/Socket协议适配器设备集成测试指南

本文档提供了TCP/Socket协议适配器设备集成测试的详细指南，包括测试环境准备、测试方法和结果分析。

## 1. 测试工具介绍

我们开发了两个主要工具来进行TCP/Socket协议适配器的设备集成测试：

1. **设备集成测试脚本 (device-integration-test-v2.ts)**
   - 支持自动测试和交互式测试模式
   - 提供标准命令集支持多种设备类型
   - 记录详细的测试结果和性能指标

2. **测试执行脚本 (run-device-integration-test-v2.ps1)**
   - 提供简单的命令行界面
   - 自动检查并安装依赖项
   - 支持自定义测试参数

## 2. 测试环境准备

### 2.1 网络环境

按照行动计划，需要准备一个完整的网络环境：

- 有线网络连接：用于稳定连接需求高的设备
- 无线网络连接：用于测试在Wi-Fi环境下的性能
- 网络交换机：用于连接多个设备
- 协议转换器：用于将非TCP/IP设备接入测试网络

### 2.2 测试设备

按照测试计划，需要准备以下测试设备：

1. **GX-5000**：电子类设备，基本命令协议
2. **OS-2500**：光学设备，复杂数据传输
3. **MC-3000**：机械设备，异步控制模式
4. **CH-7000**：化学设备，高精度数据传输
5. **TH-1200**：热学设备，实时监控模式

### 2.3 配置文件

为每个设备创建配置文件，放置在`config/devices/`目录下：

```
config/devices/
  ├── gx-5000.json
  ├── os-2500.json
  ├── mc-3000.json
  ├── ch-7000.json
  └── th-1200.json
```

配置文件示例（gx-5000.json）：

```json
{
  "host": "192.168.1.200",
  "port": 5000,
  "deviceType": "electronic",
  "commandDelimiter": "\r\n",
  "responseTimeout": 3000,
  "secure": false,
  "reconnectAttempts": 3,
  "reconnectDelay": 1000,
  "connectionTimeout": 5000,
  "bufferSize": 8192,
  "idleTimeout": 60000,
  "keepAlive": true,
  "noDelay": true,
  "protocolSignatures": [
    {
      "pattern": "^GX-5000",
      "type": "electronic",
      "source": "identification"
    }
  ],
  "notes": "GX-5000模拟设备，用于TCP/Socket协议适配器集成测试"
}
```

## 3. 测试方法

### 3.1 基本连接测试

按照测试计划（7月27-31日），首先进行基本连接测试：

```powershell
# 测试与GX-5000设备的基本连接
.\scripts\run-device-integration-test-v2.ps1 -Device GX-5000

# 指定自定义主机和端口
.\scripts\run-device-integration-test-v2.ps1 -Device GX-5000 -Host 192.168.1.201 -Port 4001
```

### 3.2 交互式测试

对于需要手动操作的场景，使用交互式模式：

```powershell
# 启动交互式会话
.\scripts\run-device-integration-test-v2.ps1 -Device OS-2500 -Mode interactive
```

在交互式模式中，可以：
- 输入预设命令的序号执行标准命令
- 输入自定义命令进行特殊测试
- 输入`exit`退出交互式会话

### 3.3 高级功能测试

按照测试计划（8月1-3日），进行高级功能测试：

```powershell
# 测试安全连接
.\scripts\run-device-integration-test-v2.ps1 -Device CH-7000 -Secure

# 增加超时时间处理慢速设备
.\scripts\run-device-integration-test-v2.ps1 -Device OS-2500 -Timeout 10000

# 详细输出模式
.\scripts\run-device-integration-test-v2.ps1 -Device MC-3000 -VerboseOutput
```

### 3.4 稳定性测试

按照测试计划（8月4-5日），进行长时间稳定性测试：

```powershell
# 输出到指定文件
.\scripts\run-device-integration-test-v2.ps1 -Device TH-1200 -OutputFile "logs/stability-test-24h.json"
```

稳定性测试应在24小时内持续监控资源使用情况。

## 4. 测试结果分析

### 4.1 结果文件

测试结果保存在`logs/test-results/`目录下，格式为JSON：

```
logs/test-results/
  ├── GX-5000-2025-07-27T10-15-30-000Z.json
  ├── OS-2500-2025-07-28T14-22-05-000Z.json
  └── ...
```

### 4.2 分析方法

每个测试结果文件包含以下关键指标：

- **命令成功率**：成功执行的命令百分比
- **平均响应时间**：所有命令的平均响应时间
- **错误类型分布**：失败命令的错误类型统计
- **系统信息**：测试环境的系统信息

使用以下标准评估测试结果：

| 指标 | 优秀 | 良好 | 一般 | 不合格 |
|------|------|------|------|--------|
| 命令成功率 | >95% | 85-95% | 70-85% | <70% |
| 平均响应时间 | <100ms | 100-300ms | 300-500ms | >500ms |
| 连接稳定性 | 无断开 | 偶尔断开但自动重连 | 需手动重连 | 频繁断开 |

### 4.3 问题诊断

常见问题及解决方法：

1. **连接超时**
   - 检查网络连接和防火墙设置
   - 验证设备IP地址和端口配置
   - 检查设备电源和网络接口状态

2. **命令响应错误**
   - 验证命令格式和终止符
   - 检查设备是否处于正确的操作模式
   - 检查命令权限要求

3. **数据格式问题**
   - 检查数据编码（ASCII、UTF-8等）
   - 验证二进制数据的解析方法
   - 检查特殊字符处理

## 5. 测试计划时间表

按照项目计划，设备集成测试按以下时间表执行：

| 阶段 | 时间 | 任务 |
|------|------|------|
| 准备阶段 | 7月26日 | 准备测试环境、配置文件和测试设备 |
| 基本测试 | 7月27-31日 | 基本连接测试、设备发现和命令测试 |
| 功能测试 | 8月1-3日 | 高级功能测试、安全测试和错误恢复测试 |
| 稳定性测试 | 8月4-5日 | 24小时连续运行测试和资源监控 |
| 报告生成 | 8月6-7日 | 分析测试结果并生成测试报告 |

## 6. 附录

### 6.1 设备命令参考

每个设备支持的标准命令列表：

**GX-5000**
- `*IDN?` - 获取设备标识
- `MEAS:VOLT:DC?` - 测量直流电压
- `MEAS:CURR:DC?` - 测量直流电流
- `MEAS:RES?` - 测量电阻

**OS-2500**
- `ID` - 获取设备标识
- `SCAN` - 执行光谱扫描
- `RANGE 400,700` - 设置波长范围
- `DATA?` - 获取扫描数据

**MC-3000**
- `getID` - 获取设备标识
- `setForce 100` - 设置力度
- `startTest` - 开始测试
- `getResults` - 获取测试结果

**CH-7000**
- `?ID` - 获取设备标识
- `START` - 开始分析
- `SAMPLE 1` - 选择样本
- `RESULTS?` - 获取分析结果

**TH-1200**
- `ID?` - 获取设备标识
- `SET TEMP=25.0` - 设置温度
- `START` - 开始测试
- `GET DATA` - 获取数据

### 6.2 故障排除

如果测试工具无法运行，请尝试以下方法：

1. 确认已安装Node.js (v14+)
2. 安装必要的全局包：`npm install -g typescript ts-node`
3. 检查是否有权限问题：`Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned`
4. 确保后端项目已完成npm安装：`cd src/backend && npm install`

### 6.3 日志分析工具

可以使用提供的日志分析工具生成测试报告：

```powershell
# 分析所有测试结果并生成HTML报告
node scripts/analyze-test-results.js --output reports/integration-test-report.html
```

---

**版本**: 1.0.0  
**日期**: 2025-07-24  
**作者**: AI实验室开发团队
