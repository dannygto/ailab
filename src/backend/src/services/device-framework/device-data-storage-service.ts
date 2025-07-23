/**
 * 设备数据存储服务
 * 负责设备数据的存储、管理、压缩和查询
 */

import { EventEmitter } from 'events';
import {
  Device,
  DeviceDataPoint
} from '../../models/device.model.js';
import { DeviceManager } from './types.js';
import { DeviceCommunicationService } from './device-communication-service.js';

/**
 * 数据存储策略枚举
 */
export enum DataStorageStrategy {
  REAL_TIME = 'real_time',    // 实时存储每个数据点
  BATCH = 'batch',            // 批量存储
  THRESHOLD = 'threshold',    // 超过阈值时存储
  CHANGE = 'change',          // 数据变化时存储
  INTERVAL = 'interval',      // 固定时间间隔存储
  CUSTOM = 'custom'           // 自定义策略
}

/**
 * 数据压缩算法枚举
 */
export enum DataCompressionAlgorithm {
  NONE = 'none',              // 不压缩
  DELTA = 'delta',            // 增量压缩
  RLE = 'rle',                // 行程长度编码
  DICTIONARY = 'dictionary',  // 字典压缩
  LOSSY = 'lossy',            // 有损压缩
  LOSSLESS = 'lossless'       // 无损压缩
}

/**
 * 数据存储配置接口
 */
export interface DataStorageConfig {
  deviceId: string;                         // 设备ID
  storageStrategy: DataStorageStrategy;     // 存储策略
  compressionAlgorithm: DataCompressionAlgorithm; // 压缩算法
  batchSize?: number;                       // 批量大小（用于批量策略）
  interval?: number;                        // 时间间隔（毫秒，用于间隔策略）
  changeThreshold?: number;                 // 变化阈值（用于变化策略）
  customStorageFunction?: (data: DeviceDataPoint) => boolean; // 自定义存储判断函数
  retentionPeriod?: number;                 // 数据保留期（天）
  maxStorageSize?: number;                  // 最大存储大小（MB）
  lowPrecisionStorage?: boolean;            // 是否使用低精度存储（节省空间）
  metadata?: Record<string, any>;           // 元数据
}

/**
 * 数据查询选项接口
 */
export interface DataQueryOptions {
  deviceId?: string;                        // 设备ID
  startTime?: string;                       // 开始时间
  endTime?: string;                         // 结束时间
  sensorTypes?: string[];                   // 传感器类型
  limit?: number;                           // 限制结果数量
  skip?: number;                            // 跳过结果数量
  sortBy?: string;                          // 排序字段
  sortDirection?: 'asc' | 'desc';           // 排序方向
  filters?: Record<string, any>;            // 过滤条件
  includeMetadata?: boolean;                // 是否包含元数据
  aggregation?: {                          // 聚合选项
    function: 'avg' | 'min' | 'max' | 'sum' | 'count'; // 聚合函数
    timeWindow: string;                     // 时间窗口 (如 '1h', '30m', '1d')
  };
}

/**
 * 数据统计信息接口
 */
export interface DataStatistics {
  deviceId: string;                         // 设备ID
  totalDataPoints: number;                  // 总数据点数
  oldestDataPoint: string;                  // 最早数据点时间
  newestDataPoint: string;                  // 最新数据点时间
  storageSize: number;                      // 存储大小（字节）
  compressionRatio: number;                 // 压缩比率
  dataPointsPerDay: number;                 // 每天数据点数
  sensorTypeCounts: Record<string, number>; // 各传感器类型数据点数量
  dataQualityScore: number;                 // 数据质量评分 (0-100)
}

/**
 * 设备数据存储服务实现
 */
export class DeviceDataStorageService {
  private deviceManager: DeviceManager;
  private communicationService: DeviceCommunicationService | null = null;
  private eventEmitter: EventEmitter = new EventEmitter();
  private storageConfigs: Map<string, DataStorageConfig> = new Map();
  private dataBuffer: Map<string, DeviceDataPoint[]> = new Map();
  private processingBatches: Set<string> = new Set();
  private storageIntervals: Map<string, NodeJS.Timeout> = new Map();
  private compressionWorker: Worker | null = null;
  private isCompressionWorkerBusy: boolean = false;
  private compressionQueue: Array<{ deviceId: string, data: DeviceDataPoint[] }> = [];
  private dataStatistics: Map<string, DataStatistics> = new Map();
  private defaultRetentionPeriod: number = 365; // 默认保留1年数据
  private isInitialized: boolean = false;

  constructor(deviceManager: DeviceManager) {
    this.deviceManager = deviceManager;

    // 设置最大监听器数量，避免内存泄漏警告
    this.eventEmitter.setMaxListeners(100);
  }

  /**
   * 初始化服务
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    console.log('初始化设备数据存储服务');

    // 设置设备管理器事件监听
    this.setupDeviceManagerListeners();

    // 初始化压缩工作线程
    this.initializeCompressionWorker();

    // 设置数据清理定时任务
    this.setupDataCleanupTask();

    this.isInitialized = true;
  }

  /**
   * 设置通信服务
   * @param service 设备通信服务
   */
  setCommunicationService(service: DeviceCommunicationService): void {
    this.communicationService = service;

    // 设置通信服务事件监听
    if (service) {
      service.on('data-received', this.handleDataReceived.bind(this));
    }
  }

  /**
   * 配置设备数据存储
   * @param config 存储配置
   */
  configureDeviceStorage(config: DataStorageConfig): void {
    const { deviceId, storageStrategy } = config;

    // 检查设备ID
    if (!deviceId) {
      throw new Error('设备ID不能为空');
    }

    // 清除现有定时器
    if (this.storageIntervals.has(deviceId)) {
      clearInterval(this.storageIntervals.get(deviceId));
      this.storageIntervals.delete(deviceId);
    }

    // 存储配置
    this.storageConfigs.set(deviceId, {
      ...config,
      // 设置默认值
      batchSize: config.batchSize || 100,
      interval: config.interval || 60000, // 默认1分钟
      retentionPeriod: config.retentionPeriod || this.defaultRetentionPeriod
    });

    // 初始化数据缓冲区
    if (!this.dataBuffer.has(deviceId)) {
      this.dataBuffer.set(deviceId, []);
    }

    // 初始化统计信息
    if (!this.dataStatistics.has(deviceId)) {
      this.dataStatistics.set(deviceId, this.createEmptyStatistics(deviceId));
    }

    // 根据存储策略设置定时任务
    if (storageStrategy === DataStorageStrategy.INTERVAL) {
      const interval = config.interval || 60000;
      const intervalId = setInterval(() => {
        this.flushDeviceData(deviceId);
      }, interval);

      this.storageIntervals.set(deviceId, intervalId);
    }

    // 触发配置事件
    this.eventEmitter.emit('storage-configured', {
      deviceId,
      config,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * 存储设备数据点
   * @param dataPoint 数据点
   * @returns 是否成功存储
   */
  async storeDataPoint(dataPoint: DeviceDataPoint): Promise<boolean> {
    const { deviceId } = dataPoint;

    // 检查设备ID
    if (!deviceId) {
      throw new Error('数据点缺少设备ID');
    }

    // 确保有存储配置
    if (!this.storageConfigs.has(deviceId)) {
      // 使用默认配置
      this.configureDeviceStorage({
        deviceId,
        storageStrategy: DataStorageStrategy.BATCH,
        compressionAlgorithm: DataCompressionAlgorithm.NONE,
        batchSize: 100
      });
    }

    const config = this.storageConfigs.get(deviceId);

    // 应用存储策略
    if (this.shouldStoreDataPoint(dataPoint, config)) {
      // 获取缓冲区
      const buffer = this.dataBuffer.get(deviceId) || [];

      // 添加数据点到缓冲区
      buffer.push(dataPoint);
      this.dataBuffer.set(deviceId, buffer);

      // 更新统计信息
      this.updateStatistics(deviceId, dataPoint);

      // 触发数据点存储事件
      this.eventEmitter.emit('data-point-buffered', {
        deviceId,
        dataPoint,
        timestamp: new Date().toISOString()
      });

      // 检查是否需要刷新缓冲区
      if (config.storageStrategy === DataStorageStrategy.BATCH &&
          buffer.length >= (config.batchSize || 100)) {
        await this.flushDeviceData(deviceId);
      } else if (config.storageStrategy === DataStorageStrategy.REAL_TIME) {
        await this.flushDeviceData(deviceId);
      }

      return true;
    }

    return false;
  }

  /**
   * 批量存储数据点
   * @param dataPoints 数据点数组
   * @returns 成功存储的数据点数量
   */
  async storeDataPoints(dataPoints: DeviceDataPoint[]): Promise<number> {
    // 按设备ID分组
    const deviceGroups = new Map<string, DeviceDataPoint[]>();

    for (const dataPoint of dataPoints) {
      if (!dataPoint.deviceId) {
        continue;
      }

      const group = deviceGroups.get(dataPoint.deviceId) || [];
      group.push(dataPoint);
      deviceGroups.set(dataPoint.deviceId, group);
    }

    // 按设备存储数据
    let totalStored = 0;

    for (const [deviceId, points] of deviceGroups.entries()) {
      // 确保有存储配置
      if (!this.storageConfigs.has(deviceId)) {
        // 使用默认配置
        this.configureDeviceStorage({
          deviceId,
          storageStrategy: DataStorageStrategy.BATCH,
          compressionAlgorithm: DataCompressionAlgorithm.NONE,
          batchSize: 100
        });
      }

      // 获取配置
      const config = this.storageConfigs.get(deviceId);

      // 过滤应该存储的数据点
      const pointsToStore = points.filter(point =>
        this.shouldStoreDataPoint(point, config));

      if (pointsToStore.length === 0) {
        continue;
      }

      // 获取缓冲区
      const buffer = this.dataBuffer.get(deviceId) || [];

      // 添加数据点到缓冲区
      buffer.push(...pointsToStore);
      this.dataBuffer.set(deviceId, buffer);

      // 更新统计信息
      for (const point of pointsToStore) {
        this.updateStatistics(deviceId, point);
      }

      totalStored += pointsToStore.length;

      // 触发批量数据点存储事件
      this.eventEmitter.emit('data-points-buffered', {
        deviceId,
        count: pointsToStore.length,
        timestamp: new Date().toISOString()
      });

      // 检查是否需要刷新缓冲区
      if (buffer.length >= (config.batchSize || 100)) {
        await this.flushDeviceData(deviceId);
      }
    }

    return totalStored;
  }

  /**
   * 刷新设备数据缓冲区到存储
   * @param deviceId 设备ID
   * @returns 是否成功刷新
   */
  async flushDeviceData(deviceId: string): Promise<boolean> {
    // 检查是否正在处理
    if (this.processingBatches.has(deviceId)) {
      return false;
    }

    // 获取缓冲区
    const buffer = this.dataBuffer.get(deviceId);
    if (!buffer || buffer.length === 0) {
      return true; // 没有数据需要刷新
    }

    // 标记为正在处理
    this.processingBatches.add(deviceId);

    try {
      // 获取存储配置
      const config = this.storageConfigs.get(deviceId);

      // 复制缓冲区数据并清空缓冲区
      const dataToStore = [...buffer];
      this.dataBuffer.set(deviceId, []);

      // 触发刷新开始事件
      this.eventEmitter.emit('flush-started', {
        deviceId,
        count: dataToStore.length,
        timestamp: new Date().toISOString()
      });

      // 应用压缩算法
      const compressedData = await this.compressData(deviceId, dataToStore, config);

      // 实际存储数据（实现存储逻辑）
      const success = await this.persistData(deviceId, compressedData, config);

      // 触发刷新完成事件
      this.eventEmitter.emit('flush-completed', {
        deviceId,
        success,
        count: dataToStore.length,
        timestamp: new Date().toISOString()
      });

      return success;
    } catch (error) {
      // 出错时，将数据放回缓冲区
      const currentBuffer = this.dataBuffer.get(deviceId) || [];
      this.dataBuffer.set(deviceId, [...buffer, ...currentBuffer]);

      // 触发刷新错误事件
      this.eventEmitter.emit('flush-error', {
        deviceId,
        error,
        timestamp: new Date().toISOString()
      });

      return false;
    } finally {
      // 标记为处理完成
      this.processingBatches.delete(deviceId);
    }
  }

  /**
   * 查询设备数据
   * @param options 查询选项
   * @returns 数据点数组
   */
  async queryData(options: DataQueryOptions): Promise<DeviceDataPoint[]> {
    // 实际存储中查询数据
    // 这里是一个示例实现，实际项目中应该根据具体的存储系统实现

    // 模拟查询延迟
    await new Promise(resolve => setTimeout(resolve, 50));

    // 模拟返回一些数据
    const sampleData: DeviceDataPoint[] = [];

    // 触发查询事件
    this.eventEmitter.emit('data-queried', {
      options,
      resultCount: sampleData.length,
      timestamp: new Date().toISOString()
    });

    return sampleData;
  }

  /**
   * 获取设备数据统计信息
   * @param deviceId 设备ID
   * @returns 统计信息
   */
  getDeviceStatistics(deviceId: string): DataStatistics | null {
    return this.dataStatistics.get(deviceId) || null;
  }

  /**
   * 获取所有设备的数据统计信息
   * @returns 统计信息映射
   */
  getAllStatistics(): Map<string, DataStatistics> {
    return new Map(this.dataStatistics);
  }

  /**
   * 清除设备数据
   * @param deviceId 设备ID
   * @param beforeTime 清除此时间之前的数据
   * @returns 是否成功清除
   */
  async clearDeviceData(deviceId: string, beforeTime?: string): Promise<boolean> {
    // 实际存储中清除数据
    // 这里是一个示例实现，实际项目中应该根据具体的存储系统实现

    // 清除缓冲区
    this.dataBuffer.set(deviceId, []);

    // 重置统计信息
    this.dataStatistics.set(deviceId, this.createEmptyStatistics(deviceId));

    // 触发数据清除事件
    this.eventEmitter.emit('data-cleared', {
      deviceId,
      beforeTime,
      timestamp: new Date().toISOString()
    });

    return true;
  }

  /**
   * 导出设备数据
   * @param options 查询选项
   * @param format 导出格式 ('json', 'csv', 'excel')
   * @returns 导出的数据
   */
  async exportData(
    options: DataQueryOptions,
    format: 'json' | 'csv' | 'excel' = 'json'
  ): Promise<string | Buffer> {
    // 查询数据
    const data = await this.queryData(options);

    // 根据格式导出
    switch (format) {
      case 'json':
        return JSON.stringify(data);
      case 'csv':
        return this.convertToCsv(data);
      case 'excel':
        return this.convertToExcel(data);
      default:
        return JSON.stringify(data);
    }
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
   * 判断是否应该存储数据点
   * @param dataPoint 数据点
   * @param config 存储配置
   * @returns 是否应该存储
   */
  private shouldStoreDataPoint(
    dataPoint: DeviceDataPoint,
    config: DataStorageConfig
  ): boolean {
    if (!config) {
      return true; // 没有配置时默认存储
    }

    switch (config.storageStrategy) {
      case DataStorageStrategy.REAL_TIME:
        // 实时策略总是存储
        return true;

      case DataStorageStrategy.BATCH:
        // 批量策略总是存储，但在达到批量大小时一起处理
        return true;

      case DataStorageStrategy.THRESHOLD:
        // 阈值策略，检查数值是否超过阈值
        if (typeof dataPoint.value === 'number' && config.changeThreshold !== undefined) {
          // 获取上一个数据点
          const lastDataPoint = this.getLastDataPoint(dataPoint.deviceId, dataPoint.sensorType);
          if (!lastDataPoint || typeof lastDataPoint.value !== 'number') {
            return true;
          }

          // 检查变化是否超过阈值
          return Math.abs(dataPoint.value - lastDataPoint.value) >= config.changeThreshold;
        }
        return true;

      case DataStorageStrategy.CHANGE:
        // 变化策略，检查值是否变化
        const lastDataPoint = this.getLastDataPoint(dataPoint.deviceId, dataPoint.sensorType);
        if (!lastDataPoint) {
          return true;
        }

        return dataPoint.value !== lastDataPoint.value;

      case DataStorageStrategy.INTERVAL:
        // 间隔策略，由定时器触发存储，总是将数据加入缓冲区
        return true;

      case DataStorageStrategy.CUSTOM:
        // 自定义策略，使用用户提供的函数
        if (config.customStorageFunction) {
          return config.customStorageFunction(dataPoint);
        }
        return true;

      default:
        return true;
    }
  }

  /**
   * 获取设备的最后一个数据点
   * @param deviceId 设备ID
   * @param sensorType 传感器类型
   * @returns 数据点
   */
  private getLastDataPoint(deviceId: string, sensorType: string): DeviceDataPoint | null {
    // 先从缓冲区查找
    const buffer = this.dataBuffer.get(deviceId) || [];
    for (let i = buffer.length - 1; i >= 0; i--) {
      if (buffer[i].sensorType === sensorType) {
        return buffer[i];
      }
    }

    // 缓冲区没有找到，则从存储中查找
    // 这里只是示例，实际实现需要根据存储系统来查询
    return null;
  }

  /**
   * 创建空的统计信息
   * @param deviceId 设备ID
   * @returns 统计信息
   */
  private createEmptyStatistics(deviceId: string): DataStatistics {
    return {
      deviceId,
      totalDataPoints: 0,
      oldestDataPoint: '',
      newestDataPoint: '',
      storageSize: 0,
      compressionRatio: 1,
      dataPointsPerDay: 0,
      sensorTypeCounts: {},
      dataQualityScore: 100
    };
  }

  /**
   * 更新统计信息
   * @param deviceId 设备ID
   * @param dataPoint 数据点
   */
  private updateStatistics(deviceId: string, dataPoint: DeviceDataPoint): void {
    const stats = this.dataStatistics.get(deviceId) || this.createEmptyStatistics(deviceId);

    // 更新数据点计数
    stats.totalDataPoints++;

    // 更新传感器类型计数
    stats.sensorTypeCounts[dataPoint.sensorType] =
      (stats.sensorTypeCounts[dataPoint.sensorType] || 0) + 1;

    // 更新最新数据点时间
    stats.newestDataPoint = dataPoint.timestamp;

    // 更新最早数据点时间（如果未设置或新数据点更早）
    if (!stats.oldestDataPoint || dataPoint.timestamp < stats.oldestDataPoint) {
      stats.oldestDataPoint = dataPoint.timestamp;
    }

    // 更新存储大小（粗略估计）
    const dataSize = JSON.stringify(dataPoint).length;
    stats.storageSize += dataSize;

    // 更新每天数据点数（简化计算）
    if (stats.oldestDataPoint && stats.newestDataPoint) {
      const oldestTime = new Date(stats.oldestDataPoint).getTime();
      const newestTime = new Date(stats.newestDataPoint).getTime();
      const daysDiff = Math.max(1, (newestTime - oldestTime) / (1000 * 60 * 60 * 24));
      stats.dataPointsPerDay = stats.totalDataPoints / daysDiff;
    }

    // 保存更新后的统计信息
    this.dataStatistics.set(deviceId, stats);
  }

  /**
   * 压缩数据
   * @param deviceId 设备ID
   * @param data 数据点数组
   * @param config 存储配置
   * @returns 压缩后的数据
   */
  private async compressData(
    deviceId: string,
    data: DeviceDataPoint[],
    config: DataStorageConfig
  ): Promise<any> {
    if (!config || config.compressionAlgorithm === DataCompressionAlgorithm.NONE) {
      return data; // 不压缩
    }

    // 如果有压缩工作线程且不忙
    if (this.compressionWorker && !this.isCompressionWorkerBusy) {
      return new Promise((resolve, reject) => {
        this.isCompressionWorkerBusy = true;

        // 设置消息处理
        const messageHandler = (event) => {
          this.isCompressionWorkerBusy = false;
          this.compressionWorker.removeEventListener('message', messageHandler);
          this.compressionWorker.removeEventListener('error', errorHandler);

          if (event.data.error) {
            reject(new Error(event.data.error));
          } else {
            resolve(event.data.result);
          }

          // 处理队列中的下一个任务
          this.processNextCompressionTask();
        };

        // 设置错误处理
        const errorHandler = (error) => {
          this.isCompressionWorkerBusy = false;
          this.compressionWorker.removeEventListener('message', messageHandler);
          this.compressionWorker.removeEventListener('error', errorHandler);
          reject(error);

          // 处理队列中的下一个任务
          this.processNextCompressionTask();
        };

        // 添加事件监听
        this.compressionWorker.addEventListener('message', messageHandler);
        this.compressionWorker.addEventListener('error', errorHandler);

        // 发送压缩任务
        this.compressionWorker.postMessage({
          deviceId,
          data,
          algorithm: config.compressionAlgorithm
        });
      });
    } else {
      // 压缩工作线程忙或不可用，加入队列
      return new Promise((resolve, reject) => {
        this.compressionQueue.push({
          deviceId,
          data
        });

        // 简单实现：不压缩直接返回
        resolve(data);
      });
    }
  }

  /**
   * 处理下一个压缩任务
   */
  private processNextCompressionTask(): void {
    if (this.compressionQueue.length === 0 || !this.compressionWorker || this.isCompressionWorkerBusy) {
      return;
    }

    const task = this.compressionQueue.shift();
    if (!task) {
      return;
    }

    const { deviceId, data } = task;
    const config = this.storageConfigs.get(deviceId);

    // 执行压缩
    this.compressData(deviceId, data, config);
  }

  /**
   * 初始化压缩工作线程
   */
  private initializeCompressionWorker(): void {
    // 此处实现压缩工作线程初始化
    // 实际实现取决于项目环境

    // 模拟工作线程
    this.compressionWorker = {
      addEventListener: (event, handler) => {
        // 模拟事件监听
      },
      removeEventListener: (event, handler) => {
        // 模拟移除事件监听
      },
      postMessage: (data) => {
        // 模拟发送消息
        setTimeout(() => {
          // 模拟处理完成
          const handlers = this.compressionWorker._handlers || {};
          const messageHandler = handlers['message'];
          if (messageHandler) {
            messageHandler({
              data: {
                result: data.data // 简单返回原始数据
              }
            });
          }
        }, 100);
      },
      _handlers: {}
    } as any;
  }

  /**
   * 设置数据清理定时任务
   */
  private setupDataCleanupTask(): void {
    // 每天运行一次数据清理
    setInterval(() => {
      this.cleanupExpiredData();
    }, 24 * 60 * 60 * 1000);
  }

  /**
   * 清理过期数据
   */
  private async cleanupExpiredData(): Promise<void> {
    console.log('开始清理过期数据');

    for (const [deviceId, config] of this.storageConfigs.entries()) {
      if (!config.retentionPeriod) {
        continue;
      }

      // 计算截止时间
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - config.retentionPeriod);
      const cutoffTime = cutoffDate.toISOString();

      // 清理数据
      try {
        await this.clearDeviceData(deviceId, cutoffTime);
      } catch (error) {
        console.error(`清理设备 ${deviceId} 数据失败:`, error);
      }
    }

    console.log('过期数据清理完成');
  }

  /**
   * 设置设备管理器事件监听
   */
  private setupDeviceManagerListeners(): void {
    if (!this.deviceManager) {
      return;
    }

    // 设备注销时清理存储配置
    this.deviceManager.on('device-unregistered', (event) => {
      const deviceId = event.deviceId;

      // 清除定时器
      if (this.storageIntervals.has(deviceId)) {
        clearInterval(this.storageIntervals.get(deviceId));
        this.storageIntervals.delete(deviceId);
      }

      // 刷新剩余数据
      this.flushDeviceData(deviceId).catch(error => {
        console.error(`设备注销时刷新数据失败:`, error);
      });
    });
  }

  /**
   * 处理接收到的数据
   * @param event 数据接收事件
   */
  private handleDataReceived(event: any): void {
    const { deviceId, data } = event;

    // 如果数据是DeviceDataPoint或其数组，则存储
    if (Array.isArray(data)) {
      const dataPoints = data.filter(item => this.isDeviceDataPoint(item));
      if (dataPoints.length > 0) {
        this.storeDataPoints(dataPoints).catch(error => {
          console.error(`存储数据点失败:`, error);
        });
      }
    } else if (this.isDeviceDataPoint(data)) {
      this.storeDataPoint(data).catch(error => {
        console.error(`存储数据点失败:`, error);
      });
    }
  }

  /**
   * 检查对象是否为DeviceDataPoint
   * @param obj 要检查的对象
   * @returns 是否为DeviceDataPoint
   */
  private isDeviceDataPoint(obj: any): boolean {
    return obj &&
           typeof obj === 'object' &&
           typeof obj.deviceId === 'string' &&
           typeof obj.timestamp === 'string' &&
           typeof obj.sensorType === 'string' &&
           'value' in obj;
  }

  /**
   * 将数据持久化到存储
   * @param deviceId 设备ID
   * @param data 要存储的数据
   * @param config 存储配置
   * @returns 是否成功存储
   */
  private async persistData(
    deviceId: string,
    data: any,
    config: DataStorageConfig
  ): Promise<boolean> {
    // 这里是一个示例实现，实际项目中应该根据具体的存储系统实现
    // 例如存储到数据库、文件系统或云存储

    console.log(`模拟存储设备 ${deviceId} 的 ${Array.isArray(data) ? data.length : 1} 个数据点`);

    // 模拟存储延迟
    await new Promise(resolve => setTimeout(resolve, 100));

    return true;
  }

  /**
   * 将数据转换为CSV格式
   * @param data 数据点数组
   * @returns CSV格式字符串
   */
  private convertToCsv(data: DeviceDataPoint[]): string {
    if (data.length === 0) {
      return '';
    }

    // 获取所有可能的字段
    const fields = new Set<string>();
    data.forEach(point => {
      Object.keys(point).forEach(key => fields.add(key));
      if (point.metadata) {
        Object.keys(point.metadata).forEach(key => fields.add(`metadata.${key}`));
      }
    });

    // 创建CSV标题行
    const header = Array.from(fields).join(',');

    // 创建数据行
    const rows = data.map(point => {
      return Array.from(fields).map(field => {
        if (field.startsWith('metadata.')) {
          const metaKey = field.substring('metadata.'.length);
          return point.metadata && point.metadata[metaKey] !== undefined
            ? JSON.stringify(point.metadata[metaKey])
            : '';
        } else {
          return point[field] !== undefined ? JSON.stringify(point[field]) : '';
        }
      }).join(',');
    });

    return [header, ...rows].join('\n');
  }

  /**
   * 将数据转换为Excel格式
   * @param data 数据点数组
   * @returns Excel文件的二进制数据
   */
  private convertToExcel(data: DeviceDataPoint[]): Buffer {
    // 这里是一个示例实现，实际项目中应该使用专门的库生成Excel文件
    // 例如使用exceljs, xlsx等库

    // 模拟Excel文件生成
    const csv = this.convertToCsv(data);
    return Buffer.from(csv);
  }
}
