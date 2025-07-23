export enum DeviceType {
  MICROSCOPE = 'microscope',
  SPECTROMETER = 'spectrometer',
  SPECTROSCOPE = 'spectroscope',
  DATALOGGER = 'datalogger',
  OSCILLOSCOPE = 'oscilloscope',
  MULTIMETER = 'multimeter',
  POWERSUPPLY = 'powersupply',
  CAMERA = 'camera',
  SENSOR = 'sensor',
  ROBOT = 'robot',
  OTHER = 'other'
}

export enum DeviceConnectionStatus {
  ONLINE = 'online',
  OFFLINE = 'offline',
  ERROR = 'error',
  MAINTENANCE = 'maintenance',
  CONNECTING = 'connecting',
  CONNECTED = 'connected'
}

// 设备基本信息接口
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
  capabilities?: string[];
  supportedProtocols?: string[];
  dataFormats?: string[];
  configuration?: Record<string, any>;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

// 设备数据点接口
export interface DeviceDataPoint {
  id: string;
  deviceId: string;
  timestamp: string;
  sensorType: string;
  value: any;
  metadata?: Record<string, any>;
}

// 设备命令接口
export interface DeviceCommand {
  id: string;
  deviceId: string;
  command: string;
  parameters?: Record<string, any>;
  timestamp: string;
  executedAt?: string;
  status: 'sent' | 'executing' | 'executed' | 'failed';
  result?: Record<string, any>;
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
  settings?: Record<string, any>;
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
  createdAt: string;
  updatedAt: string;
  approvedBy?: string;
  approvedAt?: string;
  notes?: string;
}
