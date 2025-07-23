/**
 * Modbus设备协议适配器
 * 负责Modbus设备的通信和控制，支持Modbus RTU和Modbus TCP
 */

import { BaseProtocolAdapter } from '../base-protocol-adapter.js';
import { DeviceConnectionConfig, DeviceConnectionState, DeviceConnectionEventType, DeviceConnectionEvent } from '../types.js';
import { DeviceCommand } from '../../../models/device.model.js';

// Modbus设备连接配置接口扩展
export interface ModbusDeviceConnectionConfig extends DeviceConnectionConfig {
  // 通用配置
  mode: 'tcp' | 'rtu';            // Modbus模式: TCP或RTU
  timeout?: number;               // 读写超时(毫秒)
  unitId?: number;                // 设备单元ID/从站地址 (默认1)
  retryCount?: number;            // 通信失败重试次数
  autoReconnect?: boolean;        // 是否自动重连
  reconnectInterval?: number;     // 重连间隔(毫秒)
  debug?: boolean;                // 是否启用调试模式

  // Modbus TCP特有配置
  host?: string;                  // TCP模式: 主机地址
  port?: number;                  // TCP模式: 端口号 (默认502)

  // Modbus RTU特有配置
  serialPort?: string;            // RTU模式: 串口名称
  baudRate?: number;              // RTU模式: 波特率
  dataBits?: 7 | 8;               // RTU模式: 数据位
  stopBits?: 1 | 2;               // RTU模式: 停止位
  parity?: 'none' | 'even' | 'odd' | 'mark' | 'space'; // RTU模式: 奇偶校验

  // 寄存器映射配置
  registerMap?: {
    [paramName: string]: {
      address: number;              // 寄存器地址
      registerType: 'coil' | 'discrete' | 'input' | 'holding'; // 寄存器类型
      dataType?: 'boolean' | 'int16' | 'uint16' | 'int32' | 'uint32' | 'float' | 'double' | 'string'; // 数据类型
      length?: number;              // 寄存器长度(用于字符串等)
      scaling?: number;             // 缩放因子(如果需要)
      byteOrder?: 'big-endian' | 'little-endian'; // 字节序
      wordOrder?: 'big-endian' | 'little-endian'; // 字序(用于32位以上类型)
      accessMode?: 'read' | 'write' | 'read-write'; // 访问模式
    }
  };
}

// Modbus设备适配器
export class ModbusDeviceAdapter extends BaseProtocolAdapter {
  // Modbus连接映射: deviceId -> Modbus连接实例
  private modbusConnections: Map<string, any> = new Map();
  // 设备配置映射: deviceId -> Modbus设备配置
  private deviceConfigs: Map<string, ModbusDeviceConnectionConfig> = new Map();
  // 重连定时器
  private reconnectTimers: Map<string, NodeJS.Timeout> = new Map();
  // 模拟设备数据间隔
  private dataIntervals: Map<string, NodeJS.Timeout> = new Map();

  constructor() {
    super(
      'modbus-adapter',
      'Modbus设备适配器',
      'Modbus',
      ['modbus-tcp', 'modbus-rtu']
    );
  }

  public async initialize(): Promise<void> {
    await super.initialize();
    console.log('初始化Modbus设备适配器');

    // 在这里我们可以进行任何必要的Modbus库初始化
    try {
      // 尝试加载Modbus库
      console.log('正在加载Modbus通信库...');
      // 实际项目中可能需要导入如 modbus-serial 等库
      // 这里为了示例简化处理

      console.log('Modbus通信库加载成功');
    } catch (error) {
      console.error('无法加载Modbus通信库:', error);
      throw new Error('Modbus通信库初始化失败');
    }
  }

  /**
   * 连接到Modbus设备
   * @param deviceId 设备ID
   * @param config Modbus连接配置
   */
  public async connect(deviceId: string, config: DeviceConnectionConfig): Promise<boolean> {
    console.log(`正在连接Modbus设备: ${deviceId}`, config);

    try {
      // 参数验证
      if (!config || !config.parameters) {
        throw new Error('连接配置无效');
      }

      // 类型转换并提取特定参数
      const modbusConfig = config as ModbusDeviceConnectionConfig;

      if (!modbusConfig.mode) {
        throw new Error('未指定Modbus模式(TCP/RTU)');
      }

      // 保存设备配置
      this.deviceConfigs.set(deviceId, modbusConfig);

      // 根据模式创建不同类型的连接
      let modbusConnection: any;

      if (modbusConfig.mode === 'tcp') {
        // 验证TCP模式必需参数
        if (!modbusConfig.parameters.host) {
          throw new Error('未指定Modbus TCP主机地址');
        }

        // 创建TCP连接
        modbusConnection = this.createTcpConnection(deviceId, modbusConfig);
      } else if (modbusConfig.mode === 'rtu') {
        // 验证RTU模式必需参数
        if (!modbusConfig.parameters.serialPort) {
          throw new Error('未指定Modbus RTU串口');
        }

        // 创建RTU连接
        modbusConnection = this.createRtuConnection(deviceId, modbusConfig);
      } else {
        throw new Error(`不支持的Modbus模式: ${modbusConfig.mode}`);
      }

      // 存储连接实例
      this.modbusConnections.set(deviceId, modbusConnection);

      // 初始化连接状态
      this.initializeConnectionState(deviceId);

      // 在实际应用中，这里会建立真实连接
      // 为了演示，我们使用模拟连接
      await this.simulateConnect(deviceId, modbusConnection);

      // 如果配置了自动重连，设置监控
      if (modbusConfig.parameters.autoReconnect) {
        this.setupReconnectMonitor(deviceId);
      }

      // 如果需要定期读取数据，设置数据轮询
      if (modbusConfig.parameters.registerMap) {
        this.setupDataPolling(deviceId);
      }

      return true;
    } catch (error) {
      console.error(`连接Modbus设备失败: ${deviceId}`, error);

      // 记录错误
      this.recordError(deviceId, `连接失败: ${(error as Error).message}`);

      // 发送错误事件
      this.emitErrorEvent(deviceId, error as Error);

      return false;
    }
  }

  /**
   * 断开与Modbus设备的连接
   * @param deviceId 设备ID
   */
  public async disconnect(deviceId: string): Promise<boolean> {
    console.log(`断开Modbus设备连接: ${deviceId}`);

    try {
      // 获取连接实例
      const connection = this.modbusConnections.get(deviceId);
      if (!connection) {
        console.warn(`未找到设备连接: ${deviceId}`);
        return false;
      }

      // 清除重连定时器
      if (this.reconnectTimers.has(deviceId)) {
        clearTimeout(this.reconnectTimers.get(deviceId));
        this.reconnectTimers.delete(deviceId);
      }

      // 清除数据轮询定时器
      if (this.dataIntervals.has(deviceId)) {
        clearInterval(this.dataIntervals.get(deviceId));
        this.dataIntervals.delete(deviceId);
      }

      // 在实际应用中，这里会关闭真实连接
      // 为了演示，我们使用模拟断开连接
      await this.simulateDisconnect(deviceId, connection);

      // 更新连接状态
      this.updateConnectionState(deviceId, {
        isConnected: false,
        lastDisconnected: new Date().toISOString()
      });

      // 移除连接实例
      this.modbusConnections.delete(deviceId);

      // 发送断开连接事件
      this.emitDisconnectedEvent(deviceId);

      return true;
    } catch (error) {
      console.error(`断开Modbus设备连接失败: ${deviceId}`, error);

      // 记录错误
      this.recordError(deviceId, `断开连接失败: ${(error as Error).message}`);

      // 发送错误事件
      this.emitErrorEvent(deviceId, error as Error);

      return false;
    }
  }

  /**
   * 向Modbus设备发送命令
   * @param deviceId 设备ID
   * @param command 设备命令
   */
  public async sendCommand(deviceId: string, command: DeviceCommand): Promise<any> {
    console.log(`向Modbus设备发送命令: ${deviceId}`, command);

    try {
      // 获取连接实例
      const connection = this.modbusConnections.get(deviceId);
      if (!connection) {
        throw new Error(`设备未连接: ${deviceId}`);
      }

      // 获取设备配置
      const config = this.deviceConfigs.get(deviceId);
      if (!config) {
        throw new Error(`未找到设备配置: ${deviceId}`);
      }

      // 命令类型处理
      const result = await this.processCommand(deviceId, command, connection, config);

      // 发送命令发送事件
      this.emitCommandSentEvent(deviceId, command);

      // 发送命令结果事件
      this.emitCommandResultEvent(deviceId, command, result);

      // 更新统计信息
      this.recordStatistics(deviceId, {
        commandsSent: 1,
        responsesReceived: 1,
        dataSent: JSON.stringify(command).length,
        dataReceived: JSON.stringify(result).length
      });

      return result;
    } catch (error) {
      console.error(`发送Modbus命令失败: ${deviceId}`, error);

      // 记录错误
      this.recordError(deviceId, `命令执行失败: ${(error as Error).message}`);

      // 发送错误事件
      this.emitErrorEvent(deviceId, error as Error);

      throw error;
    }
  }

  /**
   * 读取设备数据
   * @param deviceId 设备ID
   * @param parameters 读取参数
   */
  public async readData(deviceId: string, parameters?: any): Promise<any> {
    console.log(`读取Modbus设备数据: ${deviceId}`, parameters);

    try {
      // 获取连接实例
      const connection = this.modbusConnections.get(deviceId);
      if (!connection) {
        throw new Error(`设备未连接: ${deviceId}`);
      }

      // 获取设备配置
      const config = this.deviceConfigs.get(deviceId);
      if (!config) {
        throw new Error(`未找到设备配置: ${deviceId}`);
      }

      // 根据参数构造读取命令
      const readCommand: DeviceCommand = {
        id: `read-${Date.now()}`,
        deviceId,
        timestamp: new Date().toISOString(),
        status: 'pending',
        command: 'read',
        parameters: parameters || {}
      };

      // 处理读取命令
      const result = await this.processCommand(deviceId, readCommand, connection, config);

      // 更新统计信息
      this.recordStatistics(deviceId, {
        commandsSent: 1,
        responsesReceived: 1,
        dataReceived: JSON.stringify(result).length
      });

      return result;
    } catch (error) {
      console.error(`读取Modbus设备数据失败: ${deviceId}`, error);

      // 记录错误
      this.recordError(deviceId, `读取数据失败: ${(error as Error).message}`);

      // 发送错误事件
      this.emitErrorEvent(deviceId, error as Error);

      throw error;
    }
  }

  /**
   * 检查是否支持特定功能
   * @param featureName 功能名称
   */
  public supportsFeature(featureName: string): boolean {
    // 支持的功能列表
    const supportedFeatures = [
      'read-coils',
      'read-discrete-inputs',
      'read-holding-registers',
      'read-input-registers',
      'write-single-coil',
      'write-multiple-coils',
      'write-single-register',
      'write-multiple-registers',
      'register-mapping',
      'data-conversion'
    ];

    return supportedFeatures.includes(featureName);
  }

  /**
   * 获取协议特定方法
   * @param methodName 方法名称
   */
  public getProtocolSpecificMethod(methodName: string): Function | null {
    switch (methodName) {
      case 'readCoils':
        return (deviceId: string, address: number, length: number) =>
          this.readCoils(deviceId, address, length);

      case 'readDiscreteInputs':
        return (deviceId: string, address: number, length: number) =>
          this.readDiscreteInputs(deviceId, address, length);

      case 'readHoldingRegisters':
        return (deviceId: string, address: number, length: number) =>
          this.readHoldingRegisters(deviceId, address, length);

      case 'readInputRegisters':
        return (deviceId: string, address: number, length: number) =>
          this.readInputRegisters(deviceId, address, length);

      case 'writeCoil':
        return (deviceId: string, address: number, value: boolean) =>
          this.writeCoil(deviceId, address, value);

      case 'writeCoils':
        return (deviceId: string, address: number, values: boolean[]) =>
          this.writeCoils(deviceId, address, values);

      case 'writeRegister':
        return (deviceId: string, address: number, value: number) =>
          this.writeRegister(deviceId, address, value);

      case 'writeRegisters':
        return (deviceId: string, address: number, values: number[]) =>
          this.writeRegisters(deviceId, address, values);

      default:
        return null;
    }
  }

  // ===== 协议特定方法 =====

  /**
   * 读取线圈状态
   */
  private async readCoils(deviceId: string, address: number, length: number): Promise<boolean[]> {
    const connection = this.modbusConnections.get(deviceId);
    if (!connection) {
      throw new Error(`设备未连接: ${deviceId}`);
    }

    return await connection.readCoils(address, length);
  }

  /**
   * 读取离散输入状态
   */
  private async readDiscreteInputs(deviceId: string, address: number, length: number): Promise<boolean[]> {
    const connection = this.modbusConnections.get(deviceId);
    if (!connection) {
      throw new Error(`设备未连接: ${deviceId}`);
    }

    return await connection.readDiscreteInputs(address, length);
  }

  /**
   * 读取保持寄存器
   */
  private async readHoldingRegisters(deviceId: string, address: number, length: number): Promise<number[]> {
    const connection = this.modbusConnections.get(deviceId);
    if (!connection) {
      throw new Error(`设备未连接: ${deviceId}`);
    }

    return await connection.readHoldingRegisters(address, length);
  }

  /**
   * 读取输入寄存器
   */
  private async readInputRegisters(deviceId: string, address: number, length: number): Promise<number[]> {
    const connection = this.modbusConnections.get(deviceId);
    if (!connection) {
      throw new Error(`设备未连接: ${deviceId}`);
    }

    return await connection.readInputRegisters(address, length);
  }

  /**
   * 写入单个线圈
   */
  private async writeCoil(deviceId: string, address: number, value: boolean): Promise<boolean> {
    const connection = this.modbusConnections.get(deviceId);
    if (!connection) {
      throw new Error(`设备未连接: ${deviceId}`);
    }

    return await connection.writeCoil(address, value);
  }

  /**
   * 写入多个线圈
   */
  private async writeCoils(deviceId: string, address: number, values: boolean[]): Promise<boolean> {
    const connection = this.modbusConnections.get(deviceId);
    if (!connection) {
      throw new Error(`设备未连接: ${deviceId}`);
    }

    return await connection.writeCoils(address, values);
  }

  /**
   * 写入单个寄存器
   */
  private async writeRegister(deviceId: string, address: number, value: number): Promise<boolean> {
    const connection = this.modbusConnections.get(deviceId);
    if (!connection) {
      throw new Error(`设备未连接: ${deviceId}`);
    }

    return await connection.writeRegister(address, value);
  }

  /**
   * 写入多个寄存器
   */
  private async writeRegisters(deviceId: string, address: number, values: number[]): Promise<boolean> {
    const connection = this.modbusConnections.get(deviceId);
    if (!connection) {
      throw new Error(`设备未连接: ${deviceId}`);
    }

    return await connection.writeRegisters(address, values);
  }

  // ===== 内部辅助方法 =====

  /**
   * 创建Modbus TCP连接
   * @param deviceId 设备ID
   * @param config Modbus配置
   */
  private createTcpConnection(deviceId: string, config: ModbusDeviceConnectionConfig): any {
    console.log(`创建Modbus TCP连接: ${deviceId}`);

    // 在实际应用中，这里会创建真实的Modbus TCP连接
    // 如使用 modbus-serial 库的 new ModbusRTU() 并调用 connectTCP()

    // 模拟连接对象
    return {
      deviceId,
      mode: 'tcp',
      host: config.parameters.host,
      port: config.parameters.port || 502,
      unitId: config.parameters.unitId || 1,
      isConnected: false,

      // 模拟方法
      connect: async () => {
        console.log(`[模拟] 连接到Modbus TCP服务器: ${config.parameters.host}:${config.parameters.port || 502}`);
        return true;
      },

      disconnect: async () => {
        console.log(`[模拟] 断开Modbus TCP连接: ${deviceId}`);
        return true;
      },

      readHoldingRegisters: async (address: number, length: number) => {
        console.log(`[模拟] 读取保持寄存器: 地址=${address}, 长度=${length}`);
        return Array.from({length}, (_, i) => 1000 + i + address);
      },

      readInputRegisters: async (address: number, length: number) => {
        console.log(`[模拟] 读取输入寄存器: 地址=${address}, 长度=${length}`);
        return Array.from({length}, (_, i) => 2000 + i + address);
      },

      readCoils: async (address: number, length: number) => {
        console.log(`[模拟] 读取线圈: 地址=${address}, 长度=${length}`);
        return Array.from({length}, (_, i) => (i + address) % 2 === 0);
      },

      readDiscreteInputs: async (address: number, length: number) => {
        console.log(`[模拟] 读取离散输入: 地址=${address}, 长度=${length}`);
        return Array.from({length}, (_, i) => (i + address) % 3 === 0);
      },

      writeRegister: async (address: number, value: number) => {
        console.log(`[模拟] 写入单个寄存器: 地址=${address}, 值=${value}`);
        return true;
      },

      writeRegisters: async (address: number, values: number[]) => {
        console.log(`[模拟] 写入多个寄存器: 地址=${address}, 值=${values}`);
        return true;
      },

      writeCoil: async (address: number, value: boolean) => {
        console.log(`[模拟] 写入单个线圈: 地址=${address}, 值=${value}`);
        return true;
      },

      writeCoils: async (address: number, values: boolean[]) => {
        console.log(`[模拟] 写入多个线圈: 地址=${address}, 值=${values}`);
        return true;
      }
    };
  }

  /**
   * 创建Modbus RTU连接
   * @param deviceId 设备ID
   * @param config Modbus配置
   */
  private createRtuConnection(deviceId: string, config: ModbusDeviceConnectionConfig): any {
    console.log(`创建Modbus RTU连接: ${deviceId}`);

    // 在实际应用中，这里会创建真实的Modbus RTU连接
    // 如使用 modbus-serial 库的 new ModbusRTU() 并调用 connectRTU()

    // 模拟连接对象
    return {
      deviceId,
      mode: 'rtu',
      serialPort: config.parameters.serialPort,
      baudRate: config.parameters.baudRate || 9600,
      unitId: config.parameters.unitId || 1,
      isConnected: false,

      // 模拟方法 - 与TCP相同的接口，实际内部实现不同
      connect: async () => {
        console.log(`[模拟] 连接到Modbus RTU设备: ${config.parameters.serialPort}, 波特率: ${config.parameters.baudRate || 9600}`);
        return true;
      },

      disconnect: async () => {
        console.log(`[模拟] 断开Modbus RTU连接: ${deviceId}`);
        return true;
      },

      // 其他方法与TCP相同
      readHoldingRegisters: async (address: number, length: number) => {
        console.log(`[模拟] 读取保持寄存器: 地址=${address}, 长度=${length}`);
        return Array.from({length}, (_, i) => 1000 + i + address);
      },

      readInputRegisters: async (address: number, length: number) => {
        console.log(`[模拟] 读取输入寄存器: 地址=${address}, 长度=${length}`);
        return Array.from({length}, (_, i) => 2000 + i + address);
      },

      readCoils: async (address: number, length: number) => {
        console.log(`[模拟] 读取线圈: 地址=${address}, 长度=${length}`);
        return Array.from({length}, (_, i) => (i + address) % 2 === 0);
      },

      readDiscreteInputs: async (address: number, length: number) => {
        console.log(`[模拟] 读取离散输入: 地址=${address}, 长度=${length}`);
        return Array.from({length}, (_, i) => (i + address) % 3 === 0);
      },

      writeRegister: async (address: number, value: number) => {
        console.log(`[模拟] 写入单个寄存器: 地址=${address}, 值=${value}`);
        return true;
      },

      writeRegisters: async (address: number, values: number[]) => {
        console.log(`[模拟] 写入多个寄存器: 地址=${address}, 值=${values}`);
        return true;
      },

      writeCoil: async (address: number, value: boolean) => {
        console.log(`[模拟] 写入单个线圈: 地址=${address}, 值=${value}`);
        return true;
      },

      writeCoils: async (address: number, values: boolean[]) => {
        console.log(`[模拟] 写入多个线圈: 地址=${address}, 值=${values}`);
        return true;
      }
    };
  }

  /**
   * 处理设备命令
   * @param deviceId 设备ID
   * @param command 命令
   * @param connection 连接实例
   * @param config 设备配置
   */
  private async processCommand(deviceId: string, command: DeviceCommand, connection: any, config: ModbusDeviceConnectionConfig): Promise<any> {
    console.log(`处理Modbus命令: ${command.command}`, command.parameters);

    switch (command.command.toLowerCase()) {
      case 'read':
        return this.handleReadCommand(deviceId, command, connection, config);

      case 'write':
        return this.handleWriteCommand(deviceId, command, connection, config);

      case 'scan':
        return this.handleScanCommand(deviceId, command, connection, config);

      default:
        throw new Error(`不支持的命令: ${command.command}`);
    }
  }

  /**
   * 处理读取命令
   */
  private async handleReadCommand(deviceId: string, command: DeviceCommand, connection: any, config: ModbusDeviceConnectionConfig): Promise<any> {
    const { registerType, address, length, paramName } = command.parameters;

    // 如果指定了参数名，从映射中获取地址和类型
    if (paramName && config.parameters.registerMap && config.parameters.registerMap[paramName]) {
      const registerInfo = config.parameters.registerMap[paramName];

      if (registerInfo.accessMode === 'write') {
        throw new Error(`参数 ${paramName} 仅可写，不可读`);
      }

      switch (registerInfo.registerType) {
        case 'holding':
          return await connection.readHoldingRegisters(registerInfo.address, registerInfo.length || 1);

        case 'input':
          return await connection.readInputRegisters(registerInfo.address, registerInfo.length || 1);

        case 'coil':
          return await connection.readCoils(registerInfo.address, registerInfo.length || 1);

        case 'discrete':
          return await connection.readDiscreteInputs(registerInfo.address, registerInfo.length || 1);

        default:
          throw new Error(`不支持的寄存器类型: ${registerInfo.registerType}`);
      }
    }

    // 直接使用命令参数
    if (!registerType || !address) {
      throw new Error('读取命令缺少必要参数: registerType, address');
    }

    const readLength = length || 1;

    switch (registerType.toLowerCase()) {
      case 'holding':
      case 'holdingregister':
        return await connection.readHoldingRegisters(address, readLength);

      case 'input':
      case 'inputregister':
        return await connection.readInputRegisters(address, readLength);

      case 'coil':
        return await connection.readCoils(address, readLength);

      case 'discrete':
      case 'discreteinput':
        return await connection.readDiscreteInputs(address, readLength);

      default:
        throw new Error(`不支持的寄存器类型: ${registerType}`);
    }
  }

  /**
   * 处理写入命令
   */
  private async handleWriteCommand(deviceId: string, command: DeviceCommand, connection: any, config: ModbusDeviceConnectionConfig): Promise<any> {
    const { registerType, address, value, values, paramName } = command.parameters;

    // 如果指定了参数名，从映射中获取地址和类型
    if (paramName && config.parameters.registerMap && config.parameters.registerMap[paramName]) {
      const registerInfo = config.parameters.registerMap[paramName];

      if (registerInfo.accessMode === 'read') {
        throw new Error(`参数 ${paramName} 仅可读，不可写`);
      }

      switch (registerInfo.registerType) {
        case 'holding':
          if (Array.isArray(value) || values) {
            return await connection.writeRegisters(registerInfo.address, Array.isArray(value) ? value : values);
          } else {
            return await connection.writeRegister(registerInfo.address, value);
          }

        case 'coil':
          if (Array.isArray(value) || values) {
            return await connection.writeCoils(registerInfo.address, Array.isArray(value) ? value : values);
          } else {
            return await connection.writeCoil(registerInfo.address, Boolean(value));
          }

        case 'input':
        case 'discrete':
          throw new Error(`寄存器类型 ${registerInfo.registerType} 不支持写入操作`);

        default:
          throw new Error(`不支持的寄存器类型: ${registerInfo.registerType}`);
      }
    }

    // 直接使用命令参数
    if (!registerType || !address || (value === undefined && values === undefined)) {
      throw new Error('写入命令缺少必要参数: registerType, address, value/values');
    }

    switch (registerType.toLowerCase()) {
      case 'holding':
      case 'holdingregister':
        if (Array.isArray(value) || values) {
          return await connection.writeRegisters(address, Array.isArray(value) ? value : values);
        } else {
          return await connection.writeRegister(address, value);
        }

      case 'coil':
        if (Array.isArray(value) || values) {
          return await connection.writeCoils(address, Array.isArray(value) ? value : values);
        } else {
          return await connection.writeCoil(address, Boolean(value));
        }

      case 'input':
      case 'inputregister':
      case 'discrete':
      case 'discreteinput':
        throw new Error(`寄存器类型 ${registerType} 不支持写入操作`);

      default:
        throw new Error(`不支持的寄存器类型: ${registerType}`);
    }
  }

  /**
   * 处理扫描命令 - 扫描一系列寄存器
   */
  private async handleScanCommand(deviceId: string, command: DeviceCommand, connection: any, config: ModbusDeviceConnectionConfig): Promise<any> {
    const { startAddress, endAddress, registerType } = command.parameters;

    if (!registerType || startAddress === undefined || endAddress === undefined) {
      throw new Error('扫描命令缺少必要参数: registerType, startAddress, endAddress');
    }

    if (endAddress < startAddress) {
      throw new Error('结束地址不能小于起始地址');
    }

    const length = endAddress - startAddress + 1;

    // 根据不同寄存器类型执行不同的读取方法
    switch (registerType.toLowerCase()) {
      case 'holding':
      case 'holdingregister':
        return await connection.readHoldingRegisters(startAddress, length);

      case 'input':
      case 'inputregister':
        return await connection.readInputRegisters(startAddress, length);

      case 'coil':
        return await connection.readCoils(startAddress, length);

      case 'discrete':
      case 'discreteinput':
        return await connection.readDiscreteInputs(startAddress, length);

      default:
        throw new Error(`不支持的寄存器类型: ${registerType}`);
    }
  }

  /**
   * 模拟连接到设备
   * @param deviceId 设备ID
   * @param connection 连接实例
   */
  private async simulateConnect(deviceId: string, connection: any): Promise<void> {
    console.log(`[模拟] 连接到Modbus设备: ${deviceId}`);

    // 模拟连接延迟
    await new Promise(resolve => setTimeout(resolve, 500));

    // 设置连接状态
    connection.isConnected = true;

    // 更新连接状态
    this.updateConnectionState(deviceId, {
      isConnected: true,
      lastConnected: new Date().toISOString()
    });

    // 发送连接事件
    this.emitConnectedEvent(deviceId);
  }

  /**
   * 模拟断开连接
   * @param deviceId 设备ID
   * @param connection 连接实例
   */
  private async simulateDisconnect(deviceId: string, connection: any): Promise<void> {
    console.log(`[模拟] 断开Modbus设备连接: ${deviceId}`);

    // 模拟断开延迟
    await new Promise(resolve => setTimeout(resolve, 300));

    // 设置连接状态
    connection.isConnected = false;
  }

  /**
   * 设置自动重连监控
   * @param deviceId 设备ID
   */
  private setupReconnectMonitor(deviceId: string): void {
    console.log(`设置Modbus设备重连监控: ${deviceId}`);

    // 获取设备配置
    const config = this.deviceConfigs.get(deviceId);
    if (!config) {
      return;
    }

    // 模拟重连监控 - 在实际项目中，这里会监听连接断开事件
    const reconnectInterval = config.parameters.reconnectInterval || 5000;

    // 每隔一段时间检查连接状态，如果断开则尝试重连
    const timer = setInterval(async () => {
      const connection = this.modbusConnections.get(deviceId);
      if (!connection || !connection.isConnected) {
        console.log(`检测到Modbus设备连接断开，尝试重连: ${deviceId}`);
        try {
          await this.connect(deviceId, config);
        } catch (error) {
          console.error(`Modbus设备重连失败: ${deviceId}`, error);
        }
      }
    }, reconnectInterval);

    // 保存定时器以便后续清理
    this.reconnectTimers.set(deviceId, timer);
  }

  /**
   * 设置数据轮询
   * @param deviceId 设备ID
   */
  private setupDataPolling(deviceId: string): void {
    console.log(`设置Modbus设备数据轮询: ${deviceId}`);

    // 获取设备配置
    const config = this.deviceConfigs.get(deviceId);
    if (!config || !config.parameters.registerMap) {
      return;
    }

    // 设置轮询间隔，默认1秒
    const pollingInterval = config.parameters.pollingInterval || 1000;

    // 定期读取所有可读寄存器
    const timer = setInterval(async () => {
      try {
        const connection = this.modbusConnections.get(deviceId);
        if (!connection || !connection.isConnected) {
          return;
        }

        // 从寄存器映射中找出所有可读寄存器
        const registerMap = config.parameters.registerMap;
        const readableParams = Object.keys(registerMap).filter(paramName => {
          const param = registerMap[paramName];
          return param.accessMode !== 'write';
        });

        // 按类型分组批量读取
        const readings: Record<string, any> = {};

        for (const paramName of readableParams) {
          try {
            // 为每个参数创建读取命令
            const readCommand: DeviceCommand = {
              id: `read-param-${paramName}-${Date.now()}`,
              deviceId,
              timestamp: new Date().toISOString(),
              status: 'pending',
              command: 'read',
              parameters: { paramName }
            };

            // 读取数据
            const value = await this.handleReadCommand(deviceId, readCommand, connection, config);
            readings[paramName] = value;
          } catch (error) {
            console.error(`读取参数失败: ${paramName}`, error);
          }
        }

        // 如果有读取到的数据，发送数据事件
        if (Object.keys(readings).length > 0) {
          // 发送数据接收事件
          this.emitDataReceivedEvent(deviceId, readings);

          // 更新统计信息
          this.recordStatistics(deviceId, {
            dataReceived: JSON.stringify(readings).length
          });
        }
      } catch (error) {
        console.error(`Modbus数据轮询错误: ${deviceId}`, error);
      }
    }, pollingInterval);

    // 保存定时器以便后续清理
    this.dataIntervals.set(deviceId, timer);
  }
}
