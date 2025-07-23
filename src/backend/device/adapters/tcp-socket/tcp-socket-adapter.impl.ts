/**
 * TCP/Socket协议适配器实现
 *
 * 实现了TCP/Socket适配器接口，提供与TCP/Socket设备通信的能力
 *
 * @version 1.0.0
 * @date 2025-07-23
 */

import { EventEmitter } from 'events';
import * as net from 'net';
import * as tls from 'tls';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

import {
  ITCPSocketAdapter,
  ITCPSocketAdapterFactory,
  ITCPSocketAdapterManager,
  ITCPSocketClient,
  ITCPSocketServer,
  TCPSocketConnectionOptions,
  SecureConnectionOptions,
  DataFormatOptions,
  SendOptions,
  ConnectionState,
  CommunicationStats,
  TCPSocketEvents
} from './tcp-socket-adapter';

import { DeviceType } from './device-discovery';
import { CompressionMethod } from './data-stream-processor';
import { AuthenticationMethod } from './certificate-authenticator';
import {
  ProtocolSignature,
  ProtocolProcessor
} from './protocol-detector';

/**
 * 日志级别
 */
export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  NONE = 'none'
}

/**
 * 日志记录器
 */
class Logger {
  constructor(
    private level: LogLevel = LogLevel.INFO,
    private context: string = 'TCPSocketAdapter'
  ) {}

  debug(message: string, data?: any): void {
    this.log(LogLevel.DEBUG, message, data);
  }

  info(message: string, data?: any): void {
    this.log(LogLevel.INFO, message, data);
  }

  warn(message: string, data?: any): void {
    this.log(LogLevel.WARN, message, data);
  }

  error(message: string, error?: Error, data?: any): void {
    this.log(LogLevel.ERROR, message, { ...data, error: error?.stack || error?.message });
  }

  private log(level: LogLevel, message: string, data?: any): void {
    if (this.shouldLog(level)) {
      const timestamp = new Date().toISOString();
      const logEntry = {
        timestamp,
        level,
        context: this.context,
        message,
        data
      };

      // 在实际产品中，可以将日志写入文件或发送到日志服务
      console.log(JSON.stringify(logEntry));
    }
  }

  private shouldLog(level: LogLevel): boolean {
    const levels = [LogLevel.DEBUG, LogLevel.INFO, LogLevel.WARN, LogLevel.ERROR, LogLevel.NONE];
    const configIndex = levels.indexOf(this.level);
    const logIndex = levels.indexOf(level);

    return logIndex >= configIndex;
  }
}

/**
 * 自定义错误类
 */
class TCPSocketError extends Error {
  constructor(message: string, public readonly code: string, public readonly cause?: Error) {
    super(message);
    this.name = 'TCPSocketError';
  }
}

/**
 * 连接错误
 */
class ConnectionError extends TCPSocketError {
  constructor(message: string, cause?: Error) {
    super(message, 'CONNECTION_ERROR', cause);
    this.name = 'ConnectionError';
  }
}

/**
 * 超时错误
 */
class TimeoutError extends TCPSocketError {
  constructor(message: string, public readonly operation: string) {
    super(message, 'TIMEOUT_ERROR');
    this.name = 'TimeoutError';
  }
}

/**
 * 数据处理器
 */
class DataProcessor {
  constructor(private options: DataFormatOptions) {}

  encode(data: any): Buffer {
    try {
      if (this.options.useJson) {
        return this.encodeJson(data);
      } else if (this.options.customSerializer) {
        return this.options.customSerializer(data);
      } else {
        return this.encodeRaw(data);
      }
    } catch (error) {
      throw new TCPSocketError(
        `Failed to encode data: ${error.message}`,
        'ENCODING_ERROR',
        error
      );
    }
  }

  decode(data: Buffer): any {
    try {
      if (this.options.useJson) {
        return this.decodeJson(data);
      } else if (this.options.customParser) {
        return this.options.customParser(data);
      } else {
        return this.decodeRaw(data);
      }
    } catch (error) {
      throw new TCPSocketError(
        `Failed to decode data: ${error.message}`,
        'DECODING_ERROR',
        error
      );
    }
  }

  private encodeJson(data: any): Buffer {
    const jsonStr = JSON.stringify(data);
    return Buffer.from(jsonStr, this.options.encoding as BufferEncoding || 'utf8');
  }

  private decodeJson(data: Buffer): any {
    const jsonStr = data.toString(this.options.encoding as BufferEncoding || 'utf8');
    return JSON.parse(jsonStr);
  }

  private encodeRaw(data: any): Buffer {
    if (Buffer.isBuffer(data)) {
      return data;
    } else if (typeof data === 'string') {
      return Buffer.from(data, this.options.encoding as BufferEncoding || 'utf8');
    } else {
      return Buffer.from(String(data), this.options.encoding as BufferEncoding || 'utf8');
    }
  }

  private decodeRaw(data: Buffer): any {
    return data.toString(this.options.encoding as BufferEncoding || 'utf8');
  }
}

// TCP/Socket客户端实现
class TCPSocketClient extends EventEmitter implements ITCPSocketClient {
  private socket: net.Socket | tls.TLSSocket | null = null;
  private state: ConnectionState = ConnectionState.DISCONNECTED;
  private dataProcessor: DataProcessor;
  private stats: CommunicationStats;
  private logger: Logger;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private reconnectAttempts: number = 0;
  private pendingRequests: Map<string, { resolve: Function; reject: Function; timeout: NodeJS.Timeout | null; responseMatch?: (data: any) => boolean }> = new Map();
  private detectedProtocol: ProtocolSignature | null = null;

  constructor(
    private config: TCPSocketConnectionOptions & SecureConnectionOptions & DataFormatOptions,
    logLevel: LogLevel = LogLevel.INFO
  ) {
    super();
    this.dataProcessor = new DataProcessor(config);
    this.logger = new Logger(logLevel, 'TCPSocketClient');
    this.stats = this.initStats();
  }

  async connect(): Promise<void> {
    if (this.state === ConnectionState.CONNECTED || this.state === ConnectionState.CONNECTING) {
      this.logger.info(`Already ${this.state}, ignoring connect request`);
      return;
    }

    this.setState(ConnectionState.CONNECTING);
    this.logger.info(`Connecting to ${this.config.host}:${this.config.port}`);

    try {
      await this.createSocket();
      this.logger.info(`Connected to ${this.config.host}:${this.config.port}`);
    } catch (error) {
      this.logger.error(`Failed to connect: ${error.message}`, error);
      this.setState(ConnectionState.ERROR);

      if (this.config.autoReconnect && !this.reconnectTimer) {
        this.scheduleReconnect();
      }

      throw new ConnectionError(`Failed to connect to ${this.config.host}:${this.config.port}`, error);
    }
  }

  async disconnect(force: boolean = false): Promise<void> {
    if (this.state === ConnectionState.DISCONNECTED || this.state === ConnectionState.DISCONNECTING) {
      this.logger.info(`Already ${this.state}, ignoring disconnect request`);
      return;
    }

    this.setState(ConnectionState.DISCONNECTING);
    this.logger.info('Disconnecting');

    this.cancelReconnect();

    if (this.socket) {
      this.removeSocketListeners();

      if (force) {
        this.socket.destroy();
      } else {
        this.socket.end();
      }

      // 清空所有挂起的请求
      const pendingRequestEntries = Array.from(this.pendingRequests.entries());
      for (const [id, { reject, timeout }] of pendingRequestEntries) {
        if (timeout) {
          clearTimeout(timeout);
        }
        reject(new ConnectionError('Connection closed'));
        this.pendingRequests.delete(id);
      }

      this.socket = null;
    }

    this.setState(ConnectionState.DISCONNECTED);
    this.logger.info('Disconnected');
  }

  async send(data: Buffer | string | object, options: SendOptions = {}): Promise<any> {
    if (this.state !== ConnectionState.CONNECTED) {
      throw new ConnectionError(`Cannot send data while not connected (current state: ${this.state})`);
    }

    if (!this.socket) {
      throw new ConnectionError('Socket is not initialized');
    }

    const trackingId = options.trackingId || crypto.randomUUID();
    const timeout = options.timeout || 30000;
    const waitForResponse = options.waitForResponse !== undefined ? options.waitForResponse : false;
    const responseTimeout = options.responseTimeout || timeout;

    try {
      const buffer = this.dataProcessor.encode(data);

      this.logger.debug(`Sending data (${buffer.length} bytes)`, { trackingId });

      const writePromise = new Promise<void>((resolve, reject) => {
        if (!this.socket) {
          reject(new ConnectionError('Socket is not initialized'));
          return;
        }

        const onError = (err: Error) => {
          reject(new ConnectionError(`Failed to send data: ${err.message}`, err));
        };

        this.socket.once('error', onError);
        this.socket.write(buffer, (err) => {
          this.socket?.removeListener('error', onError);

          if (err) {
            reject(new ConnectionError(`Failed to send data: ${err.message}`, err));
          } else {
            resolve();
            this.stats.bytesSent += buffer.length;
            this.stats.messagesSent++;
            this.stats.lastActivity = new Date();
          }
        });
      });

      await writePromise;

      if (!waitForResponse) {
        return null;
      }

      // 等待响应
      return await this.waitForResponse(trackingId, responseTimeout, options.responseMatch);
    } catch (error) {
      this.logger.error(`Error sending data: ${error.message}`, error);
      throw error;
    }
  }

  getState(): ConnectionState {
    return this.state;
  }

  getStats(): CommunicationStats {
    // 更新当前连接持续时间
    if (this.stats.connectionStartTime && this.state === ConnectionState.CONNECTED) {
      this.stats.currentConnectionDuration = Date.now() - this.stats.connectionStartTime.getTime();
    }

    return { ...this.stats };
  }

  resetStats(): void {
    this.stats = this.initStats();
    if (this.state === ConnectionState.CONNECTED && this.stats.connectionStartTime) {
      this.stats.connectionsEstablished = 1;
    }
  }

  isAlive(): boolean {
    return this.state === ConnectionState.CONNECTED && this.socket !== null && !this.socket.destroyed;
  }

  async sendHeartbeat(): Promise<void> {
    if (!this.isAlive()) {
      throw new ConnectionError('Cannot send heartbeat while not connected');
    }

    // 实现心跳机制，可以是简单的空数据包或特定的心跳格式
    await this.send(Buffer.from([0]));
    this.logger.debug('Heartbeat sent');
  }

  getConfig(): TCPSocketConnectionOptions & SecureConnectionOptions & DataFormatOptions {
    return { ...this.config };
  }

  updateConfig(options: Partial<TCPSocketConnectionOptions & SecureConnectionOptions & DataFormatOptions>): void {
    const prevConfig = { ...this.config };
    this.config = { ...this.config, ...options };

    // 如果更新了数据格式选项，需要更新数据处理器
    if (
      options.encoding !== undefined ||
      options.endianness !== undefined ||
      options.useJson !== undefined ||
      options.customParser !== undefined ||
      options.customSerializer !== undefined
    ) {
      this.dataProcessor = new DataProcessor(this.config);
    }

    this.logger.info('Configuration updated', {
      prevConfig: JSON.stringify(prevConfig),
      newConfig: JSON.stringify(this.config)
    });
  }

  private initStats(): CommunicationStats {
    return {
      bytesSent: 0,
      bytesReceived: 0,
      messagesSent: 0,
      messagesReceived: 0,
      connectionsEstablished: 0,
      connectionsDropped: 0,
      errors: 0,
      lastActivity: new Date()
    };
  }

  private setState(newState: ConnectionState): void {
    if (this.state === newState) return;

    const oldState = this.state;
    this.state = newState;
    this.logger.debug(`State changed: ${oldState} -> ${newState}`);
    this.emit('stateChange', newState, oldState);

    if (newState === ConnectionState.CONNECTED) {
      this.stats.connectionsEstablished++;
      this.stats.connectionStartTime = new Date();
      this.emit('connect');
    } else if (oldState === ConnectionState.CONNECTED &&
              (newState === ConnectionState.DISCONNECTED || newState === ConnectionState.ERROR)) {
      this.stats.connectionsDropped++;
      this.stats.connectionStartTime = undefined;
      this.stats.currentConnectionDuration = undefined;
      this.emit('disconnect', newState === ConnectionState.ERROR ? 'error' : 'normal');
    }
  }

  private async createSocket(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      try {
        if (this.config.secure) {
          // 创建TLS socket
          const tlsOptions: tls.ConnectionOptions = {
            host: this.config.host,
            port: this.config.port,
            rejectUnauthorized: this.config.rejectUnauthorized,
            timeout: this.config.connectionTimeout
          };

          if (this.config.cert) {
            tlsOptions.cert = fs.readFileSync(this.config.cert);
          }

          if (this.config.key) {
            tlsOptions.key = fs.readFileSync(this.config.key);
          }

          if (this.config.ca) {
            tlsOptions.ca = this.config.ca.map(ca => fs.readFileSync(ca));
          }

          if (this.config.ciphers) {
            tlsOptions.ciphers = this.config.ciphers;
          }

          this.socket = tls.connect(tlsOptions);
        } else {
          // 创建普通socket
          this.socket = new net.Socket();

          const connectOptions: net.SocketConnectOpts = {
            host: this.config.host,
            port: this.config.port,
            // 在Socket.connect选项中timeout是有效的，但在SocketConnectOpts中没有明确定义
            // 使用类型断言来避免TypeScript错误
            ...(this.config.connectionTimeout ? { timeout: this.config.connectionTimeout } as any : {})
          };

          this.socket.connect(connectOptions);
        }

        // 配置socket选项
        if (this.socket) {
          if (this.config.keepAlive !== undefined) {
            this.socket.setKeepAlive(this.config.keepAlive);
          }

          if (this.config.noDelay !== undefined) {
            this.socket.setNoDelay(this.config.noDelay);
          }

          if (this.config.receiveBufferSize !== undefined) {
            // Socket类没有直接的setRecvBufferSize方法
            // 可以尝试使用socket._handle.setRecvBufferSize如果有需要
            // 这里我们先移除这个调用，因为它不是标准API
            this.logger.debug(`Socket receive buffer size configuration (${this.config.receiveBufferSize}) was ignored as it's not directly supported`);
          }

          if (this.config.sendBufferSize !== undefined) {
            // Socket类没有直接的setSendBufferSize方法
            // 可以尝试使用socket._handle.setSendBufferSize如果有需要
            // 这里我们先移除这个调用，因为它不是标准API
            this.logger.debug(`Socket send buffer size configuration (${this.config.sendBufferSize}) was ignored as it's not directly supported`);
          }
        }

        this.setupSocketListeners(resolve, reject);
      } catch (error) {
        reject(new ConnectionError(`Failed to create socket: ${error.message}`, error));
      }
    });
  }

  private setupSocketListeners(resolve: Function, reject: Function): void {
    if (!this.socket) {
      reject(new ConnectionError('Socket is not initialized'));
      return;
    }

    const connectHandler = () => {
      this.setState(ConnectionState.CONNECTED);
      resolve();
    };

    const dataHandler = (data: Buffer) => {
      this.handleData(data);
    };

    const errorHandler = (error: Error) => {
      this.logger.error(`Socket error: ${error.message}`, error);
      this.stats.errors++;
      this.emit('error', error);

      if (this.state === ConnectionState.CONNECTING) {
        reject(new ConnectionError(`Connection error: ${error.message}`, error));
      } else if (this.state === ConnectionState.CONNECTED) {
        this.setState(ConnectionState.ERROR);

        if (this.config.autoReconnect && !this.reconnectTimer) {
          this.scheduleReconnect();
        }
      }
    };

    const closeHandler = (hadError: boolean) => {
      this.logger.info(`Socket closed${hadError ? ' due to error' : ''}`);

      if (this.state === ConnectionState.CONNECTING) {
        reject(new ConnectionError('Connection closed during connection attempt'));
      } else if (this.state !== ConnectionState.DISCONNECTING && this.state !== ConnectionState.DISCONNECTED) {
        this.setState(ConnectionState.DISCONNECTED);

        if (this.config.autoReconnect && !this.reconnectTimer) {
          this.scheduleReconnect();
        }
      }
    };

    const timeoutHandler = () => {
      this.logger.warn('Socket connection timeout');
      this.emit('timeout', 'connect');

      if (this.state === ConnectionState.CONNECTING) {
        reject(new TimeoutError('Connection timeout', 'connect'));
      }
    };

    // 注册事件处理器
    this.socket.once('connect', connectHandler);
    this.socket.on('data', dataHandler);
    this.socket.on('error', errorHandler);
    this.socket.on('close', closeHandler);
    this.socket.on('timeout', timeoutHandler);
  }

  private removeSocketListeners(): void {
    if (this.socket) {
      this.socket.removeAllListeners();
    }
  }

  private handleData(data: Buffer): void {
    this.stats.bytesReceived += data.length;
    this.stats.messagesReceived++;
    this.stats.lastActivity = new Date();

    try {
      const decoded = this.dataProcessor.decode(data);
      this.logger.debug(`Received data (${data.length} bytes)`);

      // 触发数据事件
      this.emit('data', decoded);

      // 检查是否有等待此响应的请求
      this.checkPendingRequests(decoded);
    } catch (error) {
      this.logger.error(`Error processing received data: ${error.message}`, error);
      this.stats.errors++;
    }
  }

  private checkPendingRequests(data: any): void {
    // 遍历所有等待响应的请求
    const pendingRequestEntries = Array.from(this.pendingRequests.entries());
    for (const [id, { resolve, reject, timeout }] of pendingRequestEntries) {
      try {
        // 如果有自定义的响应匹配函数，使用它来确定这是否是对应的响应
        // 否则，就假设收到的任何响应都是最早等待响应的请求的答复
        const matchFunction = this.pendingRequests.get(id)?.responseMatch;

        if (!matchFunction || matchFunction(data)) {
          if (timeout) {
            clearTimeout(timeout);
          }

          resolve(data);
          this.pendingRequests.delete(id);
          break;
        }
      } catch (error) {
        this.logger.error(`Error checking response match: ${error.message}`, error);
      }
    }
  }

  /**
   * 启用协议自动检测
   * @param signatures 要检测的协议特征列表
   * @returns 当前客户端实例
   */
  enableProtocolDetection(signatures?: ProtocolSignature[]): this {
    this.logger.info('启用协议自动检测');
    // 在实际实现中，这里会初始化协议检测逻辑
    return this;
  }

  /**
   * 获取当前检测到的协议
   * @returns 当前协议特征，如未检测到则返回null
   */
  getDetectedProtocol(): ProtocolSignature | null {
    return this.detectedProtocol;
  }

  /**
   * 启用数据压缩
   * @param method 压缩方法
   * @param level 压缩级别 (1-9, 1为最快，9为最高压缩率)
   * @returns 当前客户端实例
   */
  enableCompression(method: CompressionMethod, level?: number): this {
    this.logger.info(`启用数据压缩，方法: ${method}, 级别: ${level || 'default'}`);
    // 在实际实现中，这里会初始化数据压缩逻辑
    return this;
  }

  /**
   * 启用证书认证
   * @param method 认证方法
   * @param options 认证选项
   * @returns 当前客户端实例
   */
  enableAuthentication(method: AuthenticationMethod, options?: any): this {
    this.logger.info(`启用认证，方法: ${method}`);
    // 在实际实现中，这里会初始化认证逻辑
    return this;
  }

  /**
   * 检测设备类型
   * @returns Promise 解析为检测到的设备类型
   */
  async detectDeviceType(): Promise<DeviceType | null> {
    this.logger.info('检测设备类型');
    // 在实际实现中，这里会根据设备通信特征检测设备类型
    return DeviceType.UNKNOWN;
  }

  private waitForResponse(
    trackingId: string,
    timeoutMs: number,
    responseMatch?: (data: Buffer | any) => boolean
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      let timeoutId: NodeJS.Timeout | null = null;

      // 设置超时
      if (timeoutMs > 0) {
        timeoutId = setTimeout(() => {
          this.pendingRequests.delete(trackingId);
          reject(new TimeoutError(`Response timeout after ${timeoutMs}ms`, 'response'));
        }, timeoutMs);
      }

      // 保存等待信息
      this.pendingRequests.set(trackingId, {
        resolve,
        reject,
        timeout: timeoutId,
        responseMatch
      });
    });
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer) {
      return;
    }

    const maxRetries = this.config.retryCount || 5;
    const delay = this.calculateReconnectDelay();

    if (this.reconnectAttempts >= maxRetries) {
      this.logger.warn(`Maximum reconnect attempts (${maxRetries}) reached, giving up`);
      this.reconnectAttempts = 0;
      return;
    }

    this.logger.info(`Scheduling reconnect attempt ${this.reconnectAttempts + 1}/${maxRetries} in ${delay}ms`);

    this.reconnectTimer = setTimeout(async () => {
      this.reconnectTimer = null;
      this.reconnectAttempts++;

      this.logger.info(`Attempting to reconnect (${this.reconnectAttempts}/${maxRetries})`);
      this.emit('reconnect', this.reconnectAttempts);

      try {
        await this.connect();
        this.logger.info('Reconnect successful');
        this.reconnectAttempts = 0;
      } catch (error) {
        this.logger.error(`Reconnect failed: ${error.message}`, error);

        if (this.reconnectAttempts < maxRetries) {
          this.scheduleReconnect();
        } else {
          this.logger.warn(`Maximum reconnect attempts (${maxRetries}) reached, giving up`);
          this.reconnectAttempts = 0;
        }
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
    const baseDelay = this.config.retryDelay || 1000;

    // 实现指数退避算法
    // 每次重试，延迟时间增加一倍，并添加一个随机因子，避免多个客户端同时重连
    const exponentialDelay = baseDelay * Math.pow(2, this.reconnectAttempts);
    const jitter = Math.random() * 0.3 * exponentialDelay; // 添加0-30%的随机抖动

    return Math.min(exponentialDelay + jitter, 60000); // 最大延迟为60秒
  }
}

/**
 * TCP/Socket服务器实现
 */
class TCPSocketServer extends EventEmitter implements ITCPSocketServer {
  private server: net.Server | tls.Server | null = null;
  private clients: Map<string, net.Socket | tls.TLSSocket> = new Map();
  private clientDataProcessors: Map<string, DataProcessor> = new Map();
  private logger: Logger;
  private stats: {
    clientsCount: number;
    totalConnections: number;
    bytesSent: number;
    bytesReceived: number;
    startTime: Date;
    uptime: number;
  };

  constructor(
    private config: SecureConnectionOptions & {
      maxConnections?: number;
      clientIdleTimeout?: number;
      dataFormat?: DataFormatOptions;
    },
    logLevel: LogLevel = LogLevel.INFO
  ) {
    super();
    this.logger = new Logger(logLevel, 'TCPSocketServer');
    this.stats = {
      clientsCount: 0,
      totalConnections: 0,
      bytesSent: 0,
      bytesReceived: 0,
      startTime: new Date(),
      uptime: 0
    };
  }

  /**
   * 启用协议自动检测
   * @param signatures 要检测的协议特征列表
   * @returns 当前服务器实例
   */
  enableProtocolDetection(signatures?: ProtocolSignature[]): this {
    this.logger.info('服务器启用协议自动检测');
    // 在实际实现中，这里会初始化协议检测逻辑
    return this;
  }

  /**
   * 启用数据压缩
   * @param method 压缩方法
   * @param level 压缩级别 (1-9, 1为最快，9为最高压缩率)
   * @returns 当前服务器实例
   */
  enableCompression(method: CompressionMethod, level?: number): this {
    this.logger.info(`服务器启用数据压缩，方法: ${method}, 级别: ${level || 'default'}`);
    // 在实际实现中，这里会初始化数据压缩逻辑
    return this;
  }

  /**
   * 启用证书认证
   * @param method 认证方法
   * @param options 认证选项
   * @returns 当前服务器实例
   */
  enableAuthentication(method: AuthenticationMethod, options?: any): this {
    this.logger.info(`服务器启用认证，方法: ${method}`);
    // 在实际实现中，这里会初始化认证逻辑
    return this;
  }

  /**
   * 检测客户端设备类型
   * @param clientId 客户端ID
   * @returns Promise 解析为检测到的设备类型
   */
  async detectClientDeviceType(clientId: string): Promise<DeviceType | null> {
    this.logger.info(`检测客户端 ${clientId} 的设备类型`);
    // 在实际实现中，这里会根据客户端通信特征检测设备类型
    return DeviceType.UNKNOWN;
  }

  async start(port: number, host: string = '0.0.0.0'): Promise<void> {
    if (this.server) {
      this.logger.warn('Server already running, ignoring start request');
      return;
    }

    this.logger.info(`Starting server on ${host}:${port}`);

    try {
      await this.createServer(port, host);
      this.logger.info(`Server started on ${host}:${port}`);
      this.stats.startTime = new Date();
    } catch (error) {
      this.logger.error(`Failed to start server: ${error.message}`, error);
      throw new TCPSocketError(`Failed to start server: ${error.message}`, 'SERVER_START_ERROR', error);
    }
  }

  async stop(): Promise<void> {
    if (!this.server) {
      this.logger.warn('Server not running, ignoring stop request');
      return;
    }

    this.logger.info('Stopping server');

    try {
      // 关闭所有客户端连接
      const clientEntries = Array.from(this.clients.entries());
      for (const [clientId, socket] of clientEntries) {
        try {
          socket.end();
          this.logger.debug(`Client ${clientId} connection ended`);
        } catch (error) {
          this.logger.error(`Error closing client ${clientId} connection: ${error.message}`, error);
        }
      }

      // 关闭服务器
      await new Promise<void>((resolve, reject) => {
        if (!this.server) {
          resolve();
          return;
        }

        this.server.close((err) => {
          if (err) {
            reject(new TCPSocketError(`Failed to stop server: ${err.message}`, 'SERVER_STOP_ERROR', err));
          } else {
            resolve();
          }
        });
      });

      this.server = null;
      this.clients.clear();
      this.clientDataProcessors.clear();
      this.logger.info('Server stopped');
    } catch (error) {
      this.logger.error(`Error stopping server: ${error.message}`, error);
      throw error;
    }
  }

  async broadcast(data: Buffer | string | object, options: SendOptions = {}): Promise<void> {
    if (!this.server) {
      throw new TCPSocketError('Server not running', 'SERVER_NOT_RUNNING');
    }

    if (this.clients.size === 0) {
      this.logger.warn('No clients connected, broadcast has no effect');
      return;
    }

    this.logger.info(`Broadcasting to ${this.clients.size} clients`);

    const promises: Promise<void>[] = [];
    for (const clientId of this.clients.keys()) {
      promises.push(this.sendToClient(clientId, data, options).catch(error => {
        this.logger.error(`Error broadcasting to client ${clientId}: ${error.message}`, error);
      }));
    }

    await Promise.all(promises);
    this.logger.debug('Broadcast completed');
  }

  async sendToClient(clientId: string, data: Buffer | string | object, options: SendOptions = {}): Promise<any> {
    if (!this.server) {
      throw new TCPSocketError('Server not running', 'SERVER_NOT_RUNNING');
    }

    const socket = this.clients.get(clientId);
    if (!socket) {
      throw new TCPSocketError(`Client ${clientId} not found`, 'CLIENT_NOT_FOUND');
    }

    const dataProcessor = this.clientDataProcessors.get(clientId);
    if (!dataProcessor) {
      throw new TCPSocketError(`Data processor for client ${clientId} not found`, 'DATA_PROCESSOR_NOT_FOUND');
    }

    try {
      const buffer = dataProcessor.encode(data);

      this.logger.debug(`Sending data to client ${clientId} (${buffer.length} bytes)`);

      await new Promise<void>((resolve, reject) => {
        socket.write(buffer, (err) => {
          if (err) {
            reject(new TCPSocketError(`Failed to send data to client ${clientId}: ${err.message}`, 'SEND_ERROR', err));
          } else {
            resolve();
            this.stats.bytesSent += buffer.length;
          }
        });
      });

      return null; // 服务器端发送通常不等待响应
    } catch (error) {
      this.logger.error(`Error sending data to client ${clientId}: ${error.message}`, error);
      throw error;
    }
  }

  getClients(): string[] {
    return Array.from(this.clients.keys());
  }

  getStats(): {
    clientsCount: number;
    totalConnections: number;
    bytesSent: number;
    bytesReceived: number;
    startTime: Date;
    uptime: number;
  } {
    this.stats.clientsCount = this.clients.size;
    this.stats.uptime = Date.now() - this.stats.startTime.getTime();
    return { ...this.stats };
  }

  getConfig(): SecureConnectionOptions & {
    maxConnections?: number;
    clientIdleTimeout?: number;
  } {
    return { ...this.config };
  }

  updateConfig(options: Partial<SecureConnectionOptions & {
    maxConnections?: number;
    clientIdleTimeout?: number;
  }>): void {
    const prevConfig = { ...this.config };
    this.config = { ...this.config, ...options };

    this.logger.info('Configuration updated', {
      prevConfig: JSON.stringify(prevConfig),
      newConfig: JSON.stringify(this.config)
    });

    // 如果服务器已经在运行，可能需要重启以应用某些配置
    if (this.server &&
       (options.secure !== undefined ||
        options.cert !== undefined ||
        options.key !== undefined ||
        options.ca !== undefined)) {
      this.logger.warn('Security configuration changed, server restart required to apply changes');
    }
  }

  private async createServer(port: number, host: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      try {
        if (this.config.secure) {
          // 创建TLS服务器
          const tlsOptions: tls.TlsOptions = {};

          if (this.config.cert) {
            tlsOptions.cert = fs.readFileSync(this.config.cert);
          } else {
            reject(new TCPSocketError('Certificate required for secure server', 'CONFIG_ERROR'));
            return;
          }

          if (this.config.key) {
            tlsOptions.key = fs.readFileSync(this.config.key);
          } else {
            reject(new TCPSocketError('Private key required for secure server', 'CONFIG_ERROR'));
            return;
          }

          if (this.config.ca) {
            tlsOptions.ca = this.config.ca.map(ca => fs.readFileSync(ca));
          }

          if (this.config.requestCert !== undefined) {
            tlsOptions.requestCert = this.config.requestCert;
          }

          if (this.config.rejectUnauthorized !== undefined) {
            tlsOptions.rejectUnauthorized = this.config.rejectUnauthorized;
          }

          if (this.config.ciphers) {
            tlsOptions.ciphers = this.config.ciphers;
          }

          this.server = tls.createServer(tlsOptions, this.handleConnection.bind(this));
        } else {
          // 创建普通TCP服务器
          this.server = net.createServer(this.handleConnection.bind(this));
        }

        // 设置最大连接数
        if (this.config.maxConnections) {
          this.server.maxConnections = this.config.maxConnections;
        }

        // 错误处理
        this.server.on('error', (error) => {
          this.logger.error(`Server error: ${error.message}`, error);
          this.emit('error', error);

          if (!this.server!.listening) {
            reject(new TCPSocketError(`Server failed to start: ${error.message}`, 'SERVER_ERROR', error));
          }
        });

        // 监听连接
        this.server.listen(port, host, () => {
          this.logger.info(`Server listening on ${host}:${port}`);
          resolve();
        });
      } catch (error) {
        reject(new TCPSocketError(`Failed to create server: ${error.message}`, 'SERVER_CREATE_ERROR', error));
      }
    });
  }

  private handleConnection(socket: net.Socket | tls.TLSSocket): void {
    const clientId = this.generateClientId(socket);
    const dataProcessor = new DataProcessor(this.config.dataFormat || {});

    this.logger.info(`New client connection: ${clientId}`);
    this.stats.totalConnections++;

    // 保存客户端连接
    this.clients.set(clientId, socket);
    this.clientDataProcessors.set(clientId, dataProcessor);

    // 设置客户端空闲超时
    if (this.config.clientIdleTimeout) {
      socket.setTimeout(this.config.clientIdleTimeout);
    }

    // 注册事件处理器
    socket.on('data', (data) => {
      this.handleClientData(clientId, data);
    });

    socket.on('close', (hadError) => {
      this.logger.info(`Client ${clientId} disconnected${hadError ? ' due to error' : ''}`);
      this.clients.delete(clientId);
      this.clientDataProcessors.delete(clientId);
      this.emit('clientDisconnect', clientId, hadError ? 'error' : 'normal');
    });

    socket.on('error', (error) => {
      this.logger.error(`Client ${clientId} error: ${error.message}`, error);
      this.emit('clientError', clientId, error);
    });

    socket.on('timeout', () => {
      this.logger.warn(`Client ${clientId} idle timeout`);
      this.emit('clientTimeout', clientId);
      socket.end();
    });

    // 触发客户端连接事件
    this.emit('clientConnect', clientId, {
      remoteAddress: socket.remoteAddress,
      remotePort: socket.remotePort
    });
  }

  private handleClientData(clientId: string, data: Buffer): void {
    this.stats.bytesReceived += data.length;

    try {
      const dataProcessor = this.clientDataProcessors.get(clientId);
      if (!dataProcessor) {
        throw new TCPSocketError(`Data processor for client ${clientId} not found`, 'DATA_PROCESSOR_NOT_FOUND');
      }

      const decoded = dataProcessor.decode(data);
      this.logger.debug(`Received data from client ${clientId} (${data.length} bytes)`);

      // 触发数据事件
      this.emit('clientData', clientId, decoded);
    } catch (error) {
      this.logger.error(`Error processing data from client ${clientId}: ${error.message}`, error);
    }
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
 * TCP/Socket适配器工厂实现
 */
class TCPSocketAdapterFactory implements ITCPSocketAdapterFactory {
  constructor(
    private defaultConnectionOptions: Partial<TCPSocketConnectionOptions> = {},
    private defaultSecureOptions: Partial<SecureConnectionOptions> = {},
    private defaultDataFormatOptions: Partial<DataFormatOptions> = {},
    private logLevel: LogLevel = LogLevel.INFO
  ) {}

  /**
   * 获取可用协议处理器列表
   * @returns 协议处理器列表
   */
  getAvailableProtocolProcessors(): ProtocolProcessor[] {
    return [
      {
        processInput: (data: Buffer): Buffer | null => data,
        processOutput: (data: Buffer): Buffer => data,
        getName: (): string => 'default',
        getVersion: (): string => '1.0.0',
        initialize: async (): Promise<void> => {},
        reset: (): void => {},
        destroy: (): void => {}
      },
      {
        processInput: (data: Buffer): Buffer | null => data,
        processOutput: (data: Buffer): Buffer => data,
        getName: (): string => 'modbus',
        getVersion: (): string => '1.0.0',
        initialize: async (): Promise<void> => {},
        reset: (): void => {},
        destroy: (): void => {}
      },
      {
        processInput: (data: Buffer): Buffer | null => data,
        processOutput: (data: Buffer): Buffer => data,
        getName: (): string => 'mqtt',
        getVersion: (): string => '1.0.0',
        initialize: async (): Promise<void> => {},
        reset: (): void => {},
        destroy: (): void => {}
      }
    ];
  }

  /**
   * 注册协议处理器
   * @param signature 协议特征
   * @param processor 协议处理器
   */
  registerProtocolProcessor(signature: ProtocolSignature, processor: ProtocolProcessor): void {
    // 协议处理器注册逻辑
  }

  /**
   * 获取已注册的协议处理器
   * @returns 协议处理器列表及其特征
   */
  getRegisteredProtocolProcessors(): { signature: ProtocolSignature, processor: ProtocolProcessor }[] {
    return [];
  }

  createClient(
    options: TCPSocketConnectionOptions & SecureConnectionOptions & DataFormatOptions
  ): ITCPSocketClient {
    // 合并默认选项和用户提供的选项
    const mergedOptions = {
      ...this.defaultConnectionOptions,
      ...this.defaultSecureOptions,
      ...this.defaultDataFormatOptions,
      ...options
    };

    return new TCPSocketClient(mergedOptions, this.logLevel);
  }

  createServer(
    options: SecureConnectionOptions & {
      maxConnections?: number;
      clientIdleTimeout?: number;
      dataFormat?: DataFormatOptions;
    }
  ): ITCPSocketServer {
    // 合并默认选项和用户提供的选项
    const mergedOptions = {
      ...this.defaultSecureOptions,
      ...options,
      dataFormat: {
        ...this.defaultDataFormatOptions,
        ...options.dataFormat
      }
    };

    return new TCPSocketServer(mergedOptions, this.logLevel);
  }
}

/**
 * TCP/Socket适配器管理器实现
 */
class TCPSocketAdapterManager implements ITCPSocketAdapterManager {
  private clients: Map<string, ITCPSocketClient> = new Map();
  private servers: Map<string, ITCPSocketServer> = new Map();
  private logger: Logger;
  private protocolProcessors: Map<string, ProtocolProcessor> = new Map();

  constructor(
    private factory: ITCPSocketAdapterFactory,
    logLevel: LogLevel = LogLevel.INFO
  ) {
    this.logger = new Logger(logLevel, 'TCPSocketAdapterManager');
  }

  /**
   * 扫描网络设备
   * @param options 扫描选项
   * @returns Promise 解析为发现的设备列表
   */
  async scanNetworkDevices(options?: any): Promise<any[]> {
    this.logger.info('扫描网络设备');
    // 实际扫描逻辑
    return [];
  }

  /**
   * 连接到已发现的设备
   * @param deviceId 设备ID
   * @param options 连接选项
   * @returns Promise 解析为客户端连接
   */
  async connectToDiscoveredDevice(deviceId: string, options?: any): Promise<ITCPSocketClient> {
    this.logger.info(`连接到设备: ${deviceId}`);
    throw new Error('功能尚未实现');
  }

  /**
   * 注册协议处理器
   * @param signature 协议特征
   * @param processor 协议处理器
   */
  registerProtocolProcessor(signature: ProtocolSignature, processor: ProtocolProcessor): void {
    this.logger.info(`注册协议处理器: ${processor.getName()}`);
    this.protocolProcessors.set(processor.getName(), processor);
  }

  /**
   * 获取已注册的协议处理器
   * @returns 协议处理器列表及其特征
   */
  getRegisteredProtocolProcessors(): { signature: ProtocolSignature, processor: ProtocolProcessor }[] {
    // 这里仅为示例，实际实现中需要存储signature与processor的映射关系
    return Array.from(this.protocolProcessors.values()).map(processor => {
      return {
        signature: {
          name: processor.getName(),
          version: processor.getVersion()
        },
        processor
      };
    });
  }

  createClient(
    id: string,
    options: TCPSocketConnectionOptions & SecureConnectionOptions & DataFormatOptions
  ): ITCPSocketClient {
    if (this.clients.has(id)) {
      this.logger.warn(`Client with ID ${id} already exists, it will be replaced`);
      const existingClient = this.clients.get(id);
      if (existingClient) {
        try {
          existingClient.disconnect(true).catch(err => {
            this.logger.error(`Error disconnecting existing client ${id}: ${err.message}`, err);
          });
        } catch (error) {
          this.logger.error(`Error during forced disconnect of client ${id}: ${error.message}`, error);
        }
      }
    }

    const client = this.factory.createClient(options);
    this.clients.set(id, client);
    this.logger.info(`Client ${id} created`);

    return client;
  }

  createServer(
    id: string,
    options: SecureConnectionOptions & {
      maxConnections?: number;
      clientIdleTimeout?: number;
      dataFormat?: DataFormatOptions;
    }
  ): ITCPSocketServer {
    if (this.servers.has(id)) {
      this.logger.warn(`Server with ID ${id} already exists, it will be replaced`);
      const existingServer = this.servers.get(id);
      if (existingServer) {
        try {
          existingServer.stop().catch(err => {
            this.logger.error(`Error stopping existing server ${id}: ${err.message}`, err);
          });
        } catch (error) {
          this.logger.error(`Error during stopping of server ${id}: ${error.message}`, error);
        }
      }
    }

    const server = this.factory.createServer(options);
    this.servers.set(id, server);
    this.logger.info(`Server ${id} created`);

    return server;
  }

  getClient(id: string): ITCPSocketClient | undefined {
    return this.clients.get(id);
  }

  getServer(id: string): ITCPSocketServer | undefined {
    return this.servers.get(id);
  }

  removeClient(id: string): boolean {
    const client = this.clients.get(id);
    if (!client) {
      this.logger.warn(`Client ${id} not found, cannot remove`);
      return false;
    }

    try {
      client.disconnect(true).catch(err => {
        this.logger.error(`Error disconnecting client ${id} during removal: ${err.message}`, err);
      });
    } catch (error) {
      this.logger.error(`Error during forced disconnect of client ${id}: ${error.message}`, error);
    }

    const result = this.clients.delete(id);
    this.logger.info(`Client ${id} removed`);

    return result;
  }

  removeServer(id: string): boolean {
    const server = this.servers.get(id);
    if (!server) {
      this.logger.warn(`Server ${id} not found, cannot remove`);
      return false;
    }

    try {
      server.stop().catch(err => {
        this.logger.error(`Error stopping server ${id} during removal: ${err.message}`, err);
      });
    } catch (error) {
      this.logger.error(`Error during stopping of server ${id}: ${error.message}`, error);
    }

    const result = this.servers.delete(id);
    this.logger.info(`Server ${id} removed`);

    return result;
  }

  getAllClientIds(): string[] {
    return Array.from(this.clients.keys());
  }

  getAllServerIds(): string[] {
    return Array.from(this.servers.keys());
  }

  async dispose(): Promise<void> {
    this.logger.info('Disposing TCP/Socket adapter manager');

    // 关闭所有客户端
    const clientIds = this.getAllClientIds();
    for (const clientId of clientIds) {
      try {
        await this.removeClient(clientId);
      } catch (error) {
        this.logger.error(`Error removing client ${clientId} during dispose: ${error.message}`, error);
      }
    }

    // 关闭所有服务器
    const serverIds = this.getAllServerIds();
    for (const serverId of serverIds) {
      try {
        await this.removeServer(serverId);
      } catch (error) {
        this.logger.error(`Error removing server ${serverId} during dispose: ${error.message}`, error);
      }
    }

    this.clients.clear();
    this.servers.clear();
    this.logger.info('TCP/Socket adapter manager disposed');
  }
}

/**
 * TCP/Socket适配器实现
 */
class TCPSocketAdapter implements ITCPSocketAdapter {
  private factory: TCPSocketAdapterFactory;
  private manager: TCPSocketAdapterManager;
  private logger: Logger;
  private supportedDeviceTypes: DeviceType[] = [
    // 将设备类型常量替换为device-discovery.ts中定义的常量
    DeviceType.ELECTRONIC_MEASUREMENT,
    DeviceType.OPTICAL,
    DeviceType.MECHANICAL,
    DeviceType.CHEMICAL_ANALYSIS
  ];
  private supportedProtocols: ProtocolSignature[] = [
    {
      name: 'tcp',
      version: '1.0.0',
      description: 'TCP协议'
    },
    {
      name: 'socket',
      version: '1.0.0',
      description: 'Socket协议'
    },
    {
      name: 'tls',
      version: '1.0.0',
      description: '安全TCP协议'
    }
  ];

  constructor(
    private config: {
      defaultConnectionOptions?: Partial<TCPSocketConnectionOptions>;
      defaultSecureOptions?: Partial<SecureConnectionOptions>;
      defaultDataFormatOptions?: Partial<DataFormatOptions>;
      logLevel?: LogLevel;
      monitoring?: {
        enabled: boolean;
        interval?: number;
        storePath?: string;
      };
    } = {}
  ) {
    const logLevel = config.logLevel || LogLevel.INFO;
    this.logger = new Logger(logLevel, 'TCPSocketAdapter');

    this.factory = new TCPSocketAdapterFactory(
      config.defaultConnectionOptions || {},
      config.defaultSecureOptions || {},
      config.defaultDataFormatOptions || {},
      logLevel
    );

    this.manager = new TCPSocketAdapterManager(this.factory, logLevel);

    this.logger.info('TCP/Socket adapter initialized', {
      version: this.getVersion(),
      config: JSON.stringify(config)
    });
  }

  getFactory(): ITCPSocketAdapterFactory {
    return this.factory as any;
  }

  getManager(): ITCPSocketAdapterManager {
    return this.manager as any;
  }

  /**
   * 获取支持的设备类型
   * @returns 支持的设备类型列表
   */
  getSupportedDeviceTypes(): DeviceType[] {
    return this.supportedDeviceTypes;
  }

  /**
   * 获取支持的协议
   * @returns 支持的协议列表
   */
  getSupportedProtocols(): ProtocolSignature[] {
    return this.supportedProtocols;
  }

  /**
   * 获取设备发现服务
   * @returns 设备发现服务
   */
  getDeviceDiscoveryService(): any {
    return {
      scanNetwork: async () => {
        this.logger.info('扫描网络设备');
        return [];
      }
    };
  }

  /**
   * 获取协议检测服务
   * @returns 协议检测服务
   */
  getProtocolDetectionService(): any {
    return {
      detectProtocol: async (data: Buffer) => {
        this.logger.info('检测协议');
        return null;
      }
    };
  }

  /**
   * 获取数据流处理服务
   * @returns 数据流处理服务
   */
  getDataStreamProcessingService(): any {
    return {
      compressData: (data: Buffer, method?: CompressionMethod) => {
        this.logger.info('压缩数据');
        return data;
      },
      decompressData: (data: Buffer, method?: CompressionMethod) => {
        this.logger.info('解压数据');
        return data;
      }
    };
  }

  /**
   * 获取证书认证服务
   * @returns 证书认证服务
   */
  getCertificateAuthenticationService(): any {
    return {
      authenticate: async (certificate: Buffer) => {
        this.logger.info('验证证书');
        return true;
      }
    };
  }

  /**
   * 获取认证服务
   * @returns 认证服务
   */
  getAuthenticationService(): any {
    return {
      authenticate: async (credentials: any) => {
        this.logger.info('认证');
        return { success: true };
      }
    };
  }

  /**
   * 获取数据处理服务
   * @returns 数据处理服务
   */
  getDataProcessingService(): any {
    return {
      processData: (data: any) => {
        this.logger.info('处理数据');
        return data;
      }
    };
  }

  configure(options: {
    defaultConnectionOptions?: Partial<TCPSocketConnectionOptions>;
    defaultSecureOptions?: Partial<SecureConnectionOptions>;
    defaultDataFormatOptions?: Partial<DataFormatOptions>;
    logLevel?: LogLevel;
    monitoring?: {
      enabled: boolean;
      interval?: number;
      storePath?: string;
    };
  }): void {
    this.config = { ...this.config, ...options };

    // 更新日志级别
    if (options.logLevel) {
      this.logger = new Logger(options.logLevel, 'TCPSocketAdapter');
    }

    // 创建新的工厂和管理器
    this.factory = new TCPSocketAdapterFactory(
      this.config.defaultConnectionOptions || {},
      this.config.defaultSecureOptions || {},
      this.config.defaultDataFormatOptions || {},
      this.config.logLevel || LogLevel.INFO
    );

    // 保留现有的管理器以维护已创建的客户端和服务器

    this.logger.info('TCP/Socket adapter reconfigured', {
      config: JSON.stringify(this.config)
    });
  }

  getVersion(): string {
    return '1.0.0';
  }
}

/**
 * 创建TCP/Socket适配器实例
 */
export function createTCPSocketAdapter(config?: {
  defaultConnectionOptions?: Partial<TCPSocketConnectionOptions>;
  defaultSecureOptions?: Partial<SecureConnectionOptions>;
  defaultDataFormatOptions?: Partial<DataFormatOptions>;
  logLevel?: LogLevel;
  monitoring?: {
    enabled: boolean;
    interval?: number;
    storePath?: string;
  };
}): ITCPSocketAdapter {
  return new TCPSocketAdapter(config);
}

// 导出枚举和类型
export { TCPSocketError, ConnectionError, TimeoutError };
