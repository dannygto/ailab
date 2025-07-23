/**
 * TCP/Socket协议适配器API接口定义文档
 *
 * 本文档定义了TCP/Socket协议适配器的公共API接口，供设备管理系统和应用层使用。
 *
 * @version 1.1.0
 * @date 2025-07-24
 */

import { EventEmitter } from 'events';
import { DeviceType } from './device-discovery';
import { ProtocolSignature, ProtocolProcessor } from './protocol-detector';
import { CompressionMethod } from './data-stream-processor';
import { AuthenticationMethod } from './certificate-authenticator';

/**
 * TCP/Socket连接选项
 */
export interface TCPSocketConnectionOptions {
  /** 主机地址 */
  host: string;

  /** 端口号 */
  port: number;

  /** 连接超时时间(毫秒) */
  connectionTimeout?: number;

  /** 是否启用保持活动连接 */
  keepAlive?: boolean;

  /** 是否启用Nagle算法 */
  noDelay?: boolean;

  /** 接收缓冲区大小 */
  receiveBufferSize?: number;

  /** 发送缓冲区大小 */
  sendBufferSize?: number;

  /** 连接重试次数 */
  retryCount?: number;

  /** 重试间隔(毫秒) */
  retryDelay?: number;

  /** 自动重连 */
  autoReconnect?: boolean;

  /** 设备类型 */
  deviceType?: DeviceType;

  /** 是否启用自动协议检测 */
  enableProtocolDetection?: boolean;

  /** 支持的协议特征列表 */
  protocolSignatures?: ProtocolSignature[];

  /** 安全连接选项 */
  secure?: SecureConnectionOptions;
}

/**
 * 安全连接选项
 */
export interface SecureConnectionOptions {
  /** 是否启用TLS/SSL */
  secure: boolean;

  /** 证书文件路径 */
  cert?: string;

  /** 私钥文件路径 */
  key?: string;

  /** CA证书文件路径 */
  ca?: string[];

  /** 是否请求客户端证书 */
  requestCert?: boolean;

  /** 是否拒绝未授权证书 */
  rejectUnauthorized?: boolean;

  /** 密码套件 */
  ciphers?: string;

  /** 认证方法 */
  authenticationMethod?: AuthenticationMethod;

  /** 证书验证回调 */
  certificateVerifyCallback?: (cert: object) => boolean;
}

/**
 * 数据格式选项
 */
export interface DataFormatOptions {
  /** 数据编码方式 */
  encoding?: 'utf8' | 'ascii' | 'binary' | 'hex' | 'base64';

  /** 大端序/小端序 */
  endianness?: 'big' | 'little';

  /** 是否使用JSON格式 */
  useJson?: boolean;

  /** 自定义数据解析器 */
  customParser?: (data: Buffer) => any;

  /** 自定义数据序列化器 */
  customSerializer?: (data: any) => Buffer;

  /** 压缩方法 */
  compressionMethod?: CompressionMethod;

  /** 是否启用分块传输 */
  enableChunking?: boolean;

  /** 分块大小 (字节) */
  chunkSize?: number;

  /** 分块传输超时 (毫秒) */
  chunkTimeout?: number;

  /** 是否启用校验和 */
  enableChecksum?: boolean;
}

/**
 * 连接状态
 */
export enum ConnectionState {
  /** 已断开连接 */
  DISCONNECTED = 'disconnected',

  /** 正在连接 */
  CONNECTING = 'connecting',

  /** 已连接 */
  CONNECTED = 'connected',

  /** 正在断开连接 */
  DISCONNECTING = 'disconnecting',

  /** 连接错误 */
  ERROR = 'error'
}

/**
 * 通信统计信息
 */
export interface CommunicationStats {
  /** 已发送字节数 */
  bytesSent: number;

  /** 已接收字节数 */
  bytesReceived: number;

  /** 消息发送次数 */
  messagesSent: number;

  /** 消息接收次数 */
  messagesReceived: number;

  /** 连接建立次数 */
  connectionsEstablished: number;

  /** 连接断开次数 */
  connectionsDropped: number;

  /** 错误发生次数 */
  errors: number;

  /** 最后活动时间 */
  lastActivity: Date;

  /** 连接开始时间 */
  connectionStartTime?: Date;

  /** 当前连接持续时间(毫秒) */
  currentConnectionDuration?: number;

  /** 命令发送次数 */
  commandsSent: number;

  /** 响应接收次数 */
  responsesReceived: number;

  /** 错误次数 */
  errorsCount: number;

  /** 连接次数 */
  connectCount: number;

  /** 断开连接次数 */
  disconnectCount: number;

  /** 错误次数 */
  errorCount: number;

  /** 最后连接时间 */
  lastConnectTime: number;

  /** 最后断开连接时间 */
  lastDisconnectTime: number;

  /** 最后错误时间 */
  lastErrorTime: number;

  /** 最后命令时间 */
  lastCommandTime: number;

  /** 最后响应时间 */
  lastResponseTime: number;
}

/**
 * 发送选项
 */
export interface SendOptions {
  /** 发送超时时间(毫秒) */
  timeout?: number;

  /** 是否等待响应 */
  waitForResponse?: boolean;

  /** 响应超时时间(毫秒) */
  responseTimeout?: number;

  /** 响应匹配函数 */
  responseMatch?: (data: Buffer | any) => boolean;

  /** 优先级 */
  priority?: number;

  /** 跟踪ID */
  trackingId?: string;

  /** 是否期望响应 */
  expectResponse?: boolean;
}

/**
 * TCP/Socket连接事件
 */
export enum TCPSocketEvents {
  /** 连接成功事件 */
  CONNECTED = 'connected',

  /** 断开连接事件 */
  DISCONNECTED = 'disconnected',

  /** 接收数据事件 */
  DATA_RECEIVED = 'data_received',

  /** 错误事件 */
  ERROR = 'error',

  /** 状态变化事件 */
  STATE_CHANGE = 'stateChange',

  /** 重连事件 */
  RECONNECT = 'reconnect',

  /** 超时事件 */
  TIMEOUT = 'timeout',

  /** 协议检测完成事件 */
  PROTOCOL_DETECTED = 'protocolDetected',

  /** 数据压缩完成事件 */
  DATA_COMPRESSED = 'dataCompressed',

  /** 数据解压完成事件 */
  DATA_DECOMPRESSED = 'dataDecompressed',

  /** 认证事件 */
  AUTHENTICATED = 'authenticated'
}

/**
 * TCP/Socket事件类型定义
 */
export interface TCPSocketEventMap {
  [TCPSocketEvents.CONNECTED]: (data: { connectionId: string }) => void;
  [TCPSocketEvents.DISCONNECTED]: (data: { connectionId: string, hadError: boolean }) => void;
  [TCPSocketEvents.ERROR]: (data: { connectionId: string, error: Error }) => void;
  [TCPSocketEvents.DATA_RECEIVED]: (data: { connectionId: string, data: Buffer }) => void;
  [TCPSocketEvents.STATE_CHANGE]: (newState: ConnectionState, oldState: ConnectionState) => void;
  [TCPSocketEvents.RECONNECT]: (attempt: number) => void;
  [TCPSocketEvents.TIMEOUT]: (operation: string) => void;
  [TCPSocketEvents.PROTOCOL_DETECTED]: (protocol: ProtocolSignature) => void;
  [TCPSocketEvents.DATA_COMPRESSED]: (originalSize: number, compressedSize: number) => void;
  [TCPSocketEvents.DATA_DECOMPRESSED]: (compressedSize: number, decompressedSize: number) => void;
  [TCPSocketEvents.AUTHENTICATED]: (success: boolean, details?: any) => void;
}

/**
 * TCP/Socket客户端接口
 */
export interface ITCPSocketClient extends EventEmitter {
  /**
   * 连接到TCP/Socket服务器
   * @returns Promise 连接成功后解析
   */
  connect(): Promise<void>;

  /**
   * 断开与服务器的连接
   * @param force 是否强制断开
   * @returns Promise 断开成功后解析
   */
  disconnect(force?: boolean): Promise<void>;

  /**
   * 发送数据到服务器
   * @param data 要发送的数据
   * @param options 发送选项
   * @returns Promise 发送成功后解析
   */
  send(data: Buffer | string | object, options?: SendOptions): Promise<any>;

  /**
   * 获取当前连接状态
   * @returns 连接状态
   */
  getState(): ConnectionState;

  /**
   * 获取当前连接状态
   * @returns 连接状态
   */
  getConnectionState(): ConnectionState;

  /**
   * 获取通信统计信息
   * @returns 通信统计信息
   */
  getStats(): CommunicationStats;

  /**
   * 重置统计信息
   */
  resetStats(): void;

  /**
   * 检查连接是否活动
   * @returns 连接是否活动
   */
  isAlive(): boolean;

  /**
   * 发送心跳包
   * @returns Promise 心跳成功后解析
   */
  sendHeartbeat(): Promise<void>;

  /**
   * 获取当前连接配置
   * @returns 连接配置
   */
  getConfig(): TCPSocketConnectionOptions & SecureConnectionOptions & DataFormatOptions;

  /**
   * 更新连接配置
   * @param options 要更新的配置
   */
  updateConfig(options: Partial<TCPSocketConnectionOptions & SecureConnectionOptions & DataFormatOptions>): void;

  /**
   * 获取连接ID
   * @returns 连接ID
   */
  getConnectionId(): string;

  /**
   * 获取连接选项
   * @returns 连接选项
   */
  getOptions(): TCPSocketConnectionOptions;

  // 事件监听器
  on(event: string, listener: (...args: any[]) => void): this;
  once(event: string, listener: (...args: any[]) => void): this;
  off(event: string, listener: (...args: any[]) => void): this;
  emit(event: string, ...args: any[]): boolean;

  /**
   * 启用协议自动检测
   * @param signatures 要检测的协议特征列表
   * @returns 当前客户端实例
   */
  enableProtocolDetection(signatures?: ProtocolSignature[]): this;

  /**
   * 获取当前检测到的协议
   * @returns 当前协议特征，如未检测到则返回null
   */
  getDetectedProtocol(): ProtocolSignature | null;

  /**
   * 启用数据压缩
   * @param method 压缩方法
   * @param level 压缩级别 (1-9, 1为最快，9为最高压缩率)
   * @returns 当前客户端实例
   */
  enableCompression(method: CompressionMethod, level?: number): this;

  /**
   * 启用证书认证
   * @param method 认证方法
   * @param options 认证选项
   * @returns 当前客户端实例
   */
  enableAuthentication(method: AuthenticationMethod, options?: any): this;

  /**
   * 检测设备类型
   * @returns Promise 解析为检测到的设备类型
   */
  detectDeviceType(): Promise<DeviceType | null>;
}

/**
 * TCP/Socket服务器接口
 */
export interface ITCPSocketServer extends EventEmitter {
  /**
   * 启动TCP/Socket服务器
   * @param port 监听端口
   * @param host 监听地址
   * @returns Promise 服务器启动成功后解析
   */
  start(port: number, host?: string): Promise<void>;

  /**
   * 停止TCP/Socket服务器
   * @returns Promise 服务器停止成功后解析
   */
  stop(): Promise<void>;

  /**
   * 向所有客户端广播数据
   * @param data 要广播的数据
   * @param options 发送选项
   * @returns Promise 广播成功后解析
   */
  broadcast(data: Buffer | string | object, options?: SendOptions): Promise<void>;

  /**
   * 向特定客户端发送数据
   * @param clientId 客户端ID
   * @param data 要发送的数据
   * @param options 发送选项
   * @returns Promise 发送成功后解析
   */
  sendToClient(clientId: string, data: Buffer | string | object, options?: SendOptions): Promise<any>;

  /**
   * 获取所有连接的客户端
   * @returns 客户端ID列表
   */
  getClients(): string[];

  /**
   * 获取服务器统计信息
   * @returns 服务器统计信息
   */
  getStats(): {
    /** 客户端连接数 */
    clientsCount: number;

    /** 已处理的连接总数 */
    totalConnections: number;

    /** 已发送字节数 */
    bytesSent: number;

    /** 已接收字节数 */
    bytesReceived: number;

    /** 开始时间 */
    startTime: Date;

    /** 运行时间(毫秒) */
    uptime: number;
  };

  /**
   * 获取服务器配置
   * @returns 服务器配置
   */
  getConfig(): SecureConnectionOptions & {
    /** 最大客户端连接数 */
    maxConnections?: number;

    /** 客户端空闲超时时间 */
    clientIdleTimeout?: number;
  };

  /**
   * 更新服务器配置
   * @param options 要更新的配置
   */
  updateConfig(options: Partial<SecureConnectionOptions & {
    maxConnections?: number;
    clientIdleTimeout?: number;
  }>): void;

  /**
   * 启用协议自动检测
   * @param signatures 要检测的协议特征列表
   * @returns 当前服务器实例
   */
  enableProtocolDetection(signatures?: ProtocolSignature[]): this;

  /**
   * 启用数据压缩
   * @param method 压缩方法
   * @param level 压缩级别 (1-9, 1为最快，9为最高压缩率)
   * @returns 当前服务器实例
   */
  enableCompression(method: CompressionMethod, level?: number): this;

  /**
   * 启用证书认证
   * @param method 认证方法
   * @param options 认证选项
   * @returns 当前服务器实例
   */
  enableAuthentication(method: AuthenticationMethod, options?: any): this;

  /**
   * 检测客户端设备类型
   * @param clientId 客户端ID
   * @returns Promise 解析为检测到的设备类型
   */
  detectClientDeviceType(clientId: string): Promise<DeviceType | null>;
}

/**
 * TCP/Socket协议适配器工厂接口
 */
export interface ITCPSocketAdapterFactory {
  /**
   * 创建TCP/Socket客户端
   * @param options 连接选项
   * @returns TCP/Socket客户端实例
   */
  createClient(
    options: TCPSocketConnectionOptions & SecureConnectionOptions & DataFormatOptions
  ): ITCPSocketClient;

  /**
   * 创建TCP/Socket服务器
   * @param options 服务器选项
   * @returns TCP/Socket服务器实例
   */
  createServer(
    options: SecureConnectionOptions & {
      maxConnections?: number;
      clientIdleTimeout?: number;
      dataFormat?: DataFormatOptions;
    }
  ): ITCPSocketServer;

  /**
   * 获取可用的协议处理器
   * @returns 所有可用的协议处理器列表
   */
  getAvailableProtocolProcessors(): ProtocolProcessor[];

  /**
   * 注册新的协议处理器
   * @param signature 协议特征
   * @param processor 协议处理器
   */
  registerProtocolProcessor(signature: ProtocolSignature, processor: ProtocolProcessor): void;
}

/**
 * TCP/Socket适配器管理器接口
 * 用于管理多个TCP/Socket客户端和服务器实例
 */
export interface ITCPSocketAdapterManager {
  /**
   * 创建TCP/Socket客户端并添加到管理器
   * @param id 客户端唯一ID
   * @param options 连接选项
   * @returns 创建的客户端实例
   */
  createClient(
    id: string,
    options: TCPSocketConnectionOptions & SecureConnectionOptions & DataFormatOptions
  ): ITCPSocketClient;

  /**
   * 创建TCP/Socket服务器并添加到管理器
   * @param id 服务器唯一ID
   * @param options 服务器选项
   * @returns 创建的服务器实例
   */
  createServer(
    id: string,
    options: SecureConnectionOptions & {
      maxConnections?: number;
      clientIdleTimeout?: number;
      dataFormat?: DataFormatOptions;
    }
  ): ITCPSocketServer;

  /**
   * 获取客户端实例
   * @param id 客户端ID
   * @returns 客户端实例，如果不存在则返回undefined
   */
  getClient(id: string): ITCPSocketClient | undefined;

  /**
   * 获取服务器实例
   * @param id 服务器ID
   * @returns 服务器实例，如果不存在则返回undefined
   */
  getServer(id: string): ITCPSocketServer | undefined;

  /**
   * 删除客户端实例
   * @param id 客户端ID
   * @returns 是否成功删除
   */
  removeClient(id: string): boolean;

  /**
   * 删除服务器实例
   * @param id 服务器ID
   * @returns 是否成功删除
   */
  removeServer(id: string): boolean;

  /**
   * 获取所有客户端ID
   * @returns 客户端ID列表
   */
  getAllClientIds(): string[];

  /**
   * 获取所有服务器ID
   * @returns 服务器ID列表
   */
  getAllServerIds(): string[];

  /**
   * 扫描网络设备
   * @param options 设备发现选项
   * @returns Promise 解析为发现的设备列表
   */
  scanNetworkDevices(options?: {
    /** 扫描超时时间(毫秒) */
    timeout?: number;

    /** 是否只扫描本地网络 */
    localNetworkOnly?: boolean;

    /** 设备类型过滤器 */
    deviceTypeFilter?: DeviceType[];
  }): Promise<{
    /** 设备ID */
    id: string;

    /** 设备类型 */
    type: DeviceType;

    /** 设备地址 */
    address: string;

    /** 设备端口 */
    port: number;

    /** 设备名称 */
    name?: string;

    /** 设备描述 */
    description?: string;

    /** 协议信息 */
    protocol?: string;
  }[]>;

  /**
   * 从扫描结果自动创建客户端连接
   * @param deviceId 设备ID
   * @param options 连接选项
   * @returns Promise 解析为创建的客户端实例
   */
  connectToDiscoveredDevice(deviceId: string, options?: Partial<TCPSocketConnectionOptions & SecureConnectionOptions & DataFormatOptions>): Promise<ITCPSocketClient>;

  /**
   * 注册协议处理器
   * @param signature 协议特征
   * @param processor 协议处理器
   */
  registerProtocolProcessor(signature: ProtocolSignature, processor: ProtocolProcessor): void;

  /**
   * 获取所有注册的协议处理器
   * @returns 协议处理器列表
   */
  getRegisteredProtocolProcessors(): { signature: ProtocolSignature, processor: ProtocolProcessor }[];

  /**
   * 关闭所有连接并清理资源
   * @returns Promise 清理完成后解析
   */
  dispose(): Promise<void>;
}

/**
 * TCP/Socket适配器接口
 * 实现此接口以创建TCP/Socket协议适配器
 */
export interface ITCPSocketAdapter {
  /**
   * 获取适配器工厂
   * @returns 适配器工厂实例
   */
  getFactory(): ITCPSocketAdapterFactory;

  /**
   * 获取适配器管理器
   * @returns 适配器管理器实例
   */
  getManager(): ITCPSocketAdapterManager;

  /**
   * 配置适配器
   * @param options 全局配置选项
   */
  configure(options: {
    /** 默认连接选项 */
    defaultConnectionOptions?: Partial<TCPSocketConnectionOptions>;

    /** 默认安全选项 */
    defaultSecureOptions?: Partial<SecureConnectionOptions>;

    /** 默认数据格式选项 */
    defaultDataFormatOptions?: Partial<DataFormatOptions>;

    /** 日志级别 */
    logLevel?: 'debug' | 'info' | 'warn' | 'error' | 'none';

    /** 性能监控选项 */
    monitoring?: {
      /** 是否启用监控 */
      enabled: boolean;

      /** 监控间隔(毫秒) */
      interval?: number;

      /** 监控数据保存路径 */
      storePath?: string;
    };

    /** 设备发现选项 */
    deviceDiscovery?: {
      /** 是否启用自动设备发现 */
      enabled: boolean;

      /** 发现间隔(毫秒) */
      interval?: number;

      /** 设备类型过滤器 */
      deviceTypeFilter?: DeviceType[];
    };

    /** 协议检测选项 */
    protocolDetection?: {
      /** 是否启用协议自动检测 */
      enabled: boolean;

      /** 默认协议列表 */
      defaultProtocols?: ProtocolSignature[];
    };

    /** 数据压缩选项 */
    compression?: {
      /** 是否启用数据压缩 */
      enabled: boolean;

      /** 默认压缩方法 */
      defaultMethod?: CompressionMethod;

      /** 压缩级别 */
      level?: number;

      /** 压缩阈值(字节)，数据大小超过此值才进行压缩 */
      threshold?: number;
    };

    /** 安全选项 */
    security?: {
      /** 是否启用证书认证 */
      enabled: boolean;

      /** 默认认证方法 */
      defaultMethod?: AuthenticationMethod;

      /** 证书目录路径 */
      certificatesPath?: string;
    };
  }): void;

  /**
   * 获取适配器版本
   * @returns 版本字符串
   */
  getVersion(): string;

  /**
   * 获取已注册的设备类型列表
   * @returns 设备类型列表
   */
  getSupportedDeviceTypes(): DeviceType[];

  /**
   * 获取支持的协议列表
   * @returns 协议列表
   */
  getSupportedProtocols(): ProtocolSignature[];

  /**
   * 获取设备发现服务
   * @returns 设备发现服务
   */
  getDeviceDiscoveryService(): any; // 这里可以定义更具体的接口类型

  /**
   * 获取协议检测服务
   * @returns 协议检测服务
   */
  getProtocolDetectionService(): any; // 这里可以定义更具体的接口类型

  /**
   * 获取数据流处理服务
   * @returns 数据流处理服务
   */
  getDataStreamProcessingService(): any; // 这里可以定义更具体的接口类型

  /**
   * 获取证书认证服务
   * @returns 证书认证服务
   */
  getCertificateAuthenticationService(): any; // 这里可以定义更具体的接口类型
}

/**
 * 创建TCP/Socket适配器实例
 * @returns TCP/Socket适配器实例
 */
export function createTCPSocketAdapter(): ITCPSocketAdapter {
  // 实现将在适配器实现文件中提供
  throw new Error('Not implemented');
}

/**
 * 使用示例:
 *
 * ```typescript
 * import { createTCPSocketAdapter, TCPSocketConnectionOptions } from './tcp-socket-adapter';
 *
 * async function example() {
 *   // 创建适配器
 *   const adapter = createTCPSocketAdapter();
 *
 *   // 配置适配器
 *   adapter.configure({
 *     defaultConnectionOptions: {
 *       connectionTimeout: 5000,
 *       autoReconnect: true
 *     },
 *     logLevel: 'info'
 *   });
 *
 *   // 创建客户端
 *   const client = adapter.getFactory().createClient({
 *     host: 'localhost',
 *     port: 8080,
 *     secure: false,
 *     useJson: true
 *   });
 *
 *   // 监听事件
 *   client.on('connect', () => {
 *     console.log('Connected to server');
 *   });
 *
 *   client.on('data', (data) => {
 *     console.log('Received data:', data);
 *   });
 *
 *   // 连接服务器
 *   await client.connect();
 *
 *   // 发送数据
 *   await client.send({ command: 'getData', params: { id: 123 } });
 *
 *   // 断开连接
 *   await client.disconnect();
 * }
 * ```
 */
