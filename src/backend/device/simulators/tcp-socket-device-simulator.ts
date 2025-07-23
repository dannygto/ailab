/**
 * TCP/Socket设备模拟器
 *
 * 用于模拟实验设备，通过TCP/Socket协议与适配器通信
 *
 * @version 1.0.0
 * @date 2025-07-23
 */

import * as net from 'net';
import * as tls from 'tls';
import * as fs from 'fs';
import * as path from 'path';
import { EventEmitter } from 'events';

/**
 * 设备类型
 */
export enum DeviceType {
  SENSOR = 'sensor',
  ACTUATOR = 'actuator',
  CONTROLLER = 'controller',
  ANALYZER = 'analyzer',
  GENERIC = 'generic'
}

/**
 * 设备模式
 */
export enum DeviceMode {
  CLIENT = 'client',
  SERVER = 'server'
}

/**
 * 设备状态
 */
export enum DeviceState {
  DISCONNECTED = 'disconnected',
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  ERROR = 'error',
  BUSY = 'busy',
  IDLE = 'idle'
}

/**
 * 设备通信选项
 */
export interface DeviceOptions {
  id: string;
  name: string;
  type: DeviceType;
  mode: DeviceMode;
  host?: string;
  port: number;
  secure?: boolean;
  cert?: string;
  key?: string;
  ca?: string[];
  rejectUnauthorized?: boolean;
  useJson?: boolean;
  encoding?: string;
  protocol?: {
    startDelimiter?: Buffer | string;
    endDelimiter?: Buffer | string;
    checksumMethod?: 'none' | 'crc16' | 'crc32' | 'md5' | 'custom';
  };
  autoReconnect?: boolean;
  reconnectDelay?: number;
  maxReconnectAttempts?: number;
  keepAlive?: boolean;
  responseDelay?: number;
  simulatedErrorRate?: number;
  commandSet?: Record<string, (args?: any) => any>;
}

/**
 * 设备模拟器接口
 */
export interface IDeviceSimulator extends EventEmitter {
  start(): Promise<void>;
  stop(): Promise<void>;
  getState(): DeviceState;
  sendData(data: any): Promise<void>;
  getInfo(): {
    id: string;
    name: string;
    type: DeviceType;
    mode: DeviceMode;
    state: DeviceState;
    uptime: number;
    stats: {
      messagesSent: number;
      messagesReceived: number;
      bytesSent: number;
      bytesReceived: number;
      errors: number;
    };
  };
}

/**
 * 设备模拟器事件
 */
export enum DeviceSimulatorEvents {
  STATE_CHANGE = 'stateChange',
  CONNECTED = 'connected',
  DISCONNECTED = 'disconnected',
  ERROR = 'error',
  DATA_RECEIVED = 'dataReceived',
  DATA_SENT = 'dataSent',
  COMMAND_EXECUTED = 'commandExecuted'
}

/**
 * 设备模拟器基类
 */
abstract class BaseDeviceSimulator extends EventEmitter implements IDeviceSimulator {
  protected state: DeviceState = DeviceState.DISCONNECTED;
  protected startTime: Date | null = null;
  protected stats = {
    messagesSent: 0,
    messagesReceived: 0,
    bytesSent: 0,
    bytesReceived: 0,
    errors: 0
  };

  constructor(protected options: DeviceOptions) {
    super();

    // 设置默认命令集
    if (!this.options.commandSet) {
      this.options.commandSet = this.getDefaultCommandSet();
    }
  }

  abstract start(): Promise<void>;
  abstract stop(): Promise<void>;
  abstract sendData(data: any): Promise<void>;

  getState(): DeviceState {
    return this.state;
  }

  getInfo() {
    return {
      id: this.options.id,
      name: this.options.name,
      type: this.options.type,
      mode: this.options.mode,
      state: this.state,
      uptime: this.startTime ? Date.now() - this.startTime.getTime() : 0,
      stats: { ...this.stats }
    };
  }

  protected setState(newState: DeviceState): void {
    if (this.state === newState) return;

    const oldState = this.state;
    this.state = newState;

    console.log(`[${this.options.id}] State changed: ${oldState} -> ${newState}`);
    this.emit(DeviceSimulatorEvents.STATE_CHANGE, newState, oldState);

    if (newState === DeviceState.CONNECTED) {
      this.startTime = new Date();
      this.emit(DeviceSimulatorEvents.CONNECTED);
    } else if (oldState === DeviceState.CONNECTED) {
      this.startTime = null;
      this.emit(DeviceSimulatorEvents.DISCONNECTED);
    }
  }

  protected encodeData(data: any): Buffer {
    if (Buffer.isBuffer(data)) {
      return data;
    }

    if (this.options.useJson) {
      const jsonString = JSON.stringify(data);
      return Buffer.from(jsonString, this.options.encoding as BufferEncoding || 'utf8');
    }

    if (typeof data === 'string') {
      return Buffer.from(data, this.options.encoding as BufferEncoding || 'utf8');
    }

    return Buffer.from(String(data), this.options.encoding as BufferEncoding || 'utf8');
  }

  protected decodeData(data: Buffer): any {
    if (this.options.useJson) {
      try {
        const jsonString = data.toString(this.options.encoding as BufferEncoding || 'utf8');
        return JSON.parse(jsonString);
      } catch (error) {
        console.error(`[${this.options.id}] Error parsing JSON:`, error);
        this.stats.errors++;
        return data;
      }
    }

    return data.toString(this.options.encoding as BufferEncoding || 'utf8');
  }

  protected executeCommand(data: any): any {
    if (!this.options.commandSet) {
      return { error: 'No command set defined' };
    }

    try {
      // 尝试解析命令
      let command: string;
      let args: any;

      if (typeof data === 'object' && data !== null) {
        command = data.command || '';
        args = data.args;
      } else if (typeof data === 'string') {
        // 尝试解析字符串命令，格式可能是 "command:args" 或单纯的命令名
        const parts = data.split(':');
        command = parts[0];
        if (parts.length > 1) {
          try {
            args = JSON.parse(parts.slice(1).join(':'));
          } catch {
            args = parts.slice(1).join(':');
          }
        }
      } else {
        return { error: 'Invalid command format' };
      }

      // 查找并执行命令
      const commandFn = this.options.commandSet[command];
      if (!commandFn) {
        return { error: `Unknown command: ${command}` };
      }

      const result = commandFn(args);
      this.emit(DeviceSimulatorEvents.COMMAND_EXECUTED, command, args, result);
      return result;
    } catch (error) {
      console.error(`[${this.options.id}] Error executing command:`, error);
      this.stats.errors++;
      return { error: error.message || 'Command execution failed' };
    }
  }

  protected simulateError(): boolean {
    if (!this.options.simulatedErrorRate) return false;
    return Math.random() < this.options.simulatedErrorRate;
  }

  protected getDefaultCommandSet(): Record<string, (args?: any) => any> {
    return {
      ping: () => ({ pong: new Date().toISOString() }),
      status: () => this.getInfo(),
      reset: () => {
        this.stats = {
          messagesSent: 0,
          messagesReceived: 0,
          bytesSent: 0,
          bytesReceived: 0,
          errors: 0
        };
        return { status: 'reset', timestamp: new Date().toISOString() };
      },
      echo: (args?: any) => args,
      version: () => ({ version: '1.0.0', device: this.options.name }),
      help: () => ({
        availableCommands: Object.keys(this.options.commandSet || {}),
        format: 'command:args or {command, args}'
      })
    };
  }
}

/**
 * 客户端模式设备模拟器
 */
export class ClientDeviceSimulator extends BaseDeviceSimulator {
  private socket: net.Socket | tls.TLSSocket | null = null;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private reconnectAttempts = 0;
  private dataBuffer: Buffer = Buffer.alloc(0);

  constructor(options: DeviceOptions) {
    super({
      ...options,
      mode: DeviceMode.CLIENT
    });
  }

  async start(): Promise<void> {
    if (this.state === DeviceState.CONNECTED || this.state === DeviceState.CONNECTING) {
      console.log(`[${this.options.id}] Already ${this.state}, ignoring start request`);
      return;
    }

    this.setState(DeviceState.CONNECTING);
    console.log(`[${this.options.id}] Starting client device simulator, connecting to ${this.options.host}:${this.options.port}`);

    try {
      await this.connect();
    } catch (error) {
      console.error(`[${this.options.id}] Start failed:`, error);
      this.setState(DeviceState.ERROR);
      this.stats.errors++;
      this.emit(DeviceSimulatorEvents.ERROR, error);

      if (this.options.autoReconnect) {
        this.scheduleReconnect();
      }

      throw error;
    }
  }

  async stop(): Promise<void> {
    if (this.state === DeviceState.DISCONNECTED) {
      console.log(`[${this.options.id}] Already disconnected, ignoring stop request`);
      return;
    }

    console.log(`[${this.options.id}] Stopping client device simulator`);

    this.cancelReconnect();

    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.end();
      this.socket.destroy();
      this.socket = null;
    }

    this.setState(DeviceState.DISCONNECTED);
  }

  async sendData(data: any): Promise<void> {
    if (!this.socket || this.state !== DeviceState.CONNECTED) {
      throw new Error(`Cannot send data, device not connected (state: ${this.state})`);
    }

    try {
      const buffer = this.encodeData(data);

      return new Promise<void>((resolve, reject) => {
        if (!this.socket) {
          reject(new Error('Socket not available'));
          return;
        }

        // 是否模拟错误
        if (this.simulateError()) {
          this.stats.errors++;
          reject(new Error('Simulated send error'));
          return;
        }

        this.socket.write(buffer, (err) => {
          if (err) {
            this.stats.errors++;
            reject(err);
          } else {
            this.stats.messagesSent++;
            this.stats.bytesSent += buffer.length;
            this.emit(DeviceSimulatorEvents.DATA_SENT, data);
            resolve();
          }
        });
      });
    } catch (error) {
      this.stats.errors++;
      throw error;
    }
  }

  private async connect(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      try {
        if (this.options.secure) {
          // 创建TLS socket
          const tlsOptions: tls.ConnectionOptions = {
            host: this.options.host,
            port: this.options.port,
            rejectUnauthorized: this.options.rejectUnauthorized
          };

          if (this.options.cert) {
            tlsOptions.cert = fs.readFileSync(this.options.cert);
          }

          if (this.options.key) {
            tlsOptions.key = fs.readFileSync(this.options.key);
          }

          if (this.options.ca) {
            tlsOptions.ca = this.options.ca.map(ca => fs.readFileSync(ca));
          }

          this.socket = tls.connect(tlsOptions, () => {
            this.onConnected(resolve);
          });
        } else {
          // 创建普通socket
          this.socket = new net.Socket();

          this.socket.connect({
            host: this.options.host,
            port: this.options.port
          }, () => {
            this.onConnected(resolve);
          });
        }

        // 配置socket选项
        if (this.socket) {
          if (this.options.keepAlive !== undefined) {
            this.socket.setKeepAlive(this.options.keepAlive);
          }
        }

        // 设置事件处理器
        this.socket.on('data', (data) => this.handleData(data));

        this.socket.on('error', (err) => {
          console.error(`[${this.options.id}] Socket error:`, err);
          this.stats.errors++;
          this.emit(DeviceSimulatorEvents.ERROR, err);

          if (this.state === DeviceState.CONNECTING) {
            reject(err);
          } else {
            this.setState(DeviceState.ERROR);

            if (this.options.autoReconnect) {
              this.scheduleReconnect();
            }
          }
        });

        this.socket.on('close', (hadError) => {
          console.log(`[${this.options.id}] Socket closed${hadError ? ' due to error' : ''}`);

          if (this.state === DeviceState.CONNECTING) {
            reject(new Error('Connection closed during connect'));
          } else if (this.state !== DeviceState.DISCONNECTED) {
            this.setState(DeviceState.DISCONNECTED);

            if (this.options.autoReconnect) {
              this.scheduleReconnect();
            }
          }
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  private onConnected(resolve: Function): void {
    console.log(`[${this.options.id}] Connected to ${this.options.host}:${this.options.port}`);
    this.setState(DeviceState.CONNECTED);
    this.reconnectAttempts = 0;
    resolve();
  }

  private handleData(data: Buffer): void {
    try {
      // 累积数据到缓冲区
      this.dataBuffer = Buffer.concat([this.dataBuffer, data]);

      // 处理数据帧，支持帧分隔符
      let frames: Buffer[] = [];

      if (this.options.protocol?.startDelimiter && this.options.protocol?.endDelimiter) {
        // 如果定义了起止分隔符，按照分隔符拆分数据帧
        frames = this.extractFrames();
      } else {
        // 否则将整个缓冲区作为一个数据帧
        frames = [Buffer.from(this.dataBuffer)];
        this.dataBuffer = Buffer.alloc(0);
      }

      // 处理每个数据帧
      for (const frame of frames) {
        this.processFrame(frame);
      }
    } catch (error) {
      console.error(`[${this.options.id}] Error handling data:`, error);
      this.stats.errors++;
    }
  }

  private extractFrames(): Buffer[] {
    const frames: Buffer[] = [];
    const startDelim = Buffer.isBuffer(this.options.protocol?.startDelimiter)
      ? this.options.protocol?.startDelimiter as Buffer
      : Buffer.from(this.options.protocol?.startDelimiter as string);

    const endDelim = Buffer.isBuffer(this.options.protocol?.endDelimiter)
      ? this.options.protocol?.endDelimiter as Buffer
      : Buffer.from(this.options.protocol?.endDelimiter as string);

    while (this.dataBuffer.length > 0) {
      // 寻找起始分隔符
      const startIndex = this.dataBuffer.indexOf(startDelim);
      if (startIndex === -1) break;

      // 移除起始分隔符之前的数据
      this.dataBuffer = this.dataBuffer.slice(startIndex);

      // 寻找结束分隔符
      const endIndex = this.dataBuffer.indexOf(endDelim, startDelim.length);
      if (endIndex === -1) break;

      // 提取完整数据帧，包括分隔符
      const frame = this.dataBuffer.slice(0, endIndex + endDelim.length);
      frames.push(frame);

      // 移除已处理的数据
      this.dataBuffer = this.dataBuffer.slice(endIndex + endDelim.length);
    }

    return frames;
  }

  private processFrame(frame: Buffer): void {
    this.stats.messagesReceived++;
    this.stats.bytesReceived += frame.length;

    // 解码数据
    const decodedData = this.decodeData(frame);
    this.emit(DeviceSimulatorEvents.DATA_RECEIVED, decodedData);

    // 处理命令并生成响应
    const responseData = this.executeCommand(decodedData);

    // 延迟发送响应，模拟设备处理时间
    const responseDelay = this.options.responseDelay || 0;
    if (responseDelay > 0) {
      setTimeout(() => {
        this.sendResponse(responseData);
      }, responseDelay);
    } else {
      this.sendResponse(responseData);
    }
  }

  private sendResponse(responseData: any): void {
    if (this.state === DeviceState.CONNECTED) {
      this.sendData(responseData).catch(err => {
        console.error(`[${this.options.id}] Error sending response:`, err);
      });
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer) {
      return;
    }

    const maxRetries = this.options.maxReconnectAttempts || 5;
    if (this.reconnectAttempts >= maxRetries) {
      console.log(`[${this.options.id}] Maximum reconnect attempts (${maxRetries}) reached, giving up`);
      this.reconnectAttempts = 0;
      return;
    }

    const delay = this.calculateReconnectDelay();
    console.log(`[${this.options.id}] Scheduling reconnect attempt ${this.reconnectAttempts + 1}/${maxRetries} in ${delay}ms`);

    this.reconnectTimer = setTimeout(async () => {
      this.reconnectTimer = null;
      this.reconnectAttempts++;

      console.log(`[${this.options.id}] Attempting to reconnect (${this.reconnectAttempts}/${maxRetries})`);

      try {
        await this.start();
        console.log(`[${this.options.id}] Reconnect successful`);
        this.reconnectAttempts = 0;
      } catch (error) {
        console.error(`[${this.options.id}] Reconnect failed:`, error);
      }
    }, delay);
  }

  private cancelReconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.reconnectAttempts = 0;
  }

  private calculateReconnectDelay(): number {
    const baseDelay = this.options.reconnectDelay || 1000;
    const exponentialDelay = baseDelay * Math.pow(2, this.reconnectAttempts);
    const jitter = Math.random() * 0.3 * exponentialDelay; // 添加0-30%的随机抖动

    return Math.min(exponentialDelay + jitter, 60000); // 最大延迟为60秒
  }
}

/**
 * 服务器模式设备模拟器
 */
export class ServerDeviceSimulator extends BaseDeviceSimulator {
  private server: net.Server | tls.Server | null = null;
  private clients: Map<string, net.Socket | tls.TLSSocket> = new Map();
  private clientDataBuffers: Map<string, Buffer> = new Map();

  constructor(options: DeviceOptions) {
    super({
      ...options,
      mode: DeviceMode.SERVER
    });
  }

  async start(): Promise<void> {
    if (this.state !== DeviceState.DISCONNECTED) {
      console.log(`[${this.options.id}] Already ${this.state}, ignoring start request`);
      return;
    }

    this.setState(DeviceState.CONNECTING);
    console.log(`[${this.options.id}] Starting server device simulator on port ${this.options.port}`);

    try {
      await this.createServer();
      this.setState(DeviceState.CONNECTED);
      console.log(`[${this.options.id}] Server device simulator started`);
    } catch (error) {
      console.error(`[${this.options.id}] Start failed:`, error);
      this.setState(DeviceState.ERROR);
      this.stats.errors++;
      this.emit(DeviceSimulatorEvents.ERROR, error);
      throw error;
    }
  }

  async stop(): Promise<void> {
    if (this.state === DeviceState.DISCONNECTED) {
      console.log(`[${this.options.id}] Already disconnected, ignoring stop request`);
      return;
    }

    console.log(`[${this.options.id}] Stopping server device simulator`);

    // 关闭所有客户端连接
    for (const [clientId, socket] of this.clients.entries()) {
      try {
        socket.end();
        socket.destroy();
        console.log(`[${this.options.id}] Closed connection to client ${clientId}`);
      } catch (error) {
        console.error(`[${this.options.id}] Error closing client ${clientId}:`, error);
      }
    }

    this.clients.clear();
    this.clientDataBuffers.clear();

    // 关闭服务器
    if (this.server) {
      return new Promise<void>((resolve, reject) => {
        if (!this.server) {
          this.setState(DeviceState.DISCONNECTED);
          resolve();
          return;
        }

        this.server.close((err) => {
          if (err) {
            console.error(`[${this.options.id}] Error closing server:`, err);
            this.stats.errors++;
            this.emit(DeviceSimulatorEvents.ERROR, err);
            reject(err);
          } else {
            console.log(`[${this.options.id}] Server closed`);
            this.setState(DeviceState.DISCONNECTED);
            this.server = null;
            resolve();
          }
        });
      });
    }

    this.setState(DeviceState.DISCONNECTED);
    return Promise.resolve();
  }

  async sendData(data: any, clientId?: string): Promise<void> {
    if (this.state !== DeviceState.CONNECTED) {
      throw new Error(`Cannot send data, server not running (state: ${this.state})`);
    }

    try {
      const buffer = this.encodeData(data);

      // 发送到特定客户端或广播到所有客户端
      if (clientId) {
        await this.sendToClient(clientId, buffer);
      } else {
        await this.broadcast(buffer);
      }

      this.emit(DeviceSimulatorEvents.DATA_SENT, data, clientId);
    } catch (error) {
      this.stats.errors++;
      throw error;
    }
  }

  private async createServer(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      try {
        if (this.options.secure) {
          // 创建TLS服务器
          const tlsOptions: tls.TlsOptions = {};

          if (this.options.cert) {
            tlsOptions.cert = fs.readFileSync(this.options.cert);
          } else {
            reject(new Error('Certificate required for secure server'));
            return;
          }

          if (this.options.key) {
            tlsOptions.key = fs.readFileSync(this.options.key);
          } else {
            reject(new Error('Private key required for secure server'));
            return;
          }

          if (this.options.ca) {
            tlsOptions.ca = this.options.ca.map(ca => fs.readFileSync(ca));
          }

          this.server = tls.createServer(tlsOptions, this.handleConnection.bind(this));
        } else {
          // 创建普通TCP服务器
          this.server = net.createServer(this.handleConnection.bind(this));
        }

        // 错误处理
        this.server.on('error', (error) => {
          console.error(`[${this.options.id}] Server error:`, error);
          this.stats.errors++;
          this.emit(DeviceSimulatorEvents.ERROR, error);

          if (!this.server!.listening) {
            reject(error);
          }
        });

        // 监听连接
        this.server.listen(this.options.port, () => {
          console.log(`[${this.options.id}] Server listening on port ${this.options.port}`);
          resolve();
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  private handleConnection(socket: net.Socket | tls.TLSSocket): void {
    const clientId = this.generateClientId(socket);

    console.log(`[${this.options.id}] New client connection: ${clientId}`);

    // 保存客户端连接和数据缓冲区
    this.clients.set(clientId, socket);
    this.clientDataBuffers.set(clientId, Buffer.alloc(0));

    // 注册事件处理器
    socket.on('data', (data) => {
      this.handleClientData(clientId, data);
    });

    socket.on('close', (hadError) => {
      console.log(`[${this.options.id}] Client ${clientId} disconnected${hadError ? ' due to error' : ''}`);
      this.clients.delete(clientId);
      this.clientDataBuffers.delete(clientId);
    });

    socket.on('error', (error) => {
      console.error(`[${this.options.id}] Client ${clientId} error:`, error);
      this.stats.errors++;
    });
  }

  private handleClientData(clientId: string, data: Buffer): void {
    try {
      const socket = this.clients.get(clientId);
      if (!socket) return;

      // 累积数据到客户端缓冲区
      let buffer = this.clientDataBuffers.get(clientId) || Buffer.alloc(0);
      buffer = Buffer.concat([buffer, data]);
      this.clientDataBuffers.set(clientId, buffer);

      // 处理数据帧，支持帧分隔符
      let frames: Buffer[] = [];

      if (this.options.protocol?.startDelimiter && this.options.protocol?.endDelimiter) {
        // 如果定义了起止分隔符，按照分隔符拆分数据帧
        frames = this.extractFrames(clientId);
      } else {
        // 否则将整个缓冲区作为一个数据帧
        frames = [Buffer.from(buffer)];
        this.clientDataBuffers.set(clientId, Buffer.alloc(0));
      }

      // 处理每个数据帧
      for (const frame of frames) {
        this.processClientFrame(clientId, frame);
      }
    } catch (error) {
      console.error(`[${this.options.id}] Error handling client data:`, error);
      this.stats.errors++;
    }
  }

  private extractFrames(clientId: string): Buffer[] {
    const frames: Buffer[] = [];
    let buffer = this.clientDataBuffers.get(clientId);
    if (!buffer) return frames;

    const startDelim = Buffer.isBuffer(this.options.protocol?.startDelimiter)
      ? this.options.protocol?.startDelimiter as Buffer
      : Buffer.from(this.options.protocol?.startDelimiter as string);

    const endDelim = Buffer.isBuffer(this.options.protocol?.endDelimiter)
      ? this.options.protocol?.endDelimiter as Buffer
      : Buffer.from(this.options.protocol?.endDelimiter as string);

    while (buffer.length > 0) {
      // 寻找起始分隔符
      const startIndex = buffer.indexOf(startDelim);
      if (startIndex === -1) break;

      // 移除起始分隔符之前的数据
      buffer = buffer.slice(startIndex);

      // 寻找结束分隔符
      const endIndex = buffer.indexOf(endDelim, startDelim.length);
      if (endIndex === -1) break;

      // 提取完整数据帧，包括分隔符
      const frame = buffer.slice(0, endIndex + endDelim.length);
      frames.push(frame);

      // 移除已处理的数据
      buffer = buffer.slice(endIndex + endDelim.length);
    }

    // 更新客户端缓冲区
    this.clientDataBuffers.set(clientId, buffer);

    return frames;
  }

  private processClientFrame(clientId: string, frame: Buffer): void {
    this.stats.messagesReceived++;
    this.stats.bytesReceived += frame.length;

    // 解码数据
    const decodedData = this.decodeData(frame);
    this.emit(DeviceSimulatorEvents.DATA_RECEIVED, decodedData, clientId);

    // 处理命令并生成响应
    const responseData = this.executeCommand(decodedData);

    // 延迟发送响应，模拟设备处理时间
    const responseDelay = this.options.responseDelay || 0;
    if (responseDelay > 0) {
      setTimeout(() => {
        this.sendResponse(clientId, responseData);
      }, responseDelay);
    } else {
      this.sendResponse(clientId, responseData);
    }
  }

  private sendResponse(clientId: string, responseData: any): void {
    this.sendToClient(clientId, this.encodeData(responseData)).catch(err => {
      console.error(`[${this.options.id}] Error sending response to client ${clientId}:`, err);
    });
  }

  private async sendToClient(clientId: string, data: Buffer): Promise<void> {
    const socket = this.clients.get(clientId);
    if (!socket) {
      throw new Error(`Client ${clientId} not found`);
    }

    return new Promise<void>((resolve, reject) => {
      // 是否模拟错误
      if (this.simulateError()) {
        this.stats.errors++;
        reject(new Error('Simulated send error'));
        return;
      }

      socket.write(data, (err) => {
        if (err) {
          this.stats.errors++;
          reject(err);
        } else {
          this.stats.messagesSent++;
          this.stats.bytesSent += data.length;
          resolve();
        }
      });
    });
  }

  private async broadcast(data: Buffer): Promise<void> {
    const promises: Promise<void>[] = [];

    for (const clientId of this.clients.keys()) {
      promises.push(this.sendToClient(clientId, data).catch(error => {
        console.error(`[${this.options.id}] Error broadcasting to client ${clientId}:`, error);
      }));
    }

    await Promise.all(promises);
  }

  private generateClientId(socket: net.Socket | tls.TLSSocket): string {
    const remoteAddress = socket.remoteAddress || 'unknown';
    const remotePort = socket.remotePort || 0;
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);

    return `${remoteAddress}:${remotePort}:${timestamp}:${random}`;
  }
}

/**
 * 创建设备模拟器
 */
export function createDeviceSimulator(options: DeviceOptions): IDeviceSimulator {
  if (options.mode === DeviceMode.CLIENT) {
    return new ClientDeviceSimulator(options);
  } else {
    return new ServerDeviceSimulator(options);
  }
}
