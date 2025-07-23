/**
 * 设备通信服务
 * 负责设备间通信管理、数据交换和命令处理
 */

import { EventEmitter } from 'events';
import {
  Device,
  DeviceConnectionStatus,
  DeviceDataPoint,
  DeviceCommand
} from '../../models/device.model.js';
import {
  DeviceManager,
  DeviceConnectionConfig
} from './types.js';
import { DeviceRegistrationService } from './device-registration-service.js';

/**
 * 通信状态枚举
 */
export enum CommunicationStatus {
  IDLE = 'idle',
  CONNECTING = 'connecting',
  COMMUNICATING = 'communicating',
  DISCONNECTING = 'disconnecting',
  ERROR = 'error'
}

/**
 * 通信模式枚举
 */
export enum CommunicationMode {
  SYNCHRONOUS = 'synchronous',
  ASYNCHRONOUS = 'asynchronous',
  STREAMING = 'streaming',
  POLLING = 'polling',
  SCHEDULED = 'scheduled'
}

/**
 * 通信优先级枚举
 */
export enum CommunicationPriority {
  CRITICAL = 'critical',
  HIGH = 'high',
  NORMAL = 'normal',
  LOW = 'low',
  BACKGROUND = 'background'
}

/**
 * 通信请求配置接口
 */
export interface CommunicationRequestConfig {
  deviceId: string;
  command?: DeviceCommand;
  timeout?: number;
  retries?: number;
  priority?: CommunicationPriority;
  mode?: CommunicationMode;
  callback?: (response: any, error?: Error) => void;
  metadata?: Record<string, any>;
}

/**
 * 通信会话接口
 */
export interface CommunicationSession {
  id: string;
  deviceId: string;
  startTime: string;
  endTime?: string;
  status: CommunicationStatus;
  requests: CommunicationRequestConfig[];
  responses: Array<{
    requestId: string;
    timestamp: string;
    data: any;
    error?: Error;
  }>;
  statistics: {
    requestsSent: number;
    responsesReceived: number;
    errors: number;
    totalDataSent: number;
    totalDataReceived: number;
    averageResponseTime: number;
  };
  metadata: Record<string, any>;
}

/**
 * 设备通信服务实现
 */
export class DeviceCommunicationService {
  private deviceManager: DeviceManager;
  private registrationService: DeviceRegistrationService | null = null;
  private eventEmitter: EventEmitter = new EventEmitter();
  private activeSessions: Map<string, CommunicationSession> = new Map();
  private pendingRequests: Map<string, CommunicationRequestConfig> = new Map();
  private requestQueue: CommunicationRequestConfig[] = [];
  private pollingIntervals: Map<string, NodeJS.Timeout> = new Map();
  private streamingConnections: Map<string, any> = new Map();
  private isProcessingQueue: boolean = false;
  private maxConcurrentRequests: number = 10;
  private defaultTimeout: number = 30000; // 默认30秒超时
  private sessionTimeout: number = 300000; // 默认会话超时5分钟

  constructor(deviceManager: DeviceManager) {
    this.deviceManager = deviceManager;

    // 设置最大监听器数量，避免内存泄漏警告
    this.eventEmitter.setMaxListeners(100);

    // 初始化事件监听
    this.setupEventListeners();

    // 启动队列处理
    this.startQueueProcessing();

    // 启动会话清理
    this.startSessionCleanup();
  }

  /**
   * 设置设备注册服务
   * @param service 设备注册服务
   */
  setRegistrationService(service: DeviceRegistrationService): void {
    this.registrationService = service;
  }

  /**
   * 向设备发送命令
   * @param config 通信请求配置
   * @returns 请求ID
   */
  async sendCommand(config: CommunicationRequestConfig): Promise<string> {
    if (!config.deviceId) {
      throw new Error('设备ID不能为空');
    }

    if (!config.command) {
      throw new Error('命令不能为空');
    }

    // 检查设备是否存在
    const device = await this.deviceManager.getDeviceById(config.deviceId);
    if (!device) {
      throw new Error(`设备ID '${config.deviceId}' 不存在`);
    }

    // 检查设备是否在线
    if (device.connectionStatus !== DeviceConnectionStatus.ONLINE) {
      throw new Error(`设备 '${config.deviceId}' 未连接，当前状态: ${device.connectionStatus}`);
    }

    // 生成请求ID
    const requestId = `req-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // 填充默认值
    const fullConfig: CommunicationRequestConfig = {
      ...config,
      timeout: config.timeout || this.defaultTimeout,
      retries: config.retries ?? 3,
      priority: config.priority || CommunicationPriority.NORMAL,
      mode: config.mode || CommunicationMode.SYNCHRONOUS,
      metadata: config.metadata || {}
    };

    // 保存请求配置
    this.pendingRequests.set(requestId, fullConfig);

    // 创建或更新会话
    this.createOrUpdateSession(config.deviceId);

    // 根据通信模式处理
    switch (fullConfig.mode) {
      case CommunicationMode.SYNCHRONOUS:
        // 同步模式，直接发送请求
        return await this.processSynchronousRequest(requestId, fullConfig);

      case CommunicationMode.ASYNCHRONOUS:
        // 异步模式，将请求加入队列
        this.addToQueue(requestId, fullConfig);
        return requestId;

      case CommunicationMode.STREAMING:
        // 流模式，建立流连接
        await this.setupStreamingConnection(requestId, fullConfig);
        return requestId;

      case CommunicationMode.POLLING:
        // 轮询模式，设置定时轮询
        this.setupPolling(requestId, fullConfig);
        return requestId;

      case CommunicationMode.SCHEDULED:
        // 计划模式，安排在特定时间执行
        this.scheduleRequest(requestId, fullConfig);
        return requestId;

      default:
        // 默认使用同步模式
        return await this.processSynchronousRequest(requestId, fullConfig);
    }
  }

  /**
   * 取消请求
   * @param requestId 请求ID
   * @returns 是否成功取消
   */
  cancelRequest(requestId: string): boolean {
    // 检查请求是否存在
    if (!this.pendingRequests.has(requestId)) {
      return false;
    }

    const config = this.pendingRequests.get(requestId);
    if (!config) {
      return false;
    }

    // 从队列中移除
    this.requestQueue = this.requestQueue.filter(item =>
      this.pendingRequests.get(item.deviceId) !== requestId);

    // 清除轮询
    if (config.mode === CommunicationMode.POLLING) {
      const intervalId = this.pollingIntervals.get(requestId);
      if (intervalId) {
        clearInterval(intervalId);
        this.pollingIntervals.delete(requestId);
      }
    }

    // 清除流连接
    if (config.mode === CommunicationMode.STREAMING) {
      const connection = this.streamingConnections.get(requestId);
      if (connection) {
        // 关闭连接（具体实现取决于连接类型）
        if (typeof connection.close === 'function') {
          connection.close();
        } else if (typeof connection.disconnect === 'function') {
          connection.disconnect();
        }
        this.streamingConnections.delete(requestId);
      }
    }

    // 移除请求
    this.pendingRequests.delete(requestId);

    // 触发请求取消事件
    this.eventEmitter.emit('request-cancelled', {
      requestId,
      deviceId: config.deviceId,
      timestamp: new Date().toISOString()
    });

    return true;
  }

  /**
   * 获取会话信息
   * @param sessionId 会话ID
   * @returns 会话信息
   */
  getSession(sessionId: string): CommunicationSession | null {
    return this.activeSessions.get(sessionId) || null;
  }

  /**
   * 获取设备的活动会话
   * @param deviceId 设备ID
   * @returns 会话信息
   */
  getDeviceSession(deviceId: string): CommunicationSession | null {
    // 查找设备的会话
    for (const session of this.activeSessions.values()) {
      if (session.deviceId === deviceId) {
        return session;
      }
    }
    return null;
  }

  /**
   * 获取所有活动会话
   * @returns 会话列表
   */
  getAllSessions(): CommunicationSession[] {
    return Array.from(this.activeSessions.values());
  }

  /**
   * 关闭会话
   * @param sessionId 会话ID
   * @returns 是否成功关闭
   */
  closeSession(sessionId: string): boolean {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      return false;
    }

    // 取消所有未完成的请求
    for (const request of session.requests) {
      // 只取消未完成的请求
      const pendingRequest = Array.from(this.pendingRequests.entries())
        .find(([_, config]) => config === request);

      if (pendingRequest) {
        this.cancelRequest(pendingRequest[0]);
      }
    }

    // 更新会话状态
    session.endTime = new Date().toISOString();
    session.status = CommunicationStatus.IDLE;

    // 触发会话关闭事件
    this.eventEmitter.emit('session-closed', {
      sessionId,
      deviceId: session.deviceId,
      timestamp: new Date().toISOString()
    });

    // 从活动会话中移除
    this.activeSessions.delete(sessionId);

    return true;
  }

  /**
   * 注册事件监听
   * @param event 事件名称
   * @param callback 回调函数
   */
  on(event: string, callback: (data: any) => void): void {
    this.eventEmitter.on(event, callback);
  }

  /**
   * 移除事件监听
   * @param event 事件名称
   * @param callback 回调函数
   */
  off(event: string, callback: (data: any) => void): void {
    this.eventEmitter.off(event, callback);
  }

  /**
   * 设置事件监听
   */
  private setupEventListeners(): void {
    // 监听设备管理器事件
    if (this.deviceManager) {
      // 设备断开连接
      this.deviceManager.on('device-disconnected', (event) => {
        // 关闭该设备的所有会话
        for (const [sessionId, session] of this.activeSessions.entries()) {
          if (session.deviceId === event.deviceId) {
            this.closeSession(sessionId);
          }
        }
      });

      // 设备数据接收
      this.deviceManager.on('data-received', (event) => {
        // 处理接收到的数据
        this.handleDataReceived(event);
      });
    }
  }

  /**
   * 创建或更新设备会话
   * @param deviceId 设备ID
   * @returns 会话ID
   */
  private createOrUpdateSession(deviceId: string): string {
    // 检查是否已存在会话
    let existingSession: CommunicationSession | null = null;
    let existingSessionId: string | null = null;

    for (const [sessionId, session] of this.activeSessions.entries()) {
      if (session.deviceId === deviceId) {
        existingSession = session;
        existingSessionId = sessionId;
        break;
      }
    }

    if (existingSession && existingSessionId) {
      // 更新现有会话的最后活动时间
      existingSession.metadata.lastActivity = new Date().toISOString();
      return existingSessionId;
    }

    // 创建新会话
    const sessionId = `session-${deviceId}-${Date.now()}`;
    const newSession: CommunicationSession = {
      id: sessionId,
      deviceId,
      startTime: new Date().toISOString(),
      status: CommunicationStatus.IDLE,
      requests: [],
      responses: [],
      statistics: {
        requestsSent: 0,
        responsesReceived: 0,
        errors: 0,
        totalDataSent: 0,
        totalDataReceived: 0,
        averageResponseTime: 0
      },
      metadata: {
        lastActivity: new Date().toISOString(),
        createdBy: 'system'
      }
    };

    // 保存会话
    this.activeSessions.set(sessionId, newSession);

    // 触发会话创建事件
    this.eventEmitter.emit('session-created', {
      sessionId,
      deviceId,
      timestamp: new Date().toISOString()
    });

    return sessionId;
  }

  /**
   * 处理同步请求
   * @param requestId 请求ID
   * @param config 请求配置
   * @returns 请求ID
   */
  private async processSynchronousRequest(
    requestId: string,
    config: CommunicationRequestConfig
  ): Promise<string> {
    let result: any = null;
    let error: Error | null = null;
    let retries = 0;

    // 获取设备会话
    const sessionId = this.getDeviceSessionId(config.deviceId);
    const session = sessionId ? this.activeSessions.get(sessionId) : null;

    if (session) {
      // 更新会话状态
      session.status = CommunicationStatus.COMMUNICATING;
      session.requests.push(config);
      session.statistics.requestsSent++;
    }

    // 触发请求开始事件
    this.eventEmitter.emit('request-started', {
      requestId,
      deviceId: config.deviceId,
      command: config.command,
      timestamp: new Date().toISOString()
    });

    // 执行请求，带重试逻辑
    while (retries <= config.retries) {
      try {
        // 记录开始时间
        const startTime = Date.now();

        // 发送命令
        result = await this.deviceManager.sendCommand(config.deviceId, config.command);

        // 计算响应时间
        const responseTime = Date.now() - startTime;

        // 更新会话统计信息
        if (session) {
          session.statistics.responsesReceived++;
          session.statistics.totalDataSent += JSON.stringify(config.command).length;
          session.statistics.totalDataReceived += JSON.stringify(result).length;

          // 更新平均响应时间
          const totalResponses = session.statistics.responsesReceived;
          const currentAvg = session.statistics.averageResponseTime;
          session.statistics.averageResponseTime =
            (currentAvg * (totalResponses - 1) + responseTime) / totalResponses;

          // 添加响应
          session.responses.push({
            requestId,
            timestamp: new Date().toISOString(),
            data: result
          });
        }

        // 触发请求成功事件
        this.eventEmitter.emit('request-succeeded', {
          requestId,
          deviceId: config.deviceId,
          result,
          responseTime,
          timestamp: new Date().toISOString()
        });

        // 调用回调函数
        if (config.callback) {
          config.callback(result);
        }

        // 成功，跳出重试循环
        break;
      } catch (err) {
        error = err as Error;
        retries++;

        // 更新会话统计信息
        if (session) {
          session.statistics.errors++;
        }

        // 触发请求错误事件
        this.eventEmitter.emit('request-failed', {
          requestId,
          deviceId: config.deviceId,
          error,
          attempt: retries,
          maxRetries: config.retries,
          timestamp: new Date().toISOString()
        });

        // 如果已达到最大重试次数，触发请求失败事件
        if (retries > config.retries) {
          this.eventEmitter.emit('request-max-retries-reached', {
            requestId,
            deviceId: config.deviceId,
            error,
            timestamp: new Date().toISOString()
          });

          // 调用回调函数
          if (config.callback) {
            config.callback(null, error);
          }
        } else {
          // 否则等待后重试
          await new Promise(resolve => setTimeout(resolve, 1000 * retries));
        }
      }
    }

    // 更新会话状态
    if (session) {
      session.status = CommunicationStatus.IDLE;
    }

    // 请求完成，从等待列表中移除
    this.pendingRequests.delete(requestId);

    // 触发请求完成事件
    this.eventEmitter.emit('request-completed', {
      requestId,
      deviceId: config.deviceId,
      success: !error,
      timestamp: new Date().toISOString()
    });

    // 如果有错误且未设置回调，则抛出错误
    if (error && !config.callback) {
      throw error;
    }

    return requestId;
  }

  /**
   * 将请求添加到队列
   * @param requestId 请求ID
   * @param config 请求配置
   */
  private addToQueue(requestId: string, config: CommunicationRequestConfig): void {
    // 根据优先级确定在队列中的位置
    let inserted = false;

    // 创建携带请求ID的配置对象
    const queueItem = { ...config, requestId };

    // 根据优先级插入队列
    for (let i = 0; i < this.requestQueue.length; i++) {
      const item = this.requestQueue[i];
      const itemPriority = item.priority || CommunicationPriority.NORMAL;

      if (this.getPriorityValue(config.priority) > this.getPriorityValue(itemPriority)) {
        // 在当前项之前插入
        this.requestQueue.splice(i, 0, queueItem);
        inserted = true;
        break;
      }
    }

    // 如果没有插入（优先级最低或队列为空），添加到队列末尾
    if (!inserted) {
      this.requestQueue.push(queueItem);
    }

    // 触发请求排队事件
    this.eventEmitter.emit('request-queued', {
      requestId,
      deviceId: config.deviceId,
      priority: config.priority,
      position: this.requestQueue.findIndex(item => item === queueItem) + 1,
      queueLength: this.requestQueue.length,
      timestamp: new Date().toISOString()
    });

    // 尝试处理队列
    if (!this.isProcessingQueue) {
      this.processQueue();
    }
  }

  /**
   * 处理请求队列
   */
  private async processQueue(): Promise<void> {
    if (this.isProcessingQueue || this.requestQueue.length === 0) {
      return;
    }

    this.isProcessingQueue = true;

    try {
      // 计算可以并发处理的请求数量
      const currentPending = this.pendingRequests.size;
      const availableSlots = Math.max(0, this.maxConcurrentRequests - currentPending);

      if (availableSlots > 0) {
        // 取出队列前面的请求进行处理
        const requests = this.requestQueue.splice(0, availableSlots);

        // 并行处理请求
        const promises = requests.map(async (config) => {
          const requestId = config.requestId;
          delete config.requestId; // 移除添加的请求ID属性

          try {
            await this.processSynchronousRequest(requestId, config);
          } catch (error) {
            // 错误已在processSynchronousRequest中处理
            console.error(`处理请求 ${requestId} 出错:`, error);
          }
        });

        // 等待所有请求完成
        await Promise.all(promises);
      }
    } finally {
      this.isProcessingQueue = false;

      // 如果队列中还有请求，继续处理
      if (this.requestQueue.length > 0) {
        // 使用setTimeout避免递归调用导致的调用栈溢出
        setTimeout(() => this.processQueue(), 0);
      }
    }
  }

  /**
   * 设置流连接
   * @param requestId 请求ID
   * @param config 请求配置
   */
  private async setupStreamingConnection(
    requestId: string,
    config: CommunicationRequestConfig
  ): Promise<void> {
    // 此处的实现取决于设备管理器的流连接支持
    // 这是一个简化的实现示例
    try {
      // 创建流连接
      const connection = {
        id: requestId,
        deviceId: config.deviceId,
        status: 'connected',
        startTime: Date.now(),
        // 模拟关闭方法
        close: () => {
          console.log(`关闭流连接: ${requestId}`);
          this.eventEmitter.emit('stream-closed', {
            requestId,
            deviceId: config.deviceId,
            timestamp: new Date().toISOString()
          });
        }
      };

      // 存储连接
      this.streamingConnections.set(requestId, connection);

      // 触发流连接事件
      this.eventEmitter.emit('stream-connected', {
        requestId,
        deviceId: config.deviceId,
        timestamp: new Date().toISOString()
      });

      // 设置数据处理
      // 实际实现需要与设备管理器的流数据接口集成

    } catch (error) {
      console.error(`设置流连接出错:`, error);
      throw error;
    }
  }

  /**
   * 设置定时轮询
   * @param requestId 请求ID
   * @param config 请求配置
   */
  private setupPolling(requestId: string, config: CommunicationRequestConfig): void {
    // 确定轮询间隔，默认为5秒
    const interval = config.metadata?.pollingInterval || 5000;

    // 创建轮询定时器
    const intervalId = setInterval(async () => {
      try {
        // 创建一个新的请求ID用于此次轮询
        const pollRequestId = `${requestId}-poll-${Date.now()}`;

        // 复制配置但使用同步模式
        const pollConfig: CommunicationRequestConfig = {
          ...config,
          mode: CommunicationMode.SYNCHRONOUS
        };

        // 执行请求
        await this.processSynchronousRequest(pollRequestId, pollConfig);

      } catch (error) {
        console.error(`轮询请求出错:`, error);

        // 触发轮询错误事件
        this.eventEmitter.emit('polling-error', {
          requestId,
          deviceId: config.deviceId,
          error,
          timestamp: new Date().toISOString()
        });
      }
    }, interval);

    // 存储轮询间隔ID以便稍后清除
    this.pollingIntervals.set(requestId, intervalId);

    // 触发轮询设置事件
    this.eventEmitter.emit('polling-started', {
      requestId,
      deviceId: config.deviceId,
      interval,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * 安排计划请求
   * @param requestId 请求ID
   * @param config 请求配置
   */
  private scheduleRequest(requestId: string, config: CommunicationRequestConfig): void {
    // 计划执行的时间，默认为30秒后
    const scheduleTime = config.metadata?.scheduleTime || (Date.now() + 30000);
    const delay = Math.max(0, scheduleTime - Date.now());

    // 设置定时器
    setTimeout(async () => {
      try {
        // 检查请求是否仍然存在
        if (!this.pendingRequests.has(requestId)) {
          return;
        }

        // 复制配置但使用同步模式
        const scheduleConfig: CommunicationRequestConfig = {
          ...config,
          mode: CommunicationMode.SYNCHRONOUS
        };

        // 执行请求
        await this.processSynchronousRequest(requestId, scheduleConfig);

      } catch (error) {
        console.error(`计划请求出错:`, error);

        // 触发计划错误事件
        this.eventEmitter.emit('schedule-error', {
          requestId,
          deviceId: config.deviceId,
          error,
          timestamp: new Date().toISOString()
        });
      }
    }, delay);

    // 触发计划设置事件
    this.eventEmitter.emit('request-scheduled', {
      requestId,
      deviceId: config.deviceId,
      scheduleTime: new Date(scheduleTime).toISOString(),
      delay,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * 获取优先级数值
   * @param priority 优先级
   * @returns 优先级数值
   */
  private getPriorityValue(priority?: CommunicationPriority): number {
    switch (priority) {
      case CommunicationPriority.CRITICAL:
        return 4;
      case CommunicationPriority.HIGH:
        return 3;
      case CommunicationPriority.NORMAL:
        return 2;
      case CommunicationPriority.LOW:
        return 1;
      case CommunicationPriority.BACKGROUND:
        return 0;
      default:
        return 2; // 默认为NORMAL
    }
  }

  /**
   * 获取设备会话ID
   * @param deviceId 设备ID
   * @returns 会话ID
   */
  private getDeviceSessionId(deviceId: string): string | null {
    for (const [sessionId, session] of this.activeSessions.entries()) {
      if (session.deviceId === deviceId) {
        return sessionId;
      }
    }
    return null;
  }

  /**
   * 处理接收到的数据
   * @param event 数据接收事件
   */
  private handleDataReceived(event: any): void {
    const { deviceId, data } = event;

    // 查找设备会话
    const sessionId = this.getDeviceSessionId(deviceId);
    if (!sessionId) {
      return;
    }

    const session = this.activeSessions.get(sessionId);
    if (!session) {
      return;
    }

    // 更新会话统计信息
    session.statistics.totalDataReceived += JSON.stringify(data).length;

    // 触发数据接收事件
    this.eventEmitter.emit('data-received', {
      deviceId,
      sessionId,
      data,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * 启动队列处理
   */
  private startQueueProcessing(): void {
    // 每秒检查一次队列
    setInterval(() => {
      if (this.requestQueue.length > 0 && !this.isProcessingQueue) {
        this.processQueue();
      }
    }, 1000);
  }

  /**
   * 启动会话清理
   */
  private startSessionCleanup(): void {
    // 每分钟检查一次过期会话
    setInterval(() => {
      const now = Date.now();

      for (const [sessionId, session] of this.activeSessions.entries()) {
        // 检查会话是否过期
        const lastActivity = new Date(session.metadata.lastActivity).getTime();
        const inactive = now - lastActivity;

        if (inactive > this.sessionTimeout) {
          // 会话超时，关闭它
          this.closeSession(sessionId);
        }
      }
    }, 60000);
  }
}
