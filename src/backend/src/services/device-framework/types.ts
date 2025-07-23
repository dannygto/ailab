/**
 * 设备接入框架核心类型定义
 * 定义了设备连接、协议适配、数据转换的接口规范
 */

import { Device, DeviceDataPoint, DeviceCommand } from '../../models/device.model.js';

// 设备连接配置接口
export interface DeviceConnectionConfig {
  connectionType: string;  // 连接类型: 'usb', 'network', 'serial', 'mqtt', 'bluetooth' 等
  parameters: Record<string, any>; // 连接参数, 如IP地址、端口、串行参数等
  timeout?: number; // 连接超时时间 (ms)
  retryStrategy?: {
    maxRetries: number;
    retryInterval: number; // ms
    exponentialBackoff?: boolean;
  };
  metadata?: Record<string, any>; // 额外元数据
}

// 设备连接事件类型
export enum DeviceConnectionEventType {
  CONNECTED = 'connected',
  DISCONNECTED = 'disconnected',
  ERROR = 'error',
  DATA_RECEIVED = 'data-received',
  STATE_CHANGED = 'state-changed',
  COMMAND_SENT = 'command-sent',
  COMMAND_RESULT = 'command-result'
}

// 设备连接事件接口
export interface DeviceConnectionEvent {
  type: DeviceConnectionEventType;
  deviceId: string;
  timestamp: string;
  data?: any;
  error?: Error;
}

// 设备连接状态接口
export interface DeviceConnectionState {
  isConnected: boolean;
  lastConnected?: string;
  lastDisconnected?: string;
  connectionAttempts: number;
  errors: Array<{message: string, timestamp: string}>;
  statistics: {
    dataSent: number; // bytes
    dataReceived: number; // bytes
    commandsSent: number;
    responsesReceived: number;
  };
}

// 设备协议适配器接口 - 所有协议适配器必须实现此接口
export interface DeviceProtocolAdapter {
  // 基本信息
  readonly id: string;
  readonly name: string;
  readonly protocolName: string;
  readonly supportedConnectionTypes: string[];

  // 初始化适配器
  initialize(): Promise<void>;

  // 连接管理
  connect(deviceId: string, config: DeviceConnectionConfig): Promise<boolean>;
  disconnect(deviceId: string): Promise<boolean>;
  getConnectionState(deviceId: string): DeviceConnectionState;

  // 数据传输
  sendCommand(deviceId: string, command: DeviceCommand): Promise<any>;
  readData(deviceId: string, parameters?: any): Promise<any>;

  // 事件处理
  on(event: DeviceConnectionEventType, callback: (event: DeviceConnectionEvent) => void): void;
  off(event: DeviceConnectionEventType, callback: (event: DeviceConnectionEvent) => void): void;

  // 协议特定方法
  supportsFeature(featureName: string): boolean;
  getProtocolSpecificMethod(methodName: string): Function | null;
}

// 设备数据转换器接口 - 用于转换原始设备数据到标准格式
export interface DeviceDataConverter<RawDataType = any, StandardDataType = DeviceDataPoint> {
  readonly sourceFormat: string;
  readonly targetFormat: string;

  convert(rawData: RawDataType, deviceContext?: Device): StandardDataType | StandardDataType[];
  validateData(data: RawDataType): boolean;
  getMetadata(rawData: RawDataType): Record<string, any>;
}

// 设备发现服务接口 - 用于自动发现网络或本地设备
export interface DeviceDiscoveryService {
  readonly id: string;
  readonly name: string;
  readonly supportedConnectionTypes: string[];

  startDiscovery(options?: Record<string, any>): Promise<void>;
  stopDiscovery(): Promise<void>;
  getDiscoveredDevices(): Device[];

  on(event: 'device-discovered' | 'discovery-complete' | 'error',
     callback: (data: any) => void): void;
  off(event: 'device-discovered' | 'discovery-complete' | 'error',
      callback: (data: any) => void): void;
}

// 设备管理器接口 - 中央设备管理服务
export interface DeviceManager {
  // 设备管理
  registerDevice(device: Device): Promise<string>;
  unregisterDevice(deviceId: string): Promise<boolean>;
  getDevices(filter?: Record<string, any>): Promise<Device[]>;
  getDeviceById(deviceId: string): Promise<Device | null>;
  updateDevice(deviceId: string, updates: Partial<Device>): Promise<Device>;

  // 适配器管理
  registerAdapter(adapter: DeviceProtocolAdapter): void;
  unregisterAdapter(adapterId: string): boolean;
  getAdapter(adapterId: string): DeviceProtocolAdapter | null;
  getAdapters(filter?: Record<string, any>): DeviceProtocolAdapter[];

  // 连接管理
  connectDevice(deviceId: string): Promise<boolean>;
  disconnectDevice(deviceId: string): Promise<boolean>;
  getDeviceConnectionState(deviceId: string): DeviceConnectionState;

  // 设备操作
  sendCommand(deviceId: string, command: DeviceCommand): Promise<any>;
  getDeviceData(deviceId: string, options?: Record<string, any>): Promise<DeviceDataPoint[]>;

  // 事件管理
  on(eventType: string, callback: (event: any) => void): void;
  off(eventType: string, callback: (event: any) => void): void;
}
