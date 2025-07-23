/**
 * USB设备协议适配器
 * 负责USB设备的通信和控制
 */

import { BaseProtocolAdapter } from '../base-protocol-adapter.js';
import { DeviceConnectionConfig, DeviceConnectionState } from '../types.js';
import { DeviceCommand } from '../../../models/device.model.js';

// USB设备连接配置接口扩展
export interface USBDeviceConnectionConfig extends DeviceConnectionConfig {
  vendorId: number;       // USB供应商ID (十六进制, 如 0x2341 表示Arduino)
  productId: number;      // USB产品ID
  serialNumber?: string;  // 序列号 (用于多设备区分)
  interfaceNumber?: number; // USB接口号
  endpointIn?: number;    // 输入端点
  endpointOut?: number;   // 输出端点
  baudRate?: number;      // 波特率 (如果是串行设备)
  dataBits?: number;      // 数据位 (如果是串行设备)
  stopBits?: number;      // 停止位 (如果是串行设备)
  parity?: string;        // 奇偶校验 (如果是串行设备)
  flowControl?: boolean;  // 流控制 (如果是串行设备)
  autoOpen?: boolean;     // 是否自动打开
}

// USB设备驱动适配器
export class USBDeviceAdapter extends BaseProtocolAdapter {
  // USB连接映射: deviceId -> USB连接实例
  private usbConnections: Map<string, any> = new Map();
  // 设备配置映射: deviceId -> USB设备配置
  private deviceConfigs: Map<string, USBDeviceConnectionConfig> = new Map();
  // 模拟重连定时器
  private reconnectTimers: Map<string, NodeJS.Timeout> = new Map();
  // 模拟设备数据间隔
  private dataIntervals: Map<string, NodeJS.Timeout> = new Map();

  constructor() {
    super(
      'usb-adapter',
      'USB设备适配器',
      'USB',
      ['usb', 'serial']
    );
  }

  public async initialize(): Promise<void> {
    await super.initialize();
    console.log('初始化USB设备适配器');

    // 在这里我们可以进行任何必要的USB子系统初始化
    // 例如，加载必要的库、设置监听器等

    // 实际项目中，这里可能会使用像node-usb或serialport这样的库
    // 由于这里是一个模拟实现，我们只是简单地记录日志
  }

  // 连接到USB设备
  public async connect(deviceId: string, config: DeviceConnectionConfig): Promise<boolean> {
    try {
      // 类型安全检查
      if (config.connectionType !== 'usb' && config.connectionType !== 'serial') {
        throw new Error(`不支持的连接类型: ${config.connectionType}`);
      }

      // 确保参数存在并获取参数
      if (!config.parameters) {
        throw new Error('USB连接配置缺少parameters对象');
      }

      // 从parameters对象中获取参数
      const params = config.parameters;
      const usbConfig = {
        ...config,
        vendorId: params.vendorId,
        productId: params.productId,
        serialNumber: params.serialNumber,
        interfaceNumber: params.interfaceNumber,
        endpointIn: params.endpointIn,
        endpointOut: params.endpointOut,
        baudRate: params.baudRate,
        dataBits: params.dataBits,
        stopBits: params.stopBits,
        parity: params.parity,
        flowControl: params.flowControl,
        autoOpen: params.autoOpen
      } as USBDeviceConnectionConfig;

      // 检查必要的参数
      if (!usbConfig.vendorId || !usbConfig.productId) {
        throw new Error('USB连接配置缺少vendorId或productId');
      }

      // 初始化连接状态
      this.initializeConnectionState(deviceId);

      // 存储设备配置
      this.deviceConfigs.set(deviceId, usbConfig);

      // 模拟连接过程
      console.log(`正在连接USB设备: ${deviceId}，供应商ID: 0x${usbConfig.vendorId.toString(16)}，产品ID: 0x${usbConfig.productId.toString(16)}`);

      // 在实际实现中，我们会使用适当的USB库进行连接
      // 这里我们模拟连接过程
      const connection = {
        deviceId,
        vendorId: usbConfig.vendorId,
        productId: usbConfig.productId,
        isOpen: true,
        buffer: Buffer.alloc(0),

        // 模拟方法
        write: (data: Buffer) => {
          console.log(`USB设备 ${deviceId} 写入数据: ${data.toString('hex')}`);
          return Promise.resolve(data.length);
        },

        read: () => {
          // 返回一些模拟数据
          const data = Buffer.from(`模拟数据从设备 ${deviceId} 读取 - ${new Date().toISOString()}`);
          console.log(`USB设备 ${deviceId} 读取数据: ${data.toString()}`);
          return Promise.resolve(data);
        },

        close: () => {
          console.log(`关闭USB设备连接: ${deviceId}`);
          return Promise.resolve();
        }
      };

      // 存储连接
      this.usbConnections.set(deviceId, connection);

      // 更新连接状态
      this.updateConnectionState(deviceId, {
        isConnected: true,
        lastConnected: new Date().toISOString(),
        connectionAttempts: this.getConnectionState(deviceId).connectionAttempts + 1
      });

      // 发射连接事件
      this.emitConnectedEvent(deviceId);

      // 模拟设备发送数据
      this.startDeviceDataSimulation(deviceId);

      // 模拟设备偶尔断开连接问题 (开发中的稳定性问题)
      this.simulateConnectionStabilityIssues(deviceId);

      return true;
    } catch (error) {
      // 记录错误
      console.error(`USB设备连接错误: ${error.message}`);
      this.recordError(deviceId, error.message);

      // 更新连接状态
      this.updateConnectionState(deviceId, {
        isConnected: false,
        connectionAttempts: this.getConnectionState(deviceId).connectionAttempts + 1
      });

      // 发射错误事件
      this.emitErrorEvent(deviceId, error);

      return false;
    }
  }

  // 断开USB设备连接
  public async disconnect(deviceId: string): Promise<boolean> {
    try {
      // 检查设备是否已连接
      const connection = this.usbConnections.get(deviceId);
      if (!connection) {
        // 设备未连接，直接返回成功
        return true;
      }

      // 停止数据模拟
      this.stopDeviceDataSimulation(deviceId);

      // 停止模拟连接问题
      if (this.reconnectTimers.has(deviceId)) {
        clearTimeout(this.reconnectTimers.get(deviceId));
        this.reconnectTimers.delete(deviceId);
      }

      // 关闭连接
      await connection.close();

      // 删除连接
      this.usbConnections.delete(deviceId);

      // 更新连接状态
      this.updateConnectionState(deviceId, {
        isConnected: false,
        lastDisconnected: new Date().toISOString()
      });

      // 发射断开连接事件
      this.emitDisconnectedEvent(deviceId);

      return true;
    } catch (error) {
      // 记录错误
      console.error(`USB设备断开连接错误: ${error.message}`);
      this.recordError(deviceId, error.message);

      // 强制更新连接状态为断开
      this.updateConnectionState(deviceId, { isConnected: false });

      // 清理连接资源
      this.usbConnections.delete(deviceId);

      // 发射错误事件
      this.emitErrorEvent(deviceId, error);

      // 尽管有错误，我们仍然返回true，因为设备已经被标记为断开连接
      return true;
    }
  }

  // 向USB设备发送命令
  public async sendCommand(deviceId: string, command: DeviceCommand): Promise<any> {
    try {
      // 检查设备是否已连接
      const connection = this.usbConnections.get(deviceId);
      if (!connection || !connection.isOpen) {
        throw new Error(`设备 ${deviceId} 未连接`);
      }

      // 将命令转换为Buffer
      const commandBuffer = Buffer.from(JSON.stringify(command));

      // 发送命令
      const bytesSent = await connection.write(commandBuffer);

      // 记录统计信息
      this.recordStatistics(deviceId, {
        dataSent: this.getConnectionState(deviceId).statistics.dataSent + bytesSent,
        commandsSent: this.getConnectionState(deviceId).statistics.commandsSent + 1
      });

      // 发射命令发送事件
      this.emitCommandSentEvent(deviceId, command);

      // 模拟设备响应
      const result = {
        status: 'success',
        commandId: command.id,
        timestamp: new Date().toISOString(),
        data: `Command ${command.command} executed successfully`
      };

      // 发射命令结果事件
      this.emitCommandResultEvent(deviceId, command, result);

      return result;
    } catch (error) {
      // 记录错误
      console.error(`USB设备命令错误: ${error.message}`);
      this.recordError(deviceId, error.message);

      // 发射错误事件
      this.emitErrorEvent(deviceId, error);

      throw error;
    }
  }

  // 从USB设备读取数据
  public async readData(deviceId: string, parameters?: any): Promise<any> {
    try {
      // 检查设备是否已连接
      const connection = this.usbConnections.get(deviceId);
      if (!connection || !connection.isOpen) {
        throw new Error(`设备 ${deviceId} 未连接`);
      }

      // 读取数据
      const data = await connection.read();

      // 记录统计信息
      this.recordStatistics(deviceId, {
        dataReceived: this.getConnectionState(deviceId).statistics.dataReceived + data.length,
        responsesReceived: this.getConnectionState(deviceId).statistics.responsesReceived + 1
      });

      // 转换为设备数据点格式
      const timestamp = new Date().toISOString();
      const dataPoints = [
        {
          id: `dp-${Date.now()}`,
          deviceId,
          timestamp,
          sensorType: 'temperature',
          value: 20 + Math.random() * 10,
          unit: '°C'
        },
        {
          id: `dp-${Date.now() + 1}`,
          deviceId,
          timestamp,
          sensorType: 'humidity',
          value: 40 + Math.random() * 20,
          unit: '%'
        },
        {
          id: `dp-${Date.now() + 2}`,
          deviceId,
          timestamp,
          sensorType: 'pressure',
          value: 1000 + Math.random() * 50,
          unit: 'hPa'
        }
      ];

      return dataPoints;
    } catch (error) {
      // 记录错误
      console.error(`USB设备读取错误: ${error.message}`);
      this.recordError(deviceId, error.message);

      // 发射错误事件
      this.emitErrorEvent(deviceId, error);

      throw error;
    }
  }

  // 检查特性支持
  public supportsFeature(featureName: string): boolean {
    // USB设备适配器支持的特定功能
    const supportedFeatures = [
      'raw-data',           // 原始数据访问
      'bulk-transfer',      // 批量传输
      'control-transfer',   // 控制传输
      'interrupt-transfer', // 中断传输
      'auto-reconnect',     // 自动重连
      'hot-plug'            // 热插拔
    ];

    return supportedFeatures.includes(featureName);
  }

  // 获取协议特定方法
  public getProtocolSpecificMethod(methodName: string): Function | null {
    // 提供USB特定的方法
    const methods = {
      // 重置设备
      resetDevice: (deviceId: string) => {
        console.log(`重置USB设备: ${deviceId}`);
        return Promise.resolve(true);
      },

      // 获取设备描述符
      getDeviceDescriptor: (deviceId: string) => {
        const config = this.deviceConfigs.get(deviceId);
        if (!config) {
          return null;
        }

        return {
          vendorId: config.vendorId,
          productId: config.productId,
          serialNumber: config.serialNumber || 'unknown',
          manufacturer: 'Simulated Manufacturer',
          product: 'Simulated USB Device'
        };
      },

      // 控制传输
      controlTransfer: (deviceId: string, setup: any, data: Buffer) => {
        console.log(`USB设备 ${deviceId} 控制传输: ${JSON.stringify(setup)}`);
        return Promise.resolve(Buffer.from('控制传输响应'));
      }
    };

    return methods[methodName] || null;
  }

  // 私有辅助方法

  // 模拟设备数据发送
  private startDeviceDataSimulation(deviceId: string): void {
    // 停止任何现有的模拟
    this.stopDeviceDataSimulation(deviceId);

    // 创建新的数据模拟间隔
    const interval = setInterval(() => {
      // 生成随机数据
      const data = {
        id: `data-${Date.now()}`,
        deviceId,
        timestamp: new Date().toISOString(),
        values: {
          temperature: 20 + Math.random() * 10,
          humidity: 40 + Math.random() * 20,
          light: 200 + Math.random() * 800
        }
      };

      // 发射数据接收事件
      this.emitDataReceivedEvent(deviceId, data);

      // 更新统计信息
      const dataSize = JSON.stringify(data).length;
      this.recordStatistics(deviceId, {
        dataReceived: this.getConnectionState(deviceId).statistics.dataReceived + dataSize,
        responsesReceived: this.getConnectionState(deviceId).statistics.responsesReceived + 1
      });

    }, 5000); // 每5秒发送一次数据

    // 存储间隔引用
    this.dataIntervals.set(deviceId, interval);
  }

  // 停止设备数据模拟
  private stopDeviceDataSimulation(deviceId: string): void {
    if (this.dataIntervals.has(deviceId)) {
      clearInterval(this.dataIntervals.get(deviceId));
      this.dataIntervals.delete(deviceId);
    }
  }

  // 模拟连接稳定性问题
  private simulateConnectionStabilityIssues(deviceId: string): void {
    // 为了模拟开发中遇到的USB连接稳定性问题
    // 我们随机地断开连接，然后尝试重新连接

    // 创建随机超时
    const timeout = setTimeout(async () => {
      // 只有在设备仍然连接的情况下才模拟断开
      if (this.usbConnections.has(deviceId) && this.getConnectionState(deviceId).isConnected) {
        console.log(`模拟USB设备 ${deviceId} 连接不稳定`);

        // 模拟断开连接
        const connection = this.usbConnections.get(deviceId);
        connection.isOpen = false;

        // 更新连接状态
        this.updateConnectionState(deviceId, {
          isConnected: false,
          lastDisconnected: new Date().toISOString()
        });

        // 发射断开连接事件
        this.emitDisconnectedEvent(deviceId);

        // 记录错误
        this.recordError(deviceId, '设备连接不稳定，连接已断开');

        // 发射错误事件
        this.emitErrorEvent(deviceId, new Error('设备连接不稳定，连接已断开'));

        // 尝试重新连接
        console.log(`尝试重新连接USB设备 ${deviceId}`);

        // 模拟重连过程
        setTimeout(async () => {
          try {
            // 恢复连接
            connection.isOpen = true;

            // 更新连接状态
            this.updateConnectionState(deviceId, {
              isConnected: true,
              lastConnected: new Date().toISOString(),
              connectionAttempts: this.getConnectionState(deviceId).connectionAttempts + 1
            });

            // 发射连接事件
            this.emitConnectedEvent(deviceId);

            console.log(`USB设备 ${deviceId} 已重新连接`);

            // 再次模拟稳定性问题
            this.simulateConnectionStabilityIssues(deviceId);
          } catch (error) {
            console.error(`USB设备 ${deviceId} 重新连接失败: ${error.message}`);
          }
        }, 3000); // 3秒后尝试重连
      }
    }, Math.random() * 60000 + 30000); // 30-90秒之间随机触发

    // 存储超时引用
    this.reconnectTimers.set(deviceId, timeout);
  }
}
