/**
 * 设备注册服务实现
 * 负责设备的注册、管理和生命周期控制
 */

import { EventEmitter } from 'events';
import {
  Device,
  DeviceType,
  DeviceConnectionStatus,
  DeviceCommand
} from '../../models/device.model.js';
import {
  DeviceManager,
  DeviceConnectionConfig,
  DeviceConnectionEvent,
  DeviceConnectionEventType,
  DeviceDiscoveryService
} from './types.js';
import { DeviceManagerImpl } from './device-manager.js';
import { DiscoveryResult } from './device-discovery-service.js';

// 设备注册选项
export interface DeviceRegistrationOptions {
  autoConnect?: boolean;        // 是否自动连接
  validateDevice?: boolean;     // 是否验证设备
  overwriteExisting?: boolean;  // 是否覆盖已存在的设备
  connectionConfig?: DeviceConnectionConfig; // 连接配置
  metadata?: Record<string, any>; // 元数据
}

// 设备验证结果
export interface DeviceValidationResult {
  isValid: boolean;           // 设备是否有效
  reasons?: string[];         // 无效原因
  warnings?: string[];        // 警告信息
  recommendations?: string[]; // 建议操作
}

/**
 * 设备注册服务实现类
 */
export class DeviceRegistrationService {
  private deviceManager: DeviceManager;
  private discoveryService: DeviceDiscoveryService | null = null;
  private eventEmitter: EventEmitter = new EventEmitter();
  private registeredDevices: Map<string, Device> = new Map();
  private pendingRegistrations: Map<string, Device> = new Map();
  private autoDiscoveryInterval: NodeJS.Timeout | null = null;
  private validationResults: Map<string, DeviceValidationResult> = new Map();

  constructor(deviceManager: DeviceManager) {
    this.deviceManager = deviceManager;

    // 设置最大监听器数量，避免内存泄漏警告
    this.eventEmitter.setMaxListeners(100);

    // 监听设备管理器事件
    this.setupDeviceManagerListeners();
  }

  /**
   * 设置设备发现服务
   * @param discoveryService 设备发现服务
   */
  setDiscoveryService(discoveryService: DeviceDiscoveryService): void {
    this.discoveryService = discoveryService;
    this.setupDiscoveryServiceListeners();
  }

  /**
   * 注册设备
   * @param device 设备对象
   * @param options 注册选项
   * @returns 注册的设备ID
   */
  async registerDevice(device: Device, options?: DeviceRegistrationOptions): Promise<string> {
    console.log(`注册设备: ${device.name} (${device.id})`, options);

    // 合并默认选项
    const mergedOptions: DeviceRegistrationOptions = {
      autoConnect: false,
      validateDevice: true,
      overwriteExisting: false,
      ...options
    };

    // 检查设备是否已存在
    const existingDevice = await this.deviceManager.getDeviceById(device.id);
    if (existingDevice) {
      if (!mergedOptions.overwriteExisting) {
        throw new Error(`设备ID '${device.id}' 已存在`);
      }
      // 如果设备已连接，先断开连接
      if (existingDevice.connectionStatus === DeviceConnectionStatus.ONLINE) {
        await this.deviceManager.disconnectDevice(device.id);
      }
      // 更新现有设备
      await this.deviceManager.updateDevice(device.id, {
        ...device,
        updatedAt: new Date().toISOString()
      });
    } else {
      // 验证设备
      if (mergedOptions.validateDevice) {
        const validationResult = await this.validateDevice(device);
        this.validationResults.set(device.id, validationResult);

        if (!validationResult.isValid) {
          throw new Error(`设备验证失败: ${validationResult.reasons?.join(', ')}`);
        }
      }

      // 添加设备到待注册列表
      this.pendingRegistrations.set(device.id, device);

      // 注册设备
      await this.deviceManager.registerDevice(device);
    }

    // 存储设备信息
    this.registeredDevices.set(device.id, device);

    // 设置连接配置
    if (mergedOptions.connectionConfig) {
      await this.deviceManager.setDeviceConnectionConfig(device.id, mergedOptions.connectionConfig);
    }

    // 自动连接
    if (mergedOptions.autoConnect && mergedOptions.connectionConfig) {
      try {
        await this.deviceManager.connectDevice(device.id);
      } catch (error) {
        console.error(`自动连接设备失败: ${device.id}`, error);
        // 连接失败不影响注册流程
      }
    }

    // 移除待注册列表
    this.pendingRegistrations.delete(device.id);

    // 触发设备注册事件
    this.eventEmitter.emit('device-registered', {
      deviceId: device.id,
      device,
      options: mergedOptions,
      timestamp: new Date().toISOString()
    });

    return device.id;
  }

  /**
   * 注销设备
   * @param deviceId 设备ID
   * @returns 是否成功注销
   */
  async unregisterDevice(deviceId: string): Promise<boolean> {
    console.log(`注销设备: ${deviceId}`);

    // 从设备管理器中注销设备
    const result = await this.deviceManager.unregisterDevice(deviceId);
    if (result) {
      // 从本地存储中移除
      this.registeredDevices.delete(deviceId);
      this.validationResults.delete(deviceId);

      // 触发设备注销事件
      this.eventEmitter.emit('device-unregistered', {
        deviceId,
        timestamp: new Date().toISOString()
      });
    }

    return result;
  }

  /**
   * 获取所有已注册设备
   * @returns 设备列表
   */
  async getRegisteredDevices(): Promise<Device[]> {
    return await this.deviceManager.getDevices();
  }

  /**
   * 获取设备详情
   * @param deviceId 设备ID
   * @returns 设备对象
   */
  async getDeviceDetails(deviceId: string): Promise<Device | null> {
    return await this.deviceManager.getDeviceById(deviceId);
  }

  /**
   * 更新设备信息
   * @param deviceId 设备ID
   * @param updates 更新内容
   * @returns 更新后的设备对象
   */
  async updateDeviceDetails(deviceId: string, updates: Partial<Device>): Promise<Device> {
    const updatedDevice = await this.deviceManager.updateDevice(deviceId, updates);

    // 更新本地存储
    this.registeredDevices.set(deviceId, updatedDevice);

    // 触发设备更新事件
    this.eventEmitter.emit('device-updated', {
      deviceId,
      updates,
      device: updatedDevice,
      timestamp: new Date().toISOString()
    });

    return updatedDevice;
  }

  /**
   * 验证设备
   * @param device 设备对象
   * @returns 验证结果
   */
  async validateDevice(device: Device): Promise<DeviceValidationResult> {
    console.log(`验证设备: ${device.name} (${device.id})`);

    // 验证结果
    const result: DeviceValidationResult = {
      isValid: true,
      reasons: [],
      warnings: [],
      recommendations: []
    };

    // 验证设备ID
    if (!device.id) {
      result.isValid = false;
      result.reasons.push('设备ID不能为空');
    }

    // 验证设备名称
    if (!device.name) {
      result.isValid = false;
      result.reasons.push('设备名称不能为空');
    }

    // 验证设备类型
    if (!device.type) {
      result.warnings.push('未指定设备类型');
      result.recommendations.push('建议指定设备类型以便更好地管理');
    }

    // 验证制造商
    if (!device.manufacturer) {
      result.warnings.push('未指定制造商');
    }

    // 验证型号
    if (!device.model) {
      result.warnings.push('未指定设备型号');
    }

    // 验证设备状态
    if (!device.metadata?.status) {
      result.warnings.push('未指定设备状态');
      result.recommendations.push('建议设置设备状态为"active"');
    }

    return result;
  }

  /**
   * 从发现结果批量注册设备
   * @param discoveryResults 发现结果列表
   * @param options 注册选项
   * @returns 注册的设备ID列表
   */
  async registerDiscoveredDevices(
    discoveryResults: DiscoveryResult[],
    options?: DeviceRegistrationOptions
  ): Promise<string[]> {
    console.log(`批量注册发现的设备: ${discoveryResults.length}个设备`);

    const registeredIds: string[] = [];

    for (const result of discoveryResults) {
      try {
        // 将发现结果转换为设备对象
        const device = this.convertDiscoveryResultToDevice(result);
        if (!device) continue;

        // 注册设备
        const deviceId = await this.registerDevice(device, options);
        registeredIds.push(deviceId);
      } catch (error) {
        console.error(`注册发现的设备失败:`, error);
      }
    }

    return registeredIds;
  }

  /**
   * 开始自动发现并注册设备
   * @param interval 发现间隔(毫秒)
   * @param options 注册选项
   */
  async startAutoDiscoveryAndRegistration(
    interval: number = 300000, // 默认5分钟
    options?: DeviceRegistrationOptions
  ): Promise<void> {
    if (!this.discoveryService) {
      throw new Error('未设置设备发现服务');
    }

    console.log(`开始自动发现并注册设备，间隔: ${interval}ms`);

    // 清除现有定时器
    if (this.autoDiscoveryInterval) {
      clearInterval(this.autoDiscoveryInterval);
    }

    // 立即执行一次发现
    await this.discoveryService.startDiscovery();

    // 设置定时发现
    this.autoDiscoveryInterval = setInterval(async () => {
      try {
        await this.discoveryService.startDiscovery();
      } catch (error) {
        console.error('自动发现设备失败:', error);
      }
    }, interval);
  }

  /**
   * 停止自动发现并注册设备
   */
  async stopAutoDiscoveryAndRegistration(): Promise<void> {
    console.log('停止自动发现并注册设备');

    // 清除定时器
    if (this.autoDiscoveryInterval) {
      clearInterval(this.autoDiscoveryInterval);
      this.autoDiscoveryInterval = null;
    }

    // 停止当前发现
    if (this.discoveryService) {
      await this.discoveryService.stopDiscovery();
    }
  }

  /**
   * 事件监听
   * @param event 事件类型
   * @param callback 回调函数
   */
  on(event: string, callback: (data: any) => void): void {
    this.eventEmitter.on(event, callback);
  }

  /**
   * 取消事件监听
   * @param event 事件类型
   * @param callback 回调函数
   */
  off(event: string, callback: (data: any) => void): void {
    this.eventEmitter.off(event, callback);
  }

  /**
   * 配置设备管理器事件监听
   */
  private setupDeviceManagerListeners(): void {
    // 这里可以根据需要设置设备管理器的事件监听
  }

  /**
   * 配置设备发现服务事件监听
   */
  private setupDiscoveryServiceListeners(): void {
    if (!this.discoveryService) return;

    // 监听设备发现事件
    this.discoveryService.on('device-discovered', async (event) => {
      if (!event.device) return;

      // 触发设备发现事件
      this.eventEmitter.emit('device-discovered', event);

      // 自动注册发现的设备
      try {
        // 检查设备是否已注册
        const existingDevice = await this.deviceManager.getDeviceById(event.device.id);
        if (!existingDevice) {
          await this.registerDevice(event.device, {
            autoConnect: false, // 默认不自动连接
            validateDevice: true
          });
        }
      } catch (error) {
        console.error(`自动注册发现的设备失败: ${event.device.id}`, error);
      }
    });

    // 监听发现完成事件
    this.discoveryService.on('discovery-complete', (event) => {
      this.eventEmitter.emit('discovery-complete', event);
    });

    // 监听错误事件
    this.discoveryService.on('error', (event) => {
      this.eventEmitter.emit('discovery-error', event);
    });
  }

  /**
   * 将发现结果转换为设备对象
   * @param result 发现结果
   * @returns 设备对象
   */
  private convertDiscoveryResultToDevice(result: DiscoveryResult): Device | null {
    const { deviceInfo, protocol, timestamp } = result;

    // 如果缺少关键信息，返回null
    if (!deviceInfo.address) {
      return null;
    }

    // 生成设备ID
    const deviceId = deviceInfo.id || `${protocol}-${deviceInfo.address}-${deviceInfo.port || 0}`;

    // 确定设备类型
    let deviceType: DeviceType = DeviceType.OTHER;
    if (deviceInfo.type) {
      switch (deviceInfo.type.toLowerCase()) {
        case 'sensor':
        case 'sensors':
          deviceType = DeviceType.SENSOR;
          break;
        case 'actuator':
        case 'controller':
        case 'control':
          deviceType = DeviceType.CONTROL_UNIT;
          break;
        case 'camera':
        case 'imaging':
          deviceType = DeviceType.CAMERA;
          break;
        case 'display':
        case 'screen':
          deviceType = DeviceType.OTHER;
          break;
        case 'laboratory-equipment':
        case 'lab-equipment':
          deviceType = DeviceType.OTHER;
          break;
        case 'industrial-controller':
        case 'plc':
          deviceType = DeviceType.CONTROL_UNIT;
          break;
        default:
          deviceType = DeviceType.OTHER;
      }
    }

    // 创建设备对象
    const device: Device = {
      id: deviceId,
      name: deviceInfo.name || `未命名设备 ${deviceId}`,
      description: `通过${protocol}协议发现的设备`,
      type: deviceType,
      model: deviceInfo.model || 'unknown',
      manufacturer: deviceInfo.manufacturer || 'unknown',
      createdAt: timestamp,
      updatedAt: timestamp,
      connectionStatus: DeviceConnectionStatus.OFFLINE,
      metadata: {
        status: 'active',
        discoveryProtocol: protocol,
        discoveryTimestamp: timestamp,
        address: deviceInfo.address,
        port: deviceInfo.port,
        services: deviceInfo.services,
        ...deviceInfo.metadata
      },
      capabilities: [],
      supportedProtocols: [],
      dataFormats: [],
      configuration: {},
      location: ''
    };

    return device;
  }
}
