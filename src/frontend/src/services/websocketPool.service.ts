/**
 * WebSocket连接池服务
 *
 * 该服务用于管理多个WebSocket连接，提供连接复用、自动重连和负载均衡功能
 * 实现方式：维护一个WebSocket连接池，根据连接状态和使用情况动态分配连接
 */

import { Subject, Observable, BehaviorSubject } from 'rxjs';
import { webSocketService, WSMessage } from './websocket.service';

// 连接池配置接口
export interface WSPoolConfig {
  maxConnections: number;      // 最大连接数
  minConnections: number;      // 最小连接数（预热）
  baseUrl: string;             // 基础WebSocket URL
  reconnectInterval: number;   // 重连间隔（毫秒）
  maxReconnectAttempts: number; // 最大重连尝试次数
  loadBalanceStrategy: 'round-robin' | 'least-used' | 'random'; // 负载均衡策略
}

// 连接状态接口
interface ConnectionState {
  id: string;                 // 连接ID
  status: 'connected' | 'connecting' | 'disconnected' | 'error'; // 连接状态
  messageCount: number;       // 消息计数
  lastUsed: Date;             // 最后使用时间
  url: string;                // 连接URL
  reconnectAttempts: number;  // 重连尝试次数
}

// 默认配置
const DEFAULT_CONFIG: WSPoolConfig = {
  maxConnections: 5,
  minConnections: 2,
  baseUrl: 'ws://localhost:3030/ws',
  reconnectInterval: 5000,
  maxReconnectAttempts: 10,
  loadBalanceStrategy: 'least-used'
};

/**
 * WebSocket连接池服务
 * 管理多个WebSocket连接，提供连接复用和负载均衡
 */
class WebSocketPoolService {
  private config: WSPoolConfig;
  private connections: Map<string, {
    service: typeof webSocketService,
    state: ConnectionState
  }> = new Map();

  private messageSubject: Subject<WSMessage> = new Subject<WSMessage>();
  private statusSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private poolStatusSubject: BehaviorSubject<{
    activeConnections: number,
    totalConnections: number,
    status: 'healthy' | 'degraded' | 'critical'
  }> = new BehaviorSubject({
    activeConnections: 0,
    totalConnections: 0,
    status: 'healthy' as 'healthy' | 'degraded' | 'critical'
  });

  constructor(config?: Partial<WSPoolConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.initializePool();
  }

  /**
   * 初始化连接池
   * 创建minConnections个连接并启动监控
   */
  private initializePool(): void {
    // 创建初始连接
    for (let i = 0; i < this.config.minConnections; i++) {
      this.createConnection();
    }

    // 更新池状态
    this.updatePoolStatus();

    // 启动定期检查
    setInterval(() => this.maintainPool(), 30000);
  }

  /**
   * 创建新的WebSocket连接
   * @returns 连接ID
   */
  private createConnection(): string {
    const connectionId = `ws-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    // 克隆webSocketService并配置
    const wsService = Object.create(webSocketService);

    // 初始化连接状态
    const state: ConnectionState = {
      id: connectionId,
      status: 'connecting',
      messageCount: 0,
      lastUsed: new Date(),
      url: this.config.baseUrl,
      reconnectAttempts: 0
    };

    // 存储连接
    this.connections.set(connectionId, {
      service: wsService,
      state
    });

    // 设置消息监听
    wsService.onMessage().subscribe(message => {
      // 更新使用统计
      const conn = this.connections.get(connectionId);
      if (conn) {
        conn.state.messageCount++;
        conn.state.lastUsed = new Date();
      }

      // 转发消息
      this.messageSubject.next(message);
    });

    // 设置连接状态监听
    wsService.onConnectionStatus().subscribe(status => {
      const conn = this.connections.get(connectionId);
      if (conn) {
        conn.state.status = status ? 'connected' : 'disconnected';

        // 如果断开连接，尝试重连
        if (!status && conn.state.reconnectAttempts < this.config.maxReconnectAttempts) {
          setTimeout(() => {
            if (this.connections.has(connectionId)) {
              conn.state.reconnectAttempts++;
              conn.state.status = 'connecting';
              wsService.connect(conn.state.url);
            }
          }, this.config.reconnectInterval);
        }
      }

      // 更新池状态
      this.updatePoolStatus();
    });

    // 连接WebSocket
    wsService.connect(this.config.baseUrl);

    return connectionId;
  }

  /**
   * 维护连接池健康状态
   * - 关闭长时间未使用的连接
   * - 确保最小连接数
   * - 重连失败的连接
   */
  private maintainPool(): void {
    const now = new Date();
    let activeCount = 0;

    // 检查每个连接
    this.connections.forEach((conn, id) => {
      // 计算活跃连接
      if (conn.state.status === 'connected') {
        activeCount++;
      }

      // 关闭超过30分钟未使用的多余连接
      const idleTime = now.getTime() - conn.state.lastUsed.getTime();
      if (activeCount > this.config.minConnections &&
          idleTime > 30 * 60 * 1000 &&
          conn.state.status === 'connected') {
        conn.service.disconnect();
        this.connections.delete(id);
      }

      // 重试失败的连接
      if (conn.state.status === 'error' || conn.state.status === 'disconnected') {
        if (conn.state.reconnectAttempts < this.config.maxReconnectAttempts) {
          conn.state.reconnectAttempts++;
          conn.state.status = 'connecting';
          conn.service.connect(conn.state.url);
        } else if (this.connections.size > this.config.minConnections) {
          // 如果超过重连次数且连接数足够，删除此连接
          this.connections.delete(id);
        }
      }
    });

    // 确保最小连接数
    if (activeCount < this.config.minConnections) {
      for (let i = activeCount; i < this.config.minConnections; i++) {
        this.createConnection();
      }
    }

    // 更新池状态
    this.updatePoolStatus();
  }

  /**
   * 更新连接池状态
   */
  private updatePoolStatus(): void {
    let activeConnections = 0;
    const totalConnections = this.connections.size;

    this.connections.forEach(conn => {
      if (conn.state.status === 'connected') {
        activeConnections++;
      }
    });

    // 确定健康状态
    let status: 'healthy' | 'degraded' | 'critical' = 'healthy';
    const healthRatio = activeConnections / this.config.minConnections;

    if (healthRatio < 0.5) {
      status = 'critical';
    } else if (healthRatio < 1) {
      status = 'degraded';
    }

    // 更新状态主题
    this.poolStatusSubject.next({
      activeConnections,
      totalConnections,
      status
    });

    // 更新总体连接状态
    this.statusSubject.next(activeConnections > 0);
  }

  /**
   * 获取最佳可用连接
   * 根据负载均衡策略选择最合适的连接
   */
  private getBestConnection(): { service: typeof webSocketService, state: ConnectionState } | null {
    if (this.connections.size === 0) {
      return null;
    }

    const connArray = Array.from(this.connections.values());
    const activeConns = connArray.filter(conn => conn.state.status === 'connected');

    // 如果没有活跃连接，尝试创建一个新连接
    if (activeConns.length === 0) {
      if (this.connections.size < this.config.maxConnections) {
        const newConnId = this.createConnection();
        return this.connections.get(newConnId) || null;
      }
      return null;
    }

    // 根据负载均衡策略选择连接
    switch (this.config.loadBalanceStrategy) {
      case 'least-used':
        // 选择消息数最少的连接
        return activeConns.sort((a, b) => a.state.messageCount - b.state.messageCount)[0];

      case 'round-robin':
        // 简单轮询：选择最长时间未使用的连接
        return activeConns.sort((a, b) =>
          a.state.lastUsed.getTime() - b.state.lastUsed.getTime()
        )[0];

      case 'random':
        // 随机选择一个活跃连接
        return activeConns[Math.floor(Math.random() * activeConns.length)];

      default:
        return activeConns[0];
    }
  }

  /**
   * 发送消息
   * 选择最佳连接发送消息
   * @param messageType 消息类型
   * @param data 消息数据
   * @returns 是否发送成功
   */
  public sendMessage(messageType: string, data: any): boolean {
    const connection = this.getBestConnection();

    if (!connection) {
      console.error('WebSocket连接池: 没有可用连接');
      return false;
    }

    try {
      // 更新使用时间
      connection.state.lastUsed = new Date();

      // 发送消息
      connection.service.send(messageType, data);
      return true;
    } catch (error) {
      console.error('WebSocket连接池: 发送消息失败', error);
      return false;
    }
  }

  /**
   * 订阅消息
   * @returns 消息Observable
   */
  public onMessage(): Observable<WSMessage> {
    return this.messageSubject.asObservable();
  }

  /**
   * 获取连接状态Observable
   * @returns 连接状态Observable
   */
  public onConnectionStatus(): Observable<boolean> {
    return this.statusSubject.asObservable();
  }

  /**
   * 获取连接池状态Observable
   * @returns 连接池状态Observable
   */
  public onPoolStatus(): Observable<{
    activeConnections: number,
    totalConnections: number,
    status: 'healthy' | 'degraded' | 'critical'
  }> {
    return this.poolStatusSubject.asObservable();
  }

  /**
   * 断开所有连接
   */
  public disconnectAll(): void {
    this.connections.forEach(conn => {
      conn.service.disconnect();
    });
    this.connections.clear();
    this.updatePoolStatus();
  }

  /**
   * 更新配置
   * @param config 新配置
   */
  public updateConfig(config: Partial<WSPoolConfig>): void {
    this.config = { ...this.config, ...config };

    // 应用新配置
    this.maintainPool();
  }

  /**
   * 获取当前配置
   * @returns 当前配置
   */
  public getConfig(): WSPoolConfig {
    return { ...this.config };
  }

  /**
   * 获取连接池统计信息
   * @returns 连接池统计
   */
  public getPoolStats(): {
    connections: number,
    active: number,
    messageCount: number,
    health: number
  } {
    let active = 0;
    let messageCount = 0;

    this.connections.forEach(conn => {
      if (conn.state.status === 'connected') {
        active++;
      }
      messageCount += conn.state.messageCount;
    });

    const health = this.config.minConnections > 0
      ? active / this.config.minConnections
      : 0;

    return {
      connections: this.connections.size,
      active,
      messageCount,
      health
    };
  }
}

// 导出单例
export const webSocketPoolService = new WebSocketPoolService();
