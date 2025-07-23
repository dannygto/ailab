/**
 * 设备管理器实现
 * 负责设备的注册、管理、连接和操作
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
  DeviceProtocolAdapter,
  DeviceConnectionConfig,
  DeviceConnectionState,
  DeviceConnectionEventType,
  DeviceConnectionEvent
} from './types.js';

// 设备管理器实现类
export class DeviceManagerImpl implements DeviceManager {
  private devices: Map<string, Device> = new Map();
  private adapters: Map<string, DeviceProtocolAdapter> = new Map();
  private deviceAdapterMap: Map<string, string> = new Map(); // 设备ID -> 适配器ID
  private deviceConnections: Map<string, DeviceConnectionConfig> = new Map(); // 设备ID -> 连接配置
  private eventEmitter: EventEmitter = new EventEmitter();

  constructor() {
    // 设置最大监听器数量，避免内存泄漏警告
    this.eventEmitter.setMaxListeners(100);
  }

  // 初始化方法
  async initialize(): Promise<void> {
    console.log('初始化设备管理器');
    // 初始化适配器
    for (const adapter of this.adapters.values()) {
      await adapter.initialize();
    }
  }

  // 设置设备连接配置
  async setDeviceConnectionConfig(deviceId: string, config: DeviceConnectionConfig): Promise<void> {
    // 检查设备是否存在
    if (!this.devices.has(deviceId)) {
      throw new Error(`设备 ${deviceId} 不存在`);
    }

    // 存储设备连接配置
    this.deviceConnections.set(deviceId, config);

    // 设置设备适配器映射
    const adapters = this.getAdaptersByConnectionType(config.connectionType);
    if (adapters.length > 0) {
      this.deviceAdapterMap.set(deviceId, adapters[0].id);
    } else {
      throw new Error(`没有找到支持连接类型 ${config.connectionType} 的适配器`);
    }
  }

  // 根据连接类型获取适配器
  private getAdaptersByConnectionType(connectionType: string): DeviceProtocolAdapter[] {
    const result: DeviceProtocolAdapter[] = [];

    for (const adapter of this.adapters.values()) {
      if (adapter.supportedConnectionTypes.includes(connectionType)) {
        result.push(adapter);
      }
    }

    return result;
  }

  // 设备管理方法
  async registerDevice(device: Device): Promise<string> {
    // 检查设备ID是否已存在
    if (this.devices.has(device.id)) {
      throw new Error(`Device with ID ${device.id} already exists`);
    }

    // 添加设备到管理器
    this.devices.set(device.id, {
      ...device,
      connectionStatus: DeviceConnectionStatus.OFFLINE,
      updatedAt: new Date().toISOString()
    });

    // 触发设备注册事件
    this.eventEmitter.emit('device-registered', { deviceId: device.id, device });

    return device.id;
  }

  async unregisterDevice(deviceId: string): Promise<boolean> {
    // 检查设备是否存在
    if (!this.devices.has(deviceId)) {
      return false;
    }

    // 如果设备已连接，先断开连接
    if (this.devices.get(deviceId)?.connectionStatus === DeviceConnectionStatus.ONLINE) {
      await this.disconnectDevice(deviceId);
    }

    // 移除设备
    this.devices.delete(deviceId);
    this.deviceAdapterMap.delete(deviceId);
    this.deviceConnections.delete(deviceId);

    // 触发设备注销事件
    this.eventEmitter.emit('device-unregistered', { deviceId });

    return true;
  }

  async getDevices(filter?: Record<string, any>): Promise<Device[]> {
    const devices = Array.from(this.devices.values());

    // 如果没有过滤条件，返回所有设备
    if (!filter) {
      return devices;
    }

    // 应用过滤条件
    return devices.filter(device => {
      for (const [key, value] of Object.entries(filter)) {
        if (device[key] !== value) {
          return false;
        }
      }
      return true;
    });
  }

  async getDeviceById(deviceId: string): Promise<Device | null> {
    return this.devices.get(deviceId) || null;
  }

  async updateDevice(deviceId: string, updates: Partial<Device>): Promise<Device> {
    // 检查设备是否存在
    const device = this.devices.get(deviceId);
    if (!device) {
      throw new Error(`Device with ID ${deviceId} not found`);
    }

    // 更新设备信息
    const updatedDevice: Device = {
      ...device,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    this.devices.set(deviceId, updatedDevice);

    // 触发设备更新事件
    this.eventEmitter.emit('device-updated', { deviceId, device: updatedDevice });

    return updatedDevice;
  }

  // 适配器管理方法
  registerAdapter(adapter: DeviceProtocolAdapter): void {
    // 检查适配器ID是否已存在
    if (this.adapters.has(adapter.id)) {
      throw new Error(`Adapter with ID ${adapter.id} already exists`);
    }

    // 添加适配器并设置事件监听
    this.adapters.set(adapter.id, adapter);

    // 监听适配器事件并转发
    adapter.on(DeviceConnectionEventType.CONNECTED, this.handleAdapterEvent.bind(this));
    adapter.on(DeviceConnectionEventType.DISCONNECTED, this.handleAdapterEvent.bind(this));
    adapter.on(DeviceConnectionEventType.ERROR, this.handleAdapterEvent.bind(this));
    adapter.on(DeviceConnectionEventType.DATA_RECEIVED, this.handleAdapterEvent.bind(this));
    adapter.on(DeviceConnectionEventType.STATE_CHANGED, this.handleAdapterEvent.bind(this));

    // 触发适配器注册事件
    this.eventEmitter.emit('adapter-registered', { adapterId: adapter.id, adapter });
  }

  unregisterAdapter(adapterId: string): boolean {
    // 检查适配器是否存在
    const adapter = this.adapters.get(adapterId);
    if (!adapter) {
      return false;
    }

    // 检查是否有设备使用此适配器
    const deviceUsingAdapter = Array.from(this.deviceAdapterMap.entries())
      .find(([_, adId]) => adId === adapterId);

    if (deviceUsingAdapter) {
      throw new Error(`Cannot unregister adapter ${adapterId} as it is in use by device ${deviceUsingAdapter[0]}`);
    }

    // 移除事件监听
    adapter.off(DeviceConnectionEventType.CONNECTED, this.handleAdapterEvent.bind(this));
    adapter.off(DeviceConnectionEventType.DISCONNECTED, this.handleAdapterEvent.bind(this));
    adapter.off(DeviceConnectionEventType.ERROR, this.handleAdapterEvent.bind(this));
    adapter.off(DeviceConnectionEventType.DATA_RECEIVED, this.handleAdapterEvent.bind(this));
    adapter.off(DeviceConnectionEventType.STATE_CHANGED, this.handleAdapterEvent.bind(this));

    // 移除适配器
    this.adapters.delete(adapterId);

    // 触发适配器注销事件
    this.eventEmitter.emit('adapter-unregistered', { adapterId });

    return true;
  }

  getAdapter(adapterId: string): DeviceProtocolAdapter | null {
    return this.adapters.get(adapterId) || null;
  }

  getAdapters(filter?: Record<string, any>): DeviceProtocolAdapter[] {
    const adapters = Array.from(this.adapters.values());

    // 如果没有过滤条件，返回所有适配器
    if (!filter) {
      return adapters;
    }

    // 应用过滤条件
    return adapters.filter(adapter => {
      for (const [key, value] of Object.entries(filter)) {
        if (adapter[key] !== value) {
          return false;
        }
      }
      return true;
    });
  }

  // 连接管理方法
  async connectDevice(deviceId: string): Promise<boolean> {
    // 检查设备是否存在
    const device = this.devices.get(deviceId);
    if (!device) {
      throw new Error(`Device with ID ${deviceId} not found`);
    }

    // 检查设备是否已连接
    if (device.connectionStatus === DeviceConnectionStatus.ONLINE) {
      return true;
    }

    // 获取设备适配器和连接配置
    const adapterId = this.deviceAdapterMap.get(deviceId);
    const connectionConfig = this.deviceConnections.get(deviceId);

    if (!adapterId || !connectionConfig) {
      throw new Error(`No adapter or connection configuration found for device ${deviceId}`);
    }

    const adapter = this.adapters.get(adapterId);
    if (!adapter) {
      throw new Error(`Adapter with ID ${adapterId} not found`);
    }

    // 更新设备状态为连接中
    await this.updateDevice(deviceId, { connectionStatus: DeviceConnectionStatus.CONNECTING });

    try {
      // 使用适配器连接设备
      const success = await adapter.connect(deviceId, connectionConfig);

      if (success) {
        // 更新设备状态为在线
        await this.updateDevice(deviceId, { connectionStatus: DeviceConnectionStatus.ONLINE });
        return true;
      } else {
        // 连接失败，更新设备状态为错误
        await this.updateDevice(deviceId, { connectionStatus: DeviceConnectionStatus.ERROR });
        return false;
      }
    } catch (error) {
      // 连接出错，更新设备状态为错误
      await this.updateDevice(deviceId, {
        connectionStatus: DeviceConnectionStatus.ERROR,
        metadata: {
          ...device.metadata,
          lastError: error.message,
          lastErrorTime: new Date().toISOString()
        }
      });

      // 重新抛出错误
      throw error;
    }
  }

  async disconnectDevice(deviceId: string): Promise<boolean> {
    // 检查设备是否存在
    const device = this.devices.get(deviceId);
    if (!device) {
      throw new Error(`Device with ID ${deviceId} not found`);
    }

    // 检查设备是否已离线
    if (device.connectionStatus === DeviceConnectionStatus.OFFLINE) {
      return true;
    }

    // 获取设备适配器
    const adapterId = this.deviceAdapterMap.get(deviceId);
    if (!adapterId) {
      throw new Error(`No adapter found for device ${deviceId}`);
    }

    const adapter = this.adapters.get(adapterId);
    if (!adapter) {
      throw new Error(`Adapter with ID ${adapterId} not found`);
    }

    try {
      // 使用适配器断开设备
      const success = await adapter.disconnect(deviceId);

      // 无论成功与否，更新设备状态为离线
      await this.updateDevice(deviceId, { connectionStatus: DeviceConnectionStatus.OFFLINE });

      return success;
    } catch (error) {
      // 强制更新设备状态为离线
      await this.updateDevice(deviceId, { connectionStatus: DeviceConnectionStatus.OFFLINE });

      // 记录错误但不重新抛出
      console.error(`Error disconnecting device ${deviceId}:`, error);
      return false;
    }
  }

  getDeviceConnectionState(deviceId: string): DeviceConnectionState {
    // 检查设备是否存在
    if (!this.devices.has(deviceId)) {
      throw new Error(`Device with ID ${deviceId} not found`);
    }

    // 获取设备适配器
    const adapterId = this.deviceAdapterMap.get(deviceId);
    if (!adapterId) {
      // 如果设备没有关联适配器，返回默认的连接状态
      return {
        isConnected: false,
        connectionAttempts: 0,
        errors: [],
        statistics: {
          dataSent: 0,
          dataReceived: 0,
          commandsSent: 0,
          responsesReceived: 0
        }
      };
    }

    const adapter = this.adapters.get(adapterId);
    if (!adapter) {
      throw new Error(`Adapter with ID ${adapterId} not found`);
    }

    // 返回适配器提供的连接状态
    return adapter.getConnectionState(deviceId);
  }

  // 设备操作方法
  async sendCommand(deviceId: string, command: DeviceCommand): Promise<any> {
    // 检查设备是否存在
    const device = this.devices.get(deviceId);
    if (!device) {
      throw new Error(`Device with ID ${deviceId} not found`);
    }

    // 检查设备是否在线
    if (device.connectionStatus !== DeviceConnectionStatus.ONLINE) {
      throw new Error(`Device ${deviceId} is not online`);
    }

    // 获取设备适配器
    const adapterId = this.deviceAdapterMap.get(deviceId);
    if (!adapterId) {
      throw new Error(`No adapter found for device ${deviceId}`);
    }

    const adapter = this.adapters.get(adapterId);
    if (!adapter) {
      throw new Error(`Adapter with ID ${adapterId} not found`);
    }

    // 使用适配器发送命令
    try {
      return await adapter.sendCommand(deviceId, command);
    } catch (error) {
      console.error(`Error sending command to device ${deviceId}:`, error);
      throw error;
    }
  }

  async getDeviceData(deviceId: string, options?: Record<string, any>): Promise<DeviceDataPoint[]> {
    // 检查设备是否存在
    const device = this.devices.get(deviceId);
    if (!device) {
      throw new Error(`Device with ID ${deviceId} not found`);
    }

    // 检查设备是否在线
    if (device.connectionStatus !== DeviceConnectionStatus.ONLINE) {
      throw new Error(`Device ${deviceId} is not online`);
    }

    // 获取设备适配器
    const adapterId = this.deviceAdapterMap.get(deviceId);
    if (!adapterId) {
      throw new Error(`No adapter found for device ${deviceId}`);
    }

    const adapter = this.adapters.get(adapterId);
    if (!adapter) {
      throw new Error(`Adapter with ID ${adapterId} not found`);
    }

    // 使用适配器读取数据
    try {
      const rawData = await adapter.readData(deviceId, options);

      // 这里需要一个数据转换步骤，将原始数据转换为标准的DeviceDataPoint
      // 简化实现，假设原始数据已经是标准格式
      return rawData;
    } catch (error) {
      console.error(`Error getting data from device ${deviceId}:`, error);
      throw error;
    }
  }

  // 事件管理方法
  on(eventType: string, callback: (event: any) => void): void {
    this.eventEmitter.on(eventType, callback);
  }

  off(eventType: string, callback: (event: any) => void): void {
    this.eventEmitter.off(eventType, callback);
  }

  // 设置设备使用的适配器和连接配置
  async setDeviceAdapter(
    deviceId: string,
    adapterId: string,
    connectionConfig: DeviceConnectionConfig
  ): Promise<void> {
    // 检查设备是否存在
    if (!this.devices.has(deviceId)) {
      throw new Error(`Device with ID ${deviceId} not found`);
    }

    // 检查适配器是否存在
    if (!this.adapters.has(adapterId)) {
      throw new Error(`Adapter with ID ${adapterId} not found`);
    }

    // 如果设备当前连接到其他适配器，先断开连接
    const currentAdapterId = this.deviceAdapterMap.get(deviceId);
    if (currentAdapterId && currentAdapterId !== adapterId) {
      const device = this.devices.get(deviceId);
      if (device.connectionStatus === DeviceConnectionStatus.ONLINE) {
        await this.disconnectDevice(deviceId);
      }
    }

    // 设置设备适配器和连接配置
    this.deviceAdapterMap.set(deviceId, adapterId);
    this.deviceConnections.set(deviceId, connectionConfig);

    // 触发设备适配器更新事件
    this.eventEmitter.emit('device-adapter-updated', {
      deviceId,
      adapterId,
      connectionConfig
    });
  }

  // 处理适配器事件
  private handleAdapterEvent(event: DeviceConnectionEvent): void {
    // 验证设备ID
    const deviceId = event.deviceId;
    if (!this.devices.has(deviceId)) {
      console.warn(`Received event for unknown device ID: ${deviceId}`);
      return;
    }

    // 根据事件类型处理
    switch (event.type) {
      case DeviceConnectionEventType.CONNECTED:
        this.handleDeviceConnected(deviceId);
        break;
      case DeviceConnectionEventType.DISCONNECTED:
        this.handleDeviceDisconnected(deviceId);
        break;
      case DeviceConnectionEventType.ERROR:
        this.handleDeviceError(deviceId, event.error);
        break;
      case DeviceConnectionEventType.DATA_RECEIVED:
        // 简单地转发数据接收事件
        this.eventEmitter.emit('device-data-received', {
          deviceId,
          data: event.data,
          timestamp: event.timestamp
        });
        break;
      case DeviceConnectionEventType.STATE_CHANGED:
        // 转发状态变更事件
        this.eventEmitter.emit('device-state-changed', {
          deviceId,
          state: event.data,
          timestamp: event.timestamp
        });
        break;
    }

    // 同时发出通用设备事件
    this.eventEmitter.emit('device-event', event);
  }

  // 处理设备连接事件
  private async handleDeviceConnected(deviceId: string): Promise<void> {
    try {
      await this.updateDevice(deviceId, { connectionStatus: DeviceConnectionStatus.ONLINE });
    } catch (error) {
      console.error(`Error updating device ${deviceId} status:`, error);
    }
  }

  // 处理设备断开连接事件
  private async handleDeviceDisconnected(deviceId: string): Promise<void> {
    try {
      await this.updateDevice(deviceId, { connectionStatus: DeviceConnectionStatus.OFFLINE });
    } catch (error) {
      console.error(`Error updating device ${deviceId} status:`, error);
    }
  }

  // 处理设备错误事件
  private async handleDeviceError(deviceId: string, error: Error): Promise<void> {
    try {
      const device = this.devices.get(deviceId);
      await this.updateDevice(deviceId, {
        connectionStatus: DeviceConnectionStatus.ERROR,
        metadata: {
          ...device.metadata,
          lastError: error.message,
          lastErrorTime: new Date().toISOString()
        }
      });
    } catch (err) {
      console.error(`Error updating device ${deviceId} error status:`, err);
    }
  }
}
