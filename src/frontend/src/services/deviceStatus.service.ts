import { Subject, Observable, BehaviorSubject } from 'rxjs';
import { webSocketService, WSMessage } from './websocket.service';
import { Device, DeviceStatus, DeviceMonitoringData } from '../types';
import { deviceService } from './device.service';

export interface DeviceStatusUpdate {
  deviceId: string;
  status: DeviceStatus;
  timestamp: string;
  metrics?: {
    [key: string]: number | string;
  };
}

export interface DeviceUpdateOptions {
  fetchInterval?: number; // 轮询间隔，毫秒
  batchSize?: number;     // 批量更新的设备数量
  useWebSocket?: boolean; // 是否使用WebSocket进行实时更新
}

/**
 * 设备状态管理服务
 * 负责设备状态的实时更新和缓存管理
 */
export class DeviceStatusService {
  // 设备状态缓存，键为设备ID，值为设备数据
  private deviceStatusCache = new Map<string, Device>();

  // 设备状态更新流
  private deviceStatusSubject = new Subject<DeviceStatusUpdate>();

  // 所有设备的状态
  private allDevicesSubject = new BehaviorSubject<Device[]>([]);

  // 设备监控数据缓存，键为设备ID，值为监控数据
  private monitoringDataCache = new Map<string, DeviceMonitoringData>();

  // 设备监控数据更新流
  private monitoringDataSubject = new Subject<DeviceMonitoringData>();

  // 轮询间隔ID
  private pollingInterval: any = null;

  // 默认更新选项
  private defaultOptions: DeviceUpdateOptions = {
    fetchInterval: 60000,   // 默认60秒更新一次
    batchSize: 10,          // 默认每批10个设备
    useWebSocket: true      // 默认使用WebSocket
  };

  // 当前配置的选项
  private options: DeviceUpdateOptions;

  // 连接状态
  private connectedSubject = new BehaviorSubject<boolean>(false);

  // 上次更新时间
  private lastUpdateTime = new Map<string, number>();

  // 设备ID到标签的映射
  private deviceTags = new Map<string, string[]>();

  /**
   * 构造函数
   * @param deviceService 设备服务实例
   * @param options 更新选项
   */
  constructor(options: DeviceUpdateOptions = {}) {
    this.options = { ...this.defaultOptions, ...options };

    // 初始化WebSocket
    if (this.options.useWebSocket) {
      this.initializeWebSocket();
    }

    // 设置连接状态监听
    webSocketService.onMessage<any>('CONNECTION_ESTABLISHED').subscribe(() => {
      this.connectedSubject.next(true);

      // 订阅设备状态更新
      this.subscribeToDeviceUpdates();
    });

    webSocketService.onMessage<any>('CONNECTION_CLOSED').subscribe(() => {
      this.connectedSubject.next(false);
    });

    webSocketService.onMessage<any>('CONNECTION_ERROR').subscribe(() => {
      this.connectedSubject.next(false);
    });

    webSocketService.onMessage<any>('RECONNECT_FAILED').subscribe(() => {
      this.connectedSubject.next(false);

      // 如果WebSocket重连失败，切换到轮询模式
      this.startPolling();
    });
  }

  /**
   * 初始化WebSocket连接
   */
  private initializeWebSocket(): void {
    // 获取授权令牌
    const token = localStorage.getItem('authToken');

    // 初始化WebSocket
    webSocketService.init(token || undefined);
  }

  /**
   * 订阅设备状态更新
   */
  private subscribeToDeviceUpdates(): void {
    // 订阅设备状态更新消息
    webSocketService.onMessage<DeviceStatusUpdate>('DEVICE_STATUS_UPDATE').subscribe(update => {
      this.handleDeviceStatusUpdate(update);
    });

    // 订阅设备监控数据更新消息
    webSocketService.onMessage<DeviceMonitoringData>('DEVICE_MONITORING_DATA').subscribe(data => {
      this.handleDeviceMonitoringData(data);
    });

    // 订阅批量设备状态更新消息
    webSocketService.onMessage<DeviceStatusUpdate[]>('DEVICE_BATCH_UPDATE').subscribe(updates => {
      updates.forEach(update => this.handleDeviceStatusUpdate(update));
    });
  }

  /**
   * 处理设备状态更新
   * @param update 设备状态更新数据
   */
  private handleDeviceStatusUpdate(update: DeviceStatusUpdate): void {
    // 更新缓存
    const device = this.deviceStatusCache.get(update.deviceId);

    if (device) {
      device.status = update.status;
      device.lastUpdateTime = new Date(update.timestamp);

      if (update.metrics) {
        device.metrics = { ...device.metrics, ...update.metrics };
      }

      this.deviceStatusCache.set(update.deviceId, device);

      // 更新最后更新时间
      this.lastUpdateTime.set(update.deviceId, Date.now());
    }

    // 通知订阅者
    this.deviceStatusSubject.next(update);

    // 更新所有设备列表
    this.updateAllDevicesList();
  }

  /**
   * 处理设备监控数据
   * @param data 设备监控数据
   */
  private handleDeviceMonitoringData(data: DeviceMonitoringData): void {
    // 更新缓存
    this.monitoringDataCache.set(data.deviceId, data);

    // 通知订阅者
    this.monitoringDataSubject.next(data);
  }

  /**
   * 更新所有设备列表
   */
  private updateAllDevicesList(): void {
    const devices = Array.from(this.deviceStatusCache.values());
    this.allDevicesSubject.next(devices);
  }

  /**
   * 开始轮询设备状态
   */
  private startPolling(): void {
    // 如果已经在轮询，则返回
    if (this.pollingInterval) {
      return;
    }

    // 设置轮询间隔
    this.pollingInterval = setInterval(async () => {
      await this.pollDeviceStatus();
    }, this.options.fetchInterval);

    // 立即执行一次
    this.pollDeviceStatus();
  }

  /**
   * 停止轮询设备状态
   */
  private stopPolling(): void {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
  }

  /**
   * 轮询设备状态
   */
  private async pollDeviceStatus(): Promise<void> {
    try {
      // 获取所有设备
      const response = await deviceService.getDevices({});

      if (response.success && response.data) {
        const devices = response.data;

        // 批量处理设备
        for (let i = 0; i < devices.length; i += this.options.batchSize || 10) {
          const batch = devices.slice(i, i + (this.options.batchSize || 10));

          // 更新缓存
          batch.forEach(device => {
            this.deviceStatusCache.set(device.id, device);

            // 创建状态更新对象
            const update: DeviceStatusUpdate = {
              deviceId: device.id,
              status: device.status,
              timestamp: new Date().toISOString(),
              metrics: device.metrics
            };

            // 通知订阅者
            this.deviceStatusSubject.next(update);

            // 更新最后更新时间
            this.lastUpdateTime.set(device.id, Date.now());
          });

          // 小批量处理之间添加延迟，避免浏览器卡顿
          if (i + (this.options.batchSize || 10) < devices.length) {
            await new Promise(resolve => setTimeout(resolve, 50));
          }
        }

        // 更新所有设备列表
        this.updateAllDevicesList();
      }
    } catch (error) {
      console.error('轮询设备状态出错:', error);
    }
  }

  /**
   * 获取设备
   * @param deviceId 设备ID
   * @param forceRefresh 是否强制刷新
   * @returns 设备对象或null
   */
  public async getDevice(deviceId: string, forceRefresh = false): Promise<Device | null> {
    // 如果缓存中有且不需要强制刷新，则返回缓存的设备
    if (!forceRefresh && this.deviceStatusCache.has(deviceId)) {
      return this.deviceStatusCache.get(deviceId) || null;
    }

    try {
      // 从API获取设备
      const response = await deviceService.getDevice(deviceId);

      if (response.success && response.data) {
        const device = response.data;

        // 更新缓存
        this.deviceStatusCache.set(deviceId, device);

        // 更新最后更新时间
        this.lastUpdateTime.set(deviceId, Date.now());

        return device;
      }
    } catch (error) {
      console.error(`获取设备(${deviceId})出错:`, error);
    }

    return null;
  }

  /**
   * 获取所有设备
   * @param forceRefresh 是否强制刷新
   * @returns 设备数组的Observable
   */
  public getAllDevices(forceRefresh = false): Observable<Device[]> {
    if (forceRefresh || this.deviceStatusCache.size === 0) {
      this.pollDeviceStatus();
    }

    return this.allDevicesSubject.asObservable();
  }

  /**
   * 获取设备监控数据
   * @param deviceId 设备ID
   * @returns 设备监控数据或null
   */
  public getDeviceMonitoringData(deviceId: string): DeviceMonitoringData | null {
    return this.monitoringDataCache.get(deviceId) || null;
  }

  /**
   * 订阅设备状态更新
   * @param deviceId 设备ID，如果不提供则订阅所有设备
   * @returns 设备状态更新的Observable
   */
  public onDeviceStatusUpdate(deviceId?: string): Observable<DeviceStatusUpdate> {
    if (deviceId) {
      return new Observable<DeviceStatusUpdate>(observer => {
        const subscription = this.deviceStatusSubject.subscribe(update => {
          if (update.deviceId === deviceId) {
            observer.next(update);
          }
        });

        return () => subscription.unsubscribe();
      });
    } else {
      return this.deviceStatusSubject.asObservable();
    }
  }

  /**
   * 订阅设备监控数据更新
   * @param deviceId 设备ID，如果不提供则订阅所有设备
   * @returns 设备监控数据的Observable
   */
  public onDeviceMonitoringData(deviceId?: string): Observable<DeviceMonitoringData> {
    if (deviceId) {
      return new Observable<DeviceMonitoringData>(observer => {
        const subscription = this.monitoringDataSubject.subscribe(data => {
          if (data.deviceId === deviceId) {
            observer.next(data);
          }
        });

        return () => subscription.unsubscribe();
      });
    } else {
      return this.monitoringDataSubject.asObservable();
    }
  }

  /**
   * 订阅连接状态更新
   * @returns 连接状态的Observable
   */
  public onConnectionStatus(): Observable<boolean> {
    return this.connectedSubject.asObservable();
  }

  /**
   * 请求设备状态更新
   * @param deviceId 设备ID
   */
  public requestDeviceStatusUpdate(deviceId: string): void {
    if (this.options.useWebSocket && webSocketService.isConnected()) {
      webSocketService.sendMessage({
        type: 'REQUEST_DEVICE_STATUS',
        payload: { deviceId }
      });
    } else {
      // 如果WebSocket未连接，则使用API获取
      this.getDevice(deviceId, true);
    }
  }

  /**
   * 请求设备监控数据
   * @param deviceId 设备ID
   */
  public requestDeviceMonitoringData(deviceId: string): void {
    if (this.options.useWebSocket && webSocketService.isConnected()) {
      webSocketService.sendMessage({
        type: 'REQUEST_MONITORING_DATA',
        payload: { deviceId }
      });
    }
  }

  /**
   * 根据标签订阅设备
   * @param tags 标签数组
   */
  public subscribeToDevicesByTags(tags: string[]): void {
    if (this.options.useWebSocket && webSocketService.isConnected()) {
      webSocketService.sendMessage({
        type: 'SUBSCRIBE_DEVICES_BY_TAGS',
        payload: { tags }
      });
    }
  }

  /**
   * 为设备分配标签
   * @param deviceId 设备ID
   * @param tags 标签数组
   */
  public setDeviceTags(deviceId: string, tags: string[]): void {
    this.deviceTags.set(deviceId, tags);
  }

  /**
   * 获取设备标签
   * @param deviceId 设备ID
   * @returns 标签数组
   */
  public getDeviceTags(deviceId: string): string[] {
    return this.deviceTags.get(deviceId) || [];
  }

  /**
   * 更新配置选项
   * @param options 新的配置选项
   */
  public updateOptions(options: DeviceUpdateOptions): void {
    const oldOptions = this.options;
    this.options = { ...this.options, ...options };

    // 如果轮询间隔改变，重启轮询
    if (oldOptions.fetchInterval !== this.options.fetchInterval && this.pollingInterval) {
      this.stopPolling();
      this.startPolling();
    }

    // 如果WebSocket使用状态改变
    if (oldOptions.useWebSocket !== this.options.useWebSocket) {
      if (this.options.useWebSocket) {
        this.initializeWebSocket();
        this.stopPolling(); // 如果启用WebSocket，停止轮询
      } else {
        webSocketService.disconnect();
        this.startPolling(); // 如果禁用WebSocket，开始轮询
      }
    }
  }

  /**
   * 清除缓存
   */
  public clearCache(): void {
    this.deviceStatusCache.clear();
    this.monitoringDataCache.clear();
    this.lastUpdateTime.clear();
    this.updateAllDevicesList();
  }
}

// 创建设备状态服务实例
export const deviceStatusService = new DeviceStatusService();

export default deviceStatusService;
