// 仪器设备远程接入系统模型定义

// 设备类型枚举
export enum DeviceType {
  SENSOR = 'sensor',
  METER = 'meter',
  MICROSCOPE = 'microscope',
  SPECTROSCOPE = 'spectroscope',
  DATALOGGER = 'datalogger',
  CAMERA = 'camera',
  CONTROL_UNIT = 'control_unit',
  OTHER = 'other'
}

// 设备连接状态
export enum DeviceConnectionStatus {
  ONLINE = 'online',
  OFFLINE = 'offline',
  CONNECTING = 'connecting',
  ERROR = 'error',
  MAINTENANCE = 'maintenance'
}

// 设备模型接口
export interface Device {
  id: string;
  name: string;
  type: DeviceType;
  model: string;
  manufacturer: string;
  description: string;
  connectionStatus: DeviceConnectionStatus;
  location: string;
  ipAddress?: string;
  macAddress?: string;
  firmware?: string;
  lastMaintenance?: string;
  nextMaintenance?: string;
  capabilities: string[];
  supportedProtocols: string[];
  dataFormats: string[];
  configuration: Record<string, any>;
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

// 设备数据点接口
export interface DeviceDataPoint {
  id: string;
  deviceId: string;
  timestamp: string;
  sensorType: string;
  value: number | string | boolean;
  unit?: string;
  quality?: number; // 0-100, 数据质量指标
  metadata?: Record<string, any>;
}

// 设备命令接口
export interface DeviceCommand {
  id: string;
  deviceId: string;
  command: string;
  parameters: Record<string, any>;
  timestamp: string;
  status: 'pending' | 'sent' | 'executed' | 'failed';
  result?: any;
  errorMessage?: string;
  executedAt?: string;
}

// 设备会话接口
export interface DeviceSession {
  id: string;
  deviceId: string;
  userId: string;
  experimentId?: string;
  startTime: string;
  endTime?: string;
  status: 'active' | 'ended' | 'error';
  commands: DeviceCommand[];
  dataPoints: DeviceDataPoint[];
  settings: Record<string, any>;
  notes?: string;
}

// 设备预约接口
export interface DeviceReservation {
  id: string;
  deviceId: string;
  userId: string;
  title: string;
  purpose: string;
  startTime: string;
  endTime: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled' | 'completed';
  approvedBy?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

// 设备使用统计接口
export interface DeviceUsageStatistics {
  deviceId: string;
  totalSessions: number;
  totalUsageTime: number; // 秒
  totalDataPoints: number;
  averageSessionDuration: number; // 秒
  lastUsed: string;
  usageByDay: {
    date: string;
    sessions: number;
    usageTime: number; // 秒
  }[];
  usageByUser: {
    userId: string;
    sessions: number;
    usageTime: number; // 秒
  }[];
  errorRate: number; // 0-1
  availability: number; // 0-1
}

// 设备驱动接口
export interface DeviceDriver {
  id: string;
  deviceType: DeviceType;
  manufacturer: string;
  modelName: string;
  version: string;
  supportedFirmware: string[];
  communicationProtocols: string[];
  capabilities: string[];
  configurationOptions: {
    name: string;
    type: 'string' | 'number' | 'boolean' | 'enum';
    description: string;
    required: boolean;
    defaultValue?: any;
    options?: string[]; // 用于enum类型
    min?: number;
    max?: number;
  }[];
  installationInstructions: string;
  documentationUrl: string;
  createdAt: string;
  updatedAt: string;
}
