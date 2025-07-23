# TCP/Socket协议适配器设备模拟器

模拟实验设备的TCP/Socket通信行为，用于适配器开发和测试。

## 使用方法

1. 安装依赖:
   ```
   npm install
   ```

2. 启动模拟器:
   ```
   ts-node ./src/backend/device/simulators/tcp-socket-device-simulator.ts
   ```

3. 配置模拟器参数:
   ```typescript
   createDeviceSimulator({
     id: 'device-001',             // 设备ID
     name: 'DSP Simulator',        // 设备名称
     type: 'processor',            // 设备类型
     mode: 'server',               // 模式: 'server'或'client'
     port: 5001,                   // 服务器模式下的监听端口
     host: '127.0.0.1',            // 客户端模式下的目标主机
     useJson: false,               // 是否使用JSON格式
     useBinary: true,              // 是否使用二进制格式
     frameDelimiter: '0xAA55',     // 帧分隔符
     responseDelay: 50,            // 响应延迟(毫秒)
     simulatedErrorRate: 0.05      // 模拟错误率(0-1)
   })
   ```

## 支持的设备类型

- processor: 数字信号处理器
- controller: 控制设备
- sensor: 传感器设备
- analyzer: 分析仪器
- robot: 机器人控制器
- reactor: 反应器
- optical: 光学设备

## 命令格式

### JSON格式设备

请求格式:
```json
{
  "cmd": "命令名称",
  "params": {
    "参数1": "值1",
    "参数2": "值2"
  }
}
```

响应格式:
```json
{
  "status": "success",
  "data": {
    "结果1": "值1",
    "结果2": "值2"
  }
}
```

### 二进制格式设备

请求格式:
```
[帧头(2字节)][命令码(1字节)][数据长度(1字节)][数据(N字节)][校验和(2字节)]
```

响应格式:
```
[帧头(2字节)][状态码(1字节)][数据长度(1字节)][数据(N字节)][校验和(2字节)]
```

## 示例代码

### 启动DSP设备模拟器
```typescript
import { createDeviceSimulator } from './tcp-socket-device-simulator';

// 创建并启动DSP设备模拟器
const dspSimulator = createDeviceSimulator({
  id: 'dsp-001',
  name: 'DSP Simulator',
  type: 'processor',
  mode: 'server',
  port: 5001,
  useBinary: true,
  frameDelimiter: '0xAA55',
  responseDelay: 20
});

dspSimulator.start().then(() => {
  console.log('DSP simulator started successfully');
});

// 注册自定义命令处理器
dspSimulator.registerCommandHandler(0x10, (data) => {
  // 处理启动处理命令
  console.log('Start process command received');
  
  // 返回成功响应
  return Buffer.from([0x00, 0x01, 0x02, 0x03]);
});
```

### 启动多个设备模拟器
```typescript
// 创建电机控制器模拟器
const motorController = createDeviceSimulator({
  id: 'motor-001',
  name: 'Motor Controller',
  type: 'controller',
  mode: 'server',
  port: 5002,
  useJson: true,
  responseDelay: 10
});

// 创建数据采集设备模拟器
const dataAcquisition = createDeviceSimulator({
  id: 'daq-001',
  name: 'Data Acquisition',
  type: 'sensor',
  mode: 'server',
  port: 5003,
  useBinary: true,
  frameSize: 256,
  responseDelay: 5
});

// 启动所有模拟器
Promise.all([
  motorController.start(),
  dataAcquisition.start()
]).then(() => {
  console.log('All device simulators started');
});
```

## API参考

### createDeviceSimulator(options)
创建一个设备模拟器实例。

### DeviceSimulator.start()
启动设备模拟器。

### DeviceSimulator.stop()
停止设备模拟器。

### DeviceSimulator.registerCommandHandler(command, handler)
注册命令处理函数。

### DeviceSimulator.unregisterCommandHandler(command)
取消注册命令处理函数。

### DeviceSimulator.sendData(data)
向连接的客户端发送数据。

### DeviceSimulator.onConnect(callback)
注册连接事件回调。

### DeviceSimulator.onDisconnect(callback)
注册断开连接事件回调。

### DeviceSimulator.onError(callback)
注册错误事件回调。

### DeviceSimulator.onData(callback)
注册数据接收事件回调。

## 默认命令集

每种设备类型都有预定义的默认命令集，可以通过`registerCommandHandler`进行自定义扩展。

### processor设备
- 0x01: 初始化
- 0x02: 复位
- 0x10: 启动处理
- 0x11: 停止处理
- 0x20: 获取状态
- 0x30: 获取数据

### controller设备
- "INIT": 初始化
- "RESET": 复位
- "SET_SPEED": 设置速度
- "SET_POS": 设置位置
- "GET_STATUS": 获取状态
- "STOP": 停止

### sensor设备
- 0x01: 初始化
- 0x02: 开始采样
- 0x03: 停止采样
- 0x04: 获取配置
- 0x05: 设置配置
- 0x06: 获取数据

## 常见问题

1. **问题**: 模拟器启动失败，端口被占用。
   **解决**: 更改模拟器配置中的端口号，或停止占用该端口的进程。

2. **问题**: 无法连接到模拟器。
   **解决**: 检查防火墙设置，确保允许该端口的TCP连接。

3. **问题**: 数据格式不正确。
   **解决**: 确认是否正确设置了useJson或useBinary参数。

4. **问题**: 二进制数据接收不完整。
   **解决**: 检查frameSize或frameDelimiter设置是否正确。

5. **问题**: 模拟器响应太慢。
   **解决**: 减小responseDelay参数值。

## 开发计划

- [ ] 添加更多设备类型支持
- [ ] 实现更复杂的响应逻辑
- [ ] 添加GUI配置界面
- [ ] 支持从配置文件加载设备定义
- [ ] 添加网络故障模拟功能

---

文档版本: 1.0.0
更新日期: 2025-07-23
