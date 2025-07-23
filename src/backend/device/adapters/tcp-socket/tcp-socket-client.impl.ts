/**
 * TCP/Socket适配器客户端实现
 *
 * 该文件实现了TCP/Socket适配器的客户端接口，提供与TCP设备的通信功能
 *
 * @version 1.0.0
 * @date 2025-07-24
 */

import * as net from 'net';
import * as tls from 'tls';
import { EventEmitter } from 'events';
import {
  ITCPSocketClient,
  TCPSocketConnectionOptions,
  ConnectionState,
  CommunicationStats,
  TCPSocketEvents,
  SendOptions,
  SecureConnectionOptions
} from './tcp-socket-adapter';
import { ProtocolDetector } from './protocol-detector';
import { DataStreamProcessor } from './data-stream-processor';
import { CertificateAuthenticator } from './certificate-authenticator';

/**
 * TCP/Socket客户端实现类
 */
export class TCPSocketClientImpl extends EventEmitter implements ITCPSocketClient {
  private socket: net.Socket | tls.TLSSocket | null = null;
  private options: TCPSocketConnectionOptions;
  private connectionState: ConnectionState = ConnectionState.DISCONNECTED;
  private connectionId: string;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private reconnectAttempts: number = 0;
  private protocolDetector: ProtocolDetector;
  private dataProcessor: DataStreamProcessor;
  private certificateAuthenticator: CertificateAuthenticator;
  private stats: CommunicationStats = {
    bytesSent: 0,
    bytesReceived: 0,
    messagesSent: 0,
    messagesReceived: 0,
    connectionsEstablished: 0,
    connectionsDropped: 0,
    errors: 0,
    lastActivity: new Date(),
    commandsSent: 0,
    responsesReceived: 0,
    errorsCount: 0,
    connectCount: 0,
    disconnectCount: 0,
    errorCount: 0,
    lastConnectTime: 0,
    lastDisconnectTime: 0,
    lastErrorTime: 0,
    lastCommandTime: 0,
    lastResponseTime: 0
  };

  /**
   * 构造函数
   * @param options 连接选项
   */
  constructor(options: TCPSocketConnectionOptions) {
    super();
    this.options = this.setDefaultOptions(options);
    this.connectionId = this.generateConnectionId();
    this.protocolDetector = new ProtocolDetector();
    this.dataProcessor = new DataStreamProcessor();
    this.certificateAuthenticator = new CertificateAuthenticator();
  }

  /**
   * 设置默认选项
   * @param options 用户提供的选项
   * @returns 合并了默认值的选项
   */
  private setDefaultOptions(options: TCPSocketConnectionOptions): TCPSocketConnectionOptions {
    return {
      host: options.host,
      port: options.port,
      connectionTimeout: options.connectionTimeout || 10000,
      keepAlive: options.keepAlive !== undefined ? options.keepAlive : true,
      noDelay: options.noDelay !== undefined ? options.noDelay : true,
      receiveBufferSize: options.receiveBufferSize || 4096,
      sendBufferSize: options.sendBufferSize || 4096,
      retryCount: options.retryCount || 3,
      retryDelay: options.retryDelay || 5000,
      autoReconnect: options.autoReconnect !== undefined ? options.autoReconnect : false,
      deviceType: options.deviceType,
      enableProtocolDetection: options.enableProtocolDetection !== undefined ? options.enableProtocolDetection : true,
      protocolSignatures: options.protocolSignatures || [],
      secure: options.secure
    };
  }

  /**
   * 生成唯一的连接ID
   * @returns 连接ID
   */
  private generateConnectionId(): string {
    return `tcp-${this.options.host}-${this.options.port}-${Date.now()}`;
  }

  /**
   * 连接到设备
   * @returns 连接结果的Promise
   */
  async connect(): Promise<void> {
    if (this.connectionState === ConnectionState.CONNECTED ||
        this.connectionState === ConnectionState.CONNECTING) {
      return;
    }

    this.setConnectionState(ConnectionState.CONNECTING);

    try {
      await new Promise<void>((resolve, reject) => {
        // 设置连接超时
        const connectionTimeout = setTimeout(() => {
          if (this.socket) {
            this.socket.destroy();
            this.socket = null;
          }
          this.setConnectionState(ConnectionState.DISCONNECTED);
          reject(new Error(`Connection timeout after ${this.options.connectionTimeout}ms`));
        }, this.options.connectionTimeout);

        // 创建Socket
        if (this.options.secure && this.options.secure.secure) {
          // 创建安全连接
          this.socket = tls.connect({
            host: this.options.host,
            port: this.options.port,
            cert: this.options.secure.cert ? Buffer.from(this.options.secure.cert) : undefined,
            key: this.options.secure.key ? Buffer.from(this.options.secure.key) : undefined,
            ca: this.options.secure.ca ? this.options.secure.ca.map(cert => Buffer.from(cert)) : undefined,
            rejectUnauthorized: this.options.secure.rejectUnauthorized !== undefined ?
              this.options.secure.rejectUnauthorized : true,
            requestCert: this.options.secure.requestCert || false,
            ciphers: this.options.secure.ciphers
          });
        } else {
          // 创建普通连接
          this.socket = net.createConnection({
            host: this.options.host,
            port: this.options.port
          });
        }

        // 配置Socket选项
        if (this.socket) {
          this.socket.setKeepAlive(!!this.options.keepAlive);
          this.socket.setNoDelay(!!this.options.noDelay);

          // 注意：Node.js Socket API中不存在setRecvBufferSize和setSendBufferSize方法
          // 以下代码是处理这个问题的替代方案
          if (this.options.receiveBufferSize) {
            // 在实际环境中，可以使用Socket参数或其他方式设置
            // 此处简化处理
          }

          if (this.options.sendBufferSize) {
            // 在实际环境中，可以使用Socket参数或其他方式设置
            // 此处简化处理
          }
        }        // 处理连接成功
        this.socket?.once('connect', () => {
          clearTimeout(connectionTimeout);
          this.reconnectAttempts = 0;
          this.setConnectionState(ConnectionState.CONNECTED);
          this.stats.connectCount++;
          this.stats.connectionsEstablished++;
          this.stats.lastConnectTime = Date.now();
          this.stats.connectionStartTime = new Date();
          this.emit(TCPSocketEvents.CONNECTED, { connectionId: this.connectionId });
          resolve();
        });

        // 处理错误
        this.socket?.on('error', (error) => {
          clearTimeout(connectionTimeout);
          this.handleError(error);

          if (this.connectionState === ConnectionState.CONNECTING) {
            reject(error);
          }
        });

        // 处理关闭
        this.socket?.on('close', (hadError) => {
          this.handleDisconnect(hadError);
        });

        // 处理数据接收
        this.socket?.on('data', (data) => {
          this.handleDataReceived(data);
        });
      });
    } catch (error) {
      this.handleError(error as Error);
      throw error;
    }
  }

  /**
   * 断开连接
   * @param force 是否强制断开
   * @returns 断开结果的Promise
   */
  async disconnect(force?: boolean): Promise<void> {
    if (this.connectionState === ConnectionState.DISCONNECTED) {
      return;
    }

    // 取消重连计时器
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    await new Promise<void>((resolve) => {
      if (!this.socket || this.socket.destroyed) {
        this.setConnectionState(ConnectionState.DISCONNECTED);
        resolve();
        return;
      }

      // 处理断开完成
      this.socket.once('close', () => {
        this.socket = null;
        this.setConnectionState(ConnectionState.DISCONNECTED);
        resolve();
      });

      // 强制断开
      if (force) {
        this.socket.destroy();
      } else {
        // 正常断开连接
        this.socket.end();
      }
    });
  }

  /**
   * 发送数据到设备
   * @param data 要发送的数据
   * @param options 发送选项
   * @returns 发送结果的Promise
   */
  async send(data: string | Buffer | object, options?: SendOptions): Promise<any> {
    if (this.connectionState !== ConnectionState.CONNECTED || !this.socket) {
      throw new Error('Not connected');
    }

    const sendData = typeof data === 'string' ?
      Buffer.from(data) :
      (Buffer.isBuffer(data) ? data : Buffer.from(JSON.stringify(data)));

    return new Promise<any>((resolve, reject) => {
      this.socket?.write(sendData, (error) => {
        if (error) {
          this.handleError(error);
          reject(error);
          return;
        }

        this.stats.bytesSent += sendData.length;
        this.stats.commandsSent++;
        this.stats.messagesSent++;
        this.stats.lastCommandTime = Date.now();
        this.stats.lastActivity = new Date();

        // 如果期望响应，将在handleDataReceived中处理
        if (options?.expectResponse || options?.waitForResponse) {
          // 这里可以实现响应等待逻辑
          resolve(null);
        } else {
          resolve(null);
        }
      });
    });
  }

  /**
   * 获取连接状态
   * @returns 当前连接状态
   */
  getState(): ConnectionState {
    return this.connectionState;
  }

  /**
   * 获取连接状态
   * @returns 当前连接状态
   */
  getConnectionState(): ConnectionState {
    return this.connectionState;
  }

  /**
   * 获取连接统计信息
   * @returns 通信统计数据
   */
  getStats(): CommunicationStats {
    // 计算当前连接持续时间
    if (this.stats.connectionStartTime && this.connectionState === ConnectionState.CONNECTED) {
      this.stats.currentConnectionDuration = Date.now() - this.stats.connectionStartTime.getTime();
    }
    return { ...this.stats };
  }

  /**
   * 重置统计信息
   */
  resetStats(): void {
    this.stats = {
      bytesSent: 0,
      bytesReceived: 0,
      messagesSent: 0,
      messagesReceived: 0,
      connectionsEstablished: 0,
      connectionsDropped: 0,
      errors: 0,
      lastActivity: new Date(),
      commandsSent: 0,
      responsesReceived: 0,
      errorsCount: 0,
      connectCount: 0,
      disconnectCount: 0,
      errorCount: 0,
      lastConnectTime: 0,
      lastDisconnectTime: 0,
      lastErrorTime: 0,
      lastCommandTime: 0,
      lastResponseTime: 0
    };

    if (this.connectionState === ConnectionState.CONNECTED) {
      this.stats.connectionStartTime = new Date();
    }
  }

  /**
   * 检查连接是否活动
   * @returns 连接是否活动
   */
  isAlive(): boolean {
    return this.connectionState === ConnectionState.CONNECTED && !!this.socket && !this.socket.destroyed;
  }

  /**
   * 发送心跳包
   * @returns Promise 心跳成功后解析
   */
  async sendHeartbeat(): Promise<void> {
    await this.send(Buffer.from([0]));
  }

  /**
   * 获取当前连接配置
   * @returns 连接配置
   */
  getConfig(): any {
    return { ...this.options };
  }

  /**
   * 更新连接配置
   * @param options 要更新的配置
   */
  updateConfig(options: Partial<TCPSocketConnectionOptions>): void {
    this.options = { ...this.options, ...options };
  }

  /**
   * 获取连接ID
   * @returns 连接ID
   */
  getConnectionId(): string {
    return this.connectionId;
  }

  /**
   * 获取连接选项
   * @returns 连接选项
   */
  getOptions(): TCPSocketConnectionOptions {
    return { ...this.options };
  }

  /**
   * 启用协议自动检测
   * @param signatures 要检测的协议特征列表
   * @returns 当前客户端实例
   */
  enableProtocolDetection(signatures?: any[]): this {
    if (signatures) {
      // 更新协议特征
    }
    this.options.enableProtocolDetection = true;
    return this;
  }

  /**
   * 获取当前检测到的协议
   * @returns 当前协议特征，如未检测到则返回null
   */
  getDetectedProtocol(): any | null {
    return null; // 需要实现
  }

  /**
   * 启用数据压缩
   * @param method 压缩方法
   * @param level 压缩级别 (1-9, 1为最快，9为最高压缩率)
   * @returns 当前客户端实例
   */
  enableCompression(method: any, level?: number): this {
    // 需要实现
    return this;
  }

  /**
   * 启用证书认证
   * @param method 认证方法
   * @param options 认证选项
   * @returns 当前客户端实例
   */
  enableAuthentication(method: any, options?: any): this {
    // 需要实现
    return this;
  }

  /**
   * 检测设备类型
   * @returns Promise 解析为检测到的设备类型
   */
  async detectDeviceType(): Promise<any | null> {
    return this.options.deviceType || null;
  }

  /**
   * 设置连接状态
   * @param state 新的连接状态
   */
  private setConnectionState(state: ConnectionState): void {
    const oldState = this.connectionState;
    if (oldState !== state) {
      this.connectionState = state;
      this.emit(TCPSocketEvents.STATE_CHANGE, state, oldState);
    }
  }

  /**
   * 处理连接错误
   * @param error 错误对象
   */
  private handleError(error: Error): void {
    this.stats.errorsCount++;
    this.stats.errorCount++;
    this.stats.errors++;
    this.stats.lastErrorTime = Date.now();
    this.stats.lastActivity = new Date();
    this.emit(TCPSocketEvents.ERROR, {
      connectionId: this.connectionId,
      error
    });

    // 如果连接已经建立，但出现错误，尝试断开连接
    if (this.connectionState === ConnectionState.CONNECTED && this.socket) {
      this.socket.destroy(error);
    }
  }

  /**
   * 处理连接断开
   * @param hadError 是否因错误断开
   */
  private handleDisconnect(hadError: boolean): void {
    const wasConnected = this.connectionState === ConnectionState.CONNECTED;
    this.setConnectionState(ConnectionState.DISCONNECTED);
    this.stats.disconnectCount++;
    this.stats.connectionsDropped++;
    this.stats.lastDisconnectTime = Date.now();
    this.stats.lastActivity = new Date();
    this.emit(TCPSocketEvents.DISCONNECTED, {
      connectionId: this.connectionId,
      hadError
    });

    // 尝试自动重连
    if (wasConnected && this.options.autoReconnect &&
        (this.reconnectAttempts < (this.options.retryCount || 0) || this.options.retryCount === -1)) {
      this.scheduleReconnect();
    }
  }

  /**
   * 处理接收到的数据
   * @param data 接收到的数据
   */
  private handleDataReceived(data: Buffer): void {
    this.stats.bytesReceived += data.length;
    this.stats.responsesReceived++;
    this.stats.messagesReceived++;
    this.stats.lastResponseTime = Date.now();
    this.stats.lastActivity = new Date();

    // 如果启用了协议检测，尝试检测协议
    if (this.options.enableProtocolDetection) {
      // 协议检测逻辑，具体实现可能会有所不同
      // 注意：此处假设ProtocolDetector实现尚未完成或有变化
      try {
        // 此处应该调用适当的协议检测方法
        // const detectionResult = this.protocolDetector.detect(data);
        // 协议检测结果处理
      } catch (err) {
        // 处理检测错误
      }
    }

    // 发送数据接收事件
    this.emit(TCPSocketEvents.DATA_RECEIVED, {
      connectionId: this.connectionId,
      data
    });
  }

  /**
   * 调度重连任务
   */
  private scheduleReconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }

    this.reconnectAttempts++;
    const delay = this.calculateReconnectDelay();

    this.reconnectTimer = setTimeout(async () => {
      try {
        await this.connect();
        this.emit(TCPSocketEvents.RECONNECT, this.reconnectAttempts);
      } catch (error) {
        // 如果重连失败且仍有重试次数，继续尝试
        if ((this.options.retryCount && this.reconnectAttempts < this.options.retryCount) || this.options.retryCount === -1) {
          this.scheduleReconnect();
        }
      }
    }, delay);
  }

  /**
   * 计算重连延迟时间
   * @returns 延迟时间(ms)
   */
  private calculateReconnectDelay(): number {
    // 使用指数退避算法，但最大不超过30秒
    const baseDelay = this.options.retryDelay || 5000;
    const maxDelay = 30000;
    const exponentialDelay = baseDelay * Math.pow(1.5, this.reconnectAttempts - 1);
    return Math.min(exponentialDelay, maxDelay);
  }
}
