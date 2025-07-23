/**
 * WebSocket连接池管理器
 *
 * 优化WebSocket连接的创建、复用和管理，提高实时通信性能
 * 主要功能：
 * 1. 连接池管理：复用现有连接，减少重复建立连接的开销
 * 2. 自动重连：网络波动时自动尝试重新连接
 * 3. 心跳检测：定期发送心跳包保持连接活跃
 * 4. 连接监控：实时监控连接状态和性能指标
 * 5. 消息缓存：断线期间的消息缓存与重发
 */

import { EventEmitter } from 'events';

// WebSocket连接配置接口
export interface WebSocketConfig {
  url: string;
  protocols?: string | string[];
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  heartbeatInterval?: number;
  heartbeatMessage?: string | object;
  connectionTimeout?: number;
  debug?: boolean;
}

// WebSocket连接状态
export enum ConnectionStatus {
  CONNECTING = 'connecting',
  OPEN = 'open',
  CLOSING = 'closing',
  CLOSED = 'closed',
  RECONNECTING = 'reconnecting',
  FAILED = 'failed'
}

// WebSocket连接统计信息
export interface ConnectionStats {
  id: string;
  url: string;
  status: ConnectionStatus;
  createdAt: Date;
  lastActiveAt: Date;
  reconnectAttempts: number;
  sentMessages: number;
  receivedMessages: number;
  errors: number;
  averageLatency: number;
}

// 单个WebSocket连接封装
class ManagedWebSocket extends EventEmitter {
  private ws: WebSocket | null = null;
  private config: WebSocketConfig;
  private status: ConnectionStatus = ConnectionStatus.CLOSED;
  private reconnectAttempts: number = 0;
  private heartbeatTimer: NodeJS.Timeout | null = null;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private pingTimestamp: number = 0;
  private messageQueue: Array<{ data: string | ArrayBufferLike | Blob | ArrayBufferView }> = [];
  private stats: ConnectionStats;
  private id: string;

  constructor(config: WebSocketConfig) {
    super();
    this.config = {
      reconnectInterval: 3000,
      maxReconnectAttempts: 5,
      heartbeatInterval: 30000,
      heartbeatMessage: 'ping',
      connectionTimeout: 10000,
      debug: false,
      ...config
    };
    this.id = `ws-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.stats = {
      id: this.id,
      url: this.config.url,
      status: ConnectionStatus.CLOSED,
      createdAt: new Date(),
      lastActiveAt: new Date(),
      reconnectAttempts: 0,
      sentMessages: 0,
      receivedMessages: 0,
      errors: 0,
      averageLatency: 0
    };
  }

  // 获取连接ID
  public getId(): string {
    return this.id;
  }

  // 获取连接状态
  public getStatus(): ConnectionStatus {
    return this.status;
  }

  // 获取连接统计信息
  public getStats(): ConnectionStats {
    return { ...this.stats };
  }

  // 获取原始WebSocket实例
  public getSocket(): WebSocket | null {
    return this.ws;
  }

  // 连接WebSocket
  public connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.ws && (this.status === ConnectionStatus.OPEN || this.status === ConnectionStatus.CONNECTING)) {
        this.log('WebSocket已经连接或正在连接中');
        resolve();
        return;
      }

      this.status = ConnectionStatus.CONNECTING;
      this.stats.status = ConnectionStatus.CONNECTING;
      this.emit('statusChange', this.status);

      // 设置连接超时
      const connectionTimeout = setTimeout(() => {
        if (this.status === ConnectionStatus.CONNECTING) {
          this.status = ConnectionStatus.FAILED;
          this.stats.status = ConnectionStatus.FAILED;
          this.stats.errors++;
          this.emit('statusChange', this.status);
          this.emit('error', new Error('连接超时'));
          reject(new Error('连接超时'));
          this.scheduleReconnect();
        }
      }, this.config.connectionTimeout);

      try {
        this.ws = new WebSocket(this.config.url, this.config.protocols);

        this.ws.onopen = () => {
          clearTimeout(connectionTimeout);
          this.status = ConnectionStatus.OPEN;
          this.stats.status = ConnectionStatus.OPEN;
          this.stats.lastActiveAt = new Date();
          this.reconnectAttempts = 0;
          this.stats.reconnectAttempts = 0;
          this.emit('statusChange', this.status);
          this.emit('open');
          this.startHeartbeat();
          this.processMessageQueue();
          resolve();
        };

        this.ws.onclose = (event) => {
          clearTimeout(connectionTimeout);
          const wasConnected = this.status === ConnectionStatus.OPEN;
          this.status = ConnectionStatus.CLOSED;
          this.stats.status = ConnectionStatus.CLOSED;
          this.emit('statusChange', this.status);
          this.emit('close', event);

          if (wasConnected) {
            this.scheduleReconnect();
          }

          if (this.heartbeatTimer) {
            clearInterval(this.heartbeatTimer);
            this.heartbeatTimer = null;
          }
        };

        this.ws.onerror = (event) => {
          this.stats.errors++;
          this.emit('error', event);
          if (this.status === ConnectionStatus.CONNECTING) {
            clearTimeout(connectionTimeout);
            this.status = ConnectionStatus.FAILED;
            this.stats.status = ConnectionStatus.FAILED;
            this.emit('statusChange', this.status);
            reject(event);
            this.scheduleReconnect();
          }
        };

        this.ws.onmessage = (event) => {
          this.stats.lastActiveAt = new Date();
          this.stats.receivedMessages++;

          // 处理心跳响应
          if (event.data === 'pong') {
            const latency = Date.now() - this.pingTimestamp;
            this.updateLatency(latency);
            return;
          }

          this.emit('message', event.data);
        };
      } catch (error) {
        clearTimeout(connectionTimeout);
        this.status = ConnectionStatus.FAILED;
        this.stats.status = ConnectionStatus.FAILED;
        this.stats.errors++;
        this.emit('statusChange', this.status);
        this.emit('error', error);
        reject(error);
        this.scheduleReconnect();
      }
    });
  }

  // 断开连接
  public disconnect(code?: number, reason?: string): Promise<void> {
    return new Promise((resolve) => {
      if (!this.ws || this.status === ConnectionStatus.CLOSED || this.status === ConnectionStatus.CLOSING) {
        resolve();
        return;
      }

      this.status = ConnectionStatus.CLOSING;
      this.stats.status = ConnectionStatus.CLOSING;
      this.emit('statusChange', this.status);

      if (this.reconnectTimer) {
        clearTimeout(this.reconnectTimer);
        this.reconnectTimer = null;
      }

      if (this.heartbeatTimer) {
        clearInterval(this.heartbeatTimer);
        this.heartbeatTimer = null;
      }

      try {
        this.ws.close(code, reason);
      } catch (error) {
        this.emit('error', error);
      }

      resolve();
    });
  }

  // 发送消息
  public send(data: string | ArrayBufferLike | Blob | ArrayBufferView): boolean {
    if (!this.ws || this.status !== ConnectionStatus.OPEN) {
      this.messageQueue.push({ data });
      return false;
    }

    try {
      this.ws.send(data);
      this.stats.sentMessages++;
      this.stats.lastActiveAt = new Date();
      return true;
    } catch (error) {
      this.stats.errors++;
      this.emit('error', error);
      return false;
    }
  }

  // 处理消息队列
  private processMessageQueue(): void {
    if (this.messageQueue.length === 0 || this.status !== ConnectionStatus.OPEN) {
      return;
    }

    // 处理排队的消息
    const queueCopy = [...this.messageQueue];
    this.messageQueue = [];

    queueCopy.forEach(item => {
      this.send(item.data);
    });
  }

  // 安排重新连接
  private scheduleReconnect(): void {
    if (
      this.reconnectTimer ||
      this.config.maxReconnectAttempts !== undefined &&
      this.reconnectAttempts >= this.config.maxReconnectAttempts
    ) {
      if (this.reconnectAttempts >= (this.config.maxReconnectAttempts || 0)) {
        this.emit('reconnectFailed');
      }
      return;
    }

    this.status = ConnectionStatus.RECONNECTING;
    this.stats.status = ConnectionStatus.RECONNECTING;
    this.emit('statusChange', this.status);
    this.emit('reconnecting', this.reconnectAttempts + 1);

    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.reconnectAttempts++;
      this.stats.reconnectAttempts = this.reconnectAttempts;

      this.connect().catch(() => {
        // 连接错误在connect()方法中已处理
      });
    }, this.config.reconnectInterval);
  }

  // 开始心跳检测
  private startHeartbeat(): void {
    if (this.heartbeatTimer || !this.config.heartbeatInterval) {
      return;
    }

    this.heartbeatTimer = setInterval(() => {
      if (this.status === ConnectionStatus.OPEN) {
        this.pingTimestamp = Date.now();

        // 发送心跳消息
        if (typeof this.config.heartbeatMessage === 'string') {
          this.send(this.config.heartbeatMessage);
        } else if (this.config.heartbeatMessage) {
          this.send(JSON.stringify(this.config.heartbeatMessage));
        }
      }
    }, this.config.heartbeatInterval);
  }

  // 更新平均延迟
  private updateLatency(latency: number): void {
    if (this.stats.averageLatency === 0) {
      this.stats.averageLatency = latency;
    } else {
      // 使用加权平均值，给新值70%的权重
      this.stats.averageLatency = 0.3 * this.stats.averageLatency + 0.7 * latency;
    }
    this.emit('latency', this.stats.averageLatency);
  }

  // 调试日志
  private log(message: string): void {
    if (this.config.debug) {
      console.log(`[WebSocket ${this.id}] ${message}`);
    }
  }
}

// WebSocket连接池管理器
export class WebSocketPool {
  private connections: Map<string, ManagedWebSocket> = new Map();
  private defaultConfig: Partial<WebSocketConfig>;
  private eventEmitter: EventEmitter = new EventEmitter();

  constructor(defaultConfig: Partial<WebSocketConfig> = {}) {
    this.defaultConfig = {
      reconnectInterval: 3000,
      maxReconnectAttempts: 5,
      heartbeatInterval: 30000,
      heartbeatMessage: 'ping',
      connectionTimeout: 10000,
      debug: false,
      ...defaultConfig
    };
  }

  // 创建或获取连接
  public getConnection(url: string, config: Partial<WebSocketConfig> = {}): ManagedWebSocket {
    // 查找现有连接
    const existingConnection = this.findConnection(url);
    if (existingConnection) {
      return existingConnection;
    }

    // 创建新连接
    const fullConfig: WebSocketConfig = {
      ...this.defaultConfig as WebSocketConfig,
      ...config,
      url
    };

    const connection = new ManagedWebSocket(fullConfig);

    // 转发连接事件
    connection.on('statusChange', (status) => {
      this.eventEmitter.emit('connectionStatusChange', connection.getId(), status);
    });

    connection.on('open', () => {
      this.eventEmitter.emit('connectionOpen', connection.getId());
    });

    connection.on('close', (event) => {
      this.eventEmitter.emit('connectionClose', connection.getId(), event);
    });

    connection.on('error', (error) => {
      this.eventEmitter.emit('connectionError', connection.getId(), error);
    });

    connection.on('reconnecting', (attempt) => {
      this.eventEmitter.emit('connectionReconnecting', connection.getId(), attempt);
    });

    connection.on('reconnectFailed', () => {
      this.eventEmitter.emit('connectionReconnectFailed', connection.getId());
    });

    connection.on('latency', (latency) => {
      this.eventEmitter.emit('connectionLatency', connection.getId(), latency);
    });

    // 存储连接
    this.connections.set(connection.getId(), connection);

    return connection;
  }

  // 查找与URL匹配的连接
  private findConnection(url: string): ManagedWebSocket | undefined {
    for (const connection of this.connections.values()) {
      const stats = connection.getStats();
      if (stats.url === url &&
          [ConnectionStatus.OPEN, ConnectionStatus.CONNECTING, ConnectionStatus.RECONNECTING].includes(stats.status)) {
        return connection;
      }
    }
    return undefined;
  }

  // 关闭连接
  public closeConnection(id: string, code?: number, reason?: string): Promise<void> {
    const connection = this.connections.get(id);
    if (!connection) {
      return Promise.resolve();
    }

    return connection.disconnect(code, reason).then(() => {
      this.connections.delete(id);
    });
  }

  // 关闭所有连接
  public closeAllConnections(code?: number, reason?: string): Promise<void> {
    const promises: Promise<void>[] = [];

    for (const [id, connection] of this.connections.entries()) {
      promises.push(
        connection.disconnect(code, reason).then(() => {
          this.connections.delete(id);
        })
      );
    }

    return Promise.all(promises).then(() => {});
  }

  // 获取所有连接统计信息
  public getAllConnectionStats(): ConnectionStats[] {
    const stats: ConnectionStats[] = [];

    for (const connection of this.connections.values()) {
      stats.push(connection.getStats());
    }

    return stats;
  }

  // 获取连接统计信息
  public getConnectionStats(id: string): ConnectionStats | null {
    const connection = this.connections.get(id);
    return connection ? connection.getStats() : null;
  }

  // 获取连接数量
  public getConnectionCount(): number {
    return this.connections.size;
  }

  // 获取活跃连接数量
  public getActiveConnectionCount(): number {
    let count = 0;

    for (const connection of this.connections.values()) {
      if (connection.getStatus() === ConnectionStatus.OPEN) {
        count++;
      }
    }

    return count;
  }

  // 添加事件监听器
  public on(event: string, listener: (...args: any[]) => void): void {
    this.eventEmitter.on(event, listener);
  }

  // 移除事件监听器
  public off(event: string, listener: (...args: any[]) => void): void {
    this.eventEmitter.off(event, listener);
  }
}

// 创建全局WebSocket连接池实例
const globalWebSocketPool = new WebSocketPool();

export default globalWebSocketPool;
