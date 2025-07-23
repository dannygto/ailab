/**
 * 实验执行状态服务
 *
 * 该服务负责：
 * 1. 实时监控实验执行状态
 * 2. 缓存实验状态数据，减少服务器请求
 * 3. 使用WebSocket实时推送，HTTP轮询作为后备方案
 * 4. 提供实验进度、日志、错误等详细状态信息
 */

import { BehaviorSubject, Observable, combineLatest } from 'rxjs';
import { webSocketService, WSMessage } from './websocket.service';
import experimentService from './experimentService';
import { map, shareReplay, distinctUntilChanged } from 'rxjs/operators';

// 实验状态类型定义
export interface ExperimentStatus {
  id: string;
  status: 'pending' | 'running' | 'paused' | 'completed' | 'failed' | 'cancelled';
  progress?: number;
  startTime?: string;
  endTime?: string;
  currentStep?: string;
  totalSteps?: number;
  completedSteps?: number;
  errorMessage?: string;
  logs?: ExperimentLog[];
  metrics?: ExperimentMetric[];
  resources?: ResourceUsage;
  lastUpdated: string;
}

export interface ExperimentLog {
  id: string;
  timestamp: string;
  level: 'info' | 'warning' | 'error' | 'debug';
  message: string;
  source?: string;
  details?: any;
}

export interface ExperimentMetric {
  name: string;
  value: number;
  unit?: string;
  timestamp: string;
  category?: string;
}

export interface ResourceUsage {
  cpu?: number;
  memory?: number;
  disk?: number;
  gpu?: number;
  network?: number;
}

// 配置选项
export interface ExperimentStatusConfig {
  enableWebSocket: boolean;
  enablePolling: boolean;
  pollingInterval: number;
  cacheTimeout: number;
  maxLogEntries: number;
  realTimeMetrics: boolean;
}

/**
 * 实验状态服务类
 */
class ExperimentStatusService {
  private config: ExperimentStatusConfig = {
    enableWebSocket: true,
    enablePolling: true,
    pollingInterval: 5000,
    cacheTimeout: 30000,
    maxLogEntries: 1000,
    realTimeMetrics: true
  };

  private statusCache = new Map<string, ExperimentStatus>();
  private statusSubjects = new Map<string, BehaviorSubject<ExperimentStatus | null>>();
  private pollingTimers = new Map<string, any>();
  private wsConnected = false;

  constructor() {
    this.initializeWebSocket();
  }

  /**
   * 初始化WebSocket连接
   */
  private initializeWebSocket(): void {
    if (!this.config.enableWebSocket) return;

    // 监听WebSocket连接状态
    webSocketService.onMessage('CONNECTION_STATUS').subscribe((message: WSMessage) => {
      this.wsConnected = message.payload.connected;
      console.log(`实验状态服务 WebSocket 连接状态: ${this.wsConnected ? '已连接' : '已断开'}`);
    });

    // 监听实验状态更新
    webSocketService.onMessage('EXPERIMENT_STATUS_UPDATE').subscribe((message: WSMessage) => {
      const { experimentId, status } = message.payload;
      this.updateStatusCache(experimentId, status);
    });

    // 监听实验日志更新
    webSocketService.onMessage('EXPERIMENT_LOG_UPDATE').subscribe((message: WSMessage) => {
      const { experimentId, log } = message.payload;
      this.appendLogToCache(experimentId, log);
    });

    // 监听实验指标更新
    webSocketService.onMessage('EXPERIMENT_METRICS_UPDATE').subscribe((message: WSMessage) => {
      const { experimentId, metrics } = message.payload;
      this.updateMetricsInCache(experimentId, metrics);
    });
  }

  /**
   * 获取实验状态（实时Observable）
   * @param experimentId 实验ID
   * @returns Observable<ExperimentStatus | null>
   */
  public getExperimentStatus(experimentId: string): Observable<ExperimentStatus | null> {
    if (!this.statusSubjects.has(experimentId)) {
      this.statusSubjects.set(experimentId, new BehaviorSubject<ExperimentStatus | null>(null));

      // 初始加载实验状态
      this.loadExperimentStatus(experimentId);

      // 启动实时监控
      this.startRealTimeMonitoring(experimentId);
    }

    return this.statusSubjects.get(experimentId)!.asObservable().pipe(
      distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b)),
      shareReplay(1)
    );
  }

  /**
   * 启动实时监控
   * @param experimentId 实验ID
   */
  private startRealTimeMonitoring(experimentId: string): void {
    // WebSocket实时监控
    if (this.config.enableWebSocket && this.wsConnected) {
      webSocketService.sendMessage({
        type: 'SUBSCRIBE_EXPERIMENT_STATUS',
        payload: { experimentId }
      });
    }

    // HTTP轮询作为后备方案
    if (this.config.enablePolling) {
      this.startPolling(experimentId);
    }
  }

  /**
   * 启动轮询
   * @param experimentId 实验ID
   */
  private startPolling(experimentId: string): void {
    if (this.pollingTimers.has(experimentId)) {
      clearInterval(this.pollingTimers.get(experimentId));
    }

    const pollingTimer = setInterval(async () => {
      try {
        await this.loadExperimentStatus(experimentId);
      } catch (error) {
        console.error(`轮询实验状态失败 (${experimentId}):`, error);
      }
    }, this.config.pollingInterval);

    this.pollingTimers.set(experimentId, pollingTimer);
  }

  /**
   * 从服务器加载实验状态
   * @param experimentId 实验ID
   */
  private async loadExperimentStatus(experimentId: string): Promise<void> {
    try {
      // 获取基本执行状态
      const executionResponse = await experimentService.getExperimentExecution(experimentId);
      let status: ExperimentStatus = {
        id: experimentId,
        status: executionResponse.data?.status || 'pending',
        progress: executionResponse.data?.progress || 0,
        currentStep: executionResponse.data?.currentStep,
        totalSteps: executionResponse.data?.totalSteps,
        completedSteps: executionResponse.data?.completedSteps,
        startTime: executionResponse.data?.startTime,
        endTime: executionResponse.data?.endTime,
        errorMessage: executionResponse.data?.errorMessage,
        lastUpdated: new Date().toISOString(),
        logs: [],
        metrics: [],
        resources: executionResponse.data?.resources
      };

      // 获取实验日志
      if (this.config.realTimeMetrics) {
        try {
          const logsResponse = await experimentService.getExperimentLogs(experimentId, this.config.maxLogEntries);
          status.logs = logsResponse.data || [];
        } catch (error) {
          console.warn(`获取实验日志失败 (${experimentId}):`, error);
        }

        // 获取实验指标
        try {
          const metricsResponse = await experimentService.getExperimentMetrics(experimentId);
          status.metrics = metricsResponse.data || [];
        } catch (error) {
          console.warn(`获取实验指标失败 (${experimentId}):`, error);
        }
      }

      this.updateStatusCache(experimentId, status);
    } catch (error) {
      console.error(`加载实验状态失败 (${experimentId}):`, error);

      // 设置错误状态
      const errorStatus: ExperimentStatus = {
        id: experimentId,
        status: 'failed',
        errorMessage: '无法获取实验状态',
        lastUpdated: new Date().toISOString(),
        logs: [],
        metrics: []
      };

      this.updateStatusCache(experimentId, errorStatus);
    }
  }

  /**
   * 更新状态缓存
   * @param experimentId 实验ID
   * @param status 实验状态
   */
  private updateStatusCache(experimentId: string, status: ExperimentStatus): void {
    this.statusCache.set(experimentId, status);

    const subject = this.statusSubjects.get(experimentId);
    if (subject) {
      subject.next(status);
    }
  }

  /**
   * 向缓存添加日志
   * @param experimentId 实验ID
   * @param log 日志条目
   */
  private appendLogToCache(experimentId: string, log: ExperimentLog): void {
    const status = this.statusCache.get(experimentId);
    if (status) {
      status.logs = status.logs || [];
      status.logs.unshift(log);

      // 限制日志条目数量
      if (status.logs.length > this.config.maxLogEntries) {
        status.logs = status.logs.slice(0, this.config.maxLogEntries);
      }

      status.lastUpdated = new Date().toISOString();
      this.updateStatusCache(experimentId, status);
    }
  }

  /**
   * 更新缓存中的指标
   * @param experimentId 实验ID
   * @param metrics 指标数组
   */
  private updateMetricsInCache(experimentId: string, metrics: ExperimentMetric[]): void {
    const status = this.statusCache.get(experimentId);
    if (status) {
      status.metrics = metrics;
      status.lastUpdated = new Date().toISOString();
      this.updateStatusCache(experimentId, status);
    }
  }

  /**
   * 获取多个实验的状态
   * @param experimentIds 实验ID数组
   * @returns Observable<Map<string, ExperimentStatus | null>>
   */
  public getMultipleExperimentStatus(experimentIds: string[]): Observable<Map<string, ExperimentStatus | null>> {
    const statusObservables = experimentIds.map(id =>
      this.getExperimentStatus(id).pipe(
        map(status => ({ id, status }))
      )
    );

    return combineLatest(statusObservables).pipe(
      map(results => {
        const statusMap = new Map<string, ExperimentStatus | null>();
        results.forEach(({ id, status }) => {
          statusMap.set(id, status);
        });
        return statusMap;
      })
    );
  }

  /**
   * 控制实验执行
   * @param experimentId 实验ID
   * @param action 操作类型
   */
  public async controlExperiment(experimentId: string, action: 'start' | 'pause' | 'stop' | 'cancel'): Promise<void> {
    try {
      switch (action) {
        case 'start':
          await experimentService.startExperiment(experimentId);
          break;
        case 'stop':
          await experimentService.stopExperiment(experimentId);
          break;
        // pause 和 cancel 暂时使用 stop
        case 'pause':
        case 'cancel':
          await experimentService.stopExperiment(experimentId);
          break;
      }

      // 立即刷新状态
      await this.loadExperimentStatus(experimentId);

      // 通过WebSocket通知状态变更
      if (this.wsConnected) {
        webSocketService.sendMessage({
          type: 'EXPERIMENT_ACTION',
          payload: { experimentId, action }
        });
      }

    } catch (error) {
      console.error(`实验控制操作失败 (${experimentId}, ${action}):`, error);
      throw error;
    }
  }

  /**
   * 停止监控指定实验
   * @param experimentId 实验ID
   */
  public stopMonitoring(experimentId: string): void {
    // 停止轮询
    if (this.pollingTimers.has(experimentId)) {
      clearInterval(this.pollingTimers.get(experimentId));
      this.pollingTimers.delete(experimentId);
    }

    // 取消WebSocket订阅
    if (this.wsConnected) {
      webSocketService.sendMessage({
        type: 'UNSUBSCRIBE_EXPERIMENT_STATUS',
        payload: { experimentId }
      });
    }

    // 清理状态
    this.statusSubjects.delete(experimentId);
    this.statusCache.delete(experimentId);
  }

  /**
   * 清理所有监控
   */
  public cleanup(): void {
    // 停止所有轮询
    this.pollingTimers.forEach((timer) => clearInterval(timer));
    this.pollingTimers.clear();

    // 清理所有状态
    this.statusSubjects.clear();
    this.statusCache.clear();
  }

  /**
   * 更新配置
   * @param newConfig 新配置
   */
  public updateConfig(newConfig: Partial<ExperimentStatusConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * 获取缓存的状态（同步方法）
   * @param experimentId 实验ID
   * @returns ExperimentStatus | null
   */
  public getCachedStatus(experimentId: string): ExperimentStatus | null {
    return this.statusCache.get(experimentId) || null;
  }

  /**
   * 强制刷新实验状态
   * @param experimentId 实验ID
   */
  public async refreshStatus(experimentId: string): Promise<void> {
    await this.loadExperimentStatus(experimentId);
  }
}

// 创建单例实例
const experimentStatusService = new ExperimentStatusService();

export default experimentStatusService;
export { experimentStatusService };
