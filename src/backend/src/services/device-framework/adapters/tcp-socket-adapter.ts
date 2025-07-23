/**
 * TCP/Socket协议适配器
 * 支持Socket连接的设备通信
 */

import * as net from 'net';
import { EventEmitter } from 'events';
import {
  DeviceConnectionConfig,
  DeviceConnectionEventType,
  DeviceConnectionEvent,
  DeviceConnectionState
} from '../types.js';
import { DeviceCommand } from '../../../models/device.model.js';
import { BaseProtocolAdapter } from '../base-protocol-adapter.js';

// TCP/Socket命令接口
interface TcpSocketCommand {
  data: string | Buffer | Record<string, any>;
  encoding?: BufferEncoding;
  binary?: boolean;
  expectResponse?: boolean;
  responseTimeout?: number;
}

// TCP/Socket设备连接配置
export interface TcpSocketDeviceConnectionConfig extends DeviceConnectionConfig {
  // 连接类型，必须为'tcp-socket'
  connectionType: 'tcp-socket';
  // 服务器地址
  host: string;
  // 服务器端口
  port: number;
  // 连接超时(毫秒)
  timeout?: number;
  // 自动重连
  autoReconnect?: boolean;
  // 重连间隔(毫秒)
  reconnectInterval?: number;
  // 最大重连次数
  maxReconnectAttempts?: number;
  // 保持连接
  keepAlive?: boolean;
  // 连接建立后的初始化命令
  initCommands?: Array<{
    data: string | Buffer;
    encoding?: BufferEncoding;
    waitForResponse?: boolean;
    responseTimeout?: number;
  }>;
  // 数据包分隔符（用于数据流解析）
  delimiter?: string | Buffer;
  // 数据编码
  encoding?: BufferEncoding;
  // 是否使用二进制模式
  binary?: boolean;
}

// TCP/Socket适配器类
export class TcpSocketDeviceAdapter extends BaseProtocolAdapter {
  // Socket连接映射: deviceId -> net.Socket
  private socketConnections: Map<string, net.Socket> = new Map();
  // 设备配置映射: deviceId -> TCP/Socket设备配置
  private deviceConfigs: Map<string, TcpSocketDeviceConnectionConfig> = new Map();
  // 重连定时器
  private reconnectTimers: Map<string, NodeJS.Timeout> = new Map();
  // 接收数据缓冲区
  private dataBuffers: Map<string, Buffer[]> = new Map();
  // 命令响应回调
  private commandCallbacks: Map<string, Array<{
    resolve: (value: any) => void;
    reject: (reason: any) => void;
    timeout: NodeJS.Timeout;
  }>> = new Map();
  // 模拟数据间隔
  private dataIntervals: Map<string, NodeJS.Timeout> = new Map();

  constructor() {
    super(
      'tcp-socket-adapter',
      'TCP/Socket设备适配器',
      'TCP/Socket',
      ['tcp-socket']
    );
  }

  public async initialize(): Promise<void> {
    await super.initialize();
    console.log('初始化TCP/Socket设备适配器');
  }

  // 实现连接方法
  public async connect(deviceId: string, config: DeviceConnectionConfig): Promise<boolean> {
    // 参数验证
    if (config.connectionType !== 'tcp-socket') {
      throw new Error(`不支持的连接类型: ${config.connectionType}`);
    }

    const socketConfig = config as TcpSocketDeviceConnectionConfig;

    // 保存设备配置
    this.deviceConfigs.set(deviceId, socketConfig);

    // 创建初始连接状态
    if (!this.connectionStates.has(deviceId)) {
      this.connectionStates.set(deviceId, this.createDefaultConnectionState());
    }

    // 获取当前连接状态
    const connectionState = this.connectionStates.get(deviceId);
    connectionState.connectionAttempts++;

    // 如果已连接，先断开连接
    if (this.socketConnections.has(deviceId)) {
      await this.disconnect(deviceId);
    }

    try {
      // 创建Socket连接
      const socket = new net.Socket();
      const { host, port, timeout = 5000, keepAlive = true } = socketConfig;

      // 设置超时
      socket.setTimeout(timeout);

      // 设置保持连接
      if (keepAlive) {
        socket.setKeepAlive(true, 60000); // 60秒
      }

      // 设置事件监听
      this.setupSocketEventListeners(deviceId, socket);

      // 连接到服务器
      return new Promise<boolean>((resolve, reject) => {
        // 连接成功处理
        const onConnect = () => {
          // 更新连接状态
          connectionState.isConnected = true;
          connectionState.lastConnected = new Date().toISOString();

          // 保存Socket连接
          this.socketConnections.set(deviceId, socket);

          // 移除临时事件监听
          socket.removeListener('connect', onConnect);
          socket.removeListener('error', onError);
          socket.removeListener('timeout', onTimeout);

          // 发送初始化命令
          this.sendInitCommands(deviceId, socketConfig.initCommands);

          // 触发连接事件
          this.emitConnectionEvent(deviceId, DeviceConnectionEventType.CONNECTED, {
            message: `设备 ${deviceId} 已连接到 ${host}:${port}`
          });

          // 开始模拟数据产生（仅用于测试）
          if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
            this.startGeneratingMockData(deviceId);
          }

          resolve(true);
        };

        // 错误处理
        const onError = (err: Error) => {
          // 更新连接状态
          connectionState.isConnected = false;
          connectionState.lastDisconnected = new Date().toISOString();
          connectionState.errors.push({
            message: `连接错误: ${err.message}`,
            timestamp: new Date().toISOString()
          });

          // 移除临时事件监听
          socket.removeListener('connect', onConnect);
          socket.removeListener('error', onError);
          socket.removeListener('timeout', onTimeout);

          // 触发错误事件
          this.emitConnectionEvent(deviceId, DeviceConnectionEventType.ERROR, {
            error: err,
            message: `设备 ${deviceId} 连接错误: ${err.message}`
          });

          // 尝试重连
          if (socketConfig.autoReconnect) {
            this.scheduleReconnect(deviceId);
          }

          reject(err);
        };

        // 超时处理
        const onTimeout = () => {
          // 更新连接状态
          connectionState.errors.push({
            message: '连接超时',
            timestamp: new Date().toISOString()
          });

          // 移除临时事件监听
          socket.removeListener('connect', onConnect);
          socket.removeListener('error', onError);
          socket.removeListener('timeout', onTimeout);

          // 触发错误事件
          this.emitConnectionEvent(deviceId, DeviceConnectionEventType.ERROR, {
            message: `设备 ${deviceId} 连接超时`
          });

          socket.destroy();

          // 尝试重连
          if (socketConfig.autoReconnect) {
            this.scheduleReconnect(deviceId);
          }

          reject(new Error('连接超时'));
        };

        // 添加临时事件监听
        socket.once('connect', onConnect);
        socket.once('error', onError);
        socket.once('timeout', onTimeout);

        // 开始连接
        socket.connect(port, host);
      });
    } catch (error) {
      // 更新连接状态
      connectionState.isConnected = false;
      connectionState.lastDisconnected = new Date().toISOString();
      connectionState.errors.push({
        message: `连接异常: ${error.message}`,
        timestamp: new Date().toISOString()
      });

      // 触发错误事件
      this.emitConnectionEvent(deviceId, DeviceConnectionEventType.ERROR, {
        error,
        message: `设备 ${deviceId} 连接异常: ${error.message}`
      });

      // 尝试重连
      const socketConfig = this.deviceConfigs.get(deviceId);
      if (socketConfig?.autoReconnect) {
        this.scheduleReconnect(deviceId);
      }

      throw error;
    }
  }

  // 实现断开连接方法
  public async disconnect(deviceId: string): Promise<boolean> {
    // 停止重连计划
    if (this.reconnectTimers.has(deviceId)) {
      clearTimeout(this.reconnectTimers.get(deviceId));
      this.reconnectTimers.delete(deviceId);
    }

    // 停止模拟数据生成
    this.stopGeneratingMockData(deviceId);

    // 获取Socket连接
    const socket = this.socketConnections.get(deviceId);
    if (!socket) {
      return false;
    }

    // 清除命令回调
    if (this.commandCallbacks.has(deviceId)) {
      const callbacks = this.commandCallbacks.get(deviceId);
      callbacks.forEach(callback => {
        clearTimeout(callback.timeout);
        callback.reject(new Error('设备断开连接'));
      });
      this.commandCallbacks.delete(deviceId);
    }

    // 更新连接状态
    const connectionState = this.connectionStates.get(deviceId);
    if (connectionState) {
      connectionState.isConnected = false;
      connectionState.lastDisconnected = new Date().toISOString();
    }

    // 移除Socket监听
    socket.removeAllListeners();

    return new Promise<boolean>((resolve) => {
      // 等待Socket关闭
      socket.end(() => {
        socket.destroy();
        this.socketConnections.delete(deviceId);

        // 触发断开连接事件
        this.emitConnectionEvent(deviceId, DeviceConnectionEventType.DISCONNECTED, {
          message: `设备 ${deviceId} 已断开连接`
        });

        resolve(true);
      });
    });
  }

  // 实现发送命令方法
  public async sendCommand(deviceId: string, command: DeviceCommand | TcpSocketCommand): Promise<any> {
    // 检查连接状态
    if (!this.isDeviceConnected(deviceId)) {
      throw new Error(`设备 ${deviceId} 未连接`);
    }

    // 获取Socket连接
    const socket = this.socketConnections.get(deviceId);
    const config = this.deviceConfigs.get(deviceId);

    // 获取命令数据
    let data: Buffer;
    const tcpCommand = command as TcpSocketCommand;

    if (tcpCommand.binary && Buffer.isBuffer(tcpCommand.data)) {
      data = tcpCommand.data;
    } else if (typeof tcpCommand.data === 'string') {
      data = Buffer.from(tcpCommand.data, tcpCommand.encoding || config.encoding || 'utf8');
    } else if (Buffer.isBuffer(tcpCommand.data)) {
      data = tcpCommand.data;
    } else {
      data = Buffer.from(JSON.stringify(tcpCommand.data), tcpCommand.encoding || config.encoding || 'utf8');
    }

    // 更新统计信息
    const connectionState = this.connectionStates.get(deviceId);
    connectionState.statistics.dataSent += data.length;
    connectionState.statistics.commandsSent++;

    // 发送数据
    return new Promise<any>((resolve, reject) => {
      // 写入数据
      socket.write(data, (err) => {
        if (err) {
          // 错误处理
          connectionState.errors.push({
            message: `发送命令错误: ${err.message}`,
            timestamp: new Date().toISOString()
          });

          this.emitConnectionEvent(deviceId, DeviceConnectionEventType.ERROR, {
            error: err,
            message: `设备 ${deviceId} 发送命令错误: ${err.message}`
          });

          reject(err);
          return;
        }

        // 是否等待响应
        const tcpCommand = command as TcpSocketCommand;
        if (tcpCommand.expectResponse) {
          // 创建命令回调
          if (!this.commandCallbacks.has(deviceId)) {
            this.commandCallbacks.set(deviceId, []);
          }

          // 设置超时
          const timeout = setTimeout(() => {
            // 移除回调
            const callbacks = this.commandCallbacks.get(deviceId);
            const index = callbacks.findIndex(cb => cb.resolve === resolver);
            if (index !== -1) {
              callbacks.splice(index, 1);
            }

            // 记录错误
            connectionState.errors.push({
              message: '命令响应超时',
              timestamp: new Date().toISOString()
            });

            reject(new Error('命令响应超时'));
          }, tcpCommand.responseTimeout || 5000);

          // 创建解析器
          const resolver = (response: any) => {
            resolve(response);
          };

          // 添加回调
          this.commandCallbacks.get(deviceId).push({
            resolve: resolver,
            reject,
            timeout
          });
        } else {
          // 不等待响应，直接返回成功
          resolve(null);
        }
      });
    });
  }

  // 实现读取数据方法
  public async readData(deviceId: string, parameters?: any): Promise<any> {
    // 检查连接状态
    if (!this.isDeviceConnected(deviceId)) {
      throw new Error(`设备 ${deviceId} 未连接`);
    }

    // 对于TCP/Socket连接，读取操作通常是发送一个请求命令，然后等待响应
    // 这里我们将参数转换为命令
    const command: TcpSocketCommand = {
      data: parameters?.data || '',
      expectResponse: true,
      responseTimeout: parameters?.timeout || 5000,
      encoding: parameters?.encoding,
      binary: parameters?.binary
    };

    // 使用sendCommand实现
    return this.sendCommand(deviceId, command);
  }

  // 检查设备是否已连接
  private isDeviceConnected(deviceId: string): boolean {
    return this.socketConnections.has(deviceId) &&
           this.connectionStates.has(deviceId) &&
           this.connectionStates.get(deviceId).isConnected;
  }

  // 设置Socket事件监听
  private setupSocketEventListeners(deviceId: string, socket: net.Socket): void {
    const config = this.deviceConfigs.get(deviceId);
    const connectionState = this.connectionStates.get(deviceId);

    // 数据接收事件
    socket.on('data', (data: Buffer) => {
      // 更新统计信息
      connectionState.statistics.dataReceived += data.length;
      connectionState.statistics.responsesReceived++;

      // 处理数据
      this.handleReceivedData(deviceId, data);
    });

    // 错误事件
    socket.on('error', (err: Error) => {
      // 更新连接状态
      connectionState.isConnected = false;
      connectionState.lastDisconnected = new Date().toISOString();
      connectionState.errors.push({
        message: `Socket错误: ${err.message}`,
        timestamp: new Date().toISOString()
      });

      // 触发错误事件
      this.emitConnectionEvent(deviceId, DeviceConnectionEventType.ERROR, {
        error: err,
        message: `设备 ${deviceId} Socket错误: ${err.message}`
      });

      // 关闭Socket
      socket.destroy();
      this.socketConnections.delete(deviceId);

      // 尝试重连
      if (config.autoReconnect) {
        this.scheduleReconnect(deviceId);
      }
    });

    // 超时事件
    socket.on('timeout', () => {
      // 更新连接状态
      connectionState.errors.push({
        message: 'Socket超时',
        timestamp: new Date().toISOString()
      });

      // 触发错误事件
      this.emitConnectionEvent(deviceId, DeviceConnectionEventType.ERROR, {
        message: `设备 ${deviceId} Socket超时`
      });

      // 关闭Socket
      socket.destroy();
      this.socketConnections.delete(deviceId);
      connectionState.isConnected = false;
      connectionState.lastDisconnected = new Date().toISOString();

      // 尝试重连
      if (config.autoReconnect) {
        this.scheduleReconnect(deviceId);
      }
    });

    // 关闭事件
    socket.on('close', (hadError: boolean) => {
      // 如果不是由错误导致的关闭，更新连接状态
      if (!hadError) {
        connectionState.isConnected = false;
        connectionState.lastDisconnected = new Date().toISOString();

        // 触发断开连接事件
        this.emitConnectionEvent(deviceId, DeviceConnectionEventType.DISCONNECTED, {
          message: `设备 ${deviceId} Socket关闭`
        });
      }

      // 移除Socket
      this.socketConnections.delete(deviceId);

      // 尝试重连
      if (config.autoReconnect && !hadError) {
        this.scheduleReconnect(deviceId);
      }
    });
  }

  // 处理接收到的数据
  private handleReceivedData(deviceId: string, data: Buffer): void {
    const config = this.deviceConfigs.get(deviceId);

    // 添加到缓冲区
    if (!this.dataBuffers.has(deviceId)) {
      this.dataBuffers.set(deviceId, []);
    }
    this.dataBuffers.get(deviceId).push(data);

    // 处理分隔符
    let processedData: Buffer | string;
    if (config.delimiter) {
      // 如果有分隔符，需要解析数据包
      processedData = this.parseDataPackets(deviceId);
    } else {
      // 没有分隔符，直接合并所有缓冲区数据
      processedData = Buffer.concat(this.dataBuffers.get(deviceId));
      this.dataBuffers.set(deviceId, []); // 清空缓冲区
    }

    // 如果有数据需要处理
    if (processedData && (Buffer.isBuffer(processedData) && processedData.length > 0) ||
        (typeof processedData === 'string' && processedData.length > 0)) {
      // 转换数据格式
      let finalData: any;
      if (config.binary) {
        finalData = processedData; // 保持为Buffer
      } else {
        try {
          const textData = Buffer.isBuffer(processedData)
            ? processedData.toString(config.encoding || 'utf8')
            : processedData;

          // 尝试解析JSON
          try {
            finalData = JSON.parse(textData);
          } catch {
            finalData = textData; // 如果不是JSON，保持为字符串
          }
        } catch (err) {
          // 解析错误，使用原始数据
          finalData = processedData;
        }
      }

      // 触发数据接收事件
      this.emitConnectionEvent(deviceId, DeviceConnectionEventType.DATA_RECEIVED, {
        data: finalData,
        timestamp: new Date().toISOString()
      });

      // 处理命令回调
      if (this.commandCallbacks.has(deviceId) && this.commandCallbacks.get(deviceId).length > 0) {
        const callback = this.commandCallbacks.get(deviceId).shift();
        clearTimeout(callback.timeout);
        callback.resolve(finalData);
      }
    }
  }

  // 解析数据包（处理分隔符）
  private parseDataPackets(deviceId: string): Buffer | string {
    const config = this.deviceConfigs.get(deviceId);
    const buffers = this.dataBuffers.get(deviceId);

    // 如果没有缓冲数据或没有分隔符，返回空
    if (!buffers || buffers.length === 0 || !config.delimiter) {
      return null;
    }

    // 合并所有缓冲区
    const combinedBuffer = Buffer.concat(buffers);

    // 分隔符可能是字符串或Buffer
    const delimiter = typeof config.delimiter === 'string'
      ? Buffer.from(config.delimiter, config.encoding || 'utf8')
      : config.delimiter;

    // 查找分隔符
    const delimiterIndex = combinedBuffer.indexOf(delimiter);
    if (delimiterIndex === -1) {
      // 没有找到分隔符，保留缓冲区
      return null;
    }

    // 提取数据包（不包括分隔符）
    const packet = combinedBuffer.slice(0, delimiterIndex);

    // 更新缓冲区，移除已处理的数据
    this.dataBuffers.set(deviceId, [combinedBuffer.slice(delimiterIndex + delimiter.length)]);

    return packet;
  }

  // 发送初始化命令
  private async sendInitCommands(deviceId: string, initCommands?: Array<any>): Promise<void> {
    if (!initCommands || initCommands.length === 0) {
      return;
    }

    // 依次发送每个初始化命令
    for (const cmd of initCommands) {
      try {
        // 转换为设备命令
        const command: TcpSocketCommand = {
          data: cmd.data,
          expectResponse: cmd.waitForResponse || false,
          responseTimeout: cmd.responseTimeout || 5000,
          encoding: cmd.encoding
        };

        // 发送命令
        await this.sendCommand(deviceId, command);

        // 如果需要等待
        if (cmd.delay) {
          await new Promise(resolve => setTimeout(resolve, cmd.delay));
        }
      } catch (err) {
        // 记录错误但继续执行
        console.error(`设备 ${deviceId} 初始化命令失败:`, err);
      }
    }
  }

  // 计划重连
  private scheduleReconnect(deviceId: string): void {
    // 清除已有的重连计划
    if (this.reconnectTimers.has(deviceId)) {
      clearTimeout(this.reconnectTimers.get(deviceId));
      this.reconnectTimers.delete(deviceId);
    }

    // 获取配置
    const config = this.deviceConfigs.get(deviceId);
    if (!config || !config.autoReconnect) {
      return;
    }

    // 获取连接状态
    const connectionState = this.connectionStates.get(deviceId);

    // 检查最大重连次数
    if (config.maxReconnectAttempts &&
        connectionState.connectionAttempts >= config.maxReconnectAttempts) {
      // 触发错误事件
      this.emitConnectionEvent(deviceId, DeviceConnectionEventType.ERROR, {
        message: `设备 ${deviceId} 重连失败: 已达到最大重连次数 ${config.maxReconnectAttempts}`
      });
      return;
    }

    // 设置重连定时器
    const reconnectInterval = config.reconnectInterval || 5000;
    const timer = setTimeout(async () => {
      try {
        // 尝试重新连接
        console.log(`尝试重新连接设备 ${deviceId}...`);
        await this.connect(deviceId, config);
      } catch (err) {
        // 连接失败，错误处理已在connect方法中完成
        console.error(`设备 ${deviceId} 重连失败:`, err);
      }
    }, reconnectInterval);

    // 保存定时器
    this.reconnectTimers.set(deviceId, timer);
  }

  // 发送连接事件
  private emitConnectionEvent(deviceId: string, eventType: DeviceConnectionEventType, data: any): void {
    const event: DeviceConnectionEvent = {
      adapterId: this.id,
      deviceId,
      eventType,
      timestamp: new Date().toISOString(),
      ...data
    };

    this.eventEmitter.emit(eventType, event);
  }

  // 生成模拟数据（用于测试）
  private startGeneratingMockData(deviceId: string): void {
    // 清除已有的模拟数据定时器
    this.stopGeneratingMockData(deviceId);

    // 创建模拟数据生成定时器
    const interval = setInterval(() => {
      // 检查设备是否仍然连接
      if (!this.isDeviceConnected(deviceId)) {
        this.stopGeneratingMockData(deviceId);
        return;
      }

      // 生成随机数据
      const mockData = {
        timestamp: new Date().toISOString(),
        temperature: 20 + Math.random() * 10,
        humidity: 40 + Math.random() * 20,
        pressure: 1000 + Math.random() * 50,
        deviceId
      };

      // 触发数据接收事件
      this.emitConnectionEvent(deviceId, DeviceConnectionEventType.DATA_RECEIVED, {
        data: mockData,
        timestamp: mockData.timestamp,
        mock: true
      });

    }, 5000); // 每5秒生成一次数据

    // 保存定时器
    this.dataIntervals.set(deviceId, interval);
  }

  // 停止生成模拟数据
  private stopGeneratingMockData(deviceId: string): void {
    if (this.dataIntervals.has(deviceId)) {
      clearInterval(this.dataIntervals.get(deviceId));
      this.dataIntervals.delete(deviceId);
    }
  }
}
