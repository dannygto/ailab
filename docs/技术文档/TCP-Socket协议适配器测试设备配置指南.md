# TCP/Socket协议适配器测试设备配置指南

*创建日期：2025年7月23日*  
*版本：1.0*

本文档提供了TCP/Socket协议适配器实际设备测试所需的设备配置详细指南。此指南适用于测试团队成员和设备管理员，用于确保所有测试设备按照标准方式配置并准备就绪。

## 1. 测试设备网络配置

### 1.1 网络环境设置

所有测试设备应连接到专用测试网络（192.168.1.0/24子网），避免生产环境干扰。确保每个设备的网络配置如下：

```
网络地址: 192.168.1.0/24
默认网关: 192.168.1.1
DNS服务器: 192.168.1.1
```

### 1.2 设备IP分配

| 设备类型 | IP地址范围 | 备注 |
|---------|------------|------|
| 测试服务器 | 192.168.1.10-19 | 包括主测试服务器和备用服务器 |
| 网络设备 | 192.168.1.20-29 | 交换机、路由器等 |
| 测试工具 | 192.168.1.30-39 | 网络分析仪、协议分析器等 |
| 实验设备 | 192.168.1.100-199 | 各类被测试的实验设备 |

## 2. 设备特定配置

### 2.1 数字多功能测量仪（DEV001）

**基本参数：**
- IP地址：192.168.1.101
- 端口：5001
- 协议：TCP纯文本，SCPI命令
- 通信模式：客户端模式

**特殊配置：**
- 命令终止符：'\r\n'
- 响应终止符：'\r\n'
- 设备识别命令：'*IDN?'
- 预期响应：'KETAI,DMM5000,SN12345,1.03'
- 保活间隔：30秒

**初始化命令：**
```
*RST                    # 设备复位
SYST:REM                # 切换到远程控制模式
CONF:VOLT:DC 10         # 配置为DC电压测量，量程10V
TRIG:SOUR BUS           # 设置触发源为总线触发
```

### 2.2 高精度示波器（DEV002）

**基本参数：**
- IP地址：192.168.1.102
- 端口：5002
- 协议：TCP二进制，专有协议
- 通信模式：服务器模式

**特殊配置：**
- 命令帧头：0xAA55
- 命令帧尾：0x55AA
- 设备识别命令：二进制序列 [0xAA, 0x55, 0x01, 0x00, 0x00, 0x01, 0x55, 0xAA]
- 预期响应：包含型号"TEK-OS2500"的二进制帧
- 数据传输大小：每帧最大8KB

**初始化命令：**
```
[0xAA, 0x55, 0x02, 0x00, 0x04, 0x01, 0x00, 0x00, 0x00, 0x07, 0x55, 0xAA]  # 通道1启用
[0xAA, 0x55, 0x03, 0x00, 0x04, 0x00, 0x00, 0xC8, 0x00, 0xCF, 0x55, 0xAA]  # 设置采样率200MHz
[0xAA, 0x55, 0x04, 0x00, 0x04, 0x00, 0x00, 0x10, 0x00, 0x18, 0x55, 0xAA]  # 设置缓冲区大小16K
```

### 2.3 环境监测系统（DEV003）

**基本参数：**
- IP地址：192.168.1.103
- 端口：5003
- 协议：TCP/JSON
- 通信模式：客户端模式
- 安全设置：需要TLS加密

**特殊配置：**
- 认证凭据：用户名"admin"，密码"Test@2025"
- 心跳间隔：60秒
- 会话超时：300秒

**初始化命令：**
```json
{
  "action": "authenticate",
  "params": {
    "username": "admin",
    "password": "Test@2025"
  }
}
```

```json
{
  "action": "configure",
  "params": {
    "samplingRate": 5,
    "units": "metric",
    "sensors": ["temperature", "humidity", "pressure", "co2"]
  }
}
```

### 2.4 工业控制器（DEV004）

**基本参数：**
- IP地址：192.168.1.104
- 端口：502
- 协议：Modbus TCP
- 通信模式：服务器模式

**特殊配置：**
- Modbus单元标识符：1
- 寄存器映射：
  - 线圈（00001-09999）：控制输出
  - 离散输入（10001-19999）：开关状态
  - 输入寄存器（30001-39999）：传感器数据
  - 保持寄存器（40001-49999）：配置参数

**初始化命令：**
- 写保持寄存器 40001 = 1（运行模式）
- 写保持寄存器 40002 = 2（通信优先级）
- 写保持寄存器 40003 = 100（响应超时ms）

### 2.5 机器人控制单元（DEV005）

**基本参数：**
- IP地址：192.168.1.105
- 端口：5005
- 协议：TCP/XML
- 通信模式：客户端模式

**特殊配置：**
- XML命令需要包含会话ID
- 命令响应成对出现
- 需要顺序执行命令

**初始化命令：**
```xml
<Command>
  <Header>
    <Name>Initialize</Name>
    <SessionId>0</SessionId>
  </Header>
  <Body>
    <Mode>Remote</Mode>
    <Speed>Normal</Speed>
    <Position>Home</Position>
  </Body>
</Command>
```

## 3. 测试配置文件创建

为每个设备创建专用的配置文件，存放在`/config/devices/`目录下，命名格式为`device-{ID}.json`。配置文件应包含：

1. 设备基本信息（ID、名称、制造商等）
2. 网络连接参数（IP、端口、协议等）
3. 通信设置（超时、重试、缓冲区等）
4. 命令格式定义（结构、分隔符等）
5. 响应解析规则
6. 错误处理策略
7. 特殊功能配置

### 示例配置文件（数字多功能测量仪）

```json
{
  "deviceId": "DEV001",
  "name": "数字多功能测量仪",
  "manufacturer": "科泰仪器",
  "model": "DMM5000",
  "connection": {
    "type": "tcp",
    "mode": "client",
    "host": "192.168.1.101",
    "port": 5001,
    "timeout": 5000,
    "reconnect": true,
    "reconnectInterval": 3000,
    "maxReconnectAttempts": 5
  },
  "protocol": {
    "type": "text",
    "commandDelimiter": "\r\n",
    "responseDelimiter": "\r\n",
    "identificationCommand": "*IDN?",
    "expectedIdentificationResponse": "KETAI,DMM5000",
    "keepAliveInterval": 30000,
    "keepAliveCommand": "*OPC?"
  },
  "commands": {
    "initialize": [
      "*RST",
      "SYST:REM",
      "CONF:VOLT:DC 10",
      "TRIG:SOUR BUS"
    ],
    "measure": "MEAS?",
    "reset": "*RST",
    "status": "SYST:ERR?"
  },
  "responseHandling": {
    "timeout": 2000,
    "parseRegex": "^([+-]?\\d+\\.?\\d*)(E[+-]?\\d+)?.*$",
    "errorPattern": "^-?\\d+,\".*\"$"
  },
  "logging": {
    "level": "debug",
    "includeTraffic": true
  },
  "tests": {
    "basicConnectivity": true,
    "commandExecution": true,
    "dataAcquisition": true,
    "errorHandling": true,
    "longTermStability": true
  }
}
```

## 4. 测试环境准备步骤

1. 检查所有设备电源和网络连接
2. 验证设备网络配置（使用ping和端口扫描）
3. 初始化各设备到已知状态
4. 验证TCP/Socket适配器与设备的基本连接
5. 使用配置文件测试基本命令执行
6. 确认日志记录功能正常工作
7. 设置网络监控工具捕获通信流量

## 5. 故障排除指南

### 5.1 连接问题

- **无法ping通设备**：检查物理连接、IP配置和网络设置
- **无法建立TCP连接**：验证端口设置、防火墙规则和设备服务状态
- **连接建立后立即断开**：检查认证要求、协议版本兼容性

### 5.2 通信问题

- **命令无响应**：验证命令格式、终止符设置和设备状态
- **收到意外响应**：检查协议解析设置、编码问题和命令序列
- **响应超时**：调整超时设置、检查设备负载和网络状况

---

准备人员：王网络、王测试  
最后更新：2025年7月23日
