// 设备相关类型定义

// 设备类型枚举
export enum DeviceType {
  SENSOR = 'sensor',
  ACTUATOR = 'actuator', 
  CONTROLLER = 'controller',
  CAMERA = 'camera',
  MICROPHONE = 'microphone',
  SPEAKER = 'speaker',
  METER = 'meter',
  MICROSCOPE = 'microscope',
  SPECTROSCOPE = 'spectroscope',
  DATALOGGER = 'datalogger',
  CONTROL_UNIT = 'control_unit',
  OTHER = 'other'
}

// 设备状态枚举
export enum DeviceStatus {
  ONLINE = 'online',
  OFFLINE = 'offline',
  BUSY = 'busy',
  ERROR = 'error',
  MAINTENANCE = 'maintenance',
  ACTIVE = 'active',
  RUNNING = 'running',
  IDLE = 'idle'
}

// 设备连接状态枚举
export enum DeviceConnectionStatus {
  ONLINE = 'online',
  OFFLINE = 'offline',
  ERROR = 'error',
  MAINTENANCE = 'maintenance',
  CONNECTING = 'connecting',
  CONNECTED = 'connected'
}

// 设备连接类型
export enum ConnectionType {
  WIFI = 'wifi',
  BLUETOOTH = 'bluetooth',
  USB = 'usb',
  ETHERNET = 'ethernet'
}

// 数据来源类型枚举
export enum DataSourceType {
  USB = 'usb',
  MQTT = 'mqtt',
  MODBUS_RTU = 'modbus_rtu',
  MODBUS_TCP = 'modbus_tcp',
  HTTP_API = 'http_api',
  DATABASE = 'database'
}

// 设备基本信息接口
export interface Device {
  id: string;
  name: string;
  type: DeviceType;
  model?: string;
  manufacturer?: string;
  status: DeviceStatus;
  connectionStatus: DeviceConnectionStatus;
  location: string;
  description?: string;
  lastSeen: Date | string;
  connectionType?: ConnectionType;
  battery?: number;
  signalStrength?: number;
  temperature?: number;
  ipAddress?: string;
  macAddress?: string;
  firmware?: string;
  metrics?: Record<string, number>;
  tags?: string[];
  createdAt: Date | string;
  updatedAt: Date | string;
  metadata?: Record<string, any>;
  lastMaintenance?: Date | string;
  nextMaintenance?: Date | string;
  capabilities?: string[];
  supportedProtocols?: string[];
  dataFormats?: string[];
  configuration?: Record<string, any>;
}

// 扩展设备接口 (兼容旧的 ExtendedDevice)
export interface ExtendedDevice extends Device {
  isActive?: boolean;
  lastActivity?: Date | string;
  permissions?: string[];
  settings?: Record<string, any>;
  parameters?: Record<string, any>;
}

// 设备数据点接口 (兼容旧的 DeviceDataPoint)
export interface DeviceDataPoint {
  id?: string;
  deviceId?: string;
  timestamp: string;
  value: number;
  unit?: string;
  sensorType?: string;
  quality?: number;
  temperature?: number;
  humidity?: number;
  pressure?: number;
  batteryLevel?: number;
  signalStrength?: number;
  metadata?: Record<string, any>;
}

// 设备数据接口
export interface DeviceData {
  deviceId: string;
  timestamp: string;
  value: number;
  unit: string;
  sensorType?: string;
}

// 设备配置接口
export interface DeviceConfig {
  id: string;
  name: string;
  enabled: boolean;
  settings: Record<string, any>;
  calibration?: {
    offset: number;
    scale: number;
  };
}

// 设备命令接口
export interface DeviceCommand {
  id: string;
  deviceId: string;
  command: string;
  parameters?: Record<string, any>;
  timestamp: string;
  status: 'pending' | 'executing' | 'completed' | 'failed';
  result?: any;
}

// 设备预订接口
export interface DeviceReservation {
  id: string;
  deviceId: string;
  userId: string;
  title: string;
  startTime: string;
  endTime: string;
  purpose: string;
  status: 'pending' | 'confirmed' | 'active' | 'completed' | 'cancelled';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// 设备会话接口
export interface DeviceSession {
  id: string;
  deviceId: string;
  userId: string;
  startTime: Date | string;
  endTime?: Date | string;
  status: 'active' | 'ended' | 'expired';
  data?: Record<string, any>;
}

// 设备监控数据接口
export interface DeviceMonitoringData {
  deviceId: string;
  timestamp: Date | string;
  metrics: Record<string, number>;
  status: DeviceStatus;
  alerts?: string[];
}

// 设备统计信息
export interface DeviceStats {
  totalDevices: number;
  onlineDevices: number;
  offlineDevices: number;
  errorDevices: number;
  uptimePercentage: number;
}

// API 参数接口
export interface GetDevicesParams {
  type?: DeviceType;
  status?: DeviceStatus;
  location?: string;
  limit?: number;
  offset?: number;
}

export interface GetDeviceDataParams {
  deviceId: string;
  startTime?: Date | string;
  endTime?: Date | string;
  limit?: number;
}

export interface SendDeviceCommandParams {
  deviceId: string;
  command: string;
  parameters?: Record<string, any>;
}

export interface CreateDeviceSessionParams {
  deviceId: string;
  userId: string;
  duration?: number;
  purpose?: string;
}

export interface CreateDeviceReservationParams {
  deviceId: string;
  userId: string;
  title: string;
  startTime: string;
  endTime: string;
  purpose: string;
  notes?: string;
}

export interface GetDeviceReservationsParams {
  deviceId?: string;
  userId?: string;
  status?: DeviceReservation['status'];
  startTime?: Date | string;
  endTime?: Date | string;
}

// USB配置接口
export interface USBConfiguration {
  port: string;
  baudRate: number;
  dataBits: number;
  stopBits: number;
  parity: 'none' | 'even' | 'odd';
  flowControl: 'none' | 'hardware' | 'software';
  dataFormat: 'json' | 'csv' | 'xml' | 'raw';
  parseRule?: string;
  separator?: string;
  encoding?: string;
}

// MQTT配置接口
export interface MQTTConfiguration {
  host: string;
  port: number;
  username?: string;
  password?: string;
  clientId?: string;
  topics: string[];
  qos: 0 | 1 | 2;
  cleanSession: boolean;
  keepAlive: number;
  dataFormat: 'json' | 'xml' | 'raw';
  parseRule?: string;
  ssl?: boolean;
  certificate?: string;
}

// Modbus配置接口
export interface ModbusConfiguration {
  // RTU配置
  serialPort?: string;
  baudRate?: number;
  dataBits?: number;
  stopBits?: number;
  parity?: 'none' | 'even' | 'odd';
  
  // TCP配置
  host?: string;
  port?: number;
  
  // 通用配置
  slaveId: number;
  function: number;
  startAddress: number;
  quantity: number;
  dataType: 'uint16' | 'int16' | 'uint32' | 'int32' | 'float32' | 'float64';
  byteOrder: 'big' | 'little';
  wordOrder: 'big' | 'little';
  scale?: number;
  offset?: number;
  unit?: string;
}

// HTTP API配置接口
export interface HTTPAPIConfiguration {
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  params?: Record<string, string>;
  body?: string;
  auth?: {
    type: 'none' | 'basic' | 'bearer' | 'apikey';
    username?: string;
    password?: string;
    token?: string;
    apiKey?: string;
    apiKeyHeader?: string;
  };
  responseFormat: 'json' | 'xml' | 'csv' | 'text';
  dataPath?: string;
  parseRule?: string;
  timeout?: number;
  retries?: number;
}

// 数据库配置接口
export interface DatabaseConfiguration {
  type: 'mysql' | 'postgresql' | 'mongodb' | 'influxdb' | 'sqlite';
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  table?: string;
  collection?: string;
  query: string;
  timeField?: string;
  valueField: string;
  ssl?: boolean;
  connectionTimeout?: number;
}

// 数据源配置联合类型
export type DataSourceConfiguration = 
  | USBConfiguration 
  | MQTTConfiguration 
  | ModbusConfiguration 
  | HTTPAPIConfiguration 
  | DatabaseConfiguration;

// 设备数据源接口
export interface DeviceDataSource {
  id: string;
  deviceId: string;
  name: string;
  type: DataSourceType;
  configuration: DataSourceConfiguration;
  enabled: boolean;
  pollingInterval?: number;
  lastSync?: Date | string;
  status: 'active' | 'inactive' | 'error';
  errorMessage?: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

// 数据转换规则接口
export interface DataTransformRule {
  id: string;
  dataSourceId: string;
  name: string;
  inputFormat: string;
  outputFormat: string;
  transformScript: string;
  validationRules?: string[];
  enabled: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
}

// 兼容性类型别名
export type devicesession = DeviceSession;
export type GetdevicesParams = GetDevicesParams;
export type CreatedevicesessionParams = CreateDeviceSessionParams;
