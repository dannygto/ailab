# TCP/Socket协议适配器设备集成测试说明

## 概述

本文档提供了TCP/Socket协议适配器设备集成测试的详细说明，包括测试环境、测试工具和测试流程。通过本文档，开发和测试人员可以理解如何进行TCP/Socket协议适配器与设备的集成测试。

## 测试环境

### 硬件需求

- 开发用计算机（Windows/Linux/MacOS）
- 网络环境（支持TCP/IP通信）
- 可选：实际设备（处理器、传感器等）

### 软件需求

- Node.js（v12或更高版本）
- TypeScript（v4或更高版本）
- PowerShell或命令行终端
- VS Code（推荐用于开发和调试）

## 测试工具

本测试环境包含以下测试工具：

1. **设备模拟器**
   - `device-simulator-proc.js` - 处理器设备模拟器（端口8081）
   - `device-simulator-sens.js` - 传感器设备模拟器（端口8082）

2. **测试脚本**
   - `tcp-socket-device-integration-test.ts` - TypeScript测试工具
   - `run-device-integration-test.ps1` - PowerShell测试执行脚本
   - `run-tcp-socket-test.bat` - 批处理集成测试启动脚本

## 测试准备

1. **安装依赖**

   确保已安装Node.js和TypeScript：

   ```bash
   npm install -g typescript ts-node
   ```

2. **项目依赖**

   在项目根目录下运行：

   ```bash
   npm install
   ```

## 测试流程

### 方法1：使用批处理脚本（推荐）

1. 运行批处理文件启动测试环境：

   ```bash
   .\scripts\run-tcp-socket-test.bat
   ```

2. 通过菜单选择要执行的测试类型：
   - 设备发现测试
   - 基本连接测试
   - 命令发送测试
   - 数据接收测试
   - 设备监控测试
   - 完整集成测试

3. 按照屏幕提示输入必要的参数

4. 测试完成后，可以查看生成的日志和测试报告

### 方法2：使用PowerShell脚本

1. 运行PowerShell脚本：

   ```powershell
   .\scripts\run-device-integration-test.ps1 -Mode full -Verbose
   ```

2. 可用参数说明：

   | 参数 | 说明 | 默认值 |
   |------|------|--------|
   | HostAddress | 设备主机地址 | (空) |
   | PortNumber | 设备端口号 | 0 |
   | Mode | 测试模式（discovery/connect/send/receive/monitor/full） | full |
   | Command | 发送的命令 | (空) |
   | Timeout | 超时时间(毫秒) | 10000 |
   | Verbose | 详细输出 | false |
   | Secure | 使用安全连接 | false |
   | NoDiscover | 跳过设备发现 | false |
   | Duration | 监控持续时间(秒) | 0 |
   | OutputFile | 输出文件路径 | (空) |
   | DeviceType | 设备类型 | (空) |

### 方法3：手动启动组件

1. 启动处理器设备模拟器：

   ```bash
   node scripts/device-simulator-proc.js
   ```

2. 启动传感器设备模拟器：

   ```bash
   node scripts/device-simulator-sens.js
   ```

3. 运行测试脚本：

   ```bash
   npx ts-node scripts/tcp-socket-device-integration-test.ts --type=full --verbose
   ```

## 测试类型说明

### 1. 设备发现测试

此测试使用设备发现服务扫描网络中的TCP/Socket设备。

**参数示例：**
```
--type=discovery --verbose
```

### 2. 基本连接测试

测试与设备的基本TCP连接建立和断开。

**参数示例：**
```
--type=connect --host=localhost --port=8081 --verbose
```

### 3. 命令发送测试

测试向设备发送命令并接收响应。

**参数示例：**
```
--type=send --host=localhost --port=8081 --command="*IDN?" --verbose
```

### 4. 数据接收测试

测试从设备接收数据。

**参数示例：**
```
--type=receive --host=localhost --port=8082 --verbose
```

### 5. 设备监控测试

长时间监控设备状态和数据变化。

**参数示例：**
```
--type=monitor --host=localhost --port=8082 --duration=60 --verbose
```

### 6. 完整集成测试

执行所有测试类型的综合测试。

**参数示例：**
```
--type=full --verbose
```

## 实际设备测试

要与实际设备进行测试，请按照以下步骤操作：

1. 确保设备已连接到网络并可访问
2. 获取设备的IP地址和端口号
3. 使用适当的命令格式（根据设备协议）
4. 运行测试脚本，指定实际设备的主机地址和端口

**示例：**
```
.\scripts\run-device-integration-test.ps1 -HostAddress 192.168.1.100 -PortNumber 5025 -Mode send -Command "*IDN?" -Verbose
```

## 测试结果分析

测试完成后，可以通过以下方式分析结果：

1. **控制台输出**：测试过程中的详细输出信息
2. **日志文件**：位于`logs`目录下的详细日志
3. **输出文件**：如果指定了`--output-file`参数，测试结果将保存到该文件

## 故障排除

如果遇到测试问题，请检查：

1. 网络连接是否正常
2. 设备是否已启动并可访问
3. 端口号是否正确
4. 命令格式是否符合设备要求
5. 查看日志文件获取详细错误信息

## 附录

### 处理器设备命令列表

| 命令 | 说明 | 示例响应 |
|------|------|---------|
| *IDN? | 获取设备标识 | PROC001,ProcessorSimulator,1.0.0,SN123456 |
| STATUS? | 获取设备状态 | STATUS:IDLE,TEMP:45.2,MEM:32,CPU:12 |
| ERROR? | 获取错误信息 | ERROR:0,No error |
| RESET | 重置设备 | RESET:OK |
| DATA? | 获取处理数据 | DATA:VALUE:100,SQUARED:10000,SQRT:10.00,TIMESTAMP:1627384945123 |
| PROCESS [value] | 执行数据处理 | PROCESS:OK |
| UPTIME? | 获取运行时间 | UPTIME:3600 |

### 传感器设备命令列表

| 命令 | 说明 | 示例响应 |
|------|------|---------|
| GET_INFO | 获取设备信息 | {"status":"success","deviceInfo":{...}} |
| GET_STATUS | 获取设备状态 | {"status":"success","deviceStatus":"ACTIVE",...} |
| GET_DATA | 获取所有传感器数据 | {"status":"success","sensorData":{...}} |
| GET_TEMPERATURE | 获取温度数据 | {"status":"success","temperature":22.5,"unit":"C"} |
| GET_HUMIDITY | 获取湿度数据 | {"status":"success","humidity":45.2,"unit":"%"} |
| RESET | 重置设备 | {"status":"success","message":"Device has been reset"} |
| SET_UPDATE_INTERVAL | 设置更新间隔 | {"status":"success","message":"Update interval set to 2000ms"} |
| SET_MODE | 设置设备模式 | {"status":"success","message":"Device mode set to ACTIVE"} |

---

*文档版本：1.0.0*  
*最后更新：2025-07-23*
